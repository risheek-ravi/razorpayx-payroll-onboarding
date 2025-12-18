import {Router} from 'express';
import {prisma} from '../lib/prisma';

const router = Router();

/**
 * GET /api/v1/payments
 * Get all payments, optionally filtered by businessId or employeeId
 */
router.get('/', async (req, res, next) => {
  try {
    const {businessId, employeeId, type, status} = req.query;

    const where: any = {};
    if (businessId) {
      where.businessId = businessId as string;
    }
    if (employeeId) {
      where.employeeId = employeeId as string;
    }
    if (type) {
      where.type = type as string;
    }
    if (status) {
      where.status = status as string;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: payments.map(p => ({
        id: p.id,
        type: p.type,
        amount: p.amount,
        paymentMode: p.paymentMode,
        phoneNumber: p.phoneNumber,
        upiId: p.upiId,
        narration: p.narration,
        status: p.status,
        date: p.date,
        razorpayPayoutId: p.razorpayPayoutId,
        employeeId: p.employeeId,
        businessId: p.businessId,
        createdAt: p.createdAt.getTime(),
        updatedAt: p.updatedAt.getTime(),
        employee: p.employee,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/payments/:id
 * Get a single payment by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const {id} = req.params;

    const payment = await prisma.payment.findUnique({
      where: {id},
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: payment.id,
        type: payment.type,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        phoneNumber: payment.phoneNumber,
        upiId: payment.upiId,
        narration: payment.narration,
        status: payment.status,
        date: payment.date,
        razorpayPayoutId: payment.razorpayPayoutId,
        employeeId: payment.employeeId,
        businessId: payment.businessId,
        createdAt: payment.createdAt.getTime(),
        updatedAt: payment.updatedAt.getTime(),
        employee: payment.employee,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/payments
 * Create a new payment
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      type,
      amount,
      paymentMode,
      phoneNumber,
      narration,
      status = 'completed',
      date,
      employeeId,
      businessId,
    } = req.body;

    // Validate required fields
    if (
      !type ||
      !amount ||
      !paymentMode ||
      !employeeId ||
      !businessId ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Missing required fields: type, amount, paymentMode, employeeId, businessId, date',
      });
    }

    // Validate payment type
    if (!['one-time', 'advance', 'salary'].includes(type)) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid payment type. Must be one of: one-time, advance, salary',
      });
    }

    // Validate payment mode
    if (!['Cash', 'UPI', 'Phone', 'Bank Transfer'].includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid payment mode. Must be one of: Cash, UPI, Phone, Bank Transfer',
      });
    }

    // Validate status
    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, completed, failed',
      });
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: {id: employeeId},
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: {id: businessId},
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
      });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        type,
        amount: parseFloat(amount.toString()),
        paymentMode,
        phoneNumber: phoneNumber || null,
        narration: narration || null,
        status,
        date,
        employeeId,
        businessId,
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: payment.id,
        type: payment.type,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        phoneNumber: payment.phoneNumber,
        narration: payment.narration,
        status: payment.status,
        date: payment.date,
        employeeId: payment.employeeId,
        businessId: payment.businessId,
        createdAt: payment.createdAt.getTime(),
        updatedAt: payment.updatedAt.getTime(),
        employee: payment.employee,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/payments/:id
 * Update a payment
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const {id} = req.params;
    const {amount, paymentMode, phoneNumber, narration, status, date} =
      req.body;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: {id},
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    // Build update data
    const updateData: any = {};
    if (amount !== undefined) {
      updateData.amount = parseFloat(amount.toString());
    }
    if (paymentMode !== undefined) {
      updateData.paymentMode = paymentMode;
    }
    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber || null;
    }
    if (narration !== undefined) {
      updateData.narration = narration || null;
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (date !== undefined) {
      updateData.date = date;
    }

    // Update payment
    const payment = await prisma.payment.update({
      where: {id},
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        id: payment.id,
        type: payment.type,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        phoneNumber: payment.phoneNumber,
        narration: payment.narration,
        status: payment.status,
        date: payment.date,
        employeeId: payment.employeeId,
        businessId: payment.businessId,
        createdAt: payment.createdAt.getTime(),
        updatedAt: payment.updatedAt.getTime(),
        employee: payment.employee,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/payments/:id
 * Delete a payment
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const {id} = req.params;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: {id},
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    // Delete payment
    await prisma.payment.delete({
      where: {id},
    });

    res.json({
      success: true,
      data: {message: 'Payment deleted successfully'},
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/payments/employee/:employeeId/summary
 * Get payment summary for an employee
 */
router.get('/employee/:employeeId/summary', async (req, res, next) => {
  try {
    const {employeeId} = req.params;

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: {id: employeeId},
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    // Get payment summary
    const payments = await prisma.payment.findMany({
      where: {employeeId},
    });

    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      byType: {
        'one-time': {
          count: payments.filter(p => p.type === 'one-time').length,
          amount: payments
            .filter(p => p.type === 'one-time')
            .reduce((sum, p) => sum + p.amount, 0),
        },
        advance: {
          count: payments.filter(p => p.type === 'advance').length,
          amount: payments
            .filter(p => p.type === 'advance')
            .reduce((sum, p) => sum + p.amount, 0),
        },
        salary: {
          count: payments.filter(p => p.type === 'salary').length,
          amount: payments
            .filter(p => p.type === 'salary')
            .reduce((sum, p) => sum + p.amount, 0),
        },
      },
      byStatus: {
        pending: payments.filter(p => p.status === 'pending').length,
        completed: payments.filter(p => p.status === 'completed').length,
        failed: payments.filter(p => p.status === 'failed').length,
      },
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

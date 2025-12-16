import {Router, Request, Response, NextFunction} from 'express';
import {prisma} from '../lib/prisma.js';
import {AppError} from '../middleware/errorHandler.js';
import {z} from 'zod';

export const employeeRouter = Router();

// Validation schema
const createEmployeeSchema = z.object({
  businessId: z.string().uuid(),
  type: z.enum(['full_time', 'contract']),
  fullName: z.string().min(1),
  companyId: z.string().min(1),
  phoneNumber: z.string().min(1),
  dob: z.string(),
  gender: z.string().min(1),
  salaryCycleDate: z.number().min(1).max(31),
  salaryAccess: z.string(),
  wageType: z.enum(['Monthly', 'Daily', 'Per Hour Basis']).optional(),
  salaryAmount: z.string().optional(),
  weeklyOffs: z.array(z.string()).optional(),
});

// POST /api/v1/employees - Create a new employee
employeeRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createEmployeeSchema.parse(req.body);

      // Check if business exists
      const business = await prisma.business.findUnique({
        where: {id: data.businessId},
      });

      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      const employee = await prisma.employee.create({
        data: {
          ...data,
          weeklyOffs: JSON.stringify(data.weeklyOffs || []),
        },
      });

      // Transform response
      const transformed = {
        ...employee,
        weeklyOffs: JSON.parse(employee.weeklyOffs),
        createdAt: employee.createdAt.getTime(),
      };

      res.status(201).json({
        success: true,
        data: transformed,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  },
);

// GET /api/v1/employees - Get all employees (optionally filter by businessId)
employeeRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {businessId} = req.query;

      const employees = await prisma.employee.findMany({
        where: businessId ? {businessId: String(businessId)} : undefined,
        orderBy: {createdAt: 'desc'},
      });

      // Transform response
      const transformed = employees.map(emp => ({
        ...emp,
        weeklyOffs: JSON.parse(emp.weeklyOffs),
        createdAt: emp.createdAt.getTime(),
      }));

      res.json({
        success: true,
        data: transformed,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/v1/employees/:id - Get employee by ID
employeeRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employee = await prisma.employee.findUnique({
        where: {id: req.params.id},
      });

      if (!employee) {
        throw new AppError(404, 'Employee not found');
      }

      const transformed = {
        ...employee,
        weeklyOffs: JSON.parse(employee.weeklyOffs),
        createdAt: employee.createdAt.getTime(),
      };

      res.json({
        success: true,
        data: transformed,
      });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/v1/employees/:id - Delete employee
employeeRouter.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employee = await prisma.employee.findUnique({
        where: {id: req.params.id},
      });

      if (!employee) {
        throw new AppError(404, 'Employee not found');
      }

      await prisma.employee.delete({
        where: {id: req.params.id},
      });

      res.json({
        success: true,
        message: 'Employee deleted',
      });
    } catch (error) {
      next(error);
    }
  },
);

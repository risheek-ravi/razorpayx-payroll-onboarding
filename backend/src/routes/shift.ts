import {Router, Request, Response, NextFunction} from 'express';
import {prisma} from '../lib/prisma.js';
import {AppError} from '../middleware/errorHandler.js';
import {z} from 'zod';

export const shiftRouter = Router();

// Validation schemas
const createShiftSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['fixed', 'open', 'rotational']),
  startTime: z.string().min(1), // e.g., "09:00"
  endTime: z.string().min(1), // e.g., "18:00"
  breakMinutes: z.number().min(0).default(0),
});

const updateShiftSchema = createShiftSchema.partial();

const assignEmployeesSchema = z.object({
  employeeIds: z.array(z.string().uuid()),
});

// GET /api/v1/shifts - Get all shifts with staff count
shiftRouter.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const shifts = await prisma.shift.findMany({
        orderBy: {createdAt: 'desc'},
        include: {
          _count: {
            select: {employees: true},
          },
        },
      });

      // Transform response to include staffCount
      const transformed = shifts.map(shift => ({
        id: shift.id,
        name: shift.name,
        type: shift.type,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakMinutes: shift.breakMinutes,
        createdAt: shift.createdAt.getTime(),
        staffCount: shift._count.employees,
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

// GET /api/v1/shifts/:id - Get shift by ID
shiftRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shift = await prisma.shift.findUnique({
        where: {id: req.params.id},
        include: {
          _count: {
            select: {employees: true},
          },
          employees: {
            select: {
              id: true,
              fullName: true,
              wageType: true,
            },
          },
        },
      });

      if (!shift) {
        throw new AppError(404, 'Shift not found');
      }

      const transformed = {
        id: shift.id,
        name: shift.name,
        type: shift.type,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakMinutes: shift.breakMinutes,
        createdAt: shift.createdAt.getTime(),
        staffCount: shift._count.employees,
        employees: shift.employees,
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

// POST /api/v1/shifts - Create a new shift
shiftRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createShiftSchema.parse(req.body);

      const shift = await prisma.shift.create({
        data,
      });

      const transformed = {
        ...shift,
        createdAt: shift.createdAt.getTime(),
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

// PATCH /api/v1/shifts/:id - Update a shift
shiftRouter.patch(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateShiftSchema.parse(req.body);

      const existing = await prisma.shift.findUnique({
        where: {id: req.params.id},
      });

      if (!existing) {
        throw new AppError(404, 'Shift not found');
      }

      const shift = await prisma.shift.update({
        where: {id: req.params.id},
        data,
      });

      const transformed = {
        ...shift,
        createdAt: shift.createdAt.getTime(),
      };

      res.json({
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

// DELETE /api/v1/shifts/:id - Delete a shift
shiftRouter.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await prisma.shift.findUnique({
        where: {id: req.params.id},
      });

      if (!existing) {
        throw new AppError(404, 'Shift not found');
      }

      await prisma.shift.delete({
        where: {id: req.params.id},
      });

      res.json({
        success: true,
        message: 'Shift deleted',
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/v1/shifts/:id/assign - Assign employees to a shift
shiftRouter.post(
  '/:id/assign',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {employeeIds} = assignEmployeesSchema.parse(req.body);
      const shiftId = req.params.id;

      const shift = await prisma.shift.findUnique({
        where: {id: shiftId},
      });

      if (!shift) {
        throw new AppError(404, 'Shift not found');
      }

      // Update all specified employees to have this shift
      await prisma.employee.updateMany({
        where: {id: {in: employeeIds}},
        data: {shiftId},
      });

      res.json({
        success: true,
        message: `Assigned ${employeeIds.length} employees to shift`,
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

// PATCH /api/v1/shifts/:id/assign - Update shift assignments (replaces all)
shiftRouter.patch(
  '/:id/assign',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {employeeIds} = assignEmployeesSchema.parse(req.body);
      const shiftId = req.params.id;

      const shift = await prisma.shift.findUnique({
        where: {id: shiftId},
      });

      if (!shift) {
        throw new AppError(404, 'Shift not found');
      }

      // First, remove this shift from all employees who currently have it
      await prisma.employee.updateMany({
        where: {shiftId},
        data: {shiftId: null},
      });

      // Then, assign this shift to the new set of employees
      if (employeeIds.length > 0) {
        await prisma.employee.updateMany({
          where: {id: {in: employeeIds}},
          data: {shiftId},
        });
      }

      res.json({
        success: true,
        message: `Updated shift assignment to ${employeeIds.length} employees`,
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

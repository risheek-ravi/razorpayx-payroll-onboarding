import {Router, Request, Response, NextFunction} from 'express';
import {prisma} from '../lib/prisma.js';
import {AppError} from '../middleware/errorHandler.js';
import {z} from 'zod';

export const businessRouter = Router();

// Validation schemas
const createBusinessSchema = z.object({
  name: z.string().min(1),
  businessName: z.string().min(1),
  businessEmail: z.string().email(),
});

const salaryConfigSchema = z.object({
  calculationMethod: z.enum([
    'calendar_month',
    'fixed_30_days',
    'exclude_weekly_offs',
  ]),
  shiftHours: z.object({
    hours: z.number().min(0).max(24),
    minutes: z.number().min(0).max(59),
  }),
});

// POST /api/v1/businesses - Create a new business
businessRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createBusinessSchema.parse(req.body);

      const business = await prisma.business.create({
        data,
      });

      res.status(201).json({
        success: true,
        data: business,
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

// GET /api/v1/businesses/:id - Get business by ID
businessRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = await prisma.business.findUnique({
        where: {id: req.params.id},
        include: {salaryConfig: true, employees: true},
      });

      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      // Transform salaryConfig to match frontend format
      const transformed = {
        ...business,
        salaryConfig: business.salaryConfig
          ? {
              calculationMethod: business.salaryConfig.calculationMethod,
              shiftHours: {
                hours: business.salaryConfig.shiftHours,
                minutes: business.salaryConfig.shiftMinutes,
              },
            }
          : undefined,
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

// GET /api/v1/businesses/latest - Get the most recent business
businessRouter.get(
  '/latest/one',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const business = await prisma.business.findFirst({
        orderBy: {createdAt: 'desc'},
        include: {salaryConfig: true},
      });

      if (!business) {
        return res.json({
          success: true,
          data: null,
        });
      }

      const transformed = {
        ...business,
        salaryConfig: business.salaryConfig
          ? {
              calculationMethod: business.salaryConfig.calculationMethod,
              shiftHours: {
                hours: business.salaryConfig.shiftHours,
                minutes: business.salaryConfig.shiftMinutes,
              },
            }
          : undefined,
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

// PATCH /api/v1/businesses/:id/salary-config - Update salary config
businessRouter.patch(
  '/:id/salary-config',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = salaryConfigSchema.parse(req.body);

      // Check if business exists
      const business = await prisma.business.findUnique({
        where: {id: req.params.id},
      });

      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      // Upsert salary config
      await prisma.salaryConfig.upsert({
        where: {businessId: req.params.id},
        create: {
          businessId: req.params.id,
          calculationMethod: config.calculationMethod,
          shiftHours: config.shiftHours.hours,
          shiftMinutes: config.shiftHours.minutes,
        },
        update: {
          calculationMethod: config.calculationMethod,
          shiftHours: config.shiftHours.hours,
          shiftMinutes: config.shiftHours.minutes,
        },
      });

      res.json({
        success: true,
        message: 'Salary config updated',
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

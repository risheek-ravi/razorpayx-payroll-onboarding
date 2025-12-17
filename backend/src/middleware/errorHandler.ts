import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[Error]', err);
  console.error('[Error Stack]', err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // In development, send detailed error info
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(isDevelopment && {
      details: err.message,
      stack: err.stack,
    }),
  });
};




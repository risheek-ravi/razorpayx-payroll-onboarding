import express from 'express';
import cors from 'cors';
import {businessRouter} from './routes/business.js';
import {employeeRouter} from './routes/employee.js';
import {shiftRouter} from './routes/shift.js';
import {errorHandler} from './middleware/errorHandler.js';
import {prisma} from './lib/prisma.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({status: 'ok', timestamp: new Date().toISOString()});
});

// Database health check
app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DB Health Check Error]', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Routes
app.use('/api/v1/businesses', businessRouter);
app.use('/api/v1/employees', employeeRouter);
app.use('/api/v1/shifts', shiftRouter);

// Error handling
app.use(errorHandler);

// Start server (both development and production)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/v1`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📱 Android emulator: http://10.0.2.2:${PORT}/api/v1`);
  }
});

// Export for Vercel serverless
export default app;

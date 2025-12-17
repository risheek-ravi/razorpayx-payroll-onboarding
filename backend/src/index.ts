import express from 'express';
import cors from 'cors';
import {businessRouter} from './routes/business.js';
import {employeeRouter} from './routes/employee.js';
import {shiftRouter} from './routes/shift.js';
import {errorHandler} from './middleware/errorHandler.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({status: 'ok', timestamp: new Date().toISOString()});
});

// Routes
app.use('/api/v1/businesses', businessRouter);
app.use('/api/v1/employees', employeeRouter);
app.use('/api/v1/shifts', shiftRouter);

// Error handling
app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api/v1`);
    console.log(`📱 Android emulator: http://10.0.2.2:${PORT}/api/v1`);
  });
}

// Export for Vercel serverless
export default app;

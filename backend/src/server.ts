import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { createServer } from 'http';

import { config } from './config/config';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import requestRoutes from './routes/requests';
import offerRoutes from './routes/offers';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';
import pricingRoutes from './routes/pricing';
import balanceRoutes from './routes/balances';
import { AppError } from './utils/errorHandler';
import { initializeSocketService } from './services/socketService';
import { pricingService } from './services/pricingService';

dotenv.config();

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Mussikon API is running',
    version: config.app.version,
    timestamp: new Date().toISOString()
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Mussikon API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/balances', balanceRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const socketService = initializeSocketService(server);

// Start server
const PORT = config.port;
server.listen(PORT, async () => {
  console.log(`🚀 Mussikon API server running on port ${PORT}`);
  console.log(`📱 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔌 WebSocket server initialized`);
  
  // Initialize default pricing configuration
  try {
    const pricingInitialized = await pricingService.initializeDefaultPricing();
    if (pricingInitialized) {
      console.log(`💰 Default pricing configuration initialized`);
    } else {
      console.log(`💰 Pricing configuration already exists`);
    }
  } catch (error) {
    console.error(`❌ Error initializing pricing configuration:`, error);
  }
});

export default app;
export { socketService };

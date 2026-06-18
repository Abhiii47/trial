import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'SmartPrice API is running...' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import { isConnected } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Common middle-tier parsers and controllers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core MVC API Routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/billing', invoiceRoutes); // Integrates billing checkout, bills, and report metrics

// Simple base status check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    message: 'Wholesale Inventory and Billing API is actively running successfully!',
    dbConnected: isConnected(),
    timestamp: new Date().toISOString()
  });
});


// Middleware for Route exceptions
app.use(notFound);
app.use(errorHandler);

export default app;

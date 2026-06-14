import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import app from './backend/app.js';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000; // Render/Vercel injects PORT at runtime

// Handle static build folders
const distPath = path.join(__dirname, './dist');

// Middleware to serve static files from Vite build output folder
app.use(express.static(distPath));

// For all non-API routes, fallback to serving index.html (supports React Router SPAs)
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next(); // Pass to API and error handlers
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Launch listening engine
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`Wholesale Inventory System SERVER IS ONLINE!`);
  console.log(`Live deployment running on http://0.0.0.0:${PORT}`);
  console.log(`====================================================`);
});

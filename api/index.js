// Vercel serverless entry point — connects DB and exports the Express app as a handler
import dotenv from 'dotenv';
dotenv.config();

// Initialize DB connection (runs once per cold start)
await import('../backend/config/db.js');

import app from '../backend/app.js';

export default app;

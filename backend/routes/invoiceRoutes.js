import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  getReportsData
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all billing and report endpoints

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/statistics', getReportsData); // Placed before ID routing to prevent capture conflicts
router.get('/:id', getInvoiceById);

export default router;

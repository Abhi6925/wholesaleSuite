import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockHistory
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all product/inventory routes

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/history', getStockHistory); // Placed before ID routing to prevent capture conflicts
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/adjust', adjustStock);

export default router;

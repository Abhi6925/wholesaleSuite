import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = path.join(__dirname, '../../database_files/stock_history.json');

// Helper to keep audit log of stock movements
const logStockAdjustment = (userId, productId, name, code, beforeQty, change, afterQty, actionType, description = '') => {
  try {
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let logs = [];
    if (fs.existsSync(HISTORY_FILE)) {
      const content = fs.readFileSync(HISTORY_FILE, 'utf8');
      logs = JSON.parse(content || '[]');
    }
    const newLog = {
      _id: Math.random().toString(36).substring(2, 11),
      userId: userId ? userId.toString() : null,
      productId,
      name,
      code,
      beforeQty: Number(beforeQty),
      change: Number(change),
      afterQty: Number(afterQty),
      actionType, // 'RESTOCK_ADD', 'STOCK_REDUCTION', 'SALE_BILLING', 'ADJUSTMENT_SET'
      description: description || `Stock updated via ${actionType}`,
      date: new Date().toISOString()
    };
    logs.unshift(newLog);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Failed to log stock movement:', error.message);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    return res.json(products);
  } catch (error) {
    console.error('getProducts Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving products' });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  } catch (error) {
    console.error('getProductById Error:', error.message);
    return res.status(500).json({ message: 'Error retrieving product' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { name, code, category, purchasePrice, sellingPrice, quantity, supplierId, description } = req.body;

    if (!name || !code || !category || purchasePrice === undefined || sellingPrice === undefined || quantity === undefined || !supplierId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Verify supplier belongs to user
    const supplier = await Supplier.findOne({ _id: supplierId, userId: req.user._id });
    if (!supplier) {
      return res.status(400).json({ message: 'Referenced supplier not found' });
    }

    // Check for duplicate product code within the user's products
    const duplicate = await Product.findOne({ code, userId: req.user._id });
    if (duplicate) {
      return res.status(400).json({ message: 'Product with this code already exists' });
    }

    const product = await Product.create({
      userId: req.user._id,
      name,
      code,
      category,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      quantity: Number(quantity),
      supplierId,
      description: description || ''
    });

    // Log creation adjustment
    logStockAdjustment(req.user._id, product._id, product.name, product.code, 0, product.quantity, product.quantity, 'RESTOCK_ADD', 'Initial product batch creation');

    return res.status(201).json(product);
  } catch (error) {
    console.error('createProduct Error:', error.message);
    return res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Update a product details
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const { name, code, category, purchasePrice, sellingPrice, quantity, supplierId, description } = req.body;

    const product = await Product.findOne({ _id: req.params.id, userId: req.user._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify supplier belongs to user if provided
    if (supplierId && supplierId !== product.supplierId) {
      const supplier = await Supplier.findOne({ _id: supplierId, userId: req.user._id });
      if (!supplier) {
        return res.status(400).json({ message: 'Referenced supplier not found' });
      }
    }

    // Check code uniqueness within the user's products
    if (code && code !== product.code) {
      const codeExists = await Product.findOne({ code, userId: req.user._id });
      if (codeExists) {
        return res.status(400).json({ message: 'Product code is already in use by another product' });
      }
    }

    const oldQty = product.quantity;
    const newQty = quantity !== undefined ? Number(quantity) : oldQty;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
      name: name || product.name,
      code: code || product.code,
      category: category || product.category,
      purchasePrice: purchasePrice !== undefined ? Number(purchasePrice) : product.purchasePrice,
      sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : product.sellingPrice,
      quantity: newQty,
      supplierId: supplierId || product.supplierId,
      description: description !== undefined ? description : product.description
    });

    // Log difference in quantity if manual override
    if (oldQty !== newQty) {
      const diff = newQty - oldQty;
      const type = diff > 0 ? 'RESTOCK_ADD' : 'STOCK_REDUCTION';
      logStockAdjustment(req.user._id, product._id, name || product.name, code || product.code, oldQty, diff, newQty, type, 'Manual stock adjustment on product update form');
    }

    return res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('updateProduct Error:', error.message);
    return res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    logStockAdjustment(req.user._id, product._id, product.name, product.code, product.quantity, -product.quantity, 0, 'STOCK_REDUCTION', 'Product deleted from system databases');

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('deleteProduct Error:', error.message);
    return res.status(500).json({ message: 'Server error deleting product' });
  }
};

// @desc    Adjust product stock level directly
// @route   POST /api/products/:id/adjust
// @access  Private
export const adjustStock = async (req, res) => {
  try {
    const { action, quantity: inputVal, description } = req.body;
    const product = await Product.findOne({ _id: req.params.id, userId: req.user._id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!action || inputVal === undefined || Number(inputVal) <= 0) {
      return res.status(400).json({ message: 'Please provide valid action (increase/reduce) and quantity' });
    }

    const value = Number(inputVal);
    const beforeQty = Number(product.quantity);
    let afterQty = beforeQty;
    let change = 0;

    if (action === 'increase') {
      change = value;
      afterQty = beforeQty + value;
    } else if (action === 'reduce') {
      if (beforeQty < value) {
        return res.status(400).json({ message: `Insufficient stock. Current stock is ${beforeQty}` });
      }
      change = -value;
      afterQty = beforeQty - value;
    } else {
      return res.status(400).json({ message: 'Action must be increase or reduce' });
    }

    product.quantity = afterQty;
    await product.save();

    logStockAdjustment(
      req.user._id,
      product._id,
      product.name,
      product.code,
      beforeQty,
      change,
      afterQty,
      action === 'increase' ? 'RESTOCK_ADD' : 'STOCK_REDUCTION',
      description || `Direct manually logged stock ${action} adjustment`
    );

    return res.json({ message: 'Stock level adjusted successfully', product });
  } catch (error) {
    console.error('adjustStock Error:', error.message);
    return res.status(500).json({ message: 'Server error adjusting stock level' });
  }
};

// @desc    Get stock movement log audit history
// @route   GET /api/inventory/history
// @access  Private
export const getStockHistory = async (req, res) => {
  try {
    let logs = [];
    if (fs.existsSync(HISTORY_FILE)) {
      const content = fs.readFileSync(HISTORY_FILE, 'utf8');
      logs = JSON.parse(content || '[]');
    }
    // Filter history logs by the current user's ID
    const userLogs = logs.filter(log => log.userId === req.user._id.toString());
    return res.json(userLogs);
  } catch (error) {
    console.error('getStockHistory Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching stock adjustment logs' });
  }
};

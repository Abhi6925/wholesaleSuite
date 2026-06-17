import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  supplierId: {
    type: String, // String ID of the supplier
    required: true,
  },
  description: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

// Compound index to guarantee uniqueness of product code per user
productSchema.index({ code: 1, userId: 1 }, { unique: true });

const Product = getModel('Product', productSchema);

export default Product;

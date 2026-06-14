import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
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

const Product = getModel('Product', productSchema);

export default Product;

import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const invoiceProductSchema = new mongoose.Schema({
  productId: {
    type: String,
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
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  products: {
    type: [invoiceProductSchema],
    default: [],
  },
  subtotal: {
    type: Number,
    required: true,
  },
  gst: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

const Invoice = getModel('Invoice', invoiceSchema);

export default Invoice;

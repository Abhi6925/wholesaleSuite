import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    default: '',
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
    default: '',
  }
}, {
  timestamps: true
});

const Supplier = getModel('Supplier', supplierSchema);

export default Supplier;

import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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

const Customer = getModel('Customer', customerSchema);

export default Customer;

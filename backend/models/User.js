import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

const User = getModel('User', userSchema);

export default User;

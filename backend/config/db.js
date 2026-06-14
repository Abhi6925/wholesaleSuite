import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../database_files');

// Ensure the local database folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const mongoURI = process.env.MONGODB_URI || '';
let isUsingMongoDB = false;

// Connect to MongoDB if a URI is provided in the .env file
if (mongoURI) {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully!');
    isUsingMongoDB = true;
  } catch (error) {
    console.error('MongoDB connection failed. Falling back to local JSON database.', error.message);
  }
} else {
  console.log('No MONGODB_URI found. Using simple local JSON files for storage.');
}

/**
 * A simple file-based database helper that emulates basic Mongoose operations.
 * This allows the project to run on localhost without requiring MongoDB installed.
 */
class LocalDatabaseHelper {
  constructor(collectionName) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  // Read all records from the JSON file
  readData() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (err) {
      return [];
    }
  }

  // Write records back to the JSON file
  writeData(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  // Find records matching a query
  async find(query = {}) {
    const items = this.readData();
    return items.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  // Find a single record
  async findOne(query = {}) {
    const items = this.readData();
    return items.find(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  }

  // Find record by its ID
  async findById(id) {
    const items = this.readData();
    return items.find(item => item._id === id) || null;
  }

  // Add a new record
  async create(data) {
    const items = this.readData();
    const newItem = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    items.unshift(newItem);
    this.writeData(items);
    return newItem;
  }

  // Update an existing record
  async findByIdAndUpdate(id, updateData) {
    const items = this.readData();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    let updatedItem = { ...items[index] };

    // Support Mongoose $inc operator for inventory stock count
    if (updateData.$inc) {
      for (const key in updateData.$inc) {
        updatedItem[key] = (Number(updatedItem[key]) || 0) + Number(updateData.$inc[key]);
      }
      delete updateData.$inc;
    }

    updatedItem = {
      ...updatedItem,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedItem;
    this.writeData(items);
    return updatedItem;
  }

  // Delete a record
  async findByIdAndDelete(id) {
    const items = this.readData();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deletedItem = items[index];
    items.splice(index, 1);
    this.writeData(items);
    return deletedItem;
  }

  // Count documents matching query
  async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }
}

/**
 * Returns either a Mongoose model or a simple JSON model helper.
 */
export function getModel(modelName, mongooseSchema) {
  if (isUsingMongoDB) {
    return mongoose.models[modelName] || mongoose.model(modelName, mongooseSchema);
  } else {
    const localStore = new LocalDatabaseHelper(modelName);

    // Mock Mongoose Document instance for save() support
    class ModelInstance {
      constructor(data = {}) {
        Object.assign(this, data);
      }

      async save() {
        if (this._id) {
          const updated = await localStore.findByIdAndUpdate(this._id, { ...this });
          Object.assign(this, updated);
          return this;
        } else {
          const created = await localStore.create({ ...this });
          Object.assign(this, created);
          return this;
        }
      }
    }

    // Map helper methods to look like standard Mongoose static methods and return ModelInstance wrappers
    ModelInstance.find = async (q) => {
      const items = await localStore.find(q);
      return items.map(item => new ModelInstance(item));
    };
    ModelInstance.findOne = async (q) => {
      const item = await localStore.findOne(q);
      return item ? new ModelInstance(item) : null;
    };
    ModelInstance.findById = async (id) => {
      const item = await localStore.findById(id);
      return item ? new ModelInstance(item) : null;
    };
    ModelInstance.findByIdAndUpdate = async (id, data) => {
      const item = await localStore.findByIdAndUpdate(id, data);
      return item ? new ModelInstance(item) : null;
    };
    ModelInstance.findByIdAndDelete = async (id) => {
      const item = await localStore.findByIdAndDelete(id);
      return item ? new ModelInstance(item) : null;
    };
    ModelInstance.countDocuments = (q) => localStore.countDocuments(q);
    ModelInstance.create = async (data) => {
      const item = await localStore.create(data);
      return new ModelInstance(item);
    };

    return ModelInstance;
  }
}

export function isConnected() {
  return isUsingMongoDB;
}

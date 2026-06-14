import Supplier from '../models/Supplier.js';

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    return res.json(suppliers);
  } catch (error) {
    console.error('getSuppliers Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving suppliers' });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    return res.json(supplier);
  } catch (error) {
    console.error('getSupplierById Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving supplier details' });
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private
export const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Supplier name and mobile phone number are required' });
    }

    const supplier = await Supplier.create({
      name,
      email: email || '',
      phone,
      address: address || '',
    });

    return res.status(201).json(supplier);
  } catch (error) {
    console.error('createSupplier Error:', error.message);
    return res.status(500).json({ message: 'Server error creating supplier profile' });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
export const updateSupplier = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, {
      name: name || supplier.name,
      email: email !== undefined ? email : supplier.email,
      phone: phone || supplier.phone,
      address: address !== undefined ? address : supplier.address,
    });

    return res.json({ message: 'Supplier info updated successfully', supplier: updatedSupplier });
  } catch (error) {
    console.error('updateSupplier Error:', error.message);
    return res.status(500).json({ message: 'Server error updating supplier' });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile was not found' });
    }

    await Supplier.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('deleteSupplier Error:', error.message);
    return res.status(500).json({ message: 'Server error deleting supplier' });
  }
};

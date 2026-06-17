import Customer from '../models/Customer.js';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user._id });
    return res.json(customers);
  } catch (error) {
    console.error('getCustomers Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving customers list' });
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    return res.json(customer);
  } catch (error) {
    console.error('getCustomerById Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving customer details' });
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Buyer name and phone number are required' });
    }

    const customer = await Customer.create({
      userId: req.user._id,
      name,
      email: email || '',
      phone,
      address: address || '',
    });

    return res.status(201).json(customer);
  } catch (error) {
    console.error('createCustomer Error:', error.message);
    return res.status(500).json({ message: 'Server error creating customer' });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, {
      name: name || customer.name,
      email: email !== undefined ? email : customer.email,
      phone: phone || customer.phone,
      address: address !== undefined ? address : customer.address,
    });

    return res.json({ message: 'Customer details updated', customer: updatedCustomer });
  } catch (error) {
    console.error('updateCustomer Error:', error.message);
    return res.status(500).json({ message: 'Server error updating customer details' });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await Customer.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Customer profile deleted' });
  } catch (error) {
    console.error('deleteCustomer Error:', error.message);
    return res.status(500).json({ message: 'Server error deleting customer profile' });
  }
};

import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Supplier from '../models/Supplier.js';
import { calculateGST } from '../utils/gstCalculator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = path.join(__dirname, '../../database_files/stock_history.json');

// Log inventory changes on checkout sales
const logSaleStockMovement = (productId, name, code, beforeQty, change, afterQty) => {
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
      productId,
      name,
      code,
      beforeQty: Number(beforeQty),
      change: Number(change), // negative change for sales
      afterQty: Number(afterQty),
      actionType: 'SALE_BILLING',
      description: `Stock deducted via client billing checkout`,
      date: new Date().toISOString()
    };
    logs.unshift(newLog);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Failed to log stock movement for billing:', error.message);
  }
};

// @desc    Create a new bill / invoice
// @route   POST /api/invoices
// @access  Private
export const createInvoice = async (req, res) => {
  try {
    const { customerId, products, gstRate = 18 } = req.body;

    if (!customerId || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Buyer customer and itemized product list are required' });
    }

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Target customer was not found' });
    }

    // Calculate subtotal, verify inventory stock levels, and prepare sale items
    let subtotal = 0;
    const finalInvoiceProducts = [];

    // We do sequential check so we can fail early if any item has insufficient stock
    for (const item of products) {
      const { productId, quantity } = item;
      if (!productId || !quantity || Number(quantity) <= 0) {
        return res.status(400).json({ message: 'Each invoice item must have a valid productId and positive quantity' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found for ID: ${productId}` });
      }

      const qtyNeeded = Number(quantity);
      const currentStock = Number(product.quantity);

      if (currentStock < qtyNeeded) {
        return res.status(400).json({
          message: `Insufficient stock for '${product.name}'. Requested: ${qtyNeeded}, Available: ${currentStock}`
        });
      }

      const itemTotal = Number((product.sellingPrice * qtyNeeded).toFixed(2));
      subtotal += itemTotal;

      finalInvoiceProducts.push({
        productId: product._id,
        name: product.name,
        code: product.code,
        price: product.sellingPrice,
        quantity: qtyNeeded,
        total: itemTotal
      });
    }

    // Apply GST calculation
    const { gstAmount, totalWithGst } = calculateGST(subtotal, Number(gstRate));

    // Generate unique automatic sequential/random invoice number
    const timestampStr = Date.now().toString().slice(-6);
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    const invoiceNumber = `INV-${timestampStr}-${randStr}`;

    // Reduce inventory records & write stock logs
    for (const item of finalInvoiceProducts) {
      const product = await Product.findById(item.productId);
      const beforeQty = Number(product.quantity);
      const afterQty = beforeQty - item.quantity;

      product.quantity = afterQty;
      await product.save();

      // Write log
      logSaleStockMovement(product._id, product.name, product.code, beforeQty, -item.quantity, afterQty);
    }

    // Save final invoice record
    const invoice = await Invoice.create({
      invoiceNumber,
      customerId,
      products: finalInvoiceProducts,
      subtotal: Number(subtotal.toFixed(2)),
      gst: gstAmount,
      totalAmount: totalWithGst,
      date: new Date().toISOString()
    });

    return res.status(201).json({
      message: 'Invoice generated successfully',
      invoice
    });
  } catch (error) {
    console.error('createInvoice Error:', error.message);
    return res.status(500).json({ message: 'Server error processing transaction checkout' });
  }
};

// @desc    Get all invoices (or filter/search)
// @route   GET /api/invoices
// @access  Private
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({});
    return res.json(invoices);
  } catch (error) {
    console.error('getInvoices Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving invoices' });
  }
};

// @desc    Get details for one invoice
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice print sheet was not found' });
    }
    return res.json(invoice);
  } catch (error) {
    console.error('getInvoiceById Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching invoice' });
  }
};

// @desc    Calculate and compile dynamic business system reports
// @route   GET /api/reports/statistics
// @access  Private
export const getReportsData = async (req, res) => {
  try {
    const products = await Product.find({}) || [];
    const invoices = await Invoice.find({}) || [];
    const customers = await Customer.find({}) || [];
    const suppliers = await Supplier.find({}) || [];

    // Report 1: Basic counters
    const totalProductsCount = products.length;
    const totalCustomersCount = customers.length;
    const totalSuppliersCount = suppliers.length;

    // Report 2: Sales Summary
    let totalSalesRevenue = 0;
    let totalProductsSoldQty = 0;

    invoices.forEach(inv => {
      totalSalesRevenue += Number(inv.totalAmount) || 0;
      if (inv.products && Array.isArray(inv.products)) {
        inv.products.forEach(p => {
          totalProductsSoldQty += Number(p.quantity) || 0;
        });
      }
    });

    // Report 3: Stock Assets Valuation
    let totalStockValuePurchaseValAmt = 0;
    let totalStockValueSellingValAmt = 0;
    let totalStockQuantityCountAggregate = 0;
    const lowStockThresholdLimit = 15; // customizable indicator limit

    const lowStockListing = products.filter(p => {
      const qty = Number(p.quantity) || 0;
      totalStockQuantityCountAggregate += qty;
      totalStockValuePurchaseValAmt += (qty * (Number(p.purchasePrice) || 0));
      totalStockValueSellingValAmt += (qty * (Number(p.sellingPrice) || 0));
      return qty < lowStockThresholdLimit;
    });

    // Report 4: Monthly Sales Summary Grouping (for standard graphs/table presentations)
    // Map with default placeholders to fill the chart even with low volume
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const monthlyAggregation = {};
    monthNamesShort.forEach(m => {
      monthlyAggregation[m] = { month: m, total: 0, bills: 0 };
    });

    invoices.forEach(inv => {
      const billDate = new Date(inv.date);
      if (!isNaN(billDate.getTime())) {
        const mName = monthNamesShort[billDate.getMonth()];
        if (monthlyAggregation[mName]) {
          monthlyAggregation[mName].total += Number(inv.totalAmount) || 0;
          monthlyAggregation[mName].bills += 1;
        }
      }
    });

    const monthlySalesSummaryList = monthNamesShort.map(m => ({
      month: monthlyAggregation[m].month,
      revenue: Number(monthlyAggregation[m].total.toFixed(2)),
      invoiceCount: monthlyAggregation[m].bills
    }));

    return res.json({
      counters: {
        products: totalProductsCount,
        customers: totalCustomersCount,
        suppliers: totalSuppliersCount,
        salesCount: invoices.length
      },
      sales: {
        totalRevenue: Number(totalSalesRevenue.toFixed(2)),
        totalItemsSold: totalProductsSoldQty,
      },
      inventory: {
        aggregateItemsInStock: totalStockQuantityCountAggregate,
        assetsPurchaseValuation: Number(totalStockValuePurchaseValAmt.toFixed(2)),
        assetsPotentialSalesValuation: Number(totalStockValueSellingValAmt.toFixed(2)),
        lowStockItemsCount: lowStockListing.length,
        lowStockProducts: lowStockListing.slice(0, 8) // Limit list for widget performance
      },
      monthlySummary: monthlySalesSummaryList
    });
  } catch (error) {
    console.error('getReportsData Error:', error.message);
    return res.status(500).json({ message: 'Server error generating business stats reporting metrics' });
  }
};

import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Receipt,
  Plus,
  Trash2,
  ListPlus,
  Layers,
  ShoppingBag,
  ArrowRight,
  UserCheck,
  Calculator,
  Printer,
  X,
  History,
  Scan
} from 'lucide-react';

export default function Billing() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [pastInvoices, setPastInvoices] = useState([]);

  // Core selection state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState([]); // List of { product, quantity, total }
  
  // Selection panel input states
  const [pickerProductId, setPickerProductId] = useState('');
  const [pickerQty, setPickerQty] = useState('1');
  const [gstRate, setGstRate] = useState('18'); // 18% default GST

  // Barcode simulator state
  const [barcodeInput, setBarcodeInput] = useState('');

  // Quick Customer Register state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [showCustForm, setShowCustForm] = useState(false);

  // Response / Dialog views controllers
  const [errorHeader, setErrorHeader] = useState('');
  const [successHeader, setSuccessHeader] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState(null); // Prefilled for printing popup modal!

  const loadBillingContext_API = async () => {
    try {
      setLoading(true);
      setErrorHeader('');
      const [customersRes, productsRes, invoicesRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products'),
        api.get('/billing')
      ]);
      setCustomers(customersRes.data || []);
      const activeProducts = productsRes.data || [];
      setProducts(activeProducts);
      setPastInvoices(invoicesRes.data || []);

      if (customersRes.data?.length > 0) {
        setSelectedCustomerId(customersRes.data[0]._id);
      }
      if (activeProducts.length > 0) {
        setPickerProductId(activeProducts[0]._id);
      }
    } catch (err) {
      console.error('Failed to load registers for checkout:', err);
      setErrorHeader('Failed to pull buyers or warehouse catalogs for checkout.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingContext_API();
  }, []);

  // Compute live cart aggregates
  const rawSubtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const gstAmount = Number(((rawSubtotal * Number(gstRate)) / 100).toFixed(2));
  const cgstAmount = Number((gstAmount / 2).toFixed(2));
  const sgstAmount = Number((gstAmount / 2).toFixed(2));
  const grandTotal = Number((rawSubtotal + gstAmount).toFixed(2));

  // Add Item to cart helper
  const addItemToCartById = (productId, qCount) => {
    const targetProduct = products.find(p => p._id === productId || p.code === productId);
    if (!targetProduct) {
      setErrorHeader('SKU Code / Product was not found in the catalog.');
      return;
    }

    if (targetProduct.quantity <= 0) {
      setErrorHeader(`Product '${targetProduct.name}' is out of stock!`);
      return;
    }

    const currentStock = Number(targetProduct.quantity);

    // Calculate existing cart requirements
    const existingInCart = cart.find(item => item.product._id === targetProduct._id);
    const existingQty = existingInCart ? existingInCart.quantity : 0;
    const totalQtyNeeded = existingQty + qCount;

    if (currentStock < totalQtyNeeded) {
      setErrorHeader(`Insufficient Stock for '${targetProduct.name}'. Available: ${currentStock}, Already in Cart: ${existingQty}`);
      return;
    }

    if (existingInCart) {
      setCart(prev => prev.map(item => {
        if (item.product._id === targetProduct._id) {
          const newQ = item.quantity + qCount;
          return {
            ...item,
            quantity: newQ,
            total: Number((item.product.sellingPrice * newQ).toFixed(2))
          };
        }
        return item;
      }));
    } else {
      setCart(prev => [
        ...prev,
        {
          product: targetProduct,
          quantity: qCount,
          total: Number((targetProduct.sellingPrice * qCount).toFixed(2))
        }
      ]);
    }
  };

  const handleAddItemToCart = (e) => {
    e.preventDefault();
    setErrorHeader('');
    setSuccessHeader('');

    if (!pickerProductId) return setErrorHeader('Pick a valid catalog item.');
    const qCount = Number(pickerQty);
    if (isNaN(qCount) || qCount <= 0) return setErrorHeader('Please enter a positive item count.');

    addItemToCartById(pickerProductId, qCount);
    setPickerQty('1'); // Reset count
  };

  // Barcode simulation handler
  const handleBarcodeSimulateScan = (e) => {
    e.preventDefault();
    setErrorHeader('');
    setSuccessHeader('');
    
    if (!barcodeInput.trim()) {
      setErrorHeader('Please enter a SKU Code to simulate scan.');
      return;
    }

    const matchedProd = products.find(
      p => p.code.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (!matchedProd) {
      setErrorHeader(`Simulated Scan failed: Product SKU Code '${barcodeInput}' not found.`);
      return;
    }

    addItemToCartById(matchedProd._id, 1);
    setSuccessHeader(`Simulated Scan Successful: Added 1 unit of '${matchedProd.name}' to cart.`);
    setBarcodeInput(''); // Clear barcode scanner
  };

  // Quick Customer Registration handler
  const handleQuickCustomerRegister = async (e) => {
    e.preventDefault();
    setErrorHeader('');
    setSuccessHeader('');

    if (!newCustName.trim() || !newCustPhone.trim()) {
      setErrorHeader('Customer name and contact phone are required.');
      return;
    }

    try {
      const res = await api.post('/customers', {
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        address: newCustAddress.trim()
      });

      setCustomers(prev => [...prev, res.data.customer]);
      setSelectedCustomerId(res.data.customer._id);
      
      // Reset form
      setNewCustName('');
      setNewCustPhone('');
      setNewCustAddress('');
      setShowCustForm(false);
      setSuccessHeader(`Customer '${res.data.customer.name}' registered & linked successfully!`);
    } catch (err) {
      console.error(err);
      setErrorHeader(err.response?.data?.message || 'Failed to register new customer.');
    }
  };

  const handleRemoveItem = (productId) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const handleDownloadInvoiceTxt = (invoice) => {
    if (!invoice) return;
    
    const custName = activeCustomerObj?.name || 'Walk-in Customer';
    const custPhone = activeCustomerObj?.phone || 'N/A';
    
    let text = `========================================\n`;
    text += `          WHOLESALE SUITE INC           \n`;
    text += `========================================\n`;
    text += `GSTIN: 07AAAAA1111A1Z1\n`;
    text += `Address: Outer Ring Road, Delhi\n`;
    text += `----------------------------------------\n`;
    text += `Invoice No: ${invoice.invoiceNumber}\n`;
    text += `Date: ${new Date(invoice.date).toLocaleDateString('en-GB')}\n`;
    text += `Customer: ${custName}\n`;
    text += `Phone: ${custPhone}\n`;
    text += `========================================\n`;
    text += `SKU       Item Name        Qty   Rate   Total\n`;
    text += `----------------------------------------\n`;
    
    invoice.products.forEach(p => {
      const code = p.code.padEnd(9).slice(0, 9);
      const name = p.name.padEnd(16).slice(0, 16);
      const qty = p.quantity.toString().padStart(3);
      const price = p.price.toFixed(0).padStart(6);
      const total = p.total.toFixed(0).padStart(7);
      text += `${code} ${name} ${qty} ${price} ${total}\n`;
    });
    
    text += `----------------------------------------\n`;
    text += `Subtotal (Net):          ₹${invoice.subtotal.toFixed(2)}\n`;
    text += `CGST (${(invoice.gstRate || 18)/2}%):            ₹${(invoice.gst/2).toFixed(2)}\n`;
    text += `SGST (${(invoice.gstRate || 18)/2}%):            ₹${(invoice.gst/2).toFixed(2)}\n`;
    text += `Total GST (${invoice.gstRate || 18}%):         ₹${invoice.gst.toFixed(2)}\n`;
    text += `----------------------------------------\n`;
    text += `GRAND TOTAL:             ₹${invoice.totalAmount.toFixed(2)}\n`;
    text += `========================================\n`;
    text += ` Thank you for shopping with us! \n`;
    text += `========================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoice.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCheckoutSubmit = async () => {
    setErrorHeader('');
    setSuccessHeader('');

    if (!selectedCustomerId) {
      return setErrorHeader('Please link a registered customer to create this bill.');
    }
    if (cart.length === 0) {
      return setErrorHeader('Your checkout cart list is empty. Add products before checkout.');
    }

    setCheckoutLoading(true);
    try {
      const postProducts = cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));

      const payload = {
        customerId: selectedCustomerId,
        products: postProducts,
        gstRate: Number(gstRate)
      };

      const res = await api.post('/billing', payload);
      
      setSuccessHeader(`Invoice ${res.data.invoice.invoiceNumber} recorded successfully! Inventory has been updated.`);
      setCreatedInvoice(res.data.invoice);
      setCart([]); // Clear cart

      // Reload fresh data
      await loadBillingContext_API();
    } catch (err) {
      console.error('Transaction processing failed:', err);
      setErrorHeader(err.response?.data?.message || 'Transaction processing failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const activeCustomerObj = customers.find(c => c._id === selectedCustomerId);

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Opening Terminal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Billing POS Terminal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Simulate barcode scans, register buyers, compute CGST/SGST splits, and print bills.
          </p>
        </div>
        <button
          onClick={loadBillingContext_API}
          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm animate-fade-in"
        >
          Reset Registers
        </button>
      </div>

      {successHeader && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded text-xs font-semibold">
          {successHeader}
        </div>
      )}

      {errorHeader && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded text-xs font-semibold">
          {errorHeader}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Link customer / add items */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Step 1: Customer Link */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Step 1: Link Buyer</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustForm(!showCustForm)}
                className="text-[11px] text-indigo-600 hover:underline font-bold"
              >
                {showCustForm ? 'Cancel Registration' : '+ Quick Register Customer'}
              </button>
            </div>

            {showCustForm ? (
              <form onSubmit={handleQuickCustomerRegister} className="space-y-3 p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">Add Customer Profile</span>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="Customer or business name"
                    className="w-full text-xs p-2 border border-slate-300 bg-white rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full text-xs p-2 border border-slate-300 bg-white rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Billing Site Address</label>
                  <input
                    type="text"
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    placeholder="Billing address"
                    className="w-full text-xs p-2 border border-slate-300 bg-white rounded outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs uppercase"
                >
                  Save and Link Customer
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Customer Account
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 bg-white rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                >
                  {customers.length === 0 ? (
                    <option value="">(No registered customers available)</option>
                  ) : (
                    customers.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} (Phone: {c.phone})
                      </option>
                    ))
                  )}
                </select>

                {activeCustomerObj && (
                  <div className="bg-indigo-50/30 p-3 rounded border border-indigo-100/50 space-y-1 text-xs text-slate-600">
                    <p>Name: <strong className="text-slate-900">{activeCustomerObj.name}</strong></p>
                    <p>Phone: <strong>{activeCustomerObj.phone}</strong></p>
                    {activeCustomerObj.address && (
                      <p className="line-clamp-1">Address: {activeCustomerObj.address}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barcode Simulator Widget */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Barcode Reader Simulator</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">SIMULATION</span>
            </div>
            <form onSubmit={handleBarcodeSimulateScan} className="flex gap-2">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan or enter SKU code"
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-450"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition rounded text-xs font-bold uppercase cursor-pointer shadow-sm shrink-0"
              >
                Scan SKU
              </button>
            </form>
            <p className="text-[10.5px] text-slate-500 leading-normal">
              Type a product SKU and press Enter to add the matching item to the cart.
            </p>
          </div>

          {/* Step 2: Add Line Items Manual Selector */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="h-5 w-5 text-slate-800" />
              <h3 className="font-bold text-slate-900 text-sm">Step 2: Add Cart Items Manual</h3>
            </div>

            <form onSubmit={handleAddItemToCart} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Product *
                </label>
                <select
                  value={pickerProductId}
                  onChange={(e) => setPickerProductId(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 bg-white rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                >
                  {products.length === 0 ? (
                    <option value="">(No products in catalog)</option>
                  ) : (
                    products.map(p => (
                      <option key={p._id} value={p._id} disabled={p.quantity <= 0}>
                        {p.name} (SKU: {p.code} • Price: ₹{p.sellingPrice} • Stock: {p.quantity}) {p.quantity <= 0 ? '[OUT OF STOCK]' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Order Qty *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pickerQty}
                    onChange={(e) => setPickerQty(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    GST Rate (%)
                  </label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="0">0% Exempt</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST (Standard)</option>
                    <option value="28">28% GST (Luxury)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ListPlus className="h-4.5 w-4.5" />
                Add Item to Cart
              </button>
            </form>
          </div>

        </div>
        
        {/* Right pane: CART / INVOICE PREVIEW */}
        <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between min-h-[550px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-slate-800" />
                <h3 className="font-bold text-slate-900 text-sm">Invoice Cart Checkout Preview</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 font-bold uppercase rounded-full">
                {cart.length} Items in Cart
              </span>
            </div>

            {/* Cart list table */}
            {cart.length === 0 ? (
              <div className="py-24 text-center text-xs text-slate-400 italic">
                Cart is currently empty. Selected products will accumulate here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                      <th className="px-3 py-2">Product Info</th>
                      <th className="px-3 py-2 text-right">Unit Rate</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Total sum</th>
                      <th className="px-3 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 align-middle">
                    {cart.map(item => (
                      <tr key={item.product._id} className="hover:bg-slate-50/50 transition">
                        <td className="px-3 py-3">
                          <span className="font-bold text-slate-900 block">{item.product.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {item.product.code}</span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono">₹{item.product.sellingPrice.toFixed(2)}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-bold bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-800">{item.quantity}</span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">₹{item.total.toFixed(2)}</td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Calculations checkout block */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-650 font-medium">
                <span>Subtotal (Net price)</span>
                <span className="font-mono">₹{rawSubtotal.toFixed(2)}</span>
              </div>
              
              {/* GST splitted taxes */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>CGST (at {Number(gstRate)/2}%)</span>
                <span className="font-mono">+ ₹{cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>SGST (at {Number(gstRate)/2}%)</span>
                <span className="font-mono">+ ₹{sgstAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-650 font-semibold pb-2 border-b border-slate-200">
                <span>Total GST Tax ({gstRate}%)</span>
                <span className="font-mono text-rose-600">+ ₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-base text-slate-900 font-black pt-1">
                <span className="uppercase tracking-wider">Gross Grand Total</span>
                <span className="font-mono text-indigo-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutSubmit}
              disabled={checkoutLoading || cart.length === 0}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400 font-bold rounded shadow-sm transition uppercase text-xs tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calculator className="h-4.5 w-4.5" />
              {checkoutLoading ? 'Generating Invoice Ledger...' : 'Generate GST Invoice'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Sales Invoices History Ledger panel */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="h-5 w-5 text-slate-700" />
          <h3 className="font-bold text-sm text-slate-900">Recent Invoices History Ledger</h3>
        </div>

        {pastInvoices.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No bills registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-4 py-2.5">Invoice #</th>
                  <th className="px-4 py-2.5">Billing Date</th>
                  <th className="px-4 py-2.5">Buyer</th>
                  <th className="px-4 py-2.5 text-center">Items Count</th>
                  <th className="px-4 py-2.5 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastInvoices.map(invoice => {
                  const custObj = customers.find(c => c._id === invoice.customerId);
                  return (
                    <tr key={invoice._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-700">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(invoice.date).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{custObj ? custObj.name : '(Unlinked Customer)'}</td>
                      <td className="px-4 py-3 text-center">{invoice.products?.length || 0} items</td>
                      <td className="px-4 py-3 text-right font-bold font-mono text-slate-900">₹{invoice.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Invoice Popup Sheet */}
      {createdInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto" id="invoice-modal-overlay">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden my-8" id="invoice-sheet-print">
            
            {/* Control banner */}
            <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-200" />
                <span className="font-bold text-sm uppercase tracking-wider">Print / Review Invoice</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadInvoiceTxt(createdInvoice)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition"
                >
                  Download TXT
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white text-indigo-700 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 transition"
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </button>
                <button
                  onClick={() => setCreatedInvoice(null)}
                  className="text-white hover:text-slate-200 transition cursor-pointer"
                  title="Close popup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-8 space-y-6 bg-white text-slate-800">
              
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <div className="bg-indigo-600 text-white p-1 rounded font-bold">WS</div>
                    <span className="font-extrabold text-lg tracking-wide">WHOLESALE SUITE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    GSTIN: 07AAAAA1111A1Z1 • New Industrial Hub,<br />
                    Outer Ring Road, Delhi - 110085
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="bg-indigo-50 text-indigo-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded inline-block">
                    Tax Invoice (GST Compliant)
                  </span>
                  <p className="text-xs text-slate-650 font-bold py-1">#{createdInvoice.invoiceNumber}</p>
                  <p className="text-[11px] text-slate-400">Date: {new Date(createdInvoice.date).toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-slate-50 p-4 rounded border border-slate-100 flex flex-col sm:flex-row justify-between text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-450 font-bold uppercase block tracking-wider text-slate-400">Billed To:</span>
                  <span className="font-bold text-slate-900 text-sm">{activeCustomerObj?.name}</span>
                  <p className="text-slate-600">Cell: {activeCustomerObj?.phone}</p>
                  {activeCustomerObj?.address && <p className="text-slate-500">{activeCustomerObj.address}</p>}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead>
                    <tr className="bg-slate-55 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100">
                      <th className="px-3 py-2">SKU Code</th>
                      <th className="px-3 py-2">Item Name</th>
                      <th className="px-3 py-2 text-right">Selling Rate</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {createdInvoice.products?.map((prod, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2.5 font-mono text-slate-500">{prod.code}</td>
                        <td className="px-3 py-2.5 font-bold text-slate-900">{prod.name}</td>
                        <td className="px-3 py-2.5 text-right font-mono">₹{prod.price.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-center font-mono">{prod.quantity}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">₹{prod.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CGST, SGST tax splits breakdown */}
              <div className="flex flex-col items-end pt-4 border-t border-slate-200 space-y-1 text-xs text-slate-600">
                <div className="flex w-64 justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-900">₹{createdInvoice.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex w-64 justify-between">
                  <span>CGST ({(createdInvoice.gstRate || 18)/2}%):</span>
                  <span className="font-mono text-slate-900">₹{(createdInvoice.gst/2)?.toFixed(2)}</span>
                </div>
                <div className="flex w-64 justify-between">
                  <span>SGST ({(createdInvoice.gstRate || 18)/2}%):</span>
                  <span className="font-mono text-slate-900">₹{(createdInvoice.gst/2)?.toFixed(2)}</span>
                </div>
                <div className="flex w-64 justify-between font-black text-slate-900 text-sm border-t border-slate-150 pt-2.5">
                  <span>Grand Total:</span>
                  <span className="font-mono text-indigo-700">₹{createdInvoice.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 text-[10px] text-slate-400 text-center space-y-1">
                <p className="font-semibold uppercase tracking-wider">This is a computer-generated GST invoice receipt.</p>
                <p>Thank you for shopping with WholesaleSuite!</p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

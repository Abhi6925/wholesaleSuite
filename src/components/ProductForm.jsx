import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { HelpCircle, Save, X } from 'lucide-react';
import SupplierForm from './SupplierForm.jsx';


export default function ProductForm({ product, suppliers, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    supplierId: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [localSuppliers, setLocalSuppliers] = useState(suppliers || []);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);

  useEffect(() => {
    if (suppliers) {
      setLocalSuppliers(suppliers);
    }
  }, [suppliers]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        code: product.code || '',
        category: product.category || '',
        purchasePrice: product.purchasePrice || 0,
        sellingPrice: product.sellingPrice || 0,
        quantity: product.quantity || 0,
        supplierId: product.supplierId || '',
        description: product.description || '',
      });
    } else if (localSuppliers && localSuppliers.length > 0) {
      // Set default supplier if none selected
      setFormData(prev => ({ ...prev, supplierId: localSuppliers[0]._id }));
    }
  }, [product, localSuppliers]);

  const handleSupplierAdded = async () => {
    try {
      const res = await api.get('/suppliers');
      const updatedSuppliers = res.data || [];
      setLocalSuppliers(updatedSuppliers);
      
      if (updatedSuppliers.length > 0) {
        const existingIds = new Set(localSuppliers.map(s => s._id));
        const newSupplier = updatedSuppliers.find(s => !existingIds.has(s._id));
        if (newSupplier) {
          setFormData(prev => ({ ...prev, supplierId: newSupplier._id }));
        } else {
          setFormData(prev => ({ ...prev, supplierId: updatedSuppliers[updatedSuppliers.length - 1]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to refresh suppliers:', err);
    } finally {
      setIsAddingSupplier(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'purchasePrice' || name === 'sellingPrice' || name === 'quantity'
        ? Number(value)
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { name, code, category, purchasePrice, sellingPrice, quantity, supplierId } = formData;

    if (!name.trim()) return setError('Product name is required');
    if (!code.trim()) return setError('Product SKU code is required');
    if (!category.trim()) return setError('Category group is required');
    if (purchasePrice <= 0) return setError('Purchase price must be positive');
    if (sellingPrice <= 0) return setError('Selling retail price must be positive');
    if (quantity < 0) return setError('Inventory quantity cannot be negative');
    if (!supplierId) return setError('Please link a supplier');

    setLoading(true);
    try {
      if (product) {
        await api.put(`/products/${product._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed saving product. Check code for uniqueness!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <h3 className="font-bold text-base">
            {product ? 'Modify Stock Product Details' : 'Register New Wholesaler Product'}
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition cursor-pointer"
            title="Close Dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 border border-rose-100 p-3 rounded text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Product name"
                className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
                Product Code (SKU) *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="SKU code"
                className="w-full text-sm border border-slate-300 rounded px-3 py-2 disabled:bg-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                disabled={!!product}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
                Category Group *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Category"
                className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase">
                  Link Supplier *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingSupplier(true)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
                >
                  + Add New
                </button>
              </div>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              >
                {localSuppliers.length === 0 ? (
                  <option value="">(No registered suppliers)</option>
                ) : (
                  localSuppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
                Purchase Price *
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice || ''}
                onChange={handleChange}
                placeholder="Purchase"
                min="0"
                step="any"
                className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
                Selling Price *
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice || ''}
                onChange={handleChange}
                placeholder="Selling"
                min="0"
                step="any"
                className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
                Initial Stock *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity || ''}
                onChange={handleChange}
                placeholder="Stock"
                min="0"
                className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
              Product Description / Comments
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Notes, storage details, or pack size"
              rows="3"
              className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 transition text-slate-600 rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-900 border border-transparent text-white hover:bg-emerald-600 transition disabled:bg-slate-400 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Processing...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>

      {isAddingSupplier && (
        <SupplierForm
          onSubmit={handleSupplierAdded}
          onCancel={() => setIsAddingSupplier(false)}
        />
      )}
    </div>
  );
}

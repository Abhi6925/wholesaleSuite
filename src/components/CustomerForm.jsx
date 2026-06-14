import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Save, X } from 'lucide-react';

export default function CustomerForm({ customer, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Customer name is required');
    if (!formData.phone.trim()) return setError('Customer contact phone is required');

    setLoading(true);
    try {
      if (customer) {
        await api.put(`/customers/${customer._id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed saving customer details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <h3 className="font-bold text-base">
            {customer ? 'Edit Customer Details' : 'Add New Customer Profile'}
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

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
              Customer Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar / Gupta Stores"
              className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
              Mobile Phone Number *
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
              className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
              Email Address (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. buyer@example.com"
              className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider mb-1 uppercase">
              Billing/Shipping Address (Optional)
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Sector-4, Rohini, New Delhi - 110085"
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
              {loading ? 'Processing...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

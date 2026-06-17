import { useState, useEffect } from 'react';
import api from '../services/api.js';
import SupplierForm from '../components/SupplierForm.jsx';
import { Plus, Edit2, Trash2, Search, RefreshCw, Truck } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal control state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorHeader('');
      const res = await api.get('/suppliers');
      setSuppliers(res.data || []);
    } catch (err) {
      console.error('Error fetching suppliers list:', err);
      setErrorHeader('Failed to load suppliers registry directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely certain you wish to delete this supplier? All linked products may show as unlinked.')) {
      return;
    }
    try {
      await api.delete(`/suppliers/${id}`);
      fetchData(); // reload
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete supplier.');
    }
  };

  const handleEditClick = (s) => {
    setSelectedSupplier(s);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedSupplier(null);
    setIsFormOpen(true);
  };

  const handleFormSubmitted = () => {
    setIsFormOpen(false);
    setSelectedSupplier(null);
    fetchData(); // reload
  };

  // Perform search filtering on clientside state
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Hydrating Registry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Suppliers Registry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage partner supplier accounts, contact information, email details, and office addresses.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchData}
            className="p-2 border border-slate-355 rounded text-slate-650 hover:bg-slate-50 transition cursor-pointer"
            title="Reload items"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add New Supplier
          </button>
        </div>
      </div>

      {errorHeader && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded text-xs font-bold uppercase">
          {errorHeader}
        </div>
      )}

      {/* Catalog Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search suppliers by name, phone, email, or address"
            className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {filteredSuppliers.length === 0 ? (
          <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Truck className="h-10 w-10 text-slate-300" />
            <span>No registered suppliers found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-5 py-3">Supplier / Company</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Address</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">
                      {s.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {s.phone}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {s.email || <span className="text-slate-400 italic">No email</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                      {s.address || <span className="text-slate-400 italic">No address</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(s)}
                          className="p-1 px-2 border border-slate-200 text-slate-600 rounded hover:bg-slate-100 transition cursor-pointer"
                          title="Edit details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="p-1 px-2 border border-slate-200 text-rose-600 border-rose-100 rounded hover:bg-rose-50 transition cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SupplierForm Dialog Modal overlay */}
      {isFormOpen && (
        <SupplierForm
          supplier={selectedSupplier}
          onSubmit={handleFormSubmitted}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}

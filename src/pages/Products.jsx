import { useState, useEffect } from 'react';
import api from '../services/api.js';
import ProductForm from '../components/ProductForm.jsx';
import { Plus, Edit2, Trash2, Search, Filter, RefreshCw, Box } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal control state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorHeader('');
      const [productsRes, suppliersRes] = await Promise.all([
        api.get('/products'),
        api.get('/suppliers')
      ]);
      setProducts(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (err) {
      console.error('Error fetching catalog data:', err);
      setErrorHeader('Failed to load products list or suppliers registry directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely certain you wish to delete this product? All database items, records, and related items will be permanently adjusted.')) {
      return;
    }
    try {
      await api.delete(`/products/${id}`);
      fetchData(); // reload
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleEditClick = (p) => {
    setSelectedProduct(p);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleFormSubmitted = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    fetchData(); // reload
  };

  // Extract unique categories for filtering select dropdown
  const categoriesList = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Perform search & categorisation filtering on clientside state
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSupplierName = (id) => {
    const s = suppliers.find(item => item._id === id);
    return s ? s.name : '(Unlinked Supplier)';
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Hydrating Catalog...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Products Inventory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage product items, update quantities, edit purchase/selling rates, and view low-stock warning alerts.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchData}
            className="p-2 border border-slate-350 rounded text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Reload items"
            id="btn-refresh-catalog"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-750 transition text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded cursor-pointer shadow-sm"
            id="btn-add-product"
          >
            <Plus className="h-4 w-4" />
            Add New Product
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
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, SKU code..."
            className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">Group Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-300 bg-white rounded px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 w-full md:w-48"
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Box className="h-10 w-10 text-slate-300" />
            <span>No warehouse products found matching filters.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50">
                  <th className="px-5 py-3">SKU Code</th>
                  <th className="px-5 py-3">Product Specifications</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Partner Supplier</th>
                  <th className="px-5 py-3 text-right">Cost Price</th>
                  <th className="px-5 py-3 text-right">Wholesale Retail</th>
                  <th className="px-5 py-3 text-right">Current Stock</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => {
                  const isLow = p.quantity < 15;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-600">{p.code}</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 block text-sm">{p.name}</span>
                        {p.description && (
                          <span className="text-[10px] text-slate-400 block max-w-xs truncate">{p.description}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold text-[10px] uppercase">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-medium">
                        {getSupplierName(p.supplierId)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-slate-600">
                        ₹{p.purchasePrice.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-slate-900 font-bold">
                        ₹{p.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`font-black font-mono text-sm inline-block px-2 py-0.5 rounded ${
                          isLow ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-700'
                        }`}>
                          {p.quantity} Units
                        </span>
                        {isLow && (
                          <span className="text-[9px] text-rose-505 text-rose-550 font-bold uppercase tracking-wider block mt-1 animate-pulse">
                            ⚠ Low stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1 px-2 border border-slate-200 text-slate-600 rounded hover:bg-slate-100 transition cursor-pointer"
                            title="Edit details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-1 px-2 border border-slate-250 text-rose-600 border-rose-100 rounded hover:bg-rose-50 transition cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ProductForm Dialog Modal overlay */}
      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          suppliers={suppliers}
          onSubmit={handleFormSubmitted}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}

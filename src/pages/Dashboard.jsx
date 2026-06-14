import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  AlertTriangle,
  History,
  TrendingUp,
  Box,
  IndianRupee,
  Users2
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorHeader('');
      
      const [statsRes, invoicesRes] = await Promise.all([
        api.get('/billing/statistics'),
        api.get('/billing')
      ]);

      setStats(statsRes.data);
      const sortedInvoices = (invoicesRes.data || []).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setRecentSales(sortedInvoices.slice(0, 7)); // Get up to 7 recent sales for chart and tables
    } catch (err) {
      console.error('Error loading dashboard statistics:', err);
      setErrorHeader('Failed to pull system statistics metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Compiling stats...</span>
        </div>
      </div>
    );
  }

  const c = stats?.counters || { products: 0, customers: 0, suppliers: 0, salesCount: 0 };
  const s = stats?.sales || { totalRevenue: 0, totalItemsSold: 0 };
  const inv = stats?.inventory || { aggregateItemsInStock: 0, assetsPurchaseValuation: 0, assetsPotentialSalesValuation: 0, lowStockItemsCount: 0, lowStockProducts: [] };

  // Chart data configuration mapping recent sales in chronological order (oldest to newest in the set)
  const chartData = {
    labels: recentSales.map(item => item.invoiceNumber).reverse(),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: recentSales.map(item => item.totalAmount).reverse(),
        backgroundColor: 'rgba(79, 70, 229, 0.75)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#64748b',
          font: { size: 10 },
        },
        grid: {
          color: '#f1f5f9',
        }
      },
      x: {
        ticks: {
          color: '#64748b',
          font: { size: 10 },
        },
        grid: {
          display: false,
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time statistics, stock levels, and sales metrics overview.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
        >
          Refresh Data
        </button>
      </div>

      {errorHeader && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded text-xs font-bold uppercase">
          {errorHeader}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Catalog</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">{c.products} Items</span>
            <span className="text-[10px] text-slate-400 block font-medium">Distinct inventory entries</span>
          </div>
          <div className="bg-slate-50 p-3 h-12 w-12 rounded-lg text-slate-700 flex items-center justify-center">
            <Box className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Stock Asset Value</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">₹{inv.assetsPotentialSalesValuation.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 block font-medium">Valuation at Selling Retail Price</span>
          </div>
          <div className="bg-slate-50 p-3 h-12 w-12 rounded-lg text-indigo-600 flex items-center justify-center">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Gross Sales Revenue</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">₹{s.totalRevenue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 block font-medium">From {c.salesCount} invoice orders</span>
          </div>
          <div className="bg-slate-50 p-3 h-12 w-12 rounded-lg text-indigo-600 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Active Clients</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">{c.customers} Buyers</span>
            <span className="text-[10px] text-slate-400 block font-medium">Registered business clients</span>
          </div>
          <div className="bg-slate-50 p-3 h-12 w-12 rounded-lg text-slate-700 flex items-center justify-center">
            <Users2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Chart.js Sales Performance Section */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Sales Analytics Performance</h3>
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold border border-indigo-100">Chart.js Visualization</span>
        </div>
        <div className="h-64 relative">
          {recentSales.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              No bills recorded to visualize yet.
            </div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Secondary layout sections: Low Stock Warning & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Low inventory threshold alerts */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">Low Stock Indicators</h3>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {inv.lowStockItemsCount} Alerts
            </span>
          </div>

          {inv.lowStockProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              ✓ All products are fully stocked!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {inv.lowStockProducts.map(p => (
                <div key={p._id} className="py-2.5 flex items-center justify-between transition hover:bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">{p.name}</span>
                    <span className="text-[10px] text-slate-500 block">SKU Code: {p.code} • Category: {p.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600 block bg-rose-50 px-2 py-1 rounded">
                      {p.quantity} Units
                    </span>
                    <span className="text-[9px] text-slate-400 block">Threshold limit: 15</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Checkout ledger sales logs */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-700" />
              <h3 className="font-bold text-sm text-slate-900">Recent Transactions</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium font-mono">Invoice Records</span>
          </div>

          {recentSales.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No bills recorded yet. Go to Billing Terminal.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 text-slate-550 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-3 py-2">Invoice Number</th>
                    <th className="px-3 py-2">Date Created</th>
                    <th className="px-3 py-2">Items Count</th>
                    <th className="px-3 py-2 text-right">Invoice Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.slice(0, 5).map(bill => {
                    const dt = new Date(bill.date);
                    return (
                      <tr key={bill._id} className="hover:bg-slate-50/60 transition">
                        <td className="px-3 py-3 font-bold text-slate-900">{bill.invoiceNumber}</td>
                        <td className="px-3 py-3 text-slate-500">
                          {isNaN(dt.getTime()) ? 'N/A' : dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-3 text-slate-600">{bill.products?.length || 0} Products</td>
                        <td className="px-3 py-3 text-slate-900 font-bold text-right">₹{bill.totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

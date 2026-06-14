import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Layers, ArrowRight, ShieldCheck, FileSpreadsheet, Percent, BarChart } from 'lucide-react';

export default function Home() {
  const { token } = useAuth();

  // If already logged in, skip the introduction page
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const benefits = [
    { title: 'Inventory Management', desc: 'Add products, track warehouse stock quantities, and view warning indicators for low items.', icon: FileSpreadsheet },
    { title: 'Billing & Invoices', desc: 'Select customer buyers, add cart items, compute subtotals, apply standard GST, and print invoices.', icon: Percent },
    { title: 'Sales Analytics', desc: 'Audit system performance, potential profit asset valuations, sales graphs, and item totals.', icon: BarChart },
    { title: 'Secure Authentication', desc: 'State-persistent user modules, protected client routers, and database configuration support.', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top navigation header */}
      <nav className="border-b border-slate-200 bg-white w-full h-18 px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-50 text-indigo-600 p-1.5 border border-indigo-150 rounded font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg tracking-wider text-slate-900">
              Wholesale<span className="text-indigo-600">Suite</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition px-4 py-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition px-4 py-2 rounded flex items-center gap-1 cursor-pointer shadow-sm"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Block */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:py-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 animate-fade-in shadow-sm">
          ★ B.Tech Term Project Showcase
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mb-6 leading-tight max-w-3xl">
          Wholesale Inventory & <br />
          <span className="text-indigo-600">
            Billing Management System
          </span>
        </h1>

        <p className="text-slate-600 text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-normal">
          A full-stack MVC MERN platform built for small-to-medium shopkeepers and supply distributors to track active inventories and process instant billing checkouts.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            to="/login"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
          >
            Admin Sign In
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <Link
            to="/register"
            className="px-8 py-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded transition flex items-center justify-center text-sm uppercase tracking-wider cursor-pointer shadow-sm"
          >
            Register Admin
          </Link>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left w-full border-t border-slate-200 pt-16">
          {benefits.map((b, idx) => {
            const IconComp = b.icon;
            return (
              <div key={idx} className="bg-white border border-slate-200 p-6 rounded-lg hover:border-indigo-400 transition group shadow-sm">
                <div className="bg-indigo-55/10 text-indigo-600 p-2.5 rounded w-fit mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors bg-indigo-50 border border-indigo-100">
                  <IconComp className="h-5 w-5 text-indigo-600 group-hover:text-white" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">{b.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer banner */}
      <footer className="h-16 border-t border-slate-200 flex items-center justify-center text-xs text-slate-500 tracking-wider bg-white px-6 mt-12 shadow-inner">
        MERN College Project Portfolio • Built with React, Express, and MongoDB
      </footer>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Truck,
  Users,
  Receipt,
  History,
  TrendingUp,
  User,
  PackageCheck,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory & Products', path: '/products', icon: Box },
    { name: 'Billing & Invoices', path: '/billing', icon: Receipt },
    { name: 'Admin Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 md:hidden z-40 transition-opacity"
        />
      )}

      {/* Primary Sidebar Drawer container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-7">
          <div>
            <span className="px-3 text-xs font-bold uppercase tracking-widest text-slate-400 block mb-3">
              Navigation Menu
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const IconComp = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer group ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 font-semibold'
                          : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-transparent'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <IconComp className="h-4.5 w-4.5 group-hover:scale-102 transition-transform" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Security Lock
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">
                All client requests route securely through standard JWT authorization tokens.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info element */}
        <div className="p-4 border-t border-slate-200 text-[10px] text-slate-400 text-center font-medium select-none shrink-0 uppercase tracking-widest">
          Wholesale Suite v1.0.0
        </div>
      </aside>
    </>
  );
}

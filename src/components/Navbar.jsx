import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, User as UserIcon, Bell, Layers } from 'lucide-react';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-indigo-600 text-white h-16 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar for mobile viewports */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-1.5 rounded text-indigo-100 hover:text-white hover:bg-indigo-700 transition"
          title="Toggle Menu"
          id="btn-sidebar-toggle"
        >
          <Layers className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-white text-indigo-600 p-1.5 rounded font-bold flex items-center justify-center">
            <Layers className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-wide hidden sm:inline">
            Wholesale<span className="text-indigo-200 font-normal">Suite</span>
          </span>
          <span className="font-semibold text-sm tracking-wide sm:hidden text-indigo-200">
            WS
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs text-indigo-200 font-medium">System Admin</span>
              <span className="text-sm font-semibold text-white">{user.name}</span>
            </div>
            <div className="h-9 w-9 bg-indigo-700 border border-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-indigo-700 text-indigo-100 rounded border border-indigo-550 hover:bg-rose-600 hover:text-white hover:border-rose-700 transition shadow-sm cursor-pointer"
              title="Logout session"
              id="btn-navbar-logout"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

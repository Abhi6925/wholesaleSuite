import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { Mail, LogOut, Database, KeyRound } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/status');
        setDbConnected(!!res.data?.dbConnected);
      } catch (err) {
        console.error('Failed to load database status:', err);
      }
    };
    fetchStatus();
  }, []);

  if (!user) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 italic">
        Loading profile credentials...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Admin Profile Details</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review user session details and database connection configurations.
        </p>
      </div>

      {/* Profile Info Sheet */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {/* Banner header decoration */}
        <div className="bg-indigo-600 h-24 relative">
          <div className="absolute -bottom-8 left-6 h-18 w-18 bg-indigo-750 text-white bg-indigo-700 border-4 border-white font-bold rounded-full flex items-center justify-center text-2xl uppercase shadow-md">
            {user.name.charAt(0)}
          </div>
        </div>

        <div className="pt-12 px-6 pb-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{user.name}</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              System Administrator
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <Mail className="h-4.5 w-4.5 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <KeyRound className="h-4.5 w-4.5 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">User Object ID</span>
                <span className="font-semibold text-slate-800 uppercase font-mono">{user._id}</span>
              </div>
            </div>
          </div>

          {/* Database Info Widget */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-3 items-start">
              <div className={`p-2 rounded-lg mt-0.5 ${dbConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                <Database className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Database Connection</span>
                <p className="text-xs font-bold text-slate-800 leading-normal">
                  {dbConnected
                    ? 'Connected to Live MongoDB Database'
                    : 'Using Local JSON File Storage Fallback'}
                </p>
                <span className="text-[10px] text-slate-500 block leading-normal">
                  {dbConnected
                    ? 'Mongoose is connecting directly to the MongoDB cluster.'
                    : 'Using files in database_files folder to emulate DB queries.'}
                </span>
              </div>
            </div>
            
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 border rounded-full shrink-0 ${
              dbConnected 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-250 bg-emerald-50 border-emerald-200' 
                : 'bg-slate-100 text-slate-500 border-slate-300'
            }`}>
              {dbConnected ? '● Online Cloud' : '● Offline Local'}
            </span>
          </div>

          {/* Logout */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold uppercase tracking-wider rounded hover:bg-rose-600 hover:text-white hover:border-transparent transition-all cursor-pointer shadow-sm"
              id="btn-profile-signout"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

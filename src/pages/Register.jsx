import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Layers, UserPlus, Mail, Lock, Keyboard } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorStr, setErrorStr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorStr('');

    if (!name.trim()) return setErrorStr('Please enter your full name');
    if (!email.trim()) return setErrorStr('Please enter your email');
    if (!password.trim()) return setErrorStr('Please create a password');
    if (password.length < 6) return setErrorStr('Password should be at least 6 characters long');

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorStr(err.message || 'Registration failed, try another email!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6">
      {/* Brand logo */}
      <div className="flex items-center gap-2 mb-6 text-center justify-center">
        <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold">
          <Layers className="h-6 w-6" />
        </div>
        <span className="font-bold text-xl tracking-wide text-slate-900">
          Wholesale<span className="text-indigo-600">Suite</span>
        </span>
      </div>

      <div className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-900">Admin Registration</h2>
          <p className="text-xs text-slate-500 mt-1">Register a security profile to manage products and inventory</p>
        </div>

        {errorStr && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded text-xs font-semibold mb-4 leading-normal">
            {errorStr}
          </div>
        )}

        {/* Input panel */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <Keyboard className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-indigo-550 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-indigo-550 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-indigo-550 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-sm transition-transform active:scale-98 flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
            <UserPlus className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Already have an admin account?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-semibold leading-relaxed">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Lock, User, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export const Login = ({ setActivePage }) => {
  const { login } = useAuth();
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const loggedUser = await login(username, password);
      if (loggedUser.role === 'admin') {
        setActivePage('admin');
      } else {
        setActivePage('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Incorrect username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (userType) => {
    if (userType === 'farmer') {
      setUsername('farmer');
      setPassword('farmer123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-forest-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-forest-700/20">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-forest-950 font-sans tracking-tight">
          Login to CropCare AI
        </h1>
        <p className="text-xs text-slate-500">
          Access your personal farmer dashboard or administrative extension portal.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
        
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          
          <div className="space-y-1">
            <label className="text-slate-600">Username or Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-600">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-md shadow-forest-700/20 transition-all active:scale-98 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Portal</span>}
          </button>

        </form>

        {/* Quick Demo Fill Buttons (For CSP Presentation) */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click College Demo Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('farmer')}
              className="p-2 rounded-xl border border-forest-200 bg-forest-50 hover:bg-forest-100 text-forest-800 font-bold text-center transition-colors"
            >
              🧑‍🌾 Demo Farmer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-center transition-colors"
            >
              🛡️ Extension Admin
            </button>
          </div>
        </div>

        {/* Register Redirect */}
        <div className="text-center text-xs text-slate-500 pt-2">
          <span>Don't have an account? </span>
          <button
            onClick={() => setActivePage('register')}
            className="text-forest-700 font-bold hover:underline"
          >
            Register as a Farmer
          </button>
        </div>

      </div>

    </div>
  );
};

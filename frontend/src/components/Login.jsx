import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, Loader2, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { ImpressionLogo } from './ImpressionLogo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/');
      } else {
        setError(data.detail || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Blobs */}
      <div className="bg-blobs">
        <div className="blob blob-1 bg-[#7C3AED]"></div>
        <div className="blob blob-2 bg-indigo-100"></div>
        <div className="blob blob-3 bg-purple-100"></div>
      </div>
      
      <div className="w-full max-w-[450px] relative z-10">
        
        {/* Brand Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-purple-900/5 border border-slate-200 mb-6 mx-auto group hover:scale-105 transition-transform duration-500">
            <ImpressionLogo className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Welcome Back.</h1>
          <p className="text-slate-600 font-medium">Access the Impression Audit Intelligence Portal</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-10 rounded-[3rem] border border-slate-200/60 shadow-xl shadow-purple-900/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#7C3AED] transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 text-sm rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all placeholder:text-slate-400 font-medium"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#7C3AED] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 text-sm rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all placeholder:text-slate-400 font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold py-3.5 px-4 rounded-xl flex items-center gap-3 animate-shake">
                <ShieldCheck size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full premium-button-primary py-4 text-sm font-bold tracking-wider flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  SIGN IN TO PORTAL
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-200/60 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Security</span>
             </div>
             <Sparkles size={14} className="text-[#7C3AED]" />
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} Impression Intelligence Portal
          </p>
        </div>
      </div>
    </div>
  );
}

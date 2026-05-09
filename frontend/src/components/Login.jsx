import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, Loader2, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
      const response = await fetch('http://localhost:8000/api/login', {
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
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4 relative overflow-hidden font-['Inter']">
      
      {/* Dynamic Background Effects - Blue Theme */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Official Logo Section */}
        <div className="text-center mb-12 group">
          <div className="inline-flex items-center justify-center p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl mb-6 transform transition-all group-hover:scale-105 duration-500">
            <img 
              src="/logo.png" 
              alt="Cubemoons Logo" 
              className="w-32 h-auto object-contain" 
              onError={(e) => { e.target.src = "https://cubemoons.com/assets/logo/cubemoons-favicon.svg" }}
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest mb-1 uppercase">Cubemoons</h1>
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em] opacity-80">Audit Intelligence Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0066FF] to-transparent opacity-50" />

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#0066FF] transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 text-white text-sm rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#0066FF]/50 focus:ring-4 focus:ring-[#0066FF]/10 transition-all placeholder:text-slate-700"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#0066FF] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 text-white text-sm rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-[#0066FF]/50 focus:ring-4 focus:ring-[#0066FF]/10 transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold py-3 px-4 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0066FF] to-[#00D1FF] hover:from-[#0052CC] hover:to-[#00B8E6] text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl shadow-[0_10px_25px_rgba(0,102,255,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  AUTHORIZE ACCESS
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Secured Infrastructure</span>
             </div>
             <Sparkles size={12} className="text-[#00D1FF]" />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] opacity-50">
            Internal Strategy Tool • Cubemoons Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}

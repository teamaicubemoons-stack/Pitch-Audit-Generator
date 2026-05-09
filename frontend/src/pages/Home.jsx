import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuditForm from '../components/AuditForm';
import ProgressTracker from '../components/ProgressTracker';
import { generateAudit } from '../api/auditApi';
import { Sparkles, History, FileText, Calendar, User, Hash, ExternalLink, RefreshCw, FileDown } from 'lucide-react';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000/api`;
      const response = await fetch(`${API_BASE}/my-audits/${user.username}`);
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    const payload = {
      ...formData,
      generator_name: user?.username || 'Unknown',
      generator_id: user?.username || 'N/A'
    };

    try {
      const result = await generateAudit(payload);
      navigate('/result', { state: { auditData: result } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to generate audit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 font-['Inter']">
      
      {/* Hero Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6 border border-blue-500/20 shadow-sm">
          <Sparkles size={14} className="animate-pulse" />
          <span>Powered by Cubemoons Intelligence</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
          Audit <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Intelligence</span> Generator
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed italic">
          Generate high-fidelity, data-driven pitch documents for prospective clients in seconds.
        </p>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-100 p-6 rounded-2xl shadow-sm animate-shake">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0">
               <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">Generation Failure</h3>
              <p className="text-xs text-red-700 font-bold opacity-80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isSubmitting ? (
        <div className="max-w-4xl mx-auto">
           <ProgressTracker />
        </div>
      ) : (
        <div className="animate-fade-in-up">
           <div className="max-w-4xl mx-auto mb-24">
              <AuditForm onSubmit={handleGenerate} isSubmitting={isSubmitting} />
           </div>

           {/* HISTORY SECTION */}
           <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-[20px] flex items-center justify-center text-blue-600 shadow-sm">
                       <History size={28} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-slate-900 tracking-tight">Audit History</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Syncing with Cubemoons Central Cloud</p>
                    </div>
                 </div>
                 <button 
                  onClick={fetchHistory}
                  className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-blue-600 transition-all bg-white border border-slate-200 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest"
                 >
                    <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} />
                    Refresh
                 </button>
              </div>

              {loadingHistory ? (
                <div className="py-24 text-center space-y-4">
                   <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <RefreshCw className="animate-spin text-blue-500" size={32} />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Establishing Secure Connection...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-[40px] shadow-2xl overflow-hidden relative">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client ID</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Company Name</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Date</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">PDF</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {history.map((item, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-10 py-7">
                               <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 opacity-30 group-hover:opacity-100 transition-opacity" />
                                  <span className="text-sm font-black text-slate-900">{item.client_id}</span>
                               </div>
                            </td>
                            <td className="px-10 py-7">
                               <div className="text-sm font-bold text-slate-800">{item.company_name}</div>
                            </td>
                            <td className="px-10 py-7">
                               <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                  <Calendar size={14} className="text-blue-400" />
                                  {item.date}
                               </div>
                            </td>
                            <td className="px-10 py-7 text-right">
                               <div className="flex justify-end">
                                  <button 
                                    className="p-3 bg-slate-900 text-white rounded-xl shadow-lg transform hover:scale-110 active:scale-95 transition-all opacity-10 group-hover:opacity-100"
                                    onClick={() => window.open(item.qr_code === 'SECURED' || item.qr_code === '#' ? '#' : item.qr_code, '_blank')}
                                  >
                                    <FileDown size={16} />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-[40px] p-24 text-center shadow-sm">
                   <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mx-auto mb-8">
                      <FileText size={40} />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3 uppercase tracking-widest">No Cloud History</h3>
                   <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto">Your generated audits will be synchronized with the central cloud database.</p>
                </div>
              )}
           </div>
        </div>
      )}
      
    </div>
  );
}

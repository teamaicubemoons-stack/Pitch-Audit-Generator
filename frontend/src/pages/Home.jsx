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
  const isAdmin = user && user.role === 'Admin';

  useEffect(() => {
    if (user && user.username) {
      fetchHistory();
    }
  }, []);

  const fetchHistory = async () => {
    if (!user || !user.username) return;
    try {
      setLoadingHistory(true);
      const endpoint = isAdmin ? '/api/admin/all-audits' : `/api/my-audits/${user.username}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(`/api${endpoint}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('History fetch failed:', error);
      setError("Failed to sync history. Please check if the backend is running.");
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
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-fade-in">
      
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[9px] uppercase tracking-widest mb-1 border border-blue-100 shadow-sm">
          <Sparkles size={10} />
          <span>Intelligent Audit Engine</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none max-w-4xl mx-auto">
          Cubemoons <span className="premium-gradient-text">Audit AI</span>
        </h1>
        
        <p className="text-base text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          High-fidelity, data-driven pitch intelligence generated in seconds.
        </p>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-100 p-6 rounded-2xl shadow-sm animate-shake">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0">
               <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900 uppercase tracking-widest mb-1">Generation Failure</h3>
              <p className="text-xs text-red-700 font-medium opacity-80">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div id="audit-form-section" className="scroll-mt-32">
        {isSubmitting ? (
          <div className="max-w-4xl mx-auto">
             <ProgressTracker />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
             <div className="glass-card p-6 md:p-10 rounded-[2.5rem]">
                <AuditForm onSubmit={handleGenerate} isSubmitting={isSubmitting} />
             </div>
          </div>
        )}
      </div>

      {/* HISTORY SECTION */}
      <div className="space-y-10">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
            <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Audit History</h2>
               <p className="text-slate-500 font-medium">Manage and track all generated audits from your organization.</p>
            </div>
            <button 
              onClick={fetchHistory}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
            >
               <RefreshCw size={16} className={loadingHistory ? 'animate-spin' : ''} />
               Refresh Sync
            </button>
         </div>

         {loadingHistory ? (
           <div className="py-24 text-center">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full mx-auto animate-spin mb-6"></div>
              <p className="text-slate-400 font-semibold tracking-widest uppercase text-xs">Syncing Cloud Data...</p>
           </div>
         ) : history.length > 0 ? (
           <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-blue-900/5">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50/30 border-b border-slate-100">
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identifier</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Company</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Generation Date</th>
                     {isAdmin && <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Specialist</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-all group">
                        <td className="px-8 py-7">
                           <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">{item.client_id}</span>
                        </td>
                        <td className="px-8 py-7">
                           <div className="text-sm font-extrabold text-slate-800 tracking-tight">{item.company_name}</div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                              <Calendar size={14} className="text-slate-400" />
                              {item.date}
                           </div>
                        </td>
                        {isAdmin && (
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                   {item.generator_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{item.generator_name}</span>
                             </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
         ) : (
           <div className="glass-card rounded-[2rem] p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                 <FileText size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Audits Found</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">Start by generating your first audit report using the form above.</p>
           </div>
         )}
      </div>

      
    </div>
  );
}

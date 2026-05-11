import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, Target, Briefcase, FileText, Settings, Users, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const INDUSTRIES = ["", "Healthcare", "Education", "E-commerce", "FinTech", "Real Estate", "SaaS/Startup", "Manufacturing", "Other"];
const SIZES = ["", "1-10", "11-50", "51-200", "200+", "Unknown"];
const BUDGETS = ["", "<1L", "1-5L", "5-20L", "20L+", "Unknown"];
const DEAL_TYPES = ["", "Project", "Retainer", "One-time", "Consulting"];

export default function AuditForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    company_name: '', website_url: '', industry: '', company_size: '', location: '', linkedin_url: '', social_media_handles: '',
    pain_points: '', requirements: '', current_tools: '', budget_range: '', deal_type: '', timeline: '',
    competitors: '', meeting_notes: '', proposed_solution: '', generate_flowchart: true
  });

  const [expandedSection, setExpandedSection] = useState('A');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const SectionHeader = ({ id, title, icon: Icon }) => (
    <div 
      className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-300 ${expandedSection === id ? 'bg-blue-50/50 border-blue-100 rounded-t-[1.5rem]' : 'bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 shadow-sm'}`}
      onClick={() => setExpandedSection(expandedSection === id ? null : id)}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expandedSection === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
          <Icon size={18} />
        </div>
        <h3 className={`font-bold text-base tracking-tight transition-colors ${expandedSection === id ? 'text-blue-600' : 'text-slate-700'}`}>{title}</h3>
      </div>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${expandedSection === id ? 'rotate-180 bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
        <ChevronDown size={14} />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      
      {/* SECTION A */}
      <div className="rounded-[1.5rem] overflow-hidden">
        <SectionHeader id="A" title="Company Information" icon={Building2} />
        <AnimatePresence>
          {expandedSection === 'A' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-x border-b border-slate-100 rounded-b-[1.5rem]">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-sm" placeholder="e.g. Cubemoons AI" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Website URL</label>
                  <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-sm" placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-sm">
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i || "Select Industry"}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-sm" placeholder="e.g. Remote / Mumbai" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION B */}
      <div className="rounded-[1.5rem] overflow-hidden">
        <SectionHeader id="B" title="Strategy & Pain Points" icon={Target} />
        <AnimatePresence>
          {expandedSection === 'B' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-x border-b border-slate-100 rounded-b-[1.5rem]">
              <div className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Critical Pain Points</label>
                  <textarea name="pain_points" value={formData.pain_points} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-sm" placeholder="What's hurting their growth?" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Core Requirements</label>
                  <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-sm" placeholder="What results do they expect?" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Budget Allocation</label>
                    <select name="budget_range" value={formData.budget_range} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium outline-none text-sm">
                      {BUDGETS.map(b => <option key={b} value={b}>{b || "Select Budget Range"}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Deal Structure</label>
                    <select name="deal_type" value={formData.deal_type} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium outline-none text-sm">
                      {DEAL_TYPES.map(d => <option key={d} value={d}>{d || "Select Engagement Type"}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION C */}
      <div className="rounded-[1.5rem] overflow-hidden">
        <SectionHeader id="C" title="Additional Context" icon={FileText} />
        <AnimatePresence>
          {expandedSection === 'C' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-x border-b border-slate-100 rounded-b-[1.5rem]">
              <div className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Industry Competitors</label>
                  <input type="text" name="competitors" value={formData.competitors} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium outline-none text-sm" placeholder="e.g. Competitor A, Competitor B" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Meeting Insights</label>
                  <textarea name="meeting_notes" value={formData.meeting_notes} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-sm" placeholder="Key takeaways..." />
                </div>
                
                <div className="bg-blue-50/50 p-4 rounded-2xl flex items-center gap-4 border border-blue-100">
                  <div className="relative flex items-center">
                    <input type="checkbox" id="generate_flowchart" name="generate_flowchart" checked={formData.generate_flowchart} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500 transition-all" />
                  </div>
                  <label htmlFor="generate_flowchart" className="text-slate-700 font-bold text-xs">Include Intelligent Architecture Flowchart</label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-8">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-5 rounded-2xl text-sm font-black text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-[0.2em] ${isSubmitting ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-95'}`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate Audit Report</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

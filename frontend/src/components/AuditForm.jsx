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
      className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-300 ${expandedSection === id ? 'bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-t-[1.5rem]' : 'bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 shadow-sm'}`}
      onClick={() => setExpandedSection(expandedSection === id ? null : id)}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expandedSection === id ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30' : 'bg-white text-slate-500 border border-slate-200/60'}`}>
          <Icon size={18} />
        </div>
        <h3 className={`font-bold text-base tracking-tight transition-colors ${expandedSection === id ? 'text-[#7C3AED]' : 'text-slate-700'}`}>{title}</h3>
      </div>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${expandedSection === id ? 'rotate-180 bg-[#7C3AED] border-[#7C3AED] text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
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
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-x border-b border-slate-200/80 rounded-b-[1.5rem]">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm" placeholder="e.g. Impression AI" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Website URL</label>
                  <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm" placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm">
                    {INDUSTRIES.map(i => <option key={i} value={i} className="bg-white text-slate-900">{i || "Select Industry"}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm" placeholder="e.g. Remote / Mumbai" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">LinkedIn Profile URL</label>
                  <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm" placeholder="https://linkedin.com/company/..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Social Media Links / Handles</label>
                  <input type="text" name="social_media_handles" value={formData.social_media_handles} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm" placeholder="e.g. Instagram link, Facebook link" />
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
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-x border-b border-slate-200/80 rounded-b-[1.5rem]">
              <div className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Critical Pain Points</label>
                  <textarea name="pain_points" value={formData.pain_points} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm" placeholder="What's hurting their growth?" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Core Requirements</label>
                  <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm" placeholder="What results do they expect?" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Budget Allocation</label>
                    <select name="budget_range" value={formData.budget_range} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm">
                      {BUDGETS.map(b => <option key={b} value={b} className="bg-white text-slate-900">{b || "Select Budget Range"}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Deal Structure</label>
                    <select name="deal_type" value={formData.deal_type} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm">
                      {DEAL_TYPES.map(d => <option key={d} value={d} className="bg-white text-slate-900">{d || "Select Engagement Type"}</option>)}
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
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-x border-b border-slate-200/80 rounded-b-[1.5rem]">
              <div className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Industry Competitors</label>
                  <input type="text" name="competitors" value={formData.competitors} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm" placeholder="e.g. Competitor A, Competitor B" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Meeting Insights</label>
                  <textarea name="meeting_notes" value={formData.meeting_notes} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] rounded-xl outline-none font-medium text-sm" placeholder="Key takeaways..." />
                </div>
                
                <div className="bg-[#7C3AED]/5 p-4 rounded-2xl flex items-center gap-4 border border-[#7C3AED]/20">
                  <div className="relative flex items-center">
                    <input type="checkbox" id="generate_flowchart" name="generate_flowchart" checked={formData.generate_flowchart} onChange={handleChange} className="w-5 h-5 text-[#7C3AED] rounded-lg border-slate-300 bg-slate-50 focus:ring-[#7C3AED] transition-all" />
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
          className={`w-full py-5 rounded-2xl text-sm font-black text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-[0.2em] ${isSubmitting ? 'bg-[#222] text-[#A6A6A6] cursor-not-allowed' : 'bg-gradient-to-r from-[#7C3AED] to-purple-800 hover:shadow-[#7C3AED]/40 hover:-translate-y-1 active:scale-95'}`}
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

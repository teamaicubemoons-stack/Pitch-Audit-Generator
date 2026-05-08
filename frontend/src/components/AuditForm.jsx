import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, Target, Briefcase, FileText, Settings, Users, ChevronDown, ChevronUp } from 'lucide-react';

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
      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${expandedSection === id ? 'bg-brand-dark text-white rounded-t-xl' : 'bg-gray-50 hover:bg-gray-100 rounded-xl'}`}
      onClick={() => setExpandedSection(expandedSection === id ? null : id)}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={expandedSection === id ? 'text-brand-orange' : 'text-gray-500'} />
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      {expandedSection === id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      
      {/* SECTION A */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <SectionHeader id="A" title="Section A: Company Information" icon={Building2} />
        <AnimatePresence>
          {expandedSection === 'A' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all" placeholder="e.g. ABC Pharma" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all">
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i || "Select Industry"}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all" placeholder="e.g. Mumbai, India" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                  <select name="company_size" value={formData.company_size} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all">
                    {SIZES.map(s => <option key={s} value={s}>{s || "Select Size"}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Social Media Handles</label>
                  <input type="text" name="social_media_handles" value={formData.social_media_handles} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all" placeholder="@instagram, etc" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION B */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <SectionHeader id="B" title="Section B: Requirements & Pain Points" icon={Target} />
        <AnimatePresence>
          {expandedSection === 'B' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pain Points (What's hurting their business?)</label>
                  <textarea name="pain_points" value={formData.pain_points} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple transition-all" placeholder="e.g. Manual data entry, low website conversions..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (What do they want?)</label>
                  <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple transition-all" placeholder="e.g. An automated patient booking system..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                    <select name="budget_range" value={formData.budget_range} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple transition-all">
                      {BUDGETS.map(b => <option key={b} value={b}>{b || "Select Budget"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deal Type</label>
                    <select name="deal_type" value={formData.deal_type} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple transition-all">
                      {DEAL_TYPES.map(d => <option key={d} value={d}>{d || "Select Deal Type"}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION C */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <SectionHeader id="C" title="Section C: Additional Context" icon={FileText} />
        <AnimatePresence>
          {expandedSection === 'C' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Competitors</label>
                  <input type="text" name="competitors" value={formData.competitors} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple transition-all" placeholder="Comma separated names" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Solution (Broad idea)</label>
                  <textarea name="proposed_solution" value={formData.proposed_solution} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple transition-all" placeholder="e.g. Build a custom React dashboard..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Notes</label>
                  <textarea name="meeting_notes" value={formData.meeting_notes} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple transition-all" placeholder="Dump raw notes here..." />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 border border-gray-200">
                  <input type="checkbox" id="generate_flowchart" name="generate_flowchart" checked={formData.generate_flowchart} onChange={handleChange} className="w-5 h-5 text-brand-purple rounded border-gray-300 focus:ring-brand-purple" />
                  <label htmlFor="generate_flowchart" className="text-gray-700 font-medium">Auto-generate Architecture Flowchart</label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4 pb-12">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-brand-orange to-brand-purple hover:opacity-90 transform hover:-translate-y-1'}`}
        >
          {isSubmitting ? 'Generating Audit...' : 'Generate Pitch Audit Document'}
        </button>
      </div>
    </form>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import VisualFlowchart from './VisualFlowchart';
import { ImpressionLogo } from './ImpressionLogo';
import {
  Download, Shield, Printer, Loader2, Sparkles, Cpu, Briefcase, Globe, Mail, Phone, Calendar, Instagram, MapPin, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, ChevronLeft, ChevronRight, Check, MessageSquare, Youtube, ShoppingBag, Activity
} from 'lucide-react';

const Slide = ({ title, category, slideNumber, dark, children }) => {
  return (
    <div className={`slide-card w-full aspect-[297/210] rounded-[2rem] border shadow-xl p-10 flex flex-col justify-between relative overflow-hidden mb-8 transition-all duration-300 hover:shadow-2xl ${dark ? 'bg-slate-950 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200/80'}`}>
      
      {/* Top Gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7C3AED] via-purple-500 to-[#8B5CF6]"></div>

      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-[0.08] pointer-events-none ${dark ? 'bg-[#7C3AED]/40' : 'bg-[#7C3AED]/30'}`}></div>
      <div className={`absolute -left-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-[0.05] pointer-events-none ${dark ? 'bg-purple-900/30' : 'bg-purple-400/20'}`}></div>

      {/* Slide Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center">
            <ImpressionLogo className={`h-5 w-auto ${dark ? 'invert' : ''}`} />
          </div>
          <span className="h-4 w-px bg-slate-200"></span>
          <span className={`text-[9px] font-black tracking-[0.2em] uppercase ${dark ? 'text-slate-400' : 'text-[#7C3AED]'}`}>{category}</span>
        </div>
        {title && <h2 className={`text-base font-black tracking-tight uppercase m-0 font-display ${dark ? 'text-white' : 'text-slate-950'}`}>{title}</h2>}
      </div>

      {/* Slide Body */}
      <div className="flex-grow py-4 relative z-10 flex flex-col justify-center overflow-hidden">
        {children}
      </div>

      {/* Slide Footer */}
      <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-[9px] font-black uppercase tracking-widest relative z-10 text-slate-400">
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="text-[#7C3AED]" />
          <span>Impression &bull; Pitch Audit AI</span>
        </div>
        <div>Slide {slideNumber} of 11</div>
      </div>
    </div>
  );
};

export default function AuditPreview({ auditData, pdfUrl }) {
  const { audit_sections: a, flowchart_data } = auditData || {};
  const [isExporting, setIsExporting] = useState(false);

  if (!a) return null;

  const meta = a.audit_meta || {};
  const s2 = a.company_overview || {};
  const s3_agenda = a.agenda || [];
  const brand = a.brand_identity || {};
  const competitors = a.competitor_analysis || {};
  const usps = a.unique_selling_points || [];
  const gaps = a.current_gaps || {};
  const metrics = a.metrics_status || [];
  const automation = a.automation_tracking || [];
  const whatsapp = a.whatsapp_setup || {};
  const cta = a.cta || {};

  const getAgendaIcon = (item) => {
    const text = item.toUpperCase();
    if (text.includes("BRAND")) return <Icons.Palette size={16} />;
    if (text.includes("COMPETIT")) return <Icons.TrendingUp size={16} />;
    if (text.includes("USP") || text.includes("SELLING")) return <Icons.Sparkles size={16} />;
    if (text.includes("GAP") || text.includes("MINDSET")) return <Icons.AlertCircle size={16} />;
    if (text.includes("METRIC") || text.includes("STATUS") || text.includes("MATRIX")) return <Icons.Activity size={16} />;
    if (text.includes("AUTOMAT") || text.includes("CRM") || text.includes("TRACK")) return <Icons.Cpu size={16} />;
    if (text.includes("WHATSAPP") || text.includes("MESSAG")) return <Icons.MessageSquare size={16} />;
    return <Icons.CheckCircle2 size={16} />;
  };

  const splitUSP = (uspText) => {
    if (uspText.includes("**") || uspText.includes(":")) {
      const cleaned = uspText.replace(/\*\*/g, '');
      const parts = cleaned.split(':');
      if (parts.length >= 2) {
        return { title: parts[0].trim(), desc: parts.slice(1).join(':').trim() };
      }
    }
    return { title: "Strategic Edge", desc: uspText };
  };

  const getUspIcon = (idx) => {
    const icons = [
      <Icons.Award size={18} />,
      <Icons.MapPin size={18} />,
      <Icons.TrendingUp size={18} />,
      <Icons.Sliders size={18} />,
      <Icons.Clock size={18} />,
      <Icons.ShieldCheck size={18} />
    ];
    return icons[idx % icons.length];
  };

  const renderCompetitorBadge = (text) => {
    const val = (text || "").toLowerCase();
    if (val.includes("none") || val.includes("not set") || val.includes("critical") || val.includes("no") || val.includes("missing")) {
      return (
        <span className="flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-650 border border-red-200">
          <Icons.AlertTriangle size={10} className="shrink-0" />
          {text}
        </span>
      );
    }
    if (val.includes("active") || val.includes("followers") || val.includes("yes") || val.includes("setup") || val.includes("automated")) {
      return (
        <span className="flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Icons.CheckCircle2 size={10} className="shrink-0" />
          {text}
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-650 border border-slate-200">
        <Icons.HelpCircle size={10} className="shrink-0" />
        {text}
      </span>
    );
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const slideElements = document.querySelectorAll('.slide-card');
      const pdfWidth = 1024;
      const pdfHeight = 724;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [pdfWidth, pdfHeight],
        compress: true
      });

      for (let i = 0; i < slideElements.length; i++) {
        const slide = slideElements[i];
        const canvas = await html2canvas(slide, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFFFF',
          width: pdfWidth,
          height: pdfHeight
        });
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        if (i > 0) {
          pdf.addPage([pdfWidth, pdfHeight], 'landscape');
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      pdf.save(`Impression_Audit_${meta.client_name || 'Report'}.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Pitch Audit Report</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} className="text-[#7C3AED]" />
            Impression Pitch Deck Presentation
          </p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-3 px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-bold shadow-xl shadow-[#7C3AED]/20 hover:bg-[#6D28D9] transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
          {isExporting ? 'Generating Deck PDF...' : 'Export Deck PDF'}
        </button>
      </div>

      <div id="audit-report-content" className="space-y-12">
        
        {/* Slide 1: Cover */}
        <div className="slide-card w-full aspect-[297/210] rounded-[2rem] border border-slate-200/80 shadow-2xl flex relative overflow-hidden bg-white text-slate-800 mb-8 transition-all hover:shadow-[#7C3AED]/10">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#7C3AED] via-purple-500 to-[#8B5CF6] z-20"></div>
          
          {/* Left Panel: Dark Brand Accent */}
          <div className="w-[38%] bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-10 flex flex-col justify-between relative overflow-hidden text-white border-r border-slate-800">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full blur-3xl bg-[#7C3AED]/20 pointer-events-none"></div>
            
            <div className="z-10 flex items-center gap-3">
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center">
                <ImpressionLogo className="h-8 w-auto invert" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-200">Impression AI</span>
            </div>

            <div className="z-10 my-auto">
              <span className="text-[9px] font-black text-purple-400 tracking-[0.4em] uppercase block mb-3">INTERNAL STRATEGY</span>
              <h2 className="text-2xl font-black font-display tracking-tight uppercase leading-snug text-white">
                Digital Growth <br/>
                <span className="text-[#C084FC]">&amp; Transformation</span>
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-[#7C3AED] to-purple-400 rounded-full mt-4"></div>
            </div>

            <div className="z-10 border-t border-white/10 pt-6 space-y-2 text-[8px] font-black text-slate-400 tracking-widest uppercase">
              <div>REPORT ID: <span className="text-white ml-1 font-bold">{meta.report_id}</span></div>
              <div>DATE: <span className="text-white ml-1 font-bold">{meta.audit_date}</span></div>
              <div>PREPARED BY: <span className="text-[#C084FC] ml-1 font-bold">IMPRESSION.PR</span></div>
            </div>
          </div>

          {/* Right Panel: Client Showcase */}
          <div className="w-[62%] p-12 flex flex-col justify-between relative overflow-hidden bg-slate-50/30">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute -right-20 -top-20 w-[350px] h-[350px] bg-[#7C3AED]/8 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-end z-10">
              <span className="text-[9px] font-black text-[#7C3AED] uppercase tracking-[0.2em] bg-purple-100/60 border border-purple-200/50 px-3.5 py-1.5 rounded-full">
                {meta.industry || "Strategic Audit"}
              </span>
            </div>

            <div className="z-10 flex-grow flex flex-col justify-center py-6">
              <span className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-3 block">AUDIT REPORT FOR</span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-slate-900 leading-tight font-display break-words">
                {meta.client_name}
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-4">
                Analysis of Brand Identity, Competitors, and Automation Opportunities
              </p>
            </div>

            <div className="z-10 border-t border-slate-100/80 pt-6 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"></span>
                <span>Raipur Hub</span>
              </div>
              <div className="text-[#7C3AED]">CONFIDENTIAL DOCUMENT</div>
            </div>
          </div>
        </div>

        {/* Slide 2: Company Overview */}
        <Slide title="Company Overview" category="Context" slideNumber={2}>
          <div className="grid grid-cols-12 gap-8 h-full items-stretch py-1">
            <div className="col-span-6 flex flex-col justify-between">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/40 p-6 rounded-2xl border border-slate-200/60 shadow-sm flex-grow flex flex-col justify-center mb-4 relative overflow-hidden">
                <div className="absolute left-4 top-2 text-[#7C3AED]/20 font-serif text-7xl select-none leading-none pointer-events-none">“</div>
                <h3 className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest mb-3 relative z-10">Where It All Began</h3>
                <p className="text-[14px] font-medium text-slate-650 leading-relaxed relative z-10 italic pl-4">
                  {s2.about}
                </p>
              </div>
              <div className="p-4 bg-purple-50/50 border border-purple-100/80 rounded-2xl shadow-sm">
                <h4 className="text-[10px] font-black text-[#7C3AED] uppercase tracking-wider mb-1">Business Concept</h4>
                <p className="text-xs font-bold text-slate-800">{s2.business_type}</p>
              </div>
            </div>

            <div className="col-span-6 flex flex-col justify-between border-l border-slate-100 pl-8 space-y-3">
              <div className="flex gap-4 items-center p-4 bg-white border border-slate-150 rounded-2xl shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                <div className="p-3 rounded-xl bg-purple-50 text-[#7C3AED] shrink-0 border border-purple-100">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Location Hub</div>
                  <div className="text-sm font-bold text-slate-800">{s2.location_text}</div>
                </div>
              </div>

              <div className="flex gap-4 items-center p-4 bg-white border border-slate-150 rounded-2xl shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Products / Services</div>
                  <div className="text-sm font-bold text-slate-800">{s2.products}</div>
                </div>
              </div>

              <div className="flex gap-4 items-center p-4 bg-white border border-slate-150 rounded-2xl shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                <div className="p-3 rounded-xl bg-pink-50 text-pink-600 shrink-0 border border-pink-100">
                  <Globe size={18} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Current Presence</div>
                  <div className="text-sm font-bold text-slate-800">{s2.digital_presence}</div>
                </div>
              </div>
            </div>
          </div>
          
          {s2.current_gap_banner && (
            <div className="mt-4 bg-[#FEF2F2] border border-red-200 rounded-2xl px-6 py-2.5 flex items-center justify-center gap-3 shrink-0 shadow-sm">
              <AlertTriangle size={15} className="text-red-650 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-red-700">
                Current Digital Reality: {s2.current_gap_banner}
              </span>
            </div>
          )}
        </Slide>

        {/* Slide 3: Agenda */}
        <Slide title="The Game Plan" category="Agenda" slideNumber={3}>
          <div className="relative max-w-4xl mx-auto py-2">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 border-t-2 border-dashed border-slate-200 -translate-y-1/2 hidden md:block"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {(s3_agenda || []).map((item, idx) => (
                <div key={idx} className="flex flex-col justify-between p-4 bg-white border border-slate-200/80 rounded-2xl h-36 hover:border-[#7C3AED]/50 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="text-slate-400 group-hover:text-[#7C3AED] transition-colors">
                      {getAgendaIcon(item)}
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-700 tracking-wide uppercase group-hover:text-slate-900 transition-colors">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Slide>

        {/* Slide 4: Brand Identity */}
        <Slide title="Brand Identity & Colour Direction" category="Identity" slideNumber={4}>
          <div className="grid grid-cols-12 gap-8 items-stretch h-full py-1">
            <div className="col-span-6 flex flex-col justify-between">
              <div className="border-l-4 border-l-[#7C3AED] bg-slate-50 p-5 rounded-r-2xl flex-grow flex flex-col justify-center mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Core Identity & Purpose</h3>
                <p className="text-[15px] font-semibold text-slate-700 leading-relaxed italic">
                  "{brand.purpose}"
                </p>
              </div>
              
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Personality Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {(brand.personality || []).map((p, i) => (
                    <span key={i} className="px-3.5 py-1.5 bg-[#7C3AED]/5 text-[#7C3AED] border border-[#7C3AED]/20 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#7C3AED]/10 transition-colors">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-6 border-l border-slate-100 pl-8 flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Color Archetype</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(brand.suggested_colors || []).map((color, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-white border border-slate-150 rounded-xl shadow-sm hover:shadow-md transition-all">
                      <div 
                        className="w-10 h-10 rounded-full border border-slate-200 shadow-sm shrink-0" 
                        style={{ backgroundColor: color.value }}
                      />
                      <div>
                        <div className="text-[11px] font-black text-slate-800 leading-tight">{color.name}</div>
                        <div className="text-[9px] font-black text-slate-400 font-mono uppercase mt-0.5 tracking-wider">{color.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Added a dynamic aesthetic style summary to balance the slide */}
              <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#7C3AED]" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Aesthetic Tone Match</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-purple-100 text-[#7C3AED] px-2 py-0.5 rounded">Premium &amp; Modern</span>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 5: Competitor Benchmarking */}
        <Slide title="Competitor Benchmarking" category="Competition" slideNumber={5}>
          <div className="overflow-hidden border border-slate-200/80 rounded-2xl shadow-sm my-auto">
            <table className="w-full border-collapse text-left bg-white">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-wider text-slate-500">Brand Entity</th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5"><Instagram size={12} className="text-[#E1306C]" /> Instagram</span>
                  </th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5"><Globe size={12} className="text-blue-500" /> Website Hub</span>
                  </th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5"><MessageSquare size={12} className="text-emerald-500" /> WhatsApp</span>
                  </th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5"><Youtube size={12} className="text-red-500" /> YouTube</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(competitors.comparison_table || []).map((row, idx) => {
                  const isClient = idx === 0;
                  return (
                    <tr 
                      key={idx} 
                      className={`border-b border-slate-100 last:border-0 ${isClient ? 'bg-[#7C3AED]/5 font-bold border-l-4 border-l-[#7C3AED]' : 'hover:bg-slate-50/40'}`}
                    >
                      <td className="py-3.5 px-5 text-xs font-black text-slate-800 flex items-center gap-2">
                        {isClient && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse"></span>}
                        {row.entity}
                        {isClient && <span className="text-[7.5px] bg-[#7C3AED] text-white px-1.5 py-0.5 rounded font-black tracking-widest uppercase">You</span>}
                      </td>
                      <td className="py-3.5 px-5 text-xs font-bold text-slate-650">{renderCompetitorBadge(row.instagram)}</td>
                      <td className="py-3.5 px-5 text-xs font-bold text-slate-650">{renderCompetitorBadge(row.text_website || row.website)}</td>
                      <td className="py-3.5 px-5 text-xs font-bold text-slate-650">{renderCompetitorBadge(row.text_whatsapp || row.whatsapp)}</td>
                      <td className="py-3.5 px-5 text-xs font-bold text-slate-650">{renderCompetitorBadge(row.text_youtube || row.youtube)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Slide>

        {/* Slide 6: USPs */}
        <Slide title="Unique Selling Points" category="USPs" slideNumber={6}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-2">
            {(usps || []).slice(0, 6).map((usp, idx) => {
              const { title, desc } = splitUSP(usp);
              return (
                <div key={idx} className="flex flex-col p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-[#7C3AED]/40 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0 border border-purple-100 mb-3 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                    {getUspIcon(idx)}
                  </div>
                  <h4 className="text-xs font-black text-slate-850 uppercase tracking-wide mb-1">{title}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </Slide>

        {/* Slide 7: Current Gaps & Questions */}
        <Slide title="Current Gaps & Buyer Mindset" category="Gaps" slideNumber={7}>
          <div className="grid grid-cols-12 gap-8 items-stretch h-full py-1">
            <div className="col-span-6 flex flex-col gap-3 justify-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Identified Inefficiencies</h3>
              <div className="space-y-2.5 overflow-y-auto max-h-[250px] pr-2">
                {(gaps.gap_list || []).map((gap, i) => (
                  <div key={i} className="p-3.5 bg-red-50/30 border border-red-100 rounded-xl flex gap-3 items-start">
                    <Icons.XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[11px] font-black text-red-700 uppercase tracking-wider">{gap.title}</h4>
                        <span className="text-[7px] font-black uppercase bg-red-100 text-red-700 px-1 py-0.2 rounded">High Impact</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-normal mt-0.5">{gap.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-6 border-l border-slate-100 pl-8 flex flex-col justify-center space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">The Messaging Mismatch</h3>
              
              {/* Chat Thread UI mockup */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col bg-[#ECE5DD] shadow-sm max-w-sm mx-auto w-full h-[180px]">
                {/* Simulated Header */}
                <div className="bg-[#075E54] text-white px-3 py-1.5 text-[9px] font-bold flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>Simulated B2B Buyer Query Thread</span>
                </div>
                
                {/* Chat Bubbles */}
                <div className="p-3 flex-grow flex flex-col justify-between text-[10px]">
                  {/* Customer message (What Buyers Ask) */}
                  <div className="bg-white text-slate-700 p-2 rounded-lg rounded-tl-none shadow-sm self-start max-w-[85%]">
                    <span className="block text-[7px] font-black text-purple-600 uppercase mb-0.5">Wholesale Buyer</span>
                    "{gaps.buyer_questions}"
                  </div>

                  {/* Outgoing brand mismatch response (What We Show) */}
                  <div className="bg-[#DCF8C6] text-slate-700 p-2 rounded-lg rounded-tr-none shadow-sm self-end max-w-[85%]">
                    <span className="block text-[7px] font-black text-emerald-700 uppercase mb-0.5">Your Current Response</span>
                    "{gaps.current_messaging}"
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-100 p-3 rounded-xl text-center">
                <p className="text-[10px] font-black text-[#7C3AED] uppercase tracking-wider">
                  Opportunity: Resolve buyer queries automatically on first contact
                </p>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 8: Metric & Status Matrix */}
        <Slide title="Metric & Status Matrix" category="Matrix" slideNumber={8}>
          <div className="grid grid-cols-4 gap-4 py-1">
            {(metrics || []).map((item, idx) => {
              let progress = 90;
              let bgColor = "bg-slate-100";
              let activeColor = "bg-slate-400";
              
              const val = (item.status || "").toLowerCase();
              if (val.includes("critical") || val.includes("missing")) {
                progress = 25;
                activeColor = "bg-red-500";
                bgColor = "bg-red-50";
              } else if (val.includes("weak")) {
                progress = 45;
                activeColor = "bg-amber-500";
                bgColor = "bg-amber-50";
              } else if (val.includes("needs work") || val.includes("improvement")) {
                progress = 65;
                activeColor = "bg-blue-500";
                bgColor = "bg-blue-50";
              } else {
                progress = 90;
                activeColor = "bg-emerald-500";
                bgColor = "bg-emerald-50";
              }

              return (
                <div key={idx} className="flex flex-col justify-between p-4 bg-white border border-slate-200/80 rounded-2xl h-[125px] hover:shadow-md hover:border-[#7C3AED]/30 transition-all group relative overflow-hidden">
                  <div className="absolute right-3 top-3">
                    <Activity size={12} className="text-slate-300 group-hover:text-[#7C3AED] transition-colors" />
                  </div>
                  
                  <span className="text-xs font-black text-slate-750 leading-tight group-hover:text-slate-900 transition-colors pr-3">{item.metric}</span>
                  
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                        <span>Health Indicator</span>
                        <span className={activeColor.replace('bg-', 'text-')}>{progress}%</span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full ${bgColor}`}>
                        <div className={`h-full rounded-full ${activeColor}`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: item.color }}></span>
                      <span 
                        className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider shadow-sm text-center flex-grow"
                        style={{ backgroundColor: item.color + '10', color: item.color, border: `1px solid ${item.color}25` }}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Slide>

        {/* Slide 9: Systems & CRM Architecture */}
        <Slide title="Systems & CRM Architecture" category="Automation" slideNumber={9}>
          {flowchart_data ? (
            <div className="grid grid-cols-12 gap-6 items-stretch h-full py-1">
              <div className="col-span-4 flex flex-col justify-center gap-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Lead Automation</h3>
                {(automation || []).map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#7C3AED]/30 transition-all">
                    <h4 className="text-[11px] font-black text-[#7C3AED] uppercase tracking-wider mb-1">{item.title}</h4>
                    <p className="text-[10px] font-medium text-slate-500 leading-normal">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="col-span-8 border-l border-slate-100 pl-6 flex items-center justify-center overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-200/50">
                <div className="w-full scale-[0.80] origin-center">
                  <VisualFlowchart data={flowchart_data} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8 h-full items-center py-4">
              <div className="flex flex-col gap-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Automation</h3>
                {(automation || []).map((item, idx) => (
                  <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-black text-[#7C3AED] uppercase tracking-wider mb-2">{item.title}</h4>
                    <p className="text-sm font-semibold text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 border border-[#7C3AED]/15 rounded-2xl flex flex-col justify-center h-full shadow-sm">
                <h4 className="text-xs font-black text-slate-800 uppercase mb-4 flex items-center gap-2 font-display">
                  <Cpu size={18} className="text-[#7C3AED]" /> System Infrastructure Benefits
                </h4>
                <ul className="space-y-4 pl-0 text-xs text-slate-500 font-semibold list-none">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                    <span className="mt-0.5">Consolidates lead inquiries from all social channels into one source of truth.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                    <span className="mt-0.5">Removes manual follow-up delays, decreasing lead response time from hours to seconds.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                    <span className="mt-0.5">Provides direct analysis of customer conversion rate and acquisition metrics.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </Slide>

        {/* Slide 10: WhatsApp Platform Setup */}
        <Slide title="WhatsApp Platform Setup" category="Messaging" slideNumber={10}>
          <div className="grid grid-cols-12 gap-8 items-stretch h-full py-1">
            <div className="col-span-7 flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{whatsapp.title || "WhatsApp Setup"}</h3>
                <ul className="space-y-2.5 pl-0">
                  {(whatsapp.bullets || []).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs font-semibold text-slate-700 bg-white border border-slate-150 p-2.5 rounded-xl shadow-sm">
                      <div className="p-1 rounded-full bg-emerald-100 text-emerald-650 shrink-0 mt-0.5">
                        <Check size={10} className="stroke-[3]" />
                      </div>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl shadow-sm mt-3">
                <h4 className="text-[9px] font-black text-emerald-800 uppercase tracking-wider mb-1">Core Automation Benefit</h4>
                <p className="text-[11px] font-bold text-emerald-700 leading-normal">{whatsapp.benefit}</p>
              </div>
            </div>

            <div className="col-span-5 border-l border-slate-100 pl-8 flex flex-col justify-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Interactive Chatbot Demo</h3>
              
              {/* WhatsApp Phone Mockup (Pure CSS) */}
              <div className="relative mx-auto w-64 h-[250px] bg-slate-900 rounded-[2rem] border-4 border-slate-800 shadow-xl overflow-hidden flex flex-col">
                {/* Phone Speaker & Camera */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-800 rounded-full z-20 flex items-center justify-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                  <div className="w-6 h-0.5 rounded-full bg-slate-700"></div>
                </div>
                
                {/* Screen Header */}
                <div className="bg-[#075E54] text-white pt-5 pb-1.5 px-3 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[8px]">I</div>
                    <div>
                      <div className="text-[8px] font-black leading-tight uppercase tracking-wider">{meta.client_name || 'Brand'} Bot</div>
                      <div className="text-[6px] text-emerald-300">Online</div>
                    </div>
                  </div>
                  <Icons.Phone size={8} className="opacity-80" />
                </div>
                
                {/* Chat body */}
                <div className="flex-grow bg-[#ECE5DD] p-2.5 space-y-2 overflow-y-auto flex flex-col justify-start text-[8px] leading-normal">
                  {/* Customer message */}
                  <div className="self-start bg-white text-slate-750 p-2 rounded-lg rounded-tl-none shadow-sm max-w-[85%]">
                    <div className="font-bold text-[6px] text-purple-600 mb-0.5">Customer</div>
                    Hi, send wholesale catalog &amp; prices
                  </div>
                  {/* Bot Response */}
                  <div className="self-end bg-[#DCF8C6] text-slate-750 p-2 rounded-lg rounded-tr-none shadow-sm max-w-[85%]">
                    <div className="font-bold text-[6px] text-emerald-700 mb-0.5">AI Chatbot</div>
                    Hello! Welcome to {meta.client_name || 'our catalog'}. Here is your options:<br/>
                    • View Catalog: <span className="text-blue-600 font-bold underline cursor-pointer">CatalogLink</span><br/>
                    • Wholesale Prices: <span className="text-blue-600 font-bold underline cursor-pointer">PriceList_PDF</span><br/>
                    • Raipur Store Location
                  </div>
                </div>
                
                {/* Message Input bar */}
                <div className="bg-white p-1.5 flex items-center justify-between border-t border-slate-200">
                  <div className="text-[7px] text-slate-400">Type a message...</div>
                  <Icons.Send size={8} className="text-emerald-600" />
                </div>
              </div>

              <div className="text-center mt-2.5">
                <span className="text-[8px] font-black uppercase text-purple-650 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                  Lead automatically tagged in Google Sheet
                </span>
              </div>
            </div>
          </div>
        </Slide>

        {/* Slide 11: Next Recommendations (CTA) */}
        <div className="slide-card w-full aspect-[297/210] rounded-[2rem] border border-slate-800 shadow-2xl p-12 flex flex-col justify-between relative overflow-hidden bg-slate-950 text-white mb-8">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-[#7C3AED]/25 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center border-b border-white/10 pb-4 z-10">
            <div className="flex items-center gap-2">
              <ImpressionLogo className="h-8 w-auto invert brightness-200" />
              <span className="h-px w-6 bg-slate-700"></span>
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Next Action</span>
            </div>
            <div className="text-[10px] font-black tracking-widest uppercase text-[#7C3AED]">Recommended Strategy</div>
          </div>

          <div className="flex-grow flex flex-col justify-center items-center text-center my-6 z-10 py-4">
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#7C3AED] mb-4">LET'S WORK TOGETHER</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight uppercase whitespace-pre-line leading-snug font-display">
              {cta.headline || "SHAPE YOUR DIGITAL PERCEPTION"}
            </h2>
            <p className="max-w-2xl text-xs font-semibold text-slate-355 leading-relaxed mb-6">
              {cta.recommended_next_step}
            </p>
            <button className="bg-gradient-to-r from-[#7C3AED] to-purple-650 hover:from-[#6D28D9] hover:to-purple-750 text-white px-10 py-3 rounded-full font-black text-xs tracking-widest shadow-xl shadow-[#7C3AED]/20 transition-all hover:scale-105 active:scale-95 uppercase">
              Initiate Integration
            </button>
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[9px] font-black uppercase tracking-widest z-10">
            <div className="flex gap-4 text-slate-400">
              <div className="flex items-center gap-1">
                <Icons.Phone size={10} className="text-[#7C3AED]" />
                PHONE: <span className="text-white font-bold ml-0.5">{cta.contact?.phone || "+91-9039034412"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icons.Mail size={10} className="text-[#7C3AED]" />
                EMAIL: <span className="text-white font-bold ml-0.5">{cta.contact?.email || "support@impression.pr"}</span>
              </div>
            </div>
            <div className="text-slate-400">Slide 11 of 11</div>
          </div>
        </div>

      </div>
    </div>
  );
}

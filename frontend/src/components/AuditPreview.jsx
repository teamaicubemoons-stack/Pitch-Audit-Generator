import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import VisualFlowchart from './VisualFlowchart';
import {
  Download, ChevronDown, ChevronUp, Star, Zap, Target,
  TrendingUp, Shield, Users, Clock, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, Printer, Loader2, Sparkles, Cpu, Briefcase, Globe, Mail, Phone, Calendar
} from 'lucide-react';

const Section = ({ id, icon: Icon, title, accent, children, forceOpen }) => {
  const [open, setOpen] = useState(true);
  useEffect(() => { if (forceOpen) setOpen(true); }, [forceOpen]);

  return (
    <div className="Section bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-50">
        <div className="flex items-center gap-4">
          <div className="text-[9px] font-black text-slate-300 tracking-[0.2em] uppercase">{id}</div>
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${accent}10`, color: accent }}>
              <Icon size={16} />
            </div>
            <h2 className="text-base font-bold text-slate-900 m-0 tracking-tight">{title}</h2>
          </div>
        </div>
        {!forceOpen && (
          <button onClick={() => setOpen(o => !o)} className="text-slate-300 hover:text-slate-600 export-hide">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      {(open || forceOpen) && (
        <div className="px-6 pb-8 bg-white/50 backdrop-blur-sm">
          <div className="pt-6">{children}</div>
        </div>
      )}
    </div>
  );
};

const priorityConfig = {
  Critical: { color: '#DC2626', bg: '#FEF2F2', Icon: AlertCircle },
  High:     { color: '#D97706', bg: '#FFFBEB', Icon: AlertTriangle },
  Medium:   { color: '#0066FF', bg: '#F5F3FF', Icon: Target },
};

export default function AuditPreview({ auditData }) {
  const { audit_sections: a, flowchart_data } = auditData;
  const auditRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [forceOpenAll, setForceOpenAll] = useState(false);

  if (!a) return null;

  const meta  = a.audit_meta || {};
  const s1    = a.section_1_executive_summary || {};
  const s2    = a.section_2_company_overview || {};
  const s3    = a.section_3_current_state_analysis || {};
  const s4    = a.section_4_problem_identification || {};
  const s5    = a.section_5_proposed_solution || {};
  const s6    = a.section_6_why_this_solution_works || {};
  const s7    = a.section_7_implementation_roadmap || {};
  const s8    = a.section_8_roi_and_impact || {};
  const s9    = a.section_9_why_cubemoons || {};
  const s10   = a.section_10_next_steps || {};

  const handleDownloadPDF = async () => {
    if (!auditRef.current) return;
    setIsExporting(true);
    setForceOpenAll(true);
    
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(resolve => setTimeout(resolve, 800));
    window.scrollTo(0, 0);

    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const element = auditRef.current;
      const originalWidth = element.offsetWidth;
      const fullHeight = element.scrollHeight + 800; 

      const canvas = await html2canvas(element, {
        scale: 1.8, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#F8FAFC",
        logging: false,
        width: originalWidth,
        height: fullHeight,
        windowWidth: originalWidth,
        windowHeight: fullHeight + 1000,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          const cloneContainer = clonedDoc.querySelector('.audit-capture-container');
          if (cloneContainer) {
            cloneContainer.style.width = `${originalWidth}px`;
            cloneContainer.style.height = `${fullHeight}px`;
            cloneContainer.style.paddingBottom = '400px';
            cloneContainer.style.borderRadius = '0';
            cloneContainer.style.border = 'none';
            cloneContainer.style.overflow = 'visible';
          }
          clonedDoc.querySelectorAll('.export-hide').forEach(el => el.style.display = 'none');
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdfWidth = 210;
      const pdfHeight = ((canvas.height * pdfWidth) / canvas.width) + 10; 

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight - 10, undefined, 'FAST');
      pdf.save(`Strategic_Audit_${meta.client_name?.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error("PDF Export Error:", error);
    } finally {
      setIsExporting(false);
      setForceOpenAll(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 font-['Inter']">
      
      {/* EXPORT FAB */}
      <div className="fixed bottom-8 right-8 z-[100] export-hide">
        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl border-2 ${
            isExporting ? 'bg-slate-900 text-white cursor-wait' : 'bg-white text-slate-900 hover:bg-[#0066FF] hover:text-white border-slate-900'
          }`}
        >
          {isExporting ? <><Loader2 className="animate-spin" size={14} /> EXPORTING...</> : <><Download size={14} /> EXPORT OFFICIAL PDF</>}
        </button>
      </div>

      <div ref={auditRef} className="audit-capture-container space-y-10 bg-slate-50 relative rounded-xl overflow-visible border border-slate-100 pb-20">
        
        {/* BRAND BLOBS */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
           <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-blue-400/30 rounded-full blur-[100px]" />
           <div className="absolute bottom-[10%] left-[-5%] w-[350px] h-[350px] bg-cyan-300/20 rounded-full blur-[80px]" />
        </div>

        {/* COVER - BRANDED */}
        <div className="bg-[#0F172A] rounded-xl overflow-hidden shadow-2xl relative border-b-8 border-[#0066FF]">
          <div className="relative px-12 py-24">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-12">
                <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                   <img 
                    src="/logo.png" 
                    alt="Cubemoons Logo" 
                    className="w-16 h-16 object-contain" 
                    onError={(e) => { e.target.src = "https://cubemoons.com/assets/logo/cubemoons-favicon.svg" }}
                   />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-xl tracking-[0.2em] uppercase">Cubemoons</span>
                  <span className="text-blue-500 font-bold text-[10px] tracking-widest uppercase">Intelligence Unit</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[#00D1FF] text-[10px] font-black uppercase tracking-[0.3em] mb-10">Strategic Intelligence Audit</div>
              <h1 className="text-4xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tight">{meta.client_name || 'Client Audit'}</h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-14 opacity-90 italic border-l-4 border-[#0066FF] pl-8">{s1.headline}</p>
              <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/5">
                 <div><p className="text-slate-500 font-black uppercase tracking-widest mb-2 text-[10px]">Industry</p><p className="text-white font-bold text-base">{meta.industry}</p></div>
                 <div><p className="text-slate-500 font-black uppercase tracking-widest mb-2 text-[10px]">Audit Cycle</p><p className="text-white font-bold text-base">{meta.audit_date}</p></div>
                 <div><p className="text-slate-500 font-black uppercase tracking-widest mb-2 text-[10px]">Status</p><p className="text-[#00D1FF] font-black text-base uppercase tracking-widest">Authenticated</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* 01: EXECUTIVE SUMMARY */}
        <div className="bg-white rounded-xl p-10 lg:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-2 h-full bg-[#0066FF]" />
           <div className="max-w-3xl space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF] shadow-sm"><Target size={20} /></div>
                 <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Executive Summary</h2>
              </div>
              <blockquote className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">"{s1.headline}"</blockquote>
              <p className="text-lg text-slate-600 font-medium leading-relaxed italic">{s1.overview}</p>
              <div className="grid grid-cols-4 gap-6 pt-10 border-t border-slate-50">
                 {s1.key_metrics?.slice(0,4).map((m, i) => (
                   <div key={i} className="group">
                      <div className="text-2xl font-black text-slate-900 group-hover:text-[#0066FF] transition-colors">{m.value}</div>
                      <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{m.label}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 02: POSITIONING */}
        <Section id="01" icon={Users} title="Market Maturity Assessment" accent="#0066FF" forceOpen={forceOpenAll}>
           <div className="grid lg:grid-cols-2 gap-10 py-2">
              <div className="space-y-8">
                 <div><h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Strategic Context</h3><p className="text-lg font-bold text-slate-800 leading-relaxed">{s2.about}</p></div>
                 <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner"><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Value Extraction Model</h3><p className="text-base font-semibold text-slate-600 leading-relaxed">{s2.business_model}</p></div>
              </div>
              <div className="space-y-6">
                 <div className="bg-[#0F172A] rounded-2xl p-10 text-white shadow-2xl relative border-t-4 border-[#00D1FF]">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Digital IQ Score</h3>
                       <div className="text-4xl font-black text-[#00D1FF]">{s2.digital_maturity_score}<span className="text-sm text-slate-500">/10</span></div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-sm font-bold text-blue-50 italic leading-relaxed border-l-4 border-[#00D1FF] pl-6 py-2 bg-white/5 rounded-r-xl">{s2.maturity_assessment}</p>
                    </div>
                 </div>
              </div>
           </div>
        </Section>

        {/* SWOT */}
        <Section id="02" icon={Shield} title="Strategic Risk & Opportunity Matrix" accent="#10B981" forceOpen={forceOpenAll}>
           <div className="grid md:grid-cols-2 gap-6 py-2">
              {[
                { key: 'strengths',    label: 'Strengths',     color: '#0066FF', bg: '#F0F7FF' },
                { key: 'weaknesses',   label: 'Weaknesses',    color: '#EF4444', bg: '#FEF2F2' },
                { key: 'opportunities',label: 'Opportunities', color: '#00D1FF', bg: '#F0FDFF' },
                { key: 'threats',      label: 'Threats',       color: '#F59E0B', bg: '#FFFBEB' },
              ].map(({ key, label, color, bg }) => (
                <div key={key} className="p-8 border border-slate-100 rounded-2xl shadow-sm" style={{ backgroundColor: bg }}>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{label}</h4>
                   </div>
                   <ul className="space-y-3">
                     {(s3[key] || []).map((item, i) => ( <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-700 leading-snug"><CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: color }} /> {item}</li> ))}
                   </ul>
                </div>
              ))}
           </div>
        </Section>

        {/* SOLUTION */}
        <Section id="04" icon={Zap} title="Engineering & Intervention Blueprint" accent="#0066FF" forceOpen={forceOpenAll}>
           <div className="py-2 space-y-8">
              <div className="bg-[#0F172A] rounded-2xl p-10 text-white relative shadow-2xl border-l-8 border-[#0066FF]">
                 <div className="flex items-center gap-2 mb-6"><Sparkles size={16} className="text-[#00D1FF] animate-pulse" /><h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Proprietary Cubemoons Solution</h3></div>
                 <p className="text-2xl font-black leading-tight text-white/95">{s5.solution_overview}</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                 {(s5.solution_components || []).map((c, i) => (
                   <div key={i} className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:border-blue-500/30 transition-all group">
                      <div>
                         <div className="flex justify-between items-start mb-6"><h4 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{c.component_name}</h4><span className="text-[9px] font-black tracking-[0.2em] uppercase bg-blue-50 text-[#0066FF] px-3 py-1 rounded-full border border-blue-100">{c.cubemoons_service}</span></div>
                         <p className="text-sm font-bold text-slate-600 mb-8 leading-relaxed italic border-l-2 border-slate-100 pl-4">{c.what_we_build}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[9px] font-black tracking-widest pt-6 border-t border-slate-50 uppercase">
                        <span className="text-slate-400">STACK: <span className="text-slate-900">{c.technology}</span></span>
                        <span className="text-blue-500 font-black">ROI: {c.solves_problem}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </Section>

        {/* FLOWCHART */}
        <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-xl overflow-visible relative min-h-[400px]">
           <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0066FF]"><Icons.Code2 size={24} /></div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Architecture</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">High-Fidelity Integration Schema</p>
              </div>
           </div>
           <div className="rounded-2xl border border-slate-50 bg-slate-50/30 p-8 overflow-visible">
              <VisualFlowchart data={flowchart_data} />
           </div>
        </div>

        {/* CTA FOOTER */}
        <div className="bg-[#0A0A0F] rounded-2xl overflow-visible shadow-2xl relative border-t-4 border-[#0066FF]">
           <div className="relative px-12 py-24 text-center">
              <div className="flex justify-center mb-10">
                 <div className="p-5 bg-white/5 rounded-3xl border border-white/10 shadow-2xl">
                    <img 
                      src="/logo.png" 
                      alt="Logo" 
                      className="w-20 h-20 object-contain" 
                      onError={(e) => { e.target.src = "https://cubemoons.com/assets/logo/cubemoons-favicon.svg" }}
                    />
                 </div>
              </div>
              <p className="text-[#00D1FF] font-black text-[10px] uppercase tracking-[0.5em] mb-12">Strategic Partnership Activation</p>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-10 tracking-tight leading-tight">{s10.cta_headline}</h2>
              <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto mb-16 italic opacity-80 leading-relaxed">"{s10.recommended_next_step}"</p>
              
              {s10.offer && (
                <div className="inline-block px-12 py-5 bg-gradient-to-r from-[#0066FF] to-[#00D1FF] text-white font-black text-xl rounded-2xl mb-24 shadow-[0_20px_40px_rgba(0,102,255,0.3)] uppercase tracking-tight transform hover:scale-105 transition-all cursor-pointer">
                   {s10.offer}
                </div>
              )}

              <div className="grid grid-cols-4 gap-8 pt-16 border-t border-white/5">
                {[
                  { icon: <Phone size={16}/>, label: 'VOICE', val: s10.contact?.phone },
                  { icon: <Mail size={16}/>, label: 'EMAIL', val: s10.contact?.email },
                  { icon: <Globe size={16}/>, label: 'WEB', val: s10.contact?.website },
                  { icon: <Calendar size={16}/>, label: 'MEET', val: s10.contact?.calendar_link },
                ].map((c, i) => (
                  <div key={i} className="text-center group cursor-pointer">
                     <div className="text-slate-600 mb-4 flex justify-center group-hover:text-[#00D1FF] transition-colors">{c.icon}</div>
                     <p className="text-slate-500 text-[10px] font-black tracking-widest mb-2 uppercase opacity-50">{c.label}</p>
                     <p className="text-white font-bold text-[11px] break-all group-hover:text-blue-200 transition-colors">{c.val}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>

      <div className="py-16 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.8em] export-hide">
        Cubemoons Intelligence Unit • Strategy Division • 2026
      </div>
    </div>
  );
}

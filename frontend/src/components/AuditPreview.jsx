import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jsPDF';
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
  Medium:   { color: '#4F46E5', bg: '#F5F3FF', Icon: Target },
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
    
    // Wake up rendering engines
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(resolve => setTimeout(resolve, 800));
    window.scrollTo(0, 0);

    // Final buffer for all components
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const element = auditRef.current;
      const originalWidth = element.offsetWidth;
      
      // MASSIVE BUFFER: 800px extra to ensure footer is 100% inside
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
        windowHeight: fullHeight + 1000, // Force a massive viewport
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          const cloneContainer = clonedDoc.querySelector('.audit-capture-container');
          if (cloneContainer) {
            cloneContainer.style.width = `${originalWidth}px`;
            cloneContainer.style.height = `${fullHeight}px`;
            cloneContainer.style.paddingBottom = '400px'; // Force bottom margin
            cloneContainer.style.borderRadius = '0';
            cloneContainer.style.border = 'none';
            cloneContainer.style.overflow = 'visible';
          }
          clonedDoc.querySelectorAll('.export-hide').forEach(el => el.style.display = 'none');
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdfWidth = 210;
      // Add extra 5mm to PDF height for safety margin
      const pdfHeight = ((canvas.height * pdfWidth) / canvas.width) + 10; 

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight - 10, undefined, 'FAST');
      pdf.save(`Full_Pitch_Audit_${meta.client_name?.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error("PDF Export Error:", error);
    } finally {
      setIsExporting(false);
      setForceOpenAll(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 font-['Inter']">
      
      {/* EXPORT BUTTON */}
      <div className="fixed bottom-8 right-8 z-[100] export-hide">
        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl border-2 ${
            isExporting ? 'bg-slate-900 text-white cursor-wait' : 'bg-white text-slate-900 hover:bg-slate-900 hover:text-white border-slate-900'
          }`}
        >
          {isExporting ? <><Loader2 className="animate-spin" size={14} /> CAPTURING FINAL REPORT...</> : <><Download size={14} /> EXPORT FULL PDF</>}
        </button>
      </div>

      <div ref={auditRef} className="audit-capture-container space-y-10 bg-slate-50 relative rounded-xl overflow-visible border border-slate-100 pb-20">
        
        {/* BLOBS */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
           <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-indigo-100/50 rounded-full blur-[80px]" />
           <div className="absolute bottom-[10%] left-[-5%] w-[250px] h-[250px] bg-orange-50/50 rounded-full blur-[60px]" />
        </div>

        {/* COVER */}
        <div className="bg-[#0F172A] rounded-xl overflow-hidden shadow-2xl relative border-b-4 border-[#FF6B35]">
          <div className="relative px-10 py-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-10">
                <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center shadow-lg"><div className="w-3 h-3 bg-white rounded-sm rotate-45" /></div>
                <div className="text-white font-bold text-base tracking-widest uppercase opacity-90">Cubemoons Strategy</div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[#FF6B35] text-[9px] font-black uppercase tracking-[0.3em] mb-8">Strategic Intelligence Report</div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight border-l-4 border-[#FF6B35] pl-8">{meta.client_name || 'Client Audit'}</h1>
              <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl mb-12 opacity-90 italic">{s1.headline}</p>
              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
                 <div><p className="text-slate-500 font-black uppercase tracking-widest mb-1.5 text-[9px]">Sector</p><p className="text-white font-bold text-sm">{meta.industry}</p></div>
                 <div><p className="text-slate-500 font-black uppercase tracking-widest mb-1.5 text-[9px]">Audit Date</p><p className="text-white font-bold text-sm">{meta.audit_date}</p></div>
                 <div><p className="text-slate-500 font-black uppercase tracking-widest mb-1.5 text-[9px]">Verified</p><p className="text-[#FF6B35] font-black text-sm">Strategic</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* 01: EXECUTIVE SUMMARY */}
        <div className="bg-white rounded-xl p-10 lg:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF6B35]" />
           <div className="max-w-2xl space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF6B35]"><Target size={18} /></div>
                 <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Executive Summary</h2>
              </div>
              <blockquote className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">"{s1.headline}"</blockquote>
              <p className="text-base text-slate-600 font-medium leading-relaxed italic">{s1.overview}</p>
              <div className="grid grid-cols-4 gap-4 pt-8">
                 {s1.key_metrics?.slice(0,4).map((m, i) => (
                   <div key={i}>
                      <div className="text-xl font-black text-slate-900">{m.value}</div>
                      <div className="text-[8px] font-black text-[#FF6B35] uppercase tracking-widest">{m.label}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* SECTIONS 01-05 */}
        <Section id="01" icon={Users} title="Company Overview & Maturity" accent="#4F46E5" forceOpen={forceOpenAll}>
           <div className="grid lg:grid-cols-2 gap-8 py-2">
              <div className="space-y-6">
                 <div><h3 className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-3">Context</h3><p className="text-base font-bold text-slate-800 leading-relaxed">{s2.about}</p></div>
                 <div className="p-6 bg-slate-50 rounded-xl border border-slate-100"><h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Revenue Model</h3><p className="text-sm font-semibold text-slate-600 leading-relaxed">{s2.business_model}</p></div>
              </div>
              <div className="space-y-6">
                 <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-xl relative">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Digital Quotient</h3>
                       <div className="text-3xl font-black text-[#FF6B35]">{s2.digital_maturity_score}<span className="text-xs text-indigo-500">/10</span></div>
                    </div>
                    <p className="text-xs font-bold text-indigo-50 italic leading-relaxed border-l-2 border-[#FF6B35] pl-4">{s2.maturity_assessment}</p>
                 </div>
              </div>
           </div>
        </Section>

        <Section id="02" icon={Shield} title="Strategic Advantage Matrix" accent="#10B981" forceOpen={forceOpenAll}>
           <div className="grid md:grid-cols-2 gap-4 py-2">
              {[
                { key: 'strengths',    label: 'Strengths',     color: '#059669', bg: '#F0FDF4' },
                { key: 'weaknesses',   label: 'Weaknesses',    color: '#DC2626', bg: '#FEF2F2' },
                { key: 'opportunities',label: 'Opportunities', color: '#2563EB', bg: '#EFF6FF' },
                { key: 'threats',      label: 'Threats',       color: '#D97706', bg: '#FFFBEB' },
              ].map(({ key, label, color, bg }) => (
                <div key={key} className="p-6 border border-slate-100 rounded-xl shadow-sm" style={{ backgroundColor: bg }}>
                   <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{label}</h4>
                   </div>
                   <ul className="space-y-2">
                     {(s3[key] || []).map((item, i) => ( <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-700 leading-tight"><CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: color }} /> {item}</li> ))}
                   </ul>
                </div>
              ))}
           </div>
        </Section>

        <Section id="03" icon={AlertTriangle} title="Friction Point Analysis" accent="#EF4444" forceOpen={forceOpenAll}>
           <div className="space-y-4 py-2">
              <p className="text-sm font-bold text-slate-500 leading-relaxed italic bg-slate-50 p-4 rounded-xl border-l-2 border-slate-200">{s4.problem_summary}</p>
              {(s4.primary_problems || []).map((p, i) => {
                 const cfg = priorityConfig[p.priority] || priorityConfig.Medium;
                 return (
                   <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center gap-3"><span className="text-[10px] font-black text-slate-300">0{i+1}</span><h4 className="text-base font-black text-slate-900 tracking-tight">{p.problem_title}</h4></div>
                         <div className="px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase text-white shadow-md" style={{ backgroundColor: cfg.color }}>{p.priority} RISK</div>
                      </div>
                      <p className="text-sm font-bold text-slate-600 mb-6 leading-relaxed">{p.description}</p>
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-50 text-[9px]">
                         <div className="bg-slate-50 p-3 rounded-lg"><p className="text-slate-400 font-black uppercase mb-1">Impact</p><p className="text-slate-900 font-black">{p.business_impact}</p></div>
                         <div className="bg-slate-50 p-3 rounded-lg"><p className="text-slate-400 font-black uppercase mb-1">Root Cause</p><p className="text-slate-900 font-black">{p.root_cause}</p></div>
                      </div>
                   </div>
                 );
              })}
           </div>
        </Section>

        <Section id="04" icon={Zap} title="Engineering Blueprint" accent="#F59E0B" forceOpen={forceOpenAll}>
           <div className="py-2 space-y-6">
              <div className="bg-slate-900 rounded-xl p-8 text-white relative shadow-xl">
                 <h3 className="text-[8px] font-black text-[#FF6B35] uppercase tracking-[0.4em] mb-4">Core Intervention</h3>
                 <p className="text-xl font-black leading-snug">{s5.solution_overview}</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                 {(s5.solution_components || []).map((c, i) => (
                   <div key={i} className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                         <div className="flex justify-between items-start mb-4"><h4 className="text-sm font-black text-slate-900">{c.component_name}</h4><span className="text-[8px] font-black tracking-widest uppercase bg-orange-50 text-[#FF6B35] px-2 py-0.5 rounded-md">{c.cubemoons_service}</span></div>
                         <p className="text-xs font-bold text-slate-600 mb-6 leading-relaxed italic border-l border-slate-100 pl-3">{c.what_we_build}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[8px] font-black text-slate-400 tracking-widest pt-4 border-t border-slate-50"><span>CPU: {c.technology}</span><span className="text-green-600">ROI: {c.solves_problem}</span></div>
                   </div>
                 ))}
              </div>
           </div>
        </Section>

        <Section id="05" icon={Clock} title="Deployment Roadmap" accent="#06B6D4" forceOpen={forceOpenAll}>
           <div className="py-2 space-y-8">
              <div className="grid grid-cols-2 gap-4 bg-slate-900 rounded-xl p-6 text-white shadow-lg">
                 <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Timeline</p><p className="text-xl font-black text-white">{s7.total_timeline}</p></div>
                 <div className="border-l border-slate-800 pl-6"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Delivery</p><p className="text-xl font-black text-white">{s7.delivery_model}</p></div>
              </div>
              <div className="space-y-6 relative">
                 <div className="absolute left-[24px] top-4 bottom-4 w-0.5 bg-slate-100" />
                 {(s7.phases || []).map((ph, i) => (
                   <div key={i} className="flex gap-6 items-start">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center font-black text-sm text-slate-900 z-10 flex-shrink-0">0{ph.phase_number}</div>
                      <div className="flex-1 bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                         <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">{ph.phase_name}</h4>
                            <div className="px-2 py-0.5 bg-cyan-50 text-cyan-600 rounded-md text-[8px] font-black tracking-widest border border-cyan-100">{ph.duration}</div>
                         </div>
                         <ul className="grid md:grid-cols-2 gap-3 mb-6">
                           {(ph.deliverables || []).map((d, di) => ( <li key={di} className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50/50 p-2.5 rounded"><CheckCircle2 size={12} className="text-[#FF6B35]" /> {d}</li> ))}
                         </ul>
                         <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center gap-3 text-green-700 font-black tracking-tight text-[9px] uppercase"><Icons.Rocket size={14} /> MILESTONE: {ph.milestone}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </Section>

        {/* FLOWCHART */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-xl overflow-visible relative min-h-[400px]">
           <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400"><Icons.Code2 size={20} /></div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">System Architecture</h3>
           </div>
           <div className="rounded-lg border border-slate-50 bg-slate-50/50 p-6 overflow-visible">
              <VisualFlowchart data={flowchart_data} />
           </div>
        </div>

        {/* CTA FOOTER */}
        <div className="bg-[#0A0A0F] rounded-xl overflow-visible shadow-2xl relative">
           <div className="absolute top-0 left-0 w-full h-[4px] bg-[#FF6B35]" />
           <div className="relative px-10 py-16 text-center">
              <p className="text-[#FF6B35] font-black text-[9px] uppercase tracking-[0.4em] mb-10">Strategic Activation</p>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-8 tracking-tight">{s10.cta_headline}</h2>
              <p className="text-base text-slate-500 font-medium max-w-2xl mx-auto mb-12 italic opacity-80">{s10.recommended_next_step}</p>
              
              {s10.offer && (
                <div className="inline-block px-10 py-3 bg-white text-slate-950 font-black text-lg rounded-lg mb-16 shadow-2xl uppercase tracking-tight">
                   {s10.offer}
                </div>
              )}

              <div className="grid grid-cols-4 gap-4 pt-12 border-t border-white/5">
                {[
                  { icon: <Phone size={14}/>, label: 'VOICE', val: s10.contact?.phone },
                  { icon: <Mail size={14}/>, label: 'EMAIL', val: s10.contact?.email },
                  { icon: <Globe size={14}/>, label: 'WEB', val: s10.contact?.website },
                  { icon: <Calendar size={14}/>, label: 'MEET', val: s10.contact?.calendar_link },
                ].map((c, i) => (
                  <div key={i} className="text-center group cursor-pointer">
                     <div className="text-slate-600 mb-3 flex justify-center group-hover:text-[#FF6B35] transition-colors">{c.icon}</div>
                     <p className="text-slate-500 text-[8px] font-black tracking-widest mb-1 uppercase">{c.label}</p>
                     <p className="text-white font-bold text-[9px] break-all opacity-60">{c.val}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>

      <div className="py-12 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.6em] export-hide">
        Cubemoons Intelligence • Strategy Excellence • 2026
      </div>
    </div>
  );
}

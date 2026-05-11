import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import VisualFlowchart from './VisualFlowchart';
import {
  Download, ChevronDown, ChevronUp, Star, Zap, Target,
  TrendingUp, Shield, Users, Clock, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, Printer, Loader2, Sparkles, Cpu, Briefcase, Globe, Mail, Phone, Calendar, Instagram, MapPin, ChevronLeft, ChevronRight
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

export default function AuditPreview({ auditData, pdfUrl }) {
  const { audit_sections: a, flowchart_data } = auditData || {};
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
  const s6    = a.section_6_implementation_roadmap || {};
  const s7    = a.section_7_roi_and_impact || {};
  const s8    = a.section_8_call_to_action || {};

  const handleExportPDF = async () => {
    setForceOpenAll(true);
    setIsExporting(true);
    
    window.scrollTo(0, 0);

    setTimeout(async () => {
      try {
        const element = document.getElementById('audit-report-content');
        const canvas = await html2canvas(element, {
          scale: 2, // 2x is often more stable for layout than 3x
          useCORS: true,
          logging: false,
          backgroundColor: '#F8FAFC',
          windowWidth: 1024,
          onclone: (doc) => {
            const el = doc.getElementById('audit-report-content');
            if (el) {
              el.style.width = '1024px';
              el.style.margin = '0';
              el.style.padding = '0';
              el.style.borderRadius = '0';
              el.style.boxShadow = 'none';
              el.style.backgroundColor = '#F8FAFC';
            }
            
            // Fix proportions for the cover slide
            const cover = doc.querySelector('.branded-cover-slide');
            if (cover) {
               cover.style.height = '576px'; // Fixed 16:9 height for 1024px width
               cover.style.width = '1024px';
               cover.style.borderRadius = '0';
            }

            const watermarks = doc.querySelectorAll('.watermark-text');
            watermarks.forEach(w => {
               w.style.fontSize = '10rem'; // Restore original large size
               w.style.display = 'flex';
               w.style.alignItems = 'center';
               w.style.justifyContent = 'center';
            });

            const hide = doc.getElementsByClassName('export-hide');
            for (let h of hide) h.style.display = 'none';
          }
        });
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [pdfWidth, pdfHeight],
          compress: true
        });

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        pdf.save(`Cubemoons_Audit_${meta.client_name || 'Report'}.pdf`);
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setForceOpenAll(false);
        setIsExporting(false);
      }
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Pitch Audit Report</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} className="text-blue-500" />
            Strategic Security Protocol
          </p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
          {isExporting ? 'Preparing Document...' : 'Export Official PDF'}
        </button>
      </div>

      <div id="audit-report-content" ref={auditRef} className="space-y-8">
        {/* BRANDED COVER PAGE - PPT SLIDE STYLE */}
        <div className="branded-cover-slide bg-white rounded-3xl overflow-hidden shadow-2xl relative aspect-video flex flex-col border border-slate-100 mb-16 mx-auto w-full max-w-6xl">
           {/* Top Section (60%) */}
           <div className="relative h-[60%] flex flex-col pt-10 px-12 overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-start relative z-20 w-full mb-auto">
                 <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                 </div>
                 <div className="text-[#1E56A0] font-black text-[10px] tracking-[0.3em] uppercase">
                    {meta.industry || "Strategic Audit"}
                 </div>
              </div>

              {/* Massive background text */}
              <div className="absolute inset-0 flex items-start justify-center pt-24 opacity-[0.18] pointer-events-none select-none">
                 <span className="watermark-text text-[10rem] font-black tracking-[-0.02em] uppercase leading-none text-slate-400">CUBEMOONS</span>
              </div>
              
              {/* Main Title (Company Name) */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-16">
                 <h1 className="text-7xl md:text-8xl font-black tracking-tight uppercase text-[#1E56A0] leading-none text-center drop-shadow-sm">
                    {meta.client_name}
                 </h1>
                 <div className="h-1.5 w-24 bg-[#1E56A0]/20 rounded-full mt-6"></div>
              </div>
           </div>

           {/* Transition Card */}
           <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[94%]">
              <div className="bg-white rounded-2xl p-8 shadow-2xl shadow-[#1E56A0]/10 border border-slate-50 text-center">
                 <p className="text-[14px] font-medium text-slate-500 leading-relaxed max-w-3xl mx-auto mb-6">
                    Cubemoons is a creative and AI-driven company shaping <br /> scalable digital systems and brand experiences.
                 </p>
                 <div className="flex items-center justify-between px-12 pt-6 border-t border-slate-50">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex gap-2">
                       ID: <span className="text-[#1E56A0]">{meta.report_id}</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex gap-2">
                       DATE: <span className="text-[#1E56A0]">{meta.audit_date}</span>
                    </div>
                    <div className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                       CRITICAL GAPS
                    </div>
                 </div>
              </div>
           </div>

           {/* Bottom Section (40%) */}
           <div className="h-[40%] bg-gradient-to-br from-[#1E56A0] to-[#163172] flex flex-col justify-end pb-10 px-12 relative">
              {/* Decorative line pattern */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
              
              <div className="flex flex-col items-center relative z-10 w-full">
                 <div className="bg-white text-[#1E56A0] px-10 py-2.5 rounded-full font-black text-[10px] tracking-[0.3em] uppercase mb-12 shadow-xl">
                    Creative. Intelligent. Scalable.
                 </div>

                 {/* Contact Bar */}
                 <div className="w-full pt-10 border-t border-white/20 grid grid-cols-4 gap-4 text-[8px] font-black tracking-[0.2em] uppercase text-white text-center">
                    <div className="opacity-100">@cube.moons</div>
                    <div className="opacity-100">www.cubemoons.com</div>
                    <div className="opacity-100">Raipur, Chhattisgarh</div>
                    <div className="opacity-100">marketing@cubemoons.com</div>
                 </div>
              </div>
           </div>
        </div>

        {/* SECTION 1: EXECUTIVE SUMMARY */}
        <Section id="01" icon={Target} title="Executive Summary" accent="#0066FF" forceOpen={forceOpenAll}>
           <div className="space-y-6">
             <p className="text-lg font-bold text-slate-800 leading-relaxed italic border-l-4 border-blue-500 pl-6">
               "{s1.overview}"
             </p>
             <div className="grid grid-cols-3 gap-4 mt-8">
                {s1.key_takeaways?.map((t, i) => (
                  <div key={i} className="bg-blue-50/50 p-5 rounded-xl border border-blue-100/50">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm mb-3">
                       <Zap size={14} />
                    </div>
                    <div className="text-xs font-black text-slate-400 uppercase mb-1 tracking-wider">Takeaway {i+1}</div>
                    <div className="text-sm font-bold text-slate-800">{t}</div>
                  </div>
                ))}
             </div>
           </div>
        </Section>

        {/* SECTION 2: COMPANY OVERVIEW */}
        <Section id="02" icon={Briefcase} title="Company Overview" accent="#0066FF" forceOpen={forceOpenAll}>
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Business Context</h3>
                 <p className="text-sm font-bold text-slate-600 leading-relaxed">{s2.about}</p>
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-black text-blue-500 uppercase mb-1">Business Model</div>
                    <p className="text-sm font-bold text-slate-800">{s2.business_model}</p>
                 </div>
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between">
                 <div>
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Target size={14} />
                      Digital Maturity Score
                    </h3>
                    <div className="flex items-end gap-2 mb-4">
                       <span className="text-5xl font-black text-white">{s2.digital_maturity_score}</span>
                    </div>
                 </div>
                 <p className="text-sm font-medium text-slate-400 italic leading-relaxed">"{s2.maturity_assessment}"</p>
              </div>
           </div>
        </Section>

        {/* SECTION 3: CURRENT STATE */}
        <Section id="03" icon={TrendingUp} title="Current State Analysis" accent="#0066FF" forceOpen={forceOpenAll}>
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Challenges</h3>
                {s3.current_challenges?.map((c, i) => (
                  <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <AlertTriangle size={16} className="text-amber-500 mt-1 shrink-0" />
                     <span className="text-sm font-bold text-slate-700">{c}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                 <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Clock size={14} />
                   Operational Inefficiencies
                 </h3>
                 <div className="space-y-6">
                    {s3.inefficiencies?.map((inf, i) => (
                      <div key={i} className="group">
                        <div className="flex justify-between mb-2">
                           <span className="text-[11px] font-bold text-slate-400">{inf.area}</span>
                           <span className="text-[10px] font-black text-blue-500">OPTIMIZABLE</span>
                        </div>
                        <p className="text-sm font-bold text-slate-200">{inf.impact}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </Section>

        {/* SECTION 4: GAP IDENTIFICATION */}
        <Section id="04" icon={AlertCircle} title="Strategic Gap Analysis" accent="#DC2626" forceOpen={forceOpenAll}>
           <div className="space-y-6">
              {s4.gaps?.map((gap, i) => {
                const config = priorityConfig[gap.priority] || priorityConfig.Medium;
                return (
                  <div key={i} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                    <div className="flex flex-row gap-6">
                       <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-black uppercase mb-4" style={{ backgroundColor: config.bg, color: config.color }}>
                             <config.Icon size={12} />
                             {gap.priority} Priority
                          </div>
                          <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight">{gap.gap_name}</h4>
                       </div>
                       <div className="md:w-2/3 space-y-4">
                          <p className="text-sm font-bold text-slate-600 leading-relaxed">{gap.description}</p>
                          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                             <div className="text-red-600 font-black text-[10px] uppercase shrink-0">Business Risk:</div>
                             <p className="text-[11px] font-bold text-red-800 italic">{gap.consequence}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>
        </Section>

        {/* SECTION 5: PROPOSED SOLUTION */}
        <Section id="05" icon={Zap} title="The Cubemoons Solution" accent="#0066FF" forceOpen={forceOpenAll}>
           <div className="space-y-8">
              <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-10">
                   <Zap size={200} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-4 tracking-tight">{s5.solution_name}</h3>
                  <p className="text-lg font-bold text-blue-100 leading-relaxed mb-8">{s5.high_level_concept}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                     {s5.key_features?.map((f, i) => (
                       <div key={i} className="flex gap-4 items-center p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center shrink-0">
                             <CheckCircle2 size={16} />
                          </div>
                          <span className="text-sm font-bold">{f}</span>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              {/* VISUAL FLOWCHART */}
              {flowchart_data && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 text-center flex items-center justify-center gap-3">
                     <div className="h-px w-8 bg-slate-200" />
                     Implementation Workflow
                     <div className="h-px w-8 bg-slate-200" />
                   </h3>
                   <VisualFlowchart data={flowchart_data} />
                </div>
              )}
           </div>
        </Section>

        {/* SECTION 6: IMPLEMENTATION ROADMAP */}
        <Section id="06" icon={Calendar} title="Implementation Roadmap" accent="#0066FF" forceOpen={forceOpenAll}>
           <div className="space-y-8 mt-4">
              {s6.phases?.map((phase, i) => (
                <div key={i} className="flex gap-6 group relative">
                   <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-lg z-10">
                         {phase.phase_number}
                      </div>
                      {i < s6.phases.length - 1 && <div className="w-px h-full bg-slate-100 absolute top-10 left-[19px]"></div>}
                   </div>
                   <div className="flex-1 pb-10">
                      <div className="flex justify-between items-center mb-4">
                         <h4 className="text-lg font-black text-slate-900">{phase.phase_name}</h4>
                         <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <Clock size={12} />
                            {phase.duration}
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Strategic Deliverables</div>
                            <div className="space-y-2">
                               {phase.deliverables?.map((d, di) => (
                                 <div key={di} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-bold text-slate-700">{d}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="p-5 bg-blue-600 rounded-2xl text-white relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 opacity-10">
                               <Target size={80} />
                            </div>
                            <div className="text-[10px] font-black text-blue-200 uppercase mb-2 tracking-widest">Phase Milestone</div>
                            <p className="text-sm font-black leading-tight">{phase.milestone}</p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </Section>

        {/* SECTION 7: ROI */}
        <Section id="07" icon={Sparkles} title="Anticipated Impact & ROI" accent="#0066FF" forceOpen={forceOpenAll}>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {s7.metrics?.map((m, i) => (
                <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl text-center group hover:border-blue-500 transition-colors">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.area}</div>
                   <div className="text-3xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{m.improvement}</div>
                   <p className="text-[11px] font-bold text-slate-500 italic">{m.timeframe}</p>
                </div>
              ))}
           </div>
        </Section>
        
        {/* SECTION 08: CALL TO ACTION */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2.5rem] p-12 text-white text-center relative overflow-hidden shadow-2xl shadow-blue-100 mt-12 min-h-[400px] flex flex-col justify-center">
           {/* Decorative three dots */}
           <div className="absolute top-10 left-10 flex flex-col gap-2 opacity-50">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
           </div>

           {/* Large background text effect */}
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
              <span className="text-[10rem] font-black uppercase">CUBEMOONS</span>
           </div>
           
           <div className="relative z-10">
              <div className="text-[11px] font-black tracking-[0.4em] uppercase mb-6 opacity-90">Ready to Start</div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter leading-tight uppercase whitespace-pre-line">
                 {s8.headline || "LET'S ELEVATE\nYOUR CONTENT"}
              </h2>
              <p className="max-w-xl mx-auto text-base font-medium text-blue-50 mb-10 leading-relaxed opacity-90">
                 {s8.subheadline || "Partner with Cubemoons to transform your brand's digital presence with world-class creative production."}
              </p>
              
              <div className="text-[11px] font-bold text-white mb-10 flex items-center justify-center gap-2 tracking-wide opacity-80">
                 Cubemoons <span className="opacity-40">•</span> Engineering the Intelligent Future
              </div>

              <div className="flex justify-center mb-16">
                 <button className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-3.5 rounded-full font-black text-xs tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 uppercase">
                    {s8.cta_button_text || "Let's Work Together"}
                 </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/10 text-[9px] font-black tracking-[0.2em] uppercase opacity-80">
                 <div className="flex items-center justify-center gap-2">
                    <Instagram size={14} className="opacity-70" /> @cube.moons
                 </div>
                 <div className="flex items-center justify-center gap-2">
                    <Globe size={14} className="opacity-70" /> www.cubemoons.com
                 </div>
                 <div className="flex items-center justify-center gap-2">
                    <MapPin size={14} className="opacity-70" /> Raipur, Chhattisgarh
                 </div>
                 <div className="flex items-center justify-center gap-2">
                    <Mail size={14} className="opacity-70" /> marketing@cubemoons.com
                 </div>
              </div>
           </div>
        </div>

        {/* FOOTER */}
        <div className="pt-12 mt-12 border-t border-slate-200 text-center">
           <img src="/logo.png" alt="Logo" className="h-8 mx-auto mb-6 opacity-30" />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
             &copy; 2026 CUBEMOONS PVT. LTD. + STRATEGIC INTERNAL TOOL
           </p>
        </div>
      </div>
    </div>
  );
}

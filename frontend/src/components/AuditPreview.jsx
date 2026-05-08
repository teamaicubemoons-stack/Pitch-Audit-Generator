import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import VisualFlowchart from './VisualFlowchart';
import {
  Download, ChevronDown, ChevronUp, Star, Zap, Target,
  TrendingUp, Shield, Users, Clock, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight
} from 'lucide-react';

const Section = ({ id, icon: Icon, title, accent, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ background: accent }}>
            {id}
          </div>
          <Icon size={18} className="text-gray-500" />
          <h3 className="font-bold text-base text-brand-dark">{title}</h3>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-gray-100">{children}</div>}
    </div>
  );
};

const Tag = ({ children, color }) => (
  <span className="inline-block px-3 py-1 rounded-full text-white text-xs font-bold" style={{ background: color }}>
    {children}
  </span>
);

const priorityConfig = {
  Critical: { color: '#EF4444', bg: '#FEF2F2', Icon: AlertCircle },
  High:     { color: '#F59E0B', bg: '#FFFBEB', Icon: AlertTriangle },
  Medium:   { color: '#6C63FF', bg: '#F5F3FF', Icon: Target },
};

export default function AuditPreview({ auditData, pdfUrl }) {
  const { audit_sections: a, flowchart_data, generation_time_seconds } = auditData;
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ═══ COVER HERO ═════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-[#0A0A0F] via-[#111128] to-[#1a0a2e] rounded-2xl overflow-hidden shadow-2xl">
        {/* Top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF6B35] via-[#FF6B35] to-[#6C63FF]" />
        <div className="px-8 pt-8 pb-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <p className="text-[#FF6B35] font-bold text-xs uppercase tracking-widest mb-3">
              CLIENT DIGITAL AUDIT REPORT
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
              {meta.client_name || 'Prospective Client'}
            </h1>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{s1.headline}</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              <span>📅 {meta.audit_date}</span>
              <span>🏭 {meta.industry}</span>
              <span>🏢 Prepared by Cubemoons Pvt. Ltd.</span>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4">
            {/* Maturity Score Card */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Digital Maturity</p>
              <div className="text-5xl font-black text-[#FF6B35] leading-none mb-2">{s2.digital_maturity_score}</div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF6B35] to-[#6C63FF] rounded-full"
                  style={{ width: `${(parseInt(s2.digital_maturity_score) || 4) * 10}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">out of 10</p>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-orange-500 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30 print:hidden"
              >
                <Zap size={20} />
                Print Professional Audit (HQ PDF)
              </button>
              <p className="text-center text-xs text-gray-500 print:hidden">
                Generated in {generation_time_seconds?.toFixed(1)}s • High-Fidelity A4 Print
              </p>
            </div>
          </div>
        </div>

        {/* Metrics row */}
        {s1.key_metrics?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/10">
            {s1.key_metrics.slice(0, 4).map((m, i) => (
              <div key={i} className="px-6 py-4 border-r border-white/10 last:border-r-0">
                <div className="text-2xl font-black text-[#FF6B35]">{m.value}</div>
                <div className="text-white text-xs font-semibold mt-0.5">{m.label}</div>
                <div className="text-gray-500 text-xs">{m.context}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ EXECUTIVE SUMMARY ══════════════════════════════════════════════ */}
      <div className="print-page-break bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-[#FF6B35]" />
          <h3 className="font-black text-brand-dark text-lg">Executive Summary</h3>
        </div>
        <blockquote className="border-l-4 border-[#FF6B35] pl-4 italic text-gray-700 text-base font-medium mb-4">
          "{s1.headline}"
        </blockquote>
        <p className="text-gray-600 leading-relaxed">{s1.overview}</p>
      </div>

      {/* ═══ SECTIONS ════════════════════════════════════════════════════════ */}

      {/* S2: Company Overview */}
      <div className="print-page-break">
        <Section id="02" icon={Users} title="Company Overview" accent="#3B82F6" defaultOpen>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">About</p>
                <p className="text-gray-700 text-sm leading-relaxed">{s2.about}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Business Model</p>
                <p className="text-gray-700 text-sm leading-relaxed">{s2.business_model}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Digital Footprint</p>
                <p className="text-gray-700 text-sm leading-relaxed">{s2.current_digital_footprint}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Maturity Assessment</p>
              <p className="text-gray-700 text-sm leading-relaxed">{s2.maturity_assessment}</p>
            </div>
          </div>
        </Section>
      </div>

      {/* S3: SWOT */}
      <div className="print-page-break">
        <Section id="03" icon={Shield} title="Current State — SWOT Analysis" accent="#8B5CF6" defaultOpen>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { key: 'strengths',    label: 'Strengths',     icon: <Icons.ShieldCheck size={16}/>, bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800' },
                { key: 'weaknesses',   label: 'Weaknesses',    icon: <Icons.AlertTriangle size={16}/>,  bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800'   },
                { key: 'opportunities',label: 'Opportunities', icon: <Icons.TrendingUp size={16}/>, bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800'  },
                { key: 'threats',      label: 'Threats',       icon: <Icons.ShieldAlert size={16}/>,  bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-800' },
              ].map(({ key, label, icon, bg, border, text }) => (
                <div key={key} className={`${bg} ${border} border rounded-xl p-4`}>
                  <div className={`flex items-center gap-2 font-bold text-sm mb-2 ${text}`}>
                    {icon} {label}
                  </div>
                  <ul className="space-y-1">
                    {(s3[key] || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                        <span className="mt-0.5 flex-shrink-0">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-600 italic">
              {s3.swot_narrative}
            </div>
          </div>
        </Section>
      </div>

      {/* S4: Problems */}
      <div className="print-page-break">
        <Section id="04" icon={AlertTriangle} title="Problem Identification" accent="#EF4444" defaultOpen>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-600 italic">{s4.problem_summary}</p>
            {(s4.primary_problems || []).map((p, i) => {
              const cfg = priorityConfig[p.priority] || priorityConfig.Medium;
              const { Icon: PIcon } = cfg;
              return (
                <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: cfg.color + '40' }}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: cfg.color + '12' }}>
                    <div className="flex items-center gap-2">
                      <PIcon size={16} style={{ color: cfg.color }} />
                      <span className="font-bold text-brand-dark text-sm">{p.problem_title}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.color + '20' }}>
                      {p.priority}
                    </span>
                  </div>
                  <div className="px-4 py-3 bg-white">
                    <p className="text-sm text-gray-600 mb-3">{p.description}</p>
                    <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                      <div><strong className="text-gray-700">Business Impact:</strong> {p.business_impact}</div>
                      <div><strong className="text-gray-700">Root Cause:</strong> {p.root_cause}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* S5: Proposed Solution */}
      <div className="print-page-break">
        <Section id="05" icon={Zap} title="Proposed Solution" accent="#FF6B35" defaultOpen>
          <div className="mt-4 space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-orange-900 font-semibold text-sm">{s5.solution_overview}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {(s5.solution_components || []).map((c, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3 bg-brand-dark">
                    <span className="text-white font-bold text-sm">{c.component_name}</span>
                    <span className="bg-[#FF6B35] text-white text-xs font-bold px-2 py-0.5 rounded-full">{c.cubemoons_service}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-3">{c.what_we_build}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg">Tech: {c.technology}</span>
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-lg">Solves: {c.solves_problem}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 italic text-sm text-gray-600">
              {s5.why_this_approach}
            </div>
          </div>
        </Section>
      </div>

      {/* S6: Why This Works */}
      <div className="print-page-break">
        <Section id="06" icon={TrendingUp} title="Why This Solution Works" accent="#10B981">
          <div className="mt-4 space-y-3">
            {(s6.data_points || []).map((dp, i) => (
              <div key={i} className="flex gap-4 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-green-50 border-r border-gray-200 px-4 py-3 flex items-center w-2/5">
                  <p className="text-sm font-semibold text-green-900">{dp.claim}</p>
                </div>
                <div className="px-4 py-3 w-3/5 flex items-center">
                  <p className="text-sm text-gray-600">{dp.evidence}</p>
                </div>
              </div>
            ))}
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Industry Benchmarks</p>
                <p className="text-sm text-gray-700">{s6.industry_benchmarks}</p>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Risk Mitigation</p>
                <p className="text-sm text-gray-700">{s6.risk_mitigation}</p>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* S7: Roadmap */}
      <div className="print-page-break">
        <Section id="07" icon={Clock} title="Implementation Roadmap" accent="#F59E0B">
          <div className="mt-4">
            <div className="flex gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm">
              <span>⏱ Total: <strong>{s7.total_timeline}</strong></span>
              <span>📦 Model: <strong>{s7.delivery_model}</strong></span>
            </div>
            <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
              {(s7.phases || []).map((ph, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-8 top-0 w-5 h-5 rounded-full bg-[#FF6B35] border-4 border-white shadow" />
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-black text-[#FF6B35] uppercase tracking-wider">Phase {ph.phase_number}</span>
                      <h4 className="font-bold text-brand-dark">{ph.phase_name}</h4>
                      <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Duration: {ph.duration}</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      {(ph.deliverables || []).map((d, di) => (
                        <li key={di} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />{d}
                        </li>
                      ))}
                    </ul>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                      Milestone: {ph.milestone}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* S8: ROI */}
      <div className="print-page-break">
        <Section id="08" icon={TrendingUp} title="ROI & Expected Impact" accent="#10B981" defaultOpen>
          <div className="mt-4">
            <p className="text-sm text-gray-600 italic mb-5">{s8.roi_narrative}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(s8.expected_outcomes || []).map((o, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                  <p className="font-bold text-brand-dark text-sm mb-1">{o.outcome}</p>
                  <p className="text-xs text-gray-500 mb-3">{o.metric}</p>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-gray-400 text-sm">{o.conservative_estimate}</span>
                    <ArrowRight size={14} className="text-gray-300" />
                    <span className="text-green-600 font-black text-lg">{o.optimistic_estimate}</span>
                  </div>
                  <span className="text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-500">Timeline: {o.timeframe}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* S9: Why Cubemoons */}
      <div className="print-page-break">
        <Section id="09" icon={Star} title="Why Cubemoons" accent="#6C63FF">
          <div className="mt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              {(s9.differentiators || []).map((d, i) => (
                <div key={i} className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <p className="font-bold text-purple-900 text-sm mb-1">{d.title}</p>
                  <p className="text-gray-600 text-sm">{d.description}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Relevant Experience</p>
                <p className="text-sm text-gray-700">{s9.relevant_experience}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Process Advantage</p>
                <p className="text-sm text-gray-700">{s9.process_advantage}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(s9.proven_products || []).map((p, i) => (
                <span key={i} className="bg-brand-dark text-white px-3 py-1.5 rounded-full text-sm font-semibold">{p}</span>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* FLOWCHART */}
      <div className="print-page-break">
        <div className="page-break-after">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center font-black text-white text-sm">
              <Icons.Cpu size={18}/>
            </div>
            <h3 className="font-black text-brand-dark text-lg">Proposed System Architecture</h3>
          </div>
          <VisualFlowchart data={flowchart_data} />
        </div>
      </div>

      {/* S10: Next Steps CTA */}
      <div className="print-page-break">
        <div className="bg-gradient-to-br from-[#0A0A0F] via-[#111128] to-[#1a0a2e] rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[#FF6B35] to-[#6C63FF]" />
          <div className="p-8">
            <p className="text-[#FF6B35] font-bold text-xs uppercase tracking-widest mb-2">10 — Next Steps</p>
            <h2 className="text-3xl font-black text-white mb-2">{s10.cta_headline}</h2>
            <p className="text-gray-400 mb-6">{s10.recommended_next_step}</p>

            {s10.offer && (
              <div className="inline-block bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] font-semibold px-4 py-2 rounded-xl text-sm mb-6">
                Exclusive: {s10.offer}
              </div>
            )}

            {s10.meeting_agenda_suggestion?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Suggested Meeting Agenda</p>
                <div className="space-y-2">
                  {s10.meeting_agenda_suggestion.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{i + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-4 gap-3 border-t border-white/10 pt-6">
              {[
                { icon: <Icons.Phone size={20}/>, label: 'Phone', val: s10.contact?.phone },
                { icon: <Icons.Mail size={20}/>, label: 'Email', val: s10.contact?.email },
                { icon: <Icons.Globe size={20}/>, label: 'Website', val: s10.contact?.website },
                { icon: <Icons.Calendar size={20}/>, label: 'Book Call', val: s10.contact?.calendar_link },
              ].map((c, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/10 flex flex-col items-center">
                  <div className="text-[#FF6B35] mb-2">{c.icon}</div>
                  <div className="text-gray-400 text-xs mb-0.5">{c.label}</div>
                  <div className="text-white text-xs font-medium break-all">{c.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

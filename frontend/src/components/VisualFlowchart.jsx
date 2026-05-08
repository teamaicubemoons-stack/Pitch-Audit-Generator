import React from 'react';
import * as Icons from 'lucide-react';

const STEP_COLORS = [
  '#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981',
  '#EF4444','#06B6D4','#6366F1','#84CC16','#F97316'
];

const getIcon = (name, size = 20, className = "") => {
  // Convert kebab-case or snake_case to PascalCase for Lucide
  const pascalName = (name || "box")
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  const IconComponent = Icons[pascalName] || Icons.Box;
  return <IconComponent size={size} className={className} />;
};

export default function VisualFlowchart({ data }) {
  if (!data || !data.steps) return null;

  const steps = data.steps || [];
  const benefits = data.key_benefits || [];
  const summary = data.summary_steps || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-dark to-gray-800 text-white px-8 py-5 text-center">
        <h3 className="text-xl font-black tracking-wide">{data.workflow_title || 'System Workflow'}</h3>
      </div>

      {/* Steps Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step, idx) => {
            const color = step.color || STEP_COLORS[idx % STEP_COLORS.length];
            const isLast = idx === steps.length - 1;
            return (
              <div key={idx} className="relative">
                {/* Arrow connector for non-last in row */}
                {!isLast && idx % 3 !== 2 && (
                  <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 items-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M0 8h12M8 4l4 4-4 4" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}

                <div
                  className="rounded-xl border-2 overflow-hidden h-full"
                  style={{ borderColor: color + '40' }}
                >
                  {/* Step Header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ backgroundColor: color }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-sm flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="text-white flex-shrink-0">
                      {getIcon(step.icon, 22)}
                    </div>
                    <h4 className="text-white font-bold text-sm leading-tight">{step.title}</h4>
                  </div>

                  {/* Step Body */}
                  <div className="px-4 py-3 bg-white" style={{ backgroundColor: color + '08' }}>
                    <p className="text-gray-600 text-xs mb-3 leading-relaxed">{step.description}</p>
                    <ul className="space-y-1">
                      {(step.bullets || []).map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2 text-xs text-gray-700">
                          <span className="mt-0.5 flex-shrink-0" style={{ color }}>•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Timeline Bar */}
        {summary.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Complete Flow</p>
            <div className="flex items-center justify-center flex-wrap gap-0">
              {summary.map((label, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className="px-3 py-1.5 rounded-full text-white text-xs font-bold whitespace-nowrap"
                    style={{ backgroundColor: STEP_COLORS[idx % STEP_COLORS.length] }}
                  >
                    {label}
                  </div>
                  {idx < summary.length - 1 && (
                    <span className="text-gray-300 mx-1 text-sm">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Key Benefits */}
        {benefits.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Key Benefits</p>
            <div className="flex flex-wrap justify-center gap-3">
              {benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <div className="text-brand-orange">
                    {getIcon(b.icon, 20)}
                  </div>
                  <div>
                    <div className="font-black text-sm text-brand-dark">{b.title}</div>
                    <div className="text-xs text-gray-500">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

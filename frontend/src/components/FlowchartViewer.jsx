import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  themeVariables: {
    primaryColor: '#F8F9FA',
    primaryTextColor: '#0A0A0F',
    primaryBorderColor: '#6C63FF',
    lineColor: '#FF6B35',
    secondaryColor: '#FF6B35',
    tertiaryColor: '#fff'
  },
  flowchart: {
    curve: 'basis'
  }
});

export default function FlowchartViewer({ code }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (code && containerRef.current) {
      containerRef.current.innerHTML = '';
      mermaid.render('mermaid-svg', code).then((result) => {
        containerRef.current.innerHTML = result.svg;
      }).catch(err => {
        console.error("Mermaid error:", err);
      });
    }
  }, [code]);

  if (!code) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 overflow-x-auto shadow-inner">
      <h3 className="text-lg font-bold text-brand-dark mb-4 border-b pb-2">Proposed System Architecture</h3>
      <div ref={containerRef} className="flex justify-center min-w-[600px]" />
    </div>
  );
}

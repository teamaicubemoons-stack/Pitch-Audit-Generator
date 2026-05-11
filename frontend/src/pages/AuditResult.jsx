import React, { useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import AuditPreview from '../components/AuditPreview';
import { getPdfUrl } from '../api/auditApi';
import { ArrowLeft } from 'lucide-react';

export default function AuditResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const auditData = location.state?.auditData;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!auditData) return <Navigate to="/" replace />;

  const pdfUrl = auditData.pdf_url ? getPdfUrl(auditData.pdf_url) : null;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-10 transition-all font-bold text-sm bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-sm hover:shadow-md print:hidden"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <AuditPreview auditData={auditData} pdfUrl={pdfUrl} />
      </div>
    </div>
  );
}

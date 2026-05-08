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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-500 hover:text-brand-dark mb-8 transition-colors font-medium print:hidden"
      >
        <ArrowLeft size={20} />
        Back to Generator
      </button>

      <AuditPreview auditData={auditData} pdfUrl={pdfUrl} />
    </div>
  );
}

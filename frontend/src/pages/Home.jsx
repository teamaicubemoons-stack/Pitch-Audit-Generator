import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuditForm from '../components/AuditForm';
import ProgressTracker from '../components/ProgressTracker';
import { generateAudit } from '../api/auditApi';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await generateAudit(formData);
      // Pass data via route state to the result page
      navigate('/result', { state: { auditData: result } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to generate audit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/10 text-brand-purple font-semibold text-sm mb-6 border border-brand-purple/20">
          <Sparkles size={16} />
          <span>Powered by GPT-4o</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tight">
          Client Pitch Audit <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-purple">Generator</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enter whatever information you have about the prospective client. Our AI will research them, identify gaps, and generate a hyper-personalized, data-driven pitch document.
        </p>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isSubmitting ? (
        <ProgressTracker />
      ) : (
        <div className="animate-fade-in-up">
          <AuditForm onSubmit={handleGenerate} isSubmitting={isSubmitting} />
        </div>
      )}
      
    </div>
  );
}

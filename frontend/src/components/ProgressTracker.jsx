import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const STEPS = [
  "Initializing AI Engine...",
  "Running web scraping & research...",
  "Analyzing industry trends & competitors...",
  "Conducting gap analysis...",
  "Generating audit narrative...",
  "Designing system flowchart...",
  "Compiling PDF document..."
];

export default function ProgressTracker() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Simulate progress steps (in a real app, this would be WebSockets)
  useEffect(() => {
    const intervals = [2000, 5000, 8000, 12000, 18000, 22000, 25000];
    
    intervals.forEach((time, idx) => {
      setTimeout(() => {
        setCurrentStepIndex(prev => Math.max(prev, idx + 1));
      }, time);
    });
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-12 glass-card rounded-2xl border border-slate-200/80 p-8 shadow-xl shadow-purple-900/5">
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#7C3AED]/20 border-t-[#7C3AED] animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-[#8B5CF6]/20 border-b-[#8B5CF6] animate-spin animation-delay-200"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[#7C3AED] font-bold">AI</div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 text-center">Crafting the Perfect Pitch</h2>
        <p className="text-slate-500 mt-2 text-center">This usually takes about 30 seconds.</p>
      </div>

      <div className="space-y-4">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isActive ? 'bg-[#7C3AED]/10 border border-[#7C3AED]/20' : ''}`}
            >
              {isCompleted ? (
                <CheckCircle2 className="text-green-500" size={24} />
              ) : isActive ? (
                <Loader2 className="text-[#7C3AED] animate-spin" size={24} />
              ) : (
                <Circle className="text-slate-200" size={24} />
              )}
              <span className={`font-medium ${isCompleted ? 'text-slate-800' : isActive ? 'text-[#7C3AED]' : 'text-slate-400'}`}>
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

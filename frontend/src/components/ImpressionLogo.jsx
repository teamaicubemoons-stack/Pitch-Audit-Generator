import React from 'react';

export const ImpressionLogo = ({ className = "w-14 h-14" }) => (
  <img 
    src="/impression.png" 
    className={`${className} object-contain`} 
    alt="Impression Logo" 
  />
);

export const ImpressionWordmark = ({ className = "h-10" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <ImpressionLogo className="w-12 h-12" />
    <span className="font-semibold text-xl tracking-widest text-slate-900 font-display uppercase">
      Impression<span className="text-[#7C3AED] font-light lowercase">.pr</span>
    </span>
  </div>
);


import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        liquid-glass rounded-3xl border
        bg-white/40 dark:bg-[#101423]/70 
        border-white/60 dark:border-white/10 
        shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
        transition-all duration-300
        ${onClick ? 'active:scale-[0.98] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};


import React from 'react';

// ==========================================
// GlassCard Component
// Glassmorphism container with optional effects
// ==========================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Adds neo-glow effect around the card */
  glow?: boolean;
  /** Adds a colored left border accent */
  accent?: 'primary' | 'success' | 'purple' | 'none';
}

const accentStyles = {
  primary: 'border-l-4 border-l-primary',
  success: 'border-l-4 border-l-emerald-500',
  purple: 'border-l-4 border-l-accent-purple',
  none: '',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  glow = false,
  accent = 'none',
}) => {
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
        ${glow ? 'neo-glow-primary' : ''}
        ${accentStyles[accent]}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </div>
  );
};

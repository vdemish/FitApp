import React from 'react';

// ==========================================
// Button Component
// Variants: primary, secondary, ghost, icon
// ==========================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    fullWidth?: boolean;
    glow?: boolean;
}

const baseStyles = `
  flex items-center justify-center gap-2
  font-bold uppercase tracking-wide
  transition-all duration-300
  active:scale-[0.98]
  disabled:opacity-50 disabled:cursor-not-allowed
`;

const variantStyles = {
    primary: `
    bg-primary text-white dark:text-background-dark
    shadow-lg shadow-primary/20
    hover:bg-primary-dark
  `,
    secondary: `
    bg-slate-100 dark:bg-white/5
    border border-slate-200 dark:border-white/10
    text-slate-600 dark:text-white/70
    hover:bg-slate-200 dark:hover:bg-white/10
  `,
    ghost: `
    bg-transparent
    text-slate-500 dark:text-white/60
    hover:bg-slate-100 dark:hover:bg-white/5
  `,
    icon: `
    bg-slate-100 dark:bg-white/5
    border border-slate-200 dark:border-white/10
    text-slate-500 dark:text-white/60
    hover:bg-slate-200 dark:hover:bg-white/10
  `,
};

const sizeStyles = {
    sm: 'h-10 px-4 text-xs rounded-xl',
    md: 'h-12 px-6 text-sm rounded-2xl',
    lg: 'h-16 px-8 text-lg rounded-2xl',
};

const iconSizeStyles = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-12 h-12 rounded-2xl',
    lg: 'w-16 h-16 rounded-2xl',
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    fullWidth = false,
    glow = false,
    className = '',
    ...props
}) => {
    const isIcon = variant === 'icon';

    return (
        <button
            className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${isIcon ? iconSizeStyles[size] : sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${glow ? 'neo-glow-primary' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
            {...props}
        >
            {children}
        </button>
    );
};

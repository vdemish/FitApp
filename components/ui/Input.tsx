import React from 'react';

// ==========================================
// Input Component
// Text input with icon support and states
// ==========================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: string;
    error?: boolean;
    errorMessage?: string;
}

export const Input: React.FC<InputProps> = ({
    icon,
    error = false,
    errorMessage,
    className = '',
    ...props
}) => {
    return (
        <div className="relative group">
            {icon && (
                <span className={`
          material-symbols-outlined 
          absolute left-4 top-1/2 -translate-y-1/2 
          text-slate-400 
          group-focus-within:text-primary 
          transition-colors
        `.replace(/\s+/g, ' ').trim()}>
                    {icon}
                </span>
            )}
            <input
                className={`
          w-full h-12
          bg-slate-100 dark:bg-white/5
          border ${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'}
          rounded-2xl
          ${icon ? 'pl-12 pr-4' : 'px-4'}
          text-lg
          placeholder:text-slate-400 dark:placeholder:text-white/20
          dark:text-white
          focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/30' : 'focus:ring-primary/30'}
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `.replace(/\s+/g, ' ').trim()}
                {...props}
            />
            {error && errorMessage && (
                <p className="text-red-500 text-xs mt-1 ml-2">{errorMessage}</p>
            )}
        </div>
    );
};

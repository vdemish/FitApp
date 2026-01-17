import React from 'react';

// ==========================================
// Typography Components
// Heading and Text for consistent typography
// ==========================================

// == HEADING ==
export interface HeadingProps {
    level?: 1 | 2 | 3;
    children: React.ReactNode;
    className?: string;
    accent?: boolean;
}

const headingStyles = {
    1: 'text-3xl font-bold tracking-tight',
    2: 'text-2xl font-bold tracking-tight',
    3: 'text-lg font-bold',
};

export const Heading: React.FC<HeadingProps> = ({
    level = 1,
    children,
    className = '',
    accent = false,
}) => {
    const baseClass = `${headingStyles[level]} ${accent ? 'text-primary' : 'dark:text-white'} ${className}`.replace(/\s+/g, ' ').trim();

    if (level === 1) return <h1 className={baseClass}>{children}</h1>;
    if (level === 2) return <h2 className={baseClass}>{children}</h2>;
    return <h3 className={baseClass}>{children}</h3>;
};

// == TEXT ==
export interface TextProps {
    variant?: 'body' | 'body-sm' | 'caption' | 'display';
    children: React.ReactNode;
    className?: string;
    muted?: boolean;
    accent?: boolean;
    uppercase?: boolean;
}

const textStyles = {
    display: 'text-5xl font-bold',
    body: 'text-base',
    'body-sm': 'text-sm',
    caption: 'text-[10px] font-bold uppercase tracking-widest',
};

export const Text: React.FC<TextProps> = ({
    variant = 'body',
    children,
    className = '',
    muted = false,
    accent = false,
    uppercase = false,
}) => {
    const getColorClass = () => {
        if (accent) return 'text-primary';
        if (muted) return 'text-slate-400 dark:text-white/40';
        return 'text-slate-600 dark:text-white/60';
    };

    return (
        <span
            className={`
        ${textStyles[variant]}
        ${getColorClass()}
        ${uppercase ? 'uppercase' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
        >
            {children}
        </span>
    );
};

// == LABEL ==
export interface LabelProps {
    children: React.ReactNode;
    className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className = '' }) => (
    <span
        className={`
      text-[10px] font-bold uppercase tracking-widest
      text-slate-400 dark:text-white/40
      ${className}
    `.replace(/\s+/g, ' ').trim()}
    >
        {children}
    </span>
);

import React from 'react';

const Logo = ({ className = '', size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: { svg: 'h-6 w-6', text: 'text-sm' },
    md: { svg: 'h-8 w-8', text: 'text-lg' },
    lg: { svg: 'h-10 w-10', text: 'text-2xl' },
    xl: { svg: 'h-14 w-14', text: 'text-3xl' },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        className={`${currentSize.svg} shrink-0`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" /> {/* Sky Blue / Cyan */}
            <stop offset="100%" stopColor="#10b981" /> {/* Emerald Green */}
          </linearGradient>
        </defs>
        {/* Organic leaf-droplet shape */}
        <path
          d="M50 15C69.33 15 85 30.67 85 50C85 69.33 69.33 85 50 85C22 85 15 65 15 50C15 30.67 30.67 15 50 15Z"
          fill="url(#logoGrad)"
        />
        {/* Heartbeat pulse overlay in white */}
        <path
          d="M30 52H40L44 38L50 62L54 46L58 52H70"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-slate-800 dark:text-white leading-none ${currentSize.text}`}>
            Care<span className="text-cyan-600 dark:text-emerald-500">Flow</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

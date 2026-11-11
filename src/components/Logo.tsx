import React from 'react';

export interface LogoProps {
  variant?: 'full' | 'icon' | 'pharmacy';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string | number;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  size = 'md', 
  showText = true, 
  className = '',
  onClick
}) => {
  // Determine pixel size based on size prop
  const getDimension = () => {
    if (typeof size === 'number') return `${size}px`;
    switch (size) {
      case 'xs': return '24px';
      case 'sm': return '32px';
      case 'md': return '44px';
      case 'lg': return '56px';
      case 'xl': return '72px';
      default: return size || '44px';
    }
  };

  const dim = getDimension();

  if (variant === 'icon') {
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        style={{ width: dim, height: dim }}
      >
        <img 
          src="/logo.png" 
          alt="Doctorian AI Permanent Logo" 
          className="w-full h-full object-contain drop-shadow-sm select-none"
        />
      </div>
    );
  }

  if (variant === 'pharmacy') {
    return (
      <div onClick={onClick} className={`flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}>
        <div 
          className="relative rounded-2xl flex items-center justify-center shrink-0 p-1"
          style={{ width: dim, height: dim }}
        >
          <img 
            src="/logo.png" 
            alt="Doctorian AI Permanent Logo" 
            className="w-full h-full object-contain drop-shadow-md select-none"
          />
        </div>
        {showText && (
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              Doctorian <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              E-Pharmacy & Clinical Care • Uganda
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div 
        className="relative rounded-2xl flex items-center justify-center shrink-0"
        style={{ width: dim, height: dim }}
      >
        <img 
          src="/logo.png" 
          alt="Doctorian AI Permanent Logo" 
          className="w-full h-full object-contain drop-shadow-md select-none"
        />
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Doctorian <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AI</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">
            Uganda Clinical Intelligence
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

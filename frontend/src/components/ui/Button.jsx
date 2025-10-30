import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '',
  icon: Icon,
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white hover:shadow-glow-cyan hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'border border-cyan-500 text-cyan-500 bg-transparent hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(0,191,255,0.5)]',
    danger: 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:shadow-glow-red hover:scale-105',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:shadow-glow-emerald hover:scale-105',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
};

export default Button;

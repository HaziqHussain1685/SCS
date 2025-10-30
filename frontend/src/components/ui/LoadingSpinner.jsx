import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', color = 'cyan' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  const colors = {
    cyan: 'text-cyan-500',
    emerald: 'text-emerald-500',
    red: 'text-red-500',
    white: 'text-white',
  };
  
  return (
    <Loader2 className={`${sizes[size]} ${colors[color]} animate-spin`} />
  );
};

export default LoadingSpinner;

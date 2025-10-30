import React from 'react';
import { getRiskColor } from '../../utils/helpers';

const Badge = ({ variant, children, className = '', pulsing = false }) => {
  const colors = getRiskColor(variant);
  
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider
        border ${colors.bg} ${colors.text} ${colors.border}
        ${pulsing ? 'animate-pulse-glow' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;

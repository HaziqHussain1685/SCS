import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  critical = false,
  onClick,
}) => {
  const baseStyles = 'bg-bg-secondary border rounded-xl p-6 backdrop-blur-lg transition-all duration-300';
  const borderColor = critical 
    ? 'border-red-500/30' 
    : 'border-cyan-500/10 hover:border-cyan-500/30';
  const hoverStyles = hover 
    ? 'hover:transform hover:-translate-y-1 hover:shadow-glow-cyan cursor-pointer' 
    : '';
  
  const Component = hover && onClick ? motion.div : 'div';
  const motionProps = hover && onClick ? {
    whileHover: { y: -2 },
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};
  
  return (
    <Component
      className={`${baseStyles} ${borderColor} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export default Card;

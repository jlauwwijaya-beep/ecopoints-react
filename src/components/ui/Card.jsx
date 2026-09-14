import React from 'react';

export function Card({ children, className = '', paper = false, ...props }) {
  return (
    <div className={`card ${paper ? 'card-paper' : ''} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`card-title ${className}`.trim()} {...props}>
      {children}
    </h3>
  );
}

export function CardSubtitle({ children, className = '', ...props }) {
  return (
    <span className={`card-subtitle ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}

export default Card;

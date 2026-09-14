import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';

export default function NavLink({ to, children, className = '', ...props }) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `nav-item ${isActive ? 'nav-item-active' : ''} ${className}`.trim()
      }
      style={({ isActive }) => ({
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: '0.5rem 0.75rem',
        color: isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)',
        backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
        borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontWeight: isActive ? 700 : 500,
        transition: 'all 0.15s ease'
      })}
      {...props}
    >
      {children}
    </RouterNavLink>
  );
}

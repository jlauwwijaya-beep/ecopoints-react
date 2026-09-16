import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppNav from './AppNav';

const adminNavItems = [
  ['Dashboard', '/admin'],
  ['Manajemen Setoran', '/admin/deposits'],
  ['Konfigurasi Poin', '/admin/points'],
  ['Katalog Hadiah', '/admin/rewards'],
  ['Pantau Penukaran', '/admin/redemptions'],
  ['Laporan', '/admin/reports'],
  ['Manajemen Akun', '/admin/users'],
];

export default function AdminNav() {
  const { pathname } = useLocation();

  return (
    <>
      <AppNav />
      <nav style={{
        background: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.75rem 1rem',
      }}>
        <div className="container-wide" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {adminNavItems.map(([label, path]) => {
            const isActive = pathname === path;
            return (
              <Link key={path} to={path} className="btn btn-sm" style={{
                background: isActive ? 'var(--color-ink)' : 'transparent',
                color: isActive ? 'var(--color-paper)' : 'var(--color-ink)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8rem',
              }}>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

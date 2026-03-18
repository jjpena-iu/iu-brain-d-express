import React from 'react';

export default function Topbar({ phase }) {
  return (
    <header style={{
      gridColumn: '1 / -1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '56px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      zIndex: 10,
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/iu-brain-backend-d-express/logo-hiumanlab.png"
            alt="Hiumanlab"
            style={{ height: '22px', display: 'block' }}
          />
        </div>
        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: 'var(--accent2)', letterSpacing: '0.5px' }}>
          iu Brain
        </span>
        {phase && (
          <>
            <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
            <span style={{
              background: 'var(--accent-glow)', border: '1px solid rgba(124,92,252,0.25)',
              borderRadius: '4px', padding: '2px 9px',
              fontSize: '11px', color: 'var(--accent2)', fontWeight: 500,
            }}>{phase}</span>
          </>
        )}
      </div>

      {/* Status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
        borderRadius: '20px', padding: '4px 12px',
        fontSize: '12px', color: 'var(--green)', fontWeight: 500,
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)',
          animation: 'pulse 2s infinite',
        }} />
        Sesión activa
        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }`}</style>
      </div>
    </header>
  );
}

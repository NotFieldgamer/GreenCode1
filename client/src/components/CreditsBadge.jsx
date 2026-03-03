import React from 'react';
import { Zap } from 'lucide-react';
import { useSubscription as useSub } from '../hooks/useSubscription';
import { Link as RLink } from 'react-router-dom';

/* ================= THEME CONSTANTS ================= */
const GOLD = '#ffb84d';
const NEON_RED = '#ef4444';

export default function CreditsBadge() {
  const { credits, isPro, isEnterprise } = useSub();
  
  if (!isPro && !isEnterprise) return null;

  const low = credits <= 5;
  const color = low ? NEON_RED : GOLD;
  const bg = low ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 184, 77, 0.1)';
  const border = low ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 184, 77, 0.3)';

  return (
    <RLink 
      to="/pricing"
      title={low ? "Low credits! Click to refill." : "Generator credits remaining. Click to view plans."}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: bg,
        border: `1px solid ${border}`,
        color: color,
        padding: '0.35rem 0.8rem',
        borderRadius: '100px',
        fontSize: '0.75rem',
        fontWeight: 700,
        textDecoration: 'none',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: `0 0 10px ${color}20`,
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = low ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 184, 77, 0.2)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = bg;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Zap 
        size={14} 
        color={color} 
        fill={low ? 'transparent' : `${GOLD}40`} 
        style={{ animation: low ? 'pulse 2s infinite' : 'none' }} 
      />
      <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{credits}</span>
      <span style={{ marginLeft: '2px' }}>CR</span>
    </RLink>
  );
}
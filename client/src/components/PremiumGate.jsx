import React from 'react';
import { Link } from 'react-router-dom';
import { MdLock } from 'react-icons/md';
import { useSubscription } from '../hooks/useSubscription';

const PLAN_LABELS = { pro: 'Pro', enterprise: 'Enterprise' };
const PLAN_PRICES = { pro: '$9.99/mo', enterprise: '$29.99/mo' };

export default function PremiumGate({ feature = 'pro', requiredPlan = 'pro', children }) {
  const { isPro, isEnterprise, plan } = useSubscription();

  const hasAccess =
    feature === 'enterprise' ? isEnterprise :
    feature === 'generator'  ? (isPro || isEnterprise) :
    feature === 'chat'       ? (isPro || isEnterprise) :
    isPro || isEnterprise;

  if (hasAccess) return children;

  return (
    <div style={{
      position: 'relative',
      borderRadius: 18,
      overflow: 'hidden',
      border: '1px solid rgba(168,85,247,0.25)',
    }}>
      {/* Blurred preview */}
      <div style={{ filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.4 }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(8,8,25,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '0.75rem', textAlign: 'center', padding: '2rem',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', boxShadow: '0 0 30px rgba(124,58,237,0.4)',
        }}>
          <MdLock style={{ color: '#fff' }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
          {PLAN_LABELS[requiredPlan] || 'Pro'} Feature
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 240, lineHeight: 1.7 }}>
          This feature is available on the {PLAN_LABELS[requiredPlan]} plan
          ({PLAN_PRICES[requiredPlan]}).
        </div>
        <Link
          to="/pricing"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            border: 'none', borderRadius: 12, color: '#fff',
            padding: '0.6rem 1.5rem', fontWeight: 700, fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            transition: 'all 0.2s',
          }}
        >
          🚀 Upgrade Now
        </Link>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Current plan: <strong style={{ color: 'var(--cyan)' }}>{plan?.toUpperCase() || 'FREE'}</strong>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

/* ================= THEME CONSTANTS ================= */
const NEON_CYAN = '#00d4ff';
const NEON_PURPLE = '#a78bfa';

const PLAN_LABELS = { pro: 'Pro', enterprise: 'Enterprise' };
const PLAN_PRICES = { pro: '$9.99/mo', enterprise: '$29.99/mo' };

/* ================= INJECTED STYLES ================= */
const gateStyles = `
  .premium-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, ${NEON_PURPLE}, #d8b4fe);
    border: none;
    border-radius: 12px;
    color: #000;
    padding: 0.75rem 1.75rem;
    font-weight: 700;
    font-size: 0.95rem;
    text-decoration: none;
    box-shadow: 0 4px 20px rgba(167, 139, 250, 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .premium-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(167, 139, 250, 0.6);
  }
`;

export default function PremiumGate({ feature = 'pro', requiredPlan = 'pro', children }) {
  const { isPro, isEnterprise, plan } = useSubscription();

  const hasAccess =
    feature === 'enterprise' ? isEnterprise :
    feature === 'generator'  ? (isPro || isEnterprise) :
    feature === 'chat'       ? (isPro || isEnterprise) :
    isPro || isEnterprise;

  if (hasAccess) return children;

  const themeColor = requiredPlan === 'enterprise' ? NEON_PURPLE : NEON_CYAN;

  return (
    <div style={{
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
      border: `1px solid ${themeColor}40`,
      background: 'rgba(255, 255, 255, 0.02)',
    }}>
      <style>{gateStyles}</style>

      {/* Blurred Preview */}
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.3, transition: 'all 0.3s' }}>
        {children}
      </div>

      {/* Glassmorphic Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(10, 10, 20, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1rem', textAlign: 'center', padding: '2rem',
      }}>
        
        {/* Glowing Lock Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: `linear-gradient(135deg, ${themeColor}, #d8b4fe)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 30px ${themeColor}60`,
          marginBottom: '0.5rem'
        }}>
          <Lock size={28} color="#000" />
        </div>
        
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
            {PLAN_LABELS[requiredPlan] || 'Pro'} Feature
          </div>
          <div style={{ fontSize: '0.95rem', color: '#9ca3af', maxWidth: '300px', lineHeight: 1.6, margin: '0 auto' }}>
            Unlock this capability and more with the {PLAN_LABELS[requiredPlan]} plan
            ({PLAN_PRICES[requiredPlan]}).
          </div>
        </div>

        <Link to="/pricing" className="premium-btn">
          <Sparkles size={18} /> Upgrade Now
        </Link>

        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Current plan: <strong style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '4px' }}>{plan?.toUpperCase() || 'FREE'}</strong>
        </div>
      </div>
    </div>
  );
}
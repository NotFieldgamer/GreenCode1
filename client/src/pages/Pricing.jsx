import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, TrendingUp, Zap, Users, Code2, MessageSquare, BarChart3, ChevronDown, ChevronUp, Shield, Cpu, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import api from '../utils/api';
import AppLayout from '../components/AppLayout';

/* ================= THEME CONSTANTS ================= */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';
const NEON_PURPLE = '#a78bfa';

const PLANS = [
  {
    key: 'free', name: 'Free', price: 0, sub: 'Get started, no card required',
    accent: '#9ca3af',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    icon: <Code2 size={24} />,
    badge: null,
    features: [
      { text: '10 analyses / month',        ok: true  },
      { text: 'Basic language tips',         ok: true  },
      { text: 'Complexity Visualizer',       ok: true  },
      { text: 'Global Leaderboard',          ok: true  },
      { text: 'Code Generator',             ok: false },
      { text: 'AI Chat Assistant',          ok: false },
      { text: 'Full analysis reports',      ok: false },
      { text: 'Unlimited history',          ok: false },
      { text: 'Scale projections',          ok: false },
    ],
  },
  {
    key: 'pro', name: 'Pro', price: 9.99, sub: 'For serious developers',
    accent: NEON_CYAN,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    icon: <Zap size={24} />,
    badge: 'Most Popular',
    features: [
      { text: 'Unlimited analyses',          ok: true },
      { text: 'All language tips (6)',       ok: true },
      { text: 'Complexity Visualizer',       ok: true },
      { text: 'Global Leaderboard',          ok: true },
      { text: '50 Generator credits / mo',  ok: true },
      { text: 'AI Chat Assistant',          ok: true },
      { text: 'Full analysis reports',      ok: true },
      { text: 'Unlimited history + Compare', ok: true },
      { text: 'Scale projections (1M runs)', ok: true },
    ],
  },
  {
    key: 'enterprise', name: 'Enterprise', price: 29.99, sub: 'For teams and power users',
    accent: NEON_PURPLE,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    icon: <Users size={24} />,
    badge: 'Best Value',
    features: [
      { text: 'Everything in Pro',           ok: true },
      { text: '300 Generator credits / mo', ok: true },
      { text: 'Bulk analysis (10 files)',   ok: true },
      { text: 'REST API access key',        ok: true },
      { text: 'Team workspace (10)',         ok: true },
      { text: 'Priority analysis queue',    ok: true },
      { text: 'Admin subscription panel',   ok: true },
      { text: 'Priority support',           ok: true },
      { text: 'Custom PDF reports',         ok: true },
    ],
  },
];

const FAQS = [
  { q: 'Is my payment information safe?', a: 'This is currently demo mode — no real payment is processed. In production, all payments would be handled securely via Stripe with end-to-end encryption.' },
  { q: 'Can I switch plans?', a: 'Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately. Credits reset on each billing cycle.' },
  { q: 'What happens when I run out of credits?', a: 'You\'ll see how many credits remain in the navbar. When you run out, you can still use everything else — just the Code Generator requires credits.' },
  { q: 'What languages does the Code Generator support?', a: 'Currently: JavaScript, TypeScript, Python, Java, Go, Rust, C++, PHP, and Ruby. New templates are added regularly.' },
  { q: 'Is the CO₂ data real?', a: 'The energy estimation model is based on published research on software energy consumption. The exact figures are approximations for educational purposes.' },
];

const COMPARISON = [
  ['Analyses / month',    '10',  'Unlimited', 'Unlimited'],
  ['Code Analyzer',       true,  true,        true],
  ['Complexity Chart',    true,  true,        true],
  ['Leaderboard',         true,  true,        true],
  ['Generator credits',   '—',   '50 / mo',   '300 / mo'],
  ['AI Chat',             false, true,        true],
  ['Analysis history',    '5',   'Unlimited', 'Unlimited'],
  ['Compare analyses',    false, true,        true],
  ['Scale projections',   false, true,        true],
  ['Bulk analysis',       false, false,       '10 files'],
  ['API access',          false, false,       true],
  ['Team workspace',      false, false,       '10 members'],
  ['PDF reports',         false, true,        true],
];

/* ================= INJECTED STYLES ================= */
const pricingStyles = `
  .glass-pricing-card {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 20px;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    position: relative;
    backdrop-filter: blur(12px);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .glass-pricing-card:hover {
    transform: translateY(-5px);
  }

  .faq-btn {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    width: 100%;
    text-align: left;
    padding: 1.25rem 1.5rem;
    color: #fff;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;
  }

  .faq-btn:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

function CellValue({ val, color }) {
  if (val === true) return <Check size={18} color={color} style={{ margin: 'auto' }} />;
  if (val === false) return <X size={16} color="rgba(255,255,255,0.2)" style={{ margin: 'auto' }} />;
  return <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 600, color: '#e5e7eb' }}>{val}</span>;
}

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { plan: currentPlan, refresh } = useSubscription();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);
  
  async function handleUpgrade(planKey) {
    if (!isAuthenticated) { navigate('/register'); return; }
    if (planKey === 'free') return;
    setUpgrading(planKey);
    try {
      await api.post('/user/upgrade', { plan: planKey });
      await refresh();
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    } finally { setUpgrading(null); }
  }
  
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#05050f', color: '#fff' }}>
      <style>{pricingStyles}</style>
      
      {/* Dynamic Background */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(0, 212, 255, 0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>
          <div style={{ width: 32, height: 32, background: NEON_GREEN, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${NEON_GREEN}40` }}>
            <TrendingUp size={18} color="#000" />
          </div>
          GreenCode
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAuthenticated ? (
            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600 }}>
                Sign In
              </button>
              <button onClick={() => navigate('/register')} style={{ background: NEON_CYAN, color: '#000', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, boxShadow: `0 4px 15px ${NEON_CYAN}40` }}>
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 5rem', position: 'relative', zIndex: 10 }}>
        
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 255, 204, 0.1)', border: `1px solid rgba(0, 255, 204, 0.3)`, borderRadius: 100, padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: NEON_GREEN, marginBottom: '1.5rem' }}>
            <Shield size={14} /> Simple, transparent pricing
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Choose Your Impact
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#9ca3af', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Start optimizing for free. Upgrade to unlock the AI Code Generator, bulk analysis, and advanced sustainability tracking.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.key;
            const isHighlight = plan.key === 'pro';
            
            return (
              <div
                key={plan.key}
                className="glass-pricing-card"
                style={{
                  background: isHighlight ? 'rgba(0, 212, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isCurrent ? plan.accent : plan.borderColor}`,
                  boxShadow: isHighlight ? `0 10px 40px ${NEON_CYAN}15` : 'none'
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: plan.key === 'enterprise' ? `linear-gradient(135deg, ${NEON_PURPLE}, #d8b4fe)` : `linear-gradient(135deg, ${NEON_GREEN}, ${NEON_CYAN})`,
                    borderRadius: 100, padding: '0.3rem 1rem', fontSize: '0.75rem', fontWeight: 800,
                    color: '#000', whiteSpace: 'nowrap', letterSpacing: '0.5px', boxShadow: `0 4px 10px ${plan.accent}40`
                  }}>
                    {plan.badge.toUpperCase()}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: plan.accent, marginBottom: '1rem' }}>
                  {plan.icon}
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{plan.name}</h3>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '2rem', height: '40px' }}>{plan.sub}</div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '3.5rem', color: '#fff', letterSpacing: '-2px' }}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span style={{ color: '#6b7280', fontSize: '1rem', marginLeft: '0.25rem', fontWeight: 500 }}>/ mo</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, marginBottom: '2.5rem' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: f.ok ? '#e5e7eb' : '#6b7280' }}>
                      {f.ok ? <Check size={18} color={plan.accent} style={{ flexShrink: 0 }} /> : <X size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />}
                      {f.text}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={isCurrent || plan.key === 'free' || upgrading === plan.key}
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '12px', border: 'none',
                    background: isCurrent ? 'rgba(255,255,255,0.1)' : plan.key === 'enterprise' ? NEON_PURPLE : plan.key === 'pro' ? NEON_CYAN : 'rgba(255,255,255,0.05)',
                    color: isCurrent ? '#9ca3af' : plan.key === 'free' ? '#fff' : '#000',
                    fontWeight: 700, fontSize: '1rem', cursor: isCurrent || plan.key === 'free' ? 'default' : 'pointer',
                    transition: 'all 0.2s', border: plan.key === 'free' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    boxShadow: !isCurrent && plan.key !== 'free' ? `0 4px 15px ${plan.accent}40` : 'none'
                  }}
                >
                  {isCurrent ? 'Current Plan' : upgrading === plan.key ? 'Processing...' : plan.key === 'free' ? 'Get Started Free' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem' }}>Compare Features</h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.1rem', width: '40%' }}>Capabilities</th>
                  <th style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', textAlign: 'center', fontSize: '1.1rem' }}>Free</th>
                  <th style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: NEON_CYAN, textAlign: 'center', fontSize: '1.1rem' }}>Pro</th>
                  <th style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: NEON_PURPLE, textAlign: 'center', fontSize: '1.1rem' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([feat, free, pro, ent], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem', color: '#d1d5db', fontWeight: 500 }}>{feat}</td>
                    <td style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}><CellValue val={free} color="#9ca3af" /></td>
                    <td style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', background: 'rgba(0, 212, 255, 0.02)' }}><CellValue val={pro} color={NEON_CYAN} /></td>
                    <td style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}><CellValue val={ent} color={NEON_PURPLE} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', border: faqOpen === i ? `1px solid ${NEON_CYAN}40` : '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  className="faq-btn"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ background: faqOpen === i ? 'rgba(0, 212, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)' }}
                >
                  {faq.q}
                  {faqOpen === i ? <ChevronUp size={20} color={NEON_CYAN} /> : <ChevronDown size={20} color="#6b7280" />}
                </button>
                {faqOpen === i && (
                  <div style={{ padding: '1.5rem', fontSize: '0.95rem', color: '#9ca3af', lineHeight: 1.6, background: 'rgba(0,0,0,0.3)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
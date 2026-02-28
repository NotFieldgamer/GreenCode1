import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, TrendingUp, Zap, Users, Code2, MessageSquare, BarChart3, ChevronDown, ChevronUp, Shield, Cpu, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import api from '../utils/api';

const PLANS = [
  {
    key: 'free', name: 'Free', price: 0, sub: 'Get started, no card required',
    accent: 'var(--text-secondary)',
    borderColor: 'var(--glass-border)',
    icon: <Code2 size={20} />,
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
    accent: 'var(--cyan)',
    borderColor: 'rgba(0,212,255,0.3)',
    icon: <Zap size={20} />,
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
    accent: '#a78bfa',
    borderColor: 'rgba(167,139,250,0.3)',
    icon: <Users size={20} />,
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
  { q: 'Is the CO\u2082 data real?', a: 'The energy estimation model is based on published research on software energy consumption. The exact figures are approximations for educational purposes.' },
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

function CellValue({ val, color }) {
  if (val === true) return <Check size={15} color={color} style={{ margin: 'auto' }} />;
  if (val === false) return <X size={14} color="var(--text-muted)" style={{ margin: 'auto', opacity: 0.5 }} />;
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{val}</span>;
}

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { plan: currentPlan } = useSubscription();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(null);
  const [faqOpen, setFaqOpen]     = useState(null);

  async function handleUpgrade(planKey) {
    if (!isAuthenticated) { navigate('/register'); return; }
    if (planKey === 'free') return;
    setUpgrading(planKey);
    try {
      await api.post('/user/upgrade', { plan: planKey });
      navigate('/dashboard');
      await new Promise(r => setTimeout(r, 500));
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally { setUpgrading(null); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Navbar */}
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.45rem 0.875rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.1rem' }}>
            <div style={{ width: 30, height: 30, background: 'var(--green)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#000" />
            </div>
            GreenCode
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isAuthenticated
            ? <Link to="/dashboard" className="btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Dashboard</Link>
            : <>
                <Link to="/login" className="btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Sign In</Link>
                <Link to="/register" className="btn-primary btn-sm" style={{ textDecoration: 'none' }}>Get Started</Link>
              </>
          }
        </div>
      </header>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '4rem 1.5rem' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.12)', borderRadius: 100, padding: '0.35rem 1rem', fontSize: '0.78rem', fontWeight: 500, color: 'var(--green)', marginBottom: '1.25rem' }}>
            <Shield size={12} /> Simple, transparent pricing
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 500, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Pricing
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            Start free. Upgrade when you need the Code Generator, AI Chat, and team features.
          </p>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '5rem' }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.key;
            const isHighlight = plan.key === 'pro';
            return (
              <div
                key={plan.key}
                className="plan-card"
                style={{
                  background: isHighlight ? 'rgba(0,212,255,0.03)' : 'var(--glass-bg)',
                  border: `1px solid ${isCurrent ? plan.accent : plan.borderColor}`,
                  borderRadius: 20, padding: '2rem',
                  display: 'flex', flexDirection: 'column', gap: '0.25rem',
                  position: 'relative',
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: plan.key === 'enterprise' ? '#7c3aed' : 'var(--cyan)',
                    borderRadius: 100, padding: '0.2rem 0.8rem',
                    fontSize: '0.7rem', fontWeight: 600,
                    color: plan.key === 'enterprise' ? '#fff' : '#000',
                    whiteSpace: 'nowrap', letterSpacing: '0.04em',
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ color: plan.accent, marginBottom: '0.75rem' }}>{plan.icon}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: plan.accent, marginBottom: '0.2rem' }}>{plan.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{plan.sub}</div>

                {/* Price */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '2.8rem', color: 'var(--text-primary)' }}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginLeft: '0.25rem' }}>/mo</span>}
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1, marginBottom: '1.75rem' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.855rem', color: f.ok ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                      {f.ok
                        ? <Check size={14} color={plan.accent} style={{ flexShrink: 0 }} />
                        : <X size={13} color="var(--text-muted)" style={{ flexShrink: 0, opacity: 0.4 }} />
                      }
                      {f.text}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={isCurrent || plan.key === 'free' || upgrading === plan.key}
                  style={{
                    padding: '0.8rem', borderRadius: 12, border: isCurrent ? '1px solid var(--glass-border)' : 'none',
                    background: isCurrent ? 'transparent' : plan.key === 'enterprise' ? '#7c3aed' : plan.key === 'pro' ? 'var(--cyan)' : 'var(--glass-bg)',
                    color: isCurrent ? 'var(--text-muted)' : plan.key === 'free' ? 'var(--text-secondary)' : plan.key === 'enterprise' ? '#fff' : '#000',
                    fontWeight: 600, fontSize: '0.9rem',
                    cursor: isCurrent || plan.key === 'free' ? 'default' : 'pointer',
                    transition: 'all 0.2s', fontFamily: 'var(--font-base)',
                  }}
                >
                  {isCurrent ? 'Current Plan' : upgrading === plan.key ? 'Processing...' : plan.key === 'free' ? 'Get Started Free' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 500, textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>
            Feature Comparison
          </h2>
          <div className="table-card">
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Feature</th>
                  <th style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Free</th>
                  <th style={{ textAlign: 'center', color: 'var(--cyan)' }}>Pro</th>
                  <th style={{ textAlign: 'center', color: '#a78bfa' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([feat, free, pro, ent], i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '0.865rem', fontWeight: 500 }}>{feat}</td>
                    <td style={{ textAlign: 'center' }}><CellValue val={free} color="var(--text-muted)" /></td>
                    <td style={{ textAlign: 'center' }}><CellValue val={pro} color="var(--cyan)" /></td>
                    <td style={{ textAlign: 'center' }}><CellValue val={ent} color="#a78bfa" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 500, textAlign: 'center', marginBottom: '2rem' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '1rem 1.25rem', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
                >
                  {faq.q}
                  {faqOpen === i ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </button>
                {faqOpen === i && (
                  <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.75, borderTop: '1px solid var(--glass-border)' }}>
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

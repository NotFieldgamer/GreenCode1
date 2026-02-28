import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, BarChart3, Zap, Leaf, Lock, Gem, Trophy, Check, TrendingUp } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { toast, ToastContainer } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import api from '../utils/api';

function AchievementBadge({ badge }) {
  return (
    <div
      title={`${badge.name}: ${badge.desc}${badge.unlocked ? `\nUnlocked: ${new Date(badge.unlockedAt).toLocaleDateString()}` : ''}`}
      style={{
        background: badge.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${badge.unlocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 14,
        padding: '0.875rem 0.75rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center',
        opacity: badge.unlocked ? 1 : 0.4,
        filter: badge.unlocked ? 'none' : 'grayscale(1)',
        transition: 'all 0.2s',
        cursor: 'default',
        position: 'relative',
      }}
    >
      {/* Icon — use a star/trophy Lucide icon based on badge type */}
      <div style={{ color: badge.unlocked ? 'var(--amber)' : 'var(--text-muted)' }}>
        <Trophy size={22} />
      </div>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: badge.unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {badge.name}
      </div>
      {!badge.unlocked && badge.progress && (
        <div style={{ width: '100%' }}>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 2 }}>
            <div style={{ height: '100%', width: `${Math.min(100, (badge.progress.current / badge.progress.max) * 100)}%`, background: 'var(--green)', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{badge.progress.current}/{badge.progress.max}</div>
        </div>
      )}
      {badge.unlocked && (
        <div style={{ position: 'absolute', top: 6, right: 8 }}>
          <Check size={11} color="var(--green)" />
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { plan, planName, credits, creditsResetAt, isPro, isEnterprise, displayCurrency, refresh: refreshSub } = useSubscription();
  const [stats, setStats]         = useState(null);
  const [achievements, setAch]    = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pwForm, setPwForm]       = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg]         = useState('');
  const [currency, setCurrencyLocal] = useState(displayCurrency || 'USD');
  const CURRENCIES = ['USD','EUR','GBP','INR','JPY','CAD','AUD'];
  const PLAN_COLORS = { free: 'var(--text-muted)', pro: 'var(--cyan)', enterprise: '#a78bfa' };

  useEffect(() => {
    Promise.all([api.get('/user/stats'), api.get('/achievements/me')])
      .then(([s, a]) => { setStats(s.data); setAch(a.data); })
      .finally(() => setLoading(false));
  }, []);

  function handlePwSubmit(e) {
    e.preventDefault();
    if (pwForm.next.length < 6) { setPwMsg('Password must be at least 6 characters'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwMsg('Passwords do not match'); return; }
    setPwMsg('');
    toast('Password changed successfully! (demo only)', 'success');
    setPwForm({ current: '', next: '', confirm: '' });
  }

  async function handleCurrencyChange(cur) {
    setCurrencyLocal(cur);
    try {
      await api.post('/user/currency', { currency: cur });
      await refreshSub();
      toast(`Currency set to ${cur}`, 'success');
    } catch { toast('Failed to update currency', 'error'); }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <AppLayout title="Profile">
      <ToastContainer />
      <h1 className="section-title">My Profile</h1>
      <p className="section-sub">Account details, achievements, and sustainability stats.</p>

      {loading ? (
        <div className="page-loader" style={{ minHeight: 300 }}><div className="loader-ring" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* User card */}
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.25rem' }}>{user?.avatar}</div>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{user?.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
                    <span className={`badge ${user?.role === 'admin' ? 'badge-purple' : 'badge-cyan'}`} style={{ marginTop: '0.4rem', display: 'inline-flex' }}>{user?.role}</span>
                  </div>
                </div>
                {[
                  { label: 'Member Since',    value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
                  { label: 'Account Status',  value: 'Active' },
                  { label: 'Badges Unlocked', value: `${unlockedCount} / ${achievements.length}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', borderRadius: 10, background: 'rgba(255,255,255,0.03)', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{row.label}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Plan info card */}
              <div className="plan-info-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <Gem size={16} color={PLAN_COLORS[plan]} />
                    <span style={{ color: PLAN_COLORS[plan] }}>{planName} Plan</span>
                  </div>
                  {plan === 'free' && (
                    <Link
                      to="/pricing"
                      style={{ background: '#7c3aed', borderRadius: 10, padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, color: '#fff', textDecoration: 'none' }}
                    >
                      Upgrade
                    </Link>
                  )}
                </div>
                {(isPro || isEnterprise) && (
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Generator Credits: </span>
                    <span style={{ color: credits <= 5 ? 'var(--red)' : 'var(--green)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{credits}</span>
                    {creditsResetAt && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> · resets {new Date(creditsResetAt).toLocaleDateString()}</span>}
                  </div>
                )}
                {/* Currency selector */}
                <div style={{ marginTop: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Display currency:</span>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {CURRENCIES.map(cur => (
                      <button
                        key={cur}
                        onClick={() => handleCurrencyChange(cur)}
                        style={{ background: currency === cur ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${currency === cur ? 'var(--green)' : 'var(--glass-border)'}`, borderRadius: 8, color: currency === cur ? 'var(--green)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: currency === cur ? 700 : 400, padding: '0.25rem 0.5rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-mono)' }}
                      >{cur}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Change password */}
              <div className="glass-card">
                <div style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={15} color="var(--cyan)" /> Change Password
                </div>
                {pwMsg && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{pwMsg}</div>}
                <form onSubmit={handlePwSubmit}>
                  {[
                    { key: 'current', placeholder: 'Current password' },
                    { key: 'next',    placeholder: 'New password (min 6)' },
                    { key: 'confirm', placeholder: 'Confirm new password' },
                  ].map(f => (
                    <div className="form-group" key={f.key}>
                      <input type="password" className="neu-input" placeholder={f.placeholder}
                        value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                  <button className="btn-primary" style={{ width: '100%' }}>Update Password</button>
                </form>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-card">
              <div style={{ fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={16} color="var(--cyan)" /> Sustainability Stats
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats && [
                  { icon: <BarChart3 size={15} />, label: 'Total Analyses',    value: stats.totalAnalyses,    color: 'var(--cyan)',  suffix: '' },
                  { icon: <Leaf size={15} />,      label: 'Avg Sust. Score',   value: stats.avgSustainability, color: 'var(--green)', suffix: '/100' },
                  { icon: <Zap size={15} />,       label: 'Energy Saved (kWh)', value: stats.totalEnergySaved, color: 'var(--amber)', suffix: ' kWh' },
                  { icon: <TrendingUp size={15} />, label: 'CO\u2082 Offset (g)',    value: stats.totalCO2Offset,   color: '#f87171',     suffix: ' g' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <span style={{ color: s.color }}>{s.icon}</span>{s.label}
                    </div>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}{s.suffix}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="glass-card">
              <div style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={16} color="var(--amber)" />
                  Achievements ({unlockedCount}/{achievements.length})
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {achievements.length - unlockedCount > 0
                    ? `${achievements.length - unlockedCount} more to unlock`
                    : 'All unlocked'
                  }
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.6rem' }}>
                {achievements.map(badge => <AchievementBadge key={badge.id} badge={badge} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

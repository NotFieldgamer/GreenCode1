import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, BarChart3, Zap, Leaf, Lock, Gem, Trophy, Check, TrendingUp, Loader2, ShieldCheck, KeyRound ,Code2 } from 'lucide-react';

// Assuming these match your project structure
import { toast, ToastContainer } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import api from '../utils/api';

/* ================= THEME CONSTANTS ================= */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';
const NEON_PURPLE = '#a78bfa';
const GOLD = '#ffb84d';

const PLAN_COLORS = { 
  free: '#9ca3af', 
  pro: NEON_CYAN, 
  enterprise: NEON_PURPLE 
};

/* ================= INJECTED STYLES ================= */
const profileStyles = `
  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 1.5rem;
    align-items: start;
  }

  @media (max-width: 992px) {
    .profile-grid {
      grid-template-columns: 1fr;
    }
  }

  .glass-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(12px);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }

  .glass-panel:hover {
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  }

  .profile-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
    margin-bottom: 1rem;
  }

  .profile-input:focus {
    border-color: ${NEON_CYAN};
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.15);
  }

  .btn-primary {
    width: 100%;
    background: linear-gradient(135deg, ${NEON_GREEN}, ${NEON_CYAN});
    color: #000;
    border: none;
    border-radius: 10px;
    padding: 0.75rem 1.5rem;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 255, 204, 0.3);
  }

  .currency-btn {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: #9ca3af;
    font-size: 0.75rem;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Fira Code', monospace;
  }
  
  .currency-btn:hover {
    background: rgba(255,255,255,0.08);
  }

  .currency-btn.active {
    background: rgba(0, 255, 204, 0.1);
    border-color: ${NEON_GREEN};
    color: ${NEON_GREEN};
    font-weight: 700;
  }
`;

/* ================= ACHIEVEMENT BADGE ================= */
function AchievementBadge({ badge }) {
  const isUnlocked = badge.unlocked;
  
  return (
    <div
      title={`${badge.name}: ${badge.desc}${isUnlocked ? `\nUnlocked: ${new Date(badge.unlockedAt).toLocaleDateString()}` : ''}`}
      style={{
        background: isUnlocked ? 'rgba(255, 184, 77, 0.05)' : 'rgba(0, 0, 0, 0.3)',
        border: `1px solid ${isUnlocked ? 'rgba(255, 184, 77, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
        borderRadius: '16px',
        padding: '1.25rem 1rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', textAlign: 'center',
        opacity: isUnlocked ? 1 : 0.6,
        filter: isUnlocked ? 'none' : 'grayscale(0.8)',
        transition: 'all 0.3s',
        cursor: 'default',
        position: 'relative',
        boxShadow: isUnlocked ? `0 4px 20px rgba(255, 184, 77, 0.1)` : 'none'
      }}
      onMouseEnter={e => { if(isUnlocked) e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { if(isUnlocked) e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ 
        width: 48, height: 48, borderRadius: '50%', 
        background: isUnlocked ? `linear-gradient(135deg, ${GOLD}, #f59e0b)` : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isUnlocked ? '#000' : '#6b7280',
        boxShadow: isUnlocked ? `0 0 15px ${GOLD}60` : 'none',
        marginBottom: '0.2rem'
      }}>
        <Trophy size={22} />
      </div>
      
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isUnlocked ? '#fff' : '#9ca3af', lineHeight: 1.2 }}>
        {badge.name}
      </div>

      {!isUnlocked && badge.progress && (
        <div style={{ width: '100%', marginTop: '0.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#6b7280', marginBottom: '4px', fontFamily: 'monospace' }}>
            <span>PROGRESS</span>
            <span>{badge.progress.current}/{badge.progress.max}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (badge.progress.current / badge.progress.max) * 100)}%`, background: '#6b7280', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {isUnlocked && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '2px' }}>
          <Check size={12} color={GOLD} />
        </div>
      )}
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */
export default function Profile() {
  const { user } = useAuth();
  const { plan, planName, credits, creditsResetAt, isPro, isEnterprise, displayCurrency, refresh: refreshSub } = useSubscription();
  
  const [stats, setStats] = useState(null);
  const [achievements, setAch] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  
  const [currency, setCurrencyLocal] = useState(displayCurrency || 'USD');
  const CURRENCIES = ['USD','EUR','GBP','INR','JPY','CAD','AUD'];

  useEffect(() => {
    Promise.all([
      api.get('/user/stats').catch(() => ({ data: { totalAnalyses: 0, avgSustainability: 0, totalEnergySaved: 0, totalCO2Offset: 0 } })), 
      api.get('/achievements/me').catch(() => ({ data: [] }))
    ])
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
    } catch { 
      toast('Failed to update currency', 'error'); 
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <style>{profileStyles}</style>
      <ToastContainer />
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <User size={28} color={NEON_CYAN} /> My Profile
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1.05rem', margin: 0 }}>
          Manage your account details, preferences, and view your sustainability legacy.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '1rem' }}>
          <Loader2 size={32} color={NEON_CYAN} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', letterSpacing: '1px' }}>LOADING PROFILE...</div>
        </div>
      ) : (
        <div className="profile-grid">
          
          {/* ================= LEFT COLUMN ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* User Identity Card */}
            <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Decorative Background Glow */}
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: `${NEON_CYAN}20`, filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ 
                  width: 80, height: 80, borderRadius: '20px', 
                  background: `linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,204,0.1))`, 
                  border: `1px solid ${NEON_CYAN}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase',
                  boxShadow: `0 8px 25px ${NEON_CYAN}20`
                }}>
                  {user?.avatar || user?.name?.[0] || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>{user?.name || 'Developer'}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    <Mail size={14} /> {user?.email || 'user@example.com'}
                  </div>
                  <span style={{ 
                    background: user?.role === 'admin' ? 'rgba(167, 139, 250, 0.15)' : 'rgba(0, 212, 255, 0.15)', 
                    color: user?.role === 'admin' ? NEON_PURPLE : NEON_CYAN, 
                    border: `1px solid ${user?.role === 'admin' ? NEON_PURPLE : NEON_CYAN}40`,
                    padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' 
                  }}>
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Just now' },
                  { label: 'Account Status', value: <span style={{ color: NEON_GREEN, display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14}/> Active</span> },
                  { label: 'Badges Unlocked', value: `${unlockedCount} / ${achievements.length || 0}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e5e7eb' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan & Billing Card */}
            <div className="glass-panel" style={{ borderTop: `3px solid ${PLAN_COLORS[plan] || '#fff'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>
                  <Gem size={20} color={PLAN_COLORS[plan] || '#fff'} style={{ filter: `drop-shadow(0 0 8px ${PLAN_COLORS[plan]}80)` }} />
                  {planName || 'Free'} Plan
                </div>
                {plan === 'free' && (
                  <Link to="/pricing" style={{ background: `linear-gradient(135deg, ${NEON_PURPLE}, #d8b4fe)`, borderRadius: '8px', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#000', textDecoration: 'none', boxShadow: `0 4px 15px ${NEON_PURPLE}40`, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    Upgrade
                  </Link>
                )}
              </div>

              {(isPro || isEnterprise) && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>AI Generator Credits</span>
                    <span style={{ color: credits <= 5 ? '#ef4444' : NEON_GREEN, fontWeight: 800, fontSize: '1.2rem', fontFamily: 'monospace' }}>{credits}</span>
                  </div>
                  {creditsResetAt && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={12} /> Resets on {new Date(creditsResetAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}

              {/* Currency Selector */}
              <div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Display Currency</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {CURRENCIES.map(cur => (
                    <button
                      key={cur}
                      className={`currency-btn ${currency === cur ? 'active' : ''}`}
                      onClick={() => handleCurrencyChange(cur)}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="glass-panel">
              <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <KeyRound size={18} color={NEON_CYAN} /> Security Settings
              </div>
              
              {pwMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {pwMsg}
                </div>
              )}
              
              <form onSubmit={handlePwSubmit}>
                {[
                  { key: 'current', placeholder: 'Current password' },
                  { key: 'next', placeholder: 'New password (min 6 chars)' },
                  { key: 'confirm', placeholder: 'Confirm new password' },
                ].map(f => (
                  <input 
                    key={f.key}
                    type="password" 
                    className="profile-input" 
                    placeholder={f.placeholder}
                    value={pwForm[f.key]} 
                    onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} 
                  />
                ))}
                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                  Update Password
                </button>
              </form>
            </div>

          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Mini Stats Grid */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
                <BarChart3 size={20} color={NEON_GREEN} /> Lifetime Impact
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {stats && [
                  { icon: <Code2 size={18} />, label: 'Total Scans', value: stats.totalAnalyses || 0, color: NEON_CYAN, glow: 'rgba(0, 212, 255, 0.1)' },
                  { icon: <Leaf size={18} />, label: 'Avg Score', value: stats.avgSustainability || 0, color: NEON_GREEN, glow: 'rgba(0, 255, 204, 0.1)', suffix: '/100' },
                  { icon: <Zap size={18} />, label: 'Energy Saved', value: stats.totalEnergySaved || 0, color: GOLD, glow: 'rgba(255, 184, 77, 0.1)', suffix: ' kWh' },
                  { icon: <TrendingUp size={18} />, label: 'CO₂ Offset', value: stats.totalCO2Offset || 0, color: '#f87171', glow: 'rgba(248, 113, 113, 0.1)', suffix: ' g' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.85rem', fontWeight: 500 }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '6px', background: s.glow, color: s.color }}>{s.icon}</span>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                      {s.value}<span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 600, marginLeft: '2px' }}>{s.suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements Board */}
            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
                  <Trophy size={20} color={GOLD} style={{ filter: `drop-shadow(0 0 8px ${GOLD}80)` }} />
                  Trophy Cabinet
                </div>
                <div style={{ background: 'rgba(255, 184, 77, 0.1)', border: `1px solid rgba(255, 184, 77, 0.3)`, color: GOLD, padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {unlockedCount} / {achievements.length || 0} Unlocked
                </div>
              </div>
              
              {achievements.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                  {achievements.map(badge => <AchievementBadge key={badge.id} badge={badge} />)}
                </div>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  Start analyzing code to earn your first sustainability badges!
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
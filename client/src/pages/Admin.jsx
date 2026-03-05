import React, { useState, useEffect, useMemo } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import Page from '../components/Page';
import {
  MdPeople, MdCode, MdBolt, MdShield,
  MdToggleOn, MdToggleOff, MdDelete, MdGpsFixed, MdDiamond, MdAutoAwesome
} from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import { toast, ToastContainer } from '../components/Toast';
import api from '../utils/api';

/* ================= THEME CONSTANTS ================= */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';
const NEON_PURPLE = '#a78bfa';
const NEON_RED = '#ef4444';
const GOLD = '#ffb84d';

const PIE_COLORS = [NEON_RED, GOLD, NEON_CYAN, NEON_PURPLE, NEON_GREEN, '#ec4899'];
const TABS = ['Overview', 'Users', 'Detections', 'Subscriptions', 'Energy'];

/* ================= INJECTED STYLES ================= */
const adminStyles = `
  .glass-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(12px);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    width: 100%;
    box-sizing: border-box;
    min-width: 0; /* CRITICAL: Stops flex/grid children from overflowing */
  }

  .glass-panel:hover {
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  }

  .admin-tab {
    padding: 0.6rem 1.25rem;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    color: #9ca3af;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap; /* Keeps tab text on one line */
  }

  .admin-tab:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  .admin-tab.active {
    background: rgba(0, 212, 255, 0.1);
    border-color: rgba(0, 212, 255, 0.3);
    color: ${NEON_CYAN};
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.1);
  }

  .glass-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    text-align: left;
    min-width: 800px; /* Forces wide table, allows parent wrapper to scroll horizontally */
  }

  .glass-table th {
    color: #9ca3af;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0,0,0,0.2);
    white-space: nowrap;
  }

  .glass-table td {
    padding: 1rem;
    color: #e5e7eb;
    font-size: 0.95rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: background 0.2s;
  }

  .glass-table tr:hover td {
    background: rgba(255, 255, 255, 0.03);
  }

  .glass-table tr:last-child td {
    border-bottom: none;
  }

  .admin-input, .admin-select {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .admin-input:focus, .admin-select:focus {
    border-color: ${NEON_CYAN};
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.15);
  }

  .admin-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 14px;
    padding-right: 2.5rem;
  }

  .recharts-tooltip-wrapper .glass-tooltip {
    background: rgba(10, 10, 20, 0.95) !important;
    border: 1px solid rgba(0, 212, 255, 0.3) !important;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    color: #fff;
  }

  /* MOBILE RESPONSIVENESS */
  @media (max-width: 768px) {
    .glass-panel {
      padding: 1.25rem 1rem !important;
    }
  }
`;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-tooltip">
      <p style={{ color: '#9ca3af', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: '#d1d5db' }}>{p.name}:</span> <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const { refresh } = useSubscription();
  const [detections, setDetections] = useState([]);
  const [subs, setSubs] = useState({ subscriptions: [], monthlyRevenue: '0.00', PLANS: {} });
  const [loading, setLoading] = useState(true);
  const [creditInputs, setCreditInputs] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.active) ||
        (statusFilter === 'suspended' && !u.active);

      const matchesRole =
        roleFilter === 'all' ||
        u.role == roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  async function loadAdminData() {
    try {
      const statsRes = await api.get('/admin/stats').catch(() => null);
      const usersRes = await api.get('/admin/users').catch(() => null);
      const detRes = await api.get('/admin/detections').catch(() => null);
      const subsRes = await api.get('/admin/subscriptions').catch(() => null);

      if (statsRes) setStats(statsRes.data);
      if (usersRes) setUsers(usersRes.data);
      if (detRes) setDetections(detRes.data);
      if (subsRes) setSubs(subsRes.data);
    } catch (err) {
      toast('Admin data partially loaded', 'info');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 15000);
    return () => clearInterval(interval);
  }, []);

  async function toggleUser(id) {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      setUsers(u => u.map(x => x.id === id ? { ...x, active: data.active } : x));
      toast(`User ${data.active ? 'activated' : 'suspended'}`, data.active ? 'success' : 'info');
    } catch { toast('Action failed', 'error'); }
  }

  async function deleteUser(id, name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(u => u.filter(x => x.id !== id));
      toast('User deleted', 'info');
    } catch { toast('Delete failed', 'error'); }
  }

  async function changePlan(userId, plan) {
    try {
      await api.put(`/admin/users/${userId}/plan`, { plan });
      setSubs(s => ({
        ...s,
        subscriptions: s.subscriptions.map(u =>
          u.id === userId ? { ...u, plan, planName: s.PLANS?.[plan]?.name } : u
        )
      }));
      await refresh();
      toast(`Plan updated to ${plan}`, 'success');
    } catch {
      toast('Plan update failed', 'error');
    }
    await loadAdminData();
  }

  async function grantCredits(userId, amount) {
    if (!amount) return;
    try {
      const { data } = await api.put(`/admin/users/${userId}/credits`, { amount: parseInt(amount) });
      setSubs(s => ({ ...s, subscriptions: s.subscriptions.map(u => u.id === userId ? { ...u, credits: data.credits } : u) }));
      await refresh();
      setCreditInputs(p => ({ ...p, [userId]: '' }));
      toast(`Granted ${amount} credits`, 'success');
    } catch { toast('Grant failed', 'error'); }
    await loadAdminData();
  }

  const SEV_MAP = { 
    high: { color: NEON_RED, bg: 'rgba(239, 68, 68, 0.1)' }, 
    medium: { color: GOLD, bg: 'rgba(255, 184, 77, 0.1)' }, 
    low: { color: NEON_GREEN, bg: 'rgba(0, 255, 204, 0.1)' } 
  };

  return (
    <Page title="Admin Control Center" desc="Platform-wide analytics, user management, and detection logs.">
      <style>{adminStyles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem', width: '100%', boxSizing: 'border-box' }}>
        <ToastContainer />

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', width: '100%' }}>
          {TABS.map(t => (
            <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'Overview' && <MdGpsFixed size={16} />}
              {t === 'Users' && <MdPeople size={16} />}
              {t === 'Detections' && <MdCode size={16} />}
              {t === 'Subscriptions' && <MdDiamond size={16} />}
              {t === 'Energy' && <MdBolt size={16} />}
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
            <Loader2 size={32} color={NEON_CYAN} style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ color: '#9ca3af', fontSize: '0.9rem', letterSpacing: '1px' }}>SYNCING ADMIN DATA...</div>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === 'Overview' && stats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeSlideUp 0.4s ease', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', width: '100%' }}>
                  {[
                    { label: 'Total Users', value: stats.totalUsers, color: NEON_GREEN, icon: <MdPeople /> },
                    { label: 'Total Analyses', value: stats.totalAnalyses, color: NEON_CYAN, icon: <MdCode /> },
                    { label: 'Total Energy', value: stats.totalEnergy, color: GOLD, icon: <MdBolt /> },
                    { label: 'Avg Sust. Score', value: stats.avgScore, color: NEON_PURPLE, icon: <MdShield /> },
                  ].map(s => (
                    <div className="glass-panel" key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${s.color}20`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '1.5rem', flexShrink: 0 }}>
                        {s.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                        <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace' }}>{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '1.5rem', width: '100%' }}>
                  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MdBolt color={GOLD} /> Analyses Per Day
                    </h3>
                    <div style={{ flex: 1, minHeight: 260, width: '100%', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                          <Bar dataKey="analyses" fill={NEON_CYAN} radius={[4, 4, 0, 0]} name="Analyses" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MdCode color={NEON_GREEN} /> Detection Breakdown
                    </h3>
                    <div style={{ flex: 1, minHeight: 260, width: '100%', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.detectionBreakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                            {stats.detectionBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {tab === 'Users' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeSlideUp 0.4s ease', width: '100%' }}>
                <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    placeholder="Search name or email..."
                    className="admin-input"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: '1 1 100%', minWidth: 'min(100%, 250px)' }}
                  />
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-select" style={{ flex: '1 1 auto', minWidth: '150px' }}>
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="admin-select" style={{ flex: '1 1 auto', minWidth: '150px' }}>
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MdPeople size={20} color={NEON_CYAN} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>User Management ({filteredUsers.length})</h3>
                  </div>
                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table className="glass-table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Role</th><th>Analyses</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>
                                  {u.avatar || u.name[0]}
                                </div>
                                <span style={{ fontWeight: 600, color: '#e5e7eb', whiteSpace: 'nowrap' }}>{u.name}</span>
                              </div>
                            </td>
                            <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{u.email}</td>
                            <td>
                              <span style={{ 
                                background: u.role === 'admin' ? `${NEON_PURPLE}20` : `${NEON_CYAN}20`, 
                                color: u.role === 'admin' ? NEON_PURPLE : NEON_CYAN, 
                                border: `1px solid ${u.role === 'admin' ? NEON_PURPLE : NEON_CYAN}40`,
                                padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' 
                              }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{u.totalAnalyses}</td>
                            <td>
                              <span style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                background: u.active ? `${NEON_GREEN}15` : `${NEON_RED}15`, 
                                color: u.active ? NEON_GREEN : NEON_RED, 
                                padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.active ? NEON_GREEN : NEON_RED }} />
                                {u.active ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td>
                              {u.role !== 'admin' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button onClick={() => toggleUser(u.id)} title={u.active ? 'Suspend' : 'Activate'} style={{ 
                                    background: u.active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 255, 204, 0.1)', 
                                    color: u.active ? NEON_RED : NEON_GREEN, border: 'none', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap'
                                  }}>
                                    {u.active ? <MdToggleOff size={16} /> : <MdToggleOn size={16} />} {u.active ? 'Suspend' : 'Activate'}
                                  </button>
                                  <button onClick={() => deleteUser(u.id, u.name)} title="Delete" style={{ 
                                    background: 'transparent', color: '#6b7280', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' 
                                  }} onMouseEnter={e => { e.currentTarget.style.color = NEON_RED; e.currentTarget.style.borderColor = NEON_RED; }} onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                                    <MdDelete size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── SUBSCRIPTIONS ── */}
            {tab === 'Subscriptions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeSlideUp 0.4s ease', width: '100%' }}>
                <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem', background: `linear-gradient(135deg, ${NEON_PURPLE}15, rgba(0,0,0,0.4))` }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Monthly Revenue</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'monospace', color: NEON_PURPLE }}>${subs.monthlyRevenue}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Paid Users</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'monospace', color: NEON_CYAN }}>{(subs.subscriptions || []).filter(u => u.plan !== 'free').length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Free Tier</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'monospace', color: NEON_GREEN }}>{(subs.subscriptions || []).filter(u => u.plan === 'free').length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Generator Uses</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'monospace', color: GOLD }}>{stats?.totalGenerations || 0}</div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MdDiamond size={20} color={NEON_PURPLE} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Subscription Management</h3>
                  </div>
                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table className="glass-table">
                      <thead>
                        <tr><th>User</th><th>Plan</th><th>Credits</th><th>Resets</th><th>Change Plan</th><th>Grant Credits</th></tr>
                      </thead>
                      <tbody>
                        {(subs.subscriptions || []).map(u => (
                          <tr key={u.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>
                                  {u.avatar || u.name[0]}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#e5e7eb', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{u.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ 
                                background: u.plan === 'enterprise' ? `${NEON_PURPLE}20` : u.plan === 'pro' ? `${NEON_CYAN}20` : 'rgba(255,255,255,0.05)', 
                                color: u.plan === 'enterprise' ? NEON_PURPLE : u.plan === 'pro' ? NEON_CYAN : '#9ca3af', 
                                border: `1px solid ${u.plan === 'enterprise' ? NEON_PURPLE : u.plan === 'pro' ? NEON_CYAN : 'rgba(255,255,255,0.2)'}40`,
                                padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap'
                              }}>
                                {u.planName || u.plan}
                              </span>
                            </td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 800, color: u.credits <= 5 ? NEON_RED : NEON_GREEN, fontSize: '1.1rem' }}>{u.credits}</td>
                            <td style={{ fontSize: '0.85rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>{u.creditsResetAt ? new Date(u.creditsResetAt).toLocaleDateString() : '—'}</td>
                            <td>
                              <select
                                value={u.plan}
                                onChange={e => changePlan(u.id, e.target.value)}
                                className="admin-select"
                                style={{ padding: '0.4rem 2rem 0.4rem 0.8rem', fontSize: '0.8rem' }}
                              >
                                {['free', 'pro', 'enterprise'].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                              </select>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                  type="number" min="1" max="500" placeholder="qty"
                                  value={creditInputs[u.id] || ''}
                                  onChange={e => setCreditInputs(p => ({ ...p, [u.id]: e.target.value }))}
                                  className="admin-input"
                                  style={{ width: 70, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                />
                                <button
                                  onClick={() => grantCredits(u.id, creditInputs[u.id])}
                                  disabled={!creditInputs[u.id]}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    background: creditInputs[u.id] ? `linear-gradient(135deg, ${NEON_GREEN}, ${NEON_CYAN})` : 'rgba(255,255,255,0.05)',
                                    color: creditInputs[u.id] ? '#000' : '#6b7280',
                                    border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 700,
                                    cursor: creditInputs[u.id] ? 'pointer' : 'not-allowed', transition: 'all 0.2s', whiteSpace: 'nowrap'
                                  }}
                                >
                                  <MdAutoAwesome /> Grant
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── DETECTIONS ── */}
            {tab === 'Detections' && (
              <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', animation: 'fadeSlideUp 0.4s ease' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MdCode size={20} color={GOLD} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Detection Log ({detections.length})</h3>
                </div>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table className="glass-table">
                    <thead>
                      <tr><th>User</th><th>Detection Type</th><th>Severity</th><th>Timestamp</th></tr>
                    </thead>
                    <tbody>
                      {detections.map(d => {
                        const sev = SEV_MAP[d.severity] || SEV_MAP.medium;
                        return (
                          <tr key={d.id}>
                            <td style={{ fontWeight: 600, color: '#e5e7eb', whiteSpace: 'nowrap' }}>{d.userName}</td>
                            <td><span style={{ fontFamily: 'monospace', color: '#a78bfa', whiteSpace: 'nowrap' }}>{d.type.replace(/_/g, ' ')}</span></td>
                            <td>
                              <span style={{ 
                                background: sev.bg, color: sev.color, border: `1px solid ${sev.color}40`,
                                padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' 
                              }}>
                                {d.severity}
                              </span>
                            </td>
                            <td style={{ color: '#9ca3af', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{new Date(d.timestamp).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── ENERGY ── */}
            {tab === 'Energy' && stats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeSlideUp 0.4s ease', width: '100%' }}>
                <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '2rem', padding: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Total Platform Energy</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'monospace', color: GOLD }}>
                      {stats.totalEnergy} <span style={{ fontSize: '1.2rem', color: '#6b7280', fontWeight: 500 }}>kWh</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Total CO₂ Emitted</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'monospace', color: NEON_RED }}>
                      {stats.totalCO2} <span style={{ fontSize: '1.2rem', color: '#6b7280', fontWeight: 500 }}>g</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel">
                  <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MdBolt color={GOLD} /> Energy Consumption by User
                  </h3>
                  <div style={{ flex: 1, minHeight: 300, width: '100%', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.energyPerUser} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="energyGradAdmin" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={GOLD} stopOpacity={0.6}/>
                            <stop offset="100%" stopColor={GOLD} stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 500 }} axisLine={false} width={80} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="energy" fill="url(#energyGradAdmin)" radius={[0, 4, 4, 0]} name="Energy (kWh)" barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
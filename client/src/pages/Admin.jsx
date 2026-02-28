import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  MdPeople, MdCode, MdBolt, MdShield,
  MdToggleOn, MdToggleOff, MdDelete, MdGpsFixed, MdDiamond, MdAutoAwesome
} from 'react-icons/md';
import AppLayout from '../components/AppLayout';
import { toast, ToastContainer } from '../components/Toast';
import api from '../utils/api';

const PIE_COLORS = ['#ef4444','#f59e0b','#00d4ff','#7c3aed','#00ff88','#ec4899'];
const TABS = ['Overview', 'Users', 'Detections', 'Subscriptions', 'Energy'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,10,30,0.95)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab]             = useState('Overview');
  const [stats, setStats]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [detections, setDetections] = useState([]);
  const [subs, setSubs]           = useState({ subscriptions: [], monthlyRevenue: '0.00', PLANS: {} });
  const [loading, setLoading]     = useState(true);
  const [creditInputs, setCreditInputs] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/detections'),
      api.get('/admin/subscriptions'),
    ]).then(([s, u, d, sub]) => {
      setStats(s.data);
      setUsers(u.data);
      setDetections(d.data);
      setSubs(sub.data);
    }).catch(() => toast('Failed to load admin data', 'error'))
      .finally(() => setLoading(false));
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
      setSubs(s => ({ ...s, subscriptions: s.subscriptions.map(u => u.id === userId ? { ...u, plan, planName: subs.PLANS[plan]?.name } : u) }));
      toast(`Plan updated to ${plan}`, 'success');
    } catch { toast('Plan update failed', 'error'); }
  }

  async function grantCredits(userId, amount) {
    if (!amount) return;
    try {
      const { data } = await api.put(`/admin/users/${userId}/credits`, { amount: parseInt(amount) });
      setSubs(s => ({ ...s, subscriptions: s.subscriptions.map(u => u.id === userId ? { ...u, credits: data.credits } : u) }));
      setCreditInputs(p => ({ ...p, [userId]: '' }));
      toast(`Granted ${amount} credits`, 'success');
    } catch { toast('Grant failed', 'error'); }
  }

  const SEV_MAP = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

  return (
    <AppLayout title="Admin Panel">
      <ToastContainer />
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="section-title"><MdShield style={{ verticalAlign: 'middle', color: 'var(--purple)' }} /> Admin Panel</h1>
        <p className="section-sub">Platform-wide analytics, user management, and detection logs.</p>
      </div>

      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'Overview'       && <MdGpsFixed />}
            {t === 'Users'         && <MdPeople />}
            {t === 'Detections'    && <MdCode />}
            {t === 'Subscriptions' && <MdDiamond />}
            {t === 'Energy'        && <MdBolt />}
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader" style={{ minHeight: 300 }}><div className="loader-ring" /></div>
      ) : (
        <>
          {/* ── OVERVIEW ── */}
          {tab === 'Overview' && stats && (
            <>
              <div className="stats-grid">
                {[
                  { label: 'Total Users',     value: stats.totalUsers,    color: 'green',  icon: <MdPeople /> },
                  { label: 'Total Analyses',  value: stats.totalAnalyses, color: 'cyan',   icon: <MdCode /> },
                  { label: 'Total Energy',    value: stats.totalEnergy,   color: 'amber',  icon: <MdBolt /> },
                  { label: 'Avg Sust. Score', value: stats.avgScore,      color: 'purple', icon: <MdShield /> },
                ].map(s => (
                  <div className={`stat-card ${s.color}`} key={s.label}>
                    <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                    <div className="stat-label">{s.label}</div>
                    <div className={`stat-value ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid-2">
                <div className="chart-card">
                  <h3><MdBolt style={{ color: 'var(--amber)' }} /> Analyses Per Day (last 7)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="analyses" fill="#00d4ff" radius={[4,4,0,0]} name="Analyses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <h3><MdCode style={{ color: 'var(--green)' }} /> Detection Types</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={stats.detectionBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                        {stats.detectionBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {tab === 'Users' && (
            <div className="table-card">
              <div className="table-header">
                <h3><MdPeople style={{ color: 'var(--cyan)' }} /> All Users ({users.length})</h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Analyses</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.7rem' }}>{u.avatar}</div>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-cyan'}`}>{u.role}</span>
                      </td>
                      <td>{u.totalAnalyses}</td>
                      <td>
                        <span className={`badge ${u.active ? 'badge-green' : 'badge-high'}`}>
                          <span className={`status-dot ${u.active ? 'active' : 'inactive'}`} />
                          {u.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          {u.role !== 'admin' && (
                            <>
                              <button className="btn-toggle" onClick={() => toggleUser(u.id)} title={u.active ? 'Suspend' : 'Activate'}>
                                {u.active ? <MdToggleOn /> : <MdToggleOff />} {u.active ? 'Suspend' : 'Activate'}
                              </button>
                              <button className="btn-danger" onClick={() => deleteUser(u.id, u.name)} title="Delete">
                                <MdDelete />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── SUBSCRIPTIONS ── */}
          {tab === 'Subscriptions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Revenue summary */}
              <div className="glass-card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1.5rem', background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(0,212,255,0.06))', border: '1px solid rgba(124,58,237,0.2)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Monthly Revenue</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>${subs.monthlyRevenue}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Paid Users</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{(subs.subscriptions || []).filter(u => u.plan !== 'free').length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Free Tier</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{(subs.subscriptions || []).filter(u => u.plan === 'free').length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Generator Uses</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>{stats?.totalGenerations || 0}</div>
                </div>
              </div>
              {/* Table */}
              <div className="table-card">
                <div className="table-header">
                  <h3><MdDiamond style={{ color: '#a78bfa' }} /> Subscription Management</h3>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>User</th><th>Plan</th><th>Credits</th><th>Resets</th><th>Change Plan</th><th>Grant Credits</th></tr>
                  </thead>
                  <tbody>
                    {(subs.subscriptions || []).map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.7rem' }}>{u.avatar}</div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: '0.87rem' }}>{u.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${u.plan === 'enterprise' ? 'badge-purple' : u.plan === 'pro' ? 'badge-cyan' : 'badge-medium'}`}>
                            {u.planName}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: u.credits <= 5 ? 'var(--red)' : 'var(--green)' }}>{u.credits}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.creditsResetAt ? new Date(u.creditsResetAt).toLocaleDateString() : '—'}</td>
                        <td>
                          <select
                            value={u.plan}
                            onChange={e => changePlan(u.id, e.target.value)}
                            className="lang-select"
                            style={{ background: 'var(--neu-bg)', color: 'var(--text-primary)' }}
                          >
                            {['free','pro','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <input
                              type="number" min="1" max="500" placeholder="credits"
                              value={creditInputs[u.id] || ''}
                              onChange={e => setCreditInputs(p => ({ ...p, [u.id]: e.target.value }))}
                              className="neu-input"
                              style={{ width: 80, padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                            />
                            <button
                              className="btn-toggle"
                              onClick={() => grantCredits(u.id, creditInputs[u.id])}
                              disabled={!creditInputs[u.id]}
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
          )}

          {/* ── DETECTIONS ── */}
          {tab === 'Detections' && (
            <div className="table-card">
              <div className="table-header">
                <h3><MdCode style={{ color: 'var(--amber)' }} /> Detection Log ({detections.length})</h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>User</th><th>Detection Type</th><th>Severity</th><th>Timestamp</th></tr>
                </thead>
                <tbody>
                  {detections.map(d => (
                    <tr key={d.id}>
                      <td>{d.userName}</td>
                      <td><span className="mono">{d.type.replace(/_/g,' ')}</span></td>
                      <td><span className={`badge ${SEV_MAP[d.severity]}`}>{d.severity}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(d.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── ENERGY ── */}
          {tab === 'Energy' && stats && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Platform Energy</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>{stats.totalEnergy} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>units</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total CO₂ Emitted</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f87171' }}>{stats.totalCO2} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>g</span></div>
                  </div>
                </div>
              </div>
              <div className="chart-card">
                <h3><MdBolt style={{ color: 'var(--amber)' }} /> Energy Consumption by User</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.energyPerUser} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="energy" fill="url(#energyGradAdmin)" radius={[0,4,4,0]} name="Energy">
                      {stats.energyPerUser.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </AppLayout>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Code2, Zap, Leaf, BarChart3, TrendingUp, ArrowRightLeft } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { ToastContainer, toast } from '../components/Toast';
import CompareModal from '../components/CompareModal';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#ef4444','#f59e0b','#00d4ff','#7c3aed','#00ff88','#ec4899'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,10,30,0.95)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]       = useState(null);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState([]);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/user/stats'), api.get('/user/history')])
      .then(([s, h]) => { setStats(s.data); setHistory(h.data.slice(0, 10)); })
      .finally(() => setLoading(false));
  }, []);

  function toggleSelect(analysis) {
    setSelected(prev => {
      if (prev.some(a => a.id === analysis.id)) return prev.filter(a => a.id !== analysis.id);
      if (prev.length >= 2) { toast('Select exactly 2 analyses to compare', 'info'); return prev; }
      return [...prev, analysis];
    });
  }

  const statCards = stats ? [
    { label: 'Total Analyses',     value: stats.totalAnalyses,     suffix: '',     color: 'green',  icon: <Code2 size={18} /> },
    { label: 'Avg Sustainability',  value: stats.avgSustainability,  suffix: '/100', color: 'cyan',   icon: <TrendingUp size={18} /> },
    { label: 'Energy Saved (kWh)', value: stats.totalEnergySaved,   suffix: '',     color: 'purple', icon: <Zap size={18} /> },
    { label: 'CO\u2082 Offset (g)',      value: stats.totalCO2Offset,     suffix: '',     color: 'amber',  icon: <Leaf size={18} /> },
  ] : [];

  const ratingColor = r => r === 'Green Efficient' ? 'var(--green)' : r === 'Moderate' ? 'var(--amber)' : 'var(--red)';

  return (
    <AppLayout title="Dashboard">
      <ToastContainer />

      {comparing && selected.length === 2 && (
        <CompareModal analyses={selected} onClose={() => { setComparing(false); setSelected([]); }} />
      )}

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="section-sub" style={{ marginBottom: 0 }}>Your sustainability overview</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {selected.length === 2 && (
            <button className="btn-primary" onClick={() => setComparing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 12 }}>
              <ArrowRightLeft size={15} /> Compare Selected
            </button>
          )}
          <Link to="/analyzer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', borderRadius: 12, padding: '0.7rem 1.4rem' }}>
            <Code2 size={15} /> Analyze Code
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="page-loader" style={{ minHeight: 300 }}><div className="loader-ring" /></div>
      ) : (
        <>
          <div className="stats-grid">
            {statCards.map(s => (
              <div className={`stat-card ${s.color}`} key={s.label}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value ${s.color}`}>{s.value}{s.suffix}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
            <div className="chart-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={15} color="var(--cyan)" /> Energy Trend
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats?.chartData || []}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="energy" stroke="#00d4ff" fill="url(#energyGrad)" strokeWidth={2} name="Energy Score" />
                  <Area type="monotone" dataKey="score"  stroke="#00ff88" fill="url(#scoreGrad)"  strokeWidth={2} name="Sust. Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={15} color="var(--green)" /> Detection Breakdown
              </h3>
              {stats?.detectionBreakdown?.length ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.detectionBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {stats.detectionBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-issues" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link to="/analyzer" style={{ color: 'var(--green)' }}>Start analyzing</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="table-card">
            <div className="table-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={15} color="var(--cyan)" /> Recent Analyses
              </h3>
              {selected.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selected.length}/2 selected</span>
                  <button className="btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
                </div>
              )}
            </div>
            {history.length ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th>Lang</th><th>Complexity</th><th>Energy</th><th>Score</th>
                    <th>CO&#x2082; (g)</th><th>Rating</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(a => {
                    const isChecked = selected.some(s => s.id === a.id);
                    return (
                      <tr key={a.id} style={isChecked ? { background: 'rgba(0,212,255,0.06)' } : {}}>
                        <td>
                          <input
                            type="checkbox" checked={isChecked}
                            onChange={() => toggleSelect(a)}
                            style={{ accentColor: 'var(--cyan)', cursor: 'pointer', width: 16, height: 16 }}
                          />
                        </td>
                        <td><span className="badge badge-cyan">{a.language}</span></td>
                        <td><span className="mono">{a.complexity}</span></td>
                        <td>{a.energyScore}</td>
                        <td style={{ color: a.sustainabilityScore >= 60 ? 'var(--green)' : a.sustainabilityScore >= 40 ? 'var(--amber)' : 'var(--red)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{a.sustainabilityScore}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{a.co2Grams}</td>
                        <td><span style={{ color: ratingColor(a.rating), fontSize: '0.82rem', fontWeight: 600 }}>{a.rating}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(a.timestamp).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="no-issues" style={{ padding: '3rem' }}>
                <Link to="/analyzer" style={{ color: 'var(--green)' }}>Analyze your first snippet</Link>
              </div>
            )}
            {history.length >= 2 && (
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ArrowRightLeft size={12} /> Check 2 rows to compare analyses side-by-side
              </div>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}

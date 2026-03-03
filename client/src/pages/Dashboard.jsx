import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

import {
  Code2, Zap, Leaf,
  TrendingUp, ArrowRightLeft, BarChart3, Loader2
} from 'lucide-react';

import Page from '../components/Page';
import { ToastContainer, toast } from '../components/Toast';
import CompareModal from '../components/CompareModal';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

/* ─── THEME CONSTANTS ───────────────────────────────────────────────── */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';
const PIE_COLORS = [
  NEON_GREEN, NEON_CYAN, '#a78bfa',
  '#ffb84d', '#ec4899', '#38bdf8'
];

/* ─── INJECTED STYLES ───────────────────────────────────────────────── */
const dashboardStyles = `
  .glass-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(12px);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  
  .glass-panel:hover {
    border-color: rgba(0, 255, 204, 0.2);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .glass-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    text-align: left;
  }

  .glass-table th {
    color: #9ca3af;
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .glass-table td {
    padding: 1rem;
    color: #e5e7eb;
    font-size: 0.95rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: background 0.2s;
  }

  .glass-table tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }

  .glass-table tr:last-child td {
    border-bottom: none;
  }

  .custom-checkbox {
    accent-color: ${NEON_GREEN};
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  /* Custom Recharts Tooltip styling */
  .recharts-tooltip-wrapper .glass-tooltip {
    background: rgba(10, 10, 20, 0.9) !important;
    border: 1px solid rgba(0, 255, 204, 0.3) !important;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    color: #fff;
  }
`;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-tooltip">
      <div style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem', marginBottom: '4px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: '#d1d5db' }}>{p.name}:</span> 
          <strong style={{ color: '#fff' }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    // Simulated delay for UI demonstration if needed, otherwise rely on your API
    Promise.all([
      api.get('/user/stats').catch(() => ({ data: { totalAnalyses: 0, avgSustainability: 0, totalEnergySaved: 0, totalCO2Offset: 0, chartData: [], detectionBreakdown: [] } })),
      api.get('/user/history').catch(() => ({ data: [] }))
    ])
    .then(([s, h]) => {
      setStats(s.data);
      setHistory(h.data.slice(0, 10));
    })
    .finally(() => setLoading(false));
  }, []);

  function toggleSelect(a) {
    setSelected(prev => {
      if(prev.some(x => x.id === a.id))
        return prev.filter(x => x.id !== a.id);

      if(prev.length >= 2){
        toast('Select exactly 2 analyses', 'info');
        return prev;
      }
      return [...prev, a];
    });
  }

  const statCards = stats ? [
    { label: 'Total Analyses', value: stats.totalAnalyses || 0, icon: <Code2 size={20} color={NEON_CYAN} />, glow: 'rgba(0, 212, 255, 0.15)' },
    { label: 'Avg Sustainability', value: stats.avgSustainability || '0%', icon: <TrendingUp size={20} color={NEON_GREEN} />, glow: 'rgba(0, 255, 204, 0.15)' },
    { label: 'Energy Saved (kWh)', value: stats.totalEnergySaved || 0, icon: <Zap size={20} color="#ffb84d" />, glow: 'rgba(255, 184, 77, 0.15)' },
    { label: 'CO₂ Offset (g)', value: stats.totalCO2Offset || 0, icon: <Leaf size={20} color="#a78bfa" />, glow: 'rgba(167, 139, 250, 0.15)' },
  ] : [];

  return (
    <Page
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Developer'}`}
      desc="Your sustainability overview"
    >
      <style>{dashboardStyles}</style>
      <ToastContainer />

      {comparing && selected.length === 2 && (
        <CompareModal
          analyses={selected}
          onClose={() => { setComparing(false); setSelected([]); }}
        />
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
          <Loader2 size={32} color={NEON_GREEN} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', letterSpacing: '1px' }}>SYNCING DATA...</div>
        </div>
      ) : (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 0' }}>

          {/* ───── Stats Grid ───── */}
          <div className="stat-grid">
            {statCards.map(s => (
              <div className="glass-panel" key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: '12px', 
                  background: s.glow, border: `1px solid ${s.glow.replace('0.15', '0.3')}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>{s.label}</div>
                  <div style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, fontFamily: 'monospace' }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ───── Charts Grid ───── */}
          <div className="chart-grid">

            {/* Energy Trend Area Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 600, marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                <TrendingUp size={18} color={NEON_CYAN} /> Energy Trend Analysis
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={NEON_CYAN} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={NEON_CYAN} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={NEON_GREEN} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={NEON_GREEN} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="energy" stroke={NEON_CYAN} strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" />
                  <Area type="monotone" dataKey="score" stroke={NEON_GREEN} strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Detection Breakdown Pie Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>
                <BarChart3 size={18} color={NEON_GREEN} /> Detection Breakdown
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats?.detectionBreakdown || []}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {(stats?.detectionBreakdown || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.85rem', color: '#e5e7eb' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* ───── Recent Analyses Table ───── */}
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>
                <Code2 size={18} color="#a78bfa" /> Recent Analyses
              </div>

              {selected.length === 2 && (
                <button
                  onClick={() => setComparing(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: `linear-gradient(135deg, ${NEON_GREEN}, ${NEON_CYAN})`,
                    color: '#000', border: 'none', borderRadius: '8px',
                    padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 255, 204, 0.2)'
                  }}
                >
                  <ArrowRightLeft size={14} /> Compare Selected
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}></th>
                      <th>Language</th>
                      <th>Complexity</th>
                      <th>Energy (kWh)</th>
                      <th>Score</th>
                      <th>Date Analyzed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(a => {
                      const checked = selected.some(s => s.id === a.id);
                      return (
                        <tr key={a.id} style={{ background: checked ? 'rgba(0, 255, 204, 0.05)' : 'transparent' }}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              className="custom-checkbox"
                              checked={checked}
                              onChange={() => toggleSelect(a)}
                            />
                          </td>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: NEON_CYAN }} />
                            {a.language || 'Unknown'}
                          </td>
                          <td style={{ fontFamily: 'monospace', color: '#a78bfa' }}>{a.complexity || 'O(n)'}</td>
                          <td>{a.energyScore || '0.00'}</td>
                          <td>
                            <span style={{ 
                              background: 'rgba(0, 255, 204, 0.1)', color: NEON_GREEN, 
                              padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 
                            }}>
                              {a.sustainabilityScore || 'A+'}
                            </span>
                          </td>
                          <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                            {new Date(a.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.02)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Code2 size={24} color="#6b7280" />
                </div>
                <div style={{ color: '#e5e7eb', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>No analyses yet</div>
                <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Upload your first code snippet to generate sustainability metrics.</div>
                <Link to="/analyzer" style={{
                  background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none'
                }}>
                  Go to Analyzer
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </Page>
  );
}
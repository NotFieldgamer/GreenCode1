import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

import {
  Code2, Zap, Leaf,
  TrendingUp, ArrowRightLeft, BarChart3
} from 'lucide-react';

import Page from '../components/Page';
import { ToastContainer, toast } from '../components/Toast';
import CompareModal from '../components/CompareModal';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = [
  '#ef4444','#f59e0b','#38bdf8',
  '#a78bfa','#00c896','#ec4899'
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="card card-sm">
      <div className="text-muted mb-2">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {

  const { user } = useAuth();

  const [stats,setStats]=useState(null);
  const [history,setHistory]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState([]);
  const [comparing,setComparing]=useState(false);

  useEffect(()=>{
    Promise.all([
      api.get('/user/stats'),
      api.get('/user/history')
    ])
    .then(([s,h])=>{
      setStats(s.data);
      setHistory(h.data.slice(0,10));
    })
    .finally(()=>setLoading(false));
  },[]);

  function toggleSelect(a){
    setSelected(prev=>{
      if(prev.some(x=>x.id===a.id))
        return prev.filter(x=>x.id!==a.id);

      if(prev.length>=2){
        toast('Select exactly 2 analyses','info');
        return prev;
      }
      return [...prev,a];
    });
  }

  const statCards = stats ? [
    {label:'Total Analyses',value:stats.totalAnalyses,icon:<Code2 size={18}/>},
    {label:'Avg Sustainability',value:stats.avgSustainability,icon:<TrendingUp size={18}/>},
    {label:'Energy Saved',value:stats.totalEnergySaved,icon:<Zap size={18}/>},
    {label:'CO₂ Offset',value:stats.totalCO2Offset,icon:<Leaf size={18}/>},
  ] : [];

  return (
    <Page
      title={`Welcome back, ${user?.name?.split(' ')[0]}`}
      desc="Your sustainability overview"
    >

      <ToastContainer />

      {comparing && selected.length===2 && (
        <CompareModal
          analyses={selected}
          onClose={()=>{setComparing(false);setSelected([]);}}
        />
      )}

      {loading ? (
        <div className="page-loader">
          <div className="spinner"/>
        </div>
      ) : (
        <>

          {/* ───── Stats ───── */}
          <div className="stat-grid">
            {statCards.map(s=>(
              <div className="stat-card" key={s.label}>
                <div className="stat-icon-wrap stat-icon-green">
                  {s.icon}
                </div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          {/* ───── Charts ───── */}
          <div className="grid-2">

            {/* Energy Trend */}
            <div className="chart-section">
              <div className="card-title mb-4">
                <TrendingUp size={16}/> Energy Trend
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d"/>
                  <XAxis dataKey="name"/>
                  <YAxis/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="energy" stroke="#38bdf8" fillOpacity={0.2}/>
                  <Area type="monotone" dataKey="score" stroke="#00c896" fillOpacity={0.2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown */}
            <div className="chart-section">
              <div className="card-title mb-4">
                <BarChart3 size={16}/> Detection Breakdown
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats?.detectionBreakdown || []}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={90}
                  >
                    {(stats?.detectionBreakdown || []).map((_,i)=>(
                      <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* ───── Recent Analyses ───── */}
          <div className="card mt-6">

            <div className="card-header">
              <div className="card-title">
                <Code2 size={16}/> Recent Analyses
              </div>

              {selected.length===2 && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={()=>setComparing(true)}
                >
                  <ArrowRightLeft size={14}/>
                  Compare
                </button>
              )}
            </div>

            {history.length ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Lang</th>
                    <th>Complexity</th>
                    <th>Energy</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map(a=>{
                    const checked = selected.some(s=>s.id===a.id);

                    return (
                      <tr key={a.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={()=>toggleSelect(a)}
                          />
                        </td>
                        <td>{a.language}</td>
                        <td className="mono">{a.complexity}</td>
                        <td>{a.energyScore}</td>
                        <td>{a.sustainabilityScore}</td>
                        <td>{new Date(a.timestamp).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state-label">
                  No analyses yet
                </div>
                <Link to="/analyzer" className="btn btn-primary">
                  Analyze Code
                </Link>
              </div>
            )}

          </div>

        </>
      )}

    </Page>
  );
}
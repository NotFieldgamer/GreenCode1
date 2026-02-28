import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { BarChart3, ChevronUp, ChevronDown } from 'lucide-react';

const CURVES = [
  { key: 'O(1)',       color: '#00ff88', label: 'O(1) — Constant'     },
  { key: 'O(log n)',   color: '#00d4ff', label: 'O(log n) — Log'      },
  { key: 'O(n)',       color: '#a78bfa', label: 'O(n) — Linear'       },
  { key: 'O(n log n)', color: '#f59e0b', label: 'O(n log n) — Log-lin'},
  { key: 'O(n²)',      color: '#ef4444', label: 'O(n²) — Quadratic'   },
];

const N_VALUES = [1, 10, 50, 100, 500, 1000, 5000];

function ops(key, n) {
  switch (key) {
    case 'O(1)':         return 1;
    case 'O(log n)':     return Math.max(1, Math.ceil(Math.log2(n)));
    case 'O(n)':         return n;
    case 'O(n log n)':   return Math.ceil(n * Math.log2(Math.max(n, 2)));
    case 'O(n²)':        return n * n;
    default: return 1;
  }
}

const PLAIN_ENGLISH = {
  'O(1)':       { label: 'Perfect',     text: 'Executes in the same time regardless of input size. Hash lookups, array indexing.' },
  'O(log n)':   { label: 'Excellent',   text: 'Doubles input = +1 operation. Binary search, balanced trees.' },
  'O(n)':       { label: 'Good',        text: 'Scales proportionally to input. Single loops, linear scans.' },
  'O(n log n)': { label: 'Acceptable',  text: 'Typical of efficient sorting (mergesort, heapsort). Good for most use cases.' },
  'O(n^2)':     { label: 'Problematic', text: '1000 items = 1,000,000 operations. Nested loops — avoid for large inputs.' },
  'O(2^n)':     { label: 'Dangerous',   text: 'Exponential growth. n=30 means >1 billion operations. Must memoize or restructure.' },
  'O(n\u00b2)': { label: 'Problematic', text: '1000 items = 1,000,000 operations. Nested loops — avoid for large inputs.' },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,10,30,0.97)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>n = {label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey}: <strong>{p.value?.toLocaleString()}</strong> ops
        </p>
      ))}
    </div>
  );
}

export default function ComplexityChart({ detected = 'O(n)', energyCostKwh = 0 }) {
  const [nVal, setNVal] = useState(1000);
  const [open, setOpen] = useState(false);

  const chartData = useMemo(() =>
    N_VALUES.map(n => {
      const row = { n };
      CURVES.forEach(c => { row[c.key] = Math.min(ops(c.key, n), 5000 * 5000 + 1); });
      return row;
    }), []);

  const info = PLAIN_ENGLISH[detected] || PLAIN_ENGLISH['O(n)'];
  const detectedOps = ops(detected, nVal).toLocaleString();
  const linearOps   = ops('O(n)', nVal).toLocaleString();
  const costAtN     = (energyCostKwh * nVal).toFixed(6);

  return (
    <div className="glass-card" style={{ marginTop: '1rem' }}>
      {/* Header / toggle */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={15} color="var(--cyan)" /> Big O Complexity Visualizer
          <span className={`badge ${detected === 'O(1)' || detected === 'O(log n)' ? 'badge-green' : detected === 'O(n)' || detected === 'O(n log n)' ? 'badge-medium' : 'badge-high'}`}>
            {detected}
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </div>

      {open && (
        <>
          {/* Plain English */}
          <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '0.875rem 1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4 }}>
              {detected} — {info.label}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{info.text}</div>
          </div>

          {/* n slider */}
          <div style={{ margin: '1.25rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Input size (n)</span>
              <strong style={{ color: 'var(--cyan)' }}>n = {nVal.toLocaleString()}</strong>
            </div>
            <input
              type="range" min="1" max="5000" step="1" value={nVal}
              onChange={e => setNVal(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cyan)' }}
            />
            {/* Live stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginTop: '0.75rem' }}>
              {[
                { label: `${detected} ops`, value: detectedOps, color: detected === 'O(n²)' ? 'var(--red)' : 'var(--amber)' },
                { label: 'O(n) ops (ideal)', value: linearOps, color: 'var(--green)' },
                { label: `Energy × n`,       value: `$${costAtN}`, color: 'var(--cyan)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color, fontSize: '0.95rem' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="n" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} width={50}
                tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v} />
              <Tooltip content={<CustomTooltip />} />
              {CURVES.map(c => (
                <Line
                  key={c.key}
                  type="monotone"
                  dataKey={c.key}
                  stroke={c.color}
                  strokeWidth={c.key === detected ? 3 : 1.5}
                  strokeDasharray={c.key === detected ? '0' : '4 2'}
                  dot={false}
                  opacity={c.key === detected ? 1 : 0.45}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            Solid line = your detected complexity · Dashed = comparison curves
          </div>
        </>
      )}
    </div>
  );
}

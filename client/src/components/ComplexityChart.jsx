import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { BarChart3, ChevronUp, ChevronDown } from 'lucide-react';

/* ================= THEME CONSTANTS ================= */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';
const NEON_PURPLE = '#a78bfa';
const NEON_AMBER = '#ffb84d';
const NEON_RED = '#ef4444';

const CURVES = [
  { key: 'O(1)',       color: NEON_GREEN,  label: 'O(1) — Constant'     },
  { key: 'O(log n)',   color: NEON_CYAN,   label: 'O(log n) — Log'      },
  { key: 'O(n)',       color: NEON_PURPLE, label: 'O(n) — Linear'       },
  { key: 'O(n log n)', color: NEON_AMBER,  label: 'O(n log n) — Log-lin'},
  { key: 'O(n²)',      color: NEON_RED,    label: 'O(n²) — Quadratic'   },
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
  'O(n²)':      { label: 'Problematic', text: '1000 items = 1,000,000 operations. Nested loops — avoid for large inputs.' },
};

/* ================= INJECTED STYLES ================= */
const chartStyles = `
  .glass-card-chart {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    backdrop-filter: blur(12px);
    transition: all 0.3s ease;
  }

  .n-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    outline: none;
    transition: background 0.2s;
  }

  .n-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${NEON_CYAN};
    cursor: pointer;
    box-shadow: 0 0 10px ${NEON_CYAN};
    transition: transform 0.1s;
  }

  .n-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .recharts-tooltip-wrapper .glass-tooltip {
    background: rgba(10, 10, 20, 0.95) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    color: #fff;
  }
`;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-tooltip">
      <p style={{ color: '#9ca3af', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>Input Size (n) = {label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, margin: '4px 0', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
          <span>{p.dataKey}:</span>
          <strong style={{ fontFamily: 'monospace' }}>{p.value?.toLocaleString()} ops</strong>
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

  // Find color for current detected complexity
  const detectedColor = CURVES.find(c => c.key === detected)?.color || NEON_CYAN;

  return (
    <div className="glass-card-chart" style={{ marginTop: '1rem', padding: open ? '1.5rem' : '1.25rem' }}>
      <style>{chartStyles}</style>
      
      {/* Header / Toggle */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
          <BarChart3 size={18} color={NEON_CYAN} /> 
          Big O Complexity
          <span style={{ 
            background: `${detectedColor}20`, color: detectedColor, 
            border: `1px solid ${detectedColor}40`, padding: '0.15rem 0.6rem', 
            borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' 
          }}>
            {detected}
          </span>
        </div>
        <span style={{ color: '#6b7280', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={20} />
        </span>
      </div>

      {open && (
        <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
          
          {/* Plain English Explanation */}
          <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${detectedColor}`, borderRadius: '0 8px 8px 0', padding: '1rem 1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', color: detectedColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {detected} — {info.label}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#d1d5db', lineHeight: 1.5 }}>{info.text}</div>
          </div>

          {/* Interactive N Slider */}
          <div style={{ margin: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#9ca3af' }}>
              <span>Simulate Input Size</span>
              <strong style={{ color: NEON_CYAN, fontFamily: 'monospace', fontSize: '1rem' }}>n = {nVal.toLocaleString()}</strong>
            </div>
            
            <input
              type="range" min="1" max="5000" step="1" value={nVal}
              onChange={e => setNVal(Number(e.target.value))}
              className="n-slider"
            />
            
            {/* Live Calculation Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.25rem' }}>
              {[
                { label: `${detected} ops`, value: detectedOps, color: detectedColor },
                { label: 'O(n) ops (ideal)', value: linearOps, color: NEON_GREEN },
                { label: `Est. Cost × n`,      value: `$${costAtN}`, color: GOLD },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>{s.label}</div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', color: s.color, fontSize: '1.1rem' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Graph Visualization */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem 0' }}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="n" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={45}
                  tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                
                {CURVES.map(c => (
                  <Line
                    key={c.key}
                    type="monotone"
                    dataKey={c.key}
                    stroke={c.color}
                    strokeWidth={c.key === detected ? 3 : 1.5}
                    strokeDasharray={c.key === detected ? '0' : '4 4'}
                    dot={false}
                    activeDot={c.key === detected ? { r: 6, fill: c.color, stroke: '#000', strokeWidth: 2 } : false}
                    opacity={c.key === detected ? 1 : 0.3}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 20, height: 2, background: detectedColor }}/> Detected Curve</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 20, height: 2, background: '#6b7280', borderBottom: '2px dashed #6b7280' }}/> Baseline Curves</span>
          </div>
        </div>
      )}
    </div>
  );
}
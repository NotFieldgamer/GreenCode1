import React from 'react';
import { MdClose, MdArrowUpward, MdArrowDownward } from 'react-icons/md';

/* ================= THEME CONSTANTS ================= */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';
const NEON_AMBER = '#ffb84d';
const NEON_RED = '#ef4444';

/* ================= INJECTED STYLES ================= */
const modalStyles = `
  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .glass-col-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    transition: background 0.2s;
  }
  
  .glass-col-card:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .delta-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0.25rem 0.6rem;
    border-radius: 100px;
    font-size: 0.8rem;
    font-weight: 700;
    font-family: monospace;
  }
`;

function Delta({ a, b, invert = false, suffix = '' }) {
  const diff = b - a;
  const better = invert ? diff < 0 : diff > 0;
  
  if (diff === 0) return <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600 }}>—</span>;
  
  return (
    <span className="delta-pill" style={{ 
      background: better ? 'rgba(0, 255, 204, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      color: better ? NEON_GREEN : NEON_RED,
      border: `1px solid ${better ? 'rgba(0, 255, 204, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
    }}>
      {better ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}
      {Math.abs(diff).toFixed(diff % 1 === 0 ? 0 : 2)}{suffix}
    </span>
  );
}

function CompareCol({ analysis, label, align = 'left' }) {
  const ratingColor = r => r === 'Green Efficient' ? NEON_GREEN : r === 'Moderate' ? NEON_AMBER : NEON_RED;
  
  return (
    <div>
      <div style={{ 
        fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', 
        color: '#9ca3af', marginBottom: '1.25rem', textAlign: 'center',
        paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {label}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {[
          { label: 'Sustainability Score', value: analysis.sustainabilityScore, suffix: '/100', highlight: true },
          { label: 'Energy Score',         value: analysis.energyScore,         suffix: ' kWh' },
          { label: 'CO₂ Emitted',          value: analysis.co2Grams,            suffix: ' g' },
          { label: 'Complexity',           value: analysis.complexity,          suffix: '' },
        ].map(row => (
          <div key={row.label} className="glass-col-card" style={{ border: row.highlight ? `1px solid rgba(255,255,255,0.15)` : '' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{row.label}</div>
            <div style={{ fontFamily: 'monospace', fontWeight: row.highlight ? 800 : 600, fontSize: row.highlight ? '1.6rem' : '1.2rem', color: row.highlight ? '#fff' : '#e5e7eb' }}>
              {row.value}<span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '4px' }}>{row.suffix}</span>
            </div>
          </div>
        ))}
        
        <div className="glass-col-card">
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</div>
          <div style={{ fontWeight: 700, color: ratingColor(analysis.rating), fontSize: '1rem' }}>{analysis.rating}</div>
        </div>
        
        <div className="glass-col-card" style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detections</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
            {analysis.detections?.length > 0 ? analysis.detections.map(d => (
              <span key={d} style={{ background: 'rgba(255, 184, 77, 0.1)', color: GOLD, border: `1px solid rgba(255, 184, 77, 0.2)`, padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, fontFamily: 'monospace' }}>
                {d.replace(/_/g, ' ')}
              </span>
            )) : <span style={{ color: NEON_GREEN, fontSize: '0.85rem', fontWeight: 600 }}>✨ Optimal (0 issues)</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompareModal({ analyses, onClose }) {
  if (!analyses || analyses.length !== 2) return null;
  const [a, b] = analyses.sort((x, y) => new Date(x.timestamp) - new Date(y.timestamp));

  const scoreDiff = b.sustainabilityScore - a.sustainabilityScore;
  const isImproved = scoreDiff > 0;
  const isRegressed = scoreDiff < 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(5, 5, 15, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <style>{modalStyles}</style>
      
      <div style={{ 
        background: 'rgba(15, 15, 25, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', 
        width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
        animation: 'slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: NEON_CYAN }}>↔</span> Analysis Comparison
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#9ca3af', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = NEON_RED; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9ca3af'; }}>
            <MdClose size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          
          {/* Timeline Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', marginBottom: '2rem', textAlign: 'center', alignItems: 'center' }}>
            <div style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 500, background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
              {new Date(a.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
            <div style={{ color: NEON_CYAN, fontWeight: 800 }}>→</div>
            <div style={{ color: '#e5e7eb', fontSize: '0.9rem', fontWeight: 600, background: 'rgba(0,212,255,0.05)', padding: '0.5rem', borderRadius: '8px', border: `1px solid rgba(0,212,255,0.1)` }}>
              {new Date(b.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>

          {/* Comparison Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '1rem', alignItems: 'start' }}>
            <CompareCol analysis={a} label="Original Code" />

            {/* Deltas Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingTop: '2.5rem' }}>
              {[
                { label: 'Score',  a: a.sustainabilityScore, b: b.sustainabilityScore, invert: false, height: '85px' },
                { label: 'Energy', a: a.energyScore,         b: b.energyScore,         invert: true,  height: '71px' },
                { label: 'CO₂',    a: a.co2Grams,            b: b.co2Grams,            invert: true,  height: '71px' },
              ].map(d => (
                <div key={d.label} style={{ height: d.height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Delta a={d.a} b={d.b} invert={d.invert} />
                </div>
              ))}
            </div>

            <CompareCol analysis={b} label="Latest Code" />
          </div>

          {/* Intelligent Summary */}
          <div style={{ 
            marginTop: '2.5rem', 
            background: isImproved ? 'rgba(0, 255, 204, 0.05)' : isRegressed ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 212, 255, 0.05)', 
            border: `1px solid ${isImproved ? 'rgba(0, 255, 204, 0.2)' : isRegressed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 212, 255, 0.2)'}`, 
            borderRadius: '12px', padding: '1.25rem 1.5rem', fontSize: '0.95rem', color: '#e5e7eb', lineHeight: 1.6,
            display: 'flex', alignItems: 'flex-start', gap: '1rem'
          }}>
            {isImproved ? (
              <>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,255,204,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: NEON_GREEN, flexShrink: 0 }}><MdArrowUpward size={18} /></div>
                <div>
                  <span style={{ color: NEON_GREEN, fontWeight: 700, display: 'block', marginBottom: '4px', fontSize: '1rem' }}>Optimization Successful</span>
                  Sustainability score improved by <strong>{scoreDiff} points</strong>. Energy consumption and emissions have been reduced. Excellent work!
                </div>
              </>
            ) : isRegressed ? (
              <>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: NEON_RED, flexShrink: 0 }}><MdArrowDownward size={18} /></div>
                <div>
                  <span style={{ color: NEON_RED, fontWeight: 700, display: 'block', marginBottom: '4px', fontSize: '1rem' }}>Efficiency Regression</span>
                  Sustainability score dropped by <strong>{Math.abs(scoreDiff)} points</strong>. Recent changes introduced performance bottlenecks. Consider reverting or utilizing the AI Assistant for fixes.
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: NEON_CYAN, flexShrink: 0 }}><span style={{ fontWeight: 800 }}>=</span></div>
                <div>
                  <span style={{ color: NEON_CYAN, fontWeight: 700, display: 'block', marginBottom: '4px', fontSize: '1rem' }}>Neutral Impact</span>
                  No change in algorithmic efficiency detected between these two analyses. Try applying the suggested fixes in the Analyzer to see an improvement.
                </div>
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { MdClose, MdArrowUpward, MdArrowDownward } from 'react-icons/md';

function Delta({ a, b, invert = false, suffix = '' }) {
  const diff = b - a;
  const better = invert ? diff < 0 : diff > 0;
  if (diff === 0) return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>;
  return (
    <span style={{ color: better ? 'var(--green)' : 'var(--red)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
      {better ? <MdArrowUpward /> : <MdArrowDownward />}
      {Math.abs(diff).toFixed(diff % 1 === 0 ? 0 : 2)}{suffix}
    </span>
  );
}

function CompareCol({ analysis, label }) {
  const ratingColor = r => r === 'Green Efficient' ? 'var(--green)' : r === 'Moderate' ? 'var(--amber)' : 'var(--red)';
  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {[
          { label: 'Sustainability Score', value: analysis.sustainabilityScore, suffix: '/100' },
          { label: 'Energy Score',         value: analysis.energyScore,         suffix: ' units' },
          { label: 'CO₂ Emitted',          value: analysis.co2Grams,            suffix: ' g' },
          { label: 'Complexity',           value: analysis.complexity,          suffix: '' },
        ].map(row => (
          <div key={row.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.7rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{row.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.2rem' }}>{row.value}{row.suffix}</div>
          </div>
        ))}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.7rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Rating</div>
          <div style={{ fontWeight: 700, color: ratingColor(analysis.rating), fontSize: '0.9rem' }}>{analysis.rating}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.7rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textAlign: 'center' }}>Detections</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center' }}>
            {analysis.detections.length ? analysis.detections.map(d => (
              <span key={d} className="badge badge-medium" style={{ fontSize: '0.65rem' }}>{d.replace(/_/g,' ')}</span>
            )) : <span style={{ color: 'var(--green)', fontSize: '0.8rem' }}>✨ None</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompareModal({ analyses, onClose }) {
  if (!analyses || analyses.length !== 2) return null;
  const [a, b] = analyses.sort((x, y) => new Date(x.timestamp) - new Date(y.timestamp));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'rgba(8,8,25,0.98)', border: '1px solid var(--glass-border)', borderRadius: 24, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>↔️ Analysis Comparison</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}><MdClose /></button>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', marginBottom: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>{new Date(a.timestamp).toLocaleString()}</div>
            <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>→</div>
            <div>{new Date(b.timestamp).toLocaleString()}</div>
          </div>

          {/* Side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'start' }}>
            <CompareCol analysis={a} label="Earlier Analysis" />

            {/* Deltas column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '2rem' }}>
              {[
                { label: 'Score',     a: a.sustainabilityScore, b: b.sustainabilityScore, invert: false },
                { label: 'Energy',    a: a.energyScore,         b: b.energyScore,         invert: true  },
                { label: 'CO₂',       a: a.co2Grams,            b: b.co2Grams,            invert: true, suffix: 'g' },
              ].map(d => (
                <div key={d.label} style={{ height: '68px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Δ</div>
                  <Delta a={d.a} b={d.b} invert={d.invert} suffix={d.suffix || ''} />
                </div>
              ))}
            </div>

            <CompareCol analysis={b} label="Later Analysis" />
          </div>

          {/* Improvement summary */}
          <div style={{ marginTop: '1.25rem', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 12, padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {b.sustainabilityScore > a.sustainabilityScore ? (
              <span><span style={{ color: 'var(--green)', fontWeight: 700 }}>✅ Improvement detected!</span> Score went from {a.sustainabilityScore} → {b.sustainabilityScore} (+{b.sustainabilityScore - a.sustainabilityScore} points). </span>
            ) : b.sustainabilityScore < a.sustainabilityScore ? (
              <span><span style={{ color: 'var(--amber)', fontWeight: 700 }}>⚠️ Regression detected.</span> Score went from {a.sustainabilityScore} → {b.sustainabilityScore} ({b.sustainabilityScore - a.sustainabilityScore} points). Consider reverting recent changes.</span>
            ) : (
              <span><span style={{ color: 'var(--cyan)', fontWeight: 700 }}>ℹ️ No change in score.</span> Try applying the suggested fixes in the Analyzer to improve.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

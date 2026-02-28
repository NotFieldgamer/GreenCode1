import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Download, Code2, Zap, Lightbulb, Bot, Copy, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, MessageSquare, Sparkles } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { toast, ToastContainer } from '../components/Toast';
import ComplexityChart from '../components/ComplexityChart';
import ChatSidebar from '../components/ChatSidebar';
import api from '../utils/api';

const LANGUAGES = ['javascript','python','java','c++','typescript','go','rust','php','ruby'];
const SEVERITY_COLORS = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
const TIP_COLORS = { Performance: 'var(--amber)', Memory: '#a78bfa', Modern: 'var(--cyan)', Async: 'var(--green)', 'Type Safety': 'var(--cyan)', Concurrency: 'var(--purple)', Style: 'var(--text-secondary)' };

function GaugeMeter({ score }) {
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 60 ? 'var(--green)' : score >= 40 ? 'var(--amber)' : 'var(--red)';
  return (
    <svg width="140" height="140" style={{ display: 'block', margin: '0.75rem auto' }}>
      <circle cx="70" cy="70" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
      <circle cx="70" cy="70" r={r} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 70 70)"
        style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 0.7s ease' }} />
      <text x="70" y="65" textAnchor="middle" fill={color} fontSize="24" fontWeight="700" fontFamily="var(--font-mono)">{score}</text>
      <text x="70" y="81" textAnchor="middle" fill="var(--text-muted)" fontSize="11">/100</text>
    </svg>
  );
}

function OptimizedCodePanel({ suggestion, language }) {
  const [open, setOpen] = useState(false);
  const snippet = suggestion.optimizedCode;
  if (!snippet) return null;
  return (
    <div style={{ marginTop: '0.75rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, color: 'var(--green)', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', width: '100%', justifyContent: 'center' }}
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {open ? 'Hide Optimized Code' : 'View Optimized Code'}
      </button>
      {open && (
        <div style={{ marginTop: '0.6rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', lineHeight: 1.6 }}>{snippet.explanation}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { label: 'Before', code: snippet.before, color: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
              { label: 'After',  code: snippet.after,  color: 'rgba(0,255,136,0.06)', border: 'rgba(0,255,136,0.2)' },
            ].map(side => (
              <div key={side.label} style={{ background: side.color, border: `1px solid ${side.border}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderBottom: `1px solid ${side.border}`, fontSize: '0.72rem', fontWeight: 700 }}>
                  {side.label}
                  <button
                    onClick={() => { navigator.clipboard.writeText(side.code); toast('Copied!', 'success'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                    title="Copy"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <pre style={{ margin: 0, padding: '0.6rem', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {side.code}
                </pre>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(snippet.after);
              toast('Optimized code copied! 🌱', 'success');
            }}
            style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.82rem', padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
          >
            <Copy size={13} /> Copy Optimized Version
          </button>
        </div>
      )}
    </div>
  );
}

// Language tips tab
function LanguageTipsPanel({ tips, language }) {
  if (!tips?.length) return null;
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Lightbulb size={14} style={{ color: 'var(--amber)' }} /> {language} Tips
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tips.map((tip, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.7rem 0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: TIP_COLORS[tip.cat] || 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: '0.15rem 0.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                {tip.cat}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>{tip.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analyzer() {
  const [code, setCode]           = useState('');
  const [language, setLanguage]   = useState('javascript');
  const [result, setResult]       = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expanded, setExpanded]   = useState({});
  const [chatOpen, setChatOpen]   = useState(false);
  const [activeTab, setActiveTab] = useState('detections');
  const [limitReached, setLimitReached] = useState(false);
  const debounceRef = useRef(null);

  // Check achievements after analysis
  async function checkAchievements() {
    try { await api.post('/achievements/check'); } catch {}
  }

  const analyze = useCallback(async (codeVal, lang) => {
    if (!codeVal.trim()) { setResult(null); return; }
    setAnalyzing(true); setLimitReached(false);
    try {
      const { data } = await api.post('/analyze', { code: codeVal, language: lang });
      setResult(data);
      checkAchievements();
      if (data.sustainabilityScore >= 80) toast('Excellent sustainability score!', 'success');
      else if (data.detections.includes('nested_loops')) toast('Nested loops detected — see optimized code below', 'info');
    } catch (err) {
      if (err.response?.data?.code === 'ANALYSIS_LIMIT_REACHED') {
        setLimitReached(true);
      } else {
        toast(err.response?.data?.error || 'Analysis failed', 'error');
      }
    } finally { setAnalyzing(false); }
  }, []);

  function handleCodeChange(e) {
    const val = e.target.value;
    setCode(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyze(val, language), 900);
  }

  function applyOptimized() {
    if (!result?.suggestions?.length) return;
    // Collect all 'after' snippets and join them as a comment block
    const allOptimized = result.suggestions
      .filter(s => s.optimizedCode?.after)
      .map(s => `// Fix for: ${s.title}\n${s.optimizedCode.after}`)
      .join('\n\n');
    if (allOptimized) {
      setCode(allOptimized);
      toast('Applied all optimizations to editor!', 'success');
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => analyze(allOptimized, language), 900);
    }
  }

  function downloadReport() {
    if (!result) return;
    const text = `GreenCode — Sustainability Analysis Report
Generated: ${new Date().toLocaleString()}
Language: ${result.language} | Lines: ${result.lines}

── METRICS ─────────────────────────────────────
Complexity:         ${result.complexity}
Energy Score:       ${result.energyScore} units
Energy Cost:        ${result.energyCostKwh} kWh
CO₂ Emitted:        ${result.co2Grams} g per execution
Dollar Cost:        $${result.dollarCost}
Sustainability:     ${result.sustainabilityScore}/100
Rating:             ${result.rating}

── DETECTIONS ──────────────────────────────────
${result.detections.join(', ') || 'None'}

── SUGGESTIONS & OPTIMIZED CODE ────────────────
${result.suggestions.map((s, i) => `
${i+1}. ${s.title} [${s.severity.toUpperCase()}]
   ${s.detail}
   Savings: ${s.saving}
   ${s.optimizedCode ? `\n   BEFORE:\n${s.optimizedCode.before}\n\n   AFTER:\n${s.optimizedCode.after}` : ''}
`).join('\n')}

── LANGUAGE TIPS (${result.language}) ──────────────────────
${(result.languageTips || []).map((t, i) => `${i+1}. [${t.cat}] ${t.tip}`).join('\n')}
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'GreenCode_Report.txt';
    a.click();
    toast('Report downloaded!', 'success');
  }

  const ratingColor = r => r === 'Green Efficient' ? 'var(--green)' : r === 'Moderate' ? 'var(--amber)' : 'var(--red)';

  return (
    <AppLayout title="AI Code Analyzer">
      <ToastContainer />
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="section-title">AI Sustainability Analyzer</h1>
        <p className="section-sub">Paste code for real-time AI analysis: energy cost, optimized rewrites, and complexity guidance.</p>
      </div>

      <div className="analyzer-layout">
        {/* ── LEFT: Code Editor ── */}
        <div>
          <div className="code-editor-card">
            <div className="code-editor-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="editor-dots">
                  <div className="editor-dot red" /><div className="editor-dot amber" /><div className="editor-dot green" />
                </div>
                <select className="lang-select" value={language} onChange={e => { setLanguage(e.target.value); if (code) analyze(code, e.target.value); }}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {analyzing && <span className="analyzing-indicator"><span className="pulse-dot" /> Analyzing…</span>}
                <button className="btn-primary btn-sm" onClick={() => analyze(code, language)} disabled={analyzing}>
                  <Play size={14} /> Analyze
                </button>
              </div>
            </div>
            <textarea
              className="code-textarea"
              placeholder={`// Paste your ${language} code here…\n// Analysis + optimized rewrites appear instantly\n\nfunction example(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length; j++) {\n      // nested loop — O(n²)! Try pasting this to see the fix\n    }\n  }\n}`}
              value={code}
              onChange={handleCodeChange}
              spellCheck={false}
            />
          </div>

          {/* Action bar */}
          {result && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn-ghost" onClick={downloadReport} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={15} /> Download Full Report
              </button>
              {result.suggestions.some(s => s.optimizedCode) && (
                <button className="btn-primary" onClick={applyOptimized} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem' }}>
                  <Zap size={14} /> Apply All Fixes
                </button>
              )}
              <span className="badge badge-cyan" style={{ alignSelf: 'center' }}>{result.lines} lines</span>
              <span className="badge badge-purple" style={{ alignSelf: 'center' }}>{result.complexity}</span>
            </div>
          )}

          {/* Complexity Chart */}
          {result && (
            <ComplexityChart detected={result.complexity} energyCostKwh={result.energyCostKwh} />
          )}
        </div>

        {/* ── RIGHT: Results Panel ── */}
        <div className="results-panel">
          {result ? (
            <>
              {/* Gauge */}
              <div className="gauge-card">
                <div className="gauge-label">Sustainability Score</div>
                <GaugeMeter score={result.sustainabilityScore} />
                <div className="gauge-rating" style={{ color: ratingColor(result.rating) }}>
                  {result.rating}
                </div>
              </div>

              {/* Energy Cost Card */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={14} style={{ color: 'var(--amber)' }} /> Energy Cost Per Execution
                </div>
                <div className="energy-grid">
                  {[
                    { label: 'Energy Score', value: result.energyScore,    unit: 'units', color: 'var(--amber)' },
                    { label: 'Power Cost',   value: result.energyCostKwh,  unit: 'kWh',   color: 'var(--cyan)' },
                    { label: 'CO₂ Emitted',  value: result.co2Grams,       unit: 'g',      color: '#f87171' },
                    { label: 'Dollar Cost',  value: `$${result.dollarCost}`, unit: 'USD',  color: 'var(--green)' },
                  ].map(item => (
                    <div className="energy-item" key={item.label}>
                      <div className="label">{item.label}</div>
                      <div className="value" style={{ color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.unit}</div>
                    </div>
                  ))}
                </div>
                {result.potentialSaving > 0 && (
                  <div style={{ marginTop: '0.75rem', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 10, padding: '0.6rem 0.875rem', fontSize: '0.8rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Lightbulb size={13} /> Optimizing could save ~<strong>{result.potentialSaving}</strong> energy units
                  </div>
                )}
              </div>

              {/* Tabs: Detections / Language Tips */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  {[
                    { id: 'detections', label: `Issues (${result.suggestions.length})` },
                    { id: 'tips',       label: `${language} Tips` },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      style={{
                        flex: 1, padding: '0.45rem 0.5rem', borderRadius: 10, border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        background: activeTab === t.id ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                        color: activeTab === t.id ? 'var(--green)' : 'var(--text-muted)',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'detections' && (
                  result.suggestions.length ? (
                    <div className="detection-list">
                      {result.suggestions.map((s, i) => (
                        <div key={i} className={`detection-item${expanded[i] ? ' expanded' : ''}`}>
                          <div className="detection-title" onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}>
                            <span className="detection-name">{s.title}</span>
                            <span className={`badge ${SEVERITY_COLORS[s.severity]}`}>{s.severity}</span>
                          </div>
                          {expanded[i] && (
                            <>
                              <div className="detection-detail" style={{ display: 'block' }}>{s.detail}</div>
                              <div className="detection-saving">{s.saving}</div>
                              <OptimizedCodePanel suggestion={s} language={language} />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-issues">
                      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}><CheckCircle2 size={32} color="var(--green)" /></div>
                      <div style={{ color: 'var(--green)', fontWeight: 600 }}>No issues detected!</div>
                      <div>This code looks energy-efficient.</div>
                    </div>
                  )
                )}

                {activeTab === 'tips' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(result.languageTips || []).map((tip, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.7rem 0.875rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: TIP_COLORS[tip.cat] || 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: '0.15rem 0.5rem', border: '1px solid rgba(255,255,255,0.08)', marginRight: '0.4rem' }}>
                          {tip.cat}
                        </span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0', lineHeight: 1.65 }}>{tip.tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : limitReached ? (
            <div className="limit-gate">
              <AlertTriangle size={28} color="var(--red)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>Monthly Limit Reached</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Free plan allows <strong>10 analyses/month</strong>. Upgrade to Pro for unlimited analyses.
                </div>
              </div>
              <Link to="/pricing" style={{ background: '#7c3aed', borderRadius: 12, padding: '0.65rem 1.25rem', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Upgrade
              </Link>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Bot size={40} color="var(--cyan)" style={{ opacity: 0.6 }} /></div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>AI Engine Ready</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Paste code to detect energy patterns, get optimized rewrites, CO₂ impact, and language-specific tips.</div>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat FAB */}
      <button
        onClick={() => setChatOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 198,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: chatOpen ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--green), var(--cyan))',
          color: chatOpen ? 'var(--text-muted)' : '#000',
          fontSize: '1.4rem',
          boxShadow: chatOpen ? 'none' : '0 4px 20px var(--green-glow)',
          cursor: 'pointer', transition: 'all 0.25s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title={chatOpen ? 'Close AI Chat' : 'Ask AI about your code'}
      >
        <MessageSquare size={22} />
      </button>

      <ChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} analysisContext={result} />
    </AppLayout>
  );
}

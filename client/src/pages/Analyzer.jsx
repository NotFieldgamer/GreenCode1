import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Download, Zap, Lightbulb, Bot, Copy,
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
  MessageSquare, Terminal, Activity
} from 'lucide-react';

import Page from '../components/Page';
import { toast, ToastContainer } from '../components/Toast';
import ComplexityChart from '../components/ComplexityChart';
import ChatSidebar from '../components/ChatSidebar';
import api from '../utils/api';

/* ================= THEME CONSTANTS ================= */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';
const NEON_AMBER = '#ffb84d';
const NEON_RED = '#ef4444';

const LANGUAGES = [
  'javascript', 'python', 'java', 'c++', 'typescript',
  'go', 'rust', 'php', 'ruby'
];

/* ================= INJECTED STYLES ================= */
const analyzerStyles = `
  .analyzer-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem 0;
    align-items: start;
    width: 100%;
    box-sizing: border-box;
  }

  .glass-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
  }

  .ide-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    background: rgba(0, 0, 0, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-wrap: wrap;
    gap: 1rem;
  }

  .ide-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .mac-dots {
    display: flex;
    gap: 6px;
  }

  .mac-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .code-textarea {
    width: 100%;
    min-height: 500px;
    background: rgba(5, 5, 15, 0.6);
    color: #e5e7eb;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.95rem;
    line-height: 1.6;
    padding: 1.5rem;
    border: none;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
  }

  /* Custom Scrollbar for Textarea */
  .code-textarea::-webkit-scrollbar { width: 10px; height: 10px; }
  .code-textarea::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
  .code-textarea::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 5px; }
  .code-textarea::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

  .bottom-actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 1.5rem;
    gap: 1.5rem;
    flex-wrap: wrap; /* CRITICAL: Allows stacking on mobile */
  }

  .chart-wrapper {
    flex: 1;
    min-width: 280px;
    max-width: 100%;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); /* CRITICAL: Allows metrics to shrink properly */
    gap: 1rem;
  }

  .chat-fab {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${NEON_GREEN}, ${NEON_CYAN});
    color: #000;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 255, 204, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
    z-index: 100;
  }
  
  .chat-fab:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 8px 30px rgba(0, 255, 204, 0.4);
  }

  .chat-fab.active {
    background: #fff;
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
  }

  /* MOBILE SPECIFIC BREAKPOINTS */
  @media (max-width: 992px) {
    .analyzer-grid {
      grid-template-columns: 1fr;
    }
    .code-textarea {
      min-height: 350px;
      padding: 1rem;
    }
    .ide-header {
      justify-content: center;
    }
    .ide-controls {
      justify-content: center;
      width: 100%;
    }
    .bottom-actions {
      flex-direction: column;
    }
    .chart-wrapper {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .chat-fab {
      bottom: 1.5rem;
      right: 1.5rem;
      width: 50px;
      height: 50px;
    }
  }
`;

// Add this helper component to both Analyzer.jsx and Generator.jsx
function CustomSelect({ value, onChange, options, themeColor = '#00d4ff' }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', minWidth: '140px', userSelect: 'none' }}>
      <style>{`
        .custom-dropdown-scroll::-webkit-scrollbar { width: 6px; }
        .custom-dropdown-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dropdown-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        .custom-dropdown-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
      `}</style>

      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${isOpen ? themeColor : 'rgba(255, 255, 255, 0.1)'}`,
          color: '#fff',
          padding: '0.6rem 1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? `0 0 15px ${themeColor}30` : 'none'
        }}
      >
        {value.toUpperCase()}
        <ChevronDown size={16} style={{ color: '#9ca3af', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div className="custom-dropdown-scroll" style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem',
          background: 'rgba(15, 15, 25, 0.98)', border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px', backdropFilter: 'blur(16px)', zIndex: 100,
          maxHeight: '220px', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
          animation: 'fadeSlideUp 0.2s ease forwards'
        }}>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{
                padding: '0.75rem 1rem', fontSize: '0.85rem',
                color: value === opt ? themeColor : '#9ca3af',
                background: value === opt ? `${themeColor}15` : 'transparent',
                fontWeight: value === opt ? 700 : 500, cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s', textTransform: 'uppercase', letterSpacing: '0.5px'
              }}
              onMouseEnter={e => { if (value !== opt) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={e => { if (value !== opt) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; } }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= GAUGE ================= */
function GaugeMeter({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  const color =
    score >= 80 ? NEON_GREEN
      : score >= 50 ? NEON_AMBER
      : NEON_RED;

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
      <svg width="160" height="160" viewBox="0 0 140 140">
        {/* Background Track */}
        <circle cx="70" cy="70" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
        {/* Active Progress */}
        <circle
          cx="70" cy="70" r={r}
          stroke={color} strokeWidth="12" fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dasharray 1s ease-out, stroke 0.5s ease' }}
        />
        {/* Glow Filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </svg>
      {/* Center Text */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: color, textShadow: `0 0 15px ${color}80`, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', letterSpacing: '1px' }}>/ 100</div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */
export default function Analyzer() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const debounceRef = useRef(null);

  /* ---------- ANALYZE ---------- */
  const analyze = useCallback(async (codeVal, lang) => {
    if (!codeVal.trim()) {
      setResult(null);
      return;
    }

    setAnalyzing(true);
    setLimitReached(false);

    try {
      const { data } = await api.post('/analyze', { code: codeVal, language: lang });
      setResult(data);
      if (data.sustainabilityScore >= 80) toast('Excellent sustainability score!', 'success');
    } catch (err) {
      if (err.response?.data?.code === 'ANALYSIS_LIMIT_REACHED') setLimitReached(true);
      else toast('Analysis failed', 'error');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  /* ---------- EDITOR ---------- */
  function handleCodeChange(e) {
    const val = e.target.value;
    setCode(val);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyze(val, language), 900);
  }

  /* ---------- DOWNLOAD ---------- */
  function downloadReport() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'GreenCode_Report.txt';
    a.click();
    toast('Report downloaded!', 'success');
  }

  /* ================= UI ================= */
  return (
    <Page title="AI Sustainability Analyzer" desc="Paste your code for real-time energy profiling.">
      <style>{analyzerStyles}</style>
      <ToastContainer />

      <div className="analyzer-grid">
        
        {/* ================= LEFT (EDITOR) ================= */}
        <div>
          <div className="glass-panel" style={{ border: `1px solid ${analyzing ? NEON_CYAN : 'rgba(255,255,255,0.08)'}`, transition: 'border 0.3s', boxShadow: analyzing ? `0 0 20px ${NEON_CYAN}20` : 'none' }}>
            <div className="ide-header">
              <div className="mac-dots">
                <div className="mac-dot" style={{ background: '#ff5f56' }} />
                <div className="mac-dot" style={{ background: '#ffbd2e' }} />
                <div className="mac-dot" style={{ background: '#27c93f' }} />
              </div>

              <div className="ide-controls">
                <CustomSelect 
                  value={language} 
                  options={LANGUAGES}
                  themeColor={NEON_CYAN}
                  onChange={(val) => {
                    setLanguage(val);
                    if (code) analyze(code, val);
                  }} 
                />

                <button
                  onClick={() => analyze(code, language)}
                  disabled={analyzing}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: analyzing ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${NEON_GREEN}, ${NEON_CYAN})`,
                    color: analyzing ? '#9ca3af' : '#000',
                    border: 'none', borderRadius: '6px', padding: '0.4rem 1rem',
                    fontSize: '0.85rem', fontWeight: 600, cursor: analyzing ? 'not-allowed' : 'pointer',
                    boxShadow: analyzing ? 'none' : '0 2px 10px rgba(0, 255, 204, 0.2)'
                  }}
                >
                  {analyzing ? <Activity size={14} className="spin" /> : <Play size={14} />}
                  {analyzing ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </div>
            </div>

            <textarea
              className="code-textarea"
              placeholder="// Paste your algorithm here to begin sustainability profiling..."
              value={code}
              onChange={handleCodeChange}
              spellCheck={false}
            />
          </div>

          {result && (
            <div className="bottom-actions">
              <button onClick={downloadReport} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                padding: '0.6rem 1.25rem', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                <Download size={16} /> Export Report
              </button>

              <div className="chart-wrapper">
                <ComplexityChart detected={result.complexity} energyCostKwh={result.energyCostKwh} />
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT (RESULTS) ================= */}
        <div>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Score Card */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 600, fontSize: '1.1rem', justifyContent: 'center' }}>
                  <Lightbulb size={18} color={NEON_AMBER} /> AI Efficiency Rating
                </div>
                
                <GaugeMeter score={result.sustainabilityScore} />
                
                <div style={{ textAlign: 'center', color: '#e5e7eb', fontSize: '1.1rem', fontWeight: 500 }}>
                  Grade: <span style={{ color: result.sustainabilityScore >= 80 ? NEON_GREEN : NEON_AMBER }}>{result.rating || 'Optimal'}</span>
                </div>
              </div>

              {/* Metrics Card */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 600, marginBottom: '1.5rem' }}>
                  <Zap size={18} color={NEON_CYAN} /> Projected Impact
                </div>

                <div className="metrics-grid">
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Energy Cost</div>
                    <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, fontFamily: 'monospace' }}>{result.energyScore} <span style={{fontSize:'0.8rem', color:'#6b7280'}}>kWh</span></div>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Carbon Est.</div>
                    <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, fontFamily: 'monospace' }}>{result.co2Grams} <span style={{fontSize:'0.8rem', color:'#6b7280'}}>g CO₂</span></div>
                  </div>
                </div>
              </div>

            </div>
          ) : limitReached ? (
            <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', border: `1px solid ${NEON_RED}40`, background: `${NEON_RED}10` }}>
              <AlertTriangle size={48} color={NEON_RED} style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem' }}>Analysis Limit Reached</h3>
              <p style={{ color: '#9ca3af', marginBottom: '2rem', lineHeight: 1.6 }}>You have exhausted your free monthly AI analysis quota. Upgrade to Pro for unlimited scans.</p>
              <Link to="/pricing" style={{
                display: 'inline-block', background: NEON_RED, color: '#fff', padding: '0.75rem 2rem',
                borderRadius: '8px', fontWeight: 600, textDecoration: 'none', boxShadow: `0 4px 15px ${NEON_RED}40`
              }}>
                View Pricing
              </Link>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, background: 'rgba(0,212,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: `1px solid ${NEON_CYAN}20` }}>
                <Terminal size={32} color={NEON_CYAN} />
              </div>
              <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Awaiting Input</div>
              <div style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6 }}>Paste your code in the editor to instantly analyze sustainability metrics and complexity.</div>
            </div>
          )}
        </div>
      </div>

      {/* CHAT FAB */}
      <button className={`chat-fab ${chatOpen ? 'active' : ''}`} onClick={() => setChatOpen(v => !v)}>
        <MessageSquare size={24} color={chatOpen ? '#000' : '#000'} />
      </button>

      <ChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} analysisContext={result} />
    </Page>
  );
}
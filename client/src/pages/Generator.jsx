import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink, Zap, Sparkles, Code2, Settings, AlertTriangle, ChevronDown, ChevronUp, Lightbulb, TerminalSquare } from 'lucide-react';
import PremiumGate from '../components/PremiumGate';
import { toast, ToastContainer } from '../components/Toast';
import { useSubscription } from '../hooks/useSubscription';
import api from '../utils/api';

/* ================= THEME CONSTANTS ================= */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';
const NEON_PURPLE = '#a78bfa';

const LANGUAGES = ['javascript','typescript','python','java','go','rust','c++','php','ruby'];

const QUICK_CHIPS = [
  'Find duplicates in an array', 'Debounce user input', 'Binary search in sorted list',
  'Memoize expensive function', 'Fetch with retry and backoff', 'Flatten nested array',
  'Group array by property', 'LRU cache implementation', 'Deep clone an object', 'Rate limiter (token bucket)'
];

const COMPLEXITY_COLORS = {
  'O(1)': NEON_GREEN,
  'O(log n)': '#4ade80',
  'O(n)': NEON_CYAN,
  'O(n log n)': '#ffb84d',
  'O(n²)': '#ef4444',
};

/* ================= INJECTED STYLES ================= */
const generatorStyles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(12px);
    margin-bottom: 1.5rem;
  }

  .ai-textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    color: #fff;
    font-size: 0.95rem;
    font-family: 'Inter', sans-serif;
    resize: vertical;
    min-height: 100px;
    line-height: 1.6;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .ai-textarea:focus {
    border-color: ${NEON_PURPLE};
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 0 0 15px rgba(167, 139, 250, 0.15);
  }

  .quick-chip {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    color: #9ca3af;
    font-size: 0.8rem;
    padding: 0.4rem 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quick-chip:hover {
    background: rgba(167, 139, 250, 0.1);
    border-color: ${NEON_PURPLE};
    color: ${NEON_PURPLE};
    transform: translateY(-1px);
  }

  .lang-select-ai {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 0.6rem 2rem 0.6rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .lang-select-ai:focus {
    border-color: ${NEON_PURPLE};
  }

  .btn-generate {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, ${NEON_PURPLE}, #d8b4fe);
    color: #000;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.5rem;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .btn-generate:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(167, 139, 250, 0.3);
  }

  .btn-generate:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(255,255,255,0.1);
    color: #9ca3af;
  }

  .data-badge {
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-family: 'Fira Code', monospace;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.3rem;
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

function CodeBlock({ code, language, label, onCopy }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <TerminalSquare size={14} color="#9ca3af" />
          <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{language}</span>
          {label && <span style={{ background: 'rgba(0, 212, 255, 0.1)', color: NEON_CYAN, border: `1px solid rgba(0, 212, 255, 0.2)`, padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>{label}</span>}
        </div>
        <button
          onClick={onCopy}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e5e7eb', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <Copy size={14} /> Copy
        </button>
      </div>
      <pre style={{ margin: 0, padding: '1.25rem', fontSize: '0.9rem', fontFamily: "'Fira Code', monospace", color: '#e5e7eb', overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {code}
      </pre>
    </div>
  );
}

function GeneratorContent() {
  const { credits, refresh } = useSubscription();
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showAlts, setShowAlts] = useState(false);

  async function generate(desc = description) {
    if (!desc.trim()) { toast('Describe what you want to generate', 'info'); return; }
    if (credits <= 0) { toast('No credits remaining. Upgrade to get more!', 'error'); return; }
    setLoading(true); setResult(null); setShowAlts(false);
    try {
      const { data } = await api.post('/generator', { description: desc, language });
      setResult(data);
      refresh();
      toast(`Code generated! (${data.creditUsed ? '1 credit used' : 'no cost'})`, 'success');
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'NO_CREDITS') toast('No credits left! Upgrade for more.', 'error');
      else toast(err.response?.data?.error || 'Generation failed', 'error');
    } finally { setLoading(false); }
  }

  function useChip(chip) {
    setDescription(chip);
    generate(chip);
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 0' }}>
      <style>{generatorStyles}</style>
      <ToastContainer />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
          <Sparkles size={28} color={NEON_PURPLE} style={{ filter: `drop-shadow(0 0 10px ${NEON_PURPLE}60)` }} /> AI Code Generator
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontSize: '1rem' }}>
          <span>Describe any function in plain English to get the most energy-efficient implementation.</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffb84d', fontWeight: 600, background: 'rgba(255, 184, 77, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
            <Zap size={14} /> {credits} credit{credits !== 1 ? 's' : ''} left
          </span>
        </div>
      </div>

      {/* Input Area */}
      <div className="glass-card">
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Describe your function
        </div>
        
        <textarea
          className="ai-textarea"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); }}
          placeholder="e.g. 'Write a function to find duplicates in an array efficiently'..."
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <CustomSelect 
  value={language} 
  options={LANGUAGES}
  themeColor={NEON_CYAN}
  onChange={(val) => {
    setLanguage(val);
    if (code) analyze(code, val);
  }} 
/>
            <button className="btn-generate" onClick={() => generate()} disabled={loading || !description.trim() || credits <= 0}>
              {loading ? (
                <><Settings size={16} className="spin" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate (1 credit)</>
              )}
            </button>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace' }}>Ctrl</kbd> + <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace' }}>Enter</kbd> to run
          </span>
        </div>
      </div>

      {/* Quick Chips */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Quick Examples
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {QUICK_CHIPS.map(chip => (
            <button key={chip} className="quick-chip" onClick={() => useChip(chip)} disabled={loading}>
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Settings size={40} color={NEON_PURPLE} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 1rem' }} />
          <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Synthesizing Code...</div>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Analyzing algorithmic complexity for the most energy-efficient {language} implementation.</div>
        </div>
      )}

      {/* Result Area */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeSlideUp 0.4s ease' }}>
          
          {/* Meta Header */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{result.description}</div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{result.category}</div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="data-badge" style={{ background: 'rgba(0, 255, 204, 0.1)', color: NEON_GREEN, border: `1px solid rgba(0, 255, 204, 0.3)` }}>
                Score: {result.sustainabilityScore}/100
              </div>
              <div className="data-badge" style={{ background: `${COMPLEXITY_COLORS[result.complexity] || NEON_CYAN}15`, color: COMPLEXITY_COLORS[result.complexity] || NEON_CYAN, border: `1px solid ${COMPLEXITY_COLORS[result.complexity] || NEON_CYAN}40` }}>
                {result.complexity}
              </div>
              <div className="data-badge" style={{ background: 'rgba(167, 139, 250, 0.1)', color: NEON_PURPLE, border: `1px solid rgba(167, 139, 250, 0.3)` }}>
                <Zap size={12} /> {result.energyScore} kWh
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div style={{ background: 'rgba(0, 255, 204, 0.05)', borderLeft: `3px solid ${NEON_GREEN}`, padding: '1rem 1.25rem', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: NEON_GREEN, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lightbulb size={14} /> Why this approach is optimal
            </div>
            <p style={{ fontSize: '0.95rem', color: '#d1d5db', margin: 0, lineHeight: 1.6 }}>{result.explanation}</p>
          </div>

          {/* Code Output */}
          <CodeBlock
            code={result.code}
            language={result.language}
            label="Most Efficient"
            onCopy={() => { navigator.clipboard.writeText(result.code); toast('Code copied!', 'success'); }}
          />

          {/* Bottom Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => { navigator.clipboard.writeText(result.code); toast('Code copied!', 'success'); }} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
              <Copy size={16} /> Copy Full Snippet
            </button>
            <button onClick={() => window.open(`/analyzer?code=${encodeURIComponent(result.code)}&lang=${result.language}`, '_blank')} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: NEON_CYAN, border: `1px solid ${NEON_CYAN}`, borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <ExternalLink size={16} /> Run in Analyzer
            </button>
          </div>

          {/* Alternatives Accordion */}
          {result.alternatives?.length > 0 && (
            <div className="glass-card" style={{ padding: 0, marginTop: '1rem' }}>
              <div 
                onClick={() => setShowAlts(!showAlts)}
                style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: showAlts ? 'rgba(255,255,255,0.02)' : 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffb84d', fontWeight: 600, fontSize: '0.95rem' }}>
                  <AlertTriangle size={16} /> Show Alternative Approaches <span style={{ color: '#6b7280', fontWeight: 400 }}>(Less Efficient)</span>
                </div>
                {showAlts ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
              </div>
              
              {showAlts && (
                <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                  {result.alternatives.map((alt, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#d1d5db', fontWeight: 500 }}>{alt.label}</span>
                        <span className="data-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', padding: '0.15rem 0.5rem' }}>
                          {alt.complexity}
                        </span>
                      </div>
                      <CodeBlock
                        code={alt.code}
                        language={result.language}
                        onCopy={() => { navigator.clipboard.writeText(alt.code); toast('Copied alternative version', 'info'); }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(167, 139, 250, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: `1px solid rgba(167, 139, 250, 0.3)` }}>
            <Code2 size={28} color={NEON_PURPLE} />
          </div>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Waiting for Prompt</div>
          <div style={{ color: '#9ca3af', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto' }}>
            Describe the function you need above, or click a quick start chip. Each generation costs 1 credit.
          </div>
        </div>
      )}
    </div>
  );
}

export default function Generator() {
  const { isPro, isEnterprise } = useSubscription();

  return (
    <>
      {isPro || isEnterprise ? (
        <GeneratorContent />
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 0' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              <Sparkles size={28} color={NEON_PURPLE} /> AI Code Generator
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '1rem', margin: 0 }}>Generate the most energy-efficient code for any function. Pro & Enterprise feature.</p>
          </div>
          
          <PremiumGate feature="generator" requiredPlan="pro">
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', opacity: 0.4, pointerEvents: 'none' }}>
              <div style={{ marginBottom: '0.75rem', fontWeight: 600, color: '#fff' }}>Describe what you need</div>
              <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: '#6b7280', height: '80px' }}>
                Find duplicates in an array...
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                {QUICK_CHIPS.slice(0, 4).map(c => <span key={c} style={{ background: 'rgba(0,212,255,0.1)', border: `1px solid rgba(0,212,255,0.2)`, color: NEON_CYAN, borderRadius: '100px', padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}>{c}</span>)}
              </div>
            </div>
          </PremiumGate>
        </div>
      )}
    </>
  );
}
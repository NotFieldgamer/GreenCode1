import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink, Zap, Sparkles, Code2, Settings, AlertTriangle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import PremiumGate from '../components/PremiumGate';
import { toast, ToastContainer } from '../components/Toast';
import { useSubscription } from '../hooks/useSubscription';
import api from '../utils/api';

const QUICK_CHIPS = [
  'Find duplicates in an array',
  'Debounce user input',
  'Binary search in sorted list',
  'Memoize expensive function',
  'Fetch with retry and backoff',
  'Flatten nested array',
  'Group array by property',
  'LRU cache implementation',
  'Deep clone an object',
  'Rate limiter (token bucket)',
];

const LANGUAGES = ['javascript','typescript','python','java','go','rust','c++','php','ruby'];

const COMPLEXITY_COLORS = {
  'O(1)':        'var(--green)',
  'O(log n)':    '#4ade80',
  'O(n)':        'var(--cyan)',
  'O(n log n)':  'var(--amber)',
  'O(n\u00b2)':       'var(--red)',
};

function CodeBlock({ code, language, label, onCopy }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'capitalize' }}>{language}</span>
          {label && <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{label}</span>}
        </div>
        <button
          onClick={onCopy}
          style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: 6, color: 'var(--text-muted)', padding: '0.25rem 0.55rem', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}
        >
          <Copy size={12} /> Copy
        </button>
      </div>
      <pre style={{ margin: 0, padding: '1rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', overflowX: 'auto', lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {code}
      </pre>
    </div>
  );
}

function GeneratorContent() {
  const { credits, plan, refresh } = useSubscription();
  const [description, setDescription] = useState('');
  const [language, setLanguage]       = useState('javascript');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [showAlts, setShowAlts]       = useState(false);

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
    <div>
      <ToastContainer />

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="#a78bfa" /> Green Code Generator
        </h1>
        <p className="section-sub">
          Describe any function in plain English &rarr; get the most energy-efficient implementation.
          {' '}
          <span style={{ color: 'var(--amber)', fontWeight: 600 }}>
            {credits} credit{credits !== 1 ? 's' : ''} remaining
          </span>
          {' \u00b7 '}
          <Link to="/pricing" style={{ color: 'var(--cyan)', fontSize: '0.85rem' }}>Get more</Link>
        </p>
      </div>

      {/* Input area */}
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Describe what you need
        </div>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); }}
          placeholder="e.g. 'Find duplicates in an array efficiently' or 'Debounce a search input'"
          style={{
            width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
            borderRadius: 12, padding: '1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
            resize: 'vertical', minHeight: 80, lineHeight: 1.6, outline: 'none',
            fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--green)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="lang-select"
            style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button
            className="btn-primary"
            onClick={() => generate()}
            disabled={loading || !description.trim() || credits <= 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem' }}
          >
            {loading ? (
              <><span className="pulse-dot" style={{ background: '#000' }} /> Generating...</>
            ) : (
              <><Zap size={14} /> Generate (1 credit)</>
            )}
          </button>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ctrl+Enter</span>
        </div>
      </div>

      {/* Quick chips */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          Quick start examples
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => useChip(chip)}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                borderRadius: 100, color: 'var(--text-secondary)', fontSize: '0.78rem',
                padding: '0.3rem 0.75rem', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--green)'; e.target.style.color = 'var(--green)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.color = 'var(--text-secondary)'; }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
            <Settings size={32} color="var(--cyan)" style={{ animation: 'spin 1.5s linear infinite' }} />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Generating the most energy-efficient {language} implementation...
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Meta row */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{result.description}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{result.category}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--green)', border: '1px solid rgba(0,255,136,0.2)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {result.sustainabilityScore}/100
                </span>
                <span className="badge" style={{ background: `${COMPLEXITY_COLORS[result.complexity]}15`, color: COMPLEXITY_COLORS[result.complexity] || 'var(--cyan)', border: `1px solid ${COMPLEXITY_COLORS[result.complexity] || 'var(--cyan)'}30`, fontFamily: 'var(--font-mono)' }}>
                  {result.complexity}
                </span>
                <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Zap size={11} /> {result.energyScore} energy
                </span>
                {result.isTemplate && <span className="badge badge-cyan">Verified Pattern</span>}
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem', background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.12)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lightbulb size={13} /> Why this is optimal
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.75 }}>{result.explanation}</p>
          </div>

          {/* Generated code */}
          <CodeBlock
            code={result.code}
            language={result.language}
            label="Most Efficient"
            onCopy={() => { navigator.clipboard.writeText(result.code); toast('Code copied!', 'success'); }}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => { navigator.clipboard.writeText(result.code); toast('Code copied!', 'success'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Copy size={14} /> Copy Code
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                const url = `/analyzer?code=${encodeURIComponent(result.code)}&lang=${result.language}`;
                window.open(url, '_blank');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ExternalLink size={14} /> Open in Analyzer
            </button>
          </div>

          {/* Alternatives */}
          {result.alternatives?.length > 0 && (
            <div className="glass-card">
              <button
                onClick={() => setShowAlts(s => !s)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.875rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={14} color="var(--amber)" /> Alternative Approaches (less efficient)
                </span>
                <span>{showAlts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
              </button>
              {showAlts && (
                <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {result.alternatives.map((alt, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{alt.label}</span>
                        <span className="badge badge-medium" style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>{alt.complexity}</span>
                      </div>
                      <CodeBlock
                        code={alt.code}
                        language={result.language}
                        onCopy={() => { navigator.clipboard.writeText(alt.code); toast('Copied (less efficient version)', 'info'); }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Code2 size={40} color="var(--green)" style={{ opacity: 0.5 }} />
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Ready to generate green code</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Describe any function above, or click a quick start chip. Each generation costs 1 credit.
          </div>
        </div>
      )}
    </div>
  );
}

export default function Generator() {
  const { isPro, isEnterprise } = useSubscription();

  return (
    <AppLayout title="Code Generator">
      {isPro || isEnterprise ? (
        <GeneratorContent />
      ) : (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#a78bfa" /> Green Code Generator
            </h1>
            <p className="section-sub">Generate the most energy-efficient code for any function. Pro &amp; Enterprise feature.</p>
          </div>
          <PremiumGate feature="generator" requiredPlan="pro">
            {/* Preview */}
            <div className="glass-card" style={{ opacity: 0.5, pointerEvents: 'none' }}>
              <div style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Describe what you need</div>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid var(--glass-border)', padding: '1rem', color: 'var(--text-muted)', height: 80 }}>
                Find duplicates in an array...
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {QUICK_CHIPS.slice(0, 4).map(c => <span key={c} className="badge badge-cyan">{c}</span>)}
              </div>
            </div>
          </PremiumGate>
        </div>
      )}
    </AppLayout>
  );
}

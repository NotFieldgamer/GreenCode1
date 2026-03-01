import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Download,
  Zap,
  Lightbulb,
  Bot,
  Copy,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

import Page from '../components/Page';
import { toast, ToastContainer } from '../components/Toast';
import ComplexityChart from '../components/ComplexityChart';
import ChatSidebar from '../components/ChatSidebar';
import api from '../utils/api';

/* ================= CONSTANTS ================= */

const LANGUAGES = [
  'javascript',
  'python',
  'java',
  'c++',
  'typescript',
  'go',
  'rust',
  'php',
  'ruby'
];

const SEVERITY_COLORS = {
  high: 'chip-red',
  medium: 'chip-amber',
  low: 'chip-green'
};

/* ================= GAUGE ================= */

function GaugeMeter({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  const color =
    score >= 60
      ? 'var(--green)'
      : score >= 40
      ? 'var(--amber)'
      : 'var(--red)';

  return (
    <svg width="140" height="140">
      <circle
        cx="70"
        cy="70"
        r={r}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="10"
        fill="none"
      />

      <circle
        cx="70"
        cy="70"
        r={r}
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 70 70)"
      />

      <text
        x="70"
        y="65"
        textAnchor="middle"
        fill={color}
        fontSize="24"
        fontWeight="700"
      >
        {score}
      </text>

      <text
        x="70"
        y="82"
        textAnchor="middle"
        fill="var(--text-3)"
        fontSize="11"
      >
        /100
      </text>
    </svg>
  );
}

/* ================= COMPONENT ================= */

export default function Analyzer() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expanded, setExpanded] = useState({});
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
      const { data } = await api.post('/analyze', {
        code: codeVal,
        language: lang
      });

      setResult(data);

      if (data.sustainabilityScore >= 80)
        toast('Excellent sustainability score!', 'success');
    } catch (err) {
      if (err.response?.data?.code === 'ANALYSIS_LIMIT_REACHED')
        setLimitReached(true);
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
    debounceRef.current = setTimeout(
      () => analyze(val, language),
      900
    );
  }

  /* ---------- DOWNLOAD ---------- */

  function downloadReport() {
    if (!result) return;

    const blob = new Blob(
      [JSON.stringify(result, null, 2)],
      { type: 'text/plain' }
    );

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'GreenCode_Report.txt';
    a.click();

    toast('Report downloaded!', 'success');
  }

  /* ================= UI ================= */

  return (
    <Page
      title="AI Sustainability Analyzer"
      desc="Paste code for real-time AI analysis."
    >
      <ToastContainer />

      <div className="analyzer-layout">

        {/* ================= LEFT ================= */}

        <div>

          <div className="code-editor">

            <div className="code-editor-bar">

              <div className="editor-dots">
                <div className="editor-dot dot-red" />
                <div className="editor-dot dot-amber" />
                <div className="editor-dot dot-green" />
              </div>

              <select
                className="select"
                value={language}
                onChange={e => {
                  setLanguage(e.target.value);
                  if (code) analyze(code, e.target.value);
                }}
              >
                {LANGUAGES.map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => analyze(code, language)}
                disabled={analyzing}
              >
                <Play size={14} />
                Analyze
              </button>
            </div>

            <textarea
              className="code-textarea"
              placeholder="// Paste your code here..."
              value={code}
              onChange={handleCodeChange}
              spellCheck={false}
            />
          </div>

          {result && (
            <div className="mt-4 flex-between">

              <button
                className="btn btn-ghost"
                onClick={downloadReport}
              >
                <Download size={15} />
                Download Report
              </button>

              <ComplexityChart
                detected={result.complexity}
                energyCostKwh={result.energyCostKwh}
              />
            </div>
          )}
        </div>

        {/* ================= RIGHT ================= */}

        <div className="results-panel">

          {result ? (
            <>
              <div className="gauge-card">
                <div className="gauge-label-text">
                  Sustainability Score
                </div>

                <GaugeMeter
                  score={result.sustainabilityScore}
                />

                <div className="gauge-rating-text">
                  {result.rating}
                </div>
              </div>

              <div className="card">
                <div className="card-title">
                  <Zap size={14} />
                  Energy Metrics
                </div>

                <div className="energy-grid">

                  <div className="energy-cell">
                    <div className="energy-cell-label">
                      Energy
                    </div>
                    <div className="energy-cell-value">
                      {result.energyScore}
                    </div>
                  </div>

                  <div className="energy-cell">
                    <div className="energy-cell-label">
                      CO₂
                    </div>
                    <div className="energy-cell-value">
                      {result.co2Grams}
                    </div>
                  </div>

                </div>
              </div>
            </>
          ) : limitReached ? (
            <div className="limit-gate">
              <AlertTriangle size={26} />

              <div>
                Monthly analysis limit reached.
              </div>

              <Link to="/pricing" className="btn btn-primary">
                Upgrade
              </Link>
            </div>
          ) : (
            <div className="empty-state">
              <Bot size={40} />
              <div className="empty-state-label">
                AI Engine Ready
              </div>
              <div className="empty-state-sub">
                Paste code to start analysis.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CHAT */}

      <button
        className={`chat-fab ${chatOpen ? 'active' : ''}`}
        onClick={() => setChatOpen(v => !v)}
      >
        <MessageSquare size={20} />
      </button>

      <ChatSidebar
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        analysisContext={result}
      />
    </Page>
  );
}
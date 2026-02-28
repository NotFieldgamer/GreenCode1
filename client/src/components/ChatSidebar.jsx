import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import api from '../utils/api';

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '0.5rem 0' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)',
          animation: `pulse 1s ease ${i * 0.2}s infinite`,
          display: 'inline-block',
        }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isAI = msg.role === 'ai';
  return (
    <div style={{ display: 'flex', justifyContent: isAI ? 'flex-start' : 'flex-end', marginBottom: '0.75rem' }}>
      {isAI && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginRight: '0.5rem', marginTop: 4,
          background: 'var(--green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bot size={14} color="#000" />
        </div>
      )}
      <div style={{
        maxWidth: '80%',
        background: isAI ? 'rgba(0,212,255,0.08)' : 'rgba(0,255,136,0.1)',
        border: `1px solid ${isAI ? 'rgba(0,212,255,0.2)' : 'rgba(0,255,136,0.2)'}`,
        borderRadius: isAI ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        padding: '0.65rem 0.9rem',
        fontSize: '0.82rem',
        lineHeight: 1.65,
        color: 'var(--text-primary)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.text}
        {msg.suggestions?.length > 0 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {msg.suggestions.map((s, i) => (
              <span key={i} style={{ fontSize: '0.75rem', color: 'var(--cyan)', borderLeft: '2px solid var(--cyan)', paddingLeft: '0.5rem' }}>{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const QUICK = ['Why is my score low?', 'How do I fix nested loops?', 'What does O(n\u00b2) mean?', 'How much CO\u2082 can I save?'];

export default function ChatSidebar({ open, onClose, analysisContext }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m the GreenCode AI. Ask me anything about your code\'s energy efficiency, complexity, or sustainability impact!', suggestions: [] },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: msg, context: analysisContext || {} });
      setMessages(prev => [...prev, { role: 'ai', text: data.reply, suggestions: data.suggestions }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally { setLoading(false); }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'transparent' }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', bottom: 90, right: 24, zIndex: 200,
        width: 360, height: 520,
        background: 'rgba(8, 8, 25, 0.97)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.06)',
        animation: 'slideInRight 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#000" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>GreenCode AI</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--green)' }}>Online — Context-aware</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={13} color="#000" />
              </div>
              <TypingDots />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 1rem 0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {QUICK.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 100, color: 'var(--cyan)', padding: '0.3rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
          <input
            className="neu-input"
            style={{ flex: 1, fontSize: '0.85rem', padding: '0.6rem 0.875rem' }}
            placeholder="Ask about your code..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: input.trim() ? 'var(--cyan)' : 'rgba(255,255,255,0.06)',
              color: input.trim() ? '#000' : 'var(--text-muted)',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

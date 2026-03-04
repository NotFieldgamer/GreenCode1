import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import api from '../utils/api';

/* ================= THEME CONSTANTS ================= */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';

/* ================= INJECTED STYLES ================= */
const chatStyles = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes bounceDot {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    50% { transform: translateY(-4px); opacity: 1; }
  }

  @keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(0, 255, 204, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(0, 255, 204, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 255, 204, 0); }
  }

  .chat-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .chat-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .chat-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .chat-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .chat-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s;
  }
  .chat-input:focus {
    border-color: ${NEON_CYAN};
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.15);
  }
  .chat-input::placeholder {
    color: #6b7280;
  }

  .quick-reply-btn {
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 100px;
    color: ${NEON_CYAN};
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .quick-reply-btn:hover {
    background: rgba(0, 212, 255, 0.15);
    border-color: ${NEON_CYAN};
    transform: translateY(-1px);
  }
`;

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.5rem 0' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: '6px', height: '6px', borderRadius: '50%', background: NEON_CYAN,
          animation: `bounceDot 1s ease-in-out ${i * 0.15}s infinite`,
          display: 'inline-block',
        }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isAI = msg.role === 'ai';
  return (
    <div style={{ display: 'flex', justifyContent: isAI ? 'flex-start' : 'flex-end', marginBottom: '1rem' }}>
      {isAI && (
        <div style={{
          width: 28, height: 28, borderRadius: '8px', flexShrink: 0, marginRight: '0.75rem', marginTop: 2,
          background: `linear-gradient(135deg, ${NEON_GREEN}, ${NEON_CYAN})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 10px rgba(0, 255, 204, 0.2)`
        }}>
          <Bot size={16} color="#000" />
        </div>
      )}
      <div style={{
        maxWidth: '82%',
        background: isAI ? 'rgba(0, 212, 255, 0.05)' : 'rgba(0, 255, 204, 0.05)',
        border: `1px solid ${isAI ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 255, 204, 0.2)'}`,
        borderRadius: isAI ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        padding: '0.75rem 1rem',
        fontSize: '0.85rem',
        lineHeight: 1.6,
        color: '#e5e7eb',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        {msg.text}
        {msg.suggestions?.length > 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
            {msg.suggestions.map((s, i) => (
              <span key={i} style={{ 
                fontSize: '0.75rem', color: NEON_CYAN, display: 'flex', alignItems: 'flex-start', gap: '0.4rem' 
              }}>
                <Sparkles size={12} style={{ marginTop: '2px', flexShrink: 0 }} /> {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const QUICK = ['Why is my score low?', 'How do I fix nested loops?', 'What does O(n²) mean?', 'Estimate CO₂ savings'];

export default function ChatSidebar({ open, onClose, analysisContext }) {
  const { plan, loading: planLoading } = useSubscription();
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am the GreenCode AI. Ask me anything about your code\'s energy efficiency, complexity, or sustainability impact!', suggestions: [] },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

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
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, my connection to the server was interrupted. Please try again.' }]);
    } finally { setLoading(false); }
  }

  if (!open) return null;

  return (
    <>
      <style>{chatStyles}</style>
      
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }} />
      
      {/* Panel */}
      <div style={{
        position: 'fixed', bottom: 90, right: 24, zIndex: 200,
        width: 380, height: 600, maxHeight: 'calc(100vh - 120px)',
        background: 'rgba(10, 10, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        
        {/* Header */}
        <div style={{ 
          padding: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px 20px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(0, 255, 204, 0.1)', border: `1px solid rgba(0, 255, 204, 0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color={NEON_GREEN} />
              </div>
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, background: NEON_GREEN, borderRadius: '50%', border: '2px solid #0a0a14', animation: 'pulseGlow 2s infinite' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', letterSpacing: '0.3px' }}>GreenCode AI</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Context-Aware Assistant
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#9ca3af', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9ca3af'; }}>
            <X size={16} />
          </button>
        </div>

        {!planLoading && plan === 'free' ? (
          /* Lock Screen for Free Users */
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <div style={{ background: 'rgba(0, 212, 255, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Lock size={28} color={NEON_CYAN} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.75rem' }}>AI Chat Locked</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              The AI Chat Assistant is a premium feature. Upgrade to Pro or Enterprise to ask unlimited questions about your code's efficiency.
            </p>
            <Link to="/pricing" onClick={onClose} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: `linear-gradient(135deg, ${NEON_GREEN}, ${NEON_CYAN})`, color: '#000',
              padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem'
            }}>
              <Sparkles size={16} /> View Upgrade Plans
            </Link>
          </div>
        ) : (
          /* Normal Chat UI for Paid Users */
          <>
            <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.25rem' }}>
              {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '8px', background: `linear-gradient(135deg, ${NEON_GREEN}, ${NEON_CYAN})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={16} color="#000" />
                  </div>
                  <div style={{ background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '4px 14px 14px 14px', padding: '0.5rem 1rem' }}>
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {messages.length <= 1 && (
              <div className="chat-scroll" style={{ padding: '0 1.25rem 1rem', display: 'flex', overflowX: 'auto', gap: '0.5rem', scrollbarWidth: 'none' }}>
                {QUICK.map(q => (
                  <button key={q} className="quick-reply-btn" onClick={() => sendMessage(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 20px 20px' }}>
              <input
                className="chat-input"
                placeholder="Ask about your code..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 44, height: 44, borderRadius: '12px', border: 'none', flexShrink: 0,
                  background: input.trim() ? `linear-gradient(135deg, ${NEON_GREEN}, ${NEON_CYAN})` : 'rgba(255,255,255,0.05)',
                  color: input.trim() ? '#000' : '#6b7280',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: input.trim() ? '0 4px 15px rgba(0, 255, 204, 0.2)' : 'none'
                }}
              >
                <Send size={18} style={{ marginLeft: input.trim() ? '2px' : '0' }} />
              </button> 
            </div>
          </>
        )}
      </div>
    </>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, Cpu, Zap, BarChart3, Shield, Globe, FileText,
  TrendingUp, ChevronRight, Terminal, Code2, Layers
} from 'lucide-react';

/* ─── Animated word-by-word reveal ─────────────────────────────────── */
function RevealText({ text, delay = 0, className = '', style = {} }) {
  const words = text.split(' ');
  return (
    <span className={className} style={{ display: 'inline', ...style }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: 0,
            transform: 'translateY(24px)',
            animation: `wordReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
            animationDelay: `${delay + i * 0.07}s`,
            marginRight: '0.28em',
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

/* ─── Fade-in on scroll ─────────────────────────────────────────────── */
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  {
    icon: <Cpu size={20} />,
    title: 'AI Pattern Detection',
    desc: 'Seven energy-wasting patterns detected in real time — nested loops, memory leaks, unhandled promises, and more.',
    color: 'var(--green)',
  },
  {
    icon: <Zap size={20} />,
    title: 'Energy Cost Calculator',
    desc: 'Precise kWh, CO\u2082, and dollar cost per execution based on global energy models and real hardware benchmarks.',
    color: 'var(--cyan)',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Interactive Dashboard',
    desc: 'Live charts and time-series tracking your sustainability progress, energy trends, and carbon offset over time.',
    color: '#a78bfa',
  },
  {
    icon: <Code2 size={20} />,
    title: 'AI Code Generator',
    desc: 'Generate optimized, energy-efficient code from a description. Powered by Gemini — for Pro and Enterprise users.',
    color: 'var(--amber)',
  },
  {
    icon: <Globe size={20} />,
    title: 'Carbon Footprint',
    desc: 'Track the carbon impact of your software with actionable optimization tips and projected CO\u2082 reduction.',
    color: 'var(--green)',
  },
  {
    icon: <Layers size={20} />,
    title: 'Complexity Visualizer',
    desc: 'Interactive Big O chart showing how your algorithm scales from 10 to 10,000 elements across complexity classes.',
    color: 'var(--cyan)',
  },
];

const STATS = [
  { value: '2.4M+',  label: 'Lines Analyzed',    color: 'var(--green)' },
  { value: '18.7T',  label: 'CO\u2082 Prevented (g)', color: 'var(--cyan)' },
  { value: '12K+',   label: 'Developers',         color: '#a78bfa' },
  { value: '94%',    label: 'Avg. Energy Saved',  color: 'var(--amber)' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 2rem',
        background: 'rgba(6,6,18,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, fontSize: '1.05rem' }}>
          <div style={{ width: 28, height: 28, background: 'var(--green)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={15} color="#000" />
          </div>
          GreenCode
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/leaderboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.4rem 0.75rem' }}>Leaderboard</Link>
          <Link to="/pricing" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.4rem 0.75rem' }}>Pricing</Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary btn-sm" style={{ textDecoration: 'none' }}>Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Sign In</Link>
              <Link to="/register" className="btn-primary btn-sm" style={{ textDecoration: 'none' }}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '5rem 2rem 4rem',
        overflow: 'hidden',
      }}>
        {/* Subtle radial glow — single, not gradient foundation */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none', opacity: 0.4,
        }} />

        <div style={{ maxWidth: 820, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
            borderRadius: 100, padding: '0.4rem 1rem',
            fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2rem',
            animation: 'fadeSlideUp 0.5s ease forwards',
          }}>
            <Terminal size={12} color="var(--green)" />
            Science & Technology for a Sustainable Future
          </div>

          {/* Main heading — word-by-word reveal */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 7vw, 5.2rem)',
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: '1.75rem',
          }}>
            <RevealText text="Write Code" delay={0.1} />
            <br />
            <RevealText
              text="That Saves"
              delay={0.35}
              style={{ color: 'var(--cyan)' }}
            />
            <br />
            <RevealText text="the Planet" delay={0.6} />
          </h1>

          {/* Subtitle */}
          <div style={{
            opacity: 0,
            animation: 'fadeSlideUp 0.6s ease 1.1s forwards',
          }}>
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
              color: 'var(--text-muted)',
              maxWidth: 560, margin: '0 auto 2.5rem',
              lineHeight: 1.75, fontWeight: 400,
            }}>
              GreenCode uses AI to analyze your software's energy consumption, carbon impact,
              and efficiency — giving developers the data to build a more sustainable digital world.
            </p>
          </div>

          {/* CTAs */}
          <div style={{
            opacity: 0,
            animation: 'fadeSlideUp 0.6s ease 1.3s forwards',
            display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {isAuthenticated ? (
              <Link to="/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--green)', color: '#000',
                borderRadius: 100, padding: '0.85rem 2rem',
                fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--green)', color: '#000',
                  borderRadius: 100, padding: '0.85rem 2.25rem',
                  fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
                }}>
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link to="/pricing" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 100, padding: '0.85rem 2rem',
                  fontWeight: 500, fontSize: '0.95rem', textDecoration: 'none',
                }}>
                  View Pricing <ChevronRight size={16} />
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div style={{
            opacity: 0,
            animation: 'fadeSlideUp 0.6s ease 1.55s forwards',
            display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap',
            marginTop: '4rem',
            paddingTop: '3rem',
            borderTop: '1px solid var(--glass-border)',
          }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.8rem', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 400 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
              borderRadius: 100, padding: '0.35rem 0.875rem',
              fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem',
            }}>
              <Cpu size={11} /> Platform Features
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '0.875rem' }}>
              Everything you need to build
              <br />
              <span style={{ color: 'var(--cyan)' }}>sustainable software</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto' }}>
              A complete ecosystem for understanding, measuring, and reducing your code's environmental impact.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: 'var(--glass-border)' }}>
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.07}>
              <div style={{
                background: 'var(--bg-base)',
                padding: '2rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-base)'}
              >
                <div style={{ color: f.color, marginBottom: '0.875rem' }}>{f.icon}</div>
                <div style={{ fontWeight: 500, fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Pricing teaser ─────────────────────────────────────────── */}
      <section style={{ padding: '5rem 2rem', borderTop: '1px solid var(--glass-border)' }}>
        <FadeIn>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '0.875rem' }}>
              Start free. Scale when ready.
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Free plan includes 10 analyses per month. Upgrade to Pro for the AI Code Generator, unlimited analyses, and team features.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/pricing" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', borderRadius: 100,
                padding: '0.75rem 1.75rem', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
              >
                View Plans <ChevronRight size={15} />
              </Link>
              {!isAuthenticated && (
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--cyan)', color: '#000',
                  borderRadius: 100, padding: '0.75rem 1.75rem',
                  fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
                }}>
                  Start Analyzing Now <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)',
        padding: '2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        color: 'var(--text-muted)', fontSize: '0.8rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 20, height: 20, background: 'var(--green)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={11} color="#000" />
          </div>
          GreenCode — Science &amp; Technology for a Sustainable Future
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/leaderboard" style={{ color: 'var(--text-muted)' }}>Leaderboard</Link>
          <Link to="/pricing" style={{ color: 'var(--text-muted)' }}>Pricing</Link>
          <Link to="/login" style={{ color: 'var(--text-muted)' }}>Sign In</Link>
        </div>
      </footer>
    </div>
  );
}

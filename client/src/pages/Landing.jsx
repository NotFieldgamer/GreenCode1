import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls, Float, Stars } from '@react-three/drei';
import {
  ArrowRight, Cpu, Zap, BarChart3, Globe,
  TrendingUp, ChevronRight, Terminal, Code2, Layers
} from 'lucide-react';

// Mock auth context for demonstration
const useAuth = () => ({ isAuthenticated: false });

/* ─── 3D COMPONENTS (Three.js / React Three Fiber) ─────────────────── */

// 1. The central pulsing energy core
function EnergyCore() {
  const sphereRef = useRef();

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.2;
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <Sphere ref={sphereRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#00ffcc"
          emissive="#00ffcc"
          emissiveIntensity={0.4}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </Sphere>
      {/* Inner solid core */}
      <Sphere args={[1.2, 32, 32]}>
        <meshStandardMaterial color="#0a2a2a" roughness={0.1} metalness={0.8} />
      </Sphere>
    </Float>
  );
}

// 2. Orbiting data nodes representing code blocks being processed
function DataParticles({ count = 150 }) {
  const points = useRef();
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const distance = Math.random() * 3 + 2.5;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      positions[i * 3] = distance * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = distance * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = distance * Math.cos(theta);
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      points.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00d4ff" sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

// 3. The 3D Scene Assembly
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#00ffcc" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#00d4ff" />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      <EnergyCore />
      <DataParticles />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

/* ─── UI COMPONENTS ─────────────────────────────────────────────────── */

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

/* ─── DATA CONSTANTS ────────────────────────────────────────────────── */

const FEATURES = [
  { icon: <Cpu size={24} />, title: 'AI Pattern Detection', desc: 'Seven energy-wasting patterns detected in real time — nested loops, memory leaks, and unhandled promises.', color: '#00ffcc' },
  { icon: <Zap size={24} />, title: 'Energy Cost Calculator', desc: 'Precise kWh, CO₂ footprint, and financial cost per execution based on global energy models.', color: '#00d4ff' },
  { icon: <BarChart3 size={24} />, title: 'Interactive Dashboard', desc: 'Live charts and time-series tracking your sustainability progress and offset over time.', color: '#a78bfa' },
  { icon: <Code2 size={24} />, title: 'AI Code Generator', desc: 'Generate optimized, energy-efficient code from a description using advanced LLMs.', color: '#ffb84d' },
  { icon: <Globe size={24} />, title: 'Carbon Footprint', desc: 'Track the carbon impact of your software with actionable optimization tips.', color: '#00ffcc' },
  { icon: <Layers size={24} />, title: 'Complexity Visualizer', desc: 'Interactive Big O chart showing how your algorithm scales across complexity classes.', color: '#00d4ff' },
];

const STATS = [
  { value: '2.4M+',  label: 'Lines Analyzed',    color: '#00ffcc' },
  { value: '18.7T',  label: 'CO₂ Prevented (g)', color: '#00d4ff' },
  { value: '12K+',   label: 'Developers',        color: '#a78bfa' },
  { value: '94%',    label: 'Avg. Energy Saved', color: '#ffb84d' },
];

/* ─── STYLES (Injected for guaranteed visibility) ───────────────────── */

const globalStyles = `
  :root {
    --bg-base: #05050f;
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-border: rgba(255, 255, 255, 0.08);
    --green: #00ffcc;
    --cyan: #00d4ff;
    --text-primary: #ffffff;
    --text-muted: #9ca3af;
  }
  @keyframes wordReveal {
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  body {
    background-color: var(--bg-base);
    color: var(--text-primary);
    font-family: 'Inter', system-ui, sans-serif;
    margin: 0;
  }
`;

/* ─── MAIN COMPONENT ────────────────────────────────────────────────── */

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>

        {/* ── Navbar ─────────────────────────────────────────────────── */}
        <nav style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 3rem',
          background: 'rgba(5, 5, 15, 0.7)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--glass-border)',
          boxSizing: 'border-box'
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.2rem', color: '#fff', textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'var(--green)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0, 255, 204, 0.4)' }}>
              <TrendingUp size={18} color="#000" />
            </div>
            GreenCode
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/leaderboard" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>Leaderboard</Link>
            <Link to="/pricing" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>Pricing</Link>
            
            {/* Guaranteed Visible Buttons */}
            {isAuthenticated ? (
              <Link to="/dashboard" style={{
                background: 'var(--green)', color: '#000', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,255,204,0.3)'
              }}>Dashboard</Link>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '1rem' }}>
                <Link to="/login" style={{
                  color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)'
                }}>Sign In</Link>
                <Link to="/register" style={{
                  background: 'var(--cyan)', color: '#000', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(0, 212, 255, 0.3)'
                }}>Get Started</Link>
              </div>
            )}
          </div>
        </nav>

        {/* ── Hero Section with 3D Canvas ────────────────────────────── */}
        <section style={{
          position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
          padding: '6rem 3rem 3rem', boxSizing: 'border-box'
        }}>
          
          {/* Background Elements */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none', zIndex: 0 }} />
          
          {/* Left Content Area */}
          <div style={{ flex: 1, position: 'relative', zIndex: 10, maxWidth: '600px', paddingTop: '4rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--glass-bg)', border: '1px solid var(--green)',
              borderRadius: 100, padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--green)', marginBottom: '2rem',
              animation: 'fadeSlideUp 0.5s ease forwards', boxShadow: '0 0 20px rgba(0, 255, 204, 0.1)'
            }}>
              <Terminal size={14} /> AI-Powered Code Optimization
            </div>

            <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              <RevealText text="Write Code" delay={0.1} /><br />
              <RevealText text="That Saves" delay={0.35} style={{ color: 'var(--cyan)' }} /><br />
              <RevealText text="the Planet." delay={0.6} />
            </h1>

            <div style={{ opacity: 0, animation: 'fadeSlideUp 0.6s ease 1.1s forwards' }}>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                GreenCode uses AI to construct an interactive 3D map of your software's energy consumption. Spot memory leaks, visualize algorithmic complexity, and neutralize your carbon footprint.
              </p>
            </div>

            {/* Hero Buttons - High Z-Index ensuring clickability */}
            <div style={{ opacity: 0, animation: 'fadeSlideUp 0.6s ease 1.3s forwards', display: 'flex', gap: '1rem' }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, var(--green), var(--cyan))', color: '#000',
                borderRadius: '12px', padding: '1rem 2rem', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(0, 255, 204, 0.25)', transition: 'transform 0.2s',
              }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Start Analyzing Free <ArrowRight size={18} />
              </Link>
              <Link to="/docs" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--glass-bg)', color: '#fff', border: '1px solid var(--glass-border)',
                borderRadius: '12px', padding: '1rem 2rem', fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
                backdropFilter: 'blur(10px)', transition: 'all 0.2s',
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.background = 'rgba(0,212,255,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass-bg)'; }}>
                View Documentation <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          {/* Right 3D Visualization Area */}
          <div style={{ flex: 1, position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%', zIndex: 5, pointerEvents: 'auto' }}>
            {/* The R3F Canvas component handles the 3D scene */}
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
              <Scene />
            </Canvas>
          </div>
        </section>

        {/* ── Stats Strip ────────────────────────────────────────────── */}
        <section style={{ position: 'relative', zIndex: 10, background: 'rgba(5, 5, 15, 0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', padding: '2.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5rem', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '2.2rem', color: s.color, textShadow: `0 0 15px ${s.color}40` }}>{s.value}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Grid ──────────────────────────────────────────── */}
        <section style={{ padding: '8rem 3rem', maxWidth: '1300px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, marginBottom: '1rem' }}>
                Platform <span style={{ color: 'var(--cyan)' }}>Ecosystem</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                A powerful suite of tools designed to visualize, measure, and aggressively reduce your code's environmental impact through artificial intelligence.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '20px',
                  padding: '2.5rem',
                  height: '100%',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = f.color;
                  e.currentTarget.style.boxShadow = `0 10px 30px ${f.color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  {/* Subtle top glow based on feature color */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`, opacity: 0.5 }} />
                  
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${f.color}15`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: `1px solid ${f.color}30` }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem', color: '#fff' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer style={{ borderTop: '1px solid var(--glass-border)', background: '#030308', padding: '3rem', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff', fontWeight: 600 }}>
              <div style={{ width: 24, height: 24, background: 'var(--green)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={14} color="#000" />
              </div>
              GreenCode
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '1rem', fontSize: '0.9rem' }}>© 2026 Sustainable Tech</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <Link to="/leaderboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Leaderboard</Link>
              <Link to="/pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Pricing</Link>
              <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Sign In</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
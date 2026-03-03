import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import { Mail, Lock, TrendingUp, ShieldAlert, Zap } from 'lucide-react';

// Assuming these match your project structure
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from '../components/Toast';

/* ─── 3D BACKGROUND COMPONENT ───────────────────────────────────────── */
function AuthBackground() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#00ffcc" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#00d4ff" />
      <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef} position={[0, 0, -5]}>
          <torusKnotGeometry args={[9, 1.5, 200, 32]} />
          <meshStandardMaterial 
            color="#00d4ff" 
            wireframe={true} 
            transparent 
            opacity={0.15} 
            emissive="#00ffcc"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>
    </>
  );
}

/* ─── STYLES ────────────────────────────────────────────────────────── */
const globalStyles = `
  :root {
    --bg-base: #05050f;
    --glass-bg: rgba(10, 10, 20, 0.65);
    --glass-border: rgba(255, 255, 255, 0.08);
    --green: #00ffcc;
    --cyan: #00d4ff;
    --text-primary: #ffffff;
    --text-muted: #9ca3af;
  }
  
  body {
    background-color: var(--bg-base);
    color: var(--text-primary);
    font-family: 'Inter', system-ui, sans-serif;
    margin: 0;
  }

  .input-field {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--glass-border);
    color: #fff;
    padding: 0.85rem 1rem 0.85rem 2.8rem;
    border-radius: 12px;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .input-field:focus {
    border-color: var(--cyan);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.15);
    background: rgba(0, 0, 0, 0.5);
  }

  .input-field::placeholder {
    color: #4b5563;
  }

  .demo-btn {
    flex: 1;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    padding: 0.6rem;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }

  .demo-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--green);
  }
`;

/* ─── MAIN COMPONENT ────────────────────────────────────────────────── */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      toast('Welcome back, ' + user.name, 'success');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email, pass) {
    setForm({ email, password: pass });
  }

  return (
    <>
      <style>{globalStyles}</style>
      <ToastContainer />

      <div style={{ 
        position: 'relative', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        
        {/* 3D Background Canvas */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <AuthBackground />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
          </Canvas>
          {/* Subtle overlay to ensure text readability */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, var(--bg-base) 100%)', pointerEvents: 'none' }} />
        </div>

        {/* Login Panel */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '420px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          boxSizing: 'border-box',
          margin: '1rem'
        }}>
          
          {/* Brand Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 48, height: 48, background: 'var(--green)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 0 20px rgba(0, 255, 204, 0.3)' }}>
              <TrendingUp size={24} color="#000" />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Sign in to your sustainability dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <Mail size={18} />
                </span>
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--cyan)', textDecoration: 'none' }}>Forgot?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <Lock size={18} />
                </span>
                <input
                  className="input-field"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--green), var(--cyan))',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(0, 255, 204, 0.2)',
                marginTop: '0.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts Box */}
          <div style={{ 
            marginTop: '2rem', 
            background: 'rgba(0,0,0,0.4)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            borderRadius: '12px', 
            padding: '1.25rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              <Zap size={14} color="var(--cyan)" /> Demo Quick Login
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="demo-btn" onClick={() => fillDemo('admin@greencode.io', 'admin123')} type="button">
                <ShieldAlert size={14} color="var(--cyan)" /> Admin
              </button>
              <button className="demo-btn" onClick={() => fillDemo('alice@example.com', 'user123')} type="button">
                <TrendingUp size={14} color="var(--green)" /> User
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--green)' }}>Sign up free</Link>
          </div>

        </div>
      </div>
    </>
  );
}
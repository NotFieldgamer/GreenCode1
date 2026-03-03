import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import { User, Mail, Lock, TrendingUp, ShieldAlert, AlertCircle } from 'lucide-react';

// Assuming these match your project structure
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from '../components/Toast';

/* ─── 3D BACKGROUND COMPONENT ───────────────────────────────────────── */
function RegisterBackground() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.04;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.06;
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
          {/* Using an Icosahedron to represent "building/structuring" an account */}
          <icosahedronGeometry args={[7, 1]} />
          <meshStandardMaterial 
            color="#00ffcc" 
            wireframe={true} 
            transparent 
            opacity={0.12} 
            emissive="#00d4ff"
            emissiveIntensity={0.3}
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
    --error-red: #ef4444;
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
    border-color: var(--green);
    box-shadow: 0 0 15px rgba(0, 255, 204, 0.15);
    background: rgba(0, 0, 0, 0.5);
  }

  .input-field.error {
    border-color: rgba(239, 68, 68, 0.5);
    background: rgba(239, 68, 68, 0.05);
  }

  .input-field.error:focus {
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);
  }

  .input-field::placeholder {
    color: #4b5563;
  }
`;

/* ─── MAIN COMPONENT ────────────────────────────────────────────────── */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const user = await register(
        form.name,
        form.email,
        form.password
      );

      toast('Account created! Welcome, ' + user.name, 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrors({
        general: err.response?.data?.error || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fields = [
    { key: 'name', label: 'Full Name', icon: <User size={18} />, type: 'text', placeholder: 'Jane Doe' },
    { key: 'email', label: 'Email Address', icon: <Mail size={18} />, type: 'email', placeholder: 'you@example.com' },
    { key: 'password', label: 'Password', icon: <Lock size={18} />, type: 'password', placeholder: '••••••••' },
    { key: 'confirm', label: 'Confirm Password', icon: <Lock size={18} />, type: 'password', placeholder: '••••••••' }
  ];

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
        overflow: 'hidden',
        padding: '2rem 1rem'
      }}>
        
        {/* 3D Background Canvas */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <RegisterBackground />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.15} />
          </Canvas>
          {/* Subtle overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, var(--bg-base) 100%)', pointerEvents: 'none' }} />
        </div>

        {/* Register Panel */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '440px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          boxSizing: 'border-box'
        }}>
          
          {/* Brand Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 48, height: 48, background: 'var(--green)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 0 20px rgba(0, 255, 204, 0.3)' }}>
              <TrendingUp size={24} color="#000" />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Create Account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Join the sustainable software movement</p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error-red)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={16} /> {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {fields.map(f => (
              <div key={f.key} style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {f.label}
                </label>
                
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: errors[f.key] ? 'var(--error-red)' : 'var(--text-muted)', pointerEvents: 'none', transition: 'color 0.2s' }}>
                    {f.icon}
                  </span>
                  <input
                    className={`input-field ${errors[f.key] ? 'error' : ''}`}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => {
                      F(f.key, e.target.value);
                      // Clear specific error on type
                      if (errors[f.key]) setErrors(prev => ({ ...prev, [f.key]: null }));
                    }}
                  />
                </div>

                {/* Field-specific Validation Error */}
                {errors[f.key] && (
                  <div style={{ color: 'var(--error-red)', fontSize: '0.75rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={12} /> {errors[f.key]}
                  </div>
                )}
              </div>
            ))}

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
                marginTop: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--cyan)' }}>Sign in</Link>
          </div>

        </div>
      </div>
    </>
  );
}
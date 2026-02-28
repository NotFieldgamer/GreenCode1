import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from '../components/Toast';
import { Mail, Lock, TrendingUp } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast('Welcome back, ' + user.name, 'success');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  }

  function fillDemo(email, pass) { setForm({ email, password: pass }); }

  return (
    <div className="auth-page">
      <ToastContainer />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--green)', borderRadius: 8, width: 32, height: 32 }}>
            <TrendingUp size={16} color="#000" />
          </div>
          <div className="logo-name">GreenCode</div>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your sustainability dashboard</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#f87171', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <span className="input-icon"><Mail size={15} /></span>
              <input
                className="neu-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <span className="input-icon"><Lock size={15} /></span>
              <input
                className="neu-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="demo-creds">
          <strong>Demo Accounts</strong><br />
          Admin: <strong>admin@greencode.io</strong> / admin123<br />
          User:  <strong>alice@example.com</strong> / user123<br />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => fillDemo('admin@greencode.io','admin123')}>Fill Admin</button>
            <button className="btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => fillDemo('alice@example.com','user123')}>Fill User</button>
          </div>
        </div>

        <div className="auth-switch">
          Don't have an account?
          <Link to="/register" style={{ color: 'var(--green)', fontWeight: 600, marginLeft: 4 }}>Sign up free</Link>
        </div>
      </div>
    </div>
  );
}

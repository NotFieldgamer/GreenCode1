import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from '../components/Toast';
import { Mail, Lock, TrendingUp } from 'lucide-react';

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
    <div className="auth-shell">
      <ToastContainer />

      <div className="auth-panel">

        {/* BRAND */}
        <div className="auth-brand">
          <div className="auth-mark">
            <TrendingUp size={16} color="#000" />
          </div>
          <div className="auth-brand-name">GreenCode</div>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-sub">
          Sign in to your sustainability dashboard
        </p>

        {error && (
          <div className="form-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="field">
            <label className="label">Email Address</label>
            <div className="input-wrap">
              <span className="input-icon">
                <Mail size={15} />
              </span>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e =>
                  setForm(p => ({ ...p, email: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="field">
            <label className="label">Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <Lock size={15} />
              </span>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e =>
                  setForm(p => ({ ...p, password: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <button
            className="btn btn-primary btn-full mt-4"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* DEMO */}
        <div className="demo-box">
          <strong>Demo Accounts</strong><br />
          Admin: admin@greencode.io / admin123<br />
          User: alice@example.com / user123

          <div className="mt-4 flex-between gap-2">
            <button
              className="btn btn-ghost btn-sm"
              style={{ flex: 1 }}
              onClick={() =>
                fillDemo('admin@greencode.io', 'admin123')
              }
            >
              Fill Admin
            </button>

            <button
              className="btn btn-ghost btn-sm"
              style={{ flex: 1 }}
              onClick={() =>
                fillDemo('alice@example.com', 'user123')
              }
            >
              Fill User
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/register"> Sign up free</Link>
        </div>

      </div>
    </div>
  );
}
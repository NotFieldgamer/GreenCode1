import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from '../components/Toast';
import { User, Mail, Lock, TrendingUp } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim())         e.name     = 'Name is required';
    if (!form.email.includes('@')) e.email    = 'Valid email required';
    if (form.password.length < 6)  e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast('Account created! Welcome, ' + user.name, 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Registration failed.' });
    } finally { setLoading(false); }
  }

  const F = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fields = [
    { key: 'name',     label: 'Full Name',        icon: <User size={15} />,  type: 'text',     placeholder: 'Jane Doe' },
    { key: 'email',    label: 'Email Address',    icon: <Mail size={15} />,  type: 'email',    placeholder: 'you@example.com' },
    { key: 'password', label: 'Password',         icon: <Lock size={15} />,  type: 'password', placeholder: '••••••••' },
    { key: 'confirm',  label: 'Confirm Password', icon: <Lock size={15} />,  type: 'password', placeholder: '••••••••' },
  ];

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
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join the sustainable software movement</p>

        {errors.general && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#f87171', marginBottom: '1rem' }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}</label>
              <div className="input-icon-wrap">
                <span className="input-icon">{f.icon}</span>
                <input
                  className="neu-input"
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => F(f.key, e.target.value)}
                />
              </div>
              {errors[f.key] && <div className="form-error">{errors[f.key]}</div>}
            </div>
          ))}
          <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?
          <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600, marginLeft: 4 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

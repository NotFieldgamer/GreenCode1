import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Code2, Sparkles, Trophy, User,
  TrendingUp, Gem, ShieldCheck, LogOut, Menu, X,
  Leaf, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { toast, ToastContainer } from './Toast';
import CreditsBadge from './CreditsBadge';

const PLAN_COLORS = {
  free:       'var(--text-3)',
  pro:        'var(--cyan)',
  enterprise: 'var(--purple)',
};

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyzer',    icon: Code2,            label: 'Analyzer' },
  { to: '/generator',   icon: Sparkles,         label: 'Generator', pro: true },
  { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  { to: '/profile',     icon: User,             label: 'Profile' },
];

export default function AppLayout({ children, title }) {
  const { user, isAdmin, logout } = useAuth();
  const { plan, planName, isPro, isEnterprise } = useSubscription();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    toast('Signed out', 'info');
    navigate('/');
  }

  const planColor = PLAN_COLORS[plan] || PLAN_COLORS.free;

  return (
    <div className="app-shell">
      <ToastContainer />

      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 49 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-mark">
            <TrendingUp size={16} color="#000" />
          </div>
          <div>
            <div className="brand-name">GreenCode</div>
            <div className="brand-sub">Sustainable AI</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <span className="nav-label">Menu</span>
          {NAV.map(({ to, icon: Icon, label, pro }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon"><Icon size={16} /></span>
              {label}
              {pro && !isPro && !isEnterprise && (
                <span className="nav-badge">PRO</span>
              )}
            </NavLink>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 8px' }} />

          <Link
            to="/pricing"
            className="nav-item"
            onClick={() => setOpen(false)}
            style={{ color: 'var(--amber)', borderColor: 'rgba(245,158,11,0.12)', background: 'rgba(245,158,11,0.04)' }}
          >
            <span className="nav-icon" style={{ color: 'var(--amber)' }}><Gem size={16} /></span>
            Upgrade Plan
            <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
          </Link>

          {isAdmin && (
            <>
              <span className="nav-label" style={{ marginTop: 12 }}>Admin</span>
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon"><ShieldCheck size={16} /></span>
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="plan-chip">
            <Leaf size={12} color={planColor} />
            <span className="plan-chip-name" style={{ color: planColor }}>
              {planName || 'Free'}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginLeft: 2 }}>plan</span>
            {plan === 'free' && (
              <Link
                to="/pricing"
                style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--purple)', fontWeight: 700 }}
              >
                Upgrade
              </Link>
            )}
          </div>

          <div className="user-row">
            <div className="user-avatar">
              {(user?.avatar || user?.name?.[0] || 'U')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setOpen(v => !v)}
              style={{
                display: 'none', background: 'none', border: 'none',
                color: 'var(--text-2)', padding: 4, cursor: 'pointer',
              }}
              className="mobile-menu-btn"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-right">
            <CreditsBadge />
            <span className="status-dot">Online</span>
          </div>
        </header>

        {/* Content */}
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}

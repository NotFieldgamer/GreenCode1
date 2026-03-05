import React, { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Code2, Sparkles, Trophy, User,
  TrendingUp, Gem, ShieldCheck, LogOut, Menu, X,
  Leaf, ChevronRight
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { toast, ToastContainer } from './Toast';
import CreditsBadge from './CreditsBadge';

/* ================= THEME CONSTANTS ================= */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';
const NEON_PURPLE = '#a78bfa';
const GOLD = '#ffb84d';

const PLAN_COLORS = {
  free: '#9ca3af',
  pro: NEON_CYAN,
  enterprise: NEON_PURPLE,
};

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyzer', icon: Code2, label: 'Analyzer' },
  { to: '/generator', icon: Sparkles, label: 'Generator', pro: true },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/profile', icon: User, label: 'Profile' },
];

/* ================= INJECTED STYLES ================= */
const layoutStyles = `
  :root {
    --sidebar-width: 260px;
    --topbar-height: 70px;
  }

  .app-shell {
    display: flex;
    height: 100vh;
    background: #05050f;
    color: #fff;
    overflow: hidden;
    width: 100vw;
    max-width: 100%;
  }

  /* SIDEBAR */
  .glass-sidebar {
    width: var(--sidebar-width);
    background: rgba(10, 10, 20, 0.6);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(20px);
    WebkitBackdropFilter: blur(20px);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 50;
  }

  .sidebar-brand {
    height: var(--topbar-height);
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .brand-logo {
    width: 32px;
    height: 32px;
    background: ${NEON_GREEN};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 15px rgba(0, 255, 204, 0.4);
    flex-shrink: 0;
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .sidebar-nav::-webkit-scrollbar { width: 4px; }
  .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  .nav-group-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 1rem 0 0.5rem 0.5rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    color: #9ca3af;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .nav-item:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.03);
  }

  .nav-item.active {
    background: rgba(0, 212, 255, 0.1);
    color: ${NEON_CYAN};
    border: 1px solid rgba(0, 212, 255, 0.2);
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.1);
  }

  .nav-badge {
    margin-left: auto;
    background: rgba(167, 139, 250, 0.15);
    color: ${NEON_PURPLE};
    border: 1px solid rgba(167, 139, 250, 0.3);
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-weight: 800;
    letter-spacing: 0.5px;
  }

  .sidebar-footer {
    padding: 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(0, 0, 0, 0.2);
  }

  /* MAIN AREA */
  .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* CRITICAL for flexbox overflow prevention */
    max-width: 100%;
    position: relative;
  }

  /* TOPBAR */
  .glass-topbar {
    height: var(--topbar-height);
    background: rgba(5, 5, 15, 0.8);
    backdrop-filter: blur(16px);
    WebkitBackdropFilter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    z-index: 40;
    width: 100%;
    box-sizing: border-box;
  }

  .page-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    width: 100%;
  }

  /* Subtly dynamic background for inner pages */
  .page-container::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 100%;
    background: radial-gradient(circle at top right, rgba(0, 212, 255, 0.03), transparent 40%),
                radial-gradient(circle at bottom left, rgba(0, 255, 204, 0.03), transparent 40%);
    pointer-events: none;
    z-index: 0;
  }

  .page-content {
    position: relative;
    z-index: 10;
    padding: 2rem;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
  }

  /* MOBILE RESPONSIVENESS */
  @media (max-width: 992px) {
    .glass-sidebar {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      transform: translateX(-100%);
    }
    .glass-sidebar.open {
      transform: translateX(0);
    }
    .mobile-menu-btn {
      display: flex !important;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 0;
      margin-right: 1rem;
    }
    .glass-topbar {
      padding: 0 1rem;
    }
    .page-content {
      /* Tighten padding to let widgets breathe on small screens */
      padding: 1.25rem 0.75rem;
    }
  }

  /* EXTRA SMALL PHONES */
  @media (max-width: 480px) {
    .hide-on-mobile {
      display: none !important;
    }
    .glass-topbar {
      padding: 0 0.75rem;
    }
    .page-content {
      padding: 1rem 0.5rem; 
    }
  }
`;

export default function AppLayout({ title }) {
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
      <style>{layoutStyles}</style>
      <ToastContainer />

      {/* Mobile Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 49 }}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`glass-sidebar ${open ? 'open' : ''}`}>
        
        <div className="sidebar-brand">
          <div className="brand-logo">
            <TrendingUp size={18} color="#000" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', letterSpacing: '0.2px' }}>GreenCode</div>
            <div style={{ fontSize: '0.75rem', color: NEON_GREEN, fontWeight: 600, letterSpacing: '0.5px' }}>SUSTAINABLE AI</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">Menu</div>

          {NAV.map(({ to, icon: Icon, label, pro }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
              {pro && !isPro && !isEnterprise && <span className="nav-badge">PRO</span>}
            </NavLink>
          ))}

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1rem 0.5rem' }} />

          <Link
            to="/pricing"
            className="nav-item"
            onClick={() => setOpen(false)}
            style={{
              color: GOLD,
              borderColor: `rgba(255, 184, 77, 0.2)`,
              background: `rgba(255, 184, 77, 0.05)`,
            }}
            onMouseEnter={e => e.currentTarget.style.background = `rgba(255, 184, 77, 0.1)`}
            onMouseLeave={e => e.currentTarget.style.background = `rgba(255, 184, 77, 0.05)`}
          >
            <Gem size={18} />
            Upgrade Plan
            <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </Link>

          {isAdmin && (
            <>
              <div className="nav-group-label" style={{ marginTop: '1.5rem' }}>Admin Tools</div>
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={({ isActive }) => isActive ? { background: 'rgba(167, 139, 250, 0.1)', color: NEON_PURPLE, borderColor: 'rgba(167, 139, 250, 0.3)' } : {}}
              >
                <ShieldCheck size={18} />
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content' }}>
            <Leaf size={14} color={planColor} />
            <span style={{ color: planColor, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {planName || 'Free'} Plan
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1rem', color: '#fff', flexShrink: 0 }}>
              {(user?.avatar || user?.name?.[0] || 'U')}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Developer'}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role || 'User'}</div>
            </div>

            <button 
              onClick={handleLogout} 
              title="Sign Out"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="main-area">

        {/* TOPBAR */}
        <header className="glass-topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={() => setOpen(v => !v)} className="mobile-menu-btn" style={{ display: 'none' }}>
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="hide-on-mobile" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>{title || 'GreenCode'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CreditsBadge />
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 255, 204, 0.05)', border: `1px solid rgba(0, 255, 204, 0.2)`, padding: '0.3rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, color: NEON_GREEN }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: NEON_GREEN, boxShadow: `0 0 8px ${NEON_GREEN}` }} />
              ONLINE
            </div>
          </div>
        </header>

        {/* PAGE CONTENT ROUTER */}
        <main className="page-container">
          <div className="page-content">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
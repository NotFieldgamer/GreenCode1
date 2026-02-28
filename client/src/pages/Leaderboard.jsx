import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, ChevronLeft, Medal, Star, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const RANK_COLORS = { 1: '#f59e0b', 2: '#94a3b8', 3: '#cd7f32' };
const RANK_ICONS  = {
  1: <Trophy size={16} color="#f59e0b" />,
  2: <Medal  size={16} color="#94a3b8" />,
  3: <Award  size={16} color="#cd7f32" />,
};

function PodiumCard({ user, rank }) {
  const heights = { 1: 120, 2: 90, 3: 70 };
  const color   = RANK_COLORS[rank];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {RANK_ICONS[rank]}
      </div>
      <div className="avatar" style={{ width: 48, height: 48, fontSize: '1rem', border: `2px solid ${color}` }}>
        {user.avatar}
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
        {user.name.split(' ')[0]}
      </div>
      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1.3rem', color }}>{user.avgScore}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>avg score</div>
      <div style={{
        width: '100%', minWidth: 100,
        height: heights[rank],
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px 10px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: `2px solid ${color}`,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '2rem', color, opacity: 0.25 }}>{rank}</span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard').then(r => setLeaders(r.data)).finally(() => setLoading(false));
  }, []);

  const top3 = leaders.slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Navbar */}
      <header className="navbar" style={{ position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.45rem 0.875rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.1rem' }}>
            <div style={{ width: 30, height: 30, background: 'var(--green)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#000" />
            </div>
            GreenCode
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isAuthenticated
            ? <Link to="/dashboard" className="btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Dashboard</Link>
            : <Link to="/login" className="btn-primary btn-sm" style={{ textDecoration: 'none' }}>Sign In</Link>
          }
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 100, padding: '0.35rem 1rem', fontSize: '0.78rem', fontWeight: 500, color: 'var(--green)', marginBottom: '1rem' }}>
            <Trophy size={13} /> Global Leaderboard
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 500, marginBottom: '0.75rem' }}>
            Top Sustainable Developers
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Ranked by average sustainability score across all code analyses.
          </p>
        </div>

        {loading ? (
          <div className="page-loader"><div className="loader-ring" /></div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 2 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '2rem', marginBottom: '3rem' }}>
                {top3.length >= 2 && <PodiumCard user={top3[1]} rank={2} />}
                {top3.length >= 1 && <PodiumCard user={top3[0]} rank={1} />}
                {top3.length >= 3 && <PodiumCard user={top3[2]} rank={3} />}
              </div>
            )}

            {/* Full table */}
            <div className="table-card">
              <div className="table-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={16} color="var(--cyan)" /> Full Rankings
                </h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Developer</th><th>Avg Score</th><th>Analyses</th><th>CO&#x2082; Saved (g)</th><th>Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map(u => (
                    <tr key={u.id} style={user?.id === u.id ? { background: 'rgba(0,255,136,0.03)' } : {}}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: RANK_COLORS[u.rank] || 'var(--text-muted)' }}>
                        {u.rank <= 3
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>{RANK_ICONS[u.rank]}</span>
                          : `#${u.rank}`
                        }
                        {user?.id === u.id && <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--green)' }}>(you)</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{u.avatar}</div>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: u.avgScore >= 70 ? 'var(--green)' : u.avgScore >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                        {u.avgScore}
                      </td>
                      <td>{u.totalAnalyses}</td>
                      <td style={{ color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>{u.totalCO2Saved}</td>
                      <td style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        {(u.achievements?.length || 0) > 0
                          ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Star size={12} color="var(--amber)" fill="var(--amber)" />
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{u.achievements.length}</span>
                            </span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

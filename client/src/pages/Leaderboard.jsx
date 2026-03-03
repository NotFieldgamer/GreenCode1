import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Medal, Award, Star, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Page from '../components/Page';

/* ================= THEME CONSTANTS ================= */
const NEON_GREEN = '#00ffcc';
const NEON_CYAN = '#00d4ff';
const GOLD = '#ffb84d';
const SILVER = '#e2e8f0';
const BRONZE = '#d97706';

const RANK_COLORS = {
  1: GOLD,
  2: SILVER,
  3: BRONZE,
};

const RANK_ICONS = {
  1: <Trophy size={20} color={GOLD} style={{ filter: `drop-shadow(0 0 8px ${GOLD}80)` }} />,
  2: <Medal size={20} color={SILVER} style={{ filter: `drop-shadow(0 0 8px ${SILVER}80)` }} />,
  3: <Award size={20} color={BRONZE} style={{ filter: `drop-shadow(0 0 8px ${BRONZE}80)` }} />,
};

/* ================= INJECTED STYLES ================= */
const leaderboardStyles = `
  .glass-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    overflow: hidden;
  }

  .glass-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    text-align: left;
  }

  .glass-table th {
    color: #9ca3af;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0,0,0,0.2);
  }

  .glass-table td {
    padding: 1rem;
    color: #e5e7eb;
    font-size: 0.95rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: background 0.2s;
  }

  .glass-table tr:hover td {
    background: rgba(255, 255, 255, 0.03);
  }

  .glass-table tr:last-child td {
    border-bottom: none;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    color: #000;
    text-transform: uppercase;
  }

  .podium-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.4rem;
    color: #000;
    margin: 0 auto 0.75rem;
    text-transform: uppercase;
  }
`;

/* ================= PODIUM CARD ================= */
function PodiumCard({ user, rank }) {
  const heights = { 1: 140, 2: 100, 3: 80 };
  const color = RANK_COLORS[rank];

  return (
    <div style={{ textAlign: 'center', width: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'fadeSlideUp 0.6s ease' }}>
      <div style={{ marginBottom: '10px' }}>{RANK_ICONS[rank]}</div>

      <div
        className="podium-avatar"
        style={{
          background: color,
          boxShadow: `0 0 20px ${color}60, inset 0 0 10px rgba(255,255,255,0.5)`,
          border: '2px solid rgba(255,255,255,0.8)'
        }}
      >
        {user.avatar || user.name[0]}
      </div>

      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        {user.name.split(' ')[0]}
      </div>

      <div style={{ fontSize: '1.4rem', fontWeight: 800, color, marginTop: '4px', fontFamily: 'monospace', textShadow: `0 0 10px ${color}40` }}>
        {user.avgScore}
      </div>

      <div style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Avg Score
      </div>

      {/* Holographic Podium Base */}
      <div
        style={{
          height: heights[rank],
          marginTop: '1rem',
          background: `linear-gradient(to top, rgba(0,0,0,0.8), ${color}20)`,
          border: `1px solid ${color}40`,
          borderBottom: 'none',
          borderTop: `3px solid ${color}`,
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          fontWeight: 800,
          color: color,
          opacity: 0.8,
          fontFamily: 'monospace',
          boxShadow: `inset 0 20px 40px ${color}10`,
          textShadow: `0 0 20px ${color}40`
        }}
      >
        {rank}
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */
export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated delay for UI demonstration if needed, otherwise rely on your API
    api.get('/leaderboard')
      .then(r => setLeaders(r.data))
      .catch(() => setLeaders([])) // Handle empty gracefully
      .finally(() => setLoading(false));
  }, []);

  const top3 = leaders.slice(0, 3);

  return (
    <Page
      title="Global Leaderboard"
      desc="Top developers ranked by code sustainability and AI optimization."
    >
      <style>{leaderboardStyles}</style>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
          <Loader2 size={32} color={NEON_GREEN} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', letterSpacing: '1px' }}>FETCHING RANKINGS...</div>
        </div>
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 0' }}>
          
          {/* ================= PODIUM ================= */}
          {top3.length >= 2 && (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
              gap: '2rem', marginBottom: '4rem', padding: '2rem 0 0',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              {top3[1] && <PodiumCard user={top3[1]} rank={2} />}
              {top3[0] && <PodiumCard user={top3[0]} rank={1} />}
              {top3[2] && <PodiumCard user={top3[2]} rank={3} />}
            </div>
          )}

          {/* ================= TABLE ================= */}
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(0, 255, 204, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(0, 255, 204, 0.2)` }}>
                <TrendingUp size={18} color={NEON_GREEN} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>Global Rankings</h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="glass-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', width: '60px' }}>Rank</th>
                    <th>Developer</th>
                    <th>Avg Score</th>
                    <th>Analyses</th>
                    <th>CO₂ Saved (g)</th>
                    <th>Badges</th>
                  </tr>
                </thead>

                <tbody>
                  {leaders.map(u => {
                    const isCurrentUser = user?.id === u.id;
                    
                    return (
                      <tr key={u.id} style={{ background: isCurrentUser ? 'rgba(0, 255, 204, 0.05)' : 'transparent' }}>
                        
                        {/* Rank */}
                        <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: u.rank <= 3 ? RANK_COLORS[u.rank] : '#9ca3af', fontFamily: 'monospace' }}>
                          {u.rank <= 3 ? RANK_ICONS[u.rank] : `#${u.rank}`}
                        </td>

                        {/* Developer */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="user-avatar" style={{ background: u.rank <= 3 ? RANK_COLORS[u.rank] : 'rgba(255,255,255,0.1)', color: u.rank <= 3 ? '#000' : '#fff' }}>
                              {u.avatar || u.name[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: isCurrentUser ? 700 : 500, color: isCurrentUser ? NEON_GREEN : '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {u.name}
                                {isCurrentUser && <span style={{ background: 'rgba(0, 255, 204, 0.2)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>You</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td>
                          <span style={{ 
                            background: u.avgScore >= 70 ? 'rgba(0, 255, 204, 0.1)' : u.avgScore >= 50 ? 'rgba(255, 184, 77, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: u.avgScore >= 70 ? NEON_GREEN : u.avgScore >= 50 ? GOLD : '#ef4444', 
                            padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace',
                            border: `1px solid ${u.avgScore >= 70 ? 'rgba(0, 255, 204, 0.3)' : u.avgScore >= 50 ? 'rgba(255, 184, 77, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                          }}>
                            {u.avgScore}
                          </span>
                        </td>

                        {/* Analyses */}
                        <td style={{ color: '#d1d5db' }}>{u.totalAnalyses}</td>

                        {/* CO2 Saved */}
                        <td style={{ color: NEON_CYAN, fontFamily: 'monospace', fontWeight: 600 }}>
                          {u.totalCO2Saved?.toLocaleString() || '0'}
                        </td>

                        {/* Badges */}
                        <td>
                          {u.achievements?.length ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 184, 77, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', width: 'fit-content', border: `1px solid rgba(255, 184, 77, 0.2)` }}>
                              <Star size={14} color={GOLD} fill={GOLD} />
                              <span style={{ fontFamily: 'monospace', color: GOLD, fontWeight: 700 }}>
                                {u.achievements.length}
                              </span>
                            </span>
                          ) : (
                            <span style={{ color: '#6b7280' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {leaders.length === 0 && !loading && (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                No ranking data available yet.
              </div>
            )}
          </div>
        </div>
      )}
    </Page>
  );
}
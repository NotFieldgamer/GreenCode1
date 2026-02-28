const router = require('express').Router();
const { users, analyses, getUserPublic } = require('../data/db');

// GET /api/leaderboard  (public — no auth required)
router.get('/', (req, res) => {
  // Build per-user stats
  const rankedUsers = users
    .filter(u => u.role !== 'admin')
    .map(u => {
      const userAnalyses = analyses.filter(a => a.userId === u.id);
      const avgScore = userAnalyses.length
        ? Math.round(userAnalyses.reduce((s, a) => s + a.sustainabilityScore, 0) / userAnalyses.length)
        : 0;
      const totalCO2Saved = parseFloat(
        userAnalyses.reduce((s, a) => s + (a.co2Grams || 0) * 0.4, 0).toFixed(3)
      );
      const bestScore = userAnalyses.length
        ? Math.max(...userAnalyses.map(a => a.sustainabilityScore))
        : 0;
      return {
        id:            u.id,
        name:          u.name,
        avatar:        u.avatar,
        totalAnalyses: u.totalAnalyses || userAnalyses.length,
        avgScore,
        bestScore,
        totalCO2Saved,
        achievements:  u.achievements || [],
        joinedAt:      u.createdAt,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore || b.totalAnalyses - a.totalAnalyses);

  // Assign ranks
  rankedUsers.forEach((u, i) => { u.rank = i + 1; });

  res.json(rankedUsers);
});

module.exports = router;

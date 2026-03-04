const router = require('express').Router();
const User = require('../models/User');
const Analysis = require('../models/Analysis');

router.get('/', async (req, res) => {
  try {
    // Get all active users
    const users = await User.find({ active: true });
    const leaderboard = [];

    for (const u of users) {
      // Find all analyses for this user
      const userAnalyses = await Analysis.find({ userId: u._id });
      
      if (userAnalyses.length === 0) continue; // Skip users who haven't analyzed anything

      const avgScore = Math.round(userAnalyses.reduce((sum, a) => sum + a.sustainabilityScore, 0) / userAnalyses.length);
      const totalCO2Saved = Math.round(u.totalCO2Offset || 0);

      leaderboard.push({
        id: u._id,
        name: u.name,
        avatar: u.name.charAt(0).toUpperCase(),
        avgScore,
        totalAnalyses: userAnalyses.length,
        totalCO2Saved,
        achievements: userAnalyses.length > 5 ? ['active_user'] : [] // Mocked badge
      });
    }

    // Sort by Highest Score, then by most analyses
    leaderboard.sort((a, b) => b.avgScore - a.avgScore || b.totalAnalyses - a.totalAnalyses);
    
    // Assign Ranks (1, 2, 3...)
    leaderboard.forEach((u, i) => u.rank = i + 1);

    res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
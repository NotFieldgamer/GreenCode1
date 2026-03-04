const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const Analysis = require('../models/Analysis');

router.get('/me', verifyToken, async (req, res) => {
  try {
    // Count how many times the user has used the analyzer
    const count = await Analysis.countDocuments({ userId: req.user.id });
    
    const achievements = [
      { 
        id: '1', name: 'First Scan', desc: 'Analyzed your first snippet', 
        unlocked: count >= 1, unlockedAt: count >= 1 ? new Date() : null,
        progress: { current: count, max: 1 }
      },
      { 
        id: '2', name: 'Eco Warrior', desc: 'Reached 10 scans', 
        unlocked: count >= 10, unlockedAt: count >= 10 ? new Date() : null,
        progress: { current: count, max: 10 }
      },
      { 
        id: '3', name: 'Green Master', desc: 'Reached 50 scans', 
        unlocked: count >= 50, unlockedAt: count >= 50 ? new Date() : null,
        progress: { current: count, max: 50 }
      }
    ];

    res.json(achievements);
  } catch (err) {
    console.error('Achievements Error:', err);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

module.exports = router;
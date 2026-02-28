const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { users, analyses, findUserById } = require('../data/db');

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_analysis',  icon: '🌱', name: 'First Steps',     desc: 'Complete your first code analysis',              check: (u, a) => a.length >= 1 },
  { id: 'energy_saver',    icon: '⚡', name: 'Energy Saver',    desc: 'Achieve a sustainability score of 80 or above',   check: (u, a) => a.some(r => r.sustainabilityScore >= 80) },
  { id: 'green_master',    icon: '🏆', name: 'Green Master',    desc: 'Average score ≥ 70 over at least 10 analyses',    check: (u, a) => a.length >= 10 && Math.round(a.reduce((s,r)=>s+r.sustainabilityScore,0)/a.length) >= 70 },
  { id: 'power_user',      icon: '🔥', name: 'Power User',      desc: 'Complete 25 or more analyses',                   check: (u, a) => a.length >= 25 },
  { id: 'co2_fighter',     icon: '♻️', name: 'CO₂ Fighter',     desc: 'Accumulate 1 gram of CO₂ offset total',          check: (u, a) => (u.totalCO2Offset || 0) >= 1 },
  { id: 'bug_hunter',      icon: '🔍', name: 'Bug Hunter',      desc: 'Detect 10 or more energy issues in total',        check: (u, a) => a.reduce((s,r)=>s+r.detections.length,0) >= 10 },
  { id: 'clean_coder',     icon: '✨', name: 'Clean Coder',     desc: 'Get a perfect score of 100',                     check: (u, a) => a.some(r => r.sustainabilityScore >= 95) },
  { id: 'multilingual',    icon: '🌐', name: 'Multilingual',    desc: 'Analyze code in 3 different languages',          check: (u, a) => new Set(a.map(r => r.language)).size >= 3 },
];

// Check and unlock achievements for a user — call after each analysis
function checkAchievements(userId) {
  const user = findUserById(userId);
  if (!user) return [];
  if (!user.achievements) user.achievements = [];

  const userAnalyses = analyses.filter(a => a.userId === userId);
  const newlyUnlocked = [];

  ACHIEVEMENTS.forEach(def => {
    const alreadyHas = user.achievements.some(a => a.id === def.id);
    if (!alreadyHas && def.check(user, userAnalyses)) {
      const badge = { id: def.id, icon: def.icon, name: def.name, desc: def.desc, unlockedAt: new Date().toISOString() };
      user.achievements.push(badge);
      newlyUnlocked.push(badge);
    }
  });
  return newlyUnlocked;
}

// GET /api/achievements/me
router.get('/me', verifyToken, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!user.achievements) user.achievements = [];

  const userAnalyses = analyses.filter(a => a.userId === req.user.id);

  const all = ACHIEVEMENTS.map(def => {
    const unlocked = user.achievements.find(a => a.id === def.id);
    return {
      id:         def.id,
      icon:       def.icon,
      name:       def.name,
      desc:       def.desc,
      unlocked:   !!unlocked,
      unlockedAt: unlocked?.unlockedAt || null,
      progress:   getProgress(def, user, userAnalyses),
    };
  });

  res.json(all);
});

// POST /api/achievements/check  (called internally after analysis)
router.post('/check', verifyToken, (req, res) => {
  const newBadges = checkAchievements(req.user.id);
  res.json({ newBadges });
});

function getProgress(def, user, analyses) {
  switch (def.id) {
    case 'first_analysis':  return { current: Math.min(analyses.length, 1), max: 1 };
    case 'energy_saver':    return { current: analyses.length ? Math.max(...analyses.map(a => a.sustainabilityScore)) : 0, max: 80 };
    case 'green_master':    return { current: analyses.length, max: 10 };
    case 'power_user':      return { current: analyses.length, max: 25 };
    case 'co2_fighter':     return { current: parseFloat((user.totalCO2Offset || 0).toFixed(2)), max: 1 };
    case 'bug_hunter':      return { current: analyses.reduce((s,r)=>s+r.detections.length,0), max: 10 };
    case 'clean_coder':     return { current: analyses.length ? Math.max(...analyses.map(a => a.sustainabilityScore)) : 0, max: 95 };
    case 'multilingual':    return { current: new Set(analyses.map(a => a.language)).size, max: 3 };
    default:                return { current: 0, max: 1 };
  }
}

module.exports = { router, checkAchievements };

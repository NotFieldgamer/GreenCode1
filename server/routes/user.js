const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const { PLANS, CURRENCY_RATES } = require('../data/db');
// GET /api/user/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(getUserPublic(user));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/user/stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const plan = PLANS[user.plan] || PLANS.free;
    const userAnalyses = await Analysis.find({ userId: user._id });

    const avgSustainability = userAnalyses.length
      ? Math.round(userAnalyses.reduce((s, a) => s + a.sustainabilityScore, 0) / userAnalyses.length)
      : 0;

    const detMap = {};
    userAnalyses.forEach(a => (a.detections || []).forEach(d => { detMap[d] = (detMap[d] || 0) + 1; }));
    const detectionBreakdown = Object.entries(detMap).map(([name, value]) => ({ name: name.replace(/_/g,' '), value }));

    const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const day = userAnalyses.filter(a => new Date(a.createdAt).toDateString() === d.toDateString());
      const avgE = day.length ? Math.round(day.reduce((s, a) => s + a.energyScore, 0) / day.length) : 0;
      const avgS = day.length ? Math.round(day.reduce((s, a) => s + a.sustainabilityScore, 0) / day.length) : 0;
      return { name: d.toLocaleDateString('en', { weekday: 'short' }), energy: avgE, score: avgS };
    });

    res.json({
      totalAnalyses: userAnalyses.length, avgSustainability,
      plan: user.plan, planName: plan.name, credits: user.credits, creditsResetAt: user.creditsResetAt,
      features: plan.features, chartData, detectionBreakdown,
    });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/user/history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const plan = PLANS[user.plan] || PLANS.free;
    const limit = plan.maxHistory === Infinity ? 0 : plan.maxHistory; // 0 in Mongoose = no limit

    let query = Analysis.find({ userId: req.user.id }).sort({ createdAt: -1 });
    if (limit > 0) query = query.limit(limit);

    const userAnalyses = await query;
    res.json(userAnalyses);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/user/plan — plan info + features for frontend gates
router.get('/plan', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const plan = PLANS[user.plan] || PLANS.free;
    res.json({
      plan: user.plan, planName: plan.name, price: plan.price,
      credits: user.credits, creditsResetAt: user.creditsResetAt,
      analysisLimit: plan.analysisLimit, displayCurrency: user.displayCurrency || 'USD',
      allPlans: PLANS, currencyRates: CURRENCY_RATES,
    });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/user/upgrade — simulated checkout (demo mode)
router.post('/upgrade', verifyToken, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro', 'enterprise'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.plan = plan;
    if (plan === 'free') {
      user.credits = 0; user.creditsResetAt = null;
    } else {
      user.credits = PLANS[plan].generatorCredits;
      user.creditsResetAt = new Date(Date.now() + 30 * 86400000);
    }

    await user.save(); // 🔥 THIS SAVES TO THE REAL DATABASE

    res.json({ success: true, plan, planName: PLANS[plan]?.name || 'Free', credits: user.credits });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/user/currency — update display currency
router.post('/currency', verifyToken, (req, res) => {
  const { currency } = req.body;
  if (!CURRENCY_RATES[currency]) return res.status(400).json({ error: 'Unsupported currency' });
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.displayCurrency = currency;
  res.json({ displayCurrency: currency, symbol: CURRENCY_RATES[currency].symbol });
});

// GET /api/user/profile
router.get('/profile', verifyToken, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(getUserPublic(user));
});

module.exports = router;
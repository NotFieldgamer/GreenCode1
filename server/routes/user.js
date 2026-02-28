const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { users, analyses, findUserById, getUserPublic, PLANS, CURRENCY_RATES } = require('../data/db');

// GET /api/user/me
router.get('/me', verifyToken, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(getUserPublic(user));
});

// GET /api/user/stats
router.get('/stats', verifyToken, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const plan = PLANS[user.plan] || PLANS.free;

  const userAnalyses = analyses.filter(a => a.userId === req.user.id);
  const avgSustainability = userAnalyses.length
    ? Math.round(userAnalyses.reduce((s, a) => s + a.sustainabilityScore, 0) / userAnalyses.length)
    : 0;

  const detMap = {};
  userAnalyses.forEach(a => (a.detections || []).forEach(d => { detMap[d] = (detMap[d] || 0) + 1; }));
  const detectionBreakdown = Object.entries(detMap).map(([name, value]) => ({ name: name.replace(/_/g,' '), value }));

  // 7-day trend
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const day = userAnalyses.filter(a => new Date(a.timestamp).toDateString() === d.toDateString());
    const avgE = day.length ? Math.round(day.reduce((s, a) => s + a.energyScore, 0) / day.length) : 0;
    const avgS = day.length ? Math.round(day.reduce((s, a) => s + a.sustainabilityScore, 0) / day.length) : 0;
    return { name: d.toLocaleDateString('en', { weekday: 'short' }), energy: avgE, score: avgS };
  });

  res.json({
    totalAnalyses:    userAnalyses.length,
    avgSustainability,
    totalEnergySaved: user.totalEnergySaved || 0,
    totalCO2Offset:   parseFloat((user.totalCO2Offset || 0).toFixed(3)),
    totalCO2Emitted:  parseFloat((user.totalCO2Emitted || 0).toFixed(3)),
    plan:             user.plan,
    planName:         plan.name,
    credits:          user.credits,
    creditsResetAt:   user.creditsResetAt,
    features:         plan.features,
    chartData,
    detectionBreakdown,
  });
});

// GET /api/user/history
router.get('/history', verifyToken, (req, res) => {
  const plan = PLANS[findUserById(req.user.id)?.plan] || PLANS.free;
  const limit = plan.maxHistory === Infinity ? Infinity : plan.maxHistory;
  const userAnalyses = analyses
    .filter(a => a.userId === req.user.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit === Infinity ? undefined : limit);
  res.json(userAnalyses);
});

// GET /api/user/plan — plan info + features for frontend gates
router.get('/plan', verifyToken, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const plan = PLANS[user.plan] || PLANS.free;
  res.json({
    plan:           user.plan,
    planName:       plan.name,
    price:          plan.price,
    credits:        user.credits,
    creditsResetAt: user.creditsResetAt,
    analysisLimit:  plan.analysisLimit,
    features:       plan.features,
    displayCurrency: user.displayCurrency || 'USD',
    allPlans:        PLANS,
    currencyRates:   CURRENCY_RATES,
  });
});

// POST /api/user/upgrade — simulated checkout (demo mode)
router.post('/upgrade', verifyToken, (req, res) => {
  const { plan } = req.body;
  if (!['pro', 'enterprise'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.plan = plan;
  user.credits = PLANS[plan].generatorCredits;
  user.creditsResetAt = new Date(Date.now() + 30 * 86400000).toISOString();
  res.json({
    success: true,
    plan,
    planName: PLANS[plan].name,
    credits: user.credits,
    message: `Successfully upgraded to ${PLANS[plan].name} (demo mode)`,
  });
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

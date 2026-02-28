const router = require('express').Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { users, analyses, detections, generatorLogs, PLANS, CURRENCY_RATES, setPlan, grantCredits } = require('../data/db');

// ── Platform stats (Overview tab) ─────────────────────────────────────────────
router.get('/stats', verifyToken, requireAdmin, (req, res) => {
  const totalEnergy = analyses.reduce((s, a) => s + (a.energyScore || 0), 0);
  const totalCO2    = analyses.reduce((s, a) => s + (a.co2Grams  || 0), 0).toFixed(3);
  const avgScore    = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + (a.sustainabilityScore || 0), 0) / analyses.length)
    : 0;

  // Simulated 7-day time series
  const timeSeries = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en', { weekday: 'short' });
    const dayAnalyses = analyses.filter(a => {
      const ad = new Date(a.timestamp); return ad.toDateString() === d.toDateString();
    }).length;
    return { name: label, analyses: dayAnalyses || Math.floor(Math.random() * 4) };
  });

  // Detection breakdown
  const detMap = {};
  analyses.forEach(a => (a.detections || []).forEach(d => { detMap[d] = (detMap[d] || 0) + 1; }));
  const detectionBreakdown = Object.entries(detMap).map(([name, value]) => ({ name: name.replace(/_/g,' '), value }));

  // Energy per user
  const energyPerUser = users.filter(u => u.role !== 'admin').map(u => ({
    name: u.name.split(' ')[0],
    energy: analyses.filter(a => a.userId === u.id).reduce((s, a) => s + (a.energyScore || 0), 0),
  }));

  // Plan distribution
  const planDist = { free: 0, pro: 0, enterprise: 0 };
  users.filter(u => u.role !== 'admin').forEach(u => { planDist[u.plan] = (planDist[u.plan] || 0) + 1; });

  // Simulated revenue
  const monthlyRevenue = users.reduce((s, u) => s + (PLANS[u.plan]?.price || 0), 0).toFixed(2);
  const totalGenerations = generatorLogs.length;

  res.json({
    totalUsers: users.filter(u => u.role !== 'admin').length,
    totalAnalyses: analyses.length,
    totalEnergy, totalCO2, avgScore,
    timeSeries, detectionBreakdown, energyPerUser,
    planDist, monthlyRevenue, totalGenerations,
  });
});

// ── All users ─────────────────────────────────────────────────────────────────
router.get('/users', verifyToken, requireAdmin, (req, res) => {
  const result = users.map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar,
    active: u.active, totalAnalyses: u.totalAnalyses,
    plan: u.plan, planName: PLANS[u.plan]?.name || 'Free',
    credits: u.credits, createdAt: u.createdAt,
  }));
  res.json(result);
});

// ── Toggle user active status ──────────────────────────────────────────────
router.put('/users/:id/toggle', verifyToken, requireAdmin, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.active = !user.active;
  res.json({ active: user.active });
});

// ── Delete user ───────────────────────────────────────────────────────────────
router.delete('/users/:id', verifyToken, requireAdmin, (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  res.json({ success: true });
});

// ── Set user plan (Subscriptions tab) ────────────────────────────────────────
router.put('/users/:id/plan', verifyToken, requireAdmin, (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });
  const ok = setPlan(req.params.id, plan);
  if (!ok) return res.status(404).json({ error: 'User not found' });
  res.json({ plan, planName: PLANS[plan].name, credits: PLANS[plan].generatorCredits });
});

// ── Grant credits ─────────────────────────────────────────────────────────────
router.put('/users/:id/credits', verifyToken, requireAdmin, (req, res) => {
  const amount = parseInt(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
  const ok = grantCredits(req.params.id, amount);
  if (!ok) return res.status(404).json({ error: 'User not found' });
  const user = users.find(u => u.id === req.params.id);
  res.json({ credits: user.credits });
});

// ── Detection logs ─────────────────────────────────────────────────────────────
router.get('/detections', verifyToken, requireAdmin, (req, res) => {
  const enriched = detections.map(d => {
    const user = users.find(u => u.id === d.userId);
    return { ...d, userName: user?.name || 'Unknown' };
  });
  res.json(enriched.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// ── Generator logs ─────────────────────────────────────────────────────────────
router.get('/generator-logs', verifyToken, requireAdmin, (req, res) => {
  const enriched = generatorLogs.map(g => {
    const user = users.find(u => u.id === g.userId);
    return { ...g, userName: user?.name || 'Unknown' };
  });
  res.json(enriched.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// ── Subscription summary ───────────────────────────────────────────────────────
router.get('/subscriptions', verifyToken, requireAdmin, (req, res) => {
  const subs = users.filter(u => u.role !== 'admin').map(u => ({
    id: u.id, name: u.name, email: u.email, avatar: u.avatar,
    plan: u.plan, planName: PLANS[u.plan]?.name || 'Free',
    credits: u.credits, creditsResetAt: u.creditsResetAt,
    totalAnalyses: u.totalAnalyses, active: u.active,
  }));
  const revenue = subs.reduce((s, u) => s + (PLANS[u.plan]?.price || 0), 0);
  res.json({ subscriptions: subs, monthlyRevenue: revenue.toFixed(2), PLANS, CURRENCY_RATES });
});

module.exports = router;

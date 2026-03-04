const router = require('express').Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const { PLANS } = require('../data/db');

// 1. GET /api/admin/stats
router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAnalyses = await Analysis.countDocuments();
    const analyses = await Analysis.find();
    
    let totalEnergy = 0, totalCO2 = 0, scoreSum = 0;
    const detMap = {};

    analyses.forEach(a => {
      totalEnergy += (a.energyScore || 0);
      totalCO2 += (a.co2Grams || 0);
      scoreSum += (a.sustainabilityScore || 0);
      if (a.detections) {
        a.detections.forEach(d => { detMap[d] = (detMap[d] || 0) + 1; });
      }
    });

    const avgScore = analyses.length > 0 ? Math.round(scoreSum / analyses.length) : 0;
    const detectionBreakdown = Object.entries(detMap).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

    // Mock time series for chart
    const timeSeries = [];
    for(let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dayAnalyses = analyses.filter(a => new Date(a.createdAt).toDateString() === d.toDateString());
        timeSeries.push({ name: d.toLocaleDateString('en', {weekday: 'short'}), analyses: dayAnalyses.length });
    }

    res.json({
      totalUsers, totalAnalyses, 
      totalEnergy: Math.round(totalEnergy), 
      totalCO2: Math.round(totalCO2), 
      avgScore, detectionBreakdown, timeSeries,
      energyPerUser: [], // Simplify for now
      totalGenerations: 0 
    });
  } catch (err) { res.status(500).json({ error: 'Stats error' }); }
});

// 2. GET /api/admin/users
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const allUsers = await User.find().select('-password');
    const formatted = await Promise.all(allUsers.map(async u => {
      const count = await Analysis.countDocuments({ userId: u._id });
      return { id: u._id, name: u.name, email: u.email, role: u.role, plan: u.plan, active: u.active, totalAnalyses: count };
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: 'Users error' }); }
});

// 3. GET /api/admin/detections (Fixes "detections is not defined")
router.get('/detections', verifyToken, requireAdmin, async (req, res) => {
  try {
    const analyses = await Analysis.find({ detections: { $exists: true, $not: {$size: 0} } }).sort({ createdAt: -1 }).populate('userId', 'name');
    
    const formattedDetections = analyses.flatMap(a => {
        return a.detections.map((d, index) => ({
            id: `${a._id}-${index}`,
            userName: a.userId ? a.userId.name : 'Unknown User',
            type: d,
            severity: a.sustainabilityScore < 50 ? 'high' : 'medium',
            timestamp: a.createdAt
        }));
    });
    res.json(formattedDetections);
  } catch (err) { res.status(500).json({ error: 'Detections error' }); }
});

// 4. GET /api/admin/subscriptions (Fixes "users is not defined")
router.get('/subscriptions', verifyToken, requireAdmin, async (req, res) => {
  try {
    const allUsers = await User.find().select('-password');
    let monthlyRevenue = 0;
    
    const subs = allUsers.map(u => {
      if (u.plan === 'pro') monthlyRevenue += PLANS.pro.price;
      if (u.plan === 'enterprise') monthlyRevenue += PLANS.enterprise.price;
      return {
        id: u._id, name: u.name, email: u.email, plan: u.plan, 
        planName: PLANS[u.plan]?.name || 'Free', 
        credits: u.credits || 0, creditsResetAt: u.creditsResetAt
      };
    });

    res.json({ subscriptions: subs, monthlyRevenue: monthlyRevenue.toFixed(2), PLANS });
  } catch (err) { res.status(500).json({ error: 'Subscriptions error' }); }
});

// 5. PUT /api/admin/users/:id/plan (Update Plan)
router.put('/users/:id/plan', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro', 'enterprise'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.plan = plan;
    if (plan === 'free') {
      user.credits = 0; user.creditsResetAt = null;
    } else {
      user.credits = PLANS[plan].generatorCredits; 
      user.creditsResetAt = new Date(Date.now() + 30 * 86400000);
    }
    await user.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Plan update error' }); }
});

// 6. PUT /api/admin/users/:id/credits (Grant Credits)
router.put('/users/:id/credits', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.credits = (user.credits || 0) + Number(amount);
    await user.save();
    res.json({ credits: user.credits });
  } catch (err) { res.status(500).json({ error: 'Credit update error' }); }
});

// 7. PUT /api/admin/users/:id/toggle (Suspend/Activate)
router.put('/users/:id/toggle', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.active = !user.active;
    await user.save();
    res.json({ active: user.active });
  } catch (err) { res.status(500).json({ error: 'Toggle error' }); }
});

// 8. DELETE /api/admin/users/:id (Delete User)
router.delete('/users/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Analysis.deleteMany({ userId: req.params.id }); // Clean up their analyses
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Delete error' }); }
});

module.exports = router;
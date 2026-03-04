const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Analysis = require('../models/Analysis'); // Assuming you create an Analysis model next
const { PLANS } = require('../data/db'); // Keep your PLANS constants here or in a config file

const JWT_SECRET = process.env.JWT_SECRET || 'greencode-secret-2026';

// ── Verify JWT ────────────────────────────────────────────────────────────────
function verifyToken(req, res, next) {
  const auth  = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Require Admin role ────────────────────────────────────────────────────────
async function requireAdmin(req, res, next) {
  try {
    // Fetch from DB to prevent stale JWT admin access
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database error verifying admin status' });
  }
}

// ── Require Pro or Enterprise plan ───────────────────────────────────────────
async function requirePro(req, res, next) {
  try {
    // FIX: Fetch live user from MongoDB, bypassing stale JWT payloads
    const user = await User.findById(req.user?.id);
    
    if (!user || user.plan === 'free') {
      return res.status(403).json({
        error: 'Pro plan required',
        code: 'UPGRADE_REQUIRED',
        requiredPlan: 'pro',
        currentPlan: user?.plan || 'free',
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database error checking subscription plan' });
  }
}

// ── Require Enterprise plan ──────────────────────────────────────────────────
async function requireEnterprise(req, res, next) {
  try {
    // FIX: Fetch live user from MongoDB
    const user = await User.findById(req.user?.id);
    
    if (!user || user.plan !== 'enterprise') {
      return res.status(403).json({
        error: 'Enterprise plan required',
        code: 'UPGRADE_REQUIRED',
        requiredPlan: 'enterprise',
        currentPlan: user?.plan || 'free',
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database error checking subscription plan' });
  }
}

// ── Check monthly analysis limit for Free users ──────────────────────────────
async function checkAnalysisLimit(req, res, next) {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    const planInfo = PLANS[user.plan] || PLANS['free'];
    
    if (planInfo.analysisLimit === Infinity) return next();   // paid plans: no limit
    
    // Calculate start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // MongoDB query to count analyses created this month
    const used = await Analysis.countDocuments({
      userId: user._id,
      createdAt: { $gte: startOfMonth }
    });

    if (used >= planInfo.analysisLimit) {
      return res.status(403).json({
        error: `Monthly analysis limit reached (${planInfo.analysisLimit}/month on Free plan)`,
        code: 'ANALYSIS_LIMIT_REACHED',
        used, limit: planInfo.analysisLimit,
        requiredPlan: 'pro',
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database error checking analysis limit' });
  }
}

// ── Check generator credits ──────────────────────────────────────────────────
async function checkCredits(req, res, next) {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    // FIX: Ensure free users are blocked even if they somehow have residual credits
    if (user.plan === 'free' || !user.credits || user.credits <= 0) {
      return res.status(403).json({
        error: 'No generator credits remaining',
        code: 'NO_CREDITS',
        credits: user.credits || 0,
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database error checking credits' });
  }
}

module.exports = { verifyToken, requireAdmin, requirePro, requireEnterprise, checkAnalysisLimit, checkCredits, JWT_SECRET };
const jwt = require('jsonwebtoken');
const { findUserById, getUserPlan, getMonthlyAnalysisCount } = require('../data/db');

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
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ── Require Pro or Enterprise plan ───────────────────────────────────────────
function requirePro(req, res, next) {
  const plan = getUserPlan(req.user?.id);
  if (plan.price === 0) {
    return res.status(403).json({
      error: 'Pro plan required',
      code: 'UPGRADE_REQUIRED',
      requiredPlan: 'pro',
      currentPlan: 'free',
    });
  }
  next();
}

// ── Require Enterprise plan ──────────────────────────────────────────────────
function requireEnterprise(req, res, next) {
  const user = findUserById(req.user?.id);
  if (!user || user.plan !== 'enterprise') {
    return res.status(403).json({
      error: 'Enterprise plan required',
      code: 'UPGRADE_REQUIRED',
      requiredPlan: 'enterprise',
      currentPlan: user?.plan || 'free',
    });
  }
  next();
}

// ── Check monthly analysis limit for Free users ──────────────────────────────
function checkAnalysisLimit(req, res, next) {
  const plan  = getUserPlan(req.user?.id);
  if (plan.analysisLimit === Infinity) return next();   // paid plans: no limit
  const used = getMonthlyAnalysisCount(req.user.id);
  if (used >= plan.analysisLimit) {
    return res.status(403).json({
      error: `Monthly analysis limit reached (${plan.analysisLimit}/month on Free plan)`,
      code: 'ANALYSIS_LIMIT_REACHED',
      used, limit: plan.analysisLimit,
      requiredPlan: 'pro',
    });
  }
  next();
}

// ── Check generator credits ──────────────────────────────────────────────────
function checkCredits(req, res, next) {
  const user = findUserById(req.user?.id);
  if (!user) return res.status(401).json({ error: 'User not found' });
  if (!user.credits || user.credits <= 0) {
    return res.status(403).json({
      error: 'No generator credits remaining',
      code: 'NO_CREDITS',
      credits: 0,
    });
  }
  next();
}

module.exports = { verifyToken, requireAdmin, requirePro, requireEnterprise, checkAnalysisLimit, checkCredits, JWT_SECRET };

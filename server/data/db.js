const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION PLANS
// ─────────────────────────────────────────────────────────────────────────────
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    analysisLimit: 10,     // per month
    generatorCredits: 0,
    maxHistory: 5,
    features: { chat: false, generator: false, fullTips: false, scaleProjection: false, bulkAnalysis: false, apiAccess: false },
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    analysisLimit: Infinity,
    generatorCredits: 50,
    maxHistory: Infinity,
    features: { chat: true, generator: true, fullTips: true, scaleProjection: true, bulkAnalysis: false, apiAccess: false },
  },
  enterprise: {
    name: 'Enterprise',
    price: 29.99,
    analysisLimit: Infinity,
    generatorCredits: 300,
    maxHistory: Infinity,
    features: { chat: true, generator: true, fullTips: true, scaleProjection: true, bulkAnalysis: true, apiAccess: true },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY RATES (USD base)
// ─────────────────────────────────────────────────────────────────────────────
const CURRENCY_RATES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  INR: { symbol: '₹', rate: 83.50 },
  JPY: { symbol: '¥', rate: 150.20 },
  CAD: { symbol: 'C$', rate: 1.36 },
  AUD: { symbol: 'A$', rate: 1.53 },
};

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────
const users = [
  {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@greencode.io',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    avatar: 'AD',
    active: true,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    totalAnalyses: 0,
    totalEnergySaved: 0,
    totalCO2Offset: 0,
    totalCO2Emitted: 0,
    plan: 'enterprise',
    credits: 300,
    creditsResetAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    displayCurrency: 'USD',
    achievements: [],
  },
  {
    id: 'user-1',
    name: 'Alice Chen',
    email: 'alice@example.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    avatar: 'AC',
    active: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    totalAnalyses: 14,
    totalEnergySaved: 120,
    totalCO2Offset: 2.4,
    totalCO2Emitted: 5.8,
    plan: 'pro',
    credits: 42,
    creditsResetAt: new Date(Date.now() + 20 * 86400000).toISOString(),
    displayCurrency: 'USD',
    achievements: [
      { id: 'first_analysis', icon: '🌱', name: 'First Steps', unlockedAt: new Date(Date.now() - 28 * 86400000).toISOString() },
      { id: 'energy_saver', icon: '⚡', name: 'Energy Saver', unlockedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
    ],
  },
  {
    id: 'user-2',
    name: 'Bob Martinez',
    email: 'bob@example.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    avatar: 'BM',
    active: true,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    totalAnalyses: 9,
    totalEnergySaved: 80,
    totalCO2Offset: 1.6,
    totalCO2Emitted: 3.2,
    plan: 'free',
    credits: 0,
    creditsResetAt: new Date(Date.now() + 10 * 86400000).toISOString(),
    displayCurrency: 'USD',
    achievements: [
      { id: 'first_analysis', icon: '🌱', name: 'First Steps', unlockedAt: new Date(Date.now() - 43 * 86400000).toISOString() },
    ],
  },
  {
    id: 'user-3',
    name: 'Carol Park',
    email: 'carol@example.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    avatar: 'CP',
    active: true,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    totalAnalyses: 22,
    totalEnergySaved: 200,
    totalCO2Offset: 4.1,
    totalCO2Emitted: 7.5,
    plan: 'enterprise',
    credits: 285,
    creditsResetAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    displayCurrency: 'EUR',
    achievements: [
      { id: 'first_analysis', icon: '🌱', name: 'First Steps', unlockedAt: new Date(Date.now() - 58 * 86400000).toISOString() },
      { id: 'energy_saver',   icon: '⚡', name: 'Energy Saver', unlockedAt: new Date(Date.now() - 50 * 86400000).toISOString() },
      { id: 'bug_hunter',     icon: '🔍', name: 'Bug Hunter',   unlockedAt: new Date(Date.now() - 30 * 86400000).toISOString() },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANALYSES
// ─────────────────────────────────────────────────────────────────────────────
const analyses = [
  { id: 'a1', userId: 'user-1', language: 'javascript', lines: 25, complexity: 'O(n²)', energyScore: 55, energyCostKwh: 0.0011, co2Grams: 0.495, dollarCost: 0.000132, sustainabilityScore: 45, rating: 'Moderate', detections: ['nested_loops'], suggestions: [], timestamp: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'a2', userId: 'user-1', language: 'python',     lines: 12, complexity: 'O(n)',  energyScore: 22, energyCostKwh: 0.00044, co2Grams: 0.198, dollarCost: 0.0000528, sustainabilityScore: 78, rating: 'Moderate', detections: [], suggestions: [], timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'a3', userId: 'user-2', language: 'javascript', lines: 40, complexity: 'O(n²)', energyScore: 70, energyCostKwh: 0.0014, co2Grams: 0.63, dollarCost: 0.000168, sustainabilityScore: 30, rating: 'Energy Heavy', detections: ['nested_loops','recursion'], suggestions: [], timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'a4', userId: 'user-3', language: 'java',       lines: 60, complexity: 'O(n)',  energyScore: 32, energyCostKwh: 0.00064, co2Grams: 0.288, dollarCost: 0.0000768, sustainabilityScore: 68, rating: 'Moderate', detections: ['sorting'], suggestions: [], timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
];

// ─────────────────────────────────────────────────────────────────────────────
// DETECTION LOGS
// ─────────────────────────────────────────────────────────────────────────────
const detections = [
  { id: 'd1', userId: 'user-1', userName: 'Alice Chen',  type: 'nested_loops', severity: 'high',   timestamp: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'd2', userId: 'user-2', userName: 'Bob Martinez', type: 'nested_loops', severity: 'high',   timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'd3', userId: 'user-2', userName: 'Bob Martinez', type: 'recursion',    severity: 'medium', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'd4', userId: 'user-3', userName: 'Carol Park',   type: 'sorting',      severity: 'medium', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
];

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR LOGS  (new)
// ─────────────────────────────────────────────────────────────────────────────
const generatorLogs = [];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function findUserById(id)    { return users.find(u => u.id === id); }
function findUserByEmail(e)  { return users.find(u => u.email === e); }

function getUserPublic(u) {
  const plan = PLANS[u.plan] || PLANS.free;
  return {
    id: u.id, name: u.name, email: u.email, role: u.role,
    avatar: u.avatar, active: u.active, createdAt: u.createdAt,
    totalAnalyses: u.totalAnalyses, plan: u.plan,
    planName: plan.name, planPrice: plan.price,
    credits: u.credits,  creditsResetAt: u.creditsResetAt,
    displayCurrency: u.displayCurrency || 'USD',
    features: plan.features, achievements: u.achievements || [],
  };
}

function addUser(data) {
  const id = `user-${Date.now()}`;
  const newUser = {
    id, role: 'user', active: true,
    totalAnalyses: 0, totalEnergySaved: 0, totalCO2Offset: 0, totalCO2Emitted: 0,
    plan: 'free', credits: 0,
    creditsResetAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    displayCurrency: 'USD',
    achievements: [],
    ...data,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}

function addAnalysis(data) {
  const { v4: uuidv4 } = require('uuid');
  const rec = { ...data, id: uuidv4(), timestamp: new Date().toISOString() };
  analyses.push(rec);
  const user = findUserById(data.userId);
  if (user) {
    user.totalAnalyses   = (user.totalAnalyses || 0) + 1;
    user.totalCO2Emitted = parseFloat(((user.totalCO2Emitted || 0) + (data.co2Grams || 0)).toFixed(4));
    if (data.sustainabilityScore >= 60) {
      user.totalEnergySaved = (user.totalEnergySaved || 0) + (data.potentialSaving || 0);
      user.totalCO2Offset   = parseFloat(((user.totalCO2Offset || 0) + (data.co2Grams || 0) * 0.4).toFixed(4));
    }
  }
  return rec;
}

function getMonthlyAnalysisCount(userId) {
  const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
  return analyses.filter(a => a.userId === userId && new Date(a.timestamp) >= start).length;
}

// ── Subscription helpers ─────────────────────────────────────────────────────
function getUserPlan(userId) {
  const user = findUserById(userId);
  return user ? (PLANS[user.plan] || PLANS.free) : PLANS.free;
}

function setPlan(userId, planKey) {
  const user = findUserById(userId);
  if (!user || !PLANS[planKey]) return false;
  const plan = PLANS[planKey];
  user.plan = planKey;
  user.credits = plan.generatorCredits;
  user.creditsResetAt = new Date(Date.now() + 30 * 86400000).toISOString();
  return true;
}

function deductCredit(userId) {
  const user = findUserById(userId);
  if (!user || user.credits <= 0) return false;
  user.credits -= 1;
  return true;
}

function grantCredits(userId, amount) {
  const user = findUserById(userId);
  if (!user) return false;
  user.credits = (user.credits || 0) + amount;
  return true;
}

function addGeneratorLog(entry) {
  generatorLogs.push({ ...entry, id: `gen-${Date.now()}`, timestamp: new Date().toISOString() });
}

module.exports = {
  PLANS, CURRENCY_RATES,
  users, analyses, detections, generatorLogs,
  findUserById, findUserByEmail, getUserPublic,
  addUser, addAnalysis, getMonthlyAnalysisCount,
  getUserPlan, setPlan, deductCredit, grantCredits, addGeneratorLog,
};

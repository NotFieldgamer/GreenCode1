const PLANS = {
  free: { name: 'Free', price: 0, analysisLimit: 10, generatorCredits: 0, maxHistory: 5 },
  pro: { name: 'Pro', price: 9.99, analysisLimit: Infinity, generatorCredits: 50, maxHistory: Infinity },
  enterprise: { name: 'Enterprise', price: 29.99, analysisLimit: Infinity, generatorCredits: 300, maxHistory: Infinity }
};

const CURRENCY_RATES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  INR: { symbol: '₹', rate: 83.12 },
  // add others if needed
};

module.exports = { PLANS, CURRENCY_RATES };
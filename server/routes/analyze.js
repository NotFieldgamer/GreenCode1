const router = require('express').Router();
const { verifyToken, checkAnalysisLimit } = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const User = require('../models/User');

// POST /api/analyze
router.post('/', verifyToken, checkAnalysisLimit, async (req, res) => {
  try {
    const { code, language } = req.body;
    
    // --- Simulation Logic (Replace with your actual analysis engine if needed) ---
    // Generate a simulated score based on code length/keywords just for demonstration
    const isEfficient = code.includes('Set') || code.includes('Map') || !code.includes('for (let j');
    const sustainabilityScore = isEfficient ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 30) + 40;
    const energyScore = 100 - sustainabilityScore;
    const co2Grams = parseFloat((energyScore * 0.4).toFixed(2));
    const rating = sustainabilityScore >= 80 ? 'Green Efficient' : sustainabilityScore >= 50 ? 'Moderate' : 'Poor';
    const complexity = isEfficient ? 'O(n)' : 'O(n²)';
    const detections = isEfficient ? [] : ['nested_loops', 'high_memory_usage'];

    // 1. Save Analysis to MongoDB
    const newAnalysis = await Analysis.create({
      userId: req.user.id,
      language: language || 'javascript',
      complexity,
      energyScore,
      sustainabilityScore,
      co2Grams,
      detections,
      rating
    });

    // 2. Update User Lifetime Stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.totalEnergySaved = (user.totalEnergySaved || 0) + (100 - energyScore);
      user.totalCO2Offset = (user.totalCO2Offset || 0) + (50 - co2Grams);
      user.totalCO2Emitted = (user.totalCO2Emitted || 0) + co2Grams;
      await user.save();
    }

    res.json(newAnalysis);

  } catch (err) {
    console.error('Analysis Error:', err);
    res.status(500).json({ error: 'Failed to run analysis' });
  }
});

module.exports = router;
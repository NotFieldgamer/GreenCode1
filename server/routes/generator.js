const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { verifyToken, requirePro, checkCredits } = require('../middleware/auth');
const User = require('../models/User');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using '-latest' ensures it always resolves correctly with the SDK
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

router.post('/', verifyToken, requirePro, checkCredits, async (req, res) => {
  const { description, language = 'javascript' } = req.body;
  
  if (!description?.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    // 1. Strict prompt for perfect JSON
    const prompt = `You are GreenCode, an elite AI expert in sustainable software.
    Write highly energy-efficient code for: "${description}" in ${language}.
    You MUST respond with ONLY raw JSON. No markdown, no conversational text. 
    Use this exact JSON format:
    {
      "code": "<raw code string, escape newlines>",
      "complexity": "<e.g., O(n)>",
      "energyScore": <integer 5 to 30, lower is greener>,
      "explanation": "<short explanation of energy efficiency>",
      "tips": ["<tip 1>", "<tip 2>"],
      "category": "<e.g., Array Operations>"
    }`;

    // 2. Call Gemini
    const result = await geminiModel.generateContent(prompt);
    let text = result.response.text().trim();

    // Clean Markdown blocks if Gemini accidentally includes them
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    
    // Parse JSON
    const parsedData = JSON.parse(text);

    // 3. Deduct credit directly via MongoDB (No more `deductCredit` function needed!)
    const user = await User.findById(req.user.id);
    if (user && user.credits > 0) {
      user.credits -= 1;
      await user.save();
    }

    // 4. Send to frontend
    res.json({
      description,
      language,
      ...parsedData,
      sustainabilityScore: Math.max(0, 100 - parsedData.energyScore),
      alternatives: [],
      isTemplate: false,
      isAI: true,
      creditUsed: true,
      source: 'gemini'
    });

  } catch (err) {
    console.error('Generation Error:', err.message);
    // This try/catch ensures your server NEVER crashes even if the AI fails!
    res.status(500).json({ 
      error: 'AI failed to generate code. Please check your API key or try again.' 
    });
  }
});

// GET /api/generator/categories
router.get('/categories', verifyToken, (req, res) => {
  res.json({
    categories: ['Array Operations', 'String Manipulation', 'Data Structures', 'API / Async', 'Math & Computation'],
    totalTemplates: 0,
    geminiEnabled: !!process.env.GEMINI_API_KEY,
  });
});

// GET /api/generator/suggestions
router.get('/suggestions', verifyToken, (req, res) => {
  res.json([
    "Find duplicates in an array",
    "Debounce search input",
    "Binary search a sorted list",
    "Fetch API with retry backoff"
  ]);
});

module.exports = router;
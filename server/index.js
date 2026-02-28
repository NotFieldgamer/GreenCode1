require('dotenv').config();   // load .env before any other require
const express = require('express');
const cors    = require('cors');


const authRoutes        = require('./routes/auth');
const analyzeRoutes     = require('./routes/analyze');
const userRoutes        = require('./routes/user');
const adminRoutes       = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');
const { router: achievementRoutes, checkAchievements } = require('./routes/achievements');
const chatRoutes        = require('./routes/chat');
const generatorRoutes   = require('./routes/generator');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost port (Vite may use 5173, 5174, etc.) + no-origin requests
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth',         authRoutes);
app.use('/api/analyze',      analyzeRoutes);
app.use('/api/user',         userRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/leaderboard',  leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/chat',         chatRoutes);
app.use('/api/generator',    generatorRoutes);

// Auto-check achievements after analysis
app.use('/api/analyze', (req, res, next) => {
  if (req.method === 'POST' && req.user?.id) checkAchievements(req.user.id);
  next();
});

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: 'GreenCode Premium API', timestamp: new Date().toISOString() })
);

app.listen(PORT, () => {
  console.log(`\nGreenCode Premium API  ->  http://localhost:${PORT}`);
  console.log(`  Plans        : Free | Pro ($9.99) | Enterprise ($29.99)`);
  console.log(`  Generator    : Gemini 1.5 Flash ${process.env.GEMINI_API_KEY ? '[ACTIVE]' : '[template fallback]'}`);
  console.log(`  Theme        : Science & Technology for a Sustainable Future\n`);
});

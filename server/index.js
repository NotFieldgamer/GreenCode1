require('dotenv').config();   // load .env before any other require
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const authRoutes        = require('./routes/auth');
const analyzeRoutes     = require('./routes/analyze');
const userRoutes        = require('./routes/user');
const adminRoutes       = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');
const achievementRoutes = require('./routes/achievements');
const chatRoutes        = require('./routes/chat');
const generatorRoutes   = require('./routes/generator');

const app  = express();
const PORT = process.env.PORT || 5000; // Render automatically injects this PORT

// --- DEPLOYMENT CORS FIX ---
// We allow localhost for your local testing, AND your future Vercel URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL // You will add this in Render's dashboard later!
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow if it's in our list, if it matches localhost regex, or if it's a direct backend hit (no origin)
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
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

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: 'GreenCode Premium API', timestamp: new Date().toISOString() })
);

app.listen(PORT, () => {
  console.log(`\n🚀 GreenCode Premium API running on port ${PORT}`);
  console.log(`🔌 Allowed Frontend URL: ${process.env.FRONTEND_URL || 'Localhost only'}`);
  console.log(`🤖 Generator: Gemini ${process.env.GEMINI_API_KEY ? '[ACTIVE]' : '[MISSING KEY]'}`);
  console.log(`🌍 Theme: Science & Technology for a Sustainable Future\n`);
});
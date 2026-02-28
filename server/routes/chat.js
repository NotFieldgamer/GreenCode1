const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');

const COMPLEXITY_EXPLANATIONS = {
  'O(1)':       'Constant time — executes in the same time regardless of input size. Ideal.',
  'O(log n)':   'Logarithmic time — scales very well. Doubling input only adds one more step.',
  'O(n)':       'Linear time — scales proportionally to input size. Generally acceptable.',
  'O(n log n)': 'Log-linear — typical of efficient sorting algorithms. Acceptable for most use cases.',
  'O(n²)':      'Quadratic — dangerous for large inputs. 1000 items = 1,000,000 operations.',
  'O(2ⁿ)':      'Exponential — grows explosively. Unusable beyond small inputs without memoization.',
};

// POST /api/chat
router.post('/', verifyToken, (req, res) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const msg  = message.toLowerCase().trim();
  const ctx  = context || {};             // current analysis result from frontend
  const det  = ctx.detections || [];
  const sugg = ctx.suggestions || [];
  const comp = ctx.complexity || 'O(1)';
  const score = ctx.sustainabilityScore;
  const lang = ctx.language || 'javascript';
  let reply  = '';
  const suggestions = [];

  // ── Rule-based Q&A engine ───────────────────────────────────────────────────
  if (/why.*(score|low|bad|poor|rating)/i.test(msg)) {
    if (!det.length) {
      reply = `Your code currently has **no detected issues**, which is great! The score reflects the line count and raw complexity. To push toward 100, focus on keeping functions small and using constant-time lookups.`;
    } else {
      const worst = sugg.find(s => s.severity === 'high') || sugg[0];
      reply = `Your score is ${score}/100. The biggest reason is **${worst?.title || det[0]}**.\n\n`;
      reply += `Detected issues (${det.length}): ${det.map(d => d.replace(/_/g,' ')).join(', ')}.\n\n`;
      reply += `Fixing the top issue alone could improve your score by ~${worst?.saving || '15-40%'}.`;
    }
  }

  else if (/how.*(fix|solve|improve|optimize|rewrite)/i.test(msg) || /what.*(do|can|should)/i.test(msg)) {
    if (!sugg.length) {
      reply = `Your code looks clean! For further improvements, consider: using const over let where possible, caching expensive computations, and ensuring async operations always have error handling.`;
    } else {
      const top = sugg[0];
      reply = `**Top fix: ${top.title}**\n\n${top.detail}\n\nEstimated improvement: ${top.saving}.\n\n`;
      if (sugg.length > 1) reply += `You also have ${sugg.length - 1} other issue(s). Click each detection card in the panel to see optimized code examples.`;
      suggestions.push(`View the "View Optimized Code" section for a side-by-side refactor`);
    }
  }

  else if (/nested.?loop|o\(n.?2\)|quadratic/i.test(msg)) {
    reply = `**Nested loops are O(n²)** — for 1000 items that's 1,000,000 operations.\n\n`;
    reply += `**Standard fix:** Use a Set or Map to turn the inner loop into a O(1) lookup.\n\n`;
    reply += `Example: instead of checking if \`arr2\` contains a value (O(n) loop), build a Set from \`arr2\` first (O(n) once), then check \`.has()\` (O(1) each time). Total: O(n).`;
    suggestions.push('Click the "nested_loops" detection card to see the full optimized code');
  }

  else if (/recursion|recursive|stack.?overflow|memoiz/i.test(msg)) {
    reply = `**Recursion** creates a new stack frame for every call. Deep or unbounded recursion causes stack overflows and high memory usage.\n\n`;
    reply += `**Two fixes:**\n1. **Memoization** — cache results with a Map/object. Changes O(2ⁿ) → O(n).\n2. **Iterative rewrite** — replace with a while loop and an explicit stack. Zero stack-frame overhead.\n\n`;
    reply += `Memoization is usually the quicker win; iterative is safest for production.`;
    suggestions.push('Click the "recursion" detection card below to see a memoized example');
  }

  else if (/memory.?leak|event.?listener|cleanup|removeEventListener/i.test(msg)) {
    reply = `**Memory leaks** happen when objects are held in memory longer than needed, preventing garbage collection.\n\n`;
    reply += `Common causes:\n• \`addEventListener\` without corresponding \`removeEventListener\`\n• \`setInterval\` without \`clearInterval\`\n• Closures capturing large objects\n\n`;
    reply += `In React: return a cleanup function from \`useEffect\`: \`return () => element.removeEventsListener(evt, fn)\`.`;
  }

  else if (/co2|carbon|environment|planet|green/i.test(msg)) {
    if (score !== undefined) {
      const co2 = ctx.co2Grams || 0;
      const saved = (co2 * 0.4).toFixed(4);
      reply = `Your current code emits **${co2}g CO₂** per execution.\n\n`;
      reply += `If you optimize the detected issues, you could reduce that to ~${(co2 * 0.6).toFixed(4)}g — saving **${saved}g per run**.\n\n`;
      reply += `At scale (1M executions/day) that's ${(saved * 1000000 / 1000).toFixed(1)}kg CO₂ saved annually — equivalent to planting ${Math.round(saved * 1000000 / 1000 / 21)} trees! 🌳`;
    } else {
      reply = `Paste your code in the editor to get a precise CO₂ estimate per execution. Software globally accounts for ~4% of greenhouse gas emissions — efficient code genuinely matters.`;
    }
  }

  else if (/energy\.?(cost|kwh|price|dollar|\$)/i.test(msg)) {
    if (ctx.energyCostKwh !== undefined) {
      reply = `Your code uses **${ctx.energyCostKwh} kWh** per execution, costing **$${ctx.dollarCost}**.\n\n`;
      reply += `That might sound tiny, but at 1M executions/day: **${(ctx.energyCostKwh * 1e6).toFixed(2)} kWh/day** = **$${(ctx.dollarCost * 1e6).toFixed(2)}/day**.\n\n`;
      reply += `Optimizing could cut that to **$${(ctx.dollarCost * 0.55 * 1e6).toFixed(2)}/day** — an ~45% cost reduction.`;
    } else {
      reply = `Energy cost is calculated as: Energy Score × 0.00002 kWh per execution. Paste code to get your exact figure.`;
    }
  }

  else if (/complexity|big.?o|o\(n\)|o\(1\)|o\(log/i.test(msg)) {
    reply = `**Your code complexity: ${comp}**\n\n${COMPLEXITY_EXPLANATIONS[comp] || 'Paste code to detect complexity.'}\n\n`;
    reply += `**Complexity ladder (best → worst):**\n`;
    reply += Object.entries(COMPLEXITY_EXPLANATIONS).map(([k,v]) => `• ${k} — ${v.split('—')[1]?.trim()}`).join('\n');
  }

  else if (/language|python|javascript|java|go|rust|what.?language/i.test(msg)) {
    const langRank = {
      rust: '🥇 Most energy-efficient — systems language, zero-cost abstractions',
      go: '🥈 Excellent — compiled, fast GC, efficient goroutines',
      java: '🥉 Compiled JVM — good after JIT warm-up',
      javascript: '⚡ Node.js is competitive for I/O-bound work',
      python: '🐍 Slower for CPU work; use NumPy/Cython for numeric tasks',
    };
    reply = `**Language energy efficiency rankings:**\n\n`;
    reply += Object.entries(langRank).map(([k,v]) => `**${k}** — ${v}`).join('\n\n');
    reply += `\n\nFor **${lang}** specifically: ${langRank[lang] || 'Use the analyzer to profile your specific code.'} `;
    reply += `\n\nRemember: algorithm choice matters far more than language choice for energy efficiency.`;
  }

  else if (/tip|advice|best.?practice|suggestion/i.test(msg)) {
    reply = `**Top energy optimization practices:**\n\n`;
    reply += `1. 🎯 **Algorithm first** — O(n) vs O(n²) dwarfs any language/library difference\n`;
    reply += `2. 🗺️ **Use hash structures** — Map, Set, dict over array searches\n`;
    reply += `3. 💾 **Cache aggressively** — memoize pure functions, cache DOM queries\n`;
    reply += `4. 🔄 **Lazy evaluation** — compute only what's needed, when needed\n`;
    reply += `5. 🧹 **Clean up resources** — event listeners, intervals, connections\n`;
    reply += `6. ⚡ **Batch operations** — group DB writes, API calls, DOM updates\n`;
    reply += `7. 📦 **Size matters** — smaller bundles, fewer dependencies = less CPU to parse`;
  }

  else if (/hello|hi|hey|help/i.test(msg)) {
    reply = `Hi! 👋 I'm the GreenCode AI assistant.\n\nI can help you with:\n• **"Why is my score low?"** — explain your detections\n• **"How do I fix nested loops?"** — refactoring advice\n• **"What does O(n²) mean?"** — complexity explained\n• **"How much CO₂ does this save?"** — environmental impact\n• **"What language is most efficient?"** — language comparison\n• **"Give me optimization tips"** — general best practices\n\nPaste your code in the editor first, then ask away!`;
  }

  else {
    reply = `I'm not sure I understand that one. Here are some things you can ask me:\n\n• "Why is my sustainability score low?"\n• "How do I fix the nested loop?"\n• "What does O(n²) mean for my code?"\n• "How much CO₂ does optimizing save?"\n• "Give me performance tips for ${lang}"\n• "What's the difference between O(n) and O(n²)?"`;
  }

  res.json({ reply, suggestions });
});

module.exports = router;

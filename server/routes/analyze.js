const router  = require('express').Router();
const { verifyToken, checkAnalysisLimit } = require('../middleware/auth');
const { addAnalysis }  = require('../data/db');

// ─────────────────────────────────────────────────────────────────────────────
// OPTIMIZED CODE SNIPPETS — per detection type + language
// ─────────────────────────────────────────────────────────────────────────────
function generateOptimizedSnippet(type, language) {
  const snippets = {
    nested_loops: {
      javascript: {
        before: `// ❌ O(n²) — nested loop
function findDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}`,
        after: `// ✅ O(n) — using Set (HashMap approach)
function findDuplicates(arr) {
  const seen = new Set();
  for (const item of arr) {
    if (seen.has(item)) return true;
    seen.add(item);
  }
  return false;
}`,
        explanation: 'Replace the inner loop with a Set (hash-based O(1) lookup). The nested O(n²) becomes O(n) — for 1000 items that\'s 1M → 1K operations.',
      },
      python: {
        before: `# ❌ O(n²) — nested loop
def find_duplicates(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return True
    return False`,
        after: `# ✅ O(n) — using a set
def find_duplicates(arr):
    return len(arr) != len(set(arr))`,
        explanation: 'Python\'s built-in set() converts lookup to O(1). The one-liner is both faster and more readable.',
      },
      java: {
        before: `// ❌ O(n²) — nested loop
boolean hasDuplicate(int[] arr) {
    for (int i = 0; i < arr.length; i++)
        for (int j = i+1; j < arr.length; j++)
            if (arr[i] == arr[j]) return true;
    return false;
}`,
        after: `// ✅ O(n) — HashSet lookup
boolean hasDuplicate(int[] arr) {
    Set<Integer> seen = new HashSet<>();
    for (int n : arr) {
        if (!seen.add(n)) return true;
    }
    return false;
}`,
        explanation: 'HashSet.add() returns false when the element already exists — making this a clean O(n) single-pass solution.',
      },
      default: {
        before: `// ❌ Nested loop — O(n²)
for each item in collection:
    for each other in collection:
        compare(item, other)`,
        after: `// ✅ HashMap/Set approach — O(n)
seen = empty_set()
for each item in collection:
    if item in seen: return true
    add item to seen`,
        explanation: 'Use a hash-based data structure (Set/HashMap/dict) to turn inner loop lookups from O(n) → O(1), making the total algorithm O(n).',
      },
    },
    recursion: {
      javascript: {
        before: `// ❌ Naive recursion (exponential calls)
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
        after: `// ✅ Memoized recursion — O(n)
function fibonacci(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
}

// ✅✅ Or iterative (no stack risk)
function fibIterative(n) {
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}`,
        explanation: 'Memoization caches sub-results — Fibonacci goes from O(2ⁿ) to O(n). The iterative version uses O(1) memory with no call-stack risk.',
      },
      python: {
        before: `# ❌ Naive recursion
def fibonacci(n):
    if n <= 1: return n
    return fibonacci(n-1) + fibonacci(n-2)`,
        after: `# ✅ Using functools.lru_cache — O(n)
from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n):
    if n <= 1: return n
    return fibonacci(n-1) + fibonacci(n-2)`,
        explanation: '@lru_cache automatically memoizes function results. Python\'s built-in decorator requires zero manual cache management.',
      },
      default: {
        before: `// ❌ Fibonacci with plain recursion — O(2ⁿ)
function fib(n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }`,
        after: `// ✅ Memoized — O(n)
const memo = {};
function fib(n) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return memo[n] = fib(n-1) + fib(n-2);
}`,
        explanation: 'Cache intermediate results to avoid recomputing the same sub-problems repeatedly.',
      },
    },
    sorting: {
      javascript: {
        before: `// ❌ Sorting inside a loop — O(n² log n) total
function processItems(items) {
  const result = [];
  for (const category of categories) {
    const sorted = items.sort((a, b) => a.val - b.val);
    result.push(sorted.filter(i => i.cat === category));
  }
  return result;
}`,
        after: `// ✅ Sort once outside loop — O(n log n) total
function processItems(items) {
  const sorted = [...items].sort((a, b) => a.val - b.val); // sort ONCE
  return categories.map(category =>
    sorted.filter(i => i.cat === category)
  );
}`,
        explanation: 'Sort the array once before entering any loop. Sorting inside a loop of size k multiplies cost by k unnecessarily.',
      },
      default: {
        before: `// ❌ Re-sorting inside loop
for each query:
    sort(collection)   // called k times = O(k × n log n)
    search(collection, query)`,
        after: `// ✅ Sort once, then use binary search per query
sort(collection)        // once = O(n log n)
for each query:
    binarySearch(collection, query)  // O(log n) each`,
        explanation: 'Pre-sort data structures once at setup time. Use binary search for repeated queries instead of re-sorting.',
      },
    },
    memory_leak: {
      javascript: {
        before: `// ❌ Event listener added but never removed
function setupHandler() {
  document.addEventListener('click', handleClick);
  // handleClick stays in memory forever!
}`,
        after: `// ✅ Store reference and remove on cleanup
function setupHandler() {
  const handleClick = (e) => { /* handler */ };
  document.addEventListener('click', handleClick);

  // Return a cleanup function (React useEffect pattern)
  return () => document.removeEventListener('click', handleClick);
}

// ✅ In React:
useEffect(() => {
  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}, []);`,
        explanation: 'Always balance addEventListener with removeEventListener. Store the handler reference in a variable so you can remove the exact same function reference.',
      },
      default: {
        before: `// ❌ Memory leak — listener added, never removed
element.addEventListener('click', handler);`,
        after: `// ✅ Always clean up listeners
element.addEventListener('click', handler);
// On component unmount / page hide:
element.removeEventListener('click', handler);`,
        explanation: 'Event listeners hold references to their scope, preventing garbage collection. Always remove listeners when they are no longer needed.',
      },
    },
    interval_leak: {
      javascript: {
        before: `// ❌ setInterval never cleared — runs forever
function startPolling() {
  setInterval(() => {
    fetchData();
  }, 1000);
}`,
        after: `// ✅ Store ID and clear on cleanup
let intervalId = null;

function startPolling() {
  intervalId = setInterval(() => {
    fetchData();
  }, 1000);
}

function stopPolling() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// ✅ In React:
useEffect(() => {
  const id = setInterval(fetchData, 1000);
  return () => clearInterval(id); // cleanup on unmount
}, []);`,
        explanation: 'Store the interval ID in a variable accessible to your cleanup code. clearInterval(id) stops the timer and allows garbage collection.',
      },
      default: {
        before: `// ❌ Interval runs without end
setInterval(taskFn, delay);`,
        after: `// ✅ Store ID, clear when done
const id = setInterval(taskFn, delay);
// Later:
clearInterval(id);`,
        explanation: 'setInterval returns an ID. You must call clearInterval(id) to stop it when the owning component is destroyed or the task is complete.',
      },
    },
    async_debt: {
      javascript: {
        before: `// ❌ Unhandled promise rejection
fetch('/api/data')
  .then(res => res.json())
  .then(data => processData(data));
  // What if fetch fails? Unhandled rejection crashes workers.`,
        after: `// ✅ Option 1: .catch() on promise chain
fetch('/api/data')
  .then(res => res.json())
  .then(data => processData(data))
  .catch(err => {
    console.error('Fetch failed:', err);
    // Handle gracefully — show error UI, retry, etc.
  });

// ✅ Option 2: async/await with try/catch (cleaner)
async function loadData() {
  try {
    const res  = await fetch('/api/data');
    const data = await res.json();
    processData(data);
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}`,
        explanation: 'Unhandled promise rejections crash Node.js workers and create silent failures in browsers. Always attach .catch() or wrap await in try/catch.',
      },
      default: {
        before: `// ❌ No error handling
asyncOperation().then(result => use(result));`,
        after: `// ✅ Always handle rejections
asyncOperation()
  .then(result => use(result))
  .catch(err => handleError(err));`,
        explanation: 'Promise rejections without .catch() are silently swallowed (or crash in Node.js). Handle every async path.',
      },
    },
    global_pollution: {
      javascript: {
        before: `// ❌ var pollutes global / function scope
var counter = 0;
var maxRetries = 5;
var apiUrl = 'https://api.example.com';
var userData = null;`,
        after: `// ✅ Use const/let with the smallest scope possible
const API_URL = 'https://api.example.com'; // constant — const
const MAX_RETRIES = 5;

// Group mutable state into a module-scoped object
const state = {
  counter: 0,
  userData: null,
};

// Or use a module pattern (IIFE)
const app = (() => {
  let counter = 0;
  return { increment: () => ++counter, get: () => counter };
})();`,
        explanation: 'var is function-scoped and hoisted, making code harder to reason about. const prevents accidental reassignment. Grouping state reduces namespace pollution.',
      },
      default: {
        before: `// ❌ Many loose global variables
var a = 1; var b = 2; var c = 3;`,
        after: `// ✅ Group into an object / module
const config = { a: 1, b: 2, c: 3 };`,
        explanation: 'Group related variables into objects or modules to avoid polluting the global namespace.',
      },
    },
    single_loop: {
      javascript: {
        before: `// ⚠️ Loop with avoidable inefficiencies
function processUsers(users) {
  const result = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].active) {
      result.push(users[i].name.toUpperCase());
    }
  }
  return result;
}`,
        after: `// ✅ Functional approach — declarative and JIT-optimized
function processUsers(users) {
  return users
    .filter(u => u.active)
    .map(u => u.name.toUpperCase());
}

// ✅ If performance is critical, single-pass with reduce:
function processUsers(users) {
  return users.reduce((acc, u) => {
    if (u.active) acc.push(u.name.toUpperCase());
    return acc;
  }, []);
}`,
        explanation: 'filter + map is semantically clear and enables engine-level optimizations. reduce combines both into one pass when allocations matter.',
      },
      default: {
        before: `// A loop doing multiple jobs
result = []
for item in arr:
    if condition: result.add(transform(item))`,
        after: `// Separate concerns cleanly
result = [transform(item) for item in arr if condition]`,
        explanation: 'Language built-ins (list comprehensions, filter/map) are often more optimized than hand-written loops and are easier to read.',
      },
    },
  };

  const lang = language?.toLowerCase() || 'javascript';
  const typeSnippets = snippets[type];
  if (!typeSnippets) return null;
  return typeSnippets[lang] || typeSnippets.default || typeSnippets.javascript || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE-SPECIFIC TIPS
// ─────────────────────────────────────────────────────────────────────────────
function getLanguageTips(language, detections) {
  const lang = language?.toLowerCase() || 'javascript';
  const allTips = {
    javascript: [
      { cat: 'Performance', tip: 'Use Map and Set over plain objects for frequent lookups — they are O(1) and don\'t inherit prototype keys.' },
      { cat: 'Performance', tip: 'Avoid calling document.querySelector inside loops — cache the DOM reference outside.' },
      { cat: 'Performance', tip: 'Use Array.from() or spread [...arr] instead of slice(0) for shallow copies.' },
      { cat: 'Memory',      tip: 'WeakMap/WeakSet allow garbage collection of keys — prefer them for caching DOM node metadata.' },
      { cat: 'Modern',      tip: 'Optional chaining (?.) and nullish coalescing (??) eliminate verbose null-checks without runtime cost.' },
      { cat: 'Async',       tip: 'Promise.all() runs multiple async operations in parallel — prefer it over sequential awaits.' },
      { cat: 'Performance', tip: 'Debounce user input handlers (search, resize) to avoid firing O(n) operations on every keystroke.' },
    ],
    typescript: [
      { cat: 'Type Safety',  tip: 'Use readonly arrays (ReadonlyArray<T>) to prevent accidental mutations that break pure functions.' },
      { cat: 'Performance',  tip: 'Type narrowing (instanceof, typeof) removes runtime checks — the TS compiler often eliminates them entirely.' },
      { cat: 'Modern',       tip: 'Discriminated unions + exhaustive switch statements catch missing cases at compile time, not runtime.' },
      { cat: 'Memory',       tip: 'Use interface over type alias for objects — interfaces are open and easier for TS to optimize incrementally.' },
    ],
    python: [
      { cat: 'Performance', tip: 'List comprehensions are 35–50% faster than equivalent for-loops — prefer [x for x in list if cond].' },
      { cat: 'Performance', tip: 'Use collections.Counter or collections.defaultdict to avoid repeated dict.get() overhead.' },
      { cat: 'Performance', tip: 'NumPy vectorized operations replace Python loops for numeric computation — 10–100x faster.' },
      { cat: 'Memory',      tip: 'Generators (yield) process data lazily — use them for large sequences to avoid loading all data into memory.' },
      { cat: 'Modern',      tip: 'functools.lru_cache(@lru_cache) memoizes any pure function with one decorator line.' },
      { cat: 'Performance', tip: 'str.join() is faster than + string concatenation in loops — build a list and join at the end.' },
    ],
    java: [
      { cat: 'Performance', tip: 'Pre-size ArrayList and HashMap with expected capacity: new ArrayList<>(1000) avoids costly resizing.' },
      { cat: 'Performance', tip: 'Prefer StringBuilder over String + in loops — String concatenation creates a new object every iteration.' },
      { cat: 'Performance', tip: 'Use HashMap.getOrDefault() and computeIfAbsent() to eliminate null-checks in frequency counting.' },
      { cat: 'Modern',      tip: 'Stream API with .filter().map().collect() chains are JIT-optimized but avoid for hot loops over large collections.' },
      { cat: 'Memory',      tip: 'Prefer primitives (int, long) over boxed types (Integer, Long) in collections when possible — avoids boxing overhead.' },
    ],
    'c++': [
      { cat: 'Performance', tip: 'Reserve vector capacity with vec.reserve(n) before push_back loops to avoid O(log n) reallocations.' },
      { cat: 'Performance', tip: 'Pass large objects by const reference (&) — avoids copy constructor invocations in hot paths.' },
      { cat: 'Performance', tip: 'Use emplace_back() instead of push_back() to construct elements in-place without temporary objects.' },
      { cat: 'Memory',      tip: 'std::move() on temporaries enables move semantics — eliminates deep copies of strings and vectors.' },
      { cat: 'Modern',      tip: 'std::unordered_map provides O(1) average lookup vs std::map\'s O(log n).' },
    ],
    go: [
      { cat: 'Performance', tip: 'Pre-allocate slices with make([]T, 0, capacity) to avoid repeated GC pressure from growth.' },
      { cat: 'Concurrency', tip: 'Use buffered channels (make(chan T, n)) to decouple goroutines and prevent deadlocks.' },
      { cat: 'Performance', tip: 'sync.Pool reuses temporary objects and dramatically reduces GC pauses in high-throughput handlers.' },
      { cat: 'Modern',      tip: 'Prefer errors.Is() and errors.As() over string comparison for error identity checks.' },
    ],
    rust: [
      { cat: 'Performance', tip: 'Iterators in Rust are zero-cost abstractions — .iter().filter().map() compiles to the same code as a manual loop.' },
      { cat: 'Memory',      tip: 'Use &str (slice reference) over String ownership in function arguments unless you need to own the data.' },
      { cat: 'Performance', tip: 'Rc<RefCell<T>> is single-threaded only — use Arc<Mutex<T>> for shared mutable state across threads.' },
      { cat: 'Modern',      tip: 'match is exhaustive by default — the compiler guarantees you\'ve handled every variant.' },
    ],
    php: [
      { cat: 'Performance', tip: 'isset() is 10–20% faster than array_key_exists() for checking array keys.' },
      { cat: 'Performance', tip: 'Use SplFixedArray for large numeric arrays — it allocates contiguous memory like a C array.' },
      { cat: 'Modern',      tip: 'Type declarations (int, string, array) let opcache optimize more aggressively.' },
    ],
    ruby: [
      { cat: 'Performance', tip: 'Use .lazy on Enumerator chains to process large collections without building intermediate arrays.' },
      { cat: 'Performance', tip: 'Symbols (:name) are faster than strings for hash keys — they\'re frozen and reused in the symbol table.' },
      { cat: 'Modern',      tip: 'Use frozen_string_literal: true at file top to freeze all string literals and reduce allocations.' },
    ],
  };

  const tips = allTips[lang] || allTips.javascript;
  // Prioritise tips related to detected issues
  const priority = [];
  if (detections.includes('async_debt'))       priority.push(...tips.filter(t => t.cat === 'Async'));
  if (detections.includes('memory_leak') || detections.includes('interval_leak')) priority.push(...tips.filter(t => t.cat === 'Memory'));
  if (detections.includes('nested_loops') || detections.includes('single_loop'))  priority.push(...tips.filter(t => t.cat === 'Performance'));
  const rest = tips.filter(t => !priority.includes(t));
  return [...new Set([...priority, ...rest])].slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// AI DETECTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function analyzeCode(code, language = 'javascript') {
  const lines      = code.split('\n').length;
  const detections = [];
  const suggestions = [];
  let energyScore  = 10;
  let complexity   = 'O(1)';

  // 1. Nested loops
  const nestedLoopRx = /for[\s\S]{0,80}for|while[\s\S]{0,80}while|for[\s\S]{0,80}while/;
  if (nestedLoopRx.test(code)) {
    complexity = 'O(n²)';
    energyScore += 40;
    detections.push('nested_loops');
    suggestions.push({
      type: 'nested_loops', severity: 'high',
      title: 'Nested Loops Detected (O(n²))',
      detail: 'Nested loops grow energy cost quadratically. Use HashMap, Set, or indexed lookups to reduce to O(n) or better.',
      saving: '~40% energy reduction',
      optimizedCode: generateOptimizedSnippet('nested_loops', language),
    });
  } else if (/\bfor\b|\bwhile\b/.test(code)) {
    complexity = 'O(n)';
    energyScore += 20;
    detections.push('single_loop');
    suggestions.push({
      type: 'single_loop', severity: 'low',
      title: 'Loop — Verify Inner Complexity',
      detail: 'Ensure all operations inside the loop are O(1). Avoid function calls, DOM queries, or sorts inside loops.',
      saving: '~10% energy reduction',
      optimizedCode: generateOptimizedSnippet('single_loop', language),
    });
  }

  // 2. Recursion
  const funcMatch = code.match(/function\s+(\w+)/);
  if (funcMatch) {
    const fname = funcMatch[1];
    if (new RegExp(`\\b${fname}\\s*\\(`).test(code.replace(new RegExp(`function\\s+${fname}`), ''))) {
      energyScore += 25;
      detections.push('recursion');
      suggestions.push({
        type: 'recursion', severity: 'medium',
        title: 'Recursion Detected',
        detail: 'Recursive calls create additional stack frames and memory allocations. Consider iterative approach with a stack, or apply memoization.',
        saving: '~25% energy reduction',
        optimizedCode: generateOptimizedSnippet('recursion', language),
      });
    }
  }

  // 3. Sorting inside blocks
  if (/\.sort\s*\(/.test(code)) {
    energyScore += 15;
    detections.push('sorting');
    suggestions.push({
      type: 'sorting', severity: 'medium',
      title: 'Sort Operation Detected',
      detail: 'Sorting is O(n log n). Avoid repeated sorting or sorting inside other loops. Pre-sort data structures whenever possible.',
      saving: '~15% energy reduction',
      optimizedCode: generateOptimizedSnippet('sorting', language),
    });
  }

  // 4. Memory leak patterns
  if (/addEventListener/.test(code) && !/removeEventListener/.test(code)) {
    energyScore += 20;
    detections.push('memory_leak');
    suggestions.push({
      type: 'memory_leak', severity: 'high',
      title: 'Potential Memory Leak',
      detail: 'addEventListener found without a matching removeEventListener. This can cause memory leaks in long-running processes.',
      saving: '~20% memory/energy reduction',
      optimizedCode: generateOptimizedSnippet('memory_leak', language),
    });
  }

  // 5. setInterval without clearInterval
  if (/setInterval/.test(code) && !/clearInterval/.test(code)) {
    energyScore += 15;
    detections.push('interval_leak');
    suggestions.push({
      type: 'interval_leak', severity: 'medium',
      title: 'Uncleared Interval Detected',
      detail: 'setInterval without clearInterval runs forever, consuming CPU and energy continuously.',
      saving: '~15% CPU energy reduction',
      optimizedCode: generateOptimizedSnippet('interval_leak', language),
    });
  }

  // 6. Async debt
  if (/\.then\s*\(/.test(code) && !/(\.catch|try\s*{)/.test(code)) {
    energyScore += 10;
    detections.push('async_debt');
    suggestions.push({
      type: 'async_debt', severity: 'medium',
      title: 'Unhandled Promise Rejection Risk',
      detail: 'Promise chains without .catch() risk unhandled rejections that can crash workers and waste resources.',
      saving: '~10% resilience improvement',
      optimizedCode: generateOptimizedSnippet('async_debt', language),
    });
  }

  // 7. Global variable pollution
  const globalVarMatches = (code.match(/^var\s+\w+/gm) || []).length;
  if (globalVarMatches > 3) {
    energyScore += 8;
    detections.push('global_pollution');
    suggestions.push({
      type: 'global_pollution', severity: 'low',
      title: 'Global Variable Pollution',
      detail: `${globalVarMatches} top-level var declarations found. Use const/let with block scope, or use module patterns.`,
      saving: '~8% memory reduction',
      optimizedCode: generateOptimizedSnippet('global_pollution', language),
    });
  }

  // 8. Line count scaling
  energyScore += Math.floor(lines / 10);

  // ── Metrics ────────────────────────────────────────────────────────────────
  const energyCostKwh       = parseFloat((energyScore * 0.00002).toFixed(6));
  const co2Grams            = parseFloat((energyCostKwh * 450).toFixed(4));
  const dollarCost          = parseFloat((energyCostKwh * 0.12).toFixed(6));
  const sustainabilityScore = Math.max(0, Math.min(100, Math.round(100 - energyScore)));
  const optimisedEnergy     = Math.round(energyScore * 0.55);
  const potentialSaving     = energyScore - optimisedEnergy;

  let rating = energyScore < 30 ? 'Green Efficient' : energyScore < 60 ? 'Moderate' : 'Energy Heavy';

  // ── Language tips ──────────────────────────────────────────────────────────
  const languageTips = getLanguageTips(language, detections);

  // ── Big O data for visualiser ──────────────────────────────────────────────
  const complexityData = {
    detected: complexity,
    // Pre-computed ops for n = [10,100,500,1000,5000,10000]
    curves: {
      'O(1)':       [10,100,500,1000,5000,10000].map(n => ({ n, ops: 1 })),
      'O(log n)':   [10,100,500,1000,5000,10000].map(n => ({ n, ops: Math.round(Math.log2(n)) })),
      'O(n)':       [10,100,500,1000,5000,10000].map(n => ({ n, ops: n })),
      'O(n log n)': [10,100,500,1000,5000,10000].map(n => ({ n, ops: Math.round(n * Math.log2(n)) })),
      'O(n²)':      [10,100,500,1000,5000,10000].map(n => ({ n, ops: n * n })),
    },
  };

  return {
    language, lines, complexity,
    energyScore, energyCostKwh, co2Grams, dollarCost,
    sustainabilityScore, rating, detections, suggestions,
    optimisedEnergy, potentialSaving, languageTips, complexityData,
  };
}

// POST /api/analyze
router.post('/', verifyToken, checkAnalysisLimit, (req, res) => {
  const { code, language } = req.body;
  if (!code || !code.trim()) return res.status(400).json({ error: 'Code is required' });

  const result = analyzeCode(code.trim(), language || 'javascript');
  const saved  = addAnalysis({ userId: req.user.id, ...result });

  res.json({ ...result, id: saved.id, timestamp: saved.timestamp });
});

module.exports = router;

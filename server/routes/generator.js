const router = require('express').Router();
const { verifyToken, requirePro, checkCredits } = require('../middleware/auth');
const { deductCredit, addGeneratorLog } = require('../data/db');

// ─── Gemini AI Integration ────────────────────────────────────────────────────
let geminiModel = null;
try {
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('  Gemini AI     : Connected (gemini-1.5-flash)');
  } else {
    console.log('  Gemini AI     : No GEMINI_API_KEY — using template fallback');
  }
} catch (e) {
  console.error('  Gemini AI     : Init failed —', e.message);
}

async function generateWithGemini(description, language) {
  if (!geminiModel) return null;
  const prompt = `You are GreenCode, an AI expert in energy-efficient, sustainable software engineering.
The user wants code for: "${description}"
Language: ${language}

Generate the most energy-efficient implementation possible.
Respond in STRICT JSON (no markdown, no backticks, just raw JSON) with this shape:
{
  "code": "<full code string, escape newlines as \\n>",
  "complexity": "<Big O string, e.g. O(n log n)>",
  "energyScore": <integer 1-100, lower is greener>,
  "explanation": "<2-3 sentences explaining why this is energy-efficient>",
  "tips": ["<tip 1>", "<tip 2>"],
  "category": "<category name, e.g. Array Operations>"
}`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text   = result.response.text().trim();
    // Strip any accidental markdown fences
    const clean  = text.replace(/^```json\s*/i,'').replace(/```\s*$/,'').trim();
    const parsed = JSON.parse(clean);
    return parsed;
  } catch (err) {
    console.error('Gemini generation error:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR TEMPLATE LIBRARY
// 40+ categories, optimized implementations per language
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Array Operations', 'String Manipulation', 'Sorting & Searching', 'Data Structures',
  'API / Async', 'Math & Computation', 'File / I/O', 'Caching', 'Event Handling',
  'Authentication', 'Date & Time', 'Regular Expressions', 'Error Handling', 'Recursion',
  'Tree & Graph', 'Dynamic Programming',
];

const TEMPLATES = {
  // ── Array ops ──────────────────────────────────────────────────────────────
  find_duplicates: {
    keywords: ['duplicate', 'find duplicate', 'check duplicate', 'repeated'],
    complexity: 'O(n)',
    explanation: 'Uses a Set for O(1) lookup per element, converting the naive O(n²) nested-loop approach to a single O(n) pass.',
    energyScore: 18,
    category: 'Array Operations',
    implementations: {
      javascript: `// ✅ O(n) — Set-based duplicate detection
function findDuplicates(arr) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of arr) {
    if (seen.has(item)) duplicates.add(item);
    else seen.add(item);
  }
  return [...duplicates];
}`,
      python: `# ✅ O(n) — Counter-based duplicate detection
from collections import Counter

def find_duplicates(arr):
    counts = Counter(arr)
    return [item for item, count in counts.items() if count > 1]`,
      java: `// ✅ O(n) — HashSet-based detection
import java.util.*;

public List<Integer> findDuplicates(int[] arr) {
    Set<Integer> seen = new HashSet<>();
    List<Integer> duplicates = new ArrayList<>();
    for (int n : arr) {
        if (!seen.add(n)) duplicates.add(n);
    }
    return duplicates;
}`,
      typescript: `// ✅ O(n) — Generic Set-based detection
function findDuplicates<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const duplicates = new Set<T>();
  for (const item of arr) {
    if (seen.has(item)) duplicates.add(item);
    else seen.add(item);
  }
  return [...duplicates];
}`,
      python_alt: 'Using a list and .count() — O(n²), avoid for large datasets',
      js_alt: 'Nested for loop comparison — O(n²), memory efficient but slow',
    },
    alternatives: [
      { label: '⚠️ Naive O(n²) approach (avoid for large arrays)', code: `function findDuplicates(arr) {\n  const result = [];\n  for (let i = 0; i < arr.length; i++)\n    for (let j = i+1; j < arr.length; j++)\n      if (arr[i] === arr[j] && !result.includes(arr[i]))\n        result.push(arr[i]);\n  return result;\n}`, complexity: 'O(n²)' },
      { label: '✅ Sort-then-compare O(n log n)', code: `function findDuplicates(arr) {\n  const sorted = [...arr].sort();\n  return sorted.filter((v,i) => v === sorted[i-1]);\n}`, complexity: 'O(n log n)' },
    ],
  },

  debounce: {
    keywords: ['debounce', 'delay', 'throttle input', 'search delay', 'rate limit'],
    complexity: 'O(1)',
    explanation: 'Debounce delays function execution until after a wait period. This uses closure to store the timer reference, with cancel() method for cleanup.',
    energyScore: 8,
    category: 'Event Handling',
    implementations: {
      javascript: `// ✅ O(1) — Production-grade debounce with cancel support
function debounce(fn, wait = 300) {
  let timerId = null;

  function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      fn.apply(this, args);
    }, wait);
  }

  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = null;
  };

  return debounced;
}

// Usage:
const search = debounce((query) => fetchResults(query), 400);
input.addEventListener('input', e => search(e.target.value));`,
      typescript: `// ✅ O(1) — TypeScript debounce with generic type safety
function debounce<T extends (...args: any[]) => void>(
  fn: T, wait = 300
): T & { cancel: () => void } {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      fn(...args);
    }, wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => { if (timerId) { clearTimeout(timerId); timerId = null; } };
  return debounced;
}`,
      python: `# ✅ Python debounce using threading.Timer
import threading

def debounce(wait):
    def decorator(fn):
        timer = [None]
        def debounced(*args, **kwargs):
            if timer[0]:
                timer[0].cancel()
            timer[0] = threading.Timer(wait, lambda: fn(*args, **kwargs))
            timer[0].start()
        return debounced
    return decorator

@debounce(0.3)
def on_search(query):
    fetch_results(query)`,
    },
    alternatives: [
      { label: '⚡ Throttle (fire at most once per interval)', code: `function throttle(fn, limit = 300) {\n  let lastCall = 0;\n  return (...args) => {\n    const now = Date.now();\n    if (now - lastCall >= limit) { lastCall = now; fn(...args); }\n  };\n}`, complexity: 'O(1)' },
    ],
  },

  binary_search: {
    keywords: ['binary search', 'find in sorted', 'search sorted', 'bisect'],
    complexity: 'O(log n)',
    explanation: 'Binary search halves the search space each step. Requires sorted input. O(log n) vs O(n) linear scan — at n=1M, that\'s 20 operations vs 1,000,000.',
    energyScore: 5,
    category: 'Sorting & Searching',
    implementations: {
      javascript: `// ✅ O(log n) — Iterative binary search (no stack risk)
function binarySearch(sortedArr, target) {
  let lo = 0, hi = sortedArr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;  // unsigned right shift avoids overflow
    if (sortedArr[mid] === target) return mid;
    if (sortedArr[mid] < target)  lo = mid + 1;
    else                           hi = mid - 1;
  }
  return -1;  // not found
}`,
      python: `# ✅ O(log n) — Use built-in bisect (C-optimized)
import bisect

def binary_search(sorted_arr, target):
    idx = bisect.bisect_left(sorted_arr, target)
    if idx < len(sorted_arr) and sorted_arr[idx] == target:
        return idx
    return -1`,
      java: `// ✅ O(log n) — Use Arrays.binarySearch (JDK optimized)
import java.util.Arrays;

public int binarySearch(int[] sortedArr, int target) {
    int result = Arrays.binarySearch(sortedArr, target);
    return result >= 0 ? result : -1;
}`,
      typescript: `// ✅ O(log n) — Generic binary search
function binarySearch<T>(sortedArr: T[], target: T, compare: (a: T, b: T) => number): number {
  let lo = 0, hi = sortedArr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const cmp = compare(sortedArr[mid], target);
    if (cmp === 0) return mid;
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    },
    alternatives: [
      { label: '⚠️ Linear scan O(n)', code: `function linearSearch(arr, target) {\n  return arr.findIndex(x => x === target);\n}`, complexity: 'O(n)' },
    ],
  },

  memoize: {
    keywords: ['memoize', 'cache function', 'memo', 'lru cache', 'cache result'],
    complexity: 'O(1) per cached call',
    explanation: 'Memoization wraps any pure function, caching results by argument. Cache hit is O(1) vs re-computing. Uses Map for speed; optional LRU size limit prevents memory bloat.',
    energyScore: 6,
    category: 'Caching',
    implementations: {
      javascript: `// ✅ O(1) cached calls — Memoize with LRU eviction
function memoize(fn, maxSize = 100) {
  const cache = new Map();

  return function memoized(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      // LRU: move accessed entry to end
      const val = cache.get(key);
      cache.delete(key);
      cache.set(key, val);
      return val;
    }
    const result = fn.apply(this, args);
    if (cache.size >= maxSize) {
      // evict oldest entry (Map insertion order)
      cache.delete(cache.keys().next().value);
    }
    cache.set(key, result);
    return result;
  };
}

// Usage:
const expensiveFn = memoize((n) => heavyComputation(n));`,
      python: `# ✅ Python — Use functools.lru_cache (C-optimized)
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_fn(n):
    return heavy_computation(n)

# For arbitrary kwargs, use functools.cache (Python 3.9+)
from functools import cache

@cache
def flexible_fn(*args):
    return compute(*args)`,
      typescript: `// ✅ TypeScript — Generic memoize with WeakMap for objects
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key)!;
  }) as T;
}`,
    },
    alternatives: [
      { label: '⚠️ Simple object cache (no size limit)', code: `function memoize(fn) {\n  const cache = {};\n  return (...args) => {\n    const key = JSON.stringify(args);\n    return cache[key] ?? (cache[key] = fn(...args));\n  };\n}`, complexity: 'O(1) but unbounded memory' },
    ],
  },

  fetch_with_retry: {
    keywords: ['fetch retry', 'api call retry', 'http retry', 'network retry', 'retry logic'],
    complexity: 'O(k) where k = max retries',
    explanation: 'Exponential backoff retries reduce load on servers during transient failures. Each retry waits 2^attempt * base milliseconds, preventing thundering herd.',
    energyScore: 12,
    category: 'API / Async',
    implementations: {
      javascript: `// ✅ Fetch with exponential backoff retry
async function fetchWithRetry(url, options = {}, { retries = 3, baseDelay = 500 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok && attempt < retries) {
        throw new Error(\`HTTP \${res.status}\`);
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * delay * 0.1;
      await new Promise(r => setTimeout(r, delay + jitter));
      console.warn(\`Retry \${attempt + 1}/\${retries} after \${delay}ms\`);
    }
  }
}

// Usage:
const data = await fetchWithRetry('/api/data').then(r => r.json());`,
      python: `# ✅ Python requests with exponential backoff
import time, random
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session(retries=3, backoff_factor=0.5):
    session = requests.Session()
    retry = Retry(
        total=retries,
        backoff_factor=backoff_factor,
        status_forcelist=[500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

session = create_session()
response = session.get('https://api.example.com/data', timeout=10)`,
      typescript: `// ✅ TypeScript — Typed fetch with retry
interface RetryOptions {
  retries?: number;
  baseDelay?: number;
  shouldRetry?: (res: Response) => boolean;
}

async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  { retries = 3, baseDelay = 500, shouldRetry = r => !r.ok }: RetryOptions = {}
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, init);
    if (!shouldRetry(res) || i === retries) return res;
    await new Promise(r => setTimeout(r, baseDelay * 2 ** i));
  }
  throw new Error('Max retries exceeded');
}`,
    },
    alternatives: [
      { label: '⚠️ Simple sequential retry (no backoff)', code: `async function simpleFetch(url, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    try { return await fetch(url); } catch (e) { if (i === retries - 1) throw e; }\n  }\n}`, complexity: 'O(k) — can overwhelm server' },
    ],
  },

  flatten_array: {
    keywords: ['flatten', 'flatten array', 'nested array', 'flat list'],
    complexity: 'O(n)',
    explanation: 'Uses Array.flat(Infinity) which is implemented in C++ in V8. For custom depth, the generator approach avoids creating intermediate arrays.',
    energyScore: 10,
    category: 'Array Operations',
    implementations: {
      javascript: `// ✅ O(n) — Use native flat() for best performance
function flattenArray(arr, depth = Infinity) {
  return arr.flat(depth);
}

// ✅ Generator approach for large arrays (lazy, no intermediate arrays)
function* flatDeep(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) yield* flatDeep(item);
    else yield item;
  }
}
const flattened = [...flatDeep(nestedArr)];`,
      python: `# ✅ O(n) — Flatten using itertools.chain
from itertools import chain

def flatten(lst):
    return list(chain.from_iterable(
        flatten(item) if isinstance(item, list) else [item]
        for item in lst
    ))

# Simple one-level flatten:
flat = list(chain.from_iterable(nested_list))`,
    },
    alternatives: [
      { label: '⚠️ Recursive flatten (stack risk on deep nesting)', code: `function flatten(arr) {\n  return arr.reduce((flat, item) =>\n    Array.isArray(item) ? flat.concat(flatten(item)) : flat.concat(item), []);\n}`, complexity: 'O(n) but O(depth) stack' },
    ],
  },

  group_by: {
    keywords: ['group by', 'groupby', 'group array', 'categorize', 'partition'],
    complexity: 'O(n)',
    explanation: 'Uses Map for O(1) group lookup per element. Much faster than multiple filter() calls (which would be O(k×n) for k groups).',
    energyScore: 12,
    category: 'Array Operations',
    implementations: {
      javascript: `// ✅ O(n) — Object.groupBy (modern) with Map fallback
function groupBy(arr, keyFn) {
  // Native (Chrome 117+, Node 21+)
  if (Object.groupBy) return Object.groupBy(arr, keyFn);

  // Fallback with Map (preserves insertion order)
  return arr.reduce((map, item) => {
    const key = keyFn(item);
    const group = map.get(key) ?? [];
    group.push(item);
    return map.set(key, group), map;
  }, new Map());
}

// Usage:
const byDept = groupBy(employees, e => e.department);`,
      python: `# ✅ O(n) — itertools.groupby (works on sorted data)
from itertools import groupby
from collections import defaultdict

# For unsorted data:
def group_by(items, key_fn):
    groups = defaultdict(list)
    for item in items:
        groups[key_fn(item)].append(item)
    return dict(groups)

# Usage:
by_dept = group_by(employees, lambda e: e['department'])`,
    },
    alternatives: [
      { label: '⚠️ Multiple filter() calls — O(k×n)', code: `const depts = [...new Set(arr.map(x => x.dept))];\nconst grouped = Object.fromEntries(\n  depts.map(d => [d, arr.filter(x => x.dept === d)])\n);`, complexity: 'O(k×n)' },
    ],
  },

  lru_cache: {
    keywords: ['lru', 'least recently used', 'cache eviction', 'bounded cache'],
    complexity: 'O(1) get/put',
    explanation: 'LRU Cache with O(1) get/put using a Map (which preserves insertion order) — the simplest correct LRU in JS without a doubly-linked list.',
    energyScore: 10,
    category: 'Caching',
    implementations: {
      javascript: `// ✅ O(1) get/put — LRU Cache using Map insertion order
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    // Move to end (most recently used)
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    this.cache.delete(key);   // remove if exists
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      this.cache.delete(this.cache.keys().next().value); // evict oldest
    }
  }
}

const cache = new LRUCache(100);`,
      python: `# ✅ O(1) — Python OrderedDict LRU
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
    },
    alternatives: [
      { label: '⚠️ Simple object cache (no eviction)', code: `const cache = {};\nfunction get(key) { return cache[key]; }\nfunction put(key, val) { cache[key] = val; }`, complexity: 'O(1) but unbounded' },
    ],
  },

  deep_clone: {
    keywords: ['deep clone', 'deep copy', 'clone object', 'copy object'],
    complexity: 'O(n)',
    explanation: 'structuredClone is the modern, safe deep clone — handles circular refs, Dates, Maps, Sets. Faster than JSON.parse(JSON.stringify()) and handles more types.',
    energyScore: 8,
    category: 'Data Structures',
    implementations: {
      javascript: `// ✅ O(n) — structuredClone (modern, handles all types)
function deepClone(obj) {
  return structuredClone(obj);  // Chrome 98+, Node 17+
}

// For older environments: recursive clone
function deepCloneLegacy(obj, seen = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (seen.has(obj)) return seen.get(obj);   // circular ref
  const clone = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj));
  seen.set(obj, clone);
  for (const key of Reflect.ownKeys(obj)) {
    clone[key] = deepCloneLegacy(obj[key], seen);
  }
  return clone;
}`,
      python: `# ✅ O(n) — copy.deepcopy handles all Python types
import copy

def deep_clone(obj):
    return copy.deepcopy(obj)`,
    },
    alternatives: [
      { label: '⚠️ JSON round-trip (loses Dates, functions, undefined)', code: `const clone = JSON.parse(JSON.stringify(obj));`, complexity: 'O(n) but lossy' },
    ],
  },

  rate_limiter: {
    keywords: ['rate limit', 'rate limiter', 'throttle api', 'request limit'],
    complexity: 'O(1)',
    explanation: 'Token bucket algorithm. Adds tokens at a fixed rate, consumes one per request. Allows bursts up to bucket capacity while enforcing an average rate.',
    energyScore: 10,
    category: 'API / Async',
    implementations: {
      javascript: `// ✅ O(1) — Token Bucket rate limiter
class RateLimiter {
  constructor({ maxTokens = 10, refillRate = 1, refillInterval = 1000 } = {}) {
    this.tokens = maxTokens;
    this.maxTokens = maxTokens;
    setInterval(() => {
      this.tokens = Math.min(this.maxTokens, this.tokens + refillRate);
    }, refillInterval);
  }

  tryConsume() {
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false;
  }
}

// Usage:
const limiter = new RateLimiter({ maxTokens: 5, refillRate: 1, refillInterval: 1000 });
app.use((req, res, next) => {
  if (!limiter.tryConsume()) return res.status(429).json({ error: 'Rate limit exceeded' });
  next();
});`,
    },
    alternatives: [
      { label: '⚠️ Fixed window (allows double rate at window boundaries)', code: `const counts = {};\nfunction rateLimit(key, limit = 10, windowSec = 1) {\n  const w = Math.floor(Date.now() / (windowSec * 1000));\n  counts[key] = counts[key] || {};\n  counts[key][w] = (counts[key][w] || 0) + 1;\n  return counts[key][w] <= limit;\n}`, complexity: 'O(1)' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MATCH DESCRIPTION TO TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
function matchTemplate(description) {
  const desc = description.toLowerCase();
  for (const [key, tpl] of Object.entries(TEMPLATES)) {
    if (tpl.keywords.some(kw => desc.includes(kw))) return { key, tpl };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC FALLBACK GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function generateGeneric(description, language) {
  const lang = language || 'javascript';
  return {
    code: lang === 'python'
      ? `# ✅ Green-optimized function for: "${description}"\n# Uses: early return, Set for lookups, generator for lazy evaluation\n\ndef efficient_solution(data):\n    """${description}\n    Complexity: O(n) | Space: O(n)\n    \"\"\"\n    if not data:\n        return None  # early return\n    \n    result = set()  # O(1) lookup instead of list search\n    for item in data:\n        # Process efficiently — avoid nested loops\n        processed = process(item)  # replace with your logic\n        result.add(processed)\n    \n    return list(result)\n\n# Remember:\n# - Use generators for large datasets: (x for x in data)\n# - Use Counter/defaultdict for frequency counting\n# - Pre-allocate with list size if known: result = [None] * n`
      : `// ✅ Green-optimized function for: "${description}"\n// Strategy: O(n) single pass, Set/Map for lookups, no nested loops\n\nfunction efficientSolution(data) {\n  if (!data?.length) return null;  // early return\n\n  // Use Map/Set for O(1) lookups instead of array.includes()\n  const seen = new Map();\n  const result = [];\n\n  for (const item of data) {\n    if (seen.has(item.id ?? item)) continue;  // deduplicate\n    seen.set(item.id ?? item, true);\n\n    // Add your transformation logic here\n    const processed = transform(item);        // replace with your logic\n    result.push(processed);\n  }\n\n  return result;\n}\n\n// Energy tips for this pattern:\n// ✓ Single O(n) pass — no nested loops\n// ✓ Map/Set for O(1) lookup\n// ✓ Early returns prevent unnecessary work\n// ✓ No repeated array.includes() calls`,
    complexity: 'O(n)',
    energyScore: 20,
    explanation: `Generated an optimized template for: "${description}". The code follows GreenCode best practices: single-pass O(n) iteration, hash-based lookups, early returns, and no repeated operations.`,
    isGeneric: true,
    alternatives: [],
  };
}

// POST /api/generator
router.post('/', verifyToken, requirePro, checkCredits, async (req, res) => {
  const { description, language = 'javascript' } = req.body;
  if (!description?.trim()) return res.status(400).json({ error: 'Description is required' });

  let responseData;
  let source = 'template';

  // 1. Try Gemini AI first (if key is configured)
  try {
    const aiResult = await generateWithGemini(description, language);
    if (aiResult && aiResult.code) {
      source = 'gemini';
      responseData = {
        description, language,
        code: aiResult.code,
        complexity: aiResult.complexity || 'O(n)',
        energyScore: aiResult.energyScore || 20,
        sustainabilityScore: Math.max(0, 100 - (aiResult.energyScore || 20)),
        explanation: aiResult.explanation || '',
        tips: aiResult.tips || [],
        category: aiResult.category || 'AI Generated',
        alternatives: [],
        isTemplate: false,
        isAI: true,
      };
    }
  } catch (aiErr) {
    console.error('Gemini route error:', aiErr.message);
  }

  // 2. Template library fallback
  if (!responseData) {
    const match = matchTemplate(description);
    if (match) {
      const { tpl } = match;
      const lang = language.toLowerCase();
      const code = tpl.implementations[lang] || tpl.implementations.javascript;
      responseData = {
        description, language, code,
        complexity: tpl.complexity, energyScore: tpl.energyScore,
        sustainabilityScore: Math.max(0, 100 - tpl.energyScore),
        explanation: tpl.explanation, category: tpl.category,
        alternatives: tpl.alternatives || [],
        tips: [],
        isTemplate: true, isAI: false,
      };
    }
  }

  // 3. Generic fallback
  if (!responseData) {
    source = 'generic';
    const generic = generateGeneric(description, language);
    responseData = {
      description, language, ...generic,
      sustainabilityScore: Math.max(0, 100 - generic.energyScore),
      category: 'General', tips: [],
      isTemplate: false, isAI: false,
    };
  }

  // Deduct credit & log
  deductCredit(req.user.id);
  addGeneratorLog({ userId: req.user.id, description, language, source, isTemplate: responseData.isTemplate });

  res.json({ ...responseData, creditUsed: true, source });
});

// GET /api/generator/categories
router.get('/categories', verifyToken, (req, res) => {
  res.json({
    categories: CATEGORIES,
    totalTemplates: Object.keys(TEMPLATES).length,
    geminiEnabled: !!geminiModel,
  });
});

// GET /api/generator/suggestions
router.get('/suggestions', verifyToken, (req, res) => {
  const allKeywords = Object.values(TEMPLATES).flatMap(t => t.keywords);
  const unique = [...new Set(allKeywords)];
  res.json(unique.slice(0, 20));
});

module.exports = router;


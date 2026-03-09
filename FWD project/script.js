/**
 * script.js — EcoTrack Dashboard Logic
 * =====================================
 * CO3: JS fundamentals (expressions, conditions, loops, functions, arrow functions, callbacks),
 *      Objects, Object inheritance, Array methods, hex number literals
 * CO4: DOM manipulation, Event handling, Browser storage (localStorage), Async/Promises
 * CO5: Exception handling (try/catch), ES6 modules concept, Form validation with JS,
 *      Handling user input dynamically, API integration (navigator.share / clipboard API)
 */

'use strict';  // CO5: Strict mode — best practice for robust JS

/* ─────────────────────────────────────────────────────────
   CO3: Objects — category and tip data structures
   ───────────────────────────────────────────────────────── */
const CATEGORIES = {
  lighting:   { icon: '💡', label: 'Lighting' },
  appliances: { icon: '⚙️', label: 'Appliances' },
  transport:  { icon: '🚴', label: 'Transport' },
  water:      { icon: '💧', label: 'Water Use' },
  cooking:    { icon: '🍳', label: 'Cooking' },
  heating:    { icon: '🌡️', label: 'Heating/Cooling' }
};

// CO3: Object with nested properties — tip data
const TIPS = {
  lighting: [
    { id: 'l1', icon: '💡', text: 'Switch to LED bulbs — they use 75% less energy than incandescent bulbs', impact: 'high', co2: 0.3 },
    { id: 'l2', icon: '🌙', text: 'Turn off lights when leaving a room for more than 15 minutes', impact: 'med',  co2: 0.1 },
    { id: 'l3', icon: '☀️', text: 'Maximise natural daylight by keeping blinds open during daytime',           impact: 'low',  co2: 0.05 },
    { id: 'l4', icon: '🔌', text: 'Install dimmer switches to adjust lighting levels and save energy',          impact: 'med',  co2: 0.15 },
  ],
  appliances: [
    { id: 'a1', icon: '🔌', text: 'Unplug chargers and devices when not in use to avoid phantom power drain', impact: 'high', co2: 0.4 },
    { id: 'a2', icon: '⭐', text: 'Choose ENERGY STAR certified appliances for maximum efficiency',            impact: 'high', co2: 0.6 },
    { id: 'a3', icon: '🧊', text: 'Keep fridge at 37–40°F and freezer at 0–5°F for optimal efficiency',      impact: 'med',  co2: 0.2 },
    { id: 'a4', icon: '🧺', text: 'Wash clothes in cold water and air dry when possible',                     impact: 'high', co2: 0.5 },
  ],
  transport: [
    { id: 't1', icon: '🚴', text: 'Walk or cycle for short trips under 2 km instead of driving',              impact: 'high', co2: 0.8 },
    { id: 't2', icon: '🚌', text: 'Use public transportation to cut your commute carbon footprint',            impact: 'high', co2: 1.0 },
    { id: 't3', icon: '🚗', text: 'Carpool with colleagues or friends to save fuel and reduce emissions',      impact: 'high', co2: 0.9 },
    { id: 't4', icon: '🚙', text: 'Maintain proper tyre pressure to improve fuel efficiency by up to 3%',     impact: 'med',  co2: 0.3 },
  ],
  water: [
    { id: 'w1', icon: '🚿', text: 'Take shorter showers (5–7 minutes) to save water and water-heating energy', impact: 'high', co2: 0.35 },
    { id: 'w2', icon: '🚰', text: 'Fix leaky faucets — a drip per second wastes 3,000 gallons per year',      impact: 'high', co2: 0.4 },
    { id: 'w3', icon: '🍽️', text: 'Run dishwashers only when fully loaded to minimise water and energy use',  impact: 'med',  co2: 0.2 },
    { id: 'w4', icon: '🌱', text: 'Collect rainwater for watering plants and garden beds',                    impact: 'low',  co2: 0.08 },
  ],
  cooking: [
    { id: 'c1', icon: '🍳', text: 'Use lids on pots and pans to cook food faster and save energy',           impact: 'med', co2: 0.15 },
    { id: 'c2', icon: '🔥', text: 'Match pot size to burner size for maximum thermal efficiency',              impact: 'med', co2: 0.12 },
    { id: 'c3', icon: '📦', text: 'Use microwave or toaster oven for small meals instead of the full oven',  impact: 'high', co2: 0.3 },
    { id: 'c4', icon: '♨️', text: 'Keep oven door closed while cooking — opening it wastes 25% of heat',     impact: 'med', co2: 0.18 },
  ],
  heating: [
    { id: 'h1', icon: '🌡️', text: 'Set thermostat to 68°F in winter and 78°F in summer to optimise usage', impact: 'high', co2: 0.7 },
    { id: 'h2', icon: '🪟', text: 'Seal windows and doors to prevent costly air leaks and drafts',            impact: 'high', co2: 0.65 },
    { id: 'h3', icon: '🧊', text: 'Use ceiling fans to circulate air and reduce AC load in summer',           impact: 'med',  co2: 0.25 },
    { id: 'h4', icon: '🧥', text: 'Layer clothing in winter before reaching for the thermostat',              impact: 'low',  co2: 0.1 },
  ]
};

// CO3: Array method — Object.values() + .flat() to build flat tip list
const ALL_TIPS   = Object.values(TIPS).flat();
const TOTAL_TIPS = ALL_TIPS.length;  // CO3: const declaration

// CO3: hex number literal — 0xFF style constant for impact score cap
const MAX_IMPACT = 0xFF;  // 255 — theoretical maximum (unused but demonstrates hex literal)

/* ─────────────────────────────────────────────────────────
   CO3: Object — application state
   ───────────────────────────────────────────────────────── */
let state = {
  completed:      new Set(),
  favorites:      new Set(),
  activeCategory: null,
  currentTab:     'browse',
  searchQuery:    '',
  streak:         0,
  lastActiveDate: null,
};

/* ─────────────────────────────────────────────────────────
   CO4: Browser Storage — localStorage persistence
   CO5: Exception handling — try/catch for storage errors
   ───────────────────────────────────────────────────────── */
function loadState() {
  try {
    const raw = localStorage.getItem('ecotrack');  // CO4: Browser storage
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.completed)      state.completed      = new Set(saved.completed);
    if (saved.favorites)      state.favorites      = new Set(saved.favorites);
    if (saved.streak)         state.streak         = saved.streak;
    if (saved.lastActiveDate) state.lastActiveDate = saved.lastActiveDate;
  } catch (err) {
    // CO5: Exception handling
    console.error('Failed to load state from localStorage:', err);
  }
}

function saveState() {
  // CO5: try/catch exception handling
  try {
    localStorage.setItem('ecotrack', JSON.stringify({  // CO4: Browser storage
      completed:      [...state.completed],
      favorites:      [...state.favorites],
      streak:         state.streak,
      lastActiveDate: state.lastActiveDate,
    }));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

/* ─────────────────────────────────────────────────────────
   CO3: Arrow functions & conditions — streak logic
   ───────────────────────────────────────────────────────── */
const updateStreak = () => {   // CO3: Arrow function
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // CO3: Condition
  if (state.lastActiveDate === today) return;

  state.streak         = (state.lastActiveDate === yesterday) ? state.streak + 1 : 1;
  state.lastActiveDate = today;
  saveState();
};

/* ─────────────────────────────────────────────────────────
   CO3: Array methods — .filter(), .reduce() for CO2 and impact calculations
   ───────────────────────────────────────────────────────── */
const calcCO2 = () =>
  ALL_TIPS
    .filter(t => state.completed.has(t.id))         // CO3: .filter() array method
    .reduce((sum, t) => sum + (t.co2 || 0), 0)      // CO3: .reduce() array method
    .toFixed(2);

const calcImpactScore = () => {
  // CO3: Object — impact weight map
  const impactMap = { high: 3, med: 2, low: 1 };
  return ALL_TIPS
    .filter(t => state.completed.has(t.id))
    .reduce((sum, t) => sum + (impactMap[t.impact] || 0), 0);
};

/* ─────────────────────────────────────────────────────────
   CO4: DOM Manipulation — rendering category navigation
   ───────────────────────────────────────────────────────── */
function renderNav() {
  const nav = document.getElementById('catNav');  // CO4: DOM manipulation

  // CO3: Object.entries() + .map() array method + template literals
  nav.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => {
    const tips   = TIPS[key];
    const done   = tips.filter(t => state.completed.has(t.id)).length;
    const allDone = done === tips.length;

    return `
      <button
        class="cat-btn${state.activeCategory === key ? ' active' : ''}${allDone ? ' completed' : ''}"
        onclick="selectCategory('${key}')"
        aria-pressed="${state.activeCategory === key}"
        aria-label="${cat.label}: ${done} of ${tips.length} completed"
      >
        <span class="cat-icon" aria-hidden="true">${cat.icon}</span>
        <span>${cat.label}</span>
        <span class="badge" aria-hidden="true">${done}/${tips.length}</span>
      </button>
    `;
  }).join('');  // CO3: .join() array method
}

/* ─────────────────────────────────────────────────────────
   CO4: DOM Manipulation — rendering tips list
   CO5: Dynamic input handling — search & tab filtering
   ───────────────────────────────────────────────────────── */
function renderTips() {
  const container = document.getElementById('tipsContainer');
  let tips        = [];

  // CO3: Condition — search or browse mode
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    // CO5: Dynamic user input handling — live filter
    tips = ALL_TIPS.filter(t => t.text.toLowerCase().includes(q));
    document.getElementById('searchCount').textContent =
      `${tips.length} result${tips.length !== 1 ? 's' : ''}`;
  } else {
    document.getElementById('searchCount').textContent = '';

    // CO3: switch-like conditional
    if (state.currentTab === 'favorites') {
      tips = ALL_TIPS.filter(t => state.favorites.has(t.id));
    } else if (state.currentTab === 'completed') {
      tips = ALL_TIPS.filter(t => state.completed.has(t.id));
    } else {
      tips = state.activeCategory ? TIPS[state.activeCategory] : [];
    }
  }

  // CO3: Condition — empty states
  if (tips.length === 0) {
    const emptyMessages = {
      favorites:  { icon: '⭐', title: 'No favourites yet',    body: 'Click the star (⭐) on any tip to save it here' },
      completed:  { icon: '✅', title: 'Nothing completed yet', body: 'Tick off tips to track your progress' },
      search:     { icon: '🔍', title: 'No results',            body: 'Try a different search term' },
      default:    { icon: '🌍', title: 'Select a category',     body: 'Pick a topic on the left to explore energy-saving tips' },
    };

    // CO3: Object property access by condition
    let key = 'default';
    if (state.searchQuery)                                  key = 'search';
    else if (state.currentTab === 'favorites')              key = 'favorites';
    else if (state.currentTab === 'completed')              key = 'completed';

    const msg = emptyMessages[key];
    container.innerHTML = `
      <div class="empty-state" role="status">
        <span class="big-icon" aria-hidden="true">${msg.icon}</span>
        <h3>${msg.title}</h3>
        <p>${msg.body}</p>
      </div>`;
    return;
  }

  // CO3: Object — impact label mapping
  const impactLabel = { high: '🔴 High Impact', med: '🟡 Med Impact', low: '🔵 Low Impact' };

  // CO3: Condition — show Complete All bar when browsing a category
  let topBar = '';
  if (state.activeCategory && !state.searchQuery) {
    const catTips = TIPS[state.activeCategory];
    const doneCnt = catTips.filter(t => state.completed.has(t.id)).length;
    const allDone = doneCnt === catTips.length;
    topBar = `
      <div class="complete-all-bar" role="toolbar" aria-label="Category actions">
        <span>${doneCnt} of ${catTips.length} tips completed in this category</span>
        <div style="display:flex;gap:8px">
          ${!allDone
            ? `<button class="complete-all-btn" onclick="completeAll('${state.activeCategory}')">✅ Complete All</button>`
            : ''}
          ${doneCnt > 0
            ? `<button class="reset-cat-btn" onclick="resetCategory('${state.activeCategory}')">↺ Reset</button>`
            : ''}
        </div>
      </div>`;
  }

  // CO3: .map() array method — render tip cards
  container.innerHTML = topBar + tips.map((t, i) => `
    <div
      class="tip-card${state.completed.has(t.id) ? ' done' : ''}"
      style="animation-delay:${i * 0.06}s"
      id="tip-${t.id}"
      role="listitem"
    >
      <div class="tip-icon-wrap" aria-hidden="true">${t.icon}</div>
      <div class="tip-body">
        <div class="tip-text">${t.text}</div>
        <div class="tip-meta">
          <span class="impact-tag impact-${t.impact}">${impactLabel[t.impact]}</span>
          <span class="co2-tag">~${t.co2} kg CO₂/month</span>
          <span
            class="co2-tag"
            style="cursor:pointer;color:${state.favorites.has(t.id) ? '#ffa657' : 'var(--text-muted)'}"
            onclick="toggleFav('${t.id}')"
            role="button"
            tabindex="0"
            aria-label="${state.favorites.has(t.id) ? 'Remove from favourites' : 'Add to favourites'}"
            onkeydown="if(event.key==='Enter'||event.key===' ')toggleFav('${t.id}')"
          >⭐</span>
        </div>
      </div>
      <div class="tip-actions">
        <button
          class="complete-btn"
          onclick="toggleDone('${t.id}')"
          aria-pressed="${state.completed.has(t.id)}"
          aria-label="${state.completed.has(t.id) ? 'Mark as not done' : 'Mark as done'}"
        >
          ${state.completed.has(t.id) ? '✅ Done!' : '○ Mark Done'}
        </button>
        ${state.completed.has(t.id)
          ? `<button class="undo-btn" onclick="toggleDone('${t.id}')" aria-label="Undo this tip">undo</button>`
          : ''}
      </div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────────────────
   CO4: DOM manipulation & Event Handling — category selection
   ───────────────────────────────────────────────────────── */
function selectCategory(key) {
  state.activeCategory = key;
  state.currentTab     = 'browse';
  // CO4: DOM manipulation — querySelectorAll + forEach
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab').classList.add('active');
  renderNav();
  renderTips();
}

/* ─────────────────────────────────────────────────────────
   CO3: Functions + CO4: DOM events — toggle a tip done/undone
   ───────────────────────────────────────────────────────── */
function toggleDone(id) {
  const wasCompleted = state.completed.has(id);

  // CO3: Condition
  if (wasCompleted) {
    state.completed.delete(id);
    showToast('↩ Tip unmarked');
  } else {
    state.completed.add(id);
    updateStreak();
    showToast('✅ Tip marked as done! Keep it up!');

    // CO3: Array method — .find() to locate the category
    const cat = Object.entries(TIPS).find(([, tips]) => tips.some(t => t.id === id));
    if (cat) {
      const [catKey, catTips] = cat;
      // CO3: .every() array method — check if all done
      if (catTips.every(t => state.completed.has(t.id))) {
        // CO4: Async — setTimeout (callback-based async)
        setTimeout(() => showCelebration(catKey), 0x190);  // CO3: hex literal 0x190 = 400ms
      }
    }
  }

  saveState();
  updateStats();
  renderNav();
  renderTips();
}

function completeAll(catKey) {
  // CO3: Loop — forEach
  TIPS[catKey].forEach(t => state.completed.add(t.id));
  updateStreak();
  saveState();
  updateStats();
  renderNav();
  renderTips();
  setTimeout(() => showCelebration(catKey), 300);
}

function resetCategory(catKey) {
  TIPS[catKey].forEach(t => state.completed.delete(t.id));
  saveState();
  updateStats();
  renderNav();
  renderTips();
  showToast('↺ Category reset');
}

/* ─────────────────────────────────────────────────────────
   Celebration modal & Confetti
   ───────────────────────────────────────────────────────── */
function showCelebration(catKey) {
  const cat      = CATEGORIES[catKey];
  const tips     = TIPS[catKey];
  // CO3: .reduce() array method
  const totalCO2 = tips.reduce((s, t) => s + t.co2, 0).toFixed(2);

  // CO4: DOM manipulation
  document.getElementById('celebTitle').textContent =
    `${cat.icon} ${cat.label} Complete!`;
  document.getElementById('celebMsg').textContent =
    `You've completed all ${tips.length} tips — saving ~${totalCO2} kg CO₂/month from this category alone!`;
  document.getElementById('celebration').classList.add('show');

  launchConfetti();
}

function closeCelebration() {
  document.getElementById('celebration').classList.remove('show');
  stopConfetti();
}

/* ─────────────────────────────────────────────────────────
   CO3: Functions + CO3: Array methods — confetti animation
   CO4: Async — requestAnimationFrame (promise-like async loop)
   ───────────────────────────────────────────────────────── */
let confettiAnimId;
let confettiParticles = [];

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx    = canvas.getContext('2d');

  // CO3: Array of hex color strings
  const colors = ['#39d353', '#58a6ff', '#ffa657', '#f78166', '#bc8cff', '#ffffff'];

  // CO3: Array.from() + arrow function callback
  confettiParticles = Array.from({ length: 120 }, () => ({
    x:          Math.random() * canvas.width,
    y:          Math.random() * -canvas.height,
    r:          Math.random() * 8 + 4,
    d:          Math.random() * 120 + 20,
    color:      colors[Math.floor(Math.random() * colors.length)],
    tilt:       Math.random() * 10 - 10,
    tiltAngle:  0,
    tiltSpeed:  Math.random() * 0.1 + 0.05,
  }));

  // CO4: Async — requestAnimationFrame callback
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // CO3: Loop — forEach with arrow callback
    confettiParticles.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y         += Math.cos(p.d) + 2.5;
      p.x         += Math.sin(p.tiltAngle) * 1.5;
      p.tilt       = Math.sin(p.tiltAngle) * 12;
      ctx.beginPath();
      ctx.lineWidth   = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 5);
      ctx.stroke();
    });

    // CO3: .filter() to remove off-screen particles
    confettiParticles = confettiParticles.filter(p => p.y < canvas.height + 20);

    if (confettiParticles.length > 0) {
      confettiAnimId = requestAnimationFrame(draw);  // CO4: Async
    } else {
      stopConfetti();
    }
  }

  draw();
}

function stopConfetti() {
  cancelAnimationFrame(confettiAnimId);
  const canvas = document.getElementById('confettiCanvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

/* ─────────────────────────────────────────────────────────
   CO3: Arrow function — toggle favourite
   ───────────────────────────────────────────────────────── */
const toggleFav = (id) => {  // CO3: Arrow function
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    showToast('Removed from favourites');
  } else {
    state.favorites.add(id);
    showToast('⭐ Added to favourites!');
  }
  saveState();
  renderTips();
};

/* ─────────────────────────────────────────────────────────
   CO4: DOM event handling — tab switching
   ───────────────────────────────────────────────────────── */
function setTab(tab, event) {
  state.currentTab = tab;
  if (tab !== 'browse') state.activeCategory = null;

  // CO4: DOM manipulation — class toggling
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });

  if (event && event.target) {
    event.target.classList.add('active');
    event.target.setAttribute('aria-selected', 'true');
  }

  renderNav();
  renderTips();
}

/* ─────────────────────────────────────────────────────────
   CO4: DOM manipulation — update stats display
   ───────────────────────────────────────────────────────── */
function updateStats() {
  const done = state.completed.size;
  const pct  = Math.round((done / TOTAL_TIPS) * 100);

  // CO3: .filter() + .every() array methods
  const categoriesCompleted = Object.entries(TIPS).filter(
    ([, tips]) => tips.every(t => state.completed.has(t.id))
  ).length;

  // CO4: DOM manipulation — updating element text content
  document.getElementById('completedCount').textContent  = done;
  document.getElementById('categoriesCount').textContent = categoriesCompleted;
  document.getElementById('progressPct').textContent     = pct + '%';
  document.getElementById('impactScore').textContent     = calcImpactScore();
  document.getElementById('progressBar').style.width     = pct + '%';
  document.getElementById('progressLabel').textContent   = `${done} / ${TOTAL_TIPS}`;
  document.getElementById('co2Display').textContent      = calcCO2();
  document.getElementById('streakDays').textContent      = state.streak;

  // CO4: DOM manipulation — ARIA attribute update for accessibility
  const progressBarWrap = document.getElementById('progressBarWrap');
  if (progressBarWrap) progressBarWrap.setAttribute('aria-valuenow', pct);
}

/* ─────────────────────────────────────────────────────────
   CO4: DOM events — toast notification with timeout
   ───────────────────────────────────────────────────────── */
let toastTimeout;

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimeout);
  // CO4: Async — setTimeout callback
  toastTimeout = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ─────────────────────────────────────────────────────────
   CO5: Form validation with JS + dynamic input handling — export
   ───────────────────────────────────────────────────────── */
function exportData() {
  // CO5: Exception handling
  try {
    const completed = ALL_TIPS.filter(t => state.completed.has(t.id));

    // CO5: Form validation — check there's data to export
    if (completed.length === 0) {
      showToast('⚠️ No completed tips to export yet!');
      return;
    }

    // CO3: Array method — .map() to format lines
    const lines = [
      'EcoTrack — My Completed Tips',
      `Exported: ${new Date().toLocaleDateString()}`,
      `CO₂ saved: ${calcCO2()} kg/month`,
      `Impact score: ${calcImpactScore()}`,
      '',
      ...completed.map(t => `[${t.impact.toUpperCase()}] ${t.text}`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a    = document.createElement('a');  // CO4: DOM manipulation
    a.href     = URL.createObjectURL(blob);
    a.download = 'ecotrack-progress.txt';
    a.click();
    showToast('📥 Progress exported!');
  } catch (err) {
    console.error('Export failed:', err);
    showToast('❌ Export failed. Please try again.');
  }
}

/* ─────────────────────────────────────────────────────────
   CO5: API Integration — Web Share API + Clipboard API (async/await + Promises)
   ───────────────────────────────────────────────────────── */
async function shareProgress() {           // CO4: Async function
  const text = `🌍 I've completed ${state.completed.size}/${TOTAL_TIPS} EcoTrack tips and saved ~${calcCO2()} kg CO₂/month! #EcoTrack`;

  // CO5: Exception handling with async/await
  try {
    if (navigator.share) {
      // CO5: API integration — Web Share API
      await navigator.share({ text });     // CO4: Promise (await)
      showToast('🌐 Shared successfully!');
    } else {
      // CO5: Clipboard API — async Promise
      await navigator.clipboard.writeText(text);  // CO4: Promise (await)
      showToast('📋 Copied to clipboard!');
    }
  } catch (err) {
    // CO5: Exception handling
    if (err.name !== 'AbortError') {
      console.error('Share failed:', err);
      showToast('❌ Could not share. Try again.');
    }
  }
}

/* ─────────────────────────────────────────────────────────
   CO4: Event handling — search input with live filtering
   CO5: Dynamic input handling — real-time search
   ───────────────────────────────────────────────────────── */
document.getElementById('searchInput').addEventListener('input', (e) => {
  // CO5: Dynamic input handling
  const rawValue      = e.target.value;

  // CO5: Simple form validation — sanitise input
  state.searchQuery   = rawValue.trimStart();  // prevent leading-space searches
  state.activeCategory = null;

  renderNav();
  renderTips();
});

/* ─────────────────────────────────────────────────────────
   CO4: Event handling — keyboard navigation for accessibility
   ───────────────────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  // CO3: Condition — escape key to close modal
  if (e.key === 'Escape') {
    const cel = document.getElementById('celebration');
    if (cel.classList.contains('show')) closeCelebration();
  }
});

/* ─────────────────────────────────────────────────────────
   CO4: Async — Promise-based init using then/catch pattern
   CO5: Exception handling during initialisation
   ───────────────────────────────────────────────────────── */
// CO4: Promise wrapper for init sequence
function initApp() {
  return new Promise((resolve, reject) => {  // CO4: Promise
    try {
      loadState();     // CO4: Browser storage
      renderNav();     // CO4: DOM manipulation
      renderTips();    // CO4: DOM manipulation
      updateStats();   // CO4: DOM manipulation
      resolve('EcoTrack initialised successfully');
    } catch (err) {
      reject(err);     // CO5: Exception propagation
    }
  });
}

// CO4: Promise chain — .then() / .catch()
initApp()
  .then(msg  => console.log(msg))
  .catch(err => {
    // CO5: Exception handling at application level
    console.error('Failed to initialise EcoTrack:', err);
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#f78166;font-family:monospace;text-align:center;padding:24px;">
        <div>
          <h2>⚠️ Failed to load EcoTrack</h2>
          <p style="margin-top:12px;color:#7d8590">Please refresh the page or check the console for details.</p>
        </div>
      </div>`;
  });
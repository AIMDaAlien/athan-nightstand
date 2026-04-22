if (!window.Adhan) {
  throw new Error('Adhan library failed to load. Check lib/adhan.js is present before app.js.');
}

const {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
} = window.Adhan;

/* ============================================================
   CONFIG
   Copy config.example.js to config.local.js for private local settings.
   ============================================================ */
const DEFAULT_CONFIG = {
  lat: null,
  lng: null,

  method: 'NorthAmerica',        // ISNA — per plan
  madhab: 'Shafi',               // 'Shafi' | 'Hanafi' (Hanafi = later Asr)

  hijriVariant: 'islamic-umalqura', // 'islamic-umalqura' | 'islamic-civil' | 'islamic'
  hijriAdjustmentDays: 0,          // ±1 to align with local moonsighting

  timeFormat: '12h',             // '12h' | '24h'

  // Day/night mode hours (local). Night mode = deeper black, dimmer text.
  dimAfterHour: 23,
  dimUntilHour: 5,

  // Burn-in mitigation
  pixelShiftMs: 60_000,          // reposition by ±2px every minute
  layoutSwapMs: 6 * 60 * 60_000, // swap countdown/list order every 6h

  // Audio
  fajrAudioId: 'athan-fajr',
  standardAudioId: 'athan-standard',
};

const CONFIG = {
  ...DEFAULT_CONFIG,
  ...(window.ATHAN_CONFIG || {}),
};

const VALID_TIME_FORMATS = ['12h', '24h'];
const VALID_HIJRI_VARIANTS = ['islamic-umalqura', 'islamic-civil', 'islamic'];
const effectiveTimeFormat = VALID_TIME_FORMATS.includes(CONFIG.timeFormat)
  ? CONFIG.timeFormat
  : DEFAULT_CONFIG.timeFormat;
const effectiveHijriVariant = VALID_HIJRI_VARIANTS.includes(CONFIG.hijriVariant)
  ? CONFIG.hijriVariant
  : DEFAULT_CONFIG.hijriVariant;

function getConfigError() {
  if (!Number.isFinite(CONFIG.lat) || !Number.isFinite(CONFIG.lng)) {
    return 'Set decimal lat/lng in config.local.js';
  }
  if (!CalculationMethod[CONFIG.method]) {
    return `Unknown calculation method: ${CONFIG.method}`;
  }
  if (!Madhab[CONFIG.madhab]) {
    return `Unknown madhab: ${CONFIG.madhab}`;
  }
  if (!VALID_TIME_FORMATS.includes(CONFIG.timeFormat)) {
    return `Unknown time format: ${CONFIG.timeFormat}`;
  }
  if (!VALID_HIJRI_VARIANTS.includes(CONFIG.hijriVariant)) {
    return `Unknown Hijri variant: ${CONFIG.hijriVariant}`;
  }
  return null;
}

/* ============================================================
   Prayer engine
   ============================================================ */
const configError = getConfigError();

const coords = configError ? null : new Coordinates(CONFIG.lat, CONFIG.lng);
const params = configError ? null : CalculationMethod[CONFIG.method]();
if (params) params.madhab = Madhab[CONFIG.madhab];

const ATHAN_KEYS  = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']; // no athan at sunrise
const HIJRI_MONTH_NAMES = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qadah',
  'Dhu al-Hijjah',
];

const prayerTimesCache = new Map();

function computeFor(date) {
  if (configError) return null;
  return new PrayerTimes(coords, date, params);
}

function prayerTimesFor(date) {
  const key = localDateKey(date);
  if (!prayerTimesCache.has(key)) {
    prayerTimesCache.set(key, computeFor(date));
    if (prayerTimesCache.size > 4) {
      prayerTimesCache.delete(prayerTimesCache.keys().next().value);
    }
  }
  return prayerTimesCache.get(key);
}

function todayTimes(now = new Date()) {
  return prayerTimesFor(now);
}

function tomorrowTimes(now = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  return prayerTimesFor(d);
}

function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Given current Date, return { name, time, isTomorrow } for the next scheduled prayer (fajr..isha).
// Sunrise is shown in the list but is NOT used as the "next prayer" target.
function nextUpcoming(now = new Date()) {
  const t = todayTimes(now);
  const candidates = ATHAN_KEYS.map(k => ({ name: k, time: t[k] }));
  for (const c of candidates) {
    if (c.time.getTime() > now.getTime()) {
      return { ...c, isTomorrow: false };
    }
  }
  // All today's prayers past — next is tomorrow's Fajr
  const tt = tomorrowTimes(now);
  return { name: 'fajr', time: tt.fajr, isTomorrow: true };
}

// Highlight the most recent athan time that has passed today.
// Before today's Fajr, no row is highlighted because the visible Isha row is for tonight.
function currentPeriod(now = new Date()) {
  const t = todayTimes(now);
  let active = null;
  for (const key of ATHAN_KEYS) {
    if (t[key].getTime() <= now.getTime()) active = key;
  }
  return active; // may be null (before today's Fajr)
}

/* ============================================================
   Formatters
   ============================================================ */
const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, effectiveTimeFormat === '24h'
  ? { hour: '2-digit', minute: '2-digit', hour12: false }
  : { hour: 'numeric', minute: '2-digit', hour12: true });

const GREGORIAN_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const HIJRI_FORMATTER = new Intl.DateTimeFormat(
  `en-u-ca-${effectiveHijriVariant}-nu-latn`,
  { day: 'numeric', month: 'numeric', year: 'numeric' },
);

function fmtTimeOfDay(date) {
  return TIME_FORMATTER.format(date);
}

function fmtGregorian(date) {
  return GREGORIAN_FORMATTER.format(date);
}

function fmtHijri(date) {
  const adjusted = new Date(date);
  if (CONFIG.hijriAdjustmentDays) {
    adjusted.setDate(adjusted.getDate() + CONFIG.hijriAdjustmentDays);
  }

  // Android WebView can report Islamic day/year with a Gregorian long month
  // name. Use numeric Islamic month parts and map the month name ourselves.
  const parts = HIJRI_FORMATTER.formatToParts(adjusted);
  const pickNumber = t => parseLocaleNumber(parts.find(p => p.type === t)?.value);
  const day = pickNumber('day');
  const month = pickNumber('month');
  const year = pickNumber('year');
  const monthName = HIJRI_MONTH_NAMES[month - 1] || 'Hijri month';
  if (!Number.isFinite(day) || !Number.isFinite(year)) {
    return 'Hijri date unavailable';
  }
  return `${day} ${monthName} ${year} AH`;
}

function parseLocaleNumber(value) {
  const normalized = String(value ?? '').replace(/[٠-٩۰-۹]/g, d => {
    const code = d.charCodeAt(0);
    return String(code >= 0x06F0 ? code - 0x06F0 : code - 0x0660);
  });
  return Number.parseInt(normalized.replace(/[^\d]/g, ''), 10);
}

function fmtCountdown(ms) {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = n => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ============================================================
   DOM refs
   ============================================================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const el = {
  stage:       $('#stage'),
  greg:        $('#greg-date'),
  hijri:       $('#hijri-date'),
  nextName:    $('#next-name'),
  countdown:   $('#countdown'),
  nextAt:      $('#next-at'),
  rows:        $$('.prayer-row'),
  audioFajr:   $(`#${CONFIG.fajrAudioId}`),
  audioStd:    $(`#${CONFIG.standardAudioId}`),
};

/* ============================================================
   Rendering
   ============================================================ */
let renderedDateKey = null;

function renderPrayerList(now = new Date()) {
  const t = todayTimes(now);
  const activeKey = currentPeriod(now);
  const nowMs = now.getTime();

  for (const row of el.rows) {
    const key = row.dataset.prayer;
    const time = t[key];
    const timeEl = row.querySelector('.prayer-time');
    const formattedTime = fmtTimeOfDay(time);
    if (timeEl.textContent !== formattedTime) {
      timeEl.textContent = formattedTime;
    }
    const isActive = key === activeKey;
    const isPast = time.getTime() <= nowMs && !isActive;
    setAttr(row, 'data-active', isActive ? 'true' : 'false');
    setAttr(row, 'data-past',   isPast   ? 'true' : 'false');
  }
}

function renderDates(now = new Date()) {
  const dateKey = localDateKey(now);
  if (dateKey === renderedDateKey) return;
  renderedDateKey = dateKey;

  const g = fmtGregorian(now);
  if (el.greg.textContent !== g) el.greg.textContent = g;
  const h = fmtHijri(now);
  if (el.hijri.textContent !== h) el.hijri.textContent = h;
}

function renderCountdown(now = new Date()) {
  const next = nextUpcoming(now);
  const remaining = next.time.getTime() - now.getTime();
  el.countdown.textContent = fmtCountdown(remaining);

  const prettyName = capitalize(next.name);
  if (el.nextName.textContent !== prettyName) {
    el.nextName.textContent = prettyName;
  }

  const atStr = next.isTomorrow
    ? `at ${fmtTimeOfDay(next.time)} tomorrow`
    : `at ${fmtTimeOfDay(next.time)}`;
  if (el.nextAt.textContent !== atStr) el.nextAt.textContent = atStr;
}

function setAttr(node, name, value) {
  if (node.getAttribute(name) !== value) node.setAttribute(name, value);
}

/* ============================================================
   Athan trigger — edge detection on prayer-time crossings
   ============================================================ */
let lastTickNameKey = null; // track most-recent passed prayer so we fire once

function maybeFireAthan(now = new Date()) {
  const passedNow = currentPeriod(now); // e.g. 'maghrib'
  if (passedNow && passedNow !== lastTickNameKey) {
    // A new prayer just became current — play athan
    playAthan(passedNow);
  }
  lastTickNameKey = passedNow;
}

function playAthan(key) {
  const audio = key === 'fajr' ? el.audioFajr : el.audioStd;
  if (!audio) return;
  try {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(err => console.warn('Athan play blocked:', err));
    }
  } catch (err) {
    console.warn('Athan play threw:', err);
  }
}

function setupAudioTest() {
  const requested = new URLSearchParams(window.location.search).get('testAudio');
  if (requested !== 'fajr' && requested !== 'standard') return;

  const key = requested === 'fajr' ? 'fajr' : 'dhuhr';
  setTimeout(() => playAthan(key), 1000);
  window.addEventListener('pointerdown', () => {
    setTimeout(() => playAthan(key), 350);
  }, { once: true });
}

/* ============================================================
   Burn-in mitigation: 60s pixel shift + 6h layout swap
   ============================================================ */
const SHIFT_PATTERN = [
  { x:  0, y:  0 },
  { x:  2, y:  0 },
  { x:  2, y:  2 },
  { x:  0, y:  2 },
  { x: -2, y:  2 },
  { x: -2, y:  0 },
  { x: -2, y: -2 },
  { x:  0, y: -2 },
  { x:  2, y: -2 },
];
let shiftIdx = 0;
function applyShift() {
  shiftIdx = (shiftIdx + 1) % SHIFT_PATTERN.length;
  const { x, y } = SHIFT_PATTERN[shiftIdx];
  el.stage.style.transform = `translate(${x}px, ${y}px)`;
}

function swapLayout() {
  const current = document.body.getAttribute('data-layout');
  document.body.setAttribute('data-layout', current === 'a' ? 'b' : 'a');
}

/* ============================================================
   Day / Night mode
   ============================================================ */
function applyMode(now = new Date()) {
  const h = now.getHours();
  const isNight = (h >= CONFIG.dimAfterHour) || (h < CONFIG.dimUntilHour);
  const desired = isNight ? 'night' : 'day';
  if (document.body.getAttribute('data-mode') !== desired) {
    document.body.setAttribute('data-mode', desired);
  }
}

/* ============================================================
   Tick loop
   ============================================================ */
function tick() {
  const now = new Date();
  renderCountdown(now);
  renderPrayerList(now);   // cheap — most cells unchanged
  renderDates(now);        // nearly never changes
  maybeFireAthan(now);
  applyMode(now);
}

/* ============================================================
   Boot
   ============================================================ */
function boot() {
  if (configError) {
    renderConfigError(configError);
    return;
  }

  // Seed lastTickNameKey so we don't fire athan for an already-passed prayer at page load
  lastTickNameKey = currentPeriod(new Date());

  tick();
  setInterval(tick, 1000);
  setInterval(applyShift,  CONFIG.pixelShiftMs);
  setInterval(swapLayout,  CONFIG.layoutSwapMs);

  // Unlock audio on the first user interaction (in case Fully Kiosk's autoplay
  // setting isn't enabled yet — a single tap primes it).
  const unlock = () => {
    [el.audioFajr, el.audioStd].forEach(a => {
      if (!a) return;
      a.muted = true;
      a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = false; })
              .catch(() => {});
    });
    window.removeEventListener('pointerdown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  setupAudioTest();
}

function renderConfigError(message) {
  document.body.setAttribute('data-config-error', 'true');
  el.greg.textContent = 'Configuration required';
  el.hijri.textContent = message;
  el.nextName.textContent = 'Setup';
  el.countdown.textContent = '--:--:--';
  el.nextAt.textContent = 'Copy config.example.js to config.local.js';
  for (const row of el.rows) {
    row.setAttribute('data-active', 'false');
    row.setAttribute('data-past', 'false');
  }
  applyMode(new Date());
}

boot();

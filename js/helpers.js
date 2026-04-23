/* ═══════════════════════════════════════════════════════════
   helpers.js — Nimbus
   Pure utility functions: localStorage wrappers, formatters,
   and the useToast React hook.
   No dependencies beyond vanilla JS and React.
   ═══════════════════════════════════════════════════════════ */

/* ── LOCAL STORAGE ──────────────────────────────────────────
   Safe wrappers — never throw, never crash on quota errors.  */

// Read a JSON value; returns `def` if missing or parse fails
function loadStorage(key, def) {
  try {
    var v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch { return def; }
}

// Write a JSON value; silently swallows quota errors
function saveStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ── FORMATTERS ─────────────────────────────────────────────
   Small pure functions used across multiple components.      */

// Compact number: 1234 → "1.2K"
function fmt(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

// Numeric score → star string: 8.7 → "████☆"
function stars(s) {
  var filled = Math.round(s / 2);
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

/* ── useToast ───────────────────────────────────────────────
   React hook — manages a queue of toast notification objects.
   Usage: const { toasts, showToast } = useToast();
          showToast("Added to Favorites ❤", "success");
   Each toast auto-dismisses after 2.8 s.                     */
function useToast() {
  var [toasts, setToasts] = React.useState([]);

  function showToast(msg, type) {
    if (!type) type = "success";
    var id = Date.now();
    setToasts(function(t) { return [...t, { id, msg, type }]; });
    // Auto-remove after 2800 ms
    setTimeout(function() {
      setToasts(function(t) { return t.filter(function(x) { return x.id !== id; }); });
    }, 2800);
  }

  return { toasts, showToast };
}

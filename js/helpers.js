/* ═══════════════════════════════════════════════════════════
   helpers.js — Nimbus
   Pure utility functions: localStorage wrappers, formatters,
   and the useToast React hook.
   ═══════════════════════════════════════════════════════════ */

function loadStorage(key, def) {
  try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}

function saveStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function fmt(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

function stars(s) {
  var filled = Math.round(s / 2);
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

function useToast() {
  var [toasts, setToasts] = React.useState([]);
  function showToast(msg, type) {
    if (!type) type = "success";
    var id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 2800);
  }
  return { toasts, showToast };
}
// Theme (hell/dunkel) – wird auf allen Seiten geteilt.
const KEY = 'lerncenter-theme';
export function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
}
export function applyTheme(t) {
  document.documentElement.dataset.theme = t;
}
export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem(KEY, next); } catch {}
}

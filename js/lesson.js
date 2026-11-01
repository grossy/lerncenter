// Lektions-Engine: rendert Seiten einer Lektion, Navigation, Fortschritt.
// Wird von Lerncenter (Kinder, /) und Daemon (Erwachsene, /daemon/) geteilt.
import { initTheme, toggleTheme } from './theme.js';

const STRINGS = {
  de: { page: (n, t) => `Seite ${n} von ${t}`, back: '← Zurück', next: 'Weiter →', overview: 'Zur Übersicht', close: 'Zur Übersicht', tryThis: '👉 Probier das', theme: 'Hell / Dunkel' },
  en: { page: (n, t) => `Page ${n} of ${t}`, back: '← Back', next: 'Continue →', overview: 'Back to overview', close: 'Back to overview', tryThis: '👉 Try this', theme: 'Light / Dark' },
};

export function mountLesson(lesson, { brand = 'Lerncenter', tag = null } = {}) {
  initTheme();
  const app = document.getElementById('app');
  const t = STRINGS[lesson.lang] || STRINGS.de;
  document.documentElement.lang = lesson.lang || 'de';
  document.title = `${lesson.title} | ${brand}`;
  const total = lesson.pages.length;
  let idx = parsePage();
  let current = null;

  function parsePage() {
    const m = location.hash.match(/page=(\d+)/);
    const n = m ? parseInt(m[1], 10) - 1 : 0;
    return Math.min(Math.max(n, 0), total - 1);
  }
  function go(i) {
    i = Math.min(Math.max(i, 0), total - 1);
    if (i === idx) { render(); return; }
    location.hash = 'page=' + (i + 1);
  }

  function render() {
    current?.destroy?.();
    const page = lesson.pages[idx];
    const last = idx === total - 1;
    app.innerHTML = `
      <header class="topbar">
        <a class="iconbtn close" href="index.html" aria-label="${t.close}">✕</a>
        <div class="topbar-title">${lesson.title}${tag ? ` <span class="tag grade">${tag}</span>` : ''}</div>
        <button class="iconbtn theme" aria-label="${t.theme}">◐</button>
      </header>
      <main class="lesson">
        <div class="page-meta">${t.page(idx + 1, total)}</div>
        <h1>${page.title}</h1>
        <section class="widget"></section>
        ${page.body ? `<div class="body">${page.body}</div>` : ''}
        ${page.tryThis ? `<aside class="try"><h3>${t.tryThis}</h3>${page.tryThis}</aside>` : ''}
      </main>
      <footer class="bottombar"><div class="inner">
        <button class="btn ghost prev" ${idx === 0 ? 'disabled' : ''}>${t.back}</button>
        <div class="progress"><div class="bar" style="width:${((idx + 1) / total) * 100}%"></div></div>
        ${last
          ? `<a class="btn primary next" href="index.html">${t.overview}</a>`
          : `<button class="btn primary next">${t.next}</button>`}
      </div></footer>`;
    app.querySelector('.theme').onclick = toggleTheme;
    app.querySelector('.prev').onclick = () => go(idx - 1);
    if (!last) app.querySelector('.next').onclick = () => go(idx + 1);
    const host = app.querySelector('.widget');
    current = page.widget ? page.widget(host, { go, idx, total }) : null;
    if (!page.widget) host.remove();
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', () => { idx = parsePage(); render(); });
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input,textarea')) return;
    if (e.key === 'ArrowRight') go(idx + 1);
    if (e.key === 'ArrowLeft') go(idx - 1);
  });
  render();
}

/** Kleine Helfer für Widgets */
export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  if (t.content.childElementCount === 1) return t.content.firstElementChild;
  const wrap = document.createElement('div');
  wrap.append(t.content);
  return wrap;
}

export function confetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#ffb703', '#3fc1e6', '#5b4cff', '#2ec27e', '#ff5a5f', '#ff8fab'];
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.6 + 's';
    p.style.animationDuration = 1.4 + Math.random() * 1.2 + 's';
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3200);
}

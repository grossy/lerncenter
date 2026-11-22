// Stummschaltung für Testläufe. «?mute=1» an irgendeiner Seite schaltet den Ton für diesen Tab aus,
// «?mute=0» wieder ein. Gemerkt wird das nur im Tab (sessionStorage), ein normaler Besuch bleibt laut.
// Solange der Tab stumm ist, zeigt eine Marke in der Kopfzeile den Zustand; ein Klick darauf schaltet den Ton ein.
const KEY = 'lerncenter-mute';
let muted = false;
try {
  const q = new URLSearchParams(location.search).get('mute');
  if (q === '1') sessionStorage.setItem(KEY, '1');
  else if (q === '0') sessionStorage.removeItem(KEY);
  muted = sessionStorage.getItem(KEY) === '1';
} catch {}

/** true, wenn dieser Tab stumm bleiben soll. Jede Tonquelle fragt das vor dem Abspielen ab. */
export const isMuted = () => muted;

function unmute() {
  try { sessionStorage.removeItem(KEY); } catch {}
  const url = new URL(location.href);
  url.searchParams.delete('mute');
  location.replace(url);
}

function showBadge() {
  const en = document.documentElement.lang === 'en';
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'mute-badge';
  b.innerHTML = `🔇<span> ${en ? 'Sound off' : 'Ton aus'}</span>`;
  b.setAttribute('aria-label', en ? 'Sound off' : 'Ton aus');
  b.title = en ? 'Muted for a test run. Click to turn the sound on.' : 'Für einen Testlauf stumm. Klicken, um den Ton einzuschalten.';
  // In der Kopfzeile neben dem Hell/Dunkel-Knopf, damit die Marke nichts Klickbares verdeckt.
  b.style.cssText = 'position:fixed;top:1.2rem;right:3.75rem;z-index:1000;font:600 .75rem/1 system-ui,sans-serif;white-space:nowrap;'
    + 'padding:.45rem .7rem;border-radius:999px;border:1px solid var(--border,#ccc);'
    + 'background:var(--surface,#fff);color:var(--muted,#555);cursor:pointer;opacity:.85';
  b.onclick = unmute;
  const narrow = document.createElement('style'); // auf dem Handy nur das Symbol, sonst liegt die Marke über dem Titel
  narrow.textContent = '@media (max-width: 520px) { .mute-badge span { display: none; } }';
  document.head.appendChild(narrow);
  document.body.appendChild(b);
}

if (muted && typeof document !== 'undefined') {
  if (document.body) showBadge();
  else document.addEventListener('DOMContentLoaded', showBadge, { once: true });
}

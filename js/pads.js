// 8×8-Pad-Grid im isomorphen Fourths-Layout (wie Ableton Push, Launchpad):
// ein Pad nach rechts = +1 Halbton, eine Reihe nach oben = +5 Halbtöne.
import { noteName } from './piano.js';

const SIZE = 8;
const ROW_STEP = 5;

/**
 * createPads({ base, root, scale, onKey, names })
 * base  = MIDI-Note unten links · root = Pitch-Class des Grundtons (0 = C)
 * scale = Pitch-Classes relativ zum Grundton, z. B. [0,2,4,5,7,9,11]
 * Gleiche API wie createPiano: set/unset/clear/badge/flash/key.
 */
export function createPads({ base = 40, root = 0, scale = [0, 2, 4, 5, 7, 9, 11], flat = false, onKey = null, names = 'en', labels = true } = {}) {
  const el = document.createElement('div');
  el.className = 'pads-wrap';
  const grid = document.createElement('div');
  grid.className = 'pads';
  const foot = document.createElement('div');
  foot.className = 'pads-foot';
  foot.innerHTML = `<button class="chip oct-down" title="Oktave tiefer">▼ Okt</button><span class="pads-range"></span><button class="chip oct-up" title="Oktave höher">▲ Okt</button>`;
  el.append(grid, foot);

  const pads = []; // pads[row][col]
  const state = { classes: new Map(), badges: new Map() };
  const inScale = (m) => scale.includes(((m - root) % 12 + 12) % 12);
  const isRoot = (m) => ((m - root) % 12 + 12) % 12 === 0;

  function midiAt(r, c) { return base + r * ROW_STEP + c; }
  function padsFor(m) {
    const out = [];
    for (let r = 0; r < SIZE; r++) {
      const c = m - base - r * ROW_STEP;
      if (c >= 0 && c < SIZE) out.push(pads[r][c]);
    }
    return out;
  }
  function render() {
    grid.innerHTML = '';
    pads.length = 0;
    for (let r = SIZE - 1; r >= 0; r--) {
      pads[r] = [];
      for (let c = 0; c < SIZE; c++) {
        const m = midiAt(r, c);
        const p = document.createElement('div');
        p.className = 'pad' + (isRoot(m) ? ' isroot' : inScale(m) ? ' inkey' : '');
        p.dataset.midi = m;
        if (labels) p.innerHTML = `<span class="lbl">${noteName(m, { names, flat })}<sub>${Math.floor(m / 12) - 1}</sub></span>`;
        p.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          p.classList.add('pressed');
          setTimeout(() => p.classList.remove('pressed'), 180);
          onKey && onKey(m, p);
        });
        grid.appendChild(p);
        pads[r][c] = p;
      }
    }
    foot.querySelector('.pads-range').textContent = `${noteName(base, { names, flat })}${Math.floor(base / 12) - 1} – ${noteName(midiAt(SIZE - 1, SIZE - 1), { names, flat })}${Math.floor(midiAt(SIZE - 1, SIZE - 1) / 12) - 1}`;
    replay();
  }
  function replay() {
    for (const [m, classes] of state.classes) for (const p of padsFor(m)) classes.forEach((c) => p.classList.add(c));
    for (const [m, b] of state.badges) for (const p of padsFor(m)) addBadge(p, b.text, b.cls);
  }
  function addBadge(p, text, cls) {
    let b = p.querySelector('.badge');
    if (!b) { b = document.createElement('span'); p.appendChild(b); }
    b.className = 'badge ' + cls;
    b.textContent = text;
  }
  foot.querySelector('.oct-down').onclick = () => { base = Math.max(24, base - 12); render(); };
  foot.querySelector('.oct-up').onclick = () => { base = Math.min(72, base + 12); render(); };
  render();

  return {
    el,
    key: (m) => padsFor(m)[0],
    set(m, cls) {
      if (!state.classes.has(m)) state.classes.set(m, new Set());
      state.classes.get(m).add(cls);
      for (const p of padsFor(m)) p.classList.add(cls);
    },
    unset(m, cls) {
      state.classes.get(m)?.delete(cls);
      for (const p of padsFor(m)) p.classList.remove(cls);
    },
    clear() {
      state.classes.clear(); state.badges.clear();
      for (const row of pads) for (const p of row) {
        const m = Number(p.dataset.midi);
        p.className = 'pad' + (isRoot(m) ? ' isroot' : inScale(m) ? ' inkey' : '');
        p.querySelector('.badge')?.remove();
      }
    },
    badge(m, text, cls = '') {
      state.badges.set(m, { text, cls });
      for (const p of padsFor(m)) addBadge(p, text, cls);
    },
    flash(m, ms = 250) {
      for (const p of padsFor(m)) { p.classList.add('pressed'); setTimeout(() => p.classList.remove('pressed'), ms); }
    },
  };
}

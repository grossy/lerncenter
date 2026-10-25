// Instrument-Wrapper: Klaviatur oder 8×8-Pads, umschaltbar, mit gleicher API.
// Markierungen und Badges werden beim Umschalten übernommen.
import { createPiano } from './piano.js';
import { createPads } from './pads.js';
import { h } from './lesson.js';

const KEY = 'lerncenter-instrument';

export function createInstrument({ from, to, names = 'en', onKey = null, pads = {} } = {}) {
  let kind = 'piano';
  try { kind = localStorage.getItem(KEY) || 'piano'; } catch {}
  const el = h(`
    <div class="instrument">
      <div class="inst-bar"><span class="inst-hint"></span><div class="segmented inst-toggle">
        <button data-k="piano">🎹 Piano</button><button data-k="pads">▦ Pads</button>
      </div></div>
      <div class="inst-host"></div>
    </div>`);
  const host = el.querySelector('.inst-host');
  const state = { classes: new Map(), badges: new Map() };
  let inst = null;

  function build() {
    inst = kind === 'pads'
      ? createPads({ base: 40, ...pads, names, onKey })
      : createPiano({ from, to, names, onKey });
    host.replaceChildren(inst.el);
    el.querySelectorAll('.inst-toggle button').forEach((b) => b.classList.toggle('selected', b.dataset.k === kind));
    el.querySelector('.inst-hint').textContent = kind === 'pads' ? 'Fourths layout: → +1 semitone, ↑ +5 semitones (a fourth). Same shape, any key.' : '';
    for (const [m, classes] of state.classes) classes.forEach((c) => inst.set(m, c));
    for (const [m, b] of state.badges) inst.badge(m, b.text, b.cls);
  }
  el.querySelectorAll('.inst-toggle button').forEach((b) => (b.onclick = () => {
    if (b.dataset.k === kind) return;
    kind = b.dataset.k;
    try { localStorage.setItem(KEY, kind); } catch {}
    build();
  }));
  build();

  return {
    el,
    get kind() { return kind; },
    key: (m) => inst.key(m),
    set(m, cls) { if (!state.classes.has(m)) state.classes.set(m, new Set()); state.classes.get(m).add(cls); inst.set(m, cls); },
    unset(m, cls) { state.classes.get(m)?.delete(cls); inst.unset(m, cls); },
    clear() { state.classes.clear(); state.badges.clear(); inst.clear(); },
    badge(m, text, cls = '') { state.badges.set(m, { text, cls }); inst.badge(m, text, cls); },
    flash(m, ms) { inst.flash(m, ms); },
  };
}

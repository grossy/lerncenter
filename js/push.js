// Push-Raster für Daemon-Lektionen: 8×8 im Fourths-Layout wie auf dem Gerät im Chromatic-Modus.
// Unten links liegt C, weisse Pads sind die weissen Klaviertasten, jedes C ist farbig.
// Anders als js/pads.js kennt es einzelne Pads, damit ein Griff genau ein Pad meint, nicht alle gleichen Töne.
import { h, confetti } from './lesson.js';
import { playChord } from './audio.js';
import { noteName } from './piano.js';

export const SIZE = 8;
const BASE = 48;
const NATURAL = new Set([0, 2, 4, 5, 7, 9, 11]);
const FINGER_NAME = { P: 'Pinky', R: 'Ring', M: 'Middle', I: 'Pointer', T: 'Thumb' };
const FINGERS = { left: ['P', 'R', 'M', 'I', 'T'], right: ['T', 'I', 'M', 'R', 'P'] };

export const midiAt = (r, c) => BASE + r * 5 + c;
export const isNatural = (m) => NATURAL.has(m % 12);
export const nameOf = (m, flat = false) => noteName(m, { names: 'en', flat });
export const sameCell = (a, b) => a[0] === b[0] && a[1] === b[1];

const INTERVALS = ['same note', 'half step', 'whole step', 'minor third', 'major third', 'fourth', 'tritone', 'fifth', 'minor sixth', 'major sixth', 'minor seventh', 'major seventh', 'octave'];
export function intervalName(semis) {
  const s = Math.abs(semis);
  if (s === 15) return 'minor tenth';
  if (s === 16) return 'major tenth';
  if (s <= 12) return INTERVALS[s];
  return `${s} half steps`;
}

export function createGrid({ onPad = null, flat = false, labels = true } = {}) {
  const el = h(`<div class="pgrid-wrap"><div class="pgrid"></div></div>`);
  const grid = el.querySelector('.pgrid');
  const pads = [];
  for (let r = SIZE - 1; r >= 0; r--) {
    pads[r] = [];
    for (let c = 0; c < SIZE; c++) {
      const m = midiAt(r, c);
      const p = h(`<button type="button" class="ppad ${m % 12 === 0 ? 'is-c' : isNatural(m) ? 'is-white' : 'is-dark'}" data-midi="${m}"><span class="plbl"></span><span class="pfin"></span></button>`);
      const press = (e) => { e.preventDefault(); onPad && onPad(r, c, m, p); };
      p.addEventListener('pointerdown', press);
      p.addEventListener('click', (e) => { if (e.detail === 0) press(e); }); // Tastatur
      grid.appendChild(p);
      pads[r][c] = p;
    }
  }
  const all = () => pads.flat();
  function setFlat(f) { for (const p of all()) p.querySelector('.plbl').textContent = nameOf(+p.dataset.midi, f); }
  function setLabels(on) { grid.classList.toggle('no-labels', !on); }
  setFlat(flat);
  setLabels(labels);
  return {
    el,
    at: (r, c) => pads[r][c],
    mark(cells, cls) { for (const [r, c] of cells) pads[r][c].classList.add(cls); },
    unmark(cls) { for (const p of all()) p.classList.remove(cls); },
    finger(r, c, text) { pads[r][c].querySelector('.pfin').textContent = text; },
    clearFingers() { for (const p of all()) p.querySelector('.pfin').textContent = ''; },
    /** Wie auf dem Gerät: leuchtet ein Ton, leuchten alle Pads mit diesem Ton. */
    light(midi, ms = 260) {
      for (const p of all()) if (+p.dataset.midi === midi) {
        p.classList.add('lit');
        if (ms) setTimeout(() => p.classList.remove('lit'), ms);
      }
    },
    unlight() { for (const p of all()) p.classList.remove('lit'); },
    shake(r, c) { const p = pads[r][c]; p.classList.remove('miss'); void p.offsetWidth; p.classList.add('miss'); },
    setFlat,
    setLabels,
  };
}

function savedHand() { try { return localStorage.getItem('push-hand') || 'left'; } catch { return 'left'; } }
function saveHand(v) { try { localStorage.setItem('push-hand', v); } catch {} }

const hear = (midis, dur = 0.9) => playChord(midis, { dur, type: 'pad', vel: midis.length > 1 ? 0.26 : 0.36 });

/**
 * Übung: zuschauen oder selbst spielen.
 * variants: [{ label, steps, updown, flat, anchor, ms }]
 * steps:    [{ cells: [[r,c],…], fingers, names, text }] · names: Tonnamen für die Anzeige, falls die Schreibweise zählt · fingers: ['T','I'] oder { left: […], right: […] }, fehlt = eine Spalte, ein Finger (ab anchor)
 * speeds:   [{ label, ms }] · hand: false blendet die Handwahl aus
 */
export function drill(host, { variants, speeds = null, hand = true }) {
  let list = variants, vi = 0, mode = 'watch', handSide = hand ? savedHand() : 'left';
  let speed = speeds ? speeds[0].ms : null, seq = [], i = 0, timer = null, need = null, misses = 0;
  const root = h(`<div class="pdrill">
    <div class="pdrill-bar">
      ${hand ? `<div class="segmented hand"><button data-v="left">Left hand</button><button data-v="right">Right hand</button></div>` : ''}
      <div class="segmented mode"><button data-v="watch">Watch</button><button data-v="play">Your turn</button></div>
    </div>
    <div class="pdrill-grid"></div>
    <div class="readout pdrill-read"></div>
    <div class="controls"><button class="btn primary big go"></button><div class="chips vchips"></div><div class="chips schips"></div></div>
  </div>`);
  host.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const grid = createGrid({ onPad });
  $('.pdrill-grid').appendChild(grid.el);
  const read = $('.pdrill-read');

  const fingersOf = (st) => {
    if (Array.isArray(st.fingers)) return st.fingers;
    if (st.fingers) return st.fingers[handSide];
    return st.cells.map(([, c]) => FINGERS[handSide][c - (list[vi].anchor || 0)] || '');
  };
  const midisOf = (st) => st.cells.map(([r, c]) => midiAt(r, c));
  const flat = () => !!list[vi].flat;

  function describe(st) {
    const f = fingersOf(st), names = st.names || midisOf(st).map((m) => nameOf(m, flat()));
    const who = st.cells.map((_, k) => `${names[k]} ${FINGER_NAME[f[k]] ? `(${FINGER_NAME[f[k]].toLowerCase()})` : ''}`).join(' + ');
    return `${who}${st.text ? ` · ${st.text}` : ''}`;
  }
  function paintStep(st) {
    grid.clearFingers();
    grid.unmark('next');
    if (!st) return;
    const f = fingersOf(st);
    st.cells.forEach(([r, c], k) => {
      if (need && !need.has(`${r},${c}`)) return;
      grid.mark([[r, c]], 'next');
      grid.finger(r, c, f[k]);
    });
  }
  function build() {
    stop();
    const v = list[vi];
    seq = v.updown ? [...v.steps, ...[...v.steps].reverse().slice(1)] : v.steps;
    grid.setFlat(flat());
    grid.unmark('path');
    grid.mark(v.steps.flatMap((st) => st.cells), 'path');
    i = 0; misses = 0; need = null;
    root.classList.toggle('is-play', mode === 'play');
    $('.schips').classList.toggle('hidden', mode === 'play' || !speeds);
    if (mode === 'play') startPlay(); else {
      paintStep(seq[0]);
      read.className = 'readout pdrill-read';
      read.textContent = `Start: ${describe(seq[0])}`;
      $('.go').textContent = '▶ Watch it';
    }
  }
  /* ---- zuschauen ---- */
  function stop() {
    clearTimeout(timer); timer = null;
    grid.unlight();
    if (mode === 'watch') $('.go').textContent = '▶ Watch it';
  }
  function tick() {
    if (i >= seq.length) { stop(); i = 0; paintStep(seq[0]); read.textContent = 'Again? Then try it yourself.'; return; }
    const st = seq[i], ms = speed || list[vi].ms || 520;
    need = null;
    paintStep(st);
    const midis = midisOf(st);
    hear(midis, (ms / 1000) * (midis.length > 1 ? 1.6 : 1.2));
    midis.forEach((m) => grid.light(m, ms * 0.8));
    read.className = 'readout pdrill-read';
    read.textContent = `${i + 1} / ${seq.length} · ${describe(st)}`;
    i++;
    timer = setTimeout(tick, ms);
  }
  /* ---- selbst spielen ---- */
  function askNext() {
    const st = seq[i];
    need = new Set(st.cells.map(([r, c]) => `${r},${c}`));
    paintStep(st);
    read.className = 'readout pdrill-read';
    read.textContent = `${i + 1} / ${seq.length} · ${describe(st)}`;
  }
  function startPlay() {
    i = 0; misses = 0;
    $('.go').textContent = '↺ From the top';
    askNext();
  }
  function onPad(r, c, m) {
    if (mode !== 'play' || !need) { hear([m]); grid.light(m); return; }
    const key = `${r},${c}`;
    if (need.has(key)) {
      need.delete(key);
      hear([m]); grid.light(m);
      if (need.size) return paintStep(seq[i]);
      if (seq[i].cells.length > 1) hear(midisOf(seq[i]), 0.8);
      i++;
      if (i < seq.length) return askNext();
      need = null;
      paintStep(null);
      read.className = 'readout pdrill-read ok';
      read.textContent = misses ? `Done, with ${misses} ${misses === 1 ? 'miss' : 'misses'}. Slowly again until it is clean.` : 'Clean run. Now the same on your Push, with your eyes on your hand.';
      if (!misses) confetti();
      return;
    }
    misses++;
    grid.shake(r, c);
    hear([m], 0.3);
    const target = midisOf(seq[i]);
    read.className = 'readout pdrill-read bad';
    read.textContent = target.includes(m)
      ? `Right note, wrong pad. Stay with ${describe(seq[i])} on the marked pad.`
      : `That was ${nameOf(m, flat())}. Next: ${describe(seq[i])}.`;
  }
  /* ---- Bedienung ---- */
  $('.go').onclick = () => {
    if (mode === 'play') return startPlay();
    if (timer) { stop(); return; }
    i = 0;
    $('.go').textContent = '■ Stop';
    tick();
  };
  root.querySelectorAll('.mode button').forEach((b) => (b.onclick = () => { if (mode !== b.dataset.v) { stop(); mode = b.dataset.v; syncSeg(); build(); } }));
  root.querySelectorAll('.hand button').forEach((b) => (b.onclick = () => { if (handSide !== b.dataset.v) { handSide = b.dataset.v; saveHand(handSide); syncSeg(); build(); } }));
  function syncSeg() {
    root.querySelectorAll('.mode button').forEach((b) => b.classList.toggle('selected', b.dataset.v === mode));
    root.querySelectorAll('.hand button').forEach((b) => b.classList.toggle('selected', b.dataset.v === handSide));
  }
  function renderChips() {
    const box = $('.vchips');
    box.innerHTML = '';
    if (list.length > 1) list.forEach((v, k) => {
      const ch = h(`<button class="chip${k === vi ? ' selected' : ''}">${v.label}</button>`);
      ch.onclick = () => { vi = k; renderChips(); build(); };
      box.appendChild(ch);
    });
  }
  if (speeds) speeds.forEach((s) => {
    const ch = h(`<button class="chip${s.ms === speed ? ' selected' : ''}">${s.label}</button>`);
    ch.onclick = () => { speed = s.ms; $('.schips').querySelectorAll('.chip').forEach((x) => x.classList.toggle('selected', x === ch)); };
    $('.schips').appendChild(ch);
  });
  syncSeg();
  renderChips();
  build();
  return {
    destroy: stop,
    /** Neue Griffe, zum Beispiel nach dem Verschieben der Form. */
    setVariants(next) { list = next; vi = 0; renderChips(); build(); },
  };
}

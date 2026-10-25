// Shared, chord-oriented widgets for lessons (English-named notes).
import { playNote, playChord, createLoop } from './audio.js';
import { createPiano, noteName } from './piano.js';
import { h } from './lesson.js';

export const nn = (m, flat = false) => noteName(m, { names: 'en', flat });

// Interval labels relative to a root, per chord quality
export const QUALITY = {
  minor: { 0: 'R', 3: '♭3', 7: '5', 10: '♭7', 2: '9', 5: '11' },
  major: { 0: 'R', 4: '3', 7: '5', 11: '7', 2: '9', 6: '♯11', 9: '13' },
  alt:   { 0: 'R', 4: '3', 7: '5', 10: '♭7', 3: '♯9', 8: '♭13' },
  sus:   { 0: 'R', 5: 'sus4', 7: '5', 10: '♭7', 2: '9', 9: '13' },
};
export const label = (root, midi, quality) => QUALITY[quality][((midi - root) % 12 + 12) % 12] ?? '';

export function showChord(piano, chord, { badges = true } = {}) {
  piano.clear();
  for (const m of chord.keys) {
    piano.set(m, chord.cls);
    if (badges) piano.badge(m, label(chord.root, m, chord.quality), chord.cls);
  }
}

export function strum(chord, { dur = 2.2 } = {}) {
  if (chord.bass) playNote(chord.bass, { dur, vel: 0.5, type: 'bass' });
  playChord(chord.keys, { dur, type: 'pad', vel: 0.28 });
}

export function bassLine(host) {
  const el = h(`<div class="bassline">Bass plays: <span class="note">–</span></div>`);
  host.appendChild(el);
  return (midi, flat = false) => { el.querySelector('.note').textContent = midi ? nn(midi, flat) : '–'; };
}

/* ---------- Arpeggiator ---------- */
export function arpPool(chord) {
  const k = [...chord.keys].sort((a, b) => a - b);
  const pool = new Set([...k, k[1 % k.length] + 12, k[3 % k.length] + 12, k[0] + 24]);
  return [...pool].sort((a, b) => a - b);
}
export const ARP_PATTERN = [0, 2, 4, 6, 1, 3, 5, 7, 2, 4, 6, 1, 3, 5, 0, 4];
export function arpEvents(chord, b, { vel = 0.3, type = 'pluck' } = {}) {
  const pool = arpPool(chord);
  const o = b * 16;
  return ARP_PATTERN.map((idx, s) => ({ step: o + s, notes: [pool[idx % pool.length]], dur: 1.3, vel, type, flash: true }));
}

/* ---------- Generic loop player ----------
 * variants: [{ label, bars: [chordKey...], build: (chord, barIndex) => events }]
 * build defaults to options.build. Events may carry flash:true to light up keys.
 */
export function loopPlayer({ chords, range, bpm = 84, variants, build, showSteps = false, pulseSteps = [] }) {
  return (host) => {
    let variant = 0, loop = null, events = [];
    const piano = createPiano({ ...range, names: 'en', onKey: (m) => playNote(m, { type: 'pad' }) });
    host.appendChild(piano.el);
    const setBass = bassLine(host);
    const barsEl = h(`<div class="bars"></div>`);
    host.appendChild(barsEl);
    let stepsEl = null;
    if (showSteps) {
      stepsEl = h(`<div class="steps"></div>`);
      for (let i = 0; i < 16; i++) stepsEl.appendChild(h(`<div class="step${i % 4 === 0 ? ' beat' : ''}${pulseSteps.includes(i) ? ' hit' : ''}"></div>`));
      host.appendChild(stepsEl);
      const labels = h(`<div class="steplabels"></div>`);
      for (let i = 0; i < 16; i++) labels.appendChild(h(`<div>${i % 4 === 0 ? (i / 4 + 1) : i % 4 === 2 ? '&' : '·'}</div>`));
      host.appendChild(labels);
    }
    const controls = h(`<div class="controls"><button class="btn primary big play">▶ Play loop</button><div class="chips variants"></div></div>`);
    host.appendChild(controls);
    const playBtn = controls.querySelector('.play');
    const chipsEl = controls.querySelector('.variants');
    if (variants.length > 1) {
      variants.forEach((v, i) => {
        const c = h(`<button class="chip${i === 0 ? ' selected' : ''}">${v.label}</button>`);
        c.onclick = () => { variant = i; chipsEl.querySelectorAll('.chip').forEach((x, j) => x.classList.toggle('selected', j === i)); restart(); };
        chipsEl.appendChild(c);
      });
    }

    const current = () => variants[variant];
    function renderBars() {
      barsEl.innerHTML = '';
      barsEl.classList.toggle('eight', current().bars.length > 4);
      current().bars.forEach((key, i) => {
        const c = chords[key];
        barsEl.appendChild(h(`<div class="bar${c.alt ? ' alt' : ''}" data-bar="${i}">${c.short}</div>`));
      });
    }
    function highlight(bar) {
      barsEl.querySelectorAll('.bar').forEach((b, i) => b.classList.toggle('active', i === bar));
      const c = chords[current().bars[bar]];
      if (c) { showChord(piano, c); setBass(c.bass, c.flat); } else { piano.clear(); setBass(null); }
    }
    function makeLoop() {
      const bars = current().bars;
      const builder = current().build || build;
      events = bars.flatMap((key, b) => builder(chords[key], b, current()));
      const flashAt = new Map();
      for (const e of events) if (e.flash) flashAt.set(e.step, [...(flashAt.get(e.step) || []), ...e.notes]);
      let lastBar = -1;
      return createLoop({
        bpm, steps: bars.length * 16, events,
        onStep: (s) => {
          if (s < 0) { highlight(-1); stepsEl?.querySelectorAll('.step').forEach((x) => x.classList.remove('now')); return; }
          const bar = Math.floor(s / 16);
          if (bar !== lastBar) { lastBar = bar; highlight(bar); }
          stepsEl?.querySelectorAll('.step').forEach((x, i) => x.classList.toggle('now', i === s % 16));
          for (const m of flashAt.get(s) || []) piano.flash(m, 160);
        },
      });
    }
    function stop() { loop?.stop(); loop = null; playBtn.textContent = '▶ Play loop'; }
    function start() { loop = makeLoop(); loop.start(); playBtn.textContent = '■ Stop'; }
    function restart() { const was = !!loop; stop(); renderBars(); highlight(0); if (was) start(); }
    playBtn.onclick = () => (loop ? stop() : start());
    renderBars();
    highlight(0);
    return { destroy: stop };
  };
}

/* ---------- Voicing / progression step by step ----------
 * steps: [{ keys, bass, root?, quality?, cls?, text }]
 */
export function voicingWidget(steps, { range, root, quality, cls, flat = false }) {
  return (host) => {
    let i = 0;
    const piano = createPiano({ ...range, names: 'en', onKey: (m) => playNote(m, { type: 'pad' }) });
    host.appendChild(piano.el);
    const setBass = bassLine(host);
    host.appendChild(h(`
      <div class="controls">
        <button class="btn ghost prev">←</button>
        <button class="btn primary big next">Next step →</button>
        <button class="btn hear">▶ Hear it</button>
      </div>
      <div class="readout"></div>`));
    const readout = host.querySelector('.readout');
    const prevBtn = host.querySelector('.prev');
    const nextBtn = host.querySelector('.next');
    function render(play = true) {
      const st = steps[i];
      const c = st.cls ?? cls;
      piano.clear();
      for (const m of st.keys) { piano.set(m, c); piano.badge(m, label(st.root ?? root, m, st.quality ?? quality), c); }
      setBass(st.bass, st.flat ?? flat);
      readout.innerHTML = `<span class="tag ${c}">Step ${i + 1} / ${steps.length}</span> ${st.text}`;
      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === steps.length - 1;
      if (play) hear();
    }
    function hear() {
      const st = steps[i];
      if (st.bass) playNote(st.bass, { dur: 2, vel: 0.5, type: 'bass' });
      playChord(st.keys, { dur: 2, type: 'pad', vel: 0.26 });
    }
    prevBtn.onclick = () => { i = Math.max(0, i - 1); render(); };
    nextBtn.onclick = () => { i = Math.min(steps.length - 1, i + 1); render(); };
    host.querySelector('.hear').onclick = hear;
    render(false);
    return {};
  };
}

/* ---------- Same notes, different root ----------
 * options: [{ label, cls, root, bass, quality, text }]
 */
export function rootSwitchWidget({ notes, range, options }) {
  return (host) => {
    const piano = createPiano({ ...range, names: 'en', onKey: (m) => playNote(m, { type: 'pad' }) });
    host.appendChild(piano.el);
    const setBass = bassLine(host);
    const controls = h(`<div class="controls"></div>`);
    host.appendChild(controls);
    host.appendChild(h(`<div class="readout"></div>`));
    const readout = host.querySelector('.readout');
    function show(o, play = true) {
      piano.clear();
      for (const m of notes) { piano.set(m, o.cls); piano.badge(m, label(o.root, m, o.quality), o.cls); }
      setBass(o.bass, o.flat);
      readout.innerHTML = o.text;
      if (play) { playNote(o.bass, { dur: 2.4, vel: 0.5, type: 'bass' }); playChord(notes, { dur: 2.4, type: 'pad', vel: 0.24 }); }
    }
    options.forEach((o) => {
      const b = h(`<button class="btn big ${o.cls}">${o.label}</button>`);
      b.onclick = () => show(o);
      controls.appendChild(b);
    });
    show(options[0], false);
    return {};
  };
}

/* ---------- Chord cards summary ---------- */
export function chordCardsWidget(chords, roles) {
  return (host) => {
    host.appendChild(h(`<div class="cards"></div>`));
    const grid = host.querySelector('.cards');
    for (const [key, c] of Object.entries(chords)) {
      if (roles && !(key in roles)) continue;
      const card = h(`
        <div class="card">
          <h4>${c.name}</h4>
          <div class="sub">bass ${nn(c.bass, c.flat)} · keys ${c.keys.map((m) => nn(m, c.flat)).join(' ')}</div>
          ${roles ? `<div><span class="tag ${c.cls}">${roles[key]}</span></div>` : ''}
          <button class="btn">▶ Hear it</button>
        </div>`);
      card.querySelector('.btn').onclick = () => strum(c);
      grid.appendChild(card);
    }
    return {};
  };
}

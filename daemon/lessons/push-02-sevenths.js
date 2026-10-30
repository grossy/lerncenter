// Lesson (en, adults): Push 2 – major and minor 7th chords: closed and open shapes, falling progression, two hands
import { h, confetti } from '../../js/lesson.js';
import { playNote, playChord, createLoop } from '../../js/audio.js';
import { createGrid, drill, midiAt, nameOf, SIZE } from '../../js/push.js';

/* ---- shapes, from the thumb on the root. Minor = third and seventh one pad to the left ---- */
const SHAPES = {
  closed: {
    label: 'Closed',
    cells: (r, c, minor) => [[r, c], [r + 1, c - 1 - (minor ? 1 : 0)], [r + 2, c + 1 - (minor ? 1 : 0)]],
    fingers: { left: ['T', 'R', 'I'], right: ['T', 'I', 'R'] },
    parts: 'root, third, seventh',
  },
  open: {
    label: 'Open',
    cells: (r, c, minor) => [[r, c], [r + 2, c + 1 - (minor ? 1 : 0)], [r + 3, c + 1 - (minor ? 1 : 0)]],
    fingers: { left: ['T', 'I', 'M'], right: ['T', 'I', 'M'] },
    parts: 'root, seventh, third',
  },
};
const fits = (cs) => cs.every(([r, c]) => r >= 0 && r < SIZE && c >= 0 && c < SIZE);
const midis = (cs) => cs.map(([r, c]) => midiAt(r, c));
const rootName = (root, minor) => nameOf(root, !(minor && [1, 6, 8].includes(root % 12))); // F♯m7 rather than G♭m7
const chordName = (root, minor) => `${rootName(root, minor)} ${minor ? 'minor' : 'major'} 7`;
const shortName = (root, minor) => `${rootName(root, minor)}${minor ? 'm7' : 'maj7'}`;
/* Spell chord tones by letter, so G major 7 has F♯ and not G♭. */
const LETTERS = 'CDEFGAB', NATURALS = [0, 2, 4, 5, 7, 9, 11], LETTER_STEP = { 0: 0, 3: 2, 4: 2, 7: 4, 10: 6, 11: 6 };
function spell(m, root, minor) {
  const l = (LETTERS.indexOf(rootName(root, minor)[0]) + LETTER_STEP[((m - root) % 12 + 12) % 12]) % 7;
  let d = ((m % 12) - NATURALS[l] + 12) % 12;
  if (d > 6) d -= 12;
  return LETTERS[l] + (d === 1 ? '♯' : d === -1 ? '♭' : '');
}
const step = (kind, r, c, minor, text = '') => {
  const cells = SHAPES[kind].cells(r, c, minor), root = midiAt(r, c);
  return { cells, fingers: SHAPES[kind].fingers, names: midis(cells).map((m) => spell(m, root, minor)), text: `${chordName(root, minor)}${text ? `. ${text}` : ''}` };
};
const HOME = [2, 2]; // C in the lower middle, room in every direction

/* ---- falling progression: minor, major, minor… while the root walks down in half steps ---- */
function falling(kind, count = 12) {
  const out = [];
  let [r, c] = [4, 4]; // a C with room below it
  for (let i = 0; i < count; i++) {
    const minor = i % 2 === 0;
    if (i) c--;
    let jumped = false;
    if (!fits(SHAPES[kind].cells(r, c, minor))) { r--; c += 5; jumped = true; }
    if (r < 0) break;
    const say = jumped ? 'Out of room: one row down, where the green pads show it' : i === 0 ? 'Start here' : minor ? 'Whole hand' : 'Only the thumb moves';
    out.push(step(kind, r, c, minor, say));
  }
  return out;
}

/* ---------- Page 1: what makes it a seventh chord ---------- */
function anatomyWidget(host) {
  const [r, c] = HOME;
  const PARTS = [
    { key: 'root', label: 'Root', cell: [r, c], fin: 'T', on: true },
    { key: 'third', label: '3rd', cell: [r + 1, c - 1], fin: 'R', on: true },
    { key: 'fifth', label: '5th', cell: [r + 1, c + 2], fin: '', on: false },
    { key: 'seventh', label: '7th', cell: [r + 2, c + 1], fin: 'I', on: true },
  ];
  const root = h(`<div>
    <div class="pgrid-host"></div>
    <div class="chips pparts">${PARTS.map((p) => `<button class="chip${p.on ? ' selected' : ''}" data-k="${p.key}">${p.label}</button>`).join('')}</div>
    <div class="readout"></div>
    <div class="controls"><button class="btn primary big go">▶ Hear it</button></div>
  </div>`);
  host.appendChild(root);
  const grid = createGrid({ onPad(_, __, m) { playNote(m, { dur: 0.9, type: 'pad', vel: 0.36 }); } });
  root.querySelector('.pgrid-host').appendChild(grid.el);
  const read = root.querySelector('.readout');
  function sound() { playChord(PARTS.filter((p) => p.on).map((p) => midiAt(...p.cell)), { dur: 1.8, type: 'pad', vel: 0.24 }); }
  function show() {
    grid.unmark('next'); grid.clearFingers();
    for (const p of PARTS) if (p.on) { grid.mark([p.cell], 'next'); grid.finger(p.cell[0], p.cell[1], p.fin); }
    const on = (k) => PARTS.find((p) => p.key === k).on;
    read.textContent = !on('third') || !on('seventh')
      ? 'Without the third or the seventh, most of the colour is gone.'
      : !on('root') ? 'No root: still rich, but it floats.'
        : on('fifth') ? 'With the fifth: fuller, but barely a different colour. It is optional.'
          : 'Root, third and seventh. This is the whole C major 7 you need.';
  }
  root.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => {
    const p = PARTS.find((x) => x.key === b.dataset.k);
    p.on = !p.on;
    b.classList.toggle('selected', p.on);
    show();
    if (PARTS.some((x) => x.on)) sound();
  }));
  root.querySelector('.go').onclick = sound;
  show();
}

/* ---------- Pages 2 and 7: put a shape on any pad ---------- */
function placerWidget({ kinds = ['closed'], qualities = ['major'], recorder = false, start = 'closed' }) {
  return (host) => {
    let kind = start, minor = qualities[0] === 'minor', current = null, loop = null;
    const placed = new Set();
    const taken = [];
    const root = h(`<div class="pplace">
      <div class="pdrill-bar">
        ${kinds.length > 1 ? `<div class="segmented kind">${kinds.map((k) => `<button data-v="${k}">${SHAPES[k].label}</button>`).join('')}</div>` : ''}
        ${qualities.length > 1 ? `<div class="segmented qual"><button data-v="major">Major 7</button><button data-v="minor">Minor 7</button></div>` : ''}
      </div>
      <div class="pgrid-host"></div>
      <div class="readout">Press any pad: your thumb goes there.</div>
      ${recorder ? `<div class="bars recent"></div><div class="controls"><button class="btn primary big go" disabled>▶ Loop my last four</button><button class="btn ghost clear">Clear</button></div>` : ''}
    </div>`);
    host.appendChild(root);
    const read = root.querySelector('.readout');
    const grid = createGrid({ flat: true, onPad(r, c) {
      const cs = SHAPES[kind].cells(r, c, minor);
      if (!fits(cs)) { grid.shake(r, c); read.textContent = 'This shape does not fit here. Try further from the edge.'; return; }
      place(cs, midiAt(r, c), minor, kind);
      if (recorder) remember({ cs, root: midiAt(r, c), minor });
    } });
    root.querySelector('.pgrid-host').appendChild(grid.el);
    function place(cs, rt, min, k) {
      current = cs;
      grid.unmark('next'); grid.clearFingers();
      grid.mark(cs, 'next');
      cs.forEach(([r, c], i) => grid.finger(r, c, SHAPES[k].fingers.left[i]));
      if (!loop) {
        playChord(midis(cs), { dur: 1.8, type: 'pad', vel: 0.24 });
        midis(cs).forEach((m) => grid.light(m, 700));
      }
      placed.add(rt % 12);
      read.textContent = `${chordName(rt, min)}: ${midis(cs).map((m) => spell(m, rt, min)).join(', ')}. Roots tried: ${placed.size} of 12.`;
      if (placed.size === 12 && !recorder) confetti();
    }
    /* ---- the four-chord recorder ---- */
    function renderRecent(active = -1) {
      const box = root.querySelector('.recent');
      box.innerHTML = '';
      for (let i = 0; i < 4; i++) {
        const t = taken[i];
        box.appendChild(h(`<div class="bar${i === active ? ' active' : ''}">${t ? shortName(t.root, t.minor) : '·'}</div>`));
      }
      root.querySelector('.go').disabled = taken.length < 2;
    }
    function remember(chord) {
      taken.push(chord);
      if (taken.length > 4) taken.shift();
      if (loop) { stopLoop(); startLoop(); }
      renderRecent();
    }
    function stopLoop() {
      if (!recorder) return;
      loop?.stop(); loop = null;
      root.querySelector('.go').textContent = '▶ Loop my last four';
      renderRecent();
    }
    function startLoop() {
      const events = taken.map((t, b) => ({ step: b * 16, notes: midis(t.cs), dur: 15, vel: 0.24, type: 'pad' }));
      let bar = -1;
      loop = createLoop({ bpm: 80, steps: taken.length * 16, events, onStep(s) {
        if (s < 0) return;
        const b = Math.floor(s / 16);
        if (b === bar) return;
        bar = b;
        const t = taken[b];
        grid.unmark('next'); grid.clearFingers();
        grid.mark(t.cs, 'next');
        renderRecent(b);
        read.textContent = chordName(t.root, t.minor);
      } });
      loop.start();
      root.querySelector('.go').textContent = '■ Stop';
    }
    if (recorder) {
      root.querySelector('.go').onclick = () => (loop ? stopLoop() : startLoop());
      root.querySelector('.clear').onclick = () => { stopLoop(); taken.length = 0; renderRecent(); };
      renderRecent();
    }
    const sync = (sel, v) => root.querySelectorAll(`${sel} button`).forEach((b) => b.classList.toggle('selected', b.dataset.v === v));
    root.querySelectorAll('.kind button').forEach((b) => (b.onclick = () => { kind = b.dataset.v; sync('.kind', kind); }));
    root.querySelectorAll('.qual button').forEach((b) => (b.onclick = () => { minor = b.dataset.v === 'minor'; sync('.qual', b.dataset.v); }));
    sync('.kind', kind);
    sync('.qual', minor ? 'minor' : 'major');
    return { destroy: stopLoop };
  };
}

/* ---------- Pages 8 and 9: two hands ---------- */
// Left: thumb on the root, fifth with pointer, tenth with middle (major) or ring (minor). Right: the closed shape, high up.
const leftHand = (r, c, minor, full) => {
  const out = [{ cell: [r, c], fin: 'T' }, { cell: [r + 1, c + 2], fin: 'I' }];
  if (full) out.push({ cell: [r + 3, c + (minor ? 0 : 1)], fin: minor ? 'R' : 'M' });
  return out;
};
const BIG = [
  { root: 48, minor: false, left: [0, 0], right: [4, 4] },
  { root: 52, minor: true, left: [0, 4], right: [5, 3] },
  { root: 53, minor: false, left: [1, 0], right: [5, 4] },
  { root: 50, minor: true, left: [0, 2], right: [4, 6] },
];
const ARP = [0, 1, 2, 1, 0, 1, 2, 1]; // right hand, eighth notes
function bigChordsWidget({ full, patterns }) {
  return (host) => {
    let pattern = patterns[0].id, loop = null;
    const root = h(`<div class="ptwo">
      <div class="bars">${BIG.map((b) => `<div class="bar">${shortName(b.root, b.minor)}</div>`).join('')}</div>
      <div class="pgrid-host"></div>
      <div class="readout"></div>
      <div class="controls">
        <button class="btn primary big go">▶ Play both hands</button>
        ${patterns.length > 1 ? `<div class="chips">${patterns.map((p, i) => `<button class="chip${i ? '' : ' selected'}" data-p="${p.id}">${p.label}</button>`).join('')}</div>` : ''}
      </div>
    </div>`);
    host.appendChild(root);
    const read = root.querySelector('.readout');
    const grid = createGrid({ flat: true, onPad(_, __, m) { playNote(m - 12, { dur: 1.4, type: 'pad', vel: 0.32 }); grid.light(m); } });
    root.querySelector('.pgrid-host').appendChild(grid.el);
    function show(b) {
      const ch = BIG[b];
      root.querySelectorAll('.bar').forEach((x, k) => x.classList.toggle('active', k === b));
      grid.unmark('next'); grid.unmark('next2'); grid.clearFingers();
      for (const { cell, fin } of leftHand(ch.left[0], ch.left[1], ch.minor, full)) { grid.mark([cell], 'next'); grid.finger(cell[0], cell[1], fin); }
      const rightCells = SHAPES.closed.cells(ch.right[0], ch.right[1], ch.minor);
      grid.mark(rightCells, 'next2');
      rightCells.forEach(([r, c], i) => grid.finger(r, c, SHAPES.closed.fingers.right[i]));
      read.textContent = `${chordName(ch.root + 24, ch.minor)}. Left: ${full ? '1, 5, 10' : '1, 5'}. Right: 1, 3, 7.`;
    }
    function makeLoop() {
      const events = BIG.flatMap((ch, b) => {
        const o = b * 16;
        const low = leftHand(ch.left[0], ch.left[1], ch.minor, full).map(({ cell }) => midiAt(...cell) - 12);
        const high = midis(SHAPES.closed.cells(ch.right[0], ch.right[1], ch.minor)).map((m) => m - 12);
        const left = { step: o, notes: low, dur: 15.5, vel: 0.26, type: 'pad' };
        if (pattern === 'block') return [left, { step: o, notes: high, dur: 15.5, vel: 0.2, type: 'pad' }];
        return [left, ...ARP.map((n, k) => ({ step: o + k * 2, notes: [high[n]], dur: 3, vel: 0.26, type: 'pluck' }))];
      });
      let bar = -1;
      return createLoop({ bpm: 72, steps: BIG.length * 16, events, onStep(s) {
        if (s < 0) { bar = -1; show(0); return; }
        const b = Math.floor(s / 16);
        if (b !== bar) { bar = b; show(b); }
      } });
    }
    function stop() { loop?.stop(); loop = null; root.querySelector('.go').textContent = '▶ Play both hands'; }
    function start() { loop = makeLoop(); loop.start(); root.querySelector('.go').textContent = '■ Stop'; }
    root.querySelector('.go').onclick = () => (loop ? stop() : start());
    root.querySelectorAll('[data-p]').forEach((c) => (c.onclick = () => {
      pattern = c.dataset.p;
      root.querySelectorAll('[data-p]').forEach((x) => x.classList.toggle('selected', x === c));
      if (loop) { stop(); start(); }
    }));
    show(0);
    return { destroy: stop };
  };
}

/* ---------- Practice list ---------- */
const ROUTINE = [
  ['closed', 'Closed shapes', 'Major and minor, moved around without thinking. Each hand.'],
  ['closedfall', 'Falling, closed', 'Thumb, whole hand, thumb, whole hand. Follow the green pads at the edge.'],
  ['open', 'Open shapes', 'The claw and the straight line, moved around.'],
  ['openfall', 'Falling, open', 'The same progression with the open shapes.'],
  ['mix', 'Mix them', 'Closed and open together, and listen to the top and bottom notes.'],
  ['bass', 'Two hands', 'Left 1, 5 or 1, 5, 10. Right 1, 3, 7.'],
  ['arp', 'Break it up', 'Same notes, one at a time in the right hand.'],
];
function practiceWidget(host) {
  const read = (k) => { try { return localStorage.getItem(`push-02-${k}`) === '1'; } catch { return false; } };
  const write = (k, v) => { try { localStorage.setItem(`push-02-${k}`, v ? '1' : '0'); } catch {} };
  const root = h(`<div class="ppractice">${ROUTINE.map(([k, t, s]) => `<label class="ppractice-row"><input type="checkbox" data-k="${k}"${read(k) ? ' checked' : ''}><span><strong>${t}</strong><br><span class="sub">${s}</span></span></label>`).join('')}
    <div class="controls"><button class="btn ghost reset">Clear for tomorrow</button><span class="note-saved">Saved in this browser</span></div></div>`);
  host.appendChild(root);
  root.querySelectorAll('input').forEach((i) => (i.onchange = () => {
    write(i.dataset.k, i.checked);
    if ([...root.querySelectorAll('input')].every((x) => x.checked)) confetti();
  }));
  root.querySelector('.reset').onclick = () => root.querySelectorAll('input').forEach((i) => { i.checked = false; write(i.dataset.k, false); });
}

const SLOW = [{ label: 'Slow', ms: 1300 }, { label: 'Faster', ms: 800 }];
const flip = (kind) => {
  const [r, c] = HOME;
  return [step(kind, r, c, false, 'Third and seventh up here'), step(kind, r, c, true, 'Third and seventh one pad to the left')];
};

export default {
  id: 'push-02-sevenths',
  lang: 'en',
  title: 'Push 2: Slick 7th Chords',
  subject: 'Music',
  pages: [
    {
      title: 'Three notes are enough',
      widget: anatomyWidget,
      body: `<p>A seventh chord has a root, a third, a fifth and a seventh. But the fifth adds little, and the richness comes from the <strong>third and the seventh</strong>. So most shapes here simply leave it out.</p>
        <p>That leaves three notes, and they fit one hand on Push.</p>
        <p style="color:var(--muted)">Based on JNTHN STEIN's Push tutorial «Slick 7th Chords». Exercises and wording are paraphrased here.</p>`,
      tryThis: `<p>Switch the notes on and off. Add the fifth and listen for how little changes, then remove the third and listen for how much does.</p>`,
    },
    {
      title: 'The major 7 shape',
      widget: placerWidget({}),
      body: `<p>Put your thumb on C, your ring finger on E (one up, one left) and your pointer on B (two up, one right). The thumb tucks under the hand, and you will use this hand position a lot on Push.</p>
        <p>Think of it as a small Tetris block. Push is isomorphic, so the block is a major 7 chord wherever you drop it.</p>
        <p>In the right hand the thumb still tucks under, and the other two fingers swap: pointer on the third, ring on the seventh.</p>`,
      tryThis: `<p>Press pads all over the grid and let the shape land there. On your Push, do the same without naming the chords. Move it around until your hand knows the block.</p>`,
    },
    {
      title: 'Major to minor',
      widget: (host) => drill(host, { speeds: SLOW, variants: [{ label: 'C', flat: true, steps: [...flip('closed'), ...flip('closed')] }] }),
      body: `<p>To turn C major 7 into C minor 7, lower the third and the seventh by a half step. On Push a half step is one pad to the left, so <strong>two fingers slide left and the thumb stays</strong>.</p>
        <p>The result is a new block, and you should learn it the same way.</p>`,
      tryThis: `<p>Watch the two fingers slide. Then play it with <strong>Your turn</strong>, and switch hands. On your Push, go back and forth until you stop looking.</p>`,
    },
    {
      title: 'The falling progression',
      widget: (host) => drill(host, { speeds: SLOW, variants: [{ label: 'Closed', flat: true, steps: falling('closed') }] }),
      body: `<p>Play a minor 7 anywhere, then move only your thumb one pad to the left. The other two notes stay, and you have a major 7 a half step lower. Now move the whole hand so you get a minor 7, and repeat.</p>
        <p>You soon run out of room on the left. This is where the green pads help: Push lights <strong>every pad with the note you are playing</strong>, so the next row down already shows where your hand can go.</p>`,
      tryThis: `<p>Watch the chord before each row jump: a green pad shows where your thumb's note sits one row down, and the next chord starts right beside it. Then try it on your Push and use the lights as your map whenever you are lost.</p>`,
    },
    {
      title: 'Open shapes',
      widget: (host) => drill(host, { speeds: SLOW, variants: [{ label: 'C', flat: true, steps: [...flip('open'), ...flip('open')] }] }),
      body: `<p>Now take the third of C major 7 and lift it an octave. The chord gets wider, and the shape turns into a vertical claw: thumb on the root, pointer on the seventh, middle on the third.</p>
        <p>The major-to-minor move is the same. Slide the two upper fingers one pad left, and they land straight above your thumb. <strong>Minor 7 becomes a straight line</strong>, which is about the most comfortable shape on the grid.</p>`,
      tryThis: `<p>Play both, and compare the sound with the closed shape from before. Same notes, different octave, more air.</p>`,
    },
    {
      title: 'Falling, open',
      widget: (host) => drill(host, { speeds: SLOW, variants: [{ label: 'Open', flat: true, steps: falling('open') }] }),
      body: `<p>The same progression is even easier with the open shapes: thumb, whole hand, thumb, whole hand. When you reach the edge, find the green pad that shows the root on the next row and go there.</p>
        <p>This is only one way to get familiar with the shapes. The real goal is to move them around freely and make your own progressions.</p>`,
      tryThis: `<p>Play it with <strong>Your turn</strong> using each hand. Then on your Push, try starting from a different pad.</p>`,
    },
    {
      title: 'Honey and chocolate',
      widget: placerWidget({ kinds: ['closed', 'open'], qualities: ['major', 'minor'], recorder: true }),
      body: `<p>JNTHN STEIN compares major and minor 7 chords to baking with honey and chocolate: whatever you do with them, it works. So stop thinking about names, and move your shapes around.</p>
        <p>Using only closed or only open shapes makes the chord move as one block. <strong>Mix the two</strong> and the top and bottom notes start weaving around each other, which is much more interesting.</p>`,
      tryThis: `<p>Place four chords without thinking, then loop them. Replace one you dislike by placing another. Then switch between closed and open with the same roots, and listen to the top note.</p>`,
    },
    {
      title: 'Left hand: root and fifth',
      widget: bigChordsWidget({ full: false, patterns: [{ id: 'block', label: 'Block chords' }] }),
      body: `<p>With two hands, the left hand plays like a pianist's bass, and the right hand takes the chord.</p>
        <p>The left-hand shape is a <strong>fifth</strong>: thumb on the root, the fifth one row up and two to the right. It is a big, grounded sound, and like every interval on Push, it is the same everywhere.</p>
        <p>The video shifts the grid down with the Octave button so the bass gets deep, and the right hand plays high. Far apart gives a wide chord, but it leaves fewer places to go, so this page keeps to a few positions.</p>
        <p style="color:var(--muted)">The four chords in this loop are an example for this page. The video moves freely between chords.</p>`,
      tryThis: `<p>Purple marks the left hand and orange the right. Play the loop, then find the same shapes on your Push with the octave down. Also try the right hand close to the left: that sounds great as well.</p>`,
    },
    {
      title: 'Left hand: 1, 5, 10',
      widget: bigChordsWidget({ full: true, patterns: [{ id: 'block', label: 'Block chords' }, { id: 'arp', label: 'Broken right hand' }] }),
      body: `<p>Add the third an octave up, the tenth you know from lesson 1, and the left hand plays a big open triad: <strong>1, 5, 10</strong>. It is a strong shape for pop or folk, especially down low.</p>
        <p>For a minor chord, the tenth drops a half step, and the ring finger takes it instead of the middle.</p>
        <p>The last step: keep the same notes, but let the right hand play them one at a time. Add a sustain pedal if you have one. This is the way into playing melodies over chords.</p>`,
      tryThis: `<p>Switch to <strong>Broken right hand</strong>. Go as slowly as you need on your Push, so the shapes get into your hands.</p>`,
    },
    {
      title: 'What to practise',
      widget: practiceWidget,
      body: `<p>Two shapes, two versions, and you can play major and minor 7 chords on any root. Add the left hand and they get big.</p>
        <p>The video shows most things with the left hand on purpose, because it is usually the weaker one. Practise with both, and give the left hand extra time.</p>`,
      tryThis: `<p>Tick off what you played today, at any speed. Keep it fluid.</p>`,
    },
  ],
};

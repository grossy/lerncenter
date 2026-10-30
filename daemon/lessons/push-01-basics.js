// Lesson (en, adults): Push 1 – layout, one finger per column, major scale, same shape in every key, thirds, tenths, two hands
import { h, confetti } from '../../js/lesson.js';
import { playNote, createLoop } from '../../js/audio.js';
import { createGrid, drill, midiAt, isNatural, nameOf, intervalName, SIZE } from '../../js/push.js';

/* ---- pad paths: left to right, row by row, only the five columns of one hand ---- */
const cells = (test) => {
  const out = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < 5; c++) if (test(midiAt(r, c))) out.push([r, c]);
  return out;
};
const ALL = cells(() => true);
const WHITE = cells(isNatural);
const OCTAVE = WHITE.slice(0, 8);
const one = (list) => list.map((cell) => ({ cells: [cell] }));
const midi = ([r, c]) => midiAt(r, c);
const SPEEDS = [{ label: 'Slow', ms: 560 }, { label: 'Double', ms: 280 }];

/* ---- thirds and tenths in C major ---- */
const THIRDS = OCTAVE.map((low, i) => {
  const high = WHITE[i + 2];
  return { cells: [low, high], text: intervalName(midi(high) - midi(low)) };
});
const STAIRCASE = OCTAVE.flatMap((low, i) => [{ cells: [low] }, { cells: [WHITE[i + 2]], text: i < 7 ? 'up a third, then down a step' : '' }]);
const tenths = (shift = 0) => WHITE.slice(0, 11).map((low, i) => {
  const semis = midi(WHITE[i + 2]) - midi(low) + 12;
  return {
    cells: [[low[0], low[1] + shift], [low[0] + 3, low[1] + shift + (semis === 16 ? 1 : 0)]],
    fingers: ['T', 'I'],
    text: semis === 16 ? 'major tenth: one column to the right' : 'minor tenth: same column',
  };
});

/* ---------- Page 1: right is a half step, up is a fourth ---------- */
function exploreWidget(host) {
  let last = null;
  const grid = createGrid({ onPad(r, c, m) {
    playNote(m, { dur: 0.9, type: 'rhodes', vel: 0.36 });
    grid.light(m);
    if (!last) read.textContent = `${nameOf(m)}. Now press the pad to its right, or the one above it.`;
    else if (r === last[0] && c === last[1]) read.textContent = `${nameOf(m)} again.`;
    else {
      const dr = r - last[0], dc = c - last[1], semis = m - midiAt(last[0], last[1]);
      const moves = [dr && `${Math.abs(dr)} ${dr > 0 ? 'up' : 'down'}`, dc && `${Math.abs(dc)} ${dc > 0 ? 'right' : 'left'}`].filter(Boolean).join(', ');
      read.textContent = semis === 0
        ? `${moves}: ${nameOf(m)} again. The same note lives on several pads.`
        : `${moves}: ${nameOf(midiAt(last[0], last[1]))} to ${nameOf(m)}, ${Math.abs(semis) === 1 ? 'a half step' : Math.abs(semis) > 12 && Math.abs(semis) !== 15 && Math.abs(semis) !== 16 ? intervalName(semis) : `a ${intervalName(semis)} (${Math.abs(semis)} half steps)`} ${semis > 0 ? 'up' : 'down'}.`;
    }
    last = [r, c];
  } });
  host.appendChild(grid.el);
  const read = h(`<div class="readout">Press the bottom-left pad. That is C.</div>`);
  host.appendChild(read);
}

/* ---------- Page 2: find the note ---------- */
function findWidget(host) {
  const NAMES = [0, 2, 4, 5, 7, 9, 11, 1, 3, 6, 8, 10];
  const ROUNDS = 8;
  let order, i, score, wrongThisRound;
  const root = h(`<div class="pfind quiz">
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="pfind-ask"></div>
    <div class="pgrid-host"></div>
    <div class="readout"></div>
    <div class="controls"><button class="chip names">Hide note names</button><button class="btn primary again hidden">Again</button></div>
  </div>`);
  host.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const grid = createGrid({ onPad(r, c, m) {
    playNote(m, { dur: 0.9, type: 'rhodes', vel: 0.36 });
    if (i >= ROUNDS) { grid.light(m); return; }
    if (m % 12 !== order[i]) {
      wrongThisRound = true;
      grid.shake(r, c);
      $('.readout').className = 'readout bad';
      $('.readout').textContent = `That is ${nameOf(m)}.`;
      return;
    }
    if (!wrongThisRound) score++;
    let count = 0;
    for (let rr = 0; rr < SIZE; rr++) for (let cc = 0; cc < SIZE; cc++) if (midiAt(rr, cc) === m) count++;
    grid.light(m, 900);
    $('.readout').className = 'readout ok';
    $('.readout').textContent = count > 1 ? `Yes. This exact ${nameOf(m)} sits on ${count} pads, and they all light up.` : `Yes. This exact ${nameOf(m)} has only this one pad.`;
    i++;
    ask();
  } });
  $('.pgrid-host').appendChild(grid.el);
  function ask() {
    wrongThisRound = false;
    $('.round').textContent = `Round ${Math.min(i + 1, ROUNDS)} of ${ROUNDS}`;
    $('.pts').textContent = `${score} first try`;
    if (i < ROUNDS) { $('.pfind-ask').textContent = `Press any ${nameOf(order[i] + 48)}`; return; }
    $('.pfind-ask').textContent = `${score} of ${ROUNDS} on the first try`;
    $('.again').classList.remove('hidden');
    if (score === ROUNDS) confetti();
  }
  function start() {
    order = [...NAMES].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
    i = 0; score = 0;
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    $('.again').classList.add('hidden');
    ask();
  }
  let hidden = false;
  $('.names').onclick = () => {
    hidden = !hidden;
    grid.setLabels(!hidden);
    $('.names').classList.toggle('selected', hidden);
  };
  $('.again').onclick = start;
  start();
}

/* ---------- Page 5: rock the hand ---------- */
function rockWidget(host) {
  const SEQ = [0, 2, 4, 2];
  const NOTES = [48, 49, 50, 51, 52];
  const LETTERS = ['P', 'R', 'M', 'I', 'T'];
  const SAY = {
    rock: ['C: the whole hand tips toward the pinky.', '', 'D: the hand comes back over the middle finger.', '', 'E: the hand tips toward the thumb.'],
    fingers: ['C: the pinky has to do it all.', '', 'D: only the middle finger moves.', '', 'E: only the thumb moves.'],
  };
  let style = 'rock', timer = null, i = 0;
  const root = h(`<div class="rock">
    <svg viewBox="0 0 260 150" class="rock-svg" role="img" aria-label="A hand above five pads, rocking from side to side">
      ${NOTES.map((m, k) => `<g class="rock-pad" data-k="${k}"><rect x="${10 + k * 50}" y="124" width="40" height="22" rx="4"/><text x="${30 + k * 50}" y="140">${nameOf(m)}</text></g>`).join('')}
      <g class="rock-hand">
        ${LETTERS.map((l, k) => `<g class="rock-finger" data-k="${k}"><rect x="${20 + k * 50}" y="36" width="20" height="76" rx="10"/><text x="${30 + k * 50}" y="104">${l}</text></g>`).join('')}
        <rect class="rock-palm" x="12" y="12" width="236" height="38" rx="16"/>
      </g>
    </svg>
    <div class="readout"></div>
    <div class="controls"><button class="btn primary big go">▶ Play</button><div class="chips"><button class="chip selected" data-s="rock">Rock the hand</button><button class="chip" data-s="fingers">Fingers only</button></div></div>
  </div>`);
  host.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const hand = $('.rock-hand'), read = $('.readout');
  function pose(k) {
    root.querySelectorAll('.rock-pad').forEach((p) => p.classList.toggle('on', +p.dataset.k === k));
    root.querySelectorAll('.rock-finger').forEach((f) => { f.style.transform = ''; });
    hand.style.transform = '';
    if (k == null) return;
    if (style === 'rock') {
      hand.style.transform = k === 0 ? 'rotate(-7deg)' : k === 4 ? 'rotate(7deg)' : 'translateY(5px)';
      if (k === 2) root.querySelector(`.rock-finger[data-k="2"]`).style.transform = 'translateY(7px)';
    } else {
      root.querySelector(`.rock-finger[data-k="${k}"]`).style.transform = 'translateY(12px)';
    }
    read.textContent = SAY[style][k];
  }
  function tick() {
    const k = SEQ[i % SEQ.length];
    pose(k);
    playNote(NOTES[k], { dur: 0.5, type: 'rhodes', vel: 0.36 });
    i++;
    timer = setTimeout(tick, 480);
  }
  function stop() { clearTimeout(timer); timer = null; pose(null); $('.go').textContent = '▶ Play'; }
  $('.go').onclick = () => { if (timer) return stop(); i = 0; $('.go').textContent = '■ Stop'; tick(); };
  root.querySelectorAll('.chip').forEach((c) => (c.onclick = () => {
    style = c.dataset.s;
    root.querySelectorAll('.chip').forEach((x) => x.classList.toggle('selected', x === c));
  }));
  read.textContent = 'Three pads, three fingers: C, D and E.';
  return { destroy: stop };
}

/* ---------- Page 6: same shape anywhere ---------- */
function shapeWidget(host) {
  let dr = 0, dc = 0, d = null;
  const heard = new Set();
  const bar = h(`<div class="pshape">
    <div class="pshape-key"></div>
    <div class="controls">
      <button class="btn" data-m="left" aria-label="One pad left">←</button>
      <button class="btn" data-m="right" aria-label="One pad right">→</button>
      <button class="btn" data-m="down" aria-label="One row down">↓</button>
      <button class="btn" data-m="up" aria-label="One row up">↑</button>
      <button class="btn primary plop">Plop your hand</button>
    </div>
  </div>`);
  host.appendChild(bar);
  const dhost = h(`<div></div>`);
  host.appendChild(dhost);
  const keyName = () => nameOf(midiAt(dr, dc), true);
  function steps() {
    return [{
      label: `${keyName()} major`,
      flat: true,
      anchor: dc,
      updown: true,
      ms: 420,
      steps: one(OCTAVE.map(([r, c]) => [r + dr, c + dc])),
    }];
  }
  function show() {
    heard.add(midiAt(dr, dc) % 12);
    bar.querySelector('.pshape-key').innerHTML = `<strong>${keyName()} major</strong> · pinky on row ${dr + 1}, column ${dc + 1} · keys tried: ${heard.size} of 12`;
    if (heard.size === 12) confetti();
    d.setVariants(steps());
  }
  bar.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => {
    const m = b.dataset.m;
    if (m === 'left') dc = Math.max(0, dc - 1);
    if (m === 'right') dc = Math.min(3, dc + 1);
    if (m === 'down') dr = Math.max(0, dr - 1);
    if (m === 'up') dr = Math.min(5, dr + 1);
    show();
  }));
  bar.querySelector('.plop').onclick = () => { dc = Math.floor(Math.random() * 4); dr = Math.floor(Math.random() * 6); show(); };
  d = drill(dhost, { variants: steps() });
  show();
  return { destroy: () => d.destroy() };
}

/* ---------- Page 9: two hands ---------- */
const DYADS = [
  { name: 'C – E', cells: [[0, 0], [3, 1]] },
  { name: 'A – C', cells: [[1, 4], [4, 4]] },
  { name: 'F – A', cells: [[1, 0], [4, 1]] },
  { name: 'G – B', cells: [[1, 2], [4, 3]] },
];
function twoHandsWidget(host) {
  let pattern = 'whole', pedal = true, loop = null;
  const root = h(`<div class="ptwo">
    <div class="bars">${DYADS.map((d) => `<div class="bar">${d.name}</div>`).join('')}</div>
    <div class="pgrid-host"></div>
    <div class="readout">Start the left hand, then tap white pads to the right of it.</div>
    <div class="controls">
      <button class="btn primary big go">▶ Start left hand</button>
      <div class="chips"><button class="chip selected" data-p="whole">Whole notes</button><button class="chip" data-p="rolled">Rocked</button></div>
      <div class="chips"><button class="chip selected pedal">Sustain pedal</button></div>
    </div>
  </div>`);
  host.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const grid = createGrid({ onPad(r, c, m) {
    playNote(m, { dur: pedal ? 2.6 : 0.3, type: 'rhodes', vel: 0.3 });
    grid.light(m);
    if (!isNatural(m)) {
      $('.readout').className = 'readout bad';
      $('.readout').textContent = `${nameOf(m)} is outside C major. Stay on the white pads for now.`;
    } else {
      $('.readout').className = 'readout';
      $('.readout').textContent = `${nameOf(m)}.`;
    }
  } });
  $('.pgrid-host').appendChild(grid.el);
  function showBar(b) {
    root.querySelectorAll('.bar').forEach((x, k) => x.classList.toggle('active', k === b));
    grid.unmark('next'); grid.clearFingers();
    if (b < 0) return;
    const [low, high] = DYADS[b].cells;
    grid.mark([low, high], 'next');
    grid.finger(low[0], low[1], 'T');
    grid.finger(high[0], high[1], 'I');
  }
  function makeLoop() {
    const events = DYADS.flatMap((d, b) => {
      const [low, high] = d.cells.map(midi), o = b * 16;
      return pattern === 'whole'
        ? [{ step: o, notes: [low, high], dur: 15.5, vel: 0.28, type: 'rhodes' }]
        : [0, 4, 8, 12].map((s, k) => ({ step: o + s, notes: [k % 2 ? high : low], dur: 6, vel: 0.3, type: 'rhodes' }));
    });
    let bar = -1;
    return createLoop({ bpm: 76, steps: 64, events, onStep(s) {
      if (s < 0) { bar = -1; showBar(0); return; }
      const b = Math.floor(s / 16);
      if (b !== bar) { bar = b; showBar(b); }
    } });
  }
  function stop() { loop?.stop(); loop = null; $('.go').textContent = '▶ Start left hand'; }
  function start() { loop = makeLoop(); loop.start(); $('.go').textContent = '■ Stop'; }
  $('.go').onclick = () => (loop ? stop() : start());
  root.querySelectorAll('[data-p]').forEach((c) => (c.onclick = () => {
    pattern = c.dataset.p;
    root.querySelectorAll('[data-p]').forEach((x) => x.classList.toggle('selected', x === c));
    if (loop) { stop(); start(); }
  }));
  $('.pedal').onclick = () => { pedal = !pedal; $('.pedal').classList.toggle('selected', pedal); };
  showBar(0);
  return { destroy: stop };
}

/* ---------- Page 10: practice list ---------- */
const ROUTINE = [
  ['chromatic', 'Chromatic crawl', 'Up and down, each hand. Slowly first, then double.'],
  ['scale', 'C major', 'Follow the white pads, one finger per column.'],
  ['rock', 'Rock', 'C, D, E on one row, with the wrist rather than the fingertips.'],
  ['plop', 'Plop', 'Put your hand down anywhere and play the same shape.'],
  ['thirds', 'Thirds', 'Together, then staircase.'],
  ['tenths', 'Tenths', 'Thumb and pointer, up and down. Then in D♭.'],
  ['hands', 'Two hands', 'Tenths on the left, one or two notes on the right.'],
];
function practiceWidget(host) {
  const read = (k) => { try { return localStorage.getItem(`push-01-${k}`) === '1'; } catch { return false; } };
  const write = (k, v) => { try { localStorage.setItem(`push-01-${k}`, v ? '1' : '0'); } catch {} };
  const root = h(`<div class="ppractice">${ROUTINE.map(([k, t, s]) => `<label class="ppractice-row"><input type="checkbox" data-k="${k}"${read(k) ? ' checked' : ''}><span><strong>${t}</strong><br><span class="sub">${s}</span></span></label>`).join('')}
    <div class="controls"><button class="btn ghost reset">Clear for tomorrow</button><span class="note-saved">Saved in this browser</span></div></div>`);
  host.appendChild(root);
  root.querySelectorAll('input').forEach((i) => (i.onchange = () => {
    write(i.dataset.k, i.checked);
    if ([...root.querySelectorAll('input')].every((x) => x.checked)) confetti();
  }));
  root.querySelector('.reset').onclick = () => root.querySelectorAll('input').forEach((i) => { i.checked = false; write(i.dataset.k, false); });
}

export default {
  id: 'push-01-basics',
  lang: 'en',
  title: 'Push 1: Just the Basics',
  subject: 'Music',
  pages: [
    {
      title: 'The grid',
      widget: exploreWidget,
      body: `<p>Push has 64 pads in an 8 by 8 grid, and two rules explain all of them. <strong>One pad to the right is a half step. One pad up is a fourth.</strong>
        The bottom row starts C, C♯, D, D♯, E, F, F♯, G, and every row works the same way.</p>
        <p>This series stays in <strong>chromatic mode</strong> with the fourths layout and C as the root, so every note is always available and you choose which ones to play.</p>
        <p>You do not need the theory words yet. Your hands and ears will pick them up.</p>
        <p style="color:var(--muted)">Based on JNTHN STEIN's Push tutorial «Just the Basics». Exercises and wording are paraphrased here.</p>`,
      tryThis: `<p>Press C, then the pad to its right, then the pad above it. Then press a pad in the right half, followed by the one a row up and five to the left: you get the same note.</p>`,
    },
    {
      title: 'Reading the pads',
      widget: findWidget,
      body: `<p>The colours are a piano in disguise: <strong>white pads are the white keys</strong>, dim pads are the black keys, and <strong>every C is coloured</strong>.</p>
        <p>The rows also work like strings and the pads like frets. A bass is tuned in fourths, so its shapes carry over directly. A guitar matches too, apart from the one pair of strings that is a third apart.</p>`,
      tryThis: `<p>Play a few rounds, then hide the note names. The white pads and the coloured Cs are all you get on your Push.</p>`,
    },
    {
      title: 'One finger, one column',
      widget: (host) => drill(host, {
        speeds: SPEEDS,
        variants: [
          { label: 'Two rows', steps: one(ALL.slice(0, 10)), updown: true },
          { label: 'All eight rows', steps: one(ALL), updown: true },
        ],
      }),
      body: `<p>Curve your fingers like a cat's paw and put each one on its own pad. <strong>Each finger owns one column.</strong> In the left hand, pinky has column 1, ring 2, middle 3, pointer 4, thumb 5. In the right hand it flips: thumb, pointer, middle, ring, pinky.</p>
        <p>Your hand does not move sideways. It only crawls up. Five columns add up to a fourth, so each row picks up exactly where the last one stopped, and you get one long chromatic scale.</p>`,
      tryThis: `<p>Watch it, then press <strong>Your turn</strong>. On your Push, do it slowly with each hand. Clean matters more than fast.</p>`,
    },
    {
      title: 'The major scale',
      widget: (host) => drill(host, {
        speeds: SPEEDS,
        variants: [
          { label: 'One octave', steps: one(OCTAVE), updown: true },
          { label: 'All the way up', steps: one(WHITE), updown: true },
        ],
      }),
      body: `<p>C major is simply the white pads. The column rule still holds, so your hand stays put and crawls upward.</p>
        <p>Playing with one hand leaves more room for fast melodies. Two hands are for chords, and those come later.</p>`,
      tryThis: `<p>Say the finger names aloud once. Notice the first two rows are the same pattern twice: pinky, middle, thumb.</p>`,
    },
    {
      title: 'Rock, don\'t press',
      widget: rockWidget,
      body: `<p>Your arm is heavy and your fingertips are weak. So let the wrist and hand roll from pad to pad, and let the arm's weight do the work.</p>
        <p>You can feel this on three pads: C, D and E on the bottom row. The fingers barely move, because the hand tilts onto each one.</p>
        <p>For one-handed playing, keep Push a little to the outside of your body, or turn it, so the wrist stays straight and loose.</p>`,
      tryThis: `<p>Compare the two buttons, then rock C, D, E on your Push. It may feel odd at first. The goal is to spend less effort.</p>`,
    },
    {
      title: 'The same shape in every key',
      widget: shapeWidget,
      body: `<p>Push is <strong>isomorphic</strong>: a shape means the same thing wherever you put it. Move your C major hand one pad to the right and it plays D♭ major, one more and it is D major.</p>
        <p>The white pads stop helping as soon as you leave C, so trust the shape and not the colours. Learn it really well in C first.</p>`,
      tryThis: `<p>Press <strong>Plop your hand</strong> and play from wherever your pinky lands. Then do it on your Push without looking first. Try to reach all 12 keys.</p>`,
    },
    {
      title: 'Thirds',
      widget: (host) => drill(host, {
        speeds: [{ label: 'Slow', ms: 800 }, { label: 'Double', ms: 400 }],
        variants: [
          { label: 'Together', steps: THIRDS, updown: true },
          { label: 'Staircase', steps: STAIRCASE, updown: true, ms: 420 },
        ],
      }),
      body: `<p>Now play every second white pad at once: C with E, D with F, E with G. These are the <strong>diatonic thirds</strong> of C major, still with one finger per column.</p>
        <p>The other way to practise is as a <strong>staircase</strong>: up a third, down a step, up a third, down a step.</p>
        <p>The shapes differ because some thirds are major and some are minor. The readout names each one, so you can start hearing the difference.</p>`,
      tryThis: `<p>Watch the readout while you listen. In <strong>Your turn</strong>, click both pads of each pair. On your Push, press them together. This takes time, so go slowly.</p>`,
    },
    {
      title: 'Tenths',
      widget: (host) => drill(host, {
        hand: false,
        variants: [
          { label: 'C major', steps: tenths(0), updown: true, ms: 900 },
          { label: 'D♭ major', steps: tenths(1), updown: true, flat: true, ms: 900 },
        ],
      }),
      body: `<p>Take a third and lift its top note up an octave: that is a <strong>tenth</strong>. It sounds wide and open, and it is easy to reach, because the top note sits three rows up.</p>
        <p>Here the column rule goes. As JNTHN STEIN puts it, «Oops, I lied». Thumb takes the low note and pointer the high one, or middle if that is comfier, and the hand travels.</p>
        <p>The grid also gives you a shortcut: <strong>straight up is a minor tenth, and up plus one to the right is a major tenth</strong>.</p>`,
      tryThis: `<p>Listen for that sideways step: it is the only difference between the two shapes. Then switch to D♭ major. The shape just slides over.</p>`,
    },
    {
      title: 'Two hands',
      widget: twoHandsWidget,
      body: `<p>Now put them together. The left hand holds a tenth for four beats, and the right hand sprinkles single notes from the scale. Keep it this simple for now.</p>
        <p>While you stay on the white pads, nothing is outside the key. Some notes still lean more than others: F against C and E rubs a little, which can sound lovely if you move on from it.</p>
        <p>A <strong>sustain pedal</strong> plugged into Push lets notes ring as they do on a piano, without holding the pad down. A small one travels well.</p>
        <p style="color:var(--muted)">The order of these four tenths is an example for this page. Any tenths in C major work.</p>`,
      tryThis: `<p>Tap one single note and repeat it over all four bars, because it changes colour with each tenth. Then use two notes. Then turn the pedal off to hear what it was doing, and try <strong>Rocked</strong>, where the wrist alternates between thumb and pointer.</p>`,
    },
    {
      title: 'What to practise',
      widget: practiceWidget,
      body: `<p>Everything here comes down to one idea: learn a shape in C with your hands, then take it anywhere.</p>
        <p>Do these on your Push, in this order, as far as you enjoy. It's meant to be fun and to feel good, and that's also what keeps you practising.</p>`,
      tryThis: `<p>Tick off what you played today. Keep at C major until the shape feels automatic before you move to other keys.</p>`,
    },
  ],
};

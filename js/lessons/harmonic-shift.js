// Lesson (en, adults): One vibe, two colours – A minor 11 → F major 9 ♯11 → deceptive cadence
import { playNote, playChord } from '../audio.js';
import { createInstrument } from '../instrument.js';
import { h } from '../lesson.js';
import { nn, label, showChord, strum, bassLine, loopPlayer as sharedLoopPlayer, voicingWidget as sharedVoicing, chordCardsWidget } from '../widgets.js';

const RANGE = { from: 48, to: 76, pads: { root: 9, scale: [0, 2, 3, 5, 7, 8, 10] } }; // C3 – E5 · Pads: A minor
const BPM = 84;

// Final voicings. bass = played by the bass, keys = played on the keyboard, pulse = the repeated note
const CHORDS = {
  am11:  { name: 'A minor 11', short: 'Am11', root: 57, quality: 'minor', bass: 45, keys: [59, 60, 62, 64, 67], pulse: 59, cls: 'minor' },
  fmaj9: { name: 'F major 9 ♯11', short: 'Fmaj9♯11', root: 53, quality: 'major', bass: 41, keys: [55, 57, 59, 60, 64], pulse: 59, cls: 'major', alt: true },
  e7alt: { name: 'E7 ♯9 ♭13', short: 'E7♯9♭13', root: 52, quality: 'alt', bass: 40, keys: [56, 59, 60, 62, 67], pulse: 59, cls: 'root', alt: true },
};
const PULSE_STEPS = [0, 3, 6, 10, 13]; // beat 1, 4th 16th of 1, "and" of 2, "and" of 3, 16th after 4

/** Events for one bar of a chord at bar index b (16 steps per bar) */
function barEvents(chord, b, { pulse = true } = {}) {
  const o = b * 16;
  const ev = [
    { step: o, notes: [chord.bass], dur: 15.5, vel: 0.5, type: 'bass' },
    { step: o, notes: chord.keys, dur: 15.5, vel: 0.22, type: 'pad' },
  ];
  if (pulse) for (const s of PULSE_STEPS) ev.push({ step: o + s, notes: [chord.pulse], dur: 1.6, vel: 0.3, type: 'synth' });
  return ev;
}

const loopPlayer = ({ variants, pulse = true, showSteps = false }) =>
  sharedLoopPlayer({ chords: CHORDS, range: RANGE, bpm: BPM, variants, showSteps, pulseSteps: pulse ? PULSE_STEPS : [], build: (c, b) => barEvents(c, b, { pulse }) });
const voicingWidget = (steps, opts) => sharedVoicing(steps, { ...opts, range: RANGE });

/* ---------- Page 2: stacking thirds ---------- */
function stackWidget(host) {
  const timers = [];
  const notes = [57, 60, 64, 67, 71, 74];
  const piano = createInstrument({ ...RANGE, names: 'en', onKey: (m) => playNote(m) });
  host.appendChild(piano.el);
  host.appendChild(h(`<div class="controls"><button class="btn primary big go">▶ Stack thirds from A</button></div><div class="readout"></div>`));
  const readout = host.querySelector('.readout');
  host.querySelector('.go').onclick = () => {
    timers.forEach(clearTimeout); timers.length = 0;
    piano.clear(); readout.textContent = '';
    notes.forEach((m, i) => timers.push(setTimeout(() => {
      piano.set(m, i === 0 ? 'root' : 'minor');
      piano.badge(m, label(57, m, 'minor'), i === 0 ? 'root' : 'minor');
      playNote(m, { dur: 0.5 });
      readout.textContent = `${nn(m)} – ${['root', 'minor third', 'fifth', 'minor seventh', 'ninth', 'eleventh'][i]}`;
    }, i * 520)));
    timers.push(setTimeout(() => { readout.innerHTML = `A C E G B D = <strong>A minor 11</strong>`; playChord(notes, { dur: 2, type: 'pad', vel: 0.25 }); }, notes.length * 520 + 200));
  };
  return { destroy: () => timers.forEach(clearTimeout) };
}

const AM11_STEPS = [
  { keys: [57, 60, 64, 67, 71, 74], bass: null, text: 'A minor 11 stacked in thirds: A C E G B D.' },
  { keys: [57, 60, 62, 64, 67, 71], bass: null, text: 'Move the 11th (D) down an octave. It now sits between the minor third and the fifth: C D E.' },
  { keys: [57, 59, 60, 62, 64, 67], bass: null, text: 'Move the 9th (B) down an octave too. Now there is a four-note cluster: B C D E.' },
  { keys: [59, 60, 62, 64, 67], bass: 45, text: 'Remove the root A from the keyboard and let the bass play it. This is our Am11 voicing.' },
];
const FMAJ_STEPS = [
  { keys: [53, 57, 60, 64, 67, 71, 74], bass: null, text: 'F major 13 ♯11 stacked from F: F A C E G B D – all seven notes of the scale.' },
  { keys: [57, 60, 64, 67, 71, 74], bass: 41, text: 'Let the bass take the root F, like we did with A.' },
  { keys: [57, 60, 64, 67, 71], bass: 41, text: 'Seven notes is too much. Drop the 13th (D). The chord is now F major 9 ♯11.' },
  { keys: [57, 59, 60, 64, 67], bass: 41, text: 'Move the ♯11 (B) down an octave, so it sits right under C.' },
  { keys: [55, 57, 59, 60, 64], bass: 41, text: 'Move the 9th (G) down an octave too. B keeps its place, so it can keep its rhythm.' },
];

/* ---------- Page 5: same notes, new root ---------- */
function rootSwitchWidget(host) {
  const notes = [57, 60, 64, 67, 71, 74]; // A C E G B D
  const piano = createInstrument({ ...RANGE, names: 'en', onKey: (m) => playNote(m, { type: 'pad' }) });
  host.appendChild(piano.el);
  const setBass = bassLine(host);
  host.appendChild(h(`
    <div class="controls">
      <button class="btn big minor" data-root="a">Root A → A minor 11</button>
      <button class="btn big major" data-root="f">Root F → F major 13 ♯11</button>
    </div>
    <div class="readout"></div>`));
  const readout = host.querySelector('.readout');
  function show(which, play = true) {
    const root = which === 'a' ? 57 : 53, bass = which === 'a' ? 45 : 41, quality = which === 'a' ? 'minor' : 'major', cls = which === 'a' ? 'minor' : 'major';
    piano.clear();
    for (const m of notes) { piano.set(m, cls); piano.badge(m, label(root, m, quality), cls); }
    setBass(bass);
    readout.innerHTML = which === 'a'
      ? 'Over A, these six notes read as <strong>root, ♭3, 5, ♭7, 9, 11</strong>: A minor 11.'
      : 'Over F, the very same notes read as <strong>3, 5, 7, 9, ♯11, 13</strong>: F major 13 ♯11.';
    if (play) { playNote(bass, { dur: 2.4, vel: 0.5, type: 'bass' }); playChord(notes, { dur: 2.4, type: 'pad', vel: 0.24 }); }
  }
  host.querySelectorAll('[data-root]').forEach((b) => (b.onclick = () => show(b.dataset.root)));
  show('a', false);
  return {};
}

/* ---------- Page 8: cadence ---------- */
function cadenceWidget(host) {
  const timers = [];
  const piano = createInstrument({ ...RANGE, names: 'en', onKey: (m) => playNote(m, { type: 'pad' }) });
  host.appendChild(piano.el);
  const setBass = bassLine(host);
  host.appendChild(h(`
    <div class="controls">
      <button class="btn minor" data-c="am11">i – Am11</button>
      <button class="btn" data-c="e7alt">V – E7♯9♭13</button>
      <button class="btn major" data-c="fmaj9">VI – Fmaj9♯11</button>
    </div>
    <div class="controls">
      <button class="btn primary seq" data-seq="am11,e7alt,am11">▶ V → i (expected)</button>
      <button class="btn primary seq" data-seq="am11,e7alt,fmaj9">▶ V → VI (deceptive)</button>
    </div>
    <div class="readout"></div>`));
  const readout = host.querySelector('.readout');
  const show = (c) => { showChord(piano, c); setBass(c.bass); readout.textContent = c.name; };
  host.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => { timers.forEach(clearTimeout); const c = CHORDS[b.dataset.c]; show(c); strum(c); }));
  host.querySelectorAll('.seq').forEach((b) => (b.onclick = () => {
    timers.forEach(clearTimeout); timers.length = 0;
    b.dataset.seq.split(',').forEach((k, i) => timers.push(setTimeout(() => { show(CHORDS[k]); strum(CHORDS[k], { dur: i === 2 ? 2.6 : 1.5 }); }, i * 1700)));
  }));
  show(CHORDS.e7alt);
  return { destroy: () => timers.forEach(clearTimeout) };
}

const summaryWidget = chordCardsWidget(CHORDS, { am11: 'i – home', fmaj9: 'VI – the shift', e7alt: 'V – the setup' });

export default {
  id: 'harmonic-shift',
  lang: 'en',
  title: 'One Vibe, Two Colours',
  subject: 'Musik',
  grade: 'erwachsene',
  pages: [
    {
      title: 'One vibe, more than one chord',
      widget: loopPlayer({ variants: [{ label: 'full loop', bars: ['am11', 'am11', 'e7alt', 'fmaj9'] }] }),
      body: `<p>A lot of modern music coasts on a single harmonic colour. Sound design, texture and groove do the heavy lifting, and
        one chord is often all you need. But after a few repetitions, a small harmonic shift keeps the idea fresh without
        sending the listener off on a whole new section.</p>
        <p>This lesson builds that kind of shift: a four-bar loop that lives on <strong>A minor 11</strong>, tilts to
        <strong>F major 9 ♯11</strong> every fourth bar, and sneaks a <strong>deceptive cadence</strong> in on the way.</p>
        <p class="sub" style="color:var(--muted)">Based on a YouTube piano tutorial; voicings and ideas are paraphrased here.</p>`,
      tryThis: `<p>Play the loop and watch the bars. Bar four is the only moment the harmony moves, yet the mood stays put.</p>`,
    },
    {
      title: 'Building A minor 11',
      widget: stackWidget,
      body: `<p>Start from the A natural minor scale and stack thirds: skip every other note until you reach the 11th.</p>
        <ul><li><strong>A</strong> – root</li><li><strong>C</strong> – minor third</li><li><strong>E</strong> – fifth</li>
        <li><strong>G</strong> – minor seventh</li><li><strong>B</strong> – ninth</li><li><strong>D</strong> – eleventh</li></ul>
        <p>Six notes, one chord: A minor 11.</p>`,
      tryThis: `<p>Hit the button and listen to each third land. Stacked like this it sounds open and a little academic; the voicing on the next page is where the vibe comes from.</p>`,
    },
    {
      title: 'Voicing: make a cluster',
      widget: voicingWidget(AM11_STEPS, { root: 57, quality: 'minor', cls: 'minor' }),
      body: `<p>A voicing is the same notes rearranged across the keyboard. Instead of leaving the extensions up top, we pull them
        into the middle of the chord.</p>
        <p>Dropping the 11th (D) and the 9th (B) an octave each creates a <strong>four-note cluster: B C D E</strong>.
        The root A leaves the keyboard entirely and goes to the bass.</p>`,
      tryThis: `<p>Step through the voicing and listen to how the cluster thickens the sound. Click any key to hear it on its own.</p>`,
    },
    {
      title: 'Add motion: the B pulse',
      widget: loopPlayer({ variants: [{ label: 'with pulse', bars: ['am11', 'am11', 'am11', 'am11'] }], showSteps: true }),
      body: `<p>Holding one chord for four bars needs some motion. We repeat the <strong>B</strong> at the bottom of the cluster
        with a syncopated rhythm, doubled by a synth so it pokes through the pad:</p>
        <ul><li>beat 1</li><li>the fourth 16th of beat 1</li><li>the “and” of beat 2</li><li>the “and” of beat 3</li><li>the 16th after beat 4</li></ul>`,
      tryThis: `<p>Watch the step grid while the loop plays. The highlighted cells are the B hits; the yellow cursor is the current 16th note.</p>`,
    },
    {
      title: 'Same notes, new root',
      widget: rootSwitchWidget,
      body: `<p>Here is the trick. Instead of stacking another third <em>above</em> A minor 11, add one <em>below</em>: skip a scale note down from A and you land on <strong>F</strong>.</p>
        <p>With F as the root, A C E G B D are no longer root, ♭3, 5, ♭7, 9, 11. They become 3, 5, 7, 9, ♯11 and 13 of
        <strong>F major 13 ♯11</strong>. Same pitches, different lens.</p>
        <p>That is how you shift the colour of a chord without really changing the chord. The new root recontextualises the
        notes, the original vibe carries on, but the perspective is refreshed.</p>`,
      tryThis: `<p>Switch the root back and forth. Only the bass note changes, yet the whole chord changes character.</p>`,
    },
    {
      title: 'Voicing F major 9 ♯11',
      widget: voicingWidget(FMAJ_STEPS, { root: 53, quality: 'major', cls: 'major' }),
      body: `<p>Just like with A minor 11, we can voice this chord however we want, which is a chance to create some dialogue
        between the two.</p>
        <p>F goes to the bass. A seven-note chord is maxed out, so we drop the 13th (D) and get <strong>F major 9 ♯11</strong>.
        Then B and G each move down an octave. B lands in the same spot as before, so it can keep playing its rhythm.</p>`,
      tryThis: `<p>Step through and compare the final voicing with the Am11 voicing from page 3: three of the five keyboard notes are identical.</p>`,
    },
    {
      title: 'Three bars plus one',
      widget: loopPlayer({ variants: [
        { label: '3 × Am11 + Fmaj9♯11', bars: ['am11', 'am11', 'am11', 'fmaj9'] },
        { label: '4 × Am11', bars: ['am11', 'am11', 'am11', 'am11'] },
      ] }),
      body: `<p>Put it together: three bars of A minor 11, then one bar of F major 9 ♯11, with the B pulse running through all four.</p>
        <p>We are still coasting in the A minor world, but every fourth bar gets just enough of a shift to stop it from
        feeling like a one-chord idea.</p>`,
      tryThis: `<p>Switch between the two variants while the loop runs. Notice how little actually changes, and how much it does for the feel.</p>`,
    },
    {
      title: 'The deceptive cadence',
      widget: cadenceWidget,
      body: `<p>Think in the key of A minor: A minor 11 is the <strong>i</strong> chord and F major 9 ♯11 is the <strong>VI</strong> chord.</p>
        <p>When a progression moves to the <strong>V</strong> chord and then resolves to VI instead of back to i, that is a
        <strong>deceptive cadence</strong>. It has been in use for as long as there has been functional harmony. We already have i and VI,
        so all we need is a V chord before the VI.</p>
        <p>Our V is E7. To match the colour of the other voicings we make it an altered dominant: <strong>E7 ♯9 ♭13</strong>.
        One slick detail: B is the natural fifth of E7, so the B pulse can keep running right through it.</p>`,
      tryThis: `<p>Compare the expected resolution (V → i) with the deceptive one (V → VI). The second one lands softer and keeps the loop open.</p>`,
    },
    {
      title: 'The full loop',
      widget: loopPlayer({ variants: [
        { label: 'with V chord', bars: ['am11', 'am11', 'e7alt', 'fmaj9'] },
        { label: 'without V chord', bars: ['am11', 'am11', 'am11', 'fmaj9'] },
      ], showSteps: true }),
      body: `<p>Am11 | Am11 | E7♯9♭13 | Fmaj9♯11, with the B pulse running through all four bars.</p>
        <p>Bar three now creates a small expectation, bar four deflects it, and bar one picks the vibe up again. Still one
        world, still one pulse, but with a built-in reason to keep listening.</p>`,
      tryThis: `<p>Toggle the V chord on and off while the loop runs. Which version would you want under a long, textural intro?</p>`,
    },
    {
      title: 'Takeaways',
      widget: summaryWidget,
      body: `<ul>
        <li><strong>Voice for the vibe.</strong> Pull extensions into the middle of the chord to get clusters; let the bass own the root.</li>
        <li><strong>Shift the lens, not the notes.</strong> A new root under the same pitches changes the colour without breaking the mood.</li>
        <li><strong>Keep one thing constant.</strong> A repeated note with a fixed rhythm glues the chords together.</li>
        <li><strong>Borrow a classic.</strong> A deceptive cadence (V → VI) adds expectation and release without a full harmonic journey.</li>
      </ul>`,
    },
  ],
};

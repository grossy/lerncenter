// Lesson (en, adults): Harmonic constellations – arpeggiated chords in C minor, nested progressions
import { loopPlayer, voicingWidget, rootSwitchWidget, chordCardsWidget, arpEvents } from '../widgets.js';

const RANGE = { from: 48, to: 84 }; // C3 – C6, room for the scattered arpeggios
const BPM = 96;

const CHORDS = {
  ebg:     { name: 'E♭ major 9 / G', short: 'E♭maj9/G', root: 63, quality: 'major', bass: 43, keys: [58, 62, 63, 65, 67], cls: 'major', flat: true },
  abmaj7:  { name: 'A♭ major 7', short: 'A♭maj7', root: 56, quality: 'major', bass: 44, keys: [56, 60, 63, 67], cls: 'major', flat: true },
  fm11:    { name: 'F minor 11', short: 'Fm11', root: 53, quality: 'minor', bass: 41, keys: [56, 58, 60, 63, 67], cls: 'minor', flat: true },
  bb13sus: { name: 'B♭ 13 sus4', short: 'B♭13sus4', root: 58, quality: 'sus', bass: 46, keys: [56, 58, 60, 63, 67], cls: 'root', flat: true, alt: true },
  cm11:    { name: 'C minor 11', short: 'Cm11', root: 60, quality: 'minor', bass: 36, keys: [58, 62, 63, 65, 67], cls: 'minor', flat: true },
  gm7:     { name: 'G minor 7', short: 'Gm7', root: 55, quality: 'minor', bass: 43, keys: [58, 62, 65, 67], cls: 'root', flat: true },
};
const PROG = ['ebg', 'abmaj7', 'fm11', 'fm11', 'ebg', 'abmaj7', 'bb13sus', 'cm11'];

/* ---- bar builders (16 steps per bar) ---- */
const padBar = (c, b) => [
  { step: b * 16, notes: [c.bass], dur: 15.5, vel: 0.45, type: 'bass' },
  { step: b * 16, notes: c.keys, dur: 15.5, vel: 0.22, type: 'pad' },
];
const arpBar = (c, b) => [
  { step: b * 16, notes: [c.bass], dur: 8, vel: 0.4, type: 'bass' },
  ...arpEvents(c, b),
];
const followBar = (c, b) => [
  { step: b * 16, notes: [c.bass], dur: 15.5, vel: 0.4, type: 'bass' },
  { step: b * 16, notes: c.keys, dur: 15.5, vel: 0.14, type: 'pad' },
  ...arpEvents(c, b, { vel: 0.26 }),
];
// The synth keeps arpeggiating Cm11 while the Rhodes plays the progression on top.
const nestedBar = (c, b) => [
  ...(b % 2 === 0 ? [{ step: b * 16, notes: [CHORDS.cm11.bass], dur: 31, vel: 0.4, type: 'bass' }] : []),
  ...arpEvents(CHORDS.cm11, b, { vel: 0.2 }),
  { step: b * 16, notes: [c.bass + 12], dur: 15.5, vel: 0.3, type: 'pad' }, // tenor voice: the progression's roots
  { step: b * 16, notes: c.keys, dur: 15.5, vel: 0.2, type: 'pad' },
];

const player = (opts) => loopPlayer({ chords: CHORDS, range: RANGE, bpm: BPM, ...opts });

const VOICE_LEADING = [
  { keys: CHORDS.ebg.keys, bass: 43, root: 63, quality: 'major', cls: 'major', text: 'E♭ major 9 with G in the bass. It sits where a V chord would sit, but it is not G minor.' },
  { keys: CHORDS.abmaj7.keys, bass: 44, root: 56, quality: 'major', cls: 'major', text: 'A♭ major 7 (VI). B♭ and D slide down a whole step to A♭ and C; E♭ and G stay put.' },
  { keys: CHORDS.fm11.keys, bass: 41, root: 53, quality: 'minor', cls: 'minor', text: 'F minor 11 (iv). Keep everything and add B♭ (the 11th) inside the chord. Linger here.' },
  { keys: CHORDS.bb13sus.keys, bass: 46, root: 58, quality: 'sus', cls: 'root', text: 'Second time around: B♭ 13 sus4 instead of Fm11. Same keyboard notes, only the bass moves from F to B♭.' },
  { keys: CHORDS.cm11.keys, bass: 36, root: 60, quality: 'minor', cls: 'minor', text: 'C minor 11 (i) resolves the sequence. A♭ and C step up to B♭ and D; E♭ and G hold again.' },
];

export default {
  id: 'constellations',
  lang: 'en',
  title: 'Harmonic Constellations',
  subject: 'Musik',
  grade: 'erwachsene',
  pages: [
    {
      title: 'Harmonic constellations',
      widget: player({ variants: [{ label: 'nested', bars: PROG, build: nestedBar }], showSteps: true }),
      body: `<p>Take a chord, scatter its notes across several octaves and let an arpeggiator play them one at a time. What you get
        is less a chord than a slowly turning pattern of points: a harmonic constellation.</p>
        <p>This lesson builds a progression in C minor out of such constellations, then nests the whole progression inside one
        arpeggiated chord, so one constellation keeps churning while another drifts across it.</p>
        <p style="color:var(--muted)">Based on a YouTube piano tutorial; voicings and wording are paraphrased here.</p>`,
      tryThis: `<p>Play the loop. The synth arpeggiates C minor 11 the whole time while the keys walk through five chords above it. Watch which keys light up.</p>`,
    },
    {
      title: 'Scatter a chord',
      widget: player({ variants: [
        { label: 'block chord', bars: ['cm11', 'cm11'], build: padBar },
        { label: 'arpeggiated', bars: ['cm11', 'cm11'], build: arpBar },
      ], showSteps: true }),
      body: `<p>Here is C minor 11 voiced as a block: C in the bass, then B♭ D E♭ F G on the keys (the upper structure is an
        E♭ major 9, which is why it sounds so open).</p>
        <p>The arpeggiator takes the same notes, pushes some of them up an octave or two and cycles through them in 16th notes.
        Nothing about the harmony changes, but the chord turns into motion.</p>`,
      tryThis: `<p>Switch between block and arpeggiated while the loop runs. Click any key to hear a single note.</p>`,
    },
    {
      title: 'A five chord in disguise',
      widget: voicingWidget([
        { keys: CHORDS.gm7.keys, bass: 43, root: 55, quality: 'minor', cls: 'root', text: 'G minor 7: the plain v chord in C minor. Correct, but a little grey.' },
        { keys: CHORDS.ebg.keys, bass: 43, root: 63, quality: 'major', cls: 'major', text: 'Add E♭ and read the chord from E♭ instead: E♭ major 9 with its third, G, in the bass.' },
      ], { range: RANGE, flat: true }),
      body: `<p>The progression opens on something that behaves like a <strong>V</strong> chord: there is a G in the bass and it wants
        to move. But instead of G minor we play <strong>E♭ major 9 over G</strong>, a major chord with its third as the lowest note.</p>
        <p>Slash chords like this are a cheap way to keep the function of a bass note while swapping the colour above it.</p>`,
      tryThis: `<p>Step between the two. The bass never moves, yet the second chord feels brighter and far less final.</p>`,
    },
    {
      title: 'Voice leading',
      widget: voicingWidget(VOICE_LEADING, { range: RANGE, flat: true }),
      body: `<p>Each chord is voiced so the notes stay as <strong>vertically consistent</strong> as possible: whatever can stay, stays, and
        whatever has to move, moves by a step.</p>
        <p>E♭maj9/G → A♭maj7 → Fm11 (linger), then the same again but with B♭13sus4 in place of Fm11, and finally Cm11.</p>`,
      tryThis: `<p>Step through and watch the badges. E♭ and G never leave their keys through the whole progression.</p>`,
    },
    {
      title: 'The swap: Fm11 → B♭13sus4',
      widget: rootSwitchWidget({ notes: CHORDS.fm11.keys, range: RANGE, options: [
        { label: 'Root F → F minor 11', cls: 'minor', root: 53, bass: 41, quality: 'minor', flat: true, text: 'Over F these notes are <strong>♭3, 11, 5, ♭7, 9</strong>: F minor 11.' },
        { label: 'Root B♭ → B♭ 13 sus4', cls: 'root', root: 58, bass: 46, quality: 'sus', flat: true, text: 'Over B♭ the same notes become <strong>♭7, R, 9, sus4, 13</strong>: B♭ 13 sus4.' },
      ] }),
      body: `<p>The second time through, Fm11 is replaced by <strong>B♭13sus4</strong>. The name looks like a big change; the chord is
        not. The keyboard plays exactly the same five notes. Only the bass moves from F to B♭.</p>
        <p>Harmonically that turns the iv chord into a V-ish chord, which is what sets up the resolution to C minor.</p>`,
      tryThis: `<p>Flip the root. Listen to how B♭ underneath makes the same notes lean forward.</p>`,
    },
    {
      title: 'The full progression',
      widget: player({ variants: [
        { label: 'Rhodes only', bars: PROG, build: padBar },
        { label: 'arpeggiated', bars: PROG, build: followBar },
      ] }),
      body: `<p>Eight bars: E♭maj9/G | A♭maj7 | Fm11 | Fm11 | E♭maj9/G | A♭maj7 | B♭13sus4 | Cm11.</p>
        <p>In the arpeggiated version the synth follows every chord, so each bar is its own small constellation.</p>`,
      tryThis: `<p>Compare the block version with the arpeggiated one. Same notes, same bass, but the arpeggios draw attention to different chord tones in every bar.</p>`,
    },
    {
      title: 'Nested constellations',
      widget: player({ variants: [
        { label: 'nested in Cm11', bars: PROG, build: nestedBar },
        { label: 'arp follows chords', bars: PROG, build: followBar },
      ], showSteps: true }),
      body: `<p>Now let the synth keep arpeggiating the <strong>last chord, C minor 11</strong>, and play the whole progression on the
        Rhodes above it: one constellation nested inside another.</p>
        <p>Three things happen at once. A deep C still lands every other bar. A tenor voice on the Rhodes now carries the
        progression's roots: G, A♭, F, B♭, C. And the arpeggio keeps underlining chord tones that the moving harmony
        reinterprets bar by bar.</p>`,
      tryThis: `<p>Toggle between nested and following. The nested version feels like it never leaves C minor, even while five chords pass through it.</p>`,
    },
    {
      title: 'Takeaways',
      widget: chordCardsWidget(CHORDS, { ebg: 'V-ish · opener', abmaj7: 'VI', fm11: 'iv · linger', bb13sus: 'V-ish · the swap', cm11: 'i · home' }),
      body: `<ul>
        <li><strong>Scatter, don't stack.</strong> An arpeggiator across octaves turns a static chord into motion without adding notes.</li>
        <li><strong>Slash chords keep the bass honest.</strong> E♭maj9/G does the job of a V chord with a brighter colour.</li>
        <li><strong>Move as little as possible.</strong> Voice each chord so most notes stay; the ones that move go by step.</li>
        <li><strong>Swap the root, keep the hands.</strong> Fm11 and B♭13sus4 share every keyboard note.</li>
        <li><strong>Nest progressions.</strong> One chord arpeggiated underneath, a progression on top: a drone that still moves.</li>
      </ul>`,
    },
  ],
};

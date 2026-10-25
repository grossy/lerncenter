// Kleiner Web-Audio-Synth mit ein paar Klangfarben plus Loop-Sequencer.
let ctx = null;

export function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

// Klangfarben: Teiltöne [ratio, gain, type], Filter, Hüllkurve
const VOICES = {
  piano: { partials: [[1, 1, 'triangle'], [2, 0.3, 'sine'], [3, 0.1, 'sine']], cutoff: 2600, attack: 0.012, decay: 0.35, sustain: 0.45, release: 0.09 },
  pad:   { partials: [[1, 1, 'sine'], [2, 0.35, 'triangle'], [3, 0.12, 'sine'], [4, 0.05, 'sine']], cutoff: 1900, attack: 0.03, decay: 0.6, sustain: 0.7, release: 0.25 },
  synth: { partials: [[1, 0.6, 'sawtooth'], [1.004, 0.5, 'sawtooth'], [2, 0.15, 'square']], cutoff: 1400, attack: 0.005, decay: 0.12, sustain: 0.5, release: 0.05 },
  pluck: { partials: [[1, 1, 'triangle'], [2, 0.4, 'sine'], [4, 0.08, 'sine']], cutoff: 3200, attack: 0.004, decay: 0.2, sustain: 0.25, release: 0.08 },
  bass:  { partials: [[1, 1, 'sine'], [2, 0.5, 'triangle'], [3, 0.1, 'sine']], cutoff: 700, attack: 0.01, decay: 0.4, sustain: 0.8, release: 0.12 },
};

/**
 * Spielt einen Ton. time = Verzögerung in Sekunden, dur = Länge (bis Release).
 * Gibt ein Handle mit stop() zurück.
 */
export function playNote(midi, { time = 0, dur = 0.8, vel = 0.45, type = 'piano' } = {}) {
  const ac = getCtx();
  const v = VOICES[type] || VOICES.piano;
  const t = ac.currentTime + Math.max(0, time);
  const out = ac.createGain();
  out.gain.value = 0;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = v.cutoff;
  out.connect(lp).connect(ac.destination);

  const f = midiToFreq(midi);
  const oscs = [];
  for (const [ratio, gain, kind] of v.partials) {
    const o = ac.createOscillator();
    o.type = kind;
    o.frequency.value = f * ratio;
    const g = ac.createGain();
    g.gain.value = gain;
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + v.release * 6 + 0.1);
    oscs.push(o);
  }
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(vel, t + v.attack);
  out.gain.exponentialRampToValueAtTime(Math.max(0.0001, vel * v.sustain), t + v.attack + v.decay);
  out.gain.setTargetAtTime(0.0001, t + dur, v.release);
  const end = t + dur + v.release * 6;
  return {
    end,
    done: () => ac.currentTime > end,
    stop(fade = 0.08) {
      const now = ac.currentTime;
      if (now > end) return;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(out.gain.value, now);
      out.gain.linearRampToValueAtTime(0.0001, now + fade);
      oscs.forEach((o) => { try { o.stop(now + fade + 0.02); } catch {} });
    },
  };
}

/** notes: Array aus midi oder {midi, dur}. Spielt nacheinander, gibt Gesamtdauer zurück. */
export function playSequence(notes, { dur = 0.55, gap = 0, type = 'piano' } = {}) {
  let t = 0;
  for (const n of notes) {
    const midi = typeof n === 'number' ? n : n.midi;
    const d = typeof n === 'number' ? dur : (n.dur ?? dur);
    playNote(midi, { time: t, dur: d, type });
    t += d + gap;
  }
  return t;
}

export function playChord(midis, { time = 0, dur = 1.2, type = 'piano', vel = 0.35 } = {}) {
  for (const m of midis) playNote(m, { time, dur, vel, type });
  return time + dur;
}

/** Terz/Intervall: erst nacheinander, dann zusammen – oder nur zusammen. Gibt {stop, duration} zurück. */
export function playInterval(root, semis, { together = false, dur = 0.6 } = {}) {
  const handles = [];
  let duration;
  if (together) {
    for (const m of [root, root + semis]) handles.push(playNote(m, { dur: 1.3, vel: 0.35 }));
    duration = 1.3;
  } else {
    handles.push(playNote(root, { time: 0, dur }));
    handles.push(playNote(root + semis, { time: dur, dur }));
    for (const m of [root, root + semis]) handles.push(playNote(m, { time: dur * 2 + 0.1, dur: 1.2, vel: 0.35 }));
    duration = dur * 2 + 1.3;
  }
  return { duration, stop: () => handles.forEach((h) => h.stop()) };
}

/**
 * Loop-Sequencer in 16tel-Schritten.
 * events: [{ step, notes: [midi], dur (in Schritten), vel, type }]
 * onStep(s) wird pro 16tel aufgerufen (s = -1 beim Stoppen).
 */
export function createLoop({ bpm = 84, steps = 64, events = [], onStep = null }) {
  let running = false;
  let handles = [];
  let timers = [];
  const stepSec = () => 60 / bpm / 4;

  function scheduleIteration(t0) {
    const ac = getCtx();
    const sp = stepSec();
    for (const e of events) {
      const at = t0 + e.step * sp;
      for (const m of e.notes) {
        handles.push(playNote(m, { time: at - ac.currentTime, dur: e.dur * sp, vel: e.vel ?? 0.35, type: e.type || 'piano' }));
      }
    }
    if (onStep) {
      for (let s = 0; s < steps; s++) {
        const delay = (t0 + s * sp - ac.currentTime) * 1000;
        timers.push(setTimeout(() => running && onStep(s), Math.max(0, delay)));
      }
    }
    const loopEnd = t0 + steps * sp;
    timers.push(setTimeout(() => {
      if (!running) return;
      handles = handles.filter((h) => !h.done());
      scheduleIteration(loopEnd);
    }, Math.max(0, (loopEnd - ac.currentTime - 0.3) * 1000)));
  }

  return {
    get running() { return running; },
    start() {
      if (running) return;
      running = true;
      scheduleIteration(getCtx().currentTime + 0.08);
    },
    stop() {
      running = false;
      timers.forEach(clearTimeout);
      timers = [];
      handles.forEach((h) => h.stop());
      handles = [];
      onStep && onStep(-1);
    },
  };
}

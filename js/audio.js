// Kleiner Web-Audio-Synth mit ein paar Klangfarben plus Loop-Sequencer.
let ctx = null;

export function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/* Summensignal: alle Töne laufen durch einen Limiter, damit schnelle oder grosse Akkorde nicht übersteuern. */
let bus = null;
function master() {
  const ac = getCtx();
  if (bus?.context === ac) return bus;
  const trim = ac.createGain();
  trim.gain.value = 0.75;
  const limit = ac.createDynamicsCompressor();
  limit.threshold.value = -14;
  limit.knee.value = 10;
  limit.ratio.value = 12;
  limit.attack.value = 0.003;
  limit.release.value = 0.18;
  const clip = ac.createWaveShaper(); // fängt ab, was der Limiter durchlässt: linear bis 0.8, dann weich bis 1
  const curve = new Float32Array(1025);
  for (let i = 0; i < 1025; i++) {
    const x = i / 512 - 1, a = Math.abs(x);
    curve[i] = Math.sign(x) * (a <= 0.8 ? a : 0.8 + 0.2 * Math.tanh((a - 0.8) / 0.2));
  }
  clip.curve = curve;
  clip.oversample = '2x';
  trim.connect(limit).connect(clip).connect(ac.destination);
  bus = trim;
  return bus;
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
export function playNote(midi, opts = {}) {
  const held = capturing;
  const note = (opts.type === 'rhodes' ? playRhodes : playVoice)(midi, held ? { ...opts, dur: HOLD_SECONDS } : opts);
  held?.push(note);
  return note;
}

/* Gehaltene Töne: Was in holdNotes angeschlagen wird, klingt, bis der Aufrufer stop() ruft (Taste losgelassen). */
const HOLD_SECONDS = 12;
let capturing = null;
export function holdNotes(fn) {
  const notes = [], before = capturing;
  capturing = notes;
  try { fn(); } finally { capturing = before; }
  return notes;
}
/** Innerhalb von holdNotes: diese Töne klingen trotzdem ihre feste Länge aus. */
export function letRing(fn) {
  const before = capturing;
  capturing = null;
  try { fn(); } finally { capturing = before; }
}

function playVoice(midi, { time = 0, dur = 0.8, vel = 0.45, type = 'piano' } = {}) {
  const ac = getCtx();
  const v = VOICES[type] || VOICES.piano;
  const t = ac.currentTime + Math.max(0, time);
  const out = ac.createGain();
  out.gain.value = 0;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = v.cutoff;
  out.connect(lp).connect(master());

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

/* Aufgenommene Rhodes-Töne aus audio/rhodes/, nach MIDI benannt (tools/build_rhodes.py). */
const RHODES_ROOTS = [36, 40, 45, 48, 52, 57, 60, 64, 69, 72, 76, 81, 88, 93];
let rhodes = null, rhodesLoading = null;

/** MP3 beginnt je nach Browser mit etwas Stille: Abspielen erst ab dem Anschlag, sonst kommt der Ton zu spät. */
function onsetOf(buffer) {
  const data = buffer.getChannelData(0);
  let peak = 0;
  for (const v of data) peak = Math.max(peak, Math.abs(v));
  return Math.max(0, data.findIndex((v) => Math.abs(v) > peak * 0.02)) / buffer.sampleRate;
}
/** Lädt die Aufnahmen. Fehlt eine, springt die nächstgelegene ein. Bis sie da sind oder wenn alle fehlen, spielt das FM-Rhodes. */
export function loadRhodes() {
  if (rhodesLoading) return rhodesLoading;
  const decoder = new OfflineAudioContext(1, 1, 48000); // braucht keinen Klick, anders als ein AudioContext
  rhodesLoading = Promise.all(RHODES_ROOTS.map(async (root) => {
    try {
      const res = await fetch(new URL(`../audio/rhodes/${root}.mp3`, import.meta.url));
      const buffer = await decoder.decodeAudioData(await res.arrayBuffer());
      return { root, buffer, start: onsetOf(buffer) };
    } catch { return null; }
  })).then((all) => {
    const loaded = all.filter(Boolean);
    if (loaded.length) rhodes = loaded;
  });
  return rhodesLoading;
}

function playRhodes(midi, opts) {
  loadRhodes();
  return (rhodes ? playRhodesSample : playRhodesFm)(midi, opts);
}

/** Spielt die nächstgelegene Aufnahme, umgestimmt auf den gewünschten Ton. */
function playRhodesSample(midi, { time = 0, dur = 0.8, vel = 0.45 } = {}) {
  const ac = getCtx();
  const t = ac.currentTime + Math.max(0, time);
  const { root, buffer, start } = rhodes.reduce((a, b) => (Math.abs(b.root - midi) < Math.abs(a.root - midi) ? b : a));
  const rate = Math.pow(2, (midi - root) / 12);
  const release = 0.07;
  const end = Math.min(t + dur + release * 6, t + (buffer.duration - start) / rate);

  const src = ac.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = rate;
  const out = ac.createGain();
  src.connect(out).connect(master());
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(vel, t + 0.002);
  out.gain.setTargetAtTime(0.0001, t + dur, release);
  src.start(t, start);
  src.stop(end + 0.1);
  return {
    end,
    done: () => ac.currentTime > end,
    stop(fade = 0.08) {
      const now = ac.currentTime;
      if (now > end) return;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(out.gain.value, now);
      out.gain.linearRampToValueAtTime(0.0001, now + fade);
      try { src.stop(now + fade + 0.02); } catch {}
    },
  };
}

/**
 * E-Piano wie ein Rhodes, per FM: ein warmer Körper plus ein kurzer heller Anschlag (die «Tine»).
 * Dazu das langsame Stereo-Tremolo eines Suitcase-Modells. Hohe Töne klingen schneller ab, wie beim Original.
 */
function playRhodesFm(midi, { time = 0, dur = 0.8, vel = 0.45 } = {}) {
  const ac = getCtx();
  const t = ac.currentTime + Math.max(0, time);
  const f = midiToFreq(midi);
  const strength = Math.min(1, vel / 0.4);
  const ring = Math.max(0.6, 2.2 - (midi - 48) * 0.04); // Abklingzeit, tiefe Töne tragen länger
  const release = 0.07;
  const end = t + dur + release * 6;

  const out = ac.createGain();
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 7000;
  out.connect(lp);
  const pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
  if (pan) { lp.connect(pan); pan.connect(master()); } else lp.connect(master());

  const oscs = [];
  const osc = (freq) => { const o = ac.createOscillator(); o.frequency.value = freq; o.start(t); o.stop(end + 0.1); oscs.push(o); return o; };
  /** Modulator auf Träger: index ist der FM-Index, er fällt mit decay auf rest ab. */
  function stack(ratio, level, index, rest, decay) {
    const carrier = osc(f), mod = osc(f * ratio);
    const depth = ac.createGain(), g = ac.createGain();
    depth.gain.setValueAtTime(index * f * ratio, t);
    depth.gain.setTargetAtTime(rest * f * ratio, t + 0.002, decay);
    g.gain.value = level;
    mod.connect(depth).connect(carrier.frequency);
    carrier.connect(g).connect(out);
  }
  stack(1, 0.8, 0.5 + 1.1 * strength, 0.12, 0.45);
  const tine = f * 14 < 13000 ? 14 : f * 7 < 13000 ? 7 : 3; // bleibt unter der Abtastgrenze
  stack(tine, 0.2 + 0.15 * strength, 0.4 + 0.9 * strength, 0, 0.09);

  if (pan) {
    const lfo = osc(4.6), amount = ac.createGain();
    amount.gain.value = 0.22;
    lfo.connect(amount).connect(pan.pan);
  }
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(vel, t + 0.003);
  out.gain.setTargetAtTime(vel * 0.0001, t + 0.003, ring);
  out.gain.setTargetAtTime(0.0001, t + dur, release);
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

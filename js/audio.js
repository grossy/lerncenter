// Kleiner Web-Audio-Synth, klingt grob nach Klavier/E-Piano.
let ctx = null;

export function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

/** Spielt einen Ton. time = Verzögerung in Sekunden, dur = Länge. Gibt die Endzeit (relativ) zurück. */
export function playNote(midi, { time = 0, dur = 0.8, vel = 0.45 } = {}) {
  const ac = getCtx();
  const t = ac.currentTime + time;
  const out = ac.createGain();
  out.gain.value = 0;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2600;
  out.connect(lp).connect(ac.destination);

  const f = midiToFreq(midi);
  const partials = [[1, 1, 'triangle'], [2, 0.3, 'sine'], [3, 0.1, 'sine']];
  for (const [ratio, gain, type] of partials) {
    const o = ac.createOscillator();
    o.type = type;
    o.frequency.value = f * ratio;
    const g = ac.createGain();
    g.gain.value = gain;
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.6);
  }
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(vel, t + 0.012);
  out.gain.exponentialRampToValueAtTime(vel * 0.45, t + 0.35);
  out.gain.setTargetAtTime(0.0001, t + dur, 0.09);
  return time + dur;
}

/** notes: Array aus midi oder {midi, dur}. Spielt nacheinander, gibt Gesamtdauer zurück. */
export function playSequence(notes, { dur = 0.55, gap = 0 } = {}) {
  let t = 0;
  for (const n of notes) {
    const midi = typeof n === 'number' ? n : n.midi;
    const d = typeof n === 'number' ? dur : (n.dur ?? dur);
    playNote(midi, { time: t, dur: d });
    t += d + gap;
  }
  return t;
}

export function playChord(midis, { time = 0, dur = 1.2 } = {}) {
  for (const m of midis) playNote(m, { time, dur, vel: 0.35 });
  return time + dur;
}

/** Terz/Intervall: erst nacheinander, dann zusammen – oder nur zusammen. */
export function playInterval(root, semis, { together = false, dur = 0.6 } = {}) {
  if (together) return playChord([root, root + semis], { dur: 1.3 });
  playNote(root, { time: 0, dur });
  playNote(root + semis, { time: dur, dur });
  return playChord([root, root + semis], { time: dur * 2 + 0.1, dur: 1.2 });
}

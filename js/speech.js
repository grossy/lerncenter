// Sprachausgabe: spielt vorab erzeugte Aufnahmen aus daemon/audio/sv/ (Generator: tools/build_speech.py).
// Fehlt eine Datei, springt die schwedische Stimme des Geräts ein; ohne Stimme bleibt es still.
const AUDIO_DIR = new URL('../daemon/audio/sv/', import.meta.url);
const synth = globalThis.speechSynthesis || null;
let audio = null;       // ein einziges Element, damit iOS nach dem ersten Tippen weiterspielen darf
let finishCurrent = null;
let utterance = null;   // Referenz halten, sonst feuert Chrome onend manchmal nicht
let run = 0;            // zählt hoch, sobald etwas Neues startet oder gestoppt wird

export const RATE = { normal: 1, slow: 0.7 };

/** FNV-1a über UTF-8, gleiche Rechnung wie im Generator. Gibt den Dateinamen zum Text. */
export function clipName(text) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(text.normalize('NFC'))) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0') + '.m4a';
}

function halt() {
  audio?.pause();
  if (synth) { utterance = null; synth.cancel(); }
  finishCurrent?.();
}

function deviceVoice(text, rate) {
  const voice = synth?.getVoices().find((v) => v.lang.replace('_', '-').toLowerCase().startsWith('sv'));
  if (!voice) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang.replace('_', '-'); u.rate = rate;
    u.onend = resolve; u.onerror = resolve;
    utterance = u;
    synth.speak(u);
  });
}

function playClip(text, rate) {
  halt();
  audio ||= new Audio();
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      audio.onended = audio.onerror = null;
      finishCurrent = null;
      resolve();
    };
    const guard = setTimeout(finish, (text.length * 110) / rate + 4000);
    finishCurrent = finish;
    audio.onended = finish;
    audio.onerror = () => deviceVoice(text, rate).then(finish);
    audio.src = new URL(clipName(text), AUDIO_DIR).href;
    audio.defaultPlaybackRate = rate;
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    audio.play().catch((e) => { if (e.name === 'NotAllowedError') finish(); });
  });
}

export function stopSpeech() {
  run++;
  halt();
}

/** Spricht einen Text. Das Promise löst am Ende des Satzes auf, auch wenn der Ton ausbleibt. */
export function speak(text, { rate = RATE.normal } = {}) {
  run++;
  return playClip(text, rate);
}

/** Spielt mehrere Aufnahmen nacheinander, zum Beispiel einen zusammengesetzten Preis. */
export async function speakParts(parts, { rate = RATE.normal } = {}) {
  const mine = ++run;
  for (const p of parts) {
    await playClip(p, rate);
    if (mine !== run) return;
  }
}

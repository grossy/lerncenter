// Launchpad als Eingabe und Anzeige für das Push-Raster (js/push.js), über Web MIDI (Chrome, Edge).
// Das Gerät läuft im Programmer-Modus: Es meldet physische Pads, das Quarten-Layout kommt aus dem Raster.
// Nur der Launchpad Pro MK3 ist am Gerät getestet. X und Mini MK3 nutzen laut Novation dasselbe Protokoll.
const MODELS = [
  { name: 'Launchpad Pro MK3', port: /LPProMK3 MIDI|LPP3 MIDI/i, id: 0x0e },
  { name: 'Launchpad X', port: /LPX MIDI/i, id: 0x0c },
  { name: 'Launchpad Mini MK3', port: /LPMiniMK3 MIDI/i, id: 0x0d },
];
const REMEMBER = 'push-controller';
const SIZE = 8;

let access = null, input = null, output = null, model = null;
let active = null, sent = new Map(), listeners = new Set(), status = 'off', lastPad = null;

export const midiSupported = () => !!navigator.requestMIDIAccess;
export const controllerState = () => ({ status, model: model?.name || '', lastPad });
const remembered = () => { try { return localStorage.getItem(REMEMBER) === '1'; } catch { return false; } };
const remember = (on) => { try { localStorage.setItem(REMEMBER, on ? '1' : '0'); } catch {} };
const tell = () => listeners.forEach((fn) => fn());
export function onControllerChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

const sysex = (mode) => [0xf0, 0x00, 0x20, 0x29, 0x02, model.id, 0x0e, mode, 0xf7];
const noteOf = (r, c) => 10 * (r + 1) + (c + 1);

function release() {
  if (input) input.onmidimessage = null;
  if (output && model) { try { output.send(sysex(0)); } catch {} }
  input = output = model = null;
  sent = new Map();
}
function attachPorts() {
  release();
  for (const m of MODELS) {
    const inp = [...access.inputs.values()].find((p) => m.port.test(p.name) && p.state === 'connected');
    const out = [...access.outputs.values()].find((p) => m.port.test(p.name) && p.state === 'connected');
    if (!inp || !out) continue;
    input = inp; output = out; model = m;
    input.onmidimessage = onMessage;
    output.send(sysex(1));
    status = 'on';
    paint();
    tell();
    return;
  }
  status = 'missing';
  tell();
}
function onMessage({ data }) {
  const [kind, note, vel] = data;
  if ((kind & 0xf0) !== 0x90 || !vel) return;
  const r = Math.floor(note / 10) - 1, c = note % 10 - 1;
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return;
  lastPad = [r, c];
  if (active?.el.isConnected) active.press(r, c);
  tell();
}
/** Schickt nur, was sich geändert hat. Farbe: Palettenindex, pulse: langsam pulsierend. */
function paint() {
  if (!output) return;
  const live = active?.el.isConnected;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const n = noteOf(r, c);
    const led = live ? active.led(r, c) : { color: 0 };
    const key = `${led.color}/${led.pulse ? 1 : 0}`;
    if (sent.get(n) === key) continue;
    sent.set(n, key);
    output.send([0x90, n, led.pulse ? 0 : led.color]);
    if (led.pulse) output.send([0x92, n, led.color]);
  }
}
let queued = false;
export function repaint() {
  if (queued) return;
  queued = true;
  queueMicrotask(() => { queued = false; paint(); });
}
export function attachGrid(grid) {
  active = grid;
  repaint();
  if (status === 'off' && remembered() && midiSupported()) connectController().catch(() => {});
}
export async function connectController() {
  access = access || await navigator.requestMIDIAccess({ sysex: true });
  access.onstatechange = () => { if (remembered() && (!model || output?.state !== 'connected')) attachPorts(); };
  remember(true);
  attachPorts();
}
export function disconnectController() {
  remember(false);
  release();
  status = 'off';
  tell();
}
// Beim Seitenwechsel ohne Raster die Lichter löschen, beim Verlassen zurück in den normalen Modus.
window.addEventListener('hashchange', () => setTimeout(repaint, 100));
window.addEventListener('pagehide', release);

// Prints every Swedish phrase of the Daemon language lessons as a JSON list, for tools/build_speech.py.
// Usage: node tools/speech_phrases.mjs > phrases.json
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../daemon/lessons/', import.meta.url));
const all = new Set();
for (const f of readdirSync(dir).filter((n) => /^sv-\d+.*\.js$/.test(n)).sort()) {
  const { default: lesson } = await import(new URL(`../daemon/lessons/${f}`, import.meta.url));
  lesson.phrases.forEach((p) => all.add(p));
}
console.log(JSON.stringify([...all], null, 0));

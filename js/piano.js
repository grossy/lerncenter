// Klaviatur-Komponente. Töne als MIDI-Nummern (60 = C4).
const WHITE = [0, 2, 4, 5, 7, 9, 11];
export const SHARP = ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'B', 'H'];
export const FLAT  = ['C', 'Des', 'D', 'Es', 'E', 'F', 'Ges', 'G', 'As', 'A', 'B', 'H'];

export function isBlack(midi) { return !WHITE.includes(midi % 12); }
export function noteName(midi, { flat = false } = {}) { return (flat ? FLAT : SHARP)[midi % 12]; }

export function createPiano({ from = 60, to = 76, onKey = null, labels = true } = {}) {
  const el = document.createElement('div');
  el.className = 'piano';
  const keys = new Map();
  let whites = 0;
  for (let m = from; m <= to; m++) {
    const k = document.createElement('div');
    const black = isBlack(m);
    k.className = 'key ' + (black ? 'black' : 'white');
    k.dataset.midi = m;
    k.style.setProperty('--i', whites);
    if (!black) whites++;
    if (labels) {
      const l = document.createElement('span');
      l.className = 'lbl';
      l.innerHTML = black ? `${SHARP[m % 12]}<br>${FLAT[m % 12]}` : SHARP[m % 12];
      k.appendChild(l);
    }
    k.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      k.classList.add('pressed');
      setTimeout(() => k.classList.remove('pressed'), 180);
      onKey && onKey(m, k);
    });
    el.appendChild(k);
    keys.set(m, k);
  }
  el.style.setProperty('--n', whites);

  const api = {
    el,
    key: (m) => keys.get(m),
    set(m, cls) { keys.get(m)?.classList.add(cls); },
    unset(m, cls) { keys.get(m)?.classList.remove(cls); },
    clear() {
      keys.forEach((k) => {
        k.className = 'key ' + (k.classList.contains('black') ? 'black' : 'white');
        k.querySelector('.badge')?.remove();
      });
    },
    badge(m, text, cls = '') {
      const k = keys.get(m);
      if (!k) return;
      let b = k.querySelector('.badge');
      if (!b) { b = document.createElement('span'); k.appendChild(b); }
      b.className = 'badge ' + cls;
      b.textContent = text;
    },
    flash(m, ms = 250) {
      const k = keys.get(m);
      if (!k) return;
      k.classList.add('pressed');
      setTimeout(() => k.classList.remove('pressed'), ms);
    },
  };
  return api;
}

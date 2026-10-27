// Lektion (Klasse 6, Mathe): Flächeninhalt und Umfang
import { h, confetti } from '../lesson.js';

const CELL = 22;            // px pro Kästchen
const PER_CM = 2;           // 2 Kästchen = 1 cm (wie in der Klassenarbeit)
const NS = 'http://www.w3.org/2000/svg';
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/* ---------- SVG-Helfer ---------- */
function svgEl(tag, attrs = {}, text = null) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
}
/** Zeichenfläche mit Kästchenraster. Koordinaten in Kästchen. */
function board(cols, rows, { pad = 1 } = {}) {
  const w = (cols + 2 * pad) * CELL, hgt = (rows + 2 * pad) * CELL;
  const svg = svgEl('svg', { viewBox: `0 0 ${w} ${hgt}`, class: 'geo' });
  const g = svgEl('g', { transform: `translate(${pad * CELL} ${pad * CELL})` });
  const grid = svgEl('g', { class: 'grid' });
  for (let x = 0; x <= cols; x++) grid.appendChild(svgEl('line', { x1: x * CELL, y1: 0, x2: x * CELL, y2: rows * CELL, class: x % PER_CM === 0 ? 'cm' : '' }));
  for (let y = 0; y <= rows; y++) grid.appendChild(svgEl('line', { x1: 0, y1: y * CELL, x2: cols * CELL, y2: y * CELL, class: y % PER_CM === 0 ? 'cm' : '' }));
  g.appendChild(grid);
  svg.appendChild(g);
  const P = (x, y) => `${x * CELL},${y * CELL}`;
  return {
    svg, g,
    poly(points, cls = 'shape') { const p = svgEl('polygon', { points: points.map(([x, y]) => P(x, y)).join(' '), class: cls }); g.appendChild(p); return p; },
    rect(x, y, w, hh, cls = 'shape') { const r = svgEl('rect', { x: x * CELL, y: y * CELL, width: w * CELL, height: hh * CELL, class: cls }); g.appendChild(r); return r; },
    line(x1, y1, x2, y2, cls = 'edge') { const l = svgEl('line', { x1: x1 * CELL, y1: y1 * CELL, x2: x2 * CELL, y2: y2 * CELL, class: cls }); g.appendChild(l); return l; },
    label(x, y, text, cls = 'lbl') { const t = svgEl('text', { x: x * CELL, y: y * CELL, class: cls }, text); g.appendChild(t); return t; },
    cell(x, y, cls = 'fill') { const r = svgEl('rect', { x: x * CELL + 1, y: y * CELL + 1, width: CELL - 2, height: CELL - 2, class: cls }); g.appendChild(r); return r; },
    clear(cls) { g.querySelectorAll('.' + cls).forEach((e) => e.remove()); },
  };
}
const timersFor = () => { const l = []; return { after(ms, fn) { l.push(setTimeout(fn, ms)); }, clear() { l.forEach(clearTimeout); l.length = 0; } }; };

/* ---------- Seite 1: Umfang oder Flächeninhalt? ---------- */
function umfangFlaecheWidget(host) {
  const t = timersFor();
  const bw = 5, bh = 3; // cm
  const b = board(bw * PER_CM, bh * PER_CM);
  host.appendChild(b.svg);
  b.rect(0, 0, bw * PER_CM, bh * PER_CM, 'shape');
  host.appendChild(h(`
    <div class="controls">
      <button class="btn big accent u">🚧 Umfang zeigen</button>
      <button class="btn big major a">🟩 Flächeninhalt zeigen</button>
    </div>
    <div class="readout"></div>`));
  const readout = host.querySelector('.readout');
  function reset() { t.clear(); b.clear('fill'); b.clear('walk'); b.clear('tag'); }
  host.querySelector('.u').onclick = () => {
    reset();
    const edges = [[0, 0, bw, 0, 'oben'], [bw, 0, bw, bh, 'rechts'], [bw, bh, 0, bh, 'unten'], [0, bh, 0, 0, 'links']];
    let sum = 0;
    edges.forEach(([x1, y1, x2, y2], i) => t.after(i * 700, () => {
      b.line(x1 * PER_CM, y1 * PER_CM, x2 * PER_CM, y2 * PER_CM, 'walk');
      const len = Math.abs(x2 - x1) + Math.abs(y2 - y1);
      sum += len;
      readout.innerHTML = `Rand entlanggehen: ${edges.slice(0, i + 1).map(([a, c, d, e]) => Math.abs(d - a) + Math.abs(e - c) + ' cm').join(' + ')} = <strong>${sum} cm</strong>`;
    }));
    t.after(edges.length * 700, () => { readout.innerHTML = `Umfang U = 5 + 3 + 5 + 3 = <strong>16 cm</strong>. Eine Länge, darum <strong>cm</strong>.`; });
  };
  host.querySelector('.a').onclick = () => {
    reset();
    let n = 0;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const i = y * bw + x;
      t.after(i * 120, () => {
        for (let dy = 0; dy < PER_CM; dy++) for (let dx = 0; dx < PER_CM; dx++) b.cell(x * PER_CM + dx, y * PER_CM + dy, 'fill');
        n++;
        readout.innerHTML = `Quadrate von 1 cm × 1 cm auslegen: <strong>${n} cm²</strong>`;
      });
    }
    t.after(bw * bh * 120 + 100, () => { readout.innerHTML = `Flächeninhalt A = 5 · 3 = <strong>15 cm²</strong>. Eine Fläche, darum <strong>cm²</strong> (Quadratzentimeter).`; });
  };
  return { destroy: t.clear };
}

/* ---------- Seite 2: Rechteck mit Schiebereglern ---------- */
function rechteckWidget(host) {
  let bw = 4, bh = 3;
  const maxW = 8, maxH = 5;
  const b = board(maxW * PER_CM, maxH * PER_CM);
  host.appendChild(b.svg);
  host.appendChild(h(`
    <div class="sliders">
      <label>Breite b: <strong class="bv"></strong> cm <input type="range" min="1" max="${maxW}" value="${bw}" class="sb"></label>
      <label>Höhe h: <strong class="hv"></strong> cm <input type="range" min="1" max="${maxH}" value="${bh}" class="sh"></label>
    </div>
    <div class="formulas"><div class="f a"></div><div class="f u"></div></div>`));
  function render() {
    b.clear('shape'); b.clear('fill'); b.clear('tag');
    for (let y = 0; y < bh * PER_CM; y++) for (let x = 0; x < bw * PER_CM; x++) b.cell(x, y, 'fill soft');
    b.rect(0, 0, bw * PER_CM, bh * PER_CM, 'shape outline');
    b.label(bw, -0.35, `b = ${bw} cm`, 'tag');
    b.label(bw * PER_CM + 0.4, bh, `h = ${bh} cm`, 'tag left');
    host.querySelector('.bv').textContent = bw; host.querySelector('.hv').textContent = bh;
    host.querySelector('.f.a').innerHTML = `<span class="tag major">A</span> Flächeninhalt = b · h = ${bw} · ${bh} = <strong>${bw * bh} cm²</strong>`;
    host.querySelector('.f.u').innerHTML = `<span class="tag grade">U</span> Umfang = 2 · b + 2 · h = 2 · ${bw} + 2 · ${bh} = <strong>${2 * bw + 2 * bh} cm</strong>`;
  }
  host.querySelector('.sb').oninput = (e) => { bw = +e.target.value; render(); };
  host.querySelector('.sh').oninput = (e) => { bh = +e.target.value; render(); };
  render();
  return {};
}

/* ---------- Seite 3: Dreieck = halbes Rechteck ---------- */
function dreieckWidget(host) {
  const t = timersFor();
  let g = 4, hh = 2, top = 3; // cm; top = x-Position der Spitze
  const maxG = 8, maxH = 4;
  const b = board(maxG * PER_CM, maxH * PER_CM);
  host.appendChild(b.svg);
  host.appendChild(h(`
    <div class="sliders">
      <label>Grundseite g: <strong class="gv"></strong> cm <input type="range" min="2" max="${maxG}" value="${g}" class="sg"></label>
      <label>Höhe h: <strong class="hv"></strong> cm <input type="range" min="1" max="${maxH}" value="${hh}" class="sh"></label>
      <label>Spitze: <input type="range" min="0" max="${maxG}" value="${top}" class="st"></label>
    </div>
    <div class="controls"><button class="btn primary show">▶ Rechteck drumherum zeigen</button></div>
    <div class="formulas"><div class="f a"></div></div>`));
  const Y = maxH * PER_CM;
  function render(showRect = false) {
    t.clear(); b.clear('shape'); b.clear('fill'); b.clear('tag'); b.clear('edge'); b.clear('walk');
    const x0 = 0, x1 = g * PER_CM, yb = Y, yt = Y - hh * PER_CM, xt = Math.min(top, maxG) * PER_CM;
    if (showRect) {
      const rx0 = Math.min(x0, xt), rx1 = Math.max(x1, xt);
      b.rect(rx0, yt, rx1 - rx0, yb - yt, 'fill soft');
      b.rect(rx0, yt, rx1 - rx0, yb - yt, 'shape dashed');
    }
    b.poly([[x0, yb], [x1, yb], [xt, yt]], 'shape tri');
    b.line(xt, yt, xt, yb, 'edge height');
    b.label(g / 2 * PER_CM, yb + 0.9 * 1, `g = ${g} cm`, 'tag');
    b.label(xt + 0.3, (yt + yb) / 2 + 0.3, `h = ${hh} cm`, 'tag left');
    host.querySelector('.gv').textContent = g; host.querySelector('.hv').textContent = hh;
    const rect = g * hh;
    host.querySelector('.f.a').innerHTML = showRect
      ? `Rechteck: g · h = ${g} · ${hh} = ${rect} cm². Das Dreieck ist genau die <strong>Hälfte</strong>: <strong>${rect} : 2 = ${rect / 2} cm²</strong>`
      : `<span class="tag major">A</span> Dreieck = g · h : 2 = ${g} · ${hh} : 2 = <strong>${rect / 2} cm²</strong>`;
  }
  host.querySelector('.sg').oninput = (e) => { g = +e.target.value; render(); };
  host.querySelector('.sh').oninput = (e) => { hh = +e.target.value; render(); };
  host.querySelector('.st').oninput = (e) => { top = +e.target.value; render(); };
  host.querySelector('.show').onclick = () => render(true);
  render();
  return { destroy: t.clear };
}

/* ---------- Seite 4: Parallelogramm verschieben ---------- */
function parallelogrammWidget(host) {
  let g = 4, hh = 2, shear = 2; // cm, shear = Verschiebung oben in cm
  const maxG = 6, maxH = 4, maxS = 3;
  const b = board((maxG + maxS) * PER_CM, maxH * PER_CM);
  host.appendChild(b.svg);
  host.appendChild(h(`
    <div class="sliders">
      <label>Grundseite g: <strong class="gv"></strong> cm <input type="range" min="2" max="${maxG}" value="${g}" class="sg"></label>
      <label>Höhe h: <strong class="hv"></strong> cm <input type="range" min="1" max="${maxH}" value="${hh}" class="sh"></label>
      <label>Schräge: <input type="range" min="0" max="${maxS}" value="${shear}" class="ss"></label>
    </div>
    <div class="controls"><button class="btn primary move">✂️ Dreieck abschneiden und verschieben</button><button class="btn ghost back">Zurück</button></div>
    <div class="formulas"><div class="f a"></div></div>`));
  const Y = maxH * PER_CM;
  let moved = false;
  function render() {
    b.clear('shape'); b.clear('fill'); b.clear('tag'); b.clear('edge');
    const s = shear * PER_CM, G = g * PER_CM, H = hh * PER_CM, yt = Y - H;
    if (!moved) {
      b.poly([[0, Y], [G, Y], [G + s, yt], [s, yt]], 'shape para');
      if (s > 0) b.poly([[0, Y], [s, yt], [s, Y]], 'shape cut');
      b.line(s, yt, s, Y, 'edge height');
    } else {
      b.poly([[0, Y], [G, Y], [G, yt], [0, yt]], 'shape para');
      if (s > 0) b.poly([[G - s, Y], [G, yt], [G, Y]], 'shape cut');
      b.line(0, yt, 0, Y, 'edge height');
    }
    b.label(G / 2, Y + 0.9, `g = ${g} cm`, 'tag');
    b.label((moved ? 0 : s) + 0.3, yt + H / 2 + 0.3, `h = ${hh} cm`, 'tag left');
    if (!moved && shear > 0) b.label(G + s / 2 + 0.4, yt + H / 2, 'schräge Seite ≠ Höhe!', 'tag warn left');
    host.querySelector('.gv').textContent = g; host.querySelector('.hv').textContent = hh;
    host.querySelector('.f.a').innerHTML = `<span class="tag major">A</span> Parallelogramm = g · h = ${g} · ${hh} = <strong>${g * hh} cm²</strong>` + (moved ? ' – gleich gross wie das Rechteck.' : '');
  }
  host.querySelector('.sg').oninput = (e) => { g = +e.target.value; moved = false; render(); };
  host.querySelector('.sh').oninput = (e) => { hh = +e.target.value; moved = false; render(); };
  host.querySelector('.ss').oninput = (e) => { shear = +e.target.value; moved = false; render(); };
  host.querySelector('.move').onclick = () => { moved = true; render(); };
  host.querySelector('.back').onclick = () => { moved = false; render(); };
  render();
  return {};
}

/* ---------- Seite 5: Teilflächen (Grundstück aus der Arbeit) ---------- */
// Grundstück in Metern, y nach unten: 14 m breit, 10 m hoch
const GRUND = [[0, 0], [14, 0], [14, 10], [11, 10], [11, 2], [4, 2], [4, 6], [0, 6]];
const GRUND_SIDES = [ // [x1,y1,x2,y2, Länge, beschriftet?, Hinweis]
  [0, 0, 14, 0, 14, false, 'oben = 4 + 7 + 3 = 14 m'],
  [14, 0, 14, 10, 10, true],
  [14, 10, 11, 10, 3, true],
  [11, 10, 11, 2, 8, true],
  [11, 2, 4, 2, 7, true],
  [4, 2, 4, 6, 4, false, 'innen = 6 − 2 = 4 m (links sind es 6 m, der obere Streifen ist 10 − 8 = 2 m hoch)'],
  [4, 6, 0, 6, 4, true],
  [0, 6, 0, 0, 6, true],
];
const ZERLEGUNGEN = {
  spalten: { label: 'Drei Spalten', pieces: [[0, 0, 4, 6, 'links'], [4, 0, 7, 2, 'Mitte'], [11, 0, 3, 10, 'rechts']] },
  streifen: { label: 'Streifen oben + zwei Beine', pieces: [[0, 0, 14, 2, 'oben'], [0, 2, 4, 4, 'links'], [11, 2, 3, 8, 'rechts']] },
  minus: { label: 'Grosses Rechteck minus Lücken', pieces: [[0, 0, 14, 10, 'ganz', 1], [4, 2, 7, 8, 'Lücke', -1], [4, 6, 7, 4, '', 0], [4, 6, 7, 4, '', 0], [4, 6, 7, 4, '', 0]] },
};
function grundBoard(scale = 1) {
  const b = board(14 * scale, 10 * scale, { pad: 2 });
  b.svg.querySelector('.grid').remove();
  return b;
}
function teilflaechenWidget(host) {
  const S = 1; // 1 Kästchen = 1 m
  const b = grundBoard(S);
  host.appendChild(b.svg);
  const chips = h(`<div class="chips"></div>`);
  host.appendChild(chips);
  host.appendChild(h(`<div class="readout"></div>`));
  const readout = host.querySelector('.readout');
  function base() {
    b.clear('shape'); b.clear('fill'); b.clear('tag');
    b.poly(GRUND, 'shape outline');
    for (const [x1, y1, x2, y2, len, lab] of GRUND_SIDES) if (lab) b.label((x1 + x2) / 2 + (x1 === x2 ? (x1 > 7 ? 0.7 : -0.7) : 0), (y1 + y2) / 2 + (y1 === y2 ? (y1 === 0 ? -0.3 : 0.9) : 0.25), `${len} m`, 'tag' + (x1 === x2 && x1 > 7 ? ' left' : ''));
  }
  function show(key) {
    base();
    chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c.dataset.k === key));
    const z = ZERLEGUNGEN[key];
    const parts = [];
    if (key === 'minus') {
      b.rect(0, 0, 14, 10, 'fill piece p0');
      b.rect(4, 2, 7, 8, 'fill gap');
      b.rect(4, 6, 7, 4, 'fill gap');
      b.rect(0, 6, 4, 4, 'fill gap');
      b.label(7, 1.3, '14 · 10 = 140', 'tag');
      b.label(7.5, 4.5, '7 · 8 = 56', 'tag');
      b.label(2, 8.3, '4 · 4 = 16', 'tag');
      readout.innerHTML = `Ganzes Rechteck 14 · 10 = 140 m². Davon weg: die Lücke in der Mitte 7 · 8 = 56 m² und die Lücke unten links 4 · 4 = 16 m².<br>A = 140 − 56 − 16 = <strong>68 m²</strong>`;
      return;
    }
    z.pieces.forEach(([x, y, w, hh, name], i) => {
      b.rect(x, y, w, hh, `fill piece p${i}`);
      b.label(x + w / 2, y + hh / 2 + 0.3, `${w} · ${hh} = ${w * hh}`, 'tag');
      parts.push(`${w} · ${hh} = ${w * hh} m²`);
    });
    const total = z.pieces.reduce((s, p) => s + p[2] * p[3], 0);
    readout.innerHTML = `${parts.join(' &nbsp;|&nbsp; ')}<br>A = ${z.pieces.map((p) => p[2] * p[3]).join(' + ')} = <strong>${total} m²</strong>`;
  }
  for (const [k, z] of Object.entries(ZERLEGUNGEN)) { const c = h(`<button class="chip" data-k="${k}">${z.label}</button>`); c.onclick = () => show(k); chips.appendChild(c); }
  base();
  readout.innerHTML = 'Wähle eine Zerlegung. Egal wie du schneidest, am Ende kommt immer dasselbe heraus.';
  return {};
}

/* ---------- Seite 6: Umfang mit fehlenden Seiten ---------- */
function umfangWidget(host) {
  const b = grundBoard(1);
  host.appendChild(b.svg);
  b.poly(GRUND, 'shape outline');
  host.appendChild(h(`<div class="readout">Tippe nacheinander auf alle Seiten. Bei den Seiten ohne Zahl musst du rechnen.</div><div class="controls"><button class="btn ghost reset">Zurücksetzen</button></div>`));
  const readout = host.querySelector('.readout');
  const done = new Set();
  const hits = [];
  GRUND_SIDES.forEach((side, i) => {
    const [x1, y1, x2, y2, len, lab] = side;
    const vertical = x1 === x2;
    const lx = (x1 + x2) / 2 + (vertical ? (x1 > 7 ? 0.7 : -0.7) : 0);
    const ly = (y1 + y2) / 2 + (vertical ? 0.25 : (y1 === 0 ? -0.3 : 0.9));
    const label = b.label(lx, ly, lab ? `${len} m` : '?', 'tag ' + (lab ? '' : 'missing ') + (vertical && x1 > 7 ? 'left' : ''));
    const hit = b.line(x1, y1, x2, y2, 'hit');
    hit.addEventListener('click', () => pick(i, side, label, hit));
    hits.push({ hit, label });
  });
  function pick(i, side, label, hit) {
    if (done.has(i)) return;
    done.add(i);
    hit.classList.add('done');
    const [, , , , len, lab, hint] = side;
    label.textContent = `${len} m`;
    label.classList.remove('missing');
    const sum = [...done].reduce((s, j) => s + GRUND_SIDES[j][4], 0);
    const list = [...done].map((j) => GRUND_SIDES[j][4]).join(' + ');
    readout.innerHTML = (hint ? `<div class="hint">💡 ${hint}</div>` : '') + `U = ${list} = <strong>${sum} m</strong>` + (done.size === GRUND_SIDES.length ? ' ✅ Alle 8 Seiten! Umfang = <strong>56 m</strong>.' : ` (${done.size} von 8 Seiten)`);
    if (done.size === GRUND_SIDES.length) confetti();
  }
  host.querySelector('.reset').onclick = () => {
    done.clear();
    hits.forEach(({ hit, label }, i) => { hit.classList.remove('done'); if (!GRUND_SIDES[i][5]) { label.textContent = '?'; label.classList.add('missing'); } });
    readout.textContent = 'Tippe nacheinander auf alle Seiten. Bei den Seiten ohne Zahl musst du rechnen.';
  };
  return {};
}

/* ---------- Seite 7: Pfeilfigur aus Aufgabe 1a ---------- */
function pfeilWidget(host) {
  const b = board(4 * PER_CM, 3 * PER_CM);
  host.appendChild(b.svg);
  const K = PER_CM;
  const pts = [[0, 1], [2, 0], [4, 1], [4, 3], [2, 2], [0, 3]].map(([x, y]) => [x * K, y * K]);
  b.poly(pts, 'shape outline');
  host.appendChild(h(`
    <div class="controls">
      <button class="btn big accent u">Seiten addieren</button>
      <button class="btn big major a">In zwei Parallelogramme teilen</button>
    </div><div class="readout"></div>`));
  const readout = host.querySelector('.readout');
  host.querySelector('.u').onclick = () => {
    b.clear('fill'); b.clear('tag'); b.clear('walk');
    for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; b.line(x1, y1, x2, y2, 'walk'); }
    readout.innerHTML = `6 Seiten, jede etwa 2,2 cm (schräg!): das ist der <strong>Umfang</strong>, eine Länge in cm. In der Arbeit stand hier «12 cm» als Flächeninhalt – das war der Umfang, und die schrägen Seiten sind nicht einmal genau 2 cm.`;
  };
  host.querySelector('.a').onclick = () => {
    b.clear('fill'); b.clear('tag'); b.clear('walk');
    b.poly([[0, K], [2 * K, 0], [2 * K, 2 * K], [0, 3 * K]], 'fill piece p0');
    b.poly([[2 * K, 0], [4 * K, K], [4 * K, 3 * K], [2 * K, 2 * K]], 'fill piece p1');
    b.line(0, K, 0, 3 * K, 'edge height');
    b.line(4 * K, K, 4 * K, 3 * K, 'edge height');
    b.label(-0.4, 2 * K + 0.3, 'g = 2', 'tag left');
    b.label(K, 1.3 * K, 'h = 2', 'tag');
    b.label(3 * K, 1.3 * K, 'h = 2', 'tag');
    readout.innerHTML = `Zwei Parallelogramme: Grundseite ist die senkrechte Seite (2 cm), Höhe ist der waagrechte Abstand (2 cm).<br>A = 2 · (2 · 2) = <strong>8 cm²</strong>`;
  };
  return {};
}

/* ---------- Seite 8: Übungsquiz ---------- */
function makeTask() {
  const kind = shuffle(['rect-a', 'rect-u', 'tri', 'para', 'l-a', 'l-u', 'concept'])[0];
  if (kind === 'concept') {
    const q = shuffle([
      ['Wie viel Zaun braucht man rund um einen Garten?', 'U'], ['Wie viel Rasen muss man im Garten säen?', 'A'],
      ['Wie viele Fliesen braucht man für den Boden?', 'A'], ['Wie lang ist die Bordüre rund ums Zimmer?', 'U'],
      ['Wie viel Farbe braucht man für die Wand?', 'A'], ['Wie lang ist der Rahmen um ein Bild?', 'U'],
    ])[0];
    return { kind, question: q[0], answer: q[1], draw: null };
  }
  if (kind === 'rect-a' || kind === 'rect-u') {
    const bw = rnd(2, 8), bh = rnd(2, 5);
    return { kind, question: kind === 'rect-a' ? 'Flächeninhalt des Rechtecks?' : 'Umfang des Rechtecks?', value: kind === 'rect-a' ? bw * bh : 2 * (bw + bh), unit: kind === 'rect-a' ? 'cm²' : 'cm',
      solution: kind === 'rect-a' ? `A = b · h = ${bw} · ${bh} = ${bw * bh} cm²` : `U = 2 · ${bw} + 2 · ${bh} = ${2 * (bw + bh)} cm`,
      draw: (b) => { b.rect(0, 0, bw * PER_CM, bh * PER_CM, 'shape'); b.label(bw, -0.35, `${bw} cm`, 'tag'); b.label(bw * PER_CM + 0.4, bh, `${bh} cm`, 'tag left'); }, cols: bw, rows: bh };
  }
  if (kind === 'tri') {
    let g = rnd(2, 8), hh = rnd(1, 4); if ((g * hh) % 2) g++;
    const top = rnd(0, g);
    return { kind, question: 'Flächeninhalt des Dreiecks?', value: g * hh / 2, unit: 'cm²', solution: `A = g · h : 2 = ${g} · ${hh} : 2 = ${g * hh / 2} cm²`,
      draw: (b) => { const Y = hh * PER_CM; b.poly([[0, Y], [g * PER_CM, Y], [top * PER_CM, 0]], 'shape tri'); b.line(top * PER_CM, 0, top * PER_CM, Y, 'edge height'); b.label(g, hh * PER_CM + 0.9, `g = ${g} cm`, 'tag'); b.label(top * PER_CM + 0.3, Y / 2 + 0.3, `h = ${hh} cm`, 'tag left'); }, cols: g, rows: hh };
  }
  if (kind === 'para') {
    const g = rnd(2, 6), hh = rnd(1, 4), s = rnd(1, 3);
    return { kind, question: 'Flächeninhalt des Parallelogramms?', value: g * hh, unit: 'cm²', solution: `A = g · h = ${g} · ${hh} = ${g * hh} cm² (die schräge Seite braucht man nicht)`,
      draw: (b) => { const Y = hh * PER_CM, S = s * PER_CM, G = g * PER_CM; b.poly([[0, Y], [G, Y], [G + S, 0], [S, 0]], 'shape para'); b.line(S, 0, S, Y, 'edge height'); b.label(g, hh * PER_CM + 0.9, `g = ${g} cm`, 'tag'); b.label(S + 0.3, Y / 2 + 0.3, `h = ${hh} cm`, 'tag left'); }, cols: g + s, rows: hh };
  }
  // L-Figur: grosses Rechteck W×H minus Ecke w×h oben rechts
  const W = rnd(5, 9), H = rnd(4, 6), w = rnd(2, W - 2), hh = rnd(1, H - 2);
  const area = W * H - w * hh, per = 2 * (W + H);
  const isA = kind === 'l-a';
  return { kind, question: isA ? 'Flächeninhalt der Figur? (Tipp: Teilflächen)' : 'Umfang der Figur? (Tipp: Alle Seiten, auch die ohne Zahl)', value: isA ? area : per, unit: isA ? 'm²' : 'm',
    solution: isA ? `Unten ${W} · ${H - hh} = ${W * (H - hh)}, links oben ${W - w} · ${hh} = ${(W - w) * hh}, zusammen ${area} m²` : `Oben ${W - w} + rechts ${H - hh}, dazu die Stufe ${w} + ${hh}, unten ${W}, links ${H}: ${per} m`,
    draw: (b) => {
      const k = 1; const P = [[0, 0], [(W - w) * k, 0], [(W - w) * k, hh * k], [W * k, hh * k], [W * k, H * k], [0, H * k]];
      b.poly(P, 'shape outline');
      b.label(W / 2, H + 0.9, `${W} m`, 'tag'); b.label(-0.4, H / 2 + 0.3, `${H} m`, 'tag left'); b.label((W - w) / 2, -0.3, `${W - w} m`, 'tag'); b.label(W + 0.4, hh + (H - hh) / 2 + 0.3, `${H - hh} m`, 'tag left');
      b.label(W - w / 2, hh - 0.3, `${w} m`, 'tag');
    }, cols: W, rows: H, nogrid: true };
}
function quizWidget(host) {
  const ROUNDS = 8;
  let round = 0, score = 0, task = null, answered = false, unit = null;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="figure"></div>
    <div class="question"></div>
    <div class="answer">
      <div class="concept hidden"><button class="btn big accent" data-c="U">🚧 Umfang</button><button class="btn big major" data-c="A">🟩 Flächeninhalt</button></div>
      <div class="numeric hidden">
        <input type="number" inputmode="numeric" class="num" placeholder="Zahl">
        <div class="chips units"><button class="chip" data-u="cm">cm</button><button class="chip" data-u="cm²">cm²</button><button class="chip" data-u="m">m</button><button class="chip" data-u="m²">m²</button></div>
        <button class="btn primary check">Prüfen</button>
      </div>
    </div>
    <div class="readout"></div>
    <div class="controls"><button class="btn primary next hidden">Nächste Aufgabe →</button></div>
    <div class="result hidden" style="text-align:center;margin-top:1rem"><div class="stars"></div><p class="msg" style="font-size:1.2rem;font-weight:600"></p><button class="btn primary again">Nochmal üben</button></div>`));
  const $ = (s) => host.querySelector(s);
  $('.units').querySelectorAll('.chip').forEach((c) => (c.onclick = () => { unit = c.dataset.u; $('.units').querySelectorAll('.chip').forEach((x) => x.classList.toggle('selected', x === c)); }));
  function next() {
    task = makeTask(); answered = false; unit = null;
    $('.round').textContent = `Aufgabe ${round + 1} von ${ROUNDS}`;
    $('.pts').textContent = `${score} richtig`;
    $('.question').textContent = task.question;
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    $('.next').classList.add('hidden');
    $('.figure').innerHTML = '';
    if (task.draw) {
      const b = board(task.nogrid ? task.cols : task.cols * PER_CM, task.nogrid ? task.rows : task.rows * PER_CM, { pad: 1.2 });
      if (task.nogrid) b.svg.querySelector('.grid').remove();
      task.draw(b);
      $('.figure').appendChild(b.svg);
    }
    $('.concept').classList.toggle('hidden', task.kind !== 'concept');
    $('.numeric').classList.toggle('hidden', task.kind === 'concept');
    $('.num').value = ''; $('.num').disabled = false; $('.check').disabled = false;
    $('.units').querySelectorAll('.chip').forEach((x) => { x.classList.remove('selected'); x.disabled = false; });
    $('.concept').querySelectorAll('.btn').forEach((x) => { x.disabled = false; x.classList.remove('ok', 'bad'); });
    if (task.kind !== 'concept') setTimeout(() => $('.num').focus(), 50);
  }
  function finishAnswer(ok, msg) {
    answered = true;
    if (ok) score++;
    $('.readout').className = 'readout ' + (ok ? 'ok' : 'bad');
    $('.readout').innerHTML = msg;
    $('.pts').textContent = `${score} richtig`;
    round++;
    $('.next').textContent = round < ROUNDS ? 'Nächste Aufgabe →' : 'Ergebnis →';
    $('.next').classList.remove('hidden');
    $('.num').disabled = true; $('.check').disabled = true;
    $('.units').querySelectorAll('.chip').forEach((x) => (x.disabled = true));
    $('.concept').querySelectorAll('.btn').forEach((x) => (x.disabled = true));
  }
  $('.concept').querySelectorAll('.btn').forEach((b) => (b.onclick = () => {
    if (answered) return;
    const ok = b.dataset.c === task.answer;
    b.classList.add(ok ? 'ok' : 'bad');
    finishAnswer(ok, ok ? '✅ Genau!' : `❌ Hier geht es um den ${task.answer === 'U' ? 'Umfang (eine Länge rundherum)' : 'Flächeninhalt (wie viel drinnen ist)'}.`);
  }));
  $('.check').onclick = () => {
    if (answered) return;
    const v = parseFloat(String($('.num').value).replace(',', '.'));
    if (Number.isNaN(v)) { $('.readout').className = 'readout'; $('.readout').textContent = 'Gib zuerst eine Zahl ein.'; return; }
    if (!unit) { $('.readout').className = 'readout'; $('.readout').textContent = 'Wähle noch die Einheit.'; return; }
    const numOk = Math.abs(v - task.value) < 0.01, unitOk = unit === task.unit;
    if (numOk && unitOk) finishAnswer(true, `✅ Richtig! ${task.solution}`);
    else if (numOk) finishAnswer(false, `❌ Die Zahl stimmt, aber die Einheit nicht: ${task.unit.includes('²') ? 'Flächen misst man in Quadrat-Einheiten' : 'Längen misst man in cm oder m, ohne ²'}. Richtig: ${task.value} ${task.unit}.`);
    else finishAnswer(false, `❌ Richtig wäre ${task.value} ${task.unit}. ${task.solution}`);
  };
  $('.num').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('.check').click(); });
  $('.next').onclick = () => (round < ROUNDS ? next() : finish());
  function finish() {
    $('.figure').innerHTML = ''; $('.question').textContent = ''; $('.answer').classList.add('hidden'); $('.readout').textContent = ''; $('.next').classList.add('hidden');
    const stars = score >= 8 ? 3 : score >= 6 ? 2 : score >= 4 ? 1 : 0;
    $('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('.msg').textContent = `${score} von ${ROUNDS} richtig! ` + (stars === 3 ? 'Bereit für die nächste Arbeit! 🎉' : stars >= 1 ? 'Gut, noch eine Runde?' : 'Schau dir die Seiten davor nochmal an und probier es gleich wieder.');
    $('.result').classList.remove('hidden');
    if (stars >= 2) confetti();
  }
  $('.again').onclick = () => { round = 0; score = 0; $('.result').classList.add('hidden'); $('.answer').classList.remove('hidden'); next(); };
  next();
  return {};
}

/* ---------- Seite 9: Merkkasten ---------- */
function merkWidget(host) {
  host.appendChild(h(`
    <div class="cards">
      <div class="card"><h4>▭ Rechteck</h4><div>A = b · h</div><div>U = 2 · b + 2 · h</div></div>
      <div class="card"><h4>◺ Dreieck</h4><div>A = g · h : 2</div><div class="sub">Höhe steht senkrecht auf g</div></div>
      <div class="card"><h4>▱ Parallelogramm</h4><div>A = g · h</div><div class="sub">h ist nicht die schräge Seite</div></div>
      <div class="card"><h4>⌐ Zusammengesetzt</h4><div>In Rechtecke zerlegen, Teilflächen addieren</div><div class="sub">oder grosses Rechteck minus Lücken</div></div>
    </div>
    <ul class="checklist">
      <li>☐ Umfang = Weg <strong>rundherum</strong> (cm, m). Flächeninhalt = was <strong>drinnen</strong> ist (cm², m²).</li>
      <li>☐ Beim Dreieck <strong>durch 2</strong> teilen. Sonst hast du das Rechteck ausgerechnet.</li>
      <li>☐ Beim Umfang <strong>alle</strong> Seiten zählen, auch die ohne Zahl. Fehlende Seiten aus den anderen berechnen.</li>
      <li>☐ Beim Raster: <strong>2 Kästchen = 1 cm</strong>, also 4 Kästchen = 1 cm².</li>
      <li>☐ Zum Schluss: Zahl <strong>und</strong> Einheit hinschreiben.</li>
    </ul>`));
  confetti();
  return {};
}

export default {
  id: 'flaeche',
  title: 'Flächeninhalt und Umfang',
  subject: 'Mathe',
  grade: 6,
  pages: [
    {
      title: 'Umfang oder Flächeninhalt?',
      widget: umfangFlaecheWidget,
      body: `<p>Das sind zwei ganz verschiedene Dinge, und sie werden gerne verwechselt.</p>
        <p>Der <strong>Umfang</strong> ist der Weg einmal <strong>rundherum</strong>: Wie lang ist der Zaun um den Garten? Das ist eine Länge, gemessen in <strong>cm</strong> oder <strong>m</strong>.</p>
        <p>Der <strong>Flächeninhalt</strong> ist das, was <strong>drinnen</strong> ist: Wie viel Rasen passt in den Garten? Das ist eine Fläche, gemessen in <strong>cm²</strong> oder <strong>m²</strong>. Man zählt, wie viele Quadrate von 1 cm × 1 cm hineinpassen.</p>`,
      tryThis: `<p>Drück beide Knöpfe. Beim Umfang läuft ein Weg am Rand entlang, beim Flächeninhalt füllen sich Quadrate. Seitenlängen zusammenzählen ergibt also immer den Umfang, nie die Fläche.</p>`,
    },
    {
      title: 'Das Rechteck',
      widget: rechteckWidget,
      body: `<p>Beim Rechteck ist es am einfachsten: <strong>A = b · h</strong> (Breite mal Höhe) und <strong>U = 2 · b + 2 · h</strong>, weil jede Seite zweimal vorkommt.</p>
        <p>Auf dem Raster gilt wie in der Arbeit: <strong>2 Kästchen = 1 cm</strong>. Ein Quadratzentimeter ist dann ein Block aus 2 × 2 = 4 Kästchen.</p>`,
      tryThis: `<p>Schieb die Regler und schau, wie sich A und U verändern. Findest du ein Rechteck, bei dem die Zahl für A und U gleich ist?</p>`,
    },
    {
      title: 'Dreieck: die Hälfte',
      widget: dreieckWidget,
      body: `<p>Jedes Dreieck ist genau die <strong>Hälfte</strong> eines Rechtecks mit derselben Grundseite g und derselben Höhe h. Darum:</p>
        <p><strong>A = g · h : 2</strong></p>
        <p>Die <strong>Höhe</strong> steht immer <strong>senkrecht</strong> auf der Grundseite (gestrichelte Linie), sie ist nicht die schräge Seite. Wer das «: 2» vergisst, rechnet das ganze Rechteck aus, wie in der Arbeit mit 8 cm² statt 4 cm².</p>`,
      tryThis: `<p>Drück auf «Rechteck drumherum zeigen» und verschieb die Spitze. Die Fläche bleibt gleich, solange g und h gleich bleiben.</p>`,
    },
    {
      title: 'Parallelogramm: verschieben',
      widget: parallelogrammWidget,
      body: `<p>Ein Parallelogramm ist ein schiefes Rechteck. Schneide links das Dreieck ab und setze es rechts wieder an, schon ist es ein Rechteck mit derselben Fläche.</p>
        <p><strong>A = g · h</strong>, wobei h die <strong>senkrechte Höhe</strong> ist. Die schräge Seite braucht man für die Fläche nicht, die ist nur eine Falle.</p>`,
      tryThis: `<p>Mach die Schräge grösser und kleiner. Die Fläche ändert sich nicht, nur die Form. Dann schneide und verschiebe.</p>`,
    },
    {
      title: 'Teilflächen: das Grundstück',
      widget: teilflaechenWidget,
      body: `<p>Das ist die Figur aus der Arbeit. Für so eine Figur gibt es keine Formel, aber einen Trick: <strong>In Rechtecke zerlegen</strong>, jedes einzeln rechnen, alles zusammenzählen.</p>
        <p>Es gibt mehrere Wege, die Figur zu zerschneiden. Alle führen zu <strong>68 m²</strong>. Wichtig ist nur: Zuerst Teilflächen einzeichnen, dann rechnen. Einfach alle Zahlen multiplizieren geht nicht.</p>`,
      tryThis: `<p>Probier alle drei Zerlegungen. Welche findest du am einfachsten? Die nimmst du in der nächsten Arbeit.</p>`,
    },
    {
      title: 'Umfang: alle Seiten zählen',
      widget: umfangWidget,
      body: `<p>Dieselbe Figur, jetzt der Umfang («Zaunlänge»). Die Figur hat <strong>8 Seiten</strong>, aber nur 6 sind beschriftet. Die anderen zwei muss man aus den übrigen Zahlen berechnen.</p>
        <p>Die obere Seite ist so lang wie die drei Teilstücke darunter zusammen: 4 + 7 + 3 = 14 m. Die innere senkrechte Seite ist 6 − 2 = 4 m, weil die linke Seite 6 m hat und der obere Streifen 10 − 8 = 2 m hoch ist.</p>`,
      tryThis: `<p>Tippe alle acht Seiten an, auch die mit dem Fragezeichen. Erst wenn alle dabei sind, stimmt der Umfang.</p>`,
    },
    {
      title: 'Die Pfeilfigur',
      widget: pfeilWidget,
      body: `<p>Auch Aufgabe 1a war eine zusammengesetzte Figur. Sie sieht kompliziert aus, besteht aber aus <strong>zwei Parallelogrammen</strong>.</p>
        <p>Bei jedem ist die senkrechte Seite die Grundseite (2 cm) und der waagrechte Abstand die Höhe (2 cm). Also 2 · 2 = 4 cm² pro Hälfte, zusammen <strong>8 cm²</strong>.</p>`,
      tryThis: `<p>Vergleiche beide Knöpfe. «Seiten addieren» ergibt eine Länge, keine Fläche. Und: Schräge Seiten sind auf dem Raster nicht genau 2 cm, auch wenn es so aussieht.</p>`,
    },
    {
      title: 'Üben wie in der Arbeit',
      widget: quizWidget,
      body: `<p>Acht Aufgaben, gemischt: Rechteck, Dreieck, Parallelogramm, zusammengesetzte Figur, Umfang und Fläche. Gib die Zahl ein und wähle die Einheit.</p>`,
      tryThis: `<p>Rechne auf Papier mit, wie in der Arbeit: Formel hinschreiben, Zahlen einsetzen, Ergebnis mit Einheit. Die Lösung erscheint nach jeder Aufgabe.</p>`,
    },
    {
      title: 'Merkkasten',
      widget: merkWidget,
      body: `<p>Das Wichtigste auf einen Blick. Geh die Checkliste vor der nächsten Arbeit einmal durch.</p>`,
    },
  ],
};

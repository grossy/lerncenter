// Lektion (Klasse 6, Biologie): Skelett, Gelenke und Muskeln
// Nach vier Arbeitsblättern: Das Skelett des Menschen, Das Skelett schützt und stützt,
// Gelenkaufbau, Das Gegenspielerprinzip. Fachbegriffe wie auf den Blättern, Texte in eigenen Worten,
// alle Abbildungen selbst gezeichnet.
import { h, confetti } from '../lesson.js';
import { playNote } from '../audio.js';

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickN = (a, n) => shuffle(a).slice(0, n);
const timersFor = () => { const l = []; return { after(ms, fn) { l.push(setTimeout(fn, ms)); }, clear() { l.forEach(clearTimeout); l.length = 0; } }; };
const r1 = (v) => Math.round(v * 10) / 10;
const narrow = () => !!globalThis.matchMedia?.('(max-width: 560px)').matches;

const blip = (m = 76) => playNote(m, { dur: 0.12, vel: 0.18, type: 'pluck' });
const yay = () => [72, 76, 79, 84].forEach((m, i) => playNote(m, { time: i * 0.09, dur: 0.18, vel: 0.2, type: 'pluck' }));
const nope = () => [62, 58].forEach((m, i) => playNote(m, { time: i * 0.14, dur: 0.2, vel: 0.2, type: 'pluck' }));

/* ---------- Stoff ---------- */
const SECTIONS = { kopf: 'Kopf', rumpf: 'Rumpf', glied: 'Gliedmassen' };
// n = Nummer auf dem Arbeitsblatt «Das Skelett des Menschen»
export const BONES = [
  { id: 'hand', n: 1, name: 'Handskelett', art: 'das', sec: 'glied', accept: ['Hand', 'Handknochen'], info: 'Die vielen kleinen Knochen der Hand.' },
  { id: 'schaedel', n: 2, name: 'Schädel', art: 'der', sec: 'kopf', accept: ['Schädelknochen'], info: 'Er schützt das Gehirn und die Augen.' },
  { id: 'oberarm', n: 3, name: 'Oberarmknochen', art: 'der', sec: 'glied', accept: ['Oberarm'], info: 'Ein langer Knochen (Röhrenknochen) zwischen Schulter und Ellbogen.' },
  { id: 'elle', n: 4, name: 'Elle', art: 'die', sec: 'glied', info: 'Einer der zwei Unterarmknochen. Sie liegt auf der Seite des kleinen Fingers.' },
  { id: 'speiche', n: 5, name: 'Speiche', art: 'die', sec: 'glied', info: 'Der zweite Unterarmknochen. Sie liegt auf der Seite des Daumens.' },
  { id: 'schluesselbein', n: 6, name: 'Schlüsselbein', art: 'das', sec: 'rumpf', girdle: 'arm', info: 'Bildet zusammen mit dem Schulterblatt den Schultergürtel.' },
  { id: 'schulterblatt', n: 7, name: 'Schulterblatt', art: 'das', sec: 'rumpf', girdle: 'arm', info: 'Ein platter Knochen. Bildet zusammen mit dem Schlüsselbein den Schultergürtel.' },
  { id: 'brustbein', n: 8, name: 'Brustbein', art: 'das', sec: 'rumpf', info: 'Bildet zusammen mit den Rippen den Brustkorb.' },
  { id: 'rippen', n: 9, name: 'Rippen', art: 'die', sec: 'rumpf', accept: ['Rippe'], info: 'Bilden zusammen mit dem Brustbein den Brustkorb. Er schützt Herz und Lunge.' },
  { id: 'wirbelsaeule', n: 10, name: 'Wirbelsäule', art: 'die', sec: 'rumpf', info: 'Sie besteht aus vielen Wirbeln und schützt das Rückenmark.' },
  { id: 'becken', n: 11, name: 'Becken', art: 'das', sec: 'rumpf', girdle: 'bein', accept: ['Beckenknochen'], info: 'Es schützt die Geschlechtsorgane.' },
  { id: 'oberschenkel', n: 12, name: 'Oberschenkelknochen', art: 'der', sec: 'glied', accept: ['Oberschenkel'], info: 'Ein langer Knochen (Röhrenknochen). Er stützt den Körper.' },
  { id: 'wadenbein', n: 13, name: 'Wadenbein', art: 'das', sec: 'glied', info: 'Der dünnere der zwei Unterschenkelknochen.' },
  { id: 'schienbein', n: 14, name: 'Schienbein', art: 'das', sec: 'glied', info: 'Der dickere der zwei Unterschenkelknochen.' },
  { id: 'kniescheibe', n: 15, name: 'Kniescheibe', art: 'die', sec: 'glied', info: 'Sie liegt vorne am Knie.' },
  { id: 'fuss', n: 16, name: 'Fussskelett', art: 'das', sec: 'glied', accept: ['Fuss', 'Fussknochen'], info: 'Die vielen kleinen Knochen des Fusses.' },
];
const byId = Object.fromEntries(BONES.map((b) => [b.id, b]));
const TWIN = { elle: 'speiche', speiche: 'elle', schienbein: 'wadenbein', wadenbein: 'schienbein', schluesselbein: 'schulterblatt', schulterblatt: 'schluesselbein', brustbein: 'rippen', rippen: 'brustbein', hand: 'fuss', fuss: 'hand', oberarm: 'oberschenkel', oberschenkel: 'oberarm' };
const shy = (name) => name.replace(/(.)(knochen|skelett|scheibe|säule|blatt)$/, '$1&shy;$2');
const isA = (b) => `${b.id === 'rippen' ? 'Das sind' : 'Das ist'} ${b.art} <strong>${b.name}</strong>.`;

// n = Nummer auf dem Arbeitsblatt «Gelenkaufbau»
export const JOINT = [
  { id: 'kopf', n: 1, name: 'Gelenkkopf', info: 'Das verdickte Ende des einen Knochens.' },
  { id: 'knorpel', n: 2, name: 'Gelenkknorpel', info: 'Eine weiche Schicht. Sie überzieht beide Gelenkflächen.' },
  { id: 'kapsel', n: 3, name: 'Gelenkkapsel', info: 'Sie ist fest und umschliesst die ganze Gelenkstelle.' },
  { id: 'spalt', n: 4, name: 'Gelenkspalt mit Gelenkschmiere', accept: ['Gelenkspalt', 'Gelenkschmiere', 'Gelenkspalt und Gelenkschmiere'], info: 'Er liegt zwischen Gelenkkopf und Gelenkpfanne. Die Gelenkschmiere füllt ihn aus.' },
  { id: 'pfanne', n: 5, name: 'Gelenkpfanne', info: 'Die Vertiefung im anderen Knochen. Darin sitzt der Gelenkkopf.' },
];

const ORGANS = [
  { name: 'Gehirn', art: 'das', bones: ['schaedel'], ok: 'Das Gehirn liegt gut geschützt im Schädel.' },
  { name: 'Augen', art: 'die', bones: ['schaedel'], ok: 'Die Augen liegen in den Augenhöhlen des Schädels.' },
  { name: 'Herz', art: 'das', bones: ['rippen', 'brustbein'], ok: 'Das Herz liegt im Brustkorb, hinter Rippen und Brustbein.' },
  { name: 'Lunge', art: 'die', bones: ['rippen', 'brustbein'], ok: 'Die Lunge liegt im Brustkorb, hinter Rippen und Brustbein.' },
  { name: 'Rückenmark', art: 'das', bones: ['wirbelsaeule'], ok: 'Das Rückenmark verläuft in der Wirbelsäule. Die Wirbel schützen es.' },
  { name: 'Geschlechtsorgane', art: 'die', bones: ['becken'], ok: 'Die Geschlechtsorgane werden vom Becken geschützt.' },
];

const KINDS = { lang: 'lang', kurz: 'kurz', platt: 'platt' };

/* ---------- Eingaben prüfen ---------- */
const norm = (s) => s.toLowerCase().replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/[^a-z]/g, '');
function near(a, b) { // Editierabstand höchstens 1
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, d = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++d > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return d + (a.length - i) + (b.length - j) <= 1;
}
/** 'ok' = stimmt, 'near' = ein Buchstabe daneben, 'no' = falsch */
function judge(input, names) {
  const v = norm(input), list = names.map(norm);
  if (list.includes(v)) return 'ok';
  return v.length >= 5 && list.some((n) => n.length >= 6 && near(v, n)) ? 'near' : 'no';
}
const hintOf = (name) => name.split(' ').map((p) => p[0] + '·'.repeat(p.length - 1)).join(' ');

/* ---------- Zeichnung: Skelett ---------- */
const SK = (() => {
  const CX = 250;
  const line = (d, w, knobs = []) => ({ t: 'l', d, w, knobs });
  const area = (d) => ({ t: 'a', d });
  const oval = (cx, cy, rx, ry, rot = 0) => ({ t: 'o', cx, cy, rx, ry, rot });
  const raw = (s) => ({ t: 'r', s });
  const both = (fn) => [-1, 1].map((s) => fn((d) => r1(CX + s * d)));

  const ribs = [];
  [26, 36, 44, 50, 54, 56, 56, 54, 50, 44].forEach((e, i) => {
    const y = 130 + i * 11.5, end = [7, 7, 7, 7, 7, 10, 16, 24, 30, 36][i];
    ribs.push(...both((x) => line(`M${x(8)} ${y} C${x(e * 0.6)} ${y - 7} ${x(e)} ${y - 2} ${x(e)} ${y + 9} C${x(e)} ${y + 18} ${x(Math.max(e * 0.55, end + 4))} ${y + 19} ${x(end)} ${y + 15}`, 4)));
  });
  let spine = '';
  for (let y = 108; y <= 296; y += 8) spine += `M243 ${y}h14v6h-14Z`;

  const parts = {
    schulterblatt: both((x) => area(`M${x(60)} 124 L${x(27)} 128 L${x(44)} 186 Z`)),
    becken: [
      ...both((x) => area(`M${x(0)} 304 L${x(10)} 300 C${x(28)} 282 ${x(54)} 284 ${x(58)} 306 C${x(60)} 328 ${x(46)} 342 ${x(30)} 346 C${x(30)} 360 ${x(20)} 372 ${x(6)} 372 L${x(0)} 366 Z`)),
      ...both((x) => raw(`<ellipse class="hole" cx="${x(17)}" cy="356" rx="6" ry="8"/>`)),
    ],
    wirbelsaeule: [area(spine), area('M241 304 L259 304 L250 332 Z')],
    rippen: ribs,
    brustbein: [area('M242 124 H258 L256 140 L254 141 L254 190 L250 202 L246 190 L246 141 L244 140 Z')],
    schluesselbein: both((x) => line(`M${x(7)} 122 Q${x(32)} 113 ${x(57)} 126`, 5)),
    oberarm: [line('M188 131 L114 141', 8, [[188, 131, 6.5], [113, 141, 6]]), line('M312 131 L324 236', 8, [[312, 131, 6.5], [324, 237, 6]])],
    elle: [line('M107 147 L74.4 66.3', 5, [[107, 146, 4.5]]), line('M317 245 L328 327', 5, [[317, 244, 4.5]])],
    speiche: [line('M115.6 135.7 L85.6 61.7', 5), line('M330 239 L340 325', 5)],
    hand: [
      oval(79, 56, 10, 6, -22), line('M87 53 L99 37 M84 50 L85 22 M79 49 L74 17 M74 50 L64 22 M70 53 L56 31', 3),
      oval(335, 335, 10, 6, 7), line('M343 337 L355 355 M340 341 L344 372 M336 342 L337 377 M332 341 L330 373 M328 339 L322 364', 3),
    ],
    oberschenkel: [line('M212 346 L142 364', 9, [[212, 345, 7.5], [141, 364, 7]]), line('M288 346 L272 470', 9, [[288, 345, 7.5], [272, 470, 7]])],
    schienbein: [line('M144 376 L162 499', 8, [[144, 377, 5.5]]), line('M268 490 L266 590', 8, [[268, 490, 5.5]])],
    wadenbein: [line('M132 386 L149 501', 4), line('M282 494 L279 592', 4)],
    kniescheibe: [oval(130, 368, 6.5, 8), oval(272, 479, 6.5, 8)],
    fuss: [
      oval(161, 511, 12, 8, 10), line('M156 517 L130 548 M158 519 L136 556 M160 520 L143 561 M163 520 L150 564 M166 519 L158 565', 3),
      oval(272, 602, 13, 8), line('M262 606 L256 630 M267 608 L263 633 M272 609 L271 634 M277 608 L279 633 M282 606 L286 630', 3),
    ],
    schaedel: [
      area('M216 58 C216 28 232 14 250 14 C268 14 284 28 284 58 C284 72 278 82 272 88 L270 104 C262 112 238 112 230 104 L228 88 C222 82 216 72 216 58 Z'),
      raw('<ellipse class="dk" cx="238" cy="62" rx="7" ry="8"/><ellipse class="dk" cx="262" cy="62" rx="7" ry="8"/><path class="dk" d="M250 72 L246 83 L254 83 Z"/><path class="tk" d="M236 96 H264 M241 92 v8 M247 92 v8 M253 92 v8 M259 92 v8"/>'),
    ],
  };
  // Reihenfolge: hinten zuerst
  const order = ['schulterblatt', 'becken', 'wirbelsaeule', 'rippen', 'brustbein', 'schluesselbein', 'oberarm', 'elle', 'speiche', 'hand', 'oberschenkel', 'schienbein', 'wadenbein', 'kniescheibe', 'fuss', 'schaedel'];
  // Tippflächen: kleine und verdeckte Knochen zuoberst
  const hitOrder = ['rippen', 'becken', 'wirbelsaeule', 'schaedel', 'oberarm', 'oberschenkel', 'schienbein', 'schulterblatt', 'brustbein', 'schluesselbein', 'elle', 'speiche', 'wadenbein', 'kniescheibe', 'hand', 'fuss'];
  // Nummernschild [x, y] und Zielpunkt [x, y]
  const nums = {
    hand: [124, 26, 88, 36], schaedel: [190, 34, 219, 46], oberarm: [152, 108, 152, 132], elle: [60, 118, 92, 112], speiche: [130, 86, 99, 91],
    schluesselbein: [206, 96, 212, 119], schulterblatt: [168, 170, 203, 158], brustbein: [166, 202, 248, 176], rippen: [166, 236, 197, 221],
    wirbelsaeule: [196, 272, 243, 274], becken: [170, 300, 196, 309], oberschenkel: [184, 388, 180, 357], wadenbein: [106, 432, 137, 430],
    schienbein: [192, 446, 158, 440], kniescheibe: [100, 356, 125, 367], fuss: [114, 528, 150, 535],
  };
  // Ausschnitt für schmale Bildschirme, damit der markierte Knochen gross genug ist
  const armBox = '44 4 220 200', chestBox = '150 90 200 180', legBox = '90 340 230 190';
  const focus = {
    hand: armBox, elle: armBox, speiche: armBox, oberarm: armBox, schaedel: '170 0 160 160',
    schluesselbein: chestBox, schulterblatt: chestBox, brustbein: chestBox, rippen: chestBox, wirbelsaeule: '150 90 200 250', becken: '150 230 200 170',
    oberschenkel: '90 300 230 200', kniescheibe: '90 300 230 200', schienbein: legBox, wadenbein: legBox, fuss: '100 470 220 174',
  };
  return { parts, order, hitOrder, nums, focus };
})();

function drawPart(p) {
  if (p.t === 'l') return `<path class="lo" d="${p.d}" stroke-width="${p.w + 3}"/>${p.knobs.map(([x, y, r]) => `<circle class="f" cx="${x}" cy="${y}" r="${r}"/>`).join('')}<path class="lf" d="${p.d}" stroke-width="${p.w}"/>`;
  if (p.t === 'a') return `<path class="f" d="${p.d}"/>`;
  if (p.t === 'o') return `<ellipse class="f" cx="${p.cx}" cy="${p.cy}" rx="${p.rx}" ry="${p.ry}" transform="rotate(${p.rot} ${p.cx} ${p.cy})"/>`;
  return p.s;
}
function hitPart(p, id) {
  if (p.t === 'l') return `<path class="hit ln" data-b="${id}" d="${p.d}" stroke-width="${Math.max(p.w + 9, 14)}"/>${p.knobs.map(([x, y, r]) => `<circle class="hit" data-b="${id}" cx="${x}" cy="${y}" r="${r + 3}"/>`).join('')}`;
  if (p.t === 'a') return `<path class="hit" data-b="${id}" d="${p.d}" stroke-width="6"/>`;
  if (p.t === 'o') return `<ellipse class="hit" data-b="${id}" cx="${p.cx}" cy="${p.cy}" rx="${p.rx + 4}" ry="${p.ry + 4}" transform="rotate(${p.rot} ${p.cx} ${p.cy})"/>`;
  return '';
}
const numTag = (key, n, [bx, by, ...targets], r = 10) => {
  let lines = '';
  for (let i = 0; i < targets.length; i += 2) lines += `<line x1="${bx}" y1="${by}" x2="${targets[i]}" y2="${targets[i + 1]}"/><circle class="dot" cx="${targets[i]}" cy="${targets[i + 1]}" r="2.6"/>`;
  return `<g class="num" data-b="${key}">${lines}<circle class="bd" cx="${bx}" cy="${by}" r="${r}"/><text x="${bx}" y="${by + r * 0.4}">${n}</text></g>`;
};

/** Skelett als SVG. tap(id) macht die Knochen antippbar, numbers zeigt die Nummern 1–16, focus zoomt auf schmalen Bildschirmen. */
function skeleton({ numbers = false, tap = null, focus = null } = {}) {
  const crop = focus && narrow();
  const vis = SK.order.map((id) => `<g class="bone" data-id="${id}">${SK.parts[id].map(drawPart).join('')}</g>`).join('');
  const hits = tap ? SK.hitOrder.map((id) => SK.parts[id].map((p) => hitPart(p, id)).join('')).join('') : '';
  const nums = numbers ? BONES.map((b) => numTag(b.id, b.n, SK.nums[b.id])).join('') : '';
  const el = h(`<svg class="fig skel${tap ? ' tap' : ''}${crop ? ' crop' : ''}" viewBox="${crop ? SK.focus[focus] : '40 0 330 644'}" role="img" aria-label="Skelett des Menschen">${vis}<g class="hits">${hits}</g><g class="nums">${nums}</g></svg>`);
  const g = Object.fromEntries([...el.querySelectorAll('.bone')].map((x) => [x.dataset.id, x]));
  if (tap) el.addEventListener('click', (e) => { const t = e.target.closest('[data-b]'); if (t) tap(t.dataset.b); });
  return {
    el,
    set: (id, c) => g[id].classList.add(c),
    unset: (id, c) => g[id].classList.remove(c),
    clear: () => Object.values(g).forEach((x) => x.setAttribute('class', 'bone')),
    num: (id) => el.querySelectorAll('.num').forEach((x) => x.classList.toggle('on', x.dataset.b === id)),
    /** Einen Knochen hervorheben, alle anderen blass. */
    mark(id, c = 'hl') { this.clear(); for (const b of BONES) g[b.id].classList.add(b.id === id ? c : 'dim'); },
  };
}

/* ---------- Zeichnung: Gelenk ---------- */
function joint({ numbers = true, tap = null } = {}) {
  const c = { x: 180, y: 120 }, rad = Math.PI / 180;
  const pt = (r, a) => `${r1(c.x + r * Math.cos(a * rad))} ${r1(c.y + r * Math.sin(a * rad))}`;
  const xy = (r, a) => [r1(c.x + r * Math.cos(a * rad)), r1(c.y + r * Math.sin(a * rad))];
  const ring = (ri, ro) => `M${pt(ro, 8)} A${ro} ${ro} 0 0 1 ${pt(ro, 172)} L${pt(ri, 172)} A${ri} ${ri} 0 0 0 ${pt(ri, 8)} Z`;
  const kap = (d) => `<path class="ko" d="${d}"/><path class="kf" d="${d}"/>`;
  const parts = {
    pfanne: `<path class="b" d="M78 130 L${pt(90, 172)} A90 90 0 0 0 ${pt(90, 8)} L282 130 C290 190 222 222 216 300 L144 300 C138 222 70 190 78 130 Z"/>`,
    kopf: '<path class="b" d="M152 0 L152 62 C152 84 122 92 122 120 A58 58 0 0 0 238 120 C238 92 208 84 208 62 L208 0 Z"/>',
    spalt: `<path class="s" d="${ring(69, 79)}"/>`,
    knorpel: `<path class="c" d="${ring(58, 69)}"/><path class="c" d="${ring(79, 90)}"/>`,
    kapsel: kap('M145 78 C112 86 86 106 82 132') + kap('M215 78 C248 86 274 106 278 132'),
  };
  const tags = {
    kopf: [180, 70], pfanne: [180, 262], kapsel: [42, 76, 102, 98],
    knorpel: [36, 236, ...xy(63.5, 126), ...xy(84.5, 128)], spalt: [324, 232, ...xy(74, 42)],
  };
  const vis = ['pfanne', 'kopf', 'spalt', 'knorpel', 'kapsel'].map((id) => `<g class="part" data-p="${id}">${parts[id]}</g>`).join('');
  const nums = numbers ? JOINT.map((p) => numTag(p.id, p.n, tags[p.id], 13)).join('') : '';
  const el = h(`<svg class="fig joint${tap ? ' tap' : ''}" viewBox="0 0 360 300" role="img" aria-label="Aufbau eines Gelenks">${vis}<g class="nums">${nums}</g></svg>`);
  const g = Object.fromEntries([...el.querySelectorAll('.part')].map((x) => [x.dataset.p, x]));
  if (tap) el.addEventListener('click', (e) => { const t = e.target.closest('[data-p],[data-b]'); if (t) tap(t.dataset.p || t.dataset.b); });
  return {
    el,
    mark(id) {
      for (const p of JOINT) g[p.id].setAttribute('class', 'part ' + (p.id === id ? 'hl' : 'dim'));
      el.querySelectorAll('.num').forEach((x) => x.classList.toggle('on', x.dataset.b === id));
    },
  };
}

/* ---------- Spielgerüst: Runden, Punkte, Sterne ---------- */
const VERDICT = ['Schau dir die Seiten davor nochmal an und probier es gleich wieder.', 'Ein guter Anfang. Noch eine Runde?', 'Gut gemacht. Noch eine Runde, dann sitzt es.', 'Stark! 🎉'];
function rounds(host, { total, task, label = 'Frage', auto = 0, again = 'Nochmal üben', verdict = VERDICT, onStart = null, onEnd = null }) {
  const t = timersFor();
  let round = 0, score = 0, open = false;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="stage"></div>
    <div class="readout why"></div>
    <div class="controls"><button class="btn primary go-on hidden">Weiter →</button></div>
    <div class="result hidden" style="text-align:center;margin-top:1rem"><div class="stars"></div><p class="msg" style="font-size:1.2rem"></p><div class="review"></div><button class="btn primary again">${again}</button></div>`));
  const $ = (s) => host.querySelector(s);
  const step = () => (round < total ? next() : finish());
  function answer(ok, msg) {
    if (!open) return;
    open = false;
    if (ok) { score++; yay(); } else nope();
    $('.readout').innerHTML = msg;
    $('.pts').textContent = `${score} richtig`;
    round++;
    if (ok && auto) { t.after(auto, step); return; }
    $('.go-on').textContent = round < total ? 'Weiter →' : 'Ergebnis →';
    $('.go-on').classList.remove('hidden');
    $('.go-on').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function next() {
    open = true;
    $('.round').textContent = `${label} ${round + 1} von ${total}`;
    $('.pts').textContent = `${score} richtig`;
    $('.readout').innerHTML = '';
    $('.go-on').classList.add('hidden');
    // Rückmeldung und Weiter-Knopf stehen neben der Abbildung, wenn die Aufgabe eine hat
    $('.stage').after($('.readout'), $('.controls'));
    $('.stage').classList.remove('hidden');
    $('.stage').innerHTML = '';
    task($('.stage'), answer, round);
    $('.stage .fig-side')?.append($('.readout'), $('.controls'));
    if (round) $('.score').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function finish() {
    $('.stage').after($('.readout'), $('.controls'));
    $('.stage').classList.add('hidden');
    $('.readout').innerHTML = '';
    $('.go-on').classList.add('hidden');
    const part = score / total, stars = part >= 0.9 ? 3 : part >= 0.7 ? 2 : part >= 0.5 ? 1 : 0;
    $('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('.msg').textContent = `${score} von ${total} richtig. ${verdict[stars]}`;
    $('.review').innerHTML = '';
    onEnd?.($('.review'), score, total);
    $('.result').classList.remove('hidden');
    if (stars >= 2) confetti();
  }
  function start() { t.clear(); round = 0; score = 0; onStart?.(); $('.result').classList.add('hidden'); next(); }
  $('.go-on').onclick = step;
  $('.again').onclick = start;
  start();
  return { destroy: () => t.clear() };
}

/* ---------- Aufgabentypen (in den Übungen und im Probe-Test) ---------- */
const figRow = (fig, html) => { const row = h(`<div class="fig-row"><div class="fig-col"></div><div class="fig-side">${html}</div></div>`); row.querySelector('.fig-col').appendChild(fig); return row; };

function choiceGrid(box, options, correct, done) {
  for (const o of options) {
    const btn = h(`<button class="btn">${shy(o)}</button>`);
    btn.onclick = () => {
      const ok = o === correct;
      btn.classList.add(ok ? 'ok' : 'bad');
      box.querySelectorAll('.btn').forEach((x) => { x.disabled = true; if (x.dataset.c) x.classList.add('ok'); });
      done(ok, o);
    };
    if (o === correct) btn.dataset.c = '1';
    box.appendChild(btn);
  }
}
/** Markierter Knochen, vier Namen zur Wahl. */
function nameTask(stage, answer, b) {
  const twin = TWIN[b.id];
  const wrong = [...(twin ? [byId[twin]] : []), ...shuffle(BONES.filter((x) => x.id !== b.id && x.id !== twin))].slice(0, 3);
  const sk = skeleton({ focus: b.id });
  sk.mark(b.id);
  const row = figRow(sk.el, `<div class="question">Wie heisst der markierte Knochen?</div><div class="choices grid"></div>`);
  choiceGrid(row.querySelector('.choices'), shuffle([b, ...wrong]).map((x) => x.name), b.name,
    (ok) => answer(ok, ok ? `✅ Richtig: ${b.name}. ${b.info}` : `❌ ${isA(b)} ${b.info}`));
  stage.appendChild(row);
}
/** Name gegeben, Knochen im Skelett antippen. */
function findTask(stage, answer, b) {
  let done = false;
  const sk = skeleton({
    tap(id) {
      if (done) return;
      done = true;
      const ok = id === b.id;
      sk.set(b.id, 'ok');
      if (!ok) sk.set(id, 'bad');
      answer(ok, ok ? `✅ Genau: ${b.name}.` : `❌ Das war: ${byId[id].name}. Grün markiert siehst du: <strong>${b.name}</strong>.`);
    },
  });
  const row = figRow(sk.el, `<div class="question">Tippe im Skelett auf: <strong>${b.name}</strong></div>`);
  row.classList.add('q-first');
  stage.appendChild(row);
}
/** Markierter Knochen, Name eintippen. */
function writeTask(stage, answer, b, { tries = 1 } = {}) {
  let left = tries, locked = false;
  const sk = skeleton({ focus: b.id });
  sk.mark(b.id);
  const row = figRow(sk.el, `<div class="question">Schreib den Namen des markierten Knochens.</div>
    <form class="typing"><input type="text" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Name …" aria-label="Name des Knochens"><button class="btn primary" type="submit">Prüfen</button></form>
    <div class="hint"></div>`);
  const input = row.querySelector('input'), hint = row.querySelector('.hint');
  const lock = () => { locked = true; input.disabled = true; row.querySelector('button').disabled = true; };
  row.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    if (locked) return;
    if (!input.value.trim()) { input.focus(); return; }
    const res = judge(input.value, [b.name, ...(b.accept || [])]);
    if (res !== 'no') { lock(); answer(true, res === 'ok' ? `✅ Richtig: ${b.name}.` : `✅ Fast perfekt. Achte auf die Schreibweise: <strong>${b.name}</strong>.`); return; }
    left--;
    if (left > 0) { nope(); hint.innerHTML = `Noch nicht. Tipp: <span class="hint-letters">${hintOf(b.name)}</span>`; input.select(); return; }
    lock();
    answer(false, `❌ Richtig wäre: <strong>${b.name}</strong>.`);
  };
  stage.appendChild(row);
  if (!narrow()) setTimeout(() => input.focus({ preventScroll: true }), 50);
}
/** Markierter Teil des Gelenks, fünf Begriffe zur Wahl. */
function jointTask(stage, answer, p) {
  const j = joint({ numbers: false });
  j.mark(p.id);
  const row = figRow(j.el, `<div class="question">Wie heisst der markierte Teil des Gelenks?</div><div class="choices grid"></div>`);
  choiceGrid(row.querySelector('.choices'), shuffle(JOINT).map((x) => x.name), p.name,
    (ok) => answer(ok, ok ? `✅ Richtig: ${p.name}. ${p.info}` : `❌ Das ist: <strong>${p.name}</strong>. ${p.info}`));
  stage.appendChild(row);
}
/** Frage mit Auswahl. q.a[0] ist die richtige Antwort. */
function mcTask(stage, answer, q) {
  stage.appendChild(h(`<div class="question">${q.q}</div>`));
  const box = h(`<div class="options"></div>`);
  choiceGrid(box, shuffle(q.a), q.a[0], (ok) => answer(ok, ok ? '✅ Richtig.' : `❌ Richtig ist: <strong>${q.a[0]}</strong>${/[.!?]$/.test(q.a[0]) ? '' : '.'}`));
  stage.appendChild(box);
}

/* ---------- Wortbank: Lücken oder Felder füllen ---------- */
function slotBank(scope, words, doneMsg, revealMsg = 'Das ist die Lösung. Lies den Text einmal laut und mach es dann nochmal selbst.') {
  const slots = [...scope.querySelectorAll('.gapslot')], bank = scope.querySelector('.bank'), readout = scope.querySelector('.readout');
  let active = 0;
  bank.innerHTML = '';
  const chips = shuffle(words).map((w) => { const c = h(`<button class="chip">${w}</button>`); c.onclick = () => put(c); bank.appendChild(c); return c; });
  const setActive = (i) => { active = i; slots.forEach((s, k) => s.classList.toggle('active', k === i)); };
  const firstEmpty = () => slots.findIndex((s) => !s.dataset.v);
  function clearSlot(s) {
    if (!s.dataset.v) return;
    const c = chips.find((x) => x.disabled && x.textContent === s.dataset.v);
    if (c) c.disabled = false;
    delete s.dataset.v;
    s.innerHTML = '&nbsp;';
    s.classList.remove('ok', 'bad', 'filled');
  }
  function fill(s, c) { clearSlot(s); s.dataset.v = c.textContent; s.textContent = c.textContent; s.classList.add('filled'); c.disabled = true; }
  function put(c) {
    if (active < 0) return;
    fill(slots[active], c);
    blip();
    readout.className = 'readout'; readout.textContent = '';
    setActive(firstEmpty());
  }
  slots.forEach((s, i) => (s.onclick = () => { clearSlot(s); setActive(i); }));
  scope.querySelector('.check').onclick = () => {
    let wrong = 0, empty = 0;
    slots.forEach((s) => {
      const v = s.dataset.v, ok = v === s.dataset.a;
      if (!v) empty++; else if (!ok) wrong++;
      s.classList.toggle('ok', !!v && ok); s.classList.toggle('bad', !!v && !ok);
    });
    readout.className = 'readout';
    if (!wrong && !empty) { readout.classList.add('ok'); readout.innerHTML = `✅ ${doneMsg}`; yay(); confetti(); return; }
    nope();
    readout.textContent = [wrong ? `${wrong} ${wrong === 1 ? 'Feld stimmt' : 'Felder stimmen'} noch nicht (rot). Tippe darauf, um es zu leeren.` : '', empty ? `${empty} ${empty === 1 ? 'Feld ist' : 'Felder sind'} noch leer.` : ''].filter(Boolean).join(' ');
  };
  scope.querySelector('.reveal').onclick = () => {
    slots.forEach(clearSlot);
    slots.forEach((s) => { const c = chips.find((x) => !x.disabled && x.textContent === s.dataset.a); fill(s, c); s.classList.add('ok'); });
    setActive(-1);
    readout.className = 'readout';
    readout.textContent = revealMsg;
  };
  scope.querySelector('.reset').onclick = () => { slots.forEach(clearSlot); setActive(0); readout.className = 'readout'; readout.textContent = ''; };
  setActive(0);
  return { focus: setActive };
}
const BANK_UI = `<div class="chips bank"></div>
  <div class="controls"><button class="btn primary check">Prüfen</button><button class="btn ghost reset">Leeren</button><button class="btn ghost reveal">Lösung zeigen</button></div>
  <div class="readout"></div>`;
/** Lückentext: {Wort} im Text wird zur Lücke, extra sind falsche Wörter in der Wortbank. */
const clozeWidget = (text, extra, doneMsg) => (host) => {
  const words = [];
  const html = text.replace(/\{([^}]+)\}/g, (_, w) => { words.push(w); return `<button class="gapslot" data-a="${w}" aria-label="Lücke ${words.length}">&nbsp;</button>`; });
  host.appendChild(h(`<div class="cloze">${html}</div>${BANK_UI}`));
  slotBank(host, [...words, ...extra], doneMsg);
  return {};
};

/* ---------- Seite 1: Das Skelett erkunden ---------- */
function exploreWidget(host) {
  const sk = skeleton({ numbers: true, tap: show });
  const row = figRow(sk.el, `<div class="info"><div class="info-flag">🦴</div><div><div class="info-name">Tippe auf einen Knochen</div><div class="info-sub">Oder auf eine Nummer oder einen Namen.</div></div></div><div class="vocab names"></div>`);
  row.classList.add('top');
  const list = row.querySelector('.names');
  for (const b of BONES) {
    const btn = h(`<button class="btn" data-b="${b.id}"><span class="nb">${b.n}</span>${shy(b.name)}</button>`);
    btn.onclick = () => show(b.id);
    list.appendChild(btn);
  }
  host.appendChild(row);
  function show(id) {
    const b = byId[id];
    sk.clear(); sk.set(id, 'hl'); sk.num(id);
    list.querySelectorAll('.btn').forEach((x) => x.classList.toggle('selected', x.dataset.b === id));
    row.querySelector('.info-flag').textContent = b.n;
    row.querySelector('.info-name').textContent = b.name;
    row.querySelector('.info-sub').textContent = `${SECTIONS[b.sec]} · ${b.info}`;
    blip();
  }
  return {};
}

/* ---------- Seite 2: Skelett beschriften ---------- */
function labelWidget(host) {
  const TASKS = { name: nameTask, find: findTask, write: writeTask };
  const seg = h(`<div class="segmented"><button data-m="name">Wählen</button><button data-m="find">Finden</button><button data-m="write">Schreiben</button></div>`);
  const box = h(`<div class="mode-box"></div>`);
  host.appendChild(seg); host.appendChild(box);
  let game = null;
  function start(mode) {
    game?.destroy();
    box.innerHTML = ''; box.className = 'mode-box';
    seg.querySelectorAll('button').forEach((b) => b.classList.toggle('selected', b.dataset.m === mode));
    let deck = [];
    game = rounds(box, {
      total: BONES.length, label: 'Knochen', auto: 1000,
      onStart: () => { deck = shuffle(BONES); },
      task: (stage, answer, i) => TASKS[mode](stage, answer, deck[i], { tries: 2 }),
    });
  }
  seg.querySelectorAll('button').forEach((b) => (b.onclick = () => start(b.dataset.m)));
  start('name');
  return { destroy: () => game?.destroy() };
}

/* ---------- Seite 3: Kopf, Rumpf, Gliedmassen ---------- */
function sortWidget(host) {
  const t = timersFor();
  let deck = [], i = 0, mistakes = 0, busy = false, sk = null;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="fig-row"><div class="fig-col"></div><div class="fig-side">
      <div class="score"><span class="round"></span><span class="pts"></span></div>
      <div class="sort-card"></div>
      <div class="choices bins-choice">${Object.entries(SECTIONS).map(([k, v]) => `<button class="btn" data-s="${k}">${v}</button>`).join('')}</div>
      <div class="readout why"></div>
      <div class="controls"><button class="btn primary go-on hidden">Weiter →</button><button class="btn primary again hidden">Nochmal sortieren</button></div>
    </div></div>
    <div class="bins">${Object.entries(SECTIONS).map(([k, v]) => `<div class="card"><h4>${v}</h4><ul class="plain" data-s="${k}"></ul></div>`).join('')}</div>`));
  const $ = (s) => host.querySelector(s);
  function start() {
    deck = shuffle(BONES); i = 0; mistakes = 0;
    host.querySelectorAll('.bins ul').forEach((u) => (u.innerHTML = ''));
    $('.again').classList.add('hidden'); $('.bins-choice').classList.remove('hidden');
    show();
  }
  function show() {
    busy = false;
    const b = deck[i];
    $('.round').textContent = `Knochen ${i + 1} von ${deck.length}`;
    $('.pts').textContent = `${mistakes} Fehler`;
    $('.sort-card').innerHTML = shy(b.name);
    $('.readout').innerHTML = ''; $('.go-on').classList.add('hidden');
    sk = skeleton({ focus: b.id }); sk.mark(b.id);
    $('.fig-col').innerHTML = ''; $('.fig-col').appendChild(sk.el);
  }
  function advance() {
    i++;
    if (i < deck.length) { show(); return; }
    $('.sort-card').textContent = '🎉 Alle 16 einsortiert';
    $('.bins-choice').classList.add('hidden'); $('.go-on').classList.add('hidden');
    $('.round').textContent = 'Fertig';
    $('.readout').innerHTML = `So sieht die Tabelle aus, mit ${mistakes} ${mistakes === 1 ? 'Fehler' : 'Fehlern'}. Vergleiche sie mit der Tabelle in deinem Heft.`;
    $('.again').classList.remove('hidden');
    sk.clear();
    confetti();
  }
  host.querySelectorAll('.bins-choice .btn').forEach((btn) => (btn.onclick = () => {
    if (busy || i >= deck.length) return;
    const b = deck[i], s = btn.dataset.s;
    const ok = s === b.sec || (b.girdle && s === 'glied');
    if (!ok) {
      mistakes++; nope();
      $('.pts').textContent = `${mistakes} Fehler`;
      btn.classList.add('bad'); t.after(400, () => btn.classList.remove('bad'));
      $('.readout').innerHTML = `❌ ${b.name}: nicht ${SECTIONS[s]}. Schau im Bild, wo der Knochen liegt, und versuch es nochmal.`;
      return;
    }
    busy = true; yay();
    host.querySelector(`.bins ul[data-s="${b.sec}"]`).appendChild(h(`<li>${b.name}${b.girdle ? ' *' : ''}</li>`));
    if (!b.girdle) { $('.readout').innerHTML = `✅ ${b.name}: ${SECTIONS[b.sec]}.`; t.after(800, advance); return; }
    const what = b.girdle === 'arm' ? 'Schlüsselbein und Schulterblatt bilden den Schultergürtel. Er verbindet den Rumpf mit den Armen.' : 'Das Becken verbindet den Rumpf mit den Beinen.';
    $('.readout').innerHTML = s === 'rumpf'
      ? `✅ Richtig: Rumpf. ${what}`
      : `✅ Das lasse ich gelten. ${what} In Schulbüchern steht ${b.girdle === 'arm' ? 'der Schultergürtel' : 'das Becken'} aber meistens beim <strong>Rumpf</strong>, darum trage ich es dort ein (*). Schau in deiner Tabelle im Heft nach, wie ihr es gemacht habt.`;
    $('.go-on').classList.remove('hidden');
  }));
  $('.go-on').onclick = advance;
  $('.again').onclick = start;
  start();
  return { destroy: () => t.clear() };
}

/* ---------- Seite 4: Das Skelett schützt ---------- */
function protectWidget(host) {
  let cur = 0;
  const solved = new Set();
  const sk = skeleton({ tap });
  const row = figRow(sk.el, `<div class="step-label">Welches Organ?</div><div class="chips organs">${ORGANS.map((o, i) => `<button class="chip" data-i="${i}">${o.name}</button>`).join('')}</div>
    <div class="question"></div><div class="readout why"></div>
    <div class="controls"><button class="btn ghost again hidden">Nochmal von vorn</button></div>`);
  row.classList.add('top');
  host.appendChild(row);
  const $ = (s) => host.querySelector(s);
  const chips = [...host.querySelectorAll('.organs .chip')];
  function select(i) {
    cur = i;
    chips.forEach((c, k) => c.classList.toggle('selected', k === i));
    const o = ORGANS[i];
    $('.question').innerHTML = i < 0 ? '' : `Welcher Teil des Skeletts schützt <strong>${o.art} ${o.name}</strong>? Tippe ihn im Bild an.`;
  }
  function tap(id) {
    if (cur < 0) return;
    const o = ORGANS[cur];
    if (!o.bones.includes(id)) {
      nope();
      sk.set(id, 'bad'); setTimeout(() => sk.unset(id, 'bad'), 500);
      $('.readout').innerHTML = `❌ ${byId[id].name}: Das passt hier nicht. Überleg, wo im Körper das Organ liegt.`;
      return;
    }
    yay();
    o.bones.forEach((b) => sk.set(b, 'red'));
    solved.add(cur);
    chips[cur].textContent = `✓ ${o.name}`;
    if (solved.size < ORGANS.length) {
      $('.readout').innerHTML = `✅ ${o.ok}`;
      select(ORGANS.findIndex((_, k) => !solved.has(k)));
      return;
    }
    select(-1);
    $('.readout').innerHTML = `✅ ${o.ok}<br>🎉 Alle sechs Organe sind geschützt. Rot sind jetzt <strong>Schädel, Brustkorb (Rippen und Brustbein), Wirbelsäule und Becken</strong>. Die Knochen der Arme und Beine bleiben hell: Sie schützen keine Organe, sie stützen.`;
    $('.again').classList.remove('hidden');
    confetti();
  }
  chips.forEach((c, i) => (c.onclick = () => { if (!solved.has(i)) select(i); }));
  $('.again').onclick = () => { solved.clear(); sk.clear(); chips.forEach((c, i) => (c.textContent = ORGANS[i].name)); $('.readout').innerHTML = ''; $('.again').classList.add('hidden'); select(0); };
  select(0);
  return {};
}

/* ---------- Seite 5: Lange, kurze und platte Knochen ---------- */
const mini = (inner, label) => `<svg class="fig skel mini" viewBox="0 0 120 96" role="img" aria-label="${label}"><g class="bone">${inner}</g></svg>`;
const KIND_CARDS = [
  { kind: 'lang', title: 'Langer Knochen (Röhrenknochen)', ex: 'Oberschenkelknochen', job: 'Lange Knochen stützen den Körper und bestimmen sein Erscheinungsbild.',
    svg: mini(drawPart({ t: 'l', d: 'M24 70 L96 28', w: 10, knobs: [[20, 66, 8], [27, 76, 8], [98, 22, 7.5], [101, 32, 7.5]] }), 'Ein langer, schlanker Knochen mit dicken Enden') },
  { kind: 'platt', title: 'Platter Knochen', ex: 'Schulterblatt', job: 'Platte Knochen schützen überwiegend lebenswichtige Organe.',
    svg: mini('<path class="f" d="M24 16 L98 24 L62 86 Z"/><path class="tk" d="M30 24 L88 34"/>', 'Ein flacher, dreieckiger Knochen') },
  { kind: 'kurz', title: 'Kurzer Knochen', ex: 'Wirbel (Wirbelknochen)', job: 'Die Wirbelkörper schützen das Rückenmark.',
    svg: mini(`${drawPart({ t: 'l', d: 'M60 34 L60 12 M44 42 L20 32 M76 42 L100 32', w: 6, knobs: [] })}<path class="f" d="M40 56 C36 30 84 30 80 56 Z"/><ellipse class="hole" cx="60" cy="46" rx="9" ry="7"/><ellipse class="f" cx="60" cy="68" rx="25" ry="15"/>`, 'Ein kurzer, gedrungener Knochen mit einem Loch in der Mitte') },
];
const KIND_ROWS = [['Schädel', 'platt'], ['Rippen', 'platt'], ['Brustbein', 'platt'], ['Becken', 'platt'], ['Oberarmknochen', 'lang'], ['Schienbein', 'lang'], ['Wirbel', 'kurz']];
function kindsWidget(host) {
  const t = timersFor();
  let open1 = KIND_CARDS.length, open2 = KIND_ROWS.length;
  const pickRow = (cls) => `<div class="chips ${cls}">${Object.entries(KINDS).map(([k, v]) => `<button class="chip" data-k="${k}">${v}</button>`).join('')}</div>`;
  host.appendChild(h(`
    <div class="step-label">1. Welche Knochenart ist das? Lang, kurz oder platt?</div>
    <div class="kinds">${shuffle(KIND_CARDS).map((c) => `<div class="card kind" data-k="${c.kind}">${c.svg}${pickRow('kind-pick')}<div class="kind-info hidden"><h4>${c.title}</h4><div>Beispiel: <strong>${shy(c.ex)}</strong></div><div class="sub">${c.job}</div></div></div>`).join('')}</div>
    <div class="stage2 hidden">
      <div class="step-label">2. Und diese Knochen aus dem Skelett?</div>
      <div class="kind-rows">${shuffle(KIND_ROWS).map(([name, k]) => `<div class="kind-row" data-k="${k}"><span class="kind-name">${shy(name)}</span>${pickRow('small-pick')}</div>`).join('')}</div>
    </div>
    <div class="readout why"></div>`));
  const readout = host.querySelector('.readout');
  function wire(scope, onOk) {
    scope.querySelectorAll('.chip').forEach((chip) => (chip.onclick = () => {
      if (scope.classList.contains('done')) return;
      if (chip.dataset.k !== scope.dataset.k) {
        nope(); chip.classList.add('wrong'); chip.disabled = true;
        readout.innerHTML = '❌ Nicht ganz. Schau auf die Form: lang und schlank, flach wie eine Platte oder kurz und gedrungen?';
        return;
      }
      blip(84);
      scope.classList.add('done');
      scope.querySelectorAll('.chip').forEach((x) => { x.disabled = true; x.classList.toggle('selected', x === chip); });
      onOk();
    }));
  }
  host.querySelectorAll('.kind').forEach((card) => wire(card, () => {
    card.querySelector('.kind-info').classList.remove('hidden');
    readout.innerHTML = '';
    if (--open1 === 0) { host.querySelector('.stage2').classList.remove('hidden'); readout.innerHTML = '✅ Alle drei erkannt. Weiter mit Teil 2.'; }
  }));
  host.querySelectorAll('.kind-row').forEach((rowEl) => wire(rowEl, () => {
    readout.innerHTML = '';
    if (--open2 > 0) return;
    yay(); confetti();
    readout.innerHTML = '✅ Geschafft. Merke: Organe werden <strong>meistens von platten Knochen</strong> geschützt (Schädel, Rippen, Brustbein, Becken). Die <strong>Ausnahme</strong> ist das Rückenmark: Es wird von den Wirbeln geschützt, und Wirbel sind kurze Knochen.';
  }));
  return { destroy: () => t.clear() };
}

/* ---------- Seite 7: Aufbau eines Gelenks ---------- */
function jointWidget(host) {
  const j = joint({ tap: show });
  const row = figRow(j.el, `<div class="chips parts">${JOINT.map((p) => `<button class="chip" data-p="${p.id}">${p.n} ${p.name}</button>`).join('')}</div>
    <div class="info"><div class="info-flag">🔍</div><div><div class="info-name">Tippe auf einen Teil des Gelenks</div><div class="info-sub">Oder auf einen der fünf Begriffe.</div></div></div>`);
  row.classList.add('top');
  host.appendChild(row);
  row.querySelectorAll('.chip').forEach((c) => (c.onclick = () => show(c.dataset.p)));
  function show(id) {
    const p = JOINT.find((x) => x.id === id);
    j.mark(id);
    row.querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c.dataset.p === id));
    row.querySelector('.info-flag').textContent = p.n;
    row.querySelector('.info-name').textContent = p.name;
    row.querySelector('.info-sub').textContent = p.info;
    blip();
  }
  return {};
}

/* ---------- Seite 8: Gelenk beschriften ---------- */
function jointLabelWidget(host) {
  const seg = h(`<div class="segmented"><button data-m="assign">Zuordnen</button><button data-m="write">Schreiben</button></div>`);
  const box = h(`<div class="mode-box"></div>`);
  host.appendChild(seg); host.appendChild(box);
  function assign() {
    let bank = null;
    const j = joint({ tap: (id) => bank?.focus(JOINT.findIndex((p) => p.id === id)) });
    const row = figRow(j.el, `<div class="assign">${JOINT.map((p) => `<div class="assign-row"><span class="nb">${p.n}</span><button class="gapslot" data-a="${p.name}" aria-label="Begriff für Nummer ${p.n}">&nbsp;</button></div>`).join('')}</div>${BANK_UI}`);
    row.classList.add('top');
    box.appendChild(row);
    bank = slotBank(box, JOINT.map((p) => p.name), 'Alle fünf Begriffe sitzen an der richtigen Stelle.', 'Das ist die Lösung. Leere die Felder und ordne die Begriffe nochmal selbst zu.');
  }
  function write() {
    const j = joint();
    const row = figRow(j.el, `<div class="assign">${JOINT.map((p, i) => `<div class="assign-row"><span class="nb">${p.n}</span><input class="write-in" type="text" data-i="${i}" autocomplete="off" autocapitalize="words" spellcheck="false" aria-label="Begriff für Nummer ${p.n}"></div>`).join('')}</div>
      <div class="controls"><button class="btn primary check">Prüfen</button><button class="btn ghost reveal">Lösung zeigen</button></div><div class="readout"></div>`);
    row.classList.add('top');
    box.appendChild(row);
    const inputs = [...box.querySelectorAll('.write-in')], readout = box.querySelector('.readout');
    function check() {
      let wrong = 0, empty = 0, sloppy = [];
      inputs.forEach((inp) => {
        const p = JOINT[+inp.dataset.i], v = inp.value.trim();
        const res = v ? judge(v, [p.name, ...(p.accept || [])]) : 'no';
        if (!v) empty++; else if (res === 'no') wrong++; else if (res === 'near') sloppy.push(p.name);
        inp.classList.toggle('ok', !!v && res !== 'no'); inp.classList.toggle('bad', !!v && res === 'no');
      });
      readout.className = 'readout';
      if (!wrong && !empty) {
        readout.classList.add('ok');
        readout.innerHTML = '✅ Alle fünf richtig.' + (sloppy.length ? ` Achte noch auf die Schreibweise: ${sloppy.join(', ')}.` : '');
        yay(); confetti(); return;
      }
      nope();
      readout.textContent = [wrong ? `${wrong} ${wrong === 1 ? 'Begriff stimmt' : 'Begriffe stimmen'} noch nicht (rot).` : '', empty ? `${empty} ${empty === 1 ? 'Feld ist' : 'Felder sind'} noch leer.` : ''].filter(Boolean).join(' ');
    }
    box.querySelector('.check').onclick = check;
    box.querySelector('.reveal').onclick = () => {
      inputs.forEach((inp) => { inp.value = JOINT[+inp.dataset.i].name; inp.classList.add('ok'); inp.classList.remove('bad'); });
      readout.className = 'readout'; readout.textContent = 'Das ist die Lösung. Deck sie ab und schreib die fünf Begriffe nochmal auf Papier.';
    };
    inputs.forEach((inp, i) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { if (i + 1 < inputs.length) inputs[i + 1].focus(); else check(); } }));
  }
  function start(mode) {
    box.innerHTML = '';
    seg.querySelectorAll('button').forEach((b) => b.classList.toggle('selected', b.dataset.m === mode));
    (mode === 'assign' ? assign : write)();
  }
  seg.querySelectorAll('button').forEach((b) => (b.onclick = () => start(b.dataset.m)));
  start('assign');
  return {};
}

/* ---------- Seite 10: Das Gegenspielerprinzip ---------- */
function armSvg(t, active) {
  const S = { x: 180, y: 62 }, E = { x: 180, y: 180 }, th = ((20 + 100 * t) * Math.PI) / 180;
  const dir = { x: Math.sin(th), y: Math.cos(th) }, n = { x: dir.y, y: -dir.x };
  const at = (k, off = 0) => `${r1(E.x + k * dir.x + off * n.x)} ${r1(E.y + k * dir.y + off * n.y)}`;
  // Muskel als Spindel zwischen zwei Punkten, side = Richtung der Wölbung
  function muscle(ax, ay, bx, by, base, len0, side, on) {
    const len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len, vx = -uy * side, vy = ux * side;
    const B = base * (len0 / len) ** 2.2;
    const p = (k, o) => `${r1(ax + ux * len * k + vx * o)} ${r1(ay + uy * len * k + vy * o)}`;
    return { mid: p(0.5, B * 0.45), svg: `<line class="ten" x1="${ax}" y1="${ay}" x2="${r1(bx)}" y2="${r1(by)}"/><path class="mus${on ? ' on' : ''}" d="M${p(0.14, 0)} C${p(0.32, B)} ${p(0.68, B)} ${p(0.86, 0)} C${p(0.68, -B * 0.25)} ${p(0.32, -B * 0.25)} ${p(0.14, 0)} Z"/>` };
  }
  const ix = E.x + 28 * dir.x, iy = E.y + 28 * dir.y, ox = E.x - 12 * dir.x - 7, oy = E.y - 12 * dir.y;
  const tri = muscle(170, 70, ox, oy, 22, 98.7, 1, active === 'tri'), bi = muscle(190, 68, ix, iy, 28, 99, -1, active === 'bi');
  const bones = [
    '<path class="f" d="M146 26 L206 38 L198 70 Q180 80 164 68 Z"/>',
    drawPart({ t: 'l', d: `M${S.x} ${S.y} L${E.x} ${E.y}`, w: 10, knobs: [[S.x, S.y, 8], [E.x, E.y, 7.5]] }),
    drawPart({ t: 'l', d: `M${at(-12, -5)} L${at(96, -4)}`, w: 5, knobs: [] }),
    drawPart({ t: 'l', d: `M${at(4, 5)} L${at(96, 4)}`, w: 5, knobs: [] }),
    `<circle class="f" cx="${r1(E.x + 104 * dir.x)}" cy="${r1(E.y + 104 * dir.y)}" r="9"/>`,
  ].join('');
  return `<g class="bone">${bones}</g>
    <circle class="ball" cx="${r1(E.x + 118 * dir.x + 12 * n.x)}" cy="${r1(E.y + 118 * dir.y + 12 * n.y)}" r="14"/>
    ${tri.svg}${bi.svg}
    <path class="lead" d="M142 116 L${tri.mid}"/><text x="140" y="120" text-anchor="end">Trizeps (Strecker)</text>
    <path class="lead" d="M232 48 L${bi.mid}"/><text x="226" y="44">Bizeps (Beuger)</text>
    <text class="abc" x="318" y="304" text-anchor="end">${active === 'bi' ? 'a' : 'b'}</text>`;
}
function armWidget(host) {
  let t = 1, active = 'bi', timer = 0;
  host.appendChild(h(`
    <svg class="fig arm" viewBox="0 0 340 320" role="img" aria-label="Arm mit Bizeps und Trizeps"></svg>
    <div class="controls arm-btns"><button class="btn bend">💪 Arm beugen (a)</button><button class="btn stretch">Arm strecken (b)</button></div>
    <div class="dir-cards arm-cards">
      <div class="dir-card"><h4>Bizeps (Beuger)</h4><div class="sub">Vorderseite des Oberarms</div><div class="ex bi"></div></div>
      <div class="dir-card"><h4>Trizeps (Strecker)</h4><div class="sub">Rückseite des Oberarms</div><div class="ex tri"></div></div>
    </div>
    <div class="readout why"></div>`));
  const svg = host.querySelector('svg'), $ = (s) => host.querySelector(s);
  const WORK = '<span class="tag work">angespannt</span> kurz und dick', REST = '<span class="tag rest">erschlafft, wird gedehnt</span> lang und dünn';
  function draw() { svg.innerHTML = armSvg(t, active); }
  function state() {
    $('.bend').classList.toggle('primary', active === 'bi'); $('.stretch').classList.toggle('primary', active === 'tri');
    $('.bi').innerHTML = active === 'bi' ? WORK : REST; $('.tri').innerHTML = active === 'tri' ? WORK : REST;
    $('.readout').innerHTML = active === 'bi'
      ? 'Der <strong>Beuger</strong> zieht sich zusammen und verkürzt sich: Der Unterarm hebt sich. Der Strecker ist erschlafft und wird dabei gedehnt.'
      : 'Der <strong>Strecker</strong> zieht sich zusammen und verkürzt sich: Der Unterarm senkt sich wieder. Der Beuger ist erschlafft und wird dabei gedehnt.';
  }
  function move(to, who) {
    clearTimeout(timer);
    active = who; state(); blip(who === 'bi' ? 79 : 72);
    const from = t, t0 = Date.now();
    const step = () => {
      const k = Math.min(1, (Date.now() - t0) / 700);
      t = from + (to - from) * (0.5 - Math.cos(Math.PI * k) / 2);
      draw();
      if (k < 1) timer = setTimeout(step, 16);
    };
    step();
  }
  $('.bend').onclick = () => move(1, 'bi');
  $('.stretch').onclick = () => move(0, 'tri');
  draw(); state();
  return { destroy: () => clearTimeout(timer) };
}

/* ---------- Seite 11: Satzteile verbinden ---------- */
const PAIRS = [
  ['Vorne am Oberarm liegt der Bizeps (Beuger),', 'der oben mit zwei Sehnen am Schulterblatt befestigt ist.', 'G', '«Bi» bedeutet zwei.'],
  ['Hinten am Oberarm liegt der Trizeps (Strecker),', 'der oben mit drei Sehnen befestigt ist.', 'EG', '«Tri» bedeutet drei.'],
  ['Bei gebeugtem Arm (a) ist der Beuger kurz und dick,', 'weil der Beuger sich zusammengezogen hat.', 'EN', 'Ein angespannter Muskel ist kurz und dick. Welcher Muskel hat in a gearbeitet?'],
  ['Bei gebeugtem Arm (a) ist der Strecker lang und dünn,', 'weil der Strecker dabei gedehnt wird.', 'S', 'Der Gegenspieler wird in die Länge gezogen.'],
  ['Wenn sich der Beuger verkürzt,', 'hebt sich der Unterarm.', 'PI', 'Der Satz beginnt mit «Wenn». Was passiert dann mit dem Unterarm?'],
  ['Bei gestrecktem Arm (b) ist der Strecker kurz und dick,', 'weil der Strecker sich zusammengezogen hat.', 'E', 'In b hat der andere Muskel gearbeitet.'],
  ['Bei gestrecktem Arm (b) ist der Beuger lang und dünn,', 'weil der Beuger erschlafft ist und gedehnt wird.', 'L', 'Der Beuger hat jetzt Pause.'],
  ['Wenn sich der Strecker verkürzt,', 'senkt sich der Unterarm wieder.', 'ER', 'Was macht der Unterarm, wenn der Strecker zieht?'],
];
function connectWidget(host) {
  let i = 0, mistakes = 0;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="solution-word" aria-label="Lösungswort">${PAIRS.map(() => '<span>&nbsp;</span>').join('')}</div>
    <div class="sort-card"></div>
    <div class="options"></div>
    <div class="readout why"></div>
    <ol class="steps solved"></ol>
    <div class="controls"><button class="btn primary again hidden">Nochmal verbinden</button></div>`));
  const $ = (s) => host.querySelector(s);
  function start() {
    i = 0; mistakes = 0;
    $('.solved').innerHTML = ''; $('.again').classList.add('hidden');
    host.querySelectorAll('.solution-word span').forEach((s) => { s.innerHTML = '&nbsp;'; s.classList.remove('on'); });
    const box = $('.options'); box.innerHTML = ''; box.classList.remove('hidden');
    shuffle(PAIRS.map((p, k) => k)).forEach((k) => {
      const btn = h(`<button class="btn">… ${PAIRS[k][1]}</button>`);
      btn.onclick = () => choose(k, btn);
      box.appendChild(btn);
    });
    show();
  }
  function show() {
    $('.round').textContent = `Satz ${i + 1} von ${PAIRS.length}`;
    $('.pts').textContent = `${mistakes} Fehler`;
    $('.sort-card').textContent = `${PAIRS[i][0]} …`;
    $('.readout').innerHTML = '';
  }
  function choose(k, btn) {
    if (i >= PAIRS.length) return;
    if (k !== i) {
      mistakes++; nope();
      $('.pts').textContent = `${mistakes} Fehler`;
      btn.classList.add('bad'); setTimeout(() => btn.classList.remove('bad'), 400);
      $('.readout').innerHTML = `❌ Das passt nicht. Tipp: ${PAIRS[i][3]}`;
      return;
    }
    yay();
    btn.remove();
    const slot = host.querySelectorAll('.solution-word span')[i];
    slot.textContent = PAIRS[i][2]; slot.classList.add('on');
    $('.solved').appendChild(h(`<li>${PAIRS[i][0]} ${PAIRS[i][1]}</li>`));
    i++;
    if (i < PAIRS.length) { show(); return; }
    $('.sort-card').textContent = '🎉 Lösungswort: GEGENSPIELER';
    $('.options').classList.add('hidden');
    $('.round').textContent = 'Fertig';
    $('.readout').innerHTML = `Alle acht Sätze verbunden, mit ${mistakes} ${mistakes === 1 ? 'Fehler' : 'Fehlern'}. Lies sie unten nochmal durch.`;
    $('.again').classList.remove('hidden');
    confetti();
  }
  $('.again').onclick = start;
  start();
  return {};
}

/* ---------- Seite 13: Lernkarten ---------- */
const CARDS = [
  ['Welche zwei wesentlichen Aufgaben hat das Skelett?', 'Es stützt den Körper und es schützt lebenswichtige Organe.'],
  ['In welche drei Abschnitte lässt sich der Körper gliedern?', 'Kopf, Rumpf und Gliedmassen (Arme und Beine).'],
  ['Welche drei Knochenarten unterscheidet man?', 'Lange, kurze und platte Knochen.'],
  ['Welche Aufgabe haben lange Knochen (Röhrenknochen)?', 'Sie stützen den Körper und bestimmen dadurch sein Erscheinungsbild.'],
  ['Von welcher Knochenart werden Organe meistens geschützt? Gibt es eine Ausnahme?', 'Meistens von platten Knochen. Ausnahme: Das Rückenmark wird von den Wirbeln geschützt, das sind kurze Knochen.'],
  ['Nenne je ein Beispiel für einen langen, einen platten und einen kurzen Knochen.', 'Lang: Oberschenkelknochen. Platt: Schulterblatt. Kurz: Wirbel.'],
  ['Welcher Knochen schützt Gehirn und Augen?', 'Der Schädel.'],
  ['Welche Knochen schützen Herz und Lunge?', 'Die Rippen und das Brustbein. Zusammen bilden sie den Brustkorb.'],
  ['Was schützt das Rückenmark, was die Geschlechtsorgane?', 'Die Wirbelsäule schützt das Rückenmark, das Becken die Geschlechtsorgane.'],
  ['Wie heissen die zwei Knochen im Unterarm?', 'Elle und Speiche.'],
  ['Wie heissen die zwei Knochen im Unterschenkel?', 'Schienbein (dick) und Wadenbein (dünn).'],
  ['Welche zwei Knochen bilden den Schultergürtel?', 'Schlüsselbein und Schulterblatt.'],
  ['Warum wird ein Körperteil bei einem Knochenbruch eingegipst?', 'Damit der gebrochene Knochen ruhig bleibt und die Teile in der richtigen Lage wieder zusammenwachsen können.'],
  ['Nenne die fünf Teile eines Gelenks.', 'Gelenkkopf, Gelenkpfanne, Gelenkknorpel, Gelenkspalt mit Gelenkschmiere, Gelenkkapsel.'],
  ['Was ist der Gelenkkopf, was die Gelenkpfanne?', 'Der Gelenkkopf ist das verdickte Ende des einen Knochens. Die Gelenkpfanne ist die Vertiefung im anderen Knochen, in der er sitzt.'],
  ['Was ist der Gelenkknorpel?', 'Eine weiche Schicht, die die Gelenkflächen überzieht.'],
  ['Wo liegt der Gelenkspalt und was ist darin?', 'Zwischen Gelenkkopf und Gelenkpfanne. Er ist mit Gelenkschmiere gefüllt.'],
  ['Welche Aufgabe hat die Gelenkkapsel?', 'Sie ist fest und umschliesst die Gelenkstelle.'],
  ['Warum gibt es beim Menschen bei der Bewegung keine Geräusche?', 'Weil die Knochen nicht aneinander reiben: Gelenkknorpel und Gelenkschmiere liegen dazwischen.'],
  ['Womit sind Muskeln an den Knochen befestigt?', 'Mit Sehnen.'],
  ['Was kann ein Muskel, was kann er nicht?', 'Er kann sich nur zusammenziehen (verkürzen). Von selbst strecken kann er sich nicht.'],
  ['Was bedeutet Gegenspielerprinzip?', 'Zwei Muskeln haben entgegengesetzte Aufgaben und arbeiten zusammen: Zieht sich der eine zusammen, wird der andere gedehnt.'],
  ['Wie heissen Beuger und Strecker am Oberarm, und wo liegen sie?', 'Der Bizeps (Beuger) liegt an der Vorderseite, der Trizeps (Strecker) an der Rückseite des Oberarms.'],
  ['Der Arm ist gebeugt. Wie sehen Beuger und Strecker aus?', 'Der Beuger ist angespannt: kurz und dick. Der Strecker ist gedehnt: lang und dünn.'],
  ['Der Arm wird gestreckt. Was passiert?', 'Der Strecker zieht sich zusammen, der Unterarm senkt sich. Der Beuger erschlafft und wird gedehnt.'],
];
function flashWidget(host) {
  let deck = [], known = 0;
  host.appendChild(h(`
    <div class="flash"><div class="flash-front"></div><div class="flash-back"></div></div>
    <div class="controls">
      <button class="btn primary big reveal">Antwort zeigen</button>
      <button class="btn ok-btn hidden knew">✅ Wusste ich</button>
      <button class="btn bad-btn hidden again">🔁 Nochmal</button>
      <button class="btn ghost hidden restart">Alle Karten nochmal</button>
      <span class="flash-count" style="color:var(--muted);font-weight:600"></span>
    </div>`));
  const $ = (s) => host.querySelector(s);
  const show = (...on) => ['reveal', 'knew', 'again', 'restart'].forEach((c) => $('.' + c).classList.toggle('hidden', !on.includes(c)));
  function render() {
    $('.flash-back').textContent = '';
    if (!deck.length) {
      $('.flash-front').textContent = '🎉 Alle Karten gelernt!';
      $('.flash-count').textContent = `${known} Karten sicher`;
      show('restart'); confetti();
      return;
    }
    $('.flash-front').textContent = deck[0][0];
    $('.flash-count').textContent = `${deck.length} übrig · ${known} sicher`;
    show('reveal');
  }
  $('.reveal').onclick = () => { $('.flash-back').textContent = deck[0][1]; show('knew', 'again'); };
  $('.knew').onclick = () => { deck.shift(); known++; blip(84); render(); };
  $('.again').onclick = () => { deck.push(deck.shift()); render(); };
  $('.restart').onclick = () => { deck = shuffle(CARDS); known = 0; render(); };
  deck = shuffle(CARDS);
  render();
  return {};
}

/* ---------- Seite 14: Probe-Test ---------- */
// a[0] ist richtig. topic: s = Skelett, k = Knochenarten und Schutz, g = Gelenk, m = Muskeln. p = Seite zum Nachlesen.
const QUESTIONS = [
  { topic: 's', p: 4, q: 'Welche zwei wesentlichen Aufgaben hat das Skelett?', a: ['Stützen und schützen', 'Bewegen und wachsen', 'Atmen und verdauen', 'Wärmen und kühlen'] },
  { topic: 's', p: 3, q: 'In welche drei Abschnitte lässt sich der Körper gliedern?', a: ['Kopf, Rumpf, Gliedmassen', 'Kopf, Bauch, Füsse', 'Schädel, Brustkorb, Becken', 'Arme, Beine, Rücken'] },
  { topic: 's', p: 3, q: 'Zu welchem Abschnitt gehört der Oberschenkelknochen?', a: ['Gliedmassen', 'Rumpf', 'Kopf'] },
  { topic: 's', p: 3, q: 'Zu welchem Abschnitt gehören Rippen und Wirbelsäule?', a: ['Rumpf', 'Gliedmassen', 'Kopf'] },
  { topic: 's', p: 1, q: 'Welche zwei Knochen liegen im Unterarm?', a: ['Elle und Speiche', 'Schienbein und Wadenbein', 'Schlüsselbein und Schulterblatt', 'Brustbein und Rippen'] },
  { topic: 's', p: 1, q: 'Welche zwei Knochen liegen im Unterschenkel?', a: ['Schienbein und Wadenbein', 'Elle und Speiche', 'Kniescheibe und Becken', 'Oberschenkelknochen und Wadenbein'] },
  { topic: 's', p: 1, q: 'Rippen und Brustbein bilden zusammen …', a: ['den Brustkorb', 'den Schultergürtel', 'das Becken', 'die Wirbelsäule'] },
  { topic: 's', p: 1, q: 'Warum wird ein Körperteil bei einem Knochenbruch meistens eingegipst?', a: ['Damit der Knochen ruhig bleibt und richtig zusammenwachsen kann.', 'Damit der Körperteil warm bleibt.', 'Damit die Muskeln stärker werden.', 'Damit das Gelenk besser geschmiert wird.'] },
  { topic: 'k', p: 4, q: 'Welcher Knochen schützt das Gehirn?', a: ['Schädel', 'Becken', 'Brustbein', 'Schulterblatt'] },
  { topic: 'k', p: 4, q: 'Welche Knochen schützen Herz und Lunge?', a: ['Rippen und Brustbein (Brustkorb)', 'Becken', 'Schlüsselbein und Schulterblatt', 'Elle und Speiche'] },
  { topic: 'k', p: 4, q: 'Was wird von der Wirbelsäule geschützt?', a: ['Das Rückenmark', 'Das Gehirn', 'Das Herz', 'Die Lunge'] },
  { topic: 'k', p: 4, q: 'Welcher Knochen schützt die Geschlechtsorgane?', a: ['Becken', 'Schädel', 'Rippen', 'Oberschenkelknochen'] },
  { topic: 'k', p: 5, q: 'Zu welcher Knochenart gehört der Oberschenkelknochen?', a: ['Lange Knochen (Röhrenknochen)', 'Platte Knochen', 'Kurze Knochen'] },
  { topic: 'k', p: 5, q: 'Zu welcher Knochenart gehört das Schulterblatt?', a: ['Platte Knochen', 'Lange Knochen (Röhrenknochen)', 'Kurze Knochen'] },
  { topic: 'k', p: 5, q: 'Zu welcher Knochenart zählen die Wirbelkörper?', a: ['Kurze Knochen', 'Platte Knochen', 'Lange Knochen (Röhrenknochen)'] },
  { topic: 'k', p: 5, q: 'Welche Aufgabe haben lange Knochen (Röhrenknochen)?', a: ['Sie stützen den Körper und bestimmen sein Erscheinungsbild.', 'Sie schützen das Gehirn.', 'Sie füllen den Gelenkspalt aus.', 'Sie ziehen sich zusammen und bewegen den Arm.'] },
  { topic: 'k', p: 5, q: 'Organe werden meistens von platten Knochen geschützt. Welche Ausnahme gibt es?', a: ['Das Rückenmark: Die Wirbel sind kurze Knochen.', 'Das Gehirn: Der Schädel ist ein Röhrenknochen.', 'Das Herz: Die Rippen sind kurze Knochen.', 'Es gibt keine Ausnahme.'] },
  { topic: 'g', p: 7, q: 'Wie heisst das verdickte Ende des Knochens in einem Gelenk?', a: ['Gelenkkopf', 'Gelenkpfanne', 'Gelenkkapsel', 'Gelenkknorpel'] },
  { topic: 'g', p: 7, q: 'Wie heisst die Vertiefung, in der der Gelenkkopf sitzt?', a: ['Gelenkpfanne', 'Gelenkspalt', 'Gelenkkapsel', 'Gelenkknorpel'] },
  { topic: 'g', p: 7, q: 'Welche weiche Schicht überzieht die Gelenkflächen?', a: ['Gelenkknorpel', 'Gelenkschmiere', 'Gelenkkapsel', 'Sehne'] },
  { topic: 'g', p: 7, q: 'Was füllt den Gelenkspalt aus?', a: ['Gelenkschmiere', 'Gelenkknorpel', 'Luft', 'Muskeln'] },
  { topic: 'g', p: 7, q: 'Was umschliesst die Gelenkstelle von aussen?', a: ['Die feste Gelenkkapsel', 'Der Gelenkknorpel', 'Die Gelenkpfanne', 'Der Bizeps'] },
  { topic: 'g', p: 7, q: 'Warum gibt es beim Menschen bei der Bewegung keine Geräusche?', a: ['Weil Gelenkknorpel und Gelenkschmiere verhindern, dass die Knochen aneinander reiben.', 'Weil Knochen weich sind.', 'Weil die Muskeln die Geräusche dämpfen.', 'Weil sich im Gelenk nichts bewegt.'] },
  { topic: 'm', p: 10, q: 'Womit sind Muskeln an den Knochen befestigt?', a: ['Mit Sehnen', 'Mit Gelenkknorpel', 'Mit Gelenkschmiere', 'Mit Rippen'] },
  { topic: 'm', p: 10, q: 'Was kann ein Muskel von selbst?', a: ['Sich zusammenziehen', 'Sich strecken', 'Beides', 'Keines von beiden'] },
  { topic: 'm', p: 10, q: 'Warum braucht jeder Muskel einen Gegenspieler?', a: ['Weil er sich nur zusammenziehen, aber nicht selbst strecken kann.', 'Weil ein Muskel allein zu schwach ist.', 'Weil sonst das Gelenk austrocknet.', 'Weil Muskeln sich nur strecken können.'] },
  { topic: 'm', p: 10, q: 'Wie heisst der Beuger am Oberarm, und wo liegt er?', a: ['Bizeps, an der Vorderseite', 'Trizeps, an der Rückseite', 'Bizeps, an der Rückseite', 'Trizeps, an der Vorderseite'] },
  { topic: 'm', p: 10, q: 'Der Arm ist gebeugt. Wie sieht der Beuger aus?', a: ['Kurz und dick, er ist angespannt.', 'Lang und dünn, er ist angespannt.', 'Kurz und dick, er ist erschlafft.', 'Lang und dünn, er ist gedehnt.'] },
  { topic: 'm', p: 10, q: 'Der Arm ist gebeugt. Was ist mit dem Strecker?', a: ['Er ist gedehnt: lang und dünn.', 'Er ist angespannt: kurz und dick.', 'Er ist angespannt: lang und dünn.', 'Er hat sich nicht verändert.'] },
  { topic: 'm', p: 10, q: 'Der Unterarm senkt sich wieder. Welcher Muskel verkürzt sich dabei?', a: ['Der Strecker (Trizeps)', 'Der Beuger (Bizeps)', 'Beide', 'Keiner'] },
  { topic: 'm', p: 11, q: 'Der Bizeps hat oben zwei Sehnen. Wie viele hat der Trizeps?', a: ['Drei', 'Eine', 'Zwei', 'Vier'] },
  { topic: 'm', p: 10, q: 'Auch am Oberschenkel gibt es Beuger und Strecker. Was passiert, wenn sich der Beuger zusammenzieht?', a: ['Das Bein wird im Knie gebeugt, der Strecker wird gedehnt.', 'Das Bein wird gestreckt, der Strecker zieht sich auch zusammen.', 'Beide Muskeln erschlaffen.', 'Das Knie kann sich nicht mehr bewegen.'] },
];
const byTopic = (t, n) => pickN(QUESTIONS.filter((q) => q.topic === t), n);
function testWidget(host) {
  let tasks = [], missed = [];
  const run = {
    name: (st, an, x) => nameTask(st, an, x), find: (st, an, x) => findTask(st, an, x), write: (st, an, x) => writeTask(st, an, x),
    joint: (st, an, x) => jointTask(st, an, x), mc: (st, an, x) => mcTask(st, an, x),
  };
  const note = (k) => (k.type === 'mc' ? `${k.x.q} → <strong>${k.x.a[0]}</strong> <span class="sub">(Seite ${k.x.p})</span>`
    : k.type === 'joint' ? `Gelenk: <strong>${k.x.name}</strong> <span class="sub">(Seite 7 und 8)</span>`
      : `Skelett: <strong>${k.x.name}</strong> <span class="sub">(Seite 1 und 2)</span>`);
  function build() {
    const bones = shuffle(BONES);
    tasks = shuffle([
      ...bones.slice(0, 3).map((x) => ({ type: 'name', x })), ...bones.slice(3, 5).map((x) => ({ type: 'find', x })), ...bones.slice(5, 7).map((x) => ({ type: 'write', x })),
      ...pickN(JOINT, 2).map((x) => ({ type: 'joint', x })),
      ...[...byTopic('s', 2), ...byTopic('k', 2), ...byTopic('g', 2), ...byTopic('m', 3)].map((x) => ({ type: 'mc', x })),
    ]);
    missed = [];
  }
  const game = rounds(host, {
    total: 18, label: 'Frage', again: 'Neuer Probe-Test',
    verdict: ['Das reicht noch nicht. Geh die Seiten in der Liste nochmal durch und mach dann einen neuen Test.', 'Die Hälfte sitzt. Wiederhole, was in der Liste steht.', 'Gut gemacht. Schau dir die Liste an, dann bist du bereit.', 'Bereit für die Arbeit! 🎉'],
    onStart: build,
    task(stage, answer, i) {
      const k = tasks[i];
      run[k.type](stage, (ok, msg) => { if (!ok) missed.push(k); answer(ok, msg); }, k.x);
    },
    onEnd(box) {
      if (!missed.length) { box.innerHTML = '<p>Kein einziger Fehler. Mach morgen nochmal einen Test, es kommen andere Fragen.</p>'; return; }
      box.innerHTML = `<h4>Das solltest du nochmal anschauen</h4><ul class="plain">${missed.map((k) => `<li>${note(k)}</li>`).join('')}</ul>`;
    },
  });
  return game;
}

/* ---------- Seite 15: Merkseite ---------- */
function summaryWidget(host) {
  const sk = skeleton({ numbers: true }), j = joint();
  host.appendChild(h(`
    <div class="cards">
      <div class="card"><h4>🦴 Zwei Aufgaben</h4><div><span class="term">stützen</span>Röhrenknochen stützen den Körper und bestimmen sein Erscheinungsbild.</div><div><span class="term">schützen</span>Überwiegend platte Knochen schützen lebenswichtige Organe.</div></div>
      <div class="card"><h4>🧍 Drei Abschnitte</h4><div><strong>Kopf</strong>: Schädel</div><div><strong>Rumpf</strong>: Wirbelsäule, Brustkorb (Rippen, Brustbein), Schultergürtel, Becken</div><div><strong>Gliedmassen</strong>: Arme und Beine</div></div>
      <div class="card"><h4>📏 Drei Knochenarten</h4><div><strong>lang</strong> (Röhrenknochen): Oberschenkelknochen</div><div><strong>platt</strong>: Schulterblatt</div><div><strong>kurz</strong>: Wirbel</div></div>
      <div class="card"><h4>🛡️ Wer schützt was?</h4><div>Gehirn, Augen: <strong>Schädel</strong></div><div>Herz, Lunge: <strong>Brustkorb</strong></div><div>Rückenmark: <strong>Wirbelsäule</strong></div><div>Geschlechtsorgane: <strong>Becken</strong></div><div class="sub">Ausnahme: Wirbel sind kurze Knochen.</div></div>
      <div class="card"><h4>💪 Muskeln</h4><div>Mit <strong>Sehnen</strong> am Knochen befestigt.</div><div>Können sich nur <strong>zusammenziehen</strong>, nicht selbst strecken.</div><div><strong>Bizeps</strong> = Beuger, vorne. <strong>Trizeps</strong> = Strecker, hinten.</div><div class="sub">Angespannt: kurz und dick. Gedehnt: lang und dünn.</div></div>
      <div class="card"><h4>🔁 Gegenspielerprinzip</h4><div>Zwei Muskeln mit entgegengesetzten Aufgaben arbeiten zusammen.</div><div class="sub">Beuger zieht: Arm beugt sich, Strecker wird gedehnt. Strecker zieht: Arm streckt sich, Beuger wird gedehnt.</div></div>
    </div>
    <div class="fig-row top key-row"><div class="fig-col sk"></div><div class="fig-side"><h4>Das Skelett des Menschen</h4><ol class="key-list">${BONES.map((b) => `<li>${b.name}</li>`).join('')}</ol></div></div>
    <div class="fig-row top key-row"><div class="fig-col jt"></div><div class="fig-side"><h4>Aufbau eines Gelenks</h4><ol class="key-list one">${JOINT.map((p) => `<li><strong>${p.name}</strong>: ${p.info}</li>`).join('')}</ol></div></div>
    <ul class="checklist">
      <li>☐ Ich kann alle 16 Teile des Skeletts beschriften und richtig schreiben.</li>
      <li>☐ Ich kann die Knochen in die Tabelle Kopf, Rumpf, Gliedmassen einordnen.</li>
      <li>☐ Ich weiss, welche Knochen welche Organe schützen, und kenne die drei Knochenarten.</li>
      <li>☐ Ich kann die fünf Teile eines Gelenks beschriften und erklären, warum Gelenke keine Geräusche machen.</li>
      <li>☐ Ich kann das Gegenspielerprinzip am Arm erklären: Beuger und Strecker, angespannt und gedehnt.</li>
    </ul>`));
  host.querySelector('.sk').appendChild(sk.el);
  host.querySelector('.jt').appendChild(j.el);
  return {};
}

export default {
  id: 'skelett',
  title: 'Skelett, Gelenke und Muskeln',
  subject: 'Biologie',
  grade: 6,
  pages: [
    {
      title: 'Das Skelett des Menschen',
      widget: exploreWidget,
      body: `<p>Das Skelett des Menschen besteht aus einer Vielzahl von Knochen. Auf dem Arbeitsblatt sind 16 Teile mit Nummern versehen. Genau diese 16 musst du benennen können.</p>
        <p>Einige gehören zusammen: <strong>Elle und Speiche</strong> liegen im Unterarm, <strong>Schienbein und Wadenbein</strong> im Unterschenkel. <strong>Schlüsselbein und Schulterblatt</strong> bilden den Schultergürtel, <strong>Rippen und Brustbein</strong> den Brustkorb.</p>`,
      tryThis: `<p>Tippe alle 16 Teile an und sprich die Namen laut. Einige kannst du an dir selbst ertasten: Schlüsselbein, Brustbein, Rippen, Kniescheibe und Schienbein.</p>`,
    },
    {
      title: 'Skelett beschriften',
      widget: labelWidget,
      body: `<p>Jetzt bist du dran, in drei Stufen. Bei <strong>Wählen</strong> ist ein Knochen markiert, und du suchst den Namen aus. Bei <strong>Finden</strong> bekommst du den Namen und tippst den Knochen an. Bei <strong>Schreiben</strong> tippst du den Namen selbst ein, so wie in der Arbeit.</p>`,
      tryThis: `<p>Mach die Stufe «Schreiben» so oft, bis alle 16 ohne Tipp klappen. Achte auf die Schreibweise: Schlüsselbein, Wirbelsäule, Kniescheibe.</p>`,
    },
    {
      title: 'Kopf, Rumpf, Gliedmassen',
      widget: sortWidget,
      body: `<p>Der Körper des Menschen lässt sich in drei Abschnitte gliedern: <strong>Kopf</strong>, <strong>Rumpf</strong> und <strong>Gliedmassen</strong>. Die Gliedmassen sind die Arme und die Beine.</p>
        <p>Ordne jeden Knochen dem richtigen Abschnitt zu. Unten entsteht dabei die Tabelle, die du auch im Heft angelegt hast.</p>`,
      tryThis: `<p>Decke die Tabelle ab und schreib sie aus dem Kopf auf ein Blatt: drei Spalten, 16 Einträge. Vergleiche danach.</p>`,
    },
    {
      title: 'Das Skelett schützt',
      widget: protectWidget,
      body: `<p>Die Knochen des Skeletts haben zwei wesentliche Aufgaben: Sie <strong>stützen</strong> den Körper, und sie <strong>schützen</strong> lebenswichtige Organe.</p>
        <p>Auf dem Arbeitsblatt hast du die Knochen rot angemalt, die Gehirn, Herz, Augen, Lunge, Rückenmark und Geschlechtsorgane schützen. Mach das hier nochmal: Wähle ein Organ und tippe den passenden Teil des Skeletts an.</p>`,
      tryThis: `<p>Schau dir am Schluss das rote Muster an. Welche Teile des Skeletts sind rot, welche bleiben hell?</p>`,
    },
    {
      title: 'Lange, kurze und platte Knochen',
      widget: kindsWidget,
      body: `<p>Die Knochen haben unterschiedliche Formen und Grössen. Man unterscheidet <strong>lange</strong>, <strong>kurze</strong> und <strong>platte</strong> Knochen. Lange Knochen heissen auch <strong>Röhrenknochen</strong>.</p>
        <p>Die Form passt zur Aufgabe: Röhrenknochen stützen den Körper und bestimmen sein Erscheinungsbild. Platte Knochen schützen überwiegend die lebenswichtigen Organe. Die Wirbelkörper zählen zu den kurzen Knochen und schützen das Rückenmark.</p>`,
      tryThis: `<p>Beantworte nach dem zweiten Teil diese Frage in einem Satz: Von welcher Knochenart werden die Organe meistens geschützt, und welche Ausnahme gibt es?</p>`,
    },
    {
      title: 'Lückentext: Das Skelett schützt und stützt',
      widget: clozeWidget(
        'Das Skelett des Menschen besteht aus vielen Knochen mit unterschiedlichen Formen und Grössen. Die Knochen haben {zwei} wesentliche Aufgaben. Erstens {stützen} die {Röhrenknochen} den Körper und bestimmen dadurch sein {Erscheinungsbild}. Zweitens {schützen} überwiegend die {platten} Knochen die lebenswichtigen {Organe}. Die Wirbelkörper zählen zu den {kurzen} Knochen. Sie schützen das {Rückenmark}.',
        ['langen', 'Gelenke'], 'Alle Lücken stimmen. Lies den Text einmal laut vor.'),
      body: `<p>Tippe ein Wort aus der Wortbank an, es springt in die markierte Lücke. Zwei Wörter bleiben übrig. Mit einem Tipp auf eine Lücke leerst du sie wieder.</p>`,
      tryThis: `<p>Pass bei «stützen» und «schützen» auf. Die beiden Wörter klingen ähnlich, bedeuten aber etwas anderes.</p>`,
    },
    {
      title: 'Aufbau eines Gelenks',
      widget: jointWidget,
      body: `<p>Die verschiedenen Gelenke deines Körpers sind ähnlich aufgebaut. Das verdickte Ende des einen Knochens, der <strong>Gelenkkopf</strong>, sitzt in einer Vertiefung des anderen Knochens, der <strong>Gelenkpfanne</strong>. Beide Gelenkflächen sind mit einer weichen Schicht überzogen, dem <strong>Gelenkknorpel</strong>.</p>
        <p>Dazwischen liegt der <strong>Gelenkspalt mit Gelenkschmiere</strong>. Aussen umschliesst die feste <strong>Gelenkkapsel</strong> die Gelenkstelle.</p>
        <p>Die Forscherfrage dazu: Warum gibt es beim Menschen bei der Bewegung keine Geräusche? Weil die Knochen nicht aneinander reiben. Gelenkknorpel und Gelenkschmiere liegen dazwischen.</p>`,
      tryThis: `<p>Mach eine Faust und leg die andere Hand wie eine Schale darum. Die Faust ist der Gelenkkopf, die Schale die Gelenkpfanne. Dreh die Faust: So bewegt sich ein Gelenk.</p>`,
    },
    {
      title: 'Gelenk beschriften',
      widget: jointLabelWidget,
      body: `<p>Ordne die fünf Begriffe den Zahlen 1 bis 5 zu, wie auf dem Arbeitsblatt. Bei <strong>Zuordnen</strong> tippst du einen Begriff an, er springt ins markierte Feld. Bei <strong>Schreiben</strong> tippst du die Begriffe selbst ein.</p>`,
      tryThis: `<p>Bei Nummer 2 zeigen zwei Striche auf zwei Schichten. Beide gehören zum selben Begriff. Überleg, warum es diese Schicht zweimal gibt.</p>`,
    },
    {
      title: 'Lückentext: Das Gelenk',
      widget: clozeWidget(
        'Alle Gelenke im Körper sind ähnlich aufgebaut. Das verdickte Ende des einen Knochens heisst {Gelenkkopf}. Es sitzt in einer Vertiefung des anderen Knochens, der {Gelenkpfanne}. Beide Gelenkflächen sind von einer weichen Schicht überzogen, dem {Gelenkknorpel}. Zwischen Gelenkkopf und Gelenkpfanne liegt der {Gelenkspalt}. Er ist mit {Gelenkschmiere} ausgefüllt. Aussen umschliesst eine feste {Gelenkkapsel} die Gelenkstelle.',
        ['Sehne'], 'Alle Lücken stimmen. So ist ein Gelenk aufgebaut.'),
      body: `<p>Derselbe Stoff als Lückentext. Ein Wort in der Wortbank passt nirgends.</p>`,
      tryThis: `<p>Erkläre danach jemandem zu Hause mit eigenen Worten, wie ein Gelenk aufgebaut ist. Wenn das ohne Spicken geht, sitzt es.</p>`,
    },
    {
      title: 'Das Gegenspielerprinzip',
      widget: armWidget,
      body: `<p>Muskeln ermöglichen zusammen mit den Gelenken die Bewegung. Sie sind mit <strong>Sehnen</strong> an den Knochen befestigt. Ein Muskel kann sich nur <strong>zusammenziehen</strong>, von selbst strecken kann er sich nicht. Darum braucht jeder Muskel einen Gegenmuskel, der ihn wieder dehnt.</p>
        <p>Am Oberarm sind das der <strong>Bizeps (Beuger)</strong> an der Vorderseite und der <strong>Trizeps (Strecker)</strong> an der Rückseite. Zwei Muskeln mit entgegengesetzten Aufgaben, die zusammenarbeiten: Das nennt man <strong>Gegenspielerprinzip</strong>.</p>
        <p>Am Oberschenkel ist es genauso. Zieht sich dort der Beuger zusammen, wird das Bein im Knie gebeugt und der Strecker gedehnt. Zieht sich der Strecker zusammen, wird das Bein gestreckt.</p>`,
      tryThis: `<p>Leg eine Hand auf deinen Oberarm und beuge den anderen Arm langsam. Vorne spürst du, wie der Bizeps dick und hart wird. Streck den Arm gegen einen Tisch nach unten: Jetzt arbeitet hinten der Trizeps.</p>`,
    },
    {
      title: 'Satzteile verbinden',
      widget: connectWidget,
      body: `<p>Wie auf dem Arbeitsblatt: Zu jedem Satzanfang gehört ein Ende. Wähle das passende Ende aus. Für jeden richtigen Satz bekommst du Buchstaben, am Schluss ergibt sich ein Lösungswort.</p>
        <p>(a) ist der gebeugte Arm, (b) der gestreckte Arm, wie auf der Seite davor.</p>`,
      tryThis: `<p>Lies jeden fertigen Satz laut. In der Arbeit musst du solche Sätze selbst begründen können: Was passiert, und warum?</p>`,
    },
    {
      title: 'Lückentext: Muskeln',
      widget: clozeWidget(
        'Muskeln ermöglichen zusammen mit den {Gelenken} die Bewegung. Sie sind mit {Sehnen} an den Knochen befestigt. Ein Muskel kann sich nur {zusammenziehen}. Von selbst {strecken} kann er sich nicht. Deshalb braucht er einen {Gegenmuskel}: Wenn dieser sich zusammenzieht, wird der erste Muskel wieder gedehnt. Am Oberarm sind das der {Bizeps} (Beuger) und der {Trizeps} (Strecker). Weil zwei Muskeln entgegengesetzte Aufgaben haben und trotzdem zusammenarbeiten, spricht man vom {Gegenspielerprinzip}.',
        ['Knorpel', 'Rippen'], 'Alle Lücken stimmen. Das Gegenspielerprinzip sitzt.'),
      body: `<p>Der dritte Lückentext. Zwei Wörter in der Wortbank passen nirgends.</p>`,
      tryThis: `<p>Schreib danach zwei eigene Sätze ins Heft: Was passiert im Oberarm, wenn du den Arm beugst? Und was, wenn du ihn streckst?</p>`,
    },
    {
      title: 'Lernkarten',
      widget: flashWidget,
      body: `<p>25 Fragen quer durch alle vier Arbeitsblätter. Überleg dir die Antwort, bevor du sie aufdeckst. Was du schon weisst, fliegt aus dem Stapel. Was noch nicht sitzt, kommt hinten wieder dran.</p>`,
      tryThis: `<p>Sag die Antwort laut oder schreib sie auf, bevor du aufdeckst. Sei ehrlich mit dir: «Wusste ich» nur, wenn die Antwort vollständig war.</p>`,
    },
    {
      title: 'Probe-Test',
      widget: testWidget,
      body: `<p>18 gemischte Fragen wie in einer Klassenarbeit: Knochen benennen, finden und schreiben, Gelenk beschriften, Wissensfragen zu Skelett, Knochenarten, Gelenk und Muskeln. Bei jedem neuen Test kommen andere Fragen.</p>
        <p>Am Schluss siehst du, was noch nicht sitzt und auf welcher Seite du es nachlesen kannst.</p>`,
      tryThis: `<p>Mach den Test ohne zurückzublättern. Drei Sterne bei zwei Tests hintereinander heisst: Du bist bereit.</p>`,
    },
    {
      title: 'Merkseite',
      widget: summaryWidget,
      body: `<p>Alles Wichtige auf einen Blick. Geh die Seite am Abend vor der Arbeit einmal durch und hake die Liste ab.</p>`,
    },
  ],
};

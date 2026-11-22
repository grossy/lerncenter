// Lektion (Klasse 6, Mathe): Brüche erweitern und kürzen
// Nach dem Arbeitsheft-Kapitel «Verschiedene Brüche mit gleichem Wert», Aufgabe 40 bis 45.
import { h, confetti } from '../lesson.js';
import { playNote } from '../audio.js';

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
/** count verschiedene Zufallsaufgaben aus dem Generator gen. */
const uniq = (count, gen) => { const seen = new Map(); for (let i = 0; seen.size < count && i < 200; i++) { const t = gen(); seen.set(JSON.stringify(t), t); } return [...seen.values()]; };

const blip = (m = 76) => playNote(m, { dur: 0.12, vel: 0.18, type: 'pluck' });
const yay = () => [72, 76, 79, 84].forEach((m, i) => playNote(m, { time: i * 0.09, dur: 0.18, vel: 0.2, type: 'pluck' }));
const nope = () => [62, 58].forEach((m, i) => playNote(m, { time: i * 0.14, dur: 0.2, vel: 0.2, type: 'pluck' }));

/* ---------- Bausteine: Bruch, Gleichheitszeichen mit kleiner Zahl, Streifen ---------- */
const fr = (n, d, cls = '') => `<span class="frac ${cls}" role="img" aria-label="${n} durch ${d}"><span>${n}</span><span>${d}</span></span>`;
/** Schreibweise im Heft: kleine Zahl über dem Gleichheitszeichen = erweitern, darunter = kürzen. */
const eq = (k, dir = 'up') => `<span class="eqk ${dir}" role="img" aria-label="${dir === 'up' ? 'erweitert' : 'gekürzt'} mit ${k} ergibt"><small>${k}</small>=</span>`;
const chipRow = (cls, items) => `<div class="chips ${cls}">${items.map(([v, text]) => `<button class="chip" data-v="${v}">${text}</button>`).join('')}</div>`;
const select = (row, v) => row.querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c.dataset.v === String(v)));
const num = (el) => (/^\d+$/.test(el.value.trim()) ? parseInt(el.value.trim(), 10) : NaN);
const numIn = (cls, label) => `<input class="${cls}" type="text" inputmode="numeric" autocomplete="off" maxlength="4" aria-label="${label}">`;
function fbar(share, cuts, cls = '', label = 'Streifen') {
  const lines = Array.from({ length: cuts - 1 }, (_, i) => `<span class="cut" style="left:${((i + 1) / cuts) * 100}%"></span>`).join('');
  return `<div class="fbar" role="img" aria-label="${label}"><span class="fill ${cls}" style="left:0;width:${Math.min(share, 1) * 100}%"></span>${lines}</div>`;
}
const barRow = (label, bar) => `<div class="bar-row"><div class="bar-label">${label}</div>${bar}</div>`;

/* ---------- Bruchbilder wie im Heft: Rechteckraster, Kreis, Streifen ---------- */
const FARBEN = ['gelb', 'blau', 'lila', 'orange'];
const lineSort = (lines) => lines.sort((a, b) => a.includes(' old') - b.includes(' old')).join('');

/** Rechteck als Raster. on(r, c) = Feld gefärbt. mark {C, R}: jede C-te Spalten- und R-te Zeilenlinie ist ein alter (dicker) Schnitt. */
function gridFig({ rows, cols, on, mark = null, color = 'gelb', label = 'Rechteck' }) {
  const W = 240, H = 160, P = 3, cw = (W - 2 * P) / cols, ch = (H - 2 * P) / rows;
  let cells = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (on(r, c)) cells += `<rect class="on" x="${(P + c * cw).toFixed(1)}" y="${(P + r * ch).toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}"/>`;
  const cls = (i, m) => (!mark ? '' : i % m === 0 ? ' old' : ' thin');
  const lines = [];
  for (let c = 1; c < cols; c++) { const x = (P + c * cw).toFixed(1); lines.push(`<line class="ln${cls(c, mark?.C)}" x1="${x}" x2="${x}" y1="${P}" y2="${H - P}"/>`); }
  for (let r = 1; r < rows; r++) { const y = (P + r * ch).toFixed(1); lines.push(`<line class="ln${cls(r, mark?.R)}" x1="${P}" x2="${W - P}" y1="${y}" y2="${y}"/>`); }
  return `<svg class="bf f-${color}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}"><rect class="bg" x="${P}" y="${P}" width="${W - 2 * P}" height="${H - 2 * P}"/>${cells}${lineSort(lines)}<rect class="frame" x="${P}" y="${P}" width="${W - 2 * P}" height="${H - 2 * P}"/></svg>`;
}
/** Kreis mit D Sektoren, die ersten n gefärbt. group: jede group-te Linie dick. fade: dünne Linien verblassen. warn [a, b]: Teile rot umranden. */
function circleFig({ D, n, group = 0, fade = false, warn = null, color = 'gelb', label = 'Kreis' }) {
  const C = 100, R = 92;
  const pt = (i) => { const a = -Math.PI / 2 + (i / D) * 2 * Math.PI; return [(C + R * Math.cos(a)).toFixed(1), (C + R * Math.sin(a)).toFixed(1)]; };
  const wedge = (a, b, cls) => (b - a >= D ? `<circle class="${cls}" cx="${C}" cy="${C}" r="${R}"/>` : `<path class="${cls}" d="M${C} ${C} L${pt(a).join(' ')} A${R} ${R} 0 ${(b - a) / D > 0.5 ? 1 : 0} 1 ${pt(b).join(' ')} Z"/>`);
  const cls = (i) => (!group ? '' : i % group === 0 ? ' old' : fade ? ' thin fade' : ' thin');
  const lines = D > 1 ? Array.from({ length: D }, (_, i) => { const [x, y] = pt(i); return `<line class="ln${cls(i)}" x1="${C}" y1="${C}" x2="${x}" y2="${y}"/>`; }) : [];
  return `<svg class="bf rund f-${color}" viewBox="0 0 200 200" role="img" aria-label="${label}"><circle class="bg" cx="${C}" cy="${C}" r="${R}"/>${n > 0 ? wedge(0, n, 'on') : ''}${lineSort(lines)}<circle class="frame" cx="${C}" cy="${C}" r="${R}"/>${warn ? wedge(warn[0], warn[1], 'warn') : ''}</svg>`;
}
/** Streifen: ein Rechteck mit D Teilen nebeneinander. Gleiche Optionen wie circleFig. */
function stripFig({ D, n, group = 0, fade = false, warn = null, color = 'gelb', label = 'Rechteck' }) {
  const W = 240, H = 96, P = 3, cw = (W - 2 * P) / D;
  const cls = (i) => (!group ? '' : i % group === 0 ? ' old' : fade ? ' thin fade' : ' thin');
  const lines = [];
  for (let i = 1; i < D; i++) { const x = (P + i * cw).toFixed(1); lines.push(`<line class="ln${cls(i)}" x1="${x}" x2="${x}" y1="${P}" y2="${H - P}"/>`); }
  const box = (a, b, c) => `<rect class="${c}" x="${(P + a * cw).toFixed(1)}" y="${P}" width="${((b - a) * cw).toFixed(1)}" height="${H - 2 * P}"/>`;
  return `<svg class="bf f-${color}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${box(0, D, 'bg')}${n > 0 ? box(0, n, 'on') : ''}${lineSort(lines)}${box(0, D, 'frame')}${warn ? box(warn[0], warn[1], 'warn') : ''}</svg>`;
}

/* ---------- Spielgerüst: Runden, Punkte, Weiter-Knopf, Sterne ---------- */
function rounds(host, { total, task, again = 'Nochmal üben' }) {
  let round = 0, score = 0, open = false, run = 0;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="stage"></div>
    <div class="readout why"></div>
    <div class="controls"><button class="btn primary go-on hidden">Weiter →</button></div>
    <div class="result hidden" style="text-align:center;margin-top:1rem"><div class="stars"></div><p class="msg" style="font-size:1.2rem"></p><button class="btn primary again">${again}</button></div>`));
  const $ = (s) => host.querySelector(s);
  let focusTimer = 0;
  function answer(ok, msg) {
    if (!open) return;
    open = false;
    if (ok) { score++; yay(); } else nope();
    $('.readout').innerHTML = msg;
    $('.pts').textContent = `${score} richtig`;
    round++;
    $('.go-on').textContent = round < total ? 'Nächste Aufgabe →' : 'Ergebnis →';
    $('.go-on').classList.remove('hidden');
    $('.go-on').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    // Erst nach dem Tastendruck fokussieren, sonst löst dasselbe Enter gleich «Weiter» aus.
    focusTimer = setTimeout(() => $('.go-on').focus({ preventScroll: true }), 250);
  }
  function next() {
    open = true;
    $('.round').textContent = `Aufgabe ${round + 1} von ${total}`;
    $('.pts').textContent = `${score} richtig`;
    $('.readout').innerHTML = '';
    $('.go-on').classList.add('hidden');
    $('.stage').classList.remove('hidden');
    $('.stage').innerHTML = '';
    task($('.stage'), answer, round, run);
    if (round) $('.score').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function finish() {
    $('.stage').classList.add('hidden');
    $('.readout').innerHTML = '';
    $('.go-on').classList.add('hidden');
    const part = score / total, stars = part >= 0.9 ? 3 : part >= 0.65 ? 2 : part >= 0.4 ? 1 : 0;
    $('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('.msg').textContent = `${score} von ${total} richtig! ` + (stars === 3 ? 'Stark! 🎉' : stars >= 1 ? 'Gut gemacht. Noch eine Runde?' : 'Schau dir die Seiten davor nochmal an und probier es gleich wieder.');
    $('.result').classList.remove('hidden');
    if (stars >= 2) confetti();
  }
  $('.go-on').onclick = () => (round < total ? next() : finish());
  $('.again').onclick = () => { round = 0; score = 0; run++; $('.result').classList.add('hidden'); next(); };
  next();
  return { destroy: () => clearTimeout(focusTimer) };
}
/** Übungsseite: deck(run) liefert die Aufgaben einer Runde, render zeichnet eine davon. */
function ueben(host, { total, again = 'Neue Aufgaben üben', deck, render }) {
  let cards = [];
  return rounds(host, { total, again, task(stage, answer, i, run) { if (i === 0) cards = deck(run); render(stage, answer, cards[i], i); } });
}
const tip = (live, html) => { live.className = 'live tip'; live.innerHTML = `💡 ${html} <strong>Versuch es nochmal.</strong>`; };
const nudge = (live, text) => { live.className = 'live nudge'; live.textContent = text; };
const onEnter = (inputs, fn) => inputs.forEach((inp, i) => inp.addEventListener('keydown', (e) => { if (e.key !== 'Enter') return; if (i + 1 < inputs.length && inp.value.trim() && !inputs[i + 1].value.trim()) inputs[i + 1].focus(); else fn(); }));
const tagLine = (tag) => (tag ? `<div class="hint">${tag}</div>` : '');

/* ---------- Aufgabentyp: Zähler und Nenner eintragen (Aufgabe 41 und 42) ---------- */
function diagnose(erw, n, d, k, a, b) {
  const A = erw ? n * k : n / k, B = erw ? d * k : d / k, op = erw ? '·' : ':';
  const beide = `${n} ${op} ${k} = ? und ${d} ${op} ${k} = ?`;
  if (a === B && b === A) return 'Die beiden Zahlen stimmen, aber sie sind vertauscht. Der Zähler steht oben, der Nenner unten.';
  if (a === A && b === d) return `Der Zähler stimmt. Den Nenner hast du aber nicht verändert. Was du mit dem Zähler machst, machst du auch mit dem Nenner: ${d} ${op} ${k} = ?`;
  if (a === n && b === B) return `Der Nenner stimmt. Den Zähler hast du aber nicht verändert. Was du mit dem Nenner machst, machst du auch mit dem Zähler: ${n} ${op} ${k} = ?`;
  if (erw && (a === n + k || b === d + k)) return `Du hast ${k} dazugezählt. Erweitern heisst aber malnehmen: ${beide}`;
  if (!erw && (a === n - k || b === d - k)) return `Du hast ${k} abgezogen. Kürzen heisst aber teilen: ${beide}`;
  if (!erw && (a === n * k || b === d * k)) return `Du hast malgenommen, das wäre erweitern. Beim Kürzen wird geteilt: ${beide}`;
  if (erw && (a * k === n || b * k === d)) return `Du hast geteilt, das wäre kürzen. Beim Erweitern wird malgenommen: ${beide}`;
  if (a === A) return `Der Zähler stimmt. Rechne den Nenner nochmal nach: ${d} ${op} ${k} = ?`;
  if (b === B) return `Der Nenner stimmt. Rechne den Zähler nochmal nach: ${n} ${op} ${k} = ?`;
  if (a * d === b * n) return `Dein Bruch hat zwar denselben Wert, aber gefragt ist genau die Zahl ${k}: ${beide}`;
  return `Rechne beide Zahlen ${erw ? 'mal' : 'durch'} ${k}: ${beide}`;
}
function fracTask(stage, answer, { n, d, k, mode, tag = '', tries = 2, focus = false }) {
  const erw = mode === 'erw', op = erw ? '·' : ':';
  const A = erw ? n * k : n / k, B = erw ? d * k : d / k;
  let left = tries;
  stage.innerHTML = `
    ${tagLine(tag)}
    <div class="question">${erw ? 'Erweitere' : 'Kürze'} mit <strong>${k}</strong>.</div>
    <div class="equation">${fr(n, d, 'big')} ${eq(k, erw ? 'up' : 'down')} <span class="frac-in">${numIn('gap-in zn', 'Zähler')}<span class="bar"></span>${numIn('gap-in nn', 'Nenner')}</span></div>
    <div class="controls"><button class="btn primary check">Prüfen</button></div>
    <div class="live"></div>`;
  const zn = stage.querySelector('.zn'), nn = stage.querySelector('.nn'), live = stage.querySelector('.live'), btn = stage.querySelector('.check');
  const solution = `${fr(n, d)} ${eq(k, erw ? 'up' : 'down')} ${fr(A, B)}, denn ${n} ${op} ${k} = ${A} und ${d} ${op} ${k} = ${B}.`;
  const check = () => {
    if (btn.disabled) return;
    const a = num(zn), b = num(nn);
    if (Number.isNaN(a) || Number.isNaN(b)) { nudge(live, 'Trag oben den Zähler und unten den Nenner ein.'); return; }
    const ok = a === A && b === B;
    zn.classList.toggle('ok', a === A); zn.classList.toggle('bad', a !== A);
    nn.classList.toggle('ok', b === B); nn.classList.toggle('bad', b !== B);
    left--;
    if (!ok && left > 0) { nope(); tip(live, diagnose(erw, n, d, k, a, b)); return; }
    zn.disabled = nn.disabled = btn.disabled = true;
    live.className = 'live'; live.textContent = '';
    answer(ok, ok ? `✅ ${tries - left > 1 ? 'Jetzt stimmt es.' : 'Richtig!'} ${solution}` : `❌ Richtig ist: ${solution}`);
  };
  btn.onclick = check;
  onEnter([zn, nn], check);
  if (focus) setTimeout(() => zn.focus({ preventScroll: true }), 60);
}

/* ---------- Aufgabentyp: «Erweitert mit □» und «Gekürzt mit □» (Aufgabe 43, 44, 45) ---------- */
function zahlTask(stage, answer, { tag = '', question, top, wort, k, tries = 2, hint, solution, reveal = () => {}, focus = false }) {
  let left = tries;
  stage.innerHTML = `
    ${tagLine(tag)}
    <div class="question">${question}</div>
    ${top}
    <div class="numeric satz"><span>${wort} mit</span>${numIn('num kurz', `${wort} mit`)}<button class="btn primary check">Prüfen</button></div>
    <div class="live"></div>`;
  const inp = stage.querySelector('.num'), live = stage.querySelector('.live'), btn = stage.querySelector('.check');
  const check = () => {
    if (btn.disabled) return;
    const v = num(inp);
    if (Number.isNaN(v)) { nudge(live, 'Trag zuerst eine Zahl ein.'); return; }
    const ok = v === k;
    left--;
    if (!ok) reveal(stage);
    if (!ok && left > 0) { nope(); inp.select(); tip(live, hint(v)); return; }
    inp.disabled = btn.disabled = true;
    live.className = 'live'; live.textContent = '';
    answer(ok, ok ? `✅ ${tries - left > 1 ? 'Jetzt stimmt es.' : 'Richtig!'} ${solution}` : `❌ Richtig ist ${k}. ${solution}`);
  };
  btn.onclick = check;
  onEnter([inp], check);
  if (focus) setTimeout(() => inp.focus({ preventScroll: true }), 60);
}

/** Eigene Bildpaare im Format des Hefts. Kreis: d Sektoren, n gefärbt, mit k verfeinert. Raster: R×C Felder, jedes in kx·ky Stücke. */
const KREISE = [[2, 1, 2], [2, 1, 3], [2, 1, 4], [2, 1, 5], [3, 1, 2], [3, 2, 2], [3, 2, 3], [3, 1, 4], [4, 1, 2], [4, 3, 2], [4, 3, 3], [5, 2, 2], [5, 3, 2], [6, 5, 2]];
const RASTER = [[1, 2, 1, 1, 3], [1, 3, 2, 1, 2], [1, 4, 3, 1, 3], [2, 2, 1, 2, 1], [2, 2, 3, 3, 1], [1, 5, 2, 1, 4], [2, 3, 5, 2, 1], [1, 3, 1, 1, 5], [1, 2, 1, 2, 2], [1, 4, 1, 1, 2], [2, 2, 1, 2, 2], [1, 5, 4, 1, 3]];
function randPic() {
  const color = pick(FARBEN);
  if (Math.random() < 0.5) { const [d, n, k] = pick(KREISE); return { shape: 'kreis', d, n, k, color }; }
  const [R, C, n, kx, ky] = pick(RASTER);
  return { shape: 'raster', R, C, n, kx, ky, d: R * C, k: kx * ky, color };
}
/** Liefert [grobes Bild, feines Bild]. marked: im feinen Bild sind die alten Schnitte dick. */
function picFigs(p, marked = false) {
  const { d, n, k, color } = p, was = p.shape === 'kreis' ? 'Kreis' : 'Rechteck';
  const lab = (a, b) => `${was}: ${a} von ${b} Teilen gefärbt`;
  if (p.shape === 'kreis') return [circleFig({ D: d, n, color, label: lab(n, d) }), circleFig({ D: d * k, n: n * k, group: marked ? k : 0, color, label: lab(n * k, d * k) })];
  const { R, C, kx, ky } = p;
  return [
    gridFig({ rows: R, cols: C, on: (r, c) => c * R + r < n, color, label: lab(n, d) }),
    gridFig({ rows: R * ky, cols: C * kx, on: (r, c) => Math.floor(c / kx) * R + Math.floor(r / ky) < n, mark: marked ? { C: kx, R: ky } : null, color, label: lab(n * k, d * k) }),
  ];
}
function picTask(stage, answer, { p, mode, tries = 2, focus = false }) {
  const erw = mode === 'erw', { n, d, k } = p, N = n * k, D = d * k;
  const [grob, fein] = picFigs(p);
  const pair = (l, r) => `<div class="bf-pair"><div class="bf-cell l">${l}</div><div class="bf-arrow" aria-hidden="true">→</div><div class="bf-cell r">${r}</div></div>`;
  zahlTask(stage, answer, {
    question: erw ? 'Mit welcher Zahl wurde erweitert?' : 'Mit welcher Zahl wurde gekürzt?',
    top: erw ? pair(grob, fein) : pair(fein, grob),
    wort: erw ? 'Erweitert' : 'Gekürzt', k, tries, focus,
    reveal: (st) => { st.querySelector(erw ? '.bf-cell.r' : '.bf-cell.l').innerHTML = picFigs(p, true)[1]; },
    hint: (v) => (erw
      ? `${v === D - d ? `Es sind zwar ${D - d} Teile mehr geworden, gesucht ist aber die Malzahl. ` : ''}Zähle nach: Links sind es ${d} Teile, rechts ${D}. Die dicken Linien rechts sind die alten Schnitte. In wie viele Stücke wurde jedes alte Teil geschnitten? ${d} · ? = ${D}`
      : `${v === D - d ? `Es sind zwar ${D - d} Teile weniger geworden, gesucht ist aber die Zahl, durch die geteilt wurde. ` : ''}Zähle nach: Links sind es ${D} Teile, rechts ${d}. Die dicken Linien links zeigen, welche Teile zusammengelegt wurden. Wie viele kleine Teile stecken in einem grossen? ${D} : ? = ${d}`),
    solution: erw
      ? `${fr(n, d)} ${eq(k, 'up')} ${fr(N, D)}: Jedes Teil wurde in ${k} Stücke geschnitten, ${d} · ${k} = ${D} und ${n} · ${k} = ${N}.`
      : `${fr(N, D)} ${eq(k, 'down')} ${fr(n, d)}: Je ${k} Teile wurden zu einem zusammengelegt, ${D} : ${k} = ${d} und ${N} : ${k} = ${n}.`,
  });
}
function numTask(stage, answer, { n, d, k, tag = '', tries = 2, focus = false }) {
  const N = n * k, D = d * k;
  zahlTask(stage, answer, {
    tag, question: 'Mit welcher Zahl wurde erweitert?',
    top: `<div class="equation">${fr(n, d, 'big')} <span class="bf-arrow" aria-hidden="true">→</span> ${fr(N, D, 'big')}</div>`,
    wort: 'Erweitert', k, tries, focus,
    hint: (v) => `${v === D - d || v === N - n ? `${v} ist der Unterschied. Gesucht ist aber die Zahl, mit der malgenommen wurde. ` : ''}Vergleiche die Nenner: ${d} · ? = ${D}. Du kannst auch ${D} : ${d} rechnen. Mach danach die Probe am Zähler.`,
    solution: `${D} : ${d} = ${k}. Probe am Zähler: ${n} · ${k} = ${N}. Also ${fr(n, d)} ${eq(k, 'up')} ${fr(N, D)}.`,
  });
}

/* ---------- Aufgabentyp: Zahl als Produkt schreiben (Aufgabe 40) ---------- */
const paare = (N) => { const out = []; for (let a = 2; a * a <= N; a++) if (N % a === 0) out.push([a, N / a]); return out; };
function prodTask(stage, answer, { N, tag = '', tries = 2, focus = false }) {
  let left = tries;
  stage.innerHTML = `
    ${tagLine(tag)}
    <div class="question">Schreibe als Produkt.</div>
    <div class="equation"><span>${N} =</span>${numIn('gap-in pa', 'Erster Faktor')}<span>·</span>${numIn('gap-in pb', 'Zweiter Faktor')}</div>
    <div class="controls"><button class="btn primary check">Prüfen</button></div>
    <div class="live"></div>`;
  const pa = stage.querySelector('.pa'), pb = stage.querySelector('.pb'), live = stage.querySelector('.live'), btn = stage.querySelector('.check');
  const alle = paare(N), nah = alle[alle.length - 1], liste = (ps) => ps.map(([a, b]) => `${a} · ${b}`).join(', '); // nah: das Paar aus dem kleinen Einmaleins
  const check = () => {
    if (btn.disabled) return;
    const a = num(pa), b = num(pb);
    if (Number.isNaN(a) || Number.isNaN(b)) { nudge(live, 'Trag zwei Zahlen ein.'); return; }
    if (a * b === N && (a === 1 || b === 1)) { nudge(live, `Das stimmt, aber mit der 1 geht es bei jeder Zahl. Finde zwei Faktoren, die beide grösser als 1 sind.`); return; }
    const ok = a * b === N;
    [pa, pb].forEach((el) => { el.classList.toggle('ok', ok); el.classList.toggle('bad', !ok); });
    left--;
    if (!ok && left > 0) {
      nope();
      const good = [a, b].find((x) => x > 1 && x < N && N % x === 0), p = nah[0];
      tip(live, `${a} · ${b} = ${a * b}, das ist nicht ${N}. ${good ? `Die ${good} ist aber ein guter Anfang: ${N} : ${good} = ? Das ist der andere Faktor.` : `${N} steht in der ${p}er-Reihe: ${p} · ? = ${N}`}`);
      return;
    }
    pa.disabled = pb.disabled = btn.disabled = true;
    live.className = 'live'; live.textContent = '';
    const rest = alle.filter(([x, y]) => !(x === Math.min(a, b) && y === Math.max(a, b)));
    answer(ok, ok
      ? `✅ ${tries - left > 1 ? 'Jetzt stimmt es.' : 'Richtig!'} ${N} = ${a} · ${b}. ${rest.length ? `Es geht auch so: ${liste(rest)}.` : 'Das ist die einzige Möglichkeit ohne die 1.'}`
      : `❌ Zum Beispiel ${N} = ${nah[0]} · ${nah[1]}. Alle Möglichkeiten ohne die 1: ${liste(alle)}.`);
  };
  btn.onclick = check;
  onEnter([pa, pb], check);
  if (focus) setTimeout(() => pa.focus({ preventScroll: true }), 60);
}

/* ---------- Aufgabentyp fürs Quiz: Stimmt diese Rechnung? ---------- */
function stimmtTask(stage, answer, { n, d, k, mode, fehler }) {
  const erw = mode === 'erw', op = erw ? '·' : ':';
  const A = erw ? n * k : n / k, B = erw ? d * k : d / k;
  const [a, b] = fehler === 'zaehler' ? [A, d] : fehler === 'nenner' ? [n, B] : fehler === 'plus' ? (erw ? [n + k, d + k] : [n - k, d - k]) : [A, B];
  stage.innerHTML = `
    <div class="question">Stimmt diese Rechnung?</div>
    <div class="equation">${fr(n, d, 'big')} ${eq(k, erw ? 'up' : 'down')} ${fr(a, b, 'big')}</div>
    <div class="choices"><button class="btn big" data-v="1">👍 Stimmt</button><button class="btn big" data-v="0">👎 Stimmt nicht</button></div>`;
  const right = fehler ? '0' : '1';
  const richtig = `Richtig ist ${fr(n, d)} ${eq(k, erw ? 'up' : 'down')} ${fr(A, B)}.`;
  const why = !fehler ? `${n} ${op} ${k} = ${A} und ${d} ${op} ${k} = ${B}. Zähler und Nenner wurden beide ${erw ? 'mit' : 'durch'} ${k} ${erw ? 'malgenommen' : 'geteilt'}.`
    : fehler === 'zaehler' ? `Hier wurde nur der Zähler ${erw ? 'malgenommen' : 'geteilt'}, der Nenner ist gleich geblieben. ${richtig}`
    : fehler === 'nenner' ? `Hier wurde nur der Nenner ${erw ? 'malgenommen' : 'geteilt'}, der Zähler ist gleich geblieben. ${richtig}`
    : `Hier wurde ${k} ${erw ? 'dazugezählt' : 'abgezogen'} statt ${erw ? 'malgenommen' : 'geteilt'}. ${richtig}`;
  stage.querySelectorAll('.choices .btn').forEach((btn) => (btn.onclick = () => {
    const ok = btn.dataset.v === right;
    stage.querySelectorAll('.choices .btn').forEach((x) => { x.disabled = true; if (x.dataset.v === right) x.classList.add('ok'); });
    if (!ok) btn.classList.add('bad');
    answer(ok, `${ok ? '✅ Genau.' : '❌ Schau nochmal hin.'} ${why}`);
  }));
}

/* ---------- Die Aufgaben aus dem Heft und Zufallsaufgaben im gleichen Format ---------- */
const A40 = [16, 36, 42, 30, 64, 72];
const A41 = [[3, 4, 5], [5, 9, 4], [2, 3, 8], [8, 10, 7], [11, 13, 6], [13, 17, 5]];
const A42 = [[9, 15, 3], [49, 56, 7], [24, 36, 12], [32, 64, 2], [77, 121, 11], [51, 81, 3]];
const A45 = [[1, 15, 5], [3, 9, 5], [7, 10, 4], [9, 12, 6]];
const PRODUKTE = [12, 18, 20, 24, 27, 28, 32, 35, 40, 45, 48, 54, 56, 60, 63, 81];
const abc = (j) => `${'abcdef'[j]})`;
const randErw = () => { const d = rnd(3, 15); return [rnd(1, d - 1), d, rnd(2, 9)]; };
const randKuerz = () => { const b = rnd(2, 12), a = rnd(1, b - 1), k = pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12]); return [a * k, b * k, k]; };
const randZahl = () => { const d = rnd(3, 15); return [rnd(1, d - 1), d, rnd(2, 8)]; };
const heft = (nr, list) => list.map(([n, d, k], j) => ({ n, d, k, tag: `Heft, Aufgabe ${nr} ${abc(j)}` }));
const neu = (list) => list.map(([n, d, k]) => ({ n, d, k, tag: 'Neue Aufgabe' }));

/* ---------- Seite 1: Gleich viel, feiner geschnitten ---------- */
const START = [[1, 2], [2, 3], [3, 4], [2, 5]];
function gleichWidget(host) {
  let n = 3, d = 4, k = 1, shape = 'rechteck';
  host.appendChild(h(`
    <div class="segmented shapes"><button data-s="rechteck" class="selected">Rechteck</button><button data-s="kreis">Kreis</button></div>
    <div class="step-label">Bruch wählen:</div>
    ${chipRow('starts', START.map(([a, b]) => [`${a}/${b}`, fr(a, b)]))}
    <div class="bf-spot"></div>
    <div class="sliders"><label><span>Stücke pro Teil: <strong class="kv"></strong></span><input type="range" min="1" max="6" value="1" class="sk"></label></div>
    <div class="equation"></div>
    <div class="readout"></div>`));
  const $ = (s) => host.querySelector(s);
  function render() {
    const N = n * k, D = d * k, label = `${N} von ${D} Teilen gefärbt`;
    select($('.starts'), `${n}/${d}`);
    host.querySelectorAll('.shapes button').forEach((b) => b.classList.toggle('selected', b.dataset.s === shape));
    $('.kv').textContent = k === 1 ? '1 (ungeschnitten)' : k;
    $('.bf-spot').className = `bf-spot ${shape}`;
    $('.bf-spot').innerHTML = shape === 'kreis'
      ? circleFig({ D, n: N, group: k > 1 ? k : 0, label })
      : gridFig({ rows: k, cols: d, on: (r, c) => c < n, mark: k > 1 ? { C: 1, R: k } : null, label });
    $('.equation').innerHTML = k === 1 ? fr(n, d, 'big') : `${fr(n, d)} = ${fr(`${n} · ${k}`, `${d} · ${k}`)} = ${fr(N, D)}`;
    $('.readout').innerHTML = k === 1
      ? `Noch nichts geschnitten: ${n} von ${d} Teilen ${n === 1 ? 'ist' : 'sind'} gefärbt. Schieb den Regler.`
      : `Jedes Teil ist jetzt in ${k} Stücke geschnitten. Gefärbt sind <strong>${N} von ${D}</strong> Teilen, aber die gefärbte Fläche ist genau gleich gross wie vorher.`;
  }
  host.querySelectorAll('.shapes button').forEach((b) => (b.onclick = () => { shape = b.dataset.s; blip(); render(); }));
  host.querySelectorAll('.starts .chip').forEach((c) => (c.onclick = () => { [n, d] = c.dataset.v.split('/').map(Number); k = 1; $('.sk').value = 1; blip(); render(); }));
  $('.sk').oninput = (e) => { k = +e.target.value; render(); };
  render();
  return {};
}

/* ---------- Seite 2: Die Regel und drei typische Fehler ---------- */
const REGEL = [[3, 4, 5], [2, 3, 8], [5, 6, 3]];
function regelWidget(host) {
  let i = 0, f = '';
  host.appendChild(h(`
    <div class="step-label">Beispiel wählen:</div>
    ${chipRow('exs', REGEL.map(([n, d, k], j) => [j, `${fr(n, d)} mit ${k}`]))}
    <div class="equation kurz"></div>
    <div class="bar-rows"></div>
    <div class="equation lang"></div>
    <div class="step-label">😈 Drei typische Fehler. Was wäre dann passiert?</div>
    <div class="fehler">
      <button class="btn" data-f="zaehler">Nur den Zähler malnehmen</button>
      <button class="btn" data-f="nenner">Nur den Nenner malnehmen</button>
      <button class="btn" data-f="plus">Die Zahl dazuzählen statt malnehmen</button>
    </div>
    <div class="readout why"></div>
    <div class="controls"><button class="btn ghost richtig hidden">↩ Zurück zur richtigen Rechnung</button></div>`));
  const $ = (s) => host.querySelector(s);
  function render() {
    const [n, d, k] = REGEL[i], N = n * k, D = d * k;
    const [a, b] = f === 'zaehler' ? [N, d] : f === 'nenner' ? [n, D] : f === 'plus' ? [n + k, d + k] : [N, D];
    select($('.exs'), i);
    host.querySelectorAll('.fehler .btn').forEach((x) => x.classList.toggle('bad', x.dataset.f === f));
    $('.richtig').classList.toggle('hidden', !f);
    $('.kurz').innerHTML = `${fr(n, d, 'big')} ${eq(k, 'up')} ${fr(a, b, `big${f ? ' bad' : ''}`)}${f ? '<span class="falsch">falsch!</span>' : ''}`;
    $('.bar-rows').innerHTML = barRow(fr(n, d), fbar(n / d, d, '', `Streifen: ${n} von ${d}`)) + barRow(fr(a, b, f ? 'bad' : ''), fbar(a / b, b, f ? 'bad' : '', `Streifen: ${a} von ${b}`));
    $('.lang').innerHTML = f === 'zaehler' ? `${fr(n, d)} → ${fr(`${n} · ${k}`, d)} = ${fr(a, b, 'bad')}`
      : f === 'nenner' ? `${fr(n, d)} → ${fr(n, `${d} · ${k}`)} = ${fr(a, b, 'bad')}`
      : f === 'plus' ? `${fr(n, d)} → ${fr(`${n} + ${k}`, `${d} + ${k}`)} = ${fr(a, b, 'bad')}`
      : `${fr(n, d)} = ${fr(`${n} · ${k}`, `${d} · ${k}`)} = ${fr(N, D)}`;
    $('.readout').innerHTML = f === 'zaehler'
      ? `❌ ${fr(a, b)} ist mehr als ${Math.floor(a / b)} Ganze, der Streifen wäre mehr als voll. Vorher war der Bruch kleiner als 1. <strong>Daran erkennst du es:</strong> Der Nenner ist gleich geblieben, also sind die Teile gleich gross wie vorher, aber es sind ${k}-mal so viele.`
      : f === 'nenner'
        ? `❌ Jedes Teil ist jetzt in ${k} kleinere Stücke geschnitten, gefärbt sind aber immer noch nur ${n} davon. Der Bruch ist viel kleiner geworden. <strong>Daran erkennst du es:</strong> Der Zähler ist gleich geblieben, obwohl feiner geschnitten wurde.`
        : f === 'plus'
          ? `❌ Der untere Streifen ist weiter gefärbt als der obere, der Wert hat sich also geändert. <strong>Daran erkennst du es:</strong> Nach dem Erweitern mit ${k} müssen Zähler und Nenner beide in der ${k}er-Reihe stehen. Bei ${a} und ${b} ist das nicht so.`
          : `✅ Zähler <strong>und</strong> Nenner mal ${k}. Beide Streifen sind gleich weit gefärbt: Der Wert ist gleich geblieben.`;
  }
  host.querySelectorAll('.exs .chip').forEach((c) => (c.onclick = () => { i = +c.dataset.v; f = ''; blip(); render(); }));
  host.querySelectorAll('.fehler .btn').forEach((b) => (b.onclick = () => { f = b.dataset.f; nope(); render(); }));
  $('.richtig').onclick = () => { f = ''; blip(); render(); };
  render();
  return {};
}

/* ---------- Seite 3 und 7: Üben wie Aufgabe 41 und 42 ---------- */
const erwUeben = (host) => ueben(host, {
  total: 6,
  deck: (run) => (run === 0 ? heft(41, A41) : neu(uniq(6, randErw))),
  render: (stage, answer, t, i) => fracTask(stage, answer, { ...t, mode: 'erw', focus: i > 0 }),
});
const kuerzUeben = (host) => ueben(host, {
  total: 6,
  deck: (run) => (run === 0 ? heft(42, A42) : neu(uniq(6, randKuerz))),
  render: (stage, answer, t, i) => fracTask(stage, answer, { ...t, mode: 'kuerz', focus: i > 0 }),
});

/* ---------- Seite 4 und 8: Bildpaare wie Aufgabe 43 und 44 ---------- */
const bildUeben = (mode) => (host) => ueben(host, {
  total: 5, again: 'Neue Bilder üben',
  deck: () => uniq(5, () => { const p = randPic(); return { ...p, color: 0 }; }).map((p) => ({ ...p, color: pick(FARBEN) })),
  render: (stage, answer, p, i) => picTask(stage, answer, { p, mode, focus: i > 0 }),
});

/* ---------- Seite 5: Erweiterungszahl aus zwei Brüchen (Aufgabe 45) ---------- */
function zahlUeben(host) {
  host.appendChild(h(`<div class="howto"><strong>So findest du die Zahl:</strong> ${fr(2, 3)} → ${fr(10, 15)}<br>Nenner: 15 : 3 = <strong>5</strong>. Probe am Zähler: 2 · 5 = 10. Stimmt, also erweitert mit 5.</div>`));
  return ueben(host, {
    total: 6,
    deck: (run) => (run === 0 ? [...A45.map(([n, d, k], j) => ({ n, d, k, tag: `Heft, Aufgabe 45 ${abc(j)}` })), ...neu(uniq(2, randZahl))] : neu(uniq(6, randZahl))),
    render: (stage, answer, t, i) => numTask(stage, answer, { ...t, focus: i > 0 }),
  });
}

/* ---------- Seite 6: Kürzen, der Weg zurück ---------- */
const RUECK = [[6, 8], [8, 12], [4, 12], [12, 18], [10, 15]];
function rueckWidget(host) {
  let n = 6, D = 8, k = 1, shape = 'kreis';
  host.appendChild(h(`
    <div class="segmented shapes"><button data-s="kreis" class="selected">Kreis</button><button data-s="rechteck">Rechteck</button></div>
    <div class="step-label">Bruch wählen:</div>
    ${chipRow('starts', RUECK.map(([a, b]) => [`${a}/${b}`, fr(a, b)]))}
    <div class="bf-spot"></div>
    <div class="sliders"><label><span>Zusammenlegen: <strong class="kv"></strong></span><input type="range" min="1" max="6" value="1" class="sk"></label></div>
    <div class="equation"></div>
    <div class="readout"></div>`));
  const $ = (s) => host.querySelector(s);
  function render() {
    const okD = D % k === 0, okN = n % k === 0, ok = okD && okN;
    const warn = k === 1 || ok ? null : !okD ? [Math.floor(D / k) * k, D] : [Math.floor(n / k) * k, Math.floor(n / k) * k + k];
    select($('.starts'), `${n}/${D}`);
    host.querySelectorAll('.shapes button').forEach((b) => b.classList.toggle('selected', b.dataset.s === shape));
    $('.kv').textContent = k === 1 ? 'nichts' : `je ${k} Teile`;
    $('.bf-spot').className = `bf-spot ${shape === 'kreis' ? 'kreis' : 'streifen'}`;
    const opts = { D, n, group: k > 1 ? k : 0, fade: ok, warn, color: 'blau', label: `${n} von ${D} Teilen gefärbt${ok && k > 1 ? `, je ${k} zusammengelegt` : ''}` };
    $('.bf-spot').innerHTML = shape === 'kreis' ? circleFig(opts) : stripFig(opts);
    $('.equation').innerHTML = k === 1 || !ok ? fr(n, D, 'big') : `${fr(n, D)} = ${fr(`${n} : ${k}`, `${D} : ${k}`)} = ${fr(n / k, D / k)}`;
    const rest = D % k;
    $('.readout').innerHTML = k === 1
      ? `${D} Teile, ${n} davon gefärbt. Schieb den Regler und leg Teile zusammen.`
      : ok ? `Je ${k} Teile werden zu einem grösseren Teil. Aus ${D} Teilen werden ${D / k}, aus ${n} gefärbten werden ${n / k}. Die gefärbte Fläche bleibt genau gleich gross.`
      : !okD ? `Das geht nicht auf: ${D} Teile lassen sich nicht in ${k}er-Gruppen zusammenlegen, ${rest === 1 ? '1 Teil bleibt' : `${rest} Teile bleiben`} übrig (rot). ${D} ist nicht durch ${k} teilbar.`
      : `Die Gruppen gehen auf, aber die rot umrandete Gruppe wäre nur zum Teil gefärbt. Der Zähler ${n} ist nicht durch ${k} teilbar. Kürzen geht nur mit einer Zahl, durch die Zähler <strong>und</strong> Nenner teilbar sind.`;
  }
  host.querySelectorAll('.shapes button').forEach((b) => (b.onclick = () => { shape = b.dataset.s; blip(); render(); }));
  host.querySelectorAll('.starts .chip').forEach((c) => (c.onclick = () => { [n, D] = c.dataset.v.split('/').map(Number); k = 1; $('.sk').value = 1; blip(); render(); }));
  $('.sk').oninput = (e) => { k = +e.target.value; render(); };
  render();
  return {};
}

/* ---------- Seite 9: Zahl als Produkt (Aufgabe 40) ---------- */
const prodUeben = (host) => ueben(host, {
  total: 6, again: 'Neue Zahlen üben',
  deck: (run) => (run === 0 ? A40.map((N, j) => ({ N, tag: `Heft, Aufgabe 40 ${abc(j)}` })) : shuffle(PRODUKTE).slice(0, 6).map((N) => ({ N, tag: 'Neue Aufgabe' }))),
  render: (stage, answer, t, i) => prodTask(stage, answer, { ...t, focus: i > 0 }),
});

/* ---------- Seite 10: Womit kann man kürzen? ---------- */
const KANDIDATEN = [[24, 36], [9, 15], [30, 42], [32, 64], [49, 56], [77, 121], [51, 81]];
const ZAHLEN = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function teilerWidget(host) {
  let i = 0, k = 0;
  const tried = KANDIDATEN.map(() => new Set());
  host.appendChild(h(`
    <div class="step-label">Bruch wählen:</div>
    ${chipRow('exs', KANDIDATEN.map(([n, d], j) => [j, fr(n, d)]))}
    <div class="step-label">Kann man mit dieser Zahl kürzen? Tippe eine an:</div>
    ${chipRow('zahlen', ZAHLEN.map((z) => [z, z]))}
    <div class="gaps prod"></div>
    <div class="equation"></div>
    <div class="readout why"></div>`));
  const $ = (s) => host.querySelector(s);
  const geht = (z) => { const [n, d] = KANDIDATEN[i]; return n % z === 0 && d % z === 0; };
  function render() {
    const [n, d] = KANDIDATEN[i];
    select($('.exs'), i);
    host.querySelectorAll('.zahlen .chip').forEach((c) => {
      const z = +c.dataset.v, t = tried[i].has(z);
      c.classList.toggle('selected', z === k); c.classList.toggle('hit', t && geht(z)); c.classList.toggle('miss', t && !geht(z));
    });
    if (!k) {
      $('.prod').innerHTML = '';
      $('.equation').innerHTML = fr(n, d, 'big');
      $('.readout').innerHTML = 'Such eine Zahl, die als Faktor im Zähler <strong>und</strong> im Nenner steckt.';
      return;
    }
    const zeile = (name, x) => (x % k === 0
      ? `<div class="line">✅ ${name}: ${x} = ${k} · <strong>${x / k}</strong></div>`
      : `<div class="line">❌ ${name}: ${x} : ${k} geht nicht auf (${k} · ${Math.floor(x / k)} = ${k * Math.floor(x / k)}, Rest ${x % k})</div>`);
    $('.prod').innerHTML = zeile('Zähler', n) + zeile('Nenner', d);
    const alle = ZAHLEN.filter(geht), found = alle.filter((z) => tried[i].has(z)), g = gcd(n, d);
    const mehr = []; for (let z = 13; z <= g; z++) if (g % z === 0) mehr.push(z);
    const stand = found.length === alle.length
      ? `🎉 Du hast alle gefunden: ${alle.length === 1 ? `Hier geht nur die ${alle[0]}` : `Es sind die ${alle.length} Zahlen ${alle.join(', ')}`}.${mehr.length ? ` Es geht sogar noch mit ${mehr.join(' und ')}.` : ''} ${alle.length > 1 || mehr.length ? `Mit der grössten Zahl, ${g}, werden Zähler und Nenner am kleinsten: ${fr(n / g, d / g)}.` : ''}`
      : `Gefunden: ${found.join(', ') || 'noch keine'}. Zwischen 2 und 12 gibt es ${alle.length === 1 ? 'eine Zahl, mit der' : `${alle.length} Zahlen, mit denen`} man hier kürzen kann.`;
    if (geht(k)) {
      $('.equation').innerHTML = `${fr(n, d)} ${eq(k, 'down')} ${fr(n / k, d / k)}`;
      $('.readout').innerHTML = `Der Faktor ${k} steckt in Zähler und Nenner, also kann man mit ${k} kürzen. ${stand}`;
    } else {
      $('.equation').innerHTML = fr(n, d, 'big');
      $('.readout').innerHTML = `Mit ${k} kann man hier nicht kürzen: ${n % k && d % k ? 'Weder Zähler noch Nenner gehen auf' : n % k ? 'Der Zähler geht nicht auf' : 'Der Nenner geht nicht auf'}. ${stand}`;
    }
  }
  host.querySelectorAll('.exs .chip').forEach((c) => (c.onclick = () => { i = +c.dataset.v; k = 0; blip(); render(); }));
  host.querySelectorAll('.zahlen .chip').forEach((c) => (c.onclick = () => {
    k = +c.dataset.v;
    const neuGefunden = geht(k) && !tried[i].has(k);
    tried[i].add(k);
    const fertig = neuGefunden && ZAHLEN.filter(geht).every((z) => tried[i].has(z));
    if (fertig) { yay(); confetti(); } else if (geht(k)) blip(79); else nope();
    render();
  }));
  render();
  return {};
}

/* ---------- Seite 11: Gemischt üben ---------- */
function quizWidget(host) {
  let deck = [];
  const erw = () => { const [n, d, k] = Math.random() < 0.5 ? pick(A41) : randErw(); return (s, a, f) => fracTask(s, a, { n, d, k, mode: 'erw', tries: 1, focus: f }); };
  const kuerz = () => { const [n, d, k] = Math.random() < 0.5 ? pick(A42) : randKuerz(); return (s, a, f) => fracTask(s, a, { n, d, k, mode: 'kuerz', tries: 1, focus: f }); };
  const bild = (mode) => { const p = randPic(); return (s, a, f) => picTask(s, a, { p, mode, tries: 1, focus: f }); };
  const zahl = () => { const [n, d, k] = Math.random() < 0.5 ? pick(A45) : randZahl(); return (s, a, f) => numTask(s, a, { n, d, k, tries: 1, focus: f }); };
  const prod = () => { const N = pick([...A40, ...PRODUKTE]); return (s, a, f) => prodTask(s, a, { N, tries: 1, focus: f }); };
  const stimmt = () => {
    const mode = pick(['erw', 'kuerz']), [n, d, k] = mode === 'erw' ? [rnd(1, 4), rnd(5, 9), rnd(2, 6)] : (() => { const b = rnd(3, 9), a = rnd(2, b - 1), z = rnd(3, 6); return [a * z, b * z, z]; })();
    const fehler = pick([null, null, 'zaehler', 'nenner', 'plus']);
    return (s, a) => stimmtTask(s, a, { n, d, k, mode, fehler });
  };
  return rounds(host, {
    total: 10, again: 'Nochmal mit neuen Aufgaben',
    task(stage, answer, i) {
      if (i === 0) deck = shuffle([erw(), erw(), kuerz(), kuerz(), bild('erw'), bild('kuerz'), zahl(), zahl(), prod(), stimmt()]);
      deck[i](stage, answer, i > 0);
    },
  });
}

/* ---------- Seite 12: Merkkasten ---------- */
function merkWidget(host) {
  host.appendChild(h(`
    <div class="cards">
      <div class="card"><h4>✂️ Erweitern</h4><div class="merk-eq">${fr(3, 4)} ${eq(5, 'up')} ${fr(15, 20)}</div><div class="sub">Zähler und Nenner mit derselben Zahl malnehmen. Die Teile werden kleiner, der Wert bleibt gleich.</div></div>
      <div class="card"><h4>🧩 Kürzen</h4><div class="merk-eq">${fr(6, 8)} ${eq(2, 'down')} ${fr(3, 4)}</div><div class="sub">Zähler und Nenner durch dieselbe Zahl teilen. Geht nur, wenn beide durch die Zahl teilbar sind.</div></div>
      <div class="card"><h4>🔎 Die Zahl finden</h4><div class="merk-eq">${fr(2, 3)} → ${fr(10, 15)}</div><div class="sub">Neuer Nenner : alter Nenner, also 15 : 3 = 5. Probe am Zähler: 2 · 5 = 10.</div></div>
      <div class="card"><h4>✖️ Produkte helfen</h4><div>30 = 6 · 5 und 42 = 6 · 7</div><div class="sub">Der gemeinsame Faktor 6 zeigt: ${fr(30, 42)} kann man mit 6 kürzen.</div></div>
    </div>
    <ul class="checklist">
      <li>☐ Erweitern und Kürzen ändern nur die Zahlen, <strong>nie den Wert</strong> des Bruchs.</li>
      <li>☐ Immer beide: Was du mit dem Zähler machst, machst du auch mit dem Nenner.</li>
      <li>☐ Malnehmen oder teilen, <strong>nie</strong> dazuzählen oder abziehen.</li>
      <li>☐ Kleine Zahl <strong>über</strong> dem Gleichheitszeichen: erweitern. Kleine Zahl <strong>darunter</strong>: kürzen.</li>
      <li>☐ Probe nach dem Erweitern: Zähler und Nenner stehen beide in der Malreihe der Erweiterungszahl.</li>
    </ul>`));
  confetti();
  return {};
}

export default {
  id: 'erweitern',
  title: 'Brüche erweitern und kürzen',
  subject: 'Mathe',
  grade: 6,
  pages: [
    {
      title: 'Gleich viel, feiner geschnitten',
      widget: gleichWidget,
      body: `<p>Das Kapitel im Heft heisst «Verschiedene Brüche mit gleichem Wert». Gemeint ist: Zwei Brüche können ganz verschieden aussehen und trotzdem gleich viel bedeuten.</p>
        <p>Im Bild siehst du, warum. Wenn du jedes Teil nochmals in gleich grosse Stücke schneidest, gibt es mehr Teile, und es sind auch mehr Teile gefärbt. Die gefärbte Fläche selbst ändert sich nicht. Darum haben ${fr(3, 4)} und ${fr(15, 20)} denselben Wert.</p>`,
      tryThis: `<p>Wähle ${fr(2, 3)} und schieb den Regler langsam von 1 bis 6. Beobachte die beiden Zahlen im Bruch ganz rechts: In welcher Malreihe läuft der Zähler, in welcher der Nenner?</p>`,
    },
    {
      title: 'Erweitern: die Regel',
      widget: regelWidget,
      body: `<p>Feiner schneiden heisst beim Rechnen: <strong>Zähler und Nenner mit derselben Zahl malnehmen</strong>. Das nennt man <strong>erweitern</strong>.</p>
        <p>Im Heft steht die Zahl, mit der erweitert wird, klein über dem Gleichheitszeichen: ${fr(3, 4)} ${eq(5, 'up')} ${fr(15, 20)}. Gelesen: «Drei Viertel, erweitert mit 5, sind fünfzehn Zwanzigstel.»</p>
        <p>Der Wert des Bruchs bleibt beim Erweitern gleich. Darum müssen die beiden Streifen im Kasten gleich weit gefärbt sein. Bei den drei typischen Fehlern sind sie es nicht.</p>`,
      tryThis: `<p>Drück nacheinander alle drei Fehler-Knöpfe und vergleiche die Streifen. Welcher Fehler fällt sofort auf, bei welchem musst du genauer hinschauen?</p>`,
    },
    {
      title: 'Erweitere mit der angegebenen Zahl',
      widget: erwUeben,
      body: `<p>Jetzt du, genau wie in Aufgabe 41. Die kleine Zahl über dem Gleichheitszeichen sagt, womit du erweiterst. Trag den neuen Zähler und den neuen Nenner ein.</p>
        <p>Zuerst kommen die sechs Aufgaben aus dem Heft, danach kannst du mit neuen Zahlen weiterüben. Bei einem Fehler bekommst du einen Hinweis und einen zweiten Versuch.</p>`,
      tryThis: `<p>Sprich die Rechnung leise mit: «3 mal 5 ist 15, 4 mal 5 ist 20.» Zweimal dieselbe Malzahl, einmal oben und einmal unten.</p>`,
    },
    {
      title: 'Erweitert: die Zahl im Bild finden',
      widget: bildUeben('erw'),
      body: `<p>Wie in Aufgabe 43: Links ist ein Bruch als Bild, rechts dieselbe Fläche, nur feiner geschnitten. Finde heraus, mit welcher Zahl erweitert wurde.</p>
        <p>So gehst du vor: Zähle links alle Teile, dann rechts. Die gesuchte Zahl sagt, in wie viele Stücke jedes Teil geschnitten wurde. Zur Kontrolle kannst du auch die gefärbten Teile vergleichen.</p>`,
      tryThis: `<p>Schreib dir zu jedem Bildpaar beide Brüche auf, zum Beispiel ${fr(1, 2)} und ${fr(4, 8)}. Dann siehst du die Zahl oft sofort.</p>`,
    },
    {
      title: 'Die Erweiterungszahl berechnen',
      widget: zahlUeben,
      body: `<p>In Aufgabe 45 gibt es keine Bilder mehr, nur die beiden Brüche. Die Zahl findest du mit einer Geteilt-Rechnung: <strong>neuer Nenner : alter Nenner</strong>.</p>
        <p>Mach danach immer die Probe am Zähler. Wenn alter Zähler mal deine Zahl den neuen Zähler gibt, stimmt es. Du kannst auch bei den Zählern anfangen und an den Nennern prüfen, beide Wege führen zur selben Zahl.</p>`,
      tryThis: `<p>Bei grossen Zahlen hilft die Frage andersherum: nicht «75 durch 15», sondern «15 mal wie viel gibt 75?»</p>`,
    },
    {
      title: 'Kürzen: der Weg zurück',
      widget: rueckWidget,
      body: `<p>Der umgekehrte Weg heisst <strong>kürzen</strong>. Statt jedes Teil zu zerschneiden, legst du immer gleich viele Teile zu einem grösseren zusammen. Gerechnet heisst das: <strong>Zähler und Nenner durch dieselbe Zahl teilen</strong>.</p>
        <p>Im Heft steht die Zahl, mit der gekürzt wird, klein unter dem Gleichheitszeichen: ${fr(6, 8)} ${eq(2, 'down')} ${fr(3, 4)}. Auch beim Kürzen bleibt der Wert gleich.</p>
        <p>Anders als beim Erweitern geht es aber nicht mit jeder Zahl: Zähler und Nenner müssen beide durch die Zahl teilbar sein.</p>`,
      tryThis: `<p>Wähle ${fr(12, 18)} und probier alle Stellungen des Reglers von 2 bis 6. Mit welchen Zahlen kann man kürzen, mit welchen nicht? Achte darauf, was im Bild rot wird.</p>`,
    },
    {
      title: 'Kürze mit der angegebenen Zahl',
      widget: kuerzUeben,
      body: `<p>Wie in Aufgabe 42: Die kleine Zahl unter dem Gleichheitszeichen sagt, womit du kürzt. Teile den Zähler und den Nenner durch diese Zahl.</p>
        <p>Wieder zuerst die sechs Aufgaben aus dem Heft, danach neue.</p>`,
      tryThis: `<p>Wenn dir eine Division schwerfällt, frag andersherum: «11 mal wie viel gibt 77?» Das kleine Einmaleins reicht für fast alle Aufgaben.</p>`,
    },
    {
      title: 'Gekürzt: die Zahl im Bild finden',
      widget: bildUeben('kuerz'),
      body: `<p>Wie in Aufgabe 44: Links ist das fein geschnittene Bild, rechts dieselbe Fläche mit grösseren Teilen. Mit welcher Zahl wurde gekürzt?</p>
        <p>Die gesuchte Zahl sagt, wie viele kleine Teile zu einem grossen zusammengelegt wurden.</p>`,
      tryThis: `<p>Zähle zuerst die Teile links und rechts. Rechne dann: Teile links geteilt durch Teile rechts.</p>`,
    },
    {
      title: 'Eine Zahl als Produkt schreiben',
      widget: prodUeben,
      body: `<p>Aufgabe 40 sieht aus, als gehöre sie gar nicht zu den Brüchen: Schreibe eine Zahl als <strong>Produkt</strong>, also als Malrechnung. Zum Beispiel 16 = 2 · 8 oder 16 = 4 · 4. Oft gibt es mehrere Lösungen, und alle sind richtig.</p>
        <p>Wozu das gut ist: Wer eine Zahl schnell in Faktoren zerlegen kann, sieht sofort, womit sich ein Bruch kürzen lässt. Beispiel ${fr(30, 42)}: 30 = 6 · 5 und 42 = 6 · 7. In beiden Zahlen steckt der Faktor 6, also kann man mit 6 kürzen und erhält ${fr(5, 7)}.</p>`,
      tryThis: `<p>Such bei jeder Zahl im Kopf noch eine zweite Zerlegung, bevor du auf «Prüfen» drückst. Nach der Antwort siehst du alle Möglichkeiten.</p>`,
    },
    {
      title: 'Womit kann man kürzen?',
      widget: teilerWidget,
      body: `<p>In Aufgabe 42 steht dabei, womit du kürzen sollst. Später musst du die Zahl selbst finden. Der Trick ist der von der letzten Seite: Zähler und Nenner als Produkt schreiben und einen Faktor suchen, der in <strong>beiden</strong> vorkommt.</p>
        <p>Tippe auf eine Zahl. Der Kasten zeigt, ob Zähler und Nenner beide aufgehen.</p>`,
      tryThis: `<p>Wähle ${fr(24, 36)} und finde alle fünf Zahlen. Probier danach ${fr(51, 81)}: Die 51 sieht nicht nach Dreierreihe aus. Stimmt das?</p>`,
    },
    {
      title: 'Gemischt üben',
      widget: quizWidget,
      body: `<p>Zehn Aufgaben, gemischt aus allen Typen des Kapitels: erweitern, kürzen, die Zahl aus Bildern und aus Brüchen finden, Produkte schreiben und Rechnungen prüfen.</p>
        <p>Hier hast du pro Aufgabe einen Versuch. Die Lösung mit Rechenweg erscheint nach jeder Antwort.</p>`,
      tryThis: `<p>Lies zuerst genau, was gefragt ist: Steht die kleine Zahl über oder unter dem Gleichheitszeichen?</p>`,
    },
    {
      title: 'Merkkasten',
      widget: merkWidget,
      body: `<p>Das Wichtigste auf einen Blick. Geh die Checkliste durch, bevor du die Aufgaben im Heft löst.</p>`,
    },
  ],
};

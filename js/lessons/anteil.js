// Lektion (Klasse 6, Mathe): Den Anteil von etwas berechnen
// Nach dem Schulbuch-Kapitel: Karaffe (Aufgabe 15), Strecken zerteilen, Aufgabe 16 bis 22.
import { h, confetti } from '../lesson.js';
import { playNote } from '../audio.js';

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const timersFor = () => { const l = []; return { after(ms, fn) { l.push(setTimeout(fn, ms)); }, clear() { l.forEach(clearTimeout); l.length = 0; } }; };

const blip = (m = 76) => playNote(m, { dur: 0.12, vel: 0.18, type: 'pluck' });
const yay = () => [72, 76, 79, 84].forEach((m, i) => playNote(m, { time: i * 0.09, dur: 0.18, vel: 0.2, type: 'pluck' }));
const nope = () => [62, 58].forEach((m, i) => playNote(m, { time: i * 0.14, dur: 0.2, vel: 0.2, type: 'pluck' }));

/* ---------- Bausteine ---------- */
const fr = (n, d, cls = '') => `<span class="frac ${cls}" role="img" aria-label="${n} ${d}tel"><span>${n}</span><span>${d}</span></span>`;
const TEL = { 3: 'Drittel', 4: 'Viertel', 5: 'Fünftel', 6: 'Sechstel', 7: 'Siebtel', 8: 'Achtel', 9: 'Neuntel', 10: 'Zehntel' };
const teile = (n, d) => (d === 2 ? (n === 1 ? '1 Hälfte' : '2 Hälften') : `${n} ${TEL[d]}`);
const chipRow = (cls, items) => `<div class="chips ${cls}">${items.map(([v, text]) => `<button class="chip" data-v="${v}">${text}</button>`).join('')}</div>`;
const select = (row, v) => row.querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c.dataset.v === String(v)));
const unitStr = (v, u) => (u ? `${v} ${u}` : `${v}`);

/** Wasserkaraffe (1000 ml) mit Skala. d = Teile, n = gefüllte Teile. */
const KAR = { x: 44, y: 32, w: 112, h: 240 };
function karaffe({ d = 10, n = 0, lines = true, one = false, mlText = null }) {
  const { x, y, w, h: hh } = KAR;
  const fillH = (n / d) * hh;
  const parts = lines ? Array.from({ length: d - 1 }, (_, i) => { const yy = (y + hh - ((i + 1) / d) * hh).toFixed(1); return `<line class="part-line" x1="${x}" x2="${x + w}" y1="${yy}" y2="${yy}"/>`; }).join('') : '';
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const yy = +(y + hh - (i / 10) * hh).toFixed(1), big = i % 2 === 0 && i > 0;
    return `<line class="tick" x1="${x + w}" x2="${x + w + (big ? 11 : 6)}" y1="${yy}" y2="${yy}"/>${big ? `<text class="lbl" x="${x + w + 14}" y="${yy + 4}">${i * 100} ml</text>` : ''}`;
  }).join('');
  const oneRect = one ? `<rect class="one" x="${x}" y="${(y + hh - hh / d).toFixed(1)}" width="${w}" height="${(hh / d).toFixed(1)}"/>` : '';
  const text = mlText ?? (n > 0 ? `${Math.round((n / d) * 1000)} ml` : '');
  const labelY = one ? y + hh - hh / d / 2 + 5 : y + hh - fillH - 7;
  const label = text ? `<text class="ml" x="${x + 8}" y="${labelY.toFixed(1)}">${text}</text>` : '';
  return `<svg class="karaffe" viewBox="0 0 230 290" role="img" aria-label="Karaffe, ${n} von ${d} Teilen gefüllt">
    <path class="glass" d="M${x} ${y - 16} L${x} ${y + hh} L${x + w} ${y + hh} L${x + w} ${y} L${x + w + 18} ${y - 16} Z"/>
    <rect class="water" x="${x + 1.5}" y="${(y + hh - fillH).toFixed(1)}" width="${w - 3}" height="${fillH.toFixed(1)}"/>
    ${parts}${oneRect}${ticks}${label}</svg>`;
}

/** Eine Strecke als Zeile: in d Teile zerlegt, die ersten solid durchgezogen, der Rest gestrichelt, Klammer mit Beschriftung. */
const SW = 520, SX = 28, SLEN = SW - 2 * SX;
const svgFrac = (x, y, n, d, unit = '') => `<text class="sl" x="${x}" y="${y - 3}" text-anchor="middle">${n}</text><line class="fl" x1="${x - 8}" x2="${x + 8}" y1="${y}" y2="${y}"/><text class="sl" x="${x}" y="${y + 13}" text-anchor="middle">${d}</text>${unit ? `<text class="sl" x="${x + 13}" y="${y + 5}">${unit}</text>` : ''}`;
function streckeRow({ d, solid, label }) {
  const y = 22, seg = SLEN / d;
  const segs = Array.from({ length: d }, (_, i) => `<line class="seg${i < solid ? '' : ' dash'}" x1="${(SX + i * seg).toFixed(1)}" x2="${(SX + (i + 1) * seg).toFixed(1)}" y1="${y}" y2="${y}"/>`).join('');
  const ticks = Array.from({ length: d + 1 }, (_, i) => `<line class="tick${i <= solid ? '' : ' dash'}" x1="${(SX + i * seg).toFixed(1)}" x2="${(SX + i * seg).toFixed(1)}" y1="${y - 8}" y2="${y + 8}"/>`).join('');
  const bx1 = SX, bx2 = SX + Math.max(solid, 1) * seg, mid = (bx1 + bx2) / 2, by = y + 14;
  const brace = `<path class="brace" d="M${bx1} ${by} q0 8 8 8 L${mid - 8} ${by + 8} q8 0 8 8 q0 -8 8 -8 L${bx2 - 8} ${by + 8} q8 0 8 -8"/>`;
  const aria = label.text || `${label.n} ${label.d}tel ${label.unit}`;
  const lab = label.text ? `<text class="sl" x="${mid}" y="${by + 32}" text-anchor="middle">${label.text}</text>` : svgFrac(mid, by + 32, label.n, label.d, label.unit);
  return `<svg class="strecke" viewBox="0 0 ${SW} 88" role="img" aria-label="Strecke: ${aria}">${segs}${ticks}${brace}${lab}</svg>`;
}
const opRow = (text, cls = '') => `<div class="strecke-op ${cls}">↓ &nbsp;${text}</div>`;
const row = (html, cls = '') => `<div class="strecke-row ${cls}">${html}</div>`;

/* ---------- Spielgerüst: Runden, Punkte, Weiter-Knopf, Sterne ---------- */
function rounds(host, { total, task, label = 'Aufgabe' }) {
  let round = 0, score = 0, open = false;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="stage"></div>
    <div class="readout why"></div>
    <div class="controls"><button class="btn primary go-on hidden">Weiter →</button></div>
    <div class="result hidden" style="text-align:center;margin-top:1rem"><div class="stars"></div><p class="msg" style="font-size:1.2rem"></p><button class="btn primary again">Nochmal üben</button></div>`));
  const $ = (s) => host.querySelector(s);
  function answer(ok, msg) {
    if (!open) return;
    open = false;
    if (ok) { score++; yay(); } else nope();
    $('.readout').innerHTML = msg;
    $('.pts').textContent = `${score} richtig`;
    round++;
    $('.go-on').textContent = round < total ? `Nächste ${label} →` : 'Ergebnis →';
    $('.go-on').classList.remove('hidden');
    $('.go-on').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function next() {
    open = true;
    $('.round').textContent = `${label} ${round + 1} von ${total}`;
    $('.pts').textContent = `${score} richtig`;
    $('.readout').innerHTML = '';
    $('.go-on').classList.add('hidden');
    $('.stage').classList.remove('hidden');
    $('.stage').innerHTML = '';
    task($('.stage'), answer, round);
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
  $('.again').onclick = () => { round = 0; score = 0; $('.result').classList.add('hidden'); next(); };
  next();
  return {};
}

/* ---------- Seite 1: Die Wasserkaraffe ---------- */
function ablesenWidget(host) {
  let d = 10, n = 7;
  host.appendChild(h(`
    <div class="karaffe-spot"></div>
    <div class="step-label">Die Karaffe ist geteilt in:</div>
    ${chipRow('dens', [2, 4, 5, 10].map((c) => [c, `${c} Teile`]))}
    <div class="sliders"><label><span>Gefüllte Teile: <strong class="nv"></strong></span><input type="range" min="0" max="10" value="7" class="sn"></label></div>
    <div class="equation"></div>
    <div class="terms"></div>`));
  const $ = (s) => host.querySelector(s);
  function render() {
    const ml = Math.round((n / d) * 1000);
    select($('.dens'), d);
    $('.sn').max = d; $('.sn').value = n;
    $('.nv').textContent = `${n} von ${d}`;
    $('.karaffe-spot').innerHTML = karaffe({ d, n });
    $('.equation').innerHTML = `${fr(n, d)} von 1000 ml sind ${ml} ml`;
    $('.terms').innerHTML = `<div><span class="term">Das Ganze</span>1000 ml</div><div><span class="term">Anteil</span>${fr(n, d)}</div><div><span class="term">Bruchteil</span>${ml} ml</div>`;
  }
  $('.dens').querySelectorAll('.chip').forEach((c) => (c.onclick = () => { const nd = +c.dataset.v; n = Math.round((n * nd) / d); d = nd; blip(); render(); }));
  $('.sn').oninput = (e) => { n = +e.target.value; render(); };
  render();
  return {};
}

/* ---------- Seite 2: Schritt für Schritt (Aufgabe 15) ---------- */
function schrittWidget(host) {
  const t = timersFor();
  const d = 10, n = 7;
  let step = 0;
  const ANS = ['In 10 gleich grosse Teile.', '1000 ml : 10 = 100 ml', '7 solche Teile.', '100 ml · 7 = 700 ml'];
  host.appendChild(h(`
    <div class="karaffe-spot"></div>
    <div class="equation">${fr(7, 10)} von 1000 ml = ?</div>
    <ol class="steps">
      <li class="pending"><div>In wie viele gleich grosse Abschnitte muss die Karaffe geteilt werden? <span class="ans"></span></div></li>
      <li class="pending"><div>Wie viel ml hat dann ein solcher Teil? <span class="ans"></span></div></li>
      <li class="pending"><div>Wie viele solcher Teile werden genommen? <span class="ans"></span></div></li>
      <li class="pending"><div>Wie viel Wasser ist das dann insgesamt? <span class="ans"></span></div></li>
    </ol>
    <div class="controls"><button class="btn primary go">▶ Schritt 1</button><button class="btn ghost restart hidden">Nochmal von vorn</button></div>`));
  const $ = (s) => host.querySelector(s);
  const spot = $('.karaffe-spot'), items = [...host.querySelectorAll('.steps li')];
  function show(k) {
    t.clear();
    step = k;
    items.forEach((li, i) => { li.classList.toggle('pending', i >= k); li.querySelector('.ans').innerHTML = i < k ? `→ <strong>${ANS[i]}</strong>` : ''; });
    $('.go').textContent = k < 4 ? `▶ Schritt ${k + 1}` : '✅ Fertig';
    $('.go').disabled = k >= 4;
    $('.restart').classList.toggle('hidden', k === 0);
    if (k === 0) { spot.innerHTML = karaffe({ d, n, lines: false, mlText: '?' }); $('.equation').innerHTML = `${fr(7, 10)} von 1000 ml = ?`; }
    if (k === 1) { spot.innerHTML = karaffe({ d, n, mlText: '?' }); }
    if (k === 2) { spot.innerHTML = karaffe({ d, n, one: true, mlText: '1 Teil = 100 ml' }); }
    if (k === 3) {
      for (let i = 0; i <= n; i++) t.after(i * 260, () => { spot.innerHTML = karaffe({ d, n: i, mlText: i ? `${i} · 100 ml` : '' }); if (i) blip(70 + i); });
    }
    if (k === 4) { spot.innerHTML = karaffe({ d, n }); $('.equation').innerHTML = `${fr(7, 10)} von 1000 ml sind 700 ml`; yay(); }
  }
  $('.go').onclick = () => show(step + 1);
  $('.restart').onclick = () => show(0);
  show(0);
  return { destroy: t.clear };
}

/* ---------- Seite 3: Strecken zerteilen ---------- */
function streckeWidget(host) {
  let d = 4, n = 3;
  host.appendChild(h(`
    <div class="strecke-rows"></div>
    <div class="sliders">
      <label><span>Zerlegen in <strong class="dv"></strong> gleich lange Teile</span><input type="range" min="2" max="8" value="4" class="sd"></label>
      <label><span>Davon nehmen: <strong class="nv"></strong></span><input type="range" min="1" max="4" value="3" class="sn"></label>
    </div>
    <div class="readout"></div>`));
  const $ = (s) => host.querySelector(s);
  function render() {
    n = Math.min(n, d);
    $('.sn').max = d; $('.sn').value = n;
    $('.dv').textContent = d; $('.nv').textContent = `${n} ${n === 1 ? 'Teil' : 'Teile'}`;
    $('.strecke-rows').innerHTML =
      row(streckeRow({ d: 1, solid: 1, label: { text: '1 m' } })) + opRow(`: ${d}`) +
      row(streckeRow({ d, solid: 1, label: { n: 1, d, unit: 'm' } })) + opRow(`· ${n}`) +
      row(streckeRow({ d, solid: n, label: { n, d, unit: 'm' } }));
    const cm = 100 % d === 0 ? ` In Zentimetern: 100 cm : ${d} = ${100 / d} cm, und ${100 / d} cm · ${n} = <strong>${(100 / d) * n} cm</strong>.` : '';
    $('.readout').innerHTML = `${fr(n, d)} m sind ${teile(n, d)} von einem ganzen Meter.${cm}`;
  }
  $('.sd').oninput = (e) => { d = +e.target.value; render(); };
  $('.sn').oninput = (e) => { n = +e.target.value; render(); };
  render();
  return {};
}

/* ---------- Lückentext (Aufgabe 16 und 20) ---------- */
function gapsWidget(host, lines, doneMsg) {
  let k = 0;
  const html = lines.map((l) => `<div class="line">${l.replace(/\{(\d+)\}/g, (_, a) => `<input class="gap-in" type="text" inputmode="numeric" data-a="${a}" aria-label="Lücke ${++k}">`)}</div>`).join('');
  host.appendChild(h(`
    <div class="gaps">${html}</div>
    <div class="controls"><button class="btn primary check">Prüfen</button><button class="btn ghost reveal">Lösung zeigen</button></div>
    <div class="readout"></div>`));
  const inputs = [...host.querySelectorAll('.gap-in')], readout = host.querySelector('.readout');
  function check() {
    let wrong = 0, empty = 0;
    inputs.forEach((inp) => {
      const v = inp.value.trim().replace(',', '.');
      const ok = v !== '' && Number(v) === +inp.dataset.a;
      if (v === '') empty++; else if (!ok) wrong++;
      inp.classList.toggle('ok', ok); inp.classList.toggle('bad', v !== '' && !ok);
    });
    readout.className = 'readout';
    if (!wrong && !empty) { readout.classList.add('ok'); readout.innerHTML = `✅ ${doneMsg}`; yay(); confetti(); return; }
    nope();
    readout.innerHTML = [wrong ? `${wrong} ${wrong === 1 ? 'Lücke stimmt' : 'Lücken stimmen'} noch nicht (rot).` : '', empty ? `${empty} ${empty === 1 ? 'Lücke ist' : 'Lücken sind'} noch leer.` : ''].filter(Boolean).join(' ');
  }
  host.querySelector('.check').onclick = check;
  host.querySelector('.reveal').onclick = () => {
    inputs.forEach((inp) => { inp.value = inp.dataset.a; inp.classList.add('ok'); inp.classList.remove('bad'); });
    readout.className = 'readout';
    readout.textContent = 'Das ist die Lösung. Rechne jede Lücke einmal selbst nach.';
  };
  inputs.forEach((inp, i) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { if (i + 1 < inputs.length) inputs[i + 1].focus(); else check(); } }));
  return {};
}
const aufgabe16 = (host) => gapsWidget(host, [
  '1. In wie viele gleich grosse Stücke wird das Ganze, also die 21 m, geteilt? {7}',
  'Dann ist ein solches Stück 21 m : {7} = {3} m lang.',
  '2. Wie viele dieser gleich grossen Stücke werden genommen? {5}',
  'Dann ist der Bruchteil {3} m · {5} = {15} m lang.',
], `Alles richtig: ${fr(5, 7)} von 21 m sind 15 m.`);
const aufgabe20 = (host) => gapsWidget(host, [
  '1. Wie viele gleich grosse Stücke wurden genommen? {5}',
  'Dann ist ein solches Stück 15 m : {5} = {3} m lang.',
  '2. In wie viele solcher Stücke wurde das unbekannte Ganze geteilt? {7}',
  'Dann ist das Ganze {3} m · {7} = {21} m lang.',
], `Alles richtig: Wenn ${fr(5, 7)} der Strecke 15 m sind, ist die ganze Strecke 21 m lang.`);

/* ---------- Seite 5: Merke und typische Fehler ---------- */
const BEISPIELE = [[5, 7, 21, 'm'], [1, 3, 18, ''], [2, 3, 18, ''], [3, 4, 32, ''], [4, 7, 49, ''], [5, 6, 54, ''], [7, 11, 88, '']];
function regelWidget(host) {
  let i = 0;
  host.appendChild(h(`
    <div class="step-label">Beispiel wählen:</div>
    ${chipRow('exs', BEISPIELE.map(([n, d, g, u], k) => [k, `${fr(n, d)} von ${unitStr(g, u)}`]))}
    <div class="strecke-rows"></div>
    <div class="equation"></div>
    <div class="step-label">😈 Drei typische Fehler. Was wäre dann passiert?</div>
    <div class="fehler">
      <button class="btn" data-f="tausch">Zuerst durch den Zähler statt durch den Nenner</button>
      <button class="btn" data-f="halb">Nur der erste Schritt, das Malnehmen vergessen</button>
      <button class="btn" data-f="mal">Gar nicht teilen, nur mit dem Zähler malnehmen</button>
    </div>
    <div class="readout why"></div>`));
  const $ = (s) => host.querySelector(s);
  function render() {
    const [n, d, g, u] = BEISPIELE[i], one = g / d, ans = one * n;
    select($('.exs'), i);
    $('.strecke-rows').innerHTML =
      row(streckeRow({ d: 1, solid: 1, label: { text: unitStr(g, u) } })) + opRow(`: ${d}`) +
      row(streckeRow({ d, solid: 1, label: { text: unitStr(one, u) } })) + opRow(`· ${n}`) +
      row(streckeRow({ d, solid: n, label: { text: unitStr(ans, u) } }));
    $('.equation').innerHTML = `${fr(n, d)} von ${unitStr(g, u)} = (${unitStr(g, u)} : ${d}) · ${n} = ${unitStr(one, u)} · ${n} = <strong>${unitStr(ans, u)}</strong>`;
    $('.readout').innerHTML = '';
    host.querySelectorAll('.fehler .btn').forEach((b) => b.classList.remove('bad'));
  }
  host.querySelectorAll('.exs .chip').forEach((c) => (c.onclick = () => { i = +c.dataset.v; blip(); render(); }));
  host.querySelectorAll('.fehler .btn').forEach((b) => (b.onclick = () => {
    const [n, d, g, u] = BEISPIELE[i];
    host.querySelectorAll('.fehler .btn').forEach((x) => x.classList.toggle('bad', x === b));
    nope();
    let msg = '';
    if (b.dataset.f === 'tausch') {
      msg = g % n
        ? `${g} : ${n} geht nicht auf. Das ist ein Warnsignal: Solche Aufgaben gehen fast immer auf. Prüfe, ob du Zähler und Nenner vertauscht hast. Durch den <strong>Nenner</strong> ${d} teilen geht glatt: ${g} : ${d} = ${g / d}.`
        : `(${g} : ${n}) · ${d} = ${(g / n) * d}. Das ist <strong>mehr als das Ganze</strong> (${unitStr(g, u)}). Ein Bruchteil mit Zähler kleiner als Nenner ist aber immer kleiner als das Ganze. Also: durch den Nenner, mal den Zähler.`;
    } else if (b.dataset.f === 'halb') {
      msg = n === 1
        ? `${g} : ${d} = ${g / d}. Hier ist das tatsächlich schon die Lösung, weil der Zähler 1 ist: ${fr(1, d)} ist genau <strong>ein Teil</strong>. Bei jedem anderen Zähler fehlt noch das Malnehmen.`
        : `${g} : ${d} = ${g / d}. Das ist erst <strong>ein</strong> Teil, also ${fr(1, d)} von ${unitStr(g, u)}. Du brauchst aber ${n} Teile: ${g / d} · ${n} = ${unitStr((g / d) * n, u)}.`;
    } else {
      msg = n === 1
        ? `${g} · 1 = ${g}. Das ist das ganze ${unitStr(g, u)}, gemeint ist aber nur ${fr(1, d)} davon. Zuerst immer <strong>durch den Nenner</strong> teilen, damit du weisst, wie gross ein Teil ist.`
        : `${g} · ${n} = ${g * n}. Das wäre ${n}-mal das Ganze, also viel mehr als ${unitStr(g, u)}. Ein Bruchteil kann nicht grösser sein als das Ganze. Zuerst immer <strong>durch den Nenner</strong> teilen, damit du weisst, wie gross ein Teil ist.`;
    }
    $('.readout').innerHTML = `❌ ${msg}`;
  }));
  render();
  return {};
}

/* ---------- Seite 6: Stammbruch (Aufgabe 19) ---------- */
const STAMM = [
  { what: 'Schulstunde', d: 3, part: 15, unit: 'min', q: `Wenn ${fr(1, 3)} einer Schulstunde 15 min dauert, wie lange ist dann eine ganze Schulstunde?` },
  { what: 'Baumstamm', d: 4, part: 3, unit: 'Meter', q: `${fr(1, 4)} eines Baumstamms ist 3 Meter lang. Wie lang ist der ganze Baumstamm?` },
  { what: 'Reise', d: 6, part: 8, unit: 'Tage', q: `${fr(1, 6)} einer Reise dauert 8 Tage. Wie lange dauert die ganze Reise?` },
  { what: 'Müslipackung', d: 5, part: 80, unit: 'Gramm', q: `${fr(1, 5)} einer Müslipackung wiegt 80 Gramm. Wie schwer ist die ganze Müslipackung?` },
  { what: 'Film', d: 3, part: 25, unit: 'Minuten', q: `${fr(1, 3)} eines Films dauert 25 Minuten. Wie lange dauert der ganze Film?` },
];
function stammWidget(host) {
  const t = timersFor();
  let i = 0, k = 1;
  host.appendChild(h(`
    ${chipRow('exs', STAMM.map((s, j) => [j, `${fr(1, s.d)} ${s.what}`]))}
    <div class="question"></div>
    <div class="strecke-rows"></div>
    <div class="controls"><button class="btn primary big lay">Teile aneinanderlegen</button></div>
    <div class="equation"></div>
    <div class="readout"></div>`));
  const $ = (s) => host.querySelector(s);
  function render() {
    const s = STAMM[i];
    select($('.exs'), i);
    $('.question').innerHTML = s.q;
    $('.strecke-rows').innerHTML = row(streckeRow({ d: s.d, solid: k, label: { text: k === 1 ? `${s.part} ${s.unit}` : `${s.part} ${s.unit} · ${k}` } }));
    $('.equation').innerHTML = k === s.d ? `${s.part} ${s.unit} · ${s.d} = <strong>${s.part * s.d} ${s.unit}</strong>` : `${s.part} ${s.unit} · ${s.d} = ?`;
    $('.readout').innerHTML = k === s.d ? `Die ganze ${s.what}: ${k} Teile zu je ${s.part} ${s.unit}, also <strong>${s.part * s.d} ${s.unit}</strong>.` : `Bekannt ist <strong>ein</strong> Teil, ${s.part} ${s.unit}. Das Ganze besteht aus ${s.d} solchen Teilen.`;
    $('.lay').disabled = k === s.d;
  }
  host.querySelectorAll('.exs .chip').forEach((c) => (c.onclick = () => { t.clear(); i = +c.dataset.v; k = 1; blip(); render(); }));
  $('.lay').onclick = () => {
    const s = STAMM[i];
    t.clear();
    for (let j = 2; j <= s.d; j++) t.after((j - 1) * 350, () => { k = j; blip(70 + j); render(); if (k === s.d) yay(); });
  };
  render();
  return { destroy: t.clear };
}

/* ---------- Seite 7: Zurück zur ganzen Strecke ---------- */
const RUECK = [
  { n: 3, d: 4, part: 1, unit: 'm', frac: true, title: `${fr(3, 4)} m` },
  { n: 5, d: 7, part: 15, unit: 'm', title: `${fr(5, 7)} sind 15 m` },
  { n: 5, d: 8, part: 10, unit: 'm', title: `${fr(5, 8)} sind 10 m` },
  { n: 3, d: 10, part: 21, unit: 'm', title: `${fr(3, 10)} sind 21 m` },
  { n: 8, d: 9, part: 64, unit: 'm', title: `${fr(8, 9)} sind 64 m` },
];
function rueckWidget(host) {
  let i = 0, step = 0;
  host.appendChild(h(`
    <div class="step-label">Beispiel wählen:</div>
    ${chipRow('exs', RUECK.map((r, j) => [j, r.title]))}
    <div class="strecke-rows"></div>
    <div class="controls"><button class="btn primary s1">Schritt 1: durch den Zähler teilen</button><button class="btn primary s2">Schritt 2: mal den Nenner</button></div>
    <div class="equation"></div>
    <div class="readout"></div>`));
  const $ = (s) => host.querySelector(s);
  function render() {
    const r = RUECK[i], one = r.part / r.n, whole = one * r.d;
    select($('.exs'), i);
    const L = (k) => (r.frac ? { n: k, d: r.d, unit: r.unit } : { text: `${one * k} ${r.unit}` });
    $('.strecke-rows').innerHTML =
      row(streckeRow({ d: r.d, solid: r.n, label: r.frac ? L(r.n) : { text: `${r.part} ${r.unit}` } })) +
      opRow(`: ${r.n}`, step < 1 ? 'pending' : '') + row(streckeRow({ d: r.d, solid: 1, label: L(1) }), step < 1 ? 'pending' : '') +
      opRow(`· ${r.d}`, step < 2 ? 'pending' : '') + row(streckeRow({ d: r.d, solid: r.d, label: r.frac ? { text: '1 m' } : { text: `${whole} ${r.unit}` } }), step < 2 ? 'pending' : '');
    $('.s1').disabled = step >= 1; $('.s2').disabled = step !== 1;
    const eq = r.frac
      ? [`${fr(3, 4)} m : 3 = ${fr(1, 4)} m`, `${fr(1, 4)} m · 4 = <strong>1 m</strong>`]
      : [`${r.part} ${r.unit} : ${r.n} = ${one} ${r.unit}`, `${one} ${r.unit} · ${r.d} = <strong>${whole} ${r.unit}</strong>`];
    const given = r.frac ? `${fr(3, 4)} m` : `${r.part} ${r.unit}`;
    $('.equation').innerHTML = step === 0 ? '' : step === 1 ? eq[0] : `(${given} : ${r.n}) · ${r.d} = ${eq[1]}`;
    $('.readout').innerHTML = step === 0
      ? `Bekannt: ${r.frac ? `${fr(3, 4)} m, das sind 3 von 4 Teilen` : `${r.part} ${r.unit}, das sind ${r.n} von ${r.d} Teilen`}. Gesucht: das Ganze.`
      : step === 1 ? `Die ${r.n} Teile sind gleich gross, also ist einer ${r.frac ? `${fr(1, 4)} m` : `${one} ${r.unit}`}.`
      : `${r.d} solche Teile aneinandergelegt: das Ganze ist ${r.frac ? '1 m' : `${whole} ${r.unit}`}.`;
  }
  host.querySelectorAll('.exs .chip').forEach((c) => (c.onclick = () => { i = +c.dataset.v; step = 0; blip(); render(); }));
  $('.s1').onclick = () => { step = 1; blip(); render(); };
  $('.s2').onclick = () => { step = 2; yay(); render(); };
  render();
  return {};
}

/* ---------- Seite 9: Vorwärts oder rückwärts? ---------- */
const RICHTUNG = [
  { q: `Eine Müslipackung wiegt 72 g. Wie schwer sind ${fr(4, 9)} der Müslipackung?`, dir: 'vor', known: 'das Ganze (72 g)', calc: '(72 g : 9) · 4 = 8 g · 4 = 32 g' },
  { q: `${fr(1, 5)} einer Müslipackung wiegt 80 Gramm. Wie schwer ist die ganze Müslipackung?`, dir: 'rueck', known: 'der Bruchteil (80 g)', calc: '80 g · 5 = 400 g' },
  { q: `Ein Baumstamm ist 50 m lang. Wie lang sind ${fr(3, 5)} des Baumstamms?`, dir: 'vor', known: 'das Ganze (50 m)', calc: '(50 m : 5) · 3 = 10 m · 3 = 30 m' },
  { q: `${fr(1, 4)} eines Baumstamms ist 3 Meter lang. Wie lang ist der ganze Baumstamm?`, dir: 'rueck', known: 'der Bruchteil (3 m)', calc: '3 m · 4 = 12 m' },
  { q: `Eine Reise dauert 32 d. Wie lange dauern ${fr(5, 8)} der Reise?`, dir: 'vor', known: 'das Ganze (32 d)', calc: '(32 d : 8) · 5 = 4 d · 5 = 20 d' },
  { q: `Wenn ${fr(5, 7)} einer Strecke 15 m sind, wie lang ist dann die ganze Strecke?`, dir: 'rueck', known: 'der Bruchteil (15 m)', calc: '(15 m : 5) · 7 = 3 m · 7 = 21 m' },
  { q: `Die Karaffe fasst 1000 ml und ist zu ${fr(7, 10)} befüllt. Wie viel Wasser ist das?`, dir: 'vor', known: 'das Ganze (1000 ml)', calc: '(1000 ml : 10) · 7 = 100 ml · 7 = 700 ml' },
  { q: `${fr(1, 6)} einer Reise dauert 8 Tage. Wie lange dauert die ganze Reise?`, dir: 'rueck', known: 'der Bruchteil (8 Tage)', calc: '8 Tage · 6 = 48 Tage' },
];
function richtungWidget(host) {
  host.appendChild(h(`
    <div class="dir-cards">
      <div class="dir-card"><h4>➡️ Vorwärts</h4><div>Das <strong>Ganze</strong> ist bekannt, der <strong>Bruchteil</strong> ist gesucht.</div><div class="sub">: Nenner, dann · Zähler</div><div class="ex">${fr(5, 7)} von 21 m = (21 m : 7) · 5 = 15 m</div></div>
      <div class="dir-card"><h4>⬅️ Rückwärts</h4><div>Der <strong>Bruchteil</strong> ist bekannt, das <strong>Ganze</strong> ist gesucht.</div><div class="sub">: Zähler, dann · Nenner</div><div class="ex">${fr(5, 7)} sind 15 m: (15 m : 5) · 7 = 21 m</div></div>
    </div>`));
  let deck = [];
  return rounds(host, {
    total: 6,
    task(stage, answer, i) {
      if (i === 0) deck = shuffle(RICHTUNG).slice(0, 6);
      const t = deck[i];
      stage.innerHTML = `
        <div class="question">${t.q}</div>
        <div class="step-label">Was ist gesucht?</div>
        <div class="choices"><button class="btn big" data-d="vor">➡️ Der Bruchteil</button><button class="btn big" data-d="rueck">⬅️ Das Ganze</button></div>`;
      stage.querySelectorAll('.choices .btn').forEach((b) => (b.onclick = () => {
        const ok = b.dataset.d === t.dir;
        stage.querySelectorAll('.choices .btn').forEach((x) => { x.disabled = true; if (x.dataset.d === t.dir) x.classList.add('ok'); });
        if (!ok) b.classList.add('bad');
        const way = t.dir === 'vor' ? 'vorwärts: durch den Nenner, mal den Zähler' : 'rückwärts: durch den Zähler, mal den Nenner';
        answer(ok, `${ok ? '✅ Genau.' : '❌ Schau nochmal hin.'} Bekannt ist ${t.known}, also ${way}. <strong>${t.calc}</strong>`);
      }));
    },
  });
}

/* ---------- Seite 10: Quiz mit den Aufgaben aus dem Heft ---------- */
const A17 = [[1, 3, 18], [1, 2, 16], [2, 3, 18], [3, 4, 32], [4, 7, 49], [5, 6, 54], [3, 8, 48], [7, 11, 88], [7, 13, 65]];
const A18 = [[4, 9, 72, 'g', 'Eine Müslipackung wiegt 72 g. Wie schwer sind {f} der Müslipackung?'], [3, 5, 50, 'm', 'Ein Baumstamm ist 50 m lang. Wie lang sind {f} des Baumstamms?'], [5, 8, 32, 'd', 'Eine Reise dauert 32 d (d = Tage). Wie lange dauern {f} der Reise?']];
const A21 = [[1, 6, 4], [5, 8, 10], [3, 10, 21], [8, 9, 64], [11, 19, 55]];
const A22 = [[1, 7, 5], [5, 6, 25], [3, 4, 24], [7, 10, 77], [2, 5, 14], [9, 11, 18], [3, 5, 18], [3, 8, 21]];
function vor([n, d, g, u = '', text = null]) {
  const one = g / d, ans = one * n;
  return { q: text ? text.replace('{f}', fr(n, d)) : `Rechne aus: ${fr(n, d)} von ${g} =`, unit: u, ans,
    how: `${fr(n, d)} von ${unitStr(g, u)}: (${g} : ${d}) · ${n} = ${one} · ${n} = <strong>${unitStr(ans, u)}</strong>` };
}
function rueck([n, d, p, u = '', text = null]) {
  const one = p / n, ans = one * d;
  const q = text ? text.replace('{f}', fr(n, d)) : u ? `Wie lang ist die Strecke, wenn ${fr(n, d)} der Strecke ${p} m lang sind?` : `Wie gross ist das Ganze, wenn ${fr(n, d)} des Ganzen ${p} ${n === 1 ? 'ist' : 'sind'}?`;
  return { q, unit: u, ans, how: n === 1 ? `Stammbruch: ${unitStr(p, u)} · ${d} = <strong>${unitStr(ans, u)}</strong>` : `(${p} : ${n}) · ${d} = ${one} · ${d} = <strong>${unitStr(ans, u)}</strong>` };
}
function quizWidget(host) {
  let deck = [];
  return rounds(host, {
    total: 8,
    task(stage, answer, i) {
      if (i === 0) deck = shuffle([
        ...shuffle(A17).slice(0, 2).map(vor), vor(pick(A18)), rueck(pick(STAMM.slice(1).map((s) => [1, s.d, s.part, s.unit, s.q.replace(fr(1, s.d), '{f}')]))),
        ...shuffle(A21).slice(0, 2).map((a) => rueck([...a, 'm'])), ...shuffle(A22).slice(0, 2).map((a) => rueck(a)),
      ]);
      const t = deck[i];
      stage.innerHTML = `
        <div class="question">${t.q}</div>
        <div class="numeric"><input type="number" inputmode="numeric" class="num" placeholder="Zahl" aria-label="Antwort">${t.unit ? `<span class="unit-lbl">${t.unit}</span>` : ''}<button class="btn primary check">Prüfen</button></div>
        <div class="live"></div>`;
      const num = stage.querySelector('.num'), live = stage.querySelector('.live');
      const check = () => {
        const v = parseFloat(String(num.value).replace(',', '.'));
        if (Number.isNaN(v)) { live.textContent = 'Gib zuerst eine Zahl ein.'; live.classList.add('nudge'); return; }
        num.disabled = true; stage.querySelector('.check').disabled = true; live.textContent = '';
        const ok = Math.abs(v - t.ans) < 0.01;
        answer(ok, ok ? `✅ Richtig! ${t.how}` : `❌ Richtig wäre ${unitStr(t.ans, t.unit)}. ${t.how}`);
      };
      stage.querySelector('.check').onclick = check;
      num.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
      setTimeout(() => num.focus(), 50);
    },
  });
}

/* ---------- Seite 11: Merkkasten ---------- */
function merkWidget(host) {
  host.appendChild(h(`
    <div class="cards">
      <div class="card"><h4>🫗 Drei Wörter</h4><div><span class="term">Das Ganze</span>1000 ml</div><div><span class="term">Anteil</span>${fr(7, 10)}</div><div><span class="term">Bruchteil</span>700 ml</div></div>
      <div class="card"><h4>➡️ Bruchteil berechnen</h4><div>${fr(5, 7)} von 21 m = (21 m : 7) · 5 = 15 m</div><div class="sub">Durch den Nenner, mal den Zähler.</div></div>
      <div class="card"><h4>⬅️ Zurück zum Ganzen</h4><div>${fr(5, 7)} sind 15 m: (15 m : 5) · 7 = 21 m</div><div class="sub">Durch den Zähler, mal den Nenner.</div></div>
      <div class="card"><h4>1️⃣ Stammbruch</h4><div>${fr(1, 3)} sind 15 min: 15 min · 3 = 45 min</div><div class="sub">Zähler 1: der Bruchteil ist genau ein Teil.</div></div>
    </div>
    <ul class="checklist">
      <li>☐ Zuerst fragen: Ist das <strong>Ganze</strong> bekannt oder der <strong>Bruchteil</strong>? Steht «ganze» in der Frage, ist das Ganze gesucht.</li>
      <li>☐ Mit dem Teilen herausfinden, wie gross <strong>ein Teil</strong> ist. Dann malnehmen.</li>
      <li>☐ Geht die Division nicht auf? Dann hast du wahrscheinlich Zähler und Nenner <strong>vertauscht</strong>.</li>
      <li>☐ Ein Bruchteil ist <strong>kleiner</strong> als das Ganze, das Ganze ist <strong>grösser</strong> als der Bruchteil. Prüf das am Schluss.</li>
      <li>☐ Einheit nicht vergessen: ml, m, g, min.</li>
    </ul>`));
  confetti();
  return {};
}

export default {
  id: 'anteil',
  title: 'Den Anteil von etwas berechnen',
  subject: 'Mathe',
  grade: 6,
  pages: [
    {
      title: 'Die Wasserkaraffe',
      widget: ablesenWidget,
      body: `<p>In diese Karaffe passt genau ein Liter Wasser, das sind 1000 ml. Sie ist nicht ganz voll. An der Skala kannst du ablesen, wie viel drin ist.</p>
        <p>Drei Wörter brauchst du in dieser Lektion immer wieder. Das <strong>Ganze</strong> ist die volle Karaffe, 1000 ml. Der <strong>Anteil</strong> ist der Bruch, zum Beispiel ${fr(7, 10)}. Der <strong>Bruchteil</strong> ist die Menge, die zu diesem Anteil gehört: 700 ml.</p>`,
      tryThis: `<p>Schieb den Regler und wechsle die Teilung. Bei welcher Teilung trifft die Wasserlinie immer genau einen Strich der Skala, bei welcher liegt sie auch mal dazwischen?</p>`,
    },
    {
      title: 'Schritt für Schritt',
      widget: schrittWidget,
      body: `<p>Die Karaffe ist zu ${fr(7, 10)} befüllt. Wie rechnet man aus, wie viel Wasser das ist? Das Schulbuch macht es in vier Schritten, und jeder Schritt ist eine Frage.</p>
        <p>Der <strong>Nenner</strong> sagt, in wie viele gleich grosse Teile das Ganze geteilt wird. Der <strong>Zähler</strong> sagt, wie viele dieser Teile genommen werden.</p>`,
      tryThis: `<p>Geh die vier Schritte durch und schau bei jedem auf die Karaffe. Schritt 2 ist der wichtigste: Dort findest du heraus, wie gross <em>ein</em> Teil ist.</p>`,
    },
    {
      title: 'Strecken zerteilen',
      widget: streckeWidget,
      body: `<p>Dasselbe geht mit einer Strecke. Eine Strecke von ${fr(3, 4)} m Länge erhält man, indem man eine 1 m lange Strecke in vier gleich lange Teile zerlegt und dann drei Teile davon nimmt.</p>
        <p>${fr(3, 4)} m sind also 3 Viertel von einem ganzen Meter. Zuerst <strong>: 4</strong>, also durch den Nenner. Dann <strong>· 3</strong>, also mal den Zähler.</p>`,
      tryThis: `<p>Stell die Regler auf ${fr(5, 8)}. Was passiert mit der unteren Strecke, wenn du nur den Nenner grösser machst? Und wenn du nur den Zähler grösser machst?</p>`,
    },
    {
      title: 'Und ohne Skizze? Aufgabe 16',
      widget: aufgabe16,
      body: `<p>Jetzt ohne Hilfszeichnung: Bestimme ${fr(5, 7)} einer 21 m langen Strecke. Du gehst wieder in zwei Schritten vor. Fülle die Lücken und drück auf «Prüfen».</p>`,
      tryThis: `<p>Sprich die Rechnung laut mit: «21 durch 7 ist 3. Drei mal 5 ist 15.» So merkst du dir die Reihenfolge.</p>`,
    },
    {
      title: 'Merke: durch den Nenner, mal den Zähler',
      widget: regelWidget,
      body: `<p>So bestimmt man den Bruchteil eines Ganzen ganz einfach:</p>
        <p><strong>${fr(5, 7)} von 21 m = (21 m : 7) · 5 = 3 m · 5 = 15 m</strong></p>
        <p>Zuerst durch den Nenner teilen, dann mit dem Zähler malnehmen. Im Kasten siehst du auch drei Fehler, die oft passieren. Wichtig ist, woran man sie erkennt: Die Division geht nicht auf, oder das Ergebnis ist grösser als das Ganze.</p>`,
      tryThis: `<p>Wähle ${fr(7, 11)} von 88 und drück alle drei Fehler-Knöpfe. Welcher Fehler fällt am schnellsten auf, wenn du das Ergebnis mit dem Ganzen vergleichst?</p>`,
    },
    {
      title: 'Und umgekehrt? Der Stammbruch',
      widget: stammWidget,
      body: `<p>Wenn ${fr(1, 3)} einer Schulstunde 15 min dauert, wie lange ist dann eine ganze Schulstunde? Drei solche Teile aneinandergelegt: <strong>15 min · 3 = 45 min</strong>.</p>
        <p>Brüche mit Zähler 1, zum Beispiel ${fr(1, 3)}, ${fr(1, 2)} oder ${fr(1, 7)}, heissen <strong>Stammbrüche</strong>. Ist der Anteil ein Stammbruch, ist der Bruchteil genau ein Teil. Für das Ganze nimmst du ihn einfach mal den Nenner.</p>`,
      tryThis: `<p>Probier alle fünf Beispiele aus Aufgabe 19. Sag das Ergebnis voraus, bevor du auf den Knopf drückst.</p>`,
    },
    {
      title: 'Zurück zur ganzen Strecke',
      widget: rueckWidget,
      body: `<p>Wenn der Anteil kein Stammbruch ist, braucht es wieder zwei Schritte. Aus einer Strecke von ${fr(3, 4)} m wird ein ganzer Meter, indem man sie zuerst in <strong>drei</strong> gleich lange Teile zerlegt (jedes ist ${fr(1, 4)} m) und dann <strong>vier</strong> solche Teile aneinanderlegt.</p>
        <p>Also genau umgekehrt wie vorher: zuerst <strong>durch den Zähler</strong>, dann <strong>mal den Nenner</strong>.</p>`,
      tryThis: `<p>Wähle «${fr(5, 7)} sind 15 m» und geh beide Schritte durch. Vergleiche mit Seite 5: Dort kam man von 21 m auf 15 m, hier geht es zurück.</p>`,
    },
    {
      title: 'Aufgabe 20',
      widget: aufgabe20,
      body: `<p>Wenn ${fr(5, 7)} einer Strecke 15 m sind, wie lang ist dann die ganze Strecke? Zwei Schritte, Lücken füllen, prüfen.</p>`,
      tryThis: `<p>Vergleiche mit Aufgabe 16: Dieselben Zahlen 21, 7, 3, 5 und 15, nur in anderer Reihenfolge.</p>`,
    },
    {
      title: 'Vorwärts oder rückwärts?',
      widget: richtungWidget,
      body: `<p>Merke: Sind Anteil ${fr(5, 7)} und Bruchteil 15 m gegeben, lässt sich wieder das Ganze bestimmen. Im Prinzip geht das «rückwärts»: <strong>(15 m : 5) · 7 = 3 m · 7 = 21 m</strong>.</p>
        <p>Bei jeder Aufgabe musst du zuerst entscheiden: Ist das Ganze bekannt und der Bruchteil gesucht? Oder ist der Bruchteil bekannt und das Ganze gesucht? Das Wort «ganze» in der Frage ist ein guter Hinweis.</p>`,
    },
    {
      title: 'Üben wie im Heft',
      widget: quizWidget,
      body: `<p>Acht Aufgaben aus dem Heft, gemischt: Bruchteil berechnen (Aufgabe 17 und 18), Stammbruch (Aufgabe 19) und zurück zum Ganzen (Aufgabe 21 und 22). Gib nur die Zahl ein, die Einheit steht schon da.</p>`,
      tryThis: `<p>Schreib zu jeder Aufgabe die Rechnung mit Klammer auf Papier, wie im Merke-Kasten. Die Lösung erscheint nach jeder Aufgabe.</p>`,
    },
    {
      title: 'Merkkasten',
      widget: merkWidget,
      body: `<p>Das Wichtigste auf einen Blick. Geh die Checkliste vor der nächsten Arbeit einmal durch.</p>`,
    },
  ],
};

// Lektion (Klasse 6, Mathe): Brüche entdecken
import { h, confetti } from '../lesson.js';
import { playNote } from '../audio.js';

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const sameValue = ([a, b], [c, d]) => a * d === b * c;
const timersFor = () => { const l = []; return { after(ms, fn) { l.push(setTimeout(fn, ms)); }, clear() { l.forEach(clearTimeout); l.length = 0; } }; };

const blip = (m = 76) => playNote(m, { dur: 0.12, vel: 0.18, type: 'pluck' });
const yay = () => [72, 76, 79, 84].forEach((m, i) => playNote(m, { time: i * 0.09, dur: 0.18, vel: 0.2, type: 'pluck' }));
const nope = () => [62, 58].forEach((m, i) => playNote(m, { time: i * 0.14, dur: 0.2, vel: 0.2, type: 'pluck' }));

/* ---------- Bausteine: Bruch, gemischte Zahl, Pizza, Streifen ---------- */
const fr = (n, d, cls = '') => `<span class="frac ${cls}" role="img" aria-label="${n} von ${d}"><span>${n}</span><span>${d}</span></span>`;
const mix = (w, n, d) => (n ? `<span class="mixed">${w}${fr(n, d)}</span>` : `${w}`);

/** Pizza als SVG-Text. parts = Anzahl gleicher Stücke oder Liste von Anteilen. cls(i) = Klasse des Stücks: on, on2, out, eaten. */
function pizza(parts, cls = () => 'on', { tap = false, label = 'Pizza' } = {}) {
  const shares = Array.isArray(parts) ? parts : Array(parts).fill(1 / parts);
  const R = 84, C = 100;
  const at = (r, a) => `${(C + r * Math.cos(a)).toFixed(1)} ${(C + r * Math.sin(a)).toFixed(1)}`;
  let a = -Math.PI / 2;
  const slices = shares.map((s, i) => {
    const w = s * 2 * Math.PI, mid = a + w / 2, from = a;
    a += w;
    const shape = s >= 1
      ? `<circle cx="${C}" cy="${C}" r="${R}" class="dough"/>`
      : `<path class="dough" d="M${C} ${C} L${at(R, from)} A${R} ${R} 0 ${w > Math.PI ? 1 : 0} 1 ${at(R, from + w)} Z"/>`;
    const outer = Math.max(1, Math.round(w / (Math.PI / 3)));
    const dot = Math.min(8, 3 + w * 5);
    const dots = [[outer, 0.68], [Math.ceil(outer / 2), 0.38]].flatMap(([k, r]) => Array.from({ length: k }, (_, j) => {
      const [x, y] = at(R * r, from + (w * (j + 0.5)) / k).split(' ');
      return `<circle class="pep" cx="${x}" cy="${y}" r="${dot.toFixed(1)}"/>`;
    })).join('');
    return `<g class="slice ${cls(i)}" data-i="${i}" style="--ox:${(Math.cos(mid) * 12).toFixed(1)}px;--oy:${(Math.sin(mid) * 12).toFixed(1)}px"${tap ? ` role="button" tabindex="0" aria-label="Stück ${i + 1}"` : ''}>${shape}${dots}</g>`;
  }).join('');
  return `<svg class="pizza${tap ? ' tap' : ''}" viewBox="0 0 200 200" role="${tap ? 'group' : 'img'}" aria-label="${label}">${slices}</svg>`;
}
/** Klick und Tastatur auf Pizzastücke, einmal am Container angemeldet. */
function onSlice(spot, fn) {
  const hit = (e) => { const s = e.target.closest?.('.pizza.tap .slice'); if (s) { e.preventDefault(); fn(+s.dataset.i, s); } };
  spot.addEventListener('click', hit);
  spot.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') hit(e); });
}
/** Streifen: segs = [[Anteil, Klasse], …] nacheinander gefüllt, cuts = in so viele gleiche Stücke geschnitten. */
function fbar(segs, cuts, label = 'Streifen') {
  let left = 0;
  const fills = segs.map(([share, cls = '']) => { const s = `<span class="fill ${cls}" style="left:${left * 100}%;width:${share * 100}%"></span>`; left += share; return s; }).join('');
  const lines = Array.from({ length: cuts - 1 }, (_, i) => `<span class="cut" style="left:${((i + 1) / cuts) * 100}%"></span>`).join('');
  return `<div class="fbar" role="img" aria-label="${label}">${fills}${lines}</div>`;
}
const barRow = (label, bar) => `<div class="bar-row"><div class="bar-label">${label}</div>${bar}</div>`;
const chipRow = (cls, items) => `<div class="chips ${cls}">${items.map(([v, text]) => `<button class="chip" data-v="${v}">${text}</button>`).join('')}</div>`;
const select = (row, v) => row.querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c.dataset.v === String(v)));

/* ---------- Spielgerüst: Runden, Punkte, Weiter-Knopf, Sterne am Schluss ---------- */
function rounds(host, { total, task }) {
  let round = 0, score = 0, open = false;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="stage"></div>
    <div class="readout why"></div>
    <div class="controls"><button class="btn primary go-on hidden">Weiter →</button></div>
    <div class="result hidden" style="text-align:center;margin-top:1rem"><div class="stars"></div><p class="msg" style="font-size:1.2rem"></p><button class="btn primary again">Nochmal spielen</button></div>`));
  const $ = (s) => host.querySelector(s);
  function answer(ok, msg) {
    if (!open) return;
    open = false;
    if (ok) { score++; yay(); } else nope();
    $('.readout').innerHTML = msg;
    $('.pts').textContent = `${score} richtig`;
    round++;
    $('.go-on').textContent = round < total ? 'Nächste Runde →' : 'Ergebnis →';
    $('.go-on').classList.remove('hidden');
    $('.go-on').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function next() {
    open = true;
    $('.round').textContent = `Runde ${round + 1} von ${total}`;
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
    $('.msg').textContent = `${score} von ${total} richtig! ` + (stars === 3 ? 'Stark! 🎉' : stars >= 1 ? 'Gut gemacht. Noch eine Runde?' : 'Schau dir die Bilder nochmal an und probier es gleich wieder.');
    $('.result').classList.remove('hidden');
    if (stars >= 2) confetti();
  }
  $('.go-on').onclick = () => (round < total ? next() : finish());
  $('.again').onclick = () => { round = 0; score = 0; $('.result').classList.add('hidden'); next(); };
  next();
  return {};
}

/* ---------- Seite 1: Pizza für alle ---------- */
const FACES = ['🙂', '🦊', '🐼', '🐸', '🐯', '🦄', '🐙', '🐵'];
const STUECK = { 2: 'eine Hälfte', 3: 'ein Drittel', 4: 'ein Viertel', 5: 'ein Fünftel', 6: 'ein Sechstel', 7: 'ein Siebtel', 8: 'ein Achtel' };
function teilenWidget(host) {
  host.appendChild(h(`
    <div class="faces" aria-hidden="true"></div>
    <div class="pizza-spot"></div>
    <div class="sliders"><label><span>Am Tisch sitzen: <strong class="nv"></strong></span><input type="range" min="1" max="8" value="1" class="sn"></label></div>
    <div class="readout"></div>`));
  function render(n) {
    host.querySelector('.faces').textContent = FACES.slice(0, n).join(' ');
    host.querySelector('.nv').textContent = n;
    host.querySelector('.pizza-spot').innerHTML = pizza(n, (i) => (i === 0 && n > 1 ? 'on out' : 'on'), { label: `Pizza in ${n} Stücken` });
    host.querySelector('.readout').innerHTML = n === 1
      ? 'Du ganz allein: Die <strong>ganze Pizza</strong> gehört dir. 😋'
      : `${n} Personen, ${n} gleich grosse Stücke. Dein Stück ist <strong>1 von ${n}</strong>, also ${STUECK[n]} der Pizza.`;
  }
  host.querySelector('.sn').oninput = (e) => render(+e.target.value);
  render(1);
  return {};
}

/* ---------- Seite 2: Gerecht oder gemein? ---------- */
const piece = (el, cls) => el.replace('/>', ` class="${cls}"/>`);
const picRects = (widths) => {
  let x = 20;
  return `<svg class="pic" viewBox="0 0 280 150" role="img" aria-label="Schokoladentafel in Streifen">${widths.map((w, i) => { const r = piece(`<rect x="${x}" y="15" width="${w}" height="120"/>`, 'abc'[i % 3]); x += w; return r; }).join('')}</svg>`;
};
const TEILUNGEN = [
  { fair: true, draw: () => pizza(4), why: 'Vier genau gleiche Viertel, da kann niemand meckern.' },
  { fair: false, draw: () => pizza([0.45, 0.3, 0.15, 0.1]), why: 'Vier Stücke, aber eines ist riesig und eines winzig. Das sind keine Viertel.' },
  { fair: false, draw: () => pizza([0.5, 0.25, 0.25]), why: 'Eine Person bekommt die Hälfte, die anderen nur je ein Viertel. Drei Stücke sind nicht automatisch Drittel.' },
  { fair: true, draw: () => picRects([60, 60, 60, 60]), why: 'Vier gleich breite Streifen, alle gleich gross.' },
  { fair: false, draw: () => picRects([40, 120, 80]), why: 'Der mittlere Streifen ist dreimal so breit wie der linke.' },
  { fair: true, draw: () => `<svg class="pic" viewBox="0 0 280 180" role="img" aria-label="Quadrat, diagonal halbiert">${piece('<polygon points="70,20 210,20 210,160"/>', 'a')}${piece('<polygon points="70,20 210,160 70,160"/>', 'b')}</svg>`, why: 'Zwei Dreiecke, die genau aufeinanderpassen. Auch das sind zwei Hälften.' },
  { fair: false, draw: () => `<svg class="pic" viewBox="0 0 200 200" role="img" aria-label="Runde Pizza in drei Streifen">${piece('<path d="M72 20.8 A84 84 0 0 0 72 179.2 Z"/>', 'a')}${piece('<path d="M72 20.8 A84 84 0 0 1 128 20.8 L128 179.2 A84 84 0 0 1 72 179.2 Z"/>', 'b')}${piece('<path d="M128 20.8 A84 84 0 0 1 128 179.2 Z"/>', 'c')}</svg>`, why: 'Fieser Trick: Die Streifen sind gleich breit, aber wegen der Rundung ist der mittlere klar grösser.' },
  { fair: true, draw: () => { const map = ['aaab', 'aabb', 'abbb']; let s = ''; map.forEach((row, y) => [...row].forEach((c, x) => { s += piece(`<rect x="${60 + x * 40}" y="${15 + y * 40}" width="40" height="40"/>`, c); })); return `<svg class="pic" viewBox="0 0 280 150" role="img" aria-label="Tafel mit Treppenschnitt">${s}</svg>`; }, why: 'Sieht schräg aus, ist aber gerecht: Zähl nach, beide Teile haben 6 Kästchen. Die Form ist egal, die Grösse zählt.' },
];
function gerechtWidget(host) {
  let deck = [];
  return rounds(host, {
    total: TEILUNGEN.length,
    task(stage, answer, i) {
      if (i === 0) deck = shuffle(TEILUNGEN);
      const t = deck[i];
      stage.innerHTML = `
        <div class="question">Wurde hier gerecht geteilt?</div>
        <div class="pizza-spot">${t.draw()}</div>
        <div class="choices"><button class="btn big ok-choice" data-f="1">😇 Gerecht</button><button class="btn big no-choice" data-f="0">😠 Gemein</button></div>`;
      stage.querySelectorAll('.choices .btn').forEach((b) => (b.onclick = () => {
        const ok = (b.dataset.f === '1') === t.fair;
        b.classList.add(ok ? 'ok' : 'bad');
        stage.querySelectorAll('.choices .btn').forEach((x) => (x.disabled = true));
        answer(ok, `${ok ? '✅ Genau.' : '❌ Schau nochmal hin.'} ${t.why}`);
      }));
    },
  });
}

/* ---------- Seite 3: Schokolade essen ---------- */
const TAFELN = [[2, 3], [2, 4], [2, 5], [3, 4]];
function schokoWidget(host) {
  let rows = 3, cols = 4, eaten = 0;
  host.appendChild(h(`
    <div class="choc"></div>
    <div class="step-label">🍫 Neue Tafel:</div>
    ${chipRow('sizes', TAFELN.map(([r, c]) => [`${r}x${c}`, `${r * c} Stücke`]))}
    <div class="frac-terms hidden">
      <div class="frac-now"></div>
      <div class="term-list">
        <div><strong>Zähler</strong>: So viele Stücke hast du gegessen.</div>
        <div><strong>Nenner</strong>: In so viele gleiche Stücke ist die Tafel geteilt.</div>
      </div>
    </div>
    <div class="readout"></div>`));
  const grid = host.querySelector('.choc'), sizes = host.querySelector('.sizes');
  const terms = host.querySelector('.frac-terms'), readout = host.querySelector('.readout');
  function fresh() {
    eaten = 0;
    const total = rows * cols;
    grid.style.setProperty('--cols', cols);
    grid.innerHTML = Array.from({ length: total }, () => '<button class="choc-piece" aria-label="Stück Schokolade"></button>').join('');
    select(sizes, `${rows}x${cols}`);
    terms.classList.add('hidden');
    readout.innerHTML = 'Mmh, Schokolade. Tippe auf ein Stück und iss es!';
  }
  function show() {
    const total = rows * cols;
    terms.classList.remove('hidden');
    host.querySelector('.frac-now').innerHTML = fr(eaten, total, 'big');
    readout.innerHTML = eaten === total
      ? `${fr(total, total)} ist die <strong>ganze Tafel</strong>. Alles weg, und jetzt vielleicht ein bisschen Bauchweh. 🤢`
      : `Gegessen: ${eaten} von ${total} Stücken. Übrig: ${fr(total - eaten, total)}`;
    if (eaten === total) confetti();
  }
  grid.addEventListener('click', (e) => {
    const p = e.target.closest('.choc-piece');
    if (!p || p.disabled) return;
    p.disabled = true;
    p.classList.add('eaten');
    p.setAttribute('aria-label', 'Gegessen');
    eaten++;
    blip(84 - eaten);
    show();
  });
  sizes.querySelectorAll('.chip').forEach((c) => (c.onclick = () => { [rows, cols] = c.dataset.v.split('x').map(Number); fresh(); }));
  fresh();
  return {};
}

/* ---------- Seite 4: Pizzeria ---------- */
const BESTELLUNGEN = [[1, 2], [1, 4], [3, 4], [1, 3], [2, 3], [1, 6], [5, 6], [3, 8], [5, 8], [2, 5]];
function pizzeriaWidget(host) {
  let deck = [];
  return rounds(host, {
    total: 6,
    task(stage, answer, i) {
      if (i === 0) deck = shuffle(BESTELLUNGEN);
      const [n, d] = deck[i];
      let cut = 0, closed = false;
      const picked = new Set();
      stage.innerHTML = `
        <div class="ticket">🧾 Bestellung: ${fr(n, d, 'big')} Pizza</div>
        <div class="pizza-spot"></div>
        <div class="step-label">🔪 In wie viele Stücke schneidest du?</div>
        ${chipRow('cuts', [2, 3, 4, 5, 6, 8].map((c) => [c, c]))}
        <div class="live"></div>
        <div class="controls"><button class="btn primary big serve">🛎️ Servieren</button></div>`;
      const spot = stage.querySelector('.pizza-spot'), serve = stage.querySelector('.serve'), live = stage.querySelector('.live');
      const tell = (nudge = false) => {
        live.textContent = !cut ? 'Wähle zuerst, in wie viele Stücke du schneidest.'
          : picked.size ? `Belegt: ${picked.size} von ${cut} Stücken.`
          : 'Tippe jetzt auf die Stücke, die du belegen willst.';
        live.classList.toggle('nudge', nudge);
      };
      const draw = () => { spot.innerHTML = pizza(cut || 1, () => '', { tap: cut > 1 && !closed, label: 'Pizza zum Belegen' }); };
      onSlice(spot, (k, s) => {
        if (closed) return;
        if (picked.has(k)) picked.delete(k); else picked.add(k);
        s.classList.toggle('on', picked.has(k));
        blip();
        tell();
      });
      stage.querySelectorAll('.cuts .chip').forEach((c) => (c.onclick = () => {
        if (closed) return;
        cut = +c.dataset.v;
        picked.clear();
        select(stage.querySelector('.cuts'), cut);
        tell();
        draw();
      }));
      serve.onclick = () => {
        if (!cut || !picked.size) { nope(); tell(true); return; }
        closed = true;
        serve.disabled = true;
        live.textContent = '';
        stage.querySelectorAll('.cuts .chip').forEach((c) => (c.disabled = true));
        const got = [picked.size, cut];
        const ok = sameValue(got, [n, d]);
        spot.querySelector('.pizza').classList.remove('tap');
        if (ok && cut === d) answer(true, `✅ Perfekt! In ${d} Stücke geschnitten, ${n} belegt. Der Gast strahlt.`);
        else if (ok) answer(true, `✅ Auch richtig! ${fr(...got)} ist genau gleich viel wie ${fr(n, d)}. Warum das so ist, siehst du bald.`);
        else {
          spot.innerHTML = pizza(d, (k) => (k < n ? 'on' : ''), { label: `So sieht ${n} von ${d} aus` });
          answer(false, `❌ Das waren ${fr(...got)}. Bestellt war ${fr(n, d)}: in ${d} Stücke schneiden und ${n} belegen, so wie auf dem Bild.`);
        }
      };
      tell();
      draw();
    },
  });
}

/* ---------- Seite 5: Wer hat mehr? ---------- */
const DUELLE = [
  [[1, 2], [1, 3]], [[1, 4], [1, 8]], [[1, 5], [1, 3]], [[3, 5], [2, 5]], [[3, 4], [1, 4]], [[5, 8], [7, 8]],
  [[1, 2], [2, 4]], [[3, 6], [1, 2]], [[2, 6], [1, 3]], [[2, 3], [1, 6]], [[5, 8], [1, 2]], [[1, 2], [3, 8]],
];
function duellGrund([a, b], [c, d]) {
  if (sameValue([a, b], [c, d])) return `Gleich viel! Anders geschnitten, aber dieselbe Menge Pizza.`;
  const aMore = a * d > c * b;
  const big = aMore ? [a, b] : [c, d], small = aMore ? [c, d] : [a, b];
  if (a === c) return `Beide haben gleich viele Stücke, aber bei ${fr(...small)} sind die Stücke kleiner. Grösserer Nenner heisst: kleinere Stücke.`;
  if (b === d) return `Die Stücke sind gleich gross, und bei ${fr(...big)} sind es mehr.`;
  return `Vergleiche die Pizzas: ${fr(...big)} ist mehr als ${fr(...small)}.`;
}
function duellWidget(host) {
  let deck = [];
  return rounds(host, {
    total: 7,
    task(stage, answer, i) {
      if (i === 0) deck = shuffle(DUELLE);
      const [x, y] = shuffle(deck[i]);
      const more = x[0] * y[1] - y[0] * x[1];
      const right = more > 0 ? 'x' : more < 0 ? 'y' : 'same';
      stage.innerHTML = `
        <div class="question">Wer bekommt mehr Pizza? Zuerst aus dem Bauch!</div>
        <div class="duel">
          <button class="btn big" data-a="x">🦊 ${fr(...x)}</button>
          <button class="btn big" data-a="y">🐼 ${fr(...y)}</button>
          <button class="btn same" data-a="same">🤝 Beide gleich viel</button>
        </div>
        <div class="pizza-row reveal"></div>`;
      stage.querySelectorAll('.duel .btn').forEach((b) => (b.onclick = () => {
        const ok = b.dataset.a === right;
        stage.querySelectorAll('.duel .btn').forEach((o) => { o.disabled = true; if (o.dataset.a === right) o.classList.add('ok'); });
        if (!ok) b.classList.add('bad');
        stage.querySelector('.reveal').innerHTML = [x, y].map(([n, d], k) => `<div class="pizza-cell">${pizza(d, (j) => (j < n ? 'on' : ''), { label: `${n} von ${d}` })}<div class="pizza-cap">${k ? '🐼' : '🦊'} ${fr(n, d)}</div></div>`).join('');
        answer(ok, `${ok ? '✅' : '❌'} ${duellGrund(x, y)}`);
      }));
    },
  });
}

/* ---------- Seite 6: Gleich viel, andere Zahlen ---------- */
const STARTS = [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5]];
function erweiternWidget(host) {
  let n = 1, d = 2, k = 1;
  host.appendChild(h(`
    <div class="step-label">Wähle einen Bruch:</div>
    ${chipRow('starts', STARTS.map(([a, b]) => [`${a}/${b}`, fr(a, b)]))}
    <div class="bar-rows"></div>
    <div class="sliders"><label><span>Jedes Stück teilen in: <strong class="kv"></strong></span><input type="range" min="1" max="5" value="1" class="sk"></label></div>
    <div class="equation"></div>
    <div class="readout"></div>`));
  const starts = host.querySelector('.starts');
  function render() {
    select(starts, `${n}/${d}`);
    host.querySelector('.kv').textContent = k;
    host.querySelector('.bar-rows').innerHTML =
      barRow(fr(n, d), fbar([[n / d]], d, `Streifen: ${n} von ${d}`)) +
      barRow(fr(n * k, d * k), fbar([[n / d]], d * k, `Streifen: ${n * k} von ${d * k}`));
    host.querySelector('.equation').innerHTML = k === 1
      ? `${fr(n, d)} = ${fr(n, d)}`
      : `${fr(n, d)} = ${fr(`${n} · ${k}`, `${d} · ${k}`)} = ${fr(n * k, d * k)}`;
    host.querySelector('.readout').textContent = k === 1
      ? 'Noch kein neuer Schnitt. Schieb den Regler!'
      : `${d * k} statt ${d} Stücke, aber die Farbe reicht genau gleich weit. Gleich viel Schokolade, nur kleiner geschnitten.`;
  }
  starts.querySelectorAll('.chip').forEach((c) => (c.onclick = () => { [n, d] = c.dataset.v.split('/').map(Number); k = 1; host.querySelector('.sk').value = 1; render(); }));
  host.querySelector('.sk').oninput = (e) => { k = +e.target.value; render(); };
  render();
  return {};
}

/* ---------- Seite 7: Memory ---------- */
const PAARE = [[1, 2, 2, 4], [1, 3, 2, 6], [2, 3, 4, 6], [3, 4, 6, 8], [1, 4, 2, 8], [3, 5, 6, 10]];
function memoryWidget(host) {
  const t = timersFor();
  let first = null, lock = false, moves = 0, found = 0;
  host.appendChild(h(`
    <div class="memory"></div>
    <div class="readout"></div>
    <div class="controls"><button class="btn ghost reset">Neu mischen</button></div>`));
  const grid = host.querySelector('.memory'), readout = host.querySelector('.readout');
  function deal() {
    t.clear();
    first = null; lock = false; moves = 0; found = 0;
    const cards = shuffle(PAARE.flatMap(([a, b, c, d], id) => [
      { id, a, b, front: fr(a, b, 'big'), label: `Bruch ${a} von ${b}` },
      { id, a, b, front: pizza(d, (i) => (i < c ? 'on' : ''), { label: `Pizza: ${c} von ${d}` }), label: `Pizza: ${c} von ${d}` },
    ]));
    grid.innerHTML = cards.map((c) => `<button class="mem" data-id="${c.id}" data-a="${c.a}" data-b="${c.b}" data-label="${c.label}" aria-label="Verdeckte Karte"><span class="mem-in"><span class="mem-back" aria-hidden="true">?</span><span class="mem-front">${c.front}</span></span></button>`).join('');
    readout.innerHTML = 'Finde die Paare: Jeder Bruch gehört zu einer Pizza, die gleich viel zeigt.';
  }
  const flip = (c, open) => { c.classList.toggle('open', open); c.setAttribute('aria-label', open ? c.dataset.label : 'Verdeckte Karte'); };
  grid.addEventListener('click', (e) => {
    const c = e.target.closest('.mem');
    if (!c || lock || c.classList.contains('open')) return;
    flip(c, true);
    blip();
    if (!first) { first = c; return; }
    moves++;
    const other = first;
    first = null;
    if (other.dataset.id === c.dataset.id) {
      other.classList.add('found'); c.classList.add('found');
      found++;
      yay();
      if (found === PAARE.length) { readout.innerHTML = `🎉 Alle Paare gefunden, in <strong>${moves} Zügen</strong>. Schaffst du es in weniger?`; confetti(); }
      else readout.innerHTML = `✅ Paar! Die Pizza zeigt genau ${fr(+c.dataset.a, +c.dataset.b)}.`;
    } else {
      lock = true;
      readout.textContent = 'Das ist nicht gleich viel. Merk dir, wo die Karten liegen!';
      t.after(1200, () => { flip(other, false); flip(c, false); lock = false; });
    }
  });
  host.querySelector('.reset').onclick = deal;
  deal();
  return { destroy: t.clear };
}

/* ---------- Seite 8: Mehr als eine Pizza ---------- */
function ganzesWidget(host) {
  let d = 4, k = 3;
  const MAX = 3;
  host.appendChild(h(`
    <div class="step-label">So gross ist ein Stück:</div>
    ${chipRow('sizes', [2, 3, 4, 6, 8].map((c) => [c, fr(1, c)]))}
    <div class="pizza-row wholes"></div>
    <div class="controls"><button class="btn big accent add">+ 1 Stück</button><button class="btn big ghost sub">− 1 Stück</button></div>
    <div class="equation"></div>
    <div class="readout"></div>`));
  const sizes = host.querySelector('.sizes');
  function render() {
    select(sizes, d);
    const count = Math.max(1, Math.ceil(k / d));
    host.querySelector('.wholes').innerHTML = Array.from({ length: count }, (_, p) => `<div class="pizza-cell">${pizza(d, (i) => (p * d + i < k ? 'on' : ''), { label: `Pizza ${p + 1}` })}</div>`).join('');
    const w = Math.floor(k / d), r = k % d;
    host.querySelector('.equation').innerHTML = k === 0 ? '' : `${k} · ${fr(1, d)} = ${fr(k, d)}${k >= d ? ` = ${mix(w, r, d)}` : ''}`;
    host.querySelector('.readout').innerHTML = k === 0 ? 'Noch nichts auf dem Tisch. Leg Stücke hin!'
      : k < d ? `Noch keine ganze Pizza: ${k} von ${d} Stücken.`
      : r === 0 ? `Genau ${w === 1 ? 'eine ganze Pizza' : `${w} ganze Pizzas`}! 🎉`
      : `Mehr als eine Pizza: ${w === 1 ? 'eine ganze' : `${w} ganze`} und noch ${fr(r, d)} dazu.`;
    host.querySelector('.add').disabled = k >= MAX * d;
    host.querySelector('.sub').disabled = k <= 0;
  }
  sizes.querySelectorAll('.chip').forEach((c) => (c.onclick = () => { d = +c.dataset.v; k = 0; render(); }));
  host.querySelector('.add').onclick = () => { k++; blip(72 + (k % d)); render(); };
  host.querySelector('.sub').onclick = () => { k--; blip(70); render(); };
  render();
  return {};
}

/* ---------- Seite 9: Plus und Minus mit gleichen Stücken ---------- */
function plusMinusWidget(host) {
  let d = 8, a = 2, b = 3, op = '+', trap = false;
  host.appendChild(h(`
    <div class="segmented ops"><button data-op="+" class="selected">Plus</button><button data-op="−">Minus</button></div>
    <div class="step-label">So viele Stücke hat die Pizza:</div>
    ${chipRow('dens', [4, 5, 6, 8].map((c) => [c, c]))}
    <div class="pizza-row pics"></div>
    <div class="steppers">
      <div class="stepper"><span class="stepper-label la"></span><button class="btn ghost" data-f="a" data-s="-1" aria-label="Eins weniger">−</button><strong class="av"></strong><button class="btn ghost" data-f="a" data-s="1" aria-label="Eins mehr">+</button></div>
      <div class="stepper"><span class="stepper-label lb"></span><button class="btn ghost" data-f="b" data-s="-1" aria-label="Eins weniger">−</button><strong class="bv"></strong><button class="btn ghost" data-f="b" data-s="1" aria-label="Eins mehr">+</button></div>
    </div>
    <div class="equation"></div>
    <div class="readout"></div>
    <div class="controls trap-row"><button class="btn ghost trap">😈 Und wenn ich die Nenner auch addiere?</button></div>`));
  const $ = (s) => host.querySelector(s);
  const plus = () => op === '+';
  const stuecke = (k) => (k === 1 ? 'Stück' : 'Stücke');
  const hiA = () => (plus() ? d - 1 : d), hiB = () => (plus() ? d - a : a);
  function fit() { a = Math.min(Math.max(a, 1), hiA()); b = Math.min(Math.max(b, 1), hiB()); }
  function render() {
    fit();
    select($('.dens'), d);
    $('.av').textContent = a; $('.bv').textContent = b;
    $('.la').textContent = plus() ? '🍕 Salami-Stücke' : '🍕 Stücke da';
    $('.lb').textContent = plus() ? '🌿 Pesto-Stücke' : '😋 Stücke gegessen';
    host.querySelectorAll('.stepper .btn').forEach((x) => {
      const v = x.dataset.f === 'a' ? a : b, hi = x.dataset.f === 'a' ? hiA() : hiB();
      x.disabled = +x.dataset.s < 0 ? v <= 1 : v >= hi;
    });
    const cls = plus()
      ? (i) => (i < a ? 'on' : i < a + b ? 'on2' : '')
      : (i) => (i < a - b ? 'on' : i < a ? 'eaten' : '');
    const res = plus() ? a + b : a - b;
    let pics = `<div class="pizza-cell">${pizza(d, cls, { label: `Pizza in ${d} Stücken` })}</div>`;
    if (trap) pics += `<div class="pizza-cell">${pizza(2 * d, (i) => (i < res ? 'on' : ''), { label: `Falsch: ${res} von ${2 * d}` })}<div class="pizza-cap">😈 ${fr(res, 2 * d)}</div></div>`;
    $('.pics').innerHTML = pics;
    $('.equation').innerHTML = `${fr(a, d)} ${op} ${fr(b, d)} = ${fr(res, d)}${res === d ? ' = 1' : res === 0 ? ' = 0' : ''}`;
    $('.readout').innerHTML = trap
      ? `Das gäbe ${fr(res, 2 * d)}, nur <strong>halb so viel</strong> wie richtig! Die Pizza schrumpft doch nicht, wenn man Stücke zusammenlegt. Der Nenner sagt nur, wie gross die Stücke sind, und das bleibt gleich.`
      : plus()
        ? `${a} ${stuecke(a)} und ${b} ${stuecke(b)} sind ${res} ${stuecke(res)}. Die Stücke bleiben ${d === 4 ? 'Viertel' : d === 5 ? 'Fünftel' : d === 6 ? 'Sechstel' : 'Achtel'}, also bleibt der Nenner ${d}.`
        : `Von ${a} ${a === 1 ? 'Stück' : 'Stücken'} ${b} weg, ${res === 1 ? 'bleibt 1' : `bleiben ${res}`}. Der Nenner bleibt ${d}.`;
    $('.trap-row').classList.toggle('hidden', !plus());
  }
  host.querySelectorAll('.ops button').forEach((x) => (x.onclick = () => {
    if (x.dataset.op === op) return;
    op = x.dataset.op; trap = false;
    a = plus() ? a - b : a + b; // Minus macht das Plus rückgängig und umgekehrt
    host.querySelectorAll('.ops button').forEach((y) => y.classList.toggle('selected', y === x));
    render();
  }));
  $('.dens').querySelectorAll('.chip').forEach((c) => (c.onclick = () => { d = +c.dataset.v; trap = false; render(); }));
  host.querySelectorAll('.stepper .btn').forEach((x) => (x.onclick = () => {
    if (x.dataset.f === 'a') a += +x.dataset.s; else b += +x.dataset.s;
    trap = false; blip(); render();
  }));
  $('.trap').onclick = () => { trap = true; nope(); render(); };
  render();
  return {};
}

/* ---------- Seite 10: Stücke passend schneiden ---------- */
const UNGLEICH = [[1, 2, 1, 4], [1, 2, 1, 3], [1, 3, 1, 6], [1, 4, 1, 8], [2, 3, 1, 4], [1, 2, 2, 5], [1, 4, 1, 6], [3, 8, 1, 4]];
const SCHNITTE = [2, 3, 4, 5, 6, 8, 10, 12];
function gleichnamigWidget(host) {
  const TOTAL = 5;
  let deck = [], i = 0, cut = 0;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span></div>
    <div class="question"></div>
    <div class="bar-rows"></div>
    <div class="step-label">🔪 Schneide beide Streifen in:</div>
    ${chipRow('cuts', SCHNITTE.map((c) => [c, c]))}
    <div class="equation"></div>
    <div class="readout why"></div>
    <div class="controls"><button class="btn primary go-on hidden">Nächste Aufgabe →</button></div>`));
  const $ = (s) => host.querySelector(s);
  function start() { deck = shuffle(UNGLEICH); i = 0; next(); }
  function next() { cut = 0; $('.go-on').classList.add('hidden'); render(); }
  function render() {
    const [a, b, c, d] = deck[i];
    const f1 = cut && cut % b === 0, f2 = cut && cut % d === 0, fit = f1 && f2;
    $('.round').textContent = `Aufgabe ${i + 1} von ${TOTAL}`;
    $('.question').innerHTML = `Wie viel ist ${fr(a, b)} + ${fr(c, d)}?`;
    select($('.cuts'), cut);
    let rows = barRow(fr(a, b), fbar([[a / b]], cut || b, `Streifen: ${a} von ${b}`)) + barRow(fr(c, d), fbar([[c / d, 'b']], cut || d, `Streifen: ${c} von ${d}`));
    if (fit) {
      const x = (a * cut) / b, y = (c * cut) / d;
      rows += barRow(fr(x + y, cut), fbar([[a / b], [c / d, 'b']], cut, `Summe: ${x + y} von ${cut}`));
      $('.equation').innerHTML = `${fr(a, b)} + ${fr(c, d)} = ${fr(x, cut)} + ${fr(y, cut)} = ${fr(x + y, cut)}`;
      $('.readout').innerHTML = `✅ Passt! Beide haben jetzt den Nenner ${cut}, also gleich grosse Stücke. Jetzt kannst du einfach zählen: ${x} + ${y} = ${x + y}.`;
      $('.go-on').textContent = i + 1 < TOTAL ? 'Nächste Aufgabe →' : 'Geschafft →';
      $('.go-on').classList.remove('hidden');
      yay();
    } else {
      $('.equation').innerHTML = '';
      const miss = [!f1 && fr(a, b), !f2 && fr(c, d)].filter(Boolean).join(' und ');
      $('.readout').innerHTML = !cut
        ? 'Die Stücke sind verschieden gross, so kann man sie nicht zählen. Such einen Schnitt, der für beide passt.'
        : `Noch nicht: Bei ${miss} endet die Farbe mitten in einem Stück.`;
      if (cut) nope();
    }
    $('.bar-rows').innerHTML = rows;
  }
  $('.cuts').querySelectorAll('.chip').forEach((c) => (c.onclick = () => { cut = +c.dataset.v; render(); }));
  $('.go-on').onclick = () => {
    if (i + 1 < TOTAL) { i++; next(); return; }
    confetti();
    start();
  };
  start();
  return {};
}

/* ---------- Seite 11: Gummibärchen verteilen ---------- */
const BAEREN = [[1, 2, 10], [1, 4, 8], [3, 4, 12], [2, 3, 9], [1, 3, 12], [3, 5, 10], [2, 5, 15], [5, 6, 12], [3, 4, 16], [2, 3, 15]];
function baerenWidget(host) {
  let deck = [];
  return rounds(host, {
    total: 5,
    task(stage, answer, i) {
      if (i === 0) deck = shuffle(BAEREN);
      const [n, d, total] = deck[i];
      const right = (n * total) / d;
      let plates = 0, closed = false;
      const taken = new Set();
      stage.innerHTML = `
        <div class="question">Nimm dir ${fr(n, d, 'big')} von ${total} Gummibärchen.</div>
        <div class="step-label">1. Auf wie viele Teller verteilst du alle?</div>
        ${chipRow('nums', [2, 3, 4, 5, 6].map((c) => [c, c]))}
        <div class="plates"></div>
        <div class="live"></div>
        <div class="controls"><button class="btn primary big take">🐻 Das nehme ich</button></div>`;
      const box = stage.querySelector('.plates'), live = stage.querySelector('.live'), take = stage.querySelector('.take');
      const bears = (k) => '🐻'.repeat(k);
      function draw() {
        live.classList.remove('nudge');
        if (!plates) { box.innerHTML = `<div class="plate pile">${bears(total)}</div>`; live.textContent = 'Wähle zuerst, auf wie viele Teller du verteilst.'; return; }
        const each = Math.floor(total / plates), rest = total - each * plates;
        box.innerHTML = Array.from({ length: plates }, (_, p) => `<button class="plate${taken.has(p) ? ' taken' : ''}" data-p="${p}" ${rest || closed ? 'disabled' : ''} aria-label="Teller ${p + 1} mit ${each} Gummibärchen">${bears(each)}</button>`).join('')
          + (rest ? `<div class="plate pile">${bears(rest)}</div>` : '');
        live.innerHTML = rest
          ? `Das geht nicht auf: ${rest} Gummibärchen ${rest === 1 ? 'bleibt' : 'bleiben'} übrig. Versuch eine andere Tellerzahl.`
          : `2. Tippe auf die Teller, die du nimmst. Du hast <strong>${taken.size * each}</strong> Gummibärchen.`;
        take.disabled = closed;
      }
      stage.querySelectorAll('.nums .chip').forEach((c) => (c.onclick = () => {
        if (closed) return;
        plates = +c.dataset.v; taken.clear();
        select(stage.querySelector('.nums'), plates);
        draw();
      }));
      box.addEventListener('click', (e) => {
        const p = e.target.closest('button.plate');
        if (!p || closed) return;
        const k = +p.dataset.p;
        if (taken.has(k)) taken.delete(k); else taken.add(k);
        blip();
        draw();
      });
      take.onclick = () => {
        if (!plates || total % plates || !taken.size) { nope(); live.classList.add('nudge'); return; }
        closed = true;
        stage.querySelectorAll('.nums .chip').forEach((c) => (c.disabled = true));
        const got = taken.size * Math.floor(total / plates);
        draw();
        const how = `${total} : ${d} = ${total / d}, und ${n} · ${total / d} = ${right}.`;
        answer(got === right, got === right ? `✅ Richtig! ${how}` : `❌ Du hast ${got} genommen, richtig wären ${right}. ${how}`);
      };
      draw();
    },
  });
}

/* ---------- Seite 12: Bruch-Meisterschaft ---------- */
function fracChoices(right, wrongs) {
  const seen = [right];
  const out = [];
  for (const w of shuffle(wrongs)) {
    if (w[0] < 1 || w[1] < 1 || seen.some((s) => sameValue(s, w))) continue;
    seen.push(w); out.push({ html: fr(...w), ok: false });
    if (out.length === 3) break;
  }
  return shuffle([{ html: fr(...right), ok: true }, ...out]);
}
function numChoices(right, wrongs, unit = '') {
  const uniq = [...new Set(wrongs)].filter((w) => w > 0 && w !== right);
  return shuffle([right, ...shuffle(uniq).slice(0, 3)]).map((v) => ({ html: `${v}${unit}`, ok: v === right }));
}
const AUFGABEN = {
  bild() {
    const [n, d] = pick([[1, 4], [3, 4], [2, 3], [3, 8], [5, 6], [2, 5], [5, 8]]);
    return { q: 'Welcher Bruch zeigt den belegten Teil der Pizza?', pic: pizza(d, (i) => (i < n ? 'on' : ''), { label: `Pizza: ${n} von ${d}` }),
      opts: fracChoices([n, d], [[d - n, d], [n, d + 1], [n + 1, d + 1], [d, n], [n + 1, d]]), why: `${d} Stücke insgesamt, ${n} davon belegt.` };
  },
  vergleich() {
    const [x, y] = shuffle(pick([[[3, 8], [5, 8]], [[1, 3], [1, 5]], [[2, 3], [1, 2]], [[3, 4], [6, 8]], [[1, 2], [3, 8]], [[2, 6], [1, 3]], [[5, 6], [1, 2]]]));
    const diff = x[0] * y[1] - y[0] * x[1];
    return { q: 'Was ist mehr?', opts: [{ html: fr(...x), ok: diff > 0 }, { html: fr(...y), ok: diff < 0 }, { html: 'Beide gleich viel', ok: diff === 0 }], why: duellGrund(x, y) };
  },
  erweitern() {
    const [n, d, k] = pick([[1, 2, 4], [2, 3, 2], [3, 4, 2], [1, 3, 3], [2, 5, 2], [3, 4, 3]]);
    return { q: `Welche Zahl gehört ins Fragezeichen? ${fr(n, d)} = ${fr('?', d * k)}`, opts: numChoices(n * k, [n + k, n * k + 1, n * k - 1, n * k + 2, d * k - n, n, d * k]),
      why: `Der Nenner wurde mit ${k} malgenommen, also auch der Zähler: ${n} · ${k} = ${n * k}.` };
  },
  kuerzen() {
    const [n, d] = pick([[6, 8], [4, 6], [5, 10], [6, 9], [8, 12], [3, 12], [4, 10]]);
    const g = gcd(n, d), r = n / g, s = d / g;
    return { q: `Welcher Bruch ist gleich viel wie ${fr(n, d)}?`, opts: fracChoices([r, s], [[r + 1, s], [r, s + 1], [s - r, s], [r + 2, s + 2], [r + 1, s + 3]]),
      why: `Oben und unten durch ${g}: ${n} : ${g} = ${r}, ${d} : ${g} = ${s}.` };
  },
  plus() {
    const [a, b, d] = pick([[2, 3, 8], [1, 2, 4], [2, 2, 5], [1, 3, 6], [3, 4, 8], [1, 1, 3], [2, 3, 6], [1, 3, 5]]);
    return { q: `${fr(a, d)} + ${fr(b, d)} = ?`, opts: fracChoices([a + b, d], [[a + b, 2 * d], [a + b, d + 1], [a + b + 1, d], [a + b - 1, d], [a * b, d]]),
      why: `Gleich grosse Stücke zusammenzählen: ${a} + ${b} = ${a + b}. Der Nenner bleibt ${d}.` };
  },
  minus() {
    const [a, b, d] = pick([[5, 2, 8], [3, 1, 4], [4, 3, 6], [7, 4, 10], [5, 3, 6], [4, 1, 5]]);
    return { q: `${fr(a, d)} − ${fr(b, d)} = ?`, opts: fracChoices([a - b, d], [[a - b, d - b], [a + b, d], [a - b + 1, d], [a - b, d + 1], [a - b - 1, d]]),
      why: `${a} − ${b} = ${a - b}. Der Nenner bleibt ${d}.` };
  },
  ungleich() {
    const [a, b, c, d] = pick([[1, 2, 1, 4], [1, 2, 1, 3], [1, 3, 1, 6], [1, 4, 1, 8], [1, 2, 1, 6], [1, 2, 1, 8], [2, 3, 1, 6]]);
    const l = (b * d) / gcd(b, d), x = (a * l) / b, y = (c * l) / d;
    return { q: `${fr(a, b)} + ${fr(c, d)} = ?`, opts: fracChoices([x + y, l], [[a + c, b + d], [a + c, l], [x + y + 1, l], [x + y - 1, l], [a + c, b * d]]),
      why: `Zuerst gleich grosse Stücke: ${fr(x, l)} + ${fr(y, l)} = ${fr(x + y, l)}.` };
  },
  gemischt() {
    const [n, d] = pick([[7, 4], [5, 2], [5, 3], [9, 4], [7, 3], [11, 8], [7, 6]]);
    const w = Math.floor(n / d), r = n % d;
    const wrong = [[w + 1, r, d], [w, d - r, d], [w, r, d + 1], [w + 2, r, d], [w, r + 1, d]]
      .filter(([x, y, z]) => y < z && x * z + y !== 0 && (x + y / z) !== n / d)
      .filter((t, i, all) => all.findIndex((o) => o[0] + o[1] / o[2] === t[0] + t[1] / t[2]) === i);
    return { q: `Wie viele ganze Pizzas und Stücke sind ${fr(n, d)}?`, opts: shuffle([{ html: mix(w, r, d), ok: true }, ...shuffle(wrong).slice(0, 3).map((t) => ({ html: mix(...t), ok: false }))]),
      why: `In einer Pizza sind ${d} Stücke. ${n} Stücke ergeben ${w} ganze und ${r} übrig.` };
  },
  menge() {
    const [n, d, t] = pick(BAEREN);
    const right = (n * t) / d, one = t / d;
    return { q: `Wie viel sind ${fr(n, d)} von ${t} Gummibärchen?`, opts: numChoices(right, [one, t - right, right + one, right + 1, right - 1, t - n], ' 🐻'),
      why: `${t} : ${d} = ${one}, und ${n} · ${one} = ${right}.` };
  },
};
function meisterWidget(host) {
  let deck = [];
  return rounds(host, {
    total: 8,
    task(stage, answer, i) {
      if (i === 0) deck = shuffle(Object.values(AUFGABEN));
      const t = deck[i]();
      stage.innerHTML = `
        <div class="question">${t.q}</div>
        ${t.pic ? `<div class="pizza-spot">${t.pic}</div>` : ''}
        <div class="choices grid">${t.opts.map((o, k) => `<button class="btn" data-k="${k}">${o.html}</button>`).join('')}</div>`;
      const btns = [...stage.querySelectorAll('.choices .btn')];
      btns.forEach((b) => (b.onclick = () => {
        const o = t.opts[+b.dataset.k];
        btns.forEach((x) => { x.disabled = true; if (t.opts[+x.dataset.k].ok) x.classList.add('ok'); });
        if (!o.ok) b.classList.add('bad');
        answer(o.ok, `${o.ok ? '✅ Richtig!' : '❌ Nicht ganz.'} ${t.why}`);
      }));
    },
  });
}

/* ---------- Seite 13: Merkkasten ---------- */
function merkWidget(host) {
  host.appendChild(h(`
    <div class="cards">
      <div class="card"><h4>🍕 Der Bruch</h4><div>${fr(3, 4, 'big')}</div><div class="sub">Nenner unten: in so viele gleiche Stücke. Zähler oben: so viele davon.</div></div>
      <div class="card"><h4>⚖️ Vergleichen</h4><div>Gleicher Nenner: mehr Stücke sind mehr.</div><div>Gleicher Zähler: kleinerer Nenner ist mehr.</div></div>
      <div class="card"><h4>🔪 Erweitern und Kürzen</h4><div>${fr(1, 2)} = ${fr(2, 4)} = ${fr(3, 6)}</div><div class="sub">Oben und unten mit derselben Zahl mal oder durch rechnen.</div></div>
      <div class="card"><h4>🍕🍕 Mehr als ein Ganzes</h4><div>${fr(5, 4)} = ${mix(1, 1, 4)}</div><div class="sub">Eine ganze Pizza und noch ein Viertel.</div></div>
      <div class="card"><h4>➕ Plus und Minus</h4><div>${fr(2, 8)} + ${fr(3, 8)} = ${fr(5, 8)}</div><div class="sub">Nur die Zähler rechnen. Bei verschiedenen Nennern zuerst gleich gross schneiden.</div></div>
      <div class="card"><h4>🐻 Bruchteil einer Menge</h4><div>${fr(3, 4)} von 12</div><div class="sub">12 : 4 = 3, und 3 · 3 = 9.</div></div>
    </div>
    <ul class="checklist">
      <li>☐ Die Stücke müssen <strong>gleich gross</strong> sein, sonst ist es kein Bruch.</li>
      <li>☐ Grösserer Nenner heisst <strong>kleinere</strong> Stücke.</li>
      <li>☐ Beim Plus und Minus den <strong>Nenner nie mitrechnen</strong>.</li>
      <li>☐ Verschiedene Nenner? Zuerst <strong>gleichnamig</strong> machen.</li>
    </ul>`));
  confetti();
  return {};
}

export default {
  id: 'brueche',
  title: 'Brüche entdecken',
  subject: 'Mathe',
  grade: 6,
  pages: [
    {
      title: 'Pizza für alle',
      widget: teilenWidget,
      body: `<p>Stell dir vor, du hast eine Pizza nur für dich. Dann klingelt es, und immer mehr Freunde kommen vorbei. Also musst du teilen.</p>
        <p>Das herausgezogene Stück ist deins. Merkst du, was mit ihm passiert?</p>`,
      tryThis: `<p>Schieb den Regler langsam nach rechts. Wann ist dein Stück am grössten, wann am kleinsten?</p>`,
    },
    {
      title: 'Gerecht oder gemein?',
      widget: gerechtWidget,
      body: `<p>Eine Regel ist beim Teilen ganz wichtig: Alle Stücke müssen <strong>gleich gross</strong> sein. Nur dann darf man von Hälften, Dritteln oder Vierteln reden.</p>
        <p>Aber Achtung, die Bilder wollen dich manchmal austricksen.</p>`,
    },
    {
      title: 'Zwei Zahlen sagen alles',
      widget: schokoWidget,
      body: `<p>Du hast gerade einen <strong>Bruch</strong> gebaut. Ein Bruch besteht aus zwei Zahlen und einem Strich dazwischen:</p>
        <p>Der <strong>Nenner</strong> steht unten. Er nennt, in wie viele gleiche Stücke das Ganze geteilt ist.</p>
        <p>Der <strong>Zähler</strong> steht oben. Er zählt, wie viele von diesen Stücken gemeint sind.</p>`,
      tryThis: `<p>Iss die halbe Tafel auf. Welcher Bruch steht dann da? Probier dasselbe mit einer anderen Tafel.</p>`,
    },
    {
      title: 'Deine Pizzeria',
      widget: pizzeriaWidget,
      body: `<p>Heute arbeitest du in der Pizzeria. Auf jedem Zettel steht eine Bestellung als Bruch.</p>
        <p>Der <strong>Nenner</strong> sagt dir, wie du schneiden musst. Der <strong>Zähler</strong> sagt dir, wie viele Stücke du belegst: einfach auf die Stücke tippen.</p>`,
    },
    {
      title: 'Wer bekommt mehr?',
      widget: duellWidget,
      body: `<p>Hier täuscht man sich leicht: Eine 8 ist grösser als eine 4, aber ${fr(1, 8)} ist <strong>kleiner</strong> als ${fr(1, 4)}. Denk an die Pizza: Je mehr Leute teilen, desto kleiner wird dein Stück.</p>`,
      tryThis: `<p>Tipp zuerst aus dem Bauch und schau dann auf die Pizzas. So merkst du am schnellsten, wo dich dein Bauch reinlegt.</p>`,
    },
    {
      title: 'Gleich viel, andere Zahlen',
      widget: erweiternWidget,
      body: `<p>Wenn du jedes Stück nochmals teilst, gibt es mehr Stücke, aber nicht mehr Schokolade. Darum sind ${fr(1, 2)}, ${fr(2, 4)} und ${fr(3, 6)} genau gleich viel.</p>
        <p>Oben und unten mit derselben Zahl malnehmen heisst <strong>erweitern</strong>. Der umgekehrte Weg, oben und unten durch dieselbe Zahl teilen, heisst <strong>kürzen</strong>. Das ist so, als würdest du den Regler wieder zurückschieben.</p>`,
      tryThis: `<p>Wähle ${fr(2, 3)} und schieb den Regler. Schau genau hin: Wandert die Farbe? Schieb danach zurück, das ist Kürzen.</p>`,
    },
    {
      title: 'Bruch-Memory',
      widget: memoryWidget,
      body: `<p>Jetzt kommt ein Memory mit Trick: Die Pizza ist immer anders geschnitten, als der Bruch sagt, aber es ist dieselbe Menge. Zu ${fr(1, 2)} gehört zum Beispiel eine Pizza, bei der ${fr(2, 4)} belegt sind.</p>`,
    },
    {
      title: 'Mehr als eine Pizza',
      widget: ganzesWidget,
      body: `<p>Der Zähler darf auch grösser sein als der Nenner. ${fr(5, 4)} heisst: 5 Viertel. Das ist mehr als eine ganze Pizza.</p>
        <p>Man kann es auch als <strong>gemischte Zahl</strong> schreiben: ${mix(1, 1, 4)}, eine ganze und noch ein Viertel.</p>
        <p>Übrigens: ${fr(1, 4)} dreimal hinlegen ist dasselbe wie 3 · ${fr(1, 4)} = ${fr(3, 4)}. Bei «Zahl mal Bruch» wird also nur der Zähler malgenommen.</p>`,
      tryThis: `<p>Wähle Viertel und tippe so lange auf «1 Stück», bis eine neue Pizza angefangen wird. Bei wie vielen Stücken ist das?</p>`,
    },
    {
      title: 'Plus und Minus',
      widget: plusMinusWidget,
      body: `<p>Sind die Stücke gleich gross, ist Rechnen ganz einfach: Du zählst nur die Stücke. Der Zähler ändert sich, der Nenner bleibt.</p>`,
      tryThis: `<p>Drück auf den Knopf mit dem Teufelchen. Das ist der häufigste Fehler beim Bruchrechnen, und auf dem Bild siehst du sofort, warum er nicht stimmen kann.</p>`,
    },
    {
      title: 'Stücke passend schneiden',
      widget: gleichnamigWidget,
      body: `<p>Halbe und Viertel kann man nicht einfach zählen, weil die Stücke verschieden gross sind. Also schneidest du beide neu, bis alle Stücke gleich gross sind. Dann haben die Brüche denselben Nenner, man nennt sie <strong>gleichnamig</strong>.</p>
        <p>Ein guter Schnitt ist eine Zahl, die in beiden Einmaleins-Reihen vorkommt. Bei ${fr(1, 2)} und ${fr(1, 3)} ist das zum Beispiel die 6.</p>`,
    },
    {
      title: 'Gummibärchen teilen',
      widget: baerenWidget,
      body: `<p>Brüche gibt es nicht nur bei Pizza. ${fr(3, 4)} von 12 Gummibärchen heisst: Verteile alle auf 4 gleich volle Teller und nimm 3 davon.</p>
        <p>Gerechnet sieht das so aus: zuerst <strong>durch den Nenner</strong>, dann <strong>mal den Zähler</strong>.</p>`,
    },
    {
      title: 'Bruch-Meisterschaft',
      widget: meisterWidget,
      body: `<p>Acht Aufgaben, alles gemischt. Du kannst alles, was hier drankommt, schon. Nimm dir bei Bedarf Papier zum Zeichnen: Ein schnelles Bild hilft oft mehr als langes Überlegen.</p>`,
    },
    {
      title: 'Merkkasten',
      widget: merkWidget,
      body: `<p>Das Wichtigste auf einen Blick. Und wenn du mal nicht weiterweisst: Zeichne eine Pizza.</p>`,
    },
  ],
};

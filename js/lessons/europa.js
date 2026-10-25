// Lektion (Klasse 6, Geografie): Länder und Hauptstädte Europas
import { createMap } from '../map.js';
import { h, confetti } from '../lesson.js';

// region: nord | west | mitte | sued | suedost | ost
export const COUNTRIES = [
  { code: 'AL', name: 'Albanien', capital: 'Tirana', region: 'suedost', lat: 41.33, lon: 19.82 },
  { code: 'AD', name: 'Andorra', capital: 'Andorra la Vella', region: 'sued', lat: 42.51, lon: 1.52, micro: true },
  { code: 'BE', name: 'Belgien', capital: 'Brüssel', region: 'west', lat: 50.85, lon: 4.35 },
  { code: 'BA', name: 'Bosnien und Herzegowina', capital: 'Sarajevo', region: 'suedost', lat: 43.86, lon: 18.41 },
  { code: 'BG', name: 'Bulgarien', capital: 'Sofia', region: 'suedost', lat: 42.70, lon: 23.32 },
  { code: 'DK', name: 'Dänemark', capital: 'Kopenhagen', region: 'nord', lat: 55.68, lon: 12.57 },
  { code: 'DE', name: 'Deutschland', capital: 'Berlin', region: 'mitte', lat: 52.52, lon: 13.40 },
  { code: 'EE', name: 'Estland', capital: 'Tallinn', region: 'nord', lat: 59.44, lon: 24.75 },
  { code: 'FI', name: 'Finnland', capital: 'Helsinki', region: 'nord', lat: 60.17, lon: 24.94 },
  { code: 'FR', name: 'Frankreich', capital: 'Paris', region: 'west', lat: 48.86, lon: 2.35 },
  { code: 'GR', name: 'Griechenland', capital: 'Athen', region: 'sued', lat: 37.98, lon: 23.73 },
  { code: 'IE', name: 'Irland', capital: 'Dublin', region: 'west', lat: 53.35, lon: -6.26 },
  { code: 'IS', name: 'Island', capital: 'Reykjavik', region: 'nord', lat: 64.15, lon: -21.94 },
  { code: 'IT', name: 'Italien', capital: 'Rom', region: 'sued', lat: 41.90, lon: 12.50 },
  { code: 'XK', name: 'Kosovo', capital: 'Pristina', region: 'suedost', lat: 42.66, lon: 21.17 },
  { code: 'HR', name: 'Kroatien', capital: 'Zagreb', region: 'suedost', lat: 45.81, lon: 15.98 },
  { code: 'LV', name: 'Lettland', capital: 'Riga', region: 'nord', lat: 56.95, lon: 24.11 },
  { code: 'LI', name: 'Liechtenstein', capital: 'Vaduz', region: 'mitte', lat: 47.14, lon: 9.52, micro: true },
  { code: 'LT', name: 'Litauen', capital: 'Vilnius', region: 'nord', lat: 54.69, lon: 25.28 },
  { code: 'LU', name: 'Luxemburg', capital: 'Luxemburg', region: 'west', lat: 49.61, lon: 6.13, micro: true },
  { code: 'MT', name: 'Malta', capital: 'Valletta', region: 'sued', lat: 35.90, lon: 14.51, micro: true },
  { code: 'MD', name: 'Moldau', capital: 'Chișinău', region: 'ost', lat: 47.01, lon: 28.86 },
  { code: 'MC', name: 'Monaco', capital: 'Monaco', region: 'west', lat: 43.73, lon: 7.42, micro: true },
  { code: 'ME', name: 'Montenegro', capital: 'Podgorica', region: 'suedost', lat: 42.44, lon: 19.26 },
  { code: 'NL', name: 'Niederlande', capital: 'Amsterdam', region: 'west', lat: 52.37, lon: 4.90 },
  { code: 'MK', name: 'Nordmazedonien', capital: 'Skopje', region: 'suedost', lat: 42.00, lon: 21.43 },
  { code: 'NO', name: 'Norwegen', capital: 'Oslo', region: 'nord', lat: 59.91, lon: 10.75 },
  { code: 'AT', name: 'Österreich', capital: 'Wien', region: 'mitte', lat: 48.21, lon: 16.37 },
  { code: 'PL', name: 'Polen', capital: 'Warschau', region: 'mitte', lat: 52.23, lon: 21.01 },
  { code: 'PT', name: 'Portugal', capital: 'Lissabon', region: 'sued', lat: 38.72, lon: -9.14 },
  { code: 'RO', name: 'Rumänien', capital: 'Bukarest', region: 'suedost', lat: 44.43, lon: 26.10 },
  { code: 'RU', name: 'Russland', capital: 'Moskau', region: 'ost', lat: 55.76, lon: 37.62 },
  { code: 'SM', name: 'San Marino', capital: 'San Marino', region: 'sued', lat: 43.94, lon: 12.45, micro: true },
  { code: 'SE', name: 'Schweden', capital: 'Stockholm', region: 'nord', lat: 59.33, lon: 18.07 },
  { code: 'CH', name: 'Schweiz', capital: 'Bern', region: 'mitte', lat: 46.95, lon: 7.45 },
  { code: 'RS', name: 'Serbien', capital: 'Belgrad', region: 'suedost', lat: 44.79, lon: 20.46 },
  { code: 'SK', name: 'Slowakei', capital: 'Bratislava', region: 'mitte', lat: 48.15, lon: 17.11 },
  { code: 'SI', name: 'Slowenien', capital: 'Ljubljana', region: 'mitte', lat: 46.05, lon: 14.51 },
  { code: 'ES', name: 'Spanien', capital: 'Madrid', region: 'sued', lat: 40.42, lon: -3.70 },
  { code: 'CZ', name: 'Tschechien', capital: 'Prag', region: 'mitte', lat: 50.08, lon: 14.44 },
  { code: 'TR', name: 'Türkei', capital: 'Ankara', region: 'suedost', lat: 39.93, lon: 32.86 },
  { code: 'UA', name: 'Ukraine', capital: 'Kyjiw (Kiew)', region: 'ost', lat: 50.45, lon: 30.52 },
  { code: 'HU', name: 'Ungarn', capital: 'Budapest', region: 'mitte', lat: 47.50, lon: 19.04 },
  { code: 'VA', name: 'Vatikanstadt', capital: 'Vatikanstadt', region: 'sued', lat: 41.90, lon: 12.45, micro: true },
  { code: 'GB', name: 'Vereinigtes Königreich', capital: 'London', region: 'west', lat: 51.51, lon: -0.13 },
  { code: 'BY', name: 'Belarus', capital: 'Minsk', region: 'ost', lat: 53.90, lon: 27.57 },
  { code: 'CY', name: 'Zypern', capital: 'Nikosia', region: 'sued', lat: 35.17, lon: 33.37 },
];
const REGIONS = {
  nord: 'Nordeuropa', west: 'Westeuropa', mitte: 'Mitteleuropa', sued: 'Südeuropa', suedost: 'Südosteuropa', ost: 'Osteuropa',
};
const byCode = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));
const flag = (code) => (code === 'XK' ? '🇽🇰' : String.fromCodePoint(...[...code].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65)));
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const NEIGHBOURS = ['DE', 'FR', 'IT', 'AT', 'LI'];
const CH_BOX = '390 420 240 170';

/* ---------- Seite 1: erkunden ---------- */
function exploreWidget(host) {
  let current = null;
  const map = createMap({ countries: COUNTRIES, onCountry: (code) => show(code) });
  host.appendChild(map.el);
  host.appendChild(h(`<div class="info"><div class="info-flag">🗺️</div><div><div class="info-name">Tippe auf ein Land</div><div class="info-sub">Dann siehst du Name, Hauptstadt und Region.</div></div></div>`));
  const info = host.querySelector('.info');
  function show(code) {
    const c = byCode[code];
    if (current) map.unset(current, 'hl');
    current = code;
    map.set(code, 'hl');
    map.clearPins();
    map.pin(c.lat, c.lon, c.capital, 'capital');
    info.querySelector('.info-flag').textContent = flag(code);
    info.querySelector('.info-name').textContent = c.name;
    info.querySelector('.info-sub').textContent = `Hauptstadt: ${c.capital} · ${REGIONS[c.region]}`;
  }
  return {};
}

/* ---------- Seite 2: Regionen ---------- */
function regionsWidget(host) {
  const map = createMap({ countries: COUNTRIES, onCountry: (code) => select(byCode[code].region) });
  host.appendChild(map.el);
  for (const c of COUNTRIES) map.set(c.code, 'r-' + c.region);
  const chips = h(`<div class="chips regions"></div>`);
  for (const [key, name] of Object.entries(REGIONS)) {
    const b = h(`<button class="chip r-${key}">${name}</button>`);
    b.onclick = () => select(key);
    chips.appendChild(b);
  }
  host.appendChild(chips);
  host.appendChild(h(`<div class="readout"></div>`));
  const readout = host.querySelector('.readout');
  function select(key) {
    chips.querySelectorAll('.chip').forEach((b) => b.classList.toggle('selected', b.classList.contains('r-' + key)));
    for (const c of COUNTRIES) { map.unset(c.code, 'dim'); if (c.region !== key) map.set(c.code, 'dim'); }
    const list = COUNTRIES.filter((c) => c.region === key).map((c) => `${flag(c.code)} ${c.name}`).join(', ');
    readout.innerHTML = `<strong>${REGIONS[key]}:</strong> ${list}`;
  }
  return {};
}

/* ---------- Seite 3: Nachbarn ---------- */
function neighboursWidget(host) {
  const codes = ['CH', ...NEIGHBOURS];
  const map = createMap({ countries: COUNTRIES, onCountry: (code) => { if (codes.includes(code)) show(code); } });
  map.zoom(CH_BOX);
  host.appendChild(map.el);
  for (const c of COUNTRIES) if (!codes.includes(c.code)) map.set(c.code, 'dim');
  map.set('CH', 'hl');
  for (const code of codes) { const c = byCode[code]; map.pin(c.lat, c.lon, c.capital, 'capital'); }
  const chips = h(`<div class="chips"></div>`);
  for (const code of codes) { const b = h(`<button class="chip">${flag(code)} ${byCode[code].name}</button>`); b.onclick = () => show(code); chips.appendChild(b); }
  host.appendChild(chips);
  host.appendChild(h(`<div class="readout">Die Schweiz hat fünf Nachbarländer. Tippe sie an.</div>`));
  const readout = host.querySelector('.readout');
  function show(code) {
    const c = byCode[code];
    chips.querySelectorAll('.chip').forEach((b) => b.classList.toggle('selected', b.textContent.includes(c.name)));
    codes.forEach((k) => map.unset(k, 'hl'));
    map.set(code, 'hl');
    readout.innerHTML = `${flag(code)} <strong>${c.name}</strong> – Hauptstadt <strong>${c.capital}</strong>`;
  }
  return {};
}

/* ---------- Seite 4: Wusstest du? ---------- */
const FACTS = [
  { code: 'CH', title: 'Bern, nicht Zürich', text: 'Zürich ist die grösste Stadt der Schweiz, aber die Bundesstadt ist Bern. Dort sitzen Regierung und Parlament.' },
  { code: 'TR', title: 'Ankara, nicht Istanbul', text: 'Istanbul ist riesig und berühmt, Hauptstadt der Türkei ist aber Ankara, mitten im Land.' },
  { code: 'NL', title: 'Amsterdam und Den Haag', text: 'Hauptstadt der Niederlande ist Amsterdam. Die Regierung und der König arbeiten aber in Den Haag.' },
  { code: 'VA', title: 'Das kleinste Land der Welt', text: 'Die Vatikanstadt liegt mitten in Rom und ist nur etwa 0,5 km² gross. Land und Hauptstadt sind dasselbe.' },
  { code: 'RU', title: 'Das grösste Land der Welt', text: 'Russland reicht von Europa bis an den Pazifik. Moskau liegt im europäischen Teil.' },
  { code: 'LU', title: 'Luxemburg, Luxemburg', text: 'Bei Luxemburg heissen Land und Hauptstadt gleich. Dasselbe gilt für Monaco, San Marino und Andorra (la Vella).' },
  { code: 'XK', title: 'Das jüngste Land', text: 'Kosovo hat sich 2008 für unabhängig erklärt. Hauptstadt ist Pristina.' },
  { code: 'IS', title: 'Hauptstadt ganz im Norden', text: 'Reykjavik ist die nördlichste Hauptstadt Europas. Im Sommer wird es dort kaum dunkel.' },
];
function factsWidget(host) {
  let i = 0;
  const map = createMap({ countries: COUNTRIES, interactive: false });
  host.appendChild(map.el);
  host.appendChild(h(`
    <div class="fact"><div class="fact-title"></div><div class="fact-text"></div></div>
    <div class="controls"><button class="btn ghost prev">←</button><span class="fact-count" style="color:var(--muted);font-weight:600"></span><button class="btn primary next">Nächster Fakt →</button></div>`));
  function render() {
    const f = FACTS[i]; const c = byCode[f.code];
    map.clear(); map.clearPins();
    for (const x of COUNTRIES) if (x.code !== f.code) map.set(x.code, 'dim');
    map.set(f.code, 'hl');
    map.pin(c.lat, c.lon, c.capital, 'capital');
    host.querySelector('.fact-title').textContent = `${flag(f.code)} ${f.title}`;
    host.querySelector('.fact-text').textContent = f.text;
    host.querySelector('.fact-count').textContent = `${i + 1} / ${FACTS.length}`;
    host.querySelector('.prev').disabled = i === 0;
    host.querySelector('.next').disabled = i === FACTS.length - 1;
  }
  host.querySelector('.prev').onclick = () => { i = Math.max(0, i - 1); render(); };
  host.querySelector('.next').onclick = () => { i = Math.min(FACTS.length - 1, i + 1); render(); };
  render();
  return {};
}

/* ---------- Seite 5: Quiz Hauptstadt ---------- */
function capitalQuizWidget(host) {
  const ROUNDS = 10;
  let round = 0, score = 0, deck = [], current = null, answered = false;
  const map = createMap({ countries: COUNTRIES, interactive: false });
  host.appendChild(map.el);
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="question"></div>
    <div class="choices grid"></div>
    <div class="readout"></div>
    <div class="result hidden" style="text-align:center;margin-top:1rem"><div class="stars"></div><p class="msg" style="font-size:1.2rem;font-weight:600"></p><button class="btn primary again">Nochmal spielen</button></div>`));
  const $ = (s) => host.querySelector(s);
  function start() {
    round = 0; score = 0; deck = pick(COUNTRIES, ROUNDS);
    $('.result').classList.add('hidden'); $('.choices').classList.remove('hidden'); $('.question').classList.remove('hidden');
    next();
  }
  function next() {
    current = deck[round]; answered = false;
    map.clear(); map.clearPins();
    for (const x of COUNTRIES) if (x.code !== current.code) map.set(x.code, 'dim');
    map.set(current.code, 'hl');
    if (current.micro) map.pin(current.lat, current.lon, '', 'capital');
    $('.round').textContent = `Frage ${round + 1} von ${ROUNDS}`;
    $('.pts').textContent = `${score} richtig`;
    $('.question').innerHTML = `${flag(current.code)} Wie heisst die Hauptstadt von <strong>${current.name}</strong>?`;
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    const wrong = pick(COUNTRIES.filter((c) => c.capital !== current.capital), 3);
    const options = shuffle([current, ...wrong]);
    const box = $('.choices'); box.innerHTML = '';
    for (const o of options) {
      const b = h(`<button class="btn big">${o.capital}</button>`);
      b.onclick = () => answer(o, b);
      box.appendChild(b);
    }
  }
  function answer(o, b) {
    if (answered) return;
    answered = true;
    const ok = o.code === current.code;
    if (ok) score++;
    b.classList.add(ok ? 'ok' : 'bad');
    $('.choices').querySelectorAll('.btn').forEach((x) => { x.disabled = true; if (x.textContent === current.capital) x.classList.add('ok'); });
    $('.readout').className = 'readout ' + (ok ? 'ok' : 'bad');
    $('.readout').textContent = ok ? '✅ Richtig!' : `❌ Die Hauptstadt von ${current.name} ist ${current.capital}.`;
    $('.pts').textContent = `${score} richtig`;
    round++;
    setTimeout(round < ROUNDS ? next : finish, ok ? 900 : 1800);
  }
  function finish() {
    $('.choices').classList.add('hidden'); $('.question').classList.add('hidden'); $('.readout').textContent = '';
    const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;
    $('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('.msg').textContent = `${score} von ${ROUNDS} richtig! ` + (stars === 3 ? 'Europa-Profi! 🎉' : stars >= 1 ? 'Gut gemacht!' : 'Schau dir die Lernkarten nochmal an.');
    $('.result').classList.remove('hidden');
    if (stars >= 2) confetti();
  }
  $('.again').onclick = start;
  start();
  return {};
}

/* ---------- Seite 6: Quiz Land finden ---------- */
function findQuizWidget(host) {
  const ROUNDS = 10;
  const POOL = COUNTRIES.filter((c) => !c.micro);
  let round = 0, score = 0, deck = [], current = null, answered = false;
  const map = createMap({ countries: COUNTRIES, onCountry: (code) => answer(code) });
  host.appendChild(map.el);
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="question"></div>
    <div class="readout"></div>
    <div class="result hidden" style="text-align:center;margin-top:1rem"><div class="stars"></div><p class="msg" style="font-size:1.2rem;font-weight:600"></p><button class="btn primary again">Nochmal spielen</button></div>`));
  const $ = (s) => host.querySelector(s);
  function start() { round = 0; score = 0; deck = pick(POOL, ROUNDS); $('.result').classList.add('hidden'); $('.question').classList.remove('hidden'); next(); }
  function next() {
    current = deck[round]; answered = false;
    map.clear(); map.clearPins();
    $('.round').textContent = `Frage ${round + 1} von ${ROUNDS}`;
    $('.pts').textContent = `${score} richtig`;
    $('.question').innerHTML = `${flag(current.code)} Tippe auf <strong>${current.name}</strong> (Hauptstadt ${current.capital}).`;
    $('.readout').className = 'readout'; $('.readout').textContent = '';
  }
  function answer(code) {
    if (answered || !current) return;
    answered = true;
    const ok = code === current.code;
    if (ok) score++;
    map.set(current.code, 'ok');
    if (!ok) map.set(code, 'bad');
    const c = byCode[current.code];
    map.pin(c.lat, c.lon, c.capital, 'capital');
    $('.readout').className = 'readout ' + (ok ? 'ok' : 'bad');
    $('.readout').textContent = ok ? '✅ Genau!' : `❌ Das war ${byCode[code].name}. ${current.name} ist grün markiert.`;
    $('.pts').textContent = `${score} richtig`;
    round++;
    setTimeout(round < ROUNDS ? next : finish, ok ? 1000 : 2200);
  }
  function finish() {
    current = null;
    $('.question').classList.add('hidden'); $('.readout').textContent = '';
    const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;
    $('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('.msg').textContent = `${score} von ${ROUNDS} gefunden! ` + (stars === 3 ? 'Du kennst dich aus! 🎉' : stars >= 1 ? 'Stark!' : 'Geh nochmal auf Seite 1 und erkunde die Karte.');
    $('.result').classList.remove('hidden');
    if (stars >= 2) confetti();
  }
  $('.again').onclick = start;
  start();
  return {};
}

/* ---------- Seite 7: Lernkarten ---------- */
function flashcardsWidget(host) {
  let deck = shuffle(COUNTRIES), known = 0, revealed = false;
  const map = createMap({ countries: COUNTRIES, interactive: false });
  host.appendChild(map.el);
  host.appendChild(h(`
    <div class="flash">
      <div class="flash-front"></div>
      <div class="flash-back"></div>
    </div>
    <div class="controls">
      <button class="btn primary big reveal">Hauptstadt zeigen</button>
      <button class="btn ok-btn hidden knew">✅ Wusste ich</button>
      <button class="btn bad-btn hidden again">🔁 Nochmal</button>
      <span class="flash-count" style="color:var(--muted);font-weight:600"></span>
    </div>`));
  const $ = (s) => host.querySelector(s);
  function render() {
    if (!deck.length) {
      $('.flash-front').textContent = '🎉 Alle Länder gelernt!';
      $('.flash-back').textContent = '';
      $('.reveal').classList.add('hidden'); $('.knew').classList.add('hidden'); $('.again').classList.add('hidden');
      $('.flash-count').textContent = `${known} Länder sicher`;
      map.clear(); map.clearPins();
      confetti();
      return;
    }
    const c = deck[0];
    revealed = false;
    map.clear(); map.clearPins();
    for (const x of COUNTRIES) if (x.code !== c.code) map.set(x.code, 'dim');
    map.set(c.code, 'hl');
    $('.flash-front').textContent = `${flag(c.code)} ${c.name}`;
    $('.flash-back').textContent = '';
    $('.reveal').classList.remove('hidden'); $('.knew').classList.add('hidden'); $('.again').classList.add('hidden');
    $('.flash-count').textContent = `${deck.length} übrig · ${known} sicher`;
  }
  $('.reveal').onclick = () => {
    const c = deck[0]; revealed = true;
    map.pin(c.lat, c.lon, c.capital, 'capital');
    $('.flash-back').textContent = c.capital;
    $('.reveal').classList.add('hidden'); $('.knew').classList.remove('hidden'); $('.again').classList.remove('hidden');
  };
  $('.knew').onclick = () => { deck.shift(); known++; render(); };
  $('.again').onclick = () => { deck.push(deck.shift()); render(); };
  render();
  return {};
}

/* ---------- Seite 8: Übersicht ---------- */
function summaryWidget(host) {
  const map = createMap({ countries: COUNTRIES, interactive: false });
  host.appendChild(map.el);
  for (const c of COUNTRIES) map.set(c.code, 'r-' + c.region);
  const wrap = h(`<div class="cards"></div>`);
  for (const [key, name] of Object.entries(REGIONS)) {
    const list = COUNTRIES.filter((c) => c.region === key).sort((a, b) => a.name.localeCompare(b.name, 'de'));
    const card = h(`<div class="card"><h4><span class="swatch r-${key}"></span>${name}</h4><ul class="plain"></ul></div>`);
    const ul = card.querySelector('ul');
    for (const c of list) ul.appendChild(h(`<li>${flag(c.code)} ${c.name} – <strong>${c.capital}</strong></li>`));
    wrap.appendChild(card);
  }
  host.appendChild(wrap);
  return {};
}

export default {
  id: 'europa',
  title: 'Europa: Länder und Hauptstädte',
  subject: 'Geografie',
  grade: 6,
  pages: [
    {
      title: 'Europa entdecken',
      widget: exploreWidget,
      body: `<p>Europa besteht aus rund 47 Ländern, vom winzigen Vatikan bis zum riesigen Russland. Jedes Land hat eine
        <strong>Hauptstadt</strong>: die Stadt, in der die Regierung sitzt.</p>
        <p>Auf dieser Karte kannst du jedes Land antippen. Der Punkt zeigt dir, wo die Hauptstadt liegt.</p>`,
      tryThis: `<p>Finde die Schweiz und ihre Nachbarn. Welches Land liegt am weitesten im Norden, welches am weitesten im Süden?</p>`,
    },
    {
      title: 'Die Regionen Europas',
      widget: regionsWidget,
      body: `<p>Damit man sich die vielen Länder besser merken kann, teilt man Europa in Regionen ein:
        <strong>Nord-, West-, Mittel-, Süd-, Südost- und Osteuropa</strong>.</p>
        <p>Die Einteilung ist nicht in Stein gemeisselt. Je nach Buch gehört ein Land auch mal zu einer anderen Region.
        Die Schweiz liegt klar in Mitteleuropa.</p>`,
      tryThis: `<p>Tippe auf eine Region oder direkt auf ein Land. Welche Region hat die meisten Länder?</p>`,
    },
    {
      title: 'Unsere Nachbarn',
      widget: neighboursWidget,
      body: `<p>Die Schweiz grenzt an fünf Länder: <strong>Deutschland</strong> im Norden, <strong>Österreich</strong> und
        <strong>Liechtenstein</strong> im Osten, <strong>Italien</strong> im Süden und <strong>Frankreich</strong> im Westen.</p>
        <p>Liechtenstein ist nur 25 Kilometer lang. Trotzdem ist es ein eigenes Land mit eigener Hauptstadt: Vaduz.</p>`,
      tryThis: `<p>Tippe alle fünf Nachbarn an und sprich die Hauptstädte laut aus: Berlin, Wien, Vaduz, Rom, Paris.</p>`,
    },
    {
      title: 'Wusstest du?',
      widget: factsWidget,
      body: `<p>Die Hauptstadt ist nicht immer die grösste oder bekannteste Stadt eines Landes. Hier sind ein paar Fälle, bei denen
        viele Leute danebenliegen.</p>`,
      tryThis: `<p>Klick dich durch die acht Fakten. Welcher hat dich am meisten überrascht?</p>`,
    },
    {
      title: 'Quiz: Welche Hauptstadt?',
      widget: capitalQuizWidget,
      body: `<p>Auf der Karte ist ein Land markiert. Wähle die richtige Hauptstadt aus vier Möglichkeiten. Zehn Fragen, drei Sterne.</p>`,
      tryThis: `<p>Wenn du unsicher bist, hilft oft die Region: Liegt das Land im Norden, ist die Hauptstadt eher Oslo als Athen.</p>`,
    },
    {
      title: 'Quiz: Wo liegt das Land?',
      widget: findQuizWidget,
      body: `<p>Jetzt umgekehrt: Du bekommst ein Land genannt und musst es auf der Karte finden. Die ganz kleinen Länder
        wie Monaco oder Liechtenstein lassen wir hier weg, die wären auf der Karte kaum zu treffen.</p>`,
      tryThis: `<p>Bei einem Fehler wird das richtige Land grün markiert. Merk dir, wo es liegt, es kommt beim nächsten Mal vielleicht wieder.</p>`,
    },
    {
      title: 'Lernkarten',
      widget: flashcardsWidget,
      body: `<p>Mit Lernkarten merkst du dir die Hauptstädte am schnellsten. Du siehst ein Land, überlegst dir die Hauptstadt und
        deckst dann auf.</p>
        <p>Was du schon weisst, fliegt aus dem Stapel. Was du noch nicht weisst, kommt hinten wieder dran, bis alle 47 sitzen.</p>`,
      tryThis: `<p>Sag die Hauptstadt laut, bevor du aufdeckst. Das hilft dem Gedächtnis mehr, als nur zu lesen.</p>`,
    },
    {
      title: 'Alle Länder auf einen Blick',
      widget: summaryWidget,
      body: `<p>Hier sind alle 47 Länder mit ihren Hauptstädten, nach Regionen sortiert. Diese Seite kannst du zum Wiederholen
        vor der Prüfung nutzen.</p>`,
    },
  ],
};

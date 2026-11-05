// Lektion (Klasse 6, Englisch): Vokabeln «Birthday party ideas», Schulbuch Seite 211 bis 213.
// Die englischen Wörter, Lautschrift und Beispielsätze stehen genau so im Buch; die deutschen Bedeutungen mit ss.
import { h, confetti } from '../lesson.js';

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const timersFor = () => { const l = []; return { after(ms, fn) { l.push(setTimeout(fn, ms)); }, clear() { l.forEach(clearTimeout); l.length = 0; } }; };

/* ---------- Wörter ---------- */
export const GROUPS = {
  spiel: { name: 'Spiel und Schule', emoji: '🧤' },
  trifle: { name: 'Trifle machen', emoji: '🍮' },
  party: { name: 'Party-Ideen', emoji: '🎤' },
  figuren: { name: 'Verkleiden', emoji: '🏴‍☠️' },
  draussen: { name: 'Draussen', emoji: '⛰️' },
  gegensatz: { name: 'Gegensätze', emoji: '↔️' },
};
// en: Wort wie im Buch · ipa: Lautschrift · de: Bedeutungen · ex: Beispiel aus dem Buch · form: so steht das Wort im Satz (für Lücken)
// note: Hinweis aus dem Buch · say: Sprechtext, wenn er vom Wort abweicht · accept: weitere richtige Schreibweisen beim Tippen
export const WORDS = [
  { g: 'spiel', en: 'locker', ipa: 'ˈlɒkə', de: 'Schliessfach; Spind', ex: 'You can put your bag in your locker.', form: 'locker' },
  { g: 'spiel', en: 'etc.', ipa: 'ɪtˈsetrə', de: 'usw. (= und so weiter)', ex: "In my bag I've got books, pens, folders, etc.", form: 'etc.', note: 'etc. ist die Abkürzung von et cetera.', say: 'et cetera', accept: ['etc', 'et cetera'] },
  { g: 'spiel', en: 'ice', ipa: 'aɪs', de: 'Eis', ex: 'ice → ice rink → ice cream' },
  { g: 'spiel', en: 'glove', ipa: 'ɡlʌv', de: 'Handschuh', ex: 'You wear shoes on your feet and gloves on your hands.', form: 'gloves' },
  { g: 'spiel', en: 'move', ipa: 'muːv', de: 'Bewegung', ex: 'Jay knows lots of dance moves.', form: 'moves' },
  { g: 'spiel', en: 'still', ipa: 'stɪl', de: 'reglos; bewegungslos; still; ruhig', ex: 'You must stand very still.', form: 'still' },
  { g: 'spiel', en: 'to move', ipa: 'muːv', de: '(sich) bewegen', ex: "What's that over there? It's moving!", form: 'moving' },
  { g: 'spiel', en: '(not) at all', ipa: 'ətˈɔːl', de: 'überhaupt (nicht)', ex: "Jay doesn't like homework at all.", form: 'at all', say: 'not at all', accept: ['at all', 'not at all'] },
  { g: 'spiel', en: 'to be out', ipa: 'biˈaʊt', de: 'hier: draussen sein', short: 'draussen sein', ex: "If you move, you're out.", form: 'out', accept: ['to be out', 'be out', 'out'] },
  { g: 'trifle', en: 'dessert', ipa: 'dɪˈzɜːt', de: 'Dessert; Nachspeise', ex: 'Trifle is my favourite dessert.', form: 'dessert' },
  { g: 'trifle', en: 'sponge', ipa: 'spʌndʒ', de: 'Rührkuchen; Biskuit(kuchen)', ex: 'sponge fingers = Löffelbiskuits' },
  { g: 'trifle', en: 'jelly', ipa: 'ˈdʒeli', de: 'Götterspeise; Wackelpudding; Tortenguss; Gelee', ex: 'You need jelly for trifle.', form: 'jelly' },
  { g: 'trifle', en: 'custard', ipa: 'ˈkʌstəd', de: 'Vanillesosse; Vanillepudding', ex: 'All my family love jelly with custard!', form: 'custard' },
  { g: 'trifle', en: 'fresh', ipa: 'freʃ', de: 'frisch', ex: 'Do you eat fresh fruit every day?', form: 'fresh' },
  { g: 'trifle', en: 'tinned', ipa: 'tɪnd', de: 'Dosen-; aus der Dose', short: 'aus der Dose', ex: "I don't like tinned fruit. I like it fresh.", form: 'tinned' },
  { g: 'trifle', en: 'cream', ipa: 'kriːm', de: 'Creme; Sahne', short: 'Sahne; Creme', ex: 'I love cake with cream!', form: 'cream' },
  { g: 'trifle', en: 'to break', ipa: 'breɪk', de: 'brechen; zerbrechen', ex: 'Break the cake into pieces.', form: 'Break' },
  { g: 'trifle', en: 'bowl', ipa: 'bəʊl', de: 'Schale; Schälchen; Schüssel', short: 'Schüssel; Schale', ex: 'You eat cereal from a bowl.', form: 'bowl' },
  { g: 'trifle', en: 'to slice', ipa: 'slaɪs', de: 'in Scheiben schneiden', ex: 'Can you slice the apples for me, please?', form: 'slice' },
  { g: 'trifle', en: 'on top', ipa: 'ɒn ˈtɒp', de: 'oben; obendrauf', ex: "Let's put cream on top of the cake.", form: 'on top' },
  { g: 'trifle', en: 'to leave sth to cool', ipa: 'liːv tə ˈkuːl', de: 'etw. kalt stellen', ex: 'Leave the jelly to cool.', form: 'Leave', note: 'sth steht für something (etwas).', say: 'to leave something to cool', accept: ['to leave sth to cool', 'leave sth to cool', 'to leave something to cool', 'leave something to cool', 'to leave to cool', 'leave to cool'] },
  { g: 'trifle', en: 'to pour', ipa: 'pɔː', de: 'giessen; schütten; einschenken', ex: 'Pour milk into a bowl.', form: 'Pour' },
  { g: 'trifle', en: 'to whip', ipa: 'wɪp', de: 'schlagen', short: 'schlagen (Sahne)', ex: 'I can whip the cream for the cake, OK?', form: 'whip' },
  { g: 'party', en: 'search', ipa: 'sɜːtʃ', de: 'Suche; Such-', short: 'Suche', ex: 'Write the word in the search box.', form: 'search' },
  { g: 'figuren', en: 'pirate', ipa: 'ˈpaɪrət', de: 'Pirat/-in; Seeräuber/-in', short: 'Pirat', note: 'Achtung Schreibung und Aussprache.' },
  { g: 'figuren', en: 'famous', ipa: 'ˈfeɪməs', de: 'berühmt', ex: 'I want to be famous. I want to be a star.', form: 'famous' },
  { g: 'figuren', en: 'ghost', ipa: 'ɡəʊst', de: 'Geist; Gespenst', ex: 'Sometimes there are stories about ghosts in old houses.', form: 'ghosts' },
  { g: 'figuren', en: 'witch', ipa: 'wɪtʃ', de: 'Hexe' },
  { g: 'figuren', en: 'scary', ipa: 'ˈskeəri', de: 'unheimlich; gruselig; beängstigend', short: 'gruselig; unheimlich', ex: 'scary → to be scared' },
  { g: 'party', en: 'karaoke', ipa: 'ˌkæriˈəʊki', de: 'Karaoke', note: 'Achtung Aussprache.' },
  { g: 'party', en: 'paint', ipa: 'peɪnt', de: 'Farbe', ex: 'paint → to paint' },
  { g: 'gegensatz', en: 'the worst', ipa: 'ðə ˈwɜːst', de: 'der/die/das schlimmste; der/die/das schlechteste', short: 'der/die/das schlimmste', ex: 'the worst ↔ the best', accept: ['the worst', 'worst'] },
  { g: 'party', en: 'challenge', ipa: 'ˈtʃælɪndʒ', de: 'Herausforderung', ex: 'My party is at the activity centre. My friends love a challenge.', form: 'challenge' },
  { g: 'party', en: 'to enjoy', ipa: 'ɪnˈdʒɔɪ', de: 'geniessen', ex: 'The party was great. I really enjoyed it.', form: 'enjoyed' },
  { g: 'party', en: 'climbing', ipa: 'ˈklaɪmɪŋ', de: 'Kletter-; Klettern', short: 'Klettern', note: 'Achtung Aussprache.' },
  { g: 'gegensatz', en: 'low', ipa: 'ləʊ', de: 'niedrig', ex: 'You can climb in lower places too.', form: 'lower' },
  { g: 'party', en: 'route', ipa: 'ruːt', de: 'Strecke; Route', ex: "There are different routes at the climbing centre. Let's try the easier route first.", form: 'routes' },
  { g: 'party', en: 'confident', ipa: 'ˈkɒnfɪdnt', de: 'selbstsicher; selbstbewusst', ex: "Climbing is scary and I'm not very confident.", form: 'confident' },
  { g: 'gegensatz', en: 'high', ipa: 'haɪ', de: 'hoch; gross', ex: 'high ↔ low' },
  { g: 'party', en: 'web page', ipa: 'ˈweb ˌpeɪdʒ', de: 'Website; Internetauftritt', short: 'Website', ex: 'What other party ideas are there on the web page?', form: 'web page' },
  { g: 'draussen', en: 'adventure', ipa: 'ədˈventʃə', de: 'Abenteuer', ex: 'Adventure stories are about exciting events.', form: 'Adventure' },
  { g: 'draussen', en: 'outdoor', ipa: 'ˌaʊtˈdɔː', de: 'Freiluft-; Outdoor-', short: 'Freiluft-', ex: 'Football is usually an outdoor sport.', form: 'outdoor' },
  { g: 'draussen', en: 'beach', ipa: 'biːtʃ', de: 'Strand', ex: "Let's go to the beach.", form: 'beach' },
  { g: 'draussen', en: 'mountain', ipa: 'ˈmaʊntɪn', de: 'Berg' },
  { g: 'draussen', en: 'forest', ipa: 'ˈfɒrɪst', de: 'Wald', ex: 'I really enjoy a walk in the forest with my dog.', form: 'forest' },
  { g: 'gegensatz', en: 'worse', ipa: 'wɜːs', de: 'schlimmer; schlechter', ex: 'My French is bad, but my German is worse.', form: 'worse' },
  { g: 'gegensatz', en: 'better', ipa: 'ˈbetə', de: 'besser; lieber', ex: 'Ice cream is better.', form: 'better', note: 'Ice cream is better. = Eis ist besser. I like ice cream better. = Eis mag ich lieber.' },
  { g: 'party', en: 'nervous', ipa: 'ˈnɜːvəs', de: 'nervös; aufgeregt', ex: "I'm always nervous before exams.", form: 'nervous' },
  { g: 'gegensatz', en: 'warm', ipa: 'wɔːm', de: 'warm', ex: 'warm ↔ cold', note: 'Achtung Aussprache.' },
  { g: 'draussen', en: 'hill', ipa: 'hɪl', de: 'Berg; Hügel', short: 'Hügel', ex: 'Our house is on a hill and we can see the whole town.', form: 'hill' },
  { g: 'figuren', en: 'superhero', ipa: 'ˈsuːpəˌhɪərəʊ', de: 'Superheld', ex: 'Superman is a famous superhero.', form: 'superhero' },
  { g: 'figuren', en: 'princess', ipa: 'prɪnˈses', de: 'Prinzessin', ex: "A princess's parents are a king and queen.", form: 'princess' },
  { g: 'figuren', en: 'wizard', ipa: 'ˈwɪzəd', de: 'Zauberer' },
  { g: 'gegensatz', en: 'clean', ipa: 'kliːn', de: 'sauber', ex: 'clean → to clean' },
  { g: 'gegensatz', en: 'dirty', ipa: 'ˈdɜːti', de: 'dreckig; schmutzig', ex: 'dirty ↔ clean' },
];
const shortDe = (w) => w.short || w.de.split(';')[0].trim();
const spoken = (w) => w.say || w.en;
const GAP_WORDS = WORDS.filter((w) => w.form);

// Mindmap «Birthdays» aus dem Buch
const MIND = [
  { key: 'PRESENTS', de: 'Geschenke', items: ['bracelet', 'T-shirt', 'book', 'football'] },
  { key: 'DECORATIONS', de: 'Dekoration', items: ['balloons', 'candles'] },
  { key: 'FOOD', de: 'Essen', items: ['cake', 'biscuits', 'ice cream', 'pizza', 'crisps', 'sandwiches', 'trifle'] },
  { key: 'ACTIVITIES', de: 'Aktivitäten', items: ['dance', 'go to the bowling alley', 'watch a film', 'go to the cinema', 'go to the ice rink', 'play games'] },
  { key: 'PARTY THEME', de: 'Motto', items: ['costume party', 'surprise party', 'sleepover party', 'pyjamas', 'sleeping bags'] },
];

// Kasten «Comparing things» aus dem Buch
const COMPARE = [
  { forms: ['big', 'bigger', 'the biggest'], how: 'kurz: -er, -est' },
  { forms: ['bad', 'worse', 'the worst'], how: 'unregelmässig' },
  { forms: ['exciting', 'more exciting', 'the most exciting'], how: 'lang: more, the most' },
];
const COMPARE_LINES = [
  { who: 'Tony', text: 'My house is [big].', k: 0 },
  { who: 'Lou', text: "My sister's house is [bigger].", k: 0 },
  { who: 'Tony', text: 'I think my house is [the biggest].', k: 0 },
  { who: 'Lou', text: 'Your joke is [bad]. But my joke is worse.', k: 1 },
  { who: 'Lou', text: 'Your joke is bad. But my joke is [worse].', k: 1 },
  { who: 'Tony', text: 'No, my joke is [the worst].', k: 1 },
  { who: 'Lou', text: 'Football is [exciting], but tennis is more exciting, and inline skating is the most exciting sport.', k: 2 },
  { who: 'Lou', text: 'Football is exciting, but tennis is [more exciting], and inline skating is the most exciting sport.', k: 2 },
  { who: 'Lou', text: 'Football is exciting, but tennis is more exciting, and inline skating is [the most exciting] sport.', k: 2 },
];

/* ---------- Sprachausgabe (Stimme des Geräts, Britisch wenn vorhanden) ---------- */
const synth = globalThis.speechSynthesis || null;
function englishVoice() {
  const vs = synth.getVoices();
  return vs.find((v) => /^en[-_]gb/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
}
let utterance = null; // Referenz halten, sonst bricht Chrome manchmal ab
function say(text) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = englishVoice();
  if (v) u.voice = v;
  u.lang = 'en-GB';
  u.rate = 0.9;
  utterance = u;
  synth.speak(u);
}
const hush = () => synth?.cancel();
function speakBtn(text, cls = '') {
  const b = h(`<button class="btn speak ${cls}" aria-label="Anhören" title="Anhören">🔊</button>`);
  b.onclick = (e) => { e.stopPropagation(); say(text); };
  if (!synth) b.classList.add('hidden');
  return b;
}
/** Beispielsatz mit markierter Wortform */
function exHtml(w) {
  if (!w.ex) return '';
  const i = w.form ? w.ex.indexOf(w.form) : -1;
  if (i < 0) return esc(w.ex);
  return esc(w.ex.slice(0, i)) + '<strong>' + esc(w.form) + '</strong>' + esc(w.ex.slice(i + w.form.length));
}
function gapHtml(w, filled = null) {
  const i = w.ex.indexOf(w.form);
  const gap = filled ? `<span class="gap filled">${esc(filled)}</span>` : '<span class="gap">&nbsp;</span>';
  return esc(w.ex.slice(0, i)) + gap + esc(w.ex.slice(i + w.form.length));
}
function groupChips(onSelect, { all = false } = {}) {
  const chips = h(`<div class="chips groups"></div>`);
  const keys = all ? ['alle', ...Object.keys(GROUPS)] : Object.keys(GROUPS);
  for (const k of keys) {
    const b = h(`<button class="chip" data-g="${k}">${k === 'alle' ? '🎉 Alle' : `${GROUPS[k].emoji} ${GROUPS[k].name}`}</button>`);
    b.onclick = () => { chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c === b)); onSelect(k); };
    chips.appendChild(b);
  }
  return chips;
}
const resultBox = () => h(`<div class="result hidden" style="text-align:center;margin-top:1rem"><div class="stars"></div><p class="msg" style="font-size:1.2rem;font-weight:600"></p><button class="btn primary again">Nochmal spielen</button></div>`);
function showStars(host, score, total, { good, ok, bad }) {
  const stars = score >= total - 1 ? 3 : score >= Math.round(total * 0.75) ? 2 : score >= Math.round(total * 0.5) ? 1 : 0;
  host.querySelector('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  host.querySelector('.msg').textContent = `${score} von ${total} richtig! ` + (stars === 3 ? good : stars >= 1 ? ok : bad);
  host.querySelector('.result').classList.remove('hidden');
  if (stars >= 2) confetti();
}

/* ---------- Seite 1: Wörter entdecken ---------- */
function wordsWidget(host) {
  host.appendChild(groupChips(select));
  const grid = h(`<div class="vocab"></div>`);
  host.appendChild(grid);
  const card = h(`<div class="word-card"><div class="head"><span class="en"></span><span class="ipa"></span></div><div class="de"></div><div class="ex"></div><div class="note hidden"></div></div>`);
  host.appendChild(card);
  const $ = (s) => card.querySelector(s);
  function show(w, b) {
    grid.querySelectorAll('.btn').forEach((x) => x.classList.toggle('selected', x === b));
    $('.en').textContent = w.en;
    $('.ipa').textContent = `[${w.ipa}]`;
    card.querySelector('.speak')?.remove();
    $('.head').appendChild(speakBtn(spoken(w)));
    $('.de').textContent = w.de;
    $('.ex').innerHTML = exHtml(w);
    $('.note').classList.toggle('hidden', !w.note);
    $('.note').textContent = w.note ? `! ${w.note}` : '';
    say(spoken(w));
  }
  function select(key) {
    grid.innerHTML = '';
    const list = WORDS.filter((w) => w.g === key);
    list.forEach((w, i) => {
      const b = h(`<button class="btn">${esc(w.en)}</button>`);
      b.onclick = () => show(w, b);
      grid.appendChild(b);
      if (i === 0) { show(w, b); hush(); }
    });
  }
  host.querySelector('.chip').click();
  hush();
  return { destroy: hush };
}

/* ---------- Seite 2: Lernkarten ---------- */
function flashWidget(host) {
  let dir = 'de', key = 'alle', deck = [], known = 0;
  const seg = h(`<div class="segmented"><button class="d selected">Deutsch → Englisch</button><button class="e">Englisch → Deutsch</button></div>`);
  host.appendChild(seg);
  host.appendChild(groupChips((k) => { key = k; start(); }, { all: true }));
  host.appendChild(h(`
    <div class="flash"><div class="flash-front"></div><div class="flash-back"></div><div class="flash-ex"></div></div>
    <div class="controls">
      <button class="btn primary big reveal">Umdrehen</button>
      <button class="btn ok-btn hidden knew">✅ Wusste ich</button>
      <button class="btn bad-btn hidden again">🔁 Nochmal</button>
      <span class="flash-count" style="color:var(--muted);font-weight:600"></span>
    </div>`));
  const $ = (s) => host.querySelector(s);
  seg.querySelector('.d').onclick = () => { dir = 'de'; seg.querySelector('.d').classList.add('selected'); seg.querySelector('.e').classList.remove('selected'); start(); };
  seg.querySelector('.e').onclick = () => { dir = 'en'; seg.querySelector('.e').classList.add('selected'); seg.querySelector('.d').classList.remove('selected'); start(); };
  function start() { deck = shuffle(key === 'alle' ? WORDS : WORDS.filter((w) => w.g === key)); known = 0; render(); }
  function front(w) {
    const el = $('.flash-front');
    el.innerHTML = '';
    if (dir === 'de') el.textContent = w.de;
    else { el.textContent = w.en + ' '; el.appendChild(speakBtn(spoken(w), 'small')); }
  }
  function render() {
    $('.flash-ex').innerHTML = '';
    if (!deck.length) {
      $('.flash-front').textContent = '🎉 Alle Karten gelernt!';
      $('.flash-back').textContent = '';
      $('.reveal').classList.add('hidden'); $('.knew').classList.add('hidden'); $('.again').classList.add('hidden');
      $('.flash-count').textContent = `${known} Wörter sicher`;
      confetti();
      return;
    }
    const w = deck[0];
    front(w);
    if (dir === 'en') say(spoken(w));
    $('.flash-back').textContent = '';
    $('.reveal').classList.remove('hidden'); $('.knew').classList.add('hidden'); $('.again').classList.add('hidden');
    $('.flash-count').textContent = `${deck.length} übrig · ${known} sicher`;
  }
  $('.reveal').onclick = () => {
    const w = deck[0];
    const back = $('.flash-back');
    back.innerHTML = '';
    if (dir === 'de') { back.textContent = w.en + ' '; back.appendChild(h(`<span class="ipa">[${esc(w.ipa)}]</span>`)); back.appendChild(speakBtn(spoken(w), 'small')); say(spoken(w)); }
    else back.textContent = w.de;
    $('.flash-ex').innerHTML = exHtml(w);
    $('.reveal').classList.add('hidden'); $('.knew').classList.remove('hidden'); $('.again').classList.remove('hidden');
  };
  $('.knew').onclick = () => { deck.shift(); known++; render(); };
  $('.again').onclick = () => { deck.push(deck.shift()); render(); };
  host.querySelector('.chip').classList.add('selected');
  start();
  return { destroy: hush };
}

/* ---------- Seite 3: Zuordnen ---------- */
function matchWidget(host) {
  const PER = 6;
  const t = timersFor();
  let deck = [], round = 0, rounds = 0, done = 0, mistakes = 0, sel = { en: null, de: null };
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="match"><div class="col en"></div><div class="col de"></div></div>
    <div class="readout"></div>
    <div class="controls hidden end"><button class="btn primary again">Nochmal von vorn</button></div>`));
  const $ = (s) => host.querySelector(s);
  function start() { deck = shuffle(WORDS); rounds = Math.ceil(deck.length / PER); round = 0; done = 0; mistakes = 0; $('.end').classList.add('hidden'); $('.match').classList.remove('hidden'); next(); }
  function next() {
    const pairs = deck.slice(round * PER, round * PER + PER);
    sel = { en: null, de: null };
    $('.round').textContent = `Runde ${round + 1} von ${rounds}`;
    $('.pts').textContent = `${done} Paare · ${mistakes} Fehler`;
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    const en = $('.col.en'), de = $('.col.de');
    en.innerHTML = ''; de.innerHTML = '';
    for (const w of shuffle(pairs)) { const b = h(`<button class="btn">${esc(w.en)}</button>`); b.onclick = () => choose('en', w, b); en.appendChild(b); }
    for (const w of shuffle(pairs)) { const b = h(`<button class="btn">${esc(shortDe(w))}</button>`); b.onclick = () => choose('de', w, b); de.appendChild(b); }
  }
  function choose(side, w, b) {
    if (b.classList.contains('done')) return;
    if (sel[side]) sel[side].b.classList.remove('selected');
    sel[side] = { w, b };
    b.classList.add('selected');
    if (!sel.en || !sel.de) return;
    const a = sel.en, c = sel.de;
    sel = { en: null, de: null };
    if (a.w === c.w) {
      a.b.classList.remove('selected'); c.b.classList.remove('selected');
      a.b.classList.add('done'); c.b.classList.add('done');
      done++;
      $('.readout').className = 'readout'; $('.readout').textContent = '';
      $('.pts').textContent = `${done} Paare · ${mistakes} Fehler`;
      say(spoken(a.w));
      if (host.querySelectorAll('.col.en .btn:not(.done)').length === 0) {
        round++;
        if (round < rounds) { $('.readout').className = 'readout ok'; $('.readout').textContent = '✅ Alle sechs gefunden!'; t.after(900, next); }
        else finish();
      }
    } else {
      mistakes++;
      $('.pts').textContent = `${done} Paare · ${mistakes} Fehler`;
      a.b.classList.add('bad'); c.b.classList.add('bad');
      $('.readout').className = 'readout bad'; $('.readout').textContent = `❌ ${a.w.en} heisst «${shortDe(a.w)}».`;
      t.after(500, () => { a.b.classList.remove('bad', 'selected'); c.b.classList.remove('bad', 'selected'); });
    }
  }
  function finish() {
    $('.match').classList.add('hidden');
    $('.readout').className = 'readout ok';
    $('.readout').textContent = `🎉 Alle ${WORDS.length} Wörter zugeordnet, mit ${mistakes} ${mistakes === 1 ? 'Fehler' : 'Fehlern'}.`;
    $('.end').classList.remove('hidden');
    confetti();
  }
  $('.again').onclick = start;
  start();
  return { destroy() { t.clear(); hush(); } };
}

/* ---------- Seite 4: Lückentext ---------- */
function gapWidget(host) {
  const ROUNDS = 10;
  const t = timersFor();
  let round = 0, score = 0, deck = [], current = null, answered = false;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="sentence"></div>
    <div class="hint"></div>
    <div class="choices grid"></div>
    <div class="readout"></div>`));
  host.appendChild(resultBox());
  const $ = (s) => host.querySelector(s);
  function start() { round = 0; score = 0; deck = pick(GAP_WORDS, ROUNDS); $('.result').classList.add('hidden'); $('.choices').classList.remove('hidden'); $('.sentence').classList.remove('hidden'); $('.hint').classList.remove('hidden'); next(); }
  function next() {
    current = deck[round]; answered = false;
    $('.round').textContent = `Satz ${round + 1} von ${ROUNDS}`;
    $('.pts').textContent = `${score} richtig`;
    $('.sentence').innerHTML = gapHtml(current);
    $('.hint').textContent = `Gesucht: ${shortDe(current)}`;
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    const options = shuffle([current, ...pick(GAP_WORDS.filter((w) => w !== current), 3)]);
    const box = $('.choices'); box.innerHTML = '';
    for (const o of options) {
      const b = h(`<button class="btn">${esc(o.form.toLowerCase())}</button>`);
      b.onclick = () => answer(o, b);
      box.appendChild(b);
    }
  }
  function answer(o, b) {
    if (answered) return;
    answered = true;
    const ok = o === current;
    if (ok) score++;
    b.classList.add(ok ? 'ok' : 'bad');
    $('.choices').querySelectorAll('.btn').forEach((x) => { x.disabled = true; if (x.textContent === current.form.toLowerCase()) x.classList.add('ok'); });
    $('.sentence').innerHTML = gapHtml(current, current.form);
    $('.readout').className = 'readout ' + (ok ? 'ok' : 'bad');
    $('.readout').textContent = ok ? '✅ Richtig!' : `❌ Hier passt ${current.form.toLowerCase()} (${current.en}).`;
    $('.pts').textContent = `${score} richtig`;
    say(current.ex);
    round++;
    t.after(round < ROUNDS ? (ok ? 1800 : 2800) : 1800, round < ROUNDS ? next : finish);
  }
  function finish() {
    $('.choices').classList.add('hidden'); $('.sentence').classList.add('hidden'); $('.hint').classList.add('hidden'); $('.readout').textContent = '';
    showStars(host, score, ROUNDS, { good: 'Die Sätze sitzen! 🎉', ok: 'Gut gemacht!', bad: 'Schau dir die Sätze auf Seite 1 nochmal an.' });
  }
  $('.again').onclick = start;
  start();
  return { destroy() { t.clear(); hush(); } };
}

/* ---------- Seite 5: Schreiben ---------- */
const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[.!?]+$/g, '').replace(/\s+/g, ' ').trim();
function accepted(w) { return (w.accept || [w.en, w.en.replace(/^to /, '')]).map(norm); }
const hintOf = (en) => en.split(' ').map((p) => (p.length <= 2 ? p : p[0] + '·'.repeat(p.length - 1))).join(' ');
function typeWidget(host) {
  const ROUNDS = 10;
  const t = timersFor();
  let round = 0, score = 0, deck = [], current = null, tries = 0, locked = false;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="sentence prompt"></div>
    <div class="hint"></div>
    <form class="typing"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Englisch tippen …"><button class="btn primary check" type="submit">Prüfen</button></form>
    <div class="readout"></div>`));
  host.appendChild(resultBox());
  const $ = (s) => host.querySelector(s);
  const input = $('input');
  function start() { round = 0; score = 0; deck = pick(WORDS, ROUNDS); $('.result').classList.add('hidden'); $('.typing').classList.remove('hidden'); $('.prompt').classList.remove('hidden'); next(); }
  function next() {
    current = deck[round]; tries = 0; locked = false;
    $('.round').textContent = `Wort ${round + 1} von ${ROUNDS}`;
    $('.pts').textContent = `${score} richtig`;
    $('.prompt').textContent = current.de;
    $('.hint').innerHTML = /^to /.test(current.en) ? 'Ein Verb, das <em>to</em> darfst du weglassen.' : '';
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    input.value = ''; input.disabled = false; $('.check').disabled = false;
    input.focus();
  }
  $('.typing').onsubmit = (e) => {
    e.preventDefault();
    if (locked) return;
    const v = norm(input.value);
    if (!v) { input.focus(); return; }
    if (accepted(current).includes(v)) {
      locked = true;
      if (tries === 0) score++;
      $('.readout').className = 'readout ok';
      $('.readout').textContent = tries === 0 ? `✅ Richtig: ${current.en}` : `✅ Jetzt stimmt es: ${current.en}`;
      say(spoken(current));
      advance(1200);
      return;
    }
    tries++;
    if (tries === 1) {
      $('.readout').className = 'readout bad';
      $('.readout').innerHTML = `❌ Noch nicht. Tipp: <span class="hint-letters">${esc(hintOf(current.en))}</span>`;
      input.select();
    } else {
      locked = true;
      $('.readout').className = 'readout bad';
      $('.readout').textContent = `❌ Das Wort heisst ${current.en}.`;
      say(spoken(current));
      advance(2200);
    }
  };
  function advance(ms) {
    input.disabled = true; $('.check').disabled = true;
    $('.pts').textContent = `${score} richtig`;
    round++;
    t.after(ms, round < ROUNDS ? next : finish);
  }
  function finish() {
    $('.typing').classList.add('hidden'); $('.prompt').classList.add('hidden'); $('.hint').textContent = ''; $('.readout').textContent = '';
    showStars(host, score, ROUNDS, { good: 'Fehlerfrei geschrieben! 🎉', ok: 'Stark!', bad: 'Üb die Wörter mit den Lernkarten und komm zurück.' });
  }
  $('.again').onclick = start;
  start();
  return { destroy() { t.clear(); hush(); } };
}

/* ---------- Seite 6: Vergleichen ---------- */
function compareWidget(host) {
  const t = timersFor();
  const table = h(`<table class="compare-table"><thead><tr><th>Grundform</th><th>Vergleich (-er)</th><th>Höchststufe (the -est)</th></tr></thead><tbody></tbody></table>`);
  for (const c of COMPARE) table.querySelector('tbody').appendChild(h(`<tr><td><strong>${c.forms[0]}</strong></td><td><strong>${c.forms[1]}</strong></td><td><strong>${c.forms[2]}</strong> <span class="ipa">${c.how}</span></td></tr>`));
  host.appendChild(table);
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score" style="margin-top:1rem"><span class="round"></span><span class="pts"></span></div>
    <div class="speaker-line"><span class="who"></span><span class="sentence line" style="margin-top:0"></span></div>
    <div class="choices grid three"></div>
    <div class="readout"></div>`));
  host.appendChild(resultBox());
  const $ = (s) => host.querySelector(s);
  let i = 0, score = 0, answered = false;
  function start() { i = 0; score = 0; $('.result').classList.add('hidden'); $('.choices').classList.remove('hidden'); $('.speaker-line').classList.remove('hidden'); next(); }
  function parse(text) { const m = text.match(/^(.*)\[(.+?)\](.*)$/); return { pre: m[1], gap: m[2], post: m[3] }; }
  function next() {
    answered = false;
    const line = COMPARE_LINES[i], p = parse(line.text);
    $('.round').textContent = `Satz ${i + 1} von ${COMPARE_LINES.length}`;
    $('.pts').textContent = `${score} richtig`;
    $('.who').textContent = line.who + ':';
    $('.line').innerHTML = esc(p.pre) + '<span class="gap">&nbsp;</span>' + esc(p.post);
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    const box = $('.choices'); box.innerHTML = '';
    for (const f of COMPARE[line.k].forms) {
      const b = h(`<button class="btn">${esc(f)}</button>`);
      b.onclick = () => answer(f, b, line, p);
      box.appendChild(b);
    }
  }
  function answer(f, b, line, p) {
    if (answered) return;
    answered = true;
    const ok = f === p.gap;
    if (ok) score++;
    b.classList.add(ok ? 'ok' : 'bad');
    $('.choices').querySelectorAll('.btn').forEach((x) => { x.disabled = true; if (x.textContent === p.gap) x.classList.add('ok'); });
    $('.line').innerHTML = esc(p.pre) + `<span class="gap filled">${esc(p.gap)}</span>` + esc(p.post);
    $('.readout').className = 'readout ' + (ok ? 'ok' : 'bad');
    $('.readout').textContent = ok ? '✅ Genau!' : `❌ Hier passt ${p.gap}.`;
    $('.pts').textContent = `${score} richtig`;
    say(line.text.replace(/[\[\]]/g, ''));
    i++;
    t.after(ok ? 1800 : 2600, i < COMPARE_LINES.length ? next : finish);
  }
  function finish() {
    $('.choices').classList.add('hidden'); $('.speaker-line').classList.add('hidden'); $('.readout').textContent = '';
    showStars(host, score, COMPARE_LINES.length, { good: 'Vergleichen kannst du! 🎉', ok: 'Gut!', bad: 'Schau nochmal in die Tabelle oben.' });
  }
  $('.again').onclick = start;
  start();
  return { destroy() { t.clear(); hush(); } };
}

/* ---------- Seite 7: Mindmap Birthday ---------- */
function mindmapWidget(host) {
  const t = timersFor();
  const ALL = MIND.flatMap((m) => m.items.map((item) => ({ item, m })));
  let deck = [], score = 0, mistakes = 0, current = null, answered = false;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="sentence item"></div>
    <div class="chips cats"></div>
    <div class="readout"></div>
    <div class="mindmap"></div>
    <div class="controls hidden end"><button class="btn primary again">Nochmal spielen</button></div>`));
  const $ = (s) => host.querySelector(s);
  const cats = $('.cats'), map = $('.mindmap');
  const cards = {};
  for (const m of MIND) {
    const b = h(`<button class="chip">${m.key}</button>`);
    b.onclick = () => answer(m, b);
    cats.appendChild(b);
    cards[m.key] = h(`<div class="card"><h4>${m.key}</h4><div class="sub">${m.de}</div><ul class="plain"></ul></div>`);
    map.appendChild(cards[m.key]);
  }
  function start() {
    deck = shuffle(ALL); score = 0; mistakes = 0;
    for (const c of Object.values(cards)) c.querySelector('ul').innerHTML = '';
    $('.end').classList.add('hidden'); $('.item').classList.remove('hidden'); cats.classList.remove('hidden');
    next();
  }
  function next() {
    current = deck[0]; answered = false;
    $('.round').textContent = `${ALL.length - deck.length + 1} von ${ALL.length}`;
    $('.pts').textContent = `${score} richtig · ${mistakes} Fehler`;
    $('.item').innerHTML = '';
    $('.item').textContent = current.item + ' ';
    $('.item').appendChild(speakBtn(current.item, 'small'));
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    cats.querySelectorAll('.chip').forEach((c) => { c.classList.remove('selected'); c.disabled = false; });
    say(current.item);
  }
  function answer(m, b) {
    if (answered) return;
    answered = true;
    const ok = m === current.m;
    if (ok) score++; else mistakes++;
    b.classList.add('selected');
    cats.querySelectorAll('.chip').forEach((c) => { c.disabled = true; });
    map.querySelectorAll('li.new').forEach((li) => li.classList.remove('new'));
    cards[current.m.key].querySelector('ul').appendChild(h(`<li class="new">${esc(current.item)}</li>`));
    $('.readout').className = 'readout ' + (ok ? 'ok' : 'bad');
    $('.readout').textContent = ok ? '✅ Richtig!' : `❌ ${current.item} gehört zu ${current.m.key} (${current.m.de}).`;
    $('.pts').textContent = `${score} richtig · ${mistakes} Fehler`;
    deck.shift();
    t.after(ok ? 800 : 2000, deck.length ? next : finish);
  }
  function finish() {
    $('.item').classList.add('hidden'); cats.classList.add('hidden');
    $('.readout').className = 'readout ok';
    $('.readout').textContent = `🎉 Die Mindmap ist komplett: ${score} von ${ALL.length} auf Anhieb richtig.`;
    $('.end').classList.remove('hidden');
    if (score >= ALL.length - 3) confetti();
  }
  $('.again').onclick = start;
  start();
  return { destroy() { t.clear(); hush(); } };
}

/* ---------- Seite 8: Abschlussquiz ---------- */
function quizWidget(host) {
  const ROUNDS = 12;
  const KINDS = ['de2en', 'en2de', 'gap'];
  const t = timersFor();
  let round = 0, score = 0, deck = [], current = null, kind = null, answered = false;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="question"></div>
    <div class="sentence q-sentence"></div>
    <div class="choices grid"></div>
    <div class="readout"></div>`));
  host.appendChild(resultBox());
  const $ = (s) => host.querySelector(s);
  function start() {
    round = 0; score = 0;
    const gaps = pick(GAP_WORDS, 4);
    const others = pick(WORDS.filter((w) => !gaps.includes(w)), 8);
    deck = shuffle([...gaps.map((w) => ({ w, kind: 'gap' })), ...others.map((w, i) => ({ w, kind: KINDS[i % 2] }))]);
    $('.result').classList.add('hidden'); $('.choices').classList.remove('hidden'); $('.question').classList.remove('hidden'); $('.q-sentence').classList.remove('hidden');
    next();
  }
  function next() {
    ({ w: current, kind } = deck[round]); answered = false;
    $('.round').textContent = `Frage ${round + 1} von ${ROUNDS}`;
    $('.pts').textContent = `${score} richtig`;
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    const q = $('.question'), s = $('.q-sentence');
    q.innerHTML = ''; s.innerHTML = '';
    let options, label;
    if (kind === 'de2en') {
      q.innerHTML = `Was heisst <strong>${esc(current.de)}</strong> auf Englisch?`;
      options = shuffle([current, ...pick(WORDS.filter((w) => w !== current), 3)]); label = (w) => w.en;
    } else if (kind === 'en2de') {
      q.innerHTML = `Was bedeutet <strong>${esc(current.en)}</strong>? `;
      q.appendChild(speakBtn(spoken(current), 'small'));
      say(spoken(current));
      options = shuffle([current, ...pick(WORDS.filter((w) => w !== current), 3)]); label = shortDe;
    } else {
      q.textContent = 'Welches Wort fehlt?';
      s.innerHTML = gapHtml(current);
      options = shuffle([current, ...pick(GAP_WORDS.filter((w) => w !== current), 3)]); label = (w) => w.form.toLowerCase();
    }
    const box = $('.choices'); box.innerHTML = '';
    for (const o of options) {
      const b = h(`<button class="btn">${esc(label(o))}</button>`);
      b.onclick = () => answer(o, b, label);
      box.appendChild(b);
    }
  }
  function answer(o, b, label) {
    if (answered) return;
    answered = true;
    const ok = o === current;
    if (ok) score++;
    b.classList.add(ok ? 'ok' : 'bad');
    $('.choices').querySelectorAll('.btn').forEach((x) => { x.disabled = true; if (x.textContent === label(current)) x.classList.add('ok'); });
    if (kind === 'gap') { $('.q-sentence').innerHTML = gapHtml(current, current.form); say(current.ex); } else if (kind === 'de2en') say(spoken(current));
    $('.readout').className = 'readout ' + (ok ? 'ok' : 'bad');
    $('.readout').textContent = ok ? '✅ Richtig!' : `❌ ${current.en} = ${shortDe(current)}.`;
    $('.pts').textContent = `${score} richtig`;
    round++;
    t.after(ok ? 1100 : 2400, round < ROUNDS ? next : finish);
  }
  function finish() {
    $('.choices').classList.add('hidden'); $('.question').classList.add('hidden'); $('.q-sentence').classList.add('hidden'); $('.readout').textContent = '';
    showStars(host, score, ROUNDS, { good: 'Party-Profi! 🎉', ok: 'Gut gemacht!', bad: 'Geh nochmal zu den Lernkarten.' });
  }
  $('.again').onclick = start;
  start();
  return { destroy() { t.clear(); hush(); } };
}

/* ---------- Seite 9: Alle Wörter ---------- */
function summaryWidget(host) {
  const wrap = h(`<div class="cards"></div>`);
  for (const [key, g] of Object.entries(GROUPS)) {
    const card = h(`<div class="card"><h4>${g.emoji} ${g.name}</h4><ul class="plain"></ul></div>`);
    const ul = card.querySelector('ul');
    for (const w of WORDS.filter((x) => x.g === key)) {
      const li = h(`<li class="word-item"><div class="line"><strong>${esc(w.en)}</strong> <span class="ipa">[${esc(w.ipa)}]</span></div><div class="de">${esc(w.de)}</div></li>`);
      li.querySelector('.line').appendChild(speakBtn(spoken(w), 'small'));
      ul.appendChild(li);
    }
    wrap.appendChild(card);
  }
  host.appendChild(wrap);
  if (!synth) host.appendChild(h(`<p class="hint" style="margin-top:1rem">Dein Browser hat keine englische Stimme, darum fehlen die Lautsprecher.</p>`));
  return { destroy: hush };
}

export default {
  id: 'party-words',
  title: 'Birthday party ideas: Vokabeln',
  subject: 'Englisch',
  grade: 6,
  pages: [
    {
      title: 'Die Wörter kennenlernen',
      widget: wordsWidget,
      body: `<p>Diese 55 Wörter stammen aus deinem Englischbuch, Seite 211 bis 213: ein Spiel, bei dem man stillstehen muss,
        das Rezept für ein Trifle und viele Ideen für eine Geburtstagsparty.</p>
        <p>Tippe auf ein Wort. Du hörst es, siehst die Bedeutung und den Beispielsatz aus dem Buch. Die Zeichen in den eckigen
        Klammern sind die <strong>Lautschrift</strong>: Sie zeigen, wie man das Wort ausspricht.</p>`,
      tryThis: `<p>Hör dir <em>pirate</em>, <em>karaoke</em>, <em>climbing</em> und <em>warm</em> genau an. Im Buch steht bei ihnen
        «Achtung Aussprache», weil man sie anders spricht, als man sie schreibt.</p>`,
    },
    {
      title: 'Lernkarten',
      widget: flashWidget,
      body: `<p>Du siehst das deutsche Wort, überlegst dir das englische und drehst die Karte um. Was du schon weisst, fliegt aus
        dem Stapel. Was du noch nicht weisst, kommt hinten wieder dran, bis alle sitzen.</p>
        <p>Du kannst die Richtung umschalten und nur ein Thema üben.</p>`,
      tryThis: `<p>Sag das englische Wort laut, bevor du umdrehst, und sprich es danach der Stimme nach. So merkst du es dir doppelt.</p>`,
    },
    {
      title: 'Zuordnen',
      widget: matchWidget,
      body: `<p>Sechs englische Wörter, sechs deutsche Bedeutungen. Tippe ein Wort und dann seine Übersetzung. Stimmt das Paar,
        wird es grün. Nach zehn Runden hast du alle 55 Wörter einmal zugeordnet.</p>`,
      tryThis: `<p>Fang mit den Wörtern an, die du sicher kennst. Was übrig bleibt, lässt sich oft durch Ausschliessen lösen.</p>`,
    },
    {
      title: 'Lückentext',
      widget: gapWidget,
      body: `<p>Das sind die Beispielsätze aus dem Buch, jeweils mit einer Lücke. Welches Wort passt hinein?</p>
        <p>Achtung: Im Satz steht das Wort manchmal in einer anderen Form, zum Beispiel <em>moves</em> statt <em>move</em>
        oder <em>enjoyed</em> statt <em>to enjoy</em>.</p>`,
      tryThis: `<p>Lies den Satz nach dem Lösen laut mit. Die Sätze aus dem Buch kommen in Tests gern wieder vor.</p>`,
    },
    {
      title: 'Schreiben',
      widget: typeWidget,
      body: `<p>Jetzt ohne Auswahl: Du siehst die deutsche Bedeutung und tippst das englische Wort. Gross- und Kleinschreibung
        spielt keine Rolle, bei Verben darfst du das <em>to</em> weglassen. Nach dem ersten Fehler bekommst du einen Tipp mit dem
        Anfangsbuchstaben.</p>`,
      tryThis: `<p><em>pirate</em>, <em>karaoke</em> und <em>route</em> schreibt man anders, als sie klingen. Genau solche Wörter
        kommen in Vokabeltests gern dran.</p>`,
    },
    {
      title: 'Vergleichen: big, bigger, the biggest',
      widget: compareWidget,
      body: `<p>Mit Adjektiven vergleicht man Dinge. Kurze Adjektive bekommen <strong>-er</strong> und <strong>the -est</strong>:
        big, bigger, the biggest. Lange Adjektive bekommen <strong>more</strong> und <strong>the most</strong>: exciting,
        more exciting, the most exciting.</p>
        <p><em>bad</em> ist unregelmässig: bad, worse, the worst. Genauso <em>good</em>: good, better, the best.
        Darum stehen <em>worse</em>, <em>better</em> und <em>the worst</em> in deiner Vokabelliste.</p>`,
      tryThis: `<p>Vergleiche drei Dinge aus deiner Schultasche, so wie Tony und Lou: My pencil is long, my ruler is longer, …</p>`,
    },
    {
      title: 'Birthday: die Mindmap',
      widget: mindmapWidget,
      body: `<p>Im Buch gibt es eine Mindmap zum Thema <strong>Birthday</strong> mit fünf Ästen: presents, decorations, food,
        activities und party theme. Ordne jedes Wort dem richtigen Ast zu. So wächst die Mindmap Wort für Wort.</p>`,
      tryThis: `<p>Welche drei Dinge aus der Mindmap wünschst du dir für deine nächste Party? Sag es auf Englisch:
        For my party I want …</p>`,
    },
    {
      title: 'Abschlussquiz',
      widget: quizWidget,
      body: `<p>Zwölf Fragen, gemischt: Deutsch nach Englisch, Englisch nach Deutsch und Lückensätze. Drei Sterne gibt es ab elf
        richtigen Antworten.</p>`,
      tryThis: `<p>Spiel das Quiz an zwei verschiedenen Tagen. Was du am zweiten Tag noch weisst, hast du wirklich gelernt.</p>`,
    },
    {
      title: 'Alle Wörter auf einen Blick',
      widget: summaryWidget,
      body: `<p>Alle 55 Wörter mit Lautschrift und Bedeutung, nach Themen sortiert. Mit dem Lautsprecher hörst du jedes Wort.
        Diese Seite kannst du vor dem Vokabeltest zum Wiederholen nutzen.</p>`,
    },
  ],
};

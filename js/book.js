// Bausteine für Buch-Lektionen in Daemon (Fach «Books»): Sortieren, Entscheiden, Notizen, Timer.
// Oberfläche auf Englisch. Notizen bleiben im Browser (localStorage), sie gehören nur dem Leser.
import { h, confetti } from './lesson.js';
import { playNote } from './audio.js';

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const store = {
  get(k) { try { return localStorage.getItem(k) || ''; } catch { return ''; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

/** Eine Karte nach der anderen auf einen von zwei Stapeln legen. cards: [{ text, bin: 0|1, why }] */
export const sortWidget = ({ bins, cards }) => (host) => {
  let list, i, score;
  host.classList.add('quiz');
  host.appendChild(h(`<div>
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="play">
      <div class="sort-card"></div>
      <div class="choices"><button class="btn big" data-b="0">${bins[0]}</button><button class="btn big" data-b="1">${bins[1]}</button></div>
      <div class="readout"></div>
      <div class="controls"><button class="btn primary next hidden">Next →</button></div>
    </div>
    <div class="result hidden"><div class="stars"></div><p class="msg"></p><button class="btn primary again">Again</button></div>
  </div>`));
  const $ = (s) => host.querySelector(s);
  const buttons = [...host.querySelectorAll('.choices .btn')];
  function ask() {
    $('.round').textContent = `Card ${i + 1} of ${list.length}`;
    $('.pts').textContent = `${score} correct`;
    $('.sort-card').textContent = list[i].text;
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    $('.next').classList.add('hidden');
    buttons.forEach((b) => { b.disabled = false; b.classList.remove('ok', 'bad'); });
  }
  buttons.forEach((b) => (b.onclick = () => {
    const c = list[i], ok = +b.dataset.b === c.bin;
    if (ok) score++;
    b.classList.add(ok ? 'ok' : 'bad');
    buttons.forEach((x) => { x.disabled = true; });
    $('.pts').textContent = `${score} correct`;
    $('.readout').className = 'readout ' + (ok ? 'ok' : 'bad');
    $('.readout').textContent = `${ok ? '✅' : `❌ ${bins[c.bin]}.`} ${c.why}`;
    $('.next').textContent = i + 1 < list.length ? 'Next →' : 'See result →';
    $('.next').classList.remove('hidden');
  }));
  $('.next').onclick = () => { i++; if (i < list.length) return ask(); finish(); };
  function finish() {
    $('.play').classList.add('hidden'); $('.result').classList.remove('hidden');
    const stars = score === list.length ? 3 : score >= list.length * 0.7 ? 2 : score >= list.length * 0.4 ? 1 : 0;
    $('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('.msg').textContent = `${score} of ${list.length} correct.`;
    if (stars === 3) confetti();
  }
  function start() {
    list = shuffle(cards); i = 0; score = 0;
    $('.play').classList.remove('hidden'); $('.result').classList.add('hidden');
    ask();
  }
  $('.again').onclick = start;
  start();
};

/** Entscheidungen in einer Situation. items: [{ situation, options: [text…], right: index, why }] */
export const decisionsWidget = (items) => (host) => {
  let list, i, score;
  host.classList.add('quiz');
  host.appendChild(h(`<div>
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="play">
      <div class="question"></div>
      <div class="options"></div>
      <div class="readout why"></div>
      <div class="controls"><button class="btn primary next hidden">Next →</button></div>
    </div>
    <div class="result hidden"><div class="stars"></div><p class="msg"></p><button class="btn primary again">Again</button></div>
  </div>`));
  const $ = (s) => host.querySelector(s);
  function ask() {
    const it = list[i];
    $('.round').textContent = `Situation ${i + 1} of ${list.length}`;
    $('.pts').textContent = `${score} correct`;
    $('.question').textContent = it.situation;
    $('.readout').className = 'readout why'; $('.readout').textContent = '';
    $('.next').classList.add('hidden');
    const box = $('.options'); box.innerHTML = '';
    shuffle(it.options.map((text, idx) => ({ text, idx }))).forEach(({ text, idx }) => {
      const b = h(`<button class="btn">${text}</button>`);
      b.onclick = () => {
        const ok = idx === it.right;
        if (ok) score++;
        b.classList.add(ok ? 'ok' : 'bad');
        box.querySelectorAll('.btn').forEach((x) => { x.disabled = true; });
        $('.pts').textContent = `${score} correct`;
        $('.readout').className = 'readout why ' + (ok ? 'ok' : 'bad');
        $('.readout').textContent = `${ok ? '✅' : '❌'} ${it.why}`;
        $('.next').textContent = i + 1 < list.length ? 'Next →' : 'See result →';
        $('.next').classList.remove('hidden');
      };
      box.appendChild(b);
    });
  }
  $('.next').onclick = () => { i++; if (i < list.length) return ask(); finish(); };
  function finish() {
    $('.play').classList.add('hidden'); $('.result').classList.remove('hidden');
    const stars = score === list.length ? 3 : score >= list.length * 0.7 ? 2 : score >= list.length * 0.4 ? 1 : 0;
    $('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('.msg').textContent = `${score} of ${list.length} correct.`;
    if (stars === 3) confetti();
  }
  function start() {
    list = shuffle(items); i = 0; score = 0;
    $('.play').classList.remove('hidden'); $('.result').classList.add('hidden');
    ask();
  }
  $('.again').onclick = start;
  start();
};

/** Eine Schreibaufgabe. Der Text bleibt im Browser und erscheint am Ende in notesSummary. */
export function noteBox(host, { book, id, label, placeholder = '' }) {
  const key = `book-${book}-${id}`;
  const el = h(`<label class="note-box"><span class="note-label">✍️ ${label}</span><textarea rows="3" placeholder="${placeholder}"></textarea><span class="note-saved"></span></label>`);
  const area = el.querySelector('textarea'), saved = el.querySelector('.note-saved');
  area.value = store.get(key);
  area.oninput = () => { store.set(key, area.value); saved.textContent = 'Saved in this browser'; };
  host.appendChild(el);
  return el;
}

/** Sammelt alle Notizen eines Buchs. tasks: [{ id, label }] */
export const notesSummary = ({ book, title, tasks, keep }) => (host) => {
  host.appendChild(h(`<div class="cards">${keep.map(([t, s]) => `<div class="card"><h4>${t}</h4><div class="sub">${s}</div></div>`).join('')}</div>`));
  host.appendChild(h(`<h4 class="word-group notes-head">Your notes</h4>`));
  const answers = tasks.map((t) => ({ ...t, text: store.get(`book-${book}-${t.id}`).trim() }));
  const list = h(`<div class="notes-list"></div>`);
  for (const a of answers) {
    const row = h(`<div class="note-row"><div class="note-label"></div><div class="note-text"></div></div>`);
    row.querySelector('.note-label').textContent = a.label;
    row.querySelector('.note-text').textContent = a.text || 'Nothing written yet.';
    row.classList.toggle('empty', !a.text);
    list.appendChild(row);
  }
  host.appendChild(list);
  const copy = h(`<div class="controls"><button class="btn primary">Copy my notes</button><span class="note-saved"></span></div>`);
  copy.querySelector('.btn').onclick = async () => {
    const text = [title, '', ...answers.filter((a) => a.text).flatMap((a) => [a.label, a.text, ''])].join('\n');
    try { await navigator.clipboard.writeText(text); copy.querySelector('.note-saved').textContent = 'Copied'; }
    catch { copy.querySelector('.note-saved').textContent = 'Copying is blocked here. Select the text above instead.'; }
  };
  host.appendChild(copy);
};

/** Stiller Timer mit weichem Ton am Anfang und Ende. Zählt abgeschlossene Durchgänge. */
export const sitTimer = ({ book, minutes = [5, 10, 20], start = 20 }) => (host) => {
  const key = `book-${book}-sits`;
  let chosen = start, endAt = 0, tick = null;
  host.appendChild(h(`<div class="sit">
    <div class="sit-time"></div>
    <div class="chips"></div>
    <div class="controls"><button class="btn primary go">▶ Begin</button></div>
    <div class="readout sit-log"></div>
  </div>`));
  const $ = (s) => host.querySelector(s);
  const bell = () => { playNote(76, { dur: 2.2, vel: 0.14, type: 'pad' }); playNote(83, { dur: 2.2, vel: 0.07, type: 'pad' }); };
  const show = (sec) => { $('.sit-time').textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };
  const log = () => { const n = +store.get(key) || 0; $('.sit-log').textContent = n ? `Sits finished in this browser: ${n}` : ''; };
  minutes.forEach((m) => {
    const c = h(`<button class="chip">${m} min</button>`);
    c.onclick = () => {
      if (tick) return;
      chosen = m;
      show(m * 60);
      host.querySelectorAll('.chip').forEach((x) => x.classList.toggle('selected', x === c));
    };
    c.classList.toggle('selected', m === chosen);
    $('.chips').appendChild(c);
  });
  function stop() { clearInterval(tick); tick = null; $('.go').textContent = '▶ Begin'; show(chosen * 60); }
  $('.go').onclick = () => {
    if (tick) return stop();
    bell();
    endAt = Date.now() + chosen * 60000;
    $('.go').textContent = '■ End early';
    tick = setInterval(() => {
      const left = Math.round((endAt - Date.now()) / 1000);
      if (left > 0) return show(left);
      stop();
      bell();
      store.set(key, String((+store.get(key) || 0) + 1));
      log();
    }, 250);
  };
  show(chosen * 60);
  log();
  return { destroy() { clearInterval(tick); tick = null; } };
};

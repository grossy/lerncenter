// Sprachkurs-Baustein für Daemon: macht aus Lektionsdaten die Seiten Wörter → Sätze → Konversation.
// Oberfläche auf Englisch, Sprachausgabe über js/speech.js.
import { h, confetti } from './lesson.js';
import { speak, stopSpeech, RATE } from './speech.js';

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(globalThis.location?.hostname);

/* ---------- Audio-Helfer ---------- */
function play(el, text, opts) {
  el?.classList.add('speaking');
  return speak(text, opts).then(() => el?.classList.remove('speaking'));
}
function slowBtn(text, el, opts = {}) {
  const b = h(`<button class="slow" aria-label="Play slowly" title="Play slowly">🐢</button>`);
  b.onclick = (e) => { e.stopPropagation(); play(el, text, { ...opts, rate: RATE.slow }); };
  return b;
}
function englishToggle(host, { on = true } = {}) {
  const t = h(`<div class="segmented en-toggle"><button class="y">English on</button><button class="n">English off</button></div>`);
  const set = (v) => { host.classList.toggle('no-en', !v); t.querySelector('.y').classList.toggle('selected', v); t.querySelector('.n').classList.toggle('selected', !v); };
  t.querySelector('.y').onclick = () => set(true);
  t.querySelector('.n').onclick = () => set(false);
  set(on);
  return t;
}
/** Hüllt ein Widget ein: stoppt den Ton beim Seitenwechsel. */
const voiced = (fn) => (host, ctx) => {
  const inner = fn(host, ctx);
  return { destroy() { stopSpeech(); inner?.destroy?.(); } };
};

/* ---------- Wörter ---------- */
function wordTile([sv, en, say]) {
  const el = h(`<div class="word"><button class="word-main"><strong lang="sv">${sv}</strong><span class="en">${en}</span>${say ? `<span class="say-hint">${say}</span>` : ''}</button></div>`);
  el.querySelector('.word-main').onclick = () => play(el, sv);
  el.appendChild(slowBtn(sv, el));
  return el;
}
const soundsWidget = (sounds) => voiced((host) => {
  const grid = h(`<div class="words"></div>`);
  sounds.forEach((w) => grid.appendChild(wordTile(w)));
  host.appendChild(grid);
});
const wordsWidget = (groups) => voiced((host) => {
  for (const g of groups) {
    host.appendChild(h(`<h4 class="word-group">${g.group}</h4>`));
    const grid = h(`<div class="words"></div>`);
    g.items.forEach((w) => grid.appendChild(wordTile(w)));
    host.appendChild(grid);
  }
});

const wordQuiz = (groups) => voiced((host) => {
  const all = groups.flatMap((g) => g.items).map(([sv, en]) => ({ sv, en }));
  const ROUNDS = Math.min(10, all.length);
  let list, round, score, missed;
  host.classList.add('quiz');
  host.appendChild(h(`<div>
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="play">
      <div class="question"></div>
      <div class="controls hear-row"><button class="btn ghost hear">🔊 Hear it again</button></div>
      <div class="choices grid"></div>
      <div class="readout"></div>
      <div class="controls"><button class="btn primary next hidden">Next →</button></div>
    </div>
    <div class="result hidden">
      <div class="stars"></div><p class="msg"></p><div class="missed"></div>
      <button class="btn primary again">Try again</button>
    </div></div>`));
  const $ = (s) => host.querySelector(s);
  function ask() {
    const w = list[round];
    const listen = round % 2 === 0;
    $('.round').textContent = `Word ${round + 1} of ${ROUNDS}`;
    $('.pts').textContent = `${score} correct`;
    $('.question').textContent = listen ? 'What does this word mean?' : `How do you say «${w.en}»?`;
    $('.hear-row').classList.toggle('hidden', !listen);
    $('.hear').onclick = () => speak(w.sv);
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    $('.next').classList.add('hidden');
    const others = shuffle(all.filter((o) => o.en !== w.en && o.sv !== w.sv)).slice(0, 3);
    const box = $('.choices'); box.innerHTML = '';
    for (const o of shuffle([w, ...others])) {
      const b = h(`<button class="btn"${listen ? '' : ' lang="sv"'}>${listen ? o.en : o.sv}</button>`);
      b.onclick = () => {
        const ok = o === w;
        if (ok) score++; else missed.push(w);
        b.classList.add(ok ? 'ok' : 'bad');
        box.querySelectorAll('.btn').forEach((x) => { x.disabled = true; });
        $('.readout').className = 'readout ' + (ok ? 'ok' : 'bad');
        $('.readout').innerHTML = `${ok ? '✅' : '❌'} <span lang="sv">${w.sv}</span> = ${w.en}`;
        $('.pts').textContent = `${score} correct`;
        speak(w.sv);
        $('.next').textContent = round + 1 < ROUNDS ? 'Next →' : 'See result →';
        $('.next').classList.remove('hidden');
      };
      box.appendChild(b);
    }
    if (listen) speak(w.sv);
  }
  function start() {
    list = shuffle(all).slice(0, ROUNDS); round = 0; score = 0; missed = [];
    $('.play').classList.remove('hidden'); $('.result').classList.add('hidden');
    ask();
  }
  $('.next').onclick = () => { round++; if (round < ROUNDS) return ask(); finish(); };
  function finish() {
    $('.play').classList.add('hidden'); $('.result').classList.remove('hidden');
    const stars = score === ROUNDS ? 3 : score >= ROUNDS * 0.7 ? 2 : score >= ROUNDS * 0.4 ? 1 : 0;
    $('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('.msg').textContent = `${score} of ${ROUNDS} correct.` + (missed.length ? ' Worth another listen:' : ' On to the sentences.');
    const m = $('.missed'); m.innerHTML = '';
    if (missed.length) { const grid = h(`<div class="words"></div>`); missed.forEach((w) => grid.appendChild(wordTile([w.sv, w.en]))); m.appendChild(grid); }
    if (stars >= 2) confetti();
  }
  $('.again').onclick = start;
  start();
});

/* ---------- Sätze ---------- */
function sentenceRow([sv, en]) {
  const el = h(`<div class="sentence"><button class="sentence-main"><strong lang="sv">${sv}</strong><span class="en">${en}</span></button></div>`);
  el.querySelector('.sentence-main').onclick = () => play(el, sv);
  el.appendChild(slowBtn(sv, el));
  return el;
}
const sentencesWidget = (sentences) => voiced((host) => {
  let run = 0;
  host.appendChild(h(`<div class="controls listen-bar"><button class="btn primary all">▶ Play all</button></div>`));
  host.querySelector('.listen-bar').appendChild(englishToggle(host));
  const list = h(`<div class="sentences"></div>`);
  const rows = sentences.map((s) => { const r = sentenceRow(s); list.appendChild(r); return r; });
  host.appendChild(list);
  host.querySelector('.all').onclick = async () => {
    const mine = ++run;
    for (let i = 0; i < sentences.length; i++) {
      await play(rows[i], sentences[i][0]);
      if (mine !== run) return;
      await wait(500);
      if (mine !== run) return;
    }
  };
  return { destroy() { run++; } };
});

const patternsWidget = (patterns) => voiced((host) => {
  for (const p of patterns) {
    const el = h(`<div class="pattern"><div class="pattern-out"><button class="pattern-line" lang="sv"></button><div class="en"></div></div><div class="chips"></div></div>`);
    const line = el.querySelector('.pattern-line'), en = el.querySelector('.en'), chips = el.querySelector('.chips');
    const fill = (tpl, v) => tpl.replace('{}', `<mark>${v}</mark>`);
    const text = (o) => p.frame.replace('{}', o[0]);
    function show(o, say = true) {
      line.innerHTML = fill(p.frame, o[0]);
      en.innerHTML = fill(p.en, o[1]);
      chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c.dataset.v === o[0]));
      line.onclick = () => play(el, text(o));
      if (say) play(el, text(o));
    }
    p.options.forEach((o) => {
      const c = h(`<button class="chip" lang="sv">${o[0]}</button>`);
      c.dataset.v = o[0];
      c.onclick = () => show(o);
      chips.appendChild(c);
    });
    show(p.options[0], false);
    host.appendChild(el);
  }
});

function tiles(words, onDone) {
  const el = h(`<div class="builder"><div class="built"></div><div class="pool"></div></div>`);
  const built = el.querySelector('.built'), pool = el.querySelector('.pool');
  let order = shuffle(words);
  for (let i = 0; i < 5 && order.join(' ') === words.join(' ') && words.length > 1; i++) order = shuffle(words);
  order.forEach((w) => {
    const t = h(`<button class="tile" lang="sv">${w}</button>`);
    t.onclick = () => {
      (t.parentElement === pool ? built : pool).appendChild(t);
      if (!pool.children.length) onDone([...built.children].map((x) => x.textContent).join(' '));
    };
    pool.appendChild(t);
  });
  return { el, reset() { [...built.children].forEach((t) => pool.appendChild(t)); }, lock() { el.querySelectorAll('.tile').forEach((t) => { t.disabled = true; }); } };
}
const builderWidget = (sentences) => voiced((host) => {
  let i, order, misses;
  host.classList.add('quiz');
  host.appendChild(h(`<div>
    <div class="score"><span class="round"></span></div>
    <div class="question"></div>
    <div class="slot"></div>
    <div class="readout"></div>
    <div class="controls"><button class="btn ghost show">Show the answer</button><button class="btn primary next hidden">Next →</button></div>
  </div>`));
  const $ = (s) => host.querySelector(s);
  let tile;
  function ask() {
    const [sv, en] = order[i];
    $('.round').textContent = `Sentence ${i + 1} of ${order.length}`;
    $('.question').textContent = en;
    $('.readout').className = 'readout'; $('.readout').textContent = '';
    $('.next').classList.add('hidden'); $('.show').classList.remove('hidden');
    misses = 0;
    tile = tiles(sv.split(' '), (got) => {
      if (got === sv) return solved(sv, true);
      misses++;
      $('.readout').className = 'readout bad';
      $('.readout').textContent = 'Not quite. Tap a word to take it back and try another order.';
    });
    $('.slot').innerHTML = ''; $('.slot').appendChild(tile.el);
  }
  function solved(sv, ok) {
    tile.lock();
    $('.readout').className = 'readout ' + (ok ? 'ok' : '');
    $('.readout').innerHTML = `${ok ? '✅ ' : ''}<span lang="sv">${sv}</span>`;
    speak(sv);
    $('.show').classList.add('hidden');
    $('.next').textContent = i + 1 < order.length ? 'Next →' : 'Start over ↻';
    $('.next').classList.remove('hidden');
    if (ok && i + 1 === order.length) confetti();
  }
  $('.show').onclick = () => solved(order[i][0], false);
  $('.next').onclick = () => { i++; if (i >= order.length) { i = 0; order = shuffle(sentences); } ask(); };
  i = 0; order = shuffle(sentences);
  ask();
});

/* ---------- Konversation ---------- */
const parseLines = (talk) => talk.lines.map(([who, sv, en]) => (en === undefined ? { note: sv } : { who, sv, en, speaker: talk.cast.indexOf(who) }));
function bubble(line, right, you = false) {
  const el = h(`<div class="bubble ${right ? 'me' : 'them'}"><div class="who">${line.who}${you ? ' (you)' : ''}</div><button class="bubble-line" lang="sv">${line.sv}</button><div class="en">${line.en}</div></div>`);
  el.querySelector('.bubble-line').onclick = () => play(el, line.sv, { speaker: line.speaker });
  el.querySelector('.who').appendChild(slowBtn(line.sv, el, { speaker: line.speaker }));
  return el;
}
const stageNote = (text) => h(`<div class="stage-note">${text}</div>`);

const listenWidget = (talk) => voiced((host) => {
  let run = 0, rate = RATE.normal;
  const lines = parseLines(talk);
  host.appendChild(h(`<div class="controls listen-bar"><button class="btn primary all">▶ Play conversation</button>
    <div class="segmented speed"><button class="selected" data-r="normal">Normal</button><button data-r="slow">Slow</button></div></div>`));
  const bar = host.querySelector('.listen-bar');
  bar.appendChild(englishToggle(host));
  const box = h(`<div class="talk"></div>`);
  const first = talk.cast[0];
  const els = lines.map((l) => { const e = l.note ? stageNote(l.note) : bubble(l, l.who !== first); box.appendChild(e); return e; });
  host.appendChild(box);
  bar.querySelectorAll('.speed button').forEach((b) => (b.onclick = () => {
    rate = RATE[b.dataset.r];
    bar.querySelectorAll('.speed button').forEach((x) => x.classList.toggle('selected', x === b));
  }));
  const allBtn = bar.querySelector('.all');
  allBtn.onclick = async () => {
    const mine = ++run;
    allBtn.textContent = '■ Stop';
    allBtn.onclick = () => { run++; stopSpeech(); reset(); };
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].note) continue;
      await play(els[i], lines[i].sv, { rate, speaker: lines[i].speaker });
      if (mine !== run) return;
      await wait(350);
      if (mine !== run) return;
    }
    reset();
  };
  const startFn = allBtn.onclick;
  function reset() { allBtn.textContent = '▶ Play conversation'; allBtn.onclick = startFn; }
  return { destroy() { run++; } };
});

const SHORT = /^(ja|nej|tack|ok|okej|hej|hej då|javisst|oj|jaså)[!.?,]*$/i;
const roleplayWidget = (talk, pool) => voiced((host) => {
  const lines = parseLines(talk);
  const others = [...new Set(pool)].filter((s) => !SHORT.test(s));
  const canDefault = talk.cast.includes('Noah') ? 'Noah' : talk.cast[talk.cast.length - 1];
  let you = canDefault, mode = 'choose', run = 0, misses = 0;
  host.appendChild(h(`<div class="roleplay-setup">
    <div class="setup-row"><span class="label">You are</span><div class="chips roles"></div></div>
    <div class="setup-row"><span class="label">Answer by</span><div class="segmented modes">
      <button data-m="choose" class="selected">Choosing</button><button data-m="build">Building</button><button data-m="speak">Speaking</button></div></div>
    <div class="setup-row en-row"><span class="label">Help</span></div>
    </div>`));
  const $ = (s) => host.querySelector(s);
  $('.en-row').appendChild(englishToggle(host));
  const box = h(`<div class="talk scroll"></div>`);
  const panel = h(`<div class="turn"></div>`);
  host.append(box, panel);
  for (const c of talk.cast) {
    const b = h(`<button class="chip">${c}</button>`);
    b.dataset.c = c;
    b.onclick = () => { you = c; idle(); };
    $('.roles').appendChild(b);
  }
  host.querySelectorAll('.modes button').forEach((b) => (b.onclick = () => { mode = b.dataset.m; idle(); }));
  function idle() {
    run++; stopSpeech(); misses = 0;
    $('.roles').querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c.dataset.c === you));
    host.querySelectorAll('.modes button').forEach((b) => b.classList.toggle('selected', b.dataset.m === mode));
    box.innerHTML = '';
    panel.innerHTML = '';
    const s = h(`<button class="btn primary big">▶ Start the conversation</button>`);
    s.onclick = go;
    panel.appendChild(s);
  }
  function add(el) { box.appendChild(el); box.scrollTop = box.scrollHeight; return el; }
  /** Wartet, bis die eigene Zeile sitzt. */
  function turn(line) {
    return new Promise((resolve) => {
      panel.innerHTML = '';
      panel.appendChild(h(`<div class="turn-title">Your turn${mode === 'choose' ? '' : `: <span class="prompt">${line.en}</span>`}</div>`));
      if (mode === 'choose') {
        panel.firstChild.appendChild(h(`<span class="en"> <span class="prompt">${line.en}</span></span>`));
        const first = line.sv.split(' ')[0];
        const wrong = shuffle(others.filter((s) => s !== line.sv && s.split(' ')[0] !== first)).slice(0, 2);
        const opts = h(`<div class="options"></div>`);
        for (const o of shuffle([line.sv, ...wrong])) {
          const b = h(`<button class="btn" lang="sv">${o}</button>`);
          b.onclick = () => {
            if (o === line.sv) return resolve();
            misses++;
            b.classList.add('bad'); b.disabled = true;
          };
          opts.appendChild(b);
        }
        panel.appendChild(opts);
      } else if (mode === 'build') {
        const msg = h(`<div class="readout"></div>`);
        const t = tiles(line.sv.split(' '), (got) => {
          if (got === line.sv) return resolve();
          misses++;
          msg.className = 'readout bad';
          msg.textContent = 'Not quite. Tap a word to take it back.';
        });
        panel.append(t.el, msg);
        if (line.sv.split(' ').length === 1) t.el.querySelector('.tile').focus();
      } else {
        const b = h(`<button class="btn primary">I said it, show me</button>`);
        b.onclick = resolve;
        panel.append(h(`<p class="turn-hint">Say it out loud first, then compare.</p>`), b);
      }
    });
  }
  async function go() {
    const mine = ++run;
    misses = 0;
    box.innerHTML = ''; panel.innerHTML = '';
    for (const line of lines) {
      if (line.note) { add(stageNote(line.note)); continue; }
      const isMe = line.who === you;
      if (isMe) {
        await turn(line);
        if (mine !== run) return;
        panel.innerHTML = '';
      }
      const el = add(bubble(line, isMe, isMe));
      await play(el, line.sv, { speaker: line.speaker });
      if (mine !== run) return;
      await wait(300);
      if (mine !== run) return;
    }
    finish();
  }
  function finish() {
    panel.innerHTML = '';
    if (mode === 'speak') {
      panel.appendChild(h(`<p class="msg">Conversation done. Run it again and try to keep up with the speed.</p>`));
    } else {
      const stars = misses === 0 ? 3 : misses <= 2 ? 2 : 1;
      panel.appendChild(h(`<div class="result"><div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><p class="msg">${misses === 0 ? 'Not a single slip.' : `${misses} slip${misses === 1 ? '' : 's'} along the way.`}</p></div>`));
      if (stars === 3) confetti();
    }
    const again = h(`<button class="btn primary">Play it again</button>`);
    again.onclick = go;
    const swap = h(`<button class="btn ghost">Swap roles</button>`);
    swap.onclick = () => { const i = talk.cast.indexOf(you); you = talk.cast[(i + 1) % talk.cast.length]; idle(); };
    const row = h(`<div class="controls"></div>`);
    row.append(again, swap);
    panel.appendChild(row);
  }
  idle();
  return { destroy() { run++; } };
});

/* ---------- Abschluss ---------- */
const wrapWidget = (phrases) => voiced((host) => {
  const list = h(`<div class="sentences"></div>`);
  phrases.forEach((s) => list.appendChild(sentenceRow(s)));
  host.appendChild(list);
  confetti();
});

/** Nur lokal: Originalaufnahmen der eigenen CDs aus dem Ordner «dev import», der nie deployt wird. */
const cdWidget = (n) => (host) => {
  const nn = String(n).padStart(2, '0');
  const parts = [['The teaching track', 'main'], ['Listening practice', 'listen']];
  for (const [label, key] of parts) {
    const el = h(`<div class="cd-part"><h4 class="word-group">${label}</h4><audio controls preload="none" src="../dev%20import/tracks/conv${nn}-${key}.m4a"></audio></div>`);
    el.querySelector('audio').onerror = () => el.replaceWith(h(`<p class="voice-note">No file at dev import/tracks/conv${nn}-${key}.m4a.</p>`));
    host.appendChild(el);
  }
};

/* ---------- Lektion zusammenbauen ---------- */
export function languageLesson(d) {
  const pool = [...d.talks.flatMap((t) => t.lines.filter((l) => l.length === 3).map((l) => l[1])), ...d.sentences.map((s) => s[0])];
  const take = d.take || d.sentences.slice(0, 6);
  const pages = [
    {
      title: d.title,
      widget: soundsWidget(d.sounds.items),
      body: `${d.scene}<h3>${d.sounds.title}</h3>${d.sounds.body}
        <p style="color:var(--muted)">Follows the situations of the Teach Yourself <em>Swedish Conversation</em> course. Dialogues and exercises are written for Daemon.
        Voice: <a href="https://huggingface.co/yeagersthlm/piper-voice-sv-alma">Alma</a> (synthetic, Piper, CC BY 4.0), trained on the NST Swedish dataset from Språkbanken.</p>`,
      tryThis: `<p>Tap each word and say it back. The 🐢 plays it slowly.</p>`,
    },
    {
      title: 'Words: meet them',
      widget: wordsWidget(d.words),
      body: d.wordsBody || `<p>Everything you need for the conversations in this lesson. Nouns carry their article, <span lang="sv">en</span> or <span lang="sv">ett</span>: learn the two together.</p>`,
      tryThis: `<p>Tap through a group, then cover the English with your hand and go through it again.</p>`,
    },
    {
      title: 'Words: check yourself',
      widget: wordQuiz(d.words),
      body: `<p>Ten words, in both directions: hear the Swedish and pick the meaning, or read the English and pick the Swedish.</p>`,
      tryThis: `<p>Say each answer out loud before you tap it.</p>`,
    },
    {
      title: 'Sentences: hear them',
      widget: sentencesWidget(d.sentences),
      body: d.sentencesBody || `<p>The same words, now doing something. These are the lines you will use in the conversations.</p>`,
      tryThis: `<p>Play a line, then repeat it right away and try to copy the melody. Then switch the English off and test yourself.</p>`,
    },
    {
      title: `Sentences: ${d.patternsTitle}`,
      widget: patternsWidget(d.patterns),
      body: d.patternsBody,
      tryThis: `<p>Tap the chips and listen to how the sentence changes. Tap the sentence itself to hear it again.</p>`,
    },
    ...(d.extra || []),
    {
      title: 'Sentences: build them',
      widget: builderWidget(d.build),
      body: `<p>Put the words in order. Swedish word order is close to English, with one big rule: the verb comes second.</p>`,
      tryThis: `<p>Say the sentence in your head before you touch a tile.</p>`,
    },
    ...d.talks.flatMap((t) => [
      {
        title: `Conversation: ${t.title}`,
        widget: listenWidget(t),
        body: t.scene,
        tryThis: `<p>Listen once with English, once without. Then pick one speaker and say their lines along with the audio.</p>`,
      },
      {
        title: `Your turn: ${t.title}`,
        widget: roleplayWidget(t, pool),
        body: `<p>Now you are in it. The other side speaks, and you answer when it is your turn. Start by choosing, move on to building, and finish by speaking without help.</p>`,
        tryThis: `<p>Turn the English off once you can do it with no slips, then swap roles.</p>`,
      },
    ]),
    {
      title: 'What to keep',
      widget: wrapWidget(take),
      body: `<ul>${d.notes.map((n) => `<li>${n}</li>`).join('')}</ul>`,
    },
  ];
  if (LOCAL) {
    pages.push({
      title: 'From the CD',
      widget: cdWidget(d.n),
      body: `<p>The native speakers from your own copy of the course. This page only appears on localhost: the recordings stay in <code>dev import/</code> and are never published.</p>`,
    });
  }
  // Alles, was gesprochen werden kann: Grundlage für tools/build_speech.py
  const phrases = [...new Set([
    ...d.sounds.items.map((w) => w[0]),
    ...d.words.flatMap((g) => g.items.map((w) => w[0])),
    ...d.sentences.map((s) => s[0]),
    ...d.patterns.flatMap((p) => p.options.map((o) => p.frame.replace('{}', o[0]))),
    ...d.build.map((s) => s[0]),
    ...pool,
    ...(d.extraPhrases || []),
  ])];
  return { id: d.id, lang: 'en', title: d.courseTitle, subject: 'Swedish', pages, phrases };
}

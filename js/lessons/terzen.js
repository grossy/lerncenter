// Lektion: Kleine und grosse Terzen
import { playNote, playChord, playInterval, playSequence, getCtx } from '../audio.js';
import { createPiano, noteName } from '../piano.js';
import { h, confetti } from '../lesson.js';

const C4 = 60;
const INTERVAL_NAMES = ['Prime (derselbe Ton)', 'kleine Sekunde', 'grosse Sekunde', 'kleine Terz', 'grosse Terz',
  'Quarte', 'Tritonus', 'Quinte', 'kleine Sexte', 'grosse Sexte', 'kleine Septime', 'grosse Septime', 'Oktave'];

const timers = () => {
  const list = [];
  return {
    after(ms, fn) { list.push(setTimeout(fn, ms)); },
    clear() { list.forEach(clearTimeout); list.length = 0; },
  };
};

/* ---------- Seite 1: Was ist eine Terz? ---------- */
function introWidget(host) {
  const t = timers();
  const piano = createPiano({ onKey: (m) => playNote(m) });
  host.appendChild(piano.el);
  piano.set(C4, 'root'); piano.badge(C4, '1', 'root');
  piano.badge(C4 + 2, '2');
  piano.set(C4 + 4, 'major'); piano.badge(C4 + 4, '3', 'major');
  host.appendChild(h(`
    <div class="controls">
      <button class="btn primary big play">▶ Anhören</button>
      <div class="legend"><span style="--c:var(--accent)">Startton C</span><span style="--c:var(--major)">Terz E</span></div>
    </div>`));
  host.querySelector('.play').onclick = () => {
    t.clear();
    piano.flash(C4, 500);
    t.after(600, () => piano.flash(C4 + 4, 500));
    t.after(1300, () => { piano.flash(C4, 900); piano.flash(C4 + 4, 900); });
    playInterval(C4, 4);
  };
  return { destroy: t.clear };
}

/* ---------- Seite 2/3: Halbtonschritte zählen ---------- */
function countWidget(steps) {
  return (host) => {
    const t = timers();
    const cls = steps === 4 ? 'major' : 'minor';
    const piano = createPiano({ onKey: (m) => playNote(m) });
    host.appendChild(piano.el);
    const reset = () => { piano.clear(); piano.set(C4, 'root'); piano.badge(C4, 'Start', 'root'); };
    reset();
    host.appendChild(h(`
      <div class="controls">
        <button class="btn primary big count">▶ Schritte zählen</button>
        <button class="btn ghost reset">Zurücksetzen</button>
      </div>
      <div class="readout"></div>`));
    const readout = host.querySelector('.readout');
    host.querySelector('.reset').onclick = () => { t.clear(); reset(); readout.textContent = ''; };
    host.querySelector('.count').onclick = () => {
      t.clear(); reset(); readout.textContent = '';
      getCtx();
      const stepMs = 520;
      for (let i = 1; i <= steps; i++) {
        t.after(i * stepMs, () => {
          const m = C4 + i;
          piano.set(m, i === steps ? cls : 'step');
          piano.badge(m, String(i), i === steps ? cls : '');
          playNote(m, { dur: 0.35, vel: 0.3 });
          readout.textContent = `${i} Halbtonschritt${i > 1 ? 'e' : ''}`;
        });
      }
      t.after((steps + 1) * stepMs + 200, () => {
        readout.innerHTML = `${steps} Halbtonschritte von C bis ${noteName(C4 + steps, { flat: true })} = <span class="tag ${cls}">${steps === 4 ? 'grosse' : 'kleine'} Terz</span>`;
        playInterval(C4, steps);
      });
    };
    return { destroy: t.clear };
  };
}

/* ---------- Seite 4: Vergleich hell/dunkel ---------- */
function compareWidget(host) {
  const t = timers();
  let root = C4, together = false;
  const piano = createPiano({ onKey: (m) => playNote(m) });
  host.appendChild(piano.el);
  host.appendChild(h(`
    <div class="controls">
      <button class="btn big major">☀️ Grosse Terz</button>
      <button class="btn big minor">🌙 Kleine Terz</button>
    </div>
    <div class="controls">
      <span style="color:var(--muted);font-weight:600">Startton:</span>
      <div class="chips roots"></div>
    </div>
    <div class="controls">
      <span style="color:var(--muted);font-weight:600">Abspielen:</span>
      <div class="chips modes">
        <button class="chip selected" data-mode="seq">nacheinander</button>
        <button class="chip" data-mode="chord">zusammen</button>
      </div>
    </div>`));
  const roots = host.querySelector('.roots');
  for (const m of [60, 62, 64, 65, 67, 69]) {
    const c = h(`<button class="chip ${m === root ? 'selected' : ''}">${noteName(m)}</button>`);
    c.onclick = () => { root = m; roots.querySelectorAll('.chip').forEach((x) => x.classList.toggle('selected', x === c)); show(null); };
    roots.appendChild(c);
  }
  host.querySelectorAll('.modes .chip').forEach((c) => {
    c.onclick = () => { together = c.dataset.mode === 'chord'; host.querySelectorAll('.modes .chip').forEach((x) => x.classList.toggle('selected', x === c)); };
  });
  const show = (semis) => {
    piano.clear();
    piano.set(root, 'root'); piano.badge(root, noteName(root), 'root');
    if (semis) {
      const cls = semis === 4 ? 'major' : 'minor';
      piano.set(root + semis, cls); piano.badge(root + semis, noteName(root + semis, { flat: semis === 3 }), cls);
    }
  };
  show(null);
  host.querySelector('.major').onclick = () => { show(4); playInterval(root, 4, { together }); };
  host.querySelector('.minor').onclick = () => { show(3); playInterval(root, 3, { together }); };
  return { destroy: t.clear };
}

/* ---------- Seite 5: Terz selbst bauen ---------- */
function builderWidget(host) {
  let first = null;
  const piano = createPiano({ onKey });
  host.appendChild(piano.el);
  host.appendChild(h(`<div class="readout">Klick auf deinen Startton.</div>`));
  const readout = host.querySelector('.readout');
  function onKey(m) {
    playNote(m);
    if (first === null) {
      piano.clear();
      first = m;
      piano.set(m, 'root'); piano.badge(m, 'Start', 'root');
      readout.className = 'readout';
      readout.textContent = `Startton ${noteName(m)}. Jetzt den zweiten Ton.`;
      return;
    }
    const diff = m - first;
    const semis = Math.abs(diff);
    const dir = diff < 0 ? ' nach unten' : diff > 0 ? ' nach oben' : '';
    const name = INTERVAL_NAMES[semis] ?? `${semis} Halbtonschritte`;
    if (semis === 3 || semis === 4) {
      const cls = semis === 4 ? 'major' : 'minor';
      piano.set(m, cls); piano.badge(m, String(semis), cls);
      readout.className = 'readout ok';
      readout.innerHTML = `🎉 Das ist eine <span class="tag ${cls}">${name}</span>! ${semis} Halbtonschritte${dir}.`;
      setTimeout(() => playChord([first, m]), 300);
    } else {
      piano.set(m, 'step'); piano.badge(m, String(semis));
      readout.className = 'readout bad';
      readout.textContent = `${semis} Halbtonschritte${dir} – das ist eine ${name}, keine Terz. Probier nochmal!`;
    }
    first = null;
  }
  return {};
}

/* ---------- Seite 6: Terzen in Liedern ---------- */
const SONGS = [
  { title: 'Oh When the Saints', sub: 'C → E, nach oben', type: 'major', notes: [{ midi: 60, dur: .35 }, { midi: 64, dur: .35 }, { midi: 65, dur: .35 }, { midi: 67, dur: 1.2 }] },
  { title: 'Beethoven, 5. Sinfonie', sub: 'G → Es, nach unten («Da-da-da-daaa»)', type: 'major', notes: [{ midi: 67, dur: .22 }, { midi: 67, dur: .22 }, { midi: 67, dur: .22 }, { midi: 63, dur: 1.4 }] },
  { title: 'Alle Vögel sind schon da', sub: 'F → A, nach oben', type: 'major', notes: [{ midi: 65, dur: .4 }, { midi: 69, dur: .4 }, { midi: 72, dur: .4 }, { midi: 77, dur: .8 }] },
  { title: 'Kuckuck, Kuckuck', sub: 'G → E, nach unten', type: 'minor', notes: [{ midi: 67, dur: .4 }, { midi: 64, dur: .6 }, { midi: 67, dur: .4 }, { midi: 64, dur: .6 }] },
  { title: 'Hänschen klein', sub: 'G → E, nach unten', type: 'minor', notes: [{ midi: 67, dur: .4 }, { midi: 64, dur: .4 }, { midi: 64, dur: .8 }, { midi: 65, dur: .4 }, { midi: 62, dur: .4 }, { midi: 62, dur: .8 }] },
  { title: 'Greensleeves', sub: 'A → C, nach oben', type: 'minor', notes: [{ midi: 57, dur: .4 }, { midi: 60, dur: .8 }, { midi: 62, dur: .4 }, { midi: 64, dur: .6 }, { midi: 65, dur: .2 }, { midi: 64, dur: .4 }] },
];
function songsWidget(host) {
  const grid = h(`<div class="cards"></div>`);
  for (const s of SONGS) {
    const card = h(`
      <div class="card">
        <h4>${s.title}</h4>
        <div class="sub">${s.sub}</div>
        <div><span class="tag ${s.type}">${s.type === 'major' ? '☀️ grosse Terz' : '🌙 kleine Terz'}</span></div>
        <button class="btn">▶ Anhören</button>
      </div>`);
    card.querySelector('.btn').onclick = () => playSequence(s.notes, { gap: 0.05 });
    grid.appendChild(card);
  }
  host.appendChild(grid);
  return {};
}

/* ---------- Seite 7: Hör-Quiz ---------- */
function quizWidget(host) {
  const ROUNDS = 8;
  let round = 0, score = 0, current = null, hard = false, answered = false;
  host.classList.add('quiz');
  host.appendChild(h(`
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="controls">
      <button class="btn primary big play">▶ Abspielen</button>
      <div class="chips">
        <button class="chip selected" data-hard="0">leicht (nacheinander)</button>
        <button class="chip" data-hard="1">schwer (zusammen)</button>
      </div>
    </div>
    <div class="choices">
      <button class="btn big major" data-a="4">☀️ Gross</button>
      <button class="btn big minor" data-a="3">🌙 Klein</button>
    </div>
    <div class="readout"></div>
    <div class="result hidden" style="text-align:center;margin-top:1rem">
      <div class="stars"></div>
      <p class="msg" style="font-size:1.2rem;font-weight:600"></p>
      <button class="btn primary again">Nochmal spielen</button>
    </div>`));
  const $ = (s) => host.querySelector(s);
  const choices = host.querySelectorAll('.choices .btn');

  host.querySelectorAll('.chips .chip').forEach((c) => {
    c.onclick = () => { hard = c.dataset.hard === '1'; host.querySelectorAll('.chips .chip').forEach((x) => x.classList.toggle('selected', x === c)); };
  });
  function newRound() {
    current = { root: 55 + Math.floor(Math.random() * 14), semis: Math.random() < 0.5 ? 3 : 4 };
    answered = false;
    $('.round').textContent = `Frage ${round + 1} von ${ROUNDS}`;
    $('.pts').textContent = `${score} richtig`;
    $('.readout').className = 'readout';
    $('.readout').textContent = 'Drück auf Abspielen und hör gut hin.';
    choices.forEach((b) => (b.disabled = false));
    play();
  }
  function play() { playInterval(current.root, current.semis, { together: hard }); }
  choices.forEach((b) => {
    b.onclick = () => {
      if (answered) return;
      answered = true;
      const ok = Number(b.dataset.a) === current.semis;
      if (ok) score++;
      const r = $('.readout');
      r.className = 'readout ' + (ok ? 'ok' : 'bad');
      r.textContent = ok ? '✅ Richtig!' : `❌ Das war eine ${current.semis === 4 ? 'grosse' : 'kleine'} Terz.`;
      $('.pts').textContent = `${score} richtig`;
      choices.forEach((x) => (x.disabled = true));
      round++;
      setTimeout(round < ROUNDS ? newRound : finish, 1300);
    };
  });
  function finish() {
    $('.choices').classList.add('hidden');
    $('.controls').classList.add('hidden');
    $('.readout').textContent = '';
    const res = $('.result');
    res.classList.remove('hidden');
    const stars = score >= 8 ? 3 : score >= 6 ? 2 : score >= 4 ? 1 : 0;
    $('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('.msg').textContent = `${score} von ${ROUNDS} richtig! ` + (stars === 3 ? 'Perfekt, du hast Terzen-Ohren! 🎉' : stars >= 1 ? 'Super gemacht!' : 'Übung macht den Meister – nochmal?');
    if (stars >= 2) confetti();
  }
  $('.again').onclick = () => {
    round = 0; score = 0;
    $('.result').classList.add('hidden');
    $('.choices').classList.remove('hidden');
    $('.controls').classList.remove('hidden');
    newRound();
  };
  $('.round').textContent = `Frage 1 von ${ROUNDS}`;
  $('.pts').textContent = '0 richtig';
  $('.readout').textContent = 'Drück auf Abspielen, dann rate: gross oder klein?';
  // Erste Runde startet beim ersten Klick auf Abspielen (Browser braucht eine Geste für Audio).
  $('.play').onclick = () => (current ? play() : newRound());
  return {};
}

/* ---------- Seite 8: Zusammenfassung ---------- */
function summaryWidget(host) {
  host.appendChild(h(`
    <div class="summary">
      <div class="card major">
        <h4>☀️ Grosse Terz</h4>
        <div>4 Halbtonschritte</div>
        <div>z.&nbsp;B. C → E</div>
        <div>klingt hell und fröhlich (Dur)</div>
        <button class="btn">▶ Anhören</button>
      </div>
      <div class="card minor">
        <h4>🌙 Kleine Terz</h4>
        <div>3 Halbtonschritte</div>
        <div>z.&nbsp;B. C → Es</div>
        <div>klingt weich, oft traurig (Moll)</div>
        <button class="btn">▶ Anhören</button>
      </div>
    </div>`));
  const [maj, min] = host.querySelectorAll('.btn');
  maj.onclick = () => playInterval(C4, 4);
  min.onclick = () => playInterval(C4, 3);
  confetti();
  return {};
}

export default {
  id: 'terzen',
  title: 'Kleine und grosse Terzen',
  subject: 'Musik',
  grade: 6,
  pages: [
    {
      title: 'Was ist eine Terz?',
      widget: introWidget,
      body: `<p>Eine <strong>Terz</strong> ist ein Abstand zwischen zwei Tönen. Zähle von C aus die weissen Tasten:
        C ist der <strong>erste</strong> Ton, D der <strong>zweite</strong>, E der <strong>dritte</strong>.</p>
        <p>Der dritte Ton – das ist die Terz! Das Wort kommt aus dem Lateinischen: <em>tertia</em> heisst «die Dritte».</p>`,
      tryThis: `<p>Drück auf <mark>Anhören</mark>. Zuerst hörst du die beiden Töne nacheinander, dann zusammen. Du kannst auch auf jede Taste klicken.</p>`,
    },
    {
      title: 'Halbtonschritte zählen',
      widget: countWidget(4),
      body: `<p>Auf dem Klavier ist der Schritt von einer Taste zur nächsten – egal ob weiss oder schwarz – ein <strong>Halbtonschritt</strong>.</p>
        <p>Von C bis E sind es <strong>4 Halbtonschritte</strong>. Eine Terz mit 4 Halbtonschritten heisst <mark>grosse Terz</mark>.</p>`,
      tryThis: `<p>Drück auf <mark>Schritte zählen</mark> und zähle mit: Cis, D, Dis, E – vier Schritte!</p>`,
    },
    {
      title: 'Die kleine Terz',
      widget: countWidget(3),
      body: `<p>Gehst du von C nur <strong>3 Halbtonschritte</strong> nach oben, landest du auf <strong>Es</strong> – der schwarzen Taste direkt vor dem E.</p>
        <p>Das ist eine <mark>kleine Terz</mark>. Sie ist genau einen Halbton kleiner als die grosse Terz.</p>`,
      tryThis: `<p>Zähle wieder mit. Hörst du, dass die kleine Terz ein bisschen anders klingt als die grosse?</p>`,
    },
    {
      title: 'Hell oder dunkel?',
      widget: compareWidget,
      body: `<p>Die <strong>grosse Terz</strong> klingt meistens hell und fröhlich ☀️. Die <strong>kleine Terz</strong> klingt weicher, manchmal ein bisschen traurig 🌙.</p>
        <p>Genau deshalb klingt Musik in <strong>Dur</strong> fröhlich und Musik in <strong>Moll</strong> traurig: Der Unterschied ist nur dieser eine Halbtonschritt!</p>`,
      tryThis: `<p>Wechsle zwischen gross und klein. Probier verschiedene Starttöne. Und hör den Unterschied einmal <mark>nacheinander</mark> und einmal <mark>zusammen</mark>.</p>`,
    },
    {
      title: 'Bau deine eigene Terz',
      widget: builderWidget,
      body: `<p>Klick zuerst auf einen <strong>Startton</strong>, dann auf einen <strong>zweiten Ton</strong>. Die App zählt die Halbtonschritte und sagt dir, ob es eine Terz ist.</p>`,
      tryThis: `<p>Findest du eine <strong>kleine Terz</strong>, die auf G anfängt? Und eine <strong>grosse Terz</strong>, die auf F anfängt? Geht es auch nach unten?</p>`,
    },
    {
      title: 'Terzen in Liedern',
      widget: songsWidget,
      body: `<p>Viele bekannte Lieder fangen mit einer Terz an. Hör genau hin: Ist es eine grosse oder eine kleine?</p>`,
      tryThis: `<p>Sing die Anfänge mit! Fällt dir noch ein Lied ein, das mit einer Terz beginnt?</p>`,
    },
    {
      title: 'Hör-Quiz',
      widget: quizWidget,
      body: `<p>Jetzt bist du dran! Du hörst eine Terz. Ist sie <strong>gross</strong> ☀️ oder <strong>klein</strong> 🌙?</p>`,
      tryThis: `<p>Tipp: Stell dir vor, wie der Anfang von «Oh When the Saints» klingt (gross) – oder vom «Kuckuck» (klein).</p>`,
    },
    {
      title: 'Geschafft! 🎉',
      widget: summaryWidget,
      body: `<p>Du kennst jetzt den Unterschied zwischen grossen und kleinen Terzen. Das ist der wichtigste Baustein, um später Dur- und Moll-Akkorde zu verstehen.</p>`,
    },
  ],
};

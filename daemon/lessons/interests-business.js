// Lesson (en, adults): Dan Koe, How to turn your interests into a business – ideas in my own words, with working tools
import { h } from '../../js/lesson.js';
import { sortWidget, decisionsWidget, noteBox, notesSummary, store } from '../../js/book.js';

const BOOK = 'interests-business';
const note = (host, id, label, placeholder) => noteBox(host, { book: BOOK, id, label, placeholder });
const key = (id) => `book-${BOOK}-${id}`;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const load = (id, fallback) => { try { return JSON.parse(store.get(key(id))) || fallback; } catch { return fallback; } };
const TASKS = [
  { id: 'pointA', label: 'Point A: the life my reader wants to leave' },
  { id: 'pointB', label: 'Point B: the life I help them reach' },
  { id: 'map', label: 'My content map' },
  { id: 'pain', label: 'What I could sell: pain, passion or process' },
  { id: 'angle', label: 'Three names for my product' },
  { id: 'story', label: 'My story' },
  { id: 'now', label: 'Where my client is now' },
  { id: 'outcome', label: 'The one-month outcome' },
  { id: 'service', label: 'My four calls' },
  { id: 'form', label: 'My questionnaire' },
];

/** Ein Textfeld mit Knopf, das beim Absenden den Text übergibt. */
function adder(placeholder, button, onAdd) {
  const el = h(`<form class="adder"><input type="text" placeholder="${placeholder}" aria-label="${placeholder}"><button class="btn" type="submit">${button}</button></form>`);
  const input = el.querySelector('input');
  el.onsubmit = (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = '';
    onAdd(v);
  };
  return el;
}

/* ---------- Page 1: the business in four parts ---------- */
const PARTS = [
  { icon: '📣', name: 'Traffic', text: 'A place to get attention. Koe recommends writing on one platform, because it is free and needs no video or design skills: X, Threads, LinkedIn or Substack. Substack is his own pick.' },
  { icon: '✉️', name: 'Email list', text: 'Social media catches attention, and a newsletter proves you know your subject. Most of the sales happen here, in his experience, because you can reach interested people directly.' },
  { icon: '💳', name: 'Offer and payment', text: 'A small product or service, and a place to take payment. The options he names include Stan, Teachable, Kajabi and Gumroad. He recommends Eden, which is the software his own company sells.' },
  { icon: '🗂️', name: 'Idea storage', text: 'Most of this job is ideas and writing, so you need one place to keep them. Notion, Google Docs and Obsidian all work.' },
];
function partsWidget(host) {
  host.appendChild(h(`<div>
    <div class="flow">${PARTS.map((p, i) => `<button class="flow-part" data-i="${i}"><span class="flow-icon">${p.icon}</span><span>${p.name}</span></button>`).join('<span class="flow-arrow" aria-hidden="true">→</span>')}</div>
    <div class="readout why"></div>
  </div>`));
  const buttons = [...host.querySelectorAll('.flow-part')], out = host.querySelector('.readout');
  const show = (i) => {
    buttons.forEach((b, k) => b.classList.toggle('selected', k === i));
    out.innerHTML = `<strong>${PARTS[i].name}.</strong> ${PARTS[i].text}`;
  };
  buttons.forEach((b, i) => (b.onclick = () => show(i)));
  show(0);
}

/* ---------- Page 2: scattered interests on one line ---------- */
const INTERESTS = [
  { name: 'Philosophy', free: [90, 40], line: [125, 110] },
  { name: 'Fitness', free: [300, 170], line: [205, 110] },
  { name: 'Business', free: [175, 170], line: [285, 110] },
  { name: 'Psychology', free: [340, 45], line: [365, 110] },
];
function missionWidget(host) {
  host.appendChild(h(`<div>
    <svg class="sym mission" viewBox="0 0 480 210" role="img" aria-label="Four interests that line up between point A and point B">
      <line class="sym-thin mission-line" x1="50" y1="110" x2="430" y2="110"/>
      <g class="mission-end"><circle class="sym-accent" cx="40" cy="110" r="9"/><text class="sym-text" x="40" y="140" text-anchor="middle">A</text></g>
      <g class="mission-end"><circle class="sym-accent" cx="440" cy="110" r="9"/><text class="sym-text" x="440" y="140" text-anchor="middle">B</text></g>
      ${INTERESTS.map((n, i) => `<g class="interest"><circle class="sym-fill" r="6"/><text class="sym-text" y="${i % 2 ? 30 : -16}" text-anchor="middle">${n.name}</text></g>`).join('')}
    </svg>
    <div class="controls"><button class="btn primary toggle"></button></div>
    <div class="readout why"></div>
  </div>`));
  const groups = [...host.querySelectorAll('.interest')], btn = host.querySelector('.toggle'), out = host.querySelector('.readout');
  const svg = host.querySelector('.mission');
  let aligned = false;
  const render = () => {
    groups.forEach((g, i) => {
      const [x, y] = aligned ? INTERESTS[i].line : INTERESTS[i].free;
      g.style.transform = `translate(${x}px, ${y}px)`;
    });
    svg.classList.toggle('aligned', aligned);
    btn.textContent = aligned ? 'Remove the mission' : 'Add a mission';
    out.textContent = aligned
      ? 'Same four interests, but now they are stages on one road: from scattered focus to intentional self-mastery, to use Koe’s example.'
      : 'Four interests with no connection. This is what «too many interests» feels like.';
  };
  btn.onclick = () => { aligned = !aligned; render(); };
  render();
  note(host, 'pointA', 'Point A, in one sentence: what life is your reader trying to leave?', 'Always busy, always learning, and never finishing anything of their own.');
  note(host, 'pointB', 'Point B, in one sentence: what does life look like when they get it?', 'They make and release their own work, on a rhythm they can sustain.');
}

/* ---------- Pages 4 and 5: the content map ---------- */
const loadMap = () => load('map-json', { topics: [] });
function saveMap(map) {
  store.set(key('map-json'), JSON.stringify(map));
  store.set(key('map'), map.topics.map((t) => [`${t.name}`, ...t.subs.flatMap((s) => [`  ${s.name}`, ...s.ideas.map((i) => `    - ${i}`)])].join('\n')).join('\n'));
}
function mapWidget(host) {
  const map = loadMap();
  const a = store.get(key('pointA')).trim(), b = store.get(key('pointB')).trim();
  host.appendChild(h(`<div>
    <div class="map-mission">${a || b ? `<span><strong>A:</strong> ${esc(a || '…')}</span><span><strong>B:</strong> ${esc(b || '…')}</span>` : 'Your Point A and Point B from page 2 will appear here.'}</div>
    <div class="map-topics"></div>
    <div class="map-add"></div>
    <div class="readout why"></div>
  </div>`));
  const box = host.querySelector('.map-topics'), out = host.querySelector('.readout');
  function render() {
    box.innerHTML = '';
    map.topics.forEach((t, ti) => {
      const el = h(`<div class="map-topic"><div class="map-head"><strong></strong><button class="map-x" aria-label="Remove topic">✕</button></div><ul class="map-subs"></ul></div>`);
      el.querySelector('strong').textContent = t.name;
      el.querySelector('.map-x').onclick = () => { map.topics.splice(ti, 1); saveMap(map); render(); };
      const ul = el.querySelector('.map-subs');
      t.subs.forEach((s, si) => {
        const li = h(`<li><span></span><button class="map-x" aria-label="Remove subtopic">✕</button></li>`);
        li.querySelector('span').textContent = s.name;
        li.querySelector('.map-x').onclick = () => { t.subs.splice(si, 1); saveMap(map); render(); };
        ul.appendChild(li);
      });
      el.appendChild(adder('Add a subtopic', 'Add', (v) => { t.subs.push({ name: v, ideas: [] }); saveMap(map); render(); }));
      box.appendChild(el);
    });
    const subs = map.topics.reduce((n, t) => n + t.subs.length, 0);
    out.textContent = !map.topics.length ? 'Start with one broad topic.'
      : map.topics.length < 2 ? 'Good start. Koe suggests 2 or 3 broad topics, but one is fine for now.'
      : map.topics.length > 3 ? 'That is more than he suggests. Which of these could merge?'
      : subs < map.topics.length * 3 ? 'Now give each topic 3 to 5 subtopics.'
      : 'That is a map. Next page: fill it with ideas.';
  }
  host.querySelector('.map-add').appendChild(adder('A broad topic, such as «music»', 'Add topic', (v) => { map.topics.push({ name: v, subs: [] }); saveMap(map); render(); }));
  render();
}
const IDEA_TYPES = [
  { name: 'Pain', prompt: 'What frustrates people here? What are they doing wrong that keeps them stuck?' },
  { name: 'How-to', prompt: 'Which process or method could someone try today?' },
  { name: 'Lesson', prompt: 'What do you know now that you did not know a year ago? Which mistake taught you?' },
  { name: 'Why it matters', prompt: 'What does it cost to ignore this? What changes when you get it right?' },
  { name: 'Harsh truth', prompt: 'What does nobody in this field want to say out loud?' },
  { name: 'Your opinion', prompt: 'Which common advice do you think is wrong, or at least incomplete?' },
];
function ideasWidget(host) {
  const map = loadMap();
  const subs = map.topics.flatMap((t) => t.subs.map((s) => ({ topic: t.name, sub: s })));
  if (!subs.length) {
    host.appendChild(h(`<p class="turn-hint">Your map has no subtopics yet. Go back one page and add a few, then return.</p>`));
    return;
  }
  let sel = 0, type = 0;
  host.appendChild(h(`<div>
    <div class="note-label">Subtopic</div>
    <div class="chips sub-chips"></div>
    <div class="note-label idea-label">Kind of idea</div>
    <div class="chips type-chips">${IDEA_TYPES.map((t, i) => `<button class="chip" data-i="${i}">${t.name}</button>`).join('')}</div>
    <div class="readout why idea-prompt"></div>
    <div class="idea-add"></div>
    <ul class="map-subs idea-list"></ul>
    <div class="readout why idea-count"></div>
  </div>`));
  const subBox = host.querySelector('.sub-chips');
  subs.forEach((s, i) => {
    const c = h(`<button class="chip"></button>`);
    c.textContent = s.sub.name;
    c.onclick = () => { sel = i; render(); };
    subBox.appendChild(c);
  });
  host.querySelectorAll('.type-chips .chip').forEach((c, i) => (c.onclick = () => { type = i; render(); }));
  function render() {
    subBox.querySelectorAll('.chip').forEach((c, i) => c.classList.toggle('selected', i === sel));
    host.querySelectorAll('.type-chips .chip').forEach((c, i) => c.classList.toggle('selected', i === type));
    host.querySelector('.idea-prompt').textContent = IDEA_TYPES[type].prompt;
    const list = host.querySelector('.idea-list');
    list.innerHTML = '';
    subs[sel].sub.ideas.forEach((idea, i) => {
      const li = h(`<li><span></span><button class="map-x" aria-label="Remove idea">✕</button></li>`);
      li.querySelector('span').textContent = idea;
      li.querySelector('.map-x').onclick = () => { subs[sel].sub.ideas.splice(i, 1); saveMap(map); render(); };
      list.appendChild(li);
    });
    const total = subs.reduce((n, s) => n + s.sub.ideas.length, 0);
    host.querySelector('.idea-count').textContent = `${total} idea${total === 1 ? '' : 's'} on your map. Koe aims for 3 to 5 per subtopic.`;
  }
  host.querySelector('.idea-add').appendChild(adder('Write the idea, unjudged', 'Add idea', (v) => { subs[sel].sub.ideas.push(v); saveMap(map); render(); }));
  render();
}

/* ---------- Page 6: pain, passion, process ---------- */
const SOURCES = [
  { name: 'Pain', prompt: 'A problem you have solved in your own health, money, relationships or happiness. It may be small.' },
  { name: 'Passion', prompt: 'An interest that improves your life and could improve someone else’s.' },
  { name: 'Process', prompt: 'A routine or method of yours that produces a specific result, even if only slightly unusual.' },
];
function sourcesWidget(host) {
  host.appendChild(h(`<div>
    <div class="chips src">${SOURCES.map((s) => `<button class="chip">${s.name}</button>`).join('')}</div>
    <div class="readout why"></div>
  </div>`));
  const chips = [...host.querySelectorAll('.src .chip')], out = host.querySelector('.readout');
  const show = (i) => { chips.forEach((c, k) => c.classList.toggle('selected', k === i)); out.textContent = SOURCES[i].prompt; };
  chips.forEach((c, i) => (c.onclick = () => show(i)));
  show(0);
  note(host, 'pain', 'Write one candidate for each. Then look in your notes and files: what do you already have that someone could use?', 'Process: how I finish a track in one weekend. I already have the checklist.');
}

/* ---------- Page 8: four calls ---------- */
function serviceWidget(host) {
  const state = load('service-json', { name: '', steps: [] });
  const save = () => {
    store.set(key('service-json'), JSON.stringify(state));
    const calls = [1, 2, 3, 4].map((n) => {
      const items = state.steps.filter((s) => s.call === n).map((s) => `  - ${s.text}`);
      return items.length ? [`Call ${n}`, ...items].join('\n') : '';
    }).filter(Boolean);
    store.set(key('service'), [state.name, ...calls].filter(Boolean).join('\n'));
  };
  host.appendChild(h(`<div>
    <div class="note-label">1. Dump every step, in any order</div>
    <div class="step-add"></div>
    <div class="note-label idea-label">2. Give each step a call</div>
    <ul class="map-subs step-list"></ul>
    <div class="call-grid"></div>
    <label class="note-box"><span class="note-label">3. Give it a name</span><input type="text" class="service-name" placeholder="The 30-Day First Release"></label>
    <div class="readout why"></div>
  </div>`));
  const list = host.querySelector('.step-list'), grid = host.querySelector('.call-grid'), out = host.querySelector('.readout');
  const nameInput = host.querySelector('.service-name');
  nameInput.value = state.name;
  nameInput.oninput = () => { state.name = nameInput.value; save(); };
  function render() {
    list.innerHTML = '';
    state.steps.filter((s) => !s.call).forEach((s) => {
      const li = h(`<li><span></span><span class="call-picks">${[1, 2, 3, 4].map((n) => `<button class="chip small" data-n="${n}">${n}</button>`).join('')}<button class="map-x" aria-label="Remove step">✕</button></span></li>`);
      li.querySelector('span').textContent = s.text;
      li.querySelectorAll('.chip').forEach((c) => (c.onclick = () => { s.call = +c.dataset.n; save(); render(); }));
      li.querySelector('.map-x').onclick = () => { state.steps.splice(state.steps.indexOf(s), 1); save(); render(); };
      list.appendChild(li);
    });
    grid.innerHTML = '';
    [1, 2, 3, 4].forEach((n) => {
      const col = h(`<div class="call-col"><h4>Call ${n}</h4><ul class="map-subs"></ul></div>`);
      const ul = col.querySelector('ul');
      state.steps.filter((s) => s.call === n).forEach((s) => {
        const li = h(`<li><span></span><button class="map-x" aria-label="Send back to the list">↩</button></li>`);
        li.querySelector('span').textContent = s.text;
        li.querySelector('.map-x').onclick = () => { s.call = 0; save(); render(); };
        ul.appendChild(li);
      });
      grid.appendChild(col);
    });
    const open = state.steps.filter((s) => !s.call).length;
    const used = new Set(state.steps.map((s) => s.call).filter(Boolean)).size;
    out.textContent = !state.steps.length ? 'Do not sort yet. Write down everything someone would have to do.'
      : open ? `${open} step${open === 1 ? '' : 's'} still without a call.`
      : used < 4 ? 'All sorted, but not every call has something in it. Koe’s advice: if it takes less, sell fewer calls for less.'
      : 'Four calls, each with a job. After each one, give homework and start the next with what got stuck.';
  }
  host.querySelector('.step-add').appendChild(adder('One step, such as «choose a template»', 'Add step', (v) => { state.steps.push({ text: v, call: 0 }); save(); render(); }));
  render();
  note(host, 'story', 'Your story: where did you start, what was hard, and what do you wish you had done differently?', '');
  note(host, 'now', 'Your client’s ordinary day: what frustrates them, what have they tried, what happens if nothing changes?', '');
  note(host, 'outcome', 'Where they will be in one month. Make it specific and believable.', 'Not «learn production», but «finish and release your first track in 30 days».');
}

/* ---------- Page 10: the questionnaire ---------- */
const QUESTIONS = [
  'Your social media handle',
  'What do you do for work?',
  'Where are you now with this topic?',
  'Where do you want to be, and by when?',
  'What is your biggest struggle? (multiple choice)',
  'How long have you been trying to get this result?',
  'From 1 to 10, how serious are you about it?',
  'If it fits, are you ready to go ahead, or do you need someone else’s approval?',
];
function questionnaireWidget(host) {
  const state = load('form-json', { pains: ['', '', ''], picks: [0, 3, 4, 6, 7] });
  host.appendChild(h(`<div>
    <div class="note-label">Three pain points your offer solves</div>
    <div class="pain-inputs">${state.pains.map((p, i) => `<input type="text" class="pain" data-i="${i}" placeholder="Pain point ${i + 1}" aria-label="Pain point ${i + 1}">`).join('')}</div>
    <div class="note-label idea-label">Pick 5 to 8 questions</div>
    <div class="audit">${QUESTIONS.map((q, i) => `<label class="audit-row"><input type="checkbox" class="q" data-i="${i}"> <span>${q}</span></label>`).join('')}</div>
    <div class="readout why q-count"></div>
    <div class="note-label idea-label">Preview</div>
    <div class="form-preview"></div>
  </div>`));
  const pains = [...host.querySelectorAll('.pain')], boxes = [...host.querySelectorAll('.q')];
  pains.forEach((p, i) => { p.value = state.pains[i] || ''; });
  boxes.forEach((b, i) => { b.checked = state.picks.includes(i); });
  function render() {
    state.pains = pains.map((p) => p.value);
    state.picks = boxes.map((b, i) => (b.checked ? i : -1)).filter((i) => i >= 0);
    store.set(key('form-json'), JSON.stringify(state));
    const painList = state.pains.map((p) => p.trim()).filter(Boolean);
    const qs = state.picks.map((i) => QUESTIONS[i]);
    store.set(key('form'), [painList.length ? `If you struggle with: ${painList.join(', ')}` : '', ...qs.map((q, i) => `${i + 1}. ${q}`)].filter(Boolean).join('\n'));
    const n = qs.length;
    host.querySelector('.q-count').textContent = n < 5 ? `${n} chosen. Add a few more.` : n > 8 ? 'Too many.' : `${n} questions. Short enough to finish.`;
    const prev = host.querySelector('.form-preview');
    prev.innerHTML = '';
    prev.appendChild(h(`<div><p><strong>If you struggle with:</strong></p><ul class="preview-pains"></ul><p>Fill out this short form. If I think I can help, I will get in touch.</p><ol class="preview-qs"></ol></div>`));
    (painList.length ? painList : ['…']).forEach((p) => { const li = document.createElement('li'); li.textContent = p; prev.querySelector('.preview-pains').appendChild(li); });
    qs.forEach((q) => { const li = document.createElement('li'); li.textContent = q; prev.querySelector('.preview-qs').appendChild(li); });
  }
  pains.forEach((p) => (p.oninput = render));
  boxes.forEach((b) => (b.onchange = render));
  render();
}

/* ---------- Page 12: the math ---------- */
const PRESETS = {
  koe: { reach: 90000, rate: 0.04, msg: 25, close: 8, price: 1000 },
  low: { reach: 15000, rate: 0.02, msg: 15, close: 4, price: 500 },
};
function mathWidget(host) {
  let s = { ...PRESETS.koe };
  host.appendChild(h(`<div>
    <div class="segmented presets"><button data-p="koe" class="selected">Koe’s picture</button><button data-p="low">A sceptical month</button></div>
    <div class="sliders">
      <label><span>Impressions per month: <strong class="v-reach"></strong></span> <input type="range" class="reach" min="1000" max="150000" step="1000"></label>
      <label><span>Forms per 100 impressions: <strong class="v-rate"></strong></span> <input type="range" class="rate" min="0" max="0.2" step="0.01"></label>
      <label><span>People you message: <strong class="v-msg"></strong></span> <input type="range" class="msg" min="0" max="60" step="1"></label>
      <label><span>Conversations that lead to a sale: <strong class="v-close"></strong></span> <input type="range" class="close" min="1" max="20" step="1"></label>
      <label><span>Price: <strong class="v-price"></strong></span> <input type="range" class="price" min="100" max="2000" step="100"></label>
    </div>
    <div class="formulas"><div class="f a"></div><div class="f b"></div><div class="f c"></div></div>
  </div>`));
  const $ = (x) => host.querySelector(x);
  function render() {
    for (const k of ['reach', 'rate', 'msg', 'close', 'price']) $(`.${k}`).value = s[k];
    $('.v-reach').textContent = s.reach.toLocaleString('en');
    $('.v-rate').textContent = s.rate.toFixed(2);
    $('.v-msg').textContent = s.msg;
    $('.v-close').textContent = `${s.close}%`;
    $('.v-price').textContent = `$${s.price}`;
    const forms = (s.reach * s.rate) / 100;
    const leads = forms + s.msg;
    const clients = (leads * s.close) / 100;
    $('.f.a').innerHTML = `Forms: <strong>${Math.round(forms)}</strong> · Conversations: <strong>${Math.round(leads)}</strong> · Clients: <strong>${clients.toFixed(1)}</strong>`;
    $('.f.b').innerHTML = `Revenue this month: <strong>$${Math.round(clients * s.price).toLocaleString('en')}</strong>, before tax and fees`;
    $('.f.c').innerHTML = `Calls you owe: <strong>${Math.round(clients * 4)}</strong>, on top of your 1 to 2 hours of daily marketing`;
    host.querySelectorAll('.presets button').forEach((b) => b.classList.toggle('selected', Object.entries(PRESETS[b.dataset.p]).every(([k, v]) => s[k] === v)));
  }
  for (const k of ['reach', 'rate', 'msg', 'close', 'price']) $(`.${k}`).oninput = (e) => { s[k] = +e.target.value; render(); };
  host.querySelectorAll('.presets button').forEach((b) => (b.onclick = () => { s = { ...PRESETS[b.dataset.p] }; render(); }));
  render();
}

export default {
  id: BOOK,
  lang: 'en',
  title: 'Turn Your Interests Into a Business',
  subject: 'Books',
  pages: [
    {
      title: 'A small business on purpose',
      widget: partsWidget,
      body: `<p>Dan Koe’s pitch is for people with too many interests. Instead of picking one niche, you build a one-person business around the things you already care about. His goal is what he calls <strong>soft rich</strong>: not the largest possible company, but one where you keep most of what you earn and enjoy the work. He says he felt richer alone or with one editor than he did running two teams.</p>
        <p>The model has four parts, and the money comes from a simple chain: attention, trust, offer.</p>
        <p>Unlike the last two lessons, this one gives you <strong>working tools</strong>. By the end you have a mission, a content map, an outline for an offer and a questionnaire, all saved in this browser.</p>
        <p style="color:var(--muted)">Based on Dan Koe’s letter «How To Turn Your Interests Into a Profitable Lifestyle Business» (October 2026) on his newsletter <em>future/proof</em>. Ideas are retold in my own words. The critical pages are my addition. His letter also promotes his own software.</p>`,
      tryThis: `<p>Click through the four parts. If you already have something for one of them, keep it. You do not need new software to start.</p>`,
    },
    {
      title: 'Your niche is a road',
      widget: missionWidget,
      body: `<p>Koe argues that people do not follow you for a topic, they follow you because you might help them change their life. So the thing that holds a brand together is not a subject but a <strong>transformation</strong>: from Point A, the life they want to leave, to Point B, the life they want.</p>
        <p>That is his answer to «too many interests». Anything that moves a person along that road belongs on it. His letter suggests doing this by hand on one sheet of paper, and that is still a good idea, but the fields here work too.</p>`,
      tryThis: `<p>Press the button, then write your own two sentences. If they sound generic, make them more uncomfortable: what is your reader actually stuck in?</p>`,
    },
    {
      title: 'Broader than you think',
      widget: sortWidget({
        bins: ['Too narrow to start', 'Broad enough'],
        cards: [
          { text: 'Lead generation for service businesses', bin: 0, why: 'His own example. The broad territory would be online business.' },
          { text: 'Health', bin: 1, why: 'Anyone scrolling could care. The carnivore diet can come later, inside it.' },
          { text: 'How to optimise your morning cortisol response', bin: 0, why: 'People are not searching on social media, they are scrolling. Hardly anyone stops for this.' },
          { text: 'Artificial intelligence', bin: 1, why: 'Wide enough to catch people who do not know yet that they want your automation workflows.' },
          { text: 'Sidechain compression in techno', bin: 0, why: 'Your best students might love it, but as a top-level topic it stays invisible.' },
          { text: 'Making music', bin: 1, why: 'A territory with many cities. Sidechain compression can be one small street in it.' },
        ],
      }),
      body: `<p>His reasoning: on social media, attention comes first and specifics come later. You attract broadly and then make precise offers to the people who stay. He admits that niching down also works. He just prefers the freedom to talk about whatever interests him.</p>`,
      tryThis: `<p>Sort the cards, then think of your own most specific interest. What is the territory it sits in?</p>`,
    },
    {
      title: 'Build your map',
      widget: mapWidget,
      body: `<p>Instead of throwing single posts at a dartboard, Koe treats each post as a piece of a larger map. Readers get a reason to read more, and you stop depending on one post going viral.</p>
        <p>Two levels to start: 2 or 3 broad topics, his «territories», and 3 to 5 subtopics under each, his «cities». Your angle emerges here. Two people can both write about business, one on freelancing and sales, the other on products and audiences.</p>`,
      tryThis: `<p>Type your own topics. Think about what you already read and listen to without being asked. Saved automatically in this browser.</p>`,
    },
    {
      title: 'Fill it with ideas',
      widget: ideasWidget,
      body: `<p>Now the specifics: things a reader can learn from, argue with or send to a friend. Koe uses six kinds of prompts. Go for quantity, and do not judge anything yet.</p>
        <p>If you are thinking «who am I to write this?», his answer is that you do not need to be an authority. Writing about what you are figuring out has an honesty polished experts often cannot match. Page 9 looks at where that argument stops.</p>`,
      tryThis: `<p>Pick a subtopic and go through all six prompts. Harsh truths and your opinions are usually the most interesting.</p>`,
    },
    {
      title: 'What could you sell?',
      widget: sourcesWidget,
      body: `<p>He proposes starting with two things at once. A <strong>micro product</strong>: a template, a prompt or a guide made from knowledge you already have, at about $19. And a <strong>micro service</strong>: a pack of about four coaching calls at $500 to $1,000.</p>
        <p>For the raw material, he suggests three sources: pain, passion, process. His image for this is a block of marble: <em>«You start with the ugly block.»</em></p>`,
      tryThis: `<p>Click through the three and write something down for each. The point is to find a starting point, not to decide.</p>`,
    },
    {
      title: 'Find an angle',
      widget: (host) => {
        const inner = sortWidget({
          bins: ['Just a label', 'Has an angle'],
          cards: [
            { text: 'Writing Course', bin: 0, why: 'His own example. It says what the thing is, but not why anyone would want it.' },
            { text: 'Release Your First Track in 30 Days', bin: 1, why: 'A result and a time frame. You can picture yourself there.' },
            { text: 'Productivity Masterclass', bin: 0, why: 'A category with a grand word in front of it.' },
            { text: 'How to Study for 12 Hours Straight', bin: 1, why: 'Modelled on his example of a video title that already drew attention.' },
            { text: 'Guide to Nutrition', bin: 0, why: 'It could be anyone’s, and it promises nothing in particular.' },
            { text: 'The 30 Day Life Reset', bin: 1, why: 'A clear container and a change. It may be overpromising, but you can see the desire it speaks to.' },
          ],
        })(host);
        note(host, 'angle', 'Search what already gets attention in your field. Then write three names for your product. Borrow the desire, not the words.', '');
        return inner;
      },
      body: `<p>An <strong>angle</strong> is the way you position something so that people see its value. Koe’s shortcut to market research: look at what already gets a lot of engagement, because that shows what people want. A popular video title can suggest what a product should promise.</p>
        <p>He recommends doing this with an AI and his own software. You can also do it with any search box and an hour of looking. Keep in mind that attention is not the same as buying. A title that goes viral shows curiosity, and only a sale proves demand.</p>`,
      tryThis: `<p>Sort the cards, then look at your own candidates from the last page. Which of them would pass?</p>`,
    },
    {
      title: 'Outline four calls',
      widget: serviceWidget,
      body: `<p>Koe’s micro service is a month of weekly calls towards <strong>one specific result</strong>. No website or curriculum is needed first. He says one call is just a pep talk, while four give you time to change something. You also hear customers’ problems first-hand, which makes whatever you build next better.</p>
        <p>There are two routes: <strong>tutorial</strong>, where you teach a skill you would otherwise be hired for, and <strong>coaching</strong>, where you guide someone towards an outcome in their life.</p>
        <p>Each call has the same three parts: how last week’s tasks went, working through what got stuck, and what to do next. Before the first call, ask a few questions so you know where they are starting.</p>`,
      tryThis: `<p>Dump the steps first and only then sort them. He warns that doing both at once leaves you with nothing.</p>`,
    },
    {
      title: 'How far ahead is far enough?',
      widget: sortWidget({
        bins: ['Honest', 'Crosses a line'],
        cards: [
          { text: 'Sharing what you are figuring out, and saying that this is what you are doing', bin: 0, why: 'This is the good version of his argument. The reader knows what they are getting.' },
          { text: 'Writing «I helped someone with this last week» when you did not', bin: 1, why: 'Koe’s own sample message says this. He adds that if you have not helped anyone, you should share your own result instead. Do that.' },
          { text: 'Teaching someone the first steps of a skill you actually use', bin: 0, why: 'You do not need mastery to save a beginner a month of confusion.' },
          { text: 'Charging for help with depression because meditating helped you', bin: 1, why: 'Your story can be real, and it still does not qualify you to treat anyone. Health and therapy are often regulated too.' },
          { text: 'Showing the numbers from your own first experiment, including the bad ones', bin: 0, why: 'That is a stronger proof than a polished claim.' },
          { text: 'Promising a client a certain income or weight loss', bin: 1, why: 'You do not control that result, and in many places such promises are a legal problem.' },
        ],
      }),
      body: `<p>«One or two steps ahead» is the most comforting idea in the letter, and it holds up in many cases. A beginner can be taught by someone who was a beginner last year. But at $1,000 a person is paying for competence, so the honest question is: <strong>could this go badly for them if I am wrong?</strong></p>
        <p>The lower the risk, the less authority you need. Writing and web design have low stakes. Money, health and mental health do not.</p>`,
      tryThis: `<p>Apply this to your own outline: what is the worst that happens to your client if you are wrong?</p>`,
    },
    {
      title: 'Let people raise their hand',
      widget: questionnaireWidget,
      body: `<p>Koe skips the sales page, because your writing has already done the persuading. Instead, he suggests a short <strong>questionnaire</strong> that does three jobs: it filters out the merely curious, it makes people notice their own problem, and it feels lighter than booking a sales call.</p>
        <p>His most important question is the multiple-choice one about the biggest struggle. People read the options and recognise themselves. Then the link goes everywhere: your bio, your newsletter, your posts and inside your small product.</p>`,
      tryThis: `<p>Fill in your pain points and choose your questions. The preview shows what a stranger would see. Would you fill it out?</p>`,
    },
    {
      title: 'Conversations, not pitches',
      widget: decisionsWidget([
        { situation: 'Someone has just filled out your questionnaire. What is your first message?', options: ['Ask about their goal', 'Send your price and the payment link', 'Paste your full offer description'], right: 0, why: 'People like talking about what they are working on, and it tells you whether you can help.' },
        { situation: 'They have told you their goal and what is stopping them.', options: ['Give one useful tip they have not heard', 'Tell them to book a call first', 'List all your credentials'], right: 0, why: 'Show that you know the subject, before you offer anything.' },
        { situation: 'You gave a tip and they liked it.', options: ['Mention casually that you help people with this, in four calls', 'Add a countdown timer and a discount', 'Say nothing and hope they ask'], right: 0, why: 'Let them know it exists, with no pressure.' },
        { situation: 'You mentioned your offer and they went quiet.', options: ['Wait a few days, then send something that helps with their goal', 'Message daily until they answer', 'Write them off immediately'], right: 0, why: 'He says this is where the money is made, because most people never follow up.' },
        { situation: 'You have followed up twice with no reply.', options: ['Let it go', 'Offer half price', 'Ask why they are ignoring you'], right: 0, why: 'They will come back if they are ready. Respecting that also protects your name.' },
        { situation: 'They are interested and ask a few questions.', options: ['Answer them and send the link, with no rush', 'Tell them the spots are nearly gone', 'Send them a long sales page'], right: 0, why: 'If they want to buy, they will. A fake deadline buys you nothing but distrust.' },
      ]),
      body: `<p>Koe’s method for the first clients is manual: start conversations with people who replied to you or filled out the form. No scripts, just a real conversation: goal, useful tip, a soft mention, and a follow-up that gives something.</p>`,
      tryThis: `<p>Think of the last time someone tried to sell you something in a DM. Which step did they skip?</p>`,
    },
    {
      title: 'Check the math',
      widget: mathWidget,
      body: `<p>The letter ends on a calculation: post daily, get 30 to 40 questionnaires, message 20 to 30 more people, and five clients at $1,000 make a $5,000 month, in 1 to 2 hours a day. He says he finds it hard to believe you could not manage this.</p>
        <p><strong>Those are his assumptions, not measured results.</strong> He gives no data for beginners, and he writes to more than 350,000 subscribers, so his sense of what is easy may not be yours. The sliders start with my reading of his numbers: the reach assumes 3,000 impressions on each of 30 posts, and the 8% is what it takes to reach five clients. The sceptical preset is my own guess, not data either.</p>
        <p>The useful part is his fallback: give it 2 or 3 months, and even one paying client shows there is demand.</p>`,
      tryThis: `<p>Switch between the presets, then put in what you honestly expect. Which slider has the most effect? Which one can you really influence?</p>`,
    },
    {
      title: 'Reading it critically',
      widget: sortWidget({
        bins: ['Useful method', 'Pitch or unproven'],
        cards: [
          { text: 'Keep a map of your ideas, so posts add up to something.', bin: 0, why: 'Cheap, testable and useful even if you never sell anything.' },
          { text: 'Simply hosting on Eden makes you more money.', bin: 1, why: 'A sales claim about his own product, with nothing to back it up in the letter.' },
          { text: 'Dump all the steps first, then group them.', bin: 0, why: 'A good working habit for almost any planning.' },
          { text: 'Anyone can build an audience with enough practice.', bin: 1, why: 'This comes from someone who succeeded. You do not hear from the people who practised and stayed small.' },
          { text: 'Sell before you build, and let real customers shape the product.', bin: 0, why: 'A tested idea far beyond this letter, and it limits how much you can lose.' },
          { text: 'You can monetise anything.', bin: 1, why: 'An overstatement. He even adds that he does not want to hear your objections, which should make you more curious about them.' },
          { text: 'Selling 4 calls takes no more work than selling 1.', bin: 1, why: 'Selling them perhaps. But then you owe four times the hours, which he leaves out.' },
          { text: 'If nothing is working, treat that as feedback and change something.', bin: 0, why: 'Sound, as long as you give a test enough time to mean something.' },
        ],
      }),
      body: `<p>This is a good practical letter that is also an advertisement: it was written by someone who sells software and courses to the very people it addresses. That does not make it wrong, but it does shape what gets said. It barely mentions the time before anything works, the people for whom it never does, or what daily promotion does to the writing you started out enjoying.</p>
        <p>Before you take money, also check the basics where you live: consent for email lists, invoicing and tax. I am not giving legal advice, and neither is the letter.</p>
        <p>One good question for your own case: <strong>do you want this?</strong> A one-person business built on your interests turns them into your job. For some people that is freedom. For others, it is how they lose the thing they loved.</p>`,
      tryThis: `<p>For each card ask: could I try this cheaply and see for myself? If yes, the source matters much less.</p>`,
    },
    {
      title: 'What to keep',
      widget: notesSummary({
        book: BOOK,
        title: 'Turn my interests into a business: my plan',
        tasks: TASKS,
        keep: [
          ['🧭 Mission over niche', 'Interests hold together as stages from Point A to Point B.'],
          ['🗺️ Map, not darts', 'Each post adds to something larger.'],
          ['🧱 Start ugly', 'A small product, four calls, and no website required.'],
          ['✋ Let them raise a hand', 'A short form and real conversations before any pitch.'],
          ['🔢 Test the numbers', 'Run it for 2 or 3 months, then let results decide.'],
          ['❓ Ask if you want it', 'Your interest becomes your job.'],
        ],
      }),
      body: `<p>Everything you wrote and built is collected here, stored only in this browser. Copy it out, and take one thing from it this week: one post from your map, or one conversation.</p>`,
    },
  ],
};

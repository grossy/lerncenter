// Lesson (en, adults): Metaphysical Order in Sufism (Samer Akkach) – ideas in my own words, with tasks
import { h } from '../../js/lesson.js';
import { sortWidget, noteBox, notesSummary } from '../../js/book.js';

const BOOK = 'sufi-order';
const note = (host, id, label, placeholder) => noteBox(host, { book: BOOK, id, label, placeholder });
const TASKS = [
  { id: 'presence', label: 'What is truly present in my world' },
  { id: 'quadrature', label: 'A stalled project and what it lacks' },
  { id: 'design', label: 'Where I keep designing instead of making, or the reverse' },
  { id: 'direction', label: 'The direction where I am most easily thrown' },
  { id: 'mother', label: 'The one line that holds my project' },
];
const ar = (t) => `<span lang="ar" dir="rtl">${t}</span>`;

/** Kleiner Schritt-Rahmen: render(step) zeichnet, labels benennen die Schritte. */
function stepper(host, labels, render) {
  host.appendChild(h(`<div class="controls step-bar"><button class="btn ghost step-back">← Back</button><button class="btn primary step-next"></button></div>`));
  let step = 0;
  const back = host.querySelector('.step-back'), next = host.querySelector('.step-next');
  const draw = () => {
    render(step);
    back.disabled = step === 0;
    next.disabled = step === labels.length - 1;
    next.textContent = step === labels.length - 1 ? labels[step] : `${labels[step + 1]} →`;
  };
  back.onclick = () => { step--; draw(); };
  next.onclick = () => { step++; draw(); };
  draw();
}

/* ---------- Page 2: a point you can see is not the point ---------- */
function pointZoomWidget(host) {
  host.appendChild(h(`<div>
    <svg class="sym" viewBox="0 0 400 200" role="img" aria-label="A dot growing under magnification"><circle class="zoom-dot sym-fill" cx="200" cy="100" r="2"/></svg>
    <div class="sliders"><label>Magnify the dot <input type="range" class="zoom" min="0" max="100" value="0"></label></div>
    <div class="readout"></div>
  </div>`));
  const dot = host.querySelector('.zoom-dot'), out = host.querySelector('.readout');
  function render(v) {
    const factor = Math.round(Math.pow(10, v / 25));
    dot.setAttribute('r', 2 + (v / 100) * 92);
    out.textContent = v === 0
      ? 'A dot on paper. It looks like a point, but it is a blob of ink with a width.'
      : `Magnified ${factor.toLocaleString('en')} times. It still has an edge and an inside, so it still is not the point. You can keep going forever.`;
  }
  host.querySelector('.zoom').oninput = (e) => render(+e.target.value);
  render(0);
}

/* ---------- Page 3: 1, 2, 4, 8 ---------- */
const CUBE = [[120, 60], [260, 60], [260, 160], [120, 160], [170, 25], [310, 25], [310, 125], [170, 125]];
const DIMS = [
  { label: 'One point', pts: 1, edges: [], text: 'One point. No length, no breadth, no depth.' },
  { label: 'A line', pts: 2, edges: [[0, 1]], text: 'Two points make a line, which gives you length. For the Sufi author al-Jīlī, this is also how the first letter arises.' },
  { label: 'A plane', pts: 4, edges: [[0, 1], [1, 2], [2, 3], [3, 0]], text: 'Two lines make a plane: four points, length and breadth.' },
  { label: 'A body', pts: 8, edges: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]], text: 'Two planes make a body: eight points, the smallest solid. Ibn ʿArabī counts them against the Essence plus the seven principal divine names.' },
];
function dimensionsWidget(host) {
  host.appendChild(h(`<div>
    <svg class="sym" viewBox="0 0 400 185" role="img" aria-label="One point becoming a line, a plane and a body"></svg>
    <div class="readout"></div>
  </div>`));
  const svg = host.querySelector('svg'), out = host.querySelector('.readout');
  stepper(host, DIMS.map((d) => d.label), (s) => {
    const d = DIMS[s];
    svg.innerHTML = d.edges.map(([a, b]) => `<line class="sym-line" x1="${CUBE[a][0]}" y1="${CUBE[a][1]}" x2="${CUBE[b][0]}" y2="${CUBE[b][1]}"/>`).join('')
      + CUBE.slice(0, d.pts).map(([x, y]) => `<circle class="sym-fill" cx="${x}" cy="${y}" r="5"/>`).join('');
    out.innerHTML = `<strong>${d.pts} point${d.pts > 1 ? 's' : ''}.</strong> ${d.text}`;
  });
}

/* ---------- Page 4: the centre does not multiply ---------- */
function circleWidget(host) {
  host.appendChild(h(`<div>
    <svg class="sym" viewBox="0 0 300 260" role="img" aria-label="A circle with lines from its centre to the rim"><g class="radii"></g><circle class="sym-line" cx="150" cy="130" r="115"/><circle class="sym-accent" cx="150" cy="130" r="6"/></svg>
    <div class="sliders"><label>Things that exist <input type="range" class="n" min="1" max="72" value="3"></label></div>
    <div class="formulas"><div class="f"></div></div>
  </div>`));
  const radii = host.querySelector('.radii'), f = host.querySelector('.f');
  function render(n) {
    radii.innerHTML = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * 2 * Math.PI - Math.PI / 2;
      const x = 150 + 115 * Math.cos(a), y = 130 + 115 * Math.sin(a);
      return `<line class="sym-thin" x1="150" y1="130" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><circle class="sym-fill" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6"/>`;
    }).join('');
    f.innerHTML = `Rim points: <strong>${n}</strong> · Lines: <strong>${n}</strong> · Centres: <strong>1</strong>`;
  }
  host.querySelector('.n').oninput = (e) => render(+e.target.value);
  render(3);
}

/* ---------- Page 5: seven states ---------- */
const STATES = [
  { name: 'Transcendent Unity', term: 'al-aḥadiyya', text: 'Nothing can be said of this state, not even that it is absolute. It is the one state that does not manifest.', arch: 'Beyond any plan' },
  { name: 'Divine Solitude', term: 'al-waḥda', text: 'First determination: God’s knowing of everything, still undivided, like a tree inside its seed.', arch: 'The idea in the mind, whole and undivided' },
  { name: 'Divine Uniqueness', term: 'al-waḥdāniyya', text: 'Second determination: the same knowing, now distinct, with every possibility separate from the others.', arch: 'The idea in the mind, its parts now clear' },
  { name: 'World of Spirits', term: 'ʿālam al-arwāḥ', text: 'Simple, abstract entities, the patterns that later forms follow.', arch: 'The drawing' },
  { name: 'World of Similitude', term: 'ʿālam al-mithāl', text: 'Subtle, composed entities that cannot be divided or taken apart.', arch: 'The building taking shape' },
  { name: 'World of Bodies', term: 'ʿālam al-ajsām', text: 'Dense, composed entities that can be divided, separated and joined.', arch: 'The finished building' },
  { name: 'Man', term: 'al-insān', text: 'The last state and the sum of all the others, bodily and spiritual together.', arch: 'The person who lives in it and grasps the whole' },
];
function statesWidget(host) {
  let lens = 'term', sel = 1;
  host.appendChild(h(`<div>
    <div class="segmented lens"><button data-l="term" class="selected">The seven states</button><button data-l="arch">As architecture</button></div>
    <div class="state-list">${STATES.map((s, i) => `<button class="state-row" data-i="${i}"><span class="state-n">${i + 1}</span><span class="state-name"></span></button>`).join('')}</div>
    <div class="readout why"></div>
  </div>`));
  const rows = [...host.querySelectorAll('.state-row')], out = host.querySelector('.readout');
  function render() {
    rows.forEach((r, i) => {
      r.classList.toggle('selected', i === sel);
      r.querySelector('.state-name').textContent = lens === 'term' ? STATES[i].name : STATES[i].arch;
    });
    const s = STATES[sel];
    out.innerHTML = lens === 'term' ? `<strong>${s.name}</strong> (<em>${s.term}</em>). ${s.text}` : `<strong>${s.arch}.</strong> In the seven states, this is ${s.name}.`;
    host.querySelectorAll('.lens button').forEach((b) => b.classList.toggle('selected', b.dataset.l === lens));
  }
  rows.forEach((r) => (r.onclick = () => { sel = +r.dataset.i; render(); }));
  host.querySelectorAll('.lens button').forEach((b) => (b.onclick = () => { lens = b.dataset.l; render(); }));
  render();
}

/* ---------- Page 6: Life, Knowledge, Will, Power ---------- */
const FOUR = [
  { key: 'Life', name: 'The Living', q: 'It is still alive for me: it holds energy when I think of it.', gap: 'No life. This is the first condition, and nothing else can make up for it. Let the project go, or wait until it stirs again.' },
  { key: 'Knowledge', name: 'The Knowing', q: 'I know what I am actually trying to make.', gap: 'Alive, but unknown. More hours will not help. You first need to find out what this thing is: sketch it, describe it, ask it.' },
  { key: 'Will', name: 'The Willing', q: 'I have chosen it over the other possibilities.', gap: 'You know what it could be, but you have not chosen. Will narrows what is possible down to one thing. Decide, or admit that you are not going to.' },
  { key: 'Power', name: 'The Powerful', q: 'I have the skill, time and means to bring it about.', gap: 'Everything is there except the means. That is the easiest gap: learn the skill, get the help, make the time.' },
];
function quadratureWidget(host) {
  host.appendChild(h(`<div>
    <p class="turn-hint">Think of something you make that has stalled, then tick only what is true.</p>
    <div class="audit">${FOUR.map((f, i) => `<label class="audit-row"><input type="checkbox" data-i="${i}"> <span><strong>${f.key}.</strong> ${f.q}</span></label>`).join('')}</div>
    <div class="readout why"></div>
  </div>`));
  const boxes = [...host.querySelectorAll('input[type=checkbox]')], out = host.querySelector('.readout');
  const render = () => {
    const missing = boxes.findIndex((b) => !b.checked);
    out.textContent = missing < 0 ? 'All four are there. So the only thing left to do is the work itself.' : FOUR[missing].gap;
  };
  boxes.forEach((b) => (b.onchange = render));
  render();
  note(host, 'quadrature', 'Name the project and the first thing it lacks. What is one step on that level alone?', 'The album: I still don’t know what it is. Step: describe it in three sentences.');
}

/* ---------- Page 8: six directions ---------- */
const DIRS = [
  { key: 'Up', x2: 150, y2: 12, text: 'Towards the head and heaven. The tradition reserves this axis for humans: where inspiration comes from, and out of reach of Satan’s attack.' },
  { key: 'Down', x2: 150, y2: 228, text: 'Towards the feet and the earth. Together with up, it forms the vertical channel Satan cannot use.' },
  { key: 'Front', x2: 235, y2: 70, text: 'The direction of sight and of what you know, so of confidence. The attack from here makes you doubt what you are sure of.' },
  { key: 'Back', x2: 65, y2: 170, text: 'What you cannot see, so ignorance and fear. The attack from here exploits what you do not know.' },
  { key: 'Right', x2: 270, y2: 120, text: 'Strength and authority in this scheme. The attack from here turns power into arrogance.' },
  { key: 'Left', x2: 30, y2: 120, text: 'Weakness and dependence in this scheme. The attack from here turns them into pretence and hypocrisy.' },
];
function directionsWidget(host) {
  host.appendChild(h(`<div class="dir-wrap">
    <svg class="sym" viewBox="0 0 300 240" role="img" aria-label="Six directions from a central point">${DIRS.map((d, i) => `<line class="dir-line" data-i="${i}" x1="150" y1="120" x2="${d.x2}" y2="${d.y2}"/>`).join('')}<circle class="sym-accent" cx="150" cy="120" r="7"/></svg>
    <div class="chips dirs">${DIRS.map((d, i) => `<button class="chip" data-i="${i}">${d.key}</button>`).join('')}</div>
    <div class="readout why">Pick a direction.</div>
  </div>`));
  const lines = [...host.querySelectorAll('.dir-line')], chips = [...host.querySelectorAll('.dirs .chip')], out = host.querySelector('.readout');
  chips.forEach((c, i) => (c.onclick = () => {
    lines.forEach((l, k) => l.classList.toggle('on', k === i));
    chips.forEach((x, k) => x.classList.toggle('selected', k === i));
    out.innerHTML = `<strong>${DIRS[i].key}.</strong> ${DIRS[i].text}`;
  }));
  note(host, 'direction', 'Read the four horizontal directions as a map of your own habits. From which side are you most easily thrown: confidence, fear, power or pretence?', 'Back: I avoid what I don’t know yet…');
}

/* ---------- Page 9: point, alif, ba ---------- */
const LETTERS = [
  { label: 'The point', glyph: '', text: 'A drop falls from the Pen, says one old story. It has no parts and nothing can be said of it.' },
  { label: 'Alif', glyph: 'ا', text: 'The drop overflows into a vertical stroke, the first letter: the first definable form of unity. Its name recalls ilfa, closeness, because it is what all other letters share.' },
  { label: 'Bā’', glyph: 'ب', text: 'The upright alif throws a horizontal shadow, the second letter, and the point now sits beneath it. The Sufis read this as the human being: the image of the source, with a trace of the source in it.' },
];
function letterWidget(host) {
  host.appendChild(h(`<div>
    <div class="letter-stage">
      <svg class="sym letter-svg" viewBox="0 0 300 220" role="img" aria-label="A point, then a vertical line, then a horizontal line with a point beneath it">
        <line class="sym-line thick alif-line" x1="150" y1="30" x2="150" y2="150"/>
        <path class="sym-line thick ba-line" d="M60 150 Q150 180 240 150"/>
        <circle class="sym-accent top-dot" cx="150" cy="22" r="7"/>
        <circle class="sym-accent low-dot" cx="150" cy="195" r="7"/>
      </svg>
      <div class="glyph" lang="ar" dir="rtl"></div>
    </div>
    <div class="readout why"></div>
  </div>`));
  const $ = (s) => host.querySelector(s);
  stepper(host, LETTERS.map((l) => l.label), (s) => {
    $('.alif-line').style.display = s >= 1 ? '' : 'none';
    $('.ba-line').style.display = s >= 2 ? '' : 'none';
    $('.low-dot').style.display = s >= 2 ? '' : 'none';
    $('.top-dot').style.opacity = s >= 2 ? 0.25 : 1;
    $('.glyph').textContent = LETTERS[s].glyph || '•';
    $('.readout').innerHTML = `<strong>${LETTERS[s].label}.</strong> ${LETTERS[s].text}`;
  });
}

/* ---------- Page 10: everything in the dot ---------- */
const NEST = [
  { name: 'All revealed books', text: 'One tradition holds that everything in the revealed books is in the Quran.' },
  { name: 'The Quran', text: 'This is called the clear book: everything is spelled out.' },
  { name: 'The Opening', text: 'Everything in the Quran is said to be in its seven-verse opening chapter, the mother of the book.' },
  { name: 'Bismillāh', text: 'Everything in that chapter is said to be in the opening phrase, «in the name of God…»' },
  { name: 'The letter bā’', text: 'That phrase in turn is contained in its first letter.' },
  { name: 'The dot', text: 'And the letter is contained in the dot beneath it. Unpack it again and the whole book returns.' },
];
function nestingWidget(host) {
  host.appendChild(h(`<div>
    <svg class="sym" viewBox="0 0 400 210" role="img" aria-label="Nested circles shrinking towards one dot">${NEST.map((_, i) => `<circle class="nest" data-i="${i}" cx="200" cy="105" r="${i === 5 ? 4 : 98 - i * 19}"/>`).join('')}</svg>
    <div class="readout why"></div>
  </div>`));
  const rings = [...host.querySelectorAll('.nest')], out = host.querySelector('.readout');
  stepper(host, NEST.map((n) => n.name), (s) => {
    rings.forEach((r, i) => { r.classList.toggle('on', i === s); r.classList.toggle('gone', i < s); });
    out.innerHTML = `<strong>${NEST[s].name}.</strong> ${NEST[s].text}`;
  });
  note(host, 'mother', 'Do the same with something you are making. Write its «mother of the book»: one line that the whole thing unpacks from.', 'A record about a house after everyone has left.');
}

/* ---------- Page 11: consonants need breath ---------- */
const VOWELS = [
  { key: 'none', label: 'No vowels', arabic: 'ضرب', latin: 'D · R · B', mean: 'Only the root. You can write it, but you cannot say it. The tradition calls this the lifeless body of a word.' },
  { key: 'a', label: 'a · a · a', arabic: 'ضَرَبَ', latin: 'DaRaBa', mean: '«He struck.» Same three letters, and now the word lives.' },
  { key: 'u', label: 'u · i · a', arabic: 'ضُرِبَ', latin: 'DuRiBa', mean: '«He was struck.» The spelling has not changed, but the meaning has turned around.' },
];
function vowelsWidget(host) {
  host.appendChild(h(`<div class="vowel-wrap">
    <div class="glyph vowel-glyph" lang="ar" dir="rtl"></div>
    <div class="vowel-latin"></div>
    <div class="chips">${VOWELS.map((v) => `<button class="chip" data-k="${v.key}">${v.label}</button>`).join('')}</div>
    <div class="readout why"></div>
  </div>`));
  const chips = [...host.querySelectorAll('.chip')];
  const show = (v) => {
    host.querySelector('.vowel-glyph').textContent = v.arabic;
    host.querySelector('.vowel-latin').textContent = v.latin;
    host.querySelector('.readout').textContent = v.mean;
    chips.forEach((c) => c.classList.toggle('selected', c.dataset.k === v.key));
  };
  chips.forEach((c, i) => (c.onclick = () => show(VOWELS[i])));
  show(VOWELS[0]);
}

/* ---------- Page 13: the whole diagram ---------- */
const LAYERS = [
  { label: 'Whiteness', text: 'The primordial presence is not drawn at all. It is the blank page behind the diagram.' },
  { label: 'Divine presence', text: 'A circle that encloses everything: God as known through names and attributes.' },
  { label: 'Human presence', text: 'A second circle inside it, mediating between God and the world.' },
  { label: 'The world', text: 'The innermost circle, the cosmos itself.' },
  { label: 'The cross', text: 'Axes through all the circles. They carry the patterns of three and four: three dimensions, six directions, four natures.' },
  { label: 'The centre', text: 'All the presences coincide in one point, where opposites meet. You started with this point on page 2.' },
];
function diagramWidget(host) {
  host.appendChild(h(`<div>
    <svg class="sym page-white" viewBox="0 0 320 260" role="img" aria-label="Nested circles with a cross and a central point">
      <circle class="sym-line layer l1" cx="160" cy="130" r="118"/>
      <circle class="sym-line layer l2" cx="160" cy="130" r="82"/>
      <circle class="sym-line layer l3" cx="160" cy="130" r="46"/>
      <g class="layer l4"><line class="sym-thin" x1="160" y1="12" x2="160" y2="248"/><line class="sym-thin" x1="42" y1="130" x2="278" y2="130"/></g>
      <circle class="sym-accent layer l5" cx="160" cy="130" r="6"/>
    </svg>
    <div class="readout why"></div>
  </div>`));
  const out = host.querySelector('.readout');
  stepper(host, LAYERS.map((l) => l.label), (s) => {
    for (let i = 1; i <= 5; i++) host.querySelector(`.l${i}`).style.display = s >= i ? '' : 'none';
    out.innerHTML = `<strong>${LAYERS[s].label}.</strong> ${LAYERS[s].text}`;
  });
}

export default {
  id: BOOK,
  lang: 'en',
  title: 'Metaphysical Order in Sufism',
  subject: 'Books',
  pages: [
    {
      title: 'Presence, not objects',
      widget: (host) => {
        const inner = sortWidget({
          bins: ['Present', 'Absent'],
          cards: [
            { text: 'A book that has sat unread on your shelf for ten years', bin: 1, why: 'It exists, but it does nothing in your world.' },
            { text: 'A dead grandparent whose saying still changes your decisions', bin: 0, why: 'No body, yet with real influence. In this way of thinking, that is presence.' },
            { text: 'The neighbour you have never met, one wall away', bin: 1, why: 'Physically close, and absent all the same.' },
            { text: 'A song you cannot get out of your head', bin: 0, why: 'It has no location, but it is changing your morning.' },
            { text: 'A worry about something that may never happen', bin: 0, why: 'It does not even exist yet, and still it acts on you. Even non-existence can have a presence here.' },
            { text: 'A friend at your table who is lost in their phone', bin: 1, why: 'A nice case: present in body, with no effect on the room.' },
          ],
        })(host);
        note(host, 'presence', 'Look around your own life. What is more present than it deserves to be, and what exists but has gone absent?', 'Present: an old review. Absent: the piano in the next room.');
        return inner;
      },
      body: `<p>We usually think in subject and object: me in here, things out there. According to the article, Sufi thinkers start from another pair: <strong>presence</strong> (<em>ḥuḍūr</em>) and <strong>absence</strong> (<em>ghiyāb</em>). A thing is present to the degree that it acts on other things and becomes part of their world.</p>
        <p>This lesson walks through the order of being as Sufis such as Ibn ʿArabī described it, in the language they used: points, circles and letters. It explains what they taught and does not argue that it is true. You will find some of it beautiful, some of it strange and some of it useful.</p>
        <p style="color:var(--muted)">Based on «Metaphysical Order in Sufism» by Samer Akkach, from <em>Cosmology and Architecture in Premodern Islam</em>, in a version published by the site Sufi Path of Love. Ideas are retold in my own words. The tasks are my own additions.</p>`,
      tryThis: `<p>Sort the cards by the rule above. It is not about what exists, but about what has an effect.</p>`,
    },
    {
      title: 'A point you can see is not the point',
      widget: pointZoomWidget,
      body: `<p>Medieval Muslim scholars distinguished two kinds of geometry: <strong>sensible</strong>, which you can see and touch, and <strong>intelligible</strong>, which only the mind can grasp. A dot you draw has a size. The true point has none, and you can only describe it by what it is not: no parts, no width, no place.</p>
        <p>That is exactly why Sufis chose it as a symbol for God’s Essence, the state that cannot be known directly. Number works the same way: for them, 1 is not a number but the source of all numbers.</p>`,
      tryThis: `<p>Push the slider all the way. The dot gets bigger but never gets any closer to being a point. That gap is the idea.</p>`,
    },
    {
      title: 'From one point to a body',
      widget: dimensionsWidget,
      body: `<p>Everything in space can be traced back to the point. Line, plane and body follow one another, and each new stage needs twice the points of the one before.</p>
        <p>Ibn ʿArabī’s way of stating the relation is the pattern for much of what follows: the line is neither the points themselves nor anything other than them.</p>`,
      tryThis: `<p>Step from one point to the body. Before you click, predict how many points the next stage needs.</p>`,
    },
    {
      title: 'One centre, many things',
      widget: circleWidget,
      body: `<p>How can one become many and still stay one? This is the central puzzle, and the doctrine of the <strong>Unity of Being</strong> (<em>waḥdat al-wujūd</em>) answers it with images. There is only one Being, and everything else exists through it. Things are neither God nor other than God.</p>
        <p>The article gives three images: a <strong>circle</strong>, whose centre relates to every rim point with its whole self and never divides. A <strong>mirror</strong>, whose image is neither you nor anyone else; add infinite mirrors and you get the world. And <strong>water</strong>, which may be hail, a wave or a cup of ice, and is still water.</p>
        <p>The ninth-century mystic al-Ḥallāj put it in a line: <em>«The circle has no door.»</em> The doctrine has also been contested. Ibn Taymiyya attacked Sufism, and it is often misread as simply erasing the line between God and world.</p>`,
      tryThis: `<p>Slide up the number of things. Count what changes and what does not. If you have a pencil, draw a circle slowly and notice where you end up: Ibn ʿArabī saw in this the return to the beginning.</p>`,
    },
    {
      title: 'Seven states of Being',
      widget: statesWidget,
      body: `<p>Between the unknowable Essence and the world of things, the Sufi writer al-Hindī lays out seven states. It helps to read them as logical order, not as a sequence in time.</p>
        <p>Al-Ghazālī offers an analogy that fits well: an architect, who first holds the whole building in mind, then draws it, then builds it. The article maps the mind and the drawing to these states. I have added the rest of the mapping as a reading aid.</p>`,
      tryThis: `<p>Click through the states, then switch the lens to architecture. Where in that sequence does your own work usually get stuck?</p>`,
    },
    {
      title: 'Four conditions for making anything',
      widget: quadratureWidget,
      body: `<p>Ibn ʿArabī grounds creation in four divine names: <strong>the Living, the Knowing, the Willing and the Powerful</strong>. His logic comes from something we can check on ourselves: to make anything you must be alive, know what you intend, want it, and be able to do it.</p>
        <p>The four have an order, and each one reaches less far than the one before. Knowledge covers everything, even what cannot exist. Will covers only what is possible. Power covers only what Will has chosen.</p>
        <p style="color:var(--muted)">Using this as a diagnosis for your own projects is my idea, not the tradition’s. For Ibn ʿArabī, this describes God’s creative act, and only derivatively ours.</p>`,
      tryThis: `<p>Tick what is true for one stalled project. The first unticked box is the problem, and the boxes after it probably do not matter yet.</p>`,
    },
    {
      title: 'Designing and bringing into being',
      widget: (host) => {
        const inner = sortWidget({
          bins: ['Designing (taqdīr)', 'Bringing into being (takwīn)'],
          cards: [
            { text: 'Hearing the whole arrangement in your head', bin: 0, why: 'Real and creative, and nothing exists yet outside of you.' },
            { text: 'Laying the first brick', bin: 1, why: 'Now something is in the world that was not there before.' },
            { text: 'Choosing proportions before cutting the wood', bin: 0, why: 'The Ikhwān al-Ṣafā’ describe this exact step, an artisan measuring out the work first, as intelligible geometry.' },
            { text: 'Recording the take', bin: 1, why: 'It moves from possible to actual.' },
            { text: 'Writing a plan for a book', bin: 0, why: 'A blueprint. In al-Ghazālī’s analogy the blueprint is written, and it still is not the building.' },
            { text: 'Publishing the finished piece', bin: 1, why: 'The last step of formation: it now exists for others.' },
          ],
        })(host);
        note(host, 'design', 'Which side do you tend to hide on? Where are you endlessly designing, or making without having designed?', 'I keep planning the studio instead of recording in it.');
        return inner;
      },
      body: `<p>Ibn ʿArabī separates two kinds of creating. <strong>Designing</strong> (<em>taqdīr</em>) happens in knowing and imagining, and it brings nothing physical about. <strong>Bringing into being</strong> (<em>takwīn</em>) makes the thing exist. Its root gives the divine command <em>kun</em>, «Be!»</p>
        <p>Each mode has a pattern. <strong>Four</strong> belongs to designing and spreading out: four names, four natures, four elements. <strong>Three</strong> belongs to forming: the three dimensions of a body, and the three-part act of Essence, Will and Word.</p>`,
      tryThis: `<p>Sort the cards, then notice which of the two you enjoy more. That is usually where you hide.</p>`,
    },
    {
      title: 'Six directions',
      widget: directionsWidget,
      body: `<p>In themselves, directions in space are all equal. The human body changes that, the article says, by giving them meaning: front and back, left and right, up and down are no longer the same.</p>
        <p>The starting point is a Quranic passage in which Satan vows to approach people from the front, the back, the right and the left. Above and below are not mentioned, and Ibn ʿArabī builds on that silence: the vertical is what makes humans distinctive. He reads the four attacks as ways our inner life goes wrong.</p>`,
      tryThis: `<p>Click through the six directions. Then, if you like, stand up and turn slowly while you read them. They are easier to feel than to think.</p>`,
    },
    {
      title: 'From a dot to the alphabet',
      widget: letterWidget,
      body: `<p>Sufis extend the same order to writing. The Arabic letters are built from point, line and circle, so writing and drawing become one act: inscription. God’s command is a word, and the world is a book.</p>
        <p>The most beautiful passage is a dialogue by al-Jīlī. The point tells the letter bā’ that they are not two: every part of the letter is a point, and the letter’s whole body is the point spread out. Bā’ protests that it is heavy and bound to one place, and the point replies that even this complaint comes from itself.</p>`,
      tryThis: `<p>Step through and compare the drawing with the real letters on the right. Notice that the dot does not disappear: it changes places.</p>`,
    },
    {
      title: 'Mother of the book',
      widget: nestingWidget,
      body: `<p>Sufis distinguish two states of anything: the <strong>mother of the book</strong> (<em>umm al-kitāb</em>), where everything is latent, and the <strong>clear book</strong> (<em>al-kitāb al-mubīn</em>), where everything is unfolded. A seed and its tree. The same pair recurs at every level of their cosmos.</p>`,
      tryThis: `<p>Follow the chain inwards, then write your own line below. A line that really holds the whole will make decisions easier later.</p>`,
    },
    {
      title: 'Letters need breath',
      widget: vowelsWidget,
      body: `<p>Arabic gives this idea a surprising physical basis. Its letters are consonants, and the short vowels are small marks added above or below. Without them, a word cannot be pronounced.</p>
        <p>So Ibn ʿArabī compares the letters to Adam’s prepared but lifeless body, and the vowels to the spirit breathed into it. Their Arabic name is <em>ḥarakāt</em>, motions. Three motions, plus stillness at the centre, repeat the pattern of three directions around one point.</p>`,
      tryThis: `<p>Switch between the vowels and watch the three letters stay as they are. Then try to read the bare root aloud.</p>`,
    },
    {
      title: 'Reading it critically',
      widget: sortWidget({
        bins: ['A symbol to think with', 'A claim about the world'],
        cards: [
          { text: 'The centre of a circle never divides, however many lines leave it.', bin: 0, why: 'It is true by geometry, and as an image of one and many it does not depend on any physics.' },
          { text: 'Nine concentric spheres surround a motionless Earth.', bin: 1, why: 'This inherited Greek cosmology was the shared science of its day. Modern astronomy has replaced it.' },
          { text: 'The body is built from four humours.', bin: 1, why: 'This was standard medicine for centuries and has since been abandoned.' },
          { text: 'The world is a book written with the ink of existence.', bin: 0, why: 'A metaphor, and clearly intended as one.' },
          { text: 'The sacrum is the one part of the body that does not decay, and it grows from there.', bin: 1, why: 'As anatomy this does not hold, and the article itself notes that Ibn Sīnā had the embryo begin from the heart.' },
          { text: 'The right side is strong and the left side is weak.', bin: 1, why: 'A cultural assumption that left-handed people may have something to say about.' },
          { text: 'Mirrors show you something that is neither you nor another.', bin: 0, why: 'A careful image for a hard thought, and its value lies in what it lets you think.' },
          { text: 'Plants grow down, and humans alone grow up.', bin: 1, why: 'Trees might object. Ibn ʿArabī himself offers a second account in which all bodies grow in the same way.' },
        ],
      }),
      body: `<p>Ideas of this kind are easy to admire and hard to pin down, so separate what is what. Much of the physical picture is inherited science that has not lasted. The symbols work differently: you do not test them, you think with them.</p>
        <p>Three more things to keep in mind. <strong>It is one current in Islam</strong>, not all of it, and these ideas have been fought over for centuries. <strong>It places humans at the top of creation</strong> and speaks of «man», which you may want to question. And <strong>this version is edited</strong>: the PDF adds notes that are not from the Sufi sources, on kundalini, Dante and love knots. Its early pages also present the view that the modern West is in spiritual decline. Treat these as one school’s position, not as a finding.</p>`,
      tryThis: `<p>For each card ask: could an observation ever prove this wrong? If yes, it is a claim. If the question makes no sense, it is probably a symbol.</p>`,
    },
    {
      title: 'The geometry of Being',
      widget: diagramWidget,
      body: `<p>Ibn ʿArabī drew it all as one diagram in his <em>Inshā’ al-Dawā’ir</em>, «The Construction of Circles». It brings the presences of this lesson together in one figure, and the presence of the word can be mapped on it too.</p>`,
      tryThis: `<p>Build it up layer by layer. Then close your eyes and try to rebuild it from the centre outwards, from memory.</p>`,
    },
    {
      title: 'What to keep',
      widget: notesSummary({
        book: BOOK,
        title: 'Metaphysical Order in Sufism: my notes',
        tasks: TASKS,
        keep: [
          ['👁️ Presence', 'What counts is what acts on your world, not only what exists.'],
          ['• The point', 'Knowable only by what it is not, yet the source of all space.'],
          ['⭕ One and many', 'A centre does not divide however many lines leave it.'],
          ['🌱 Life, Knowledge, Will, Power', 'Four conditions for making anything, in that order.'],
          ['📐 Design and formation', 'Knowing a thing and bringing it about are two different acts.'],
          ['📖 Mother of the book', 'Everything can be folded into a seed and unfolded again.'],
        ],
      }),
      body: `<p>Your notes from this lesson are here, stored only in this browser. Copy them somewhere you will see them again.</p>`,
    },
  ],
};

// Lesson (en, adults): David Lynch, Catching the Big Fish – ideas in my own words, with tasks
import { h } from '../../js/lesson.js';
import { sortWidget, decisionsWidget, noteBox, notesSummary, sitTimer } from '../../js/book.js';

const BOOK = 'big-fish';
const note = (host, id, label, placeholder) => noteBox(host, { book: BOOK, id, label, placeholder });
const TASKS = [
  { id: 'fragment', label: 'A fragment I am in love with' },
  { id: 'unsure', label: 'What the idea is telling me about my project' },
  { id: 'block', label: 'My protected block this week' },
  { id: 'setup', label: 'The one thing that would make my setup ready' },
  { id: 'doughnut', label: 'The doughnut this week' },
  { id: 'sit', label: 'What I noticed after sitting' },
];

/* ---------- Page 1: depth decides the size of the fish ---------- */
const FISH = [
  { x: 150, y: 58, s: 0.45, kind: 'The obvious idea', text: 'Small and quick. Everyone fishing up here catches the same ones.' },
  { x: 430, y: 78, s: 0.5, kind: 'A neat trick', text: 'Fun for a moment, but there is not much to it.' },
  { x: 300, y: 132, s: 0.8, kind: 'A useful idea', text: 'Solid. It solves the problem in front of you.' },
  { x: 500, y: 172, s: 0.9, kind: 'A business idea', text: 'Bigger than it first looked. Lynch says there are fish for every field, not only film.' },
  { x: 130, y: 208, s: 1.25, kind: 'An idea with a world in it', text: 'It holds more than you can see when you catch it.' },
  { x: 390, y: 262, s: 1.8, kind: 'The big fish', text: 'Huge, abstract and strangely pure. You could spend years translating this one.' },
];
const fishPath = 'M-34 0 C-20 -18 14 -18 28 0 L46 -13 L42 0 L46 13 L28 0 C14 18 -20 18 -34 0 Z';
function oceanWidget(host) {
  host.appendChild(h(`<div>
    <svg class="ocean" viewBox="0 0 600 310" role="img" aria-label="Fish at increasing depth, with a line going down">
      <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fc3df"/><stop offset=".45" stop-color="#1f6f96"/><stop offset="1" stop-color="#0a2238"/></linearGradient></defs>
      <rect width="600" height="310" fill="url(#sea)"/>
      <rect width="600" height="10" fill="#d9f2fa" opacity=".65"/>
      ${FISH.map((f, i) => `<g class="fish" data-i="${i}" transform="translate(${f.x} ${f.y}) scale(${f.s})"><path d="${fishPath}"/><circle cx="-20" cy="-4" r="2.6" class="fish-eye"/></g>`).join('')}
      <line class="ocean-line" x1="300" y1="0" x2="300" y2="20"/>
      <path class="ocean-hook" d="M0 0 v8 a5 5 0 1 1 -8 3" transform="translate(300 20)"/>
    </svg>
    <div class="sliders"><label>How deep you go <input type="range" min="0" max="100" value="8" class="depth"></label></div>
    <div class="readout"></div>
  </div>`));
  const line = host.querySelector('.ocean-line'), hook = host.querySelector('.ocean-hook');
  const readout = host.querySelector('.readout'), fish = [...host.querySelectorAll('.fish')];
  function render(v) {
    const y = 16 + (v / 100) * 270;
    line.setAttribute('y2', y);
    hook.setAttribute('transform', `translate(300 ${y})`);
    let near = 0;
    FISH.forEach((f, i) => { if (Math.abs(f.y - y) < Math.abs(FISH[near].y - y)) near = i; });
    fish.forEach((g, i) => g.classList.toggle('near', i === near));
    readout.innerHTML = `<strong>${FISH[near].kind}.</strong> ${FISH[near].text}`;
  }
  host.querySelector('.depth').oninput = (e) => render(+e.target.value);
  render(8);
}

/* ---------- Page 2: the first fragment draws the others ---------- */
function fragmentsWidget(host) {
  const parts = ['red lips', 'green lawns', 'a Bobby Vinton song', 'an ear lying in a field'];
  host.appendChild(h(`<div>
    <div class="fragment-line"></div>
    <div class="controls"><button class="btn primary add">🎣 Wait for the next fragment</button></div>
    <div class="readout"></div>
  </div>`));
  const line = host.querySelector('.fragment-line'), add = host.querySelector('.add'), out = host.querySelector('.readout');
  let n = 0;
  add.onclick = () => {
    line.appendChild(h(`<span class="fragment">${parts[n]}</span>`));
    n++;
    if (n === parts.length) {
      add.disabled = true;
      out.textContent = 'That was how Blue Velvet began. Not a plot, four pieces that belonged together for a reason nobody could have stated yet.';
    } else out.textContent = n === 1 ? 'One piece you love. It does not explain anything yet, and it does not need to.' : 'Each piece hooks onto the ones already there.';
  };
  note(host, 'fragment', 'Your turn. Write down one fragment you are in love with: an image, a sound, a phrase. No plan attached.', 'A warm car roof at dusk…');
}

/* ---------- Page 3: Red Room, try and compare ---------- */
const ROOM = [
  { label: 'The spark', dist: 0, text: 'Leaning on a warm car roof outside a film lab, Lynch sees the room in a flash. The idea is complete, but nothing exists yet.' },
  { label: 'Hard red walls', dist: 30, text: 'First attempt: red walls. Compare it with the idea. Red is right, but hard walls are wrong.' },
  { label: 'Curtains', dist: 55, text: 'So they are curtains. Closer. Ask again: are they opaque?' },
  { label: 'Translucent', dist: 75, text: 'No, they let some light through. Now the walls feel right, but something is missing underneath.' },
  { label: 'The floor', dist: 100, text: 'He goes back to the idea, and the floor was there all along. Now it feels the way the idea felt.' },
];
function redRoomWidget(host) {
  let step = 0;
  host.appendChild(h(`<div>
    <svg class="room" viewBox="0 0 400 220" role="img" aria-label="A room that gets closer to the idea step by step">
      <rect width="400" height="220" class="room-dark"/>
      <g class="room-glow"><rect x="40" y="16" width="320" height="150" fill="#ffd9a8"/></g>
      <rect class="room-wall" x="40" y="16" width="320" height="150"/>
      <g class="room-folds">${Array.from({ length: 16 }, (_, i) => `<path d="M${50 + i * 20} 16 q6 75 0 150" />`).join('')}</g>
      <g class="room-floor"><polygon points="40,166 360,166 400,220 0,220" class="floor-base"/>
      ${Array.from({ length: 7 }, (_, i) => `<polyline points="${Array.from({ length: 13 }, (_, k) => `${-20 + k * 37},${172 + i * 8 + (k % 2) * 7}`).join(' ')}" class="floor-zig"/>`).join('')}</g>
    </svg>
    <div class="closeness"><span>Closeness to the idea</span><div class="progress"><div class="bar"></div></div></div>
    <div class="readout"></div>
    <div class="controls"><button class="btn ghost prev-step">← Back</button><button class="btn primary next-step"></button></div>
  </div>`));
  const $ = (s) => host.querySelector(s);
  function render() {
    const s = ROOM[step];
    $('.room-wall').style.display = step >= 1 ? '' : 'none';
    $('.room-wall').style.opacity = step >= 3 ? 0.72 : 1;
    $('.room-glow').style.display = step >= 3 ? '' : 'none';
    $('.room-folds').style.display = step >= 2 ? '' : 'none';
    $('.room-floor').style.display = step >= 4 ? '' : 'none';
    host.querySelector('.closeness .bar').style.width = `${s.dist}%`;
    $('.readout').innerHTML = `<strong>${s.label}.</strong> ${s.text}`;
    $('.prev-step').disabled = step === 0;
    $('.next-step').disabled = step === ROOM.length - 1;
    $('.next-step').textContent = step === ROOM.length - 1 ? 'It feels correct' : `Try: ${ROOM[step + 1].label.toLowerCase()} →`;
  }
  $('.prev-step').onclick = () => { step--; render(); };
  $('.next-step').onclick = () => { step++; render(); };
  render();
  note(host, 'unsure', 'Pick something you are making. Where does it not yet feel like the idea did? Describe the gap, not the fix.', 'The middle section is too tidy…');
}

/* ---------- Page 4: the same rule in many situations ---------- */
const DECISIONS = [
  {
    situation: 'Your all-time favourite song is available for a scene, but something feels off when you try it.',
    options: ['Leave it out and keep listening for what marries with the picture', 'Use it anyway, because great music lifts anything', 'Re-cut the scene until the song fits'],
    right: 0,
    why: 'Being great is not the test. When a piece of music fits, the scene jumps; when it does not, your love for the song will not save it.',
  },
  {
    situation: 'You found the right piece of music, but none of nine recordings sounds the way you heard it.',
    options: ['Keep looking for the version you actually heard', 'Pick the most polished of the nine', 'Accept it: the notes are the same anyway'],
    right: 0,
    why: 'Lynch rejected nine recordings of the Barber Adagio before Previn’s version. Same notes, different result.',
  },
  {
    situation: 'A friend you love working with is not right for the part.',
    options: ['Cast someone else, and remember them for a future role', 'Cast the friend, since trust matters more', 'Rewrite the part around the friend'],
    right: 0,
    why: 'The part decides. He also keeps watching people off set, because the side you glimpse at lunch may fit the next role.',
  },
  {
    situation: 'A crew member is accidentally reflected in a mirror during the perfect take. There is no time to think it through.',
    options: ['Stay curious. It may be opening a door', 'Reshoot and forget about it', 'Fix it later in post and move on'],
    right: 0,
    why: 'This really happened on Twin Peaks, and that accident helped shape the show. Pay attention, because one thing can lead to another.',
  },
  {
    situation: 'Money and time have run out and you can only do half of what you planned.',
    options: ['Treat the limit as a prompt to think harder', 'Stop until the budget is back', 'Do a thin version of the original plan'],
    right: 0,
    why: 'The soft, strange house explosion in Lost Highway happened because the effects man had no time to prepare. With too much money you stop thinking.',
  },
  {
    situation: 'A backer offers real money, but they keep the last word on the final version.',
    options: ['Think hard: without the final say, it may not be your work', 'Sign. You can win them over later', 'Sign, and quietly make your own cut'],
    right: 0,
    why: 'Dune taught him this. Failing with your own work is survivable. Failing with work you gave away hurts twice.',
  },
  {
    situation: 'People on your team are stressed and work is slipping.',
    options: ['Take the fear out, and make the work something people want to come back to', 'Raise the pressure until standards return', 'Trick them into better results'],
    right: 0,
    why: 'Lynch thinks fear gets you a tiny fraction of what people can give, and it slowly curdles into hate for the work.',
  },
  {
    situation: 'People keep asking what your work means.',
    options: ['Let it stand alone and trust what they already sense', 'Publish an explanation so nobody gets it wrong', 'Change it so the meaning is clearer'],
    right: 0,
    why: 'He refuses even DVD commentaries. People know more than they think, and explaining the work changes the experience of it.',
  },
  {
    situation: 'You have been waiting a long time and no idea is biting.',
    options: ['Change something: move to another spot and keep the desire alive', 'Sit in the same chair until one comes', 'Give up on wanting one and take the next offer'],
    right: 0,
    why: 'Patience is not the whole method. Sometimes you are simply in the wrong part of the lake, so reel in and paddle somewhere else.',
  },
];

/* ---------- Page 5: interruptions cost more than their length ---------- */
const SLOTS = 16; // half hours, 09:00 to 17:00
function blocksWidget(host) {
  const busy = new Array(SLOTS).fill(false);
  host.appendChild(h(`<div>
    <div class="chips presets"><button class="chip" data-p="free">Free day</button><button class="chip" data-p="one">One meeting at noon</button><button class="chip" data-p="many">A call every two hours</button><button class="chip" data-p="hour">Pinged every hour</button></div>
    <div class="slots"></div>
    <div class="slot-axis"><span>9:00</span><span>13:00</span><span>17:00</span></div>
    <div class="formulas"><div class="f free"></div><div class="f good"></div></div>
  </div>`));
  const box = host.querySelector('.slots');
  const cells = busy.map((_, i) => {
    const b = h(`<button class="slot" aria-label="Half hour ${i + 1}"></button>`);
    b.onclick = () => { busy[i] = !busy[i]; render(); };
    box.appendChild(b);
    return b;
  });
  function render() {
    cells.forEach((c, i) => c.classList.toggle('busy', busy[i]));
    const blocks = [];
    let run = 0;
    for (const b of [...busy, true]) { if (b) { if (run) blocks.push(run / 2); run = 0; } else run++; }
    const free = busy.filter((b) => !b).length / 2;
    const good = blocks.reduce((sum, b) => sum + Math.floor(b / 4), 0);
    host.querySelector('.f.free').innerHTML = `Free time: <strong>${free} h</strong>, longest stretch <strong>${Math.max(0, ...blocks)} h</strong>`;
    host.querySelector('.f.good').innerHTML = `Good hours by the rule: <strong>${good} h</strong> ${good === 0 && free > 0 ? '(plenty of free time, nothing deep)' : ''}`;
  }
  const PRESET = { free: [], one: [6, 7], many: [3, 7, 11, 15], hour: [1, 3, 5, 7, 9, 11, 13, 15] };
  host.querySelectorAll('.presets .chip').forEach((c) => (c.onclick = () => {
    busy.fill(false);
    PRESET[c.dataset.p].forEach((i) => { busy[i] = true; });
    host.querySelectorAll('.presets .chip').forEach((x) => x.classList.toggle('selected', x === c));
    render();
  }));
  render();
  note(host, 'block', 'Which uninterrupted block can you actually protect this week? Name the day, the hours and what gets cancelled.', 'Thursday 8 to 12, phone in another room…');
}

/* ---------- Page 6: setup audit ---------- */
function setupWidget(host) {
  const items = ['The room or corner is usable right now', 'The main tool starts in under a minute', 'Materials are within reach', 'Nothing has to be cleared away first', 'I could capture an idea within five minutes of having it'];
  host.appendChild(h(`<div>
    <div class="audit">${items.map((t) => `<label class="audit-row"><input type="checkbox"> <span>${t}</span></label>`).join('')}</div>
    <div class="readout"></div>
  </div>`));
  const out = host.querySelector('.readout');
  const boxes = [...host.querySelectorAll('input[type=checkbox]')];
  const render = () => {
    const n = boxes.filter((b) => b.checked).length;
    out.textContent = n === items.length ? 'Ready. When a fish bites, you can start.' : n >= 3 ? `${n} of ${items.length}. Close. Fix the one that costs you the most starts.` : `${n} of ${items.length}. An idea arriving today would probably sit and go sour.`;
  };
  boxes.forEach((b) => (b.onchange = render));
  render();
  note(host, 'setup', 'What is the one change that would make your setup ready for an idea tomorrow morning?', 'Leave the synth patched and the laptop open…');
}

/* ---------- Page 11: the white room ---------- */
function whiteRoomWidget(host) {
  const CURTAINS = [
    { key: 'waking', label: 'Waking', color: '#e7c04a', x: 30 },
    { key: 'dreaming', label: 'Dreaming', color: '#c9504b', x: 150 },
    { key: 'sleeping', label: 'Sleeping', color: '#3f6fb5', x: 270 },
  ];
  host.appendChild(h(`<div>
    <svg class="white-room" viewBox="0 0 400 180" role="img" aria-label="A white wall covered by three coloured curtains with gaps between them">
      <rect x="10" y="10" width="380" height="160" rx="14" class="wall-white"/>
      ${CURTAINS.map((c, i) => `<g class="curtain" data-i="${i}"><rect x="${c.x}" y="10" width="100" height="160" fill="${c.color}"/>${[20, 40, 60, 80].map((d) => `<line x1="${c.x + d}" y1="10" x2="${c.x + d}" y2="170" class="curtain-fold"/>`).join('')}<text x="${c.x + 50}" y="95" text-anchor="middle" class="curtain-label">${c.label}</text></g>`).join('')}
    </svg>
    <div class="controls"><button class="btn primary toggle">Draw the curtains back</button></div>
    <div class="readout"></div>
  </div>`));
  const room = host.querySelector('.white-room'), btn = host.querySelector('.toggle'), out = host.querySelector('.readout');
  let open = false;
  const render = () => {
    room.classList.toggle('open', open);
    btn.textContent = open ? 'Let them fall back' : 'Draw the curtains back';
    out.textContent = open
      ? 'In his picture, the white is always there, all around. Transcending means touching it directly, not only glimpsing it.'
      : 'Three states cover most of the wall. Between them you catch thin slivers of white, such as the jolt you may feel while falling asleep.';
  };
  btn.onclick = () => { open = !open; render(); };
  render();
}

export default {
  id: BOOK,
  lang: 'en',
  title: 'Catching the Big Fish',
  subject: 'Books',
  pages: [
    {
      title: 'Ideas are like fish',
      widget: oceanWidget,
      body: `<p>This is the book’s opening image and the one everything else hangs from: <em>“Ideas are like fish.”</em> You can stay in the shallows and catch small ones, or you can go deep, where they are bigger, stranger and more beautiful.</p>
        <p>David Lynch’s claim is that how deep you can go depends on your awareness, and that he expands his through meditation. This lesson separates two things: <strong>a working method for ideas</strong>, which you can use whatever you think about meditation, and <strong>a set of beliefs</strong> about consciousness, which you should weigh for yourself.</p>
        <p style="color:var(--muted)">Based on David Lynch, <em>Catching the Big Fish</em> (2006). Ideas are retold in my own words, and the book itself is short and worth reading.</p>`,
      tryThis: `<p>Lower the line slowly and read what is down there at each depth.</p>`,
    },
    {
      title: 'Bait, and the first fragment',
      widget: fragmentsWidget,
      body: `<p>You cannot order an idea, but you can want one. For Lynch, <strong>desire is the bait</strong>: you hold it, stay patient and wait.</p>
        <p>What arrives is rarely the whole film. It is one fragment, and he treats that first piece like a Rosetta Stone: if you fall in love with it, it pulls others towards it.</p>`,
      tryThis: `<p>Bring the fragments up one at a time, then write your own below. It does not need a project yet.</p>`,
    },
    {
      title: 'Feel-think your way through',
      widget: redRoomWidget,
      body: `<p>Once you have an idea, the job is <strong>translation</strong>. The idea already knows what it wants, and you keep comparing what you made with how it felt.</p>
        <p>You act, you look, and you react. When you drift off course you can tell, because it feels wrong. Lynch calls this intuition: emotion and intellect working as one thing.</p>`,
      tryThis: `<p>Step through the Red Room from Twin Peaks. Notice that he never designs it: each change answers the question «is this how it was?»</p>`,
    },
    {
      title: 'Ask the idea',
      widget: decisionsWidget(DECISIONS),
      body: `<p>Most of Lynch’s practical advice is one rule applied again and again: <strong>stay true to the idea, and pay attention to what shows up.</strong> These situations all come from stories in the book.</p>`,
      tryThis: `<p>Answer as he would, not as you would. Where you disagree with him, that disagreement tells you something about how you work.</p>`,
    },
    {
      title: 'Four hours for one',
      widget: blocksWidget,
      body: `<p>A painter friend’s father gave Lynch a rule of thumb: <strong>one good hour of painting takes four uninterrupted hours</strong>. You have to sit, get into it, prepare the materials and study what you did.</p>
        <p>The cost is not the appointment itself. If you know you must leave in half an hour, the deep part never starts. This calculator takes the rule literally, one good hour per four unbroken hours. The numbers are a caricature, but the shape is the point.</p>`,
      tryThis: `<p>Compare the presets, then tap half hours to build your real Tuesday. Where would moving a single meeting win you an hour?</p>`,
    },
    {
      title: 'Have a setup',
      widget: setupWidget,
      body: `<p>An idea with nowhere to go goes bad. Lynch keeps working places ready: a shop, a painting studio, a music room, so that when something comes, he can start. Without that, the idea festers for a while and then leaves, and that hurts more than never having had it.</p>`,
      tryThis: `<p>Tick honestly, thinking of the place where you actually make things.</p>`,
    },
    {
      title: 'Let the characters do the suffering',
      widget: sortWidget({
        bins: ['Feeds the work', 'Chokes the work'],
        cards: [
          { text: 'A character consumed by rage', bin: 0, why: 'Darkness in a story is material. You conduct it from outside.' },
          { text: 'You, consumed by rage, trying to write that character', bin: 1, why: 'Lynch sees anger as a vise on creativity. You can barely get out of bed, let alone catch ideas.' },
          { text: 'Understanding what conflict does to people', bin: 0, why: 'Understanding helps. Living inside it does not.' },
          { text: 'Holding on to your depression to keep your edge', bin: 1, why: 'This is the belief he attacks most directly: that being happy would cost you your power.' },
          { text: 'A story full of confusion and tension', bin: 0, why: 'Stories need highs and lows. His own films are very dark.' },
          { text: 'Believing van Gogh was great because he suffered', bin: 1, why: 'Lynch suspects the painting gave him what happiness he had, and that the torment only got in the way.' },
          { text: 'Clarity and energy when you sit down to work', bin: 0, why: 'You need clarity to catch ideas, and strength to survive the pressure around them.' },
          { text: 'A stressful set where everyone is afraid', bin: 1, why: 'He thinks fear gets you one percent of what people can give.' },
        ],
      }),
      body: `<p>Lynch’s name for depression and anger is the <strong>Suffocating Rubber Clown Suit of Negativity</strong>. He wore it when he started, and his wife noticed it was lifting before he did.</p>
        <p>He rejects the myth of the tortured artist: you can show suffering without being in it. And rather than fighting negativity head-on, he compares it to darkness. Darkness is only an absence, so you do not fight it, you turn on a light.</p>
        <p style="color:var(--muted)">This is one artist’s experience, not medical advice. If low mood or anger is taking over, meditation is no substitute for talking to someone qualified.</p>`,
      tryThis: `<p>Sort the cards. The difference is rarely the subject matter: it is whether you are the orchestrator or the one inside it.</p>`,
    },
    {
      title: 'Keep your eye on the doughnut',
      widget: (host) => {
        const inner = sortWidget({
          bins: ['Doughnut', 'Hole'],
          cards: [
            { text: 'Today’s work on the piece', bin: 0, why: 'This is all you can really control, so it is where the attention goes.' },
            { text: 'How critics will take it', bin: 1, why: 'Out there. Thinking about reception while making would, in his words, stop you making anything.' },
            { text: 'The feeling that everyone else is moving faster', bin: 1, why: 'People have said the world was speeding up for decades. It took him five years to finish Eraserhead.' },
            { text: 'Saving up to shoot the next scene', bin: 0, why: 'He delivered the Wall Street Journal for fifty dollars a week to do exactly that.' },
            { text: 'Whether your last work was a hit', bin: 1, why: 'Success can flatten you as surely as failure can, and neither is the work in front of you.' },
            { text: 'Keeping the idea alive through a long stall', bin: 0, why: 'Jack Nance held his character for years, in one case across a door shot a year and a half apart.' },
            { text: 'Family telling you to give up and get a job', bin: 1, why: 'A hard one: he got the job and kept going. The advice was out of his hands, but the next scene was not.' },
          ],
        })(host);
        note(host, 'doughnut', 'What is your doughnut this week, and which hole keeps pulling at you?', 'Doughnut: finish the second verse. Hole: the numbers on the last release.');
        return inner;
      },
      body: `<p>Lynch borrows an old saying: watch the doughnut, not the hole. You can do your work and do it as well as you can, and you cannot steer anything beyond that.</p>
        <p>He is careful about what this promises. It does not guarantee success, and the events of your life may stay the same. What changes is how you go through them.</p>`,
      tryThis: `<p>Sort the cards, then be honest in the note. Naming the hole takes away some of its pull.</p>`,
    },
    {
      title: 'The practice behind it',
      widget: whiteRoomWidget,
      body: `<p>Now the part the book is really about. Since 1973 Lynch has done Transcendental Meditation twice a day for about twenty minutes. In TM a teacher gives you a mantra, a sound you use without attending to its meaning, and the mind settles by itself towards what he calls an ocean of pure consciousness.</p>
        <p>He pictures waking, dreaming and sleeping as curtains around a white room. He says TM differs from concentration or relaxation, which in his view keep you near the surface, and that what expands is <strong>the container itself</strong>: whatever you read, see or make passes through it, at golf-ball size or far larger.</p>`,
      tryThis: `<p>Draw the curtains back and forth. Treat this as his map of an experience, not as anatomy.</p>`,
    },
    {
      title: 'Reading him critically',
      widget: sortWidget({
        bins: ['His experience', 'Factual claim, disputed'],
        cards: [
          { text: 'His first meditation felt like an elevator with its cable cut, and twenty minutes vanished.', bin: 0, why: 'Nobody can argue with this report. It tells you what happened to him, not what will happen to you.' },
          { text: 'Physics has discovered a Unified Field, and it is the same as pure consciousness.', bin: 1, why: 'Physics has no accepted unified field theory yet, and physicists broadly reject the link to consciousness.' },
          { text: 'His anger lifted within about two weeks of starting.', bin: 0, why: 'A personal story, and even a striking one. It cannot show the cause or how common this is.' },
          { text: 'About 8,000 advanced meditators in one group would measurably reduce crime and violence.', bin: 1, why: 'This «Maharishi Effect» research comes mainly from TM-linked institutions, and its methods have been criticised.' },
          { text: 'Meditation gives three times deeper rest than the deepest sleep.', bin: 1, why: 'Stated as settled fact in the book. Whether TM rests the body more than ordinary eyes-closed rest has long been disputed.' },
          { text: 'Ideas come to him from music and from walking around, and hardly ever from dreams.', bin: 0, why: 'A plain account of how he works. You can simply test it against how you work.' },
        ],
      }),
      body: `<p>Lynch’s best chapters are the ones that describe his own process. Where he turns to science, he repeats claims from the TM movement, which he openly supports: the book is dedicated to its founder, and his proceeds fund TM programmes.</p>
        <p>That does not spoil the book. It just means you can take the method on its merits without buying the metaphysics. Everything in the first part of this lesson works either way.</p>`,
      tryThis: `<p>For each card, ask: is he telling me what happened to him, or how the world works?</p>`,
    },
    {
      title: 'Try sitting',
      widget: (host) => {
        const inner = sitTimer({ book: BOOK })(host);
        note(host, 'sit', 'After a few sits: did anything change in how you work or how the day felt? Be as sceptical as you like.', 'Day 3: more restless than before, but…');
        return inner;
      },
      body: `<p><strong>This is not TM.</strong> TM is taught in person by certified teachers, for a fee, and this page cannot replace that. By Lynch’s own account, simple sitting may not take you where TM does.</p>
        <p>What you can test cheaply is the smaller question: does a regular quiet stretch before working change anything for you? Sit comfortably with your eyes closed, let thoughts come and go, and do not try to achieve anything.</p>`,
      tryThis: `<p>Run a small experiment: ten minutes before your creative work, for one week. Keep this page open, the timer stops when you leave it. A soft tone marks the beginning and the end.</p>`,
    },
    {
      title: 'What to keep',
      widget: notesSummary({
        book: BOOK,
        title: 'Catching the Big Fish: my notes',
        tasks: TASKS,
        keep: [
          ['🎣 Desire is bait', 'Hold the wish, stay patient, and move spots when nothing bites.'],
          ['🧩 Love the fragment', 'One piece is enough to start. The rest hooks on.'],
          ['🧭 Ask the idea', 'Compare what you made with how the idea felt.'],
          ['⏳ Four for one', 'Unbroken time and a ready setup let the deep part happen.'],
          ['🤡 Lose the clown suit', 'Show the darkness without living in it.'],
          ['🍩 Doughnut, not hole', 'Do the work. The rest is out of your hands.'],
        ],
      }),
      body: `<p>Your notes from this lesson are here, stored only in this browser. Copy them somewhere you will see them again, and go fishing.</p>`,
    },
  ],
};

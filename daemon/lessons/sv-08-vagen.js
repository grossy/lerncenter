// Lesson (en/sv): Swedish 8 – feeling ill, finding the way
import { languageLesson } from '../../js/language.js';
import { h, confetti } from '../../js/lesson.js';
import { speak, stopSpeech, RATE } from '../../js/speech.js';

/* ---- Listening drill: hear a direction, tap the arrow ---- */
const MOVES = [
  ['Gå rakt fram.', 'up', 'Go straight ahead.'],
  ['Fortsätt rakt fram.', 'up', 'Continue straight ahead.'],
  ['Sväng höger.', 'right', 'Turn right.'],
  ['Sväng till höger vid kyrkan.', 'right', 'Turn right at the church.'],
  ['Ta nästa till höger.', 'right', 'Take the next right.'],
  ['Sväng vänster.', 'left', 'Turn left.'],
  ['Sväng till vänster vid banken.', 'left', 'Turn left at the bank.'],
  ['Ta nästa till vänster.', 'left', 'Take the next left.'],
];
const ARROW = { up: '⬆️', left: '⬅️', right: '➡️' };
function directionsWidget(host) {
  const ROUNDS = 8;
  let round, score, move;
  host.classList.add('quiz');
  host.appendChild(h(`<div>
    <div class="score"><span class="round"></span><span class="pts"></span></div>
    <div class="controls"><button class="btn primary hear">🔊 Play the direction</button><button class="btn ghost hear-slow">🐢 Slowly</button></div>
    <div class="arrows"><button class="btn big" data-d="left">⬅️</button><button class="btn big" data-d="up">⬆️</button><button class="btn big" data-d="right">➡️</button></div>
    <div class="readout"></div>
    <div class="controls"><button class="btn primary next hidden">Next →</button></div>
  </div>`));
  const $ = (s) => host.querySelector(s);
  const arrows = [...host.querySelectorAll('.arrows .btn')];
  function ask() {
    move = MOVES[Math.floor(Math.random() * MOVES.length)];
    $('.round').textContent = `Direction ${round + 1} of ${ROUNDS}`;
    $('.pts').textContent = `${score} correct`;
    $('.readout').className = 'readout'; $('.readout').textContent = 'Press play, then tap where to go.';
    $('.next').classList.add('hidden');
    arrows.forEach((b) => { b.disabled = false; b.classList.remove('ok', 'bad'); });
  }
  arrows.forEach((b) => (b.onclick = () => {
    const ok = b.dataset.d === move[1];
    if (ok) score++;
    b.classList.add(ok ? 'ok' : 'bad');
    arrows.forEach((x) => { x.disabled = true; });
    $('.pts').textContent = `${score} correct`;
    $('.readout').className = 'readout ' + (ok ? 'ok' : 'bad');
    $('.readout').innerHTML = `${ok ? '✅' : `❌ ${ARROW[move[1]]}`} <span lang="sv">${move[0]}</span> ${move[2]}`;
    $('.next').textContent = round + 1 < ROUNDS ? 'Next →' : 'Start over ↻';
    $('.next').classList.remove('hidden');
    if (ok && score === ROUNDS) confetti();
  }));
  $('.hear').onclick = () => speak(move[0]);
  $('.hear-slow').onclick = () => speak(move[0], { rate: RATE.slow });
  $('.next').onclick = () => { round++; if (round >= ROUNDS) { round = 0; score = 0; } ask(); };
  round = 0; score = 0;
  ask();
  return { destroy: stopSpeech };
}

export default languageLesson({
  id: 'sv-08', n: 8, courseTitle: 'Swedish 8: Hitta vägen',
  title: 'Hitta vägen: finding the way',
  extraPhrases: MOVES.map((m) => m[0]),
  scene: `<p>Noah wakes up with a sore throat on a Sunday, and later gets lost on his way to a restaurant. You learn to say what hurts, ask why, and understand directions well enough to follow them.</p>`,
  sounds: {
    title: 'Stress and long words',
    body: `<p>Native Swedish words usually stress the first syllable. Loanwords often stress the last one: <span lang="sv">apoTEK, hoTELL, restauRANG</span>. Long compounds are glued from shorter words, each keeping some of its stress. Break them into pieces and they stop being frightening.</p>`,
    items: [['en gata', 'a street', 'GAA-ta'], ['ett apotek', 'a pharmacy', 'a-poo-TAYK'], ['en restaurang', 'a restaurant', 'res-tu-RANG'], ['söndag', 'Sunday', 'SUN-da'], ['en huvudvärk', 'a headache', 'HOO-vud-vairk'], ['en huvudvärkstablett', 'a headache tablet', 'HOO-vud-vairks-tab-LETT']],
  },
  words: [
    { group: 'Feeling ill', items: [['ont', 'pain, hurting', 'oont'], ['huvudet', 'the head', 'hoo-vu-det'], ['halsen', 'the throat'], ['magen', 'the stomach', 'maa-gen'], ['foten', 'the foot', 'foo-ten'], ['feber', 'a fever'], ['sjuk', 'ill', 'hwook'], ['en tablett', 'a tablet'], ['ett apotek', 'a pharmacy', 'a-poo-TAYK']] },
    { group: 'Open or closed', items: [['öppet', 'open', 'up-pet'], ['stängt', 'closed', 'stengt'], ['varför', 'why', 'var-fur']] },
    { group: 'Directions', items: [['rakt fram', 'straight ahead'], ['till höger', 'to the right', 'hur-ger'], ['till vänster', 'to the left'], ['sväng', 'turn'], ['en korsning', 'a junction', 'kosh-ning'], ['ett trafikljus', 'a traffic light', 'tra-feek-yoos'], ['en bro', 'a bridge', 'broo'], ['en kyrka', 'a church', 'chür-ka'], ['en bank', 'a bank']] },
    { group: 'Position', items: [['bredvid', 'next to', 'bray-veed'], ['mittemot', 'opposite', 'mit-teh-moot'], ['bakom', 'behind'], ['framför', 'in front of', 'fram-fur'], ['nära', 'near', 'nair-ra'], ['vilse', 'lost']] },
    { group: 'Days of the week', items: [['måndag', 'Monday', 'mon-da'], ['tisdag', 'Tuesday', 'tees-da'], ['onsdag', 'Wednesday', 'oons-da'], ['torsdag', 'Thursday', 'toosh-da'], ['fredag', 'Friday', 'fray-da'], ['lördag', 'Saturday', 'lur-da'], ['söndag', 'Sunday', 'sun-da']] },
  ],
  sentences: [
    ['Hur mår du?', 'How are you feeling?'],
    ['Jag mår inte bra.', "I don't feel well."],
    ['Jag har ont i halsen.', 'I have a sore throat.'],
    ['Finns det ett apotek här?', 'Is there a pharmacy here?'],
    ['Det är stängt idag.', "It's closed today."],
    ['Varför det?', 'Why is that?'],
    ['Hur kommer jag dit?', 'How do I get there?'],
    ['Gå rakt fram till bron.', 'Go straight ahead to the bridge.'],
    ['Sväng vänster vid trafikljuset.', 'Turn left at the traffic light.'],
    ['Det ligger bredvid banken.', "It's next to the bank."],
    ['Jag har gått vilse.', 'I got lost.'],
    ['Är det långt härifrån?', 'Is it far from here?'],
  ],
  patternsTitle: 'what hurts, where things are',
  patternsBody: `<p><strong>Pain is something you have «in» a body part:</strong> <span lang="sv">Jag har ont i huvudet</span>, literally «I have pain in the head». Use the definite ending, not «my».</p>
    <p><strong><span lang="sv">Jo</span></strong> is a special yes: it answers a negative question. <span lang="sv">Har du inte feber? – Jo.</span> means «Don't you have a fever? – Yes, I do.» Buildings <span lang="sv">ligger</span>, literally «lie»: <span lang="sv">Det ligger bredvid banken.</span></p>`,
  patterns: [
    { frame: 'Jag har ont i {}.', en: 'My {} hurts.', options: [['huvudet', 'head'], ['halsen', 'throat'], ['magen', 'stomach'], ['foten', 'foot']] },
    { frame: 'Apoteket ligger {} banken.', en: 'The pharmacy is {} the bank.', options: [['bredvid', 'next to'], ['mittemot', 'opposite'], ['bakom', 'behind'], ['framför', 'in front of']] },
    { frame: 'Det är öppet på {}.', en: "It's open on {}.", options: [['måndag', 'Monday'], ['onsdag', 'Wednesday'], ['fredag', 'Friday'], ['lördag', 'Saturday']] },
  ],
  extra: [
    {
      title: 'Sentences: follow the directions',
      widget: directionsWidget,
      body: `<p>Asking the way is the easy part. The hard part is understanding the answer, at full speed, from a stranger. So here you only listen: hear a direction and tap where to go.</p>`,
      tryThis: `<p>Try to answer from the sound alone, without the slow version.</p>`,
    },
  ],
  build: [
    ['Jag har ont i halsen.', 'I have a sore throat.'],
    ['Finns det ett apotek här?', 'Is there a pharmacy here?'],
    ['Gå rakt fram till bron.', 'Go straight ahead to the bridge.'],
    ['Sväng vänster vid trafikljuset.', 'Turn left at the traffic light.'],
    ['Det ligger bredvid banken.', "It's next to the bank."],
    ['Hur kommer jag dit?', 'How do I get there?'],
  ],
  talks: [
    {
      title: 'a sore throat',
      scene: `<p>Sunday morning. Noah feels awful, and shops in Sweden keep shorter hours on Sundays.</p>`,
      cast: ['Elin', 'Noah'],
      lines: [
        ['Elin', 'Hej, Noah! Hur mår du?', 'Hi, Noah! How are you feeling?'],
        ['Noah', 'Inte bra. Jag har så ont i halsen.', 'Not good. My throat really hurts.'],
        ['Elin', 'Stackars dig! Har du feber?', 'Poor you! Do you have a fever?'],
        ['Noah', 'Nej, jag tror inte det. Finns det ett apotek här?', "No, I don't think so. Is there a pharmacy here?"],
        ['Elin', 'Ja, vid torget, men det är stängt idag.', "Yes, by the square, but it's closed today."],
        ['Noah', 'Varför det?', 'Why is that?'],
        ['Elin', 'Det är söndag. Men apoteket vid stationen har öppet.', "It's Sunday. But the pharmacy at the station is open."],
        ['Noah', 'Hur kommer jag dit?', 'How do I get there?'],
        ['Elin', 'Gå rakt fram till bron och sväng vänster.', 'Go straight ahead to the bridge and turn left.'],
        ['Noah', 'Är det långt härifrån?', 'Is it far from here?'],
        ['Elin', 'Nej, fem minuter. Jag följer med.', "No, five minutes. I'll come with you."],
        ['Noah', 'Tack, vad snällt!', 'Thanks, how kind!'],
      ],
    },
    {
      title: 'lost in Haga',
      scene: `<p>Better again, Noah is on his way to meet Johan for dinner and has taken a wrong turn. He calls for help.</p>`,
      cast: ['Johan', 'Noah'],
      lines: [
        ['Johan', 'Hallå, det är Johan.', "Hello, it's Johan."],
        ['Noah', 'Hej! Jag har gått vilse.', 'Hi! I got lost.'],
        ['Johan', 'Ingen fara. Var är du?', 'No worries. Where are you?'],
        ['Noah', 'Vid en stor kyrka. Hagakyrkan, tror jag.', 'At a big church. Hagakyrkan, I think.'],
        ['Johan', 'Bra, då är du nära! Ser du banken?', "Good, then you're close! Can you see the bank?"],
        ['Noah', 'Ja, den ligger mittemot kyrkan.', "Yes, it's opposite the church."],
        ['Johan', 'Gå förbi banken och sväng höger.', 'Go past the bank and turn right.'],
        ['Noah', 'Okej, och sedan?', 'Okay, and then?'],
        ['Johan', 'Följ gatan till trafikljuset. Restaurangen ligger där.', "Follow the street to the traffic light. The restaurant is there."],
        ['Noah', 'Hur långt är det?', 'How far is it?'],
        ['Johan', 'Ungefär tvåhundra meter.', 'About two hundred metres.'],
        ['Noah', 'Tack! Vi ses snart.', 'Thanks! See you soon.'],
      ],
    },
  ],
  notes: [
    '<strong>Pain goes «in» a body part:</strong> <span lang="sv">Jag har ont i magen.</span>',
    '<strong><span lang="sv">Jo</span> answers a negative question with yes.</strong>',
    '<strong>Buildings <span lang="sv">ligger</span>:</strong> <span lang="sv">Var ligger apoteket?</span>',
    '<strong>Listen for the key words:</strong> <span lang="sv">rakt fram, höger, vänster, vid</span>.',
  ],
});

// Lesson (en/sv): Swedish 4 – taxi, tram and telling the time
import { languageLesson } from '../../js/language.js';
import { h } from '../../js/lesson.js';
import { speak, stopSpeech } from '../../js/speech.js';

/* ---- Clock: the name of a time depends on where the minute hand sits ---- */
const HOURS = ['tolv', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva'];
function timeName(hour, min) {
  const now = HOURS[hour % 12], next = HOURS[(hour + 1) % 12];
  return {
    0: now, 5: `fem över ${now}`, 10: `tio över ${now}`, 15: `kvart över ${now}`, 20: `tjugo över ${now}`,
    25: `fem i halv ${next}`, 30: `halv ${next}`, 35: `fem över halv ${next}`,
    40: `tjugo i ${next}`, 45: `kvart i ${next}`, 50: `tio i ${next}`, 55: `fem i ${next}`,
  }[min];
}
const clockSentence = (hour, min) => `Klockan är ${timeName(hour, min)}.`;
function clockWidget(host) {
  let hour = 3, min = 30;
  host.appendChild(h(`<div class="clock-wrap">
    <svg viewBox="0 0 120 120" class="clock" aria-hidden="true">
      <circle cx="60" cy="60" r="56" class="clock-face"/>
      ${Array.from({ length: 12 }, (_, i) => `<line x1="60" y1="8" x2="60" y2="${i % 3 ? 13 : 17}" transform="rotate(${i * 30} 60 60)" class="clock-tick"/>`).join('')}
      <line x1="60" y1="60" x2="60" y2="30" class="clock-hour"/>
      <line x1="60" y1="60" x2="60" y2="16" class="clock-min"/>
      <circle cx="60" cy="60" r="3.5" class="clock-pin"/>
    </svg>
    <div class="clock-read">
      <div class="clock-digital"></div>
      <button class="clock-name pattern-line" lang="sv"></button>
      <div class="controls"><button class="btn primary say">🔊 Say it</button></div>
    </div>
  </div>
  <div class="sliders">
    <label>Hour <input type="range" class="sh" min="1" max="12" value="${hour}"></label>
    <label>Minutes <input type="range" class="sm" min="0" max="55" step="5" value="${min}"></label>
  </div>`));
  const $ = (s) => host.querySelector(s);
  const text = () => clockSentence(hour, min);
  function render() {
    $('.clock-hour').setAttribute('transform', `rotate(${(hour % 12) * 30 + min / 2} 60 60)`);
    $('.clock-min').setAttribute('transform', `rotate(${min * 6} 60 60)`);
    $('.clock-digital').textContent = `${hour}:${String(min).padStart(2, '0')}`;
    $('.clock-name').textContent = timeName(hour, min);
  }
  $('.sh').oninput = (e) => { hour = +e.target.value; render(); };
  $('.sm').oninput = (e) => { min = +e.target.value; render(); };
  $('.say').onclick = () => speak(text());
  $('.clock-name').onclick = () => speak(text());
  render();
  return { destroy: stopSpeech };
}

export default languageLesson({
  id: 'sv-04', n: 4, courseTitle: 'Swedish 4: Vart ska du?',
  title: 'Vart ska du? Getting around',
  extraPhrases: Array.from({ length: 12 }, (_, h) => Array.from({ length: 12 }, (_, m) => clockSentence(h + 1, m * 5))).flat(),
  scene: `<p>A taxi from the station in the rain, then a tram out to the coast. Gothenburg moves on trams, <span lang="sv">spårvagnar</span>; in Stockholm you would use the metro, <span lang="sv">tunnelbanan</span>. You also learn to tell the time, including the one that catches everyone: <span lang="sv">halv fyra</span>.</p>`,
  sounds: {
    title: 'Two sounds for one g',
    body: `<p>The letter <span lang="sv">g</span> works like <span lang="sv">k</span>. Before <span lang="sv">a, o, u, å</span> it is hard, as in <em>go</em>. Before <span lang="sv">e, i, y, ä, ö</span> it turns into a «y» sound. That is why Gothenburg, <span lang="sv">Göteborg</span>, starts with a «y».</p>`,
    items: [['en gata', 'a street', 'gaa-ta'], ['går', 'go, walk', 'gor'], ['Göteborg', 'Gothenburg', 'yur-teh-bory'], ['göra', 'to do', 'yur-ra'], ['gärna', 'gladly', 'yair-na'], ['ge', 'to give', 'yay']],
  },
  words: [
    { group: 'Getting around', items: [['en taxi', 'a taxi'], ['en spårvagn', 'a tram', 'spor-vangn'], ['en tunnelbana', 'a metro'], ['en buss', 'a bus'], ['en hållplats', 'a stop', 'hol-plats'], ['en biljett', 'a ticket', 'bil-yett'], ['en väska', 'a bag'], ['ett kvitto', 'a receipt'], ['en adress', 'an address'], ['trafik', 'traffic']] },
    { group: 'Where and where to', items: [['var', 'where (at)', 'vaar'], ['vart', 'where to', 'vart'], ['hit', 'to here'], ['dit', 'to there'], ['till', 'to'], ['från', 'from', 'frawn'], ['långt', 'far', 'longt'], ['nära', 'near', 'nair-ra']] },
    { group: 'Time', items: [['klockan', 'the time, o’clock'], ['en timme', 'an hour'], ['en halvtimme', 'half an hour'], ['en minut', 'a minute'], ['kvart', 'a quarter'], ['halv', 'half'], ['över', 'past', 'ur-ver'], ['försenad', 'delayed', 'fur-shay-nad']] },
    { group: 'Verbs', items: [['åker', 'travel, go (by vehicle)', 'aw-ker'], ['kör', 'drive', 'chur'], ['går', 'walk, leave (a tram)', 'gor'], ['stannar', 'stop'], ['tar', 'take'], ['ska', 'am going to']] },
  ],
  sentences: [
    ['Vart ska du?', 'Where are you going?'],
    ['Kan du köra mig till hotellet?', 'Can you drive me to the hotel?'],
    ['Hur lång tid tar det?', 'How long does it take?'],
    ['Är det långt?', 'Is it far?'],
    ['Du kan stanna här.', 'You can stop here.'],
    ['Kan jag betala med kort?', 'Can I pay by card?'],
    ['Kan jag få ett kvitto?', 'Can I have a receipt?'],
    ['Vad är klockan?', 'What time is it?'],
    ['Klockan är halv fyra.', "It's half past three."],
    ['Går den här spårvagnen till Saltholmen?', 'Does this tram go to Saltholmen?'],
    ['När går nästa spårvagn?', 'When does the next tram leave?'],
    ['Var köper man biljett?', 'Where do you buy a ticket?'],
  ],
  patternsTitle: 'where, and where to',
  patternsBody: `<p><strong><span lang="sv">Var</span> is location, <span lang="sv">vart</span> is direction.</strong> <span lang="sv">Var bor du?</span> asks where you live, <span lang="sv">Vart ska du?</span> asks where you are headed. Swedish often drops the verb of motion after <span lang="sv">ska</span>.</p>
    <p><strong><span lang="sv">Åker</span> or <span lang="sv">går</span>?</strong> You <span lang="sv">åker</span> in a vehicle and <span lang="sv">går</span> on foot, but a tram or a boat itself <span lang="sv">går</span> as well.</p>`,
  patterns: [
    { frame: 'Jag ska till {}.', en: "I'm going to {}.", options: [['hotellet', 'the hotel'], ['Saltholmen', 'Saltholmen'], ['stationen', 'the station'], ['Liseberg', 'Liseberg']] },
    { frame: 'Var är {}?', en: 'Where is {}?', options: [['hållplatsen', 'the stop'], ['stationen', 'the station'], ['min väska', 'my bag']] },
    { frame: 'Jag åker {}.', en: "I'm going {}.", options: [['taxi', 'by taxi'], ['spårvagn', 'by tram'], ['buss', 'by bus'], ['tunnelbana', 'by metro']] },
  ],
  extra: [
    {
      title: 'Sentences: telling the time',
      widget: clockWidget,
      body: `<p>This is where the slider earns its place, because the <strong>name of a time depends on the half hour</strong>. <span lang="sv">Halv fyra</span> is not half past four: it is half way <em>to</em> four, so 3:30.</p>
        <p>From :25 on, Swedish counts around that half: <span lang="sv">fem i halv fyra</span> is 3:25, <span lang="sv">fem över halv fyra</span> is 3:35. After that it counts towards the next hour.</p>`,
      tryThis: `<p>Move the minutes from 20 to 40 and watch the hour in the name jump ahead. Then set the time it is right now and say it.</p>`,
    },
  ],
  build: [
    ['Kan du köra mig till hotellet?', 'Can you drive me to the hotel?'],
    ['Hur lång tid tar det?', 'How long does it take?'],
    ['Klockan är halv fyra.', "It's half past three."],
    ['Kan jag betala med kort?', 'Can I pay by card?'],
    ['När går nästa spårvagn?', 'When does the next tram leave?'],
    ['Jag ska till stationen.', "I'm going to the station."],
  ],
  talks: [
    {
      title: 'a taxi in the rain',
      scene: `<p>Noah steps out of the central station with a heavy bag and flags down a taxi.</p>`,
      cast: ['Förare', 'Noah'],
      lines: [
        ['Förare', 'Hej! Vart ska du?', 'Hi! Where are you going?'],
        ['Noah', 'Till Hotell Hamnen, tack. Här är adressen.', "To Hotel Hamnen, please. Here's the address."],
        ['Förare', 'Inga problem. Ska jag ta väskan?', 'No problem. Shall I take the bag?'],
        ['Noah', 'Ja, tack. Den är tung.', "Yes, thanks. It's heavy."],
        ['Noah', 'Hur lång tid tar det?', 'How long does it take?'],
        ['Förare', 'Tio minuter, om det inte är mycket trafik.', "Ten minutes, if there isn't much traffic."],
        ['Noah', 'Regnar det alltid här?', 'Does it always rain here?'],
        ['Förare', 'Nej, inte alltid. Bara ibland!', 'No, not always. Only sometimes!'],
        ['', 'Ten minutes later.'],
        ['Förare', 'Det blir hundrasextio kronor.', "That's one hundred and sixty kronor."],
        ['Noah', 'Kan jag betala med kort?', 'Can I pay by card?'],
        ['Förare', 'Javisst. Vill du ha kvitto?', 'Of course. Would you like a receipt?'],
        ['Noah', 'Ja, tack. Hej då!', 'Yes, please. Goodbye!'],
      ],
    },
    {
      title: 'which tram?',
      scene: `<p>Noah wants to reach the boats at Saltholmen and asks someone waiting at the stop.</p>`,
      cast: ['Kvinna', 'Noah'],
      lines: [
        ['Noah', 'Ursäkta, går den här spårvagnen till Saltholmen?', 'Excuse me, does this tram go to Saltholmen?'],
        ['Kvinna', 'Nej, du ska ta elvan.', 'No, you need to take the eleven.'],
        ['Noah', 'När går den?', 'When does it leave?'],
        ['Kvinna', 'Om fem minuter. Klockan är tio i tolv.', "In five minutes. It's ten to twelve."],
        ['Noah', 'Var köper man biljett?', 'Where do you buy a ticket?'],
        ['Kvinna', 'I appen, eller i automaten där borta.', 'In the app, or from the machine over there.'],
        ['Noah', 'Är det långt till Saltholmen?', 'Is it far to Saltholmen?'],
        ['Kvinna', 'Nej, ungefär en halvtimme.', 'No, about half an hour.'],
        ['Noah', 'Tack för hjälpen!', 'Thanks for your help!'],
        ['Kvinna', 'Ingen orsak. Trevlig resa!', 'No problem. Have a nice trip!'],
      ],
    },
  ],
  notes: [
    '<strong><span lang="sv">Var</span> is where, <span lang="sv">vart</span> is where to.</strong>',
    '<strong><span lang="sv">Halv fyra</span> is 3:30,</strong> half way to four.',
    '<strong>Soft g before e, i, y, ä, ö:</strong> <span lang="sv">Göteborg, gärna</span>.',
    '<strong><span lang="sv">Kan jag …?</span></strong> covers most requests: pay, get a receipt, get off here.',
  ],
});

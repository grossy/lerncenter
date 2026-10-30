// Lesson (en/sv): Swedish 5 – shopping and big numbers
import { languageLesson } from '../../js/language.js';
import { h } from '../../js/lesson.js';
import { speakParts, stopSpeech } from '../../js/speech.js';

/* ---- Price: Swedish numbers are built by gluing the parts together ---- */
const ONES = ['', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio'];
const TENS = ['', 'tio', 'tjugo', 'trettio', 'fyrtio', 'femtio', 'sextio', 'sjuttio', 'åttio', 'nittio'];
const TEENS = ['tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton'];
function numberParts(hundreds, tens, ones) {
  const parts = [];
  if (hundreds === 1) parts.push(['hundra', 'h']);
  else if (hundreds > 1) parts.push([ONES[hundreds], 'c'], ['hundra', 'h']);
  if (tens === 1) parts.push([TEENS[ones], 't']);
  else {
    if (tens) parts.push([TENS[tens], 't']);
    if (ones) parts.push([ONES[ones], 'o']);
  }
  return parts;
}
// A price is spoken from recorded pieces, so 1000 prices need about 110 recordings.
const hundredsWord = (hu) => (hu ? numberParts(hu, 0, 0).map((p) => p[0]).join('') : null);
const restWord = (te, on) => (te || on ? numberParts(0, te, on).map((p) => p[0]).join('') : null);
function pricePieces(hu, te, on) {
  const value = hu * 100 + te * 10 + on;
  if (value === 0) return ['Det är gratis.'];
  if (value === 1) return ['Det kostar en krona.'];
  return ['Det kostar', hundredsWord(hu), restWord(te, on), 'kronor.'].filter(Boolean);
}
const PRICE_PIECES = [
  'Det är gratis.', 'Det kostar en krona.', 'Det kostar', 'kronor.',
  ...Array.from({ length: 9 }, (_, i) => hundredsWord(i + 1)),
  ...Array.from({ length: 99 }, (_, i) => restWord(Math.floor((i + 1) / 10), (i + 1) % 10)),
];
function priceWidget(host) {
  let hu = 2, te = 3, on = 5;
  host.appendChild(h(`<div>
    <div class="price-digits"></div>
    <button class="price-word pattern-line" lang="sv"></button>
    <div class="controls"><button class="btn primary say">🔊 Say the price</button></div>
    <div class="sliders">
      <label>Hundreds <input type="range" class="sh" min="0" max="9" value="${hu}"></label>
      <label>Tens <input type="range" class="st" min="0" max="9" value="${te}"></label>
      <label>Ones <input type="range" class="so" min="0" max="9" value="${on}"></label>
    </div>
  </div>`));
  const $ = (s) => host.querySelector(s);
  const value = () => hu * 100 + te * 10 + on;
  const say = () => speakParts(pricePieces(hu, te, on));
  function render() {
    $('.price-digits').textContent = `${value()} kr`;
    const parts = numberParts(hu, te, on);
    $('.price-word').innerHTML = parts.length ? parts.map(([w, c]) => `<span class="np np-${c}">${w}</span>`).join('') : 'gratis';
  }
  $('.sh').oninput = (e) => { hu = +e.target.value; render(); };
  $('.st').oninput = (e) => { te = +e.target.value; render(); };
  $('.so').oninput = (e) => { on = +e.target.value; render(); };
  $('.say').onclick = say;
  $('.price-word').onclick = say;
  render();
  return { destroy: stopSpeech };
}

export default languageLesson({
  id: 'sv-05', n: 5, courseTitle: 'Swedish 5: I affären',
  title: 'I affären: shopping',
  extraPhrases: PRICE_PIECES,
  scene: `<p>Picnic supplies at the supermarket, then a rain jacket, because this is Gothenburg. You learn to find things, ask about sizes and colours, understand prices of any size, and meet the past tense in passing.</p>`,
  sounds: {
    title: 'The sj sound',
    body: `<p>Swedish has a soft, breathy sound with no exact English match, somewhere between «sh» and a whispered «hw». It can be spelled <span lang="sv">sj, skj, stj</span>, and <span lang="sv">sk</span> before <span lang="sv">e, i, y, ä, ö</span>. Copy it from the audio rather than from a description.</p>`,
    items: [['sju', 'seven', 'hwoo'], ['en skjorta', 'a shirt', 'hwoor-ta'], ['skön', 'comfortable', 'hwurn'], ['en stjärna', 'a star', 'hwair-na'], ['sjuk', 'ill', 'hwook'], ['ett sjukhus', 'a hospital', 'hwook-hoos']],
  },
  words: [
    { group: 'In the shop', items: [['en affär', 'a shop', 'a-fair'], ['en kassa', 'a till'], ['en påse', 'a bag', 'paw-seh'], ['ett kvitto', 'a receipt'], ['ett paket', 'a packet'], ['en storlek', 'a size'], ['till höger', 'on the right', 'hur-ger'], ['till vänster', 'on the left'], ['här borta', 'over here'], ['där borta', 'over there']] },
    { group: 'Food', items: [['ost', 'cheese', 'oost'], ['bröd', 'bread', 'brurd'], ['mjölk', 'milk', 'myulk'], ['räkor', 'prawns', 'rair-kor'], ['ett äpple', 'an apple'], ['glass', 'ice cream']] },
    { group: 'Clothes and colours', items: [['en jacka', 'a jacket', 'yak-ka'], ['en tröja', 'a sweater', 'trur-ya'], ['en skjorta', 'a shirt', 'hwoor-ta'], ['en kjol', 'a skirt', 'chool'], ['byxor', 'trousers', 'bük-sor'], ['skor', 'shoes', 'skoor'], ['röd', 'red', 'rurd'], ['blå', 'blue', 'blaw'], ['svart', 'black'], ['vit', 'white', 'veet'], ['grön', 'green', 'grurn']] },
    { group: 'Verbs', items: [['köper', 'buy', 'chur-per'], ['letar efter', 'look for'], ['hittar', 'find'], ['provar', 'try on'], ['passar', 'fit'], ['säljer', 'sell', 'sel-yer']] },
  ],
  sentences: [
    ['Ursäkta, var hittar jag ost?', 'Excuse me, where can I find cheese?'],
    ['Där borta till vänster.', 'Over there on the left.'],
    ['Har ni räkor?', 'Do you have prawns?'],
    ['Hittade du allt?', 'Did you find everything?'],
    ['Vill du ha en påse?', 'Would you like a bag?'],
    ['Kan jag hjälpa dig?', 'Can I help you?'],
    ['Jag letar efter en jacka.', "I'm looking for a jacket."],
    ['Vilken storlek har du?', 'What size are you?'],
    ['Kan jag prova den?', 'Can I try it on?'],
    ['Den är för liten.', "It's too small."],
    ['Vad kostar den här?', 'How much is this one?'],
    ['Jag tar den.', "I'll take it."],
  ],
  patternsTitle: 'looking for things',
  patternsBody: `<p><strong>Colours agree with the noun.</strong> <span lang="sv">En röd jacka</span>, but <span lang="sv">ett rött äpple</span>: an <span lang="sv">ett</span> word usually adds a <span lang="sv">-t</span>. <span lang="sv">Den</span> stands in for an <span lang="sv">en</span> word, <span lang="sv">det</span> for an <span lang="sv">ett</span> word.</p>
    <p><strong>The past tense</strong> of many verbs ends in <span lang="sv">-ade</span>: <span lang="sv">hittar</span> becomes <span lang="sv">hittade</span>, as in <span lang="sv">Hittade du allt?</span></p>`,
  patterns: [
    { frame: 'Jag letar efter {}.', en: "I'm looking for {}.", options: [['en jacka', 'a jacket'], ['en tröja', 'a sweater'], ['ett par skor', 'a pair of shoes'], ['byxor', 'trousers']] },
    { frame: 'Den är för {}.', en: "It's too {}.", options: [['liten', 'small'], ['stor', 'big'], ['dyr', 'expensive'], ['lång', 'long']] },
    { frame: 'Har ni den i {}?', en: 'Do you have it in {}?', options: [['svart', 'black'], ['blått', 'blue'], ['rött', 'red'], ['vitt', 'white']] },
  ],
  extra: [
    {
      title: 'Sentences: prices of any size',
      widget: priceWidget,
      body: `<p>Swedish builds numbers like a kit, and writes them as <strong>one long word</strong>: <span lang="sv">två + hundra + trettio + fem</span> gives <span lang="sv">tvåhundratrettiofem</span>. The ones come last, unlike German.</p>
        <p>You will hear shortened forms too: <span lang="sv">trettio</span> is often «tretti», and <span lang="sv">fyrtio</span> often «förti».</p>`,
      tryThis: `<p>Set a price and read it aloud before you press the button. Try 21, 115 and 999. Notice how 10 to 19 have names of their own.</p>`,
    },
  ],
  build: [
    ['Ursäkta, var hittar jag ost?', 'Excuse me, where can I find cheese?'],
    ['Jag letar efter en jacka.', "I'm looking for a jacket."],
    ['Kan jag prova den?', 'Can I try it on?'],
    ['Vad kostar den här?', 'How much is this one?'],
    ['Hittade du allt?', 'Did you find everything?'],
    ['Den är för liten.', "It's too small."],
  ],
  talks: [
    {
      title: 'picnic shopping',
      scene: `<p>Noah is buying lunch for a day out, and in Gothenburg that means prawns.</p>`,
      cast: ['Personal', 'Noah'],
      lines: [
        ['Noah', 'Ursäkta, var hittar jag ost?', 'Excuse me, where can I find cheese?'],
        ['Personal', 'Där borta till vänster.', 'Over there on the left.'],
        ['Noah', 'Och bröd?', 'And bread?'],
        ['Personal', 'Brödet finns här borta till höger.', 'The bread is over here on the right.'],
        ['Noah', 'Har ni räkor?', 'Do you have prawns?'],
        ['Personal', 'Ja, i kylen bakom dig.', 'Yes, in the fridge behind you.'],
        ['', 'At the till.'],
        ['Personal', 'Hittade du allt?', 'Did you find everything?'],
        ['Noah', 'Ja, tack.', 'Yes, thanks.'],
        ['Personal', 'Vill du ha en påse?', 'Would you like a bag?'],
        ['Noah', 'Ja, en stor, tack.', 'Yes, a big one, please.'],
        ['Personal', 'Det blir tvåhundrafemtio kronor.', "That's two hundred and fifty kronor."],
        ['Noah', 'Varsågod.', 'Here you are.'],
        ['Personal', 'Tack, ha en bra dag!', 'Thanks, have a good day!'],
      ],
    },
    {
      title: 'a rain jacket',
      scene: `<p>Two soaked days later, Noah gives in and goes looking for a proper jacket.</p>`,
      cast: ['Personal', 'Noah'],
      lines: [
        ['Personal', 'Hej! Kan jag hjälpa dig?', 'Hi! Can I help you?'],
        ['Noah', 'Ja, jag letar efter en regnjacka.', "Yes, I'm looking for a rain jacket."],
        ['Personal', 'Vilken färg vill du ha?', 'What colour would you like?'],
        ['Noah', 'Blå eller svart.', 'Blue or black.'],
        ['Personal', 'Den här är fin. Vilken storlek har du?', 'This one is nice. What size are you?'],
        ['Noah', 'Medium, tror jag. Kan jag prova den?', 'Medium, I think. Can I try it on?'],
        ['Personal', 'Javisst, provrummet är där.', 'Of course, the fitting room is there.'],
        ['', 'A minute later.'],
        ['Personal', 'Passar den?', 'Does it fit?'],
        ['Noah', 'Nej, den är för liten.', "No, it's too small."],
        ['Personal', 'Här är en större.', "Here's a bigger one."],
        ['Noah', 'Ja, den är perfekt. Jag tar den!', "Yes, it's perfect. I'll take it!"],
      ],
    },
  ],
  notes: [
    '<strong>Numbers are glued together:</strong> <span lang="sv">tvåhundratrettiofem</span>.',
    '<strong>Colours agree:</strong> <span lang="sv">en röd jacka, ett rött äpple</span>.',
    '<strong><span lang="sv">Den</span> and <span lang="sv">det</span> both mean «it»,</strong> matching the noun.',
    '<strong><span lang="sv">Jag letar efter …</span></strong> gets you started in any shop.',
  ],
});

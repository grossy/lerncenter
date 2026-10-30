#!/usr/bin/env python3
"""Renders every Swedish phrase of the Daemon lessons with the Piper voice «Alma» into daemon/audio/sv/.

File names are the FNV-1a hash of the text, the same calculation as clipName() in js/speech.js.
Needs a Python environment with piper-tts, plus ffmpeg and node:

  ESPEAK_DATA_PATH=<espeak dir> python tools/build_speech.py <sv_SE-alma-medium.onnx> [--force] [--phonemes]

eSpeak's Swedish rules stress many loanwords wrongly and read some short vowels as long, so PHONEMES
below corrects those words. Run with --phonemes to print the result instead of rendering.
"""
import json
import re
import subprocess
import sys
import tempfile
import unicodedata
import wave
from pathlib import Path

from piper import PiperVoice

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'daemon' / 'audio' / 'sv'

PHONEMES = {
    # function words as spoken in everyday Swedish
    'jag': 'jɑː', 'och': 'ɔ', 'sedan': 'sˈɛn', 'ett': 'ɛt',
    # weekdays lose the g
    'måndag': 'mˈɔnda', 'tisdag': 'tˈiːsda', 'onsdag': 'ˈʊnsda', 'torsdag': 'tˈuːʂda', 'fredag': 'frˈeːda', 'lördag': 'lˈøːɖa', 'söndag': 'sˈœnda',
    'idag': 'ɪdˈɑː', 'middag': 'mˈɪda',
    # stress on the last syllable, mostly loanwords
    'adress': 'adrˈɛs', 'adressen': 'adrˈɛsən', 'apotek': 'apʊtˈeːk', 'apoteket': 'apʊtˈeːkət', 'automaten': 'aʉtʊmˈɑːtən', 'avenyn': 'avənˈyːn',
    'bassäng': 'basˈɛŋ', 'biljett': 'bɪljˈɛt', 'biljetter': 'bɪljˈɛtər', 'spårvagnsbiljetten': 'spˈoːrvaŋnsbɪljˌɛtən',
    'hotell': 'hʊtˈɛl', 'hotellet': 'hʊtˈɛlət', 'hallå': 'halˈoː', 'karusell': 'karʉːsˈɛl', 'konsert': 'kɔnsˈɛːr', 'minut': 'mɪnˈʉːt', 'minuter': 'mɪnˈʉːtər',
    'museum': 'mʉːsˈeːɵm', 'okej': 'ɔkˈɛj', 'perfekt': 'pɛrfˈɛkt', 'populärt': 'pɔpɵlˈɛːʈ', 'present': 'prɛsˈɛnt', 'promenad': 'prʊmənˈɑːd',
    'restaurangen': 'rɛstɔrˈaŋən', 'student': 'stʉːdˈɛnt', 'studerar': 'stʉːdˈeːrar', 'tablett': 'tablˈɛt', 'vegetarisk': 'vɛɡətˈɑːrɪsk', 'vegetariskt': 'vɛɡətˈɑːrɪskt',
    'pariserhjul': 'parˈiːsərjˌʉːl', 'pariserhjulet': 'parˈiːsərjˌʉːlət', 'javisst': 'jɑːvˈɪst', 'varsågod': 'vaʂɔɡˈuːd',
    'bredvid': 'brɛvˈiːd', 'förbi': 'fœrbˈiː', 'förlåt': 'fœɭˈoːt', 'försenad': 'fœʂˈeːnad', 'föräldrar': 'fœrˈɛldrar',
    'ibland': 'ɪblˈand', 'ifrån': 'ɪfrˈoːn', 'igen': 'ɪjˈɛn', 'ikväll': 'ɪkvˈɛl', 'imorgon': 'ɪmˈɔrɔn', 'istället': 'ɪstˈɛlət',
    'ursäkta': 'ʉːʂˈɛkta', 'undervisar': 'ɵndərvˈiːsar', 'ungefär': 'ɵŋəfˈɛːr', 'kanelbulle': 'kanˈeːlbˌɵlə',
    # wrong vowel length or wrong vowel
    'fem': 'fˈɛm', 'lång': 'lˈɔŋ', 'rum': 'rˈɵm', 'enkelrum': 'ˈɛŋkəlrˌɵm', 'omklädningsrum': 'ˈɔmklɛːdnɪŋsrˌɵm', 'bada': 'bˈɑːda', 'badar': 'bˈɑːdar',
    'badbyxor': 'bˈɑːdbyksʊr', 'byxor': 'bˈyksʊr', 'baddräkt': 'bˈɑːdrɛkt', 'valhallabadet': 'valhˈalabˌɑːdət', 'dalbana': 'dˈɑːlbˌɑːna', 'tunnelbana': 'tˈɵnəlbˌɑːna',
    'frukost': 'frˈʉːkɔst', 'grader': 'ɡrˈɑːdər', 'grattis': 'ɡrˈatɪs', 'kaka': 'kˈɑːka', 'ljus': 'jˈʉːs', 'trafikljus': 'trafˈiːkjʉːs', 'trafikljuset': 'trafˈiːkjʉːsət',
    'trevlig': 'trˈeːvlɪɡ', 'trevligt': 'trˈeːvlɪt', 'tröja': 'trˈœja', 'vas': 'vˈɑːs', 'vädret': 'vˈɛːdrət', 'högt': 'hˈœkt', 'styrsö': 'stˈyːʂøː', 'syster': 'sˈystər',
    'storlek': 'stˈuːɭeːk', 'kort': 'kˈɔʈ', 'fjorton': 'fjˈuːʈɔn', 'fortsätt': 'fˈɔʈsɛt', 'gjorde': 'jˈuːɖə', 'skjorta': 'ɧˈuːʈa',
    'huvudet': 'hˈʉːvɵdət', 'regnar': 'rˈɛŋnar', 'regnjacka': 'rˈɛŋnjˌaka', 'havremjölk': 'hˈɑːvrəmjˌœlk', 'hagakyrkan': 'hˈɑːɡaɕˌyrkan', 'mölndal': 'mˈœlndɑːl',
    'medium': 'mˈeːdɪɵm', 'noah': 'nˈuːa', 'keller': 'kˈɛlər', 'schweiz': 'ɧvˈɛjts', 'taxin': 'tˈaksɪn', 'liten': 'lˈiːtən', 'litet': 'lˈiːtət',
    'någon': 'nˈoːɡɔn', 'något': 'nˈoːɡɔt', 'några': 'nˈoːɡra', 'väldigt': 'vˈɛldɪt', 'välkommen': 'vˈɛlkɔmən', 'varit': 'vˈɑːrɪt', 'vatten': 'vˈatən', 'vattnet': 'vˈatnət',
    'kanske': 'kˈanɧə', 'inte': 'ˈɪntə', 'ingår': 'ˈɪŋɡoːr', 'varför': 'vˈarfœr', 'äntligen': 'ˈɛntlɪɡən', 'äpple': 'ˈɛplə', 'åldersgräns': 'ˈɔldəʂɡrˌɛns',
    'födelsedag': 'fˈøːlsədˌɑːɡ', 'födelsedagen': 'fˈøːlsədˌɑːɡən', 'billigare': 'bˈɪlɪɡarə', 'tjugo': 'ɕˈʉːɡʊ',
}

# Compound numbers: eSpeak reads «femtionio» with the -tion- of «station», so they are composed here.
ONES = {'en': 'ˌɛn', 'två': 'tvˌoː', 'tre': 'trˌeː', 'fyra': 'fˌyːra', 'fem': 'fˌɛm', 'sex': 'sˌɛks', 'sju': 'ɧˌʉː', 'åtta': 'ˌɔta', 'nio': 'nˌiːʊ'}
TENS = {'tjugo': 'ɕˈʉːɡʊ', 'trettio': 'trˈɛtɪ', 'fyrtio': 'fˈœʈɪ', 'femtio': 'fˈɛmtɪ', 'sextio': 'sˈɛkstɪ', 'sjuttio': 'ɧˈɵtɪ', 'åttio': 'ˈɔtɪ', 'nittio': 'nˈɪtɪ'}
TEENS = {'tio': 'tˈiːʊ', 'elva': 'ˈɛlva', 'tolv': 'tˈɔlv', 'tretton': 'trˈɛtɔn', 'fjorton': 'fjˈuːʈɔn', 'femton': 'fˈɛmtɔn', 'sexton': 'sˈɛkstɔn', 'sjutton': 'ɧˈɵtɔn', 'arton': 'ˈɑːʈɔn', 'nitton': 'nˈɪtɔn'}
HUNDREDS = {'': 'hˈɵndra', 'två': 'tvˈoːhɵndra', 'tre': 'trˈeːhɵndra', 'fyra': 'fˈyːrahɵndra', 'fem': 'fˈɛmhɵndra', 'sex': 'sˈɛkshɵndra', 'sju': 'ɧˈʉːhɵndra', 'åtta': 'ˈɔtahɵndra', 'nio': 'nˈiːʊhɵndra'}


def rest_phonemes(word):
    if word in TEENS:
        return TEENS[word]
    for tens, p in TENS.items():
        if word == tens:
            return p
        if word.startswith(tens) and word[len(tens):] in ONES:
            return p + ONES[word[len(tens):]]
    return None


def number_phonemes(word):
    rest = rest_phonemes(word)
    if rest:
        return rest
    match = re.fullmatch(r'(två|tre|fyra|fem|sex|sju|åtta|nio)?hundra(.*)', word)
    if match:
        hundreds = HUNDREDS[match.group(1) or '']
        if not match.group(2):
            return hundreds
        tail = rest_phonemes(match.group(2)) or ONES.get(match.group(2))
        if tail:
            return hundreds + tail
    return None


def speakable(text):
    """Replaces corrected words in a phrase with Piper's raw phoneme syntax."""
    def repl(m):
        word = m.group(0).lower()
        fix = PHONEMES.get(word) or number_phonemes(word)
        return f'[[ {fix} ]]' if fix else m.group(0)
    return re.sub(r'[^\W\d_]+', repl, text)


def clip_name(text):
    h = 0x811c9dc5
    for b in unicodedata.normalize('NFC', text).encode('utf-8'):
        h = ((h ^ b) * 0x01000193) & 0xffffffff
    return f'{h:08x}.m4a'


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    force, show = '--force' in sys.argv, '--phonemes' in sys.argv
    phrases = json.loads(subprocess.run(['node', str(ROOT / 'tools' / 'speech_phrases.mjs')], check=True, capture_output=True, text=True).stdout)
    names = {}
    for p in phrases:
        name = clip_name(p)
        if name in names:
            raise SystemExit(f'Hash collision: {p!r} and {names[name]!r}')
        names[name] = p

    voice = PiperVoice.load(args[0])
    known = set(voice.config.phoneme_id_map)
    for word, p in {**PHONEMES, **ONES, **TENS, **TEENS, **HUNDREDS}.items():
        bad = set(p) - known
        if bad:
            raise SystemExit(f'{word}: unknown phonemes {bad}')
    if show:
        for p in phrases:
            print(p, '=', speakable(p))
        return

    OUT.mkdir(parents=True, exist_ok=True)
    for stale in OUT.glob('*.m4a'):
        if stale.name not in names:
            stale.unlink()
    trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.06'
    done = 0
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / 'clip.wav'
        for name, phrase in names.items():
            target = OUT / name
            if target.exists() and not force:
                continue
            with wave.open(str(wav), 'wb') as w:
                voice.synthesize_wav(speakable(phrase), w)
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav), '-af', trim, '-ac', '1', '-c:a', 'aac', '-b:a', '48k', '-movflags', '+faststart', str(target)], check=True, stdin=subprocess.DEVNULL)
            done += 1
    print(f'{len(names)} phrases, {done} rendered')


if __name__ == '__main__':
    main()

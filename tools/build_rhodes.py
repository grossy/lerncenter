#!/usr/bin/env python3
"""Macht aus den Rhodes-Aufnahmen in `dev import/Rhodes/` die Dateien in `audio/rhodes/`.

Jede Datei heisst nach ihrer echten Tonhöhe (MIDI). Die Dateinamen der Aufnahmen folgen Abletons Zählung (C3 = MIDI 60).
Geschnitten wird der Vorlauf vor dem Anschlag, am Ende klingt der Ton in einer Sekunde aus, damit er nicht abbricht.
Braucht ffmpeg mit libmp3lame.
"""
import array
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'dev import' / 'Rhodes'
TARGET = ROOT / 'audio' / 'rhodes'
RATE = 48000
PEAK = 0.84  # alle Aufnahmen werden um denselben Betrag angehoben, das Verhältnis der Töne bleibt
FADE = 1.0

# RhodesC5.wav fehlt absichtlich: Die Aufnahme klingt eine Oktave zu hoch (C6 statt C5).
NOTES = {
    36: 'C1', 40: 'E1', 45: 'A1',
    48: 'C2', 52: 'E2', 57: 'A2',
    60: 'C3', 64: 'E3', 69: 'A3',
    72: 'C4', 76: 'E4', 81: 'A4',
    88: 'E5', 93: 'A5',
}


def samples(path):
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(RATE), '-f', 'f32le', '-'],
        capture_output=True, check=True,
    ).stdout
    data = array.array('f')
    data.frombytes(raw)
    return data


def main():
    TARGET.mkdir(parents=True, exist_ok=True)
    loudest = max(max(abs(v) for v in samples(SOURCE / f'Rhodes{n}.wav')) for n in NOTES.values())
    for midi, name in NOTES.items():
        path = SOURCE / f'Rhodes{name}.wav'
        data = samples(path)
        peak = max(abs(v) for v in data)
        first = next(i for i, v in enumerate(data) if abs(v) > peak * 0.05)
        start = max(0, first / RATE - 0.001)
        length = len(data) / RATE - start
        chain = ','.join([
            f'atrim=start={start:.5f}', 'asetpts=N/SR/TB',
            'afade=t=in:d=0.001',
            f'afade=t=out:st={length - FADE:.3f}:d={FADE}',
            f'volume={PEAK / loudest:.5f}',
        ])
        subprocess.run(
            ['ffmpeg', '-v', 'error', '-y', '-i', str(path), '-af', chain, '-ac', '1', '-ar', str(RATE),
             '-c:a', 'libmp3lame', '-b:a', '128k', str(TARGET / f'{midi}.mp3')],
            check=True,
        )
        print(f'{midi}.mp3  aus {path.name}, {start * 1000:.1f} ms Vorlauf geschnitten')


if __name__ == '__main__':
    main()

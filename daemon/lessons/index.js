// Daemon catalog: adult lessons, English. Kept apart from the kids' catalog in js/lessons/index.js.
export const catalog = [
  {
    id: 'harmonic-shift',
    title: 'One Vibe, Two Colours',
    subject: 'Music',
    emoji: '🎹',
    color: 'c-adult',
    description: 'Am11 to Fmaj9♯11: shift the colour of a chord without changing the chord, then land it with a deceptive cadence.',
    available: true,
    load: () => import('./harmonic-shift.js'),
  },
  {
    id: 'constellations',
    title: 'Harmonic Constellations',
    subject: 'Music',
    emoji: '✨',
    color: 'c-adult',
    description: 'Arpeggiated chords in C minor, voice leading, and a progression nested inside one arpeggiated chord.',
    available: true,
    load: () => import('./constellations.js'),
  },
];

export const lessons = Object.fromEntries(catalog.filter((l) => l.load).map((l) => [l.id, l.load]));

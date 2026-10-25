// Katalog aller Lektionen mit Metadaten. grade: 1–13 oder 'erwachsene'.
export const ADULT = 'erwachsene';
export const GRADES = [...Array.from({ length: 13 }, (_, i) => i + 1), ADULT];

export function gradeLabel(grade, { short = false } = {}) {
  if (grade === ADULT) return 'Erwachsene';
  return short ? `${grade}` : `Klasse ${grade}`;
}

export const catalog = [
  {
    id: 'terzen',
    title: 'Kleine und grosse Terzen',
    subject: 'Musik',
    grade: 6,
    emoji: '🎹',
    color: 'c-music',
    description: 'Was eine Terz ist, wie man Halbtonschritte zählt und warum Dur fröhlich und Moll traurig klingt.',
    available: true,
    load: () => import('./terzen.js'),
  },
  {
    id: 'europa',
    title: 'Europa: Länder und Hauptstädte',
    subject: 'Geografie',
    grade: 6,
    emoji: '🗺️',
    color: 'c-geo',
    description: 'Alle Länder Europas mit Hauptstädten auf einer Karte: erkunden, Regionen, Nachbarn, zwei Quiz und Lernkarten.',
    available: true,
    load: () => import('./europa.js'),
  },
  {
    id: 'harmonic-shift',
    title: 'One Vibe, Two Colours',
    subject: 'Musik',
    grade: ADULT,
    emoji: '🎹',
    color: 'c-adult',
    description: 'Englisch · Am11 to Fmaj9♯11: shift the colour of a chord without changing the chord, plus a deceptive cadence.',
    available: true,
    load: () => import('./harmonic-shift.js'),
  },
  {
    id: 'constellations',
    title: 'Harmonic Constellations',
    subject: 'Musik',
    grade: ADULT,
    emoji: '✨',
    color: 'c-adult',
    description: 'Englisch · Arpeggiated chords in C minor, voice leading, and a progression nested inside one arpeggiated chord.',
    available: true,
    load: () => import('./constellations.js'),
  },
];

export const lessons = Object.fromEntries(catalog.filter((l) => l.load).map((l) => [l.id, l.load]));

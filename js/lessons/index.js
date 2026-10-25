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
    id: 'rhythmus',
    title: 'Rhythmus',
    subject: 'Musik',
    grade: 4,
    emoji: '🥁',
    color: 'c-rhythm',
    description: 'Takt, Tempo und erste Beats.',
    available: false,
  },
  {
    id: 'zahlen',
    title: 'Zahlen',
    subject: 'Mathe',
    grade: 2,
    emoji: '🔢',
    color: 'c-math',
    description: 'Einmaleins zum Hören und Sehen.',
    available: false,
  },
  {
    id: 'woerter',
    title: 'Wörter',
    subject: 'Sprache',
    grade: 1,
    emoji: '🔤',
    color: 'c-words',
    description: 'Silben klatschen und Reime finden.',
    available: false,
  },
  {
    id: 'harmonielehre',
    title: 'Akkorde und Harmonielehre',
    subject: 'Musik',
    grade: ADULT,
    emoji: '🎼',
    color: 'c-adult',
    description: 'Dreiklänge, Umkehrungen und Kadenzen – für die eigenen Sachen.',
    available: false,
  },
];

export const lessons = Object.fromEntries(catalog.filter((l) => l.load).map((l) => [l.id, l.load]));

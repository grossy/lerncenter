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
];

export const lessons = Object.fromEntries(catalog.filter((l) => l.load).map((l) => [l.id, l.load]));

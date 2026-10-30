// Katalog der Kinder-Lektionen (Lerncenter). grade: 1–13.
// Erwachsenen-Lektionen leben getrennt in daemon/lessons/index.js.
export const GRADES = Array.from({ length: 13 }, (_, i) => i + 1);

export function gradeLabel(grade, { short = false } = {}) {
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
    id: 'flaeche',
    title: 'Flächeninhalt und Umfang',
    subject: 'Mathe',
    grade: 6,
    emoji: '📐',
    color: 'c-math',
    description: 'Rechteck, Dreieck, Parallelogramm und zusammengesetzte Figuren: Fläche und Umfang verstehen, Teilflächen, fehlende Seiten, Einheiten.',
    available: true,
    load: () => import('./flaeche.js'),
  },
];

export const lessons = Object.fromEntries(catalog.filter((l) => l.load).map((l) => [l.id, l.load]));

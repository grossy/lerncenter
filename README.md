# Lerncenter

Proof of Concept für eine Lern-Webapp für Kinder, inspiriert von [Ableton Learn](https://learn.ableton.com/).

Lektionen:

- **Kleine und grosse Terzen** (Musik, Klasse 6, Deutsch)
- **Europa: Länder und Hauptstädte** (Geografie, Klasse 6, Deutsch) – klickbare Karte, Regionen, zwei Quiz, Lernkarten
- **Flächeninhalt und Umfang** (Mathe, Klasse 6, Deutsch) – Rechteck, Dreieck, Parallelogramm, Teilflächen, fehlende Seiten, Übungsquiz
- **One Vibe, Two Colours** (Musik, Erwachsene, Englisch) – Am11 → Fmaj9♯11 und Trugschluss
- **Harmonic Constellations** (Musik, Erwachsene, Englisch) – Arpeggiator, Voice Leading, verschachtelte Progression in c-Moll

**Live:** <https://grossy.github.io/lerncenter/> (GitHub Pages, deployt automatisch bei jedem Push auf `main`).

## Starten

Kein Build-Schritt nötig, nur ein statischer Webserver (ES-Module brauchen `http://`, nicht `file://`):

```bash
python3 -m http.server 5173
```

Dann <http://localhost:5173> öffnen.

## Struktur

- `index.html` – Übersicht aller Kurse/Lektionen
- `lesson.html?id=terzen` – Lektions-Player (Seiten, Fortschritt, Weiter/Zurück)
- `js/lesson.js` – Lektions-Engine (rendert Seiten aus einer Lektionsdefinition)
- `js/audio.js` – kleiner Web-Audio-Synth (Klavier-ähnlich)
- `js/piano.js` – Klaviatur-Komponente
- `js/lessons/terzen.js` – Inhalt und Widgets der Terzen-Lektion
- `js/map.js` – klickbare Europakarte (SVG), `js/data/europe-map.js` – vorberechnete Länderumrisse
- `js/pads.js` – 8×8-Pad-Grid im isomorphen Fourths-Layout (Push/Launchpad), `js/instrument.js` – Piano/Pads-Umschalter
- `js/widgets.js` – gemeinsame Akkord-Widgets (Loop-Player, Voicing-Schritte, Root-Wechsel, Arpeggiator)
- `js/lessons/harmonic-shift.js`, `js/lessons/constellations.js` – englische Erwachsenen-Lektionen
- `js/lessons/index.js` – Katalog aller Lektionen (Titel, Fach, Klassenstufe, Farbe, Loader)

## Klassenstufen

Jede Lektion hat ein `grade`: `1`–`13` oder `'erwachsene'` (Konstante `ADULT`). Die Startseite hat oben einen
Kinder/Erwachsene-Umschalter; im Kinder-Modus gibt es zusätzlich Dropdowns für Fach und Klasse. Der Lektions-Player
zeigt die Stufe im Kopf an.

Neue Lektion: Datei in `js/lessons/` anlegen (Default-Export mit `id`, `title`, `subject`, `grade`, optional `lang: 'en'`, `pages`),
dann einen Eintrag im `catalog` in `js/lessons/index.js` ergänzen. Die Startseite rendert die Karten daraus.

## Kartendaten

`js/data/europe-map.js` ist aus [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth, gemeinfrei) generiert:
TopoJSON dekodiert, mit einer Lambert-Azimutalprojektion (Zentrum 52° N, 10° O) in SVG-Koordinaten gebracht und vereinfacht.
Generator: `tools/build_map.py <countries-50m.json> js/data/europe-map.js`. Die Projektion ist in `js/map.js` (`project`) nachgebaut, damit Hauptstädte als Pins platziert werden können.

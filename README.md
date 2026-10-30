# Lerncenter und Daemon

Zwei getrennte Lern-Webapps in einem Repo, inspiriert von [Ableton Learn](https://learn.ableton.com/). Sie teilen sich
Engine, Styles und Komponenten, haben aber eigene Startseiten, Kataloge und URLs und verlinken nicht aufeinander.

**Lerncenter** (Kinder, Deutsch) – <https://grossy.github.io/lerncenter/>

- **Kleine und grosse Terzen** (Musik, Klasse 6)
- **Europa: Länder und Hauptstädte** (Geografie, Klasse 6) – klickbare Karte, Regionen, zwei Quiz, Lernkarten
- **Flächeninhalt und Umfang** (Mathe, Klasse 6) – Rechteck, Dreieck, Parallelogramm, Teilflächen, fehlende Seiten, Übungsquiz

**Daemon** (Erwachsene, Englisch) – <https://grossy.github.io/lerncenter/daemon/>

- **One Vibe, Two Colours** (Music) – Am11 → Fmaj9♯11 und Trugschluss
- **Harmonic Constellations** (Music) – Arpeggiator, Voice Leading, verschachtelte Progression in c-Moll

GitHub Pages deployt automatisch bei jedem Push auf `main`.

## Starten

Kein Build-Schritt nötig, nur ein statischer Webserver (ES-Module brauchen `http://`, nicht `file://`):

```bash
python3 -m http.server 5173
```

Dann <http://localhost:5173> öffnen.

## Struktur

- `index.html` – Lerncenter-Startseite (Kinder) mit Dropdowns für Fach und Klasse
- `lesson.html?id=terzen` – Lektions-Player des Lerncenters
- `daemon/index.html`, `daemon/lesson.html?id=harmonic-shift` – Startseite und Player von Daemon (Erwachsene, Englisch)
- `daemon/lessons/` – Daemon-Lektionen und ihr Katalog (`daemon/lessons/index.js`)
- `js/lesson.js` – gemeinsame Lektions-Engine; `mountLesson(lesson, { brand, tag })` bekommt Marke und Kopf-Tag vom Player
- `js/audio.js` – kleiner Web-Audio-Synth (Klavier-ähnlich)
- `js/piano.js` – Klaviatur-Komponente
- `js/lessons/terzen.js` – Inhalt und Widgets der Terzen-Lektion
- `js/map.js` – klickbare Europakarte (SVG), `js/data/europe-map.js` – vorberechnete Länderumrisse
- `js/pads.js` – 8×8-Pad-Grid im isomorphen Fourths-Layout (Push/Launchpad), `js/instrument.js` – Piano/Pads-Umschalter
- `js/widgets.js` – gemeinsame Akkord-Widgets (Loop-Player, Voicing-Schritte, Root-Wechsel, Arpeggiator)
- `js/lessons/index.js` – Katalog der Kinder-Lektionen (Titel, Fach, Klassenstufe, Farbe, Loader)

## Neue Lektion

**Lerncenter (Kinder, Deutsch):** Datei in `js/lessons/` anlegen (Default-Export mit `id`, `title`, `subject`, `grade` 1–13, `pages`),
dann einen Eintrag im `catalog` in `js/lessons/index.js` ergänzen. Der Text muss sprachlich zur Klassenstufe passen
(Klasse 6 = 11- bis 12-Jährige); Schweizer Schreibweise mit ss.

**Daemon (Erwachsene, Englisch):** Datei in `daemon/lessons/` anlegen (Default-Export mit `id`, `title`, `subject`, `lang: 'en'`, `pages`),
Eintrag im `catalog` in `daemon/lessons/index.js`. Gemeinsame Module werden mit `../../js/…` importiert.
Der Piano/Pads-Umschalter (`createInstrument` mit `pads`-Option) ist nur für Daemon gedacht.

**Interaktive Regler** («Tweak Bars», wie die Schieberegler in der Flächen-Lektion) nur dort einsetzen, wo das Herumspielen
das Prinzip selbst zeigt, zum Beispiel wenn eine Grösse direkt von einer anderen abhängt. Nicht als Selbstzweck.

## Kartendaten

`js/data/europe-map.js` ist aus [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth, gemeinfrei) generiert:
TopoJSON dekodiert, mit einer Lambert-Azimutalprojektion (Zentrum 52° N, 10° O) in SVG-Koordinaten gebracht und vereinfacht.
Generator: `tools/build_map.py <countries-50m.json> js/data/europe-map.js`. Die Projektion ist in `js/map.js` (`project`) nachgebaut, damit Hauptstädte als Pins platziert werden können.

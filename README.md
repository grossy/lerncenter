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
- **Push 1: Just the Basics** (Music) – nach einem Tutorial von JNTHN STEIN: Raster, ein Finger pro Spalte, Dur-Tonleiter, Form in jeder Tonart, Terzen, Dezimen, zwei Hände
- **Push 2: Slick 7th Chords** (Music) – nach einem Tutorial von JNTHN STEIN: Maj7 und m7 als Griffe, eng und offen, fallende Folge, eigene Akkordfolgen, zwei Hände
- **Swedish 1–10** (Swedish) – zehn Alltagssituationen, jeweils Wörter → Sätze → Konversation, mit Sprachausgabe: Hej!, Ett rum tack, Fika, Vart ska du?, I affären, Utflykt, Simma och basta, Hitta vägen, Ska vi ses?, Grattis!
- **Catching the Big Fish** (Books) – David Lynch: Ideen als Fische, Fragmente, Red Room, vier Stunden für eine, dazu eine kritische Einordnung und Schreibaufgaben
- **Metaphysical Order in Sufism** (Books) – Samer Akkach: Präsenz, Punkt und Kreis, sieben Seinszustände, vier Bedingungen des Schaffens, Buchstaben, kritische Einordnung und Schreibaufgaben
- **Turn Your Interests Into a Business** (Books) – Dan Koe: Mission, Content Map, Vier-Calls-Angebot und Fragebogen als Werkzeuge, Rechner für seine Zahlen, kritische Einordnung

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
- `daemon/index.html`, `daemon/lesson.html?id=harmonic-shift` – Startseite (kompakte Liste, nach Fach gruppiert, ohne Icons) und Player von Daemon (Erwachsene, Englisch)
- `daemon/lessons/` – Daemon-Lektionen und ihr Katalog (`daemon/lessons/index.js`)
- `js/lesson.js` – gemeinsame Lektions-Engine; `mountLesson(lesson, { brand, tag })` bekommt Marke und Kopf-Tag vom Player
- `js/audio.js` – kleiner Web-Audio-Synth (Klavier-ähnlich)
- `js/piano.js` – Klaviatur-Komponente
- `js/lessons/terzen.js` – Inhalt und Widgets der Terzen-Lektion
- `js/map.js` – klickbare Europakarte (SVG), `js/data/europe-map.js` – vorberechnete Länderumrisse
- `js/pads.js` – 8×8-Pad-Grid im isomorphen Fourths-Layout (Push/Launchpad), `js/instrument.js` – Piano/Pads-Umschalter
- `js/push.js` – Push-Raster wie auf dem Gerät (einzelne Pads, Fingerangaben) und `drill`: Griffe zuschauen oder selbst spielen
- `js/widgets.js` – gemeinsame Akkord-Widgets (Loop-Player, Voicing-Schritte, Root-Wechsel, Arpeggiator)
- `js/lessons/index.js` – Katalog der Kinder-Lektionen (Titel, Fach, Klassenstufe, Farbe, Loader)
- `js/speech.js` – Sprachausgabe: spielt die Aufnahmen aus `daemon/audio/sv/`, die Gerätestimme nur als Notlösung
- `tools/build_speech.py`, `tools/speech_phrases.mjs` – erzeugen die Aufnahmen mit Piper; das Korrekturwörterbuch für falsch betonte Wörter steht im Skript
- `js/book.js` – Bausteine für Buch-Lektionen: Sortieren, Entscheiden, Notizen (nur im Browser), Timer
- `js/language.js` – Sprachkurs-Baustein: `languageLesson(daten)` baut daraus die Seiten Wörter → Sätze → Konversation mit Rollenspiel

## Neue Lektion

**Lerncenter (Kinder, Deutsch):** Datei in `js/lessons/` anlegen (Default-Export mit `id`, `title`, `subject`, `grade` 1–13, `pages`),
dann einen Eintrag im `catalog` in `js/lessons/index.js` ergänzen. Der Text muss sprachlich zur Klassenstufe passen
(Klasse 6 = 11- bis 12-Jährige); Schweizer Schreibweise mit ss.

**Daemon (Erwachsene, Englisch):** Datei in `daemon/lessons/` anlegen (Default-Export mit `id`, `title`, `subject`, `lang: 'en'`, `pages`),
Eintrag im `catalog` in `daemon/lessons/index.js`. Gemeinsame Module werden mit `../../js/…` importiert.
Der Piano/Pads-Umschalter (`createInstrument` mit `pads`-Option) ist nur für Daemon gedacht.

**Interaktive Regler** («Tweak Bars», wie die Schieberegler in der Flächen-Lektion) nur dort einsetzen, wo das Herumspielen
das Prinzip selbst zeigt, zum Beispiel wenn eine Grösse direkt von einer anderen abhängt. Nicht als Selbstzweck.

**Bücher (Daemon, Fach `Books`):** Datei in `daemon/lessons/` mit den Bausteinen aus `js/book.js`, Karte mit `color: 'c-book'`. Ideen in eigenen Worten nacherzählen, höchstens ein kurzes Zitat pro Lektion, keine längeren Passagen. Jede Lektion trennt, was man anwenden kann, von Behauptungen, die umstritten sind, und enthält Aufgaben zum eigenen Arbeiten.

**Video-Tutorials (Daemon, Fach `Music`):** Video und Transkript liegen nur lokal in `dev import/`. Griffe aus Einzelbildern ablesen, Ideen in eigenen Worten nacherzählen, höchstens ein kurzes Zitat, kein Ton und kein Bild aus dem Video im Repo. Was nicht aus dem Video stammt, in der Lektion kennzeichnen.

## Schwedischkurs und Urheberrecht

Der Kurs folgt den zehn Situationen von *Teach Yourself Swedish Conversation*, die Dialoge sind aber eigene Texte. Dieses Repo und die Seite sind
öffentlich: Buchtexte und CD-Aufnahmen gehören nicht hinein. Die Originaldateien liegen nur lokal in `dev import/` (in `.gitignore`), und die Seite «From the CD»
erscheint nur auf localhost und spielt die Abschnitte aus `dev import/tracks/`.

Die Aufnahmen in `daemon/audio/sv/` sind synthetisch, gesprochen von der Stimme [Alma](https://huggingface.co/yeagersthlm/piper-voice-sv-alma) (Piper, CC BY 4.0, trainiert auf dem NST-Datensatz von Språkbanken). Nach Textänderungen in einer Lektion `tools/build_speech.py` neu laufen lassen: Es erzeugt fehlende Dateien und löscht verwaiste.

## Kartendaten

`js/data/europe-map.js` ist aus [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth, gemeinfrei) generiert:
TopoJSON dekodiert, mit einer Lambert-Azimutalprojektion (Zentrum 52° N, 10° O) in SVG-Koordinaten gebracht und vereinfacht.
Generator: `tools/build_map.py <countries-50m.json> js/data/europe-map.js`. Die Projektion ist in `js/map.js` (`project`) nachgebaut, damit Hauptstädte als Pins platziert werden können.

// Klickbare Europakarte (SVG) aus vorberechneten Pfaden.
import { WIDTH, HEIGHT, PROJ, SHAPES, CONTEXT } from './data/europe-map.js';

const D = Math.PI / 180;
const NS = 'http://www.w3.org/2000/svg';
// Standard-Ausschnitt: Island bis Zypern, Nordkap bis Malta (ohne das leere Osteuropa/Russland rechts)
export const DEFAULT_BOX = '210 35 770 670';
const BOX_WIDTH = 770;

/** Geo-Koordinate -> SVG-Pixel (gleiche Projektion wie beim Generieren) */
export function project(lat, lon) {
  const lat0 = PROJ.lat0 * D, p = lat * D, l = lon * D - PROJ.lon0 * D;
  const c = 1 + Math.sin(lat0) * Math.sin(p) + Math.cos(lat0) * Math.cos(p) * Math.cos(l);
  const k = Math.sqrt(2 / c);
  const x = k * Math.cos(p) * Math.sin(l);
  const y = k * (Math.cos(lat0) * Math.sin(p) - Math.sin(lat0) * Math.cos(p) * Math.cos(l));
  return [(x - PROJ.minx) * PROJ.scale, (PROJ.maxy - y) * PROJ.scale];
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/**
 * createMap({ countries: [{code, name, lat, lon}], onCountry(code), interactive })
 * Länder ohne Umriss (z. B. Vatikanstadt) bekommen automatisch einen Marker.
 */
export function createMap({ countries = [], onCountry = null, interactive = true, viewBox = null } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'map' + (interactive ? ' interactive' : '');
  const svg = svgEl('svg', { viewBox: viewBox || DEFAULT_BOX, role: 'img', 'aria-label': 'Karte von Europa' });
  let pinScale = (viewBox ? parseFloat(viewBox.split(/\s+/)[2]) : BOX_WIDTH) / BOX_WIDTH;
  wrap.appendChild(svg);

  const gContext = svgEl('g', { class: 'context' });
  for (const [code, d] of Object.entries(CONTEXT)) gContext.appendChild(svgEl('path', { d, 'data-code': code }));
  svg.appendChild(gContext);

  const gCountries = svgEl('g', { class: 'countries' });
  const gMarkers = svgEl('g', { class: 'markers' });
  const paths = new Map();
  const byCode = new Map(countries.map((c) => [c.code, c]));
  const codes = countries.length ? countries.map((c) => c.code) : Object.keys(SHAPES);
  for (const code of codes) {
    const d = SHAPES[code];
    const info = byCode.get(code);
    let el;
    if (d) {
      el = svgEl('path', { d, class: 'country', 'data-code': code });
    } else if (info) {
      const [x, y] = project(info.lat, info.lon);
      el = svgEl('circle', { cx: x, cy: y, r: 5, class: 'country dot', 'data-code': code });
    } else continue;
    if (info) { const t = svgEl('title'); t.textContent = info.name; el.appendChild(t); }
    if (interactive && onCountry) el.addEventListener('click', () => onCountry(code, el));
    (d ? gCountries : gMarkers).appendChild(el);
    paths.set(code, el);
  }
  svg.appendChild(gCountries);
  svg.appendChild(gMarkers);
  const gPins = svgEl('g', { class: 'pins' });
  svg.appendChild(gPins);

  return {
    el: wrap,
    svg,
    has: (code) => paths.has(code),
    set(code, cls) { paths.get(code)?.classList.add(cls); },
    unset(code, cls) { paths.get(code)?.classList.remove(cls); },
    clear(cls = null) {
      paths.forEach((p) => {
        if (cls) p.classList.remove(cls);
        else p.setAttribute('class', 'country' + (p.tagName === 'circle' ? ' dot' : ''));
      });
    },
    pin(lat, lon, text = '', cls = '') {
      const [x, y] = project(lat, lon);
      const k = pinScale;
      const g = svgEl('g', { class: 'pin ' + cls, transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
      g.appendChild(svgEl('circle', { r: (4.5 * k).toFixed(2), 'stroke-width': (2 * k).toFixed(2) }));
      if (text) {
        const t = svgEl('text', { x: (8 * k).toFixed(1), y: (4.5 * k).toFixed(1), 'font-size': (14 * k).toFixed(1), 'stroke-width': (3 * k).toFixed(1) });
        t.textContent = text; g.appendChild(t);
      }
      gPins.appendChild(g);
      return g;
    },
    clearPins() { gPins.innerHTML = ''; },
    zoom(box) {
      svg.setAttribute('viewBox', box || DEFAULT_BOX);
      pinScale = parseFloat((box || DEFAULT_BOX).split(/\s+/)[2]) / BOX_WIDTH;
    },
  };
}

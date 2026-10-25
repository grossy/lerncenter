import json, math, sys
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
T = d['transform']; SC, TR = T['scale'], T['translate']

# decode arcs
arcs = []
for arc in d['arcs']:
    x = y = 0; pts = []
    for dx, dy in arc:
        x += dx; y += dy
        pts.append((x * SC[0] + TR[0], y * SC[1] + TR[1]))
    arcs.append(pts)

EUROPE = {'008':'AL','020':'AD','040':'AT','112':'BY','056':'BE','070':'BA','100':'BG','191':'HR','196':'CY','203':'CZ',
 '208':'DK','233':'EE','246':'FI','250':'FR','276':'DE','300':'GR','348':'HU','352':'IS','372':'IE','380':'IT',
 '428':'LV','438':'LI','440':'LT','442':'LU','470':'MT','498':'MD','492':'MC','499':'ME','528':'NL','807':'MK',
 '578':'NO','616':'PL','620':'PT','642':'RO','643':'RU','674':'SM','688':'RS','703':'SK','705':'SI','724':'ES',
 '752':'SE','756':'CH','792':'TR','804':'UA','826':'GB','336':'VA'}
BY_NAME = {'Kosovo':'XK', 'N. Cyprus':'CY'}
CONTEXT = {'398':'KZ','268':'GE','051':'AM','031':'AZ','760':'SY','368':'IQ','364':'IR','504':'MA','012':'DZ','788':'TN',
 '434':'LY','818':'EG','422':'LB','376':'IL','400':'JO','682':'SA','304':'GL','234':'FO','792x':'', '795':'TM','860':'UZ','887':'YE','414':'KW'}

# projection: Lambert azimuthal equal-area, centre 52N 10E
LAT0, LON0 = math.radians(52), math.radians(10)
def proj(lat, lon):
    p, l = math.radians(lat), math.radians(lon) - LON0
    c = 1 + math.sin(LAT0)*math.sin(p) + math.cos(LAT0)*math.cos(p)*math.cos(l)
    if c <= 1e-9: return None
    k = math.sqrt(2 / c)
    return (k*math.cos(p)*math.sin(l), k*(math.cos(LAT0)*math.sin(p) - math.sin(LAT0)*math.cos(p)*math.cos(l)))

# frame: lon -25..45, lat 34..72 -> compute bounds from sample points
xs, ys = [], []
for lat in (34, 50, 72):
    for lon in (-25, 10, 45):
        x, y = proj(lat, lon); xs.append(x); ys.append(y)
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
W = 1000.0
S = W / (maxx - minx)
H = round((maxy - miny) * S)
def to_px(lat, lon):
    r = proj(lat, lon)
    if r is None: return None
    return ((r[0] - minx) * S, (maxy - r[1]) * S)

def rdp(pts, eps):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy)
    idx, dmax = 0, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        dist = math.hypot(x - x1, y - y1) if L < 1e-6 else abs(dy*x - dx*y + x2*y1 - y2*x1) / L
        if dist > dmax: idx, dmax = i, dist
    if dmax > eps:
        return rdp(pts[:idx+1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]

def ring_path(ring_arcs, eps=0.5, keep_small=False):
    pts = []
    for a in ring_arcs:
        seg = arcs[a] if a >= 0 else list(reversed(arcs[~a]))
        pts.extend(seg if not pts else seg[1:])
    px = [to_px(lat, lon) for lon, lat in pts]
    px = [p for p in px if p is not None]
    if len(px) < 4: return None
    bx = [p[0] for p in px]; by = [p[1] for p in px]
    if not keep_small and (max(bx)-min(bx) < 2.5 and max(by)-min(by) < 2.5): return None
    if max(bx) < -50 or min(bx) > W + 50 or max(by) < -50 or min(by) > H + 50: return None
    simp = rdp(px, eps)
    if len(simp) < 3: return None
    return 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in simp) + 'Z'

shapes, context = {}, {}
for g in d['objects']['countries']['geometries']:
    gid = g.get('id'); name = g['properties']['name']
    code = EUROPE.get(gid) or BY_NAME.get(name)
    target = shapes if code else None
    if not code:
        code = CONTEXT.get(gid)
        target = context if code else None
    if target is None: continue
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    tiny = code in ('VA','MC','SM','LI','AD','MT','LU')
    paths = []
    for poly in polys:
        for i, ring in enumerate(poly):
            p = ring_path(ring, eps=0.35 if tiny else 0.6, keep_small=tiny)
            if p: paths.append(p)
    if not paths:
        print('no path for', code, name, file=sys.stderr); continue
    target[code] = target.get(code, '') + ''.join(paths)

with open(out, 'w') as f:
    f.write('// Generiert aus Natural Earth (world-atlas@2, gemeinfrei) – Lambert azimuthal equal-area, Zentrum 52°N 10°E\n')
    f.write(f'export const WIDTH = {W:.0f};\nexport const HEIGHT = {H};\n')
    f.write(f'export const PROJ = {{ lat0: 52, lon0: 10, minx: {minx:.6f}, maxy: {maxy:.6f}, scale: {S:.6f} }};\n')
    f.write('export const SHAPES = ' + json.dumps(shapes, ensure_ascii=False) + ';\n')
    f.write('export const CONTEXT = ' + json.dumps(context, ensure_ascii=False) + ';\n')
print('countries:', len(shapes), 'context:', len(context), 'size:', sum(len(v) for v in shapes.values()) + sum(len(v) for v in context.values()), 'H', H)

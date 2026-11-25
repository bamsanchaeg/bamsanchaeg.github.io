#!/usr/bin/env python3
"""OpenStreetMap 원본(JSON)을 혜화동 타일맵으로 바꿔 prototype/village.html 에 넣는다.

원본 받기:
  curl -H 'Accept: application/json' -o osm.json \
    'https://api.openstreetmap.org/api/0.6/map.json?bbox=126.9965,37.5762,127.0085,37.5880'
실행:
  python3 tools/build_hyehwa.py osm.json prototype/village.html
지도 데이터: © OpenStreetMap contributors (ODbL) — 화면의 출처 표시를 지우지 말 것.
"""
import json, math, random, re, sys
from collections import deque

LEFT, RIGHT, TOP, BOTTOM = 126.9985, 127.0076, 37.5866, 37.5770
M = 3.0                                     # 타일 한 칸 = 3m
KY = 111320.0; KX = KY * math.cos(math.radians(37.582))
W = math.ceil((RIGHT - LEFT) * KX / M); H = math.ceil((TOP - BOTTOM) * KY / M)
random.seed(5)

els = json.load(open(sys.argv[1]))['elements']
node = {e['id']: e for e in els if e['type'] == 'node'}
way = {e['id']: e for e in els if e['type'] == 'way'}
def P(lon, lat): return ((lon - LEFT) * KX / M, (TOP - lat) * KY / M)
def pts(w): return [P(node[n]['lon'], node[n]['lat']) for n in w['nodes'] if n in node]
tag = lambda e: e.get('tags', {})

def rings(e):
    if e['type'] == 'way': return [pts(e)]
    segs = [list(way[m['ref']]['nodes']) for m in e['members'] if m['type'] == 'way' and m['ref'] in way and m.get('role') != 'inner']
    out = []
    while segs:
        r = segs.pop()
        grew = True
        while grew and r[0] != r[-1]:
            grew = False
            for i, s in enumerate(segs):
                if s[0] == r[-1]: r += s[1:]
                elif s[-1] == r[-1]: r += s[-2::-1]
                elif s[-1] == r[0]: r = s[:-1] + r
                elif s[0] == r[0]: r = s[:0:-1] + r
                else: continue
                segs.pop(i); grew = True; break
        out.append([P(node[n]['lon'], node[n]['lat']) for n in r if n in node])
    return out

def fill(rs):
    """짝홀 규칙으로 채운 타일 목록"""
    edges = []
    for r in rs:
        for a, b in zip(r, r[1:] + r[:1]):
            if a[1] != b[1]: edges.append((a, b))
    if not edges: return
    y0 = max(0, int(min(min(a[1], b[1]) for a, b in edges))); y1 = min(H - 1, int(max(max(a[1], b[1]) for a, b in edges)))
    for y in range(y0, y1 + 1):
        yc = y + .5
        xs = sorted(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1]) for a, b in edges if (a[1] <= yc) != (b[1] <= yc))
        for l, r in zip(xs[::2], xs[1::2]):
            for x in range(max(0, math.ceil(l - .5)), min(W - 1, math.ceil(r - .5) - 1) + 1): yield x, y

def stroke(line, width):
    r = width / 2
    for a, b in zip(line, line[1:]):
        dx, dy = b[0] - a[0], b[1] - a[1]; L2 = dx * dx + dy * dy
        for y in range(max(0, int(min(a[1], b[1]) - r - 1)), min(H - 1, int(max(a[1], b[1]) + r + 1)) + 1):
            for x in range(max(0, int(min(a[0], b[0]) - r - 1)), min(W - 1, int(max(a[0], b[0]) + r + 1)) + 1):
                px, py = x + .5 - a[0], y + .5 - a[1]
                t = 0 if L2 == 0 else max(0, min(1, (px * dx + py * dy) / L2))
                if (px - t * dx) ** 2 + (py - t * dy) ** 2 <= r * r: yield x, y

def thin(line):
    """상하좌우로 이어진 한 칸 폭의 선"""
    last = None
    for a, b in zip(line, line[1:]):
        n = max(1, int(max(abs(b[0] - a[0]), abs(b[1] - a[1])) * 4))
        for i in range(n + 1):
            c = (math.floor(a[0] + (b[0] - a[0]) * i / n), math.floor(a[1] + (b[1] - a[1]) * i / n))
            if c == last: continue
            if last and c[0] != last[0] and c[1] != last[1]: yield (c[0], last[1])
            yield c; last = c

inside = lambda x, y: 0 <= x < W and 0 <= y < H
G = [['u'] * W for _ in range(H)]
def paint(tiles, c):
    for x, y in tiles:
        if inside(x, y): G[y][x] = c

# 1) 넓은 바닥
def areas(test): return [e for e in els if e['type'] in ('way', 'relation') and test(tag(e)) and 'boundary' not in tag(e)]
for e in areas(lambda t: t.get('amenity') in ('university', 'school', 'hospital') and 'building' not in t): paint(fill(rings(e)), 'e')
for e in areas(lambda t: t.get('leisure') in ('park', 'garden') or t.get('landuse') == 'grass'): paint(fill(rings(e)), 'g')
for e in areas(lambda t: t.get('natural') in ('wood', 'scrub')): paint(fill(rings(e)), 'f')
for e in areas(lambda t: t.get('leisure') in ('pitch', 'playground', 'track')): paint(fill(rings(e)), 'y')
for e in areas(lambda t: t.get('natural') == 'sand'): paint(fill(rings(e)), 'y')
for e in areas(lambda t: t.get('natural') == 'water'): paint(fill(rings(e)), 'w')

# 2) 길
ORDER = ['steps', 'path', 'footway', 'service', 'pedestrian', 'living_street', 'residential', 'unclassified', 'tertiary', 'primary_link', 'primary']
roads = [e for e in way.values() if tag(e).get('highway') in ORDER and not (tag(e).get('layer', '0').startswith('-') or tag(e).get('tunnel') == 'yes' or tag(e).get('indoor') == 'yes')]
roads.sort(key=lambda e: ORDER.index(tag(e)['highway']))
def lanes(t):
    if t.get('junction') == 'circular': return 2
    try:
        n = int(float(t.get('lanes', ''))); return min(n, 3) if t.get('oneway') == 'yes' else n
    except ValueError: return 3 if t.get('oneway') == 'yes' else 6
def width(t):
    k = t['highway']
    if k == 'primary': return max(2.6, lanes(t) * 1.15)
    return {'primary_link': 3, 'tertiary': 4, 'residential': 2.4, 'living_street': 2.6, 'unclassified': 2.4, 'pedestrian': 3.4, 'service': 2, 'footway': 1.5, 'path': 1.4, 'steps': 1.8}[k]
SURF = {'primary': 'r', 'primary_link': 'r', 'tertiary': 'r', 'pedestrian': 'P', 'footway': 'p', 'path': 'p', 'steps': 't'}
keep = set(); carriage = set(); lines = []
for e in roads:                                  # 큰길의 인도 먼저
    if tag(e)['highway'] in ('primary', 'tertiary'): paint([p for p in stroke(pts(e), width(tag(e)) + (5 if tag(e)['highway'] == 'primary' else 2.4)) if G[p[1]][p[0]] in 'ue'], 's')
for e in roads:
    t = tag(e); line = pts(e); k = t['highway']; c = SURF.get(k, 'a')
    if t.get('footway') == 'sidewalk': c = 's'
    if t.get('footway') == 'crossing': continue
    tl = set(stroke(line, width(t))) | set(p for p in thin(line) if inside(*p))
    if c in 'ps': tl = {p for p in tl if G[p[1]][p[0]] not in ('r', 'a')}
    paint(tl, c); keep |= {p for p in thin(line) if inside(*p)}
    if c == 'r':
        carriage |= tl
        if k == 'primary' and t.get('junction') != 'circular': lines.append(['w' if t.get('oneway') == 'yes' else 'y', [round(v, 2) for p in line for v in p]])
for x, y in carriage: G[y][x] = 'r'
for e in areas(lambda t: t.get('leisure') == 'garden'):   # 로터리 안 화단
    for x, y in fill(rings(e)):
        if G[y][x] == 'r' and (x, y) not in keep: G[y][x] = 'g'; carriage.discard((x, y))
# 3) 횡단보도
def zebra(cx, cy, ux, uy):
    for y in range(max(0, int(cy - 9)), min(H, int(cy + 10))):
        for x in range(max(0, int(cx - 9)), min(W, int(cx + 10))):
            dx, dy = x + .5 - cx, y + .5 - cy
            if abs(dx * ux + dy * uy) <= 1.05 and abs(dx * -uy + dy * ux) < 8 and G[y][x] in 'r': G[y][x] = 'c' if abs(uy) > abs(ux) else 'd'
for e in roads:
    if tag(e)['highway'] not in ('primary', 'tertiary'): continue
    ns = [n for n in e['nodes'] if n in node]
    for i, n in enumerate(ns):
        if tag(node[n]).get('highway') == 'crossing':
            a = P(node[ns[max(0, i - 1)]]['lon'], node[ns[max(0, i - 1)]]['lat']); b = P(node[ns[min(len(ns) - 1, i + 1)]]['lon'], node[ns[min(len(ns) - 1, i + 1)]]['lat'])
            d = math.hypot(b[0] - a[0], b[1] - a[1]) or 1
            zebra(*P(node[n]['lon'], node[n]['lat']), (b[0] - a[0]) / d, (b[1] - a[1]) / d)
for e in roads:
    if tag(e).get('footway') == 'crossing':
        l = pts(e); horiz = abs(l[-1][0] - l[0][0]) > abs(l[-1][1] - l[0][1])
        for x, y in stroke(l, 2.2):
            if G[y][x] == 'r': G[y][x] = 'c' if horiz else 'd'

# 4) 건물
BID = [[0] * W for _ in range(H)]; B = []       # B[i-1] = dict
def square(tl):
    xs = [p[0] for p in tl]; ys = [p[1] for p in tl]
    if not tl or max(xs) - min(xs) > 9 or max(ys) - min(ys) > 9 or len(tl) > 60: return tl
    own = set(tl); best = None
    for x0 in range(min(xs), max(xs) + 1):
        for x1 in range(x0 + 1, max(xs) + 1):
            for y0 in range(min(ys), max(ys) + 1):
                for y1 in range(y0 + 1, max(ys) + 1):
                    sc = 0
                    for y in range(y0, y1 + 1):
                        for x in range(x0, x1 + 1):
                            sc += 1 if (x, y) in own else -.7 if inside(x, y) and (x, y) not in keep and (x, y) not in carriage and not BID[y][x] else -99
                    if best is None or sc > best[0]: best = (sc, x0, x1, y0, y1)
    if best is None or best[0] < len(tl) * .45: return tl
    return [(x, y) for y in range(best[3], best[4] + 1) for x in range(best[1], best[2] + 1)]
THEATRE = ('theatre', 'arts_centre', 'cinema')
OLD = {'예술가의 집', '함춘문', '이화장', '안채', '사랑채'}
BRICK = {'아르코예술극장', '아르코미술관', '공공그라운드'}
PUBLIC = re.compile('극장|아트|예술|센터|씨어터|시어터|대학|학교|도서관|성당|교회|미술관|박물관|학림다방|공공그라운드|우체국|소방서|주민센터|병원|홀$|갤러리|플렉스|정미소|관$|성신|별마루')
for e in areas(lambda t: 'building' in t):
    t = tag(e); tl = [p for p in fill(rings(e)) if p not in keep and p not in carriage and not BID[p[1]][p[0]]]
    tl = square(tl)
    if len(tl) < 3: continue
    n = t.get('name', ''); b = t['building']
    kind = 'b' if n in BRICK else 'o' if n in OLD else 't' if t.get('amenity') in THEATRE or '극장' in n or '씨어터' in n or '아트홀' in n else 'k' if n == '학림다방' else \
        'c' if b == 'church' or t.get('amenity') == 'place_of_worship' or '교회' in n else 'h' if b == 'hospital' else 'u' if b in ('university', 'school', 'dormitory') or '대학' in n or t.get('amenity') == 'school' else \
        'r' if b in ('residential', 'house', 'apartments') else 'n'
    try: lv = int(t.get('building:levels', 0))
    except ValueError: lv = 0
    n = re.sub(r'\s*\(.*\)', '', n)
    if re.search('점$|된장|빌리지|빌딩|치킨|중앙장애인', n): n = ''
    if not (n and (kind in 'botkcuh' or PUBLIC.search(n))): n = ''
    B.append(dict(k=kind, l=lv, n=n, t=tl))
    for x, y in tl: BID[y][x] = len(B)
real = len(B)

# 5) 성곽·담장
def cross(a, b, c, d):
    det = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0])
    if not det: return
    u = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / det
    v = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / det
    if 0 <= u <= 1 and 0 <= v <= 1: return a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1])
roadseg = [(a, b) for e in roads for l in [pts(e)] for a, b in zip(l, l[1:])]
for e in way.values():
    t = tag(e)
    if t.get('barrier') in ('city_wall', 'wall') or t.get('historic') == 'citywalls':
        c = 'W' if t.get('barrier') == 'city_wall' or t.get('historic') == 'citywalls' else 'L'
        l = pts(e); gates = [q for a, b in zip(l, l[1:]) for m, n in roadseg for q in [cross(a, b, m, n)] if q]
        for x, y in thin(l):
            if inside(x, y) and (x, y) not in carriage and not BID[y][x] and not any(math.hypot(x + .5 - q[0], y + .5 - q[1]) < 1.8 for q in gates): G[y][x] = c

# 6) 지도에 없는 건물 채우기 (주택가 빈 땅)
def near_road(x, y, w, h):
    return any(inside(i, j) and G[j][i] in 'arsP' for j in range(y - 3, y + h + 4) for i in range(x - 3, x + w + 3))
for skip, sizes in ((.12, [(4, 4), (5, 4), (5, 5), (6, 5), (4, 5)]), (0, [(4, 4)]), (0, [(3, 4)]), (0, [(4, 3)]), (0, [(3, 3)])):
    for y in range(1, H - 6):
        for x in range(1, W - 7):
            if G[y][x] != 'u' or BID[y][x] or random.random() < skip: continue
            w, h = random.choice(sizes)
            if x + w >= W or y + h >= H: continue
            if all(G[j][i] == 'u' for j in range(y, y + h) for i in range(x, x + w)) and G[y + h][x + w // 2] != 'W' and \
               not any(BID[j][i] for j in range(y - 1, y + h + 1) for i in range(x - 1, x + w + 1)) and near_road(x, y, w, h):
                B.append(dict(k='x', l=0, n='', t=[(i, j) for j in range(y, y + h) for i in range(x, x + w)]))
                for i, j in B[-1]['t']: BID[j][i] = len(B)

# 7) 나무
TREE = {}
def wide(x, y): return sum(inside(x + a, y + b) and G[y + b][x + a] not in 'rcd' for a in (-1, 0, 1) for b in (-1, 0, 1)) >= 6
def can(x, y): return inside(x, y) and not BID[y][x] and G[y][x] not in 'rcdwWLtaP' and (x, y) not in keep and (x, y) not in TREE
for n in node.values():
    if tag(n).get('natural') == 'tree':
        x, y = map(int, P(n['lon'], n['lat']))
        if can(x, y): TREE[x, y] = 'm'
for y in range(1, H):                            # 가로등
    for x in range(1, W - 1):
        if not can(x, y): continue
        g = G[y][x]; side = any(G[y][x + a] in 'rcd' for a in (-1, 1))
        if (g == 's' and y % 8 == 3 and side and wide(x, y)) or (g in 'uge' and any(G[y][x + a] in 'apPt' for a in (-1, 1)) and (y * 7 + x * 3) % 29 == 0): TREE[x, y] = 'l'
for y in range(1, H):
    for x in range(W):
        if not can(x, y) or any((x + a, y + b) in TREE for a, b in ((-1, 0), (1, 0), (0, -1), (-1, -1), (1, -1), (0, 1), (0, 2), (0, 3))): continue
        g = G[y][x]; near_path = any(inside(x + a, y + b) and G[y + b][x + a] in 'pt' for a in (-1, 0, 1) for b in (-1, 0, 1))
        if g == 'f' and not near_path and random.random() < .5: TREE[x, y] = 'g'
        elif g == 'g' and not near_path and random.random() < .17: TREE[x, y] = 'm' if random.random() < .5 else 'g'
        elif g == 'e' and random.random() < .035: TREE[x, y] = 'g'
        elif g == 's' and y % 6 == 0 and wide(x, y) and any(inside(x + a, y) and G[y][x + a] in 'r' for a in (-1, 1)): TREE[x, y] = 'y'

# 8) 걸어서 갈 수 있는 곳
def walk(x, y): return inside(x, y) and not BID[y][x] and G[y][x] not in 'wWL' and (x, y) not in TREE
def tile(lon, lat): x, y = P(lon, lat); return int(x), int(y)
def nearest(x, y, ok):
    best = None
    for j in range(max(0, y - 14), min(H, y + 15)):
        for i in range(max(0, x - 14), min(W, x + 15)):
            if ok(i, j) and (best is None or (i - x) ** 2 + (j - y) ** 2 < best[0]): best = ((i - x) ** 2 + (j - y) ** 2, i, j)
    return best and best[1:]
start = nearest(*tile(127.00268, 37.58055), walk)
def flood():
    seen = {start}; q = deque([start])
    while q:
        x, y = q.popleft()
        for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if (x + a, y + b) not in seen and walk(x + a, y + b): seen.add((x + a, y + b)); q.append((x + a, y + b))
    return seen
reach = flood()

# 9) 서비스 건물: 실제 거리 위의 이름 없는 건물에 배치 (가상의 가게)
def shop(kind, lon, lat):
    cx, cy = tile(lon, lat); best = None
    for i, b in enumerate(B):
        if b['n'] or b['k'] not in 'nrx' or len(b['t']) < 12: continue
        xs = [p[0] for p in b['t']]; ys = [p[1] for p in b['t']]
        if max(xs) - min(xs) < 3 or max(ys) - min(ys) < 3: continue
        mx = (min(xs) + max(xs)) / 2
        doors = [p for p in b['t'] if (p[0], p[1] + 1) in reach and (p[0] - 1, p[1]) in b['t'] and (p[0], p[1] - 2) in b['t']]
        if not doors: continue
        d = math.hypot(mx - cx, sum(ys) / len(ys) - cy)
        if best is None or d < best[0]: best = (d, i, min(doors, key=lambda p: abs(p[0] - mx)))
    B[best[1]]['k'] = kind
    return dict(id=best[1] + 1, door=list(best[2]), off=round(best[0] * M))
shops = {'bar': shop('J', 127.0036, 37.5822), 'rec': shop('R', 126.9999, 37.5826), 'cafe': shop('C', 127.0035, 37.5809), 'home': shop('M', 127.0052, 37.5799)}
board = nearest(*tile(127.0024, 37.5806), lambda x, y: (x, y) in reach and G[y][x] in 'gp' and (x, y) != start and (x, y + 1) in reach and (x, y + 1) != start)
TREE.pop(tuple(board), None)
exits = {}
for n in node.values():
    t = tag(n)
    if t.get('railway') == 'subway_entrance' and t.get('ref') in '1234':
        p = nearest(*tile(n['lon'], n['lat']), lambda x, y: (x, y) in reach and (x, y + 1) in reach and G[y][x] == 's' and [x, y] != list(board))
        exits[t['ref']] = list(p)

# 10) 성능 점검용: 게시판·출구를 막아도 모두 갈 수 있는지
blocked = {tuple(board)} | {tuple(v) for v in exits.values()}
_w = walk; walk = lambda x, y: _w(x, y) and (x, y) not in blocked
reach = flood()
for k, s in shops.items(): assert (s['door'][0], s['door'][1] + 1) in reach, k
for k, v in exits.items(): assert (v[0], v[1] + 1) in reach, k
assert (board[0], board[1] + 1) in reach

PLACES = [('마로니에공원', 127.00268, 37.5803), ('혜화역', 127.0019, 37.5822), ('대명거리', 127.0000, 37.5826), ('소나무길', 127.0000, 37.5821), ('혜화동로터리', 127.0012, 37.5853),
          ('낙산공원', 127.0068, 37.5795), ('한양도성 성곽길', 127.0071, 37.5818), ('동숭동 소극장 거리', 127.0036, 37.5822), ('이화동', 127.0052, 37.5782), ('방송통신대 앞', 127.0029, 37.5785),
          ('서울대학교병원', 126.9999, 37.5795), ('가톨릭대 성신교정', 127.0046, 37.5853), ('동성고등학교', 127.0032, 37.5849), ('명륜동', 126.9992, 37.5845), ('연건동', 127.0005, 37.5812)]
def rle(vals):
    out = []
    for v in vals:
        if out and out[-1][0] == v: out[-1][1] += 1
        else: out.append([v, 1])
    return out
data = dict(W=W, H=H, m=M, start=list(start), board=list(board), exits=exits, shops=shops,
    places=[[n, *tile(a, b)] for n, a, b in PLACES], lines=[l for l in lines if any(-5 < l[1][i] < W + 5 and -5 < l[1][i + 1] < H + 5 for i in range(0, len(l[1]), 2))],
    g=''.join(f'{n if n > 1 else ""}{c}' for c, n in rle(c for r in G for c in r)),
    b=[v for p in rle(v for r in BID for v in r) for v in p],
    B=[[b['k'], b['l'], b['n']] for b in B], trees=[[x, y, k] for (x, y), k in sorted(TREE.items(), key=lambda t: (t[0][1], t[0][0]))])
js = 'const MAP=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';'
f = sys.argv[2]
if f.endswith('.html'):
    s = open(f, encoding='utf-8').read()
    s, n = re.subn(r'(/\*MAP-BEGIN\*/).*?(/\*MAP-END\*/)', lambda m: m[1] + js + m[2], s, flags=re.S)
    assert n == 1, 'MAP 표시를 찾지 못함'
    open(f, 'w', encoding='utf-8').write(s)
else: open(f, 'w', encoding='utf-8').write(js)
print(f'{W}x{H}칸, 실제 건물 {real}, 채운 건물 {len(B) - real}, 나무 {len(TREE)}, 도달 가능 {len(reach)}칸, {len(js) // 1024}KB')
print('start', start, 'board', board, 'exits', exits, 'shops', shops)
print('이름:', [b['n'] for b in B if b['n']])

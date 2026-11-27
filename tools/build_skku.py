#!/usr/bin/env python3
"""OpenStreetMap 원본을 성균관대·문묘 타일맵으로 바꾸고 prototype/src 를 한 파일(prototype/village.html)로 묶는다.

원본 받기:
  curl -H 'Accept: application/json' -o skku.json \
    'https://api.openstreetmap.org/api/0.6/map.json?bbox=126.9875,37.5805,127.0035,37.5915'
실행:
  python3 tools/build_skku.py skku.json      # 지도까지 새로 변환
  python3 tools/build_skku.py                # 소스만 다시 묶기 (prototype/src/map.js 재사용)
지도 데이터: © OpenStreetMap contributors (ODbL) — 화면의 출처 표시를 지우지 말 것.
"""
import base64, hashlib, json, math, os, random, re, sys
from collections import deque
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check_secrets
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'prototype')
SRC = os.path.join(ROOT, 'src')

def bundle():
    rd = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read()
    sha = lambda t: "'sha256-" + base64.b64encode(hashlib.sha256(t.encode()).digest()).decode() + "'"
    css, html = rd('style.css'), rd('index.html')
    js = '\n'.join(rd(f) for f in ('map.js', 'title.js', 'art.js', 'world.js', 'rooms.js', 'jam.js', 'config.js', 'ui.js', 'cloud.js', 'plaza.js', 'updates.js', 'talk.js', 'main.js'))
    html = html.replace('/*STYLE*/', css).replace('/*SCRIPT*/', js)
    # 비밀 키가 들어 있으면 묶지 않는다
    key = re.search(r"key:\s*['\"`]([^'\"`]*)", rd('config.js'))
    if key and check_secrets.secret_kind(key[1]): sys.exit('config.js 에 비밀 키가 있어 묶지 않았습니다: ' + check_secrets.secret_kind(key[1]))
    # CSP: 이 파일의 스크립트와 무결성을 확인한 Supabase 라이브러리만 실행하고, 우리 프로젝트에만 연결한다
    url = re.search(r"url:\s*['\"`](https?://[^'\"`/]+)", rd('config.js')); sdk = re.search(r"src:'(https://[^']+)'", rd('cloud.js'))[1]
    cap = re.search(r"captcha:\s*['\"`]([^'\"`]+)", rd('config.js')); cf = 'https://challenges.cloudflare.com'
    inline = lambda tag: sha(re.search(r'<%s>(.*?)</%s>' % (tag, tag), html, re.S)[1])
    csp = '; '.join(["default-src 'none'", 'script-src %s %s%s' % (inline('script'), sdk, ' ' + cf if cap else ''), 'style-src %s https://fonts.googleapis.com' % inline('style'), 'font-src https://fonts.gstatic.com',
                     "img-src 'self' data:", "media-src 'self'", "connect-src 'self' " + (url[1] if url else ''), "base-uri 'none'", "form-action 'none'", "object-src 'none'", 'frame-src ' + (cf if cap else "'none'")])
    open(os.path.join(ROOT, 'village.html'), 'w', encoding='utf-8').write(html.replace('/*CSP*/', csp))
if len(sys.argv) < 2: bundle(); sys.exit()

# ---------- 좌표: 문묘 축이 곧게 서도록 13.5도 돌린다 ----------
CX, CY, TH, M = 126.9943, 37.58655, math.radians(13.5), 2.0
X0, X1, Y0, Y1 = -355, 600, -380, 600            # 돌린 좌표(m)
KY = 111320.0; KX = KY * math.cos(math.radians(37.587))
W, H = int((X1 - X0) / M), int((Y1 - Y0) / M)
random.seed(11)
def P(lon, lat):
    x, y = (lon - CX) * KX, (CY - lat) * KY
    return ((x * math.cos(TH) - y * math.sin(TH) - X0) / M, (x * math.sin(TH) + y * math.cos(TH) - Y0) / M)
def A(x, y): return ((x - X0) / M, (y - Y0) / M)  # 돌린 m 좌표 → 칸
els = json.load(open(sys.argv[1]))['elements']
node = {e['id']: e for e in els if e['type'] == 'node'}; way = {e['id']: e for e in els if e['type'] == 'way'}
tag = lambda e: e.get('tags', {})
def pts(w): return [P(node[n]['lon'], node[n]['lat']) for n in w['nodes'] if n in node]
def rings(e):
    if e['type'] == 'way': return [pts(e)]
    segs = [list(way[m['ref']]['nodes']) for m in e['members'] if m['type'] == 'way' and m['ref'] in way and m.get('role') != 'inner']
    out = []
    while segs:
        r = segs.pop(); grew = True
        while grew and r[0] != r[-1]:
            grew = False
            for i, s in enumerate(segs):
                if s[0] == r[-1]: r = r + s[1:]
                elif s[-1] == r[-1]: r = r + s[-2::-1]
                elif s[-1] == r[0]: r = s[:-1] + r
                elif s[0] == r[0]: r = s[:0:-1] + r
                else: continue
                segs.pop(i); grew = True; break
        if r[0] == r[-1]: out.append([P(node[n]['lon'], node[n]['lat']) for n in r if n in node])
    return out
def fill(rs):
    edges = [(a, b) for r in rs for a, b in zip(r, r[1:] + r[:1]) if a[1] != b[1]]
    if not edges: return
    for y in range(max(0, int(min(min(a[1], b[1]) for a, b in edges))), min(H - 1, int(max(max(a[1], b[1]) for a, b in edges))) + 1):
        yc = y + .5; xs = sorted(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1]) for a, b in edges if (a[1] <= yc) != (b[1] <= yc))
        for l, r in zip(xs[::2], xs[1::2]):
            for x in range(max(0, math.ceil(l - .5)), min(W - 1, math.ceil(r - .5) - 1) + 1): yield x, y
def stroke(line, width):
    r = width / 2
    for a, b in zip(line, line[1:]):
        dx, dy = b[0] - a[0], b[1] - a[1]; L2 = dx * dx + dy * dy
        for y in range(max(0, int(min(a[1], b[1]) - r - 1)), min(H - 1, int(max(a[1], b[1]) + r + 1)) + 1):
            for x in range(max(0, int(min(a[0], b[0]) - r - 1)), min(W - 1, int(max(a[0], b[0]) + r + 1)) + 1):
                px, py = x + .5 - a[0], y + .5 - a[1]; t = 0 if L2 == 0 else max(0, min(1, (px * dx + py * dy) / L2))
                if (px - t * dx) ** 2 + (py - t * dy) ** 2 <= r * r: yield x, y
def thin(line):
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
def paint(tl, c):
    for x, y in tl:
        if inside(x, y): G[y][x] = c
def areas(test): return [e for e in els if e['type'] in ('way', 'relation') and test(tag(e))]
def rect(x0, y0, x1, y1):                         # 돌린 m 좌표의 사각형
    a, b = A(x0, y0), A(x1, y1)
    return [(x, y) for y in range(round(a[1]), round(b[1])) for x in range(round(a[0]), round(b[0]))]

# 1) 바닥
for e in areas(lambda t: t.get('historic') == 'castle'): paint(fill(rings(e)), 'f')
for e in areas(lambda t: t.get('natural') in ('wood', 'scrub')): paint(fill(rings(e)), 'f')
for e in areas(lambda t: t.get('amenity') in ('university', 'school') and 'building' not in t and 'name' in t): paint(fill(rings(e)), 'e')
for e in areas(lambda t: t.get('leisure') in ('park', 'garden') and '옥상' not in t.get('name', '') or t.get('landuse') == 'grass'): paint(fill(rings(e)), 'j' if tag(e).get('name') == '금잔디광장' else 'g')
for e in areas(lambda t: t.get('landuse') == 'recreation_ground' or t.get('leisure') in ('pitch', 'playground')): paint(fill(rings(e)), 'y')
for e in areas(lambda t: t.get('natural') == 'water'): paint(fill(rings(e)), 'w')
munmyo = rings(way[430182901])[0]
paint(fill([munmyo]), 'g')
paint(rect(89, 90, 139, 137), 'm'); paint(rect(91, 138, 141, 207), 'm'); paint(rect(93, 60, 138, 66), 'm')   # 명륜당 앞뜰, 대성전 앞뜰
# 2) 길
ORDER = ['steps', 'path', 'footway', 'service', 'pedestrian', 'living_street', 'residential', 'unclassified', 'tertiary', 'primary']
roads = [e for e in way.values() if tag(e).get('highway') in ORDER and not (tag(e).get('layer', '0').startswith('-') or tag(e).get('tunnel') == 'yes' or tag(e).get('indoor') == 'yes')]
roads.sort(key=lambda e: ORDER.index(tag(e)['highway']))
WID = {'primary': 9, 'tertiary': 4.6, 'residential': 3, 'living_street': 3, 'unclassified': 3, 'pedestrian': 4, 'service': 2.8, 'footway': 2, 'path': 1.9, 'steps': 2.4}
SURF = {'primary': 'r', 'tertiary': 'r', 'pedestrian': 'P', 'footway': 'p', 'path': 'p', 'steps': 't'}
def wid(t): return 5.2 if t['highway'] == 'primary' and t.get('oneway') == 'yes' else 11 if t['highway'] == 'primary' else WID[t['highway']]
keep = set(); carriage = set(); lines = []
for e in roads:
    if tag(e)['highway'] in ('primary', 'tertiary'): paint([p for p in stroke(pts(e), wid(tag(e)) + 6) if G[p[1]][p[0]] in 'ueg'], 's')
for e in roads:
    t = tag(e); line = pts(e); k = t['highway']; c = SURF.get(k, 'a')
    if t.get('name') in ('대명길', '대명1길'): c = 'P'
    if t.get('footway') == 'crossing': continue
    core = {p for p in thin(line) if inside(*p)}; tl = set(stroke(line, wid(t))) | core
    if c in 'pt': tl = {p for p in tl if G[p[1]][p[0]] not in 'ram'}
    paint(tl, c); keep |= core
    if c == 'r':
        carriage |= tl; lines.append([round(v * 16) for p in line for v in p])
for x, y in carriage: G[y][x] = 'r'
# 문묘 안 박석길
MX = (99.5 + 131.5) / 2
paint(rect(MX - 3, 161, MX + 3, 206), 'q'); paint(rect(MX - 2, 90, MX + 2, 137), 'q'); paint(rect(MX - 3, 216, MX + 3, 232), 'q')
for e in roads:
    if tag(e).get('footway') == 'crossing' or tag(e).get('crossing'):
        l = pts(e); horiz = abs(l[-1][0] - l[0][0]) > abs(l[-1][1] - l[0][1])
        for x, y in stroke(l, 2.6):
            if G[y][x] == 'r': G[y][x] = 'c' if horiz else 'd'
def zebra(cx, cy, ux, uy):
    for y in range(max(0, int(cy - 12)), min(H, int(cy + 13))):
        for x in range(max(0, int(cx - 12)), min(W, int(cx + 13))):
            dx, dy = x + .5 - cx, y + .5 - cy
            if abs(dx * ux + dy * uy) <= 1.5 and abs(dx * -uy + dy * ux) < 9 and G[y][x] == 'r': G[y][x] = 'c' if abs(uy) > abs(ux) else 'd'
for e in roads:
    if tag(e)['highway'] not in ('primary', 'tertiary'): continue
    ns = [n for n in e['nodes'] if n in node]
    for i, n in enumerate(ns):
        if tag(node[n]).get('highway') == 'crossing':
            q = lambda m: P(node[m]['lon'], node[m]['lat']); a = q(ns[max(0, i - 1)]); b = q(ns[min(len(ns) - 1, i + 1)]); d = math.hypot(b[0] - a[0], b[1] - a[1]) or 1
            zebra(*q(n), (b[0] - a[0]) / d, (b[1] - a[1]) / d)
# 대명길이 창경궁로와 만나는 사거리: 네 방향 횡단보도
DM = A(296, 499)
for ang, r_ in ((math.radians(-47), 8), (math.radians(133), 8)):
    zebra(DM[0] + math.cos(ang) * r_, DM[1] + math.sin(ang) * r_, math.cos(ang), math.sin(ang))
SHOPST = set()
for e in roads:
    if tag(e).get('name', '').startswith(('대명', '성균관로')) and tag(e)['highway'] in ('residential', 'service', 'tertiary'): SHOPST |= {p for p in stroke(pts(e), 11)}
# 3) 건물
BID = [[0] * W for _ in range(H)]; B = []
HANOK = {'대성전': 'D', '명륜당': 'Y', '동재': 'V', '서재': 'V', '동무': 'V', '서무': 'V', '신삼문': 'S', '비천당': 'K', '진사식당': 'V', '집춘문': 'S'}
def add(kind, lv, name, poly, tl):
    B.append(dict(k=kind, l=lv, n=name, p=poly, t=tl))
    for x, y in tl: BID[y][x] = len(B)
SMALL = re.compile('정$|당$|안채|사랑채|고택|장원')
for e in areas(lambda t: 'building' in t):
    t = tag(e); rs = rings(e)
    if not rs: continue
    n = re.sub(r'\s*\(.*\)', '', t.get('name', '')); b = t['building']
    k = HANOK.get(n) or ('K' if t.get('historic') or SMALL.search(n) else 'u' if b in ('school', 'university', 'dormitory') or '성균관대' in n else 'n')
    poly = rs[0][:-1]
    if k in 'DYVSK':                              # 한옥은 반듯한 사각형으로
        xs = [p[0] for p in poly]; ys = [p[1] for p in poly]; x0, x1, y0, y1 = round(min(xs)), round(max(xs)), round(min(ys)), round(max(ys))
        x1 = max(x1, x0 + 2); y1 = max(y1, y0 + 2); poly = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    tl = [p for p in fill([poly]) if not BID[p[1]][p[0]] and (n or (p not in keep and p not in carriage))]
    if len(tl) < 4: continue
    if n in HANOK or n and k == 'u': tl = [p for p in tl]
    try: lv = int(t.get('building:levels', 0))
    except ValueError: lv = 0
    if k == 'n' and not re.search('극장|아트|예술|대학|학림다방|성당|교회|박물관|소방서|우체국|공공그라운드|회관|센터|씨어터|시어터|정미소|수기치인관', n): n = ''
    if re.search('점$|안채|사랑채|경호원|수행원|사무소|별관', n): n = n if '별관' in n else ''
    add(k, lv, n, poly, tl)
real = len(B)
# 낫컴플리트: 성균관로 12-5 (같은 길 12번·12-3번·14번 좌표에서 추정한 자리)
def put_rect(kind, name, cx, cy, w, h, bad='rcdtwaPq'):
    best = None
    for y in range(cy - 14, cy + 15):
        for x in range(cx - 14, cx + 15):
            if not all(inside(i, j) and G[j][i] not in bad and not BID[j][i] for j in range(y, y + h + 1) for i in range(x, x + w)): continue
            if not any(inside(i, y + h + d) and G[y + h + d][i] in 'arsP' for d in (1, 2, 3) for i in range(x, x + w)): continue
            q = (x + w / 2 - cx) ** 2 + (y + h / 2 - cy) ** 2
            if best is None or q < best[0]: best = (q, x, y)
    _, x, y = best
    add(kind, 2, name, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], [(i, j) for j in range(y, y + h) for i in range(x, x + w)])
    for j in (y + h,):
        for i in range(x, x + w): G[j][i] = 's' if G[j][i] == 'u' else G[j][i]
    return len(B), [x + w // 2, y + h - 1], round(math.sqrt(best[0]) * M)
nc = put_rect('N', '낫컴플리트', *map(int, P(126.99808, 37.58425)), 9, 6)
# 4) 담장: 문묘, 궁궐
def cross(a, b, c, d):
    det = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0])
    if not det: return
    u = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / det; v = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / det
    if 0 <= u <= 1 and 0 <= v <= 1: return a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1])
roadseg = [(a, b) for e in roads for l in [pts(e)] for a, b in zip(l, l[1:])]
def wall(l, c, gap=1.8, extra=()):
    gates = [q for a, b in zip(l, l[1:]) for m, n in roadseg for q in [cross(a, b, m, n)] if q] + list(extra)
    for x, y in thin(l):
        if inside(x, y) and (x, y) not in carriage and not BID[y][x] and not any(math.hypot(x + .5 - q[0], y + .5 - q[1]) < gap for q in gates): G[y][x] = c
wall(munmyo, 'L', 2.2, [A(177, 140), A(54, 120), A(MX, 222), A(MX, 60), A(160, 222)])
# 대성전과 명륜당 사이 담 (가운데와 양쪽 문)
wall([A(78, 138.5), A(152, 138.5)], 'L', 2.2, [A(86, 138.5), A(146, 138.5)])
for e in way.values():
    t = tag(e)
    if t.get('barrier') in ('city_wall', 'wall'): wall(pts(e), 'W' if t['barrier'] == 'city_wall' else 'L')
# 5) 지도에 없는 건물 채우기
def near_road(x, y, w, h): return any(inside(i, j) and G[j][i] in 'arsP' for j in range(y - 4, y + h + 5) for i in range(x - 4, x + w + 4))
for y in range(1, H - 9):                         # 상점가 먼저: 작고 촘촘한 가게
    for x in range(1, W - 10):
        if G[y][x] != 'u' or BID[y][x] or (x, y) not in SHOPST: continue
        w, h = random.choice([(5, 5), (6, 5), (7, 5), (5, 6), (6, 6)])
        if all(G[j][i] == 'u' for j in range(y, y + h) for i in range(x, x + w)) and not any(BID[j][i] for j in range(y - 1, y + h + 2) for i in range(x, x + w)):
            add('n', 0, '', [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], [(i, j) for j in range(y, y + h) for i in range(x, x + w)])
for skip, sizes in ((.1, [(7, 6), (8, 6), (6, 6), (9, 7), (6, 7)]), (0, [(6, 5)]), (0, [(5, 5)]), (0, [(5, 4)])):
    for y in range(1, H - 9):
        for x in range(1, W - 10):
            if G[y][x] != 'u' or BID[y][x] or random.random() < skip: continue
            w, h = random.choice(sizes)
            if x + w < W and y + h < H and all(G[j][i] == 'u' for j in range(y, y + h) for i in range(x, x + w)) and \
               not any(BID[j][i] for j in range(y - 1, y + h + 2) for i in range(x - 1, x + w + 1)) and near_road(x, y, w, h):
                add(random.choice('xxxn'), 0, '', [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], [(i, j) for j in range(y, y + h) for i in range(x, x + w)])
# 6) 나무와 소품
OBJ = {}
GINKGO = [[*map(round, A(100, 123)), 1], [*map(round, A(131, 121)), 0]]     # 명륜당 앞뜰 두 그루, 서쪽이 더 크다
for x, y, _ in GINKGO:
    for j in range(y - 1, y + 1):
        for i in range(x - 1, x + 2): OBJ[i, j] = '#'
def can(x, y): return inside(x, y) and not BID[y][x] and G[y][x] not in 'rcdwWLtaPqyjm' and (x, y) not in keep and (x, y) not in OBJ
def near(x, y, s, r=1): return any(inside(x + a, y + b) and G[y + b][x + a] in s for a in range(-r, r + 1) for b in range(-r, r + 1))
def crowded(x, y, r=1): return any((x + a, y + b) in OBJ for a in range(-r, r + 1) for b in range(-r, r + 1))
for y in range(2, H - 1):
    for x in range(1, W - 1):
        if not can(x, y) or crowded(x, y, 2): continue
        g = G[y][x]
        if g in 'sg' and near(x, y, 'r') and y % 9 == 2 or g in 'eu' and near(x, y, 'aP') and (y * 5 + x * 3) % 37 == 0: OBJ[x, y] = 'l'
plaza = [p for p in fill(rings(way[430275575]))]
for x, y in plaza:                                # 금잔디 둘레 벤치
    for a, b in ((0, -1), (0, 1)):
        if inside(x, y + b) and G[y + b][x] != 'j' and can(x, y + b) and x % 6 == 0 and not crowded(x, y + b, 1): OBJ[x, y + b] = 'b'
for y in range(2, H - 1):
    for x in range(1, W - 1):
        if not can(x, y) or crowded(x, y): continue
        g = G[y][x]; nb = any(inside(x + a, y + b) and BID[y + b][x + a] for a in (-1, 0, 1) for b in (-1, 0, 1)); r = random.random()
        if nb: continue
        inM = False
        if g == 'f' and not near(x, y, 'pta') and r < .34: OBJ[x, y] = random.choice('ppnoorg')
        elif g == 'g' and not near(x, y, 'pq') and r < .13: OBJ[x, y] = random.choice('gropn')
        elif g == 'e' and not near(x, y, 'pa') and r < .075: OBJ[x, y] = random.choice('ggorn')
        elif g == 's' and near(x, y, 'r') and y % 7 == 0 and r < .8: OBJ[x, y] = 'g'
        elif g in 'geu' and r > .985: OBJ[x, y] = 'h'                           # 관목
        elif g in 'eus' and r > .978 and near(x, y, 'aP', 2): OBJ[x, y] = 'k'   # 할로윈 호박
# 거리 소품: 가게 앞 화분·자판기·입간판·자전거·스쿠터, 골목 전봇대
for y in range(2, H - 2):
    for x in range(2, W - 2):
        if not can(x, y) or crowded(x, y): continue
        up = BID[y - 1][x]; g = G[y][x]; r = random.random()
        if up and g in 'us' and B[up - 1]['k'] in 'nxN' and B[up - 1]['k'] != 'N' and BID[y - 1][x - 1] == up and BID[y - 1][x + 1] == up:
            if r < .07: OBJ[x, y] = 'F'
            elif r < .10: OBJ[x, y] = 'V'
            elif r < .145 and B[up - 1]['k'] == 'n': OBJ[x, y] = 'S'
            elif r < .18: OBJ[x, y] = 'I'
            elif r < .205: OBJ[x, y] = 'C'
        elif g == 'u' and not up and near(x, y, 'aP') and not near(x, y, 'aP', 0) and (x * 3 + y * 7) % 41 == 0: OBJ[x, y] = 'T'
# 7) 도달 가능
WALKBAD = 'wWL'
def walk(x, y): return inside(x, y) and not BID[y][x] and G[y][x] not in WALKBAD and (x, y) not in OBJ
def nearest(x, y, ok, r=20):
    best = None
    for j in range(max(0, y - r), min(H, y + r + 1)):
        for i in range(max(0, x - r), min(W, x + r + 1)):
            if ok(i, j) and (best is None or (i - x) ** 2 + (j - y) ** 2 < best[0]): best = ((i - x) ** 2 + (j - y) ** 2, i, j)
    return best and [best[1], best[2]]
def flood(s):
    seen = {tuple(s)}; q = deque(seen)
    while q:
        x, y = q.popleft()
        for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if (x + a, y + b) not in seen and walk(x + a, y + b): seen.add((x + a, y + b)); q.append((x + a, y + b))
    return seen
byname = {b['n']: i for i, b in enumerate(B) if b['n']}
su = B[byname['학생회관']]
road0 = nearest(*map(round, A(-65, -92)), lambda x, y: walk(x, y) and G[y][x] == 'a')
reach = flood(road0)
cand = [p for p in su['t'] if (p[0], p[1] + 1) in reach and (p[0] - 1, p[1]) in su['t'] and (p[0] + 1, p[1]) in su['t'] and (p[0] - 1, p[1] + 1) in reach]
mx = sum(p[0] for p in su['t']) / len(su['t'])
su_door = min(cand, key=lambda p: abs(p[0] - mx))
# 건강한 빵집: 정문 앞 길가의 이름 없는 상가 건물 하나를 빵집으로 (가상의 가게)
def shop_at(name, cx, cy):
    best = None
    for i, b in enumerate(B):
        if b['n'] or b['k'] != 'n' or len(b['t']) < 20: continue
        ts = set(b['t']); xs = [p[0] for p in b['t']]; ys = [p[1] for p in b['t']]
        if max(xs) - min(xs) < 6 or max(ys) - min(ys) < 3: continue
        mx = (min(xs) + max(xs)) / 2
        dr = [p for p in b['t'] if (p[0], p[1] + 1) in reach and (p[0] - 1, p[1]) in ts and (p[0] + 1, p[1]) in ts and (p[0], p[1] - 2) in ts and G[p[1] + 1][p[0]] in 'sarPpe']
        if not dr: continue
        d = math.hypot(mx - cx, sum(ys) / len(ys) - cy)
        if best is None or d < best[0]: best = (d, i, min(dr, key=lambda p: abs(p[0] - mx)))
    B[best[1]]['k'], B[best[1]]['n'] = 'N', name
    return dict(id=best[1] + 1, door=list(best[2]))
bk = shop_at('건강한 빵집', *map(int, A(175, 262)))
doors = dict(hub=dict(id=byname['학생회관'] + 1, door=list(su_door)), nc=dict(id=nc[0], door=nc[1]), bk=bk)
for k, d in doors.items(): assert (d['door'][0], d['door'][1] + 1) in reach, k
exits = {}
for n in node.values():
    t = tag(n)
    if t.get('railway') == 'subway_entrance' and t.get('ref') in ('1', '4'):
        q = nearest(*map(int, P(n['lon'], n['lat'])), lambda i, j: (i, j) in reach and (i, j + 1) in reach and G[j][i] == 's', 24)
        if q: exits[t['ref']] = q
data = dict(exits=exits, W=W, H=H, g=''.join(f'{n if n > 1 else ""}{c}' for c, n in (lambda o: o)([(k, len(list(v))) for k, v in __import__('itertools').groupby(c for r in G for c in r)])),
    b=[v for k, g in __import__('itertools').groupby(v for r in BID for v in r) for v in (k, len(list(g)))],
    B=[[b['k'], b['l'], b['n'], [round(v * 16) for p in b['p'] for v in p]] for b in B],
    obj=[[x, y, k] for (x, y), k in sorted(OBJ.items(), key=lambda t: (t[0][1], t[0][0]))], ginkgo=GINKGO, lines=lines, doors=doors,
    places=[[n, *map(round, A(x, y))] for n, x, y in [('명륜당 은행나무', 115, 112), ('대성전', 115, 172), ('학생회관', -65, -95), ('금잔디광장', -68, -186), ('600주년기념관', 50, -50), ('중앙학술정보관', 35, -142),
        ('경영관', -87, -224), ('대운동장', -210, -150), ('퇴계인문관', -160, -282), ('수선관', -255, -180), ('법학관', -314, -140), ('국제관', 98, 25), ('정문 앞', 175, 262), ('낫컴플리트 골목', 266, 330), ('명륜동 골목', 230, -100), ('대명사거리', 292, 512), ('대명거리', 420, 480), ('혜화역 앞', 535, 480), ('혜화동로터리 가는 길', 470, 345), ('성대 앞 골목', 360, 400), ('비천당', 35, 22), ('양현관', -10, -345)]])
open(os.path.join(SRC, 'map.js'), 'w', encoding='utf-8').write('const MAP=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';')
print(f'{W}x{H} 실제건물 {real} 채운건물 {len(B) - real - 1} 소품 {len(OBJ)} 도달 {len(reach)} map.js {os.path.getsize(os.path.join(SRC, "map.js")) // 1024}KB'); print(doors, 'nc오차', nc[2], 'm', GINKGO)
print([b['n'] for b in B if b['n']])
for n, x, y in data['places']: print(n, (x, y), nearest(x, y, lambda i, j: (i, j) in reach))
pr = lambda x0, y0, x1, y1: [print(''.join('+' if (x, y) in OBJ else '#' if BID[y][x] else G[y][x] for x in range(x0, x1))) for y in range(y0, y1)]
if len(sys.argv) > 2: pr(195, 215, 285, 310); print(); pr(240, 320, 335, 366); print(); pr(100, 110, 180, 160)
elif os.path.exists(os.path.join(SRC, 'main.js')): bundle()

# Usage (from the repo root): python tools/grad-wall/build.py tools/grad-wall site
# Build the homepage "graduate wall" from the graduates page (names, city, year) and insert it into index.html.
import re, json, sys
SP, SITE = sys.argv[1], sys.argv[2]
h = open(SITE + '/leaderflow-development-program/leaderflow-graduates/index.html', encoding='utf-8').read()
info = {}
year = city = None
for m in re.finditer(r'<h2 class="visually-hidden">(\d{4}) Cohort</h2>|<summary>(.*?)</summary>|<li class="person">(.*?)</li>', h, re.S):
    if m.group(1): year = m.group(1)
    elif m.group(2): city = m.group(2)
    else:
        b = m.group(3); slug = re.search(r'grads/([a-z0-9-]+)-240\.webp', b)
        if slug:
            ws = sorted(int(x) for x in set(re.findall(re.escape(slug.group(1)) + r'-(\d+)\.webp', b)))
            info[slug.group(1)] = dict(name=re.search(r'<h3>(.*?)</h3>', b).group(1), city=city, year=year, ws=ws)
big = json.load(open(SP + '/sharp-grads.json'))  # graduates with a 360px+ photo
COLS = [[6, 19, 30, 41, 65, 0, 52, 88, 15, 72], [21, 4, 33, 59, 12, 85, 64, 9, 86, 46], [39, 66, 57, 23, 95, 11, 36, 89, 5, 73], [3, 7, 10, 14, 20, 26, 31, 34, 44, 49]]
def card(i, dup):
    p = info[big[i]['slug']]; s = big[i]['slug']
    srcset = ', '.join(f'assets/img/grads/{s}-{w}.webp {w}w' for w in p['ws'])
    return (f'<figure class="wall__card"><img src="assets/img/grads/{s}-240.webp" srcset="{srcset}" sizes="(min-width: 1100px) 180px, 15vw" '
            f'alt="" width="240" height="300" decoding="async" loading="lazy">'  # lazy: phones hide the wall, so they never download it
            f'<figcaption><strong>{p["name"]}</strong><span>{p["city"]} · {p["year"]}</span></figcaption></figure>')
# Phones: a small row of overlapping faces inside the link (hidden, so never downloaded, on larger screens)
FACES = [19, 21, 66, 41]
faces = '<span class="wall__faces" aria-hidden="true">' + ''.join(
    f'<img src="assets/img/grads/{big[i]["slug"]}-240.webp" alt="" width="240" height="300" loading="lazy" decoding="async">' for i in FACES) + '</span>'
cols = []
for k, col in enumerate(COLS):
    cards = ''.join(card(i, k == 3) for i in col) + ''.join(card(i, True) for i in col)
    cols.append(f'      <div class="wall__col"><div class="wall__track">{cards}</div></div>')
wall = ('  <!-- GRADUATE WALL: real LeaderFlow graduates (photos from the Graduates page), in three (or four) columns that drift slowly.\n'
        '       Each column holds its ten photos twice so the loop is seamless; the fourth column only shows on very wide screens. site.js lights one graduate at a time. Decorative,\n'
        '       so it is hidden from screen readers; the link below it goes to the full Graduates page. -->\n'
        '  <div class="hero__wall" data-wall>\n    <div class="wall" aria-hidden="true">\n' + '\n'.join(cols) + '\n    </div>\n'
        '    <a class="wall__link" href="leaderflow-development-program/leaderflow-graduates/">' + faces + '<span>Meet our graduates</span></a>\n  </div>\n')
idx = SITE + '/index.html'; s = open(idx, encoding='utf-8').read()
s, n = re.subn(r'  <div class="hero__photo">.*?</div>\n  </div>\n', lambda m: wall, s, count=1, flags=re.S)
if not n: s, n = re.subn(r'  <!-- GRADUATE WALL:.*?</a>\n  </div>\n', lambda m: wall, s, count=1, flags=re.S)
assert n == 1
open(idx, 'w', encoding='utf-8', newline='').write(s); print('ok')
for c in COLS: print([info[big[i]['slug']]['name'] + ' ' + info[big[i]['slug']]['city'] + ' ' + str(info[big[i]['slug']]['ws']) for i in c][:3])

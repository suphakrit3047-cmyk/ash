# each realm shows its own picture (map, birth, travel tab), and its yearly way of life runs in a real game
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from common import *
OUT = os.environ.get('SHOTS', '/tmp')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        pg = await open_game(b, 1000, 1400, errs)
        n = await pg.evaluate("REALMS.filter(r => { realmInfo(r.id); const el = document.getElementById('realmInfo'); return el.querySelector('.rcard') && el.textContent.includes(REALM_INFO[r.id].places[0][0]); }).length")
        print('map cards', n); assert n == 7
        await pg.evaluate("realmInfo('grieve'); document.querySelector('#realmInfo details').open = true")
        await (await pg.query_selector('#realmInfo')).screenshot(path=f'{OUT}/realm_map.png')
        await start_life(pg)
        t = await pg.evaluate("document.getElementById('bRealmC').textContent.length")
        print('birth card chars', t); assert t > 300
        # a life in each realm: run years and collect the realm's own yearly lines
        got = await pg.evaluate("""(() => { const o = {};
          for (const r of REALMS) { const q = makePerson(r); q.cls = Math.min(2, Math.max(q.cls, r.id === 'serenth' ? 0 : 2)); let lines = [];
            for (let i = 0; i < 60 && q.alive; i++) { const out = []; REALM_YEAR[r.id](q, out); lines.push(...out); q.age++; }
            o[r.id] = lines.length; }
          return o; })()""")
        print('yearly realm lines in 60 years', got)
        assert all(got[k] > 0 for k in got if k != 'serenth')
        await pg.evaluate("P.realm = RBY.dunes; P.age = 20; renderTravel()")
        await pg.wait_for_timeout(200)
        has = await pg.evaluate("document.getElementById('paneTravel').textContent.includes('รู้จัก' + RBY.dunes.name)")
        print('travel tab section', has); assert has
        m = await open_game(b, 390, 900, errs)
        await m.evaluate("realmInfo('kragmor'); document.querySelector('#realmInfo details').open = true")
        w = await m.evaluate("document.documentElement.scrollWidth")
        print('mobile scroll width', w); assert w <= 392
        await (await m.query_selector('#realmInfo')).screenshot(path=f'{OUT}/realm_mobile.png')
        print('errors', errs); assert not errs
        await b.close()
run(main)

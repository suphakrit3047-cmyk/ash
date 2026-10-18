# the yearly log: fewer, more varied lines; threads and new events show up without errors
from common import *
import re
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        pg = await open_game(b, errs=errs); await start_life(pg)
        await play(pg, 1400, until_age=45)
        years = await pg.evaluate("[...document.querySelectorAll('#log li')].map(li=>[li.querySelector('.y')?.innerText||'', [...li.querySelectorAll('.body p')].map(x=>x.className+'|'+x.innerText)])")
        lines = [t.split('|',1)[1] for _, ps in years for t in ps if t.split('|',1)[0] in ('', 'event')]
        per = [len([t for t in ps if t.split('|',1)[0] == '']) for _, ps in years]
        print('years', len(years), 'narration lines per year avg %.2f' % (sum(per)/max(1,len(per))))
        body = [re.sub(r'^\S+ · ', '', t) for t in lines]
        print('distinct narration %d of %d' % (len(set(body)), len(body)))
        for y, ps in years[::-1][20:26]:
            print('--', y); [print('   ', t.split('|',1)[1][:110]) for t in ps]
        print('npc', await pg.evaluate("JSON.stringify(Object.keys(P.npc||{}))"))
        await pg.screenshot(path='/tmp/story_log.png')
        await pg.evaluate("setTab('fam'); renderFam(); 0"); await pg.wait_for_timeout(200)
        print('fam pane:', (await pg.evaluate("document.getElementById('paneFam').innerText"))[-400:])
        assert not errs, errs
        print('PASS'); await b.close()
run(main)

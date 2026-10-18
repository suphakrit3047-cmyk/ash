import asyncio, random, re, time
from playwright.async_api import async_playwright
BAD=re.compile(r'ทรัพย์\s?\d|NaN|undefined|Infinity|\d+\.\d{3,}|\bnull\b|\[object|เงิน เงิน|ทอง ทอง|ต้องมี\d')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1100,'height':900})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        cons=[]; pg.on('console',lambda m: cons.append(m.text[:150]) if m.type=='error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
        t0=time.time()
        await pg.set_content('<!doctype html><meta charset=utf-8><body>'+open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','..','index.html'),encoding='utf-8').read()+'</body>')
        await pg.wait_for_function("!document.getElementById('startBtn').disabled", timeout=60000)
        print('load to ready: %.1fs'%(time.time()-t0))
        await pg.evaluate("tutState = () => ({seen:[],off:true}); setSpeed(2)")
        found=set(); clicks=0; lives=0; maxage=[]
        random.seed(7)
        for life in range(8):
            await pg.click('#startBtn'); await pg.wait_for_selector('#liveBtn', state='visible'); await pg.click('#liveBtn'); await pg.wait_for_timeout(100)
            lives+=1
            for step in range(1800):
                if await pg.is_visible('#end'): break
                try:
                    if await pg.is_visible('#combat'):
                        bs=await pg.query_selector_all('#cbActs button:not([disabled])'); await random.choice(bs).click(); clicks+=1
                    elif await pg.is_visible('#choice'):
                        bs=await pg.query_selector_all('#cOpts button:not([disabled])'); await random.choice(bs).click(); clicks+=1
                    elif random.random()<.35:
                        tabs=[t for t in ['#tabLife','#tabChar','#tabFam','#tabMoney','#tabTravel'] if await pg.is_visible(t)]
                        await pg.click(random.choice(tabs)); clicks+=1
                        bs=await pg.query_selector_all('#life button:not([disabled]):visible')
                        bs=[x for x in bs if (await x.get_attribute('id')) not in ('skipBtn','pauseBtn')]
                        for _ in range(3):
                            if not bs: break
                            x=random.choice(bs)
                            try: await x.click(timeout=500); clicks+=1
                            except: pass
                        # scan visible text
                        for sel in ['#paneChar','#paneMoney','#paneFam','#paneTravel','#log','#lMeta','#focusHint','#conds']:
                            try:
                                if await pg.is_visible(sel):
                                    t=await pg.inner_text(sel)
                                    for m in BAD.finditer(t): found.add(sel+': …'+t[max(0,m.start()-40):m.end()+25].replace('\n',' ')+'…')
                            except: pass
                    else: await pg.click('#skipBtn', timeout=600)
                except Exception: pass
                await pg.wait_for_timeout(5)
            maxage.append(await pg.evaluate('P.age'))
            try:
                t=await pg.inner_text('#end')
                for m in BAD.finditer(t): found.add('end: …'+t[max(0,m.start()-40):m.end()+25].replace('\n',' ')+'…')
            except: pass
            await pg.evaluate("clearSave(); show('intro'); renderResume()")
        print('lives',lives,'clicks',clicks,'ages',maxage)
        print('SUSPICIOUS'); [print('  ',x[:200]) for x in sorted(found)[:30]]
        print('pageerrors', errs[:10]); print('console errors', cons[:10])
        await b.close()
asyncio.run(main())

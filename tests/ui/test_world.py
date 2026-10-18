import asyncio
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        await pg.goto(URL, wait_until='domcontentloaded'); await pg.wait_for_function("!document.getElementById('startBtn').disabled", timeout=60000)
        await pg.evaluate("localStorage.clear(); tutSave({seen:[],off:true})")
        await pg.click('#startBtn'); await pg.wait_for_selector('#liveBtn', state='visible'); await pg.click('#liveBtn'); await pg.wait_for_timeout(300)
        inf0=await pg.evaluate("P.realm.infant"); rid=await pg.evaluate("P.realm.id")
        await pg.evaluate("checkChoice=()=>null; P.cls=2; P.age=40; P.wealth=900; build(P,'well'); build(P,'clinic')")
        await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_function("!document.getElementById('startBtn').disabled", timeout=60000)
        print('works after reload', await pg.evaluate(f"worksIn('{rid}').map(x=>x.id)"), 'infant', inf0, '->', await pg.evaluate(f"RBY['{rid}'].infant"))
        print('errors', errs); await b.close()
asyncio.run(main())

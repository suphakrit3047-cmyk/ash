import asyncio
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(); pg=await ctx.new_page()
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        await pg.goto(URL, wait_until='domcontentloaded'); await pg.wait_for_function("!document.getElementById('startBtn').disabled", timeout=60000)
        await pg.evaluate("localStorage.clear(); tutSave({seen:[],off:true}); setSpeed(2)")
        await pg.click('#startBtn'); await pg.wait_for_selector('#liveBtn', state='visible'); await pg.click('#liveBtn'); await pg.wait_for_timeout(300)
        await pg.evaluate("checkChoice=()=>null; P.cls=2; P.age=40; gainRelic(P,'bell','x'); gainRelic(P,'tooth','y'); P.wealth=300; ensureSkills(P); ensureCareer(P); catchIll(P,'ashlung'); addCurse(P,'ruin','x'); P.loan={left:5,pay:3,missed:0}; P.home={tier:4,status:'own',realm:P.realm.id}; P.land={realm:'grieve',plots:3,share:.5}; addMat(P,'ore',3); P.will='split'; P.care=false; renderLife()")
        before=await pg.evaluate("JSON.stringify({w:Math.round(P.wealth),ills:ills(P).map(x=>x.id),cur:curses(P).map(x=>x.id),loan:P.loan,home:P.home.tier,land:P.land.plots,ore:P.inv.ore,will:P.will,fam:P.fam.length,realm:P.realm.id})")
        # force a save at year start
        await pg.click('#skipBtn'); await pg.wait_for_timeout(800)
        saved=await pg.evaluate("JSON.stringify({w:Math.round(P.wealth),ills:ills(P).map(x=>x.id),cur:curses(P).map(x=>x.id),loan:P.loan,home:P.home.tier,land:P.land.plots,ore:P.inv.ore,will:P.will,fam:P.fam.length,realm:P.realm.id,age:P.age,rel:relics(P).map(x=>x.id)})")
        await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_function("!document.getElementById('startBtn').disabled", timeout=60000)
        vis=await pg.is_visible('#resumeCard'); print('resume card', vis)
        await pg.click('#resumeBtn'); await pg.wait_for_timeout(500)
        after=await pg.evaluate("JSON.stringify({w:Math.round(P.wealth),ills:ills(P).map(x=>x.id),cur:curses(P).map(x=>x.id),loan:P.loan,home:P.home.tier,land:P.land.plots,ore:P.inv.ore,will:P.will,fam:P.fam.length,realm:P.realm.id,age:P.age,rel:relics(P).map(x=>x.id)})")
        print('saved :',saved); print('loaded:',after); print('match', saved==after)
        for t in ['#tabChar','#tabFam','#tabMoney','#tabTravel']: await pg.click(t); await pg.wait_for_timeout(100)
        print('errors', errs); await b.close()
asyncio.run(main())

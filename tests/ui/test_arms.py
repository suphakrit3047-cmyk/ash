import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1000,'height':1400})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.set_content('<!doctype html><meta charset=utf-8><body>'+open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','..','เกิดจากเถ้าถ่าน.html'),encoding='utf-8').read()+'</body>')
        await pg.wait_for_function("!document.getElementById('startBtn').disabled", timeout=60000)
        await pg.evaluate("tutState = () => ({seen:[],off:true}); setSpeed(0); SEC_DEFAULT.push('')")
        await pg.click('#startBtn'); await pg.wait_for_selector('#liveBtn', state='visible'); await pg.click('#liveBtn'); await pg.wait_for_timeout(300)
        E=pg.evaluate
        await E("clearTimeout(timer); checkChoice=()=>null; P.cls=2; P.royal=null; P.age=22; P.realm=RBY.grieve; P.health=80; ensureSkills(P); setWeapon(P,'sword'); gear(P).own.sword=1; P.skills.sword.r=2; renderLife(); setTab('travel'); renderTravel(); 0")
        sec=(await pg.query_selector_all('#paneTravel .sec'))
        for s_ in sec:
            t=await s_.inner_text()
            if 'ลานประลอง' in t: await s_.screenshot(path='/tmp/arena_sec.png'); print(t[:600])
        for rnd in range(4):
            await E("setTab('travel'); renderTravel(); 0")
            btn=await pg.query_selector('[data-t="arena:0"]')
            if await btn.is_disabled(): print('disabled now:', await btn.get_attribute('title')); break
            w0=await E("P.wealth"); await btn.click(); await pg.wait_for_timeout(200)
            print('prompt', await pg.inner_text('#cPrompt') if await pg.is_visible('#cPrompt') else '?')
            bs=await pg.query_selector_all('#cOpts button:not([disabled])'); await bs[0].click(); await pg.wait_for_timeout(200)
            for k in range(40):
                if not await pg.is_visible('#combat'): break
                acts=await pg.query_selector_all('#cbActs button:not([disabled])')
                if not acts:
                    cont=await pg.query_selector('#combat button:not([disabled])')
                    if cont: await cont.click()
                    await pg.wait_for_timeout(100); continue
                await acts[0].click(); await pg.wait_for_timeout(60)
            print('result', await E("P.lastFight"), 'wealth', w0,'->',await E("P.wealth"), 'wins', await E("P.flags.arenaWins"), 'alive', await E("P.alive"))
            print('log', await E("[...document.querySelectorAll('#log li p')].slice(-1).map(x=>x.innerText)"))
        await E("P.realm=RBY.grieve; setTab('travel'); renderTravel(); 0")
        await pg.click('[data-t="hunt"]'); await pg.wait_for_timeout(200)
        bs=await pg.query_selector_all('#cOpts button:not([disabled])'); print('hunt opts', [await x.inner_text() for x in bs])
        await bs[1].click(); await pg.wait_for_timeout(200)
        print('hunt log', await E("[...document.querySelectorAll('#log li p')].slice(-2).map(x=>x.innerText)"))
        await E("setTab('char'); renderChar(); 0"); 
        for s_ in await pg.query_selector_all('#paneChar .sec'):
            t=await s_.inner_text()
            if 'อาวุธและเกราะ' in t: print(t[:500])
        print('errors', errs); await b.close()
asyncio.run(main())

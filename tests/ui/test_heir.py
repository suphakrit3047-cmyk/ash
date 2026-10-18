import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1000,'height':1100})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        await pg.set_content('<!doctype html><meta charset=utf-8><body>'+open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','..','เกิดจากเถ้าถ่าน.html'),encoding='utf-8').read()+'</body>')
        await pg.wait_for_function("!document.getElementById('startBtn').disabled", timeout=60000)
        await pg.evaluate("tutState = () => ({seen:[],off:true}); setSpeed(0)")
        await pg.click('#startBtn'); await pg.wait_for_selector('#liveBtn', state='visible'); await pg.click('#liveBtn'); await pg.wait_for_timeout(300)
        await pg.evaluate("P.royal=null; P.cls=2; P.age=62; P.wealth=150; P.married=true; P.kin.spouse='คู่'; P.kidNames=['ลูกโต','ลูกเล็ก']; P.firstKidAge=27; P.career='smith'; famYear(P); die(P,'จากไปอย่างสงบด้วยวัยชรา'); clearTimeout(timer); endLife()")
        await pg.wait_for_timeout(300)
        await pg.click('#heirBtn'); await pg.wait_for_selector('#liveBtn', state='visible')
        print('birth card name:', await pg.inner_text('#bName'))
        print('age', await pg.evaluate("P.age"), 'career', await pg.evaluate("careerTitle(P)"), 'wealth', await pg.evaluate("money(P.wealth)"), 'alive', await pg.evaluate("P.alive"), 'skills', await pg.evaluate("SKILLS.filter(s=>rank(P,s.id)>0).map(s=>s.n+rank(P,s.id)).join(' ')"))
        await pg.click('#liveBtn'); await pg.wait_for_timeout(400)
        print('log:'); print(await pg.evaluate("[...document.querySelectorAll('#log li')].slice(-2).map(l=>l.innerText.replace(/\\n/g,' | ').slice(0,700))"))
        print('grid cells', await pg.evaluate("document.querySelectorAll('#grid > *').length"))
        await pg.click('#skipBtn'); await pg.wait_for_timeout(500)
        print('first year:', await pg.evaluate("[...document.querySelectorAll('#log li')][0].innerText.replace(/\\n/g,' | ').slice(0,400)"))
        await pg.click('#tabFam'); await pg.wait_for_timeout(150)
        print('fam:', (await pg.inner_text('#paneFam')).replace('\n',' | ')[:400])
        # sibling path: die at 9
        await pg.evaluate("die(P,'x'); clearTimeout(timer); endLife()"); await pg.wait_for_timeout(200)
        await pg.evaluate("clearSave(); startBirth()"); await pg.wait_for_selector('#liveBtn', state='visible'); await pg.click('#liveBtn'); await pg.wait_for_timeout(200)
        await pg.evaluate("P.age=9; die(P,'เสียชีวิตด้วยโรคตั้งแต่ยังเด็ก'); P.kidNames=[]; clearTimeout(timer); endLife()"); await pg.wait_for_timeout(300)
        if await pg.is_visible('#sibBtn'):
            await pg.click('#sibBtn'); await pg.wait_for_selector('#liveBtn', state='visible')
            print('sibling starts at age', await pg.evaluate("P.age"), await pg.inner_text('#bName'))
        else: print('no sib card (mother dead?)')
        print('errors', errs); await b.close()
asyncio.run(main())

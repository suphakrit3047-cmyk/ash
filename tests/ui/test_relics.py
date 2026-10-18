import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1000,'height':1300})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto('http://localhost:8765/เกิดจากเถ้าถ่าน.html', wait_until='domcontentloaded')
        await pg.evaluate("localStorage.clear()"); await pg.reload(wait_until='domcontentloaded')
        await pg.wait_for_function("!document.getElementById('startBtn').disabled", timeout=60000)
        await pg.evaluate("tutState = () => ({seen:[],off:true}); setSpeed(0); SEC_DEFAULT.push('')")
        await pg.click('#startBtn'); await pg.wait_for_selector('#liveBtn', state='visible'); await pg.click('#liveBtn'); await pg.wait_for_timeout(300)
        E=pg.evaluate
        await E("clearTimeout(timer); P.cls=2; P.royal=null; P.age=30; P.relics=[]")
        # 1 check bonus
        print('check bonus',await E("""()=>{P.checks=[];let a=0,b=0;for(let i=0;i<4000;i++){if(check(P,'CHA','speech',15))a++}gainRelic(P,'crown');gainRelic(P,'ring');for(let i=0;i<4000;i++){if(check(P,'CHA','speech',15))b++}const c=P.checks[P.checks.length-1];P.checks=[];return [a/4000,b/4000,c.dc,c.bonus]}"""))
        print('atk', await E("()=>{const a=pAtk(P);gainRelic(P,'knife');return [a,pAtk(P)]}"))
        print('ill hazard', await E("()=>{const f=()=>hazards(P).filter(h=>h[2]==='ill').map(h=>h[1]);const a=f();gainRelic(P,'amulet');return [a,f()]}"))
        print('relics', await E("relics(P).map(x=>x.id)"))
        print('yearly', await E("()=>{const r0=JSON.stringify(rep(P)),g0=guilt(P),h0=P.happy,w0=P.wealth;P.wealth=50;const t=applyFocus(P);return [r0,JSON.stringify(rep(P)),g0,guilt(P),h0,P.happy,50,P.wealth,t]}"))
        await E("renderLife(); setTab('char'); renderChar()"); await pg.wait_for_timeout(200)
        el=await pg.query_selector('.career.relic'); await el.screenshot(path='/tmp/relic_card.png')
        # 2 theft
        await E("const c=CHOICES.find(c=>c.id==='relicThief'); P.alive=true; window.CH={id:'relicThief',prompt:c.prompt(P),options:c.options(P)}; 0")
        print('thief prompt', await E("CH.prompt"))
        print('preview', await E("(()=>{try{return JSON.stringify(previewOption(P, CH.options[1]))}catch(e){return 'ERR '+e}})()"))
        print(await E("JSON.stringify(resolveChoice(P, CH.options[2]))"))
        print('relics after', await E("relics(P).map(x=>x.id)"), 'lostlist', await E("P.relicLost"))
        await E("syncRelics(P)"); print('storage', await E("localStorage.getItem('ash-relics')"))
        # 3 quest find of lost relic
        lost=await E("Object.entries(RW.lost)[0]"); print('lost', lost)
        await E(f"P.realm=RBY['{lost[1]}']; P.trip=null")
        print('found', await E("()=>{for(let i=0;i<60;i++){const t=payQuest(P,10,'x'); if(/ของวิเศษ/.test(t)) return [i,t]} return null}"))
        await E("syncRelics(P)"); print('storage after find', await E("localStorage.getItem('ash-relics')"))
        # fresh find
        print('fresh find', await E("()=>{P.realm=RBY.dunes;for(let i=0;i<300;i++){const t=payQuest(P,10,'x'); if(/ของวิเศษ/.test(t)) return [i,t]} return null}"))
        # 4 sell via UI
        await E("renderChar()"); btn=await pg.query_selector('[data-relic]'); rid=await btn.get_attribute('data-relic'); w0=await E("P.wealth")
        await btn.click(); print('sold',rid, w0,'->',await E("P.wealth"), await E("localStorage.getItem('ash-relics')"))
        # 5 inheritance
        ids=await E("relics(P).map(x=>x.id)"); print('before death', ids)
        await E("P.married=true; P.kidNames=['ลูกโต']; P.firstKidAge=20; famYear(P); die(P,'x'); endLife()"); await pg.wait_for_timeout(300)
        await pg.click('#heirBtn'); await pg.wait_for_selector('#liveBtn', state='visible')
        print('heir relics', await E("relics(P).map(x=>[x.id,x.how,x.gens])"), 'chips', await pg.inner_text('#bChips'))
        await pg.click('#liveBtn'); await pg.wait_for_timeout(300)
        # 6 new life -> lost
        await E("clearTimeout(timer); die(P,'x'); endLife()"); await pg.wait_for_timeout(200)
        await E("clearSave(); startBirth()"); await pg.wait_for_selector('#liveBtn', state='visible')
        print('new life relics', await E("relics(P).map(x=>x.id)"), 'world', await E("localStorage.getItem('ash-relics')"))
        # 7 royal birth heirlooms frequency
        print('royal heirloom', await E("()=>{let n=0,t=0;for(let i=0;i<300;i++){const q=makePerson(RBY.aurelis); if(!q.royal) continue; t++; if(birthRelics(q)) n++} return [n,t]}"))
        print('errors', errs); await b.close()
asyncio.run(main())

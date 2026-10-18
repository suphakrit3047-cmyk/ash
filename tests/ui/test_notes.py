# notifications come from real state changes: a parent dies, a sibling is born, illness, relics
from common import *
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        pg = await open_game(b, errs=errs); await start_life(pg)
        await pg.evaluate("window.TL=[]; const _t=toast; toast=(t,r)=>{TL.push([r.k,t,P.age]); _t(t,r)}; const mm=P.fam.find(m=>m.rel==='mother'); if(mm){mm.fixedAt=3; mm.fixedCause='เสียชีวิตด้วยไข้'}; 0")
        pauses = []
        async def on_pause(): pauses.append(await pg.evaluate('P.age'))
        await play(pg, 900, until_age=40, on_pause=on_pause)
        tl = await pg.evaluate('TL'); fam = await pg.evaluate("JSON.stringify(P.fam.map(m=>[m.rel,m.alive,m.dAge,m.never||0]))")
        for x in tl: print(' ', x)
        ok_mother = any(x[0] == 'loss' and 'แม่' in x[1] for x in tl)
        print('mother death toast:', ok_mother, '| pauses at', pauses)
        hl = await pg.evaluate("document.querySelectorAll('#log p.imp').length"); print('highlighted lines', hl)
        assert ok_mother and not errs, errs
        print('PASS'); await b.close()
run(main)

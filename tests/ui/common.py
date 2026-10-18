# shared helpers for the browser tests: load the built game into Chromium
import os, asyncio
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
INDEX = os.path.join(ROOT, 'index.html')
async def open_game(b, w=1000, h=1200, errs=None):
    pg = await b.new_page(viewport={'width': w, 'height': h})
    if errs is not None: pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.set_content('<!doctype html><meta charset=utf-8><body>' + open(INDEX, encoding='utf-8').read() + '</body>')
    await pg.wait_for_function("!document.getElementById('startBtn').disabled", timeout=90000)
    await pg.evaluate("tutState = () => ({seen:[],off:true}); setSpeed(2); SEC_DEFAULT.push('')")
    return pg
async def start_life(pg):
    await pg.click('#startBtn'); await pg.wait_for_selector('#liveBtn', state='visible'); await pg.click('#liveBtn'); await pg.wait_for_timeout(300)
async def play(pg, max_steps=1500, until_age=None, on_pause=None):
    """click through a life: pick random options, fight, skip seasons"""
    import random
    for i in range(max_steps):
        if await pg.is_visible('#end'): return 'end'
        if until_age is not None and await pg.evaluate('P.age') >= until_age: return 'age'
        try:
            if await pg.is_visible('#combat'):
                bs = await pg.query_selector_all('#cbActs button:not([disabled])')
                if bs: await bs[0].click()
            elif await pg.is_visible('#choice'):
                bs = await pg.query_selector_all('#cOpts button:not([disabled])'); await random.choice(bs).click()
            else:
                if await pg.evaluate('paused'):
                    if on_pause: await on_pause()
                    await pg.keyboard.press('Space')
                await pg.click('#skipBtn', timeout=800)
        except Exception: pass
        await pg.wait_for_timeout(10)
    return 'steps'
def run(main): asyncio.run(main())

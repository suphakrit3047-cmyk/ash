// Deterministic fingerprint of many simulated lives. Refactors must not change it.
// usage: node tests/golden.js          -> print hash
//        node tests/golden.js --save   -> write tests/golden.txt
//        node tests/golden.js --check  -> compare with tests/golden.txt
const { load } = require('./harness'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const G = load({ seed: 12345 });
const out = G.run(`(() => {
  const sum = p => [p.name, p.age, p.cause, Math.round(p.wealth * 100), p.cls, p.career, p.careerRank, Math.round(p.health), Math.round(p.happy), Math.round(p.know),
    Object.keys(p.flags).sort().join(','), JSON.stringify(p.rep || {}), Math.round((p.guilt || 0) * 100), (p.fam || []).map(m => m.rel + m.alive + (m.diedAge ?? '')).join(';'),
    (p.ills || []).map(x => x.id).join(','), (p.curses || []).map(x => x.id).join(','), p.home ? p.home.tier + p.home.status : '', p.biz ? p.biz.id : '', p.kidNames.length, p.lv];
  const res = [];
  for (const r of REALMS) for (let i = 0; i < 25; i++) res.push(sum(simLife(r)));
  // an heir of a simulated parent, fast-forwarded to their real age
  for (let i = 0; i < 6; i++) {
    const par = simLife(REALMS[i % REALMS.length]);
    if (par.kidNames.length) { const h = makePerson(null, par); fastForward(h, heirAge(h, par, null)); res.push(['heir', ...sum(h)]); }
  }
  // a played life: not a bot, takes quests, arena, hunts, relics, treatment, buildings, wills
  const resolve = (p, ch) => { if (!ch) return; const ok = ch.options.filter(o => !o.need || o.need(p)); const o = pick(ok); resolveChoice(p, o); if (p.pendingFight) autoFight(p); };
  for (let i = 0; i < 70; i++) {
    const p = makePerson(REALMS[i % REALMS.length]); birthRelics(p);
    if (i % 5 === 0) gainRelic(p, RIDS[i % RIDS.length], 'test');
    while (p.alive && p.age < 110) {
      if (p.age >= 7 && Math.random() < .2) p.focus = pick(FOCI);
      if (p.age === 12 && !canArm(p)) setWeapon(p, pick(['sword', 'spear', 'bow']));
      if (p.age >= 14 && Math.random() < .15) { const s = shopList(p).filter(x => !x.why); if (s.length) buy(p, pick(s).id); }
      if (p.age >= 14) { ensureCareer(p); if (Math.random() < .1) { const open = CAREERS.filter(c => !c.base && !careerMissing(p, c).length); if (open.length) takeCareer(p, pick(open).id); } }
      if (Math.random() < .3 && !canQuest(p)) { const b = questBoard(p); if (b.length) resolve(p, startQuest(p, pick(b).id)); }
      if (p.alive && Math.random() < .3 && !canArena(p, 0)) resolve(p, startArena(p, Math.random() < .7 ? 0 : 1));
      if (p.alive && Math.random() < .2 && !canHunt(p)) resolve(p, startHunt(p));
      if (p.alive && ills(p).length) { const x = ills(p)[0]; const m = pick(Object.keys(TREAT_L)); if (!treatWhy(p, x, m)) treat(p, 0, m); }
      if (p.alive && p.age >= 30 && Math.random() < .05) { const id = pick(Object.keys(WORKS)); if (!canBuild(p, id)) build(p, id); }
      if (p.alive && p.age === 40) setWill(p, pick(Object.keys(WILLS)));
      if (p.alive && p.age === 55 && !canCare(p)) toggleCare(p);
      if (p.alive && p.age === 50 && relics(p).length && Math.random() < .3) sellRelic(p, relics(p)[0].id);
      if (!p.alive) break;
      resolve(p, checkChoice(p));
      if (!p.alive) break;
      const r = finishYear(p); syncRelics(p);
      if (r.fate) { resolve(p, r.fate); afterFate(p); }
    }
    res.push(['played', ...sum(p), relics(p).map(x => x.id).join(','), Math.round((p.flags.arenaWins || 0)), p.flags.quests || 0]);
  }
  res.push(JSON.stringify(RW));
  return JSON.stringify(res);
})()`);
const hash = crypto.createHash('sha256').update(out).digest('hex').slice(0, 16);
const file = path.join(__dirname, 'golden.txt');
if (process.argv.includes('--dump')) fs.writeFileSync(path.join(__dirname, '..', 'build', 'golden.json'), out);
if (process.argv.includes('--save')) { fs.writeFileSync(file, hash + '\n'); console.log('saved', hash); }
else if (process.argv.includes('--check')) { const want = fs.readFileSync(file, 'utf8').trim(); console.log(hash === want ? 'golden OK ' + hash : 'GOLDEN CHANGED ' + want + ' -> ' + hash); process.exit(hash === want ? 0 : 1); }
else console.log(hash, (out.length / 1024).toFixed(0) + 'KB of results');

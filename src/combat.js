// ===== WEAPONS & COMBAT =====
// --- new weapon skills (sword and bow already exist) ---
(() => {
  const add = [
    { id: 'spear', n: 'หอก', a: 'STR', g: 'การต่อสู้', min: 10 },
    { id: 'axe', n: 'ขวาน', a: 'STR', g: 'การต่อสู้', min: 10 },
    { id: 'dagger', n: 'มีดสั้น', a: 'DEX', g: 'การต่อสู้', min: 8 },
    { id: 'shield', n: 'โล่', a: 'CON', g: 'การต่อสู้', min: 10 },
  ];
  const i = SKILLS.findIndex(s => s.id === 'bow') + 1;
  SKILLS.splice(i, 0, ...add);
  add.forEach(s => SBY[s.id] = s);
})();
function ensureSkills(p) { SKILLS.forEach(s => { if (!p.skills[s.id]) p.skills[s.id] = { r: 0, x: 0 }; }); gear(p); }

extend('access', 'combat: who may train spear, axe, dagger and shield', inner => function (p, sid) {
  const no = why => ({ ok: false, why, mult: 0, cost: 0 });
  if (!['spear', 'axe', 'dagger', 'shield'].includes(sid)) return inner(p, sid);
  const s = SBY[sid], r = p.realm.id, f = p.flags;
  if (p.age < s.min) return no(`เริ่มฝึกได้ตอนอายุ ${s.min} ปี`);
  if (p.cls === 4) return no('ทาสห้ามจับอาวุธ');
  const army = f.enlisted || f.soldier > 0 || f.knight;
  if (sid === 'spear') return army ? { ok: true, mult: 1.2, cost: 0, label: 'ครูฝึกในกองทัพ' } : r === 'grieve' ? { ok: true, mult: .9, cost: 0, label: 'คนในหมู่บ้านฝึกไว้ป้องกันตัว' } : { ok: true, mult: .5, cost: 0, label: 'ฝึกเองกับด้ามไม้' };
  if (sid === 'axe') return (r === 'kragmor' || p.race === 'ออร์ค' || p.race === 'คนแคระ') ? { ok: true, mult: 1.1, cost: 0, label: 'ขวานคืออาวุธประจำเผ่า' } : { ok: true, mult: .6, cost: 0, label: 'ฝึกจากการผ่าฟืน' };
  if (sid === 'dagger') return f.thiefGuild ? { ok: true, mult: 1.3, cost: 0, label: 'กลุ่มโจรสอนให้' } : r === 'undercity' ? { ok: true, mult: 1, cost: 0, label: 'ตรอกซอกซอยใต้กำแพง' } : { ok: true, mult: .6, cost: 0, label: 'ฝึกเอง' };
  if (sid === 'shield') return army ? { ok: true, mult: 1.2, cost: 0, label: 'ครูฝึกในกองทัพ' } : { ok: true, mult: .4, cost: 0, label: 'ไม่มีใครสอนใช้โล่' };
});

// --- gear ---
const WEAPONS = {
  none: { n: 'มือเปล่า', a: 'STR', die: 4, v: 'ต่อย', skill: null },
  sword: { n: 'ดาบ', a: 'STR', die: 8, v: 'ฟัน', skill: 'sword', sp: { n: 'ฟันสองครั้ง', d: 'โจมตีสองครั้ง แต่แม่นน้อยลง' } },
  spear: { n: 'หอก', a: 'STR', die: 8, v: 'แทง', skill: 'spear', sp: { n: 'รั้งระยะ', d: 'โจมตี แถมศัตรูตีโดนยากขึ้นในยกนี้' } },
  axe: { n: 'ขวาน', a: 'STR', die: 10, hit: -1, v: 'จาม', skill: 'axe', sp: { n: 'ฟันหนัก', d: 'แม่นน้อยลง แต่แรงเป็นสองเท่า' } },
  bow: { n: 'ธนู', a: 'DEX', die: 8, v: 'ยิง', skill: 'bow', sp: { n: 'ถอยแล้วยิง', d: 'ถอยออกไปแล้วยิง แม่นน้อยลง ศัตรูตีโดนยากขึ้นในยกนี้ ใช้ติดกันสองยกไม่ได้' } },
  dagger: { n: 'มีดสั้น', a: 'DEX', die: 4, hit: 1, v: 'แทง', skill: 'dagger', sp: { n: 'แทงจุดตาย', d: 'แม่นน้อยลงมาก แต่แรงเป็นสามเท่า' } },
};
const TIER = ['ทำเอง', 'ธรรมดา', 'ช่างฝีมือ'];
const ARMOR = ['ไม่มีเกราะ', 'เกราะหนัง', 'เกราะเหล็ก'];
function gear(p) { if (!p.gear) p.gear = { w: 'none', own: {}, armor: 0, shield: false }; return p.gear; }
function canArm(p) { if (p.cls === 4) return 'ทาสห้ามพกอาวุธ'; if (p.age < 12) return 'ต้องอายุ 12 ปีขึ้นไป'; return null; }
function priceMod(p) { return (has(p, 'kragmor') ? .7 : 1) * (rank(p, 'smith') >= 2 ? .5 : 1); }
const SHOP = {
  weapon: t => [0, 8, 25][t], armor: t => [0, 10, 30][t], shield: () => 6,
};
function shopList(p) {
  const g = gear(p), m = priceMod(p), why = canArm(p), out = [];
  const w = g.w;
  if (w !== 'none') { const t = g.own[w] || 0; if (t < 2) out.push({ id: 'weapon', n: `${WEAPONS[w].n}${TIER[t + 1]}`, cost: Math.ceil(SHOP.weapon(t + 1) * m) }); }
  if (g.armor < 2) out.push({ id: 'armor', n: ARMOR[g.armor + 1], cost: Math.ceil(SHOP.armor(g.armor + 1) * m) });
  if (!g.shield) out.push({ id: 'shield', n: 'โล่ไม้หุ้มเหล็ก', cost: Math.ceil(SHOP.shield() * m) });
  return out.map(x => ({ ...x, why: why || (p.wealth < x.cost ? `ทรัพย์ไม่พอ (ต้องมี ${money(x.cost)})` : null) }));
}
function buy(p, id) {
  const item = shopList(p).find(x => x.id === id); if (!item || item.why) return false;
  const g = gear(p); p.wealth = clampW(p.wealth - item.cost);
  if (id === 'weapon') g.own[g.w] = (g.own[g.w] || 0) + 1;
  if (id === 'armor') g.armor++;
  if (id === 'shield') g.shield = true;
  return true;
}
function setWeapon(p, w) { const g = gear(p); g.w = w; if (w !== 'none' && g.own[w] == null) g.own[w] = 0; }
const wpn = p => WEAPONS[gear(p).w];
const wtier = p => { const g = gear(p); return g.w === 'none' ? 0 : (g.own[g.w] || 0); };

// --- combat numbers ---
function hpMax(p) { return Math.max(6, 6 + am(p, 'CON') * 2 + Math.floor(p.lv / 2) + Math.floor(p.health / 10)); }
function pAtk(p) { const W = wpn(p); return am(p, W.a) + (W.skill ? rank(p, W.skill) : 0) + wtier(p) + (W.hit || 0); }
// armour limits how much a quick body helps; a bow needs both hands, so no shield with it
function pAC(p) { const g = gear(p); return 10 + Math.min(am(p, 'DEX'), [9, 2, 1][g.armor]) + g.armor * 2 + (g.shield && g.w !== 'bow' ? 2 + Math.floor(rank(p, 'shield') / 2) : 0); }
function pDmg(p) { const W = wpn(p); return 1 + Math.floor(Math.random() * W.die) + Math.max(0, am(p, W.a)) + wtier(p) + (W.skill ? Math.floor(rank(p, W.skill) / 2) : 0); }
const hitChance = (bonus, ac) => Math.max(.05, Math.min(.95, (21 - (ac - bonus)) / 20));

const FOES = {
  bandit: { n: 'โจร', v: 'ฟัน', hp: 13, ac: 12, atk: 4, die: 6, plus: 1, lethal: .4, flee: 11, pay: 12 },
  boss: { n: 'หัวหน้าโจร', v: 'ฟัน', hp: 22, ac: 14, atk: 5, die: 8, plus: 2, lethal: .5, flee: 13, pay: 25 },
  wolf: { n: 'หมาป่าเถ้า', v: 'กัด', hp: 15, ac: 13, atk: 5, die: 6, plus: 2, lethal: .6, flee: 13 },
  swamp: { n: 'สัตว์ร้ายในหนอง', v: 'ฟาด', hp: 24, ac: 12, atk: 5, die: 8, plus: 2, lethal: .7, flee: 10 },
  scorpion: { n: 'แมงป่องแก้วยักษ์', v: 'ต่อย', hp: 18, ac: 15, atk: 5, die: 6, plus: 3, lethal: .6, flee: 12 },
  soldier: { n: 'ทหารข้าศึก', v: 'ฟัน', hp: 18, ac: 15, atk: 6, die: 8, plus: 2, lethal: .6, flee: 13 },
  veteran: { n: 'ทหารผ่านศึกของข้าศึก', v: 'ฟัน', hp: 26, ac: 16, atk: 6, die: 8, plus: 3, lethal: .75, flee: 15 },
  duelist: { n: 'นักดาบของตระกูลคู่แข่ง', v: 'ฟัน', hp: 20, ac: 15, atk: 6, die: 8, plus: 2, lethal: .15, flee: 99, yield: true },
  hunter: { n: 'นักล่าค่าหัว', v: 'ฟัน', hp: 22, ac: 15, atk: 6, die: 8, plus: 2, lethal: .5, flee: 14 },
  avenger: { n: 'ลูกของคนที่คุณเคยหักหลัง', v: 'แทง', hp: 16, ac: 13, atk: 5, die: 6, plus: 2, lethal: .7, flee: 12 },
};
const beastFor = p => has(p, 'mulvane') ? 'swamp' : has(p, 'dunes') ? 'scorpion' : 'wolf';

// fight = { foe, fhp, php, max, round, def, ranged, over, result, onEnd, lethal, deathText, used }
function startFight(p, foeId, o = {}) {
  const foe = { ...FOES[foeId], id: foeId };
  if (o.harder) { foe.hp += 4; foe.atk += 1; }
  const max = hpMax(p);
  p.pendingFight = { foe, fhp: foe.hp, php: max - (o.hurt || 0), max, round: 1, def: 0, over: false, result: null,
    onEnd: o.onEnd || (() => ''), lethal: o.lethal ?? foe.lethal, deathText: o.death || `เสียชีวิตในการต่อสู้กับ${foe.n}`, used: wpn(p).skill, log: [] };
  return p.pendingFight;
}
function fightActions(p, F) {
  const W = wpn(p), atk = pAtk(p), out = [];
  out.push({ id: 'attack', n: `${W.v}`, d: `โจมตีด้วย${W.n}`, ch: hitChance(atk, F.foe.ac) });
  if (W.sp) {
    const ch = W.sp.n === 'ฟันสองครั้ง' ? hitChance(atk - 3, F.foe.ac) : W.sp.n === 'ฟันหนัก' ? hitChance(atk - 2, F.foe.ac) : W.sp.n === 'แทงจุดตาย' ? hitChance(atk - 4, F.foe.ac) : W.sp.n === 'ถอยแล้วยิง' ? hitChance(atk - 1, F.foe.ac) : hitChance(atk, F.foe.ac);
    out.push({ id: 'special', n: W.sp.n, d: W.sp.d, ch, off: W.sp.n === 'ถอยแล้วยิง' && F.spAt === F.round - 1 ? 'เพิ่งถอยไปเมื่อยกที่แล้ว' : null });
  }
  out.push({ id: 'defend', n: 'ตั้งรับ', d: 'ศัตรูตีโดนยากขึ้นมาก แล้วได้พักหายใจนิดหน่อย' });
  if (rank(p, 'fire') >= 1) out.push({ id: 'fire', n: 'ลูกไฟ', d: 'ใช้มานา 3', ch: hitChance(am(p, 'INT') + rank(p, 'fire') * 2 + 2, F.foe.ac), off: (p.mana || 0) < 3 ? 'มานาไม่พอ' : null });
  if (rank(p, 'heal') >= 1) out.push({ id: 'heal', n: 'สมานแผล', d: 'ใช้มานา 2 ฟื้นแรง', off: (p.mana || 0) < 2 ? 'มานาไม่พอ' : null });
  if (F.foe.flee < 99) out.push({ id: 'flee', n: 'หนี', d: 'ทอยว่องไว+ลอบเร้น ถ้าพลาดจะโดนตีฟรี', ch: hitChance(am(p, 'DEX') + rank(p, 'stealth') * 2, F.foe.flee) });
  if (F.foe.pay) out.push({ id: 'pay', n: 'ยอมจ่าย', d: `ให้ของมีค่าไป ${F.foe.pay} (หรือเท่าที่มี)` });
  if (F.foe.yield) out.push({ id: 'yield', n: 'ยอมแพ้', d: 'จบการดวลโดยไม่ต้องเสี่ยงต่อ' });
  return out;
}
const d20 = () => 1 + Math.floor(Math.random() * 20);
function fightAct(p, F, id) {
  if (F.over) return [];
  const L = [], W = wpn(p), foe = F.foe;
  let foeMod = 0; F.def = 0;
  const strike = (bonus, mult, verb = W.v) => {
    const r = d20();
    if (r === 1 || (r !== 20 && r + bonus < foe.ac)) { L.push(`คุณ${verb}พลาด`); return; }
    let d = pDmg(p) * mult; if (r === 20) { d *= 2; L.push('เข้าจุดสำคัญ'); }
    F.fhp -= d; L.push(`คุณ${verb}โดน ${foe.n}เสีย ${d}`);
  };
  const atk = pAtk(p);
  if (id === 'attack') strike(atk, 1);
  if (id === 'special') {
    F.spAt = F.round;
    if (W.sp.n === 'ฟันสองครั้ง') { strike(atk - 3, 1); if (F.fhp > 0) strike(atk - 3, 1); }
    if (W.sp.n === 'รั้งระยะ') { strike(atk, 1); foeMod -= 3; }
    if (W.sp.n === 'ฟันหนัก') strike(atk - 2, 2);
    if (W.sp.n === 'ถอยแล้วยิง') { strike(atk - 1, 1); foeMod -= 4; }
    if (W.sp.n === 'แทงจุดตาย') strike(atk - 4, 3);
  }
  if (id === 'defend') { F.def = 5; F.php = Math.min(F.max, F.php + 1); L.push('ตั้งรับ แล้วพักหายใจ'); }
  if (id === 'fire') {
    p.mana -= 3; const r = d20();
    if (r + am(p, 'INT') + rank(p, 'fire') * 2 + 2 >= foe.ac || r === 20) { const d = 2 + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + rank(p, 'fire') * 2; F.fhp -= d; L.push(`ลูกไฟระเบิดใส่${foe.n} เสีย ${d}`); }
    else L.push(`${foe.n}หลบลูกไฟได้`);
  }
  if (id === 'heal') { p.mana -= 2; const h = 1 + Math.floor(Math.random() * 6) + rank(p, 'heal') * 2; F.php = Math.min(F.max, F.php + h); L.push(`แสงอุ่นๆ สมานแผล ฟื้นแรง ${h}`); }
  if (id === 'flee') {
    if (d20() + am(p, 'DEX') + rank(p, 'stealth') * 2 >= foe.flee) { F.over = true; F.result = 'fled'; L.push('คุณหนีพ้น'); return L; }
    L.push('หนีไม่พ้น'); foeMod += 2;
  }
  if (id === 'pay') { const v = Math.min(p.wealth, foe.pay); p.wealth = clampW(p.wealth - v); F.over = true; F.result = 'paid'; L.push(`ยื่นของมีค่าให้${foe.n}ไป ${Math.round(v)} พวกมันหัวเราะแล้วก็ไป`); return L; }
  if (id === 'yield') { F.over = true; F.result = 'lose'; F.lethal = 0; L.push('วางอาวุธลง ยอมแพ้'); return L; }
  if (F.fhp <= 0) { F.over = true; F.result = 'win'; L.push(`${foe.n}ล้มลง`); return L; }
  // foe turn
  const r = d20();
  if (r === 1 || (r !== 20 && r + foe.atk + foeMod < pAC(p) + F.def)) L.push(F.def ? `รับการโจมตีของ${foe.n}ไว้ได้` : `${foe.n}${foe.v}พลาด`);
  else { let d = 1 + Math.floor(Math.random() * foe.die) + foe.plus; if (r === 20) d *= 2; F.php -= d; L.push(`${foe.n}${foe.v}โดนคุณ เสีย ${d}`); }
  if (F.php <= 0) { F.over = true; F.result = 'lose'; L.push('คุณล้มลง'); return L; }
  F.round++;
  if (F.round > 12) { F.over = true; F.result = 'fled'; L.push('หมดแรงกันทั้งสองฝ่าย แยกย้ายกันไป'); }
  return L;
}
// apply the result to the person; returns the closing line
function finishFight(p) {
  const F = p.pendingFight; if (!F) return '';
  p.pendingFight = null;
  const lost = Math.max(0, F.max - Math.max(0, F.php));
  p.health = clamp(p.health - lost * 1.8);
  p.fights = p.fights || { win: 0, lose: 0 };
  if (F.used) { const sk = p.skills[F.used]; if (sk && sk.r < MAX_RANK) { sk.x += 12; if (sk.x >= 100) { sk.x = 0; sk.r++; } } }
  if (F.result === 'win') { p.fights.win++; if (gear(p).w === 'none') p.flags.unarmedWin = true; gainXP(p, 20); }
  else gainXP(p, 8);
  if (F.result === 'lose') {
    p.fights.lose++;
    if (Math.random() < F.lethal) { die(p, F.deathText); return F.onEnd(p, 'dead') || ''; }
    p.health = clamp(p.health - 10);
  }
  norm(p);
  return F.onEnd(p, F.result) || '';
}
function autoFight(p) {
  const F = p.pendingFight; if (!F) return '';
  let guard = 0;
  while (!F.over && guard++ < 30) {
    const acts = fightActions(p, F).filter(a => !a.off);
    const has_ = id => acts.find(a => a.id === id);
    let pick_ = 'attack';
    if (F.php < F.max * .3 && has_('flee') && has_('flee').ch > .4) pick_ = 'flee';
    else if (F.php < F.max * .3 && has_('pay') && p.wealth > 0) pick_ = 'pay';
    else if (F.php < F.max * .5 && has_('heal')) pick_ = 'heal';
    else if (has_('fire')) pick_ = 'fire';
    else if (has_('special') && Math.random() < .4) pick_ = 'special';
    fightAct(p, F, pick_);
  }
  p.lastFight = F.result;
  return finishFight(p);
}
// an option that leads into a fight
function fightOpt(label, foeId, o) { return Object.assign(opt(label, p => { startFight(p, foeId, o); return o.intro || `${FOES[foeId].n}เข้ามาประชิดตัว`; }), { fight: foeId }); }

// --- engine hooks ---
extend('resolveChoice', 'combat: bots fight their own fights automatically', inner => function (p, o) { let t = inner(p, o); if (p.pendingFight && p.auto) { const e = autoFight(p); if (e) t += ' ' + e; } return t; });
extend('previewOption', 'combat: preview a fight as win chance and risk', inner => function (p, o, n = 40) {
  if (!o.fight) return inner(p, o, n);
  if (o.need && !o.need(p)) return null;
  const K = ['health', 'happy', 'know', 'wealth'], sum = { health: 0, happy: 0, know: 0, wealth: 0 }, lo = {}, hi = {};
  let dead = 0, alive = 0, won = 0;
  for (let i = 0; i < n; i++) {
    const q = structuredClone({ ...p, pendingFight: null });
    try { o.act(q); autoFight(q); } catch (e) { continue; }
    norm(q);
    if (q.lastFight === 'win') won++;
    if (!q.alive) { dead++; continue; }
    alive++; K.forEach(k => { const d = q[k] - p[k]; sum[k] += d; lo[k] = Math.min(lo[k] ?? d, d); hi[k] = Math.max(hi[k] ?? d, d); });
  }
  const avg = {}; K.forEach(k => avg[k] = alive ? sum[k] / alive : 0);
  return { dead: dead / n, avg, lo, hi, down: 0, up: 0, moved: 0, late: 0, chance: null, win: won / n };
});

// --- replace old one-roll fights with real fights ---
extend('buildFate', 'combat: replace old one-roll fights with real fights', inner => function (p, cause, kind) {
  const F = inner(p, cause, kind);
  const live = (q, t) => { q.flags.reprieves++; gainXP(q, 25); return t; };
  if (kind === 'beast') {
    const foe = beastFor(p);
    F.options = [
      fightOpt('สู้', foe, { lethal: .9, death: cause, intro: `${FOES[foe].n}พุ่งเข้าใส่`, onEnd: (q, r) => r === 'win' ? live(q, 'มันล้มลงตรงหน้า') : r === 'fled' ? live(q, 'หนีพ้นมาได้ ทั้งที่ขาสั่นไปหมด') : r === 'paid' ? '' : r === 'lose' ? live(q, 'รอดมาได้ แต่แผลเต็มตัว') : '' }),
      ...F.options.filter(o => o.label === 'วิ่งหนี'),
    ];
  }
  if (kind === 'war') F.options = F.options.map(o => o.label === 'สู้จนถึงที่สุด' ? fightOpt('สู้จนถึงที่สุด', 'veteran', { lethal: .9, death: cause, intro: 'ทหารผ่านศึกฝ่ายข้าศึกตรงดิ่งเข้ามาหา', onEnd: (q, r) => r === 'win' ? (q.wealth += 15, q.happy += 10, q.flags.hero = true, live(q, 'พอฝุ่นจาง คุณยังยืนอยู่ คนเอาเรื่องนี้ไปเล่ากันอีกหลายปี')) : r === 'fled' ? live(q, 'ถอยออกจากแนวรบได้ทันเวลา') : r === 'lose' ? live(q, 'ล้มลงกลางสนามรบ แต่มีคนลากกลับมาได้') : '' }) : o);
  return F;
});
function patchChoice(id, label, mk) {
  const c = CHOICES.find(x => x.id === id); if (!c) return;
  const orig = c.options;
  c.options = p => orig(p).map(o => o.label === label ? mk(p) : o);
}
patchChoice('bounty', 'สู้กับนักล่าค่าหัว', () => fightOpt('สู้กับนักล่าค่าหัว', 'hunter', { intro: 'นักล่าค่าหัวชักดาบออกมา', onEnd: (q, r) => { if (r === 'win') { q.flags.fugitive = false; return 'นักล่าค่าหัวไม่ได้กลับไปรายงานใคร'; } if (r === 'fled') return 'หนีเข้าป่าไปได้ แต่รู้ดีว่าเขาต้องกลับมาอีก'; if (r === 'lose') { q.flags.fugitive = false; q.cls = 4; return 'โดนจับตัวกลับไปขายเป็นทาสใช้หนี้ความผิด'; } return ''; } }));
patchChoice('vendetta', 'สู้', () => fightOpt('สู้', 'avenger', { intro: 'เขาชักมีดออกมาจากแขนเสื้อ', onEnd: (q, r) => { if (r === 'win') { q.flags.vendetta = false; return 'ชนะ แต่ไม่รู้สึกว่าชนะเลย'; } if (r === 'fled') return 'หนีไปได้ แต่เขารู้ว่าบ้านคุณอยู่ไหน'; if (r === 'lose') return 'เขาทิ้งคุณไว้ในสภาพปางตาย แล้วเดินจากไป'; return ''; } }));
patchChoice('duel', 'รับคำท้า', () => fightOpt('รับคำท้า', 'duelist', { intro: 'ทั้งสองฝ่ายถอดเสื้อคลุม แล้วยืนประจันหน้ากันกลางลาน', death: 'เสียชีวิตในการดวลเพื่อศักดิ์ศรีของตระกูล', onEnd: (q, r) => { if (r === 'win') { q.happy += 8; q.flags.duelWin = true; q.flags.famous = true; return 'ชนะ คู่ต่อสู้ต้องคุกเข่าต่อหน้าทุกคน'; } if (r === 'lose') { q.happy -= 6; return 'แพ้ แถมได้แผลเป็นยาวที่แก้ม'; } return ''; } }));
(() => { const c = CHOICES.find(x => x.id === 'knighted'); if (c) c.when = p => ['sword', 'spear', 'axe', 'bow'].some(w => rank(p, w) >= 4) && p.cls >= 1 && p.cls < 4 && p.age <= 50 && has(p, 'aurelis', 'kragmor', 'grieve') && roll(.3); })();

// --- new choices: bandits, the army ---
const banditRisk = p => (({ grieve: .07, dunes: .07, mulvane: .06, undercity: .06, kragmor: .03, aurelis: .02, serenth: 0 })[p.realm.id] || .04) * (p.rep && p.rep.under <= -30 ? 1.5 : 1);
CHOICES.push(
  { id: 'bandits', repeat: 6, when: p => p.age >= 14 && p.age <= 65 && p.cls < 4 && roll(banditRisk(p)),
    prompt: p => `อายุ ${p.age} ปี ระหว่างทางกลับบ้าน ${p.wealth > 120 ? 'หัวหน้าโจรกับลูกน้อง' : 'โจรสองคน'}โผล่ออกมาดักหน้า`,
    options: p => [
      fightOpt('สู้', p.wealth > 120 ? 'boss' : 'bandit', { intro: 'โจรชักมีดออกมา', death: 'ถูกโจรปล้นฆ่ากลางทาง', onEnd: (q, r) => r === 'win' ? (q.wealth += 5, 'โจรที่เหลือวิ่งหนีกระเจิง เก็บถุงเงินของพวกมันมาด้วย') : r === 'lose' ? (q.wealth = clampW(q.wealth - 15), 'พวกมันรูดทรัพย์ไปจนหมดตัว แล้วทิ้งไว้ข้างทาง') : '' }),
      opt('ยอมให้ของไป', q => { const v = Math.min(q.wealth, 12); q.wealth -= v; return v > 0 ? 'ยื่นของมีค่าที่พกมาให้หมด พวกมันเลยปล่อยตัวไป' : 'ไม่มีอะไรจะให้ พวกมันเตะไปสองทีแล้วก็ไป'; }),
      Object.assign(opt('วิ่งหนี', q => { if (check(q, 'DEX', 'stealth', 12)) return 'วิ่งหลบเข้าซอกหิน พวกมันหาไม่เจอ'; startFight(q, q.wealth > 50 ? 'boss' : 'bandit', { hurt: 3, death: 'ถูกโจรปล้นฆ่ากลางทาง', onEnd: (z, r) => r === 'win' ? 'สู้จนพวกมันถอยไป' : r === 'lose' ? (z.wealth = clampW(z.wealth - 15), 'พวกมันรูดทรัพย์ไปจนหมดตัว') : '' }); return 'พวกมันวิ่งตามทัน'; }), { chk: ['DEX', 'stealth'] }),
    ] },
  { id: 'enlist', when: p => p.age >= 16 && p.age <= 30 && (p.cls === 2 || p.cls === 3) && !p.flags.enlisted && has(p, 'aurelis', 'undercity', 'grieve', 'kragmor', 'dunes') && roll(.1),
    prompt: p => `อายุ ${p.age} ปี กองทัพประจำการรับสมัครทหาร ได้เงินเดือน อาหารทุกวัน และครูฝึกอาวุธ${p.cls === 3 ? ' ไพร่ที่เป็นทหารจะพ้นจากที่ดินของเจ้านาย' : ''}`,
    options: p => [
      opt('สมัครเป็นทหาร', q => { q.flags.enlisted = true; q.flags.armyRank = 0; q.flags.armyWins = 0; if (q.cls === 3) q.cls = 2; const g = gear(q); if (g.w === 'none') { setWeapon(q, 'spear'); g.own.spear = 1; } q.happy -= 2; return 'ได้หอกเล่มหนึ่ง เสื้อเกราะผ้าตัวหนึ่ง กับเตียงในค่ายทหาร'; }),
      opt('ไม่สมัคร', () => 'มองแถวคนสมัครทหารยาวเหยียด แล้วเดินผ่านไป'),
    ] },
  { id: 'battle', repeat: 25, when: p => (p.flags.enlisted || p.flags.soldier > 0) && p.age >= 16 && p.age <= 55 && roll(p.realm.war >= .01 || eraActive(p, 'war4') ? .45 : .2),
    prompt: p => `อายุ ${p.age} ปี ทัพปะทะกับข้าศึกที่ชายแดน`,
    options: p => [
      fightOpt('บุกแนวหน้า', (p.flags.armyRank || 0) >= 1 ? 'veteran' : 'soldier', { intro: 'แตรทัพดังขึ้น วิ่งเข้าหาแนวข้าศึก', death: 'เสียชีวิตในสงครามชายแดน', onEnd: (q, r) => {
        if (r !== 'win') return r === 'lose' ? 'โดนหามกลับค่ายมาในสภาพสาหัส' : r === 'fled' ? 'ถอยกลับมาแนวหลังได้' : '';
        q.wealth += 4; q.flags.armyWins = (q.flags.armyWins || 0) + 1;
        const w = q.flags.armyWins, rk = q.flags.armyRank || 0, best = Math.max(...['sword', 'spear', 'axe', 'bow', 'dagger'].map(s => rank(q, s)));
        if (rk === 0 && w >= 3) { q.flags.armyRank = 1; q.wealth += 10; q.happy += 5; return 'ชนะศึกเป็นครั้งที่สาม นายเลื่อนยศให้เป็นนายสิบ'; }
        if (rk === 1 && w >= 7 && best >= 3) { q.flags.armyRank = 2; q.cls = Math.min(q.cls, 1); q.wealth += 20; q.happy += 8; return 'ได้เลื่อนยศเป็นนายร้อย ได้บ้านพักนายทหาร เงินเดือนมากกว่าพ่อค้าบางคนเสียอีก'; }
        return 'ทัพยึดเนินเขาได้ ได้ส่วนแบ่งจากของที่ยึดมา';
      } }),
      opt('รักษาแนวหลัง', q => { q.wealth += 2; q.happy -= 2; return 'เฝ้าเสบียงอยู่แนวหลังจนรบเสร็จ'; }),
      Object.assign(opt('หนีทัพ', q => { if (check(q, 'DEX', 'stealth', 14)) { q.flags.enlisted = false; q.flags.soldier = 0; q.flags.fugitive = true; return 'หายเข้าป่าไปในคืนนั้น ตอนนี้กลายเป็นทหารหนีทัพไปแล้ว'; } q.health -= 25; q.flags.enlisted = false; q.wealth = clampW(q.wealth - 10); return 'โดนจับได้ โดนเฆี่ยนต่อหน้าทั้งกอง แล้วโดนไล่ออกจากกองทัพ'; }), { chk: ['DEX', 'stealth'] }),
    ] },
  { id: 'discharge', when: p => p.flags.enlisted && p.age >= 45 && roll(.3),
    prompt: p => `อายุ ${p.age} ปี กองทัพเสนอให้ปลดประจำการพร้อมเบี้ยบำนาญ`,
    options: p => [
      opt('ปลดประจำการ', q => { q.flags.enlisted = false; q.wealth += 8 + (q.flags.armyRank || 0) * 8; q.happy += 4; return 'เก็บเครื่องแบบใส่หีบ แล้วกลับบ้าน'; }),
      opt('รับราชการต่อ', () => 'ยังไม่อยากวางอาวุธ'),
    ] },
);
EVENTS.push(
  { w: 4, c: p => p.flags.enlisted, t: p => pick(['ครูฝึกสั่งให้ทั้งกองวิ่งรอบค่ายจนสลบไปสามคน', 'ได้เงินเดือนทหารครบทั้งปี', 'เพื่อนร่วมกองเล่าเรื่องบ้านเกิดให้ฟังทุกคืน', 'กองโดนส่งไปเฝ้าด่านชายแดนทั้งฤดู']), f: p => { p.wealth += 3; p.health += 1; } },
  { w: 2, c: p => p.flags.enlisted && (p.flags.armyRank || 0) >= 1, t: () => 'ทหารใหม่มองคุณด้วยสายตาแบบเดียวกับที่คุณเคยมองนายสิบตอนเป็นทหารใหม่', f: p => { p.happy += 2; } },
  { w: 2, c: p => gear(p).w !== 'none' && p.age > 14, t: p => `ลับ${WEAPONS[gear(p).w].n}ทุกเย็นจนติดเป็นนิสัย`, f: p => { const s = WEAPONS[gear(p).w].skill; if (s && p.skills[s] && p.skills[s].r < MAX_RANK) p.skills[s].x += 5; } },
);
LEGENDS.push(
  { id: 'veteran', n: 'ทหารผ่านศึก', d: 'ชนะการต่อสู้ 10 ครั้งในชีวิตเดียว', c: p => (p.fights && p.fights.win >= 10) },
  { id: 'officer', n: 'นายร้อย', d: 'ไต่ยศในกองทัพจนเป็นนายร้อย', c: p => (p.flags.armyRank || 0) >= 2 },
  { id: 'fists', n: 'มือเปล่า', d: 'ชนะการต่อสู้โดยไม่มีอาวุธ', c: p => p.flags.unarmedWin },
);


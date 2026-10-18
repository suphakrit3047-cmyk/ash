// ===== MONEY, BUSINESS, MATERIALS, LOANS =====
// ---- yearly ledger: where the money came from and went ----
const LEDGER_L = { work: 'ค่าจ้างจากงาน', biz: 'กำไรจากกิจการ', rent: 'รายได้จากที่ดินของตระกูล', sales: 'ขายของ', living: 'ค่ากิน ค่าเช่า และภาษี', fees: 'ค่าเรียน', loan: 'ผ่อนหนี้', buy: 'ซื้อของและลงทุน', other: 'เหตุการณ์อื่นๆ' };
function led(p, k, v) { if (!p.ledger) p.ledger = { _start: p.wealth }; p.ledger[k] = (p.ledger[k] || 0) + v; }
function rollLedger(p) {
  if (p.ledger) {
    const L = p.ledger, sum = Object.entries(L).filter(([k]) => k[0] !== '_').reduce((s, [, v]) => s + v, 0);
    p.lastLedger = Object.assign({}, L, { other: (p.wealth - L._start) - sum, _end: p.wealth, _age: p.age });
    delete p.lastLedger._start;
  }
  p.ledger = { _start: p.wealth };
}

// ---- materials ----
const MATS = {
  herb: { n: 'สมุนไพร', base: .8, d: 'ใช้ปรุงยา ร้านยาต้องใช้' },
  hide: { n: 'หนังสัตว์', base: 1.4, d: 'ใช้ทำเกราะหนัง โรงช่างต้องใช้' },
  ore: { n: 'แร่เหล็ก', base: 1.2, d: 'ใช้ตีอาวุธ โรงตีเหล็กต้องใช้' },
  glass: { n: 'แก้วเถ้า', base: 2, d: 'แก้วที่เกิดจากพายุเถ้า คนรวยในเมืองชอบเอาไปประดับบ้าน' },
  shard: { n: 'เศษเส้นใย', base: 9, d: 'เส้นใยบนฟ้าที่ขาดตกลงมา หายากมาก ศาสนจักรห้ามซื้อขาย' },
};
const MAT_IDS = Object.keys(MATS);
// what each place pays, relative to base (0 = nobody buys it here)
const MAT_PRICE = {
  aurelis: { herb: 2, hide: 1.3, ore: 2.2, glass: 2.4, shard: 1.6 },
  undercity: { herb: 1.4, hide: 1, ore: 1.6, glass: 1.5, shard: 1.2 },
  serenth: { herb: 2.4, hide: 1, ore: 2.8, glass: 2.6, shard: 2.4 },
  kragmor: { herb: 1.3, hide: 2, ore: .9, glass: 1.4, shard: 1 },
  grieve: { herb: .9, hide: .9, ore: 1.5, glass: 1.2, shard: .8 },
  mulvane: { herb: .7, hide: 1.1, ore: 1.6, glass: 1.2, shard: .8 },
  dunes: { herb: 1.6, hide: 1, ore: 1.4, glass: .8, shard: 1 },
};
// what can be found where (weights)
const MAT_FIND = {
  aurelis: { herb: 2 }, undercity: { herb: 1, ore: 1 }, serenth: { herb: 3 },
  kragmor: { ore: 6, hide: 2 }, grieve: { herb: 4, hide: 4 }, mulvane: { herb: 7, hide: 2 }, dunes: { glass: 6, hide: 2 },
};
const OUTDOOR = ['farmer', 'serf', 'hunter', 'guide', 'merc', 'soldier', 'laborer', 'thief'];
const inv = p => p.inv || (p.inv = {});
const hasMat = (p, m, n = 1) => (inv(p)[m] || 0) >= n;
function addMat(p, m, n) { inv(p)[m] = (inv(p)[m] || 0) + n; if (n > 0) p.flags.gathered = (p.flags.gathered || 0) + n; }
function hash01(a, b, c) { const x = Math.sin(a * 12.9898 + b * 78.233 + c * 3.17) * 43758.5453; return x - Math.floor(x); }
// selling many of the same thing in one place in one year pushes the price down; buying pushes it up
function mktBook(p, realm) { const y = yearOf(p), id = (realm || p.realm).id; if (!p.mkt || p.mkt.y !== y) p.mkt = { y, b: {} }; return p.mkt.b[id] || (p.mkt.b[id] = { sold: {}, bought: {} }); }
function matPrice(p, m, realm) {
  const r = realm || p.realm, ri = REALMS.indexOf(r), mi = MAT_IDS.indexOf(m);
  const swing = .7 + .6 * hash01(yearOf(p), mi, ri);
  let v = MATS[m].base * (MAT_PRICE[r.id][m] || 1) * swing;
  if (p.cls === 3) v *= .7;
  if (r.id === 'undercity' || p.flags.fugitive) v *= .85;
  if (!realm || realm === p.realm) v *= Math.pow(.975, mktBook(p).sold[m] || 0);
  return Math.max(.1, v);
}
const buyPrice = (p, m) => matPrice(p, m) * 1.35 * Math.pow(1.015, mktBook(p).bought[m] || 0);
const priceTrend = (p, m) => { const r = MAT_PRICE[p.realm.id][m] || 1, s = matPrice(p, m) / (MATS[m].base * r * (p.cls === 3 ? .7 : 1) * ((p.realm.id === 'undercity' || p.flags.fugitive) ? .85 : 1)); return s > 1.12 ? 'up' : s < .88 ? 'down' : ''; };
function findRoll(p) {
  const pool = MAT_FIND[p.realm.id] || { herb: 1 };
  const shardP = p.gifted ? .05 : .012;
  if (roll(shardP)) return 'shard';
  return wpick(Object.keys(pool), k => pool[k]);
}
function sellMat(p, m, n) {
  if (p.cls === 4) return 'ทาสขายของเองไม่ได้ ทุกอย่างเป็นของนาย';
  n = Math.min(n, inv(p)[m] || 0); if (!n) return null;
  if (m === 'shard' && has(p, 'aurelis', 'undercity') && roll(p.rep && p.rep.under >= 30 ? .05 : .2)) {
    inv(p)[m] -= n; p.wealth = clampW(p.wealth - 10); p.happy -= 5; led(p, 'sales', -10);
    return `คนที่มาขอซื้อ${MATS[m].n}เป็นสายของศาสนจักร ของถูกยึด และคุณต้องจ่ายค่าปรับ ${money(10)}`;
  }
  let v = 0; const bk = mktBook(p); for (let i = 0; i < n; i++) { v += matPrice(p, m); bk.sold[m] = (bk.sold[m] || 0) + 1; }
  inv(p)[m] -= n; p.wealth = clampW(p.wealth + v); led(p, 'sales', v); p.flags.sold = (p.flags.sold || 0) + n;
  return `คุณขาย${MATS[m].n} ${n} ชิ้น ได้ ${money(v)}`;
}
function buyMat(p, m) {
  if (p.cls === 4 || m === 'shard') return null;
  const v = buyPrice(p, m); if (p.wealth < v) return null; const bk = mktBook(p); bk.bought[m] = (bk.bought[m] || 0) + 1;
  p.wealth = clampW(p.wealth - v); led(p, 'buy', -v); inv(p)[m] = (inv(p)[m] || 0) + 1;
  return `คุณซื้อ${MATS[m].n}มา 1 ชิ้น ราคา ${money(v)}`;
}
// active: once a year go out and look for things
function canForage(p) {
  if (p.age < 7) return 'ต้องอายุ 7 ปีขึ้นไป';
  if (p.cls === 4) return 'ทาสออกไปไหนเองไม่ได้';
  if (p.flags.foraged === p.age) return 'ปีนี้ออกไปหาของแล้ว';
  return null;
}
function forage(p) {
  if (canForage(p)) return null;
  p.flags.foraged = p.age;
  const city = has(p, 'aurelis', 'serenth');
  const ok = check(p, 'WIS', 'survival', city ? 13 : 10);
  if (!ok) {
    if (roll(.2)) { p.health -= 6; return city ? 'คุณเดินหาสมุนไพรตามสวนรอบเมือง จนโดนยามไล่ตีออกมา' : 'คุณหลงทางในป่าจนมืด และพลัดตกเนินจนข้อเท้าแพลง'; }
    return city ? 'คุณเดินหาของทั้งวัน แต่ในเมืองแทบไม่มีอะไรให้เก็บ' : 'คุณออกไปหาของทั้งวัน แต่กลับมามือเปล่า';
  }
  const n = 1 + (rank(p, 'survival') >= 2 ? 1 : 0) + (roll(.3) ? 1 : 0);
  const got = {};
  for (let i = 0; i < n; i++) { const m = findRoll(p); got[m] = (got[m] || 0) + 1; addMat(p, m, 1); }
  return 'คุณออกไปหาของ และได้' + Object.entries(got).map(([m, k]) => `${MATS[m].n} ${k} ชิ้น`).join(' กับ') + (got.shard ? ' เศษเส้นใยในมือคุณยังสั่นเบาๆ เหมือนมีชีวิต' : '');
}
// crafting with materials
const CRAFTS = [
  { id: 'potion', n: 'ปรุงยา', need: { herb: 2 }, ok: p => rank(p, 'alchemy') >= 1 || rank(p, 'medicine') >= 1 ? null : 'ต้องมีเล่นแร่หรือการแพทย์ขั้น 1', d: 'สุขภาพ +10',
    act: p => { p.health = clamp(p.health + 10); return 'คุณต้มสมุนไพรเป็นยาบำรุง ร่างกายรู้สึกดีขึ้นมาก'; } },
  { id: 'forge', n: 'ตีอาวุธเอง', need: { ore: 3 }, ok: p => rank(p, 'smith') < 1 ? 'ต้องมีตีเหล็กขั้น 1' : canArm(p) || (gear(p).w === 'none' ? 'ต้องเลือกอาวุธประจำตัวก่อน' : (gear(p).own[gear(p).w] || 0) >= 2 ? 'อาวุธของคุณดีที่สุดแล้ว' : (gear(p).own[gear(p).w] || 0) >= 1 && rank(p, 'smith') < 3 ? 'ตีอาวุธชั้นช่างฝีมือต้องมีตีเหล็กขั้น 3' : null), d: 'อาวุธดีขึ้น 1 ขั้น',
    act: p => { const g = gear(p); g.own[g.w] = (g.own[g.w] || 0) + 1; return `คุณหลอมแร่และตี${WEAPONS[g.w].n}เล่มใหม่ด้วยมือตัวเอง`; } },
  { id: 'leather', n: 'ทำเกราะหนัง', need: { hide: 3 }, ok: p => rank(p, 'craft') < 1 ? 'ต้องมีงานช่างขั้น 1' : canArm(p) || (gear(p).armor >= 1 ? 'คุณมีเกราะที่ดีกว่าหรือเท่ากันแล้ว' : null), d: 'ได้เกราะหนัง',
    act: p => { gear(p).armor = 1; return 'คุณฟอกหนังและเย็บเป็นเกราะหนังได้หนึ่งตัว'; } },
];
function doCraft(p, id) {
  const c = CRAFTS.find(x => x.id === id); if (!c || c.ok(p)) return null;
  for (const [m, n] of Object.entries(c.need)) if (!hasMat(p, m, n)) return null;
  for (const [m, n] of Object.entries(c.need)) inv(p)[m] -= n;
  return c.act(p);
}

// ---- businesses ----
const BIZ = {
  stall: { n: 'แผงขายของในตลาด', cost: 12, skill: 'trade', r: 0, base: 2.6, d: 'ลงทุนน้อย กำไรน้อย ใครก็เปิดได้ ขยายไม่ได้ ถ้าอยากโตต้องขายแผงแล้วเปิดร้าน' },
  workshop: { n: 'โรงช่าง', cost: 22, skill: 'craft', r: 2, base: 2.6, use: 'hide', d: 'รับทำเครื่องเรือนและเครื่องหนัง ถ้ามีหนังสัตว์จะได้กำไรเพิ่ม' },
  smithy: { n: 'โรงตีเหล็ก', cost: 30, skill: 'smith', r: 2, base: 3, use: 'ore', lic: true, d: 'ตีเครื่องมือและอาวุธ ถ้ามีแร่เหล็กจะได้กำไรเพิ่ม' },
  apoth: { n: 'ร้านยา', cost: 30, skill: 'alchemy', alt: 'medicine', r: 2, base: 3, use: 'herb', lic: true, d: 'ขายยาและรักษาคน ถ้ามีสมุนไพรจะได้กำไรเพิ่ม' },
  shop: { n: 'ร้านค้า', cost: 35, skill: 'trade', r: 2, base: 3.8, lic: true, d: 'ซื้อมาขายไปในเมือง' },
  inn: { n: 'โรงเตี๊ยม', cost: 45, skill: 'speech', r: 1, base: 4.2, lic: true, realms: ['aurelis', 'undercity', 'kragmor', 'dunes', 'grieve'], d: 'ที่พักของนักเดินทาง ต้องอยู่ในแดนที่มีคนผ่านไปมา' },
  caravan: { n: 'กองคาราวาน', cost: 50, skill: 'trade', r: 3, base: 6, risky: true, d: 'ขนสินค้าข้ามแดน กำไรสูงที่สุด แต่โดนปล้นได้' },
};
const bizSkill = (p, b) => b.alt && rank(p, b.alt) > rank(p, b.skill) ? b.alt : b.skill;
const licFee = (p, b) => b.lic && p.cls >= 2 && has(p, 'aurelis', 'serenth', 'undercity') ? 8 : 0;
function bizMissing(p, id) {
  const b = BIZ[id], out = [];
  if (p.age < 16) out.push('ต้องอายุ 16 ปีขึ้นไป');
  if (p.cls >= 3) return [p.cls === 4 ? 'ทาสมีกิจการของตัวเองไม่ได้' : 'ไพร่ติดที่ดินมีกิจการของตัวเองไม่ได้'];
  if (p.biz) out.push('มีกิจการอยู่แล้ว');
  if (b.realms && !b.realms.includes(p.realm.id)) out.push('แดนนี้ไม่มีนักเดินทางผ่านมากพอ');
  if (b.lic && p.flags.fugitive) out.push('ต้องขอใบอนุญาต แต่คุณเป็นคนหนี');
  if (b.r && rank(p, bizSkill(p, b)) < b.r) out.push(`${SBY[b.skill].n}${b.alt ? `หรือ${SBY[b.alt].n}` : ''} ขั้น ${b.r}`);
  const need = b.cost + licFee(p, b); if (p.wealth < need) out.push(`เงินอีก ${money(need - p.wealth)}`);
  return out;
}
function openBiz(p, id) {
  if (bizMissing(p, id).length) return null;
  const b = BIZ[id], cost = b.cost + licFee(p, b);
  p.wealth = clampW(p.wealth - cost); led(p, 'buy', -cost);
  p.biz = { id, lvl: 1, invested: cost, since: p.age, last: null };
  p.flags.bizOwner = true;
  return `คุณเปิด${b.n}เป็นของตัวเอง ลงทุนไป ${money(cost)}`;
}
const bizMax = p => p.biz && p.biz.id === 'stall' ? 1 : 3;
const expandCost = p => Math.round(BIZ[p.biz.id].cost * p.biz.lvl);
const LVL_MULT = [0, 1, 1.6, 2.1];
function expandBiz(p) {
  if (!p.biz || p.biz.lvl >= bizMax(p)) return null;
  const c = expandCost(p); if (p.wealth < c) return null;
  p.wealth = clampW(p.wealth - c); led(p, 'buy', -c); p.biz.lvl++; p.biz.invested += c;
  if (p.biz.lvl === 3) p.flags.bizTycoon = true;
  return `คุณขยาย${BIZ[p.biz.id].n}ให้ใหญ่ขึ้น จ้างคนเพิ่ม`;
}
const sellValue = p => Math.round(p.biz.invested * .5);
function sellBiz(p) {
  if (!p.biz) return null;
  const v = sellValue(p), n = BIZ[p.biz.id].n;
  p.wealth = clampW(p.wealth + v); led(p, 'sales', v); p.biz = null; if (p.focus === 'biz') p.focus = 'work';
  return `คุณขาย${n}ไป ได้เงินคืน ${money(v)}`;
}
function bizYear(p) {
  const B = p.biz; if (!B) return null;
  const b = BIZ[B.id], managed = p.focus === 'biz';
  const F = (p.realm.wealth / 50 + .4) * .9;
  const cm = [1.2, 1.15, 1, 1, 1][p.cls] * (has(p, 'undercity') ? .8 : 1);
  let v = b.base * F * (1 + .15 * rank(p, bizSkill(p, b))) * LVL_MULT[B.lvl] * cm * (managed ? 1.4 : .75) * (.6 + Math.random() * .7);
  let t = null, used = 0;
  if (b.use) { const k = Math.min(inv(p)[b.use] || 0, B.lvl * 2); used = k; inv(p)[b.use] = (inv(p)[b.use] || 0) - k; v += k * MATS[b.use].base * 1.6; }
  if (roll(.12)) { v = -b.base * F * .5 * B.lvl; t = pick([`ปีนี้${b.n}ขาดทุน ลูกค้าหายไปครึ่งหนึ่ง`, `ลูกจ้างใน${b.n}ขโมยเงินแล้วหนีไป`, `เจ้าหน้าที่มาเก็บภาษีกิจการย้อนหลัง`]); }
  else if (b.risky && roll(.15)) { v = -12; t = 'กองคาราวานของคุณถูกโจรปล้นกลางทาง สินค้าหายไปทั้งขบวน'; }
  else if (b.use && !used && roll(.4)) t = `${b.n}ของคุณไม่มี${MATS[b.use].n}ใช้ กำไรจึงน้อยกว่าที่ควร`;
  p.wealth = clampW(p.wealth + v); led(p, 'biz', v); B.last = v;
  if (managed) { const sid = bizSkill(p, b), sk = p.skills[sid]; if (sk && sk.r < MAX_RANK) { sk.x += 13 * (1 - sk.r * .08); if (sk.x >= 100) { sk.x = 0; sk.r++; t = (t ? t + ' · ' : '') + `ดูแลกิจการมาหลายปี ฝีมือ${SBY[sid].n}ของคุณเพิ่มขึ้นเป็นขั้น ${sk.r}`; } } p.health = clamp(p.health - .6); gainXP(p, 3); }
  return t;
}

// ---- loans: the poor borrow at a worse rate ----
const LOAN_AMT = 25;
const loanTerms = p => { const amt = Math.max(8, Math.round(LOAN_AMT * (p.realm.wealth / 50 + .4) / 1.5)); return { amt, years: 10, pay: Math.round(amt * (p.cls <= 1 || (p.rep && p.rep.noble >= 40) ? .12 : .18) * 10) / 10 }; };
function canBorrow(p) {
  if (p.age < 16) return 'ต้องอายุ 16 ปีขึ้นไป';
  if (p.cls >= 3) return p.cls === 4 ? 'ทาสกู้เงินไม่ได้' : 'ไพร่ติดที่ดินกู้เงินไม่ได้ เพราะไม่มีอะไรค้ำประกัน';
  if (p.loan) return 'มีหนี้อยู่แล้ว';
  if (p.flags.badCredit) return 'ไม่มีใครยอมให้คุณกู้อีกแล้ว';
  return null;
}
function borrow(p) {
  if (canBorrow(p)) return null;
  const t = loanTerms(p);
  p.loan = { left: t.years, pay: t.pay, missed: 0 };
  p.wealth = clampW(p.wealth + t.amt); led(p, 'loan', t.amt);
  return p.cls <= 1 ? `ธนาคารของสมาคมพ่อค้าให้คุณกู้ ${money(t.amt)} ผ่อนปีละ ${money(t.pay)} เป็นเวลา ${t.years} ปี` : `คนปล่อยกู้ในตลาดให้คุณยืม ${money(t.amt)} ผ่อนปีละ ${money(t.pay)} เป็นเวลา ${t.years} ปี รวมแล้วต้องจ่ายเกือบสองเท่า`;
}
const payoffCost = p => p.loan ? Math.round(p.loan.left * p.loan.pay * .85) : 0;
function payoff(p) {
  if (!p.loan) return null; const c = payoffCost(p); if (p.wealth < c) return null;
  p.wealth = clampW(p.wealth - c); led(p, 'loan', -c); p.loan = null; return `คุณใช้หนี้ก้อนสุดท้ายหมด จ่ายไป ${money(c)}`;
}
function loanYear(p) {
  const L = p.loan; if (!L) return null;
  if (p.wealth >= L.pay) { p.wealth -= L.pay; led(p, 'loan', -L.pay); L.left--; L.missed = 0; if (L.left <= 0) { p.loan = null; return 'คุณผ่อนหนี้งวดสุดท้ายหมดแล้ว'; } return null; }
  L.missed++; p.happy -= 5;
  if (L.missed < 3) return `ปีนี้คุณไม่มีเงินผ่อนหนี้ เจ้าหนี้มาทวงถึงบ้าน (ค้างติดกันมาแล้ว ${L.missed} ปี ถ้าค้างติดกันถึง 3 ปีจะถูกยึด)`;
  p.loan = null; p.flags.badCredit = true;
  if (p.biz) { const n = BIZ[p.biz.id].n; p.biz = null; if (p.focus === 'biz') p.focus = 'work'; return `คุณค้างหนี้ติดกันสามปี เจ้าหนี้จึงยึด${n}ของคุณไป`; }
  if (p.cls === 2) { p.cls = 3; p.flags.debtBond = true; if (typeof ensureCareer === 'function') ensureCareer(p); return 'คุณค้างหนี้ติดกันสามปีและไม่มีอะไรให้ยึด เจ้าหนี้จึงพาคุณไปทำงานบนที่ดินของเขาจนกว่าจะใช้หนี้หมด ตอนนี้คุณเป็นไพร่ติดที่ดิน'; }
  p.wealth = 0; return 'คุณค้างหนี้ติดกันสามปี เจ้าหนี้ยึดทุกอย่างที่คุณมีไป';
}

// ---- yearly hook ----
extend('applyFocus', 'economy: training fees, business, loans, finds; closes the yearly ledger', inner => function (p) {
  const fee = p.focus === 'train' && p.trainSkill && access(p, p.trainSkill).ok ? access(p, p.trainSkill).cost : 0;
  const parts = [inner(p)];
  if (fee && p.focus === 'train') led(p, 'fees', -fee);
  if (p.alive) {
    parts.push(bizYear(p));
    if (p.age >= 14) parts.push(loanYear(p));
    // things picked up while working outdoors
    if (p.age >= 7 && p.focus === 'work' && p.cls !== 4 && (OUTDOOR.includes(p.career) || p.age < 14) && roll(p.career === 'hunter' ? .7 : .25)) {
      const m = p.career === 'hunter' ? 'hide' : findRoll(p); addMat(p, m, 1);
      if (roll(.5) || m === 'shard') parts.push(m === 'shard' ? 'ระหว่างทำงาน คุณเจอเศษเส้นใยเรืองแสงจางๆ ตกอยู่ในพงหญ้า และเก็บมันไว้' : `ระหว่างทำงาน คุณเก็บ${MATS[m].n}ติดมือกลับมา`);
    }
  }
  rollLedger(p);
  return parts.filter(Boolean).join(' · ') || null;
});
// a business owner with nothing to do on the side: the 'biz' focus is handled above, the old engine ignores it
LEGENDS.push(
  { id: 'tycoon', n: 'เจ้าสัว', d: 'ขยายกิจการจนถึงขั้นใหญ่ที่สุด', c: p => p.flags.bizTycoon },
  { id: 'debtbond', n: 'ขายตัวใช้หนี้', d: 'เป็นหนี้จนต้องกลายเป็นไพร่ติดที่ดิน', c: p => p.flags.debtBond },
  { id: 'gatherer', n: 'คนเก็บของป่า', d: 'หาของได้รวมกันมากกว่า 30 ชิ้นในชีวิตเดียว', c: p => (p.flags.gathered || 0) >= 30 },
  { id: 'shardfind', n: 'เศษฟ้า', d: 'เคยพบเศษเส้นใยที่ร่วงลงมาจากฟ้า', c: p => (p.flags.gathered || 0) > 0 && p.flags.foundShard },
);
extend('addMat', 'economy: finding a sky shard is remembered', inner => function (p, m, n) { if (m === 'shard') p.flags.foundShard = true; return inner(p, m, n); });

// the old 'open a shop' story beat now means joining the merchants' guild once your business has grown
(() => {
  const c = CHOICES.find(x => x.id === 'ownShop'); if (!c) return;
  c.when = p => p.biz && p.biz.lvl >= 2 && p.cls === 2 && p.wealth >= 30 && roll(.3);
  c.prompt = p => `อายุ ${p.age} ปี ${BIZ[p.biz.id].n}ของคุณใหญ่พอจนสมาคมพ่อค้ามาเชิญให้เข้าเป็นสมาชิก ค่าแรกเข้า ${money(20)} สมาชิกได้ฐานะพ่อค้า กู้เงินดอกต่ำ และค้าขายได้ราคาดีขึ้น แต่ต้องใช้ชีวิตให้สมฐานะ ค่าครองชีพจะสูงขึ้น`;
  c.options = p => [
    opt('เข้าสมาคม (ทรัพย์ 20)', q => { q.wealth -= 20; led(q, 'buy', -20); q.cls = 1; q.flags.selfMade = true; q.happy += 10; return 'ชื่อของคุณถูกเขียนลงในทะเบียนสมาคมพ่อค้า ตอนนี้คุณมีฐานะเป็นพ่อค้าแล้ว'; }, q => q.wealth >= 20, 'ต้องมีทรัพย์ 20'),
    opt('ยังไม่เข้า', () => 'คุณขอบคุณ แล้วกลับไปดูแลกิจการตามเดิม'),
  ];
})();
// slaves own nothing and serfs very little, whatever the realm's average wealth
onBorn('economy: serfs and slaves start with almost nothing', p => {
  const cap = [Infinity, Infinity, Infinity, 10, 3][p.cls];
  if (p.wealth > cap) { p.wealth = Math.round(cap * (.4 + Math.random() * .6)); p.startWealth = p.wealth; }
});

// ===== COINS =====
// 1 unit of wealth = 1 silver. 10 copper = 1 silver, 10 silver = 1 gold, 10 gold = 1 platinum
const COINS = [[1000, 'แพลทินัม', 'pp'], [100, 'ทอง', 'gp'], [10, 'เงิน', 'sp'], [1, 'ทองแดง', 'cp']];
function coinSplit(v) { let c = Math.round(Math.max(0, v) * 10); return COINS.map(([u, n, k]) => { const q = Math.floor(c / u); c -= q * u; return [q, n, k]; }); }
function money(v, short) {
  const parts = coinSplit(v).filter(x => x[0] > 0);
  if (!parts.length) return '0 ทองแดง';
  return parts.slice(0, short ? 1 : 2).map(([q, n]) => `${q} ${n}`).join(' ');
}
function purseHTML(v) { const s = coinSplit(v); const first = s.findIndex(x => x[0] > 0); return s.filter((x, i) => i >= Math.max(0, Math.min(first, 2)) || x[0] > 0).map(([q, n, k]) => `<span class="${k}"><i></i>${q} ${n}</span>`).join(''); }
function moneyText(t) {
  return t.replace(/ทรัพย์\s?(\d+(?:\.\d+)?)/g, (_, n, i, str) => (i > 0 && !/[\s(]/.test(str[i - 1]) ? ' ' : '') + money(+n)).replace(/ค่าเรียน (\d+(?:\.\d+)?)\/ปี/g, (_, n) => `ค่าเรียน ${money(+n)}/ปี`);
}
// old money from noble houses: the rich start far above everyone else
onBorn('economy: old money, the rich start far ahead', (p, parent) => {
  if (!parent) { if (p.cls === 0) p.wealth = Math.round(p.wealth * (1.5 + Math.random() * 1.5)); else if (p.cls === 1) p.wealth = Math.round(p.wealth * (1.1 + Math.random() * .5)); p.startWealth = p.wealth; }
});

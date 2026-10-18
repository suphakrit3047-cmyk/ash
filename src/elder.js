// ===== WHAT MONEY IS FOR IN THE SECOND HALF OF LIFE =====
// 1) works for the realm that outlive you and change the world for later lives
const WORKS = {
  well: { n: 'บ่อน้ำสะอาด', cost: 30, d: 'ทารกที่เกิดในแดนนี้ตายน้อยลง', fx: r => { r.infant *= .93; } },
  kitchen: { n: 'โรงทาน', cost: 50, d: 'ปีข้าวยากหมากแพง คนอดตายน้อยลง', fx: r => { r.famine *= .88; } },
  school: { n: 'โรงเรียน', cost: 80, d: 'เด็กในแดนนี้มีโอกาสได้เรียนหนังสือมากขึ้น', fx: r => { r.lit = Math.min(.97, r.lit + .06); } },
  clinic: { n: 'โรงหมอ', cost: 120, d: 'โรคระบาดและโรคในเด็กร้ายแรงน้อยลง', fx: r => { r.plague *= .9; r.child *= .9; } },
  shelter: { n: 'บ้านพักคนชรา', cost: 60, d: 'คนแก่ในแดนนี้มีคนดูแล ใช้ชีวิตบั้นปลายได้นานขึ้น', fx: r => { r.agingStart += .7; } },
  statue: { n: 'รูปปั้นของตัวเอง', cost: 100, d: 'ไม่ช่วยใคร แต่ทุกคนจะจำชื่อคุณได้', fx: () => {} },
};
const WORLD_KEY = 'ash-world';
function loadWorld() { try { return JSON.parse(localStorage.getItem(WORLD_KEY)) || { works: [] }; } catch (e) { return { works: [] }; } }
function saveWorld(w) { try { localStorage.setItem(WORLD_KEY, JSON.stringify(w)); } catch (e) { } }
let WORLD = loadWorld();
// what earlier lives built still stands
for (const x of WORLD.works) { const r = RBY[x.realm], W = WORKS[x.id]; if (r && W) W.fx(r); }
const worksIn = rid => WORLD.works.filter(x => x.realm === rid);
const workCost = (p, id) => WORKS[id].cost * (p.realm.wealth / 50 + .4);
function canBuild(p, id) {
  if (p.age < 30) return 'ต้องอายุ 30 ปีขึ้นไป';
  if (p.cls >= 3) return 'ไพร่และทาสสร้างอะไรในนามตัวเองไม่ได้';
  if ((p.built || []).includes(id + ':' + p.realm.id)) return 'คุณสร้างสิ่งนี้ที่นี่ไปแล้ว';
  if (worksIn(p.realm.id).filter(x => x.id === id).length >= 5) return 'แดนนี้มีมากพอแล้ว';
  if (p.wealth < workCost(p, id)) return `ต้องมี ${money(workCost(p, id))}`;
  return null;
}
function build(p, id, free) {
  if (!free && canBuild(p, id)) return null;
  const W = WORKS[id], c = free ? 0 : workCost(p, id);
  if (c) { p.wealth -= c; led(p, 'buy', -c); }
  const rec = { id, realm: p.realm.id, by: p.name, year: yearOf(p) };
  WORLD.works.push(rec); saveWorld(WORLD); W.fx(p.realm);
  (p.built = p.built || []).push(id + ':' + p.realm.id);
  p.flags.builder = (p.flags.builder || 0) + 1; p.happy += id === 'statue' ? 4 : 8;
  if (id !== 'statue') p.flags.philanthropist = true;
  return id === 'statue' ? `รูปปั้นของคุณตั้งตระหง่านอยู่กลาง${p.realm.short} คนเดินผ่านไปมาแต่ไม่ค่อยมีใครเงยหน้ามอง` : `${W.n}ในนามของคุณเปิดขึ้นที่${p.realm.short} ${W.d} มันจะยังอยู่ต่อไปหลังจากคุณจากไปแล้ว`;
}
// 2) being cared for in old age
const careCost = p => 4 * (p.realm.wealth / 50 + .4);
function canCare(p) { if (p.age < 50) return 'ต้องอายุ 50 ปีขึ้นไป'; if (p.cls >= 3) return 'คนในฐานะคุณไม่มีใครมาดูแลให้'; return null; }
function toggleCare(p) { if (canCare(p)) return null; p.care = !p.care; return p.care ? 'คุณจ้างคนมาดูแลยามแก่ เขาช่วยต้มยา พาเดินเล่น และอ่านหนังสือให้ฟังทุกคืน' : 'คุณเลิกจ้างคนดูแล'; }
modHazards('elder: a paid carer keeps the old alive longer', (p, H) => { if (p.care) for (const h of H) if (h[2] === 'old' || h[2] === 'ill') h[1] *= .6; });
// 3) giving to family while you are alive
function canGive(p) { if (p.age < 30) return 'ต้องอายุ 30 ปีขึ้นไป'; if (!p.kidNames.length) return 'คุณยังไม่มีลูก'; if (p.cls === 4) return 'ทาสไม่มีอะไรจะให้'; if (p.wealth < 10) return `ต้องมีอย่างน้อย ${money(10)}`; return null; }
function giveKids(p) { if (canGive(p)) return null; const v = Math.round(p.wealth * .25); p.wealth -= v; led(p, 'buy', -v); p.giftHeir = (p.giftHeir || 0) + v; p.happy += 4; return `คุณแบ่งเงิน ${money(v)} ให้ลูกๆ ตั้งตัว พวกเขาจะได้ใช้ตั้งแต่ตอนนี้ ไม่ต้องรอให้คุณตาย`; }
const poorKin = p => (p.fam || []).filter(m => m.alive && (m.rel === 'sibling' || m.rel === 'mother' || m.rel === 'father') && famBorn(p, m) && m.cls >= 2 && !m.helped);
function helpKin(p) { const k = poorKin(p)[0]; if (!k || p.wealth < 15 || p.age < 20) return null; p.wealth -= 15; led(p, 'buy', -15); k.helped = true; p.happy += 5; if (k.cls >= 3) { k.cls = 2; k.job = famJobFor(k); return `คุณจ่ายค่าไถ่ตัวให้${k.name} ${relName(p, k)}ของคุณ ตอนนี้เขาเป็นอิสระแล้ว`; } return `คุณส่งเงินไปให้${k.name} ${relName(p, k)}ของคุณ เขาเขียนจดหมายขอบคุณกลับมายาวสามหน้า`; }
// 4) the will
const WILLS = {
  none: { n: 'ไม่ทำพินัยกรรม', d: 'ลูกคนโตได้ราว 60% ที่เหลือหายไปกับค่าธรรมเนียมและญาติที่มาแบ่ง' },
  heir: { n: 'ยกทั้งหมดให้ลูกคนโต', d: 'ลูกคนโตได้ราว 85%' },
  split: { n: 'แบ่งครึ่ง ให้ลูกครึ่งหนึ่ง สร้างสิ่งดีๆ ให้แดนครึ่งหนึ่ง', d: 'ลูกได้ราว 40% อีกครึ่งใช้สร้างสิ่งก่อสร้างในนามคุณ' },
  give: { n: 'บริจาคทั้งหมดให้แดน', d: 'ลูกได้แค่พอตั้งตัว ที่เหลือสร้างสิ่งก่อสร้างในนามคุณให้มากที่สุด' },
};
const willFee = p => 5 * (p.realm.wealth / 50 + .4);
function setWill(p, w) { if (p.age < 30 || p.cls === 4) return null; if (w !== 'none' && (p.will || 'none') === 'none') { if (p.wealth < willFee(p)) return null; p.wealth -= willFee(p); led(p, 'buy', -willFee(p)); } p.will = w; return w === 'none' ? 'คุณฉีกพินัยกรรมทิ้ง' : `คุณจ้างอาลักษณ์เขียนพินัยกรรมว่า "${WILLS[w].n}"`; }
// carried out when the life ends
function settleEstate(p) {
  const w = p.will || 'none', out = [];
  let pot = w === 'split' ? p.wealth * .5 : w === 'give' ? p.wealth * .9 : 0;
  if (pot > 0) {
    const order = ['clinic', 'school', 'kitchen', 'well', 'shelter'];
    for (const id of order) {
      const c = workCost(p, id); if (pot < c) continue;
      if (worksIn(p.realm.id).filter(x => x.id === id).length >= 5) continue;
      pot -= c; build(p, id, true); out.push(WORKS[id].n);
    }
    p.estateWorks = out;
  }
  return out.length ? `ตามพินัยกรรมของคุณ เงินที่เหลือถูกใช้สร้าง${out.join(' ')}ที่${p.realm.short}` : '';
}
// the heir receives according to the will and gifts
onBorn('elder: the heir receives according to the will and gifts', (p, parent) => {
  if (parent) {
    const w = parent.will || 'none', pw = parent.wealth || 0;
    const adj = { none: 0, heir: .25, split: -.2, give: -.6 + .05 }[w] || 0;
    p.wealth = Math.max(0, p.wealth + pw * adj + (parent.giftHeir || 0));
    p.startWealth = p.wealth;
  }
});
extend('applyFocus', 'elder: losing freedom means losing property; paying the carer', inner => function (p) {
  const t0 = inner(p);
  // losing your freedom means losing what you owned
  let t = t0;
  if (p.cls >= 3 && !p.royal) {
    const lost = [];
    if (p.biz) { lost.push(BIZ[p.biz.id].n); p.biz = null; if (p.focus === 'biz') p.focus = 'work'; }
    if (p.land && p.land.plots) { lost.push(`ที่นา ${p.land.plots} แปลง`); p.land.plots = 0; p.land.realm = null; }
    if (p.home && p.home.status === 'own') { lost.push(HOUSES[p.home.tier].n); Object.assign(p.home, { tier: 1, status: p.cls === 4 ? 'master' : 'lord', damaged: false }); }
    if (lost.length) t = [t0, `เมื่อคุณไม่ได้เป็นไทแก่ตัวเองอีกต่อไป ${lost.join(' ')}ของคุณก็ถูกยึดไปด้วย`].filter(Boolean).join(' · ');
  }
  if (p.alive && p.care) { const c = careCost(p); if (p.wealth >= c) { p.wealth -= c; led(p, 'living', -c); p.happy += 2; } else { p.care = false; return [t, 'คุณไม่มีเงินจ้างคนดูแลต่อ เขาจึงลาออกไป'].filter(Boolean).join(' · '); } }
  return t;
});
LEGENDS.push(
  { id: 'philanthropist', n: 'ผู้ให้', d: 'สร้างสิ่งที่ช่วยคนในแดนด้วยเงินของตัวเอง', c: p => p.flags.philanthropist },
  { id: 'vanity', n: 'รูปปั้นกลางเมือง', d: 'จ่ายเงินสร้างรูปปั้นของตัวเอง', c: p => (p.built || []).some(x => x.startsWith('statue')) },
  { id: 'gaveall', n: 'ไม่เอาอะไรไปด้วย', d: 'บริจาคทรัพย์สินทั้งหมดในพินัยกรรม', c: p => p.will === 'give' && (p.estateWorks || []).length > 0 },
);

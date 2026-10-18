// ===== TRAVEL: trading trips and moving between realms =====
const TPOS = { aurelis: [400, 230], undercity: [405, 255], serenth: [400, 205], kragmor: [190, 160], grieve: [600, 205], mulvane: [395, 405], dunes: [165, 375] };
function tdist(a, b) {
  if (a === b) return 0;
  // the floating city is only reached from the sky dock above Aurelis
  if (a === 'serenth' || b === 'serenth') { const o = a === 'serenth' ? b : a; return (o === 'aurelis' || o === 'undercity' ? 0 : tdist('aurelis', o)) + .6; }
  const [x1, y1] = TPOS[a], [x2, y2] = TPOS[b];
  return Math.max(.3, Math.hypot(x1 - x2, y1 - y2) / 100);
}
const tdays = (a, b) => Math.max(1, Math.round(tdist(a, b) * 6));
const ROAD = { aurelis: .04, undercity: .06, serenth: 0, kragmor: .1, grieve: .22, mulvane: .15, dunes: .18 };
const ROAD_L = r => r >= .18 ? 'อันตรายมาก' : r >= .1 ? 'อันตราย' : r > .03 ? 'ค่อนข้างปลอดภัย' : 'ปลอดภัย';
LEDGER_L.travel = 'ค่าเดินทางและค่าผ่านด่าน';
function fare(p, to) {
  const d = tdist(p.realm.id, to);
  return Math.round((d * 1.1 + (to === 'serenth' || p.realm.id === 'serenth' ? 2 : 0)) * (p.cls <= 1 ? 2 : 1) * 10) / 10;
}
function roadRisk(p, to) {
  const r = Math.max(ROAD[to], ROAD[p.realm.id]) * (p.cls <= 1 ? .5 : 1) * (1 - .12 * rank(p, 'survival'));
  return Math.max(0, r);
}
// who is let in, and at what price
function entry(p, to, settle) {
  const elf = p.race === 'เอลฟ์';
  if (to === 'serenth') {
    if (elf) return { ok: true, fee: 0 };
    if (settle) return { ok: false, why: 'นครลอยไม่รับคนเบื้องล่างเป็นพลเมือง ไม่ว่าจะรวยแค่ไหน' };
    if (p.cls <= 1 || p.flags.archmage || p.career === 'envoy') return { ok: true, fee: 30, label: 'ใบอนุญาตขึ้นนครลอย' };
    return { ok: false, why: 'ต้องเป็นพ่อค้า ขุนนาง ทูต หรือจอมเวท จึงจะได้ใบอนุญาตขึ้นนครลอย' };
  }
  if (to === 'aurelis') {
    if (p.cls <= 1 || p.flags.churchMage) return { ok: true, fee: 0 };
    if (settle) return { ok: true, fee: 40, label: 'ค่าทะเบียนพลเมืองชั้นใน', gate: true };
    return { ok: true, fee: 2, label: 'ค่าผ่านประตูชั้นใน', gate: true };
  }
  if (to === 'kragmor' && p.race !== 'คนแคระ') return { ok: true, fee: settle ? 10 : 1, label: settle ? 'ค่าขึ้นทะเบียนคนนอก' : 'ภาษีคนนอก' };
  return { ok: true, fee: 0 };
}
const lostWages = p => p.age >= 14 && p.career && p.career !== 'slave' && typeof careerPay === 'function' ? careerPay(p, CBY[p.career]) * .25 : 0;
function tripCost(p, to) { const e = entry(p, to); return fare(p, to) * 2 + (e.fee || 0); }
function canTravel(p) {
  if (p.age < 14) return 'ต้องอายุ 14 ปีขึ้นไป';
  if (p.cls === 4) return 'ทาสออกเดินทางเองไม่ได้';
  if (p.cls === 3) return 'ไพร่ติดที่ดินออกจากที่ดินไม่ได้ถ้าเจ้าที่ดินไม่อนุญาต';
  if (p.trip) return 'กำลังเดินทางอยู่';
  return null;
}
function canTrip(p, to) {
  const w = canTravel(p); if (w) return w;
  if (p.flags.tripAge === p.age) return 'ปีนี้เดินทางไปแล้ว';
  const e = entry(p, to); if (!e.ok) return e.why;
  if (p.wealth < tripCost(p, to)) return `ต้องมีค่าเดินทาง ${money(tripCost(p, to))}`;
  return null;
}
// returns { text, ambush }
function startTrip(p, to) {
  if (canTrip(p, to)) return null;
  const e = entry(p, to), from = p.realm.id, cost = tripCost(p, to), lw = lostWages(p);
  p.wealth = clampW(p.wealth - cost - lw); led(p, 'travel', -cost); if (lw) led(p, 'work', -lw);
  p.flags.tripAge = p.age; p.flags.trips = (p.flags.trips || 0) + 1;
  const lines = [`คุณออกเดินทางไป${RBY[to].name} ใช้เวลา ${tdays(from, to)} วัน เสียค่าเดินทาง${e.fee ? `และ${e.label}` : ''}รวม ${money(cost)}${lw ? ` และขาดรายได้จากงานไปราว ${money(lw)}` : ''}`];
  let dest = to, ambush = false;
  // the gate of Aurelis decides by how you look
  if (e.gate) {
    const dc = 11 + (['มนุษย์', 'เอลฟ์', 'ลูกครึ่งเอลฟ์', 'คนแคระ'].includes(p.race) ? 0 : 4);
    if (!check(p, 'CHA', 'speech', dc)) { dest = 'undercity'; lines.push(`ยามที่ประตูชั้นในมองคุณตั้งแต่หัวจรดเท้า แล้วไม่ยอมให้ผ่าน คุณต้องค้าขายในตลาดใต้กำแพงแทน${p.race !== 'มนุษย์' ? ' ยามไม่ได้ถามอะไรคนที่เดินผ่านไปก่อนหน้าคุณเลยสักคำ' : ''}`); }
  }
  if (p.flags.fugitive && ['aurelis', 'kragmor', 'serenth'].includes(dest) && roll(.25)) {
    const fine = Math.min(p.wealth, 20); p.wealth -= fine; p.health -= 10; led(p, 'travel', -fine);
    lines.push(`ทหารที่ด่านจำหน้าคุณได้จากใบประกาศจับ คุณถูกขังอยู่หลายวัน และต้องจ่ายค่าไถ่ตัว ${money(fine)} ก่อนถูกไล่กลับไป`);
    return { text: lines.join(' · ') };
  }
  // the road
  if (roll(roadRisk(p, to))) {
    if (!canArm(p) && gear(p).w !== 'none' && p.age <= 65) ambush = true;
    else {
      const lostC = Math.min(p.wealth, Math.max(1, p.wealth * .25)); p.wealth -= lostC; led(p, 'travel', -lostC);
      let lostM = 0; for (const m of MAT_IDS) { const k = Math.ceil((inv(p)[m] || 0) / 2); if (k) { inv(p)[m] -= k; lostM += k; } }
      lines.push(`ระหว่างทาง โจรดักปล้นขบวนของคุณ คุณเสียเงินไป ${money(lostC)}${lostM ? ` และของอีก ${lostM} ชิ้น` : ''}`);
    }
  } else if (roll(.3)) lines.push(pick(['ระหว่างทางคุณพักค้างคืนกับกองคาราวานอื่น และได้ฟังข่าวจากแดนไกล', 'ทางที่คุณเดินผ่านเต็มไปด้วยซากหมู่บ้านร้าง', 'คุณเห็นเมืองลอยเซเรนธ์ลอยอยู่บนฟ้าตลอดทาง', 'ฝนเถ้าตกลงมาเบาๆ ตลอดสองวันที่เดินทาง']));
  p.trip = { to: dest, from };
  const kin = (p.fam || []).filter(m => m.alive && m.realm === dest && famBorn(p, m) && m.rel !== 'child' && m.rel !== 'spouse');
  if (kin.length && !ambush) { p.happy += 6; lines.push(`คุณแวะไปหา${kin.map(m => `${m.name} ${relName(p, m)}`).join(' และ')}ที่ย้ายมาอยู่ที่นี่`); }
  if (!p.flags.visited) p.flags.visited = {};
  p.flags.visited[dest] = 1;
  return { text: lines.join(' · '), ambush };
}
// trading at the destination: borrow the local market for a moment
function atRealm(p, fn) { const home = p.realm; p.realm = RBY[p.trip.to]; try { return fn(); } finally { p.realm = home; } }
const tripPrice = (p, m) => atRealm(p, () => matPrice(p, m));
const tripSell = (p, m, n) => atRealm(p, () => sellMat(p, m, n));
const tripBuy = (p, m) => atRealm(p, () => buyMat(p, m));
const tripBuyPrice = (p, m) => atRealm(p, () => buyPrice(p, m));
function endTrip(p) {
  if (!p.trip) return null;
  const to = p.trip.to; p.trip = null;
  return `คุณกลับจาก${RBY[to].short}ถึงบ้าน`;
}

// ---- moving for good ----
function moveCost(p, to) { const e = entry(p, to, true); const settle = UPKEEP[Math.min(p.cls, 2)] * (RBY[to].wealth / 50 + .4) * .8; return { fare: fare(p, to), fee: e.fee || 0, settle, total: fare(p, to) + (e.fee || 0) + settle, e }; }
function canMove(p, to) {
  const w = canTravel(p); if (w) return w;
  if (p.age < 16) return 'ต้องอายุ 16 ปีขึ้นไป';
  if (p.flags.movedAge === p.age) return 'ปีนี้ย้ายบ้านไปแล้ว';
  const c = moveCost(p, to); if (!c.e.ok) return c.e.why;
  if (p.wealth < c.total) return `ต้องมี ${money(c.total)} สำหรับค่าเดินทาง${c.fee ? ` ${c.e.label}` : ''} และค่าตั้งตัว`;
  return null;
}
function moveTo(p, to) {
  if (canMove(p, to)) return null;
  const c = moveCost(p, to), from = p.realm;
  const out = [];
  p.wealth = clampW(p.wealth - c.total); led(p, 'travel', -c.total);
  if (p.biz) { const v = sellValue(p); out.push(`คุณขาย${BIZ[p.biz.id].n}ก่อนย้าย ได้เงินคืน ${money(v)}`); p.wealth += v; led(p, 'sales', v); p.biz = null; if (p.focus === 'biz') p.focus = 'work'; }
  move(p, RBY[to]); p.flags.movedAge = p.age; p.flags.moves = (p.flags.moves || 0) + 1; p.happy -= 4;
  // spouse and young children come along; parents and grown siblings stay
  for (const m of p.fam || []) if (m.alive && (m.rel === 'spouse' || (m.rel === 'child' && famAge(p, m) < 18))) m.realm = to;
  out.unshift(`คุณเก็บข้าวของทั้งหมด แล้วย้ายจาก${from.name}ไปตั้งรกรากที่${RBY[to].name} ใช้เงินไป ${money(c.total)}`);
  const left = (p.fam || []).filter(m => m.alive && m.realm === from.id && (m.rel === 'mother' || m.rel === 'father'));
  if (left.length) out.push(`${left.map(m => relName(p, m)).join('กับ')}ยืนส่งคุณอยู่ที่ปากทาง`);
  if (p.career && !CBY[p.career].base) { const cm = careerMissing(p, CBY[p.career]); if (cm.some(x => x.startsWith('ต้องอยู่ที่'))) { const was = careerTitle(p); setCareer(p, defaultCareer(p)); out.push(`ที่นี่ไม่มีงาน${was}ให้ทำ คุณต้องเริ่มใหม่เป็น${careerTitle(p)}`); } }
  if (p.flags.fugitive && to !== 'aurelis' && to !== 'kragmor' && roll(.5)) { p.flags.fugitive = false; out.push('ที่นี่ไม่มีใครรู้จักหน้าคุณ คุณเริ่มต้นชีวิตใหม่ได้โดยไม่ต้องหลบซ่อน'); }
  return out.join(' · ');
}
LEGENDS.push(
  { id: 'traveler', n: 'นักเดินทาง', d: 'เคยไปเยือนครบทุกแดนในชีวิตเดียว', c: p => p.flags.visited && Object.keys(p.flags.visited).length + 1 >= 7 },
  { id: 'skydock', n: 'เหยียบนครลอย', d: 'คนเบื้องล่างที่ได้ขึ้นไปเหยียบเซเรนธ์', c: p => p.race !== 'เอลฟ์' && p.flags.visited && p.flags.visited.serenth },
);
// you can only carry so much: a pack on your back, more with a cart or a caravan
const carryCap = p => 15 + (p.cls <= 1 ? 15 : 0) + (p.biz && p.biz.id === 'caravan' ? 45 : 0);
const carried = p => MAT_IDS.reduce((s, m) => s + (inv(p)[m] || 0), 0);
extend('buyMat', 'travel: you cannot carry more than your pack holds', inner => function (p, m) { if (carried(p) >= carryCap(p)) return `ย่ามของคุณเต็มแล้ว ขนได้ไม่เกิน ${carryCap(p)} ชิ้น`; return inner(p, m); });

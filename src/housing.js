// ===== HOUSING AND LAND =====
// food, clothes and tax stay in the living cost; the roof over your head is now its own line
UPKEEP[0] = 5; UPKEEP[1] = 2.8; UPKEEP[2] = 2; UPKEEP[3] = 1.1;
RENT[0] = 0; // a noble's income now comes from the land they actually own
LEDGER_L.house = 'ค่าเช่าบ้านหรือภาษีบ้าน';
LEDGER_L.land = 'ผลผลิตจากที่นา';
const HOUSES = [
  { n: 'นอนข้างทาง', rent: 0, buy: 0, hp: -2, hap: -4, ill: 1.4, d: 'ไม่มีหลังคา ป่วยง่าย ลูกเล็กรอดยาก' },
  { n: 'เพิงพัก', rent: .4, buy: 5, hp: -1, hap: -2, ill: 1.2, d: 'ฝนตกก็รั่ว หนาวก็เข้า' },
  { n: 'ห้องเช่า', rent: 1, buy: 0, hp: 0, hap: 0, ill: 1, d: 'ห้องเดียวในตึกแออัด พออยู่ได้' },
  { n: 'บ้านไม้', rent: 1.8, buy: 22, hp: .5, hap: 1.5, ill: .92, d: 'บ้านของตัวเอง มีครัวและลานเล็กๆ' },
  { n: 'บ้านหิน', rent: 3.5, buy: 55, hp: 1, hap: 3, ill: .85, d: 'ผนังหนา ไฟไหม้ยาก หน้าหนาวอบอุ่น' },
  { n: 'คฤหาสน์', rent: 9, buy: 180, hp: 1.5, hap: 5, ill: .78, d: 'มีคนรับใช้ สวน และห้องมากกว่าที่ใช้' },
];
const TAX_RATE = .02;
const hPrice = (p, t) => HOUSES[t].buy * priceF(p);
const hRent = (p, t) => HOUSES[t].rent * priceF(p);
const HOME_ST = { family: 'อยู่บ้านพ่อแม่', rent: 'เช่าอยู่', own: 'บ้านของตัวเอง', master: 'อยู่ในบ้านของนาย', lord: 'อยู่ในกระท่อมบนที่ดินของเจ้าที่ดิน' };
function initHome(p, parent) {
  if (parent && parent.home && parent.home.status === 'own') { p.home = { tier: parent.home.tier, status: 'family', famOwned: true, realm: parent.home.realm || parent.realm.id }; return; }
  const rich = p.realm.wealth >= 40;
  const tier = [5, 4, rich ? 2 : (RURAL.includes(p.realm.id) ? 3 : 1), 1, 1][p.cls];
  p.home = { tier, status: p.cls === 4 ? 'master' : p.cls === 3 ? 'lord' : 'family', famOwned: p.cls <= 1 || (p.cls === 2 && tier === 3), realm: p.realm.id };
}
const homeOf = p => { if (!p.home) initHome(p); return p.home; };
const effTier = p => Math.max(0, homeOf(p).tier - (homeOf(p).damaged ? 1 : 0));
function houseYear(p) {
  const h = homeOf(p), out = [];
  // life (or a story event) moved you somewhere else: the old home is left behind
  if (h.realm && h.realm !== p.realm.id) {
    if (h.status === 'own') { const v = HOUSES[h.tier].buy * priceF({ realm: RBY[h.realm] }) * .7; p.wealth += v; led(p, 'sales', v); out.push(`ฝากคนขายบ้านหลังเก่าที่${RBY[h.realm].short} ได้เงินมา ${money(v)}`); }
    if (p.cls <= 2) Object.assign(h, { tier: p.cls <= 1 ? 3 : 2, status: 'rent', famOwned: false, damaged: false });
    h.realm = p.realm.id;
  }
  // tie-ups that follow class changes
  if (p.cls === 4 && h.status !== 'master') Object.assign(h, { tier: 1, status: 'master' });
  if (p.cls === 3 && h.status !== 'lord' && h.status !== 'own') Object.assign(h, { tier: 1, status: 'lord' });
  if (p.cls <= 2 && (h.status === 'master' || h.status === 'lord')) { Object.assign(h, { tier: 1, status: 'rent' }); out.push('ตอนนี้ต้องหาที่อยู่เอง ไปเช่าเพิงเล็กๆ อยู่'); }
  // when the family home's last parent dies, it passes to you or you start paying rent
  if (h.status === 'family' && p.fam && !famAlive(p, 'mother') && !famAlive(p, 'father') && p.age >= 14) {
    if (h.famOwned) { h.status = 'own'; out.push(`${HOUSES[h.tier].n}ของพ่อแม่ตกเป็นของคุณ`); }
    else { h.status = 'rent'; out.push('พ่อแม่จากไปหมดแล้ว ตั้งแต่ปีนี้ต้องจ่ายค่าเช่าที่อยู่เอง'); }
  }
  if (p.age >= 14) {
    if (h.status === 'rent') { const r = hRent(p, h.tier); p.wealth -= r; led(p, 'house', -r); if (p.wealth < 0) { p.wealth = 0; if (h.tier > 0) { h.tier = Math.max(0, h.tier - 1); out.push(`จ่ายค่าเช่าไม่ไหว เจ้าของไล่ออก ตอนนี้ต้องไปอยู่${HOUSES[h.tier].n}`); } } }
    if (h.status === 'own' && h.realm === p.realm.id) { const t = hPrice(p, h.tier) * TAX_RATE; p.wealth -= t; led(p, 'house', -t); }
  }
  // the roof affects body and mood
  const H = HOUSES[effTier(p)];
  p.health = clamp(p.health + H.hp * .6); p.happy = clamp(p.happy + H.hap * .5);
  // disasters
  const DIS = { undercity: [.03, 'ไฟไหม้ลามไปทั้งซอยใต้กำแพง'], mulvane: [.05, 'น้ำในหนองล้นขึ้นมาท่วมบ้าน'], grieve: [.04, 'ทัพที่ผ่านมาเผาบ้านเรือนในหมู่บ้าน'], dunes: [.03, 'พายุแก้วพัดหลังคาบ้านหายไป'], kragmor: [.01, 'ถ้ำที่อยู่อาศัยถล่มไปบางส่วน'], aurelis: [.01, 'เกิดไฟไหม้ในย่านที่อยู่'] };
  const d = DIS[p.realm.id];
  if (d && h.tier >= 1 && roll(d[0] * (h.tier >= 4 ? .4 : 1))) {
    if (h.status === 'own' && !h.damaged) { h.damaged = true; out.push(`${d[1]} ${HOUSES[h.tier].n}ของคุณเสียหาย ต้องซ่อมก่อนถึงจะอยู่ได้สบายเหมือนเดิม`); }
    else if (h.status !== 'own') { const l = Math.min(p.wealth, 3 * priceF(p)); p.wealth -= l; out.push(l >= .01 ? `${d[1]} ข้าวของเสียหายไป ${money(l)}` : `${d[1]} ยังดีที่แทบไม่มีอะไรให้เสีย`); }
  }
  return out.join(' · ') || null;
}
function canHouse(p) {
  if (p.age < 16) return 'ต้องอายุ 16 ปีขึ้นไป';
  if (p.cls === 4) return 'ทาสต้องอยู่ที่ที่นายจัดให้';
  if (p.cls === 3) return 'ไพร่ต้องอยู่บนที่ดินของเจ้าที่ดิน';
  return null;
}
function rentHome(p, t) {
  if (canHouse(p) || HOUSES[t].buy === undefined) return null;
  const h = homeOf(p); if (h.status === 'own') return null;
  const was = h.status === 'family';
  Object.assign(h, { tier: t, status: 'rent', damaged: false, realm: p.realm.id });
  return t === 0 ? 'เลิกเช่าที่อยู่ ออกไปนอนข้างทาง' : `คุณ${was ? 'ย้ายออกจากบ้านพ่อแม่ และ' : ''}เช่า${HOUSES[t].n}อยู่ ค่าเช่าปีละ ${money(hRent(p, t))}`;
}
function canBuyHome(p, t) {
  const w = canHouse(p); if (w) return w;
  if (!HOUSES[t].buy) return 'ซื้อไม่ได้ เช่าได้อย่างเดียว';
  if (homeOf(p).status === 'own') return 'ต้องขายบ้านเดิมก่อน';
  if (has(p, 'aurelis') && t >= 4 && p.cls === 2) return 'บ้านหินและคฤหาสน์ในเมืองชั้นในขายให้เฉพาะขุนนางและพ่อค้า';
  if (p.wealth < hPrice(p, t)) return `ต้องมี ${money(hPrice(p, t))}`;
  return null;
}
function buyHome(p, t) {
  if (canBuyHome(p, t)) return null;
  const c = hPrice(p, t); p.wealth -= c; led(p, 'buy', -c);
  Object.assign(homeOf(p), { tier: t, status: 'own', damaged: false, realm: p.realm.id, paid: c });
  p.flags.boughtHome = true; if (t >= 5) p.flags.manor = true; p.happy += 6;
  return `ซื้อ${HOUSES[t].n}เป็นของตัวเอง จ่ายไป ${money(c)}`;
}
const homeValue = p => hPrice(p, homeOf(p).tier) * (homeOf(p).damaged ? .6 : .8);
function sellHome(p) {
  const h = homeOf(p); if (h.status !== 'own') return null;
  const v = homeValue(p); p.wealth += v; led(p, 'sales', v);
  Object.assign(h, { tier: 2, status: 'rent', damaged: false });
  return `ขายบ้านได้ ${money(v)} แล้วไปเช่าห้องอยู่แทน`;
}
const repairCost = p => hPrice(p, homeOf(p).tier) * .25;
function repairHome(p) { const h = homeOf(p); if (!h.damaged || p.wealth < repairCost(p)) return null; const c = repairCost(p); p.wealth -= c; led(p, 'buy', -c); h.damaged = false; return `ซ่อมบ้านจนกลับมาเหมือนเดิม หมดไป ${money(c)}`; }

// ---- land ----
const FARM = { grieve: 1, mulvane: .8, dunes: .6, kragmor: .9, aurelis: 1.2 };
const plotPrice = (p, realm) => 14 * priceF({ realm: RBY[realm || p.realm.id] });
const landOf = p => p.land || (p.land = { realm: null, plots: 0, share: .5 });
function canBuyLand(p) {
  const w = canHouse(p); if (w) return w;
  if (!FARM[p.realm.id]) return 'แดนนี้ไม่มีที่นาให้ซื้อ';
  if (has(p, 'aurelis') && p.cls === 2) return 'ที่ดินรอบออเรลิสขายให้เฉพาะขุนนางและพ่อค้า';
  const L = landOf(p); if (L.plots && L.realm !== p.realm.id) return `คุณมีที่ดินอยู่ที่${RBY[L.realm].short}แล้ว ต้องขายก่อน`;
  if (L.plots >= 20) return 'ที่ดินแถบนี้ไม่มีใครขายแล้ว';
  if (p.wealth < plotPrice(p)) return `ต้องมี ${money(plotPrice(p))}`;
  return null;
}
function buyLand(p) {
  if (canBuyLand(p)) return null;
  const c = plotPrice(p), L = landOf(p); p.wealth -= c; led(p, 'buy', -c); L.realm = p.realm.id; L.plots++;
  return L.plots === 3 ? `ซื้อที่นาเพิ่มอีกแปลง ตอนนี้มี 3 แปลง เยอะเกินกว่าจะทำเอง ต้องให้ไพร่มาเช่าทำ` : `ซื้อที่นาแปลงหนึ่ง จ่ายไป ${money(c)} ตอนนี้มี ${L.plots} แปลง`;
}
function sellLand(p) { const L = landOf(p); if (!L.plots) return null; const v = plotPrice(p, L.realm) * .8; L.plots--; if (!L.plots) L.realm = null; p.wealth += v; led(p, 'sales', v); return `ขายที่นาไปแปลงหนึ่ง ได้ ${money(v)}`; }
function setShare(p, s) { landOf(p).share = s; return s === .5 ? 'ประกาศว่าไพร่ที่เช่านาต้องส่งผลผลิตให้ครึ่งหนึ่ง เหมือนเจ้าที่ดินทุกคน' : 'ประกาศว่าไพร่ที่เช่านาส่งผลผลิตแค่หนึ่งในสามพอ ข่าวนี้ลือกันไปทั่วหมู่บ้าน'; }
function landYear(p) {
  const L = landOf(p); if (!L.plots || p.age < 14) return null;
  const out = [];
  const R = RBY[L.realm], F = (R.wealth / 50 + .4) * .8;
  let w = .5 + Math.random() * .8; if (roll(.12)) { w = .25; out.push('ปีนี้ฝนแล้ง ที่นาได้ผลผลิตแค่หนึ่งในสี่'); }
  let y = L.plots * 1.6 * F * FARM[L.realm] * w;
  if (L.plots < 3) y *= .6; // you hire hands, which eats into the harvest
  else { y *= L.share === .5 ? 1 : .67; p.flags.landlord = true; if (L.share === .5) p.flags.harshLord = (p.flags.harshLord || 0) + 1; else { p.flags.fairLord = (p.flags.fairLord || 0) + 1; p.happy += 1; } }
  if (L.realm !== p.realm.id) y *= .8; // a steward takes his cut
  y -= y * .1; // the church's tithe
  p.wealth += y; led(p, 'land', y);
  if (L.plots >= 3 && L.share === .5 && roll(.04)) { const l = y * .8; p.wealth -= l; led(p, 'land', -l); out.push('ไพร่ที่เช่านารวมหัวกันเผายุ้งข้าว ผลผลิตปีนี้แทบไม่เหลือ'); }
  if (L.realm === 'grieve' && roll(.04)) { L.plots--; if (!L.plots) L.realm = null; out.push('ทัพขุนศึกยึดที่นาไปแปลงหนึ่ง ไม่มีใครกล้าไปทวงคืน'); }
  return out.join(' · ') || null;
}

// ---- hooks ----
onBorn('housing: a home, and land for noble houses', (p, parent) => {
  initHome(p, parent);
  if (parent && parent.land && parent.land.plots) p.land = { ...parent.land };
  else if (!parent && p.cls === 0) { const r = FARM[p.realm.id] ? p.realm.id : 'aurelis'; p.land = { realm: r, plots: 4 + Math.floor(Math.random() * 6), share: .5 }; }
});
afterYear('housing: rent, tax, disasters, land harvest', p => [houseYear(p), landYear(p)]);
// illness and the survival of small children depend on the roof
modHazards('housing: a poor roof makes illness deadlier', (p, H) => { if (p.home && H[0]) H[0][1] *= HOUSES[effTier(p)].ill; });
(() => {
  const e = EVENTS.find(x => /p\.realm\.infant \* 2\.5/.test(x.c.toString()));
  if (e) e.c = p => p.kidNames.length > 0 && Math.random() < p.realm.infant * 2.5 * HOUSES[effTier(p)].ill;
})();
// moving away: a house cannot come with you
extend('moveTo', 'housing: moving away: a house cannot come with you', inner => function (p, to) {
  const h = homeOf(p), owned = h.status === 'own' && !canMove(p, to);
  const v = owned ? homeValue(p) : 0;
  const t = inner(p, to); if (!t) return t;
  const extra = [];
  if (owned) { p.wealth += v; led(p, 'sales', v); extra.push(`ขายบ้านหลังเก่าได้ ${money(v)}`); }
  Object.assign(h, { tier: 2, status: 'rent', damaged: false, realm: to, famOwned: false });
  extra.push('ที่บ้านใหม่ เช่าห้องอยู่ไปก่อน');
  return [t, ...extra].join(' · ');
});
// creditors take the house before they take you
extend('loanYear', 'housing: creditors take the house before they take you', inner => function (p) {
  const L = p.loan;
  if (L && p.wealth < L.pay && L.missed >= 2 && !p.biz) {
    if (homeOf(p).status === 'own') { const n = HOUSES[p.home.tier].n; Object.assign(p.home, { tier: 1, status: 'rent', damaged: false }); p.loan = null; p.flags.badCredit = true; p.happy -= 10; return `ค้างหนี้ติดกันสามปี เจ้าหนี้เลยยึด${n}ไป ตอนนี้ต้องไปเช่าเพิงอยู่`; }
    if (landOf(p).plots) { const n = p.land.plots; p.land.plots = 0; p.land.realm = null; p.loan = null; p.flags.badCredit = true; p.happy -= 8; return `ค้างหนี้ติดกันสามปี เจ้าหนี้เลยยึดที่นาไปทั้ง ${n} แปลง`; }
  }
  return inner(p);
});
LEGENDS.push(
  { id: 'homeowner', n: 'หลังคาของตัวเอง', d: 'เกิดเป็นไพร่หรือทาส แต่ได้ซื้อบ้านเป็นของตัวเอง', c: p => p.flags.boughtHome && p.bornCls >= 3 },
  { id: 'fairlord', n: 'เจ้าที่ดินที่ไม่เหมือนใคร', d: 'มีไพร่เช่าที่นา แต่เก็บส่วนแบ่งแค่หนึ่งในสามมาตลอด 10 ปี', c: p => (p.flags.fairLord || 0) >= 10 && !p.flags.harshLord },
  { id: 'becamelord', n: 'กลายเป็นสิ่งที่เคยเกลียด', d: 'เกิดเป็นไพร่ แต่ภายหลังเก็บส่วนแบ่งครึ่งหนึ่งจากไพร่ของตัวเอง', c: p => p.bornCls === 3 && (p.flags.harshLord || 0) >= 3 },
);

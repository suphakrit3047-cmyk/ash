// ===== LONGER LIVES, DISEASES AND CURSES =====
// most people now live into their sixties; the poor still age faster and get sick more
const AGE_SHIFT = { aurelis: 2, undercity: 5, grieve: 5, mulvane: 7, dunes: 4, kragmor: 0, serenth: 0 };
for (const r of REALMS) { r.agingStart += AGE_SHIFT[r.id] || 0; r.infant *= .4; r.child *= .45; r.adult *= .55; r.war *= .45; r.famine *= .5; }

const ILLS = {
  ashfever: { n: 'ไข้เถ้าดำ', d: 'ไอเป็นเถ้าสีดำ ถ้าไม่รักษาอาการจะหนักขึ้นทุกปี', acute: true, doc: 3, cures: { doctor: .8, heal: [1, .7], potion: .45, temple: .35 } },
  ashlung: { n: 'ปอดเถ้า', d: 'เถ้าสะสมในปอด หายใจไม่เต็มอิ่ม สุขภาพทรุดลงช้าๆ', doc: 10, cures: { doctor: .4, heal: [3, .6], temple: .25 }, suppress: 'potion' },
  swampfever: { n: 'ไข้หนอง', d: 'ไข้ที่กลับมาเป็นซ้ำทุกฤดูฝน', doc: 4, cures: { doctor: .6, heal: [2, .7], temple: .3 }, suppress: 'potion' },
  glassskin: { n: 'ผิวแก้ว', d: 'ผิวค่อยๆ แข็งเป็นแก้ว ขยับตัวได้ช้าลงเรื่อยๆ หมอทั่วไปรักษาไม่ได้', doc: 20, cures: { doctor: .08, heal: [4, .6], serenth: .6 } },
  wither: { n: 'อาการเหี่ยวเฉา', d: 'โรคของเอลฟ์ที่มีชีวิตนานเกินไป ร่างกายไม่ได้ป่วย แต่ใจไม่อยากอยู่ต่อ', doc: 6, cures: { doctor: .15, temple: .2 } },
};
const CURSES = {
  thread: { n: 'คำสาปเส้นใย', d: 'เส้นใยที่คุณแตะต้องดึงร่างกายคุณไปทีละน้อย เหมือนที่มันดึงฟ้า' },
  ruin: { n: 'คำสาปจากซากเมือง', d: 'ของที่คุณหยิบมาจากซากเมืองมีบางอย่างติดมาด้วย โชคร้ายตามคุณไปทุกที่' },
  blood: { n: 'คำสาปตระกูล', d: 'คำสาปที่ส่งต่อทางสายเลือด คนในครอบครัวเจ็บป่วยและล้มตายง่ายกว่าปกติ' },
};
const ills = p => p.ills || (p.ills = []);
const curses = p => p.curses || (p.curses = []);
const hasIll = (p, id) => ills(p).some(x => x.id === id);
const hasCurse = (p, id) => curses(p).some(x => x.id === id);
function catchIll(p, id, why) { if (hasIll(p, id)) return null; ills(p).push({ id, stage: 1, since: p.age }); p.flags.illCount = (p.flags.illCount || 0) + 1; return why || `คุณติด${ILLS[id].n}`; }
function addCurse(p, id, why) { if (hasCurse(p, id)) return null; curses(p).push({ id, since: p.age }); p.flags.cursed = true; return why; }
function healIll(p, x) { p.ills = ills(p).filter(y => y !== x); p.flags.cured = (p.flags.cured || 0) + 1; }
function liftCurse(p, id) { p.curses = curses(p).filter(y => y.id !== id); p.flags.liftedCurse = true; }

// sudden death from illness becomes rare: sickness now arrives as a disease you can see and treat
const _hazards2 = hazards;
hazards = function (p) {
  const H = _hazards2(p);
  for (const h of H) { if (h[2] === 'plague' || (h[2] === 'ill' && p.age >= 15)) h[1] *= .3; }
  return H;
};

function contractYear(p) {
  const r = p.realm, a = p.age, out = [];
  const poor = 1.3 - Math.min(p.wealth, 100) / 100 * .8;
  const roof = typeof effTier === 'function' ? HOUSES[effTier(p)].ill : 1;
  const k = a < 15 ? .4 : 1;
  if (roll(r.plague / .6 * 4 * poor * roof * k * hazardMod(p, 'plague'))) out.push(catchIll(p, 'ashfever', 'คุณเริ่มไอออกมาเป็นเถ้าสีดำ หมอในละแวกบอกว่าเป็นไข้เถ้าดำ'));
  const dusty = ['laborer', 'farmer', 'serf', 'slave', 'smith', 'soldier'].includes(p.career) || has(p, 'kragmor');
  if (a >= 16 && has(p, 'kragmor', 'undercity', 'grieve') && dusty && roll(.012)) out.push(catchIll(p, 'ashlung', 'คุณไอไม่หยุดมาหลายเดือน หมอบอกว่าปอดของคุณเต็มไปด้วยเถ้า'));
  if (a >= 5 && has(p, 'mulvane', 'grieve') && roll(has(p, 'mulvane') ? .04 : .01)) out.push(catchIll(p, 'swampfever', 'ฝนแรกของปีมาพร้อมไข้หนอง คุณนอนสั่นอยู่บนเสื่อทั้งเดือน'));
  if (a >= 10 && has(p, 'dunes') && roll(OUTDOOR.includes(p.career) ? .025 : .012)) out.push(catchIll(p, 'glassskin', 'ผิวที่หลังมือของคุณเริ่มแข็งและใส เหมือนแก้วที่ยังไม่เย็นตัว'));
  if (p.race === 'เอลฟ์' && a >= 120 && roll(.03)) out.push(catchIll(p, 'wither', 'เช้าวันหนึ่งคุณตื่นมาแล้วไม่อยากลุกจากเตียง และวันต่อๆ มาก็เหมือนเดิม'));
  // curses
  if ((p.flags.usurper || p.flags.plotted) && !p.flags.bloodChecked) { p.flags.bloodChecked = true; if (roll(.6)) out.push(addCurse(p, 'blood', 'แม่มดชราคนหนึ่งยืนรออยู่หน้าประตูบ้าน เธอบอกว่าเลือดที่คุณทำให้หลั่งจะตามลูกหลานคุณไปอีกหลายรุ่น')); }
  if (p.cls <= 1 && a >= 20 && roll(.002)) out.push(addCurse(p, 'blood', 'คุณได้ยินว่าตระกูลคู่แข่งจ้างแม่มดสาปแช่งตระกูลของคุณ ปีนั้นคนในบ้านเริ่มเจ็บป่วยกันไม่หยุด'));
  return out.filter(Boolean);
}
function illYear(p) {
  const out = [];
  for (const x of [...ills(p)]) {
    const I = ILLS[x.id];
    if (x.treated === p.age) continue;
    const rest = p.focus === 'rest';
    // children are looked after by their family, if the family can pay
    if (p.age < 14 && p.cls <= 2 && roll(p.cls <= 1 ? .9 : .5) && (I.cures.doctor || 0) >= .4) { if (roll(I.cures.doctor)) { healIll(p, x); out.push(`พ่อแม่พาคุณไปหาหมอ และ${I.n}ก็หายไป`); continue; } }
    switch (x.id) {
      case 'ashfever':
        if (roll(rest ? .5 : .3)) { healIll(p, x); out.push('ไข้เถ้าดำของคุณค่อยๆ หายไปเอง'); break; }
        if (roll(.35)) x.stage++;
        p.health -= 5 * x.stage;
        if (x.stage >= 4) { if (roll(.2)) { die(p, 'เสียชีวิตด้วยไข้เถ้าดำที่ไม่ได้รักษา'); return 'ไข้เถ้าดำลุกลามจนร่างกายรับไม่ไหว'; } x.stage = 3; }
        out.push(['', 'คุณยังไอเป็นเถ้าอยู่', 'ไข้เถ้าดำหนักขึ้น คุณมีไข้สูงทั้งฤดู', 'ไข้เถ้าดำเข้าระยะวิกฤต ถ้าไม่รักษาปีหน้าอาจไม่รอด'][x.stage]);
        break;
      case 'ashlung': p.health -= 2; p.happy -= 1; if (roll(.3)) out.push('คุณหอบทุกครั้งที่เดินขึ้นเนิน'); break;
      case 'swampfever': if (roll(.5)) { p.health -= 6; p.happy -= 2; out.push('ไข้หนองกำเริบอีกแล้วในฤดูฝนปีนี้'); } break;
      case 'glassskin': p.health -= 1; if (roll(.25) && p.attrs.DEX > 6) { p.attrs.DEX--; out.push('ผิวแก้วลามขึ้นไปถึงข้อศอก คุณขยับนิ้วได้ช้าลงอีก (ว่องไว −1)'); } break;
      case 'wither': p.happy -= 5; if (p.focus === 'love' && roll(.3)) { healIll(p, x); out.push('การได้อยู่กับคนที่รักทำให้คุณอยากมีชีวิตอยู่ต่ออีกครั้ง'); } break;
    }
  }
  for (const c of curses(p)) {
    if (c.id === 'thread' && roll(.2)) { p.health -= 8; out.push('เส้นใยในตัวคุณกระตุกแรงจนคุณล้มลงกลางทาง'); }
    if (c.id === 'ruin' && roll(.25)) { if (roll(.5)) { const l = p.wealth * .1; p.wealth -= l; out.push(`โชคร้ายตามคุณมาอีกแล้ว คุณทำเงินหายไป ${money(l)}`); } else { p.happy -= 4; out.push('ทุกอย่างที่คุณแตะดูเหมือนจะพังลงไปหมด'); } }
    if (c.id === 'blood') p.happy -= 2;
  }
  return out;
}
// treatment
const TREAT_L = { doctor: 'จ้างหมอ', heal: 'ใช้เวทรักษา', potion: 'ต้มยาสมุนไพร', temple: 'ไปขอพรที่วิหาร', serenth: 'หาผู้รักษาที่เซเรนธ์' };
const hereIs = (p, id) => p.realm.id === id || (p.trip && p.trip.to === id);
function treatCost(p, x, m) { const I = ILLS[x.id]; if (m === 'doctor') return I.doc * x.stage ** .5 * priceF(p) * (p.cls <= 1 ? 1.2 : 1); if (m === 'temple') return 6 * priceF(p) * (p.rep && p.rep.church >= 30 ? .5 : 1); if (m === 'serenth') return 30; return 0; }
function treatWhy(p, x, m) {
  const I = ILLS[x.id], c = I.cures[m];
  if (x.tried && x.tried[m] === p.age) return 'ปีนี้ลองวิธีนี้ไปแล้ว';
  if (m === 'potion') { if (!(c || I.suppress === 'potion')) return 'ใช้ไม่ได้กับโรคนี้'; if (rank(p, 'alchemy') < 1 && rank(p, 'medicine') < 1) return 'ต้องมีเล่นแร่หรือการแพทย์ขั้น 1'; if (!hasMat(p, 'herb', 2)) return 'ต้องมีสมุนไพร 2 ชิ้น'; return null; }
  if (!c) return 'ใช้ไม่ได้กับโรคนี้';
  if (m === 'heal' && rank(p, 'heal') < c[0]) return `ต้องมีเวทรักษาขั้น ${c[0]}`;
  if (m === 'temple' && !has(p, 'aurelis', 'undercity')) return 'ต้องอยู่ที่ออเรลิส';
  if (m === 'serenth' && !hereIs(p, 'serenth')) return 'ต้องอยู่ที่เซเรนธ์';
  if (m === 'doctor' && p.cls === 4) return 'นายไม่จ้างหมอให้ทาส';
  const cost = treatCost(p, x, m); if (cost && p.wealth < cost) return `ต้องมี ${money(cost)}`;
  return null;
}
function treat(p, idx, m) {
  const x = ills(p)[idx]; if (!x || treatWhy(p, x, m)) return null;
  const I = ILLS[x.id], cost = treatCost(p, x, m);
  if (cost) { p.wealth -= cost; led(p, 'buy', -cost); }
  x.tried = x.tried || {}; x.tried[m] = p.age; x.treated = p.age;
  if (m === 'potion') { inv(p).herb -= 2; if (I.cures.potion && roll(I.cures.potion + rank(p, 'alchemy') * .05)) { healIll(p, x); return `คุณต้มยาจากสมุนไพรกินเอง และ${I.n}หายไปในที่สุด`; } if (x.stage > 1) x.stage--; return `ยาที่ต้มเองช่วยให้${I.n}ทุเลาลงในปีนี้`; }
  const c = (m === 'heal' ? I.cures.heal[1] : I.cures[m]) + (m === 'temple' && p.rep && p.rep.church >= 30 ? .2 : 0);
  if (roll(c)) { healIll(p, x); return { doctor: `หมอรักษา${I.n}ของคุณจนหายขาด`, heal: `คุณใช้เวทรักษา${I.n}ของตัวเองจนหาย`, temple: `หลังสวดอยู่เจ็ดวัน ${I.n}ของคุณก็หายไป นักบวชบอกว่าเป็นพรของดวงอาทิตย์`, serenth: `ผู้รักษาชาวเอลฟ์ดึงเถ้าออกจากผิวคุณทีละเส้น ${I.n}หายไปหมด` }[m]; }
  return { doctor: `หมอให้ยามากินทั้งปี แต่${I.n}ยังไม่หาย`, heal: `เวทของคุณยังไม่แรงพอจะไล่${I.n}ออกไป`, temple: `คุณบริจาคเงินให้วิหาร แต่${I.n}ยังอยู่เหมือนเดิม`, serenth: `แม้แต่ผู้รักษาชาวเอลฟ์ก็ยังรักษา${I.n}ไม่หาย` }[m];
}
// lifting curses
function curseActs(p, c) {
  if (c.id === 'thread') return [{ id: 'release', n: 'ปล่อยเศษเส้นใยทั้งหมดคืนฟ้า', why: !(inv(p).shard > 0) ? 'ต้องมีเศษเส้นใยอย่างน้อย 1 ชิ้น' : null, d: 'เสียเศษเส้นใยทั้งหมด และพลังเวทที่เก่งที่สุดลดลงหนึ่งขั้น' }, { id: 'serenth', n: 'ให้ผู้ดูแลเส้นใยที่เซเรนธ์ตัดออก', why: !hereIs(p, 'serenth') ? 'ต้องอยู่ที่เซเรนธ์' : p.wealth < 30 ? `ต้องมี ${money(30)}` : null, d: `ค่าใช้จ่าย ${money(30)}` }];
  if (c.id === 'ruin') return [{ id: 'return', n: 'นำของกลับไปคืนซากเมือง', why: !['dunes', 'grieve', 'mulvane'].some(r => hereIs(p, r)) ? 'ต้องอยู่ที่ทะเลทราย กรีฟ หรือมูลเวน' : null, d: 'คืนแก้วเถ้าทั้งหมดที่มีให้ซากเมือง' }, { id: 'priest', n: 'ให้นักบวชทำพิธีแก้', why: p.wealth < 10 ? `ต้องมี ${money(10)}` : null, d: `ค่าพิธี ${money(10)} ได้ผลครึ่งต่อครึ่ง` }];
  if (c.id === 'blood') return [{ id: 'atone', n: 'ไปขอขมาและชดใช้ให้ตระกูลที่ถูกกระทำ', why: p.wealth < 30 ? `ต้องมี ${money(30)}` : null, d: `ใช้เงิน ${money(30)} และต้องโน้มน้าวให้พวกเขายอมรับ (ทอยเสน่ห์+วาทศิลป์)` }];
  return [];
}
function curseAct(p, cid, aid) {
  const c = curses(p).find(x => x.id === cid); if (!c) return null;
  const a = curseActs(p, c).find(x => x.id === aid); if (!a || a.why) return null;
  if (c.tried === p.age) return 'ปีนี้คุณลองแก้คำสาปไปแล้ว';
  c.tried = p.age;
  if (aid === 'release') { inv(p).shard = 0; const best = SKILLS.filter(s => s.magic).sort((x, y) => rank(p, y.id) - rank(p, x.id))[0]; if (best && rank(p, best.id) > 0) p.skills[best.id].r--; liftCurse(p, cid); return 'คุณปล่อยเศษเส้นใยลอยขึ้นฟ้าทีละชิ้น ร่างกายเบาลงจนแทบลอยได้ แต่บางอย่างในตัวคุณก็หายไปด้วย'; }
  if (aid === 'serenth') { p.wealth -= 30; led(p, 'buy', -30); liftCurse(p, cid); return 'ผู้ดูแลเส้นใยตัดเส้นที่พันตัวคุณออกทีละเส้น โดยไม่ถามสักคำว่าคุณไปแตะมันมาจากไหน'; }
  if (aid === 'return') { inv(p).glass = 0; liftCurse(p, cid); return 'คุณวางของทุกชิ้นคืนไว้ในห้องใต้ดินของซากเมือง แล้วเดินออกมาโดยไม่หันหลังกลับไปมอง'; }
  if (aid === 'priest') { p.wealth -= 10; led(p, 'buy', -10); if (roll(.5)) { liftCurse(p, cid); return 'พิธีได้ผล คุณรู้สึกเหมือนมีอะไรหลุดออกไปจากบ่า'; } return 'นักบวชสวดอยู่ทั้งคืน แต่ไม่มีอะไรเปลี่ยนไป'; }
  if (aid === 'atone') { p.wealth -= 30; led(p, 'buy', -30); if (check(p, 'CHA', 'speech', 14)) { liftCurse(p, cid); p.happy += 6; return 'หัวหน้าตระกูลรับเงินและคำขอโทษของคุณ เขาบอกว่าลูกหลานของคุณจะไม่ต้องแบกเรื่องนี้อีกแล้ว'; } return 'พวกเขารับเงินไป แต่ไม่ยอมรับคำขอโทษ'; }
  return null;
}
// curses arrive from risky things you already do
const _addMat2 = addMat;
addMat = function (p, m, n) { const r = _addMat2(p, m, n); if (m === 'shard' && n > 0 && roll(.15)) { const t = addCurse(p, 'thread', 'เศษเส้นใยที่คุณเก็บมาพันรอบข้อมือคุณ และไม่ยอมคลายออก'); if (t) (p.pendingNotes = p.pendingNotes || []).push(t); } return r; };
(() => {
  const q = QBY.ruins; if (!q) return;
  const ob = q.build;
  q.build = p => { const b = ob(p); b.options = b.options.map(o => Object.assign({}, o, { act: z => { const t = o.act(z); if (z.alive && /ห้องเก็บของ|ของมีค่า/.test(t) && roll(.25)) { addCurse(z, 'ruin'); return t + ' · คืนนั้นคุณฝันว่ามีคนเดินตามหลังมาจากซากเมือง'; } return t; } })); return b; };
})();
// the family curse follows the blood
const _makePerson6 = makePerson;
makePerson = function (realm, parent) { const p = _makePerson6(realm, parent); if (parent && parent.curses && parent.curses.some(c => c.id === 'blood')) { p.curses = [{ id: 'blood', since: 0, inherited: true }]; } return p; };
const _famHazard = famHazard;
famHazard = function (p, m, age) { const c = _famHazard(p, m, age); if (c) return c; if (p.curses && p.curses.some(x => x.id === 'blood') && age >= 1) return _famHazard(p, m, age); return null; };
function autoTreat(p) { ills(p).forEach((x, i) => { for (const m of ['heal', 'potion', 'doctor', 'temple']) if (!treatWhy(p, x, m) && roll(.6)) { treat(p, i, m); break; } }); }
const _applyFocus9 = applyFocus;
applyFocus = function (p) {
  if (p.auto) autoTreat(p);
  const t = _applyFocus9(p);
  if (!p.alive) return t;
  const lines = [...(p.pendingNotes || []), ...contractYear(p)]; p.pendingNotes = [];
  const iy = illYear(p);
  if (typeof iy === 'string') return [t, ...lines, iy].filter(Boolean).join(' · ');
  return [t, ...lines, ...iy].filter(Boolean).join(' · ') || null;
};
LEGENDS.push(
  { id: 'survivor', n: 'รอดจากไข้เถ้าดำ', d: 'หายจากไข้เถ้าดำที่เข้าระยะวิกฤตแล้ว', c: p => p.flags.survivedCrisis },
  { id: 'cursebreaker', n: 'แก้คำสาป', d: 'ปลดคำสาปออกจากตัวเองได้สำเร็จ', c: p => p.flags.liftedCurse },
  { id: 'glassman', n: 'คนแก้ว', d: 'มีชีวิตอยู่กับผิวแก้วจนอายุ 50', c: p => hasIll(p, 'glassskin') && p.age >= 50 },
);
const _healIll = healIll;
healIll = function (p, x) { if (x.id === 'ashfever' && x.stage >= 3) p.flags.survivedCrisis = true; return _healIll(p, x); };

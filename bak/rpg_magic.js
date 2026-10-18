// ===== RPG LAYER: attributes, skills, magic, levels, dice checks, careers =====
const ATTRS = [
  { id: 'STR', n: 'พลัง', d: 'แรงกาย การต่อสู้ระยะประชิด งานหนัก' },
  { id: 'DEX', n: 'ว่องไว', d: 'ความคล่องตัว ธนู การลอบเร้น การหลบหนี' },
  { id: 'CON', n: 'อึด', d: 'ความทนทาน ป่วยยาก ทนหิว' },
  { id: 'INT', n: 'ปัญญา', d: 'การเรียนรู้ ตำรา เวทไฟ เล่นแร่แปรธาตุ' },
  { id: 'WIS', n: 'สติ', d: 'การสังเกต การแพทย์ เอาตัวรอด เวทรักษา' },
  { id: 'CHA', n: 'เสน่ห์', d: 'การพูด การค้า การโน้มน้าว เวทมายา' },
];
const ABY = Object.fromEntries(ATTRS.map(a => [a.id, a]));
const RACE_MOD = {
  'มนุษย์': { STR: 1, CHA: 1 }, 'ชาวทะเลทราย': { CON: 1, WIS: 1 }, 'เอลฟ์': { DEX: 2, INT: 1, CON: -1 },
  'คนแคระ': { CON: 2, STR: 1, CHA: -1 }, 'ออร์ค': { STR: 2, CON: 1, INT: -2 }, 'ก็อบลิน': { DEX: 2, WIS: 1, STR: -1 },
  'ลูกครึ่งออร์ค': { STR: 1, CON: 1 }, 'ลูกครึ่งเอลฟ์': { DEX: 1, CHA: 1 },
};
const SKILLS = [
  { id: 'letters', n: 'อ่านเขียน', a: 'INT', g: 'ความรู้', min: 6 },
  { id: 'history', n: 'ประวัติศาสตร์', a: 'INT', g: 'ความรู้', min: 10 },
  { id: 'medicine', n: 'การแพทย์', a: 'WIS', g: 'ความรู้', min: 12 },
  { id: 'alchemy', n: 'เล่นแร่แปรธาตุ', a: 'INT', g: 'ความรู้', min: 12 },
  { id: 'sword', n: 'ดาบ', a: 'STR', g: 'การต่อสู้', min: 10 },
  { id: 'bow', n: 'ธนู', a: 'DEX', g: 'การต่อสู้', min: 8 },
  { id: 'survival', n: 'เอาตัวรอดในป่า', a: 'WIS', g: 'เอาตัวรอด', min: 7 },
  { id: 'stealth', n: 'ลอบเร้น', a: 'DEX', g: 'เอาตัวรอด', min: 7 },
  { id: 'trade', n: 'การค้า', a: 'CHA', g: 'สังคม', min: 10 },
  { id: 'speech', n: 'วาทศิลป์', a: 'CHA', g: 'สังคม', min: 10 },
  { id: 'smith', n: 'ช่างตีเหล็ก', a: 'STR', g: 'งานฝีมือ', min: 12 },
  { id: 'fire', n: 'เวทไฟ', a: 'INT', g: 'เวทมนตร์', magic: true },
  { id: 'heal', n: 'เวทรักษา', a: 'WIS', g: 'เวทมนตร์', magic: true },
  { id: 'illusion', n: 'เวทมายา', a: 'CHA', g: 'เวทมนตร์', magic: true },
  { id: 'thread', n: 'เวทเส้นใย', a: 'INT', g: 'เวทมนตร์', magic: true },
];
const SBY = Object.fromEntries(SKILLS.map(s => [s.id, s]));
const MAX_RANK = 5;

const mod = v => Math.floor((v - 10) / 2);
const am = (p, a) => mod(p.attrs[a]);
const rank = (p, s) => (p.skills && p.skills[s]) ? p.skills[s].r : 0;
const d6 = () => 1 + Math.floor(Math.random() * 6);
function roll4d6() { const r = [d6(), d6(), d6(), d6()].sort((a, b) => a - b); return r[1] + r[2] + r[3]; }
function rollAttrs() { const o = {}; ATTRS.forEach(a => o[a.id] = roll4d6()); return o; }
function applyRace(base, race) { const o = { ...base }, m = RACE_MOD[race] || {}; for (const k in m) o[k] = Math.max(3, Math.min(20, o[k] + m[k])); return o; }
const xpNeed = lv => 50 + lv * 25;

function initRPG(p, parent) {
  if (!p.attrs) p.attrs = applyRace(rollAttrs(), p.race);
  p.skills = {}; SKILLS.forEach(s => p.skills[s.id] = { r: 0, x: 0 });
  p.lv = 1; p.xp = 0; p.pts = 0; p.checks = []; p.ups = [];
  p.trainSkill = null;
  // starting body follows the stats
  p.health = clamp(p.health + am(p, 'CON') * 4);
  p.happy = clamp(p.happy + am(p, 'CHA') * 2);
}

// ---- dice ----
function check(p, a, s, dc) {
  const r = 1 + Math.floor(Math.random() * 20);
  const bonus = (a ? am(p, a) : 0) + (s ? rank(p, s) * 2 : 0) + (T(p, 'lucky') ? 1 : 0);
  const ok = r === 20 || (r !== 1 && r + bonus >= dc);
  (p.checks = p.checks || []).push({ a, s, r, bonus, dc, ok });
  return ok;
}
// which stat/skill an option rolls, for display before choosing
const CHK = {
  'วางแผนหลบหนี': ['DEX', 'stealth'], 'ไปเป็นเด็กฝึกงานในเมือง': ['CHA', 'speech'], 'หนีออกจากบ้าน': ['WIS', 'survival'],
  'หนีทหาร': ['DEX', 'stealth'], 'ซื้อบัตร': ['CHA', 'speech'], 'ไปยืนแถวหน้า': ['STR', 'sword'], 'เปิดประตูเอง': ['INT', 'history'],
  'ดำลงไปหา': ['CON', null], 'บุกยึดบ่อน้ำ': ['DEX', 'bow'], 'รับงาน': ['WIS', 'survival'], 'แอบไปเรียนตอนกลางคืน': ['DEX', 'stealth'],
  'แข่งกันอย่างยุติธรรม': ['INT', 'letters'], 'ใส่ร้ายเขา': ['CHA', 'speech'], 'ไปด้วย': ['DEX', 'stealth'], 'ไปเป็นพยานให้เขา': ['CHA', 'speech'],
  'วิ่งกลับเข้าไปเอาของมีค่า': ['DEX', null], 'ร่วมงานนี้': ['DEX', 'stealth'], 'รับเป็นคนกลาง': ['CHA', 'speech'], 'รับข้าวแต่ไม่สาบาน': ['CHA', 'speech'],
  'ออกสำรวจ': ['WIS', 'survival'], 'ปล้นขบวน': ['STR', 'sword'], 'สู้กับนักล่าค่าหัว': ['STR', 'sword'], 'สู้': ['STR', 'sword'],
  'ป่าวประกาศความจริงในออเรลิส': ['CHA', 'speech'], 'รับตำแหน่ง แล้วแอบปล่อยคนบริสุทธิ์': ['CHA', 'speech'], 'รับคำท้า': ['STR', 'sword'],
  'กลับเข้าไปช่วย': ['CON', null], 'ออกไปช่วยต้อนฝูง': ['CON', null], 'ลงสมัคร': ['CHA', 'speech'], 'ซื้อแค่สมุนไพรราคาถูก': ['WIS', 'medicine'],
};
function chkOf(o) { return o.chk || CHK[o.label] || null; }

// ---- xp & levels ----
function gainXP(p, n) {
  p.xp += n;
  while (p.xp >= xpNeed(p.lv)) {
    p.xp -= xpNeed(p.lv); p.lv++; p.pts++;
    (p.ups = p.ups || []).push(p.lv);
    if (p.auto) autoSpend(p);
  }
}
function spendPoint(p, a) { if (p.pts <= 0 || p.attrs[a] >= 20) return false; p.attrs[a]++; p.pts--; if (a === 'CON') p.health = clamp(p.health + 2); return true; }
function autoSpend(p) { while (p.pts > 0) { const a = pick(ATTRS).id; if (!spendPoint(p, a)) p.pts--; } }

// ---- who gets to learn what ----
function access(p, sid) {
  const s = SBY[sid], r = p.realm.id, f = p.flags;
  const no = why => ({ ok: false, why, mult: 0, cost: 0 });
  if (s.magic) {
    if (!p.gifted) return no('ไม่มีพลังเวท');
    if (p.age < 11) return no('พลังเวทจะตื่นตอนอายุ 11 ปี');
    if (sid === 'thread' && !(f.truthKnown || f.council || f.ledger)) return no('ต้องรู้ความลับของเส้นใยบนฟ้าก่อน');
    if (r === 'serenth') return { ok: true, mult: 1, cost: 5, label: 'หอเวทสูง · ค่าเรียน 5/ปี' };
    if (f.churchMage) return { ok: true, mult: 1, cost: 0, label: 'ศาสนจักรสอนให้' };
    if (r === 'aurelis' || r === 'undercity') return { ok: true, mult: .5, cost: 0, label: 'ฝึกลับๆ · ช้า และเสี่ยงถูกจับ', danger: true };
    if (f.healer || f.warmage) return { ok: true, mult: .7, cost: 0, label: 'ฝึกจากการใช้งานจริง' };
    return { ok: true, mult: .5, cost: 0, label: 'ฝึกเองไม่มีครู · ช้า' };
  }
  if (p.age < s.min) return no(`เริ่มฝึกได้ตอนอายุ ${s.min} ปี`);
  if (p.cls === 4 && !['stealth', 'survival', 'letters'].includes(sid)) return no('ทาสไม่มีเวลาและไม่มีสิทธิ์ฝึกสิ่งนี้');
  const slave = p.cls === 4 ? .5 : 1;
  switch (sid) {
    case 'letters':
      if (p.cls === 4) return f.mentor != null ? { ok: true, mult: .5, cost: 0, label: 'แอบเรียนกับอาจารย์ตอนกลางคืน' } : no('ทาสถูกห้ามเรียนหนังสือ');
      if (p.cls <= 1) return { ok: true, mult: 1.2, cost: 0, label: 'ครูประจำตระกูล' };
      if (f.mentor != null || f.literate) return { ok: true, mult: .9, cost: 0, label: 'มีคนสอน' };
      if (p.realm.lit >= .3) return { ok: true, mult: .9, cost: 3, label: 'โรงเรียนในเมือง · ค่าเรียน 3/ปี' };
      return { ok: true, mult: .25, cost: 0, label: 'ไม่มีใครสอน ฝึกเองได้ช้ามาก' };
    case 'history':
      if (rank(p, 'letters') < 1) return no('ต้องอ่านออกเขียนได้ก่อน');
      if (f.library || ['aurelis', 'serenth', 'kragmor'].includes(r)) return { ok: true, mult: 1, cost: f.library ? 0 : 3, label: f.library ? 'ตำราของอาจารย์' : 'หอสมุด · ค่าเข้า 3/ปี' };
      return { ok: true, mult: .5, cost: 0, label: 'มีหนังสือให้อ่านไม่กี่เล่ม' };
    case 'medicine':
      if (['aurelis', 'serenth'].includes(r)) return { ok: true, mult: 1, cost: 6, label: 'สำนักแพทย์ · ค่าเรียน 6/ปี' };
      if (r === 'mulvane') return { ok: true, mult: .8 * slave, cost: 0, label: 'หมอผีในหนองสอน' };
      return { ok: true, mult: .5 * slave, cost: 0, label: 'ครูพักลักจำ' };
    case 'alchemy':
      if (rank(p, 'letters') < 1) return no('ต้องอ่านออกเขียนได้ก่อน');
      if (['aurelis', 'serenth'].includes(r)) return { ok: true, mult: 1, cost: 8, label: 'ห้องทดลองของสมาคม · ค่าเรียน 8/ปี' };
      return { ok: true, mult: .3, cost: 0, label: 'ทดลองเองตามตำรา' };
    case 'sword':
      if (p.cls === 0 || f.knight) return { ok: true, mult: 1.2, cost: 0, label: 'ครูดาบของตระกูล' };
      if (f.soldier || r === 'grieve') return { ok: true, mult: .8, cost: 0, label: 'เรียนจากทหาร' };
      return { ok: true, mult: .4, cost: 0, label: 'ฝึกเองกับไม้' };
    case 'bow':
      if (['grieve', 'dunes', 'mulvane'].includes(r)) return { ok: true, mult: 1, cost: 0, label: 'ล่าสัตว์กับคนในหมู่บ้าน' };
      return { ok: true, mult: .5, cost: 0, label: 'ไม่มีที่ให้ฝึกยิง' };
    case 'survival':
      return ['grieve', 'dunes', 'mulvane', 'kragmor'].includes(r) ? { ok: true, mult: 1 * slave, cost: 0, label: 'เรียนรู้จากธรรมชาติรอบตัว' } : { ok: true, mult: .4 * slave, cost: 0, label: 'ในเมืองไม่ค่อยมีโอกาส' };
    case 'stealth':
      if (f.thiefGuild) return { ok: true, mult: 1.3, cost: 0, label: 'กลุ่มโจรสอนให้' };
      if (r === 'undercity') return { ok: true, mult: 1 * slave, cost: 0, label: 'ตรอกซอกซอยใต้กำแพง' };
      return { ok: true, mult: .6 * (p.cls === 4 ? 1.4 : 1), cost: 0, label: p.cls === 4 ? 'หลบสายตานายทุกวัน' : 'ฝึกเอง' };
    case 'trade':
      if (p.cls === 1) return { ok: true, mult: 1.2, cost: 0, label: 'กิจการของครอบครัว' };
      if (r === 'dunes' || r === 'aurelis') return { ok: true, mult: .8, cost: 0, label: r === 'dunes' ? 'ไปกับกองคาราวาน' : 'ตลาดใหญ่ของเมือง' };
      return { ok: true, mult: .5, cost: 0, label: 'ค้าขายเล็กๆ น้อยๆ' };
    case 'speech':
      if (p.cls === 0 || f.priest) return { ok: true, mult: 1.1, cost: 0, label: f.priest ? 'ฝึกเทศน์ในวิหาร' : 'ครูวาทศิลป์' };
      return { ok: true, mult: .5, cost: 0, label: 'ฝึกพูดกับคนรอบตัว' };
    case 'smith':
      if (f.weaponsmith) return { ok: true, mult: 1.3, cost: 0, label: 'โรงหลอมใหญ่' };
      if (r === 'kragmor') return { ok: true, mult: 1, cost: 0, label: 'ช่างในเหมืองสอน' };
      return { ok: true, mult: .3, cost: 0, label: 'ไม่มีเตาหลอมให้ใช้' };
  }
  return no('ไม่มีทางเรียน');
}
function trainable(p) { return SKILLS.filter(s => access(p, s.id).ok && rank(p, s.id) < MAX_RANK); }

function trainYear(p) {
  let sid = p.trainSkill;
  if (!sid || !access(p, sid).ok || rank(p, sid) >= MAX_RANK) {
    if (!p.auto) { p.focus = 'work'; return 'ปีนี้คุณฝึกสิ่งที่ตั้งใจไว้ไม่ได้ จึงกลับไปทำงานแทน'; }
    const list = trainable(p); if (!list.length) return null; sid = pick(list).id; p.trainSkill = sid;
  }
  const s = SBY[sid], ac = access(p, sid);
  if (ac.cost > p.wealth) { if (!p.auto) p.focus = 'work'; return `ค่าเรียน${s.n}ปีนี้ ${ac.cost} แต่คุณมีไม่พอ`; }
  p.wealth = clamp(p.wealth - ac.cost);
  const sk = p.skills[sid];
  sk.x += 26 * ac.mult * (1 + .15 * am(p, s.a)) * (T(p, 'clever') ? 1.3 : 1) * (1 - sk.r * .08);
  if (s.a === 'INT') p.know = clamp(p.know + 2);
  if (ac.danger) p.flags.secretMagic = (p.flags.secretMagic || 0) + 1;
  if (s.magic && has(p, 'aurelis', 'undercity') && !p.flags.churchMage) p.flags.hiddenMage = true;
  gainXP(p, 4);
  if (sk.x >= 100) { sk.x = 0; sk.r++; gainXP(p, 10); return `ฝีมือ${s.n}ของคุณเพิ่มขึ้นเป็นขั้น ${sk.r}`; }
  return Math.random() < .5 ? `คุณใช้เวลาว่างทั้งปีฝึก${s.n}` : null;
}

// ---- passive effects of skills and stats ----
function hazardMod(p, kind) {
  let m = 1 - am(p, 'CON') * .05;
  const best = Math.max(rank(p, 'sword'), rank(p, 'bow'));
  if (kind === 'ill' || kind === 'plague') m *= (1 - rank(p, 'medicine') * .07) * (1 - rank(p, 'heal') * .12) * (1 - rank(p, 'alchemy') * .04);
  if (kind === 'war') m *= (1 - best * .08) * (1 - rank(p, 'fire') * .06) * (1 - rank(p, 'stealth') * .04);
  if (kind === 'beast') m *= (1 - best * .08) * (1 - rank(p, 'survival') * .08) * (1 - rank(p, 'fire') * .06);
  if (kind === 'famine') m *= (1 - rank(p, 'survival') * .12) * (1 - rank(p, 'bow') * .05);
  if (kind === 'burn') m *= (1 - rank(p, 'illusion') * .1) * (1 - rank(p, 'stealth') * .05) * (1 + (p.flags.secretMagic || 0) * .02);
  if (kind === 'old') m *= (1 - rank(p, 'heal') * .06) * (1 - am(p, 'CON') * .03);
  if (p.yearMod && p.yearMod[kind]) m *= p.yearMod[kind];
  return Math.max(.08, m);
}
function incomeMod(p) {
  return (1 + rank(p, 'trade') * .15 + rank(p, 'smith') * .1 + rank(p, 'alchemy') * .1 + rank(p, 'medicine') * .06) * (1 + am(p, p.cls <= 1 ? 'CHA' : 'STR') * .05);
}

// ---- near-death scenes, now decided by skill rolls ----
function buildFate(p, cause, kind) {
  const fail = (q, t) => { die(q, cause); return t; };
  const live = (q, t) => { q.flags.reprieves++; gainXP(q, 25); return t; };
  const c = (label, a, s, act, need, needText) => Object.assign(opt(label, act, need, needText), { chk: [a, s] });
  let options = [];
  if (kind === 'ill' || kind === 'plague') options = [
    opt('จ้างหมอหลวงมารักษา', p => { p.wealth -= 22; return Math.random() < .85 ? live(p, 'หมอหลวงรักษาคุณจนหาย ค่ารักษาครั้งนี้เท่ากับที่คนทั่วไปหาได้ในหลายปี') : fail(p, 'แม้แต่หมอหลวงก็ช่วยไม่ได้'); }, p => p.wealth >= 40, 'ต้องมีทรัพย์ 40 ขึ้นไป'),
    c('รักษาตัวเองตามวิชาที่เรียนมา', 'WIS', 'medicine', p => check(p, 'WIS', 'medicine', 13) ? live(p, 'คุณรู้ว่าต้องใช้สมุนไพรอะไร และมันได้ผล') : fail(p, 'คุณวินิจฉัยโรคผิด'), p => rank(p, 'medicine') >= 1, 'ต้องมีทักษะการแพทย์'),
    ...(rank(p, 'heal') >= 1 ? [c('ใช้เวทรักษาตัวเอง', 'WIS', 'heal', p => check(p, 'WIS', 'heal', 10) ? live(p, 'แสงอุ่นๆ ไหลจากฝ่ามือเข้าสู่อก ไข้ลดลงภายในคืนเดียว') : fail(p, 'พลังของคุณไม่พอจะสู้กับโรคนี้'))] : []),
    c('ภาวนาและรอ', 'CON', null, p => { p.health -= 15; return check(p, 'CON', null, 15) ? live(p, 'ไข้ลดลงในคืนที่เจ็ด ร่างกายของคุณสู้ไหว') : fail(p, 'ไม่มีใครตอบคำภาวนาของคุณ'); }),
  ];
  else if (kind === 'war') options = [
    c('ฝ่าแนวรบหนีกลับบ้าน', 'DEX', 'stealth', p => { p.health -= 15; return check(p, 'DEX', 'stealth', 13 - (T(p, 'cunning') ? 2 : 0)) ? live(p, 'คุณเดินทางตอนกลางคืนอยู่สิบวัน จนกลับถึงบ้าน') : fail(p, 'คุณไปไม่ถึงบ้าน'); }),
    c('สู้จนถึงที่สุด', 'STR', 'sword', p => { if (check(p, 'STR', 'sword', 15 - (T(p, 'brave') ? 2 : 0))) { p.wealth += 15; p.happy += 10; p.flags.hero = true; return live(p, 'พอฝุ่นจางลง คุณยังยืนอยู่ ผู้คนเล่าเรื่องนี้กันไปอีกหลายปี'); } return fail(p, 'คุณสู้จนลมหายใจสุดท้าย'); }),
    ...(rank(p, 'fire') >= 1 ? [c('ใช้เวทไฟเปิดทาง', 'INT', 'fire', p => { if (check(p, 'INT', 'fire', 12)) { p.flags.hero = true; return live(p, 'กำแพงไฟพุ่งขึ้นตรงหน้าทัพศัตรู ทหารฝั่งคุณหนีออกมาได้ทั้งกอง'); } return fail(p, 'เปลวไฟของคุณดับลงกลางทาง'); })] : []),
    opt('ยอมจำนนเป็นเชลย', p => { if (Math.random() < .75) { p.cls = 4; p.flags.captive = true; p.happy -= 15; return live(p, 'คุณรอด แต่ตอนนี้คุณเป็นทาสของอีกฝ่าย'); } return fail(p, 'ฝ่ายตรงข้ามไม่จับเชลยในวันนั้น'); }),
  ];
  else if (kind === 'famine') options = [
    ...(p.cls < 4 ? [opt(p.cls < 3 ? 'ขายตัวเป็นไพร่แลกข้าว' : 'ขายตัวเป็นทาสแลกข้าว', p => { p.cls = p.cls < 3 ? 3 : 4; p.happy -= 12; p.flags.soldSelf = true; return live(p, 'คุณรอดผ่านฤดูนั้นมาได้ แต่ต้องแลกด้วยอิสรภาพ'); })] : []),
    c('ออกล่าสัตว์ในป่าต้องห้าม', 'WIS', 'survival', p => check(p, 'WIS', 'survival', 13) ? live(p, 'คุณกลับมาพร้อมกวางหนึ่งตัว พอให้ทั้งบ้านรอดฤดูนี้') : (die(p, 'ถูกจับได้ขณะล่าสัตว์ในเขตป่าต้องห้าม และถูกลงโทษจนเสียชีวิต'), 'ยามป่าเห็นคุณก่อน')),
    c('ขโมยข้าวจากยุ้งฉางเจ้าที่ดิน', 'DEX', 'stealth', p => { if (check(p, 'DEX', 'stealth', 12 - (T(p, 'cunning') ? 2 : 0))) { p.health += 5; return live(p, 'คืนนั้นคุณแบกข้าวออกมาได้สองกระสอบ'); } die(p, 'ถูกจับได้ขณะขโมยข้าว และถูกลงโทษจนเสียชีวิต'); return 'ยามเห็นคุณเสียก่อน'; }),
    opt('ใช้เงินที่เหลือทั้งหมดซื้ออาหาร', p => { p.wealth = 4; return live(p, 'คุณรอด แต่ไม่เหลืออะไรเลย'); }, p => p.wealth >= 25, 'ต้องมีทรัพย์ 25 ขึ้นไป'),
  ];
  else if (kind === 'mine') options = [
    c('ขุดทางออกเอง', 'STR', 'smith', p => { p.health -= 20; return check(p, 'STR', 'smith', 14 - (T(p, 'tough') ? 2 : 0)) ? live(p, 'นิ้วของคุณแตกทุกนิ้ว แต่ในที่สุดคุณก็เห็นแสงสว่าง') : fail(p, 'หินหนักเกินไป'); }),
    opt('รอคนมาช่วย', p => Math.random() < (p.cls <= 1 ? .85 : .2) ? live(p, p.cls <= 1 ? 'ทีมกู้ภัยมาถึงภายในวันเดียว เพราะครอบครัวคุณจ่ายเงินให้มาช่วยคุณก่อน' : 'ทีมกู้ภัยมาถึงในวันที่สี่ โชคดีที่คุณยังหายใจอยู่') : (die(p, 'ติดอยู่ใต้อุโมงค์ที่ถล่ม และความช่วยเหลือมาไม่ถึง'), 'ทีมกู้ภัยขุดหาคนจากตระกูลที่จ่ายเงินก่อน และไปไม่ถึงตัวคุณ')),
  ];
  else if (kind === 'beast') options = [
    c('สู้', 'STR', 'sword', p => { p.health -= 15; return check(p, 'STR', 'sword', 13 - (T(p, 'brave') ? 2 : 0)) ? live(p, 'มันถอยกลับเข้าไปในความมืด ทิ้งแผลเป็นยาวไว้ที่แขนคุณ') : fail(p, 'มันแข็งแรงกว่าคุณ'); }),
    c('วิ่งหนี', 'DEX', null, p => { p.health -= 5; return check(p, 'DEX', null, 11) ? live(p, 'คุณวิ่งไม่หยุดจนถึงหมู่บ้าน โดยไม่หันกลับไปมองเลย') : fail(p, 'มันเร็วกว่าคุณ'); }),
    ...(rank(p, 'bow') >= 1 ? [c('ยิงธนูจากที่สูง', 'DEX', 'bow', p => check(p, 'DEX', 'bow', 12) ? live(p, 'ลูกธนูดอกที่สามปักเข้าที่คอของมัน') : fail(p, 'ลูกธนูหมดก่อนที่มันจะล้ม'))] : []),
    ...(rank(p, 'fire') >= 1 ? [c('ไล่มันด้วยเปลวไฟ', 'INT', 'fire', p => check(p, 'INT', 'fire', 10) ? live(p, 'มันกลัวไฟมากกว่าที่คุณคิด') : fail(p, 'ไฟของคุณติดไม่ทัน'))] : []),
  ];
  else if (kind === 'burn') options = [
    c('ใช้เวทหนีออกจากคุก', 'INT', 'fire', p => { if (check(p, 'INT', 'fire', 15)) { p.flags.hiddenMage = false; p.flags.fugitive = true; p.wealth = 3; move(p, RBY.grieve); return live(p, 'ประตูเหล็กละลายลง คุณหนีออกจากออเรลิสไปที่ราบเถ้าโดยไม่มีอะไรติดตัว'); } return fail(p, 'ผนังคุกถูกจารึกอักขระกันเวท'); }),
    ...(rank(p, 'illusion') >= 1 ? [c('ใช้เวทมายาปลอมตัวหนี', 'CHA', 'illusion', p => { if (check(p, 'CHA', 'illusion', 11)) { p.flags.hiddenMage = false; p.flags.fugitive = true; move(p, RBY.dunes); return live(p, 'ผู้คุมเห็นนักบวชคนหนึ่งเดินออกจากคุก ไม่มีใครเห็นคุณ'); } return fail(p, 'ภาพลวงตาของคุณแตกต่อหน้าผู้คุม'); })] : []),
    opt('สารภาพและยอมเป็นของศาสนจักร', p => { if (Math.random() < .6) { p.flags.hiddenMage = false; p.flags.churchMage = true; p.happy -= 15; return live(p, 'ศาสนจักรไว้ชีวิตคุณ เพราะคุณมีประโยชน์กับพวกเขา'); } return fail(p, 'ศาลศาสนาต้องการเชือดไก่ให้ลิงดู'); }),
    c('ชี้ตัวคนอื่นแทน', 'CHA', 'speech', p => { if (check(p, 'CHA', 'speech', 13 - (T(p, 'cunning') ? 3 : 0))) { p.flags.hiddenMage = false; p.flags.betrayer = true; p.happy -= 20; return live(p, 'หญิงชราคนหนึ่งถูกเผาแทนคุณ ขณะที่คุณยืนดูอยู่ในฝูงชน'); } return fail(p, 'ไม่มีใครเชื่อคำของคุณ'); }),
  ];
  return { id: 'fate', fatal: true, prompt: `ความตายมาเยือน: ${FATE_TEXT[kind]}`, options };
}

// ---- custom character ----
function makeCustom(o) {
  const r = RBY[o.realm];
  const p = makePerson(r);
  p.name = o.name || p.name; p.sex = o.sex; p.race = o.race; p.cls = p.bornCls = o.cls;
  p.traits = o.traits.slice(0, 2); p.gifted = !!o.gifted; p.chosen = true;
  p.attrs = applyRace(o.attrs, o.race);
  p.health = clamp(r.health + (2 - o.cls) * 4 + am(p, 'CON') * 4 + (T(p, 'tough') ? 12 : 0) - (T(p, 'sickly') ? 14 : 0));
  p.wealth = clamp(r.wealth + [35, 18, 0, -8, -12][o.cls]);
  p.happy = clamp(55 + (2 - o.cls) * 4 + am(p, 'CHA') * 2 - (T(p, 'bitter') ? 10 : 0));
  p.kin.mother = nameIn(r); p.kin.father = nameIn(r);
  p.dyn = { founder: p.name, founderCls: o.cls, founderRealm: r.id, line: [] };
  p.startWealth = p.wealth;
  return p;
}

// ---- skill-driven events ----
EVENTS.push(
  { w: 3, c: p => rank(p, 'medicine') >= 2, t: () => 'เพื่อนบ้านพาลูกมาให้คุณช่วยทำแผล', f: p => { p.wealth += 2; p.happy += 2; } },
  { w: 3, c: p => rank(p, 'trade') >= 2, t: () => 'คุณต่อรองราคาสินค้าได้ดีกว่าทุกคนในตลาด', f: p => { p.wealth += 5; } },
  { w: 3, c: p => rank(p, 'sword') >= 2, t: () => 'โจรสองคนดักปล้นคุณกลางทาง คุณชักดาบไล่พวกมันไปได้', f: p => { p.happy += 3; } },
  { w: 3, c: p => rank(p, 'bow') >= 2, t: () => 'คุณยิงกวางตัวใหญ่ได้ ทั้งบ้านมีเนื้อกินไปทั้งเดือน', f: p => { p.health += 4; } },
  { w: 3, c: p => rank(p, 'survival') >= 2, t: () => 'ปีนี้แห้งแล้ง แต่คุณรู้ว่ารากไม้ชนิดไหนกินได้', f: p => { p.health += 3; } },
  { w: 3, c: p => rank(p, 'stealth') >= 2, t: () => 'คุณแอบเข้าไปฟังการประชุมของเจ้าที่ดินได้โดยไม่มีใครเห็น', f: p => { p.know += 2; } },
  { w: 3, c: p => rank(p, 'speech') >= 2, t: () => 'คำพูดของคุณทำให้สองบ้านที่ทะเลาะกันกลับมาคืนดีกัน', f: p => { p.happy += 4; } },
  { w: 3, c: p => rank(p, 'smith') >= 2, t: () => 'ของที่คุณตีออกมาขายได้ราคาดีกว่าที่คาดไว้', f: p => { p.wealth += 6; } },
  { w: 3, c: p => rank(p, 'alchemy') >= 2, t: () => 'คุณปรุงยาแก้ไข้ไปขายในตลาด ขายหมดภายในวันเดียว', f: p => { p.wealth += 5; } },
  { w: 3, c: p => rank(p, 'letters') >= 2, t: () => 'คุณเขียนจดหมายให้เพื่อนบ้านที่อ่านหนังสือไม่ออก', f: p => { p.happy += 2; p.wealth += 1; } },
  { w: 3, c: p => rank(p, 'history') >= 3, t: () => 'คุณสังเกตว่าตำราของออเรลิสกับเซเรนธ์เล่าเรื่องเถ้าไม่ตรงกัน', f: p => { p.know += 3; } },
  { w: 3, c: p => rank(p, 'fire') >= 1, t: () => 'คุณจุดไฟในเตาด้วยปลายนิ้ว เด็กๆ ในบ้านมองกันตาโต', f: p => { p.happy += 3; } },
  { w: 3, c: p => rank(p, 'heal') >= 1, t: () => 'แผลที่มือของคุณสมานภายในคืนเดียว', f: p => { p.health += 5; } },
  { w: 3, c: p => rank(p, 'illusion') >= 1, t: () => 'คุณเล่นกลด้วยเวทมายาให้เด็กในละแวกดู ทุกคนหัวเราะกันลั่น', f: p => { p.happy += 3; } },
  { w: 3, c: p => rank(p, 'thread') >= 1, t: () => 'ทุกครั้งที่ใช้เวทเส้นใย คุณได้ยินเสียงบางอย่างบนฟ้าตึงขึ้น', f: p => { p.know += 2; p.happy -= 1; } },
  { w: 3, c: p => (p.flags.secretMagic || 0) > 2 && has(p, 'aurelis', 'undercity'), t: () => 'เพื่อนบ้านเริ่มสังเกตว่าบ้านคุณมีแสงแปลกๆ ตอนกลางคืน', f: p => { p.happy -= 3; } },
);

// ---- careers unlocked by skill ----
CHOICES.push(
  { id: 'ownShop', when: p => rank(p, 'trade') >= 3 && p.cls >= 2 && p.wealth >= 40 && roll(.3),
    prompt: p => `อายุ ${p.age} ปี คุณมีฝีมือการค้าและเงินทุนพอจะเปิดกิจการเป็นของตัวเอง${p.cls >= 3 ? ' แต่ต้องไถ่ตัวจากเจ้าของก่อน' : ''}`,
    options: p => [
      opt('เปิดกิจการ', p => { p.wealth -= p.cls >= 3 ? 35 : 25; p.cls = 1; p.flags.selfMade = true; p.happy += 10; return 'ป้ายร้านชื่อคุณแขวนอยู่หน้าประตู ตอนนี้คุณเป็นพ่อค้าแล้ว'; }, p => p.wealth >= (p.cls >= 3 ? 35 : 25), 'เงินทุนยังไม่พอ'),
      opt('รอให้พร้อมกว่านี้', () => 'คุณเก็บเงินต่อไปอีกสักพัก'),
    ] },
  { id: 'knighted', when: p => rank(p, 'sword') >= 4 && p.cls >= 1 && p.cls < 4 && p.age <= 50 && has(p, 'aurelis', 'kragmor', 'grieve') && roll(.3),
    prompt: p => `อายุ ${p.age} ปี ฝีมือดาบของคุณเลื่องลือไปทั่ว ขุนนางคนหนึ่งเสนอแต่งตั้งคุณเป็นอัศวิน`,
    options: p => [
      opt('รับการแต่งตั้ง', p => { p.cls = 0; p.flags.knight = true; p.flags.knighted = true; p.wealth += 15; return 'คุณคุกเข่าลง แล้วลุกขึ้นมาเป็นขุนนาง ทั้งที่ไม่ได้เกิดมาเป็น'; }),
      opt('ปฏิเสธ', () => 'คุณไม่อยากเป็นดาบให้ใคร'),
    ] },
  { id: 'physician', when: p => rank(p, 'medicine') >= 4 && p.cls >= 1 && roll(.3),
    prompt: p => `อายุ ${p.age} ปี หมอหลวงได้ยินชื่อเสียงของคุณ และเสนอให้คุณเป็นหมอประจำราชสำนัก`,
    options: p => [
      opt('รับตำแหน่ง', p => { p.cls = Math.min(p.cls, 1); p.wealth += 20; p.flags.physician = true; if (!has(p, 'serenth')) move(p, RBY.aurelis); return 'คุณได้บ้านในเมืองชั้นใน และได้รักษาแต่คนที่ไม่เคยต้องต่อแถวรอหมอ'; }),
      opt('อยู่รักษาคนที่บ้านเกิดต่อ', p => { p.happy += 6; p.flags.savedOther = true; return 'คนที่บ้านเกิดไม่มีหมอคนอื่นนอกจากคุณ'; }),
    ] },
  { id: 'archmage', when: p => p.gifted && Math.max(rank(p, 'fire'), rank(p, 'heal'), rank(p, 'illusion')) >= 4 && (has(p, 'serenth') || p.flags.churchMage) && roll(.3),
    prompt: p => `อายุ ${p.age} ปี ${has(p, 'serenth') ? 'หอเวทสูง' : 'ศาสนจักรสุริยะ'}เสนอตำแหน่งจอมเวทให้คุณ`,
    options: p => [
      opt('รับตำแหน่งจอมเวท', p => { p.cls = 0; p.flags.archmage = true; p.wealth += 25; return 'คุณได้หอคอยเป็นของตัวเอง พร้อมศิษย์อีกสิบสองคน'; }),
      opt('ปฏิเสธ', () => 'คุณอยากใช้เวทช่วยคนที่ต้องการมันจริงๆ มากกว่า'),
    ] },
  { id: 'freedom', when: p => p.cls >= 3 && p.wealth >= 45 && roll(.35),
    prompt: p => `อายุ ${p.age} ปี คุณเก็บเงินได้มากพอจะไถ่ตัวเป็นอิสระ`,
    options: p => [
      opt('ไถ่ตัว', p => { p.wealth -= 35; p.cls = 2; p.flags.boughtFreedom = true; p.happy += 15; return 'คุณถือหนังสือไถ่ตัวไว้แน่น และหยิบขึ้นมาอ่านซ้ำทุกคืน'; }),
      opt('เก็บเงินไว้ให้ลูก', p => { legacy(p).gift = Math.round(p.wealth * .5); return 'คุณยังไม่เป็นอิสระ แต่ลูกของคุณจะเริ่มต้นได้ดีกว่า'; }),
    ] },
  { id: 'cureEpidemic', when: p => (rank(p, 'heal') >= 2 || rank(p, 'medicine') >= 3) && p.realm.plague >= .003 && roll(.1),
    prompt: p => `อายุ ${p.age} ปี ไข้เถ้าดำระบาดในละแวกบ้าน และมีแต่คุณที่รักษาได้`,
    options: p => [
      opt('รักษาทุกคนฟรี', p => { p.flags.savedOther = true; p.flags.epidemicHero = true; p.happy += 10; if (!check(p, 'CON', null, 6)) { die(p, 'ติดไข้เถ้าดำจากคนไข้ที่ตัวเองรักษา'); return 'คุณรักษาคนได้หลายสิบคน ก่อนจะล้มลงเอง'; } return 'คนทั้งละแวกรอดเพราะคุณ ชื่อของคุณถูกพูดถึงไปอีกหลายชั่วคน'; }),
      opt('เก็บค่ารักษา', p => { p.wealth += 20; p.happy -= 3; return 'คนที่จ่ายได้ก็รอด'; }),
      opt('ปิดประตูบ้าน', p => { p.happy -= 8; return 'คุณได้ยินเสียงเคาะประตูทุกคืนจนโรคซา'; }),
    ] },
  { id: 'threadChoice', when: p => rank(p, 'thread') >= 2 && !p.done.threadAct && roll(.3),
    prompt: p => `อายุ ${p.age} ปี คุณสัมผัสเส้นใยที่ขาดบนฟ้าได้ชัดเจนแล้ว คุณอาจซ่อมมันได้ หรือดึงพลังของมันมาใช้เอง`,
    options: p => [
      Object.assign(opt('พยายามซ่อมเส้นใย', p => { p.done.threadAct = 1; if (check(p, 'INT', 'thread', 17)) { p.flags.mender = true; p.happy += 15; return 'คืนนั้นท้องฟ้าเหนือหมู่บ้านใสเป็นครั้งแรกในรอบสามร้อยปี'; } p.health -= 25; return 'เส้นใยดีดกลับมาบาดคุณ คุณสลบไปสามวัน'; }), { chk: ['INT', 'thread'] }),
      opt('ดึงพลังมาใช้เอง', p => { p.done.threadAct = 1; p.wealth += 30; p.know += 10; p.flags.threadDrain = true; return 'คุณรู้สึกแข็งแกร่งกว่าที่เคย ส่วนฟ้าทางตะวันออกมืดลงอีกนิด'; }),
      opt('ปล่อยไว้อย่างนั้น', p => { p.done.threadAct = 1; return 'คุณไม่อยากเป็นอีกคนที่ทำให้ฟ้าฉีก'; }),
    ] },
);

LEGENDS.push(
  { id: 'selfmade', n: 'พ่อค้าสร้างตัว', d: 'เปิดกิจการของตัวเองด้วยฝีมือการค้า', c: p => p.flags.selfMade },
  { id: 'knighted', n: 'อัศวินที่ไม่ได้เกิดมาเป็น', d: 'ได้รับแต่งตั้งเป็นอัศวินด้วยฝีมือดาบ', c: p => p.flags.knighted },
  { id: 'physician', n: 'หมอหลวง', d: 'ได้เป็นหมอประจำราชสำนัก', c: p => p.flags.physician },
  { id: 'archmage', n: 'จอมเวท', d: 'ได้รับตำแหน่งจอมเวท', c: p => p.flags.archmage },
  { id: 'freedom', n: 'ไถ่ตัว', d: 'เก็บเงินไถ่ตัวเองเป็นอิสระ', c: p => p.flags.boughtFreedom },
  { id: 'epidemic', n: 'มือที่หยุดไข้', d: 'รักษาคนทั้งละแวกในช่วงไข้ระบาดโดยไม่คิดเงิน', c: p => p.flags.epidemicHero },
  { id: 'mender', n: 'ผู้ซ่อมฟ้า', d: 'ซ่อมเส้นใยที่ขาดบนฟ้าได้สำเร็จ', c: p => p.flags.mender },
  { id: 'master', n: 'ปรมาจารย์', d: 'มีทักษะใดทักษะหนึ่งถึงขั้น 5', c: p => SKILLS.some(s => rank(p, s.id) >= 5) },
  { id: 'lv10', n: 'ชีวิตที่เข้มข้น', d: 'ถึงเลเวล 10 ในชีวิตเดียว', c: p => p.lv >= 10 },
);

// ===== ACTIVE SPELLS =====
const SPELLS = [
  { id: 'spark', s: 'fire', r: 1, n: 'ประกายไฟ', cost: 2, d: 'รับจ้างจุดเตาและเผาถ่าน ได้เงินเล็กน้อย',
    cast: p => { p.wealth += 3 + rank(p, 'fire'); return 'คุณรับจ้างจุดเตาและเผาถ่านให้คนในละแวกด้วยปลายนิ้ว'; } },
  { id: 'firebolt', s: 'fire', r: 2, n: 'ลูกไฟขับไล่', cost: 4, d: 'ปีนี้สัตว์ร้ายและภัยสงครามอันตรายกับคุณน้อยลง',
    cast: p => { ymod(p, { beast: .4, war: .7 }); return 'คุณเดินตรวจรอบหมู่บ้านพร้อมลูกไฟในมือ สัตว์ร้ายไม่กล้าเข้าใกล้ไปทั้งปี'; } },
  { id: 'firewall', s: 'fire', r: 3, n: 'กำแพงเพลิง', cost: 6, d: 'รับจ้างคุ้มกันกองคาราวาน ได้เงินก้อนใหญ่ (ทอยปัญญา+เวทไฟ)', chk: ['INT', 'fire'],
    cast: p => { if (check(p, 'INT', 'fire', 13)) { p.wealth += 14; return 'กองคาราวานจ้างคุณคุ้มกัน โจรที่ดักรอเห็นกำแพงไฟแล้ววิ่งหนีไปหมด'; } p.health -= 10; return 'เปลวไฟย้อนกลับมาลวกแขนของคุณเอง'; } },
  { id: 'firestorm', s: 'fire', r: 5, n: 'พายุไฟ', cost: 10, cd: 5, d: 'พลังทำลายสูงสุดของเวทไฟ ในแดนที่มีสงครามอาจยุติการรบได้',
    cast: p => { if (has(p, 'grieve') || eraActive(p, 'war4')) { p.flags.hero = true; p.flags.famous = true; p.happy += 8; p.wealth += 20; return 'พายุไฟของคุณกวาดผ่านสนามรบ ทั้งสองทัพถอยกลับไปในวันเดียว ผู้คนเล่าเรื่องนี้ไปอีกร้อยปี'; } p.know += 5; p.happy += 5; return 'คุณปล่อยพายุไฟกลางที่โล่ง ทรายใต้เท้ากลายเป็นแก้วเหมือนวันที่เถ้าตก'; } },
  { id: 'mend', s: 'heal', r: 1, n: 'สมานแผล', cost: 2, d: 'ฟื้นสุขภาพตัวเอง',
    cast: p => { p.health += 8; return 'แสงอุ่นๆ จากฝ่ามือทำให้ร่างกายคุณเบาขึ้น'; } },
  { id: 'healother', s: 'heal', r: 2, n: 'รักษาผู้อื่น', cost: 4, d: 'รักษาคนในละแวก ได้ทั้งเงินและความสุข',
    cast: p => { p.wealth += 4; p.happy += 4; p.flags.healer = true; return pick(['คุณรักษาขาหักของเด็กข้างบ้านให้หายภายในคืนเดียว', 'คุณรักษาไข้ให้หญิงชราที่ไม่มีเงินจ้างหมอ', 'คุณห้ามเลือดให้คนงานที่บาดเจ็บจากงานได้ทันเวลา']); } },
  { id: 'purge', s: 'heal', r: 3, n: 'ขับไข้', cost: 6, d: 'ปีนี้คุณและคนรอบตัวป่วยยากขึ้นมาก',
    cast: p => { ymod(p, { ill: .5, plague: .3 }); p.happy += 5; p.flags.savedOther = true; return 'คุณเดินไปทุกบ้านในละแวก ไข้ที่กำลังลามหยุดลงที่หน้าบ้านของคุณ'; } },
  { id: 'prolong', s: 'heal', r: 5, n: 'ต่อชีวิต', cost: 10, cd: 5, d: 'ฟื้นสุขภาพก้อนใหญ่ และชะลอความชราในปีนี้',
    cast: p => { p.health += 25; ymod(p, { old: .4, ill: .6 }); return 'คุณใช้พลังทั้งหมดกับร่างกายตัวเอง ผมขาวบางเส้นกลับมาดำอีกครั้ง'; } },
  { id: 'glamour', s: 'illusion', r: 1, n: 'แสงลวงตา', cost: 2, d: 'เล่นกลให้คนรอบตัว ความสุขเพิ่ม',
    cast: p => { p.happy += 4; return pick(['คุณเสกผีเสื้อแสงให้บินรอบตัวเด็กๆ ในละแวก', 'คุณทำให้ฝนในงานเลี้ยงกลายเป็นกลีบดอกไม้', 'คุณเล่าเรื่องโลกก่อนเถ้าพร้อมภาพลวงตาให้ทุกคนดู']); } },
  { id: 'disguise', s: 'illusion', r: 2, n: 'ใบหน้าลวง', cost: 4, d: 'ปลอมตัวหลบคนเก็บภาษี ได้เงินคืน (ทอยเสน่ห์+เวทมายา)', chk: ['CHA', 'illusion'],
    cast: p => { if (check(p, 'CHA', 'illusion', 12)) { p.wealth += 8; return 'คนเก็บภาษีเห็นคุณเป็นคนอื่น และข้ามบ้านของคุณไป'; } p.health -= 6; p.wealth -= 5; return 'ภาพลวงตาแตกกลางตลาด คุณถูกรุมทำร้ายและปรับเงิน'; } },
  { id: 'veil', s: 'illusion', r: 3, n: 'ม่านมายา', cost: 6, d: 'ปีนี้ซ่อนตัวจากสงคราม ศาลศาสนา และสัตว์ร้าย',
    cast: p => { ymod(p, { war: .4, burn: .3, beast: .6 }); return 'คุณคลุมบ้านด้วยม่านมายา คนที่เดินผ่านเห็นแค่บ้านร้าง'; } },
  { id: 'dreamwalk', s: 'illusion', r: 5, n: 'ฝันร่วม', cost: 10, d: 'เดินเข้าไปในความฝันของคนอื่น อาจได้รู้ความลับของโลก',
    cast: p => { p.know += 8; p.happy += 6; if (!p.flags.ledger) { p.flags.ledger = true; return 'คุณเดินเข้าไปในความฝันของผู้อาวุโสแห่งเซเรนธ์ และเห็นการลงมติเจ็ดต่อหกผ่านสายตาของเขา ตอนนี้คุณต้องหาหลักฐานมายืนยันสิ่งที่เห็น'; } return 'คุณเดินผ่านความฝันของคนทั้งหมู่บ้านในคืนเดียว และตื่นมาพร้อมความเข้าใจที่ไม่เคยมี'; } },
  { id: 'listen', s: 'thread', r: 1, n: 'ฟังเส้นใย', cost: 3, d: 'ฟังเสียงเส้นใยบนฟ้า ความรู้เพิ่ม',
    cast: p => { p.know += 4; return 'คุณได้ยินเส้นใยที่ขาดส่งเสียงครวญอยู่เหนือเมฆ ปลายที่ขาดทุกเส้นชี้ไปทางเดียวกัน คือทางเซเรนธ์'; } },
  { id: 'drain', s: 'thread', r: 2, n: 'ดึงเส้นใย', cost: 5, d: 'ดึงพลังจากฟ้ามาเป็นของตัวเอง ได้ทรัพย์มาก แต่ฟ้าจะเสียหาย',
    cast: p => { p.wealth += 15; p.flags.drain = (p.flags.drain || 0) + 1; p.happy -= 2; return 'ทองในกระเป๋าคุณหนักขึ้น ส่วนฟ้าเหนือหัวหม่นลงอีกนิด'; } },
  { id: 'weave', s: 'thread', r: 3, n: 'ถักเส้นใย', cost: 8, d: 'ซ่อมเส้นใยบางส่วน ปีนี้คนในละแวกป่วยและอดอยากน้อยลง (ทอยปัญญา+เวทเส้นใย)', chk: ['INT', 'thread'],
    cast: p => { if (check(p, 'INT', 'thread', 15)) { ymod(p, { ill: .7, plague: .7, famine: .5 }); p.happy += 8; p.flags.savedOther = true; return 'ฟ้าเหนือหมู่บ้านใสขึ้นตลอดฤดู เถ้าไม่ตกลงมาเลยทั้งปี'; } p.health -= 15; return 'เส้นใยดีดกลับมาบาดคุณจนสลบไปสามวัน'; } },
];
const SPBY = Object.fromEntries(SPELLS.map(s => [s.id, s]));
function ymod(p, m) { p.yearMod = p.yearMod || {}; for (const k in m) p.yearMod[k] = (p.yearMod[k] || 1) * m[k]; }
function manaMax(p) {
  if (!p.gifted || p.age < 11) return 0;
  const ranks = SKILLS.filter(s => s.magic).reduce((t, s) => t + rank(p, s.id), 0);
  return 6 + ranks * 4 + Math.max(0, am(p, 'INT'), am(p, 'WIS'), am(p, 'CHA')) * 2;
}
function knownSpells(p) { return SPELLS.filter(sp => p.gifted && rank(p, sp.s) >= 1 && (sp.s !== 'thread' || access(p, 'thread').ok || rank(p, 'thread') > 0)); }
function spellState(p, sp) {
  if (rank(p, sp.s) < sp.r) return { ok: false, why: `ปลดล็อกเมื่อ${SBY[sp.s].n}ถึงขั้น ${sp.r}` };
  if (p.cast && p.cast[sp.id]) return { ok: false, why: 'ใช้ไปแล้วในปีนี้' };
  const last = p.lastCast && p.lastCast[sp.id];
  if (sp.cd && last != null && p.age - last < sp.cd) return { ok: false, why: `ใช้ได้อีกครั้งในอีก ${sp.cd - (p.age - last)} ปี` };
  if ((p.mana || 0) < sp.cost) return { ok: false, why: 'มานาไม่พอ' };
  return { ok: true };
}
function castSpell(p, id) {
  const sp = SPBY[id], st = spellState(p, sp);
  if (!st.ok) return null;
  p.checks = []; p.mana -= sp.cost; p.cast = p.cast || {}; p.cast[id] = 1; p.lastCast = p.lastCast || {}; p.lastCast[id] = p.age;
  const lines = [];
  // outside the church, using magic in Aurelis is a crime: someone may see
  if (has(p, 'aurelis', 'undercity') && !p.flags.churchMage) {
    if (!check(p, 'CHA', 'illusion', 9)) { p.flags.hiddenMage = true; p.flags.secretMagic = (p.flags.secretMagic || 0) + 3; lines.push('มีคนเห็นคุณใช้เวท ข่าวลือเริ่มแพร่ไปถึงหูศาลศาสนา'); }
    else p.flags.secretMagic = (p.flags.secretMagic || 0) + 1;
  }
  lines.unshift(`ร่าย${sp.n}: ` + sp.cast(p));
  norm(p); gainXP(p, 3);
  const sk = p.skills[sp.s]; sk.x += 4;
  if (sk.x >= 100 && sk.r < MAX_RANK) { sk.x = 0; sk.r++; lines.push(`เพราะใช้เวทบ่อย ${SBY[sp.s].n}ของคุณจึงเพิ่มเป็นขั้น ${sk.r}`); }
  return lines;
}
EVENTS.push(
  { w: 4, c: p => (p.flags.drain || 0) >= 2, t: () => 'เถ้าตกลงมาเฉพาะเหนือหมู่บ้านของคุณ ไม่มีใครรู้สาเหตุ นอกจากคุณ', f: p => { p.happy -= 4; p.health -= 3; } },
  { w: 3, c: p => p.flags.hiddenMage && (p.flags.secretMagic || 0) >= 4, t: () => 'นักบวชจากศาลศาสนามาถามเพื่อนบ้านเรื่องแสงแปลกๆ ในบ้านคุณ', f: p => { p.happy -= 4; } },
);
LEGENDS.push(
  { id: 'drainer', n: 'ผู้ดูดฟ้า', d: 'ดึงพลังจากเส้นใยบนฟ้ามาใช้เองหลายครั้ง', c: p => (p.flags.drain || 0) >= 3 },
  { id: 'spellmaster', n: 'ผู้รอบรู้ทุกสำนัก', d: 'ฝึกเวทไฟ เวทรักษา และเวทมายาถึงขั้น 3 ทั้งหมด', c: p => ['fire', 'heal', 'illusion'].every(s => rank(p, s) >= 3) },
);

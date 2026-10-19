// ===== CAREERS & TRAINING AREAS =====
// new craft skill so the craft path has more than smithing
(() => {
  const s = { id: 'craft', n: 'งานช่าง', a: 'DEX', g: 'งานฝีมือ', min: 10 };
  const i = SKILLS.findIndex(x => x.id === 'smith') + 1; SKILLS.splice(i, 0, s); SBY.craft = s;
})();
extend('access', 'careers: where the craft skill can be learned', inner => function (p, sid) {
  if (sid !== 'craft') return inner(p, sid);
  if (p.age < 10) return { ok: false, why: 'เริ่มฝึกได้ตอนอายุ 10 ปี', mult: 0, cost: 0 };
  if (has(p, 'aurelis', 'serenth')) return { ok: true, mult: 1.1, cost: 2, label: 'โรงช่างในเมือง · ค่าเรียน 2/ปี' };
  return { ok: true, mult: p.cls === 4 ? .6 : .9, cost: 0, label: p.cls === 4 ? 'เรียนจากงานที่นายสั่ง' : 'ช่างในหมู่บ้านสอน' };
});

// the training areas shown on the life screen
const AREAS = [
  { g: 'การต่อสู้', n: 'การต่อสู้', d: 'อาวุธและโล่' },
  { g: 'ความรู้', n: 'ความรู้', d: 'อ่านเขียน ประวัติศาสตร์ การแพทย์ เล่นแร่' },
  { g: 'สังคม', n: 'สังคม', d: 'การค้าและวาทศิลป์' },
  { g: 'งานฝีมือ', n: 'งานฝีมือ', d: 'ตีเหล็กและงานช่าง' },
  { g: 'เอาตัวรอด', n: 'เอาตัวรอด', d: 'เอาตัวรอดในป่าและลอบเร้น' },
  { g: 'เวทมนตร์', n: 'เวทมนตร์', d: 'สำนักเวททั้งสี่', magic: true },
];
function areaSkills(p, g) { return SKILLS.filter(s => s.g === g && (!s.magic || p.gifted)); }
function bestInArea(p, g) {
  const ok = areaSkills(p, g).map(s => ({ s, a: access(p, s.id) })).filter(x => x.a.ok && rank(p, x.s.id) < MAX_RANK && x.a.cost <= p.wealth);
  ok.sort((x, y) => (y.a.mult - x.a.mult) || (rank(p, x.s.id) - rank(p, y.s.id)));
  return ok[0] ? ok[0].s.id : null;
}

// ---- careers ----
const RURAL = ['grieve', 'mulvane', 'dunes'];
const CAREERS = [
  // base jobs nobody chooses: the one you are born into
  { id: 'slave', base: true, n: ['ทาส', 'ทาส', 'ทาส'], pay: [0, 0, 0], phys: 2, d: 'แรงงานของนาย ไม่มีค่าแรง',
    flav: ['รับใช้นายทั้งปี ไม่มีวันหยุดสักวัน', 'นายสั่งงานจนดึกดื่นทุกคืน', 'โดนส่งไปทำงานที่บ้านญาติของนายทั้งฤดู'] },
  { id: 'serf', base: true, n: ['ไพร่ติดที่ดิน', 'ไพร่ติดที่ดิน', 'ไพร่ติดที่ดิน'], pay: [1.5, 1.5, 1.5], phys: 1.5, d: 'ทำนาให้เจ้าที่ดิน ได้ส่วนแบ่งครึ่งเดียว',
    flav: ['ทำนาบนที่ของเจ้าที่ดินทั้งปี', 'ตื่นก่อนไก่ขันไปทำนาให้เจ้าที่ดินก่อน แล้วค่อยทำนาตัวเอง', 'ผลผลิตครึ่งหนึ่งต้องส่งให้เจ้าที่ดินเหมือนทุกปี'] },
  { id: 'farmer', base: true, n: ['ชาวนา', 'ชาวนา', 'ชาวนามีที่ดิน'], pay: [3, 3.5, 5], phys: 1.5, d: 'ทำไร่ทำนาหรือเลี้ยงสัตว์',
    flav: ['ไถนาหว่านข้าวตั้งแต่เช้ามืด', 'ซ่อมคันนาที่ฝนพัง', 'ปีนี้ข้าวในนาออกรวงงาม'] },
  { id: 'laborer', base: true, n: ['คนรับจ้าง', 'คนรับจ้าง', 'หัวหน้าคนงาน'], pay: [2.7, 3, 4.5], phys: 1.5, d: 'รับจ้างใช้แรงงานทั่วไป',
    flav: ['รับจ้างแบกของที่ตลาดทุกวัน', 'รับจ้างขุดคูให้ช่างก่อสร้าง', 'วันไหนไม่มีงาน ก็ไปนั่งรอคนมาจ้างตั้งแต่เช้า'] },
  { id: 'noble', base: true, n: ['ทายาทตระกูล', 'ผู้ดูแลที่ดิน', 'ประมุขตระกูล'], pay: [7, 9, 12], phys: .3, d: 'บริหารที่ดินและไพร่ของตระกูล',
    flav: ['ไปเก็บภาษีจากไพร่ในที่ดินของตระกูล', 'นั่งตรวจบัญชีของตระกูลอยู่ทั้งเดือน', 'ไปเจรจาเรื่องที่ดินกับตระกูลอื่น'] },
  // chosen careers
  { id: 'guard', area: 'การต่อสู้', n: ['ยามฝึกหัด', 'ยามเมือง', 'หัวหน้ายาม'], pay: [3, 5, 8], phys: 1, d: 'เฝ้าประตูและลาดตระเวนในเมือง',
    req: { skills: { any: ['sword', 'spear', 'axe'], r: 1 }, realms: ['aurelis', 'undercity', 'kragmor'] }, topCls: 2,
    flav: ['เฝ้าประตูเมืองทั้งกะ คนเข้าออกเป็นพัน', 'จับขโมยล้วงกระเป๋าได้กลางตลาด', 'เดินตรวจตรอกมืดตอนกลางคืน'] },
  { id: 'merc', area: 'การต่อสู้', n: ['ทหารรับจ้างหน้าใหม่', 'ทหารรับจ้าง', 'หัวหน้ากองทหารรับจ้าง'], pay: [5, 8, 12], phys: 1.5, risk: 'fight', d: 'รับจ้างรบให้ใครก็ได้ที่จ่ายเงิน',
    req: { skills: { any: ['sword', 'spear', 'axe', 'bow', 'dagger'], r: 2 }, realms: ['grieve', 'dunes', 'undercity', 'mulvane'] },
    flav: ['คุ้มกันคาราวานข้ามทุ่ง', 'ขุนศึกคนใหม่จ้างทั้งกองไปทั้งฤดู', 'รับเงินฝ่ายหนึ่ง ปีต่อมาก็รับเงินอีกฝ่าย'] },
  { id: 'hunter', area: 'การต่อสู้', n: ['นักล่าฝึกหัด', 'นักล่า', 'นักล่าชื่อดัง'], pay: [3, 5, 7], phys: 1, risk: 'beast', d: 'ล่าสัตว์ขายเนื้อและหนัง',
    req: { skills: { all: { bow: 1, survival: 1 } }, realms: ['grieve', 'dunes', 'mulvane', 'kragmor'] },
    flav: ['ตามรอยกวางอยู่สามวันกว่าจะได้ตัว', 'ขายหนังสัตว์ได้ราคาดีที่ตลาด', 'วางกับดักรอบป่าทั้งฤดู'] },
  { id: 'scribe', area: 'ความรู้', n: ['อาลักษณ์ฝึกหัด', 'อาลักษณ์', 'หัวหน้าอาลักษณ์'], pay: [4, 6, 10], phys: .3, d: 'คัดลอกเอกสารและเขียนจดหมายให้ทางการ',
    req: { skills: { all: { letters: 2 } }, realms: ['aurelis', 'serenth', 'kragmor'] }, topCls: 1,
    flav: ['คัดลอกกฎหมายใหม่ของศาสนจักรทั้งฤดู', 'เขียนจดหมายให้ขุนนางที่อ่านหนังสือไม่ค่อยคล่อง', 'หมึกติดนิ้วจนล้างไม่ออกแล้ว'] },
  { id: 'physician', area: 'ความรู้', n: ['หมอฝึกหัด', 'หมอ', 'หมอหลวง'], pay: [5, 9, 15], phys: .5, d: 'รักษาคนป่วย',
    req: { skills: { all: { medicine: 2 } } }, topCls: 1, onTop: p => { p.cls = Math.min(p.cls, 1); p.flags.physician = true; },
    flav: ['ปีนี้รักษาคนไข้ไปหลายสิบคน', 'นั่งเฝ้าคนไข้หนักทั้งคืน', 'ช่วยทำคลอดลูกแฝด รอดทั้งคู่'] },
  { id: 'alchemist', area: 'ความรู้', n: ['ผู้ช่วยนักเล่นแร่', 'นักเล่นแร่', 'นักเล่นแร่ประจำสมาคม'], pay: [5, 9, 14], phys: .5, d: 'ปรุงยาและทดลองสารต่างๆ',
    req: { skills: { all: { alchemy: 2 } }, realms: ['aurelis', 'serenth'] },
    flav: ['ห้องทดลองระเบิดเบาๆ ไปหนึ่งที', 'ยาที่ปรุงขายได้ทั้งในเมืองนอกเมือง', 'ลองสูตรใหม่จนผมไหม้ไปครึ่งหัว'] },
  { id: 'scholar', area: 'ความรู้', n: ['ครูสอนหนังสือ', 'นักปราชญ์', 'ปราชญ์ประจำหอสมุด'], pay: [3, 6, 10], phys: .2, d: 'สอนหนังสือและศึกษาตำรา',
    req: { skills: { all: { letters: 3, history: 2 } } },
    flav: ['สอนเด็กๆ แถวบ้านอ่านหนังสือ', 'เขียนตำราเล่มใหม่ไปได้ครึ่งเล่ม', 'เถียงเรื่องประวัติศาสตร์กับนักปราชญ์คนอื่นจนดึก'] },
  { id: 'merchant', area: 'สังคม', n: ['เด็กฝึกงานในร้าน', 'พ่อค้า', 'พ่อค้าใหญ่'], pay: [4, 8, 14], phys: .4, d: 'ซื้อมาขายไป', cost: 15,
    req: { skills: { all: { trade: 2 } } }, onTop: p => { p.cls = Math.min(p.cls, 1); },
    flav: ['ต่อรองราคากับพ่อค้าคู่แข่งทั้งวัน', 'ของที่สั่งมาขายหมดเกลี้ยงในเดือนเดียว', 'เดินทางไปซื้อของที่ตลาดต่างแดน'] },
  { id: 'priest', area: 'สังคม', n: ['นักบวชฝึกหัด', 'นักบวช', 'นักบวชชั้นสูง'], pay: [3, 5, 9], phys: .2, d: 'รับใช้ศาสนจักรสุริยะ',
    req: { skills: { all: { speech: 1, letters: 1 } }, realms: ['aurelis', 'undercity'] }, topCls: 1,
    flav: ['นำสวดพิธีเช้าทุกวัน', 'นั่งฟังคนแถวนั้นมาสารภาพบาป', 'แจกข้าวให้คนจนหน้าวิหาร'] },
  { id: 'envoy', area: 'สังคม', n: ['ผู้ช่วยทูต', 'ทูต', 'ราชทูต'], pay: [6, 10, 16], phys: .3, d: 'เจรจาระหว่างแดน',
    req: { skills: { all: { speech: 3, letters: 2 } }, maxCls: 1 }, onTop: p => { p.cls = 0; },
    flav: ['เดินทางไปเจรจาการค้าที่ครากมอร์', 'นั่งร่างสนธิสัญญาจนรุ่งเช้า', 'กินมื้อค่ำกับตัวแทนจากต่างแดน'] },
  { id: 'smith', area: 'งานฝีมือ', n: ['ลูกมือช่างตีเหล็ก', 'ช่างตีเหล็ก', 'ช่างตีเหล็กชั้นครู'], pay: [4, 7, 11], phys: 1.2, d: 'ตีเครื่องมือและอาวุธ',
    req: { skills: { all: { smith: 2 } } },
    flav: ['ตีเกือกม้าให้ทั้งหมู่บ้าน', 'ดาบที่ตีขายได้ราคาดี', 'มือเต็มไปด้วยรอยไหม้จากเตาหลอม'] },
  { id: 'artisan', area: 'งานฝีมือ', n: ['ลูกมือช่าง', 'ช่างฝีมือ', 'นายช่าง'], pay: [3, 6, 9], phys: .8, d: 'ทำเครื่องเรือน ทอผ้า หรือก่อสร้าง',
    req: { skills: { all: { craft: 2 } } },
    flav: ['ต่อโต๊ะให้บ้านพ่อค้าในเมือง', 'ทอผ้าผืนใหญ่ที่สุดเท่าที่เคยทำมา', 'ซ่อมหลังคาวิหารเสร็จทันก่อนหน้าหนาว'] },
  { id: 'guide', area: 'เอาตัวรอด', n: ['ผู้ช่วยนำทาง', 'คนนำทาง', 'คนนำทางชื่อดัง'], pay: [4, 6, 9], phys: 1, risk: 'beast', d: 'พากองคาราวานผ่านเส้นทางอันตราย',
    req: { skills: { all: { survival: 2 } }, realms: RURAL },
    flav: ['พาคาราวานผ่านเขตพายุแก้วได้ครบทุกคน', 'เจอเส้นทางใหม่ที่สั้นกว่าเดิมสองวัน', 'ดูลมแล้วรู้ก่อนใครว่าพายุจะมา'] },
  { id: 'thief', area: 'เอาตัวรอด', n: ['ขโมยมือใหม่', 'หัวขโมย', 'หัวหน้ากลุ่มโจร'], pay: [5, 8, 12], phys: .6, risk: 'caught', d: 'หาเงินจากกระเป๋าของคนอื่น',
    req: { skills: { all: { stealth: 2 } }, realms: ['undercity', 'aurelis'] },
    flav: ['ล้วงกระเป๋าพ่อค้าในตลาดได้สามใบในวันเดียว', 'ปีนเข้าบ้านขุนนางได้โดยไม่มีใครเห็น', 'เอาของโจรไปขายให้พวกรับซื้อในตรอกมืด'] },
  { id: 'healer', area: 'เวทมนตร์', n: ['หมอยาเวทฝึกหัด', 'หมอยาเวท', 'ผู้รักษาแห่งแผ่นดิน'], pay: [4, 7, 11], phys: .3, d: 'ใช้เวทรักษาคนป่วย',
    req: { skills: { all: { heal: 2 } } },
    flav: ['ใช้เวทรักษาคนแถวบ้านหายป่วยไปหลายสิบคน', 'คนจากหมู่บ้านอื่นดั้นด้นมาหา', 'มานาหมดทุกวันก่อนตะวันตกดิน'] },
  { id: 'battlemage', area: 'เวทมนตร์', n: ['นักเวทรับจ้าง', 'นักเวทศึก', 'จอมเวท'], pay: [6, 9, 14], phys: .5, risk: 'fight', d: 'ใช้เวทไฟรบหรือคุ้มกัน',
    req: { skills: { all: { fire: 2 } } }, onTop: p => { p.cls = Math.min(p.cls, 0); p.flags.archmage = true; },
    flav: ['คุ้มกันคาราวานด้วยเปลวไฟ', 'ขุนศึกคนหนึ่งจ้างไปยืนอยู่หน้าทัพ', 'เผาสะพานข้ามแม่น้ำตามคำสั่งคนจ้าง'] },
];
const CBY = Object.fromEntries(CAREERS.map(c => [c.id, c]));
const careerTitle = p => p.career === 'royal' && p.royal && !p.royal.lost ? royalTitle(p) : p.career ? CBY[p.career].n[p.careerRank || 0] : '';
function defaultCareer(p) {
  if (p.cls === 4) return 'slave';
  if (p.cls === 3) return 'serf';
  if (p.cls === 0) return 'noble';
  if (p.cls === 1) return 'merchant';
  return RURAL.includes(p.realm.id) || has(p, 'kragmor') ? 'farmer' : 'laborer';
}
function ensureCareer(p) {
  if (p.age < 14) return;
  if (!p.career) { p.career = defaultCareer(p); p.careerRank = 0; p.careerYears = 0; }
  if (p.career === 'slave' && p.cls < 4) setCareer(p, defaultCareer(p));
  if (p.career === 'serf' && p.cls < 3) setCareer(p, defaultCareer(p));
  if ((p.cls === 4 && p.career !== 'slave')) setCareer(p, 'slave');
  if (p.cls === 3 && p.career !== 'serf' && !p.flags.enlisted) setCareer(p, 'serf');
}
function setCareer(p, id) { p.career = id; p.careerRank = 0; p.careerYears = 0; p.careerChangedAt = p.age; }
// what is missing for this career (empty list = can take it)
function careerMissing(p, c, rk = 0) {
  const out = [];
  if (c.base) return ['อาชีพที่ได้มาจากการเกิด'];
  if (p.age < 14) out.push('ต้องอายุ 14 ปีขึ้นไป');
  if (p.cls === 4) return ['ทาสเลือกอาชีพเองไม่ได้ ต้องเป็นอิสระก่อน'];
  if (p.cls === 3) return ['ไพร่ติดที่ดินเปลี่ยนอาชีพไม่ได้ ต้องพ้นจากที่ดินก่อน (สมัครทหาร ไถ่ตัว หรือหนี)'];
  const q = c.req || {};
  if (q.maxCls != null && p.cls > q.maxCls) out.push('สงวนไว้ให้ลูกหลานพ่อค้าหรือขุนนาง');
  if (q.realms && !q.realms.includes(p.realm.id)) { const n = q.realms.map(r => RBY[r].short); out.push(`ต้องอยู่ที่${n.length > 1 ? n.slice(0, -1).join(' ') + ' หรือ' + n[n.length - 1] : n[0]}`); };
  const sk = q.skills || {};
  if (sk.any) { const need = sk.r + rk; if (!sk.any.some(s => rank(p, s) >= need)) out.push(`${sk.any.map(s => SBY[s].n).join('/')} ขั้น ${need}`); }
  if (sk.all) for (const [s, r] of Object.entries(sk.all)) if (rank(p, s) < r + rk) out.push(`${SBY[s].n} ขั้น ${r + rk}`);
  if (c.cost && rk === 0 && p.wealth < c.cost) out.push(`ทุนเริ่มต้น ${money(c.cost)}`);
  return out;
}
function canSwitch(p) { return p.careerChangedAt !== p.age; }
function takeCareer(p, id) {
  const c = CBY[id]; if (careerMissing(p, c).length || !canSwitch(p)) return false;
  if (c.cost) p.wealth = clampW(p.wealth - c.cost);
  setCareer(p, id);
  if (id === 'priest') p.flags.priest = true;
  return true;
}
const careerPay = (p, c) => c.pay[p.careerRank || 0] * (p.realm.wealth / 50 + .4) * .9 * incomeMod(p);

// ---- the year at work ----
extend('applyFocus', 'careers: a working year pays, tires, and can promote', inner => function (p) {
  if (p.age < 14 || p.focus !== 'work') return inner(p);
  ensureCareer(p);
  const c = CBY[p.career];
  if (c.id === 'slave') return inner(p);
  { const v = careerPay(p, c) * (.8 + Math.random() * .4); p.wealth = clampW(p.wealth + v); led(p, 'work', v); }
  p.health = clamp(p.health - c.phys);
  p.careerYears = (p.careerYears || 0) + 1;
  gainXP(p, 3);
  // promotion
  const rk = p.careerRank || 0;
  if (!c.base && rk < 2 && p.careerYears >= 3 + rk * 3 && !careerMissing(p, c, rk + 1).length) {
    if (rk + 1 === 2 && c.topCls != null && p.cls > c.topCls && !(p.rep && p.rep.noble >= 40)) { if (!p.flags.blockedTop) { p.flags.blockedTop = true; return `ทำงานเก่งพอจะได้เป็น${c.n[2]}แล้ว แต่ตำแหน่งนี้ตกไปเป็นของลูกหลานตระกูลที่ฐานะดีกว่า`; } }
    else { p.careerRank = rk + 1; p.careerYears = 0; p.happy += 6; if (rk + 1 === 2 && c.onTop) c.onTop(p); p.flags.topCareer = p.careerRank === 2 || p.flags.topCareer; return `ได้เลื่อนขั้นเป็น${c.n[rk + 1]}`; }
  }
  if (c.base && c.id === 'farmer' && rk === 0 && p.wealth >= 60) { p.careerRank = 2; return 'เก็บเงินจนซื้อที่นาเป็นของตัวเองได้'; }
  if (c.base && c.id === 'laborer' && rk === 0 && p.careerYears >= 10 && (am(p, 'STR') >= 1 || am(p, 'CHA') >= 1) && roll(.25)) { p.careerRank = 2; return 'นายจ้างให้คุมคนงานคนอื่น'; }
  return Math.random() < .5 ? pick(c.flav) : null;
});

// ---- career risks and story beats ----
CHOICES.push(
  { id: 'mercJob', repeat: 20, when: p => p.focus === 'work' && (p.career === 'merc' || p.career === 'battlemage') && roll(.4),
    prompt: p => `อายุ ${p.age} ปี ${p.career === 'merc' ? 'กองทหารรับจ้างของคุณ' : 'ผู้จ้างของคุณ'}ถูกโจรบุกกลางทาง`,
    options: p => [
      fightOpt('รับมือ', pick(['bandit', 'boss', 'soldier']), { intro: 'ก้าวออกไปยืนขวางหน้าคาราวาน', death: 'เสียชีวิตระหว่างทำงานคุ้มกัน', onEnd: (q, r) => r === 'win' ? (q.wealth += 8, 'คนจ้างจ่ายเงินพิเศษให้') : r === 'lose' ? 'คนจ้างหักค่าจ้างไปครึ่งหนึ่ง' : '' }),
      opt('ปล่อยให้คนอื่นสู้', q => { q.wealth -= 4; q.happy -= 3; return 'คนจ้างไม่พอใจ หักค่าจ้าง'; }),
    ] },
  { id: 'huntJob', repeat: 20, when: p => p.focus === 'work' && (p.career === 'hunter' || p.career === 'guide') && roll(.3),
    prompt: p => `อายุ ${p.age} ปี ระหว่างทำงานในป่า มีอะไรบางอย่างขยับอยู่ในพุ่มไม้`,
    options: p => [
      fightOpt('เข้าไปดู', beastFor(p), { intro: 'มันกระโจนออกมาจากพุ่มไม้', death: 'ถูกสัตว์ร้ายทำร้ายจนเสียชีวิตระหว่างทำงาน', onEnd: (q, r) => r === 'win' ? (q.wealth += 6, 'หนังมันขายได้ราคาดี') : r === 'lose' ? 'ลากสังขารกลับมาถึงหมู่บ้านได้' : '' }),
      opt('ถอยออกมาเงียบๆ', () => 'ถอยกลับทางเดิม วันนั้นกลับมามือเปล่า'),
    ] },
  { id: 'thiefJob', repeat: 20, when: p => p.focus === 'work' && p.career === 'thief' && roll(.35),
    prompt: p => `อายุ ${p.age} ปี เล็งบ้านพ่อค้าใหญ่ไว้หลังหนึ่ง ยามเพิ่งเปลี่ยนกะ`,
    options: p => [
      Object.assign(opt('ลงมือคืนนี้', q => { if (check(q, 'DEX', 'stealth', 13)) { q.wealth += 14; return 'ออกมาพร้อมถุงเงินเต็มมือ'; } startFight(q, 'hunter', { death: 'ถูกยามจับได้ระหว่างลักขโมย และถูกประหาร', onEnd: (z, r) => r === 'win' ? 'สู้ฝ่าออกมาได้ แต่มือเปล่า' : r === 'fled' ? 'หนีรอดมาได้แบบหวุดหวิด' : r === 'lose' ? (z.cls = 4, ensureCareer(z), 'โดนจับ แล้วโดนขายเป็นทาสชดใช้') : '' }); return 'ยามคนหนึ่งเห็นเข้าพอดี'; }), { chk: ['DEX', 'stealth'], fight: 'hunter' }),
      opt('รอโอกาสที่ดีกว่า', () => 'รอไปอีกคืน'),
    ] },
  { id: 'guardDuty', repeat: 10, when: p => p.focus === 'work' && p.career === 'guard' && roll(.25),
    prompt: p => `อายุ ${p.age} ปี หัวหน้ายามสั่งให้ไล่คนใต้กำแพงที่มารวมตัวกันหน้าประตูชั้นใน`,
    options: p => [
      opt('ทำตามคำสั่ง', q => { q.wealth += 4; q.happy -= 6; return 'ฝูงคนแตกฮือ ในนั้นมีหน้าคนที่เคยเป็นเพื่อนบ้านอยู่ด้วย'; }),
      opt('ทำเป็นไม่เห็น', q => { if (roll(.4)) { setCareer(q, defaultCareer(q)); q.happy -= 3; return 'หัวหน้ายามไล่ออกจากงาน'; } q.happy += 4; q.flags.savedOther = true; return 'หันหลังให้ประตู ตกค่ำฝูงคนก็สลายไปเอง'; }),
    ] },
  { id: 'smithCommission', repeat: 6, when: p => p.focus === 'work' && p.career === 'smith' && roll(.2),
    prompt: p => `อายุ ${p.age} ปี พ่อค้าอาวุธจากออเรลิสสั่งดาบห้าสิบเล่ม จะเอาไปขายที่กรีฟ`,
    options: p => [
      opt('รับงาน', q => { q.wealth += 14; q.flags.weaponsmith = true; q.happy -= 2; return 'ตีดาบทั้งฤดู ไม่รู้ว่าดาบพวกนั้นจะไปอยู่ในมือใคร'; }),
      opt('ปฏิเสธ', q => { q.happy += 2; return 'ตีจอบขายต่อไป ได้เงินน้อยกว่า แต่นอนหลับสบาย'; }),
    ] },
  { id: 'scribeSecret', when: p => p.focus === 'work' && p.career === 'scribe' && (p.careerRank || 0) >= 1 && roll(.08),
    prompt: () => 'ระหว่างคัดลอกเอกสารของศาสนจักร ไปเจอจดหมายที่ศาสนจักรกับสภาผู้อาวุโสแห่งเซเรนธ์เขียนโต้ตอบกัน',
    options: p => [
      opt('อ่านให้จบ', q => { q.flags.ledger = true; q.know += 5; return 'ในจดหมายเขียนว่าเซเรนธ์จ่ายทองให้ศาสนจักรทุกปี แลกกับให้สอนว่าเถ้ามาจากคนธรรมดาที่ใช้เวท'; }),
      opt('ปิดแล้วทำเป็นไม่เห็น', () => 'คัดลอกเอกสารฉบับถัดไปต่อ'),
    ] },
);
LEGENDS.push(
  { id: 'topcareer', n: 'จุดสูงสุดของอาชีพ', d: 'ได้เลื่อนขั้นถึงตำแหน่งสูงสุดของอาชีพ', c: p => p.flags.topCareer },
  { id: 'glassceiling', n: 'เพดานที่มองไม่เห็น', d: 'เก่งพอจะได้ตำแหน่งสูงสุด แต่ถูกกันไว้เพราะฐานะ', c: p => p.flags.blockedTop },
  { id: 'offland', n: 'พ้นจากที่ดิน', d: 'เกิดเป็นไพร่ แต่ได้ทำอาชีพที่ตัวเองเลือก', c: p => p.bornCls === 3 && p.career && !CBY[p.career].base },
);

// (the simulated bot life is defined once, in adventure.js, after every system exists)
// when the army takes you, the army is your job
(() => {
  const c = CHOICES.find(x => x.id === 'enlist'); if (!c) return;
  const orig = c.options;
  c.options = p => orig(p).map(o => o.label === 'สมัครเป็นทหาร' ? Object.assign({}, o, { act: q => { const t = o.act(q); setCareer(q, 'soldier'); return t; } }) : o);
})();
CAREERS.push({ id: 'soldier', base: true, n: ['พลทหาร', 'นายสิบ', 'นายร้อย'], pay: [3.5, 5, 8], phys: 1.2, d: 'ทหารประจำการ เลื่อนยศจากการชนะศึก',
  flav: ['ฝึกซ้อมในค่ายทหารทุกเช้า', 'กองโดนส่งไปเฝ้าด่านชายแดน', 'ได้เงินเดือนทหารครบทั้งปี'] });
CBY.soldier = CAREERS[CAREERS.length - 1];
// army rank drives soldier title
extend('applyFocus', 'careers: a soldier ranks by army rank', inner => function (p) { if (p.career === 'soldier') { p.careerRank = Math.min(2, p.flags.armyRank || 0); if (!p.flags.enlisted) setCareer(p, defaultCareer(p)); } return inner(p); });

// ---- serfs and slaves can choose to try for freedom themselves ----
const bondPrice = p => p.cls === 4 ? 60 : 35;
function bondChoice(p) {
  const slave = p.cls === 4, price = bondPrice(p);
  return { id: 'bond', prompt: slave ? `อายุ ${p.age} ปี นั่งมองประตูบ้านนายในคืนเดือนมืด` : `อายุ ${p.age} ปี ยืนอยู่บนคันนาของเจ้าที่ดิน แล้วถามตัวเองว่าจะอยู่ที่นี่ไปจนตายเลยหรือ`,
    options: [
      opt(`ไถ่ตัว (ทรัพย์ ${price})`, q => { q.wealth -= price; q.cls = 2; q.flags.boughtFreedom = true; q.happy += 15; ensureCareer(q); return 'กำหนังสือไถ่ตัวไว้แน่น ตั้งแต่วันนี้เลือกงานเองได้แล้ว'; }, q => q.wealth >= price, `ต้องมีทรัพย์ ${price}`),
      Object.assign(opt('หนีไปตอนกลางคืน', q => {
        if (check(q, 'DEX', 'stealth', slave ? 15 : 13)) { q.cls = 2; q.flags.fugitive = true; q.wealth = Math.min(q.wealth, 5); q.happy += 12; ensureCareer(q); return 'หนีพ้น ตอนนี้เป็นไทแก่ตัวแล้ว แต่ไม่มีอะไรติดตัวสักอย่าง แถมอาจมีคนตามล่า'; }
        if (slave && roll(.35)) { die(q, 'ถูกจับได้ระหว่างหลบหนี'); return 'หมาของนายตามกลิ่นมาจนเจอตัวก่อนฟ้าสาง'; }
        q.health -= slave ? 20 : 12; q.happy -= 12; return slave ? 'โดนจับได้ แล้วโดนลงโทษอย่างหนัก' : 'คนของเจ้าที่ดินลากตัวกลับมา แล้วเพิ่มงานให้อีกเท่าตัว';
      }), { chk: ['DEX', 'stealth'] }),
      opt('ยังไม่ใช่ตอนนี้', () => 'กลับไปนอน พรุ่งนี้ก็ต้องทำงานเหมือนเดิม'),
    ] };
}
extend('applyFocus', 'careers: every adult has a career', inner => function (p) { if (p.age >= 14) ensureCareer(p); return inner(p); });

// ===== REALISM PASS =====
// 1) working at a trade teaches it, like an apprenticeship
const CAREER_SKILL = { farmer: 'survival', serf: 'survival', laborer: 'craft', slave: 'craft', noble: 'speech', guard: 'sword', merc: null, hunter: 'bow',
  scribe: 'letters', physician: 'medicine', alchemist: 'alchemy', scholar: 'history', merchant: 'trade', priest: 'speech', envoy: 'speech',
  smith: 'smith', artisan: 'craft', guide: 'survival', thief: 'stealth', healer: 'heal', battlemage: 'fire', soldier: null };
function careerSkill(p) {
  const s = CAREER_SKILL[p.career];
  if (s === null || p.career === 'guard') { const w = wpn(p); return w && w.skill ? w.skill : (p.career === 'guard' ? 'spear' : 'spear'); }
  return s;
}
function learnOnJob(p, amt) {
  const sid = careerSkill(p); if (!sid || !p.skills[sid] || rank(p, sid) >= MAX_RANK) return null;
  const ac = access(p, sid); if (!ac.ok && !(p.cls === 4 && sid === 'craft')) return null;
  const s = SBY[sid], sk = p.skills[sid];
  sk.x += amt * (1 + .1 * am(p, s.a)) * (1 - sk.r * .08);
  if (sk.x >= 100) { sk.x = 0; sk.r++; gainXP(p, 10); return `ทำงานมาหลายปี ฝีมือ${s.n}ขึ้นเป็นขั้น ${sk.r} โดยไม่ต้องไปเรียนที่ไหน`; }
  return null;
}
// 2) living costs: rent, food, tax. the poor live hand to mouth
const UPKEEP = [8, 4, 3, 1.3, 0];
const RENT = [5, 1.5, 0, 0, 0]; // land and shop income that arrives without working
const priceF = p => (p.realm.wealth / 50 + .4) * .8;
function upkeep(p) { return (UPKEEP[p.cls] + (p.cls >= 2 ? Math.min(p.kidNames.length, 4) * .4 : 0)) * priceF(p); }
function rent(p) { return RENT[p.cls] * priceF(p); }
function payLiving(p) {
  if (p.age < 14 || p.cls === 4) return null;
  const bad = p.cls >= 1 && roll(.12);
  const net = rent(p) - upkeep(p) * (bad ? 1.8 : 1);
  p.wealth += net; led(p, 'rent', rent(p)); led(p, 'living', net - rent(p));
  if (bad && p.wealth >= 0) return pick(['ปีนี้ข้าวยากหมากแพง ข้าวขึ้นราคาเกือบเท่าตัว เงินเก็บหายไปเยอะ', 'ภาษีปีนี้ขึ้นอีกแล้ว คนเก็บภาษีมาเคาะประตูถึงบ้าน']);
  if (p.wealth < 0) { p.wealth = 0; p.health -= 4; p.happy -= 4; p.flags.hungry = (p.flags.hungry || 0) + 1; return pick(['ปีนี้เงินไม่พอซื้อข้าว หลายคืนต้องนอนทั้งที่ท้องร้อง', 'ค้างค่าเช่าที่ซุกหัวนอนจนเจ้าของไล่ออก', 'ต้องขายของใช้ในบ้านไปแลกข้าว']); }
  return null;
}
// 4) children of the poor work young, for a child's pay
extend('applyFocus', 'careers: child labour, learning on the job, cost of living', inner => function (p) {
  if (p.age >= 7 && p.age < 14 && p.focus === 'work') {
    if (p.cls === 4) { p.health = clamp(p.health - 1.5); return roll(.3) ? 'เด็กทาสอย่างคุณโดนใช้ให้ขนน้ำเลี้ยงสัตว์ตั้งแต่เช้ายันค่ำ' : null; }
    const g = (p.cls >= 2 ? 1.2 : .5) * (p.realm.wealth / 50 + .4) * (p.age >= 10 ? 1 : .5);
    p.wealth = clampW(p.wealth + g); led(p, 'work', g); p.health = clamp(p.health - (p.cls >= 2 ? 1 : .2));
    const sid = p.cls >= 2 ? (RURAL.includes(p.realm.id) ? 'survival' : 'craft') : 'trade';
    if (p.age >= 10 && access(p, sid).ok) { const sk = p.skills[sid]; sk.x += 8; if (sk.x >= 100) { sk.x = 0; sk.r++; return `ช่วยงานผู้ใหญ่มาหลายปี จน${SBY[sid].n}ขึ้นเป็นขั้น ${sk.r}`; } }
    return roll(.4) ? pick(p.cls >= 2 ? ['ช่วยพ่อแม่ทำงานตั้งแต่เช้ามืด แทนที่จะได้ไปวิ่งเล่นกับเด็กคนอื่น', 'รับจ้างไล่นกในนาเพื่อนบ้าน ได้ข้าวกลับบ้านมาถุงหนึ่ง', 'แบกของที่ตลาดได้แค่ครึ่งของผู้ใหญ่ ค่าจ้างก็ได้แค่ครึ่งเดียว'] : ['ช่วยงานในร้านของที่บ้าน จนนับเหรียญคล่องปรื๋อ', 'พ่อแม่ให้มานั่งดูผู้ใหญ่เจรจาการค้า']) : null;
  }
  let t = inner(p);
  if (p.age >= 14 && p.focus === 'work') { const l = learnOnJob(p, 13); if (l) t = l; }
  const lv = payLiving(p); if (lv) t = t ? t + ' · ' + lv : lv;
  return t;
});
// 3) a trade needs an entry fee and someone to vouch for you; apprentices are taken young
const FEE = { scribe: 8, physician: 15, alchemist: 15, scholar: 6, priest: 6, envoy: 20, smith: 10, artisan: 8, healer: 6 };
const OFFICIAL = ['guard', 'scribe', 'priest', 'envoy', 'physician'];
const fee = (p, c) => FEE[c.id] ? Math.round(FEE[c.id] * (p.cls <= 1 ? .5 : 1)) : 0;
extend('careerMissing', 'careers: guild fee, fugitives barred from office, late starters must be better', inner => function (p, c, rk = 0) {
  const out = inner(p, c, rk);
  if (c.base || rk > 0 || p.cls >= 3) return out;
  const f = fee(p, c); if (f && p.wealth < f) out.push(`ค่าเข้ากิลด์ ${money(f)}`);
  if (p.flags.fugitive && OFFICIAL.includes(c.id)) out.push('ต้องมีเอกสารตัวตน แต่คุณเป็นคนหนี');
  if (p.age > 30) {
    const q = c.req && c.req.skills || {}, need = (q.all ? Object.entries(q.all) : (q.any || []).map(s => [s, q.r]));
    const ok = q.any ? q.any.some(s => rank(p, s) >= q.r + 2) : need.every(([s, r]) => rank(p, s) >= r + 2);
    if (!ok) out.push('อายุเกิน 30 ไม่มีใครรับเป็นลูกมือ ต้องเก่งกว่าที่กำหนด 2 ขั้น');
  }
  return out;
});
extend('takeCareer', 'careers: guild fees when taking a career', inner => function (p, id) { const c = CBY[id], f = fee(p, c); const ok = inner(p, id); if (ok && f) p.wealth = clampW(p.wealth - f); return ok; });
LEGENDS.push({ id: 'hungry', n: 'ปากกัดตีนถีบ', d: 'อดอยากเพราะเงินไม่พอกินมาแล้ว 5 ปี', c: p => (p.flags.hungry || 0) >= 5 });

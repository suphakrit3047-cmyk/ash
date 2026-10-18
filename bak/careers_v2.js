// ===== CAREERS & TRAINING AREAS =====
// new craft skill so the craft path has more than smithing
(() => {
  const s = { id: 'craft', n: 'งานช่าง', a: 'DEX', g: 'งานฝีมือ', min: 10 };
  const i = SKILLS.findIndex(x => x.id === 'smith') + 1; SKILLS.splice(i, 0, s); SBY.craft = s;
})();
const _access2 = access;
access = function (p, sid) {
  if (sid !== 'craft') return _access2(p, sid);
  if (p.age < 10) return { ok: false, why: 'เริ่มฝึกได้ตอนอายุ 10 ปี', mult: 0, cost: 0 };
  if (has(p, 'aurelis', 'serenth')) return { ok: true, mult: 1.1, cost: 2, label: 'โรงช่างในเมือง · ค่าเรียน 2/ปี' };
  return { ok: true, mult: p.cls === 4 ? .6 : .9, cost: 0, label: p.cls === 4 ? 'เรียนจากงานที่นายสั่ง' : 'ช่างในหมู่บ้านสอน' };
};

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
    flav: ['คุณทำงานรับใช้นายทั้งปี ไม่มีวันหยุด', 'นายสั่งให้คุณทำงานจนดึกทุกคืน', 'คุณถูกส่งไปทำงานที่บ้านญาติของนายทั้งฤดู'] },
  { id: 'serf', base: true, n: ['ไพร่ติดที่ดิน', 'ไพร่ติดที่ดิน', 'ไพร่ติดที่ดิน'], pay: [1.5, 1.5, 1.5], phys: 1.5, d: 'ทำนาให้เจ้าที่ดิน ได้ส่วนแบ่งครึ่งเดียว',
    flav: ['คุณทำนาบนที่ดินของเจ้าที่ดินทั้งปี', 'คุณตื่นก่อนไก่ขันเพื่อไปทำนาของเจ้าที่ดินก่อนนาของตัวเอง', 'ผลผลิตครึ่งหนึ่งต้องส่งให้เจ้าที่ดินเหมือนทุกปี'] },
  { id: 'farmer', base: true, n: ['ชาวนา', 'ชาวนา', 'ชาวนามีที่ดิน'], pay: [3, 3.5, 5], phys: 1.5, d: 'ทำไร่ทำนาหรือเลี้ยงสัตว์',
    flav: ['คุณไถนาและหว่านเมล็ดตั้งแต่เช้ามืด', 'คุณซ่อมคันนาที่พังจากฝน', 'ปีนี้ข้าวในนาของคุณออกรวงดี'] },
  { id: 'laborer', base: true, n: ['คนรับจ้าง', 'คนรับจ้าง', 'หัวหน้าคนงาน'], pay: [2.7, 3, 4.5], phys: 1.5, d: 'รับจ้างใช้แรงงานทั่วไป',
    flav: ['คุณรับจ้างแบกของที่ตลาดทุกวัน', 'คุณรับจ้างขุดคูให้ช่างก่อสร้าง', 'วันไหนไม่มีงาน คุณนั่งรอนายจ้างตั้งแต่เช้า'] },
  { id: 'noble', base: true, n: ['ทายาทตระกูล', 'ผู้ดูแลที่ดิน', 'ประมุขตระกูล'], pay: [7, 9, 12], phys: .3, d: 'บริหารที่ดินและไพร่ของตระกูล',
    flav: ['คุณไปเก็บภาษีจากไพร่ในที่ดินของตระกูล', 'คุณตรวจบัญชีของตระกูลทั้งเดือน', 'คุณไปเจรจาเรื่องที่ดินกับตระกูลอื่น'] },
  // chosen careers
  { id: 'guard', area: 'การต่อสู้', n: ['ยามฝึกหัด', 'ยามเมือง', 'หัวหน้ายาม'], pay: [3, 5, 8], phys: 1, d: 'เฝ้าประตูและลาดตระเวนในเมือง',
    req: { skills: { any: ['sword', 'spear', 'axe'], r: 1 }, realms: ['aurelis', 'undercity', 'kragmor'] }, topCls: 2,
    flav: ['คุณเฝ้าประตูเมืองทั้งกะ เห็นคนเข้าออกนับพัน', 'คุณจับขโมยล้วงกระเป๋าได้กลางตลาด', 'คุณลาดตระเวนในตรอกมืดตอนกลางคืน'] },
  { id: 'merc', area: 'การต่อสู้', n: ['ทหารรับจ้างหน้าใหม่', 'ทหารรับจ้าง', 'หัวหน้ากองทหารรับจ้าง'], pay: [5, 8, 12], phys: 1.5, risk: 'fight', d: 'รับจ้างรบให้ใครก็ได้ที่จ่ายเงิน',
    req: { skills: { any: ['sword', 'spear', 'axe', 'bow', 'dagger'], r: 2 }, realms: ['grieve', 'dunes', 'undercity', 'mulvane'] },
    flav: ['คุณคุ้มกันกองคาราวานข้ามที่ราบ', 'ขุนศึกคนใหม่จ้างกองของคุณทั้งฤดู', 'คุณรับเงินจากฝ่ายหนึ่ง แล้วปีต่อมาก็รับเงินจากอีกฝ่าย'] },
  { id: 'hunter', area: 'การต่อสู้', n: ['นักล่าฝึกหัด', 'นักล่า', 'นักล่าชื่อดัง'], pay: [3, 5, 7], phys: 1, risk: 'beast', d: 'ล่าสัตว์ขายเนื้อและหนัง',
    req: { skills: { all: { bow: 1, survival: 1 } }, realms: ['grieve', 'dunes', 'mulvane', 'kragmor'] },
    flav: ['คุณตามรอยกวางอยู่สามวันกว่าจะได้ตัว', 'คุณขายหนังสัตว์ได้ราคาดีที่ตลาด', 'คุณวางกับดักรอบป่าทั้งฤดู'] },
  { id: 'scribe', area: 'ความรู้', n: ['อาลักษณ์ฝึกหัด', 'อาลักษณ์', 'หัวหน้าอาลักษณ์'], pay: [4, 6, 10], phys: .3, d: 'คัดลอกเอกสารและเขียนจดหมายให้ทางการ',
    req: { skills: { all: { letters: 2 } }, realms: ['aurelis', 'serenth', 'kragmor'] }, topCls: 1,
    flav: ['คุณคัดลอกกฎหมายใหม่ของศาสนจักรทั้งฤดู', 'คุณเขียนจดหมายให้ขุนนางที่อ่านหนังสือไม่คล่อง', 'นิ้วของคุณมีหมึกติดจนล้างไม่ออก'] },
  { id: 'physician', area: 'ความรู้', n: ['หมอฝึกหัด', 'หมอ', 'หมอหลวง'], pay: [5, 9, 15], phys: .5, d: 'รักษาคนป่วย',
    req: { skills: { all: { medicine: 2 } } }, topCls: 1, onTop: p => { p.cls = Math.min(p.cls, 1); p.flags.physician = true; },
    flav: ['คุณรักษาคนไข้ไปหลายสิบคนในปีนี้', 'คุณนั่งเฝ้าคนไข้หนักทั้งคืน', 'คุณช่วยทำคลอดเด็กแฝดได้ปลอดภัยทั้งคู่'] },
  { id: 'alchemist', area: 'ความรู้', n: ['ผู้ช่วยนักเล่นแร่', 'นักเล่นแร่', 'นักเล่นแร่ประจำสมาคม'], pay: [5, 9, 14], phys: .5, d: 'ปรุงยาและทดลองสารต่างๆ',
    req: { skills: { all: { alchemy: 2 } }, realms: ['aurelis', 'serenth'] },
    flav: ['ห้องทดลองของคุณระเบิดเบาๆ ไปหนึ่งครั้ง', 'ยาที่คุณปรุงขายได้ทั้งในเมืองและนอกเมือง', 'คุณทดลองสูตรใหม่จนผมไหม้ไปครึ่งหัว'] },
  { id: 'scholar', area: 'ความรู้', n: ['ครูสอนหนังสือ', 'นักปราชญ์', 'ปราชญ์ประจำหอสมุด'], pay: [3, 6, 10], phys: .2, d: 'สอนหนังสือและศึกษาตำรา',
    req: { skills: { all: { letters: 3, history: 2 } } },
    flav: ['คุณสอนเด็กๆ ในละแวกอ่านหนังสือ', 'คุณเขียนตำราเล่มใหม่ไปได้ครึ่งเล่ม', 'คุณถกเถียงเรื่องประวัติศาสตร์กับนักปราชญ์คนอื่นจนดึก'] },
  { id: 'merchant', area: 'สังคม', n: ['เด็กฝึกงานในร้าน', 'พ่อค้า', 'พ่อค้าใหญ่'], pay: [4, 8, 14], phys: .4, d: 'ซื้อมาขายไป', cost: 15,
    req: { skills: { all: { trade: 2 } } }, onTop: p => { p.cls = Math.min(p.cls, 1); },
    flav: ['คุณต่อรองราคากับพ่อค้าคู่แข่งทั้งวัน', 'สินค้าที่คุณสั่งมาขายหมดภายในเดือนเดียว', 'คุณเดินทางไปซื้อสินค้าที่ตลาดแดนอื่น'] },
  { id: 'priest', area: 'สังคม', n: ['นักบวชฝึกหัด', 'นักบวช', 'นักบวชชั้นสูง'], pay: [3, 5, 9], phys: .2, d: 'รับใช้ศาสนจักรสุริยะ',
    req: { skills: { all: { speech: 1, letters: 1 } }, realms: ['aurelis', 'undercity'] }, topCls: 1,
    flav: ['คุณนำสวดในพิธีเช้าทุกวัน', 'คุณฟังคำสารภาพบาปของคนในละแวก', 'คุณแจกข้าวให้คนยากจนหน้าวิหาร'] },
  { id: 'envoy', area: 'สังคม', n: ['ผู้ช่วยทูต', 'ทูต', 'ราชทูต'], pay: [6, 10, 16], phys: .3, d: 'เจรจาระหว่างแดน',
    req: { skills: { all: { speech: 3, letters: 2 } }, maxCls: 1 }, onTop: p => { p.cls = 0; },
    flav: ['คุณเดินทางไปเจรจาการค้าที่ครากมอร์', 'คุณนั่งร่างสนธิสัญญาจนรุ่งเช้า', 'คุณรับประทานอาหารค่ำกับตัวแทนจากอีกแดน'] },
  { id: 'smith', area: 'งานฝีมือ', n: ['ลูกมือช่างตีเหล็ก', 'ช่างตีเหล็ก', 'ช่างตีเหล็กชั้นครู'], pay: [4, 7, 11], phys: 1.2, d: 'ตีเครื่องมือและอาวุธ',
    req: { skills: { all: { smith: 2 } } },
    flav: ['คุณตีเกือกม้าให้ทั้งหมู่บ้าน', 'ดาบที่คุณตีขายได้ราคาดี', 'มือของคุณเต็มไปด้วยรอยไหม้จากเตาหลอม'] },
  { id: 'artisan', area: 'งานฝีมือ', n: ['ลูกมือช่าง', 'ช่างฝีมือ', 'นายช่าง'], pay: [3, 6, 9], phys: .8, d: 'ทำเครื่องเรือน ทอผ้า หรือก่อสร้าง',
    req: { skills: { all: { craft: 2 } } },
    flav: ['คุณต่อโต๊ะให้บ้านพ่อค้าในเมือง', 'คุณทอผ้าผืนใหญ่ที่สุดเท่าที่เคยทำ', 'คุณซ่อมหลังคาวิหารจนเสร็จก่อนหน้าหนาว'] },
  { id: 'guide', area: 'เอาตัวรอด', n: ['ผู้ช่วยนำทาง', 'คนนำทาง', 'คนนำทางชื่อดัง'], pay: [4, 6, 9], phys: 1, risk: 'beast', d: 'พากองคาราวานผ่านเส้นทางอันตราย',
    req: { skills: { all: { survival: 2 } }, realms: RURAL },
    flav: ['คุณพากองคาราวานผ่านเขตพายุแก้วได้ครบทุกคน', 'คุณเจอเส้นทางใหม่ที่สั้นกว่าเดิมสองวัน', 'คุณอ่านลมแล้วรู้ว่าพายุจะมาก่อนใคร'] },
  { id: 'thief', area: 'เอาตัวรอด', n: ['ขโมยมือใหม่', 'หัวขโมย', 'หัวหน้ากลุ่มโจร'], pay: [5, 8, 12], phys: .6, risk: 'caught', d: 'หาเงินจากกระเป๋าของคนอื่น',
    req: { skills: { all: { stealth: 2 } }, realms: ['undercity', 'aurelis'] },
    flav: ['คุณล้วงกระเป๋าพ่อค้าในตลาดได้สามใบในวันเดียว', 'คุณปีนเข้าบ้านขุนนางโดยไม่มีใครเห็น', 'คุณขายของโจรให้คนรับซื้อในตรอกมืด'] },
  { id: 'healer', area: 'เวทมนตร์', n: ['หมอยาเวทฝึกหัด', 'หมอยาเวท', 'ผู้รักษาแห่งแผ่นดิน'], pay: [4, 7, 11], phys: .3, d: 'ใช้เวทรักษาคนป่วย',
    req: { skills: { all: { heal: 2 } } },
    flav: ['คุณใช้เวทรักษาคนในละแวกจนหายป่วยไปหลายสิบคน', 'คนจากหมู่บ้านอื่นเดินทางมาหาคุณ', 'มานาของคุณหมดทุกวันก่อนพระอาทิตย์ตก'] },
  { id: 'battlemage', area: 'เวทมนตร์', n: ['นักเวทรับจ้าง', 'นักเวทศึก', 'จอมเวท'], pay: [6, 9, 14], phys: .5, risk: 'fight', d: 'ใช้เวทไฟรบหรือคุ้มกัน',
    req: { skills: { all: { fire: 2 } } }, onTop: p => { p.cls = Math.min(p.cls, 0); p.flags.archmage = true; },
    flav: ['คุณคุ้มกันกองคาราวานด้วยเปลวไฟ', 'ขุนศึกคนหนึ่งจ้างคุณไปยืนอยู่หน้าทัพ', 'คุณเผาสะพานข้ามแม่น้ำตามคำสั่งของผู้จ้าง'] },
];
const CBY = Object.fromEntries(CAREERS.map(c => [c.id, c]));
const careerTitle = p => p.career ? CBY[p.career].n[p.careerRank || 0] : '';
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
  if (c.cost && rk === 0 && p.wealth < c.cost) out.push(`ทุนเริ่มต้น ${c.cost}`);
  return out;
}
function canSwitch(p) { return p.careerChangedAt !== p.age; }
function takeCareer(p, id) {
  const c = CBY[id]; if (careerMissing(p, c).length || !canSwitch(p)) return false;
  if (c.cost) p.wealth = clamp(p.wealth - c.cost);
  setCareer(p, id);
  if (id === 'priest') p.flags.priest = true;
  return true;
}
const careerPay = (p, c) => c.pay[p.careerRank || 0] * (p.realm.wealth / 50 + .4) * .9 * incomeMod(p);

// ---- the year at work ----
const _applyFocus = applyFocus;
applyFocus = function (p) {
  if (p.age < 14 || p.focus !== 'work') return _applyFocus(p);
  ensureCareer(p);
  const c = CBY[p.career];
  if (c.id === 'slave') return _applyFocus(p);
  p.wealth = clamp(p.wealth + careerPay(p, c) * (.8 + Math.random() * .4));
  p.health = clamp(p.health - c.phys);
  p.careerYears = (p.careerYears || 0) + 1;
  gainXP(p, 3);
  // promotion
  const rk = p.careerRank || 0;
  if (!c.base && rk < 2 && p.careerYears >= 3 + rk * 3 && !careerMissing(p, c, rk + 1).length) {
    if (rk + 1 === 2 && c.topCls != null && p.cls > c.topCls) { if (!p.flags.blockedTop) { p.flags.blockedTop = true; return `คุณทำงานดีพอจะได้เป็น${c.n[2]}แล้ว แต่ตำแหน่งนี้ตกเป็นของลูกหลานตระกูลที่มีฐานะกว่า`; } }
    else { p.careerRank = rk + 1; p.careerYears = 0; p.happy += 6; if (rk + 1 === 2 && c.onTop) c.onTop(p); p.flags.topCareer = p.careerRank === 2 || p.flags.topCareer; return `คุณได้เลื่อนขั้นเป็น${c.n[rk + 1]}`; }
  }
  if (c.base && c.id === 'farmer' && rk === 0 && p.wealth >= 60) { p.careerRank = 2; return 'คุณเก็บเงินจนซื้อที่นาเป็นของตัวเองได้'; }
  if (c.base && c.id === 'laborer' && rk === 0 && p.careerYears >= 10 && (am(p, 'STR') >= 1 || am(p, 'CHA') >= 1) && roll(.25)) { p.careerRank = 2; return 'นายจ้างให้คุณคุมคนงานคนอื่น'; }
  return Math.random() < .5 ? pick(c.flav) : null;
};

// ---- career risks and story beats ----
CHOICES.push(
  { id: 'mercJob', repeat: 20, when: p => p.focus === 'work' && (p.career === 'merc' || p.career === 'battlemage') && roll(.4),
    prompt: p => `อายุ ${p.age} ปี ${p.career === 'merc' ? 'กองทหารรับจ้างของคุณ' : 'ผู้จ้างของคุณ'}ถูกโจรบุกกลางทาง`,
    options: p => [
      fightOpt('รับมือ', pick(['bandit', 'boss', 'soldier']), { intro: 'คุณก้าวออกไปยืนหน้ากองคาราวาน', death: 'เสียชีวิตระหว่างทำงานคุ้มกัน', onEnd: (q, r) => r === 'win' ? (q.wealth += 8, 'ผู้จ้างจ่ายเงินพิเศษให้คุณ') : r === 'lose' ? 'ผู้จ้างหักค่าจ้างของคุณไปครึ่งหนึ่ง' : '' }),
      opt('ปล่อยให้คนอื่นสู้', q => { q.wealth -= 4; q.happy -= 3; return 'ผู้จ้างไม่พอใจ และหักค่าจ้างของคุณ'; }),
    ] },
  { id: 'huntJob', repeat: 20, when: p => p.focus === 'work' && (p.career === 'hunter' || p.career === 'guide') && roll(.3),
    prompt: p => `อายุ ${p.age} ปี ระหว่างทำงานในป่า มีบางอย่างเคลื่อนไหวอยู่ในพุ่มไม้`,
    options: p => [
      fightOpt('เข้าไปดู', beastFor(p), { intro: 'มันกระโจนออกมาจากพุ่มไม้', death: 'ถูกสัตว์ร้ายทำร้ายจนเสียชีวิตระหว่างทำงาน', onEnd: (q, r) => r === 'win' ? (q.wealth += 6, 'หนังของมันขายได้ราคาดี') : r === 'lose' ? 'คุณลากตัวเองกลับมาถึงหมู่บ้านได้' : '' }),
      opt('ถอยออกมาเงียบๆ', () => 'คุณถอยกลับทางเดิม และไม่ได้อะไรติดมือกลับมาในวันนั้น'),
    ] },
  { id: 'thiefJob', repeat: 20, when: p => p.focus === 'work' && p.career === 'thief' && roll(.35),
    prompt: p => `อายุ ${p.age} ปี คุณเล็งบ้านพ่อค้าใหญ่หลังหนึ่งไว้ ยามเพิ่งเปลี่ยนกะ`,
    options: p => [
      Object.assign(opt('ลงมือคืนนี้', q => { if (check(q, 'DEX', 'stealth', 13)) { q.wealth += 14; return 'คุณออกมาพร้อมถุงเงินเต็มมือ'; } startFight(q, 'hunter', { death: 'ถูกยามจับได้ระหว่างลักขโมย และถูกประหาร', onEnd: (z, r) => r === 'win' ? 'คุณสู้ฝ่าออกมาได้ แต่มือเปล่า' : r === 'fled' ? 'คุณหนีรอดไปได้อย่างหวุดหวิด' : r === 'lose' ? (z.cls = 4, ensureCareer(z), 'คุณถูกจับ และถูกขายเป็นทาสชดใช้') : '' }); return 'ยามคนหนึ่งเห็นคุณพอดี'; }), { chk: ['DEX', 'stealth'], fight: 'hunter' }),
      opt('รอโอกาสที่ดีกว่า', () => 'คุณรอไปอีกคืน'),
    ] },
  { id: 'guardDuty', repeat: 10, when: p => p.focus === 'work' && p.career === 'guard' && roll(.25),
    prompt: p => `อายุ ${p.age} ปี หัวหน้ายามสั่งให้คุณไล่คนใต้กำแพงที่มารวมตัวกันหน้าประตูชั้นใน`,
    options: p => [
      opt('ทำตามคำสั่ง', q => { q.wealth += 4; q.happy -= 6; return 'ฝูงชนแตกกระเจิง คุณเห็นหน้าคนที่เคยเป็นเพื่อนบ้านอยู่ในนั้น'; }),
      opt('ทำเป็นไม่เห็น', q => { if (roll(.4)) { setCareer(q, defaultCareer(q)); q.happy -= 3; return 'หัวหน้ายามไล่คุณออกจากงาน'; } q.happy += 4; q.flags.savedOther = true; return 'คุณหันหลังให้ประตู ฝูงชนสลายตัวไปเองตอนค่ำ'; }),
    ] },
  { id: 'smithCommission', repeat: 6, when: p => p.focus === 'work' && p.career === 'smith' && roll(.2),
    prompt: p => `อายุ ${p.age} ปี พ่อค้าอาวุธจากออเรลิสสั่งดาบห้าสิบเล่ม เพื่อส่งไปขายที่กรีฟ`,
    options: p => [
      opt('รับงาน', q => { q.wealth += 14; q.flags.weaponsmith = true; q.happy -= 2; return 'คุณตีดาบทั้งฤดู ไม่รู้ว่าดาบเหล่านั้นจะไปอยู่ในมือใคร'; }),
      opt('ปฏิเสธ', q => { q.happy += 2; return 'คุณตีจอบขายต่อไป รายได้น้อยกว่า แต่นอนหลับสบาย'; }),
    ] },
  { id: 'scribeSecret', when: p => p.focus === 'work' && p.career === 'scribe' && (p.careerRank || 0) >= 1 && roll(.08),
    prompt: () => 'ระหว่างคัดลอกเอกสารของศาสนจักร คุณเจอจดหมายโต้ตอบระหว่างศาสนจักรกับสภาผู้อาวุโสแห่งเซเรนธ์',
    options: p => [
      opt('อ่านให้จบ', q => { q.flags.ledger = true; q.know += 5; return 'จดหมายเขียนว่าเซเรนธ์จ่ายทองให้ศาสนจักรทุกปี เพื่อให้สอนว่าเถ้ามาจากคนธรรมดาที่ใช้เวท'; }),
      opt('ปิดแล้วทำเป็นไม่เห็น', () => 'คุณคัดลอกเอกสารฉบับถัดไปต่อ'),
    ] },
);
LEGENDS.push(
  { id: 'topcareer', n: 'จุดสูงสุดของอาชีพ', d: 'ได้เลื่อนขั้นถึงตำแหน่งสูงสุดของอาชีพ', c: p => p.flags.topCareer },
  { id: 'glassceiling', n: 'เพดานที่มองไม่เห็น', d: 'เก่งพอจะได้ตำแหน่งสูงสุด แต่ถูกกันไว้เพราะฐานะ', c: p => p.flags.blockedTop },
  { id: 'offland', n: 'พ้นจากที่ดิน', d: 'เกิดเป็นไพร่ แต่ได้ทำอาชีพที่ตัวเองเลือก', c: p => p.bornCls === 3 && p.career && !CBY[p.career].base },
);

// ---- auto play: occasionally pick a better career ----
const _simLife2 = simLife;
simLife = function (realm) {
  const p = makePerson(realm); p.auto = true;
  while (p.alive) {
    if (p.age >= 7 && Math.random() < .15) p.focus = pick(['work', 'work', 'train', 'love', 'rest']);
    if (p.age === 12 && !canArm(p)) setWeapon(p, pick(['sword', 'spear', 'axe', 'bow', 'dagger']));
    if (p.age >= 14 && Math.random() < .1) { const s = shopList(p).filter(x => !x.why); if (s.length) buy(p, pick(s).id); }
    if (p.age >= 14) { ensureCareer(p); if (Math.random() < .15) { const open = CAREERS.filter(c => !c.base && !careerMissing(p, c).length); if (open.length) takeCareer(p, pick(open).id); } }
    const ch = checkChoice(p);
    if (ch) { resolveChoice(p, autoChoose(p, ch)); if (!p.alive) { p.years.push({ h: p.happy }); break; } }
    const r = finishYear(p);
    if (r.fate) { resolveChoice(p, autoChoose(p, r.fate)); afterFate(p); }
  }
  return p;
};
// when the army takes you, the army is your job
(() => {
  const c = CHOICES.find(x => x.id === 'enlist'); if (!c) return;
  const orig = c.options;
  c.options = p => orig(p).map(o => o.label === 'สมัครเป็นทหาร' ? Object.assign({}, o, { act: q => { const t = o.act(q); setCareer(q, 'soldier'); return t; } }) : o);
})();
CAREERS.push({ id: 'soldier', base: true, n: ['พลทหาร', 'นายสิบ', 'นายร้อย'], pay: [4, 6, 10], phys: 1.2, d: 'ทหารประจำการ เลื่อนยศจากการชนะศึก',
  flav: ['คุณฝึกซ้อมในค่ายทหารทุกเช้า', 'กองของคุณถูกส่งไปเฝ้าด่านชายแดน', 'คุณได้รับเงินเดือนทหารครบทั้งปี'] });
CBY.soldier = CAREERS[CAREERS.length - 1];
// army rank drives soldier title
const _applyFocus2 = applyFocus;
applyFocus = function (p) { if (p.career === 'soldier') { p.careerRank = Math.min(2, p.flags.armyRank || 0); if (!p.flags.enlisted) setCareer(p, defaultCareer(p)); } return _applyFocus2(p); };

// ---- serfs and slaves can choose to try for freedom themselves ----
const bondPrice = p => p.cls === 4 ? 60 : 35;
function bondChoice(p) {
  const slave = p.cls === 4, price = bondPrice(p);
  return { id: 'bond', prompt: slave ? `อายุ ${p.age} ปี คุณนั่งมองประตูบ้านนายในคืนเดือนมืด` : `อายุ ${p.age} ปี คุณยืนอยู่ที่คันนาของเจ้าที่ดิน และคิดว่าจะอยู่ที่นี่ไปจนตายหรือไม่`,
    options: [
      opt(`ไถ่ตัว (ทรัพย์ ${price})`, q => { q.wealth -= price; q.cls = 2; q.flags.boughtFreedom = true; q.happy += 15; ensureCareer(q); return 'คุณถือหนังสือไถ่ตัวไว้แน่น ตั้งแต่วันนี้คุณเลือกงานเองได้แล้ว'; }, q => q.wealth >= price, `ต้องมีทรัพย์ ${price}`),
      Object.assign(opt('หนีไปตอนกลางคืน', q => {
        if (check(q, 'DEX', 'stealth', slave ? 15 : 13)) { q.cls = 2; q.flags.fugitive = true; q.wealth = Math.min(q.wealth, 5); q.happy += 12; ensureCareer(q); return 'คุณหนีพ้น ตอนนี้คุณเป็นอิสระ แต่ไม่มีอะไรติดตัวเลย และอาจมีคนตามล่า'; }
        if (slave && roll(.35)) { die(q, 'ถูกจับได้ระหว่างหลบหนี'); return 'สุนัขของนายตามกลิ่นจนเจอตัวคุณก่อนฟ้าสาง'; }
        q.health -= slave ? 20 : 12; q.happy -= 12; return slave ? 'คุณถูกจับได้ และถูกลงโทษอย่างหนัก' : 'คนของเจ้าที่ดินลากตัวคุณกลับมา และเพิ่มงานให้คุณอีกเท่าตัว';
      }), { chk: ['DEX', 'stealth'] }),
      opt('ยังไม่ใช่ตอนนี้', () => 'คุณกลับไปนอน พรุ่งนี้ยังต้องทำงานเหมือนเดิม'),
    ] };
}
const _applyFocus3 = applyFocus;
applyFocus = function (p) { if (p.age >= 14) ensureCareer(p); return _applyFocus3(p); };

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
  if (sk.x >= 100) { sk.x = 0; sk.r++; gainXP(p, 10); return `ทำงานมาหลายปี ฝีมือ${s.n}ของคุณเพิ่มขึ้นเป็นขั้น ${sk.r} โดยไม่ต้องไปเรียนที่ไหน`; }
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
  p.wealth += net;
  if (bad && p.wealth >= 0) return pick(['ปีนี้ข้าวยากหมากแพง ราคาข้าวขึ้นเกือบเท่าตัว เงินเก็บของคุณหายไปมาก', 'ภาษีปีนี้ขึ้นอีกแล้ว คนเก็บภาษีมาเคาะประตูถึงบ้าน']);
  if (p.wealth < 0) { p.wealth = 0; p.health -= 4; p.happy -= 4; p.flags.hungry = (p.flags.hungry || 0) + 1; return pick(['ปีนี้เงินไม่พอซื้ออาหาร หลายคืนคุณเข้านอนทั้งที่ท้องว่าง', 'ค่าเช่าที่ซุกหัวนอนค้างจนเจ้าของไล่คุณออก', 'คุณต้องขายของใช้ในบ้านเพื่อแลกข้าว']); }
  return null;
}
// 4) children of the poor work young, for a child's pay
const _applyFocus4 = applyFocus;
applyFocus = function (p) {
  if (p.age >= 7 && p.age < 14 && p.focus === 'work') {
    if (p.cls === 4) { p.health = clamp(p.health - 1.5); return roll(.3) ? 'เด็กทาสอย่างคุณถูกใช้ให้ขนน้ำและเลี้ยงสัตว์ตั้งแต่เช้าจนค่ำ' : null; }
    const g = (p.cls >= 2 ? 1.2 : .5) * (p.realm.wealth / 50 + .4) * (p.age >= 10 ? 1 : .5);
    p.wealth = clamp(p.wealth + g); p.health = clamp(p.health - (p.cls >= 2 ? 1 : .2));
    const sid = p.cls >= 2 ? (RURAL.includes(p.realm.id) ? 'survival' : 'craft') : 'trade';
    if (p.age >= 10 && access(p, sid).ok) { const sk = p.skills[sid]; sk.x += 8; if (sk.x >= 100) { sk.x = 0; sk.r++; return `คุณช่วยงานผู้ใหญ่มาหลายปี จน${SBY[sid].n}ขึ้นเป็นขั้น ${sk.r}`; } }
    return roll(.4) ? pick(p.cls >= 2 ? ['คุณช่วยพ่อแม่ทำงานตั้งแต่เช้ามืด แทนที่จะได้ไปเล่นกับเด็กคนอื่น', 'คุณรับจ้างไล่นกในนาของเพื่อนบ้าน ได้ข้าวกลับบ้านหนึ่งถุง', 'คุณแบกของที่ตลาดได้แค่ครึ่งหนึ่งของผู้ใหญ่ ค่าจ้างก็ได้แค่ครึ่งเดียว'] : ['คุณช่วยงานในร้านของครอบครัว นับเหรียญจนคล่อง', 'พ่อแม่ให้คุณนั่งดูผู้ใหญ่เจรจาการค้า']) : null;
  }
  let t = _applyFocus4(p);
  if (p.age >= 14 && p.focus === 'work') { const l = learnOnJob(p, 13); if (l) t = l; }
  const lv = payLiving(p); if (lv) t = t ? t + ' · ' + lv : lv;
  return t;
};
// 3) a trade needs an entry fee and someone to vouch for you; apprentices are taken young
const FEE = { scribe: 8, physician: 15, alchemist: 15, scholar: 6, priest: 6, envoy: 20, smith: 10, artisan: 8, healer: 6 };
const OFFICIAL = ['guard', 'scribe', 'priest', 'envoy', 'physician'];
const fee = (p, c) => FEE[c.id] ? Math.round(FEE[c.id] * (p.cls <= 1 ? .5 : 1)) : 0;
const _careerMissing = careerMissing;
careerMissing = function (p, c, rk = 0) {
  const out = _careerMissing(p, c, rk);
  if (c.base || rk > 0 || p.cls >= 3) return out;
  const f = fee(p, c); if (f && p.wealth < f) out.push(`ค่าเข้ากิลด์ ${f}`);
  if (p.flags.fugitive && OFFICIAL.includes(c.id)) out.push('ต้องมีเอกสารตัวตน แต่คุณเป็นคนหนี');
  if (p.age > 30) {
    const q = c.req && c.req.skills || {}, need = (q.all ? Object.entries(q.all) : (q.any || []).map(s => [s, q.r]));
    const ok = q.any ? q.any.some(s => rank(p, s) >= q.r + 2) : need.every(([s, r]) => rank(p, s) >= r + 2);
    if (!ok) out.push('อายุเกิน 30 ไม่มีใครรับเป็นลูกมือ ต้องเก่งกว่าที่กำหนด 2 ขั้น');
  }
  return out;
};
const _takeCareer = takeCareer;
takeCareer = function (p, id) { const c = CBY[id], f = fee(p, c); const ok = _takeCareer(p, id); if (ok && f) p.wealth = clamp(p.wealth - f); return ok; };
LEGENDS.push({ id: 'hungry', n: 'ปากกัดตีนถีบ', d: 'อดอยากเพราะเงินไม่พอกินมาแล้ว 5 ปี', c: p => (p.flags.hungry || 0) >= 5 });

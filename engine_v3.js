// ===== ENGINE (no DOM) =====
const R = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
function wpick(items, wf) {
  let t = 0; const ws = items.map(i => { const w = Math.max(0, wf(i)); t += w; return w; });
  let u = Math.random() * t;
  for (let i = 0; i < items.length; i++) { if ((u -= ws[i]) < 0) return items[i]; }
  return items[items.length - 1];
}

const CLASSES = ['ขุนนาง', 'พ่อค้า', 'สามัญชน', 'ไพร่ติดที่ดิน', 'ทาส'];
const CLASS_OF = ['ตระกูลขุนนาง', 'ครอบครัวพ่อค้า', 'ครอบครัวสามัญชน', 'ครอบครัวไพร่ติดที่ดิน', 'แม่ที่เป็นทาส'];

const REALMS = [
  { id: 'aurelis', lore: 'สร้างขึ้นหลังฝนเถ้าโดยผู้รอดชีวิตที่มีเสบียงมากพอจะจ้างคนสร้างกำแพง ศาสนจักรสุริยะปกครองด้วยคำสอนว่าดวงอาทิตย์เลือกคนที่อยู่ในกำแพง ออเรลิสซื้อแร่จากครากมอร์ แล้วขายอาวุธให้ทั้งสองฝ่ายในกรีฟ', name: 'จักรวรรดิออเรลิส', short: 'ออเรลิส', race: ['มนุษย์'], birth: 18,
    classW: [6, 18, 60, 14, 2], infant: .06, child: .004, adult: .005, agingStart: 52, agingScale: 9,
    war: .002, plague: .002, famine: .001, mine: 0, beast: 0, health: 72, wealth: 55, lit: .5,
    blurb: 'นครหลวงของศาสนจักรสุริยะ อยู่หลังกำแพงสามชั้น ยุ้งฉางเต็ม มีหมอหลวง และมีศาลศาสนาที่เผาผู้ใช้เวทนอกสังกัด',
    names: [['อเล', 'มา', 'ริ', 'เซ', 'ดริ', 'ออ', 'วิล', 'เอเลน', 'ทอ'], ['เรียน', 'ริค', 'นา', 'ซา', 'ลอส', 'เทีย', 'มอนด์']] },
  { id: 'undercity', lore: 'ลูกหลานของคนงานที่สร้างกำแพงเมื่อ ห.ถ. 41 สัญญากำแพงบอกว่าจะให้เข้าไปอยู่ข้างในเมื่องานเสร็จ งานไม่เคยเสร็จ เพราะออเรลิสต่อเติมกำแพงใหม่ทุกชั่วคน', name: 'ใต้กำแพงออเรลิส', short: 'ใต้กำแพง', race: ['มนุษย์', 'มนุษย์', 'ลูกครึ่งออร์ค', 'ลูกครึ่งเอลฟ์'], birth: 16,
    classW: [0, 2, 40, 38, 20], infant: .17, child: .007, adult: .008, agingStart: 42, agingScale: 9,
    war: .002, plague: .008, famine: .006, mine: 0, beast: 0, health: 48, wealth: 12, lit: .08,
    blurb: 'ชุมชนแออัดนอกกำแพงชั้นในของออเรลิส คนที่นี่มองเห็นยอดหอคอยทองได้ทุกวัน แต่ประตูชั้นในไม่เคยเปิดให้พวกเขา',
    names: [['อเล', 'มา', 'ริ', 'เซ', 'ดริ', 'กรอ', 'วิล', 'ฟิน'], ['เรียน', 'ริค', 'นา', 'ซา', 'ทัก', 'เทีย']] },
  { id: 'serenth', lore: 'เอลฟ์ยกนครขึ้นฟ้าเมื่อ ห.ถ. 0 และไม่เคยลงมาอีกเลย ตำราของที่นี่สอนว่าเถ้าคือฟ้าลงทัณฑ์โลกเบื้องล่าง ผู้อาวุโสหลายคนที่ร่วมพิธีในวันนั้นยังมีชีวิตอยู่ แต่ไม่เคยมีใครกล้าถามพวกเขา', name: 'นครลอยเซเรนธ์', short: 'เซเรนธ์', race: ['เอลฟ์'], birth: 2,
    classW: [20, 30, 50, 0, 0], infant: .008, child: .001, adult: .0015, agingStart: 190, agingScale: 16,
    war: .0004, plague: .0004, famine: 0, mine: 0, beast: 0, health: 88, wealth: 75, lit: .97,
    blurb: 'นครลอยของเอลฟ์ ลอยอยู่เหนือเมฆเถ้า อากาศสะอาด คนที่นี่อยู่ได้หลายร้อยปี และสภาผู้อาวุโสไม่รับผู้อพยพ',
    names: [['เอล', 'ไอ', 'ซิล', 'ลู', 'เธ', 'ไอเร', 'นิม'], ['วาน', 'ริล', 'ธีเอล', 'ลิธ', 'นาร์', 'เมีย']] },
  { id: 'kragmor', lore: 'คนแคระหลบลงใต้ภูเขาตอนฝนเถ้าตก จึงรอดมาได้มากกว่าใคร แร่ของครากมอร์กลายเป็นดาบในกรีฟ ทองของครากมอร์กลายเป็นเหรียญในออเรลิส บันทึกเก่าของพวกเขาเขียนว่าฟ้าเริ่มมืดในชั่วโมงเดียวกับที่เซเรนธ์ลอยขึ้น', name: 'แดนเหมืองครากมอร์', short: 'ครากมอร์', race: ['คนแคระ'], birth: 9,
    classW: [5, 15, 60, 15, 5], infant: .09, child: .006, adult: .006, agingStart: 72, agingScale: 11,
    war: .003, plague: .003, famine: .003, mine: .006, beast: 0, health: 66, wealth: 40, lit: .3,
    blurb: 'อาณาจักรเหมืองใต้ภูเขาของคนแคระ ร่ำรวยด้วยแร่เหล็กและทอง แต่ทุกปีมีอุโมงค์ถล่ม',
    names: [['ทอร', 'บรัม', 'กรุ', 'ดูร', 'ฮิล', 'บอร'], ['กริม', 'ดา', 'ริน', 'ฮิลด์', 'นาร์', 'ดัล']] },
  { id: 'grieve', lore: 'ก่อนเถ้า ที่นี่คือที่ราบทองที่เลี้ยงคนทั้งแผ่นดิน ตอนนี้เหลือหุบเขาที่ปลูกพืชได้ไม่กี่แห่ง มนุษย์กับออร์คแย่งกันมาแล้วสามครั้ง อาวุธของทั้งสองฝ่ายมาจากโรงตีเหล็กเดียวกันในออเรลิส', name: 'ที่ราบเถ้ากรีฟ', short: 'กรีฟ', race: ['มนุษย์', 'ออร์ค'], birth: 22,
    classW: [2, 5, 48, 30, 15], infant: .19, child: .008, adult: .007, agingStart: 40, agingScale: 9,
    war: .015, plague: .004, famine: .007, mine: 0, beast: .002, health: 52, wealth: 15, lit: .05,
    blurb: 'ที่ราบที่มนุษย์กับออร์คแย่งชิงกันมาสามชั่วคน กองทัพเดินผ่านหมู่บ้านบ่อยกว่าฝนตกเสียอีก',
    names: [['กรอ', 'ราก', 'วอร์', 'ซูล', 'มอร', 'เบร'], ['กาช', 'นา', 'รา', 'ทัก', 'เกน', 'ดา']] },
  { id: 'mulvane', lore: 'เถ้าที่ไหลลงแม่น้ำมาสะสมอยู่ที่นี่ ก็อบลินคือเจ้าของหนองดั้งเดิม มนุษย์ที่มาทีหลังคือคนที่ถูกขับออกจากที่อื่น ไข้เถ้าดำเกิดที่นี่ และนักเล่นแร่จากออเรลิสก็มาทดลองยาที่นี่', name: 'หนองพิษมูลเวน', short: 'มูลเวน', race: ['ก็อบลิน', 'มนุษย์'], birth: 20,
    classW: [1, 4, 45, 30, 20], infant: .22, child: .01, adult: .008, agingStart: 38, agingScale: 9,
    war: .003, plague: .009, famine: .006, mine: 0, beast: .004, health: 42, wealth: 10, lit: .04,
    blurb: 'หนองน้ำพิษที่ก็อบลินกับมนุษย์ยากจนอยู่ร่วมกัน ไข้เถ้าดำไม่เคยหายไปจากที่นี่',
    names: [['สนิก', 'มัด', 'ฟิน', 'กิบ', 'ลุ', 'ซอก'], ['เกิล', 'วิช', 'บี', 'นิค', 'ลา', 'ดิ']] },
  { id: 'dunes', lore: 'ความร้อนจากพิธียกนครตกลงที่นี่ ทรายจึงหลอมเป็นแก้ว ชนเผ่าเร่ร่อนรู้จักเส้นทางผ่านพายุแก้วดีกว่าใคร กองคาราวานทุกกองที่ไปออเรลิสต้องจ้างพวกเขา แต่ไม่มีใครในออเรลิสจำชื่อพวกเขาได้สักคน', name: 'ทะเลทรายแก้ว', short: 'ทะเลทรายแก้ว', race: ['ชาวทะเลทราย'], birth: 13,
    classW: [3, 12, 70, 10, 5], infant: .14, child: .006, adult: .007, agingStart: 44, agingScale: 9,
    war: .005, plague: .003, famine: .009, mine: 0, beast: .003, health: 58, wealth: 22, lit: .12,
    blurb: 'ชนเผ่าเร่ร่อนต้อนฝูงสัตว์ข้ามเนินทรายที่กลายเป็นแก้ว ปีไหนฝนไม่ตก ทั้งเผ่าก็อดอยาก',
    names: [['ซา', 'คาร', 'อมี', 'ฮา', 'ทีร', 'ไน'], ['ฮีร์', 'ริม', 'ลา', 'ซัน', 'ดี', 'ฟา']] },
];
const RBY = Object.fromEntries(REALMS.map(r => [r.id, r]));

const TRAITS = [
  { id: 'tough', n: 'แข็งแกร่ง', d: 'ป่วยยาก ฟื้นตัวไว' },
  { id: 'sickly', n: 'ขี้โรค', d: 'ร่างกายอ่อนแอมาตั้งแต่เกิด' },
  { id: 'clever', n: 'หัวไว', d: 'เรียนรู้เร็วกว่าคนอื่น' },
  { id: 'cunning', n: 'เจ้าเล่ห์', d: 'โกหกเก่ง หนีเก่ง' },
  { id: 'brave', n: 'ใจกล้า', d: 'ไม่ถอยเมื่อต้องสู้' },
  { id: 'kind', n: 'ใจบุญ', d: 'มีความสุขเวลาได้ช่วยคนอื่น' },
  { id: 'lucky', n: 'ดวงแข็ง', d: 'มักรอดจากเรื่องร้ายได้แบบเฉียดฉิว' },
  { id: 'bitter', n: 'ขมขื่น', d: 'มองโลกในแง่ร้าย ความสุขต่ำกว่าปกติ' },
];
const TBY = Object.fromEntries(TRAITS.map(t => [t.id, t]));
const T = (p, id) => p.traits.includes(id);
const nameIn = r => pick(r.names[0]) + pick(r.names[1]);
const has = (p, ...ids) => ids.includes(p.realm.id);
function move(p, r) { if (p.realm === r) return; p.realm = r; p.places.push({ id: r.id, age: p.age }); }
const yearOf = p => p.birthYear + p.age;

// ---------- world eras (ห.ถ. = ปีหลังเถ้า) ----------
const NOW = 312;
const ERAS = [
  { id: 'war4', from: 318, to: 326, n: 'สงครามกรีฟครั้งที่สี่', t: 'ข่าวแพร่ไปทุกแดนว่ามนุษย์กับออร์คประกาศสงครามกันเป็นครั้งที่สี่ ออเรลิสเปิดโรงตีอาวุธเพิ่มอีกสามแห่ง', mod: { grieve: { war: 2.5 }, dunes: { war: 1.5 } } },
  { id: 'fever2', from: 341, to: 345, n: 'ไข้เถ้าดำระบาดใหญ่ครั้งที่สอง', t: 'ไข้เถ้าดำระบาดใหญ่ ออเรลิสปิดประตูชั้นในทุกบาน ปล่อยให้คนข้างนอกเอาตัวรอดกันเอง', mod: { mulvane: { plague: 3 }, undercity: { plague: 3 }, grieve: { plague: 2 }, dunes: { plague: 1.5 } } },
  { id: 'ashfall2', from: 360, to: 364, n: 'ฝนเถ้าครั้งที่สอง', t: 'ฟ้ามืดลงอีกครั้ง เถ้าตกลงมาเหมือนเมื่อสามร้อยกว่าปีก่อน ขณะที่เหนือเมฆขึ้นไป เซเรนธ์ยังมีแดดส่องตามปกติ', mod: { aurelis: { famine: 3 }, undercity: { famine: 2.5 }, kragmor: { famine: 2 }, grieve: { famine: 2.5 }, mulvane: { famine: 2.5 }, dunes: { famine: 2.5 } } },
  { id: 'sinking', from: 395, to: 99999, n: 'เซเรนธ์ลดระดับ', t: 'นครลอยเซเรนธ์เริ่มลดระดับลงทีละน้อย เพราะเส้นใยเวทที่พยุงเมืองไว้เริ่มขาด', mod: { serenth: { adult: 2.5 } } },
];
function eraMod(p, kind) {
  const y = yearOf(p); let m = 1;
  for (const e of ERAS) if (y >= e.from && y <= e.to && e.mod[p.realm.id] && e.mod[p.realm.id][kind]) m *= e.mod[p.realm.id][kind];
  return m;
}
function erasLived(p) { const a = p.birthYear, b = p.birthYear + p.age; return ERAS.filter(e => e.from <= b && e.to >= a); }

function rollTraits() {
  const a = pick(TRAITS).id; let b;
  do { b = pick(TRAITS).id; } while (b === a || (a === 'tough' && b === 'sickly') || (a === 'sickly' && b === 'tough'));
  return [a, b];
}

function makePerson(realm, parent) {
  const r = parent ? parent.realm : (realm || wpick(REALMS, x => x.birth));
  const cls = parent ? parent.cls : wpick([0, 1, 2, 3, 4], i => r.classW[i]);
  const traits = rollTraits();
  const p = {
    name: parent ? parent.heirName : nameIn(r), sex: Math.random() < .5 ? 'ญ' : 'ช', realm: r, born: r, cls, bornCls: cls,
    race: parent ? parent.race : pick(r.race), age: 0, alive: true, traits, gen: parent ? parent.gen + 1 : 1,
    health: clamp(r.health + R(-10, 10) + (2 - cls) * 4),
    wealth: parent ? clamp(parent.wealth * .6 + r.wealth * .3 + R(-4, 4)) : clamp(r.wealth + [35, 18, 0, -8, -12][cls] + R(-5, 5)),
    know: 0, happy: clamp(55 + (2 - cls) * 4 + R(-5, 5)),
    gifted: Math.random() < .05, married: false, kidNames: [], lostKids: 0,
    kin: { mother: parent && parent.sex === 'ญ' ? parent.name : nameIn(r), father: parent && parent.sex === 'ช' ? parent.name : nameIn(r), spouse: null },
    ancestor: parent ? (parent.ancestor || parent.name) : null,
    birthYear: parent ? parent.birthYear + (parent.firstKidAge ?? Math.max(18, parent.age - 10)) : NOW,
    places: [{ id: r.id, age: 0 }],
    focus: 'work', flags: { reprieves: 0 }, done: {}, years: [], cause: null,
  };
  if (T(p, 'tough')) p.health = clamp(p.health + 12);
  if (T(p, 'sickly')) p.health = clamp(p.health - 14);
  if (T(p, 'bitter')) p.happy = clamp(p.happy - 10);
  return p;
}

// ---------- hazards ----------
function hazards(p) {
  const r = p.realm, a = p.age, f = p.flags;
  const cm = [.6, .8, 1, 1.1, 1.25][p.cls];
  const hm = .6 + (100 - p.health) / 100 * .8;
  const tm = T(p, 'tough') ? .8 : T(p, 'sickly') ? 1.25 : 1;
  const H = [];
  const base = a === 0 ? r.infant : a < 5 ? r.child * 2 : a < 15 ? r.child : r.adult;
  H.push([a === 0 ? 'เสียชีวิตด้วยไข้ก่อนอายุครบหนึ่งขวบ' : a < 5 ? 'เสียชีวิตด้วยโรคตั้งแต่ยังเด็ก' : 'ป่วยหนักจนเสียชีวิต', base * cm * hm * tm * (a >= 15 ? eraMod(p, 'adult') : 1), 'ill']);
  if (a > r.agingStart) H.push(['จากไปอย่างสงบด้วยวัยชรา', .008 * Math.exp((a - r.agingStart) / r.agingScale), 'old']);
  if (a >= 16 && a <= 55) {
    let w = r.war * (p.cls === 0 ? .4 : 1) * (f.knight ? 1.6 : 1);
    if (f.soldier > 0) w += .07;
    if (f.warmage) w += .025;
    H.push(['เสียชีวิตในสงครามชายแดน', w * eraMod(p, 'war'), 'war']);
  }
  H.push(['เสียชีวิตด้วยไข้เถ้าดำ', r.plague * (1.2 - p.wealth / 100 * .8) * (f.fled ? .3 : 1) * (f.immune ? .2 : 1) * tm * eraMod(p, 'plague'), 'plague']);
  H.push(['อดอาหารจนเสียชีวิตในปีที่ข้าวยากหมากแพง', r.famine * (1 - p.wealth / 100) * (a < 5 ? 1.5 : 1) * eraMod(p, 'famine'), 'famine']);
  if (r.mine && a >= 12 && p.cls >= 2) H.push(['เสียชีวิตเมื่ออุโมงค์เหมืองถล่ม', r.mine * (f.safeMine ? .5 : 1), 'mine']);
  if (r.beast) H.push(['ถูกสัตว์ร้ายทำร้ายจนเสียชีวิต', r.beast, 'beast']);
  if (f.hiddenMage) H.push(['ถูกศาลศาสนาตัดสินประหาร ฐานใช้เวทนอกศาสนจักร', .03, 'burn']);
  return H;
}
function die(p, cause) { p.alive = false; p.cause = cause; }
function rollDeath(p) {
  const H = hazards(p);
  const sum = Math.min(H.reduce((s, h) => s + h[1], 0), .97);
  if (Math.random() >= sum) return null;
  const h = wpick(H, x => x[1]);
  const canFate = h[2] !== 'old' && p.age >= 12 && p.age - (p.flags.lastFate ?? -99) >= 4 && Math.random() < .75;
  if (canFate) { p.flags.lastFate = p.age; return { fate: buildFate(p, h[0], h[2]) }; }
  die(p, h[0]); return { died: true };
}

// ---------- near-death scenes ----------
const opt = (label, act, need, needText) => ({ label, act, need, needText });
const luck = p => T(p, 'lucky') ? .12 : 0;
function saved(p, chance) { if (Math.random() < chance + luck(p)) { p.flags.reprieves++; return true; } return false; }
const FATE_TEXT = {
  ill: 'คุณป่วยหนักจนลุกจากเตียงไม่ไหว',
  plague: 'จุดดำของไข้เถ้าดำเริ่มขึ้นตามแขนของคุณ',
  war: 'แนวรบแตก ทัพของคุณกำลังถูกล้อม',
  famine: 'ไม่มีอะไรกินมาหลายสัปดาห์ ร่างกายเริ่มไม่ไหว',
  mine: 'อุโมงค์ถล่มลงมา คุณติดอยู่ในความมืดใต้ภูเขา',
  beast: 'มีบางอย่างพุ่งออกมาจากความมืดตรงหน้า',
  burn: 'ศาลศาสนาจับได้ว่าคุณใช้เวท และตัดสินให้เผา',
};
function buildFate(p, cause, kind) {
  const fail = t => { die(p, cause); return t; };
  let options = [];
  if (kind === 'ill' || kind === 'plague') options = [
    opt('จ้างหมอหลวงมารักษา', p => { p.wealth -= 22; return saved(p, .85) ? 'หมอหลวงรักษาคุณจนหาย ค่ารักษาครั้งนี้เท่ากับที่คนทั่วไปหาได้ในหลายปี' : fail('แม้แต่หมอหลวงก็ช่วยไม่ได้'); }, p => p.wealth >= 40, 'ต้องมีทรัพย์ 40 ขึ้นไป'),
    opt('ต้มยาตามตำราที่เคยอ่าน', p => saved(p, .4 + p.know / 250) ? 'ยาขมจนน้ำตาไหล แต่คุณก็รอด' : fail('ตำราอาจผิด หรือคุณอาจอ่านผิดเอง'), p => p.know >= 30, 'ต้องมีความรู้ 30 ขึ้นไป'),
    opt('ภาวนาและรอ', p => { p.health -= 15; return saved(p, .25 + (T(p, 'tough') ? .2 : 0)) ? 'ไข้ลดลงในคืนที่เจ็ด โดยที่คุณเองก็ไม่รู้ว่าเพราะอะไร' : fail('ไม่มีใครตอบคำภาวนาของคุณ'); }),
  ];
  else if (kind === 'war') options = [
    opt('ฝ่าแนวรบหนีกลับบ้าน', p => { p.health -= 15; return saved(p, .4 + (T(p, 'brave') ? .15 : 0) + (T(p, 'cunning') ? .1 : 0)) ? 'คุณเดินทางตอนกลางคืนอยู่สิบวัน จนกลับถึงบ้าน' : fail('คุณไปไม่ถึงบ้าน'); }),
    opt('ยอมจำนนเป็นเชลย', p => { if (saved(p, .75)) { p.cls = 4; p.flags.captive = true; p.happy -= 15; return 'คุณรอด แต่ตอนนี้คุณเป็นทาสของอีกฝ่าย'; } return fail('ฝ่ายตรงข้ามไม่จับเชลยในวันนั้น'); }),
    ...(T(p, 'brave') ? [opt('[ใจกล้า] สู้จนถึงที่สุด', p => { if (saved(p, .38)) { p.wealth += 15; p.happy += 10; p.flags.hero = true; return 'พอฝุ่นจางลง คุณยังยืนอยู่ ผู้คนเล่าเรื่องนี้กันไปอีกหลายปี'; } return fail('คุณสู้จนลมหายใจสุดท้าย'); })] : []),
  ];
  else if (kind === 'famine') options = [
    ...(p.cls < 4 ? [opt(p.cls < 3 ? 'ขายตัวเป็นไพร่แลกข้าว' : 'ขายตัวเป็นทาสแลกข้าว', p => { p.cls = p.cls < 3 ? 3 : 4; p.happy -= 12; p.flags.soldSelf = true; p.flags.reprieves++; return 'คุณรอดผ่านฤดูนั้นมาได้ แต่ต้องแลกด้วยอิสรภาพ'; })] : []),
    opt('ขโมยข้าวจากยุ้งฉางเจ้าที่ดิน', p => { if (saved(p, .5 + (T(p, 'cunning') ? .2 : 0))) { p.health += 5; return 'คืนนั้นคุณแบกข้าวออกมาได้สองกระสอบ'; } die(p, 'ถูกจับได้ขณะขโมยข้าว และถูกลงโทษจนเสียชีวิต'); return 'ยามเห็นคุณเสียก่อน'; }),
    opt('ใช้เงินที่เหลือทั้งหมดซื้ออาหาร', p => { p.wealth = 4; p.flags.reprieves++; return 'คุณรอด แต่ไม่เหลืออะไรเลย'; }, p => p.wealth >= 25, 'ต้องมีทรัพย์ 25 ขึ้นไป'),
  ];
  else if (kind === 'mine') options = [
    opt('ขุดทางออกเอง', p => { p.health -= 20; return saved(p, .35 + (T(p, 'tough') ? .2 : 0)) ? 'นิ้วของคุณแตกทุกนิ้ว แต่ในที่สุดคุณก็เห็นแสงสว่าง' : fail('หินหนักเกินไป'); }),
    opt('รอคนมาช่วย', p => saved(p, p.cls <= 1 ? .85 : .2) ? (p.cls <= 1 ? 'ทีมกู้ภัยมาถึงภายในวันเดียว เพราะครอบครัวคุณจ่ายเงินให้มาช่วยคุณก่อน' : 'ทีมกู้ภัยมาถึงในวันที่สี่ โชคดีที่คุณยังหายใจอยู่') : (die(p, 'ติดอยู่ใต้อุโมงค์ที่ถล่ม และความช่วยเหลือมาไม่ถึง'), 'ทีมกู้ภัยขุดหาคนจากตระกูลที่จ่ายเงินก่อน และไปไม่ถึงตัวคุณ')),
  ];
  else if (kind === 'beast') options = [
    opt('สู้', p => { p.health -= 15; return saved(p, .4 + (T(p, 'brave') ? .2 : 0)) ? 'มันถอยกลับเข้าไปในความมืด ทิ้งแผลเป็นยาวไว้ที่แขนคุณ' : fail('มันแข็งแรงกว่าคุณ'); }),
    opt('วิ่งหนี', p => { p.health -= 5; return saved(p, .5) ? 'คุณวิ่งไม่หยุดจนถึงหมู่บ้าน โดยไม่หันกลับไปมองเลย' : fail('มันเร็วกว่าคุณ'); }),
  ];
  else if (kind === 'burn') options = [
    opt('ใช้เวทหนีออกจากคุก', p => { if (saved(p, .35)) { p.flags.hiddenMage = false; p.flags.fugitive = true; p.wealth = 3; move(p, RBY.grieve); return 'ประตูเหล็กละลายลง คุณหนีออกจากออเรลิสไปที่ราบเถ้าโดยไม่มีอะไรติดตัว'; } return fail('ผนังคุกถูกจารึกอักขระกันเวท'); }),
    opt('สารภาพและยอมเป็นของศาสนจักร', p => { if (saved(p, .6)) { p.flags.hiddenMage = false; p.flags.churchMage = true; p.happy -= 15; return 'ศาสนจักรไว้ชีวิตคุณ เพราะคุณมีประโยชน์กับพวกเขา'; } return fail('ศาลศาสนาต้องการเชือดไก่ให้ลิงดู'); }),
    ...(T(p, 'cunning') ? [opt('[เจ้าเล่ห์] ชี้ตัวคนอื่นแทน', p => { if (saved(p, .7)) { p.flags.hiddenMage = false; p.flags.betrayer = true; p.happy -= 20; return 'หญิงชราคนหนึ่งถูกเผาแทนคุณ ขณะที่คุณยืนดูอยู่ในฝูงชน'; } return fail('ไม่มีใครเชื่อคำของคุณ'); })] : []),
  ];
  return { id: 'fate', fatal: true, prompt: `ความตายมาเยือน: ${FATE_TEXT[kind]}`, options };
}

// ---------- drift & focus ----------
function drift(p) {
  const r = p.realm;
  const ageDrop = p.age > r.agingStart ? (p.age - r.agingStart) * 1.3 : 0;
  const tH = r.health + (2 - p.cls) * 3 - ageDrop + (T(p, 'tough') ? 8 : 0) - (T(p, 'sickly') ? 10 : 0);
  p.health = clamp(p.health + (tH - p.health) * .12 + R(-2, 2));
  const tP = 40 + p.wealth * .3 + (p.married ? 8 : 0) - (p.cls === 4 ? 15 : 0) + Math.min(p.kidNames.length, 3) * 2 - (T(p, 'bitter') ? 10 : 0);
  p.happy = clamp(p.happy + (tP - p.happy) * .18 + R(-3, 3));
  if (p.flags.debt) p.wealth = clamp(p.wealth - 3);
  if (p.flags.soldier > 0) p.flags.soldier--;
}
function applyFocus(p) {
  if (p.age < 7) return null;
  const r = p.realm; let t = null;
  switch (p.focus) {
    case 'work':
      if (p.cls === 4) { p.health = clamp(p.health - 2); p.happy = clamp(p.happy - 2); if (Math.random() < .2) t = 'คุณทำงานทั้งปี แต่ทาสไม่ได้ค่าแรง ทุกอย่างเป็นของนาย'; }
      else {
        const g = (2 + Math.random() * 3) * (1 + p.know / 120) * (r.wealth / 50 + .4) * (p.cls === 3 ? .5 : 1);
        p.wealth = clamp(p.wealth + g); p.health = clamp(p.health - (p.cls >= 2 ? 1.5 : .4));
        if (p.cls === 3 && Math.random() < .15) t = 'ผลผลิตครึ่งหนึ่งต้องส่งให้เจ้าที่ดินเหมือนทุกปี';
      }
      break;
    case 'study': {
      const access = p.cls <= 1 || p.flags.literate || (p.cls < 4 && Math.random() < r.lit);
      if (access) { p.know = clamp(p.know + (4 + R(0, 2)) * (T(p, 'clever') ? 1.6 : 1)); p.flags.literate = true; }
      else { p.know = clamp(p.know + .3); if (Math.random() < .25) t = p.cls === 4 ? 'ทาสถูกห้ามแตะหนังสือ คุณแอบจำตัวอักษรจากป้ายร้านค้าได้แค่สองสามตัว' : 'คุณอยากเรียน แต่แถวนี้ไม่มีใครสอนหนังสือ'; }
      break; }
    case 'love': p.happy = clamp(p.happy + 3); p.wealth = clamp(p.wealth - .5); break;
    case 'rest':
      if (p.cls === 4) { p.health = clamp(p.health - 1); if (Math.random() < .25) t = 'คุณขอพัก แต่นายไม่ยอม'; }
      else { p.health = clamp(p.health + 3); p.wealth = clamp(p.wealth - 1.5); }
      break;
  }
  return t;
}

// ---------- random events ----------
const parentName = p => Math.random() < .5 ? `${p.kin.mother} แม่ของคุณ` : `${p.kin.father} พ่อของคุณ`;
const EVENTS = [
  { w: 3, c: p => !has(p, 'serenth', 'undercity') && p.age > 6, t: () => 'ปีนี้เก็บเกี่ยวได้ดี ทุกบ้านมีข้าวกินอิ่ม', f: p => { p.happy += 5; p.wealth += 3; } },
  { w: 3, c: p => p.cls >= 2 && p.age > 14, t: () => 'เจ้าที่ดินขึ้นภาษีเป็นครั้งที่สามในปีนี้', f: p => { p.wealth -= 6; p.happy -= 4; } },
  { w: 2, c: p => has(p, 'aurelis'), t: () => 'เทศกาลสุริยะ ทั้งเมืองมีงานเลี้ยงเจ็ดวัน', f: p => { p.happy += 6; } },
  { w: 3, c: p => has(p, 'undercity') && p.age > 5, t: () => 'ยามปิดประตูชั้นในเร็วขึ้น คนใต้กำแพงที่ไปทำงานในเมืองกลับบ้านไม่ทัน ต้องนอนข้างถนน', f: p => { p.happy -= 4; p.health -= 2; } },
  { w: 2, c: p => has(p, 'undercity') && p.age > 8, t: () => 'คุณยืนดูขบวนแห่ของขุนนางเคลื่อนผ่านถนนที่คนแถวบ้านคุณเป็นคนปูเอง', f: p => { p.happy -= 2; } },
  { w: 3, c: p => has(p, 'serenth') && p.age > 15, t: () => 'สภาผู้อาวุโสไล่ผู้ลี้ภัยกลับจากท่าเรือลอยฟ้าอีกครั้ง คุณมองเห็นพวกเขาจากระเบียงบ้าน', f: p => { p.know += 1; } },
  { w: 3, c: p => has(p, 'serenth') && p.age > 10, t: () => 'คุณเรียนภาษาโบราณที่ไม่มีใครพูดแล้วได้อีกหนึ่งภาษา', f: p => { p.know += 4; } },
  { w: 2, c: p => has(p, 'serenth') && p.married && p.age > 60 && p.flags.humanSpouse, t: p => `${p.kin.spouse} คู่ชีวิตชาวมนุษย์ของคุณแก่ลงทุกปี ขณะที่คุณยังดูเหมือนเดิม`, f: p => { p.happy -= 6; } },
  { w: 3, c: p => has(p, 'kragmor') && p.age > 14, t: () => 'คนงานขุดพบสายแร่ทองเส้นใหม่ใต้ภูเขา', f: p => { p.wealth += p.cls <= 1 ? 10 : 3; p.happy += 2; } },
  { w: 3, c: p => has(p, 'grieve') && p.age > 3, t: () => 'กองทัพเดินผ่านหมู่บ้าน และยึดเสบียงไปครึ่งหนึ่ง', f: p => { p.wealth -= 8; p.health -= 4; p.happy -= 5; } },
  { w: 2, c: p => has(p, 'grieve') && p.age > 10, t: () => 'สองฝ่ายพักรบกันหนึ่งฤดู ผู้คนกล้าออกไปไถนาไกลจากบ้านอีกครั้ง', f: p => { p.happy += 5; p.wealth += 3; } },
  { w: 3, c: p => has(p, 'mulvane') && p.age > 3, t: () => 'น้ำในหนองขึ้นสูง บ้านใต้ถุนสูงของคุณพังไปครึ่งหลัง', f: p => { p.wealth -= 5; p.health -= 3; } },
  { w: 2, c: p => has(p, 'mulvane') && p.age > 8, t: () => 'หมอผีในหนองสอนคุณว่าใบไม้ชนิดไหนกินได้ ชนิดไหนมีพิษ', f: p => { p.know += 3; p.health += 2; } },
  { w: 3, c: p => has(p, 'dunes') && p.age > 3, t: () => 'พายุทรายแก้วพัดผ่าน สัตว์ในฝูงตายไปหลายตัว', f: p => { p.wealth -= 6; p.happy -= 3; } },
  { w: 2, c: p => has(p, 'dunes') && p.age > 6, t: () => 'ฝนตกในทะเลทรายเป็นครั้งแรกในรอบสี่ปี ทั้งเผ่าออกมาเต้นรำกลางสายฝน', f: p => { p.happy += 7; p.wealth += 2; } },
  { w: 2, c: p => p.age > 3, t: p => p.wealth > 55 ? 'คุณป่วยหนัก แต่หมอประจำตระกูลรักษาจนหาย' : 'คุณป่วยหนัก ไม่มีหมอสักคน แต่ก็รอดมาได้เพราะโชคล้วนๆ', f: p => { p.health -= p.wealth > 55 ? 4 : 12; } },
  { w: 3, c: p => p.age > 5, t: () => 'คุณได้เพื่อนสนิทคนใหม่', f: p => { p.happy += 5; } },
  { w: 2, c: p => p.age >= 8 && p.age <= 45 && !p.done.parent, t: p => `${parentName(p)}จากไป`, f: p => { p.happy -= 10; p.done.parent = 1; p.wealth += p.cls <= 1 ? 8 : 0; } },
  { w: 1, c: p => p.age > 10, t: () => 'คุณเก็บถุงเงินที่ใครสักคนทำตกไว้ได้', f: p => { p.wealth += 4; } },
  { w: 2, c: p => p.cls === 0 && p.age > 12, t: () => 'คุณได้รับเชิญไปงานเลี้ยงในราชสำนัก', f: p => { p.happy += 5; p.wealth -= 2; } },
  { w: 3, c: p => p.cls === 4 && p.age > 6, t: () => 'คุณถูกขายต่อให้นายคนใหม่ และต้องแยกจากทุกคนที่รู้จัก', f: p => { p.happy -= 10; } },
  { w: 3, c: p => p.cls === 3 && p.age > 14, t: () => 'เจ้าที่ดินเกณฑ์แรงงานไปสร้างป้อม ทั้งฤดูคุณไม่ได้ทำนาของตัวเองเลย', f: p => { p.health -= 5; p.wealth -= 3; } },
  { w: 2, c: p => has(p, 'grieve', 'dunes') && p.age > 12, t: () => 'คุณถูกโจรปล้นระหว่างทางกลับบ้าน', f: p => { p.wealth -= 5; p.happy -= 3; } },
  { w: 1, c: p => p.cls >= 2 && p.cls < 4 && p.know < 15 && p.age > 8 && !p.done.monk, t: () => 'พระธุดงค์รูปหนึ่งสอนให้คุณอ่านออกเขียนได้', f: p => { p.know += 10; p.flags.literate = true; p.done.monk = 1; } },
  { w: 2, c: p => p.kidNames.length > 0, t: p => `${pick(p.kidNames)} ลูกของคุณ${pick(['พูดคำแรกได้แล้ว', 'วิ่งมากอดคุณตอนกลับถึงบ้าน', 'ร้องเพลงที่คุณเคยร้องกล่อมได้'])}`, f: p => { p.happy += 5; } },
  { w: 2, c: p => p.kidNames.length > 0 && Math.random() < p.realm.infant * 2.5, t: p => { const n = p.kidNames.splice(Math.floor(Math.random() * p.kidNames.length), 1)[0]; return `${n} ลูกของคุณจากไปก่อนวัยอันควร`; }, f: p => { p.happy -= 15; p.lostKids++; } },
  { w: 2, c: p => !has(p, 'serenth') && p.age > 4, t: () => 'ปีนี้แห้งแล้ง ราคาอาหารแพงขึ้นสามเท่า', f: p => { p.health -= p.wealth > 50 ? 1 : 6; p.happy -= 4; p.wealth -= 3; } },
  { w: 3, c: p => has(p, 'aurelis', 'undercity') && p.flags.hiddenMage, t: () => 'ศาลศาสนาเผาหญิงชราคนหนึ่งกลางตลาดในข้อหาใช้เวท คุณซ่อนมือที่สั่นไว้ในเสื้อ', f: p => { p.happy -= 8; } },
  { w: 1, c: p => p.age > 2, t: () => 'ดาวหางสีเถ้าพาดผ่านท้องฟ้า ผู้คนพูดกันว่าเป็นลางร้าย', f: p => { p.know += 1; } },
  { w: 2, c: p => p.cls === 1 && p.age > 16, t: () => 'ปีนี้ค้าขายดี กองคาราวานกลับมาครบทุกขบวน', f: p => { p.wealth += 8; p.happy += 3; } },
  { w: 2, c: p => p.age > 16 && p.wealth > 20, t: () => 'คนที่คุณไว้ใจโกงเงินคุณแล้วหนีไป', f: p => { p.wealth -= 7; p.happy -= 4; } },
  { w: 2, c: p => p.flags.churchMage, t: () => 'ศาสนจักรส่งคุณไปเป็นนักเวทประจำกองทัพ โดยไม่ถามความเห็นสักคำ', f: p => { p.happy -= 5; p.flags.soldier = 2; } },
  { w: 2, c: p => p.flags.healer, t: () => 'คุณใช้เวทรักษาเด็กในหมู่บ้านจนหายไข้', f: p => { p.happy += 6; } },
  { w: 2, c: p => p.flags.captive && p.age > 20, t: () => 'ตอนนี้คุณพูดภาษาของคนที่จับคุณมาได้คล่องกว่าภาษาของตัวเองแล้ว', f: p => { p.happy -= 3; p.know += 2; } },
  { w: 2, c: p => p.flags.fugitive, t: () => 'มีใบประกาศจับติดอยู่ที่ประตูเมือง หน้าตาในภาพคล้ายคุณมาก', f: p => { p.happy -= 5; } },
  { w: 2, c: p => p.flags.hero, t: () => 'เด็กๆ ในหมู่บ้านแย่งกันเล่นเป็นคุณเวลาเล่นสงคราม', f: p => { p.happy += 4; } },
  { w: 2, c: p => p.married && p.kin.spouse, t: p => `${p.kin.spouse}${pick(['ทำอาหารจานโปรดของคุณรอไว้', 'ทะเลาะกับคุณเรื่องเงินจนดึก', 'นั่งดูดาวกับคุณจนฟ้าสาง'])}`, f: p => { p.happy += 2; } },
];
function randomEvent(p) {
  if (Math.random() > .5) return null;
  const pool = EVENTS.filter(e => e.c(p));
  if (!pool.length) return null;
  const e = wpick(pool, x => x.w);
  const t = e.t(p); e.f(p); norm(p); return t;
}
function norm(p) { p.health = clamp(p.health); p.wealth = clamp(p.wealth); p.know = clamp(p.know); p.happy = clamp(p.happy); }

// ---------- choices ----------
const roll = x => Math.random() < x;
const CHOICES = [
  { id: 'path', when: p => p.age === 13, prompt: p => p.cls === 4 ? 'อายุ 13 ปี เด็กคนอื่นเริ่มเลือกเส้นทางชีวิตของตัวเอง แต่ทาสไม่มีให้เลือก มีแค่ทำงานต่อไป หรือหนี' : 'อายุ 13 ปี ถึงเวลาเลือกเส้นทางชีวิตของตัวเอง',
    options: p => {
      if (p.cls === 0) return [
        opt('เข้าหอคัมภีร์', p => { p.know += 18; p.flags.literate = true; return 'คุณใช้เวลาหลายปีอยู่กับตำราที่คนส่วนใหญ่ในแผ่นดินไม่มีวันได้เห็น'; }),
        opt('ฝึกเป็นอัศวิน', p => { p.health += 10; p.wealth += 4; p.flags.knight = true; return 'คุณได้ดาบเล่มแรก และมีชื่ออยู่ในบัญชีทหารของตระกูล'; }),
        opt('ใช้ชีวิตในราชสำนัก', p => { p.happy += 10; return 'ชีวิตในวังมีแต่งานเลี้ยงกับการเมือง คุณเรียนรู้ว่าควรยิ้มให้ใคร'; }),
      ];
      if (p.cls === 1) return [
        opt('สืบทอดกิจการครอบครัว', p => { p.wealth += 12; return 'คุณเริ่มนั่งทำบัญชีข้างพ่อแม่'; }),
        opt('ฝากตัวกับนักเล่นแร่', p => { p.know += 14; p.flags.literate = true; return 'ห้องทดลองเหม็นกลิ่นกำมะถัน แต่คุณได้อ่านหนังสือทุกวัน'; }),
        opt('ออกเดินทางกับกองคาราวาน', p => { p.happy += 6; p.wealth += 6; if (roll(.08)) { die(p, 'ถูกสัตว์ร้ายทำร้ายจนเสียชีวิตระหว่างเดินทาง'); return 'กองคาราวานถูกโจมตีระหว่างทาง'; } return 'คุณได้เห็นมาแล้วทุกแดนตั้งแต่ยังไม่ถึงยี่สิบ'; }),
      ];
      if (p.cls === 4) return [
        opt('ก้มหน้าทำงานต่อไป', p => { p.health -= 3; return 'คุณก้มหน้าทำงานต่อไปเหมือนทุกวัน'; }),
        opt('วางแผนหลบหนี', p => {
          if (roll(.35 + (T(p, 'cunning') ? .2 : 0))) { p.cls = 2; p.flags.fugitive = true; p.wealth = 5; p.happy += 15; return 'คุณหนีพ้นในคืนเดือนมืด ตอนนี้คุณเป็นอิสระแล้ว แต่ไม่มีอะไรติดตัวเลย'; }
          if (roll(.4)) { die(p, 'ถูกจับได้ระหว่างหลบหนี'); return 'สุนัขของนายตามกลิ่นจนเจอตัวคุณก่อนฟ้าสาง'; }
          p.health -= 20; p.happy -= 15; return 'คุณถูกจับได้ และถูกลงโทษอย่างหนัก';
        }),
      ];
      return [
        opt('ทำงานกับครอบครัวต่อ', p => { p.wealth += 3; p.happy += 2; return 'คุณรับช่วงงานที่พ่อแม่ทำมาทั้งชีวิตต่อ'; }),
        opt('ไปเป็นเด็กฝึกงานในเมือง', p => {
          if (roll(.5 + p.know / 100)) { p.know += 6; p.wealth += 4; return 'ช่างตีเหล็กคนหนึ่งยอมรับคุณเป็นศิษย์'; }
          p.happy -= 6; return 'ไม่มีใครยอมรับเด็กจากถิ่นของคุณ สุดท้ายคุณต้องกลับบ้านมือเปล่า';
        }),
        opt('หนีออกจากบ้าน', p => {
          if (roll(.5)) { p.wealth += 8; p.happy += 8; return 'คุณไปตั้งตัวที่เมืองท่าได้ ชีวิตลำบาก แต่เป็นชีวิตที่คุณเลือกเอง'; }
          p.wealth -= 8; p.health -= 10; return 'โลกข้างนอกโหดร้ายกว่าที่คิด คุณกลับบ้านมาในสภาพผอมโซ';
        }),
      ];
    } },
  { id: 'gift', when: p => p.gifted && p.age === 11, prompt: () => 'อายุ 11 ปี จู่ๆ ก็มีเปลวไฟเล็กๆ ลุกขึ้นบนฝ่ามือของคุณ คุณมีพลังเวท',
    options: p => {
      if (has(p, 'aurelis', 'undercity')) return [
        opt('ลงทะเบียนกับศาสนจักร', p => { p.know += 20; p.wealth += 10; p.happy -= 10; p.flags.churchMage = true; return 'ตั้งแต่วันนี้ชีวิตคุณเป็นของศาสนจักร คุณปลอดภัย แต่ชีวิตไม่ได้เป็นของคุณอีกต่อไป'; }),
        opt('ซ่อนพลังไว้', p => { p.flags.hiddenMage = true; return 'คุณสาบานกับตัวเองว่าจะไม่ให้ใครรู้เด็ดขาด'; }),
      ];
      if (has(p, 'serenth')) return [
        opt('เข้าหอเวทสูง', p => { p.know += 25; p.happy += 8; return 'ทั้งตระกูลจัดงานฉลองให้คุณ เพราะที่นี่พลังเวทคือเกียรติ'; }),
        opt('เก็บไว้ใช้เงียบๆ', p => { p.happy += 3; return 'คุณไม่อยากให้ใครมาคาดหวังอะไรจากคุณ'; }),
      ];
      return [
        opt('เป็นหมอยาประจำหมู่บ้าน', p => { p.happy += 10; p.health += 5; p.flags.healer = true; return 'คนในหมู่บ้านเริ่มมาเคาะประตูบ้านคุณกลางดึกเพื่อขอให้ช่วย'; }),
        opt('รับจ้างใช้เวทให้ขุนศึก', p => { p.wealth += 18; p.flags.warmage = true; return 'ได้เงินดี แต่ทุกครั้งที่มีศึก คุณต้องไปอยู่แนวหน้า'; }),
      ];
    } },
  { id: 'love', when: p => p.age >= 18 && p.age <= 30 && roll(.3), prompt: p => { p.kin.cand = nameIn(p.realm); return p.cls === 4 ? `อายุ ${p.age} ปี นายจับคุณคู่กับ${p.kin.cand}` : `อายุ ${p.age} ปี คุณรัก${p.kin.cand} แต่ครอบครัวอยากให้คุณแต่งกับลูกของบ้านที่มีฐานะดีกว่า`; },
    options: p => p.cls === 4 ? [
      opt('ยอมรับ', p => { p.married = true; p.kin.spouse = p.kin.cand; p.happy += 2; return `คุณแต่งงานกับ${p.kin.spouse} ทั้งที่แทบไม่เคยคุยกันมาก่อน`; }),
      opt('ปฏิเสธ', p => { p.health -= 12; p.happy -= 6; return 'คุณถูกลงโทษ และปีหน้านายจะบังคับอีกครั้ง'; }),
    ] : [
      opt(`แต่งงานกับ${p.kin.cand}`, p => { p.married = true; p.kin.spouse = p.kin.cand; p.happy += 15; if (has(p, 'serenth') && roll(.3)) p.flags.humanSpouse = true; return 'งานแต่งเล็กๆ มีแขกไม่กี่คน แต่คุณจำวันนั้นได้ไปตลอดชีวิต'; }),
      opt('แต่งงานเพื่อฐานะ', p => { p.married = true; p.kin.spouse = nameIn(p.realm); p.wealth += 14; p.happy -= 3; return `คุณแต่งงานกับ${p.kin.spouse} ครอบครัวพอใจ ส่วนคุณบอกตัวเองว่าความรักค่อยมาทีหลังก็ได้`; }),
      opt('อยู่ตัวคนเดียว', p => { p.happy += 2; return 'คุณเลือกทางนี้ด้วยตัวเอง'; }),
    ] },
  { id: 'war', when: p => p.age >= 17 && p.age <= 45 && (p.realm.war >= .01 || roll(.05)) && roll(.2),
    prompt: p => `อายุ ${p.age} ปี ทหารมาเกณฑ์คนในหมู่บ้าน และมีชื่อคุณอยู่ในรายชื่อ`,
    options: p => [
      opt('ไปรบ', p => { p.flags.soldier = 3; p.wealth += 6; p.happy -= 8; return 'คุณออกเดินทางไปแนวหน้าพร้อมคนรุ่นเดียวกันอีกสามสิบคน'; }),
      opt('หนีทหาร', p => { if (roll(.35 - (T(p, 'cunning') ? .2 : 0))) { p.health -= 15; p.wealth -= 10; p.happy -= 8; return 'คุณถูกจับได้ โดนทั้งลงโทษและปรับเงิน'; } p.happy -= 3; return 'คุณซ่อนตัวอยู่ในป่าจนกองทัพผ่านไป'; }),
      opt('จ่ายเงินให้คนอื่นไปแทน', p => { p.wealth -= 25; return 'เด็กหนุ่มจากบ้านที่จนกว่ารับเงินแล้วไปรบแทนคุณ คุณไม่เคยรู้เลยว่าเขาได้กลับมาหรือเปล่า'; }, p => p.wealth >= 45, 'ต้องมีทรัพย์ 45 ขึ้นไป'),
    ] },
  { id: 'plague', when: p => p.age >= 10 && p.realm.plague >= .008 && roll(.12), prompt: p => `อายุ ${p.age} ปี ไข้เถ้าดำระบาดหนักในละแวกบ้าน`,
    options: p => [
      opt('หนีออกจากเมือง', p => { p.wealth -= 15; p.flags.fled = true; return 'คุณจ้างเกวียนพาไปอยู่ชนบทจนกว่าโรคจะซา'; }, p => p.wealth >= 35, 'ต้องมีทรัพย์ 35 ขึ้นไป'),
      opt('อยู่ดูแลครอบครัว', p => { p.happy += 4 + (T(p, 'kind') ? 6 : 0); if (roll(.2 * (1.2 - p.wealth / 100))) { die(p, 'ติดไข้เถ้าดำจากคนที่ตัวเองดูแล จนเสียชีวิต'); return 'คุณดูแลทุกคนจนถึงวันสุดท้ายของตัวเอง'; } return 'คุณดูแลทุกคนจนโรคซา แต่บางคนก็ไม่รอด'; }),
      opt('ไปหาหมอผีในหนอง', p => { p.wealth -= 4; if (roll(.12)) { die(p, 'เสียชีวิตด้วยไข้เถ้าดำ'); return 'ยาของหมอผีไม่ได้ผล'; } p.health += 3; return 'คุณได้เครื่องรางกับยาขมมา จะได้ผลหรือเปล่าก็ไม่มีใครรู้'; }),
    ] },
  { id: 'migrate', when: p => p.age >= 18 && p.age <= 40 && has(p, 'grieve', 'mulvane', 'dunes') && roll(.1),
    prompt: p => `อายุ ${p.age} ปี มีข่าวว่าที่ออเรลิสมีงานให้ทำ และมีอาหารเหลือกินเหลือใช้`,
    options: p => [
      opt('อพยพไปออเรลิส', p => {
        p.wealth -= 10;
        if (p.wealth >= 45 && roll(.6)) { move(p, RBY.aurelis); p.happy += 8; return 'คุณจ่ายค่าผ่านประตู และได้เข้าไปอยู่ในเมืองชั้นใน'; }
        move(p, RBY.undercity); p.happy -= 4; return 'ทหารที่ประตูชั้นในไม่ให้คนอย่างคุณเข้าไป คุณจึงต้องไปอาศัยอยู่ใต้กำแพงแทน';
      }),
      opt('อยู่ที่เดิม', () => 'คุณเลือกอยู่บ้านเกิดต่อไป'),
    ] },
  { id: 'child', repeat: 4, when: p => p.married && p.age >= 19 && p.age <= 40 && roll(.3),
    prompt: p => `อายุ ${p.age} ปี คุณกับ${p.kin.spouse || 'คู่ชีวิต'}คุยกันเรื่องมีลูก`,
    options: p => [
      opt('มีลูก', p => {
        if (p.sex === 'ญ' && roll(p.realm.infant * .12)) { die(p, 'เสียชีวิตขณะคลอดบุตร'); return 'การคลอดครั้งนี้มีภาวะแทรกซ้อน'; }
        const n = nameIn(p.realm);
        if (roll(p.realm.infant)) { p.lostKids++; p.happy -= 12; return `${n} ลูกของคุณเสียชีวิตก่อนอายุครบขวบ`; }
        p.kidNames.push(n); if (p.firstKidAge == null) p.firstKidAge = p.age; p.happy += 8; return `${n} ลูกคนใหม่ของคุณเกิดมาแข็งแรง`;
      }),
      opt('ยังไม่พร้อม', () => 'คุณตัดสินใจรอไปอีกสักพัก'),
    ] },
  { id: 'debt', when: p => p.age > 20 && p.wealth < 12 && p.cls >= 2 && p.cls < 4 && roll(.12),
    prompt: p => `อายุ ${p.age} ปี เงินหมดเกลี้ยง ไม่มีอะไรจะกินแล้ว`,
    options: p => [
      opt('กู้เงินเจ้าที่ดิน', p => { p.wealth += 15; p.flags.debt = true; if (p.cls === 2 && roll(.5)) { p.cls = 3; return 'คุณใช้หนี้ไม่ไหว สุดท้ายต้องขายตัวเป็นไพร่ติดที่ดิน'; } return 'ดอกเบี้ยจะเป็นภาระของคุณไปอีกหลายปี'; }),
      opt('ขายของมีค่าที่เหลือ', p => { p.wealth += 6; p.happy -= 6; return 'คุณขายแหวนที่แม่ให้ไว้'; }),
      opt('ทนหิวต่อไป', p => { p.health -= 12; return 'ตลอดฤดูหนาวคุณกินแค่วันละมื้อ'; }),
    ] },
  // ----- realm-specific -----
  { id: 'inquisition', when: p => has(p, 'aurelis') && p.age >= 16 && p.age <= 50 && roll(.1),
    prompt: p => `อายุ ${p.age} ปี ศาลศาสนาขอให้คุณชี้ตัวเพื่อนบ้านที่ถูกสงสัยว่าใช้เวท`,
    options: p => [
      opt('ชี้ตัว', p => { p.wealth += 10; p.happy -= 10; p.flags.betrayer = true; return 'คุณได้เงินรางวัล และบ้านข้างๆ ก็เงียบไปตั้งแต่วันนั้น'; }),
      opt('ปฏิเสธว่าไม่รู้อะไร', p => { if (roll(.25)) { p.health -= 15; return 'คุณถูกเรียกตัวไปสอบสวนอยู่สามวัน'; } return 'พวกเขาจดชื่อคุณไว้ แล้วก็กลับไป'; }),
      opt('ช่วยเพื่อนบ้านหนีออกจากเมือง', p => { p.happy += 10 + (T(p, 'kind') ? 5 : 0); p.flags.savedOther = true; if (roll(.15)) { die(p, 'ถูกศาลศาสนาประหารในข้อหาช่วยแม่มดหลบหนี'); return 'คืนนั้นมีคนเห็นคุณที่ประตูเมือง'; } return 'เธอหายลับไปในความมืดนอกกำแพง อีกหนึ่งปีต่อมาคุณได้รับจดหมายขอบคุณจากเธอ'; }),
    ] },
  { id: 'gatepass', when: p => has(p, 'undercity') && p.age >= 15 && p.age <= 40 && roll(.12),
    prompt: p => `อายุ ${p.age} ปี มีคนแอบมาเสนอขายบัตรผ่านประตูชั้นในปลอมให้คุณ`,
    options: p => [
      opt('ซื้อบัตร', p => { p.wealth -= 18; if (roll(.45 + (T(p, 'cunning') ? .2 : 0))) { move(p, RBY.aurelis); p.happy += 12; return 'ยามจ้องบัตรอยู่นานจนคุณต้องกลั้นหายใจ ก่อนจะโบกมือให้ผ่าน ตอนนี้คุณอยู่ในเมืองชั้นในแล้ว'; } p.health -= 12; return 'ยามจับได้ คุณถูกเฆี่ยนและถูกยึดเงิน'; }, p => p.wealth >= 18, 'ต้องมีทรัพย์ 18 ขึ้นไป'),
      opt('เข้าร่วมกลุ่มต่อต้านใต้กำแพง', p => { p.flags.rebel = true; p.happy += 4; return 'คุณเริ่มไปร่วมประชุมลับที่โรงฟอกหนังทุกเจ็ดวัน'; }),
      opt('ไม่ยุ่ง', () => 'คุณทำเป็นไม่ได้ยิน แล้วเดินผ่านไป'),
    ] },
  { id: 'riot', when: p => p.flags.rebel && p.age >= 18 && roll(.25),
    prompt: p => `อายุ ${p.age} ปี กลุ่มต่อต้านนัดกันบุกประตูชั้นในคืนพรุ่งนี้`,
    options: p => [
      opt('ไปยืนแถวหน้า', p => { p.flags.rose = true; const u = Math.random(); if (u < .3 + luck(p)) { p.wealth += 15; p.happy += 15; return 'ประตูถูกเปิดอยู่หนึ่งคืน คนใต้กำแพงได้เดินบนถนนทองคำเป็นครั้งแรก และทางการยอมลดภาษีให้'; } if (u < .65) { die(p, 'เสียชีวิตระหว่างการลุกฮือที่ประตูชั้นใน'); return 'ทหารม้าบุกออกมาจากประตูก่อนฟ้าสาง'; } p.cls = 4; p.happy -= 15; return 'คุณถูกจับ และถูกขายเป็นทาสเพื่อชดใช้ความผิด'; }),
      opt('ช่วยอยู่เบื้องหลัง', p => { p.flags.rose = true; p.happy += 3; return 'คุณนั่งเย็บผ้าพันแผลทั้งคืน การลุกฮือล้มเหลว แต่ผู้คนยังพูดถึงมันไปอีกนาน'; }),
      opt('ถอนตัว', p => { p.flags.rebel = false; p.happy -= 5; return 'คุณปิดประตูบ้าน แล้วนั่งฟังเสียงวุ่นวายจากข้างนอก'; }),
    ] },
  { id: 'refugee', when: p => has(p, 'serenth') && p.age >= 20 && roll(.04),
    prompt: p => `อายุ ${p.age} ปี เด็กผู้ลี้ภัยมนุษย์คนหนึ่งแอบขึ้นมาบนนครลอยได้ และมาซ่อนตัวอยู่ในสวนของคุณ`,
    options: p => [
      opt('ซ่อนไว้และเลี้ยงดู', p => { p.happy += 8; p.flags.savedOther = true; if (roll(.25)) { p.wealth -= 30; if (p.cls === 0) p.cls = 2; return 'สภาผู้อาวุโสรู้เข้า คุณถูกถอดยศและยึดทรัพย์ ส่วนเด็กถูกส่งกลับลงไปข้างล่าง'; } return 'เด็กคนนั้นเติบโตในบ้านของคุณ และเรียกคุณว่าพ่อหรือแม่'; }),
      opt('ส่งตัวให้ยาม', p => { p.happy -= 6; return 'เด็กถูกส่งกลับลงไปใต้เมฆเถ้า คุณไม่ได้ถามด้วยซ้ำว่าเขาถูกพาไปที่ไหน'; }),
      opt('แอบพาไปส่งที่พื้นดิน', p => { p.happy += 4; p.know += 5; return 'คุณได้เห็นแผ่นดินข้างล่างกับตาตัวเองเป็นครั้งแรก และมันแย่กว่าที่ตำราเขียนไว้มาก'; }),
    ] },
  { id: 'ennui', when: p => has(p, 'serenth') && p.age >= 110 && roll(.05),
    prompt: p => `อายุ ${p.age} ปี ชีวิตผ่านไปกว่าร้อยปีแล้ว คุณเริ่มไม่แน่ใจว่าตื่นเช้ามาทุกวันเพื่ออะไร`,
    options: p => [
      opt('ลงไปใช้ชีวิตบนแผ่นดินเบื้องล่าง', p => { move(p, RBY.grieve); p.happy += 10; p.wealth -= 20; return 'คุณลงไปอยู่ที่ราบเถ้า คนที่นั่นอายุสั้นกว่าคุณสิบเท่า และใช้ชีวิตเร็วกว่าคุณสิบเท่า'; }),
      opt('ศึกษาคัมภีร์ต่ออีกร้อยปี', p => { p.know += 15; p.happy -= 4; return 'หอสมุดยังมีห้องที่คุณไม่เคยเข้าไป'; }),
      opt('จัดสวนใหม่ทั้งหมด', p => { p.happy += 6; return 'ต้นไม้ที่คุณปลูกวันนี้จะโตเต็มที่ในอีกสองร้อยปี และคุณจะได้อยู่ดู'; }),
    ] },
  { id: 'stonedoor', when: p => has(p, 'kragmor') && p.age >= 16 && p.age <= 60 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี คนงานขุดเจอประตูหินโบราณที่ไม่มีใครรู้ที่มาอยู่ใต้ชั้นแร่`,
    options: p => [
      opt('เปิดประตูเอง', p => { const u = Math.random(); if (u < .3 + luck(p)) { p.wealth += 30; p.know += 10; p.flags.treasure = true; return 'ข้างในเป็นคลังสมบัติของกษัตริย์คนแคระที่ถูกลืม คุณแบกทองออกมาได้สองถุง'; } if (u < .55) { p.health -= 25; return 'อากาศข้างในเป็นพิษ คุณไอไม่หยุดไปทั้งปี'; } if (u < .65) { die(p, 'หายไปหลังประตูหินใต้ภูเขา'); return 'ประตูปิดลงตามหลังคุณ'; } return 'ข้างในว่างเปล่า มีแต่ฝุ่นที่สะสมมาเป็นพันปี'; }),
      opt('รายงานต่อขุนนาง', p => p.cls <= 1 ? (p.wealth += 20, 'ตามกฎของเหมือง ทุกอย่างในห้องนั้นตกเป็นของตระกูลคุณ') : (p.wealth += 2, p.happy -= 5, 'ขุนนางเอาไปทั้งหมด คุณได้ค่าตอบแทนเป็นเหรียญเงินแค่เหรียญเดียว')),
      opt('ปิดผนึกไว้ตามเดิม', () => 'คุณบอกตัวเองว่า บางประตูก็ไม่ควรเปิด'),
    ] },
  { id: 'strike', when: p => has(p, 'kragmor') && p.cls >= 2 && p.cls < 4 && p.age >= 18 && p.age <= 55 && roll(.1),
    prompt: p => `อายุ ${p.age} ปี คนงานเหมืองนัดหยุดงาน เพื่อเรียกร้องค่าชดเชยให้ครอบครัวของคนที่ตายในอุโมงค์`,
    options: p => [
      opt('ร่วมนัดหยุดงาน', p => { if (roll(.5)) { p.wealth += 8; p.happy += 8; p.flags.safeMine = true; return 'เจ้าเหมืองยอมค้ำอุโมงค์ใหม่ทั้งหมด ปีต่อมาคนตายในเหมืองลดลงครึ่งหนึ่ง'; } p.wealth -= 15; p.happy -= 5; return 'เจ้าเหมืองจ้างคนงานชุดใหม่มาแทน คุณตกงาน'; }),
      opt('ทำงานต่อ', p => { p.wealth += 5; p.happy -= 8; return 'คุณได้ค่าแรงสองเท่า แต่เพื่อนร่วมงานไม่มองหน้าคุณอีกเลย'; }),
      opt('แจ้งรายชื่อแกนนำให้หัวหน้า', p => { p.wealth += 12; p.happy -= 12; p.flags.betrayer = true; return 'แกนนำสามคนหายตัวไปจากเหมือง ส่วนคุณได้เลื่อนตำแหน่ง'; }),
    ] },
  { id: 'enemychild', when: p => has(p, 'grieve') && p.age >= 18 && p.age <= 60 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี คุณพบเด็ก${p.race === 'ออร์ค' ? 'มนุษย์' : 'ออร์ค'}คนหนึ่งบาดเจ็บอยู่กลางทุ่ง เด็กคนนี้มาจากฝ่ายที่เคยฆ่าคนในหมู่บ้านคุณ`,
    options: p => [
      opt('พากลับไปรักษา', p => { p.happy += 6 + (T(p, 'kind') ? 6 : 0); p.flags.savedOther = true; if (roll(.3)) { p.happy -= 12; p.wealth -= 8; return 'คนในหมู่บ้านรู้เข้า บ้านคุณถูกเผาไปครึ่งหลัง แต่เด็กคนนั้นรอด'; } return 'สามปีต่อมา กองทัพของอีกฝ่ายเดินผ่านหมู่บ้านคุณไปโดยไม่แตะต้องอะไรเลย'; }),
      opt('ทิ้งไว้ตรงนั้น', p => { p.happy -= 6; return 'คุณเดินกลับบ้านโดยไม่หันกลับไปมอง'; }),
      opt('ส่งตัวให้ทหาร', p => { p.wealth += 6; p.happy -= 10; return 'ทหารให้เงินคุณมาสองเหรียญ'; }),
    ] },
  { id: 'trial', when: p => has(p, 'mulvane') && p.age >= 15 && p.age <= 50 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี นักเล่นแร่จากออเรลิสเสนอเงินก้อนใหญ่ แลกกับการให้เขาทดลองยารักษาไข้เถ้าดำกับตัวคุณ`,
    options: p => [
      opt('รับเงินและยอมให้ทดลอง', p => { p.wealth += 22; const u = Math.random(); if (u < .45 + luck(p)) { p.flags.immune = true; p.health += 10; return 'ยาได้ผล คุณไม่ติดไข้เถ้าดำอีกเลย ส่วนนักเล่นแร่เอายานี้ไปขายในออเรลิส ในราคาที่คนในหนองไม่มีวันซื้อได้'; } if (u < .8) { p.health -= 22; return 'ยาทำลายตับของคุณ แต่คุณยังมีชีวิตอยู่'; } die(p, 'ไม่รอดจากยาทดลองของนักเล่นแร่'); return 'ในบันทึกของเขา คุณถูกเรียกว่า "ตัวอย่างที่ 14"'; }),
      opt('ปฏิเสธ', () => 'เขาไปเคาะประตูบ้านถัดไป ซึ่งจนกว่าบ้านคุณ'),
    ] },
  { id: 'crown', when: p => has(p, 'mulvane') && p.age >= 14 && p.age <= 45 && roll(.06),
    prompt: p => `อายุ ${p.age} ปี คนเฒ่าเล่าว่ามงกุฎของกษัตริย์ก็อบลินองค์สุดท้ายจมอยู่ใต้หนองดำ`,
    options: p => [
      opt('ดำลงไปหา', p => { const u = Math.random(); if (u < .2 + luck(p)) { p.wealth += 35; p.flags.treasure = true; return 'นิ้วของคุณไปแตะโดนโลหะในโคลน มงกุฎมีอยู่จริง'; } if (u < .35) { die(p, 'จมน้ำหายไปในหนองดำ'); return 'โคลนดูดตัวคุณลงไป'; } p.health -= 8; return 'คุณได้แต่โคลนกับปลิงติดตัวกลับมา'; }),
      opt('หัวเราะแล้วกลับบ้าน', () => 'คุณได้ยินเรื่องเล่านี้มาตั้งแต่เด็กแล้ว'),
    ] },
  { id: 'oasis', when: p => has(p, 'dunes') && p.age >= 16 && p.age <= 55 && roll(.1),
    prompt: p => `อายุ ${p.age} ปี ฝูงสัตว์ใกล้ตายเพราะขาดน้ำ แต่บ่อน้ำที่ใกล้ที่สุดเป็นของอีกเผ่า`,
    options: p => [
      opt('เจรจาแลกของ', p => { p.wealth -= 8; return 'คุณเอาพรมสามผืนแลกกับน้ำหนึ่งคืน คืนนั้นทั้งสองเผ่ากินเลี้ยงด้วยกัน'; }),
      opt('บุกยึดบ่อน้ำ', p => { const u = Math.random(); if (u < .5 + (T(p, 'brave') ? .15 : 0)) { p.wealth += 12; return 'เผ่าของคุณยึดบ่อน้ำได้ ส่วนอีกเผ่าต้องเดินต่อไปกลางทะเลทราย'; } if (u < .85) { p.health -= 15; return 'คุณถูกตีถอยกลับมาพร้อมบาดแผล'; } die(p, 'เสียชีวิตในการแย่งบ่อน้ำ'); return 'การแย่งบ่อน้ำจบลงก่อนพระอาทิตย์ตก'; }),
      opt('เดินต่อไปหาที่ใหม่', p => roll(.5) ? 'สามวันต่อมา คุณเจอบ่อน้ำที่ไม่มีใครรู้จักมาก่อน' : (p.wealth -= 15, p.health -= 10, 'ครึ่งฝูงไม่รอดถึงบ่อถัดไป')),
    ] },
  { id: 'guide', when: p => has(p, 'dunes') && p.age >= 18 && p.age <= 50 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี กองคาราวานจากออเรลิสจ้างคุณนำทางผ่านเขตพายุแก้ว ค่าจ้างเท่ากับรายได้ทั้งสามปี`,
    options: p => [
      opt('รับงาน', p => { if (roll(.08 - luck(p) / 2)) { die(p, 'หลงทางในพายุทรายแก้ว'); return 'พายุมาเร็วกว่าที่คุณคาดไว้'; } p.wealth += 18; return 'คุณพาทุกคนผ่านไปได้ พ่อค้าจ่ายเงินครบ แต่ไม่เคยถามชื่อคุณเลย'; }),
      opt('ปฏิเสธ', () => 'คนที่รับงานแทนคุณไม่ได้กลับมา'),
    ] },
  // ----- general -----
  { id: 'stranger', when: p => p.age >= 20 && p.age <= 70 && p.cls < 4 && roll(.05),
    prompt: p => `อายุ ${p.age} ปี นักเดินทางที่บาดเจ็บมาเคาะประตูขอพักค้างคืน`,
    options: p => [
      opt('ให้พัก', p => { p.happy += T(p, 'kind') ? 8 : 3; const u = Math.random(); if (u < .5) { p.wealth += 10; p.know += 5; return 'เขาคือนักปราชญ์ที่หนีมาจากออเรลิส ก่อนจากไปเขาทิ้งหนังสือกับเงินไว้ให้'; } if (u < .8) return 'เช้าวันรุ่งขึ้นเขาขอบคุณแล้วก็จากไป'; p.wealth -= 10; return 'เช้าวันรุ่งขึ้นเขาหายไป พร้อมกับของมีค่าในบ้าน'; }),
      opt('ไม่เปิดประตู', () => 'เสียงเคาะประตูเงียบหายไปตอนดึก'),
    ] },
  { id: 'dice', when: p => p.age >= 18 && p.wealth >= 10 && p.cls < 4 && roll(.05),
    prompt: p => `อายุ ${p.age} ปี วงพนันลูกเต๋ากระดูกในโรงเตี๊ยมกำลังเล่นกันคึกคัก`,
    options: p => [
      opt('ลงทั้งหมดที่มี', p => { if (roll(.45 + luck(p))) { p.wealth = clamp(p.wealth * 2); p.happy += 8; return 'ลูกเต๋าออกหกทั้งสามลูก ทั้งโรงเตี๊ยมเงียบกริบ'; } p.wealth = p.wealth * .3; p.happy -= 10; return 'คุณเดินกลับบ้านตัวเปล่าใต้แสงจันทร์'; }),
      opt('เล่นนิดหน่อย', p => { const g = roll(.5) ? 4 : -4; p.wealth += g; return g > 0 ? 'ได้มานิดหน่อย พอซื้อเหล้าได้หนึ่งเหยือก' : 'เสียไปนิดหน่อย'; }),
      opt('ไม่เล่น', () => 'คุณนั่งดูคนอื่นเล่นอยู่เฉยๆ'),
    ] },
  { id: 'parentsick', when: p => p.age >= 18 && p.age <= 45 && !p.done.parent && roll(.07),
    prompt: p => `อายุ ${p.age} ปี ${p.kin.mother} แม่ของคุณป่วยหนัก ยาที่รักษาได้มีราคาเท่ากับครึ่งหนึ่งของทุกอย่างที่คุณมี`,
    options: p => [
      opt('ซื้อยา', p => { p.wealth *= .5; p.done.parent = 1; if (roll(.7)) { p.happy += 8; return `${p.kin.mother}หายป่วย และมีชีวิตอยู่ต่อมาอีกหลายปี`; } p.happy -= 10; return 'ยาไม่ได้ผล คุณเสียทั้งแม่และเงินไปพร้อมกัน'; }),
      opt('ดูแลเองที่บ้าน', p => { p.done.parent = 1; if (roll(.35)) { p.happy += 6; return 'แม่ของคุณค่อยๆ ฟื้นตัว ด้วยซุปร้อนๆ และการดูแลของคุณ'; } p.happy -= 14; return `${p.kin.mother}จากไปในอ้อมกอดของคุณ`; }),
    ] },
];
function checkChoice(p) {
  const pool = CHOICES.filter(c => {
    const n = p.done[c.id] || 0;
    if (n >= (c.repeat || 1)) return false;
    return c.when(p);
  });
  if (!pool.length) return null;
  const c = pick(pool);
  p.done[c.id] = (p.done[c.id] || 0) + 1;
  const prompt = c.prompt(p);
  return { id: c.id, prompt, options: c.options(p) };
}
function resolveChoice(p, o) { const t = o.act(p); norm(p); return t; }
function autoChoose(p, ch) { const ok = ch.options.filter(o => !o.need || o.need(p)); return pick(ok); }

function finishYear(p) {
  const lines = [];
  if (!p.alive) return { lines };
  const y = yearOf(p);
  for (const e of ERAS) if (y === e.from || (p.age === 0 && y > e.from && y <= e.to)) lines.push('§' + `ห.ถ. ${e.from}: ${e.n} · ${e.t}`);
  drift(p);
  const ft = applyFocus(p); if (ft) lines.push(ft);
  const et = randomEvent(p); if (et) lines.push(et);
  norm(p);
  p.years.push({ h: p.happy, hp: p.health });
  const d = rollDeath(p);
  if (d && d.fate) return { lines, fate: d.fate };
  if (d) return { lines };
  advance(p);
  return { lines };
}
function advance(p) { p.age++; if (p.age > 400) die(p, 'จากไปอย่างสงบด้วยวัยชรา'); }
function afterFate(p) { if (p.alive) advance(p); }

const FOCI = ['work', 'study', 'love', 'rest'];
function simLife(realm) {
  const p = makePerson(realm);
  while (p.alive) {
    if (p.age >= 7 && Math.random() < .15) p.focus = pick(FOCI);
    const ch = checkChoice(p);
    if (ch) { resolveChoice(p, autoChoose(p, ch)); if (!p.alive) { p.years.push({ h: p.happy }); break; } }
    const r = finishYear(p);
    if (r.fate) { resolveChoice(p, autoChoose(p, r.fate)); afterFate(p); }
  }
  return p;
}
function worldStats(n = 500) {
  const out = {};
  for (const r of REALMS) {
    let sum = 0, s5 = 0, s15 = 0, s30 = 0, s50 = 0; const ages = [];
    for (let i = 0; i < n; i++) {
      const p = simLife(r); const a = p.age; ages.push(a); sum += a;
      if (a >= 5) s5++; if (a >= 15) s15++; if (a >= 30) s30++; if (a >= 50) s50++;
    }
    ages.sort((x, y) => x - y);
    out[r.id] = { mean: sum / n, median: ages[n >> 1], s5: s5 / n, s15: s15 / n, s30: s30 / n, s50: s50 / n };
  }
  return out;
}

// ---------- legends ----------
const LEGENDS = [
  { id: 'unborn', n: 'ไม่ทันได้ลืมตา', d: 'เสียชีวิตก่อนอายุครบหนึ่งขวบ', c: p => p.age === 0 },
  { id: 'deathdodger', n: 'ผู้หนีความตาย', d: 'รอดจากความตายมาได้อย่างน้อย 2 ครั้ง', c: p => p.flags.reprieves >= 2 },
  { id: 'escaped', n: 'โซ่ที่ขาด', d: 'เกิดเป็นทาส และหนีออกมาได้สำเร็จ', c: p => p.flags.fugitive && p.bornCls === 4 },
  { id: 'ashtogold', n: 'จากเถ้าสู่ทอง', d: 'เกิดเป็นไพร่หรือทาส แต่มีทรัพย์ 70 ขึ้นไป', c: p => p.bornCls >= 3 && p.wealth >= 70 },
  { id: 'fallen', n: 'ร่วงจากหอคอย', d: 'เกิดเป็นขุนนางหรือพ่อค้า แต่จบชีวิตเป็นไพร่หรือทาส', c: p => p.bornCls <= 1 && p.cls >= 3 },
  { id: 'elder', n: 'ผู้เฒ่าแห่งแดน', d: 'มีชีวิตยืนยาวเป็นสองเท่าของอายุขัยเฉลี่ยในแดนที่เกิด', c: (p, ws) => p.age >= Math.max(40, ws[p.born.id].mean * 2) },
  { id: 'sage', n: 'ปราชญ์', d: 'มีความรู้ 80 ขึ้นไป', c: p => p.know >= 80 },
  { id: 'rebel', n: 'เสียงจากใต้กำแพง', d: 'ร่วมลุกฮือบุกประตูชั้นใน', c: p => p.flags.rose },
  { id: 'witch', n: 'แม่มดที่ไม่มีใครรู้', d: 'ซ่อนพลังเวทได้จนตายด้วยวัยชรา', c: p => p.flags.hiddenMage && p.cause.includes('วัยชรา') },
  { id: 'mercy', n: 'มือที่ยื่นข้ามเส้น', d: 'ยื่นมือช่วยคนที่ไม่มีใครกล้าช่วย', c: p => p.flags.savedOther },
  { id: 'traitor', n: 'ผู้ชี้ตัว', d: 'หักหลังคนอื่นเพื่อเอาตัวรอด', c: p => p.flags.betrayer },
  { id: 'hero', n: 'ผู้ยืนหยัดจนฝุ่นจาง', d: 'สู้จนรอดชีวิตจากแนวรบที่แตก', c: p => p.flags.hero },
  { id: 'treasure', n: 'ผู้ค้นพบ', d: 'ค้นพบสมบัติที่ถูกลืม', c: p => p.flags.treasure },
  { id: 'dynasty', n: 'สายเลือดสามรุ่น', d: 'เล่นต่อเป็นลูกหลานไปจนถึงรุ่นที่ 3', c: p => p.gen >= 3 },
  { id: 'average', n: 'ชีวิตตามค่าเฉลี่ย', d: 'ตายในวัยที่ห่างจากอายุขัยเฉลี่ยของแดนไม่เกิน 1 ปี', c: (p, ws) => p.age > 0 && Math.abs(p.age - ws[p.born.id].mean) <= 1 },
  { id: 'captive', n: 'เชลยศึก', d: 'ยอมจำนนเพื่อแลกกับชีวิต', c: p => p.flags.captive },
];
function legendsFor(p, ws) { return LEGENDS.filter(l => { try { return l.c(p, ws); } catch (e) { return false; } }); }

if (typeof module !== 'undefined') module.exports = { REALMS, simLife, worldStats, makePerson, legendsFor, CHOICES, ERAS, erasLived };

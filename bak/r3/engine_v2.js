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
  { id: 'aurelis', name: 'จักรวรรดิออเรลิส', short: 'ออเรลิส', race: ['มนุษย์'], birth: 18,
    classW: [6, 18, 60, 14, 2], infant: .06, child: .004, adult: .005, agingStart: 52, agingScale: 9,
    war: .002, plague: .002, famine: .001, mine: 0, beast: 0, health: 72, wealth: 55, lit: .5,
    blurb: 'นครหลวงของศาสนจักรสุริยะ อยู่หลังกำแพงสามชั้น ยุ้งฉางเต็ม มีหมอหลวง และมีศาลศาสนาที่เผาผู้ใช้เวทนอกสังกัด',
    names: [['อเล', 'มา', 'ริ', 'เซ', 'ดริ', 'ออ', 'วิล', 'เอเลน', 'ทอ'], ['เรียน', 'ริค', 'นา', 'ซา', 'ลอส', 'เทีย', 'มอนด์']] },
  { id: 'undercity', name: 'ใต้กำแพงออเรลิส', short: 'ใต้กำแพง', race: ['มนุษย์', 'มนุษย์', 'ลูกครึ่งออร์ค', 'ลูกครึ่งเอลฟ์'], birth: 16,
    classW: [0, 2, 40, 38, 20], infant: .17, child: .007, adult: .008, agingStart: 42, agingScale: 9,
    war: .002, plague: .008, famine: .006, mine: 0, beast: 0, health: 48, wealth: 12, lit: .08,
    blurb: 'ชุมชนแออัดนอกกำแพงชั้นในของออเรลิส มองเห็นยอดหอคอยทองได้ทุกวัน แต่ประตูชั้นในปิดตั้งแต่ค่ำ และไม่เปิดให้คนที่นี่',
    names: [['อเล', 'มา', 'ริ', 'เซ', 'ดริ', 'กรอ', 'วิล', 'ฟิน'], ['เรียน', 'ริค', 'นา', 'ซา', 'ทัก', 'เทีย']] },
  { id: 'serenth', name: 'นครลอยเซเรนธ์', short: 'เซเรนธ์', race: ['เอลฟ์'], birth: 2,
    classW: [20, 30, 50, 0, 0], infant: .008, child: .001, adult: .0015, agingStart: 190, agingScale: 16,
    war: .0004, plague: .0004, famine: 0, mine: 0, beast: 0, health: 88, wealth: 75, lit: .97,
    blurb: 'นครลอยของเอลฟ์ ลอยอยู่เหนือเมฆเถ้า อากาศสะอาด คนที่นี่อยู่ได้หลายร้อยปี และสภาผู้อาวุโสไม่รับผู้อพยพ',
    names: [['เอล', 'ไอ', 'ซิล', 'ลู', 'เธ', 'ไอเร', 'นิม'], ['วาน', 'ริล', 'ธีเอล', 'ลิธ', 'นาร์', 'เมีย']] },
  { id: 'kragmor', name: 'แดนเหมืองครากมอร์', short: 'ครากมอร์', race: ['คนแคระ'], birth: 9,
    classW: [5, 15, 60, 15, 5], infant: .09, child: .006, adult: .006, agingStart: 72, agingScale: 11,
    war: .003, plague: .003, famine: .003, mine: .006, beast: 0, health: 66, wealth: 40, lit: .3,
    blurb: 'อาณาจักรเหมืองใต้ภูเขาของคนแคระ ร่ำรวยด้วยแร่เหล็กและทอง แต่ทุกปีมีอุโมงค์ถล่ม',
    names: [['ทอร', 'บรัม', 'กรุ', 'ดูร', 'ฮิล', 'บอร'], ['กริม', 'ดา', 'ริน', 'ฮิลด์', 'นาร์', 'ดัล']] },
  { id: 'grieve', name: 'ที่ราบเถ้ากรีฟ', short: 'กรีฟ', race: ['มนุษย์', 'ออร์ค'], birth: 22,
    classW: [2, 5, 48, 30, 15], infant: .19, child: .008, adult: .007, agingStart: 40, agingScale: 9,
    war: .015, plague: .004, famine: .007, mine: 0, beast: .002, health: 52, wealth: 15, lit: .05,
    blurb: 'ที่ราบที่มนุษย์กับออร์คแย่งกันมาสามชั่วคน กองทัพผ่านหมู่บ้านบ่อยกว่าฝนตก',
    names: [['กรอ', 'ราก', 'วอร์', 'ซูล', 'มอร', 'เบร'], ['กาช', 'นา', 'รา', 'ทัก', 'เกน', 'ดา']] },
  { id: 'mulvane', name: 'หนองพิษมูลเวน', short: 'มูลเวน', race: ['ก็อบลิน', 'มนุษย์'], birth: 20,
    classW: [1, 4, 45, 30, 20], infant: .22, child: .01, adult: .008, agingStart: 38, agingScale: 9,
    war: .003, plague: .009, famine: .006, mine: 0, beast: .004, health: 42, wealth: 10, lit: .04,
    blurb: 'หนองน้ำพิษที่ก็อบลินกับมนุษย์ยากจนอยู่ร่วมกัน ไข้เถ้าดำไม่เคยหายไปจากที่นี่',
    names: [['สนิก', 'มัด', 'ฟิน', 'กิบ', 'ลุ', 'ซอก'], ['เกิล', 'วิช', 'บี', 'นิค', 'ลา', 'ดิ']] },
  { id: 'dunes', name: 'ทะเลทรายแก้ว', short: 'ทะเลทรายแก้ว', race: ['ชาวทะเลทราย'], birth: 13,
    classW: [3, 12, 70, 10, 5], infant: .14, child: .006, adult: .007, agingStart: 44, agingScale: 9,
    war: .005, plague: .003, famine: .009, mine: 0, beast: .003, health: 58, wealth: 22, lit: .12,
    blurb: 'ชนเผ่าเร่ร่อนต้อนสัตว์ข้ามเนินทรายที่เป็นแก้ว ปีไหนฝนไม่ตก ทั้งเผ่าก็อด',
    names: [['ซา', 'คาร', 'อมี', 'ฮา', 'ทีร', 'ไน'], ['ฮีร์', 'ริม', 'ลา', 'ซัน', 'ดี', 'ฟา']] },
];
const RBY = Object.fromEntries(REALMS.map(r => [r.id, r]));

const TRAITS = [
  { id: 'tough', n: 'แข็งแกร่ง', d: 'ป่วยยาก ฟื้นตัวไว' },
  { id: 'sickly', n: 'ขี้โรค', d: 'ร่างกายอ่อนแอมาตั้งแต่เกิด' },
  { id: 'clever', n: 'หัวไว', d: 'เรียนรู้เร็วกว่าคนอื่น' },
  { id: 'cunning', n: 'เจ้าเล่ห์', d: 'โกหกและหลบหนีเก่ง' },
  { id: 'brave', n: 'ใจกล้า', d: 'ไม่ถอยเมื่อต้องสู้' },
  { id: 'kind', n: 'ใจบุญ', d: 'มีความสุขเมื่อได้ช่วยคน' },
  { id: 'lucky', n: 'ดวงแข็ง', d: 'รอดจากเรื่องร้ายบ่อยกว่าคนอื่น' },
  { id: 'bitter', n: 'ขมขื่น', d: 'มองโลกในแง่ร้าย ความสุขต่ำกว่าปกติ' },
];
const TBY = Object.fromEntries(TRAITS.map(t => [t.id, t]));
const T = (p, id) => p.traits.includes(id);
const nameIn = r => pick(r.names[0]) + pick(r.names[1]);
const has = (p, ...ids) => ids.includes(p.realm.id);

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
  H.push([a === 0 ? 'จากไปด้วยไข้ในขวบปีแรก' : a < 5 ? 'จากไปด้วยโรคในวัยเด็ก' : 'ล้มป่วยหนักและไม่หาย', base * cm * hm * tm, 'ill']);
  if (a > r.agingStart) H.push(['จากไปอย่างสงบด้วยวัยชรา', .008 * Math.exp((a - r.agingStart) / r.agingScale), 'old']);
  if (a >= 16 && a <= 55) {
    let w = r.war * (p.cls === 0 ? .4 : 1) * (f.knight ? 1.6 : 1);
    if (f.soldier > 0) w += .07;
    if (f.warmage) w += .025;
    H.push(['เสียชีวิตในสงครามชายแดน', w, 'war']);
  }
  H.push(['ล้มป่วยด้วยไข้เถ้าดำ', r.plague * (1.2 - p.wealth / 100 * .8) * (f.fled ? .3 : 1) * (f.immune ? .2 : 1) * tm, 'plague']);
  H.push(['อดอยากในฤดูที่ยาวนาน', r.famine * (1 - p.wealth / 100) * (a < 5 ? 1.5 : 1), 'famine']);
  if (r.mine && a >= 12 && p.cls >= 2) H.push(['อุโมงค์เหมืองถล่มทับ', r.mine * (f.safeMine ? .5 : 1), 'mine']);
  if (r.beast) H.push(['ถูกสัตว์ร้ายทำร้าย', r.beast, 'beast']);
  if (f.hiddenMage) H.push(['ถูกศาลศาสนาตัดสินประหาร ฐานใช้เวทนอกศาสนจักร', .03, 'burn']);
  return H;
}
function die(p, cause) { p.alive = false; p.cause = cause; }
function rollDeath(p) {
  const H = hazards(p);
  const sum = Math.min(H.reduce((s, h) => s + h[1], 0), .97);
  if (Math.random() >= sum) return null;
  const h = wpick(H, x => x[1]);
  const canFate = h[2] !== 'old' && p.age >= 6 && p.age - (p.flags.lastFate ?? -99) >= 4 && Math.random() < .75;
  if (canFate) { p.flags.lastFate = p.age; return { fate: buildFate(p, h[0], h[2]) }; }
  die(p, h[0]); return { died: true };
}

// ---------- near-death scenes ----------
const opt = (label, act, need, needText) => ({ label, act, need, needText });
const luck = p => T(p, 'lucky') ? .12 : 0;
function saved(p, chance) { if (Math.random() < chance + luck(p)) { p.flags.reprieves++; return true; } return false; }
const FATE_TEXT = {
  ill: 'คุณป่วยหนักจนลุกจากที่นอนไม่ได้',
  plague: 'ไข้เถ้าดำขึ้นเป็นจุดดำตามแขนของคุณ',
  war: 'แนวรบแตก ทัพของคุณกำลังถูกล้อม',
  famine: 'ไม่มีอะไรกินมาหลายสัปดาห์ ร่างกายเริ่มไม่ไหว',
  mine: 'อุโมงค์ถล่มลงมา คุณติดอยู่ในความมืดใต้ภูเขา',
  beast: 'มีบางอย่างพุ่งออกมาจากความมืดตรงหน้าคุณ',
  burn: 'ศาลศาสนาจับได้ว่าคุณใช้เวท และตัดสินให้เผา',
};
function buildFate(p, cause, kind) {
  const fail = t => { die(p, cause); return t; };
  let options = [];
  if (kind === 'ill' || kind === 'plague') options = [
    opt('จ้างหมอหลวงมารักษา', p => { p.wealth -= 22; return saved(p, .85) ? 'หมอหลวงรักษาคุณจนหาย ค่ารักษาเท่ากับรายได้หลายปีของคนทั่วไป' : fail('แม้แต่หมอหลวงก็ช่วยไม่ได้'); }, p => p.wealth >= 40, 'ต้องมีทรัพย์ 40 ขึ้นไป'),
    opt('ต้มยาตามตำราที่เคยอ่าน', p => saved(p, .4 + p.know / 250) ? 'ยาขมจนน้ำตาไหล แต่คุณรอด' : fail('ตำราเล่มนั้นผิด หรือคุณอ่านผิด'), p => p.know >= 30, 'ต้องมีความรู้ 30 ขึ้นไป'),
    opt('ภาวนาและรอ', p => { p.health -= 15; return saved(p, .25 + (T(p, 'tough') ? .2 : 0)) ? 'ไข้ลดลงในคืนที่เจ็ด คุณไม่รู้ว่าเพราะอะไร' : fail('คำภาวนาไม่มีใครตอบ'); }),
  ];
  else if (kind === 'war') options = [
    opt('ฝ่าแนวรบหนีกลับบ้าน', p => { p.health -= 15; return saved(p, .4 + (T(p, 'brave') ? .15 : 0) + (T(p, 'cunning') ? .1 : 0)) ? 'คุณเดินกลางคืนสิบวันจนถึงบ้าน' : fail('คุณไปไม่ถึงบ้าน'); }),
    opt('ยอมจำนนเป็นเชลย', p => { if (saved(p, .75)) { p.cls = 4; p.flags.captive = true; p.happy -= 15; return 'คุณรอด แต่ตอนนี้คุณเป็นทาสของอีกฝ่าย'; } return fail('ฝ่ายตรงข้ามไม่จับเชลยในวันนั้น'); }),
    ...(T(p, 'brave') ? [opt('[ใจกล้า] สู้จนถึงที่สุด', p => { if (saved(p, .38)) { p.wealth += 15; p.happy += 10; p.flags.hero = true; return 'คุณยืนอยู่เมื่อฝุ่นจางลง คนเล่าเรื่องคุณไปอีกหลายปี'; } return fail('คุณสู้จนถึงที่สุดจริงๆ'); })] : []),
  ];
  else if (kind === 'famine') options = [
    ...(p.cls < 4 ? [opt(p.cls < 3 ? 'ขายตัวเป็นไพร่แลกข้าว' : 'ขายตัวเป็นทาสแลกข้าว', p => { p.cls = p.cls < 3 ? 3 : 4; p.happy -= 12; p.flags.soldSelf = true; p.flags.reprieves++; return 'คุณรอดผ่านฤดูนั้น แลกกับอิสรภาพที่เหลืออยู่'; })] : []),
    opt('ขโมยข้าวจากยุ้งฉางเจ้าที่ดิน', p => { if (saved(p, .5 + (T(p, 'cunning') ? .2 : 0))) { p.health += 5; return 'คุณแบกข้าวออกมาได้สองกระสอบในคืนเดียว'; } die(p, 'ถูกจับได้ขณะขโมยข้าว และถูกลงโทษจนสิ้นใจ'); return 'ยามเห็นคุณก่อน'; }),
    opt('ใช้เงินที่เหลือทั้งหมดซื้ออาหาร', p => { p.wealth = 4; p.flags.reprieves++; return 'คุณรอด แต่ไม่เหลืออะไรเลย'; }, p => p.wealth >= 25, 'ต้องมีทรัพย์ 25 ขึ้นไป'),
  ];
  else if (kind === 'mine') options = [
    opt('ขุดทางออกเอง', p => { p.health -= 20; return saved(p, .35 + (T(p, 'tough') ? .2 : 0)) ? 'มือคุณเลือดออกทุกนิ้ว แต่คุณเห็นแสงอีกครั้ง' : fail('หินหนักเกินไป'); }),
    opt('รอคนมาช่วย', p => saved(p, p.cls <= 1 ? .85 : .2) ? (p.cls <= 1 ? 'ทีมกู้ภัยมาถึงภายในวันเดียว ครอบครัวคุณจ่ายเงินให้พวกเขามาก่อน' : 'ทีมกู้ภัยมาถึงในวันที่สี่ คุณโชคดีที่ยังหายใจอยู่') : (die(p, 'ติดอยู่ใต้อุโมงค์ถล่ม รอความช่วยเหลือที่มาไม่ถึง'), 'ทีมกู้ภัยขุดหาลูกหลานตระกูลที่จ่ายเงินก่อน และไปไม่ถึงคุณ')),
  ];
  else if (kind === 'beast') options = [
    opt('สู้', p => { p.health -= 15; return saved(p, .4 + (T(p, 'brave') ? .2 : 0)) ? 'มันถอยกลับเข้าไปในความมืด คุณได้แผลเป็นยาวที่แขน' : fail('มันแข็งแรงกว่าคุณ'); }),
    opt('วิ่งหนี', p => { p.health -= 5; return saved(p, .5) ? 'คุณวิ่งจนถึงหมู่บ้านโดยไม่หันกลับไปมอง' : fail('มันเร็วกว่าคุณ'); }),
  ];
  else if (kind === 'burn') options = [
    opt('ใช้เวทหนีออกจากคุก', p => { if (saved(p, .35)) { p.flags.hiddenMage = false; p.flags.fugitive = true; p.wealth = 3; p.realm = RBY.grieve; return 'ประตูเหล็กละลาย คุณหนีออกจากออเรลิสไปที่ราบเถ้า โดยไม่มีอะไรติดตัว'; } return fail('ผนังคุกถูกจารึกอักขระกันเวท'); }),
    opt('สารภาพและยอมเป็นของศาสนจักร', p => { if (saved(p, .6)) { p.flags.hiddenMage = false; p.flags.churchMage = true; p.happy -= 15; return 'ศาสนจักรไว้ชีวิตคุณ เพราะคุณมีประโยชน์กับพวกเขา'; } return fail('ศาลศาสนาต้องการตัวอย่าง'); }),
    ...(T(p, 'cunning') ? [opt('[เจ้าเล่ห์] ชี้ตัวคนอื่นแทน', p => { if (saved(p, .7)) { p.flags.hiddenMage = false; p.flags.betrayer = true; p.happy -= 20; return 'หญิงชราคนหนึ่งถูกเผาแทนคุณ คุณยืนดูอยู่ในฝูงชน'; } return fail('ไม่มีใครเชื่อคุณ'); })] : []),
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
      if (p.cls === 4) { p.health = clamp(p.health - 2); p.happy = clamp(p.happy - 2); if (Math.random() < .2) t = 'ทำงานทั้งปี แต่แรงของทาสเป็นของนาย ไม่มีอะไรเหลือถึงมือคุณ'; }
      else {
        const g = (2 + Math.random() * 3) * (1 + p.know / 120) * (r.wealth / 50 + .4) * (p.cls === 3 ? .5 : 1);
        p.wealth = clamp(p.wealth + g); p.health = clamp(p.health - (p.cls >= 2 ? 1.5 : .4));
        if (p.cls === 3 && Math.random() < .15) t = 'ผลผลิตครึ่งหนึ่งต้องส่งให้เจ้าที่ดิน';
      }
      break;
    case 'study': {
      const access = p.cls <= 1 || p.flags.literate || (p.cls < 4 && Math.random() < r.lit);
      if (access) { p.know = clamp(p.know + (4 + R(0, 2)) * (T(p, 'clever') ? 1.6 : 1)); p.flags.literate = true; }
      else { p.know = clamp(p.know + .3); if (Math.random() < .25) t = p.cls === 4 ? 'ทาสถูกห้ามจับหนังสือ คุณแอบจำตัวอักษรจากป้ายร้านได้สองสามตัว' : 'อยากเรียน แต่แถวนี้ไม่มีใครสอนหนังสือ'; }
      break; }
    case 'love': p.happy = clamp(p.happy + 3); p.wealth = clamp(p.wealth - .5); break;
    case 'rest':
      if (p.cls === 4) { p.health = clamp(p.health - 1); if (Math.random() < .25) t = 'คุณขอพัก แต่นายไม่อนุญาต'; }
      else { p.health = clamp(p.health + 3); p.wealth = clamp(p.wealth - 1.5); }
      break;
  }
  return t;
}

// ---------- random events ----------
const parentName = p => Math.random() < .5 ? `${p.kin.mother} แม่ของคุณ` : `${p.kin.father} พ่อของคุณ`;
const EVENTS = [
  { w: 3, c: p => !has(p, 'serenth', 'undercity') && p.age > 6, t: () => 'ปีนี้เก็บเกี่ยวได้ดี ทุกบ้านมีกินพอ', f: p => { p.happy += 5; p.wealth += 3; } },
  { w: 3, c: p => p.cls >= 2 && p.age > 14, t: () => 'เจ้าที่ดินขึ้นภาษีเป็นครั้งที่สามในปีนี้', f: p => { p.wealth -= 6; p.happy -= 4; } },
  { w: 2, c: p => has(p, 'aurelis'), t: () => 'เทศกาลสุริยะ ทั้งเมืองมีงานเลี้ยงเจ็ดวัน', f: p => { p.happy += 6; } },
  { w: 3, c: p => has(p, 'undercity') && p.age > 5, t: () => 'ยามปิดประตูชั้นในเร็วกว่าเดิม คนใต้กำแพงที่ทำงานในเมืองต้องนอนข้างถนน', f: p => { p.happy -= 4; p.health -= 2; } },
  { w: 2, c: p => has(p, 'undercity') && p.age > 8, t: () => 'คุณยืนดูขบวนแห่ของขุนนางผ่านไปบนถนนที่คนแถวบ้านสร้าง', f: p => { p.happy -= 2; } },
  { w: 3, c: p => has(p, 'serenth') && p.age > 15, t: () => 'สภาผู้อาวุโสปฏิเสธผู้ลี้ภัยที่ท่าเรือลอยฟ้าอีกครั้ง คุณมองเห็นพวกเขาจากระเบียง', f: p => { p.know += 1; } },
  { w: 3, c: p => has(p, 'serenth') && p.age > 10, t: () => 'คุณเรียนภาษาที่ตายไปแล้วได้อีกหนึ่งภาษา', f: p => { p.know += 4; } },
  { w: 2, c: p => has(p, 'serenth') && p.married && p.age > 60 && p.flags.humanSpouse, t: p => `${p.kin.spouse} คนรักชาวมนุษย์ของคุณแก่ลงทุกปี ขณะที่คุณยังเหมือนเดิม`, f: p => { p.happy -= 6; } },
  { w: 3, c: p => has(p, 'kragmor') && p.age > 14, t: () => 'คนงานพบสายแร่ทองเส้นใหม่ใต้ภูเขา', f: p => { p.wealth += p.cls <= 1 ? 10 : 3; p.happy += 2; } },
  { w: 3, c: p => has(p, 'grieve') && p.age > 3, t: () => 'กองทัพเดินผ่านหมู่บ้าน ยึดเสบียงไปครึ่งหนึ่ง', f: p => { p.wealth -= 8; p.health -= 4; p.happy -= 5; } },
  { w: 2, c: p => has(p, 'grieve') && p.age > 10, t: () => 'มีการพักรบหนึ่งฤดู ผู้คนกล้าออกไปไถนาไกลจากบ้าน', f: p => { p.happy += 5; p.wealth += 3; } },
  { w: 3, c: p => has(p, 'mulvane') && p.age > 3, t: () => 'น้ำในหนองขึ้นสูง บ้านไม้ค้ำพังลงไปครึ่งหลัง', f: p => { p.wealth -= 5; p.health -= 3; } },
  { w: 2, c: p => has(p, 'mulvane') && p.age > 8, t: () => 'หมอผีในหนองสอนคุณว่าใบไม้ชนิดไหนกินได้ ชนิดไหนกินแล้วตาย', f: p => { p.know += 3; p.health += 2; } },
  { w: 3, c: p => has(p, 'dunes') && p.age > 3, t: () => 'พายุทรายแก้วพัดผ่าน สัตว์ในฝูงตายไปหลายตัว', f: p => { p.wealth -= 6; p.happy -= 3; } },
  { w: 2, c: p => has(p, 'dunes') && p.age > 6, t: () => 'ฝนตกในทะเลทรายเป็นครั้งแรกในรอบสี่ปี ทั้งเผ่าเต้นรำกลางสายฝน', f: p => { p.happy += 7; p.wealth += 2; } },
  { w: 2, c: p => p.age > 3, t: p => p.wealth > 55 ? 'คุณป่วยหนัก หมอประจำตระกูลรักษาจนหาย' : 'คุณป่วยหนักแต่รอดมาได้ ไม่มีหมอ มีแต่โชค', f: p => { p.health -= p.wealth > 55 ? 4 : 12; } },
  { w: 3, c: p => p.age > 5, t: () => 'คุณได้เพื่อนสนิทคนใหม่', f: p => { p.happy += 5; } },
  { w: 2, c: p => p.age >= 8 && p.age <= 45 && !p.done.parent, t: p => `${parentName(p)}จากไป`, f: p => { p.happy -= 10; p.done.parent = 1; p.wealth += p.cls <= 1 ? 8 : 0; } },
  { w: 1, c: p => p.age > 10, t: () => 'คุณเก็บถุงเงินที่ใครทำตกไว้ได้', f: p => { p.wealth += 4; } },
  { w: 2, c: p => p.cls === 0 && p.age > 12, t: () => 'คุณได้รับเชิญไปงานเลี้ยงที่ราชสำนัก', f: p => { p.happy += 5; p.wealth -= 2; } },
  { w: 3, c: p => p.cls === 4 && p.age > 6, t: () => 'คุณถูกขายต่อให้นายคนใหม่ ต้องแยกจากทุกคนที่รู้จัก', f: p => { p.happy -= 10; } },
  { w: 3, c: p => p.cls === 3 && p.age > 14, t: () => 'เจ้าที่ดินเกณฑ์แรงงานไปสร้างป้อม ทั้งฤดูไม่ได้ทำนาของตัวเอง', f: p => { p.health -= 5; p.wealth -= 3; } },
  { w: 2, c: p => has(p, 'grieve', 'dunes') && p.age > 12, t: () => 'โจรปล้นระหว่างทางกลับบ้าน', f: p => { p.wealth -= 5; p.happy -= 3; } },
  { w: 1, c: p => p.cls >= 2 && p.cls < 4 && p.know < 15 && p.age > 8 && !p.done.monk, t: () => 'พระเร่ร่อนรูปหนึ่งสอนคุณอ่านออกเขียนได้', f: p => { p.know += 10; p.flags.literate = true; p.done.monk = 1; } },
  { w: 2, c: p => p.kidNames.length > 0, t: p => `${pick(p.kidNames)} ลูกของคุณ ${pick(['หัดพูดคำแรกได้', 'วิ่งมากอดคุณตอนกลับบ้าน', 'ร้องเพลงที่คุณร้องตอนเด็กได้'])}`, f: p => { p.happy += 5; } },
  { w: 2, c: p => p.kidNames.length > 0 && Math.random() < p.realm.infant * 2.5, t: p => { const n = p.kidNames.splice(Math.floor(Math.random() * p.kidNames.length), 1)[0]; return `${n} ลูกของคุณจากไปก่อนวัยอันควร`; }, f: p => { p.happy -= 15; p.lostKids++; } },
  { w: 2, c: p => !has(p, 'serenth') && p.age > 4, t: () => 'ปีแห้งแล้ง อาหารแพงขึ้นสามเท่า', f: p => { p.health -= p.wealth > 50 ? 1 : 6; p.happy -= 4; p.wealth -= 3; } },
  { w: 3, c: p => has(p, 'aurelis', 'undercity') && p.flags.hiddenMage, t: () => 'ศาลศาสนาเผาหญิงชราที่ตลาดฐานใช้เวท คุณซ่อนมือที่สั่นไว้ในเสื้อ', f: p => { p.happy -= 8; } },
  { w: 1, c: p => p.age > 2, t: () => 'ดาวหางสีเถ้าผ่านฟ้า ผู้คนว่าเป็นลางร้าย', f: p => { p.know += 1; } },
  { w: 2, c: p => p.cls === 1 && p.age > 16, t: () => 'การค้าปีนี้ดี กองคาราวานกลับมาครบทุกคัน', f: p => { p.wealth += 8; p.happy += 3; } },
  { w: 2, c: p => p.age > 16 && p.wealth > 20, t: () => 'คนที่คุณไว้ใจโกงเงินแล้วหนีไป', f: p => { p.wealth -= 7; p.happy -= 4; } },
  { w: 2, c: p => p.flags.churchMage, t: () => 'ศาสนจักรส่งคุณไปเป็นนักเวทประจำทัพโดยไม่ถามความเห็น', f: p => { p.happy -= 5; p.flags.soldier = 2; } },
  { w: 2, c: p => p.flags.healer, t: () => 'คุณใช้เวทรักษาเด็กในหมู่บ้านให้รอดจากไข้', f: p => { p.happy += 6; } },
  { w: 2, c: p => p.flags.captive && p.age > 20, t: () => 'คุณเริ่มพูดภาษาของคนที่จับคุณมาได้คล่องกว่าภาษาแม่', f: p => { p.happy -= 3; p.know += 2; } },
  { w: 2, c: p => p.flags.fugitive, t: () => 'ประกาศจับหน้าตาคล้ายคุณติดอยู่ที่ประตูเมือง', f: p => { p.happy -= 5; } },
  { w: 2, c: p => p.flags.hero, t: () => 'เด็กๆ ในหมู่บ้านเล่นเป็นคุณในเกมสงคราม', f: p => { p.happy += 4; } },
  { w: 2, c: p => p.married && p.kin.spouse, t: p => `${p.kin.spouse} ${pick(['ทำอาหารที่คุณชอบรอไว้', 'ทะเลาะกับคุณเรื่องเงินทั้งคืน', 'นั่งดูดาวกับคุณจนรุ่งสาง'])}`, f: p => { p.happy += 2; } },
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
  { id: 'path', when: p => p.age === 13, prompt: p => p.cls === 4 ? 'อายุ 13 ปี เด็กคนอื่นเริ่มเลือกทางของตัวเอง ทาสไม่มีทางให้เลือก มีแค่ทำงานต่อ หรือหนี' : 'อายุ 13 ปี ถึงเวลาเลือกทางของตัวเอง',
    options: p => {
      if (p.cls === 0) return [
        opt('เข้าหอคัมภีร์', p => { p.know += 18; p.flags.literate = true; return 'คุณใช้เวลาหลายปีกับตำราที่คนส่วนใหญ่ในแผ่นดินไม่มีวันได้เห็น'; }),
        opt('ฝึกเป็นอัศวิน', p => { p.health += 10; p.wealth += 4; p.flags.knight = true; return 'คุณได้ดาบเล่มแรก และชื่ออยู่ในบัญชีทัพของตระกูล'; }),
        opt('ใช้ชีวิตในราชสำนัก', p => { p.happy += 10; return 'งานเลี้ยงกับการเมือง คุณเรียนรู้ว่าควรยิ้มให้ใคร'; }),
      ];
      if (p.cls === 1) return [
        opt('สืบทอดกิจการครอบครัว', p => { p.wealth += 12; return 'คุณเริ่มนั่งข้างพ่อแม่ที่โต๊ะบัญชี'; }),
        opt('ฝากตัวกับนักเล่นแร่', p => { p.know += 14; p.flags.literate = true; return 'ห้องทดลองเหม็นกำมะถัน แต่คุณได้อ่านหนังสือทุกวัน'; }),
        opt('ออกเดินทางกับกองคาราวาน', p => { p.happy += 6; p.wealth += 6; if (roll(.08)) { die(p, 'ถูกสัตว์ร้ายทำร้ายระหว่างเดินทาง'); return 'กองคาราวานถูกโจมตีกลางทาง'; } return 'คุณเห็นเจ็ดแคว้นก่อนอายุยี่สิบ'; }),
      ];
      if (p.cls === 4) return [
        opt('ก้มหน้าทำงานต่อไป', p => { p.health -= 3; return 'คุณทำงานต่อไปเหมือนทุกวัน'; }),
        opt('วางแผนหลบหนี', p => {
          if (roll(.35 + (T(p, 'cunning') ? .2 : 0))) { p.cls = 2; p.flags.fugitive = true; p.wealth = 5; p.happy += 15; return 'คุณหนีพ้นในคืนเดือนมืด ตอนนี้คุณเป็นอิสระ แต่ไม่มีอะไรติดตัวเลย'; }
          if (roll(.4)) { die(p, 'ถูกจับได้ระหว่างหลบหนี'); return 'สุนัขของนายตามกลิ่นคุณเจอก่อนรุ่งสาง'; }
          p.health -= 20; p.happy -= 15; return 'คุณถูกจับได้และถูกลงโทษหนัก';
        }),
      ];
      return [
        opt('ทำงานกับครอบครัวต่อ', p => { p.wealth += 3; p.happy += 2; return 'คุณรับช่วงงานที่พ่อแม่ทำมาทั้งชีวิต'; }),
        opt('ไปเป็นเด็กฝึกงานในเมือง', p => {
          if (roll(.5 + p.know / 100)) { p.know += 6; p.wealth += 4; return 'ช่างตีเหล็กคนหนึ่งยอมรับคุณเป็นศิษย์'; }
          p.happy -= 6; return 'ไม่มีใครรับเด็กจากที่ที่คุณมา คุณกลับบ้านมือเปล่า';
        }),
        opt('หนีออกจากบ้าน', p => {
          if (roll(.5)) { p.wealth += 8; p.happy += 8; return 'คุณไปตั้งตัวที่เมืองท่าได้ ชีวิตลำบากแต่เป็นของคุณ'; }
          p.wealth -= 8; p.health -= 10; return 'ข้างนอกโหดกว่าที่คิด คุณกลับมาในสภาพผอมโซ';
        }),
      ];
    } },
  { id: 'gift', when: p => p.gifted && p.age === 11, prompt: () => 'อายุ 11 ปี เปลวไฟเล็กๆ ลุกขึ้นบนฝ่ามือคุณเอง คุณมีพลังเวท',
    options: p => {
      if (has(p, 'aurelis', 'undercity')) return [
        opt('ลงทะเบียนกับศาสนจักร', p => { p.know += 20; p.wealth += 10; p.happy -= 10; p.flags.churchMage = true; return 'ชีวิตคุณเป็นของศาสนจักรตั้งแต่วันนี้ ปลอดภัย แต่ไม่ใช่ของคุณอีกแล้ว'; }),
        opt('ซ่อนพลังไว้', p => { p.flags.hiddenMage = true; return 'คุณสาบานกับตัวเองว่าจะไม่มีใครรู้'; }),
      ];
      if (has(p, 'serenth')) return [
        opt('เข้าหอเวทสูง', p => { p.know += 25; p.happy += 8; return 'ทั้งตระกูลจัดงานเฉลิมฉลอง ที่นี่พลังเวทคือเกียรติ'; }),
        opt('เก็บไว้ใช้เงียบๆ', p => { p.happy += 3; return 'คุณไม่ต้องการให้ใครคาดหวังอะไรจากคุณ'; }),
      ];
      return [
        opt('เป็นหมอยาประจำหมู่บ้าน', p => { p.happy += 10; p.health += 5; p.flags.healer = true; return 'คนในหมู่บ้านเริ่มเคาะประตูบ้านคุณตอนดึก'; }),
        opt('รับจ้างใช้เวทให้ขุนศึก', p => { p.wealth += 18; p.flags.warmage = true; return 'เงินดี แต่คุณอยู่แนวหน้าทุกครั้งที่มีศึก'; }),
      ];
    } },
  { id: 'love', when: p => p.age >= 18 && p.age <= 30 && roll(.3), prompt: p => { p.kin.cand = nameIn(p.realm); return p.cls === 4 ? `อายุ ${p.age} ปี นายของคุณจัดคู่ให้แล้ว ชื่อ${p.kin.cand}` : `อายุ ${p.age} ปี คุณรัก${p.kin.cand} แต่ครอบครัวอยากให้แต่งกับลูกบ้านที่มีฐานะกว่า`; },
    options: p => p.cls === 4 ? [
      opt('ยอมรับ', p => { p.married = true; p.kin.spouse = p.kin.cand; p.happy += 2; return `คุณแต่งงานกับ${p.kin.spouse} ทั้งที่ไม่เคยคุยกันมาก่อน`; }),
      opt('ปฏิเสธ', p => { p.health -= 12; p.happy -= 6; return 'คุณถูกลงโทษ และนายจะถามอีกครั้งปีหน้า'; }),
    ] : [
      opt(`แต่งงานกับ${p.kin.cand}`, p => { p.married = true; p.kin.spouse = p.kin.cand; p.happy += 15; if (has(p, 'serenth') && roll(.3)) p.flags.humanSpouse = true; return 'งานเล็ก แขกไม่กี่คน แต่คุณจำวันนั้นได้ทั้งชีวิต'; }),
      opt('แต่งงานเพื่อฐานะ', p => { p.married = true; p.kin.spouse = nameIn(p.realm); p.wealth += 14; p.happy -= 3; return `คุณแต่งกับ${p.kin.spouse} ครอบครัวพอใจ คุณบอกตัวเองว่าความรักมาทีหลังได้`; }),
      opt('อยู่ตัวคนเดียว', p => { p.happy += 2; return 'คุณเลือกเดินทางนี้ด้วยตัวเอง'; }),
    ] },
  { id: 'war', when: p => p.age >= 17 && p.age <= 45 && (p.realm.war >= .01 || roll(.05)) && roll(.2),
    prompt: p => `อายุ ${p.age} ปี ทหารมาเกณฑ์คนที่หมู่บ้าน ชื่อคุณอยู่ในรายชื่อ`,
    options: p => [
      opt('ไปรบ', p => { p.flags.soldier = 3; p.wealth += 6; p.happy -= 8; return 'คุณออกเดินทางไปแนวหน้าพร้อมคนรุ่นเดียวกันอีกสามสิบคน'; }),
      opt('หนีทหาร', p => { if (roll(.35 - (T(p, 'cunning') ? .2 : 0))) { p.health -= 15; p.wealth -= 10; p.happy -= 8; return 'คุณถูกจับได้ โดนลงโทษและปรับ'; } p.happy -= 3; return 'คุณซ่อนตัวในป่าจนทัพผ่านไป'; }),
      opt('จ่ายเงินให้คนอื่นไปแทน', p => { p.wealth -= 25; return 'เด็กหนุ่มจากบ้านที่จนกว่ารับเงินคุณไปแทน คุณไม่เคยรู้ว่าเขากลับมาไหม'; }, p => p.wealth >= 45, 'ต้องมีทรัพย์ 45 ขึ้นไป'),
    ] },
  { id: 'plague', when: p => p.age >= 10 && p.realm.plague >= .008 && roll(.12), prompt: p => `อายุ ${p.age} ปี ไข้เถ้าดำระบาดหนักในละแวกบ้าน`,
    options: p => [
      opt('หนีออกจากเมือง', p => { p.wealth -= 15; p.flags.fled = true; return 'คุณจ่ายค่าเกวียนออกไปอยู่ชนบทจนโรคซา'; }, p => p.wealth >= 35, 'ต้องมีทรัพย์ 35 ขึ้นไป'),
      opt('อยู่ดูแลครอบครัว', p => { p.happy += 4 + (T(p, 'kind') ? 6 : 0); if (roll(.2 * (1.2 - p.wealth / 100))) { die(p, 'ติดไข้เถ้าดำจากคนที่ดูแล'); return 'คุณดูแลทุกคนจนวันสุดท้าย'; } return 'คุณดูแลทุกคนจนโรคซา บางคนก็ไม่รอด'; }),
      opt('ไปหาหมอผีในหนอง', p => { p.wealth -= 4; if (roll(.12)) { die(p, 'ล้มป่วยด้วยไข้เถ้าดำ'); return 'ยาของหมอผีไม่ได้ผล'; } p.health += 3; return 'คุณได้เครื่องรางกับยาขม จะได้ผลหรือไม่ไม่มีใครรู้'; }),
    ] },
  { id: 'migrate', when: p => p.age >= 18 && p.age <= 40 && has(p, 'grieve', 'mulvane', 'dunes') && roll(.1),
    prompt: p => `อายุ ${p.age} ปี ได้ยินมาว่าที่ออเรลิสมีงานและมีอาหารเหลือกิน`,
    options: p => [
      opt('อพยพไปออเรลิส', p => {
        p.wealth -= 10;
        if (p.wealth >= 45 && roll(.6)) { p.realm = RBY.aurelis; p.happy += 8; return 'คุณจ่ายค่าผ่านประตูและได้เข้าเมืองชั้นใน'; }
        p.realm = RBY.undercity; p.happy -= 4; return 'ทหารที่ประตูชั้นในไม่ให้คนแบบคุณเข้า คุณได้ที่นอนใต้กำแพงแทน';
      }),
      opt('อยู่ที่เดิม', () => 'คุณอยู่ที่ที่คุณเกิด'),
    ] },
  { id: 'child', repeat: 4, when: p => p.married && p.age >= 19 && p.age <= 40 && roll(.3),
    prompt: p => `อายุ ${p.age} ปี คุณกับ${p.kin.spouse || 'คู่ชีวิต'}คุยกันเรื่องมีลูก`,
    options: p => [
      opt('มีลูก', p => {
        if (p.sex === 'ญ' && roll(p.realm.infant * .12)) { die(p, 'เสียชีวิตขณะคลอดบุตร'); return 'การคลอดครั้งนี้ยากเกินไป'; }
        const n = nameIn(p.realm);
        if (roll(p.realm.infant)) { p.lostKids++; p.happy -= 12; return `${n} ลูกของคุณไม่รอดถึงขวบปีแรก`; }
        p.kidNames.push(n); p.happy += 8; return `${n} ลูกคนใหม่เกิดมาแข็งแรง`;
      }),
      opt('ยังไม่พร้อม', () => 'คุณตัดสินใจรอไปก่อน'),
    ] },
  { id: 'debt', when: p => p.age > 20 && p.wealth < 12 && p.cls >= 2 && p.cls < 4 && roll(.12),
    prompt: p => `อายุ ${p.age} ปี เงินหมด ไม่มีอะไรกินแล้ว`,
    options: p => [
      opt('กู้เงินเจ้าที่ดิน', p => { p.wealth += 15; p.flags.debt = true; if (p.cls === 2 && roll(.5)) { p.cls = 3; return 'คุณใช้หนี้ไม่ไหว สุดท้ายต้องขายตัวเป็นไพร่ติดที่ดิน'; } return 'ดอกเบี้ยจะกินคุณไปอีกหลายปี'; }),
      opt('ขายของมีค่าที่เหลือ', p => { p.wealth += 6; p.happy -= 6; return 'คุณขายแหวนของแม่ไป'; }),
      opt('ทนหิวต่อไป', p => { p.health -= 12; return 'ทั้งฤดูหนาวคุณกินวันละมื้อ'; }),
    ] },
  // ----- realm-specific -----
  { id: 'inquisition', when: p => has(p, 'aurelis') && p.age >= 16 && p.age <= 50 && roll(.1),
    prompt: p => `อายุ ${p.age} ปี ศาลศาสนาขอให้คุณชี้ตัวเพื่อนบ้านที่ต้องสงสัยว่าใช้เวท`,
    options: p => [
      opt('ชี้ตัว', p => { p.wealth += 10; p.happy -= 10; p.flags.betrayer = true; return 'คุณได้รางวัลเป็นเงิน บ้านข้างๆ เงียบไปตั้งแต่วันนั้น'; }),
      opt('ปฏิเสธว่าไม่รู้อะไร', p => { if (roll(.25)) { p.health -= 15; return 'คุณถูกเรียกไปสอบสวนสามวัน'; } return 'พวกเขาจดชื่อคุณไว้แล้วกลับไป'; }),
      opt('ช่วยเพื่อนบ้านหนีออกจากเมือง', p => { p.happy += 10 + (T(p, 'kind') ? 5 : 0); p.flags.savedOther = true; if (roll(.15)) { die(p, 'ถูกศาลศาสนาประหาร ฐานช่วยแม่มดหลบหนี'); return 'มีคนเห็นคุณที่ประตูเมืองคืนนั้น'; } return 'เธอหายไปในความมืดนอกกำแพง และส่งจดหมายมาขอบคุณหนึ่งปีต่อมา'; }),
    ] },
  { id: 'gatepass', when: p => has(p, 'undercity') && p.age >= 15 && p.age <= 40 && roll(.12),
    prompt: p => `อายุ ${p.age} ปี มีคนแอบเสนอขายบัตรผ่านประตูชั้นในปลอม`,
    options: p => [
      opt('ซื้อบัตร', p => { p.wealth -= 18; if (roll(.45 + (T(p, 'cunning') ? .2 : 0))) { p.realm = RBY.aurelis; p.happy += 12; return 'ยามมองบัตรนานจนคุณหยุดหายใจ แล้วโบกมือให้ผ่าน คุณอยู่ในเมืองชั้นในแล้ว'; } p.health -= 12; return 'ยามจับได้ คุณถูกเฆี่ยนและยึดเงิน'; }, p => p.wealth >= 18, 'ต้องมีทรัพย์ 18 ขึ้นไป'),
      opt('เข้าร่วมกลุ่มต่อต้านใต้กำแพง', p => { p.flags.rebel = true; p.happy += 4; return 'คุณเริ่มไปประชุมลับในโรงฟอกหนังทุกคืนวันที่เจ็ด'; }),
      opt('ไม่ยุ่ง', () => 'คุณเดินผ่านไป'),
    ] },
  { id: 'riot', when: p => p.flags.rebel && p.age >= 18 && roll(.25),
    prompt: p => `อายุ ${p.age} ปี กลุ่มต่อต้านนัดบุกประตูชั้นในคืนพรุ่งนี้`,
    options: p => [
      opt('ไปยืนแถวหน้า', p => { p.flags.rose = true; const u = Math.random(); if (u < .3 + luck(p)) { p.wealth += 15; p.happy += 15; return 'ประตูเปิดอยู่หนึ่งคืน คนใต้กำแพงได้เดินบนถนนทองคำเป็นครั้งแรก และศาลยอมลดภาษีให้'; } if (u < .65) { die(p, 'เสียชีวิตในการลุกฮือที่ประตูชั้นใน'); return 'ทหารม้าออกมาจากประตูก่อนรุ่งสาง'; } p.cls = 4; p.happy -= 15; return 'คุณถูกจับและถูกขายเป็นทาสชดใช้'; }),
      opt('ช่วยอยู่เบื้องหลัง', p => { p.flags.rose = true; p.happy += 3; return 'คุณเย็บผ้าพันแผลทั้งคืน การลุกฮือล้มเหลว แต่คนพูดถึงมันอีกนาน'; }),
      opt('ถอนตัว', p => { p.flags.rebel = false; p.happy -= 5; return 'คุณปิดประตูบ้านแล้วฟังเสียงจากข้างนอก'; }),
    ] },
  { id: 'refugee', when: p => has(p, 'serenth') && p.age >= 20 && roll(.04),
    prompt: p => `อายุ ${p.age} ปี เด็กผู้ลี้ภัยมนุษย์คนหนึ่งแอบขึ้นมาบนเกาะลอยได้ และซ่อนอยู่ในสวนของคุณ`,
    options: p => [
      opt('ซ่อนไว้และเลี้ยงดู', p => { p.happy += 8; p.flags.savedOther = true; if (roll(.25)) { p.wealth -= 30; if (p.cls === 0) p.cls = 2; return 'สภาผู้อาวุโสรู้เข้า คุณถูกถอดยศและยึดทรัพย์ เด็กถูกส่งลงไปข้างล่าง'; } return 'เด็กโตขึ้นในบ้านคุณ และเรียกคุณด้วยคำที่ใช้เรียกพ่อแม่'; }),
      opt('ส่งตัวให้ยาม', p => { p.happy -= 6; return 'เด็กถูกส่งกลับลงไปใต้เมฆเถ้า คุณไม่ได้ถามว่าไปที่ไหน'; }),
      opt('แอบพาไปส่งที่พื้นดิน', p => { p.happy += 4; p.know += 5; return 'คุณเห็นแผ่นดินข้างล่างด้วยตาตัวเองเป็นครั้งแรก มันแย่กว่าที่ตำราเขียน'; }),
    ] },
  { id: 'ennui', when: p => has(p, 'serenth') && p.age >= 110 && roll(.05),
    prompt: p => `อายุ ${p.age} ปี ผ่านไปกว่าร้อยปี คุณเริ่มลืมว่าตื่นเช้ามาเพื่ออะไร`,
    options: p => [
      opt('ลงไปใช้ชีวิตบนแผ่นดินเบื้องล่าง', p => { p.realm = RBY.grieve; p.happy += 10; p.wealth -= 20; return 'คุณลงไปที่ราบเถ้า คนที่นั่นอายุสั้นกว่าคุณสิบเท่า และใช้ชีวิตเร็วกว่าคุณสิบเท่า'; }),
      opt('ศึกษาคัมภีร์ต่ออีกร้อยปี', p => { p.know += 15; p.happy -= 4; return 'หอสมุดยังมีห้องที่คุณไม่เคยเข้า'; }),
      opt('จัดสวนใหม่ทั้งหมด', p => { p.happy += 6; return 'ต้นไม้ที่คุณปลูกวันนี้จะโตเต็มที่ในอีกสองร้อยปี คุณจะได้เห็นมัน'; }),
    ] },
  { id: 'stonedoor', when: p => has(p, 'kragmor') && p.age >= 16 && p.age <= 60 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี คนงานขุดเจอประตูหินเก่าแก่ที่ไม่มีใครรู้จักใต้ชั้นแร่`,
    options: p => [
      opt('เปิดประตูเอง', p => { const u = Math.random(); if (u < .3 + luck(p)) { p.wealth += 30; p.know += 10; p.flags.treasure = true; return 'ข้างในเป็นคลังของกษัตริย์คนแคระที่ถูกลืม คุณแบกทองออกมาได้สองถุง'; } if (u < .55) { p.health -= 25; return 'อากาศข้างในเป็นพิษ คุณไอทั้งปี'; } if (u < .65) { die(p, 'หายไปหลังประตูหินใต้ภูเขา'); return 'ประตูปิดลงข้างหลังคุณ'; } return 'ข้างในว่างเปล่า มีแต่ฝุ่นอายุพันปี'; }),
      opt('รายงานต่อขุนนาง', p => p.cls <= 1 ? (p.wealth += 20, 'ของในห้องตกเป็นของตระกูลคุณตามกฎเหมือง') : (p.wealth += 2, p.happy -= 5, 'ขุนนางเอาไปทั้งหมด คุณได้เหรียญเงินหนึ่งเหรียญเป็นค่าตอบแทน')),
      opt('ปิดผนึกไว้ตามเดิม', () => 'บางประตูไม่ควรเปิด คุณบอกตัวเองอย่างนั้น'),
    ] },
  { id: 'strike', when: p => has(p, 'kragmor') && p.cls >= 2 && p.cls < 4 && p.age >= 18 && p.age <= 55 && roll(.1),
    prompt: p => `อายุ ${p.age} ปี คนงานเหมืองนัดหยุดงาน เรียกร้องค่าชดเชยให้ครอบครัวคนที่ตายในอุโมงค์`,
    options: p => [
      opt('ร่วมนัดหยุดงาน', p => { if (roll(.5)) { p.wealth += 8; p.happy += 8; p.flags.safeMine = true; return 'เจ้าเหมืองยอมค้ำอุโมงค์ใหม่ทั้งหมด ปีต่อมาคนตายในเหมืองน้อยลงครึ่งหนึ่ง'; } p.wealth -= 15; p.happy -= 5; return 'เจ้าเหมืองจ้างคนใหม่ทั้งหมด คุณตกงาน'; }),
      opt('ทำงานต่อ', p => { p.wealth += 5; p.happy -= 8; return 'คุณได้ค่าแรงสองเท่า และเพื่อนร่วมงานไม่มองหน้าคุณอีกเลย'; }),
      opt('แจ้งรายชื่อแกนนำให้หัวหน้า', p => { p.wealth += 12; p.happy -= 12; p.flags.betrayer = true; return 'แกนนำสามคนหายไปจากเหมือง คุณได้เลื่อนตำแหน่ง'; }),
    ] },
  { id: 'enemychild', when: p => has(p, 'grieve') && p.age >= 18 && p.age <= 60 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี คุณพบเด็ก${p.race === 'ออร์ค' ? 'มนุษย์' : 'ออร์ค'}บาดเจ็บอยู่กลางทุ่ง เด็กจากฝ่ายที่ฆ่าคนในหมู่บ้านคุณ`,
    options: p => [
      opt('พากลับไปรักษา', p => { p.happy += 6 + (T(p, 'kind') ? 6 : 0); p.flags.savedOther = true; if (roll(.3)) { p.happy -= 12; p.wealth -= 8; return 'คนในหมู่บ้านรู้เข้า บ้านคุณถูกเผาไปครึ่งหลัง แต่เด็กรอด'; } return 'สามปีต่อมา ทัพของอีกฝ่ายผ่านหมู่บ้านคุณไปโดยไม่แตะต้องอะไร'; }),
      opt('ทิ้งไว้ตรงนั้น', p => { p.happy -= 6; return 'คุณเดินกลับบ้านโดยไม่หันไปมอง'; }),
      opt('ส่งตัวให้ทหาร', p => { p.wealth += 6; p.happy -= 10; return 'ทหารให้เงินคุณสองเหรียญ'; }),
    ] },
  { id: 'trial', when: p => has(p, 'mulvane') && p.age >= 15 && p.age <= 50 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี นักเล่นแร่จากออเรลิสมาเสนอเงินก้อนใหญ่ แลกกับการทดลองยารักษาไข้เถ้าดำกับตัวคุณ`,
    options: p => [
      opt('รับเงินและยอมให้ทดลอง', p => { p.wealth += 22; const u = Math.random(); if (u < .45 + luck(p)) { p.flags.immune = true; p.health += 10; return 'ยาได้ผล คุณไม่ติดไข้เถ้าดำอีกเลย นักเล่นแร่ขายยานี้ในออเรลิสในราคาที่คนหนองซื้อไม่ได้'; } if (u < .8) { p.health -= 22; return 'ยาทำให้ตับคุณพัง แต่คุณยังมีชีวิตอยู่'; } die(p, 'ไม่รอดจากยาทดลองของนักเล่นแร่'); return 'ชื่อคุณอยู่ในบันทึกของเขาในฐานะ "ตัวอย่างที่ 14"'; }),
      opt('ปฏิเสธ', () => 'เขาไปเคาะบ้านถัดไป ซึ่งจนกว่าบ้านคุณ'),
    ] },
  { id: 'crown', when: p => has(p, 'mulvane') && p.age >= 14 && p.age <= 45 && roll(.06),
    prompt: p => `อายุ ${p.age} ปี คนเฒ่าเล่าว่าใต้หนองดำมีมงกุฎของกษัตริย์ก็อบลินองค์สุดท้ายจมอยู่`,
    options: p => [
      opt('ดำลงไปหา', p => { const u = Math.random(); if (u < .2 + luck(p)) { p.wealth += 35; p.flags.treasure = true; return 'นิ้วคุณแตะโลหะในโคลน มงกุฎมีจริง'; } if (u < .35) { die(p, 'จมหายไปในหนองดำ'); return 'โคลนดูดคุณลงไป'; } p.health -= 8; return 'คุณได้แต่โคลนกับปลิงกลับมา'; }),
      opt('หัวเราะแล้วกลับบ้าน', () => 'คุณได้ยินเรื่องนี้มาตั้งแต่เด็ก'),
    ] },
  { id: 'oasis', when: p => has(p, 'dunes') && p.age >= 16 && p.age <= 55 && roll(.1),
    prompt: p => `อายุ ${p.age} ปี ฝูงสัตว์ใกล้ตายเพราะขาดน้ำ บ่อน้ำเดียวที่ใกล้ที่สุดเป็นของอีกเผ่า`,
    options: p => [
      opt('เจรจาแลกของ', p => { p.wealth -= 8; return 'คุณแลกพรมสามผืนกับน้ำหนึ่งคืน ทั้งสองเผ่ากินเลี้ยงด้วยกัน'; }),
      opt('บุกยึดบ่อน้ำ', p => { const u = Math.random(); if (u < .5 + (T(p, 'brave') ? .15 : 0)) { p.wealth += 12; return 'เผ่าของคุณยึดบ่อได้ อีกเผ่าต้องเดินต่อไปในทะเลทราย'; } if (u < .85) { p.health -= 15; return 'คุณถูกตีถอยกลับมาพร้อมแผล'; } die(p, 'เสียชีวิตในการแย่งบ่อน้ำ'); return 'การแย่งบ่อน้ำจบลงก่อนตะวันตกดิน'; }),
      opt('เดินต่อไปหาที่ใหม่', p => roll(.5) ? 'สามวันต่อมาคุณเจอบ่อน้ำที่ไม่มีใครรู้จัก' : (p.wealth -= 15, p.health -= 10, 'ครึ่งฝูงไม่รอดถึงบ่อถัดไป')),
    ] },
  { id: 'guide', when: p => has(p, 'dunes') && p.age >= 18 && p.age <= 50 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี กองคาราวานจากออเรลิสจ้างคุณนำทางผ่านเขตพายุแก้ว ค่าจ้างเท่ากับรายได้สามปี`,
    options: p => [
      opt('รับงาน', p => { if (roll(.08 - luck(p) / 2)) { die(p, 'หลงทางในพายุทรายแก้ว'); return 'พายุมาเร็วกว่าที่คุณอ่านจากฟ้า'; } p.wealth += 18; return 'คุณพาทุกคนผ่านไปได้ พ่อค้าจ่ายเงินครบ และไม่เคยถามชื่อคุณ'; }),
      opt('ปฏิเสธ', () => 'คนที่รับงานแทนคุณไม่ได้กลับมา'),
    ] },
  // ----- general -----
  { id: 'stranger', when: p => p.age >= 20 && p.age <= 70 && p.cls < 4 && roll(.05),
    prompt: p => `อายุ ${p.age} ปี นักเดินทางบาดเจ็บมาเคาะประตูขอพักค้างคืน`,
    options: p => [
      opt('ให้พัก', p => { p.happy += T(p, 'kind') ? 8 : 3; const u = Math.random(); if (u < .5) { p.wealth += 10; p.know += 5; return 'เขาเป็นนักปราชญ์ที่หนีมาจากออเรลิส ก่อนไปเขาทิ้งหนังสือกับเงินไว้ให้'; } if (u < .8) return 'เขาจากไปตอนเช้าพร้อมคำขอบคุณ'; p.wealth -= 10; return 'ตอนเช้าเขาหายไปพร้อมของมีค่าในบ้าน'; }),
      opt('ไม่เปิดประตู', () => 'เสียงเคาะเงียบไปตอนดึก'),
    ] },
  { id: 'dice', when: p => p.age >= 18 && p.wealth >= 10 && p.cls < 4 && roll(.05),
    prompt: p => `อายุ ${p.age} ปี วงพนันลูกเต๋ากระดูกในโรงเตี๊ยมกำลังคึกคัก`,
    options: p => [
      opt('ลงทั้งหมดที่มี', p => { if (roll(.45 + luck(p))) { p.wealth = clamp(p.wealth * 2); p.happy += 8; return 'ลูกเต๋าออกหกสามลูก ทั้งโรงเตี๊ยมเงียบ'; } p.wealth = p.wealth * .3; p.happy -= 10; return 'คุณเดินกลับบ้านตัวเปล่าใต้แสงจันทร์'; }),
      opt('เล่นนิดหน่อย', p => { const g = roll(.5) ? 4 : -4; p.wealth += g; return g > 0 ? 'ได้มานิดหน่อย พอซื้อเหล้าหนึ่งเหยือก' : 'เสียไปนิดหน่อย'; }),
      opt('ไม่เล่น', () => 'คุณนั่งดูคนอื่นเล่น'),
    ] },
  { id: 'parentsick', when: p => p.age >= 18 && p.age <= 45 && !p.done.parent && roll(.07),
    prompt: p => `อายุ ${p.age} ปี ${p.kin.mother} แม่ของคุณป่วยหนัก ยาที่ช่วยได้ราคาเท่ากับครึ่งหนึ่งของทุกอย่างที่คุณมี`,
    options: p => [
      opt('ซื้อยา', p => { p.wealth *= .5; p.done.parent = 1; if (roll(.7)) { p.happy += 8; return `${p.kin.mother}หายดี และอยู่ต่อมาอีกหลายปี`; } p.happy -= 10; return 'ยาไม่ได้ผล คุณเสียทั้งแม่และเงิน'; }),
      opt('ดูแลเองที่บ้าน', p => { p.done.parent = 1; if (roll(.35)) { p.happy += 6; return 'แม่ของคุณฟื้นตัวช้าๆ ด้วยซุปกับการดูแล'; } p.happy -= 14; return `${p.kin.mother}จากไปในอ้อมแขนของคุณ`; }),
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
  { id: 'unborn', n: 'ไม่ทันได้ลืมตา', d: 'จากไปในขวบปีแรก', c: p => p.age === 0 },
  { id: 'deathdodger', n: 'ผู้หนีความตาย', d: 'รอดจากความตายอย่างน้อย 2 ครั้ง', c: p => p.flags.reprieves >= 2 },
  { id: 'escaped', n: 'โซ่ที่ขาด', d: 'หนีจากความเป็นทาสได้สำเร็จ', c: p => p.flags.fugitive && p.bornCls === 4 },
  { id: 'ashtogold', n: 'จากเถ้าสู่ทอง', d: 'เกิดเป็นไพร่หรือทาส แต่มีทรัพย์ 70 ขึ้นไป', c: p => p.bornCls >= 3 && p.wealth >= 70 },
  { id: 'fallen', n: 'ร่วงจากหอคอย', d: 'เกิดเป็นขุนนางหรือพ่อค้า แต่จบชีวิตเป็นไพร่หรือทาส', c: p => p.bornCls <= 1 && p.cls >= 3 },
  { id: 'elder', n: 'ผู้เฒ่าแห่งแดน', d: 'อยู่นานกว่าอายุขัยเฉลี่ยของแดนที่เกิดสองเท่า', c: (p, ws) => p.age >= Math.max(40, ws[p.born.id].mean * 2) },
  { id: 'sage', n: 'ปราชญ์', d: 'มีความรู้ 80 ขึ้นไป', c: p => p.know >= 80 },
  { id: 'rebel', n: 'เสียงจากใต้กำแพง', d: 'ร่วมลุกฮือที่ประตูชั้นใน', c: p => p.flags.rose },
  { id: 'witch', n: 'แม่มดที่ไม่มีใครรู้', d: 'ซ่อนพลังเวทจนตายด้วยวัยชรา', c: p => p.flags.hiddenMage && p.cause.includes('วัยชรา') },
  { id: 'mercy', n: 'มือที่ยื่นข้ามเส้น', d: 'ช่วยคนที่ไม่มีใครช่วย', c: p => p.flags.savedOther },
  { id: 'traitor', n: 'ผู้ชี้ตัว', d: 'ทรยศคนอื่นเพื่อตัวเอง', c: p => p.flags.betrayer },
  { id: 'hero', n: 'ผู้ยืนอยู่เมื่อฝุ่นจาง', d: 'รอดจากแนวรบที่แตกด้วยการสู้', c: p => p.flags.hero },
  { id: 'treasure', n: 'ผู้ค้นพบ', d: 'พบสมบัติที่ถูกลืม', c: p => p.flags.treasure },
  { id: 'dynasty', n: 'สายเลือดสามรุ่น', d: 'เล่นต่อในฐานะลูกหลานจนถึงรุ่นที่ 3', c: p => p.gen >= 3 },
  { id: 'average', n: 'ตามสถิติ', d: 'ตายในอายุห่างจากค่าเฉลี่ยของแดนไม่เกิน 1 ปี', c: (p, ws) => p.age > 0 && Math.abs(p.age - ws[p.born.id].mean) <= 1 },
  { id: 'captive', n: 'เชลยศึก', d: 'ยอมจำนนเพื่อแลกชีวิต', c: p => p.flags.captive },
];
function legendsFor(p, ws) { return LEGENDS.filter(l => { try { return l.c(p, ws); } catch (e) { return false; } }); }

if (typeof module !== 'undefined') module.exports = { REALMS, simLife, worldStats, makePerson, legendsFor, CHOICES };

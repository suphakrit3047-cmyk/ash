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

function makePerson(realm) {
  const r = realm || wpick(REALMS, x => x.birth);
  const cls = wpick([0, 1, 2, 3, 4], i => r.classW[i]);
  const sex = Math.random() < .5 ? 'ญ' : 'ช';
  const p = {
    name: pick(r.names[0]) + pick(r.names[1]), sex, realm: r, born: r, cls, bornCls: cls,
    race: pick(r.race), age: 0, alive: true,
    health: clamp(r.health + R(-10, 10) + (2 - cls) * 4),
    wealth: clamp(r.wealth + [35, 18, 0, -8, -12][cls] + R(-5, 5)),
    know: 0, happy: clamp(55 + (2 - cls) * 4 + R(-5, 5)),
    gifted: Math.random() < .05, married: false, kids: 0, lostKids: 0,
    focus: 'work', flags: {}, done: {}, years: [], cause: null,
  };
  return p;
}

// ---------- hazards ----------
function hazards(p) {
  const r = p.realm, a = p.age, f = p.flags;
  const cm = [.6, .8, 1, 1.1, 1.25][p.cls];
  const hm = .6 + (100 - p.health) / 100 * .8;
  const H = [];
  const base = a === 0 ? r.infant : a < 5 ? r.child * 2 : a < 15 ? r.child : r.adult;
  H.push([a === 0 ? 'จากไปด้วยไข้ในขวบปีแรก' : a < 5 ? 'จากไปด้วยโรคในวัยเด็ก' : 'ล้มป่วยหนักและไม่หาย', base * cm * hm]);
  if (a > r.agingStart) H.push(['จากไปอย่างสงบด้วยวัยชรา', .008 * Math.exp((a - r.agingStart) / r.agingScale)]);
  if (a >= 16 && a <= 55) {
    let w = r.war * (p.cls === 0 ? .4 : 1) * (f.knight ? 1.6 : 1);
    if (f.soldier > 0) w += .07;
    if (f.warmage) w += .025;
    H.push(['เสียชีวิตในสงครามชายแดน', w]);
  }
  H.push(['ล้มป่วยด้วยไข้เถ้าดำ', r.plague * (1.2 - p.wealth / 100 * .8) * (f.fled ? .3 : 1)]);
  H.push(['อดอยากในฤดูที่ยาวนาน', r.famine * (1 - p.wealth / 100) * (a < 5 ? 1.5 : 1)]);
  if (r.mine && a >= 12 && p.cls >= 2) H.push(['อุโมงค์เหมืองถล่มทับ', r.mine]);
  if (r.beast) H.push(['ถูกสัตว์ร้ายทำร้าย', r.beast]);
  if (f.hiddenMage) H.push(['ถูกศาลศาสนาตัดสินประหาร ฐานใช้เวทนอกศาสนจักร', .03]);
  return H;
}
function rollDeath(p) {
  const H = hazards(p);
  let sum = H.reduce((s, h) => s + h[1], 0);
  sum = Math.min(sum, .97);
  if (Math.random() < sum) { const h = wpick(H, x => x[1]); die(p, h[0]); return true; }
  return false;
}
function die(p, cause) { p.alive = false; p.cause = cause; }

// ---------- drift & focus ----------
function drift(p) {
  const r = p.realm;
  const ageDrop = p.age > r.agingStart ? (p.age - r.agingStart) * 1.3 : 0;
  const tH = r.health + (2 - p.cls) * 3 - ageDrop;
  p.health = clamp(p.health + (tH - p.health) * .12 + R(-2, 2));
  const tP = 40 + p.wealth * .3 + (p.married ? 8 : 0) - (p.cls === 4 ? 15 : 0) + Math.min(p.kids, 3) * 2;
  p.happy = clamp(p.happy + (tP - p.happy) * .18 + R(-3, 3));
  if (p.flags.debt) { p.wealth = clamp(p.wealth - 3); }
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
      let access = p.cls <= 1 || p.flags.literate || (p.cls < 4 && Math.random() < r.lit);
      if (access) { p.know = clamp(p.know + 4 + R(0, 2)); p.flags.literate = true; }
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
const has = (p, ...ids) => ids.includes(p.realm.id);
const EVENTS = [
  { w: 3, c: p => !has(p, 'serenth', 'undercity') && p.age > 6, t: () => 'ปีนี้เก็บเกี่ยวได้ดี ทุกบ้านมีกินพอ', f: p => { p.happy += 5; p.wealth += 3; } },
  { w: 3, c: p => p.cls >= 2 && p.age > 14, t: () => 'เจ้าที่ดินขึ้นภาษีเป็นครั้งที่สามในปีนี้', f: p => { p.wealth -= 6; p.happy -= 4; } },
  { w: 2, c: p => has(p, 'aurelis'), t: () => 'เทศกาลสุริยะ ทั้งเมืองมีงานเลี้ยงเจ็ดวัน', f: p => { p.happy += 6; } },
  { w: 3, c: p => has(p, 'undercity') && p.age > 5, t: () => 'ยามปิดประตูชั้นในเร็วกว่าเดิม คนใต้กำแพงที่ทำงานในเมืองต้องนอนข้างถนน', f: p => { p.happy -= 4; p.health -= 2; } },
  { w: 2, c: p => has(p, 'undercity') && p.age > 8, t: () => 'คุณยืนดูขบวนแห่ของขุนนางผ่านไปบนถนนที่คนแถวบ้านสร้าง', f: p => { p.happy -= 2; } },
  { w: 3, c: p => has(p, 'serenth') && p.age > 15, t: () => 'สภาผู้อาวุโสปฏิเสธผู้ลี้ภัยที่ท่าเรือลอยฟ้าอีกครั้ง คุณมองเห็นพวกเขาจากระเบียง', f: p => { p.know += 1; } },
  { w: 3, c: p => has(p, 'serenth') && p.age > 10, t: () => 'คุณเรียนภาษาที่ตายไปแล้วได้อีกหนึ่งภาษา', f: p => { p.know += 4; } },
  { w: 2, c: p => has(p, 'serenth') && p.married && p.age > 60 && p.flags.humanSpouse, t: () => 'คนรักชาวมนุษย์ของคุณแก่ลงทุกปี ขณะที่คุณยังเหมือนเดิม', f: p => { p.happy -= 6; } },
  { w: 3, c: p => has(p, 'kragmor') && p.age > 14, t: () => 'คนงานพบสายแร่ทองเส้นใหม่ใต้ภูเขา', f: p => { p.wealth += p.cls <= 1 ? 10 : 3; p.happy += 2; } },
  { w: 3, c: p => has(p, 'grieve') && p.age > 3, t: () => 'กองทัพเดินผ่านหมู่บ้าน ยึดเสบียงไปครึ่งหนึ่ง', f: p => { p.wealth -= 8; p.health -= 4; p.happy -= 5; } },
  { w: 2, c: p => has(p, 'grieve') && p.age > 10, t: () => 'มีการพักรบหนึ่งฤดู ผู้คนกล้าออกไปไถนาไกลจากบ้าน', f: p => { p.happy += 5; p.wealth += 3; } },
  { w: 3, c: p => has(p, 'mulvane') && p.age > 3, t: () => 'น้ำในหนองขึ้นสูง บ้านไม้ค้ำพังลงไปครึ่งหลัง', f: p => { p.wealth -= 5; p.health -= 3; } },
  { w: 2, c: p => has(p, 'mulvane') && p.age > 8, t: () => 'หมอผีในหนองสอนคุณว่าใบไม้ชนิดไหนกินได้ ชนิดไหนกินแล้วตาย', f: p => { p.know += 3; p.health += 2; } },
  { w: 3, c: p => has(p, 'dunes') && p.age > 3, t: () => 'พายุทรายแก้วพัดผ่าน สัตว์ในฝูงตายไปหลายตัว', f: p => { p.wealth -= 6; p.happy -= 3; } },
  { w: 2, c: p => has(p, 'dunes') && p.age > 6, t: () => 'ฝนตกในทะเลทรายเป็นครั้งแรกในรอบสี่ปี ทั้งเผ่าเต้นรำกลางสายฝน', f: p => { p.happy += 7; p.wealth += 2; } },
  { w: 2, c: p => p.age > 3, t: p => p.wealth > 55 ? 'คุณป่วยหนัก หมอประจำตระกูลรักษาจนหาย' : 'คุณป่วยหนักแต่รอดมาได้ ไม่มีหมอ มีแต่โชค', f: p => { p.health -= p.wealth > 55 ? 4 : 12; } },
  { w: 3, c: p => p.age > 5, t: () => 'คุณได้เพื่อนสนิทคนใหม่', f: p => { p.happy += 5; } },
  { w: 2, c: p => p.age >= 8 && p.age <= 45 && !p.done.parent, t: () => 'พ่อหรือแม่ของคุณจากไป', f: p => { p.happy -= 10; p.done.parent = 1; p.wealth += p.cls <= 1 ? 8 : 0; } },
  { w: 1, c: p => p.age > 10, t: () => 'คุณเก็บถุงเงินที่ใครทำตกไว้ได้', f: p => { p.wealth += 4; } },
  { w: 2, c: p => p.cls === 0 && p.age > 12, t: () => 'คุณได้รับเชิญไปงานเลี้ยงที่ราชสำนัก', f: p => { p.happy += 5; p.wealth -= 2; } },
  { w: 3, c: p => p.cls === 4 && p.age > 6, t: () => 'คุณถูกขายต่อให้นายคนใหม่ ต้องแยกจากทุกคนที่รู้จัก', f: p => { p.happy -= 10; } },
  { w: 3, c: p => p.cls === 3 && p.age > 14, t: () => 'เจ้าที่ดินเกณฑ์แรงงานไปสร้างป้อม ทั้งฤดูไม่ได้ทำนาของตัวเอง', f: p => { p.health -= 5; p.wealth -= 3; } },
  { w: 2, c: p => has(p, 'grieve', 'dunes') && p.age > 12, t: () => 'โจรปล้นระหว่างทางกลับบ้าน', f: p => { p.wealth -= 5; p.happy -= 3; } },
  { w: 1, c: p => p.cls >= 2 && p.cls < 4 && p.know < 15 && p.age > 8 && !p.done.monk, t: () => 'พระเร่ร่อนรูปหนึ่งสอนคุณอ่านออกเขียนได้', f: p => { p.know += 10; p.flags.literate = true; p.done.monk = 1; } },
  { w: 2, c: p => p.kids > 0, t: () => 'ลูกของคุณหัดพูดคำแรกได้', f: p => { p.happy += 5; } },
  { w: 2, c: p => p.kids > 0 && Math.random() < p.realm.infant * 2.5, t: () => 'ลูกคนหนึ่งของคุณจากไปก่อนวัยอันควร', f: p => { p.happy -= 15; p.kids--; p.lostKids++; } },
  { w: 2, c: p => !has(p, 'serenth') && p.age > 4, t: () => 'ปีแห้งแล้ง อาหารแพงขึ้นสามเท่า', f: p => { p.health -= p.wealth > 50 ? 1 : 6; p.happy -= 4; p.wealth -= 3; } },
  { w: 3, c: p => has(p, 'aurelis', 'undercity') && p.flags.hiddenMage, t: () => 'ศาลศาสนาเผาหญิงชราที่ตลาดฐานใช้เวท คุณซ่อนมือที่สั่นไว้ในเสื้อ', f: p => { p.happy -= 8; } },
  { w: 1, c: p => p.age > 2, t: () => 'ดาวหางสีเถ้าผ่านฟ้า ผู้คนว่าเป็นลางร้าย', f: p => { p.know += 1; } },
  { w: 2, c: p => p.cls === 1 && p.age > 16, t: () => 'การค้าปีนี้ดี กองคาราวานกลับมาครบทุกคัน', f: p => { p.wealth += 8; p.happy += 3; } },
  { w: 2, c: p => p.age > 16 && p.wealth > 20, t: () => 'คนที่คุณไว้ใจโกงเงินแล้วหนีไป', f: p => { p.wealth -= 7; p.happy -= 4; } },
  { w: 2, c: p => p.flags.churchMage, t: () => 'ศาสนจักรส่งคุณไปเป็นนักเวทประจำทัพโดยไม่ถามความเห็น', f: p => { p.happy -= 5; p.flags.soldier = 2; } },
  { w: 2, c: p => p.flags.healer, t: () => 'คุณใช้เวทรักษาเด็กในหมู่บ้านให้รอดจากไข้', f: p => { p.happy += 6; } },
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
const opt = (label, act, need, needText) => ({ label, act, need, needText });
const CHOICES = [
  { id: 'path', when: p => p.age === 13, prompt: p => p.cls === 4 ? 'อายุ 13 ปี เด็กคนอื่นเริ่มเลือกทางของตัวเอง ทาสไม่มีทางให้เลือก มีแค่ทำงานต่อ หรือหนี' : 'อายุ 13 ปี ถึงเวลาเลือกทางของตัวเอง',
    options: p => {
      if (p.cls === 0) return [
        opt('เข้าหอคัมภีร์', p => { p.know += 18; p.flags.literate = true; return 'คุณใช้เวลาหลายปีกับตำราที่คนส่วนใหญ่ในแผ่นดินไม่มีวันได้เห็น'; }),
        opt('ฝึกเป็นอัศวิน', p => { p.health += 10; p.wealth += 4; p.flags.knight = true; return 'คุณได้ดาบเล่มแรก และชื่ออยู่ในบัญชีทัพของตระกูล'; }),
        opt('ใช้ชีวิตในราชสำนัก', p => { p.happy += 10; return 'งานเลี้ยงกับการเมือง คุณเรียนรู้ว่าใครควรยิ้มให้'; }),
      ];
      if (p.cls === 1) return [
        opt('สืบทอดกิจการครอบครัว', p => { p.wealth += 12; return 'คุณเริ่มนั่งข้างพ่อแม่ที่โต๊ะบัญชี'; }),
        opt('ฝากตัวกับนักเล่นแร่', p => { p.know += 14; p.flags.literate = true; return 'ห้องทดลองเหม็นกำมะถัน แต่คุณได้อ่านหนังสือทุกวัน'; }),
        opt('ออกเดินทางกับกองคาราวาน', p => { p.happy += 6; p.wealth += 6; if (Math.random() < .08) { die(p, 'ถูกสัตว์ร้ายทำร้ายระหว่างเดินทาง'); return 'กองคาราวานถูกโจมตีกลางทาง'; } return 'คุณเห็นเจ็ดแคว้นก่อนอายุยี่สิบ'; }),
      ];
      if (p.cls === 4) return [
        opt('ก้มหน้าทำงานต่อไป', p => { p.health -= 3; return 'คุณทำงานต่อไปเหมือนทุกวัน'; }),
        opt('วางแผนหลบหนี', p => {
          if (Math.random() < .35) { p.cls = 2; p.flags.fugitive = true; p.wealth = 5; p.happy += 15; return 'คุณหนีพ้นในคืนเดือนมืด ตอนนี้คุณเป็นอิสระ แต่ไม่มีอะไรติดตัวเลย'; }
          if (Math.random() < .4) { die(p, 'ถูกจับได้ระหว่างหลบหนี'); return 'สุนัขของนายตามกลิ่นคุณเจอก่อนรุ่งสาง'; }
          p.health -= 20; p.happy -= 15; return 'คุณถูกจับได้และถูกลงโทษหนัก';
        }),
      ];
      return [
        opt('ทำงานกับครอบครัวต่อ', p => { p.wealth += 3; p.happy += 2; return 'คุณรับช่วงงานที่พ่อแม่ทำมาทั้งชีวิต'; }),
        opt('ไปเป็นเด็กฝึกงานในเมือง', p => {
          if (Math.random() < .5 + p.know / 100) { p.know += 6; p.wealth += 4; return 'ช่างตีเหล็กคนหนึ่งยอมรับคุณเป็นศิษย์'; }
          p.happy -= 6; return 'ไม่มีใครรับเด็กจากที่ที่คุณมา คุณกลับบ้านมือเปล่า';
        }),
        opt('หนีออกจากบ้าน', p => {
          if (Math.random() < .5) { p.wealth += 8; p.happy += 8; return 'คุณไปตั้งตัวที่เมืองท่าได้ ชีวิตลำบากแต่เป็นของคุณ'; }
          p.wealth -= 8; p.health -= 10; return 'ข้างนอกโหดกว่าที่คิด คุณกลับมาในสภาพผอมโซ';
        }),
      ];
    } },
  { id: 'gift', when: p => p.gifted && p.age === 11, prompt: p => 'อายุ 11 ปี เปลวไฟเล็กๆ ลุกขึ้นบนฝ่ามือคุณเอง คุณมีพลังเวท',
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
  { id: 'love', when: p => p.age >= 18 && p.age <= 30 && Math.random() < .3, prompt: p => p.cls === 4 ? `อายุ ${p.age} ปี นายของคุณจัดคู่ให้แล้ว` : `อายุ ${p.age} ปี มีคนที่คุณรัก และมีคนที่ครอบครัวอยากให้แต่ง`,
    options: p => p.cls === 4 ? [
      opt('ยอมรับ', p => { p.married = true; p.happy += 2; return 'คุณแต่งงานกับคนที่ไม่เคยคุยกันมาก่อน'; }),
      opt('ปฏิเสธ', p => { p.health -= 12; p.happy -= 6; return 'คุณถูกลงโทษ และนายจะถามอีกครั้งปีหน้า'; }),
    ] : [
      opt('แต่งงานกับคนที่รัก', p => { p.married = true; p.happy += 15; if (has(p, 'serenth') && Math.random() < .3) p.flags.humanSpouse = true; return 'งานเล็ก แขกไม่กี่คน แต่คุณจำวันนั้นได้ทั้งชีวิต'; }),
      opt('แต่งงานเพื่อฐานะ', p => { p.married = true; p.wealth += 14; p.happy -= 3; return 'ครอบครัวพอใจ คุณบอกตัวเองว่าความรักมาทีหลังได้'; }),
      opt('อยู่ตัวคนเดียว', p => { p.happy += 2; return 'คุณเลือกเดินทางนี้ด้วยตัวเอง'; }),
    ] },
  { id: 'war', when: p => p.age >= 17 && p.age <= 45 && (p.realm.war >= .01 || Math.random() < .05) && Math.random() < .2,
    prompt: p => `อายุ ${p.age} ปี ทหารมาเกณฑ์คนที่หมู่บ้าน ชื่อคุณอยู่ในรายชื่อ`,
    options: p => [
      opt('ไปรบ', p => { p.flags.soldier = 3; p.wealth += 6; p.happy -= 8; return 'คุณออกเดินทางไปแนวหน้าพร้อมคนรุ่นเดียวกันอีกสามสิบคน'; }),
      opt('หนีทหาร', p => { if (Math.random() < .35) { p.health -= 15; p.wealth -= 10; p.happy -= 8; return 'คุณถูกจับได้ โดนลงโทษและปรับ'; } p.happy -= 3; return 'คุณซ่อนตัวในป่าจนทัพผ่านไป'; }),
      opt('จ่ายเงินให้คนอื่นไปแทน', p => { p.wealth -= 25; return 'เด็กหนุ่มจากบ้านที่จนกว่ารับเงินคุณไปแทน คุณไม่เคยรู้ว่าเขากลับมาไหม'; }, p => p.wealth >= 45, 'ต้องมีทรัพย์ 45 ขึ้นไป'),
    ] },
  { id: 'plague', when: p => p.age >= 10 && p.realm.plague >= .01 && Math.random() < .12, prompt: p => `อายุ ${p.age} ปี ไข้เถ้าดำระบาดหนักในละแวกบ้าน`,
    options: p => [
      opt('หนีออกจากเมือง', p => { p.wealth -= 15; p.flags.fled = true; return 'คุณจ่ายค่าเกวียนออกไปอยู่ชนบทจนโรคซา'; }, p => p.wealth >= 35, 'ต้องมีทรัพย์ 35 ขึ้นไป'),
      opt('อยู่ดูแลครอบครัว', p => { p.happy += 4; if (Math.random() < .2 * (1.2 - p.wealth / 100)) { die(p, 'ติดไข้เถ้าดำจากคนที่ดูแล'); return 'คุณดูแลทุกคนจนวันสุดท้าย'; } return 'คุณดูแลทุกคนจนโรคซา บางคนก็ไม่รอด'; }),
      opt('ไปหาหมอผีในหนอง', p => { p.wealth -= 4; if (Math.random() < .12) { die(p, 'ล้มป่วยด้วยไข้เถ้าดำ'); return 'ยาของหมอผีไม่ได้ผล'; } p.health += 3; return 'คุณได้เครื่องรางกับยาขม จะได้ผลหรือไม่ไม่มีใครรู้'; }),
    ] },
  { id: 'migrate', when: p => p.age >= 18 && p.age <= 40 && has(p, 'grieve', 'mulvane', 'dunes') && Math.random() < .1,
    prompt: p => `อายุ ${p.age} ปี ได้ยินมาว่าที่ออเรลิสมีงานและมีอาหารเหลือกิน`,
    options: p => [
      opt('อพยพไปออเรลิส', p => {
        p.wealth -= 10;
        if (p.wealth >= 45 && Math.random() < .6) { p.realm = RBY.aurelis; p.happy += 8; return 'คุณจ่ายค่าผ่านประตูและได้เข้าเมืองชั้นใน'; }
        p.realm = RBY.undercity; p.happy -= 4; return 'ทหารที่ประตูชั้นในไม่ให้คนแบบคุณเข้า คุณได้ที่นอนใต้กำแพงแทน';
      }),
      opt('อยู่ที่เดิม', p => 'คุณอยู่ที่ที่คุณเกิด'),
    ] },
  { id: 'child', when: p => p.married && p.age >= 19 && p.age <= 40 && p.kids < 4 && Math.random() < .3,
    prompt: p => `อายุ ${p.age} ปี คุณกับคู่ชีวิตคุยกันเรื่องมีลูก`,
    options: p => [
      opt('มีลูก', p => {
        if (p.sex === 'ญ' && Math.random() < p.realm.infant * .12) { die(p, 'เสียชีวิตขณะคลอดบุตร'); return 'การคลอดครั้งนี้ยากเกินไป'; }
        if (Math.random() < p.realm.infant) { p.lostKids++; p.happy -= 12; return 'ลูกของคุณไม่รอดถึงขวบปีแรก'; }
        p.kids++; p.happy += 8; return 'ลูกคนใหม่เกิดมาแข็งแรง';
      }),
      opt('ยังไม่พร้อม', p => 'คุณตัดสินใจรอไปก่อน'),
    ], repeat: true },
  { id: 'debt', when: p => p.age > 20 && p.wealth < 12 && p.cls >= 2 && p.cls < 4 && Math.random() < .12,
    prompt: p => `อายุ ${p.age} ปี เงินหมด ไม่มีอะไรกินแล้ว`,
    options: p => [
      opt('กู้เงินเจ้าที่ดิน', p => { p.wealth += 15; p.flags.debt = true; if (p.cls === 2 && Math.random() < .5) { p.cls = 3; return 'คุณใช้หนี้ไม่ไหว สุดท้ายต้องขายตัวเป็นไพร่ติดที่ดิน'; } return 'ดอกเบี้ยจะกินคุณไปอีกหลายปี'; }),
      opt('ขายของมีค่าที่เหลือ', p => { p.wealth += 6; p.happy -= 6; return 'คุณขายแหวนของแม่ไป'; }),
      opt('ทนหิวต่อไป', p => { p.health -= 12; return 'ทั้งฤดูหนาวคุณกินวันละมื้อ'; }),
    ] },
];
function checkChoice(p) {
  for (const c of CHOICES) {
    if (p.done[c.id] && !c.repeat) continue;
    if (c.repeat && (p.done[c.id] || 0) >= 3) continue;
    if (c.when(p)) {
      p.done[c.id] = (p.done[c.id] || 0) + 1;
      return { id: c.id, prompt: c.prompt(p), options: c.options(p) };
    }
  }
  return null;
}
function resolveChoice(p, o) { const t = o.act(p); norm(p); return t; }
function autoChoose(p, ch) { const ok = ch.options.filter(o => !o.need || o.need(p)); return pick(ok); }

// finish the year after any choice. returns lines
function finishYear(p) {
  const lines = [];
  if (!p.alive) return lines;
  drift(p);
  const ft = applyFocus(p); if (ft) lines.push(ft);
  const et = randomEvent(p); if (et) lines.push(et);
  norm(p);
  p.years.push({ h: p.happy, hp: p.health });
  if (rollDeath(p)) return lines;
  p.age++;
  if (p.age > 400) die(p, 'จากไปอย่างสงบด้วยวัยชรา');
  return lines;
}
const FOCI = ['work', 'study', 'love', 'rest'];
function simLife(realm) {
  const p = makePerson(realm);
  while (p.alive) {
    if (p.age >= 7 && Math.random() < .15) p.focus = pick(FOCI);
    const ch = checkChoice(p);
    if (ch) { resolveChoice(p, autoChoose(p, ch)); if (!p.alive) { p.years.push({ h: p.happy, hp: p.health }); break; } }
    finishYear(p);
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
if (typeof module !== 'undefined') module.exports = { REALMS, simLife, worldStats, makePerson };

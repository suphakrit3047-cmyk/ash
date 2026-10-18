// ===== ENGINE (no DOM) =====
const R = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const WMAX = 5000; // money in silver coins; no hard cap like the other bars
const clampW = v => Math.max(0, Math.min(WMAX, v));
function wpick(items, wf) {
  let t = 0; const ws = items.map(i => { const w = Math.max(0, wf(i)); t += w; return w; });
  let u = Math.random() * t;
  for (let i = 0; i < items.length; i++) { if ((u -= ws[i]) < 0) return items[i]; }
  return items[items.length - 1];
}

const CLASSES = ['ขุนนาง', 'พ่อค้า', 'สามัญชน', 'ไพร่ติดที่ดิน', 'ทาส'];
const CLASS_OF = ['ตระกูลขุนนาง', 'ครอบครัวพ่อค้า', 'ครอบครัวสามัญชน', 'ครอบครัวไพร่ติดที่ดิน', 'แม่ที่เป็นทาส'];

const REALMS = [
  { id: 'aurelis', lore: 'ผู้รอดชีวิตที่มีเสบียงสร้างเมืองนี้ขึ้นหลังฝนเถ้าตก ศาสนจักรสุริยะสอนว่าเถ้าคือโทษทัณฑ์ของคนที่ใช้เวทโดยไม่ได้รับอนุญาต และดวงอาทิตย์คุ้มครองแค่คนในกำแพง คำสอนนี้ทำให้ศาสนจักรได้คุมคนใช้เวททุกคน และทำให้ขุนนางมีข้ออ้างปิดประตูใส่คนข้างนอก', tale: 'นักบวชในวิหารสอนว่าเถ้าตกลงมาเพราะคนบาปแอบใช้เวท และดวงอาทิตย์คุ้มครองแค่คนในกำแพงเท่านั้น คุณเชื่อทุกคำ', name: 'จักรวรรดิออเรลิส', short: 'ออเรลิส', race: ['มนุษย์'], birth: 18,
    classW: [6, 18, 60, 14, 2], infant: .06, child: .004, adult: .005, agingStart: 52, agingScale: 9,
    war: .002, plague: .002, famine: .001, mine: 0, beast: 0, health: 72, wealth: 55, lit: .5,
    blurb: 'นครหลวงของศาสนจักรสุริยะ อยู่หลังกำแพงสามชั้น ยุ้งฉางเต็ม มีหมอหลวง และมีศาลศาสนาไว้เผาคนใช้เวทที่ไม่ได้ขึ้นทะเบียน',
    names: [['อเล', 'มา', 'ริ', 'เซ', 'ดริ', 'ออ', 'วิล', 'เอเลน', 'ทอ'], ['เรียน', 'ริค', 'นา', 'ซา', 'ลอส', 'เทีย', 'มอนด์']] },
  { id: 'undercity', lore: 'ลูกหลานของแรงงานที่มาสร้างกำแพงเมื่อ ห.ถ. 41 ตามสัญญา สร้างเสร็จเมื่อไหร่จะได้เข้าไปอยู่ข้างใน แต่ออเรลิสต่อกำแพงใหม่ทุกชั่วคน งานเลยไม่เคยเสร็จ คนที่นี่ชอบพูดกันว่าฟ้ามีสองชั้น ชั้นแรกคือกำแพง ชั้นที่สองคือเมืองบนเมฆ แล้วพวกเขาก็อยู่ใต้ทั้งสองชั้น', tale: 'ยายชี้ขึ้นฟ้าแล้วบอกว่า "ฟ้าของเรามีสองชั้นนะหลาน ชั้นแรกคือกำแพง ชั้นที่สองคือเมืองบนเมฆ" แล้วยายก็เงียบไป', name: 'ใต้กำแพงออเรลิส', short: 'ใต้กำแพง', race: ['มนุษย์', 'มนุษย์', 'ลูกครึ่งออร์ค', 'ลูกครึ่งเอลฟ์'], birth: 16,
    classW: [0, 2, 40, 38, 20], infant: .17, child: .007, adult: .008, agingStart: 42, agingScale: 9,
    war: .002, plague: .008, famine: .006, mine: 0, beast: 0, health: 48, wealth: 12, lit: .08,
    blurb: 'ชุมชนแออัดนอกกำแพงชั้นในของออเรลิส มองเห็นยอดหอคอยทองได้ทุกวัน แต่ประตูชั้นในไม่เคยเปิดให้',
    names: [['อเล', 'มา', 'ริ', 'เซ', 'ดริ', 'กรอ', 'วิล', 'ฟิน'], ['เรียน', 'ริค', 'นา', 'ซา', 'ทัก', 'เทีย']] },
  { id: 'serenth', lore: 'เอลฟ์เคยเป็นผู้ดูแลเส้นใยบนฟ้า พอฟ้าเริ่มร้าว สภาผู้อาวุโสลงมติเจ็ดต่อหก เอาเส้นใยที่เหลือไปยกเมืองตัวเองขึ้นฟ้าแทนที่จะเอาไปซ่อม ตำราที่เด็กเอลฟ์เรียนเขียนว่ามนุษย์ทำฟ้าพังเอง ส่วนเรื่องมติครั้งนั้น ไม่มีเขียนไว้สักบรรทัด', tale: 'ครูสอนว่ามนุษย์ข้างล่างดึงเส้นใยไปใช้จนฟ้าพัง บรรพบุรุษของเราเตือนแล้วแต่ไม่มีใครฟัง เอลฟ์เลยต้องเก็บรักษาสิ่งที่เหลือไว้ พอคุณถามว่าทำไมไม่ช่วยคนข้างล่าง ครูก็ไม่ตอบ', name: 'นครลอยเซเรนธ์', short: 'เซเรนธ์', race: ['เอลฟ์'], birth: 2,
    classW: [20, 30, 50, 0, 0], infant: .008, child: .001, adult: .0015, agingStart: 190, agingScale: 16,
    war: .0004, plague: .0004, famine: 0, mine: 0, beast: 0, health: 88, wealth: 75, lit: .97,
    blurb: 'นครลอยของเอลฟ์ อยู่เหนือเมฆเถ้า อากาศสะอาด ผู้คนอายุยืนหลายร้อยปี และสภาผู้อาวุโสไม่รับคนอพยพ',
    names: [['เอล', 'ไอ', 'ซิล', 'ลู', 'เธ', 'ไอเร', 'นิม'], ['วาน', 'ริล', 'ธีเอล', 'ลิธ', 'นาร์', 'เมีย']] },
  { id: 'kragmor', lore: 'คนแคระหนีลงไปอยู่ใต้ภูเขาตอนฝนเถ้าตก เลยรอดมาได้มากกว่าใคร บันทึกบนแผ่นหินของพวกเขาเขียนไว้ชัดว่าฟ้าขาดในชั่วโมงเดียวกับที่เมืองเอลฟ์ลอยขึ้น แต่ครากมอร์ขายเหล็กให้เซเรนธ์ ขายทองให้ออเรลิส ก็เลยไม่มีใครอยากพูดเรื่องนี้ดังๆ', tale: 'ปู่พาลงไปดูบันทึกหินในห้องลึกใต้ภูเขา มีบรรทัดหนึ่งเขียนว่า "ฟ้าขาดในชั่วโมงที่เมืองเอลฟ์ลอยขึ้น" ปู่บอกให้จำไว้ แต่อย่าไปพูดให้ลูกค้าได้ยิน', name: 'แดนเหมืองครากมอร์', short: 'ครากมอร์', race: ['คนแคระ'], birth: 9,
    classW: [5, 15, 60, 15, 5], infant: .09, child: .006, adult: .006, agingStart: 72, agingScale: 11,
    war: .003, plague: .003, famine: .003, mine: .006, beast: 0, health: 66, wealth: 40, lit: .3,
    blurb: 'อาณาจักรเหมืองใต้ภูเขาของคนแคระ ร่ำรวยจากแร่เหล็กและทองคำ แต่ทุกปีต้องมีอุโมงค์ถล่ม',
    names: [['ทอร', 'บรัม', 'กรุ', 'ดูร', 'ฮิล', 'บอร'], ['กริม', 'ดา', 'ริน', 'ฮิลด์', 'นาร์', 'ดัล']] },
  { id: 'grieve', lore: 'ก่อนเถ้าตก ที่นี่คือทุ่งทองที่เลี้ยงคนทั้งแผ่นดิน ตอนนี้เหลือหุบเขาที่ยังปลูกอะไรได้อยู่ไม่กี่แห่ง มนุษย์โทษว่าออร์คนำโชคร้ายมา ออร์คโทษว่ามนุษย์ขโมยหุบเขาไป ทุกหน้าร้อนเงาของเซเรนธ์ลอยผ่านทุ่ง แต่ไม่มีใครว่างพอจะเงยหน้าขึ้นไปมอง ส่วนอาวุธของทั้งสองฝ่ายก็ซื้อมาจากออเรลิสเหมือนกัน', tale: 'ผู้ใหญ่ในหมู่บ้านเล่าว่าฝนไม่ตกเพราะอีกฝ่ายพาเสนียดมา ฝั่งมนุษย์โทษออร์ค ฝั่งออร์คโทษมนุษย์ ไม่มีใครพูดถึงเงาเมืองลอยที่ผ่านหัวทุกหน้าร้อน', name: 'ที่ราบเถ้ากรีฟ', short: 'กรีฟ', race: ['มนุษย์', 'ออร์ค'], birth: 22,
    classW: [2, 5, 48, 30, 15], infant: .19, child: .008, adult: .007, agingStart: 40, agingScale: 9,
    war: .015, plague: .004, famine: .007, mine: 0, beast: .002, health: 52, wealth: 15, lit: .05,
    blurb: 'ทุ่งที่มนุษย์กับออร์คแย่งกันมาสามชั่วคน กองทัพเดินผ่านหมู่บ้านบ่อยกว่าฝนตกเสียอีก',
    names: [['กรอ', 'ราก', 'วอร์', 'ซูล', 'มอร', 'เบร'], ['กาช', 'นา', 'รา', 'ทัก', 'เกน', 'ดา']] },
  { id: 'mulvane', lore: 'เถ้าจากทุกแดนไหลมาตามแม่น้ำแล้วมาจบที่นี่ ก็อบลินเป็นเจ้าของหนองมาแต่เดิม มนุษย์ที่มาทีหลังคือพวกที่โดนไล่มาจากที่อื่น ก็อบลินเรียกเซเรนธ์ว่า "บ้านที่ทิ้งขยะลงมา" แล้วเรียกออเรลิสว่า "บ้านที่ส่งคนมาลองยา"', tale: 'ก็อบลินแก่เล่าให้ฟังว่า เถ้าจากทุกที่ไหลมาจบที่หนองของเรา เหมือนทุกอย่างที่คนอื่นไม่เอาแล้ว', name: 'หนองพิษมูลเวน', short: 'มูลเวน', race: ['ก็อบลิน', 'มนุษย์'], birth: 20,
    classW: [1, 4, 45, 30, 20], infant: .2, child: .009, adult: .008, agingStart: 38, agingScale: 9,
    war: .003, plague: .008, famine: .006, mine: 0, beast: .004, health: 42, wealth: 10, lit: .04,
    blurb: 'หนองน้ำพิษที่ก็อบลินกับมนุษย์จนๆ อยู่ด้วยกัน ไข้เถ้าดำไม่เคยหายไปจากที่นี่',
    names: [['สนิก', 'มัด', 'ฟิน', 'กิบ', 'ลุ', 'ซอก'], ['เกิล', 'วิช', 'บี', 'นิค', 'ลา', 'ดิ']] },
  { id: 'dunes', lore: 'คืนที่เมืองเอลฟ์ลอยขึ้น ความร้อนจากพิธีตกลงมาที่นี่จนทรายละลายเป็นแก้ว เพลงของเผ่าเรียกคืนนั้นว่า "คืนที่ทรายร้องไห้" ชาวทะเลทรายถ่มน้ำลายทุกครั้งที่เห็นเงาเมืองลอย คาราวานทุกขบวนที่จะไปออเรลิสต้องจ้างพวกเขานำทาง แต่ไม่มีใครในออเรลิสจำชื่อพวกเขาได้สักคน', tale: 'ทั้งเผ่าร้องเพลง "คืนที่ทรายร้องไห้" รอบกองไฟ พอเงาเมืองลอยผ่านหัว ทุกคนถ่มน้ำลายลงพื้นพร้อมกัน คุณทำตามทั้งที่ยังไม่รู้ว่าทำไม', name: 'ทะเลทรายแก้ว', short: 'ทะเลทรายแก้ว', race: ['ชาวทะเลทราย'], birth: 13,
    classW: [3, 12, 70, 10, 5], infant: .14, child: .006, adult: .007, agingStart: 44, agingScale: 9,
    war: .005, plague: .003, famine: .009, mine: 0, beast: .003, health: 58, wealth: 22, lit: .12,
    blurb: 'ชนเผ่าเร่ร่อนต้อนฝูงสัตว์ข้ามเนินทรายที่กลายเป็นแก้ว ปีไหนฝนไม่ตก ทั้งเผ่าก็อดตาย',
    names: [['ซา', 'คาร', 'อมี', 'ฮา', 'ทีร', 'ไน'], ['ฮีร์', 'ริม', 'ลา', 'ซัน', 'ดี', 'ฟา']] },
];
const RBY = Object.fromEntries(REALMS.map(r => [r.id, r]));

const TRAITS = [
  { id: 'tough', n: 'แข็งแกร่ง', d: 'ป่วยยาก ฟื้นตัวไว' },
  { id: 'sickly', n: 'ขี้โรค', d: 'ร่างกายอ่อนแอมาตั้งแต่เกิด' },
  { id: 'clever', n: 'หัวไว', d: 'เรียนรู้เร็วกว่าคนอื่น' },
  { id: 'cunning', n: 'เจ้าเล่ห์', d: 'โกหกเก่ง หนีเก่ง' },
  { id: 'brave', n: 'ใจกล้า', d: 'ไม่ถอยเมื่อต้องสู้' },
  { id: 'kind', n: 'ใจบุญ', d: 'ได้ช่วยคนอื่นแล้วมีความสุข' },
  { id: 'lucky', n: 'ดวงแข็ง', d: 'เจอเรื่องร้ายทีไรก็รอดแบบหวุดหวิดทุกที' },
  { id: 'bitter', n: 'ขมขื่น', d: 'มองโลกในแง่ร้าย ไม่ค่อยมีความสุข' },
];
const TBY = Object.fromEntries(TRAITS.map(t => [t.id, t]));
const T = (p, id) => p.traits.includes(id);
const nameIn = r => pick(r.names[0]) + pick(r.names[1]);
// a new name for someone entering p's life, never the same as anyone already in it
function newName(p, r) {
  const used = new Set([p.name, ...Object.values(p.kin || {}), ...(p.kidNames || []), ...(p.fam || []).map(m => m.name), ...Object.values(p.npc || {}).map(n => n.name)]);
  let n, i = 0; do { n = nameIn(r); } while (used.has(n) && ++i < 25); return n;
}
const has = (p, ...ids) => ids.includes(p.realm.id);
// how fast a body ages: elves and dwarves keep their own pace wherever they live; everyone else ages with the hardship of the place
const ageR = p => p.race === 'เอลฟ์' ? RBY.serenth : p.race === 'คนแคระ' ? RBY.kragmor : p.realm;
function move(p, r) { if (p.realm === r) return; p.realm = r; p.places.push({ id: r.id, age: p.age }); }
const yearOf = p => p.birthYear + p.age;

// ---------- world eras (ห.ถ. = ปีหลังเถ้า) ----------
const NOW = 312;
const ERAS = [
  { id: 'war4', from: 318, to: 326, n: 'สงครามกรีฟครั้งที่สี่', t: 'ข่าวแพร่ไปทุกแดนว่ามนุษย์กับออร์คประกาศสงครามกันเป็นครั้งที่สี่ ออเรลิสเปิดโรงตีอาวุธเพิ่มอีกสามโรง', mod: { grieve: { war: 2.5 }, dunes: { war: 1.5 } } },
  { id: 'fever2', from: 341, to: 345, n: 'ไข้เถ้าดำระบาดใหญ่ครั้งที่สอง', t: 'ไข้เถ้าดำระบาดใหญ่ ออเรลิสปิดประตูชั้นในทุกบาน ปล่อยคนข้างนอกให้ตายเอาดาบหน้า', mod: { mulvane: { plague: 3 }, undercity: { plague: 3 }, grieve: { plague: 2 }, dunes: { plague: 1.5 } } },
  { id: 'ashfall2', from: 360, to: 364, n: 'ฝนเถ้าครั้งที่สอง', t: 'ฟ้ามืดลงอีกครั้ง เถ้าตกลงมาเหมือนเมื่อสามร้อยกว่าปีก่อน ส่วนเหนือเมฆขึ้นไป เซเรนธ์ยังแดดจ้าเหมือนทุกวัน', mod: { aurelis: { famine: 3 }, undercity: { famine: 2.5 }, kragmor: { famine: 2 }, grieve: { famine: 2.5 }, mulvane: { famine: 2.5 }, dunes: { famine: 2.5 } } },
  { id: 'sinking', from: 395, to: 99999, n: 'เซเรนธ์ลดระดับ', t: 'นครลอยเซเรนธ์เริ่มลดระดับลงทีละนิด เพราะเส้นใยที่งอกใหม่บนฟ้าไม่พอจะพยุงเมืองไว้แล้ว', mod: { serenth: { adult: 2.5 } } },
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
  const r = parent ? ((parent.legacy && parent.legacy.realm) ? RBY[parent.legacy.realm] : parent.realm) : (realm || wpick(REALMS, x => x.birth));
  const cls = parent ? parent.cls : wpick([0, 1, 2, 3, 4], i => r.classW[i]);
  const traits = rollTraits();
  const p = {
    name: parent ? parent.heirName : nameIn(r), sex: Math.random() < .5 ? 'ญ' : 'ช', realm: r, born: r, cls, bornCls: cls,
    race: parent ? parent.race : pick(r.race), age: 0, alive: true, traits, gen: parent ? parent.gen + 1 : 1,
    health: clamp(r.health + R(-10, 10) + (2 - cls) * 4),
    wealth: parent ? clampW(parent.wealth * .6 + r.wealth * .3 + R(-4, 4)) : clampW(r.wealth + [35, 18, 0, -8, -12][cls] + R(-5, 5)),
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
  if (parent) {
    const L = parent.legacy || {};
    if (L.educated) { p.flags.eduBonus = 25; p.flags.educatedHeir = true; }
    else if (L.literate) p.flags.eduBonus = 10;
    if (L.connected) p.wealth = clampW(p.wealth + 15);
    if (L.trade) p.wealth = clampW(p.wealth + 10);
    if (L.gift) p.wealth = clampW(p.wealth + L.gift * .5);
    if (L.loved) p.happy = clamp(p.happy + 5);
    if (L.truth) p.flags.ledger = true;
    if (parent.flags.hero || parent.flags.peacemaker || parent.flags.truthSpoken || parent.flags.famous) p.flags.famous = true;
    if (parent.flags.vendetta) p.flags.vendetta = true;
    p.dyn = parent.dyn;
  } else p.dyn = { founder: p.name, founderCls: cls, founderRealm: r.id, line: [] };
  initRPG(p, parent);
  p.startWealth = p.wealth;
  return p;
}
function makeSibling(d) {
  const p = makePerson(d.born);
  p.cls = p.bornCls = d.bornCls; p.race = d.race;
  p.kin = { mother: d.kin.mother, father: d.kin.father, spouse: null };
  p.birthYear = d.birthYear + 2; p.gen = d.gen; p.ancestor = d.ancestor; p.dyn = d.dyn;
  p.wealth = d.startWealth; p.startWealth = p.wealth; p.sibling = true;
  if (p.name === d.name) p.name = nameIn(d.born);
  return p;
}
// run an option many times on copies of the person to show the player what it tends to do
function previewOption(p, o, n = 40) {
  if (o.need && !o.need(p)) return null;
  const K = ['health', 'happy', 'know', 'wealth'], sum = { health: 0, happy: 0, know: 0, wealth: 0 }, lo = {}, hi = {};
  let dead = 0, alive = 0, down = 0, up = 0, moved = 0, late = 0, rolled = 0, passed = 0;
  const risky = q => (q.flags.soldier > 0 && !(p.flags.soldier > 0)) || (q.flags.hiddenMage && !p.flags.hiddenMage) || (q.flags.warmage && !p.flags.warmage) || (q.flags.knight && !p.flags.knight) || (q.flags.thiefGuild && !p.flags.thiefGuild) || (q.flags.rebel && !p.flags.rebel);
  for (let i = 0; i < n; i++) {
    const q = structuredClone(p); q.checks = [];
    try { o.act(q); } catch (e) { continue; }
    if (q.checks.length) { rolled++; if (q.checks.every(c => c.ok)) passed++; }
    norm(q);
    if (!q.alive) { dead++; continue; }
    alive++;
    K.forEach(k => { const d = q[k] - p[k]; sum[k] += d; lo[k] = Math.min(lo[k] ?? d, d); hi[k] = Math.max(hi[k] ?? d, d); });
    if (q.cls > p.cls) down++; else if (q.cls < p.cls) up++;
    if (q.realm.id !== p.realm.id) moved++;
    if (risky(q)) late++;
  }
  const avg = {}; K.forEach(k => avg[k] = alive ? sum[k] / alive : 0);
  return { dead: dead / n, avg, lo, hi, down: down / n, up: up / n, moved: moved / n, late: late / n, chance: rolled ? passed / rolled : null };
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
  if (a > ageR(p).agingStart) H.push(['จากไปอย่างสงบด้วยวัยชรา', .008 * Math.exp((a - ageR(p).agingStart) / ageR(p).agingScale), 'old']);
  if (a >= 16 && a <= 55) {
    let w = r.war * (p.cls === 0 ? .4 : 1) * (f.knight ? 1.6 : 1);
    if (f.soldier > 0) w += .07;
    if (f.warmage) w += .025;
    H.push(['เสียชีวิตในสงครามชายแดน', w * eraMod(p, 'war'), 'war']);
  }
  H.push(['เสียชีวิตด้วยไข้เถ้าดำ', r.plague * (1.2 - Math.min(p.wealth, 100) / 100 * .8) * (f.fled ? .3 : 1) * (f.immune ? .2 : 1) * tm * eraMod(p, 'plague'), 'plague']);
  H.push(['อดอาหารจนเสียชีวิตในปีที่ข้าวยากหมากแพง', r.famine * (1 - Math.min(p.wealth, 100) / 100) * (a < 5 ? 1.5 : 1) * eraMod(p, 'famine'), 'famine']);
  if (r.mine && a >= 12 && p.cls >= 2) H.push(['เสียชีวิตเมื่ออุโมงค์เหมืองถล่ม', r.mine * (f.safeMine ? .5 : 1), 'mine']);
  if (r.beast) H.push(['ถูกสัตว์ร้ายทำร้ายจนเสียชีวิต', r.beast, 'beast']);
  if (f.hiddenMage) H.push(['ถูกศาลศาสนาตัดสินประหาร ฐานใช้เวทนอกศาสนจักร', .03, 'burn']);
  return H;
}
function die(p, cause) { p.alive = false; p.cause = cause; }
function rollDeath(p) {
  const H = hazards(p);
  H.forEach(h => h[1] *= hazardMod(p, h[2]));
  const sum = Math.min(H.reduce((s, h) => s + h[1], 0), .97);
  if (Math.random() >= sum) return null;
  const h = wpick(H, x => x[1]);
  const canFate = h[2] !== 'old' && p.age >= 8 && p.age - (p.flags.lastFate ?? -99) >= 3 && Math.random() < .9;
  if (canFate) { p.flags.lastFate = p.age; return { fate: buildFate(p, h[0], h[2]) }; }
  die(p, h[0]); return { died: true };
}

// ---------- near-death scenes ----------
const opt = (label, act, need, needText) => ({ label, act, need, needText });
const luck = p => T(p, 'lucky') ? .12 : 0;
function saved(p, chance) { if (Math.random() < chance + luck(p)) { p.flags.reprieves++; return true; } return false; }
const FATE_TEXT = {
  ill: 'คุณป่วยหนักจนลุกจากที่นอนไม่ไหว',
  plague: 'จุดดำของไข้เถ้าดำเริ่มขึ้นตามแขน',
  war: 'แนวรบแตก ทัพของคุณกำลังโดนล้อม',
  famine: 'ไม่มีอะไรตกถึงท้องมาหลายอาทิตย์ ร่างกายเริ่มจะไม่ไหวแล้ว',
  mine: 'อุโมงค์ถล่มลงมา คุณติดอยู่ในความมืดใต้ภูเขา',
  beast: 'มีอะไรบางอย่างพุ่งออกมาจากความมืดตรงหน้า',
  burn: 'ศาลศาสนาจับได้ว่าคุณใช้เวท ตัดสินให้เผาทั้งเป็น',
};
function buildFate(p, cause, kind) {
  const fail = (q, t) => { die(q, cause); return t; };
  let options = [];
  if (kind === 'ill' || kind === 'plague') options = [
    opt('จ้างหมอหลวงมารักษา', p => { p.wealth -= 22; return saved(p, .85) ? 'หมอหลวงรักษาจนหาย แต่ค่ารักษาครั้งนี้เท่ากับรายได้หลายปีของคนธรรมดา' : fail(p, 'ขนาดหมอหลวงยังช่วยไม่ได้'); }, p => p.wealth >= 40, 'ต้องมีทรัพย์ 40 ขึ้นไป'),
    opt('ต้มยาตามตำราที่เคยอ่าน', p => saved(p, .4 + p.know / 250) ? 'ยาขมจนน้ำตาไหล แต่ก็รอดมาได้' : fail(p, 'ตำราอาจจะผิด หรือไม่ก็อ่านผิดเอง'), p => p.know >= 30, 'ต้องมีความรู้ 30 ขึ้นไป'),
    opt('ภาวนาและรอ', p => { p.health -= 15; return saved(p, .25 + (T(p, 'tough') ? .2 : 0)) ? 'คืนที่เจ็ดไข้ก็ลดลง ทั้งที่ไม่รู้เหมือนกันว่าเพราะอะไร' : fail(p, 'สวดจนคอแห้ง ก็ไม่มีใครตอบ'); }),
  ];
  else if (kind === 'war') options = [
    opt('ฝ่าแนวรบหนีกลับบ้าน', p => { p.health -= 15; return saved(p, .4 + (T(p, 'brave') ? .15 : 0) + (T(p, 'cunning') ? .1 : 0)) ? 'เดินทางตอนกลางคืนอยู่สิบวัน จนกลับถึงบ้านได้' : fail(p, 'คุณไปไม่ถึงบ้าน'); }),
    opt('ยอมจำนนเป็นเชลย', p => { if (saved(p, .75)) { p.cls = 4; p.flags.captive = true; p.happy -= 15; return 'รอดมาได้ แต่ตอนนี้กลายเป็นทาสของอีกฝ่ายไปแล้ว'; } return fail(p, 'วันนั้นฝ่ายตรงข้ามไม่จับเชลย'); }),
    ...(T(p, 'brave') ? [opt('[ใจกล้า] สู้จนถึงที่สุด', p => { if (saved(p, .38)) { p.wealth += 15; p.happy += 10; p.flags.hero = true; return 'พอฝุ่นจาง คุณยังยืนอยู่ คนเอาเรื่องนี้ไปเล่ากันอีกหลายปี'; } return fail(p, 'คุณสู้จนลมหายใจเฮือกสุดท้าย'); })] : []),
  ];
  else if (kind === 'famine') options = [
    ...(p.cls < 4 ? [opt(p.cls < 3 ? 'ขายตัวเป็นไพร่แลกข้าว' : 'ขายตัวเป็นทาสแลกข้าว', p => { p.cls = p.cls < 3 ? 3 : 4; p.happy -= 12; p.flags.soldSelf = true; p.flags.reprieves++; return 'รอดหน้าแล้งมาได้ แต่ต้องแลกกับอิสรภาพ'; })] : []),
    opt('ขโมยข้าวจากยุ้งฉางเจ้าที่ดิน', p => { if (saved(p, .5 + (T(p, 'cunning') ? .2 : 0))) { p.health += 5; return 'คืนนั้นแบกข้าวออกมาได้สองกระสอบ'; } die(p, 'ถูกจับได้ขณะขโมยข้าว และถูกลงโทษจนเสียชีวิต'); return 'ยามเห็นเข้าเสียก่อน'; }),
    opt('ใช้เงินที่เหลือทั้งหมดซื้ออาหาร', p => { p.wealth = 4; p.flags.reprieves++; return 'รอดมาได้ แต่ไม่เหลืออะไรติดตัวเลย'; }, p => p.wealth >= 25, 'ต้องมีทรัพย์ 25 ขึ้นไป'),
  ];
  else if (kind === 'mine') options = [
    opt('ขุดทางออกเอง', p => { p.health -= 20; return saved(p, .35 + (T(p, 'tough') ? .2 : 0)) ? 'นิ้วแตกทุกนิ้ว แต่สุดท้ายก็มองเห็นแสงสว่าง' : fail(p, 'หินหนักเกินกว่าจะขยับไหว'); }),
    opt('รอคนมาช่วย', p => saved(p, p.cls <= 1 ? .85 : .2) ? (p.cls <= 1 ? 'คนขุดมาถึงภายในวันเดียว เพราะที่บ้านจ่ายเงินให้มาขุดหาคุณก่อนคนอื่น' : 'คนขุดมาถึงเอาวันที่สี่ ยังดีที่ยังหายใจอยู่') : (die(p, 'ติดอยู่ใต้อุโมงค์ที่ถล่ม และความช่วยเหลือมาไม่ถึง'), 'คนขุดไปขุดหาคนจากตระกูลที่จ่ายเงินก่อน มาไม่ถึงตัวคุณ')),
  ];
  else if (kind === 'beast') options = [
    opt('สู้', p => { p.health -= 15; return saved(p, .4 + (T(p, 'brave') ? .2 : 0)) ? 'มันถอยกลับเข้าไปในความมืด ทิ้งแผลยาวไว้ที่แขน' : fail(p, 'มันแรงกว่าคุณ'); }),
    opt('วิ่งหนี', p => { p.health -= 5; return saved(p, .5) ? 'วิ่งไม่คิดชีวิตจนถึงหมู่บ้าน ไม่กล้าหันกลับไปมองเลย' : fail(p, 'มันเร็วกว่าคุณ'); }),
  ];
  else if (kind === 'burn') options = [
    opt('ใช้เวทหนีออกจากคุก', p => { if (saved(p, .35)) { p.flags.hiddenMage = false; p.flags.fugitive = true; p.wealth = 3; move(p, RBY.grieve); return 'ประตูเหล็กละลายลง คุณหนีออกจากออเรลิสไปทุ่งเถ้าตัวเปล่า'; } return fail(p, 'ผนังคุกสลักอักขระกันเวทไว้ทั่ว'); }),
    opt('สารภาพและยอมเป็นของศาสนจักร', p => { if (saved(p, .6)) { p.flags.hiddenMage = false; p.flags.churchMage = true; p.happy -= 15; return 'ศาสนจักรไว้ชีวิต เพราะคุณยังมีประโยชน์กับพวกเขา'; } return fail(p, 'ศาลศาสนาอยากเชือดไก่ให้ลิงดู'); }),
    ...(T(p, 'cunning') ? [opt('[เจ้าเล่ห์] ชี้ตัวคนอื่นแทน', p => { if (saved(p, .7)) { p.flags.hiddenMage = false; p.flags.betrayer = true; p.happy -= 20; return 'หญิงแก่คนหนึ่งโดนเผาแทนคุณ ขณะที่คุณยืนดูอยู่ในฝูงคน'; } return fail(p, 'ไม่มีใครเชื่อสักคำ'); })] : []),
  ];
  return { id: 'fate', fatal: true, prompt: `ความตายมาเยือน: ${FATE_TEXT[kind]}`, options };
}

// ---------- drift & focus ----------
function drift(p) {
  const r = p.realm;
  const ageDrop = p.age > ageR(p).agingStart ? (p.age - ageR(p).agingStart) * 1.3 : 0;
  const tH = r.health + (2 - p.cls) * 3 + am(p, 'CON') * 3 - ageDrop + (T(p, 'tough') ? 8 : 0) - (T(p, 'sickly') ? 10 : 0);
  p.health = clamp(p.health + (tH - p.health) * .12 + R(-2, 2));
  const tP = 40 + am(p, 'CHA') * 2 + Math.min(p.wealth, 100) * .3 + (p.married ? 8 : 0) - (p.cls === 4 ? 15 : 0) + Math.min(p.kidNames.length, 3) * 2 - (T(p, 'bitter') ? 10 : 0);
  p.happy = clamp(p.happy + (tP - p.happy) * .18 + R(-3, 3));
  if (p.flags.debt) p.wealth = clampW(p.wealth - 3);
  if (p.flags.soldier > 0) p.flags.soldier--;
  if (p.flags.eduBonus && p.age === 12) { p.know = clamp(p.know + p.flags.eduBonus); p.flags.literate = true; p.skills.letters.r = Math.max(p.skills.letters.r, p.flags.eduBonus >= 25 ? 2 : 1); if (p.flags.eduBonus >= 25) p.skills.history.r = Math.max(p.skills.history.r, 1); }
}
function applyFocus(p) {
  if (p.age < 7) return null;
  if (p.focus === 'train') return trainYear(p);
  const r = p.realm; let t = null;
  switch (p.focus) {
    case 'work':
      if (p.cls === 4) { p.health = clamp(p.health - 2); p.happy = clamp(p.happy - 2); if (Math.random() < .2) t = 'ทำงานหนักทั้งปี แต่ทาสไม่ได้ค่าแรง ทุกอย่างเป็นของนายหมด'; }
      else {
        const g = (2 + Math.random() * 3) * (1 + p.know / 120) * (r.wealth / 50 + .4) * (p.cls === 3 ? .5 : 1);
        p.wealth = clampW(p.wealth + g * incomeMod(p)); p.health = clamp(p.health - (p.cls >= 2 ? 1.5 : .4));
        if (p.cls === 3 && Math.random() < .15) t = 'ผลผลิตครึ่งหนึ่งต้องส่งให้เจ้าที่ดินเหมือนทุกปี';
      }
      break;
    case 'study': {
      const access = p.cls <= 1 || p.flags.literate || (p.cls < 4 && Math.random() < r.lit);
      if (access) { p.know = clamp(p.know + (4 + R(0, 2)) * (T(p, 'clever') ? 1.6 : 1)); p.flags.literate = true; }
      else { p.know = clamp(p.know + .3); if (Math.random() < .25) t = p.cls === 4 ? 'ทาสห้ามแตะหนังสือ แอบจำตัวหนังสือจากป้ายร้านได้แค่สองสามตัว' : 'อยากเรียน แต่แถวนี้ไม่มีใครสอนหนังสือ'; }
      break; }
    case 'love': p.happy = clamp(p.happy + 3); p.wealth = clampW(p.wealth - .5); break;
    case 'rest':
      if (p.cls === 4) { p.health = clamp(p.health - 1); if (Math.random() < .25) t = 'ขอพัก แต่นายไม่ยอม'; }
      else { p.health = clamp(p.health + 3); p.wealth = clampW(p.wealth - 1.5); }
      break;
  }
  return t;
}

// ---------- random events ----------
const parentName = p => Math.random() < .5 ? `${p.kin.mother} แม่ของคุณ` : `${p.kin.father} พ่อของคุณ`;
const EVENTS = [
  { w: 3, c: p => !has(p, 'serenth', 'undercity') && p.age > 6, t: () => 'ปีนี้เก็บเกี่ยวได้ดี ทุกบ้านมีข้าวกินอิ่ม', f: p => { p.happy += 5; p.wealth += 3; } },
  { w: 3, c: p => p.cls >= 2 && p.age > 14, t: () => 'เจ้าที่ดินขึ้นภาษีเป็นครั้งที่สามในปีนี้', f: p => { p.wealth -= 6; p.happy -= 4; } },
  { w: 2, c: p => has(p, 'aurelis'), t: () => 'เทศกาลสุริยะ ทั้งเมืองฉลองกันเจ็ดวันเจ็ดคืน', f: p => { p.happy += 6; } },
  { w: 3, c: p => has(p, 'undercity') && p.age > 5, t: () => 'ยามปิดประตูชั้นในเร็วขึ้น คนใต้กำแพงที่เข้าไปทำงานในเมืองกลับไม่ทัน ต้องนอนข้างถนน', f: p => { p.happy -= 4; p.health -= 2; } },
  { w: 2, c: p => has(p, 'undercity') && p.age > 8, t: () => 'ยืนดูขบวนแห่ของขุนนางเคลื่อนผ่านถนนที่คนแถวบ้านคุณเป็นคนปูเอง', f: p => { p.happy -= 2; } },
  { w: 3, c: p => has(p, 'serenth') && p.age > 15, t: () => 'สภาผู้อาวุโสไล่ผู้ลี้ภัยกลับไปจากท่าเรือลอยฟ้าอีกแล้ว คุณยืนมองอยู่บนระเบียงบ้าน', f: p => { p.know += 1; } },
  { w: 3, c: p => has(p, 'serenth') && p.age > 10, t: () => 'เรียนภาษาโบราณที่ไม่มีใครพูดแล้วเพิ่มได้อีกภาษา', f: p => { p.know += 4; } },
  { w: 2, c: p => has(p, 'serenth') && p.married && p.age > 60 && p.flags.humanSpouse, t: p => `${p.kin.spouse} คู่ชีวิตที่เป็นมนุษย์แก่ลงทุกปี ส่วนคุณยังดูเหมือนเดิม`, f: p => { p.happy -= 6; } },
  { w: 3, c: p => has(p, 'kragmor') && p.age > 14, t: () => 'คนงานขุดเจอสายแร่ทองสายใหม่ใต้ภูเขา', f: p => { p.wealth += p.cls <= 1 ? 10 : 3; p.happy += 2; } },
  { w: 3, c: p => has(p, 'grieve') && p.age > 3, t: () => 'กองทัพเดินผ่านหมู่บ้าน ขนเสบียงไปครึ่งยุ้ง', f: p => { p.wealth -= 8; p.health -= 4; p.happy -= 5; } },
  { w: 2, c: p => has(p, 'grieve') && p.age > 10, t: () => 'สองฝ่ายพักรบกันหนึ่งฤดู ชาวบ้านเลยกล้าออกไปไถนาไกลๆ อีกครั้ง', f: p => { p.happy += 5; p.wealth += 3; } },
  { w: 3, c: p => has(p, 'mulvane') && p.age > 3, t: () => 'น้ำในหนองขึ้นสูง บ้านใต้ถุนพังไปครึ่งหลัง', f: p => { p.wealth -= 5; p.health -= 3; } },
  { w: 2, c: p => has(p, 'mulvane') && p.age > 8, t: () => 'หมอผีในหนองสอนว่าใบไม้ไหนกินได้ ใบไหนมีพิษ', f: p => { p.know += 3; p.health += 2; } },
  { w: 3, c: p => has(p, 'dunes') && p.age > 3, t: () => 'พายุทรายแก้วพัดผ่าน สัตว์ในฝูงตายไปหลายตัว', f: p => { p.wealth -= 6; p.happy -= 3; } },
  { w: 2, c: p => has(p, 'dunes') && p.age > 6, t: () => 'ฝนตกกลางทะเลทรายเป็นครั้งแรกในรอบสี่ปี ทั้งเผ่าออกมาเต้นรำกลางสายฝน', f: p => { p.happy += 7; p.wealth += 2; } },
  { w: 2, c: p => p.age > 3, t: p => p.wealth > 55 ? 'ป่วยหนัก แต่หมอประจำตระกูลรักษาจนหาย' : 'ป่วยหนัก ไม่มีหมอสักคน แต่ก็รอดมาได้เพราะดวงล้วนๆ', f: p => { p.health -= p.wealth > 55 ? 4 : 12; } },
  { w: 3, c: p => p.age > 5, t: () => 'ได้เพื่อนสนิทคนใหม่', f: p => { p.happy += 5; } },
  { w: 2, c: p => p.age >= 8 && p.age <= 45 && !p.done.parent, t: p => `${parentName(p)}จากไป`, f: p => { p.happy -= 10; p.done.parent = 1; p.wealth += p.cls <= 1 ? 8 : 0; } },
  { w: 1, c: p => p.age > 10, t: () => 'เก็บถุงเงินที่ใครทำหล่นไว้ได้', f: p => { p.wealth += 4; } },
  { w: 2, c: p => p.cls === 0 && p.age > 12, t: () => 'ได้รับเชิญไปงานเลี้ยงในราชสำนัก', f: p => { p.happy += 5; p.wealth -= 2; } },
  { w: 3, c: p => p.cls === 4 && p.age > 6, t: () => 'โดนขายต่อให้นายคนใหม่ ต้องพลัดพรากจากทุกคนที่รู้จัก', f: p => { p.happy -= 10; } },
  { w: 3, c: p => p.cls === 3 && p.age > 14, t: () => 'เจ้าที่ดินเกณฑ์แรงงานไปสร้างป้อม ทั้งฤดูไม่ได้แตะนาตัวเองเลย', f: p => { p.health -= 5; p.wealth -= 3; } },
  { w: 2, c: p => has(p, 'grieve', 'dunes') && p.age > 12, t: () => 'โดนโจรดักปล้นระหว่างทางกลับบ้าน', f: p => { p.wealth -= 5; p.happy -= 3; } },
  { w: 1, c: p => p.cls >= 2 && p.cls < 4 && p.know < 15 && p.age > 8 && !p.done.monk, t: () => 'นักบวชพเนจรมาพักที่หมู่บ้าน แล้วสอนให้อ่านออกเขียนได้', f: p => { p.know += 10; p.flags.literate = true; p.done.monk = 1; p.skills.letters.r = Math.max(p.skills.letters.r, 1); } },
  { w: 2, c: p => p.kidNames.length > 0, t: p => `${pick(p.kidNames)} ลูกของคุณ${pick(['พูดคำแรกได้แล้ว', 'วิ่งมากอดคุณตอนกลับถึงบ้าน', 'ร้องเพลงที่คุณเคยร้องกล่อมได้'])}`, f: p => { p.happy += 5; } },
  { w: 2, c: p => p.kidNames.length > 0 && Math.random() < p.realm.infant * 2.5, t: p => { const n = p.kidNames.splice(Math.floor(Math.random() * p.kidNames.length), 1)[0]; return `${n} ลูกของคุณจากไปก่อนวัยอันควร`; }, f: p => { p.happy -= 15; p.lostKids++; } },
  { w: 2, c: p => !has(p, 'serenth') && p.age > 4, t: () => 'ปีนี้แล้งจัด ข้าวของแพงขึ้นสามเท่า', f: p => { p.health -= p.wealth > 50 ? 1 : 6; p.happy -= 4; p.wealth -= 3; } },
  { w: 3, c: p => has(p, 'aurelis', 'undercity') && p.flags.hiddenMage, t: () => 'ศาลศาสนาเผาหญิงแก่คนหนึ่งกลางตลาดข้อหาใช้เวท คุณซ่อนมือที่สั่นไว้ในเสื้อ', f: p => { p.happy -= 8; } },
  { w: 1, c: p => p.age > 2, t: () => 'ดาวหางสีเถ้าพาดผ่านฟ้า คนพูดกันว่าเป็นลางร้าย', f: p => { p.know += 1; } },
  { w: 2, c: p => p.cls === 1 && p.age > 16, t: () => 'ปีนี้ค้าขายดี คาราวานกลับมาครบทุกขบวน', f: p => { p.wealth += 8; p.happy += 3; } },
  { w: 2, c: p => p.age > 16 && p.wealth > 20, t: () => 'คนที่ไว้ใจโกงเงินแล้วชิ่งหนีไป', f: p => { p.wealth -= 7; p.happy -= 4; } },
  { w: 2, c: p => p.flags.churchMage, t: () => 'ศาสนจักรส่งตัวไปเป็นนักเวทประจำกองทัพ ไม่ถามความสมัครใจสักคำ', f: p => { p.happy -= 5; p.flags.soldier = 2; } },
  { w: 2, c: p => p.flags.healer, t: () => 'ใช้เวทรักษาเด็กในหมู่บ้านจนหายไข้', f: p => { p.happy += 6; } },
  { w: 2, c: p => p.flags.captive && p.age > 20, t: () => 'ตอนนี้พูดภาษาของคนที่จับตัวมาได้คล่องกว่าภาษาตัวเองแล้ว', f: p => { p.happy -= 3; p.know += 2; } },
  { w: 2, c: p => p.flags.fugitive, t: () => 'มีใบประกาศจับติดอยู่ที่ประตูเมือง หน้าในรูปเหมือนคุณเอามากๆ', f: p => { p.happy -= 5; } },
  { w: 2, c: p => p.flags.hero, t: () => 'เด็กๆ ในหมู่บ้านแย่งกันเล่นเป็นคุณเวลาเล่นรบกัน', f: p => { p.happy += 4; } },
  { w: 2, c: p => p.married && p.kin.spouse, t: p => `${p.kin.spouse}${pick(['ทำกับข้าวจานโปรดไว้รอ', 'ทะเลาะกันเรื่องเงินจนดึกดื่น', 'นั่งดูดาวด้วยกันจนฟ้าสาง'])}`, f: p => { p.happy += 2; } },
];
// ---------- everyday life (one line every quiet year) ----------
const CHILD_ANY = [
  p => `ก้าวเดินได้ก้าวแรก แล้วล้มลงในอ้อมแขนของ${p.kin.mother}`,
  () => 'พูดคำแรกได้ว่า "แม่"',
  p => `${p.kin.mother}ร้องเพลงกล่อมให้ฟังทุกคืน`,
  () => 'เล่นซ่อนหากับเด็กข้างบ้านจนมืดค่ำ',
  p => `กลัวเสียงฟ้าร้องจนต้องมุดไปนอนข้าง${p.kin.father}`,
  () => 'ร้องไห้งอแงทั้งคืน ทั้งบ้านไม่ได้นอน',
  () => 'ชอบฟังผู้ใหญ่เล่านิทานเรื่องโลกสมัยก่อนเถ้าตก',
];
const CHILD_REALM = {
  aurelis: ['ได้ยินเสียงระฆังบนหอสุริยะเป็นครั้งแรก แล้วก็จำเสียงนั้นไปทั้งชีวิต', 'ได้กินขนมน้ำผึ้งในงานฉลองที่วิหารสุริยะ', 'วิ่งเล่นในสวนกลางเมืองที่มีน้ำพุ'],
  undercity: ['แอบมองเด็กๆ ในเมืองชั้นในผ่านช่องกำแพง', 'ไปคุ้ยหาเศษอาหารหลังตลาดกับเด็กคนอื่น', 'หลังคารั่ว นอนฟังเสียงน้ำหยดลงถังทั้งคืน'],
  serenth: ['ก้มลงไปเห็นเมฆเถ้าอยู่ใต้เท้าเป็นครั้งแรก', 'พี่เลี้ยงสอนอ่านหนังสือตั้งแต่ยังเดินไม่แข็ง', 'ได้ของเล่นเป็นนกไขลานที่บินได้จริงๆ'],
  kragmor: ['พ่อพาขึ้นไปบนยอดเขา ได้เห็นแสงอาทิตย์จริงๆ เป็นครั้งแรก', 'หลับไปพร้อมเสียงค้อนที่ดังมาจากในเหมือง', 'ได้ค้อนอันจิ๋วเป็นของขวัญวันเกิด'],
  grieve: ['เรียนรู้ว่าได้ยินเสียงแตรทัพเมื่อไหร่ ต้องรีบวิ่งไปซ่อนในห้องใต้ดิน', 'เก็บหัวลูกศรเก่าในทุ่งมาเล่น', 'ช่วยแม่เก็บรวงข้าวที่ร่วงอยู่ในนาหลังเก็บเกี่ยว'],
  mulvane: ['พายเรือในหนองเป็นก่อนว่ายน้ำเป็นเสียอีก', 'เห็นคนในหมู่บ้านถูกหามออกไปเพราะไข้เถ้าดำ แต่ยังเด็กเกินกว่าจะเข้าใจ', 'จับกบตัวเบ้อเริ่มได้ เอามาอวดทั้งบ้าน'],
  dunes: ['ขี่อูฐได้เองเป็นครั้งแรก', 'เก็บเศษแก้วสีสวยจากเนินทรายมาสะสมจนเต็มถุง', 'นอนดูดาวกลางทะเลทรายกับคนทั้งเผ่า'],
};
const WORK = {
  aurelis: ['ทำงานในโรงทอผ้าในเมืองทั้งปี', 'ได้งานวิ่งส่งของให้ร้านค้าแถวตลาด', 'รับจ้างทาสีหน้าต่างวิหารสุริยะ', 'นายจ้างขึ้นค่าแรงให้นิดหน่อย'],
  undercity: ['รับจ้างแบกของที่ตลาดชั้นนอกทุกวัน', 'เข้าคิวรับจ้างลอกท่อระบายน้ำของเมืองชั้นใน', 'เก็บของเก่าจากกองขยะคนรวยไปขาย', 'วันไหนไม่มีงาน ก็ไปนั่งรอคนมาจ้างหน้าประตูเมืองตั้งแต่เช้า'],
  serenth: ['ดูแลสวนลอยฟ้าของตระกูล', 'คัดลอกตำราเก่าให้หอสมุดหลวง', 'ซ่อมกลไกที่พยุงสะพานลอยฟ้า', 'ทั้งปีหมดไปกับการแกะสลักรูปปั้นหินชิ้นเดียว'],
  kragmor: ['ลงเหมืองตั้งแต่ฟ้ายังไม่สางทุกวัน', 'ได้ย้ายไปทำงานโรงหลอมแร่ ร้อนกว่าแต่ปลอดภัยกว่าอยู่ในอุโมงค์', 'ช่วยขุดอุโมงค์ใหม่ลึกลงไปใต้ภูเขา', 'ตอกหมุดค้ำอุโมงค์อยู่ทั้งปี'],
  grieve: ['ไถนาในหุบเขาที่ยังพอปลูกอะไรได้', 'ช่วยซ่อมรั้วรอบหมู่บ้านที่ทัพเพิ่งมาพังไป', 'ขุดดินเถ้าออกจากแปลงนาทีละตะกร้า', 'เลี้ยงแพะฝูงเล็กๆ บนเนินเขา'],
  mulvane: ['จับปลา เก็บสมุนไพรในหนอง', 'ถักแหขายให้คนในหมู่บ้าน', 'รับจ้างพายเรือส่งคนข้ามหนอง', 'ตัดกกมามุงหลังคาให้เพื่อนบ้าน'],
  dunes: ['ต้อนฝูงสัตว์ข้ามเนินทรายทั้งปี', 'เก็บแก้วตามเนินทรายไปขายให้พ่อค้า', 'ช่วยเผ่าตั้งกระโจมใหม่ทุกครั้งที่ย้ายค่าย', 'หัดดูทิศลมจากผู้เฒ่าในเผ่า'],
};
function flavor(p) {
  let pool;
  if (p.age < 7) {
    pool = p.cls === 4 ? ['เริ่มช่วยแม่ทำงานในบ้านนาย ทั้งที่ยังยกถังน้ำไม่ไหว', 'นายตะคอกใส่แม่ต่อหน้าต่อตา', ...CHILD_REALM[p.realm.id]] : [...CHILD_ANY.map(f => f(p)), ...CHILD_REALM[p.realm.id]];
  } else {
    const kid = p.age < 13;
    if (p.focus === 'work') pool = p.cls === 4 ? ['รับใช้นายทั้งปี ไม่มีวันหยุดสักวัน', 'นายสั่งงานจนดึกดื่นทุกคืน', 'โดนส่งไปทำงานที่บ้านญาติของนายทั้งฤดู']
      : p.cls === 3 ? ['ทำนาบนที่ของเจ้าที่ดินทั้งปี', 'ตื่นก่อนไก่ขันไปทำนาให้เจ้าที่ดินก่อน แล้วค่อยทำนาตัวเอง', 'ซ่อมคันนาที่ฝนพังให้เจ้าที่ดิน']
      : p.cls === 0 ? ['ช่วยดูแลที่ดินและบัญชีของตระกูล', 'ไปเก็บภาษีจากไพร่ในที่ดินของตระกูล', 'ไปเจรจาการค้ากับตระกูลอื่นแทนพ่อแม่']
      : p.cls === 1 ? ['ช่วยดูแลร้านกับคาราวานของที่บ้าน', 'เดินทางไปซื้อของที่ตลาดต่างแดน', 'ต่อรองราคากับพ่อค้าคู่แข่งทั้งวัน']
      : kid ? ['ช่วยงานพ่อแม่ทั้งปี', 'ได้งานแรกเป็นเด็กรับใช้ในร้านค้า', 'อยู่บ้านเลี้ยงน้อง แม่จะได้ออกไปทำงาน'] : WORK[p.realm.id];
    else if (p.focus === 'study') pool = p.flags.literate ? ['เวลาว่างหมดไปกับการอ่านหนังสือ', 'ยืมตำรามาแล้วนั่งคัดลอกด้วยลายมือตัวเองทั้งเล่ม', 'นั่งถกเรื่องประวัติศาสตร์กับคนที่รู้มากกว่าจนดึก'] : ['อะไรที่หาเรียนได้รอบตัวก็เรียนหมด', 'นั่งฟังพ่อค้าที่ผ่านมาเล่าเรื่องต่างแดนจนลืมเวลา', 'หัดนับเลขจากการนับสัตว์ในฝูง'];
    else if (p.focus === 'love') pool = p.married && p.kin.spouse ? [`ใช้เวลาส่วนใหญ่อยู่กับ${p.kin.spouse}${p.kidNames.length ? 'และลูกๆ' : ''}`, `ซ่อมบ้านกับ${p.kin.spouse}จนเสร็จ`, `${p.kin.spouse}สอนเพลงพื้นบ้านประจำตระกูลให้`] : ['ใช้เวลาส่วนใหญ่อยู่กับครอบครัวและเพื่อนฝูง', 'นั่งคุยกับเพื่อนสนิทจนดึกแทบทุกคืน', 'ช่วยเพื่อนบ้านจัดงานแต่ง'];
    else pool = ['พักผ่อน ดูแลร่างกายตัวเอง', 'ได้นอนเต็มอิ่มเป็นครั้งแรกในรอบหลายปี', 'ออกเดินเล่นทุกเย็น จนร่างกายแข็งแรงขึ้น'];
    if (p.age > ageR(p).agingStart && Math.random() < .35) pool = ['ร่างกายไม่เหมือนเดิมแล้ว ตื่นมาก็ปวดหลังทุกเช้า', 'ผมหงอกไปเกือบทั้งหัวแล้ว', 'เพื่อนรุ่นเดียวกันเหลือน้อยลงทุกปี'];
  }
  let t = pick(pool); if (pool.length > 1 && t === p.lastFlavor) t = pick(pool);
  p.lastFlavor = t; return t;
}

// how likely an event or a choice is, beyond its own weight; story.js lowers it for things already seen
function eventWeight(p, e) { return 1; }
function choiceWeight(p, c) { return 1; }
function randomEvent(p) {
  if (Math.random() > .5) return null;
  const pool = EVENTS.filter(e => e.c(p));
  if (!pool.length) return null;
  const e = wpick(pool, x => x.w * eventWeight(p, x));
  const t = e.t(p); e.f(p); norm(p); return t;
}
function norm(p) { p.health = clamp(p.health); p.wealth = clampW(p.wealth); p.know = clamp(p.know); p.happy = clamp(p.happy); }

// ---------- choices ----------
const roll = x => Math.random() < x;
const CHOICES = [
  { id: 'path', when: p => p.age === 13, prompt: p => p.cls === 4 ? 'อายุ 13 ปี เด็กคนอื่นเริ่มเลือกทางเดินชีวิตกันแล้ว แต่ทาสไม่มีทางให้เลือก มีแค่ก้มหน้าทำงานต่อ หรือไม่ก็หนี' : 'อายุ 13 ปี ถึงเวลาต้องเลือกทางเดินชีวิตแล้ว',
    options: p => {
      if (p.cls === 0) return [
        opt('เข้าหอคัมภีร์', p => { p.know += 18; p.flags.literate = true; return 'หมดเวลาไปหลายปีกับตำราที่คนส่วนใหญ่ในแผ่นดินไม่มีวันได้เห็น'; }),
        opt('ฝึกเป็นอัศวิน', p => { p.health += 10; p.wealth += 4; p.flags.knight = true; return 'ได้ดาบเล่มแรก แล้วก็มีชื่ออยู่ในบัญชีทหารของตระกูล'; }),
        opt('ใช้ชีวิตในราชสำนัก', p => { p.happy += 10; return 'ชีวิตในวังมีแต่งานเลี้ยงกับเรื่องการเมือง เรียนรู้ว่าต้องยิ้มให้ใครบ้าง'; }),
      ];
      if (p.cls === 1) return [
        opt('สืบทอดกิจการครอบครัว', p => { p.wealth += 12; return 'เริ่มนั่งทำบัญชีข้างพ่อแม่'; }),
        opt('ฝากตัวกับนักเล่นแร่', p => { p.know += 14; p.flags.literate = true; return 'ห้องทดลองเหม็นกลิ่นกำมะถันคลุ้ง แต่ได้อ่านหนังสือทุกวัน'; }),
        opt('ออกเดินทางกับกองคาราวาน', p => { p.happy += 6; p.wealth += 6; if (roll(.08)) { die(p, 'ถูกสัตว์ร้ายทำร้ายจนเสียชีวิตระหว่างเดินทาง'); return 'คาราวานโดนดักโจมตีกลางทาง'; } return 'อายุยังไม่ถึงยี่สิบก็ไปมาครบทุกแดนแล้ว'; }),
      ];
      if (p.cls === 4) return [
        opt('ก้มหน้าทำงานต่อไป', p => { p.health -= 3; return 'ก้มหน้าทำงานต่อไปเหมือนทุกวัน'; }),
        opt('วางแผนหลบหนี', p => {
          if (check(p, 'DEX', 'stealth', 14 - (T(p, 'cunning') ? 3 : 0))) { p.cls = 2; p.flags.fugitive = true; p.wealth = 5; p.happy += 15; return 'หนีพ้นในคืนเดือนมืด ตอนนี้เป็นไทแก่ตัวแล้ว แต่ไม่มีอะไรติดตัวสักอย่าง'; }
          if (roll(.4)) { die(p, 'ถูกจับได้ระหว่างหลบหนี'); return 'หมาของนายตามกลิ่นมาจนเจอตัวก่อนฟ้าสาง'; }
          p.health -= 20; p.happy -= 15; return 'โดนจับได้ แล้วโดนลงโทษอย่างหนัก';
        }),
      ];
      return [
        opt('ทำงานกับครอบครัวต่อ', p => { p.wealth += 3; p.happy += 2; return 'รับช่วงงานที่พ่อแม่ทำมาทั้งชีวิต'; }),
        opt('ไปเป็นเด็กฝึกงานในเมือง', p => {
          if (check(p, 'CHA', 'speech', 11)) { p.know += 6; p.wealth += 4; return 'ช่างตีเหล็กคนหนึ่งยอมรับเป็นลูกศิษย์'; }
          p.happy -= 6; return 'ไม่มีใครยอมรับเด็กจากถิ่นของคุณ สุดท้ายก็ต้องกลับบ้านมือเปล่า';
        }),
        opt('หนีออกจากบ้าน', p => {
          if (check(p, 'WIS', 'survival', 11)) { p.wealth += 8; p.happy += 8; return 'ไปตั้งตัวที่เมืองท่าได้ ชีวิตลำบาก แต่ก็เป็นชีวิตที่เลือกเอง'; }
          p.wealth -= 8; p.health -= 10; return 'โลกข้างนอกโหดกว่าที่คิด กลับบ้านมาผอมโซ';
        }),
      ];
    } },
  { id: 'gift', when: p => p.gifted && p.age === 11, prompt: () => 'อายุ 11 ปี จู่ๆ ก็มีเปลวไฟเล็กๆ ลุกขึ้นกลางฝ่ามือ แล้วรู้สึกถึงเส้นใยบางๆ บนฟ้าเป็นครั้งแรก คุณเป็นหนึ่งในไม่กี่คนที่ยังใช้เวทได้',
    options: p => {
      if (has(p, 'aurelis', 'undercity')) return [
        opt('ขึ้นทะเบียนกับศาสนจักร', p => { p.know += 20; p.wealth += 10; p.happy -= 10; p.flags.churchMage = true; return 'ตั้งแต่วันนี้ชีวิตเป็นของศาสนจักร ปลอดภัยก็จริง แต่ไม่ได้เป็นนายตัวเองอีกแล้ว'; }),
        opt('ซ่อนพลังไว้', p => { p.flags.hiddenMage = true; return 'สาบานกับตัวเองว่าจะไม่ให้ใครรู้เด็ดขาด'; }),
      ];
      if (has(p, 'serenth')) return [
        opt('เข้าเรียนที่หอเวทสูง', p => { p.know += 25; p.happy += 8; return 'ทั้งตระกูลจัดงานฉลองให้ เพราะที่นี่การมีพลังเวทคือเกียรติ'; }),
        opt('เก็บไว้ใช้เงียบๆ', p => { p.happy += 3; return 'ไม่อยากให้ใครมาคาดหวังอะไร'; }),
      ];
      return [
        opt('เป็นหมอยาประจำหมู่บ้าน', p => { p.happy += 10; p.health += 5; p.flags.healer = true; return 'คนในหมู่บ้านเริ่มมาเคาะประตูกลางดึกเพื่อขอให้ช่วย'; }),
        opt('รับจ้างใช้เวทให้ขุนศึก', p => { p.wealth += 18; p.flags.warmage = true; return 'ได้เงินดี แต่ทุกครั้งที่มีศึก ต้องไปยืนอยู่แนวหน้า'; }),
      ];
    } },
  { id: 'love', when: p => p.age >= 18 && p.age <= 30 && roll(.3), prompt: p => { p.kin.cand = newName(p, p.realm); return p.cls === 4 ? `อายุ ${p.age} ปี นายสั่งให้แต่งงานกับ${p.kin.cand}` : `อายุ ${p.age} ปี คุณรัก${p.kin.cand} แต่ทางบ้านอยากให้แต่งกับลูกบ้านที่ฐานะดีกว่า`; },
    options: p => p.cls === 4 ? [
      opt('ยอมรับ', p => { p.married = true; p.kin.spouse = p.kin.cand; p.happy += 2; return `แต่งงานกับ${p.kin.spouse} ทั้งที่แทบไม่เคยคุยกันมาก่อน`; }),
      opt('ปฏิเสธ', p => { p.health -= 12; p.happy -= 6; return 'โดนลงโทษ แล้วปีหน้านายก็จะบังคับอีก'; }),
    ] : [
      opt(`แต่งงานกับ${p.kin.cand}`, p => { p.married = true; p.kin.spouse = p.kin.cand; p.happy += 15; if (has(p, 'serenth') && roll(.3)) p.flags.humanSpouse = true; return 'งานแต่งเล็กๆ แขกไม่กี่คน แต่วันนั้นจำได้ไม่มีวันลืม'; }),
      opt('แต่งงานเพื่อฐานะ', p => { p.married = true; p.kin.spouse = newName(p, p.realm); p.wealth += 14; p.happy -= 3; return `แต่งงานกับ${p.kin.spouse} ทางบ้านพอใจ ส่วนคุณก็ปลอบใจตัวเองว่าความรักเดี๋ยวก็มาเอง`; }),
      opt('อยู่ตัวคนเดียว', p => { p.happy += 2; return 'เลือกทางนี้ด้วยตัวเอง'; }),
    ] },
  { id: 'war', when: p => p.age >= 17 && p.age <= 45 && (p.realm.war >= .01 || roll(.05)) && roll(.2),
    prompt: p => `อายุ ${p.age} ปี ทหารมาเกณฑ์คนในหมู่บ้าน แล้วมีชื่อคุณอยู่ในบัญชี`,
    options: p => [
      opt('ไปรบ', p => { p.flags.soldier = 3; p.wealth += 6; p.happy -= 8; return 'ออกเดินทางไปแนวหน้าพร้อมคนรุ่นเดียวกันอีกสามสิบคน'; }),
      opt('หนีทหาร', p => { if (!check(p, 'DEX', 'stealth', 11 - (T(p, 'cunning') ? 3 : 0))) { p.health -= 15; p.wealth -= 10; p.happy -= 8; return 'โดนจับได้ ทั้งโดนลงโทษทั้งโดนปรับ'; } p.happy -= 3; return 'หลบอยู่ในป่าจนกองทัพผ่านไป'; }),
      opt('จ่ายเงินให้คนอื่นไปแทน', p => { p.wealth -= 25; return 'เด็กหนุ่มบ้านจนกว่ารับเงินไปรบแทน จนวันนี้ก็ไม่รู้ว่าเขาได้กลับมาหรือเปล่า'; }, p => p.wealth >= 45, 'ต้องมีทรัพย์ 45 ขึ้นไป'),
    ] },
  { id: 'plague', when: p => p.age >= 10 && p.realm.plague >= .008 && roll(.12), prompt: p => `อายุ ${p.age} ปี ไข้เถ้าดำระบาดหนักแถวบ้าน`,
    options: p => [
      opt('หนีออกจากเมือง', p => { p.wealth -= 15; p.flags.fled = true; return 'จ้างเกวียนพาครอบครัวไปหลบอยู่ชนบทจนโรคซา'; }, p => p.wealth >= 35, 'ต้องมีทรัพย์ 35 ขึ้นไป'),
      opt('อยู่ดูแลครอบครัว', p => { p.happy += 4 + (T(p, 'kind') ? 6 : 0); if (roll(.2 * (1.2 - Math.min(p.wealth, 100) / 100))) { die(p, 'ติดไข้เถ้าดำจากคนที่ตัวเองดูแล จนเสียชีวิต'); return 'ดูแลทุกคนจนถึงวันสุดท้ายของตัวเอง'; } return 'ดูแลทุกคนจนโรคซา แต่บางคนก็ไม่รอด'; }),
      opt('ไปหาหมอผีในหนอง', p => { p.wealth -= 4; if (roll(.12)) { die(p, 'เสียชีวิตด้วยไข้เถ้าดำ'); return 'ยาหมอผีไม่ได้ผล'; } p.health += 3; return 'ได้เครื่องรางกับยาขมมา จะได้ผลไหมก็ไม่มีใครรู้'; }),
    ] },
  { id: 'migrate', when: p => p.age >= 18 && p.age <= 40 && has(p, 'grieve', 'mulvane', 'dunes') && roll(.1),
    prompt: p => `อายุ ${p.age} ปี มีข่าวว่าที่ออเรลิสมีงานให้ทำ มีข้าวกินอิ่มท้อง`,
    options: p => [
      opt('อพยพไปออเรลิส', p => {
        p.wealth -= 10;
        if (p.wealth >= 45 && roll(.6)) { move(p, RBY.aurelis); p.happy += 8; return 'จ่ายค่าผ่านประตู แล้วได้เข้าไปอยู่ในเมืองชั้นใน'; }
        move(p, RBY.undercity); p.happy -= 4; return 'ทหารที่ประตูชั้นในไม่ให้คนอย่างคุณเข้า เลยต้องไปอาศัยอยู่ใต้กำแพงแทน';
      }),
      opt('อยู่ที่เดิม', () => 'เลือกอยู่บ้านเกิดต่อ'),
    ] },
  { id: 'child', repeat: 4, when: p => p.married && p.age >= 19 && p.age <= 40 && roll(.3),
    prompt: p => `อายุ ${p.age} ปี คุยกับ${p.kin.spouse || 'คู่ชีวิต'}เรื่องมีลูก`,
    options: p => [
      opt('มีลูก', p => {
        if (p.sex === 'ญ' && roll(p.realm.infant * .12)) { die(p, 'เสียชีวิตขณะคลอดบุตร'); return 'คลอดครั้งนี้ไม่ราบรื่น'; }
        const n = newName(p, p.realm);
        if (roll(p.realm.infant)) { p.lostKids++; p.happy -= 12; return `${n} ลูกของคุณเสียชีวิตก่อนอายุครบขวบ`; }
        p.kidNames.push(n); if (p.firstKidAge == null) p.firstKidAge = p.age; p.happy += 8; return `${n} ลูกคนใหม่ของคุณเกิดมาแข็งแรง`;
      }),
      opt('ยังไม่พร้อม', () => 'ตัดสินใจรอไปอีกสักพัก'),
    ] },
  { id: 'debt', when: p => p.age > 20 && p.wealth < 12 && p.cls >= 2 && p.cls < 4 && roll(.12),
    prompt: p => `อายุ ${p.age} ปี เงินหมดเกลี้ยง ไม่มีอะไรตกถึงท้องแล้ว`,
    options: p => [
      opt('กู้เงินเจ้าที่ดิน', p => { p.wealth += 15; p.flags.debt = true; if (p.cls === 2 && roll(.5)) { p.cls = 3; return 'ใช้หนี้ไม่ไหว สุดท้ายต้องขายตัวเป็นไพร่ติดที่ดิน'; } return 'ดอกเบี้ยจะเป็นภาระไปอีกหลายปี'; }),
      opt('ขายของมีค่าที่เหลือ', p => { p.wealth += 6; p.happy -= 6; return 'ขายแหวนที่แม่ให้ไว้'; }),
      opt('ทนหิวต่อไป', p => { p.health -= 12; return 'ทั้งหน้าหนาวได้กินแค่วันละมื้อ'; }),
    ] },
  // ----- realm-specific -----
  { id: 'inquisition', when: p => has(p, 'aurelis') && p.age >= 16 && p.age <= 50 && roll(.1),
    prompt: p => `อายุ ${p.age} ปี ศาลศาสนามาขอให้ชี้ตัวเพื่อนบ้านที่ถูกสงสัยว่าใช้เวท`,
    options: p => [
      opt('ชี้ตัว', p => { p.wealth += 10; p.happy -= 10; p.flags.betrayer = true; return 'ได้เงินรางวัล แล้วบ้านข้างๆ ก็เงียบไปตั้งแต่วันนั้น'; }),
      opt('ปฏิเสธว่าไม่รู้อะไร', p => { if (roll(.25)) { p.health -= 15; return 'โดนเรียกตัวไปสอบสวนอยู่สามวัน'; } return 'พวกเขาจดชื่อคุณไว้ แล้วก็กลับไป'; }),
      opt('ช่วยเพื่อนบ้านหนีออกจากเมือง', p => { p.happy += 10 + (T(p, 'kind') ? 5 : 0); p.flags.savedOther = true; if (roll(.15)) { die(p, 'ถูกศาลศาสนาประหารในข้อหาช่วยแม่มดหลบหนี'); return 'คืนนั้นมีคนเห็นคุณอยู่ที่ประตูเมือง'; } return 'เธอหายลับไปในความมืดนอกกำแพง ปีต่อมามีจดหมายขอบคุณจากเธอส่งมาถึง'; }),
    ] },
  { id: 'gatepass', when: p => has(p, 'undercity') && p.age >= 15 && p.age <= 40 && roll(.12),
    prompt: p => `อายุ ${p.age} ปี มีคนแอบมาเสนอขายบัตรผ่านประตูชั้นในปลอมให้`,
    options: p => [
      opt('ซื้อบัตร', p => { p.wealth -= 18; if (check(p, 'CHA', 'speech', 13 - (T(p, 'cunning') ? 3 : 0))) { move(p, RBY.aurelis); p.happy += 12; return 'ยามจ้องบัตรอยู่นานจนต้องกลั้นหายใจ แล้วก็โบกมือให้ผ่าน ตอนนี้ได้อยู่ในเมืองชั้นในแล้ว'; } p.health -= 12; return 'ยามจับได้ โดนเฆี่ยนแถมโดนยึดเงิน'; }, p => p.wealth >= 18, 'ต้องมีทรัพย์ 18 ขึ้นไป'),
      opt('เข้าร่วมกลุ่มต่อต้านใต้กำแพง', p => { p.flags.rebel = true; p.happy += 4; return 'เริ่มแอบไปประชุมลับที่โรงฟอกหนังทุกเจ็ดวัน'; }),
      opt('ไม่ยุ่ง', () => 'ทำเป็นไม่ได้ยิน แล้วเดินผ่านไป'),
    ] },
  { id: 'riot', when: p => p.flags.rebel && p.age >= 18 && roll(.25),
    prompt: p => `อายุ ${p.age} ปี กลุ่มต่อต้านนัดกันบุกประตูชั้นในคืนพรุ่งนี้`,
    options: p => [
      opt('ไปยืนแถวหน้า', p => { p.flags.rose = true; const u = check(p, 'STR', 'sword', 15) ? 0 : .3 + Math.random() * .7; if (u < .3) { p.wealth += 15; p.happy += 15; return 'ประตูชั้นในเปิดอยู่คืนหนึ่ง คนใต้กำแพงได้เหยียบถนนทองคำเป็นครั้งแรก แล้วทางการก็ยอมลดภาษีให้'; } if (u < .65) { die(p, 'เสียชีวิตระหว่างการลุกฮือที่ประตูชั้นใน'); return 'ทหารม้าบุกออกมาจากประตูตั้งแต่ฟ้ายังไม่สาง'; } p.cls = 4; p.happy -= 15; return 'โดนจับ แล้วโดนขายเป็นทาสใช้หนี้ความผิด'; }),
      opt('ช่วยอยู่เบื้องหลัง', p => { p.flags.rose = true; p.happy += 3; return 'นั่งเย็บผ้าพันแผลทั้งคืน การลุกฮือล้มเหลว แต่คนก็ยังพูดถึงมันไปอีกนาน'; }),
      opt('ถอนตัว', p => { p.flags.rebel = false; p.happy -= 5; return 'ปิดประตูบ้าน แล้วนั่งฟังเสียงโกลาหลข้างนอก'; }),
    ] },
  { id: 'refugee', when: p => has(p, 'serenth') && p.age >= 20 && roll(.04),
    prompt: p => `อายุ ${p.age} ปี เด็กผู้ลี้ภัยมนุษย์คนหนึ่งแอบขึ้นมาบนนครลอยได้ แล้วมาซ่อนตัวอยู่ในสวนบ้านคุณ`,
    options: p => [
      opt('ซ่อนไว้และเลี้ยงดู', p => { p.happy += 8; p.flags.savedOther = true; if (roll(.25)) { p.wealth -= 30; if (p.cls === 0) p.cls = 2; return 'สภาผู้อาวุโสรู้เข้า คุณโดนถอดยศยึดทรัพย์ ส่วนเด็กโดนส่งกลับลงไปข้างล่าง'; } return 'เด็กคนนั้นโตมาในบ้านคุณ แล้วเรียกคุณว่าพ่อว่าแม่'; }),
      opt('ส่งตัวให้ยาม', p => { p.happy -= 6; return 'เด็กโดนส่งกลับลงไปใต้เมฆเถ้า คุณไม่ได้ถามด้วยซ้ำว่าพาไปไว้ที่ไหน'; }),
      opt('แอบพาไปส่งที่พื้นดิน', p => { p.happy += 4; p.know += 5; return 'ได้เห็นแผ่นดินข้างล่างกับตาเป็นครั้งแรก แย่กว่าที่ตำราเขียนไว้เยอะ'; }),
    ] },
  { id: 'ennui', when: p => has(p, 'serenth') && p.age >= 110 && roll(.05),
    prompt: p => `อายุ ${p.age} ปี อยู่มากว่าร้อยปีแล้ว ชักไม่แน่ใจว่าตื่นมาทุกเช้าไปทำไม`,
    options: p => [
      opt('ลงไปใช้ชีวิตบนแผ่นดินเบื้องล่าง', p => { move(p, RBY.grieve); p.happy += 10; p.wealth -= 20; return 'ลงไปอยู่ทุ่งเถ้า คนที่นั่นอายุสั้นกว่าคุณสิบเท่า เลยใช้ชีวิตเร็วกว่าคุณสิบเท่า'; }),
      opt('ศึกษาคัมภีร์ต่ออีกร้อยปี', p => { p.know += 15; p.happy -= 4; return 'หอสมุดยังมีห้องที่ไม่เคยเข้าไปอยู่อีก'; }),
      opt('จัดสวนใหม่ทั้งหมด', p => { p.happy += 6; return 'ต้นไม้ที่ปลูกวันนี้จะโตเต็มที่ในอีกสองร้อยปี และคุณก็จะได้อยู่ดู'; }),
    ] },
  { id: 'stonedoor', when: p => has(p, 'kragmor') && p.age >= 16 && p.age <= 60 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี คนงานขุดเจอประตูหินโบราณอยู่ใต้ชั้นแร่ ไม่มีใครรู้ว่ามาจากไหน`,
    options: p => [
      opt('เปิดประตูเอง', p => { const u = check(p, 'INT', 'history', 13) ? 0 : .3 + Math.random() * .7; if (u < .3) { p.wealth += 30; p.know += 10; p.flags.treasure = true; return 'ข้างในเป็นคลังสมบัติของกษัตริย์คนแคระที่ถูกลืม แบกทองออกมาได้สองถุง'; } if (u < .55) { p.health -= 25; return 'อากาศข้างในเป็นพิษ ไอไม่หยุดไปทั้งปี'; } if (u < .65) { die(p, 'หายไปหลังประตูหินใต้ภูเขา'); return 'ประตูปิดลงตามหลัง'; } return 'ข้างในว่างเปล่า มีแต่ฝุ่นที่สะสมมาเป็นพันปี'; }),
      opt('รายงานต่อขุนนาง', p => p.cls <= 1 ? (p.wealth += 20, 'ตามกฎของเหมือง ทุกอย่างในห้องนั้นตกเป็นของตระกูลคุณ') : (p.wealth += 2, p.happy -= 5, 'ขุนนางเอาไปหมด ได้ค่าเหนื่อยแค่เหรียญเงินเหรียญเดียว')),
      opt('ปิดผนึกไว้ตามเดิม', () => 'บอกตัวเองว่าบางประตูก็ไม่ควรไปเปิด'),
    ] },
  { id: 'strike', when: p => has(p, 'kragmor') && p.cls >= 2 && p.cls < 4 && p.age >= 18 && p.age <= 55 && roll(.1),
    prompt: p => `อายุ ${p.age} ปี คนงานเหมืองนัดหยุดงาน เรียกร้องค่าทำขวัญให้ครอบครัวคนที่ตายในอุโมงค์`,
    options: p => [
      opt('ร่วมนัดหยุดงาน', p => { if (roll(.5)) { p.wealth += 8; p.happy += 8; p.flags.safeMine = true; return 'เจ้าเหมืองยอมค้ำอุโมงค์ใหม่ทั้งหมด ปีต่อมาคนตายในเหมืองลดลงครึ่งหนึ่ง'; } p.wealth -= 15; p.happy -= 5; return 'เจ้าเหมืองจ้างคนงานชุดใหม่มาแทน คุณตกงาน'; }),
      opt('ทำงานต่อ', p => { p.wealth += 5; p.happy -= 8; return 'ได้ค่าแรงสองเท่า แต่เพื่อนร่วมงานไม่มองหน้าอีกเลย'; }),
      opt('แจ้งชื่อแกนนำให้หัวหน้าเหมือง', p => { p.wealth += 12; p.happy -= 12; p.flags.betrayer = true; return 'แกนนำสามคนหายตัวไปจากเหมือง ส่วนคุณได้เลื่อนขั้น'; }),
    ] },
  { id: 'enemychild', when: p => has(p, 'grieve') && p.age >= 18 && p.age <= 60 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี เจอเด็ก${p.race === 'ออร์ค' ? 'มนุษย์' : 'ออร์ค'}นอนบาดเจ็บอยู่กลางทุ่ง เป็นเด็กจากฝ่ายที่เคยฆ่าคนในหมู่บ้านคุณ`,
    options: p => [
      opt('พากลับไปรักษา', p => { p.happy += 6 + (T(p, 'kind') ? 6 : 0); p.flags.savedOther = true; if (roll(.3)) { p.happy -= 12; p.wealth -= 8; return 'คนในหมู่บ้านรู้เข้า บ้านคุณโดนเผาไปครึ่งหลัง แต่เด็กคนนั้นรอด'; } return 'สามปีต่อมา กองทัพอีกฝ่ายเดินผ่านหมู่บ้านไปโดยไม่แตะต้องอะไรเลย'; }),
      opt('ทิ้งไว้ตรงนั้น', p => { p.happy -= 6; return 'เดินกลับบ้านโดยไม่หันไปมองอีก'; }),
      opt('ส่งตัวให้ทหาร', p => { p.wealth += 6; p.happy -= 10; return 'ทหารโยนเหรียญให้สองเหรียญ'; }),
    ] },
  { id: 'trial', when: p => has(p, 'mulvane') && p.age >= 15 && p.age <= 50 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี นักเล่นแร่จากออเรลิสเสนอเงินก้อนโต ขอเอาตัวคุณไปลองยารักษาไข้เถ้าดำ`,
    options: p => [
      opt('รับเงินและยอมให้ทดลอง', p => { p.wealth += 22; const u = Math.random(); if (u < .45 + luck(p)) { p.flags.immune = true; p.health += 10; return 'ยาได้ผล ไม่ติดไข้เถ้าดำอีกเลย ส่วนนักเล่นแร่ก็เอายาไปขายในออเรลิส ในราคาที่คนในหนองไม่มีปัญญาซื้อ'; } if (u < .8) { p.health -= 22; return 'ยาทำตับพัง แต่ก็ยังไม่ตาย'; } die(p, 'ไม่รอดจากยาทดลองของนักเล่นแร่'); return 'ในบันทึกของเขา คุณถูกเรียกว่า "ตัวอย่างที่ 14"'; }),
      opt('ปฏิเสธ', () => 'เขาไปเคาะบ้านถัดไป ซึ่งจนกว่าบ้านคุณ'),
    ] },
  { id: 'crown', when: p => has(p, 'mulvane') && p.age >= 14 && p.age <= 45 && roll(.06),
    prompt: p => `อายุ ${p.age} ปี คนแก่เล่าว่ามงกุฎของกษัตริย์ก็อบลินองค์สุดท้ายจมอยู่ใต้หนองดำ`,
    options: p => [
      opt('ดำลงไปหา', p => { const u = check(p, 'CON', null, 15) ? 0 : .2 + Math.random() * .8; if (u < .2) { p.wealth += 35; p.flags.treasure = true; return 'นิ้วไปโดนอะไรแข็งๆ ในโคลน มงกุฎมีอยู่จริง'; } if (u < .35) { die(p, 'จมน้ำหายไปในหนองดำ'); return 'โคลนดูดตัวลงไป'; } p.health -= 8; return 'ได้แต่โคลนกับปลิงติดตัวกลับมา'; }),
      opt('หัวเราะแล้วกลับบ้าน', () => 'ได้ยินเรื่องนี้มาตั้งแต่เด็กแล้ว'),
    ] },
  { id: 'oasis', when: p => has(p, 'dunes') && p.age >= 16 && p.age <= 55 && roll(.1),
    prompt: p => `อายุ ${p.age} ปี ฝูงสัตว์ใกล้ตายเพราะขาดน้ำ แต่บ่อที่ใกล้ที่สุดเป็นของอีกเผ่า`,
    options: p => [
      opt('เจรจาแลกของ', p => { p.wealth -= 8; return 'เอาพรมสามผืนไปแลกน้ำหนึ่งคืน คืนนั้นสองเผ่ากินเลี้ยงด้วยกัน'; }),
      opt('บุกยึดบ่อน้ำ', p => { const u = check(p, 'DEX', 'bow', 12) ? 0 : .5 + Math.random() * .5; if (u < .5) { p.wealth += 12; return 'เผ่าของคุณยึดบ่อน้ำได้ อีกเผ่าต้องเดินต่อไปกลางทะเลทราย'; } if (u < .85) { p.health -= 15; return 'โดนตีถอยกลับมาพร้อมแผลเต็มตัว'; } die(p, 'เสียชีวิตในการแย่งบ่อน้ำ'); return 'ศึกแย่งบ่อน้ำจบลงก่อนตะวันตกดิน'; }),
      opt('เดินต่อไปหาที่ใหม่', p => roll(.5) ? 'สามวันต่อมาเจอบ่อน้ำที่ไม่เคยมีใครรู้มาก่อน' : (p.wealth -= 15, p.health -= 10, 'สัตว์ครึ่งฝูงไม่รอดไปถึงบ่อถัดไป')),
    ] },
  { id: 'guide', when: p => has(p, 'dunes') && p.age >= 18 && p.age <= 50 && roll(.08),
    prompt: p => `อายุ ${p.age} ปี คาราวานจากออเรลิสจ้างให้นำทางผ่านเขตพายุแก้ว ค่าจ้างเท่ากับรายได้สามปี`,
    options: p => [
      opt('รับงาน', p => { if (!check(p, 'WIS', 'survival', 3)) { die(p, 'หลงทางในพายุทรายแก้ว'); return 'พายุมาเร็วกว่าที่คิดไว้'; } p.wealth += 18; return 'พาทุกคนผ่านไปได้ พ่อค้าจ่ายเงินครบ แต่ไม่เคยถามชื่อสักคำ'; }),
      opt('ปฏิเสธ', () => 'คนที่รับงานแทนไม่ได้กลับมา'),
    ] },
  // ----- general -----
  { id: 'stranger', when: p => p.age >= 20 && p.age <= 70 && p.cls < 4 && roll(.05),
    prompt: p => `อายุ ${p.age} ปี นักเดินทางบาดเจ็บมาเคาะประตูขอค้างคืน`,
    options: p => [
      opt('ให้พัก', p => { p.happy += T(p, 'kind') ? 8 : 3; const u = Math.random(); if (u < .5) { p.wealth += 10; p.know += 5; return 'เขาเป็นนักปราชญ์ที่หนีมาจากออเรลิส ก่อนไปทิ้งหนังสือกับเงินไว้ให้'; } if (u < .8) return 'เช้ามาเขาก็ขอบคุณแล้วลาไป'; p.wealth -= 10; return 'เช้ามาเขาหายไปแล้ว พร้อมกับของมีค่าในบ้าน'; }),
      opt('ไม่เปิดประตู', () => 'ดึกๆ เสียงเคาะประตูก็เงียบไป'),
    ] },
  { id: 'dice', when: p => p.age >= 18 && p.wealth >= 10 && p.cls < 4 && roll(.05),
    prompt: p => `อายุ ${p.age} ปี วงทอยเต๋ากระดูกในโรงเตี๊ยมกำลังเล่นกันคึกคัก`,
    options: p => [
      opt('ทุ่มเงินทั้งหมดที่มี', p => { if (roll(.45 + luck(p))) { p.wealth = clampW(p.wealth * 2); p.happy += 8; return 'เต๋าออกหกทั้งสามลูก ทั้งโรงเตี๊ยมเงียบกริบ'; } p.wealth = p.wealth * .3; p.happy -= 10; return 'เดินกลับบ้านตัวเปล่าใต้แสงจันทร์'; }),
      opt('เล่นนิดหน่อย', p => { const g = roll(.5) ? 4 : -4; p.wealth += g; return g > 0 ? 'ได้มานิดหน่อย พอซื้อเหล้าได้เหยือกหนึ่ง' : 'เสียไปนิดหน่อย'; }),
      opt('ไม่เล่น', () => 'นั่งดูคนอื่นเล่นเฉยๆ'),
    ] },
  { id: 'parentsick', when: p => p.age >= 18 && p.age <= 45 && !p.done.parent && roll(.07),
    prompt: p => `อายุ ${p.age} ปี ${p.kin.mother} แม่ของคุณป่วยหนัก ยาที่รักษาได้ราคาเท่ากับครึ่งหนึ่งของทุกอย่างที่มี`,
    options: p => [
      opt('ซื้อยา', p => { p.wealth *= .5; p.done.parent = 1; if (roll(.7)) { p.happy += 8; return `${p.kin.mother}หายป่วย อยู่ต่อมาได้อีกหลายปี`; } p.happy -= 10; return 'ยาไม่ได้ผล เสียทั้งแม่ เสียทั้งเงิน'; }),
      opt('ดูแลเองที่บ้าน', p => { p.done.parent = 1; if (roll(.35)) { p.happy += 6; return 'แม่ค่อยๆ ฟื้นขึ้นมาด้วยข้าวต้มร้อนๆ กับการเฝ้าไข้ของคุณ'; } p.happy -= 14; return `${p.kin.mother}จากไปในอ้อมกอดของคุณ`; }),
    ] },
];
function checkChoice(p) {
  // long-lived elves would otherwise meet every story; keep their pace closer to a human life
  if (p.realm.id === 'serenth' && p.age > 60 && Math.random() < .7) return null;
  const pool = CHOICES.filter(c => {
    const n = p.done[c.id] || 0;
    if (n >= (c.repeat || 1)) return false;
    return c.when(p);
  });
  if (!pool.length) return null;
  const c = pool.some(c => choiceWeight(p, c) !== 1) ? wpick(pool, c => choiceWeight(p, c)) : pick(pool);
  p.done[c.id] = (p.done[c.id] || 0) + 1;
  const prompt = c.prompt(p);
  return { id: c.id, prompt, options: c.options(p) };
}
function resolveChoice(p, o) { p.checks = []; const t = o.act(p); norm(p); gainXP(p, 12); return t; }
function autoChoose(p, ch) { const ok = ch.options.filter(o => !o.need || o.need(p)); return pick(ok); }

function finishYear(p, noFlavor) {
  const lines = [];
  if (!p.alive) return { lines };
  const y = yearOf(p);
  for (const e of ERAS) if (y === e.from || (p.age === 0 && y > e.from && y <= e.to)) lines.push('§' + `ห.ถ. ${e.from}: ${e.n} · ${e.t}`);
  const worldN = lines.length;
  drift(p);
  const ft = applyFocus(p); if (ft) lines.push(ft);
  const et = randomEvent(p); if (et) lines.push(et);
  norm(p);
  gainXP(p, 10);
  const quiet = !et && !worldN;
  if (!et && !ft && !noFlavor) lines.push(flavor(p));
  p.years.push({ h: p.happy, hp: p.health });
  const d = rollDeath(p);
  if (d && d.fate) return { lines, fate: d.fate, quiet: false };
  if (d) return { lines, quiet: false };
  advance(p);
  return { lines, quiet };
}
function advance(p) { p.age++; if (p.age > 400) die(p, 'จากไปอย่างสงบด้วยวัยชรา'); }
function afterFate(p) { if (p.alive) advance(p); }

const FOCI = ['work', 'train', 'train', 'love', 'rest'];
function simLife(realm) {
  const p = makePerson(realm); p.auto = true;
  while (p.alive) {
    if (p.age >= 7 && Math.random() < .15) p.focus = pick(FOCI);
    const ch = checkChoice(p);
    if (ch) { resolveChoice(p, autoChoose(p, ch)); if (!p.alive) { p.years.push({ h: p.happy }); break; } }
    const r = finishYear(p);
    if (r.fate) { resolveChoice(p, autoChoose(p, r.fate)); afterFate(p); }
  }
  return p;
}
function statsFor(r, n) {
  let sum = 0, s5 = 0, s15 = 0, s30 = 0, s50 = 0; const ages = [];
  for (let i = 0; i < n; i++) {
    const p = simLife(r); const a = p.age; ages.push(a); sum += a;
    if (a >= 5) s5++; if (a >= 15) s15++; if (a >= 30) s30++; if (a >= 50) s50++;
  }
  ages.sort((x, y) => x - y);
  return { mean: sum / n, median: ages[n >> 1], s5: s5 / n, s15: s15 / n, s30: s30 / n, s50: s50 / n };
}

// ---------- legends ----------
const LEGENDS = [
  { id: 'unborn', n: 'ไม่ทันได้ลืมตา', d: 'เสียชีวิตก่อนอายุครบหนึ่งขวบ', c: p => p.age === 0 },
  { id: 'deathdodger', n: 'ผู้หนีความตาย', d: 'รอดตายมาแล้วอย่างน้อย 2 ครั้ง', c: p => p.flags.reprieves >= 2 },
  { id: 'escaped', n: 'โซ่ที่ขาด', d: 'เกิดเป็นทาส แล้วหนีออกมาได้', c: p => p.flags.fugitive && p.bornCls === 4 },
  { id: 'ashtogold', n: 'จากเถ้าสู่ทอง', d: 'เกิดเป็นไพร่หรือทาส แต่มีทรัพย์ 70 ขึ้นไป', c: p => p.bornCls >= 3 && p.wealth >= 70 },
  { id: 'fallen', n: 'ร่วงจากหอคอย', d: 'เกิดเป็นขุนนางหรือพ่อค้า แต่ตายเป็นไพร่หรือทาส', c: p => p.bornCls <= 1 && p.cls >= 3 },
  { id: 'elder', n: 'ผู้เฒ่าแห่งแดน', d: 'อายุยืนเป็นสองเท่าของอายุขัยเฉลี่ยในแดนที่เกิด', c: (p, ws) => p.age >= Math.max(40, ws[p.born.id].mean * 2) },
  { id: 'sage', n: 'ปราชญ์', d: 'มีความรู้ 80 ขึ้นไป', c: p => p.know >= 80 },
  { id: 'rebel', n: 'เสียงจากใต้กำแพง', d: 'ร่วมลุกฮือบุกประตูชั้นใน', c: p => p.flags.rose },
  { id: 'witch', n: 'แม่มดที่ไม่มีใครรู้', d: 'ซ่อนพลังเวทได้จนตายด้วยความแก่', c: p => p.flags.hiddenMage && p.cause.includes('วัยชรา') },
  { id: 'mercy', n: 'มือที่ยื่นข้ามเส้น', d: 'ยื่นมือช่วยคนที่ไม่มีใครกล้าช่วย', c: p => p.flags.savedOther },
  { id: 'traitor', n: 'ผู้ชี้ตัว', d: 'หักหลังคนอื่นเพื่อเอาตัวรอด', c: p => p.flags.betrayer },
  { id: 'hero', n: 'ผู้ยืนหยัดจนฝุ่นจาง', d: 'รอดชีวิตจากแนวรบที่แตก', c: p => p.flags.hero },
  { id: 'treasure', n: 'ผู้ค้นพบ', d: 'เจอสมบัติที่ถูกลืม', c: p => p.flags.treasure },
  { id: 'dynasty', n: 'สายเลือดสามรุ่น', d: 'เล่นต่อเป็นลูกหลานจนถึงรุ่นที่ 3', c: p => p.gen >= 3 },
  { id: 'average', n: 'ชีวิตตามค่าเฉลี่ย', d: 'ตายในวัยที่ห่างจากอายุขัยเฉลี่ยของแดนไม่เกิน 1 ปี', c: (p, ws) => p.age > 0 && Math.abs(p.age - ws[p.born.id].mean) <= 1 },
  { id: 'captive', n: 'เชลยศึก', d: 'ยอมแพ้เพื่อแลกกับชีวิต', c: p => p.flags.captive },
];
function legendsFor(p, ws) { return LEGENDS.filter(l => { try { return l.c(p, ws); } catch (e) { return false; } }); }

// ===== HOW LATER FILES EXTEND THE ENGINE =====
// each system (family, housing, disease...) changes core behaviour by wrapping a global function.
// every wrap goes through extend() so it is labelled and listed in LAYERS in load order:
// type LAYERS in the browser console to see exactly what runs, outermost last.
const LAYERS = [];
function extend(name, label, make) {
  const inner = globalThis[name];
  if (typeof inner !== 'function') throw new Error('extend: no function ' + name);
  globalThis[name] = make(inner);
  LAYERS.push(name + ' · ' + label);
}
// join yearly text pieces; pieces can be strings, null, or arrays of strings
const joinT = (...xs) => xs.flat().filter(Boolean).join(' · ') || null;
// the common cases: add something after the core year, after a person is made, or adjust death risks
function afterYear(label, fn) { extend('applyFocus', label, inner => function (p) { const t = inner(p); if (!p.alive) return t; return joinT(t, fn(p)); }); }
function onBorn(label, fn) { extend('makePerson', label, inner => function (realm, parent) { const p = inner(realm, parent); fn(p, parent, realm); return p; }); }
function modHazards(label, fn) { extend('hazards', label, inner => function (p) { const H = inner(p); fn(p, H); return H; }); }



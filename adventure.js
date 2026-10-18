// ===== GENTLER DEATH, MORE ADVENTURE =====
// the world is still harsh and still unequal, but fewer lives end before they start
for (const r of REALMS) {
  r.infant *= .45; r.child *= .5; r.adult *= .6;
  r.plague *= .6; r.famine *= .6; r.war *= .6; r.mine *= .6; r.beast *= .6;
}
for (const k of Object.keys(FOES)) FOES[k].lethal *= .7;

// ---- the quest board ----
LEDGER_L.quest = 'รางวัลจากการผจญภัย';
const qF = r => (r.wealth / 50 + .4);
function payQuest(p, base, txt) { const v = Math.round(base * qF(p.realm) * (.8 + Math.random() * .4) * 10) / 10; p.wealth += v; led(p, 'quest', v); p.flags.quests = (p.flags.quests || 0) + 1; return `${txt} ได้รางวัล ${money(v)}`; }
function lootMats(p, list) { const got = {}; for (const [m, n] of list) { if (n > 0) { addMat(p, m, n); got[m] = (got[m] || 0) + n; } } const t = Object.entries(got).map(([m, n]) => `${MATS[m].n} ${n} ชิ้น`).join(' กับ'); return t ? ` และเก็บ${t}กลับมาด้วย` : ''; }
const QUESTS = [
  { id: 'escort', n: 'คุ้มกันกองคาราวาน', danger: 1, realms: ['aurelis', 'undercity', 'kragmor', 'grieve', 'dunes', 'mulvane'],
    d: 'พ่อค้าจ้างคนถือดาบเดินไปกับขบวนสินค้าข้ามที่ราบ',
    build: p => ({ prompt: `อายุ ${p.age} ปี กองคาราวานของพ่อค้าออกเดินทางตั้งแต่ก่อนฟ้าสาง กลางทางมีโจรกลุ่มหนึ่งซุ่มอยู่หลังเนิน`, options: [
      fightOpt('ปกป้องขบวน', 'bandit', { lethal: .2, intro: 'โจรวิ่งลงมาจากเนิน', death: 'เสียชีวิตขณะคุ้มกันกองคาราวาน', onEnd: (q, r) => r === 'win' ? payQuest(q, 6, 'ขบวนสินค้าไปถึงปลายทางครบทุกเกวียน') : r === 'lose' ? 'โจรขนสินค้าไปครึ่งขบวน พ่อค้าไม่จ่ายค่าจ้างคุณ' : r === 'fled' ? 'คุณหนีรอดมาได้ แต่ไม่ได้ค่าจ้าง' : '' }),
      Object.assign(opt('พาขบวนอ้อมไปอีกทาง', q => check(q, 'WIS', 'survival', 13) ? payQuest(q, 4, 'คุณพาขบวนอ้อมโจรไปได้โดยไม่มีใครเห็น') : (q.health -= 8, 'ทางอ้อมพาขบวนไปติดในหุบเขาเถ้าอยู่สามวัน พ่อค้าหักค่าจ้างคุณจนหมด')), { chk: ['WIS', 'survival'] }),
    ] }) },
  { id: 'bounty', n: 'ตามล่าค่าหัว', danger: 2, realms: ['aurelis', 'undercity', 'kragmor', 'dunes'],
    d: 'ใบประกาศจับติดอยู่ที่ประตูเมือง ค่าหัวไม่น้อยเลย',
    build: p => ({ prompt: `อายุ ${p.age} ปี คุณตามรอยคนในใบประกาศจับไปจนถึงโรงเตี๊ยมร้างนอกเมือง เขานั่งหันหลังให้ประตู`, options: [
      fightOpt('บุกเข้าไปจับตัว', 'hunter', { lethal: .25, intro: 'เขาลุกขึ้นพร้อมชักดาบ', death: 'ถูกอาชญากรที่ตามล่าสังหาร', onEnd: (q, r) => r === 'win' ? payQuest(q, 14, 'คุณลากตัวเขากลับไปส่งทางการ') : r === 'fled' ? 'เขาหนีไปได้ และตอนนี้รู้แล้วว่ามีคนตามล่า' : r === 'lose' ? 'เขาทิ้งคุณไว้กับพื้นโรงเตี๊ยม แล้วหายไปในความมืด' : '' }),
      Object.assign(opt('วางกับดักรอข้างนอก', q => { if (check(q, 'DEX', 'stealth', 14)) return payQuest(q, 14, 'เขาก้าวออกมาเหยียบเชือกพอดี คุณมัดตัวเขาได้โดยไม่ต้องชักดาบ'); startFight(q, 'hunter', { lethal: .25, death: 'ถูกอาชญากรที่ตามล่าสังหาร', onEnd: (z, r) => r === 'win' ? payQuest(z, 14, 'สุดท้ายคุณก็จับตัวเขาได้') : 'เขาหนีไปได้' }); return 'เขาเห็นกับดักก่อนจะก้าวออกมา'; }), { chk: ['DEX', 'stealth'], fight: 'hunter' }),
    ] }) },
  { id: 'nest', n: 'ล้างรังโจร', danger: 3, realms: ['grieve', 'dunes', 'mulvane'],
    d: 'หมู่บ้านทั้งหมู่บ้านรวมเงินกันจ้างคนไปกำจัดรังโจรบนเขา',
    build: p => ({ prompt: `อายุ ${p.age} ปี รังโจรอยู่ในซากป้อมเก่าบนเนินเขา มีแสงไฟลอดออกมาจากช่องหน้าต่าง หัวหน้าโจรเป็นอดีตทหารที่ไม่มีใครเอาชนะได้`, options: [
      fightOpt('บุกเข้าไปท้าหัวหน้าโจร', 'boss', { lethal: .35, intro: 'หัวหน้าโจรลุกขึ้นจากกองไฟ', death: 'เสียชีวิตขณะบุกรังโจร', onEnd: (q, r) => r === 'win' ? (q.flags.heroOfVillage = true, payQuest(q, 28, 'ชาวบ้านจัดงานเลี้ยงให้คุณสามวันสามคืน') + lootMats(q, [['ore', 2], ['hide', 1]])) : r === 'fled' ? 'คุณหนีลงเขามาได้อย่างหวุดหวิด' : r === 'lose' ? 'โจรโยนคุณลงจากเนินเขาและคิดว่าคุณตายแล้ว' : '' }),
      Object.assign(opt('ลอบเผาเสบียงตอนกลางคืน', q => { if (check(q, 'DEX', 'stealth', 15)) return payQuest(q, 16, 'ไม่มีเสบียง พวกโจรก็แตกกระเจิงไปเองภายในเจ็ดวัน'); q.health -= 12; return 'ยามเห็นคุณก่อน คุณต้องกระโดดหนีลงหน้าผาจนบาดเจ็บ'; }), { chk: ['DEX', 'stealth'] }),
    ] }) },
  { id: 'beast', n: 'ล่าสัตว์ร้ายกินคน', danger: 2, realms: ['grieve', 'mulvane', 'dunes', 'kragmor'],
    d: 'มีบางอย่างลากคนออกไปจากหมู่บ้านทุกคืนเดือนดับ',
    build: p => ({ prompt: `อายุ ${p.age} ปี คุณตามรอยเลือดไปจนถึงถ้ำริมหนอง เสียงหายใจหนักๆ ดังมาจากข้างใน`, options: [
      fightOpt('เข้าไปในถ้ำ', beastFor(p), { lethal: .3, intro: 'มันพุ่งออกมาจากความมืด', death: 'ถูกสัตว์ร้ายที่ตามล่าฆ่าตาย', onEnd: (q, r) => r === 'win' ? payQuest(q, 12, 'คุณลากหัวมันกลับไปให้ชาวบ้านดู') + lootMats(q, [['hide', 3]]) : r === 'fled' ? 'คุณวิ่งออกจากถ้ำโดยไม่หันกลับไปมอง' : r === 'lose' ? 'คุณคลานออกมาจากถ้ำได้ด้วยบาดแผลเต็มตัว' : '' }),
      Object.assign(opt('ล่อมันออกมาที่กับดัก', q => check(q, 'WIS', 'survival', 14) ? payQuest(q, 12, 'มันตกลงไปในหลุมที่คุณขุดไว้') + lootMats(q, [['hide', 2]]) : (q.health -= 15, 'มันไม่ตกกับดัก แต่ตะปบไหล่คุณก่อนหนีกลับเข้าถ้ำ')), { chk: ['WIS', 'survival'] }),
    ] }) },
  { id: 'ruins', n: 'สำรวจซากเมืองก่อนเถ้าตก', danger: 2, realms: ['dunes', 'grieve', 'mulvane'],
    d: 'ทรายเพิ่งเปิดให้เห็นยอดหอคอยของเมืองที่ถูกฝังไว้สามร้อยปี',
    build: p => ({ prompt: `อายุ ${p.age} ปี คุณปีนลงไปในซากเมืองที่ถูกฝังใต้ทราย ผนังเต็มไปด้วยจารึกภาษาเก่า และมีประตูหินปิดตายอยู่บานหนึ่ง`, options: [
      Object.assign(opt('อ่านจารึกหาทางเปิด', q => { if (check(q, 'INT', 'history', 13)) { q.flags.ruinLore = true; q.know += 6; return payQuest(q, 15, 'ประตูเปิดออกสู่ห้องเก็บของของคนก่อนเถ้าตก') + lootMats(q, [['glass', 3], ['shard', roll(.3) ? 1 : 0]]); } q.health -= 15; return 'คุณกดผิดช่อง พื้นทรุดตัวลง คุณตกลงไปอีกชั้นกว่าจะปีนขึ้นมาได้'; }), { chk: ['INT', 'history'] }),
      Object.assign(opt('งัดประตูตรงๆ', q => { if (check(q, 'STR', null, 13)) return payQuest(q, 9, 'ประตูหินขยับออก ข้างในมีของมีค่าเหลืออยู่ไม่มาก') + lootMats(q, [['glass', 2]]); if (roll(.08)) { die(q, 'ถูกซากเมืองโบราณถล่มทับ'); return 'เพดานถล่มลงมาทันทีที่ประตูขยับ'; } q.health -= 18; return 'เพดานถล่มลงมาบางส่วน คุณหนีออกมาได้พร้อมแผลเต็มตัว'; }), { chk: ['STR', null] }),
    ] }) },
  { id: 'deepmine', n: 'ลงไปในอุโมงค์ร้าง', danger: 2, realms: ['kragmor'],
    d: 'อุโมงค์ชั้นล่างถูกปิดไปตั้งแต่ปีที่มีคนงานหายไปทั้งกะ',
    build: p => ({ prompt: `อายุ ${p.age} ปี คุณถือตะเกียงลงไปในอุโมงค์ร้าง สายแร่เหล็กเป็นประกายอยู่บนผนัง และมีรอยกรงเล็บอยู่บนพื้น`, options: [
      fightOpt('ขุดแร่ต่อไป', 'wolf', { lethal: .25, intro: 'หมาป่าเถ้าตัวหนึ่งที่อาศัยอยู่ในอุโมงค์พุ่งเข้าใส่', death: 'ถูกสัตว์ร้ายในอุโมงค์ร้างฆ่าตาย', onEnd: (q, r) => r === 'win' ? payQuest(q, 6, 'คุณขุดแร่ได้เต็มกระสอบ') + lootMats(q, [['ore', 5]]) : 'คุณหนีขึ้นมาพร้อมแร่แค่ไม่กี่ก้อน' + lootMats(q, [['ore', 1]]) }),
      opt('เก็บแร่ที่หล่นอยู่แล้วรีบขึ้นมา', q => 'คุณเก็บแร่ที่หล่นอยู่บนพื้นแล้วรีบปีนขึ้นมา' + lootMats(q, [['ore', 2]])),
    ] }) },
  { id: 'swampflower', n: 'หาดอกไม้เถ้ากลางหนองพิษ', danger: 1, realms: ['mulvane', 'grieve'],
    d: 'นักเล่นแร่จากออเรลิสรับซื้อดอกไม้ที่ขึ้นเฉพาะกลางหนองในราคาสูง',
    build: p => ({ prompt: `อายุ ${p.age} ปี คุณลุยน้ำเหม็นเน่าไปจนถึงกลางหนอง ดอกไม้สีเทาเรืองแสงขึ้นอยู่บนเกาะเล็กๆ ที่มีไอพิษลอยอยู่รอบๆ`, options: [
      Object.assign(opt('กลั้นหายใจแล้วเข้าไปเก็บ', q => check(q, 'CON', 'survival', 13) ? payQuest(q, 7, 'นักเล่นแร่จ่ายราคาดีกว่าที่คิด') + lootMats(q, [['herb', 3]]) : (q.health -= 14, 'ไอพิษเข้าปอด คุณไอเป็นเลือดไปหลายวัน')), { chk: ['CON', 'survival'] }),
      opt('เก็บแค่สมุนไพรธรรมดาริมหนอง', q => 'คุณเก็บสมุนไพรริมหนองกลับมา' + lootMats(q, [['herb', 2]])),
    ] }) },
  { id: 'tourney', n: 'การประลองฝีมือในงานเทศกาล', danger: 1, realms: ['aurelis', 'kragmor', 'grieve'],
    d: 'ใครก็ลงประลองได้ ถ้าจ่ายค่าสมัคร ผู้ชนะได้เงินรางวัลและชื่อเสียง',
    build: p => ({ prompt: `อายุ ${p.age} ปี ลานประลองเต็มไปด้วยคนดู คู่ต่อสู้รอบชิงของคุณเป็นนักดาบของตระกูลขุนนาง`, options: [
      fightOpt('ลงประลอง', 'duelist', { lethal: .05, intro: 'แตรเป่าสัญญาณเริ่ม', death: 'เสียชีวิตจากอุบัติเหตุในการประลอง', onEnd: (q, r) => r === 'win' ? (q.flags.famous = true, q.happy += 6, payQuest(q, 10, 'ฝูงชนตะโกนชื่อคุณ')) : r === 'lose' ? (q.happy -= 2, 'คุณแพ้ แต่ได้รับเสียงปรบมือ') : '' }),
      opt('ดูอยู่ข้างสนาม', () => 'คุณดูการประลองจนจบ แล้วกลับบ้านไปฝึกต่อ'),
    ] }) },
  { id: 'smuggle', n: 'ขนของเถื่อนผ่านประตู', danger: 2, realms: ['undercity', 'aurelis'],
    d: 'มีคนจ่ายเงินก้อนใหญ่ให้ขนหีบปิดผนึกใบหนึ่งผ่านประตูชั้นใน',
    build: p => ({ prompt: `อายุ ${p.age} ปี หีบใบนั้นหนักกว่าที่คิด ยามที่ประตูชั้นในกำลังค้นตัวคนที่เข้าแถวอยู่ข้างหน้าคุณ`, options: [
      Object.assign(opt('ทำหน้านิ่งแล้วเดินผ่าน', q => { if (check(q, 'CHA', 'speech', 13)) return payQuest(q, 15, 'ยามโบกมือให้คุณผ่านไป ไม่มีใครรู้ว่าในหีบมีอะไร'); const f = Math.min(q.wealth, 15); q.wealth -= f; q.health -= 8; if (roll(.3)) q.flags.fugitive = true; return `ยามเปิดหีบเจอเศษเส้นใยเต็มหีบ คุณถูกปรับ ${money(f)} และถูกเฆี่ยนต่อหน้าฝูงชน`; }), { chk: ['CHA', 'speech'] }),
      opt('ทิ้งหีบแล้วเดินหนี', q => { q.happy -= 2; return 'คุณทิ้งหีบไว้ข้างกำแพงแล้วรีบเดินไป ไม่มีใครตามมา'; }),
    ] }) },
  { id: 'skythread', n: 'เศษเส้นใยตกบนยอดเขา', danger: 2, realms: null, gifted: true,
    d: 'คนที่สัมผัสเส้นใยได้รู้สึกถึงมัน ตกลงมาที่ไหนสักแห่งบนยอดเขา',
    build: p => ({ prompt: `อายุ ${p.age} ปี คุณปีนขึ้นไปจนถึงยอดเขา เศษเส้นใยกองหนึ่งยังสั่นไหวอยู่บนหิน มันร้อนจนหินรอบๆ ละลาย`, options: [
      Object.assign(opt('ใช้เวทเส้นใยเก็บมัน', q => { if (check(q, 'INT', 'thread', 12)) { q.flags.foundShard = true; return 'เส้นใยสงบลงในมือคุณ' + lootMats(q, [['shard', 2]]); } q.health -= 20; return 'เส้นใยดีดกลับมาบาดคุณ คุณหมดสติไปทั้งคืน'; }), { chk: ['INT', 'thread'] }),
      opt('ปล่อยมันไว้', () => 'คุณมองมันค่อยๆ เลือนหายไปในอากาศ'),
    ] }) },
];
const QBY = Object.fromEntries(QUESTS.map(q => [q.id, q]));
function canQuest(p) {
  if (p.age < 14) return 'ต้องอายุ 14 ปีขึ้นไป';
  if (p.cls === 4) return 'ทาสออกไปผจญภัยเองไม่ได้';
  if (p.cls === 3) return 'ไพร่ออกจากที่ดินไปผจญภัยไม่ได้ ต้องเป็นอิสระก่อน';
  if (p.flags.questAge === p.age) return 'ปีนี้ออกไปผจญภัยมาแล้ว';
  return null;
}
const questRealm = p => p.trip ? RBY[p.trip.to] : p.realm;
function questBoard(p) {
  const r = questRealm(p);
  const pool = QUESTS.filter(q => (!q.realms || q.realms.includes(r.id)) && (!q.gifted || (p.gifted && rank(p, 'thread') >= 1)));
  // the same three notices hang on the board all year
  const seed = yearOf(p) * 7 + REALMS.indexOf(r);
  return pool.map((q, i) => [q, hash01(seed, i, 3)]).sort((a, b) => a[1] - b[1]).slice(0, 3).map(x => x[0]);
}
function startQuest(p, id) {
  if (canQuest(p)) return null;
  const q = QBY[id]; if (!q || !questBoard(p).includes(q)) return null;
  p.flags.questAge = p.age;
  const b = q.build(p);
  b.options.push(opt('ถอยกลับ', () => 'คุณตัดสินใจว่ามันไม่คุ้มที่จะเสี่ยง แล้วเดินกลับมา'));
  gainXP(p, 8 * q.danger);
  return { id: 'quest:' + id, prompt: b.prompt, options: b.options };
}
LEGENDS.push(
  { id: 'adventurer', n: 'นักผจญภัย', d: 'ทำภารกิจสำเร็จ 8 ครั้งในชีวิตเดียว', c: p => (p.flags.quests || 0) >= 8 },
  { id: 'villagehero', n: 'วีรบุรุษของหมู่บ้าน', d: 'ล้างรังโจรได้ด้วยมือตัวเอง', c: p => p.flags.heroOfVillage },
);
// let the census sometimes go adventuring too
const _simLife4 = simLife;
simLife = function (realm) {
  const p = makePerson(realm); p.auto = true;
  while (p.alive) {
    if (p.age >= 7 && Math.random() < .15) p.focus = pick(['work', 'work', 'train', 'love', 'rest']);
    if (p.biz && Math.random() < .3) p.focus = 'biz';
    if (p.age === 12 && !canArm(p)) setWeapon(p, pick(['sword', 'spear', 'axe', 'bow', 'dagger']));
    if (p.age >= 14 && Math.random() < .1) { const s = shopList(p).filter(x => !x.why); if (s.length) buy(p, pick(s).id); }
    if (p.age >= 14) { ensureCareer(p); if (Math.random() < .15) { const open = CAREERS.filter(c => !c.base && !careerMissing(p, c).length); if (open.length) takeCareer(p, pick(open).id); } }
    if (p.age >= 7 && Math.random() < .3) forage(p);
    if (p.inv) for (const m of MAT_IDS) if ((p.inv[m] || 0) >= 3) sellMat(p, m, p.inv[m]);
    if (!p.biz && p.age >= 16 && Math.random() < .08) { const o = Object.keys(BIZ).filter(id => !bizMissing(p, id).length); if (o.length) openBiz(p, pick(o)); }
    if (p.age >= 16 && p.age <= 50 && Math.random() < .05 && !canQuest(p)) { const b = questBoard(p); if (b.length) { const ch = startQuest(p, pick(b).id); if (ch) { resolveChoice(p, pick(ch.options.slice(0, -1))); if (!p.alive) { p.years.push({ h: p.happy }); break; } } } }
    const ch = checkChoice(p);
    if (ch) { resolveChoice(p, autoChoose(p, ch)); if (!p.alive) { p.years.push({ h: p.happy }); break; } }
    const r = finishYear(p);
    if (r.fate) { resolveChoice(p, autoChoose(p, r.fate)); afterFate(p); }
  }
  return p;
};

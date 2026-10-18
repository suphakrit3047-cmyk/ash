// ===== ROYALTY: princes, princesses, heirs and rulers =====
const ROYAL = {
  aurelis: { house: 'ราชวงศ์สุริยาแห่งออเรลิส', child: s => s === 'ญ' ? 'เจ้าหญิง' : 'เจ้าชาย', heir: s => s === 'ญ' ? 'มกุฎราชกุมารี' : 'มกุฎราชกุมาร', ruler: s => s === 'ญ' ? 'จักรพรรดินี' : 'จักรพรรดิ', of: 'แห่งออเรลิส', note: 'ราชวงศ์ที่สวมมงกุฎ แต่ศาสนจักรสุริยะเป็นผู้ถือกุญแจประตูเมือง' },
  kragmor: { house: 'ราชวงศ์ใต้ภูเขา', child: s => s === 'ญ' ? 'เจ้าหญิง' : 'เจ้าชาย', heir: () => 'รัชทายาท', ruler: s => s === 'ญ' ? 'ราชินี' : 'ราชา', of: 'ใต้ภูเขา', note: 'ตระกูลที่ถือกุญแจคลังแร่ทุกแห่งในครากมอร์' },
  serenth: { house: 'หนึ่งในสิบสามตระกูลผู้อาวุโส', child: () => 'ทายาทตระกูลผู้อาวุโส', heir: () => 'ผู้สืบที่นั่งในสภา', ruler: () => 'ผู้อาวุโสแห่งสภา', of: 'แห่งเซเรนธ์', note: 'ตระกูลของคนที่เคยลงมติเจ็ดต่อหกเมื่อสามร้อยปีก่อน' },
  grieve: { house: 'ตระกูลขุนศึกแห่งกรีฟ', child: s => s === 'ญ' ? 'ลูกสาวขุนศึก' : 'ลูกชายขุนศึก', heir: () => 'ทายาทขุนศึก', ruler: () => 'ขุนศึก', of: 'แห่งที่ราบเถ้า', note: 'ปกครองด้วยดาบ ไม่ใช่ด้วยกฎหมาย' },
};
const ROYAL_P = .35; // share of noble births in these realms that are born into the ruling house
const RX = p => ROYAL[p.royal.realm];
function royalTitle(p) {
  if (!p.royal || p.royal.lost) return '';
  const R = RX(p);
  if (p.royal.ruler) return `${R.ruler(p.sex)}${R.of}`;
  if (p.royal.line === 1) return `${R.heir(p.sex)}${R.of}`;
  return `${R.child(p.sex)}${R.of}`;
}
const lineText = p => p.royal.ruler ? 'ผู้ปกครอง' : p.royal.line >= 99 ? 'ถูกตัดออกจากการสืบทอด' : `ลำดับที่ ${p.royal.line} ในการสืบทอด`;
// palace: a home that cannot be bought
HOUSES[6] = { n: 'พระราชวัง', rent: 0, buy: 0, hp: 2, hap: 6, ill: .7, d: 'ห้องมากจนนับไม่ถ้วน คนรับใช้หลายร้อยคน และทหารยามทุกประตู' };
CAREERS.push({ id: 'royal', base: true, n: ['เชื้อพระวงศ์', 'รัชทายาท', 'ผู้ปกครอง'], pay: [12, 15, 35], phys: 0, d: 'ราชการในราชสำนัก พิธีการ และการเมือง',
  flav: ['คุณนั่งฟังขุนนางถวายรายงานจนบ่ายคล้อย', 'คุณต้อนรับทูตจากแดนอื่นในงานเลี้ยงที่ยาวที่สุดของปี', 'คุณเซ็นเอกสารที่ไม่มีเวลาอ่านหลายร้อยฉบับ', 'คุณออกไปโปรยเหรียญให้ฝูงชนในวันเทศกาล'] });
CBY.royal = CAREERS[CAREERS.length - 1];
const ROYAL_OK = ['scholar', 'envoy', 'battlemage', 'healer', 'priest', 'physician'];

function makeRoyal(p, parent) {
  const realm = parent && parent.royal ? parent.royal.realm : p.realm.id;
  p.royal = { realm, line: 1, ruler: false };
  p.cls = p.bornCls = 0;
  if (!parent) p.wealth = Math.round(p.wealth * (2.5 + Math.random()));
  p.startWealth = p.wealth;
  p.home = { tier: 6, status: 'family', famOwned: true, realm: p.realm.id };
  if (!parent || !parent.land || !parent.land.plots) p.land = { realm: FARM[p.realm.id] ? p.realm.id : 'aurelis', plots: 20, share: .5 };
  p.flags.eduBonus = Math.max(p.flags.eduBonus || 0, 25);
  const R = ROYAL[realm];
  // the family: one parent wears the crown
  if (p.fam) {
    const parents = p.fam.filter(m => m.rel === 'mother' || m.rel === 'father');
    let mon = parent ? parents.find(m => m.name === parent.name) : pick(parents);
    if (mon) {
      mon.monarch = true;
      if (!parent || (parent.royal && parent.royal.ruler)) mon.job = R.ruler(mon.sex);
      else mon.job = R.child(mon.sex);
      for (const m of parents) if (m !== mon) m.job = `คู่ครองของ${R.ruler(mon.sex)}`;
    }
    for (const m of p.fam) if (m.rel === 'sibling') { m.royalKid = realm; if (famAge(p, m) >= 14) m.job = R.child(m.sex); }
    if (parent && parent.royal && !parent.royal.ruler) p.royal.line = Math.max(2, parent.royal.line + 1);
    else p.royal.line = p.fam.filter(m => m.rel === 'sibling' && m.alive && m.a0 > 0).length + 1;
  }
}
const _makePerson5 = makePerson;
makePerson = function (realm, parent) {
  const p = _makePerson5(realm, parent);
  if (parent && parent.royal && !parent.royal.lost) makeRoyal(p, parent);
  else if (!parent && p.cls === 0 && ROYAL[p.realm.id] && Math.random() < ROYAL_P) makeRoyal(p);
  return p;
};
const _makeSibling2 = makeSibling;
makeSibling = function (d) { const p = _makeSibling2(d); if (d.royal) { p.royal = { ...d.royal, line: d.royal.line, ruler: false }; p.home = { ...d.home }; p.land = d.land ? { ...d.land } : p.land; p.cls = p.bornCls = 0; } return p; };
const _famJobFor = famJobFor;
famJobFor = function (m) { return m.royalKid ? ROYAL[m.royalKid].child(m.sex) : _famJobFor(m); };
// royals live grandly and do not take common work
const _upkeep = upkeep;
upkeep = function (p) { return _upkeep(p) + (p.royal ? 10 * priceF(p) : 0); };
const _defaultCareer = defaultCareer;
defaultCareer = function (p) { return p.royal ? 'royal' : _defaultCareer(p); };
const _careerMissing2 = careerMissing;
careerMissing = function (p, c, rk = 0) { const out = _careerMissing2(p, c, rk); if (p.royal && !c.base && !ROYAL_OK.includes(c.id) && rk === 0) out.unshift('ไม่เหมาะกับเชื้อพระวงศ์'); return out; };
const _bizMissing = bizMissing;
bizMissing = function (p, id) { const out = _bizMissing(p, id); if (p.royal) out.unshift('เชื้อพระวงศ์ไม่ค้าขายเอง'); return out; };
const _entry = entry;
entry = function (p, to, settle) { if (p.royal && !(settle && to === 'serenth' && p.race !== 'เอลฟ์')) return { ok: true, fee: 0 }; return _entry(p, to, settle); };

// succession: keep the line up to date and crown the heir when the monarch dies
function royalYear(p) {
  const R = p.royal; if (!R || R.lost) return null;
  const out = [];
  if (p.cls !== 0 && !R.ruler) { R.lost = true; if (p.career === 'royal') setCareer(p, defaultCareer(p)); return 'ราชสำนักประกาศตัดชื่อคุณออกจากราชวงศ์ ตอนนี้คุณไม่ใช่เชื้อพระวงศ์อีกต่อไป'; }
  if (p.career !== 'royal' && !ROYAL_OK.includes(p.career) && p.age >= 14) setCareer(p, 'royal');
  if (p.career === 'royal') p.careerRank = R.ruler ? 2 : R.line === 1 ? 1 : 0;
  if (!R.ruler && R.line < 99 && p.fam) {
    const older = p.fam.filter(m => m.rel === 'sibling' && m.alive && m.a0 > 0 && !m.exiled && famBorn(p, m)).length + (R.line > 1 && !p.fam.some(m => m.rel === 'sibling' && m.a0 > 0) ? R.line - 1 : 0);
    const nl = Math.max(1, older + 1);
    if (nl < R.line) out.push(nl === 1 ? `ตอนนี้คุณเป็น${RX(p).heir(p.sex)} ลำดับแรกในการสืบทอด` : `ตอนนี้คุณขึ้นมาเป็นลำดับที่ ${nl} ในการสืบทอด`);
    R.line = nl;
    const mon = p.fam.find(m => m.monarch);
    if (mon && !mon.alive && !R.crowned) {
      if (R.line === 1) {
        if (p.age >= 16) { R.ruler = true; R.crowned = p.age; p.flags.crowned = true; p.home.status = 'own'; p.happy += 10; out.push(`หลังพิธีพระศพของ${mon.name} พิธีราชาภิเษกจัดขึ้นในอีกสามเดือนต่อมา ตั้งแต่วันนี้คุณคือ${royalTitle(p)}`); }
        else if (!R.regent) { R.regent = true; out.push(`หลังพิธีพระศพของ${mon.name} ราชสำนักประกาศว่าคุณยังเด็กเกินไป ขุนนางผู้สำเร็จราชการจะปกครองแทนจนคุณอายุ 16 ปี`); }
      } else if (!R.passed) {
        R.passed = true; const sib = p.fam.find(m => m.rel === 'sibling' && m.alive && m.a0 > 0);
        if (sib) { sib.job = RX(p).ruler(sib.sex); sib.monarch = true; R.line = 2; out.push(`หลังพิธีพระศพของ${mon.name} ${sib.name} ${relName(p, sib)}ของคุณขึ้นครองบัลลังก์`); }
      }
    }
  }
  if (R.ruler) { const tribute = 6 * priceF(p); p.wealth += tribute; led(p, 'rent', tribute); }
  return out.join(' · ') || null;
}
// the elder monarch in the family can also be a sibling who took the throne
const _applyFocus8 = applyFocus;
applyFocus = function (p) { const t = _applyFocus8(p); if (!p.alive) return t; const r = royalYear(p); return [t, r].filter(Boolean).join(' · ') || null; };

// ---- court life ----
const otherRealm = p => pick(Object.keys(ROYAL).filter(k => k !== p.royal.realm));
CHOICES.push(
  { id: 'royalMarriage', when: p => p.royal && !p.royal.lost && !p.married && p.age >= 16 && p.age <= 26 && roll(.3),
    prompt: p => { p.kin.cand = nameIn(RBY[p.kin.candRealm = otherRealm(p)]); return `อายุ ${p.age} ปี ราชสำนักตกลงให้คุณแต่งงานกับ${p.kin.cand} ทายาทของ${ROYAL[p.kin.candRealm].house} เพื่อผูกไมตรีระหว่างสองแดน คุณเคยเห็นหน้าเขาแค่ในภาพวาด`; },
    options: p => [
      opt('ยอมแต่งงาน', q => { q.married = true; q.kin.spouse = q.kin.cand; q.wealth += 40; q.happy -= 3; q.flags.politicalMarriage = true; return `งานอภิเษกสมรสจัดขึ้นอย่างยิ่งใหญ่ คุณกับ${q.kin.spouse}ยืนเคียงกันตลอดพิธีโดยไม่ได้คุยกันสักคำ`; }),
      opt('ปฏิเสธ', q => { if (roll(.35)) { q.royal.line = 99; q.happy -= 6; return 'ราชสำนักไม่ให้อภัย ชื่อของคุณถูกขีดออกจากลำดับการสืบทอด'; } q.happy += 4; return 'ราชสำนักไม่พอใจ แต่ยอมเลื่อนเรื่องนี้ออกไปก่อน'; }),
      opt('หนีไปกับคนที่รักจริง', q => { q.royal.lost = true; q.cls = 2; q.wealth = Math.round(q.wealth * .05); q.happy += 12; q.married = true; q.kin.spouse = nameIn(q.realm); q.flags.eloped = true; q.home = { tier: 2, status: 'rent', realm: q.realm.id }; if (q.land) q.land = { realm: null, plots: 0, share: .5 }; setCareer(q, defaultCareer(q)); return `คุณหนีออกจากวังกลางดึกพร้อม${q.kin.spouse} ทิ้งทุกอย่างไว้ข้างหลัง ตอนนี้คุณเป็นแค่สามัญชนคนหนึ่ง`; }),
    ] },
  { id: 'incognito', when: p => p.royal && !p.royal.lost && p.age >= 12 && p.age <= 35 && roll(.12),
    prompt: p => `อายุ ${p.age} ปี คุณอยากรู้ว่าชีวิตของคนข้างนอกวังเป็นอย่างไร คนรับใช้คนหนึ่งเสนอจะหาเสื้อผ้าเก่าๆ ให้คุณปลอมตัว`,
    options: p => [
      opt('ปลอมตัวออกไป', q => { q.flags.sawPoor = true; q.know += 4; q.happy -= 4; if (roll(.15)) { q.health -= 8; return 'คุณถูกล้วงกระเป๋าและถูกผลักล้มในตรอก กว่าทหารจะตามหาเจอก็เกือบเช้า'; } return pick(['คุณเห็นเด็กอายุเท่าคุณแบกถังน้ำที่หนักกว่าตัวเอง คืนนั้นคุณนอนไม่หลับ', 'คุณกินข้าวต้มในโรงทาน แล้วเพิ่งรู้ว่าอาหารเหลือทิ้งในวังหนึ่งมื้อเลี้ยงคนได้ทั้งซอย', 'ไม่มีใครจำคุณได้ และไม่มีใครสนใจคุณเลย มันเป็นวันที่คุณรู้สึกเป็นอิสระที่สุดในชีวิต']); }),
      opt('อยู่ในวังต่อไป', () => 'คุณคืนเสื้อผ้าให้คนรับใช้ และไม่เคยพูดถึงเรื่องนี้อีก'),
    ] },
  { id: 'poison', repeat: 3, when: p => p.royal && !p.royal.lost && p.age >= 14 && roll(p.royal.ruler ? .06 : p.royal.line === 1 ? .04 : .015),
    prompt: p => `อายุ ${p.age} ปี ไวน์ในงานเลี้ยงคืนนี้มีรสขมผิดปกติ`,
    options: p => [
      Object.assign(opt('ดื่มต่อ', q => { if (check(q, 'CON', null, 14)) { q.health -= 25; return 'คุณล้มลงกลางงานเลี้ยง หมอหลวงช่วยชีวิตไว้ได้ทัน'; } die(q, 'ถูกลอบวางยาพิษในงานเลี้ยง'); return 'คุณล้มลงกลางงานเลี้ยง และไม่ได้ลุกขึ้นอีก'; }), { chk: ['CON', null] }),
      Object.assign(opt('คายทิ้งแล้วสั่งจับตัวคนรินไวน์', q => { if (check(q, 'WIS', null, 12)) { q.flags.foiledPlot = true; q.happy += 3; return 'คนรินไวน์สารภาพว่ามีขุนนางจ้างมา คุณรู้แล้วว่าใครอยากให้คุณตาย'; } q.happy -= 4; return 'คนรินไวน์หายตัวไปก่อนทหารจะไปถึง'; }), { chk: ['WIS', null] }),
      opt('ให้คนชิมอาหารชิมก่อน', q => { q.happy -= 6; q.flags.tasterDied = true; return 'คนชิมอาหารล้มลงตรงหน้าคุณ เขาอายุน้อยกว่าคุณเสียอีก'; }),
    ] },
  { id: 'throneplot', when: p => p.royal && !p.royal.lost && !p.royal.ruler && p.royal.line === 2 && p.age >= 18 && p.age <= 45 && roll(.06),
    prompt: p => { const s = p.fam && p.fam.find(m => m.monarch && m.alive && m.rel === 'sibling') || p.fam && p.fam.find(m => m.rel === 'sibling' && m.alive && m.a0 > 0); p.kin.rival = s ? s.name : 'พี่ของคุณ'; return `อายุ ${p.age} ปี ขุนนางกลุ่มหนึ่งมาหาคุณกลางดึก พวกเขาบอกว่าจะช่วยให้คุณได้บัลลังก์ ถ้าคุณยอมให้${p.kin.rival}หายไป`; },
    options: p => [
      opt('ร่วมมือ', q => { q.flags.plotted = true; if (roll(.4)) { const s = q.fam.find(m => m.name === q.kin.rival); if (s) { s.exiled = true; s.alive && (s.realm = otherRealm(q)); } q.royal.line = 1; if (s && s.monarch) { s.monarch = false; q.royal.ruler = true; q.royal.crowned = q.age; q.flags.crowned = true; } q.flags.usurper = true; q.happy -= 8; return `${q.kin.rival}ถูกเนรเทศออกจากแดนในคืนเดียว ทุกคนในวังรู้ว่าใครอยู่เบื้องหลัง แต่ไม่มีใครกล้าพูด`; } if (roll(.5)) { die(q, 'ถูกประหารฐานกบฏ'); return 'แผนรั่วไหลก่อนลงมือ'; } q.royal.lost = true; q.cls = 2; q.wealth = Math.round(q.wealth * .1); move(q, RBY[otherRealm(q)]); setCareer(q, defaultCareer(q)); return 'แผนรั่วไหล คุณถูกริบทุกอย่างและถูกเนรเทศไปต่างแดน'; }),
      opt('ปฏิเสธและบอกพี่', q => { q.happy += 3; q.wealth += 10; q.flags.loyal = true; return `${q.kin.rival}กอดคุณแน่น ขุนนางกลุ่มนั้นถูกจับทั้งหมดในเช้าวันต่อมา`; }),
      opt('ปฏิเสธแล้วเงียบไว้', () => 'คุณไล่พวกเขาออกไป และพยายามลืมว่าคืนนั้นเกิดอะไรขึ้น'),
    ] },
  // decisions only a ruler can make
  { id: 'openGate', when: p => p.royal && p.royal.ruler && p.royal.realm === 'aurelis' && roll(.15),
    prompt: p => `อายุ ${p.age} ปี ตัวแทนคนใต้กำแพงเดินมาคุกเข่าหน้าพระราชวัง ขอให้เปิดประตูชั้นในให้คนที่สร้างกำแพงได้เข้าไปอยู่ ศาสนจักรส่งคนมาบอกว่าถ้าเปิด ดวงอาทิตย์จะไม่คุ้มครองเมืองอีก`,
    options: p => [
      opt('เปิดประตูชั้นใน', q => { q.flags.openedGate = true; q.happy += 10; if (roll(.3)) { if (roll(.5)) { die(q, 'ถูกลอบปลงพระชนม์หลังเปิดประตูชั้นใน'); return 'หนึ่งเดือนหลังประตูเปิด องครักษ์ของคุณเองแทงคุณในห้องบรรทม'; } q.royal.ruler = false; q.royal.lost = true; q.cls = 2; q.wealth = Math.round(q.wealth * .1); move(q, RBY.undercity); setCareer(q, defaultCareer(q)); return 'ศาสนจักรประกาศว่าคุณถูกปีศาจสิง ขุนนางยึดอำนาจ คุณถูกขับออกจากวังไปอยู่ใต้กำแพงกับคนที่คุณพยายามช่วย'; } return 'ประตูเปิดออกเป็นครั้งแรกในรอบสองร้อยปี ฝูงชนเดินเข้ามาอย่างเงียบๆ ไม่มีใครเชื่อว่ามันเกิดขึ้นจริง'; }),
      opt('ลดภาษีให้คนใต้กำแพงแทน', q => { q.wealth -= 25; q.happy += 3; q.flags.cutTax = true; return 'คนใต้กำแพงขอบคุณ แต่ประตูยังปิดอยู่เหมือนเดิม'; }),
      opt('ไล่พวกเขากลับไป', q => { q.happy -= 4; q.flags.closedGate = true; return 'ทหารใช้ด้ามหอกไล่ฝูงชนกลับไป ศาสนจักรส่งคำอวยพรมาให้คุณในวันต่อมา'; }),
    ] },
  { id: 'mineLaw', when: p => p.royal && p.royal.ruler && p.royal.realm === 'kragmor' && roll(.15),
    prompt: p => `อายุ ${p.age} ปี อุโมงค์เหมืองถล่มทับคนงานไปอีกสี่สิบคน คนงานที่เหลือขอให้ออกกฎค้ำยันอุโมงค์ แต่หัวหน้าสมาคมเหมืองบอกว่าจะทำให้แร่ออกช้าลงครึ่งหนึ่ง`,
    options: p => [
      opt('ออกกฎความปลอดภัย', q => { q.wealth -= 30; q.happy += 6; q.flags.safeMines = true; return 'แร่ออกช้าลงจริงตามที่เขาว่า แต่ปีนั้นไม่มีงานศพของคนงานเหมืองเลยสักงาน'; }),
      opt('ไม่เปลี่ยนอะไร', q => { q.wealth += 15; q.happy -= 3; return 'แร่ออกเท่าเดิม และอุโมงค์ก็ถล่มอีกเท่าเดิม'; }),
    ] },
  { id: 'councilVote', when: p => p.royal && p.royal.ruler && p.royal.realm === 'serenth' && !p.done.councilVote2 && roll(.12),
    prompt: p => `อายุ ${p.age} ปี สภาผู้อาวุโสลงมติอีกครั้งในรอบสามร้อยปี ว่าจะปล่อยเส้นใยที่ยกเมืองไว้ลงไปซ่อมฟ้าหรือไม่ ถ้าปล่อย เมืองจะค่อยๆ ลดระดับลงสู่พื้นดิน เสียงตอนนี้เท่ากันหกต่อหก เหลือแค่เสียงของคุณ`,
    options: p => [
      opt('ลงมติให้ปล่อยเส้นใย', q => { q.done.councilVote2 = 1; q.flags.mendVote = true; q.happy += 8; return 'มติผ่านไปเจ็ดต่อหก สามร้อยปีก่อนบรรพบุรุษของคุณลงมติด้วยตัวเลขเดียวกัน แต่ในทางตรงข้าม เอลฟ์ครึ่งเมืองไม่พูดกับคุณอีกเลย'; }),
      opt('ลงมติให้เมืองลอยต่อไป', q => { q.done.councilVote2 = 1; q.happy -= 6; return 'มติตกไปหกต่อเจ็ด เมืองยังลอยอยู่ และฟ้าก็ยังร้าวอยู่เหมือนเดิม'; }),
    ] },
  { id: 'warlordTruce', when: p => p.royal && p.royal.ruler && p.royal.realm === 'grieve' && roll(.15),
    prompt: p => `อายุ ${p.age} ปี ขุนศึกฝ่ายตรงข้ามส่งลูกชายคนเดียวของเขามาเป็นตัวประกัน เพื่อขอสงบศึก`,
    options: p => [
      opt('ยอมสงบศึก', q => { q.flags.peacemaker = true; q.happy += 6; q.wealth -= 10; return 'ที่ราบเถ้าเงียบสงบไปหลายปี ชาวนากลับมาไถนาในที่ที่เคยเป็นสนามรบ'; }),
      opt('รบต่อจนชนะ', q => { q.wealth += 30; q.happy -= 4; q.flags.conqueror = true; if (roll(.2)) { die(q, 'ถูกสังหารในสงครามชายแดน'); return 'คุณนำทัพด้วยตัวเอง และไม่ได้กลับมา'; } return 'คุณยึดดินแดนเพิ่มได้อีกสามหมู่บ้าน และได้ศัตรูเพิ่มอีกหลายตระกูล'; }),
    ] },
  { id: 'royalFamine', when: p => p.royal && p.royal.ruler && roll(.08),
    prompt: p => `อายุ ${p.age} ปี ปีนี้ข้าวยากหมากแพง ผู้คนมาต่อแถวหน้ายุ้งฉางหลวง`,
    options: p => [
      opt('เปิดยุ้งฉางแจกจ่าย', q => { q.wealth -= 30; q.happy += 6; q.flags.relief = true; return 'ปีนั้นมีคนอดตายน้อยกว่าทุกปี ชื่อของคุณถูกพูดถึงในทุกครัว'; }),
      opt('ขายข้าวในราคาตลาด', q => { q.wealth += 20; q.happy -= 3; if (roll(.2)) { q.health -= 10; return 'ฝูงชนบุกยุ้งฉาง ทหารต้องปราบปรามจนมีคนตาย'; } return 'ยุ้งฉางหลวงทำกำไรได้มากที่สุดในรอบสิบปี'; }),
    ] },
);
LEGENDS.push(
  { id: 'crowned', n: 'สวมมงกุฎ', d: 'ขึ้นครองบัลลังก์ได้สำเร็จ', c: p => p.flags.crowned },
  { id: 'noblesse', n: 'ไม่เคยได้นั่งบัลลังก์', d: 'เกิดเป็นรัชทายาท แต่จากไปก่อนได้ครองราชย์', c: p => p.royal && !p.royal.ruler && p.royal.line === 1 && !p.flags.crowned },
  { id: 'eloped', n: 'มงกุฎแลกหัวใจ', d: 'ทิ้งฐานะเชื้อพระวงศ์เพื่อหนีไปกับคนที่รัก', c: p => p.flags.eloped },
  { id: 'opengate', n: 'ประตูที่เปิดออก', d: 'เปิดประตูชั้นในของออเรลิสให้คนใต้กำแพง', c: p => p.flags.openedGate },
  { id: 'secondvote', n: 'เจ็ดต่อหก อีกครั้ง', d: 'ลงมติให้นครลอยปล่อยเส้นใยไปซ่อมฟ้า', c: p => p.flags.mendVote },
  { id: 'usurper', n: 'บัลลังก์ที่ได้มาด้วยเลือด', d: 'ร่วมมือกับขุนนางกำจัดพี่ของตัวเอง', c: p => p.flags.usurper },
  { id: 'sawpoor', n: 'เจ้าที่เดินดิน', d: 'ปลอมตัวออกไปดูชีวิตของคนธรรมดา', c: p => p.flags.sawPoor },
);

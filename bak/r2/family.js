// ===== FAMILY: parents, siblings, spouse, children =====
// member: { id, rel, name, sex, a0 (age when you were born; negative = born after you), realm, cls,
//           alive, diedAge, dAge (your age when they died), cause, job, married, moved, fixedAt, fixedCause }
let FAM_ID = 0;
const RI = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const relName = (p, m) => {
  const ch = m.sex === 'ช';
  if (m.rel === 'mother') return 'แม่';
  if (m.rel === 'father') return 'พ่อ';
  if (m.rel === 'sibling') return m.a0 > 0 ? (ch ? 'พี่ชาย' : 'พี่สาว') : (ch ? 'น้องชาย' : 'น้องสาว');
  if (m.rel === 'spouse') return 'คู่ชีวิต';
  if (m.rel === 'child') return ch ? 'ลูกชาย' : 'ลูกสาว';
  return 'ญาติ';
};
const famAge = (p, m) => m.alive ? m.a0 + p.age : m.diedAge;
const famBorn = (p, m) => m.a0 + p.age >= 0;
const famOf = (p, rel) => (p.fam || []).filter(m => m.rel === rel);
const famAlive = (p, rel) => famOf(p, rel).some(m => m.alive);
const isElf = r => r.id === 'serenth';

const JOBS = {
  0: ['ประมุขตระกูล', 'ผู้ดูแลที่ดินของตระกูล', 'อัศวิน', 'นักบวชชั้นสูง', 'ขุนนางในราชสำนัก'],
  1: ['พ่อค้า', 'เจ้าของร้าน', 'นักเล่นแร่', 'อาลักษณ์', 'เจ้าของโรงเตี๊ยม'],
  2: { rural: ['ชาวนา', 'ชาวนา', 'คนเลี้ยงสัตว์', 'นักล่า', 'ช่างไม้', 'ทหาร', 'ช่างทอผ้า'], city: ['คนรับจ้าง', 'คนรับจ้าง', 'ช่างฝีมือ', 'ยาม', 'แม่ค้าในตลาด', 'ทหาร', 'คนขนของที่ท่า'], kragmor: ['คนงานเหมือง', 'คนงานเหมือง', 'ช่างตีเหล็ก', 'ชาวนา', 'ทหาร'] },
  3: ['ไพร่ติดที่ดิน'],
  4: ['ทาส'],
};
function famJobFor(m) {
  const r = RBY[m.realm], j = JOBS[m.cls];
  if (Array.isArray(j)) return pick(j);
  return pick(r.id === 'kragmor' ? j.kragmor : RURAL.includes(r.id) ? j.rural : j.city);
}
function famJobText(p, m) {
  const a = famAge(p, m), r = RBY[m.realm];
  if (!famBorn(p, m)) return '';
  if (a < 7) return 'ยังเด็ก';
  if (a < 14) return m.cls === 4 ? 'ถูกใช้งานในบ้านนาย' : m.cls >= 2 ? 'ช่วยงานพ่อแม่' : 'เรียนหนังสือ';
  if (m.alive && a > r.agingStart + 4 && m.cls >= 1) return `เคยเป็น${m.job} ตอนนี้เลิกทำงานแล้ว`;
  if (a < 22 && m.cls <= 1 && m.job) return `กำลังฝึกเป็น${m.job}`;
  return m.job || '';
}
function mkMember(p, rel, o) {
  const m = Object.assign({ id: ++FAM_ID, rel, name: nameIn(p.born), sex: Math.random() < .5 ? 'ญ' : 'ช', realm: p.born.id, cls: p.bornCls, alive: true, married: false }, o);
  if (!m.job && famAge(p, m) >= 14) m.job = famJobFor(m);
  return m;
}
// one year of risk for a relative, using the same hazards as the player
function famHazard(p, m, age) {
  const r = RBY[m.realm];
  const q = { realm: r, age, cls: m.cls, health: r.health + (2 - m.cls) * 3, wealth: m.cls <= 1 ? 60 : m.cls === 2 ? 20 : 5, flags: {}, traits: [], birthYear: p.birthYear - m.a0 };
  let H; try { H = hazards(q).filter(h => h[2] !== 'burn'); } catch (e) { return null; }
  const sum = Math.min(H.reduce((s, h) => s + h[1], 0), .9);
  if (Math.random() >= sum) return null;
  return wpick(H, x => x[1])[0];
}
function initFamily(p, parent) {
  const r = p.born, elf = isElf(r);
  const mAge = elf ? RI(60, 160) : p.bornCls <= 1 ? RI(19, 36) : RI(16, 34);
  const fAge = mAge + (elf ? RI(-10, 30) : RI(-2, 9));
  const fam = [];
  // no two relatives share a name
  const taken = new Set([p.name]);
  const fresh = () => { let n, i = 0; do { n = nameIn(r); } while (taken.has(n) && ++i < 20); taken.add(n); return n; };
  if (!parent) { if (p.kin.mother === p.name || p.kin.mother === p.kin.father) p.kin.mother = fresh(); else taken.add(p.kin.mother); if (p.kin.father === p.name || taken.has(p.kin.father)) p.kin.father = fresh(); else taken.add(p.kin.father); }
  if (parent) {
    const pa = p.birthYear - parent.birthYear;
    const other = parent.kin.spouse || nameIn(r);
    const pm = { rel: parent.sex === 'ญ' ? 'mother' : 'father', name: parent.name, sex: parent.sex, a0: pa, cls: parent.bornCls === parent.cls ? parent.cls : parent.cls,
      job: (typeof careerTitle === 'function' && parent.career ? careerTitle(parent) : CLASSES[parent.cls]), fixedAt: Math.max(0, parent.age - pa), fixedCause: parent.cause, realm: (parent.realm || r).id };
    const om = { rel: parent.sex === 'ญ' ? 'father' : 'mother', name: other, sex: parent.sex === 'ญ' ? 'ช' : 'ญ', a0: Math.max(16, pa + RI(-4, 4)), cls: parent.cls };
    if (pm.rel === 'mother') { p.kin.mother = pm.name; p.kin.father = om.name; } else { p.kin.father = pm.name; p.kin.mother = om.name; }
    fam.push(mkMember(p, pm.rel, pm), mkMember(p, om.rel, om));
    if (!parent.married && !parent.kin.spouse) fam[1].note = 'ไม่ได้อยู่ด้วยกันกับ' + parent.name;
    const kids = (parent.kidNames || []).filter(n => n !== p.name);
    const span = Math.max(1, Math.min(14, pm.fixedAt - 1));
    kids.forEach((n, i) => fam.push(mkMember(p, 'sibling', { name: n, a0: -Math.min(span, 1 + i * 2 + RI(0, 1)) })));
  } else {
    fam.push(mkMember(p, 'mother', { name: p.kin.mother, sex: 'ญ', a0: mAge }));
    fam.push(mkMember(p, 'father', { name: p.kin.father, sex: 'ช', a0: fAge }));
    const n = elf ? RI(0, 1) : [RI(0, 2), RI(0, 3), RI(1, 5), RI(1, 5), RI(0, 4)][p.bornCls];
    const used = new Set([0]);
    for (let i = 0; i < n; i++) {
      let a0, tries = 0;
      do { a0 = elf ? RI(-60, 60) : RI(-10, 12); tries++; } while ((used.has(a0) || used.has(a0 - 1) || used.has(a0 + 1) || mAge - a0 < 15 || mAge - a0 > (elf ? 250 : 44)) && tries < 30);
      if (tries >= 30) continue;
      used.add(a0);
      const s = mkMember(p, 'sibling', { a0, name: fresh() });
      // older siblings may not have survived until you were born
      for (let a = 0; a < a0; a++) { const c = famHazard(p, s, a); if (c) { s.alive = false; s.diedAge = a; s.dAge = a - a0; s.cause = c; s.job = a >= 14 ? s.job : ''; break; } }
      if (s.alive && a0 >= 18 && roll(Math.min(.9, (a0 - 16) * .12))) s.married = true;
      fam.push(s);
    }
  }
  fam.sort((a, b) => b.a0 - a.a0);
  p.fam = fam;
  // a hard birth can take the mother
  if (!parent && roll(r.infant * .1)) { const m = fam.find(x => x.rel === 'mother'); famDie(p, m, 'เสียชีวิตขณะคลอดคุณ', true); }
  return fam;
}
function ensureFamily(p) {
  if (p.fam) return;
  const age = p.age; p.age = 0; initFamily(p); p.age = age;
  // fast-forward an old save: relatives may have died along the way
  for (const m of p.fam) for (let y = 0; y < age && m.alive; y++) { const a = m.a0 + y; if (a < 0) continue; const c = famHazard(p, m, a); if (c) { m.alive = false; m.diedAge = a; m.dAge = y; m.cause = c; } }
}
function famDie(p, m, cause, quiet) {
  m.alive = false; m.diedAge = m.a0 + p.age; m.dAge = p.age; m.cause = cause;
  if (m.rel === 'mother' || m.rel === 'father') { p.done.parent = 1; p.happy -= 10; if (p.cls <= 1 && p.age >= 14) p.wealth += 8; }
  if (m.rel === 'sibling') p.happy -= 6;
  if (m.rel === 'spouse') { p.happy -= 15; p.married = false; if (p.kin.spouse === m.name) p.kin.spouse = null; p.flags.widowed = true; }
  if (m.rel === 'child') { p.happy -= 14; p.kidNames = p.kidNames.filter(n => n !== m.name); p.lostKids++; }
  return quiet ? null : `${m.name} ${relName(p, m)}ของคุณ${cause}`;
}
function famYear(p) {
  ensureFamily(p);
  const out = [];
  // keep spouse and children in step with the rest of the game
  if (p.kin.spouse && !p.fam.some(m => m.rel === 'spouse' && m.alive && m.name === p.kin.spouse)) {
    const realm = p.flags.humanSpouse ? 'aurelis' : p.realm.id;
    p.fam.push(mkMember(p, 'spouse', { name: p.kin.spouse, a0: -p.age + Math.max(16, p.age + RI(-4, 6)), realm, cls: p.cls, sex: p.sex === 'ญ' ? 'ช' : 'ญ', job: '' }));
    const sp = p.fam[p.fam.length - 1]; sp.job = famAge(p, sp) >= 14 ? famJobFor(sp) : '';
  }
  for (const m of p.fam) if (m.rel === 'spouse' && m.alive && m.name !== p.kin.spouse) { m.alive = false; m.left = true; m.dAge = p.age; m.diedAge = m.a0 + p.age; }
  for (const n of p.kidNames) if (!p.fam.some(m => m.rel === 'child' && m.alive && m.name === n)) p.fam.push(mkMember(p, 'child', { name: n, a0: -p.age, realm: p.realm.id, cls: p.cls, job: '' }));
  for (const m of p.fam) if (m.rel === 'child' && m.alive && !p.kidNames.includes(m.name)) { m.alive = false; m.dAge = p.age; m.diedAge = m.a0 + p.age; m.cause = 'เสียชีวิตก่อนวัยอันควร'; }

  for (const m of p.fam) {
    if (!m.alive) continue;
    const a = m.a0 + p.age;
    if (a < 0) continue;
    if (a === 0 && m.rel === 'sibling') {
      const mom = p.fam.find(x => x.rel === 'mother');
      if (!mom || !mom.alive) { m.alive = false; m.never = true; continue; }
      out.push(`${relName(p, m)}ของคุณเกิดแล้ว ชื่อ${m.name}`);
      if (roll(RBY[m.realm].infant * .1)) { const t = famDie(p, mom, 'เสียชีวิตขณะคลอดลูก'); if (t) out.push(t); }
      continue;
    }
    if (m.fixedAt != null && p.age >= m.fixedAt) { out.push(famDie(p, m, m.fixedCause || 'จากไป')); continue; }
    if (m.fixedAt == null && (m.rel !== 'child' || a >= 15)) { const c = famHazard(p, m, a); if (c) { out.push(famDie(p, m, c)); continue; } }
    if (a === 14 && !m.job) { m.job = famJobFor(m); if (m.rel !== 'child' || roll(.5)) out.push(`${m.name} ${relName(p, m)}ของคุณเริ่ม${m.cls <= 1 ? 'ฝึกเป็น' : 'ทำงานเป็น'}${m.job}`); }
    if ((m.rel === 'sibling' || m.rel === 'child') && !m.married && a >= 17 && a <= 32 && roll(.1)) { m.married = true; if (roll(.5)) out.push(`${m.name} ${relName(p, m)}ของคุณแต่งงานแล้ว`); }
    if (m.rel === 'sibling' && !m.moved && a >= 16 && a <= 35 && m.cls >= 2 && roll(.02)) {
      const to = pick(REALMS.filter(x => x.id !== m.realm && x.id !== 'serenth'));
      m.moved = to.id; m.realm = to.id; out.push(`${m.name} ${relName(p, m)}ของคุณย้ายไปอยู่ที่${to.name}`);
    }
  }
  return out.filter(Boolean).join(' · ') || null;
}

// --- hooks ---
const _makePerson = makePerson;
makePerson = function (realm, parent) { const p = _makePerson(realm, parent); initFamily(p, parent); return p; };
const _makeSibling = makeSibling;
makeSibling = function (d) {
  const p = _makeSibling(d);
  if (d.fam) {
    p.fam = d.fam.map(m => Object.assign({}, m, { a0: m.a0 + 2, dAge: m.dAge != null ? m.dAge - 2 : m.dAge, fixedAt: m.fixedAt != null ? m.fixedAt - 2 : m.fixedAt }))
      .filter(m => !(m.rel === 'sibling' && m.a0 === 0) && m.rel !== 'spouse' && m.rel !== 'child');
    p.fam.push({ id: ++FAM_ID, rel: 'sibling', name: d.name, sex: d.sex, a0: 2, realm: d.born.id, cls: d.bornCls, alive: false, diedAge: d.age, dAge: d.age - 2, cause: d.cause, job: '' });
    p.fam.sort((a, b) => b.a0 - a.a0);
  }
  return p;
};
const _applyFocus5 = applyFocus;
applyFocus = function (p) {
  const t = _applyFocus5(p);
  const f = p.alive ? famYear(p) : null;
  return [t, f].filter(Boolean).join(' · ') || null;
};
// the old one-line "a parent died" event is replaced by the family simulation
(() => {
  const e = EVENTS.find(x => x.f && /done\.parent = 1/.test(x.f.toString()) && /จากไป/.test(x.t.toString()));
  if (e) e.c = () => false;
  const g = EVENTS.find(x => /หลุมศพของพ่อแม่/.test(x.t.toString()));
  if (g) g.c = p => p.age > 30 && p.fam && !famAlive(p, 'mother') && !famAlive(p, 'father') && famOf(p, 'mother').length > 0;
  const c = CHOICES.find(x => x.id === 'parentsick');
  if (c) {
    c.when = p => p.age >= 18 && p.age <= 60 && p.fam && famAlive(p, 'mother') && !p.done.parentsick && roll(.05);
    const orig = c.options;
    c.options = p => orig(p).map(o => Object.assign({}, o, { act: q => {
      const t = o.act(q); q.done.parentsick = 1;
      if (/เสียทั้งแม่|จากไปในอ้อมกอด/.test(t)) { const m = q.fam.find(x => x.rel === 'mother'); if (m && m.alive) { famDie(q, m, 'ป่วยหนักจนเสียชีวิต', true); q.happy += 10; } }
      q.done.parent = (!famAlive(q, 'mother') || !famAlive(q, 'father')) ? 1 : 0;
      return t;
    } }));
  }
  // childhood lines that need a living parent
  const momLine = p => famAlive(p, 'mother') ? null : 'คุณเติบโตมาโดยไม่มีแม่ ป้าข้างบ้านช่วยเลี้ยงคุณแทน';
  CHILD_ANY[0] = p => momLine(p) || `คุณเดินได้ก้าวแรก แล้วล้มลงในอ้อมแขนของ${p.kin.mother}`;
  CHILD_ANY[2] = p => momLine(p) || `${p.kin.mother}ร้องเพลงกล่อมคุณทุกคืน`;
  CHILD_ANY[4] = p => famAlive(p, 'father') ? `คุณกลัวเสียงฟ้าร้องจนต้องมุดไปนอนข้าง${p.kin.father}` : 'คืนที่ฟ้าร้อง คุณมุดเข้าไปนอนกับพี่น้อง เพราะไม่มีพ่อให้กอดแล้ว';
})();
LEGENDS.push(
  { id: 'bigfamily', n: 'บ้านที่ไม่เคยเงียบ', d: 'เกิดมามีพี่น้องอย่างน้อย 5 คน', c: p => p.fam && famOf(p, 'sibling').length >= 5 },
  { id: 'orphan', n: 'เด็กกำพร้า', d: 'เสียทั้งพ่อและแม่ก่อนอายุ 12', c: p => p.fam && famOf(p, 'mother').concat(famOf(p, 'father')).every(m => !m.alive && m.dAge != null && m.dAge < 12) },
  { id: 'lastone', n: 'คนสุดท้ายที่เหลือ', d: 'มีชีวิตอยู่นานกว่าพ่อแม่และพี่น้องทุกคน', c: p => p.fam && p.fam.filter(m => m.rel !== 'spouse' && m.rel !== 'child' && !m.never).length >= 3 && p.fam.filter(m => m.rel !== 'spouse' && m.rel !== 'child' && !m.never).every(m => !m.alive) },
);
function famBirthLine(p) {
  const sib = famOf(p, 'sibling').filter(m => m.a0 > 0), alive = sib.filter(m => m.alive), dead = sib.filter(m => !m.alive);
  let t = `แม่อายุ ${famAge(p, famOf(p, 'mother')[0])} ปี พ่ออายุ ${famAge(p, famOf(p, 'father')[0])} ปี`;
  if (!sib.length) t += ' คุณเป็นลูกคนแรก';
  else { t += ` คุณมีพี่ ${alive.length} คน`; if (dead.length) t += ` และมีพี่อีก ${dead.length} คนที่เสียชีวิตไปก่อนคุณเกิด`; }
  const mom = famOf(p, 'mother')[0]; if (mom && !mom.alive) t += ` · ${mom.name}แม่ของคุณเสียชีวิตขณะคลอดคุณ`;
  return t;
}

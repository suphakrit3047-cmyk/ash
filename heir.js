// ===== CONTINUING AS AN HEIR OR A YOUNGER SIBLING: START AT THEIR REAL AGE =====
// the years before the handover are lived quickly in the background, then the player takes over
function fastForward(p, target) {
  target = Math.max(0, Math.floor(target));
  if (!target) return [];
  const notes = [];
  const realDie = die;
  die = function (q, cause) { if (q === p) { q.health = Math.max(q.health, 30); return; } return realDie(q, cause); };
  const keep = /เกิดแล้ว|เสียชีวิต|จากไป|แต่งงาน|ย้ายไป|ลูกคนใหม่|เลื่อนขั้น|ได้เป็น|ซื้อ|สร้าง|ติด|ขั้น \d/;
  p.auto = true;
  try {
    let guard = 0;
    while (p.age < target && guard++ < 400) {
      if (p.age >= 7 && Math.random() < .15) p.focus = pick(['work', 'work', 'train', 'love', 'rest']);
      if (p.age === 12 && !canArm(p)) setWeapon(p, pick(['sword', 'spear', 'axe', 'bow', 'dagger']));
      if (p.age >= 14) { ensureCareer(p); if (Math.random() < .12) { const open = CAREERS.filter(c => !c.base && !careerMissing(p, c).length); if (open.length) takeCareer(p, pick(open).id); } }
      const ch = checkChoice(p);
      if (ch) { const o = autoChoose(p, ch); const t = resolveChoice(p, o); if (t && keep.test(t)) notes.push([p.age, t]); }
      const r = finishYear(p, true);
      for (const l of r.lines) if (!l.startsWith('§') && keep.test(l)) notes.push([p.age - 1, l]);
      if (r.fate) { resolveChoice(p, autoChoose(p, r.fate)); afterFate(p); }
      p.alive = true; p.cause = null;
      if (p.pendingFight) p.pendingFight = null;
    }
  } finally { die = realDie; p.auto = false; p.trip = null; }
  p.focus = p.age >= 14 ? 'work' : 'work';
  return notes.slice(-10);
}
function heirAge(p, parent, sib) {
  if (sib) return Math.max(0, sib.age - 2);
  if (parent) return Math.max(0, parent.age - (p.birthYear - parent.birthYear));
  return 0;
}

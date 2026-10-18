// ===== REPUTATION AND CONSCIENCE =====
// not one good/evil bar: four groups who judge you by their own values, and your own conscience
const FACTIONS = {
  folk: { n: 'ชาวบ้าน', d: 'คนธรรมดา คนจน และเพื่อนบ้าน' },
  noble: { n: 'ขุนนาง', d: 'ตระกูลผู้มีอำนาจและราชสำนัก' },
  church: { n: 'ศาสนจักรสุริยะ', d: 'นักบวชและศาลศาสนา' },
  under: { n: 'โลกใต้ดิน', d: 'หัวขโมย คนเถื่อน และพวกนอกกฎหมาย' },
};
const FKEYS = Object.keys(FACTIONS);
const rep = p => p.rep || (p.rep = { folk: 0, noble: p.cls === 0 ? 15 : 0, church: 0, under: 0 });
const guilt = p => p.guilt || 0;
function addRep(p, d, scale = 1) {
  const R = rep(p);
  for (const k of FKEYS) if (d[k]) R[k] = Math.max(-100, Math.min(100, R[k] + d[k] * scale));
  if (d.guilt) p.guilt = Math.max(0, Math.min(100, guilt(p) + d.guilt));
}
// what each deed means to each group (applied when the flag first appears, or per step for counters)
const DEEDS = {
  savedOther: { folk: 6, guilt: -3 }, betrayer: { folk: -10, noble: 4, church: 3, under: -8, guilt: 12 }, cruel: { folk: -5, guilt: 6 },
  rebel: { folk: 5, noble: -8, church: -4, under: 4 }, truthSpoken: { folk: 8, church: -15, noble: -5 }, thiefGuild: { under: 10, noble: -3 },
  openedPort: { folk: 5 }, council: { noble: 6 }, festival: { folk: 3 }, threadDrain: { church: -3, guilt: 6 },
  epidemicHero: { folk: 12, church: 3, guilt: -6 }, rose: { folk: 8, noble: -10, church: -4 }, bogrite: { church: -6, folk: 2 },
  relief: { folk: 10, church: 2 }, cutTax: { folk: 6, noble: -3 }, openedGate: { folk: 20, noble: -15, church: -20 }, closedGate: { folk: -8, church: 5, noble: 4 },
  usurper: { noble: -5, guilt: 25 }, plotted: { guilt: 5 }, loyal: { noble: 5 }, foiledPlot: { noble: 2 }, tasterDied: { guilt: 4 },
  eloped: { noble: -10, folk: 6 }, hiddenMage: { church: -5 }, churchMage: { church: 8 }, fugitive: { noble: -5, under: 3 },
  weaponsmith: { folk: -2, guilt: 3 }, safeMines: { folk: 8, noble: -3 }, peacemaker: { folk: 8 }, conqueror: { noble: 4, folk: -6, guilt: 4 },
  heroOfVillage: { folk: 10 }, philanthropist: { folk: 8, church: 3, guilt: -10 }, physician: { folk: 3 }, priest: { church: 6 },
  knight: { noble: 6 }, archmage: { noble: 3, church: -2 }, sawPoor: { folk: 2 }, mendVote: { folk: 6, noble: -8 },
  harshLord: { folk: -.6, noble: .4, guilt: .5 }, fairLord: { folk: 1.2, noble: -.4 }, debtBond: { noble: -2 }, liftedCurse: { guilt: -5 },
  builder: { folk: 2, guilt: -4 }, cured: { folk: .5 },
};
const COUNTERS = ['harshLord', 'fairLord', 'builder', 'cured'];
function deedSync(p) {
  const f = p.flags, s = p._deeds || (p._deeds = {}), out = [];
  for (const [k, d] of Object.entries(DEEDS)) {
    const v = f[k]; if (!v) continue;
    if (COUNTERS.includes(k)) { const n = +v || 0, was = s[k] || 0; if (n > was) { for (let i = was; i < n; i++) addRep(p, d); s[k] = n; } }
    else if (!s[k]) { s[k] = 1; addRep(p, d, 2); }
  }
  return out;
}
// choices that set no flag but still say something about you
const CHOICE_DEEDS = [
  [/guardDuty/, /ทำตามคำสั่ง/, { folk: -4, noble: 2, guilt: 3 }],
  [/thiefJob/, /ลงมือ/, { under: 2, guilt: 1 }],
  [/quest:smuggle/, /เดินผ่าน/, { under: 5, church: -3 }],
  [/quest:bounty/, /จับตัว|กับดัก/, { noble: 3, under: -3 }],
  [/quest:(nest|beast|escort)/, /./, { folk: 2 }],
  [/royalFamine/, /ขายข้าว/, { folk: -8, noble: 2 }],
  [/mineLaw/, /ไม่เปลี่ยน/, { folk: -6, noble: 3 }],
  [/openGate/, /ไล่/, {}],
];
const BAD_WORDS = /ใส่ร้าย|เยาะเย้ย|หักหลัง|โกง|รีดไถ|ทิ้งเขา|ทิ้งเธอ|แย่งชิง/;
const THEFT_WORDS = /ขโมย|ปล้น|ล้วง/;
const KIND_WORDS = /ช่วยเหลือ|แบ่งให้|บริจาค|ซ่อนเขา|ซ่อนเธอ|ปล่อยเขา|ปล่อยเธอ|ยกโทษ|ขอโทษ|ดูแลเอง/;
function choiceDeed(p, cid, label) {
  const d = {};
  for (const [c, l, x] of CHOICE_DEEDS) if (c.test(cid) && l.test(label)) Object.assign(d, x);
  if (BAD_WORDS.test(label)) d.guilt = (d.guilt || 0) + 4;
  if (THEFT_WORDS.test(label)) { d.guilt = (d.guilt || 0) + (p.wealth < 15 ? 1 : 4); d.under = (d.under || 0) + 1; }
  if (KIND_WORDS.test(label)) { d.guilt = (d.guilt || 0) - 2; d.folk = (d.folk || 0) + 1; }
  return d;
}
// tag every option with the choice it came from
extend('checkChoice', 'morality: tag every option with the choice it came from', inner => function (p) { const ch = inner(p); if (ch) for (const o of ch.options) o._cid = ch.id; return ch; });
extend('resolveChoice', 'morality: a choice changes reputation and guilt', inner => function (p, o) {
  const cid = o._cid || (typeof pending !== 'undefined' && pending && pending.id) || '';
  const t = inner(p, o);
  addRep(p, choiceDeed(p, cid, o.label || ''));
  deedSync(p);
  return t;
});
// show the effect on reputation before choosing
extend('previewOption', 'morality: show the effect on reputation before choosing', inner => function (p, o, n) {
  const pr = inner(p, o, n); if (!pr) return pr;
  try {
    const q = structuredClone({ ...p, pendingFight: null }); q.checks = []; const before = JSON.stringify(rep(q)), g0 = guilt(q);
    o.act(q); const cid = o._cid || (typeof pending !== 'undefined' && pending && pending.id) || '';
    addRep(q, choiceDeed(q, cid, o.label || '')); deedSync(q);
    const b = JSON.parse(before), R = rep(q);
    pr.rep = {}; for (const k of FKEYS) { const d = R[k] - b[k]; if (Math.abs(d) >= 1) pr.rep[k] = d; }
    pr.guilt = guilt(q) - g0;
  } catch (e) { }
  return pr;
});
// atonement
CHOICES.push({ id: 'atone', repeat: 4, when: p => guilt(p) >= 30 && p.age >= 16 && roll(.25),
  prompt: p => `อายุ ${p.age} ปี คุณนอนไม่หลับมาหลายคืนแล้ว ภาพของสิ่งที่เคยทำวนกลับมาทุกครั้งที่หลับตา`,
  options: p => [
    opt('ไปสารภาพบาปที่วิหาร', q => { q.wealth -= 5; addRep(q, { church: 3, guilt: -15 }); return 'นักบวชฟังคุณจนจบ แล้วบอกว่าดวงอาทิตย์ให้อภัยคนที่สำนึก คุณไม่แน่ใจว่าเชื่อ แต่คืนนั้นคุณหลับได้'; }, q => q.wealth >= 5, `ต้องมีทรัพย์ 5`),
    opt('ไปชดใช้ให้คนที่เคยทำร้าย', q => { q.wealth -= 20; addRep(q, { folk: 5, guilt: -25 }); q.flags.atoned = true; return 'เขามองเงินในมือคุณอยู่นาน ก่อนจะรับไว้โดยไม่พูดอะไร คุณเดินกลับบ้านพร้อมกับความรู้สึกเบาขึ้นเป็นครั้งแรกในรอบหลายปี'; }, q => q.wealth >= 20, `ต้องมีทรัพย์ 20`),
    opt('เก็บไว้ในใจต่อไป', q => { q.happy -= 3; return 'คุณลุกขึ้นไปทำงานเหมือนทุกวัน และไม่บอกใคร'; }),
  ] });
// what reputation and conscience do each year
const REP_L = v => v >= 60 ? 'รักใคร่' : v >= 25 ? 'นับถือ' : v > -25 ? 'เฉยๆ' : v > -60 ? 'ไม่ไว้ใจ' : 'เกลียดชัง';
const GUILT_L = g => g >= 60 ? 'ทุกข์ทรมาน' : g >= 30 ? 'รู้สึกผิด' : g >= 10 ? 'ไม่สบายใจ' : 'สงบ';
function moralYear(p) {
  const R = rep(p), out = [];
  deedSync(p);
  // what you do for a living shapes how people see you, slowly
  const JOB_REP = { thief: { under: 1.5, folk: -.5 }, guard: { noble: .8, folk: -.4, under: -.8 }, priest: { church: 1.5, folk: .5 }, physician: { folk: 1.2 }, healer: { folk: 1.5, church: -.3 }, merc: { under: .5, folk: -.3 }, soldier: { noble: .6 }, scribe: { noble: .5, church: .3 }, envoy: { noble: 1 }, smith: { folk: .4 }, artisan: { folk: .4 }, merchant: { noble: .3, folk: .2 }, noble: { noble: .6, folk: -.3 }, royal: { noble: .8 }, battlemage: { noble: .5, church: -.4 }, guide: { folk: .4, under: .3 } };
  if (p.focus === 'work' && JOB_REP[p.career]) addRep(p, JOB_REP[p.career]);
  if (p.career === 'thief' && p.focus === 'work' && p.cls <= 1) addRep(p, { guilt: 1.5 });
  const g = guilt(p);
  if (g > 0) { p.happy -= g / 20; p.guilt = Math.max(0, g - .5); }
  if (g >= 40 && roll(.2)) out.push(pick(['คุณฝันร้ายถึงเรื่องเก่าอีกแล้ว', 'คุณสะดุ้งตื่นกลางดึกด้วยเหงื่อท่วมตัว', 'คุณเห็นหน้าคนที่เคยทำร้ายในฝูงชน แต่พอหันไปดูอีกทีก็ไม่มีใคร']));
  if (R.folk >= 40) p.happy += 1;
  if (R.folk <= -40 && roll(.15)) { p.happy -= 3; out.push('มีคนขว้างก้อนหินใส่ประตูบ้านคุณกลางดึก และเขียนคำด่าไว้บนกำแพง'); }
  if (R.noble <= -40 && p.wealth > 20 && roll(.15)) { const l = p.wealth * .05; p.wealth -= l; out.push(`ขุนนางในละแวกหาเรื่องปรับเงินคุณ ${money(l)} ด้วยข้อหาที่คุณไม่เคยได้ยินมาก่อน`); }
  if (R.church <= -40 && has(p, 'aurelis', 'undercity') && roll(.1)) { p.happy -= 3; out.push('นักบวชประกาศชื่อคุณในวิหารว่าเป็นคนบาปที่ไม่ควรมีใครคบหา'); }
  if (R.under >= 40 && roll(.1)) { const v = 3 * priceF(p); p.wealth += v; out.push(`คนจากตรอกมืดแวะมาฝากของขวัญเล็กๆ ไว้ ${money(v)} เพื่อขอบคุณที่คุณไม่เคยปากโป้ง`); }
  return out;
}
extend('applyFocus', 'morality: a year at work shapes reputation', inner => function (p) { const t = inner(p); if (!p.alive) return t; const m = moralYear(p); return [t, ...m].filter(Boolean).join(' · ') || null; });
extend('hazards', 'morality: a heretic risks the inquisition', inner => function (p) { const H = inner(p); if (p.rep && p.rep.church <= -40) for (const h of H) if (h[2] === 'burn') h[1] *= 1.5; return H; });
// a name carries over: children inherit a little of how people saw their parent
extend('makePerson', 'morality: a name carries over: children inherit a little of how people saw their parent', inner => function (realm, parent) { const p = inner(realm, parent); if (parent && parent.rep) { const R = rep(p); for (const k of FKEYS) R[k] = Math.round(R[k] + parent.rep[k] * .3); } return p; });
// how you are remembered
function epitaph(p) {
  const R = rep(p), out = [];
  const L = {
    folk: [`ชาวบ้านจดจำคุณว่าเป็นคนที่ไม่เคยทิ้งเพื่อนบ้าน`, `ชาวบ้านยังสาปแช่งชื่อคุณอยู่หลายปีหลังคุณจากไป`],
    noble: [`ขุนนางยกย่องคุณว่าเป็นคนรู้จักที่ต่ำที่สูง`, p.bornCls <= 1 ? `ขุนนางเรียกคุณว่าคนทรยศชนชั้นของตัวเอง` : `ขุนนางเรียกคุณว่าตัวปัญหาที่ไม่รู้จักที่ทางของตัวเอง`],
    church: [`ศาสนจักรสวดส่งวิญญาณคุณเจ็ดวันเจ็ดคืน`, `ศาสนจักรไม่ยอมให้ฝังศพคุณในสุสานศักดิ์สิทธิ์`],
    under: [`ในตรอกมืด ชื่อคุณยังถูกพูดถึงด้วยความเคารพ`, `คนในตรอกมืดดีใจที่คุณจากไป`],
  };
  const strong = FKEYS.filter(k => Math.abs(R[k]) >= 20).sort((a, b) => Math.abs(R[b]) - Math.abs(R[a]));
  for (const k of strong.slice(0, 3)) out.push(L[k][R[k] > 0 ? 0 : 1]);
  const g = guilt(p);
  if (g >= 40) out.push('คุณจากไปพร้อมความรู้สึกผิดที่ไม่เคยได้ชดใช้');
  else if (p.flags.atoned) out.push('ก่อนตาย คุณได้ชดใช้สิ่งที่เคยทำไว้');
  else if (strong.length && strong.every(k => R[k] > 0) && g < 10) out.push('คุณจากไปอย่างสงบใจ');
  if (!out.length) out.push('ไม่ค่อยมีใครจำชื่อคุณได้ คุณใช้ชีวิตอย่างคนธรรมดาคนหนึ่ง และนั่นก็ไม่ใช่เรื่องผิดอะไร');
  return out;
}
LEGENDS.push(
  { id: 'beloved', n: 'ที่รักของชาวบ้าน', d: 'ได้รับความรักใคร่จากชาวบ้าน', c: p => p.rep && p.rep.folk >= 60 },
  { id: 'twofaced', n: 'คนสองหน้า', d: 'เป็นที่นับถือของทั้งขุนนางและโลกใต้ดินในเวลาเดียวกัน', c: p => p.rep && p.rep.noble >= 25 && p.rep.under >= 25 },
  { id: 'heretic', n: 'คนนอกรีต', d: 'ถูกศาสนจักรเกลียดชัง', c: p => p.rep && p.rep.church <= -60 },
  { id: 'redeemed', n: 'ไถ่บาป', d: 'เคยรู้สึกผิดอย่างหนัก แต่ได้ชดใช้ก่อนตาย', c: p => p.flags.atoned && guilt(p) < 20 },
);

// ===== WHAT A WEAPON IS FOR =====
// 1) arenas and fighting pits: a fight you can choose, any year
const ARENA = {
  aurelis: { n: 'ลานประลองหลวง', d: 'ประลองกันตามกติกา มีกรรมการคอยห้าม คนดูมีแต่ขุนนางกับพ่อค้า' },
  kragmor: { n: 'โถงประลองของคนแคระ', d: 'สู้กันด้วยอาวุธทื่อตามธรรมเนียม แพ้ก็แค่กระดูกหัก' },
  grieve: { n: 'ลานประลองงานวัด', d: 'ชาวบ้านมาลงพนันกันด้วยไก่กับเหรียญทองแดง' },
  undercity: { n: 'บ่อต่อสู้ใต้กำแพง', d: 'ไม่มีกติกา ไม่มีกรรมการ เงินรางวัลงาม แต่บางคนก็ไม่ได้เดินออกมา', pit: true },
  dunes: { n: 'หลุมทรายเดิมพัน', d: 'พ่อค้าทะเลทรายพนันกันด้วยน้ำกับเกลือ ใครแพ้ก็ถูกทิ้งไว้กลางแดด', pit: true },
  mulvane: { n: 'บ่อโคลนหลังโรงเหล้า', d: 'ลุยกันในโคลนท่วมเข่าต่อหน้าพวกขี้เมา', pit: true },
};
Object.assign(FOES, {
  arena1: { n: 'นักสู้มือใหม่', v: 'ฟาด', hp: 16, ac: 13, atk: 5, die: 6, plus: 1, lethal: .02, flee: 99, yield: true },
  arena2: { n: 'นักสู้ประจำลาน', v: 'ฟัน', hp: 24, ac: 15, atk: 6, die: 8, plus: 3, lethal: .05, flee: 99, yield: true },
  arena3: { n: 'แชมป์ประจำลาน', v: 'ฟัน', hp: 34, ac: 17, atk: 8, die: 10, plus: 4, lethal: .1, flee: 99, yield: true },
});
const ARENA_T = [
  { foe: 'arena1', n: 'รอบคัดเลือก', pay: 1 },
  { foe: 'arena2', n: 'คู่ประจำลาน', pay: 2.5 },
  { foe: 'arena3', n: 'ท้าชิงแชมป์', pay: 6 },
];
const ARENA_MAX = 3;
const arenaLeft = p => ARENA_MAX - (p.flags.arenaAge === p.age ? (p.flags.arenaN || 0) : 0);
function canArena(p, tier) {
  if (!ARENA[questRealm(p).id]) return 'ที่นี่ไม่มีลานประลอง';
  if (p.age < 14) return 'ต้องอายุ 14 ปีขึ้นไป';
  if (p.cls === 4) return 'ทาสลงประลองเองไม่ได้';
  if (p.cls === 3) return 'ไพร่ออกจากที่ดินไม่ได้';
  if (arenaLeft(p) <= 0) return 'ปีนี้สู้ครบ 3 ครั้งแล้ว ร่างกายต้องพัก';
  if (p.health < 25) return 'สุขภาพย่ำแย่เกินกว่าจะลงสู้';
  if (tier === 2 && (p.flags.arenaWins || 0) < 2) return 'ต้องชนะในลานมาแล้ว 2 ครั้ง ถึงจะได้ท้าแชมป์';
  return null;
}
function startArena(p, tier) {
  if (canArena(p, tier)) return null;
  const A = ARENA[questRealm(p).id], T = ARENA_T[tier], pit = !!A.pit;
  if (p.flags.arenaAge !== p.age) { p.flags.arenaAge = p.age; p.flags.arenaN = 0; }
  p.flags.arenaN++;
  const pay = Math.round(T.pay * qF(questRealm(p)) * (pit ? 1.6 : 1) * 10) / 10;
  const lethal = FOES[T.foe].lethal * (pit ? 3 : 1);
  return { id: 'arena', prompt: `อายุ ${p.age} ปี ก้าวลงไปใน${A.n} คนดูโห่ร้องกันลั่น รางวัลรอบนี้ ${money(pay)}${pit ? ' · บ่อแบบนี้ ต่อให้ยอมแพ้แล้วก็ยังอาจโดนกระทืบซ้ำ' : ''}`, options: [
    fightOpt(`สู้ (${T.n})`, T.foe, { lethal, intro: pit ? 'อีกฝ่ายไม่รอสัญญาณ พุ่งเข้ามาเลย' : 'กรรมการตีฆ้อง เริ่มได้', death: pit ? `เสียชีวิตใน${A.n}` : `เสียชีวิตจากอุบัติเหตุใน${A.n}`,
      onEnd: (q, r) => {
        if (r === 'win') {
          q.wealth += pay; led(q, 'quest', pay); q.flags.arenaWins = (q.flags.arenaWins || 0) + 1; q.happy += 3;
          if (tier === 2) { q.flags.champion = (q.flags.champion || 0) + 1; addRep(q, pit ? { under: 4 } : { folk: 3, noble: 2 }); }
          else if (pit) addRep(q, { under: 1 });
          return `ชนะ ได้เงินรางวัล ${money(pay)}${tier === 2 ? ' · คนทั้งลานตะโกนชื่อกันลั่น' : ''}`;
        }
        if (r === 'dead') return '';
        q.health -= pit ? 6 : 3;
        return pit ? 'แพ้ แล้วถูกลากออกจากบ่อทั้งที่เลือดยังไม่หยุดไหล' : 'แพ้ กรรมการยกมือให้อีกฝ่าย เดินออกจากลานมาพร้อมรอยช้ำเต็มตัว';
      } }),
    opt('เปลี่ยนใจ ไม่ลงสู้', q => { q.flags.arenaN--; return 'ถอยกลับขึ้นไปนั่งดูบนอัฒจันทร์'; }),
  ] };
}
// 2) hunting: once a year, meat, hides and danger
function canHunt(p) {
  if (p.age < 12) return 'ต้องอายุ 12 ปีขึ้นไป';
  if (p.cls === 4) return 'ทาสออกล่าเองไม่ได้';
  if (questRealm(p).id === 'aurelis' || questRealm(p).id === 'undercity') return 'ในเมืองไม่มีที่ให้ล่าสัตว์';
  if (p.flags.huntAge === p.age) return 'ปีนี้ออกล่ามาแล้ว';
  return null;
}
function startHunt(p) {
  if (canHunt(p)) return null;
  p.flags.huntAge = p.age;
  const beast = beastFor(p), r = questRealm(p);
  const meat = Math.round(3 * qF(r) * 10) / 10;
  return { id: 'hunt', prompt: `อายุ ${p.age} ปี ออกไปล่าสัตว์ตั้งแต่ฟ้ายังไม่สาง เจอรอยเท้า${FOES[beast].n}ตัวเบ้อเริ่ม กับรอยกวางป่าฝูงเล็กๆ`, options: [
    fightOpt(`ตามล่า${FOES[beast].n}`, beast, { lethal: .25, intro: 'มันได้กลิ่นก่อน แล้วหันกลับมา', death: `ถูก${FOES[beast].n}ฆ่าระหว่างออกล่า`,
      onEnd: (q, r) => r === 'win' ? (q.flags.bigGame = true, q.wealth += meat * 2, led(q, 'sales', meat * 2), `ลากซากมันกลับมาได้ ขายเนื้อได้ ${money(meat * 2)}` + lootMats(q, [['hide', 3]])) : r === 'fled' ? 'หนีกลับมาได้ แต่มือเปล่า' : r === 'dead' ? '' : (q.health -= 8, 'มันทิ้งรอยแผลไว้ให้ แล้วหายเข้าพุ่มไม้ไป') }),
    Object.assign(opt('ซุ่มยิงกวาง', q => {
      const bow = gear(q).w === 'bow' || gear(q).w === 'spear';
      if (check(q, 'DEX', bow ? gear(q).w : 'survival', bow ? 11 : 14)) { q.wealth += meat; led(q, 'sales', meat); return `${bow ? 'ยิงจากระยะไกล ' : ''}ล้มกวางได้ตัวหนึ่ง ขายเนื้อได้ ${money(meat)}` + lootMats(q, [['hide', 1]]); }
      return 'กวางได้ยินเสียง เลยวิ่งหนีไปหมด';
    }), { chk: ['DEX', gear(p).w === 'bow' || gear(p).w === 'spear' ? gear(p).w : 'survival'] }),
    opt('กลับบ้าน', () => 'เดินกลับบ้านมือเปล่า อย่างน้อยก็ได้สูดอากาศดีๆ'),
  ] };
}
// 3) a person who can fight survives battles and wild beasts more often
const combatPower = p => (p.gear && p.skills && p.attrs) ? Math.max(0, pAtk(p) + (pAC(p) - 10) / 2) : 0;
const fightSurvive = p => Math.max(.6, 1 - .04 * combatPower(p));
extend('hazards', 'arms: fighters survive war and beasts more often', inner => function (p) {
  const H = inner(p); const f = fightSurvive(p);
  if (f < 1) for (const h of H) if (h[2] === 'war' || h[2] === 'beast') h[1] *= f;
  return H;
});
// 4) fighting careers pay by how well you fight
const FIGHT_JOBS = ['soldier', 'merc', 'guard', 'hunter', 'knight', 'battlemage'];
extend('incomeMod', 'arms: fighting careers pay by skill', inner => function (p) { const m = inner(p); return FIGHT_JOBS.includes(p.career) ? m * (1 + Math.min(.25, combatPower(p) * .03)) : m; });
LEGENDS.push(
  { id: 'champion', n: 'แชมป์ประจำลาน', d: 'ชนะการท้าชิงแชมป์ในลานประลองหรือบ่อต่อสู้', c: p => p.flags.champion },
  { id: 'biggame', n: 'นายพราน', d: 'ล่าสัตว์ร้ายได้ด้วยมือตัวเอง', c: p => p.flags.bigGame },
);

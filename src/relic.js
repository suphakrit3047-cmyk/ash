// ===== RELICS: old things with real power, and a real price =====
// every relic exists once in the whole world. it passes to your heir, or is lost where you die and can be found again in a later life
const RELICS = {
  crown: { n: 'มงกุฎเถ้า', src: 'royal', v: 150, d: 'มงกุฎเหล็กดำที่กษัตริย์องค์แรกสวมในปีที่เถ้าตกจากฟ้า',
    good: 'ทอยเสน่ห์ +3 · ขุนนางนับถือมากขึ้นทุกปี', bad: 'ฝันร้ายถึงไฟทุกคืน ความสุขลดลงปีละ 3',
    chk: { CHA: 3 }, yr: { happy: -3, rep: { noble: 1 } }, yrT: ['คืนนี้คุณฝันถึงเมืองที่ลุกเป็นไฟอีกแล้ว เสียงคนในฝันเรียกคุณว่าฝ่าบาท'] },
  sword: { n: 'ดาบบรรพบุรุษ', src: 'noble', v: 80, d: 'ดาบที่บรรพบุรุษคนแรกของตระกูลใช้ตัดหัวขุนศึก ใบดาบยังคมเหมือนวันที่ตีขึ้น',
    good: 'โจมตี +2 ในการต่อสู้', bad: 'ใครๆ ก็รู้ว่าคุณมีมัน โจรหมายตาคุณบ่อยขึ้นมาก',
    atk: 2, theft: 2.5, yrT: ['ชายแปลกหน้าคนหนึ่งยืนมองดาบที่เอวคุณนานผิดปกติ'] },
  ring: { n: 'แหวนตราตระกูล', src: 'noble', v: 60, d: 'แหวนทองที่ประทับตราของตระกูลเก่า ใครเห็นก็รู้ว่าคุณมาจากไหน',
    good: 'ทอยพูดจา +3 · ขุนนางนับถือขึ้นเล็กน้อยทุกปี', bad: 'หนี้เก่าของตระกูลตามมาเก็บทุกปี',
    chk: { speech: 3 }, yr: { debt: 2, rep: { noble: .5 } }, yrT: ['เจ้าหนี้ของปู่ทวดส่งคนมาทวงหนี้อีกปี'] },
  knife: { n: 'มีดกระดูกไร้เงา', src: 'undercity', v: 70, d: 'มีดที่ทำจากกระดูกของอะไรบางอย่าง มันไม่มีเงาแม้ยืนกลางแดด',
    good: 'โจมตี +3 · ทอยมีดสั้น +2', bad: 'มันกระซิบถึงเลือดทุกคืน คุณรู้สึกผิดเพิ่มขึ้นทุกปี',
    atk: 3, chk: { dagger: 2 }, yr: { guilt: 2 }, yrT: ['เสียงกระซิบจากมีดดังขึ้นอีกครั้งตอนที่คุณกำลังจะหลับ'] },
  amulet: { n: 'เครื่องรางผ้าแดง', src: 'mulvane', v: 50, d: 'ห่อผ้าแดงที่หมอผีแห่งหนองพิษผูกด้วยผมคนตายเจ็ดคน',
    good: 'โอกาสป่วยหนักและตายด้วยโรคระบาดลดลงครึ่งหนึ่ง', bad: 'ศาสนจักรถือว่าเป็นของนอกรีต ชื่อเสียงกับศาสนจักรลดลงทุกปี',
    haz: { ill: .5, plague: .5 }, yr: { rep: { church: -2 } }, yrT: ['นักบวชคนหนึ่งเหลือบเห็นผ้าแดงที่คอคุณ แล้วทำเครื่องหมายดวงอาทิตย์ที่อก'] },
  eye: { n: 'ตาแก้วใต้ทราย', src: 'dunes', v: 90, d: 'ลูกแก้วขนาดเท่าลูกตาที่ขุดได้จากเมืองใต้ทราย มองผ่านมันแล้วเห็นสิ่งที่ซ่อนอยู่',
    good: 'ทอยปัญญาและไหวพริบ +2', bad: 'บางครั้งมันให้คุณเห็นสิ่งที่ไม่อยากเห็น ความสุขลดลงปีละ 2',
    chk: { INT: 2, WIS: 2 }, yr: { happy: -2 }, yrT: ['คุณมองผ่านตาแก้วแล้วเห็นเงาของคนที่ตายไปแล้วยืนอยู่ในห้อง'] },
  lantern: { n: 'ตะเกียงไม่มีวันดับ', src: 'kragmor', v: 60, d: 'ตะเกียงทองเหลืองของนักขุดคนแรก ไฟข้างในไม่เคยดับมาสามร้อยปี',
    good: 'ทอยเอาชีวิตรอด +3 · สัตว์ร้ายและเหมืองถล่มอันตรายน้อยลงครึ่งหนึ่ง', bad: 'แสงของมันเห็นได้จากไกล โจรหมายตาคุณบ่อยขึ้น',
    chk: { survival: 3 }, haz: { beast: .5, mine: .5 }, theft: 1.8 },
  needle: { n: 'เข็มเย็บฟ้า', src: 'thread', v: 120, d: 'เข็มเงินเล่มเล็กที่ว่ากันว่าใช้เย็บรอยขาดของท้องฟ้าครั้งแรก',
    good: 'ทอยเวทเส้นใย +3', bad: 'ทุกปีมีโอกาสที่เส้นใยจะสาปคุณ',
    chk: { thread: 3 }, yr: { curse: .06 } },
  bone: { n: 'กระดูกนักบุญ', src: 'aurelis', v: 100, d: 'กระดูกนิ้วของนักบุญคนแรกแห่งดวงอาทิตย์ ในกล่องเงินที่ไม่มีใครควรเปิด',
    good: 'ความรู้สึกผิดลดลงทุกปี · ศาสนจักรนับถือมากขึ้นทุกปี', bad: 'ทั้งโจรและคนของศาสนจักรอยากได้มันคืน มีคนมาเอามันบ่อยมาก',
    yr: { guilt: -2, rep: { church: 2 } }, theft: 3 },
  tooth: { n: 'ฟันทองของราชาโจร', src: 'undercity', v: 70, d: 'ฟันทองซี่สุดท้ายของราชาโจรที่ถูกแขวนคอเมื่อร้อยปีก่อน',
    good: 'ทอยลอบเร้น +3 · โลกใต้ดินนับถือมากขึ้นทุกปี', bad: 'ขุนนางและชาวบ้านไว้ใจคุณน้อยลงทุกปี',
    chk: { stealth: 3 }, yr: { rep: { under: 2, noble: -1.5, folk: -.5 } } },
  bell: { n: 'ระฆังจมน้ำ', src: 'mulvane', v: 90, d: 'ระฆังสำริดที่ดึงขึ้นมาจากก้นหนอง มันดังเองทุกครั้งที่มีคนใกล้ตัวคุณกำลังจะตาย',
    good: 'คุณแก่ช้าลง โอกาสตายด้วยวัยชราลดลงมาก', bad: 'มันเอาปีชีวิตจากคนรอบตัวมาให้คุณ คนในครอบครัวตายง่ายขึ้น',
    haz: { old: .55 }, fam: .35, yr: { happy: -1 }, yrT: ['ระฆังดังเบาๆ กลางดึก ทั้งบ้านไม่มีใครหลับได้อีกเลยคืนนั้น'] },
  hammer: { n: 'ฆ้อนของช่างคนแรก', src: 'kragmor', v: 80, d: 'ฆ้อนที่ตีขวานเล่มแรกของครากมอร์ หนักเกินกว่าคนธรรมดาจะยกได้ทั้งวัน',
    good: 'ทอยงานช่างตีเหล็ก +3 · ทอยพลัง +1', bad: 'ร่างกายทรุดลงเพราะยกมันทุกวัน สุขภาพลดลงปีละ 1',
    chk: { smith: 3, STR: 1 }, yr: { health: -1 } },
};
const RIDS = Object.keys(RELICS);
const relics = p => p.relics || (p.relics = []);
const hasRelic = (p, id) => relics(p).some(x => x.id === id);
const relicN = id => RELICS[id].n;
// the world remembers where lost relics lie
const RELIC_KEY = 'ash-relics';
function loadR() { try { return JSON.parse(localStorage.getItem(RELIC_KEY)) || { lost: {} }; } catch (e) { return { lost: {} }; } }
function saveR(w) { try { localStorage.setItem(RELIC_KEY, JSON.stringify(w)); } catch (e) { } }
let RW = loadR();
// a relic is free if nobody holds it and it does not lie lost somewhere
const freeRelic = (p, id) => !hasRelic(p, id) && RW.lost[id] == null && !(p.relicLost || []).some(x => x.id === id);
const lostHere = (p, rid) => RIDS.filter(id => RW.lost[id] === rid && !hasRelic(p, id));
function gainRelic(p, id, how) {
  if (hasRelic(p, id)) return '';
  relics(p).push({ id, since: p.age, how: how || 'ได้มาระหว่างทาง', gens: 1 });
  p.flags.relicsFound = (p.flags.relicsFound || 0) + 1;
  return `คุณได้ของวิเศษ: ${relicN(id)}`;
}
function loseRelic(p, id, why) {
  if (!hasRelic(p, id)) return '';
  p.relics = relics(p).filter(x => x.id !== id);
  (p.relicLost = p.relicLost || []).push({ id, realm: p.realm.id });
  return `ของวิเศษของคุณ ${relicN(id)} ${why}`;
}
// write what happened this year into the world's memory (only for the life being played)
function syncRelics(p) {
  if (!p || p.auto) return;
  let ch = false;
  for (const x of p.relicLost || []) { RW.lost[x.id] = x.realm; ch = true; }
  p.relicLost = [];
  for (const x of relics(p)) if (RW.lost[x.id] != null) { delete RW.lost[x.id]; ch = true; }
  if (ch) saveR(RW);
}

// ---- effects ----
function relicChk(p, keys) { let b = 0; for (const x of p.relics || []) { const c = RELICS[x.id].chk; if (c) for (const k of keys) if (k && c[k]) b += c[k]; } return b; }
extend('check', 'relic: relics add to dice rolls', inner => function (p, a, s, dc) {
  const b = p.relics && p.relics.length ? relicChk(p, [a, s]) : 0;
  const ok = inner(p, a, s, dc - b);
  if (b) { const c = p.checks[p.checks.length - 1]; c.dc += b; c.bonus += b; }
  return ok;
});
extend('pAtk', 'relic: relics add to attack', inner => function (p) { return inner(p) + (p.relics || []).reduce((s, x) => s + (RELICS[x.id].atk || 0), 0); });
extend('hazards', 'relic: relics change death risks', inner => function (p) {
  const H = inner(p);
  if (p.relics && p.relics.length) for (const x of p.relics) { const z = RELICS[x.id].haz; if (z) for (const h of H) if (z[h[2]]) h[1] *= z[h[2]]; }
  return H;
});
extend('famHazard', 'relic: the drowned bell takes years from family', inner => function (p, m, age) {
  const c = inner(p, m, age); if (c) return c;
  const f = (p.relics || []).reduce((s, x) => s + (RELICS[x.id].fam || 0), 0);
  return f && Math.random() < f ? inner(p, m, age) : null;
});
const theftMult = p => (p.relics || []).reduce((s, x) => Math.max(s, RELICS[x.id].theft || 1), 1);
extend('applyFocus', 'relic: yearly price of each relic; the enslaved lose them', inner => function (p) {
  let t = inner(p);
  if (!p.alive || !(p.relics || []).length) return t;
  const out = [];
  // a slave or serf owns nothing, not even this
  if (p.cls >= 3 && !p.royal) { for (const x of [...p.relics]) out.push(loseRelic(p, x.id, 'ถูกนายยึดไปพร้อมกับอิสรภาพของคุณ')); return [t, ...out].filter(Boolean).join(' · '); }
  for (const x of p.relics) {
    const R = RELICS[x.id], y = R.yr; if (!y) continue;
    if (y.happy) p.happy += y.happy;
    if (y.health) p.health += y.health;
    if (y.guilt || y.rep) addRep(p, Object.assign({}, y.rep || {}, y.guilt ? { guilt: y.guilt } : {}));
    if (y.debt) { const d = Math.min(p.wealth, y.debt * priceF(p)); if (d > 0) { p.wealth -= d; led(p, 'living', -d); } }
    if (y.curse && p.age >= 14 && Math.random() < y.curse) { const c = addCurse(p, 'thread', 'เข็มเย็บฟ้าบาดนิ้วคุณ เส้นใยสีเงินพันรอบข้อมือแล้วไม่ยอมหลุด'); if (c) out.push(c); }
    if (R.yrT && Math.random() < .12) out.push(pick(R.yrT));
  }
  return [t, ...out].filter(Boolean).join(' · ');
});

// ---- where relics come from ----
// 1) born into a house that already owns one
function birthRelics(p) {
  if (relics(p).length) return '';
  const want = p.royal ? [.6, ['royal', 'noble']] : p.cls === 0 ? [.3, ['noble']] : p.cls === 1 ? [.06, ['noble', 'aurelis', 'kragmor']] : null;
  if (!want || Math.random() >= want[0]) return '';
  const c = RIDS.filter(id => want[1].includes(RELICS[id].src) && freeRelic(p, id));
  if (!c.length) return '';
  const id = pick(c); relics(p).push({ id, since: 0, how: 'สมบัติประจำตระกูล', gens: 1 + RI(2, 9) });
  return id;
}
// 2) handed down, or lost where the last life ended
function passRelics(prev, next, parent, sib) {
  const R = prev ? (prev.relics || []) : [];
  if (prev && prev.relicLost && prev.relicLost.length) syncRelics(prev);
  if (!R.length) return;
  if ((parent || sib) && !(parent && parent.will === 'give')) {
    next.relics = R.map(x => ({ id: x.id, since: 0, how: `ตกทอดจาก${prev.name}`, gens: (x.gens || 1) + 1 }));
    next.flags.inheritedRelics = true;
  } else {
    for (const x of R) RW.lost[x.id] = prev.realm.id;
    saveR(RW);
  }
}
// 3) found on a hard road. lost relics lie where their last owner died
extend('payQuest', 'relic: quests can turn up relics, including lost ones', inner => function (p, base, txt) {
  let t = inner(p, base, txt);
  if (p.auto) return t;
  const r = questRealm(p), lost = lostHere(p, r.id);
  const fresh = RIDS.filter(id => RELICS[id].src === r.id && freeRelic(p, id));
  if (lost.length && Math.random() < .25) { const id = pick(lost); t += ` · ระหว่างทางคุณเจอ${relicN(id)} ที่ใครบางคนทำหายไว้ในชีวิตก่อน · ` + gainRelic(p, id, `พบที่${r.short}`); }
  else if (fresh.length && Math.random() < base / 160) { const id = pick(fresh); t += ` · ` + gainRelic(p, id, `พบที่${r.short}`) + ` (${RELICS[id].d})`; }
  return t;
});
// the sky thread quest can give the needle
const _skyBuild = QBY.skythread.build;
QBY.skythread.build = p => { const b = _skyBuild(p); const o = b.options[0], act = o.act; o.act = q => { let t = act(q); if (/^เส้นใยสงบลง/.test(t) && freeRelic(q, 'needle') && Math.random() < .25) t += ' · ในกองเส้นใยมีเข็มเงินเล่มหนึ่งปักอยู่ · ' + gainRelic(q, 'needle', 'พบบนยอดเขา'); return t; }; return b; };

// ---- what relics bring into your life ----
const topRelic = p => [...relics(p)].sort((a, b) => RELICS[b.id].v - RELICS[a.id].v)[0];
const relicPrice = (p, id) => Math.round(RELICS[id].v * (p.realm.wealth / 50 + .4) * 10) / 10;
CHOICES.push(
  { id: 'relicThief', repeat: 6, when: p => !p.auto && relics(p).length && p.age >= 14 && roll(.04 * theftMult(p)),
    prompt: p => { const x = topRelic(p); p.kin.relic = x.id; return `อายุ ${p.age} ปี กลางดึกคุณได้ยินเสียงคนงัดหน้าต่าง มีคนมาเอา${relicN(x.id)}`; },
    options: p => [
      fightOpt('ออกไปสู้', 'bandit', { lethal: .12, intro: 'ขโมยชักมีดออกมาทันทีที่เห็นคุณ', death: 'ถูกขโมยที่มาเอาของวิเศษแทงเสียชีวิต',
        onEnd: (q, r) => r === 'win' ? `ขโมยวิ่งหนีไปมือเปล่า ${relicN(q.kin.relic)}ยังอยู่กับคุณ` : r === 'dead' ? '' : loseRelic(q, q.kin.relic, 'ถูกขโมยไปในคืนนั้น') }),
      Object.assign(opt('รีบเอาไปซ่อน', q => check(q, 'DEX', 'stealth', 13) ? `คุณซ่อนมันไว้ใต้พื้นทันเวลา ขโมยรื้อบ้านจนเละแต่หาไม่เจอ` : loseRelic(q, q.kin.relic, 'ถูกขโมยไป เพราะคุณซ่อนไม่ทัน')), { chk: ['DEX', 'stealth'] }),
      opt('ปล่อยให้เอาไป', q => { q.happy -= 4; return loseRelic(q, q.kin.relic, 'ถูกขโมยไป คุณนอนนิ่งฟังเสียงฝีเท้าเดินจากไป อย่างน้อยก็ยังมีชีวิตอยู่'); }),
    ] },
  { id: 'relicBuyer', repeat: 3, when: p => !p.auto && relics(p).length && p.age >= 18 && roll(.05),
    prompt: p => { const x = topRelic(p); p.kin.relic = x.id; p.kin.relicOffer = Math.round(relicPrice(p, x.id) * 1.4 * 10) / 10; return `อายุ ${p.age} ปี นักสะสมจากออเรลิสขอซื้อ${relicN(x.id)}ของคุณ เขาให้ราคา ${money(p.kin.relicOffer)} ซึ่งสูงกว่าที่ใครเคยเสนอ`; },
    options: p => [
      opt('ขายให้เขา', q => { const v = q.kin.relicOffer; q.wealth += v; led(q, 'sales', v); return loseRelic(q, q.kin.relic, `ตกเป็นของนักสะสม คุณได้เงิน ${money(v)}`); }),
      opt('ไม่ขาย', q => `คุณปฏิเสธ นักสะสมยิ้มแล้วบอกว่าเขาจะรอ`),
    ] },
  { id: 'relicPeddler', repeat: 2, when: p => !p.auto && p.age >= 16 && relics(p).length < 3 && roll(.025) && RIDS.some(id => RELICS[id].src !== 'royal' && RELICS[id].src !== 'thread' && freeRelic(p, id)),
    prompt: p => { const id = pick(RIDS.filter(id => RELICS[id].src !== 'royal' && RELICS[id].src !== 'thread' && freeRelic(p, id))); p.kin.relic = id; p.kin.relicCost = Math.round(relicPrice(p, id) * .5 * 10) / 10; p.kin.relicFake = Math.random() < .4;
      return `อายุ ${p.age} ปี พ่อค้าเร่หน้าตาเจ้าเล่ห์คนหนึ่งอ้างว่ามี${relicN(id)}ของแท้ ขายให้ในราคา ${money(p.kin.relicCost)} ของแบบนี้มีปลอมเยอะ`; },
    options: p => [
      opt('ซื้อเลย', q => { q.wealth -= q.kin.relicCost; led(q, 'buy', -q.kin.relicCost); return q.kin.relicFake ? `กลับถึงบ้านคุณถึงรู้ว่ามันเป็นของปลอม พ่อค้าหายไปจากเมืองแล้ว` : gainRelic(q, q.kin.relic, 'ซื้อจากพ่อค้าเร่'); }, q => q.wealth >= q.kin.relicCost, `ต้องมี ${money(p.kin.relicCost)}`),
      Object.assign(opt('ตรวจดูให้ละเอียดก่อน', q => {
        if (!check(q, 'INT', 'history', 13)) { q.wealth -= q.kin.relicCost; led(q, 'buy', -q.kin.relicCost); return q.kin.relicFake ? 'คุณดูไม่ออก ซื้อมาแล้วถึงรู้ว่าเป็นของปลอม' : 'คุณดูไม่ออก แต่ตัดสินใจซื้อ โชคดีที่มันเป็นของจริง · ' + gainRelic(q, q.kin.relic, 'ซื้อจากพ่อค้าเร่'); }
        if (q.kin.relicFake) return 'คุณเห็นรอยต่อที่ไม่ควรมี มันเป็นของปลอม คุณวางมันลงแล้วเดินจากมา';
        q.wealth -= q.kin.relicCost; led(q, 'buy', -q.kin.relicCost); return 'ทุกรายละเอียดตรงกับที่ตำราเขียนไว้ มันเป็นของจริง · ' + gainRelic(q, q.kin.relic, 'ซื้อจากพ่อค้าเร่');
      }, q => q.wealth >= q.kin.relicCost, `ต้องมี ${money(p.kin.relicCost)}`), { chk: ['INT', 'history'] }),
      opt('ไม่สนใจ', () => 'คุณเดินผ่านไป'),
    ] },
);
// selling on your own
function sellRelic(p, id) {
  if (!hasRelic(p, id) || p.cls >= 3) return null;
  const v = relicPrice(p, id); p.wealth += v; led(p, 'sales', v);
  return loseRelic(p, id, `ถูกขายให้นักสะสมที่${p.realm.short} ได้เงิน ${money(v)}`);
}
LEGENDS.push(
  { id: 'heirloom', n: 'ผู้รักษามรดก', d: 'ถือของวิเศษที่ตกทอดมาในตระกูลของคุณ 3 รุ่นขึ้นไป', c: p => relics(p).some(x => (x.gens || 1) >= 3 && /ตกทอด/.test(x.how)) },
  { id: 'relichunter', n: 'นักล่าของวิเศษ', d: 'พบหรือได้ของวิเศษ 2 ชิ้นในชีวิตเดียว', c: p => (p.flags.relicsFound || 0) >= 2 },
);

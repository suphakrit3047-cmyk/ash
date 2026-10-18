// ===== THREADS: people who come back =====
// each thread is a few choices spread across a life. what you chose before decides what comes back to you.
const npc = (p, k) => (p.npc = p.npc || {})[k];
function meet(p, k, o) { const pr = p.realm; const n = { name: newName(p, pr), sex: Math.random() < .5 ? 'ญ' : 'ช', met: p.age, realm: pr.id, ...o }; (p.npc = p.npc || {})[k] = n; return n; }
const he = n => n.sex === 'ญ' ? 'เธอ' : 'เขา';
const coin = (p, v) => Math.round(v * qF(p.realm) * 10) / 10;
function pay(p, v) { p.wealth += v; led(p, v >= 0 ? 'sales' : 'buy', v); }
function skillXP(p, s, n) {
  if (!p.skills || !p.skills[s]) return '';
  const sk = p.skills[s]; if (sk.r >= MAX_RANK) return '';
  sk.x += n; if (sk.x >= 100) { sk.x -= 100; sk.r++; gainXP(p, 10); return ` · ฝีมือ${SBY[s].n}ของคุณเพิ่มขึ้นเป็นขั้น ${sk.r}`; }
  return '';
}
const since = (p, n, k) => n && n[k] != null && p.age - n[k];
const thr = (o) => Object.assign({ repeat: 1 }, o);

CHOICES.push(
  // ---------- 1) the childhood friend ----------
  thr({ id: 'fr1', when: p => p.age >= 6 && p.age <= 10 && !npc(p, 'friend') && roll(.3),
    prompt: p => { const n = meet(p, 'friend'); return `อายุ ${p.age} ปี มีเด็ก${n.sex === 'ญ' ? 'ผู้หญิง' : 'ผู้ชาย'}ตัวผอมแห้งชื่อ${n.name}นั่งจ้องห่อข้าวของคุณตาไม่กะพริบ ปากไม่ได้ขอ แต่ท้องร้องดังจนได้ยิน`; },
    options: p => [
      opt('แบ่งข้าวให้ครึ่งหนึ่ง', q => { npc(q, 'friend').bond = 2; q.happy += 4; return `${npc(q, 'friend').name}กินเกลี้ยงในสามคำ แล้วก็ยิ้มออกมาเป็นครั้งแรก ตั้งแต่วันนั้นสองคนก็ตัวติดกันเป็นปาท่องโก๋`; }),
      opt('ชวนไปเล่นด้วยกัน แต่เก็บข้าวไว้กินเอง', q => { npc(q, 'friend').bond = 1; return `${npc(q, 'friend').name}เล่นด้วยทั้งบ่าย แต่ตาก็ยังแอบชำเลืองไปที่ห่อข้าวอยู่ดี`; }),
      opt('ไล่ไปให้พ้น', q => { npc(q, 'friend').bond = 0; q.happy -= 1; return `${npc(q, 'friend').name}ลุกเดินไปเงียบๆ หลังจากวันนั้นก็ไม่เห็นหน้ากันอีกเลย`; }),
    ] }),
  thr({ id: 'fr2', when: p => { const n = npc(p, 'friend'); return n && n.bond >= 1 && p.age >= 16 && p.age <= 26 && roll(.3); },
    prompt: p => { const n = npc(p, 'friend'); n.ask = coin(p, 6); return `อายุ ${p.age} ปี ${n.name}เพื่อนเก่ามาเคาะประตูกลางดึก บอกว่าจะไปตายเอาดาบหน้าที่ออเรลิส ขอยืม ${money(n.ask)} เป็นค่าเดินทาง สาบานว่าได้ดีเมื่อไหร่จะกลับมาใช้คืน`; },
    options: p => [
      opt('ให้ยืม', q => { const n = npc(q, 'friend'); pay(q, -n.ask); n.lent = q.age; n.bond++; return `${n.name}กอดคุณแน่นจนหายใจไม่ออก รุ่งเช้าก็ออกเดินทาง`; }, q => q.wealth >= npc(q, 'friend').ask, 'ต้องมีเงินพอให้ยืม'),
      opt('ไม่ให้ แต่บอกว่าจะรอข่าว', q => { const n = npc(q, 'friend'); n.left = q.age; return `${n.name}พยักหน้าว่าเข้าใจ แล้วก็ไปทั้งที่มีเงินติดตัวไม่กี่เหรียญ`; }),
      opt('ขอให้อยู่ต่อที่นี่', q => { const n = npc(q, 'friend'); if (check(q, 'CHA', 'speech', 11)) { n.stayed = q.age; n.bond++; return `คุยกันจนฟ้าสาง สุดท้าย${n.name}ก็ใจอ่อน ยอมอยู่ต่อ แล้วหางานทำแถวบ้าน`; } n.left = q.age; return `${n.name}ฟังจนจบ แล้วบอกว่าถ้าไม่ไปตอนนี้ ชาตินี้ก็คงไม่ได้ไป`; }),
    ] }),
  thr({ id: 'fr3', when: p => { const n = npc(p, 'friend'); return n && (n.lent || n.left || n.stayed) && p.age >= 32 && p.age <= 50 && roll(.25); },
    prompt: p => { const n = npc(p, 'friend'); n.rich = n.lent ? Math.random() < .55 : n.left ? Math.random() < .3 : false;
      if (n.stayed) return `อายุ ${p.age} ปี ปีนี้ข้าวยากหมากแพง ${n.name}แบกข้าวมาครึ่งกระสอบ วางไว้หน้าประตูบ้าน บอกว่าเอาไปกินก่อน ค่อยว่ากัน`;
      return n.rich ? `อายุ ${p.age} ปี มีรถม้ามาจอดหน้าบ้าน ${n.name}ก้าวลงมาในชุดผ้าเนื้อดี ไปได้ดีที่ออเรลิส แล้วก็กลับมาตามสัญญาจริงๆ` : `อายุ ${p.age} ปี มีคนเนื้อตัวมอมแมมมายืนอยู่หน้าบ้าน จำไม่ได้จนกระทั่งเขาเรียกชื่อเล่นสมัยเด็ก ${n.name}กลับมาจากออเรลิสตัวเปล่า ผอมจนเห็นซี่โครง`; },
    options: p => { const n = npc(p, 'friend');
      if (n.stayed) return [opt('รับไว้ แล้วสัญญาว่าจะใช้คืน', q => { const n = npc(q, 'friend'); q.happy += 6; pay(q, coin(q, 3)); return 'ปีนั้นสองบ้านก็ประทังกันมาได้ด้วยข้าวกระสอบเดียว'; }), opt('ปฏิเสธ บอกว่ายังไหว', q => { const n = npc(q, 'friend'); q.happy += 2; return `${n.name}ไม่ฟัง วางกระสอบทิ้งไว้หน้าประตูแล้วก็เดินกลับ`; })];
      if (n.rich) return [opt('ต้อนรับเหมือนไม่เคยจากกัน', q => { const n = npc(q, 'friend'); const g = coin(q, n.lent ? 18 : 8); pay(q, g); q.happy += 10; n.done = true; return `${n.name}คืนเงินให้ ${money(g)} มากกว่าที่ยืมไปหลายเท่า แล้วนั่งเล่าเรื่องในเมืองหลวงจนไก่ขัน`; })];
      return [
        opt('ให้มาอยู่ด้วยจนกว่าจะตั้งตัวได้', q => { const n = npc(q, 'friend'); pay(q, -coin(q, 4)); q.happy += 4; addRep(q, { folk: 3, guilt: -3 }); n.saved = true; return `${n.name}อยู่ด้วยปีหนึ่ง ช่วยทำงานบ้านงานไร่ไม่ต้องให้ใครสั่ง พอตั้งตัวได้ก็ย้ายออกไป`; }, q => q.wealth >= coin(q, 4), 'ต้องมีเงินพอเลี้ยงอีกคน'),
        opt('ให้เงินติดตัวไปแล้วบอกลา', q => { const n = npc(q, 'friend'); pay(q, -coin(q, 1.5)); return `${n.name}รับเงินไป ก้มหน้า ไม่กล้าสบตา`; }, q => q.wealth >= coin(q, 1.5), 'ต้องมีเงินติดตัว'),
        opt('ทำเป็นจำไม่ได้', q => { const n = npc(q, 'friend'); addRep(q, { guilt: 6 }); n.bond = 0; return 'คุณปิดประตูใส่ แล้วยืนพิงประตูอยู่นาน'; }),
      ]; } }),
  thr({ id: 'fr4', when: p => { const n = npc(p, 'friend'); return n && n.bond >= 2 && p.age >= 55 && roll(.25); },
    prompt: p => `อายุ ${p.age} ปี มีคนมาบอกว่า${npc(p, 'friend').name}ป่วยหนัก นอนรอวันตายอยู่ที่บ้าน แล้วก็ถามหาคุณ`,
    options: p => [
      opt('ไปหาทันที', q => { q.happy += 3; addRep(q, { guilt: -4 }); return `คุณนั่งเฝ้า${npc(q, 'friend').name}ทั้งคืน คุยกันเรื่องห่อข้าวเมื่อห้าสิบปีก่อน ตกเช้า${npc(q, 'friend').name}ก็จากไปทั้งที่ยังยิ้มอยู่`; }),
      opt('ส่งจดหมายไปแทน', q => { q.happy -= 2; return 'จดหมายไปถึงช้าไปวันเดียว'; }),
    ] }),

  // ---------- 2) the rival ----------
  thr({ id: 'rv1', when: p => p.age >= 9 && p.age <= 14 && !npc(p, 'rival') && roll(.25),
    prompt: p => { const n = meet(p, 'rival', { sex: p.sex }); return `อายุ ${p.age} ปี ${n.name}เด็กตัวโตในละแวกกระชากของไปจากมือคุณต่อหน้าเพื่อนๆ แล้วหัวเราะเยาะ`; },
    options: p => [
      Object.assign(opt('สู้กลับ', q => { const n = npc(q, 'rival'); if (check(q, 'STR', null, 12)) { n.won = 1; q.happy += 4; return `คุณผลัก${n.name}ล้มคะมำลงไปในโคลน ไม่มีใครกล้าหัวเราะต่อหน้า แต่${n.name}ก็จำวันนี้ไว้ไม่ลืม`; } n.won = -1; q.health -= 4; q.happy -= 4; return `${n.name}ต่อยเข้าที่จมูกจนเลือดกำเดาไหล แล้วก็เดินถือของของคุณไปหน้าตาเฉย`; }), { chk: ['STR', null] }),
      opt('ฟ้องผู้ใหญ่', q => { const n = npc(q, 'rival'); n.won = 0; return `ผู้ใหญ่ดุ${n.name}ไปที แต่หลังจากนั้นเด็กทั้งละแวกก็เรียกคุณว่าไอ้ขี้ฟ้อง`; }),
      opt('ปล่อยไป', q => { npc(q, 'rival').won = -1; q.happy -= 2; return 'คุณเดินกลับบ้านมือเปล่า แล้วไปแอบร้องไห้หลังบ้านคนเดียว'; }),
    ] }),
  thr({ id: 'rv2', when: p => { const n = npc(p, 'rival'); return n && p.age >= 18 && p.age <= 32 && p.focus === 'work' && roll(.25); },
    prompt: p => `อายุ ${p.age} ปี ${npc(p, 'rival').name}คนเดิมมาสมัครงานตำแหน่งเดียวกับที่คุณเล็งไว้ ฝีมือสู้คุณไม่ได้ แต่เส้นใหญ่กว่า`,
    options: p => [
      Object.assign(opt('แข่งอย่างยุติธรรม', q => { const n = npc(q, 'rival'); if (check(q, 'INT', 'speech', 13)) { n.won2 = 1; q.careerYears = (q.careerYears || 0) + 2; q.happy += 5; return `คนจ้างเลือกคุณ ${n.name}ยิ้มแสดงความยินดี แต่สายตาไม่ได้ยิ้มด้วย`; } n.won2 = -1; q.happy -= 5; return `${n.name}ได้ตำแหน่งไป ทีหลังถึงรู้ว่าคนเซ็นรับเข้าทำงานคือลุงของ${n.name}เอง`; }), { chk: ['INT', 'speech'] }),
      Object.assign(opt('ปล่อยข่าวลือเรื่องเขา', q => { const n = npc(q, 'rival'); addRep(q, { guilt: 8, under: 1 }); if (check(q, 'CHA', 'speech', 11)) { n.won2 = 2; q.careerYears = (q.careerYears || 0) + 2; return `ข่าวลือไปถึงหูคนจ้างก่อนวันตัดสิน ${n.name}ชวดงานนี้ แล้วก็ไม่มีใครรับเข้าทำงานอีกทั้งปี`; } n.won2 = -2; addRep(q, { folk: -5 }); return 'ข่าวลือย้อนกลับมาเข้าตัว ใครๆ ก็รู้ว่าคุณเป็นคนปล่อย'; }), { chk: ['CHA', 'speech'] }),
      opt('ถอนตัว', q => { npc(q, 'rival').won2 = -1; return 'คุณถอนตัว แล้วปลอบใจตัวเองว่ายังไม่ถึงเวลา'; }),
    ] }),
  thr({ id: 'rv3', when: p => { const n = npc(p, 'rival'); return n && n.won2 != null && p.age >= 36 && p.age <= 55 && roll(.25); },
    prompt: p => { const n = npc(p, 'rival'); return n.won2 > 0 ? `อายุ ${p.age} ปี ${n.name}คู่ปรับเก่ามายืนขอทานอยู่หน้าบ้าน พอจำได้ว่าเป็นบ้านใครก็ก้มหน้างุด` : `อายุ ${p.age} ปี ${n.name}ตอนนี้เป็นคนใหญ่คนโตไปแล้ว ส่งคนมาบอกว่าถ้ายอมมาทำงานให้ จะจ่ายสองเท่าของที่อื่น`; },
    options: p => { const n = npc(p, 'rival');
      if (n.won2 > 0) return [
        opt('ให้งานทำ', q => { const n = npc(q, 'rival'); addRep(q, { folk: 4, guilt: n.won2 === 2 ? -8 : -2 }); q.happy += 5; n.peace = true; return `${n.name}ทำงานให้เงียบๆ อยู่หลายปี จนวันหนึ่งก็โพล่งขึ้นมาว่า เรื่องตอนเด็ก ขอโทษนะ`; }),
        opt('ให้เงินแล้วไล่ไป', q => { const n = npc(q, 'rival'); pay(q, -coin(q, 1)); return `${n.name}รับเงินแล้วเดินจากไปโดยไม่พูดอะไร`; }),
        opt('ปิดประตูใส่', q => { const n = npc(q, 'rival'); addRep(q, { guilt: 2 }); return 'คุณปิดประตูใส่ รอให้รู้สึกสะใจ แต่มันก็ไม่มา'; }),
      ];
      return [
        opt('ยอมทำงานให้', q => { const n = npc(q, 'rival'); pay(q, coin(q, 10)); q.happy -= 4; addRep(q, { noble: 2 }); return `เงินดีจริงอย่างว่า แต่เวลา${n.name}เรียกใช้คุณต่อหน้าคนอื่น น้ำเสียงก็ไม่ต่างจากเรียกหมา`; }),
        opt('ปฏิเสธ', q => { const n = npc(q, 'rival'); q.happy += 3; return 'คุณบอกคนส่งข่าวว่าไม่ว่าง แล้วกลับไปทำงานของตัวเองต่อ จนกว่าแต่ไม่ต้องก้มหัวให้ใคร'; }),
      ]; } }),
  thr({ id: 'rv4', when: p => { const n = npc(p, 'rival'); return n && n.won2 != null && p.age >= 60 && roll(.2); },
    prompt: p => `อายุ ${p.age} ปี มีข่าวว่า${npc(p, 'rival').name}ตายแล้ว ญาติส่งคนมาเชิญไปงานศพ`,
    options: p => [
      opt('ไปร่วมงาน', q => { q.happy += 2; return npc(q, 'rival').peace ? 'คุณยืนหน้าโลงนานกว่าที่ตั้งใจ คนที่ทะเลาะกันมาตั้งแต่เด็กไม่อยู่ให้ทะเลาะแล้ว' : 'คุณยืนอยู่ท้ายแถว ไม่ได้ร้องไห้ แต่ก็ไม่ได้ดีใจอย่างที่เคยนึกไว้'; }),
      opt('ไม่ไป', () => 'คุณรินเหล้าให้เขาหนึ่งจอก แล้วนั่งดื่มอยู่คนเดียวที่บ้าน'),
    ] }),

  // ---------- 3) the mentor ----------
  thr({ id: 'mt1', when: p => p.age >= 11 && p.age <= 18 && p.cls >= 1 && p.cls <= 3 && !npc(p, 'mentor') && roll(.22),
    prompt: p => { const sk = has(p, 'kragmor') ? 'smith' : has(p, 'dunes', 'grieve') ? 'survival' : has(p, 'mulvane') ? 'medicine' : p.cls <= 1 ? 'letters' : pick(['smith', 'medicine', 'letters', 'survival', 'trade']); const n = meet(p, 'mentor', { skill: sk }); n.name = 'ตา' + n.name; n.sex = 'ช';
      return `อายุ ${p.age} ปี ${n.name} ตาแก่ที่ใครๆ ก็ว่าเคยเป็นยอดฝีมือด้าน${SBY[sk].n} ยืนดูคุณทำงานอยู่นาน แล้วพูดขึ้นมาว่า อยากเรียนก็มาหาข้าพรุ่งนี้ตอนไก่ขัน ไม่เอาเงิน`; },
    options: p => [
      opt('ไปตามนัด', q => { const n = npc(q, 'mentor'); n.taught = q.age; q.happy += 3; return `${n.name}ดุกว่าที่คิดไว้มาก แต่ก็สอนให้หมดไม่มีกั๊ก` + skillXP(q, n.skill, 70); }),
      opt('ไม่ไป', q => { npc(q, 'mentor').no = true; return 'คุณมีงานต้องทำ แล้วก็ไม่เชื่อว่าของฟรีมีในโลก'; }),
    ] }),
  thr({ id: 'mt2', when: p => { const n = npc(p, 'mentor'); return n && n.taught != null && since(p, n, 'taught') >= 5 && roll(.3); },
    prompt: p => `อายุ ${p.age} ปี ${npc(p, 'mentor').name}ล้มป่วย ไม่มีลูกไม่มีหลาน ไม่มีใครดูแล`,
    options: p => [
      opt('รับมาดูแลที่บ้าน', q => { const n = npc(q, 'mentor'); pay(q, -coin(q, 3)); n.cared = true; q.happy += 3; addRep(q, { folk: 3, guilt: -3 }); return `คุณดูแล${n.name}จนวันสุดท้าย ทั้งที่นอนติดเตียงก็ยังบ่นว่าคุณจับเครื่องมือผิดอยู่ทุกวัน`; }, q => q.wealth >= coin(q, 3), 'ต้องมีเงินพอดูแล'),
      opt('ส่งเงินไปช่วยค่าหมอ', q => { pay(q, -coin(q, 1.5)); npc(q, 'mentor').sent = true; return 'เงินช่วยเรื่องค่าหมอได้ แต่ช่วยให้หายเหงาไม่ได้'; }, q => q.wealth >= coin(q, 1.5), 'ต้องมีเงินส่ง'),
      opt('ไม่มีเวลา', q => { addRep(q, { guilt: 5 }); return `${npc(q, 'mentor').name}ตายอยู่คนเดียว ไม่มีใครไปเยี่ยมสักคน`; }),
    ] }),
  thr({ id: 'mt3', when: p => { const n = npc(p, 'mentor'); return n && (n.cared || n.sent) && roll(.5); },
    prompt: p => `อายุ ${p.age} ปี ${npc(p, 'mentor').name}จากไปแล้ว ก่อนตายสั่งเสียไว้ว่าให้ยกของในโรงงานทั้งหมดให้คุณ`,
    options: p => [
      opt('รับไว้', q => { const n = npc(q, 'mentor'); pay(q, coin(q, n.cared ? 6 : 2)); return `ในหีบมีเครื่องมือที่ด้ามสึกเป็นรอยมือของแก กับสมุดเล่มหนึ่งที่จดเคล็ดลับไว้ทุกอย่าง` + skillXP(q, n.skill, n.cared ? 100 : 40); }),
    ] }),

  // ---------- 4) the first love ----------
  thr({ id: 'lv1', when: p => p.age >= 15 && p.age <= 19 && !p.married && !npc(p, 'love') && roll(.3),
    prompt: p => { const n = meet(p, 'love', { sex: p.sex === 'ญ' ? 'ช' : 'ญ', cls: Math.max(0, Math.min(4, p.cls + pick([-1, 0, 0, 1]))) }); return `อายุ ${p.age} ปี คุณเจอ${n.name}ที่${pick(['บ่อน้ำ', 'งานวัด', 'ตลาด', 'ริมแม่น้ำ'])} เป็นลูกของ${CLASS_OF[n.cls]} พอ${n.name}หัวเราะทีไร คุณก็ลืมทุกทีว่าจะพูดอะไร`; },
    options: p => [
      Object.assign(opt('บอกความในใจ', q => { const n = npc(q, 'love'); if (check(q, 'CHA', null, 11)) { n.together = q.age; q.happy += 10; return `${n.name}หน้าแดงไปถึงใบหู แล้วตอบเบาๆ ว่ารอให้พูดมาตั้งนานแล้ว`; } n.refused = true; q.happy -= 6; return `${n.name}ยิ้มให้ แล้วบอกว่าคิดกับคุณแค่เพื่อน`; }), { chk: ['CHA', null] }),
      opt('เก็บไว้ในใจ', q => { npc(q, 'love').silent = true; return `คุณได้แต่มอง${npc(q, 'love').name}อยู่ห่างๆ ทั้งฤดู สุดท้ายก็ไม่ได้พูดสักคำ`; }),
    ] }),
  thr({ id: 'lv2', when: p => { const n = npc(p, 'love'); return n && n.together != null && !p.married && since(p, n, 'together') >= 1 && p.age <= 26 && roll(.4); },
    prompt: p => { const n = npc(p, 'love'); return n.cls < p.cls ? `อายุ ${p.age} ปี ทางบ้านของ${n.name}รู้เรื่องของสองคนแล้ว ไม่ถึงเดือนก็จับหมั้นกับลูกตระกูลที่ฐานะดีกว่า ${n.name}แอบมาหาคุณกลางดึก ตาบวมเป่ง` : `อายุ ${p.age} ปี ${n.name}ถามตรงๆ ว่าตกลงจะแต่งกันเมื่อไหร่`; },
    options: p => { const n = npc(p, 'love');
      const wed = opt(n.cls < p.cls ? 'พาหนีไปด้วยกัน' : 'แต่งงานกัน', q => { const n = npc(q, 'love'); q.married = true; q.kin.spouse = n.name; q.happy += 14; n.wed = true; if (n.cls < q.cls) { addRep(q, { noble: -6 }); q.flags.eloped = true; return `สองคนหนีออกจากหมู่บ้านตั้งแต่ฟ้ายังไม่สาง มีแต่ตัวกับหัวใจ`; } return `งานแต่งเล็กๆ คนทั้งละแวกมาช่วยงาน ${n.name}ร้องไห้ตั้งแต่ต้นงานยันเลิกงาน`; });
      return [wed, opt(n.cls < p.cls ? `ปล่อยให้${he(n)}ไปตามทางของครอบครัว` : 'ขอเวลาอีกหน่อย', q => { const n = npc(q, 'love'); n.lost = q.age; q.happy -= 10; return n.cls < q.cls ? `วันแต่งงานของ${n.name} คุณไปยืนดูขบวนอยู่ท้ายฝูงคน ไม่รู้ว่า${n.name}หันมามองหรือเปล่า เพราะน้ำตามันบังหมด` : `${n.name}รออยู่อีกปีหนึ่ง แล้วก็เลิกรอ`; })]; } }),
  thr({ id: 'lv3', when: p => { const n = npc(p, 'love'); return n && !n.wed && (n.lost != null || n.silent || n.refused) && p.age >= 40 && p.age <= 60 && roll(.2); },
    prompt: p => `อายุ ${p.age} ปี คุณเจอ${npc(p, 'love').name}อีกครั้งที่ตลาด ห่างจากครั้งก่อนเกือบยี่สิบห้าปี ตอนนี้${pick(['เป็นม่ายแล้ว', 'ผมขาวไปครึ่งหัว', 'ยังหัวเราะเหมือนเดิมไม่มีผิด'])} แล้วก็จำคุณได้ในทันที`,
    options: p => [
      opt('ชวนไปนั่งคุยกัน', q => { q.happy += 8; return `สองคนนั่งคุยกันจนร้านปิด เรื่องที่ค้างคาใจมายี่สิบห้าปีค่อยๆ พรั่งพรูออกมาทีละเรื่อง`; }),
      Object.assign(opt('ขอให้มาอยู่ด้วยกันในบั้นปลาย', q => { const n = npc(q, 'love'); n.wed = true; q.married = true; q.kin.spouse = n.name; q.happy += 15; return `${n.name}หัวเราะทั้งน้ำตา บอกว่านึกว่าจะไม่ถามซะแล้ว`; }, q => !q.married, 'คุณแต่งงานอยู่แล้ว'), {}),
      opt('ทักทายแล้วเดินผ่านไป', q => { q.happy -= 2; return 'บางเรื่องปล่อยให้จบไปแบบนั้นก็ดีแล้ว'; }),
    ] }),

  // ---------- 5) the stranger on the road ----------
  thr({ id: 'st1', when: p => p.age >= 15 && p.age <= 40 && p.cls <= 3 && !npc(p, 'stranger') && roll(.18),
    prompt: p => { const n = meet(p, 'stranger'); return `อายุ ${p.age} ปี คุณเจอคนแปลกหน้านอนบาดเจ็บอยู่ข้างทาง แต่งตัวดี แต่เลือดโชกทั้งตัว ถุงเงินยังห้อยอยู่ที่เอว`; },
    options: p => [
      opt('พาไปหาหมอ ออกค่ารักษาให้', q => { const n = npc(q, 'stranger'); pay(q, -Math.min(q.wealth, coin(q, 2))); n.helped = q.age; addRep(q, { folk: 2, guilt: -4 }); return `ตกเช้า${n.name}ก็ฟื้น ถามชื่อคุณ แล้วจดไว้ในสมุดเล่มเล็ก`; }),
      opt('เอาถุงเงินไป', q => { const n = npc(q, 'stranger'); pay(q, coin(q, 5)); n.robbed = q.age; addRep(q, { guilt: 10, under: 2 }); return `ตอนที่คุณแกะถุงเงิน เขาลืมตาขึ้นมาครึ่งหนึ่ง แล้วก็หมดสติไปอีก`; }),
      opt('เดินผ่านไป', q => { npc(q, 'stranger').passed = true; return 'คุณบอกตัวเองว่าเดี๋ยวก็มีคนอื่นมาช่วย'; }),
    ] }),
  thr({ id: 'st2', when: p => { const n = npc(p, 'stranger'); return n && (n.helped != null || n.robbed != null) && p.age - (n.helped ?? n.robbed) >= 8 && roll(.25); },
    prompt: p => { const n = npc(p, 'stranger'); return n.helped != null ? `อายุ ${p.age} ปี คนส่งสารของราชสำนักมาเคาะประตู ${n.name}ที่คุณเคยช่วยไว้ข้างทาง ตอนนี้ได้เป็นผู้พิพากษา และยังจำบุญคุณได้` : `อายุ ${p.age} ปี คุณโดนเรียกตัวขึ้นศาลด้วยเรื่องเล็กๆ ผู้พิพากษาเงยหน้าขึ้นมา คือคนที่คุณเคยขโมยถุงเงินไปเมื่อหลายปีก่อน`; },
    options: p => { const n = npc(p, 'stranger');
      if (n.helped != null) return [opt('ไปพบ', q => { const n = npc(q, 'stranger');
        if (q.cls >= 3) { q.cls = 2; q.flags.freedByFriend = true; q.happy += 20; return `${n.name}จ่ายค่าไถ่ตัวให้ครบ แล้วยื่นหนังสือปลดทาสให้กับมือ`; }
        if (q.loan) { q.loan = null; q.happy += 10; return `${n.name}รู้เรื่องหนี้ของคุณ เลยใช้หนี้ให้หมดโดยไม่ถามสักคำ`; }
        const g = coin(q, 12); pay(q, g); addRep(q, { noble: 5 }); q.happy += 8; return `${n.name}ให้เงินมา ${money(g)} แล้วยังพาไปแนะนำตัวกับขุนนางอีกหลายคน`; })];
      return [
        Object.assign(opt('ขอโทษและสารภาพ', q => { const n = npc(q, 'stranger'); if (check(q, 'CHA', 'speech', 12)) { addRep(q, { guilt: -8 }); return `${n.name}มองหน้าคุณอยู่นาน แล้วสั่งยกฟ้อง บอกว่าคนที่ยอมรับผิดยังพอกลับตัวได้`; } pay(q, -Math.min(q.wealth, coin(q, 8))); q.health -= 6; return 'ศาลสั่งปรับหนัก แถมเฆี่ยนอีกสิบที'; }), { chk: ['CHA', 'speech'] }),
        opt('ทำเป็นไม่รู้จัก', q => { const n = npc(q, 'stranger'); pay(q, -Math.min(q.wealth, coin(q, 5))); q.health -= 8; addRep(q, { guilt: 3 }); return `${n.name}ไม่พูดถึงเรื่องเก่าสักคำ แต่โทษที่ตัดสินออกมาหนักเกินเหตุไปหลายเท่า`; }),
      ]; } }),

  // ---------- 6) an animal that chooses you ----------
  thr({ id: 'pt1', when: p => p.age >= 5 && p.age <= 35 && !npc(p, 'pet') && roll(.15),
    prompt: p => { const kind = has(p, 'dunes') ? 'จิ้งจอกทราย' : has(p, 'kragmor') ? 'กิ้งก่าถ้ำ' : has(p, 'mulvane') ? 'นกกระสาขาเจ็บ' : has(p, 'serenth') ? 'แมวขนสีเงิน' : 'หมาจรขาเป๋'; const n = meet(p, 'pet', { kind }); n.name = pick(['เถ้า', 'ถ่าน', 'ฝุ่น', 'หมอก', 'ดาว', 'ขี้เกียจ', 'เจ้าโง่']); return `อายุ ${p.age} ปี ${kind}ตัวหนึ่งเดินตามคุณกลับบ้านมาสามวันติดแล้ว วันนี้มานอนรออยู่หน้าประตู`; },
    options: p => [
      opt('รับเลี้ยง ตั้งชื่อให้', q => { const n = npc(q, 'pet'); n.kept = q.age; q.happy += 6; return `คุณตั้งชื่อให้ว่า${n.name} ตัวแค่นั้นแต่กินจุอย่างกับอะไรดี`; }),
      opt('ไล่ไป', q => { npc(q, 'pet').no = true; return 'มันค่อยๆ เดินจากไป แล้วหันกลับมามองอีกสองที'; }),
    ] }),
  thr({ id: 'pt2', when: p => { const n = npc(p, 'pet'); return n && n.kept != null && since(p, n, 'kept') >= 2 && roll(.3); },
    prompt: p => `อายุ ${p.age} ปี กลางดึก${npc(p, 'pet').name}${npc(p, 'pet').kind === 'นกกระสาขาเจ็บ' ? 'ร้องเสียงดังลั่นบ้าน' : 'ส่งเสียงไม่หยุด ตะกุยประตูอยู่นั่น'} จนต้องลุกขึ้นมาดู`,
    options: p => [
      opt('ลุกไปดู', q => { const n = npc(q, 'pet'); n.hero = true; q.happy += 5; return pick([`ไฟจากเตาลามติดฝาบ้าน ดีที่${n.name}ปลุกทัน เลยดับได้ก่อนจะลุกลาม`, `มีขโมยกำลังงัดหน้าต่างอยู่ พอโดน${n.name}ส่งเสียงใส่ก็วิ่งหนีป่าราบ`, `เด็กข้างบ้านตกบ่อ ดีที่${n.name}ส่งเสียงเรียก เลยดึงขึ้นมาได้ทัน`]); }),
      opt('ดุให้เงียบแล้วนอนต่อ', q => { pay(q, -Math.min(q.wealth, coin(q, 2))); return 'ตื่นเช้ามา ของในบ้านหายไปหลายอย่าง'; }),
    ] }),
  thr({ id: 'pt3', when: p => { const n = npc(p, 'pet'); return n && n.kept != null && since(p, n, 'kept') >= 10 && roll(.35); },
    prompt: p => `อายุ ${p.age} ปี ${npc(p, 'pet').name}แก่มากแล้ว ขาหลังไม่มีแรง ได้แต่นอนอยู่ข้างเตาไฟทั้งวัน`,
    options: p => [
      opt('อยู่กับมันจนวันสุดท้าย', q => { q.happy -= 4; return `${npc(q, 'pet').name}ไปตอนเช้ามืด หัวยังซบอยู่บนเท้าคุณ คุณฝังไว้ใต้ต้นไม้หลังบ้าน`; }),
    ] }),

  // ---------- 7) the inheritance quarrel ----------
  thr({ id: 'ih1', when: p => p.age >= 20 && p.cls <= 2 && !npc(p, 'feud') && recentDead(p, 1).some(m => m.rel === 'mother' || m.rel === 'father') && famOf(p, 'sibling').some(m => m.alive && famAge(p, m) >= 18) && roll(.4),
    prompt: p => { const s = pick(famOf(p, 'sibling').filter(m => m.alive && famAge(p, m) >= 18)); meet(p, 'feud', { name: s.name, sex: s.sex, rel: relName(p, s) }); return `อายุ ${p.age} ปี งานศพผ่านไปไม่ถึงเดือน ${s.name} ${relName(p, s)}ของคุณก็มาทวงว่าสมบัติของพ่อแม่ควรตกเป็นของตัวเองมากกว่า เพราะเป็นคนเฝ้าไข้มาตลอด`; },
    options: p => [
      opt('แบ่งให้ตามที่ขอ', q => { pay(q, -Math.min(q.wealth * .2, coin(q, 6))); npc(q, 'feud').peace = true; return 'เสียของไปบ้าง แต่ไม่เสียพี่น้อง'; }),
      Object.assign(opt('ไปให้ผู้ใหญ่ในหมู่บ้านตัดสิน', q => { const n = npc(q, 'feud'); n.feud = true; if (check(q, 'CHA', 'speech', 12)) { pay(q, coin(q, 3)); return `ผู้ใหญ่ตัดสินให้คุณชนะ ${n.name}เดินออกจากบ้านไป แล้วก็ไม่พูดกับคุณอีกเลย`; } pay(q, -Math.min(q.wealth * .3, coin(q, 6))); return `ผู้ใหญ่ตัดสินให้${n.name}ชนะ เสียทั้งของ เสียทั้งหน้าไปทั้งหมู่บ้าน`; }), { chk: ['CHA', 'speech'] }),
      opt('ยกให้ทั้งหมด', q => { pay(q, -Math.min(q.wealth * .3, coin(q, 10))); q.happy += 3; addRep(q, { folk: 3, guilt: -3 }); npc(q, 'feud').peace = true; return 'คุณบอกว่าของพวกนั้นไม่ได้ทำให้คิดถึงพ่อแม่น้อยลงหรอก แล้วก็ยกให้หมด'; }),
    ] }),
  thr({ id: 'ih2', when: p => { const n = npc(p, 'feud'); return n && n.feud && since(p, n, 'met') >= 6 && roll(.25); },
    prompt: p => `อายุ ${p.age} ปี หลังจากไม่ได้พูดกันมาหลายปี จดหมายจาก${npc(p, 'feud').name}ก็มาถึง บอกว่าป่วยหนัก อยากเจอหน้ากันก่อนจะสายเกินไป`,
    options: p => [
      opt('ไปหา', q => { q.happy += 8; addRep(q, { guilt: -5 }); npc(q, 'feud').peace = true; return `สองคนไม่มีใครพูดถึงเรื่องมรดกสักคำ คุยกันแต่เรื่องตอนเด็กๆ จนคนเฝ้าไข้ต้องมาไล่`; }),
      opt('ไม่ตอบ', q => { addRep(q, { guilt: 4 }); return 'จดหมายฉบับนั้นยังอยู่ในลิ้นชัก ไม่ได้ตอบ แต่ก็ไม่กล้าทิ้ง'; }),
    ] }),

  // ---------- 8) a family secret ----------
  thr({ id: 'sc1', when: p => p.age >= 18 && p.age <= 45 && !npc(p, 'secret') && recentDead(p, 2).some(m => m.rel === 'mother' || m.rel === 'father') && roll(.25),
    prompt: p => { const kind = pick(['sib', 'debt', 'blood']); const n = meet(p, 'secret', { kind }); return `อายุ ${p.age} ปี ตอนเก็บข้าวของของพ่อแม่ คุณเจอจดหมายเก่าปึกหนึ่งมัดด้วยเชือกแดง ซุกไว้ใต้พื้นบ้าน` + (kind === 'sib' ? ` ในนั้นพูดถึงเด็กชื่อ${n.name}ที่เกิดอยู่อีกแดน แปลว่าคุณมีพี่น้องอีกคนที่ไม่เคยรู้ว่ามี` : kind === 'debt' ? ' ในนั้นเป็นสัญญากู้เงินที่ยังไม่ได้ใช้คืน ลายมือชื่อเป็นของพ่อ' : ' ในนั้นมีตราของตระกูลขุนนางเก่าแก่ กับจดหมายที่บอกว่าย่าของคุณเป็นลูกนอกสมรสของท่านเคานต์'); },
    options: p => { const n = npc(p, 'secret');
      if (n.kind === 'sib') return [
        opt('ออกตามหา', q => { const n = npc(q, 'secret'); pay(q, -Math.min(q.wealth, coin(q, 2))); if (Math.random() < .6) { n.found = true; q.happy += 10; return `คุณเจอ${n.name}ที่ตลาดในแดนข้างๆ หน้าเหมือนพ่อจนขนลุก ยังพูดไม่ทันจบประโยค อีกฝ่ายก็ร้องไห้ออกมาแล้ว`; } return `คุณตามถามหา${n.name}ไปทั่ว แต่ไม่มีใครรู้จักเลย`; }),
        opt('เผาจดหมายทิ้ง', q => { const n = npc(q, 'secret'); q.happy -= 2; return 'บางเรื่องพ่อแม่คงอยากเอาติดตัวไปด้วย'; }),
      ];
      if (n.kind === 'debt') return [
        opt('ไปใช้หนี้แทนพ่อ', q => { const n = npc(q, 'secret'); pay(q, -Math.min(q.wealth, coin(q, 5))); addRep(q, { folk: 3, guilt: -2 }); return 'เจ้าหนี้แก่ๆ รับเงินแล้วร้องไห้ บอกว่ารอเงินก้อนนี้มายี่สิบปี ตั้งใจจะเอาไปรักษาลูก แต่ลูกตายไปนานแล้ว'; }),
        opt('เผาสัญญาทิ้ง', q => { const n = npc(q, 'secret'); addRep(q, { guilt: 3 }); return 'ไม่มีใครรู้ว่าเคยมีสัญญาฉบับนี้อยู่บนโลก'; }),
      ];
      return [
        Object.assign(opt('เอาไปยื่นต่อราชสำนัก', q => { const n = npc(q, 'secret'); if (check(q, 'CHA', 'history', 15)) { addRep(q, { noble: 12 }); pay(q, coin(q, 15)); return 'ราชสำนักรับรองว่าคุณมีเชื้อขุนนางจริง ไม่ได้ยศ แต่ได้เงินชดเชยกับชื่อในบัญชีตระกูล พวกขุนนางเริ่มยอมทักคุณแล้ว'; } addRep(q, { noble: -4 }); return 'เจ้าหน้าที่หัวเราะใส่หน้า แล้วโยนจดหมายลงกองเอกสารที่ไม่มีวันมีใครเปิดอ่าน'; }), { chk: ['CHA', 'history'] }),
        opt('เก็บไว้เป็นความลับ', q => { const n = npc(q, 'secret'); q.happy += 1; return 'คุณซ่อนจดหมายไว้ที่เดิม บางคืนก็หยิบมาอ่าน แล้วนึกว่าถ้าชีวิตเป็นอีกแบบจะเป็นยังไง'; }),
      ]; } }),

  // ---------- 9) the apprentice ----------
  thr({ id: 'ap1', when: p => p.age >= 40 && p.age <= 60 && !npc(p, 'apprentice') && ((p.careerRank || 0) >= 1 || Object.values(p.skills || {}).some(s => s.r >= 3)) && p.cls <= 2 && roll(.2),
    prompt: p => { const n = meet(p, 'apprentice'); return `อายุ ${p.age} ปี เด็กอายุสิบสามชื่อ${n.name}มายืนรอหน้าบ้านสามวันติด ขอมาเป็นลูกมือ ไม่เอาค่าแรง ขอแค่ได้เรียน`; },
    options: p => [
      opt('รับไว้', q => { const n = npc(q, 'apprentice'); n.taken = q.age; pay(q, -coin(q, 1)); q.happy += 5; return `อาทิตย์แรก${n.name}ทำของพังไปสามชิ้น แต่ถามอะไรแต่ละอย่างฉลาดกว่าที่คุณเคยถามครูตัวเองซะอีก`; }),
      opt('ไล่กลับบ้าน', q => { npc(q, 'apprentice').no = true; return 'เด็กเดินคอตกกลับไป คุณไม่เคยรู้ว่าสุดท้ายได้เป็นลูกมือใครหรือเปล่า'; }),
    ] }),
  thr({ id: 'ap2', when: p => { const n = npc(p, 'apprentice'); return n && n.taken != null && since(p, n, 'taken') >= 7 && roll(.3); },
    prompt: p => `อายุ ${p.age} ปี ${npc(p, 'apprentice').name}ลูกมือของคุณตอนนี้ฝีมือแซงครูไปแล้ว อยากออกไปเปิดร้านเอง แต่ไม่กล้าพูด`,
    options: p => [
      opt('บอกเขาเองว่าถึงเวลาแล้ว', q => { const n = npc(q, 'apprentice'); n.free = true; q.happy += 8; addRep(q, { folk: 4 }); return `${n.name}เอาชื่อคุณไปตั้งเป็นชื่อร้าน ทุกปีใหม่จะมีของฝากมาส่งถึงหน้าบ้าน`; }),
      opt('ขอให้อยู่ช่วยอีกสักพัก', q => { pay(q, coin(q, 4)); return `${npc(q, 'apprentice').name}อยู่ช่วยต่ออีกสามปี งานของร้านดีขึ้นเห็นๆ ทั้งที่ฝีมือคุณก็เท่าเดิม`; }),
    ] }),

  // ---------- 10) the comrade from the war ----------
  thr({ id: 'wb1', when: p => (p.flags.enlisted || (p.flags.soldier || 0) > 0) && p.age >= 17 && p.age <= 40 && !npc(p, 'comrade') && roll(.3),
    prompt: p => { const n = meet(p, 'comrade', { sex: 'ช' }); return `อายุ ${p.age} ปี หลังปะทะกันที่ชายแดน ${n.name}เพื่อนร่วมหน่วยนอนขาหักอยู่กลางทุ่ง ข้าศึกกำลังย้อนกลับมา`; },
    options: p => [
      Object.assign(opt('แบกเขากลับค่าย', q => { const n = npc(q, 'comrade'); if (check(q, 'CON', null, 12)) { n.saved = q.age; addRep(q, { folk: 3 }); return `คุณแบก${n.name}เดินทั้งคืน ไหล่ซ้ายปวดไปตลอดชีวิต แต่${n.name}รอด`; } n.saved = q.age; q.health -= 15; return `ล้มลุกคลุกคลานกันไปตลอดทาง แต่ก็ถึงค่ายจนได้ คนแบกเจ็บหนักกว่าคนถูกแบกเสียอีก`; }), { chk: ['CON', null] }),
      opt('วิ่งหนีเอาตัวรอด', q => { npc(q, 'comrade').left = q.age; addRep(q, { guilt: 12 }); return `เสียง${npc(q, 'comrade').name}ตะโกนเรียกชื่อคุณตามมาหลอกในฝันไปอีกหลายสิบปี`; }),
    ] }),
  thr({ id: 'wb2', when: p => { const n = npc(p, 'comrade'); return n && (n.saved != null || n.left != null) && p.age - (n.saved ?? n.left) >= 8 && roll(.25); },
    prompt: p => { const n = npc(p, 'comrade'); return n.saved != null ? `อายุ ${p.age} ปี ${n.name}เดินขากะเผลกมาหา จูงลูกเล็กๆ มาด้วยคนหนึ่ง ตั้งชื่อลูกตามชื่อคุณ` : `อายุ ${p.age} ปี หญิงม่ายคนหนึ่งมาหา บอกว่าเป็นเมียของ${n.name} อยากรู้ว่าวันนั้นผัวตัวเองตายยังไง`; },
    options: p => { const n = npc(p, 'comrade');
      if (n.saved != null) return [opt('ต้อนรับเข้าบ้าน', q => { const n = npc(q, 'comrade'); q.happy += 10; pay(q, coin(q, 3)); return 'คืนนั้นสองคนกินเหล้ากันจนเมา เล่าเรื่องสงครามให้เด็กฟัง ข้ามตอนที่เด็กไม่ควรได้ยินไป'; })];
      return [
        opt('บอกความจริง', q => { const n = npc(q, 'comrade'); addRep(q, { guilt: -10 }); q.happy -= 6; return 'เธอฟังจนจบ ไม่ด่า ไม่ร้องไห้ แค่พยักหน้าแล้วขอบใจที่ยอมบอก ซึ่งเจ็บกว่าโดนด่าเสียอีก'; }),
        opt('บอกว่าเขาตายอย่างกล้าหาญ', q => { const n = npc(q, 'comrade'); addRep(q, { guilt: 3 }); return 'เธอยิ้มทั้งน้ำตา ส่วนคุณต้องแบกคำโกหกนี้ไปจนตาย'; }),
      ]; } }),

  // ---------- 11) the neighbour who borrows ----------
  thr({ id: 'nb1', when: p => p.age >= 24 && p.age <= 50 && p.cls <= 2 && p.wealth > coin(p, 4) && !npc(p, 'neighbour') && roll(.2),
    prompt: p => { const n = meet(p, 'neighbour'); n.ask = coin(p, 4); return `อายุ ${p.age} ปี ${n.name}บ้านข้างๆ มาขอยืมเงิน ${money(n.ask)} ลูกป่วยหนัก ต้องตามหมอ`; },
    options: p => [
      opt('ให้ยืม', q => { const n = npc(q, 'neighbour'); pay(q, -n.ask); n.lent = q.age; addRep(q, { folk: 2 }); return `${n.name}กำเงินแน่น แล้ววิ่งไปตามหมอทันที`; }),
      opt('ให้เปล่าๆ ไม่ต้องคืน', q => { const n = npc(q, 'neighbour'); pay(q, -n.ask); n.gift = q.age; addRep(q, { folk: 4, guilt: -4 }); return `${n.name}ทรุดลงกราบแทบเท้า คุณต้องรีบดึงตัวขึ้นมา`; }),
      opt('ปฏิเสธ', q => { npc(q, 'neighbour').refused = q.age; return 'คืนนั้นคุณได้ยินเสียงร้องไห้จากบ้านข้างๆ'; }),
    ] }),
  thr({ id: 'nb2', when: p => { const n = npc(p, 'neighbour'); return n && (n.lent != null || n.gift != null || n.refused != null) && since(p, n, 'met') >= 4 && roll(.3); },
    prompt: p => { const n = npc(p, 'neighbour'); return n.refused != null ? `อายุ ${p.age} ปี ปีนั้นลูกของ${n.name}ไม่รอด ตั้งแต่นั้นมาก็ไม่เคยทักกันอีก วันนี้บ้านคุณมีเรื่อง แล้วก็มีแต่${n.name}ที่ช่วยได้` : `อายุ ${p.age} ปี ${n.name}มาเคาะประตู ถือห่อผ้ามาด้วย ข้างในเป็นเงินที่ค่อยๆ เก็บมาหลายปี`; },
    options: p => { const n = npc(p, 'neighbour');
      if (n.refused != null) return [opt('ไปขอความช่วยเหลือ', q => { const n = npc(q, 'neighbour'); if (Math.random() < .4) { q.happy += 6; addRep(q, { guilt: -5 }); return `${n.name}มาช่วยโดยไม่พูดสักคำ พองานเสร็จก็เดินกลับบ้าน`; } q.happy -= 4; return `${n.name}ปิดประตูใส่หน้า คุณไม่โกรธเลย เพราะเข้าใจดี`; }), opt('จัดการเอง', q => { const n = npc(q, 'neighbour'); pay(q, -Math.min(q.wealth, coin(q, 3))); return 'ต้องไปจ้างคนอื่นมาช่วย เสียเงินไปแพงกว่าที่ควร'; })];
      return [opt('รับไว้', q => { const n = npc(q, 'neighbour'); const back = n.gift != null ? coin(q, 6) : n.ask * 1.5; pay(q, back); q.happy += 6; return n.gift != null ? `${n.name}บอกว่ารู้ว่าไม่ได้ขอคืน แต่ลูกที่หายป่วยวันนั้นตอนนี้โตเป็นช่างแล้ว อยากให้รับไว้ ${money(back)}` : `${n.name}คืนเงินมา ${money(back)} บวกดอกที่ไม่มีใครเรียก`; }), opt('บอกว่าไม่ต้องคืน', q => { const n = npc(q, 'neighbour'); q.happy += 4; addRep(q, { folk: 3 }); return `${n.name}ยืนนิ่งไปพักใหญ่ แล้วก็เอาเงินกลับไปซื้อรองเท้าให้ลูก`; })]; } }),
);
// these people show up in the end-of-life story
LEGENDS.push(
  { id: 'oldfriend', n: 'เพื่อนตาย', d: 'เพื่อนที่เริ่มจากข้าวครึ่งห่อ คบกันจนวันตาย', c: p => p.npc && p.npc.friend && p.npc.friend.bond >= 3 },
  { id: 'firstlove', n: 'รักแรกคือรักสุดท้าย', d: 'ได้อยู่กับรักแรกในที่สุด', c: p => p.npc && p.npc.love && p.npc.love.wed },
  { id: 'paidback', n: 'บุญคุณย่อมตอบแทน', d: 'คนที่เคยช่วยไว้ข้างทางกลับมาช่วยคืน', c: p => p.npc && p.npc.stranger && p.npc.stranger.helped != null && p.done.st2 },
  { id: 'master', n: 'ครูของครู', d: 'ลูกมือออกไปตั้งตัวได้ แล้วยังเอาชื่อครูไปตั้งเป็นชื่อร้าน', c: p => p.npc && p.npc.apprentice && p.npc.apprentice.free },
);
// how each person stands with you now, for the family tab
const NPC_ROLE = { friend: 'เพื่อนวัยเด็ก', rival: 'คู่ปรับ', mentor: 'ครู', love: 'รักแรก', stranger: 'คนแปลกหน้าที่เคยพบ', pet: 'สัตว์เลี้ยง', feud: 'พี่น้องที่ผิดใจกัน', secret: 'ความลับของครอบครัว', apprentice: 'ลูกมือ', comrade: 'เพื่อนร่วมรบ', neighbour: 'เพื่อนบ้าน' };
function npcStatus(p, k, n) {
  if (k === 'friend') return n.bond === 0 ? 'ไม่ได้เจอกันอีกเลย' : n.done || n.saved ? 'ยังคบกันจนทุกวันนี้' : n.lent || n.left ? 'ออกไปเสี่ยงโชคที่ออเรลิส' : n.stayed ? 'อยู่บ้านใกล้ๆ กัน' : 'เพื่อนสนิท';
  if (k === 'rival') return n.peace ? 'คืนดีกันแล้ว' : n.won2 > 0 ? 'คุณเอาชนะเขาได้' : n.won2 < 0 ? 'เขาได้ดีกว่าคุณ' : 'ยังเป็นคู่ปรับ';
  if (k === 'mentor') return n.no ? 'คุณไม่ได้ไปเรียน' : p.done.mt3 ? 'จากไปแล้ว ทิ้งเครื่องมือไว้ให้คุณ' : n.taught != null ? `สอน${SBY[n.skill].n}ให้คุณ` : '';
  if (k === 'love') return n.wed ? 'แต่งงานกันแล้ว' : n.lost != null ? 'แยกทางกันไป' : n.refused ? 'เคยปฏิเสธคุณ' : n.silent ? 'ไม่เคยรู้ใจคุณ' : n.together != null ? 'คบกันอยู่' : '';
  if (k === 'stranger') return n.helped != null ? 'คุณเคยช่วยชีวิตเขา' : n.robbed != null ? 'คุณเคยปล้นเขา' : 'คุณเดินผ่านเขาไป';
  if (k === 'pet') return n.no ? 'คุณไล่มันไป' : p.done.pt3 ? 'จากไปแล้ว' : `${n.kind}ที่บ้าน`;
  if (k === 'feud') return n.peace ? 'คืนดีกันแล้ว' : 'ยังไม่คุยกัน';
  if (k === 'apprentice') return n.no ? 'คุณไม่รับไว้' : n.free ? 'ออกไปตั้งร้านของตัวเองแล้ว' : 'ยังเรียนอยู่กับคุณ';
  if (k === 'comrade') return n.saved != null ? 'คุณแบกเขากลับมาจากสนามรบ' : 'คุณทิ้งเขาไว้ในสนามรบ';
  if (k === 'neighbour') return n.refused != null ? 'คุณเคยปฏิเสธเขา' : 'คุณเคยช่วยเขา';
  return '';
}

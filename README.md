# เกิดจากเถ้าถ่าน (Ashborn)

A dark-fantasy life simulator about inequality. Everything ships as one file, `เกิดจากเถ้าถ่าน.html`.

## Layout

```
src/        game source; each file is one system
  engine.js     core life: birth, realms, yearly loop, choices, death; extend() lives here
  rpg.js        stats, skills, dice checks, levels
  content*.js   story events and choices
  combat.js     weapons and turn-based fights
  careers.js    jobs, pay, promotion, cost of living
  family.js     parents, siblings, spouse, children
  economy.js    coins, ledger, materials, business, loans
  travel.js     roads, borders, trips
  housing.js    homes and land
  royal.js      royal houses and succession
  adventure.js  quest board; the simulated "bot" life used for realm statistics
  disease.js    illnesses and curses; lifespan tuning
  elder.js      buildings that persist across lives, carers, wills
  morality.js   reputation per faction, guilt
  heir.js       an heir or sibling starts at their real age
  relic.js      unique relics that pass down or get lost in the world
  arms.js       arenas, hunting, what fighting skill is worth
  content4.js   more small events and one-off choices
  threads.js    people who come back: friend, rival, mentor, first love... (multi-step choices)
  story.js      yearly lines drawn from your life; season air per realm; memory of what was seen
  shell.html    the page: layout, styles, all UI code
  map.js        the realm map
tools/build.py  joins src/ into เกิดจากเถ้าถ่าน.html (order matters)
tests/          golden master + browser tests
```

## Build and test

```
python3 tools/build.py          # writes เกิดจากเถ้าถ่าน.html and build/engine.js
node tests/golden.js --check    # deterministic fingerprint of ~250 lives; must not change in a refactor
sh tests/run_all.sh             # build, syntax check, golden, then every browser test
```

If you change game balance on purpose, the golden hash will change. Check the change is the one you meant
(`node tests/golden.js --dump` writes the raw results to `build/golden.json`), then save the new one with
`node tests/golden.js --save`.

## How systems hook into each other

Later files change core behaviour by wrapping a global function through `extend()` in engine.js:

```js
extend('applyFocus', 'relic: yearly price of each relic', inner => function (p) {
  const t = inner(p);          // everything earlier files do
  /* then this system's part */
  return t;
});
```

Every wrap is labelled. Type `LAYERS` in the browser console to see the full list in the order they run.
Do not reassign a global function by hand; always go through `extend()` so the list stays true.

## Notifications

The UI does not read story text to decide what is important. It takes a snapshot of the life before
each year, choice, fight and season event, and compares it afterwards (`noteSnap` / `noteDiff` in
shell.html): a relative died, a child was born, an illness began, a relic was gained or lost, a house
was lost, and so on.

## Saved data in the browser

`ash-save-v1` the current life · `ash-world` buildings that persist · `ash-relics` where lost relics lie ·
`ash-ws` cached realm statistics · `ash-tut` tutorial · `ash-notes` notification settings · `ash-seen` what you have seen across lives (to avoid repeats)

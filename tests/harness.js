// Load the game engine (no DOM) into an isolated context, optionally with a seeded random.
const fs = require('fs'), path = require('path'), vm = require('vm');
function load({ seed = null } = {}) {
  const store = {};
  const ctx = {
    console, structuredClone,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; } },
  };
  vm.createContext(ctx);
  if (seed != null) {
    vm.runInContext(`(() => { let a = ${seed} >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })()`, ctx);
  }
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'build', 'engine.js'), 'utf8'), ctx, { filename: 'engine.js' });
  // top-level const/let/function are visible to later scripts in the same context
  ctx.run = code => vm.runInContext(code, ctx);
  ctx.store = store;
  return ctx;
}
module.exports = { load };

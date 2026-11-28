// v265 Text waits for a tap (no reading timers), and nothing can leave the game stuck after a match.
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=265&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
// 1. no message hides itself on a timer any more
assert(src.includes('const msgT = ms => window.__msgScale ? Math.round(ms * window.__msgScale) : TAP_HOLD;'));
assert(src.includes('const tapTimer = (fn, ms) => { const t = msgT(ms); return t >= TAP_HOLD ? 0 : setTimeout(fn, t); };'));
assert(!/setTimeout\([^;]*,\s*(MSG_MS|MSG_INTRO_MS|msgT\()/.test(src),'every reading timer goes through tapTimer');
assert(!/setTimeout\(hideTip,\s*\d/.test(src),'tips stay until tapped');
assert(!src.includes("setTimeout(() => el.classList.add('out'), 3200)"),'achievement banner stays until tapped');
assert(src.includes("const MSG_P4 = '#speech,.lachat,.chaltoast,.achtoast';"),'a tap anywhere clears achievement banners too');
assert(src.includes('t = skippable && !window.__msgScale ? 0 : setTimeout(done, ms);'),'scene lines wait for a tap');
assert(src.includes('const t = ms >= TAP_HOLD ? 0 : setTimeout(r, calm ? Math.min(ms, 700) : ms);'),'victory banners wait for a tap, reduced motion too');
assert((src.match(/tapCue\(/g)||[]).length>=8,'"Tap to continue" on the cards that wait');
// 2. nothing can swallow taps forever or leave the board dead
assert(src.includes("if(!el.classList.contains('vict')) setTimeout(() => { if(el.isConnected && !el.classList.contains('out')) el.remove(); }, 700); }"),'a message that ignores a tap is removed');
assert(src.includes("el._gone = done; el.addEventListener('click', done);"),'the circuit arrival card closes from a tap anywhere');
assert(/el\._wake = \(\) => \{ if\(performance\.now\(\) - t0 > 700\) done\(\);[^\n]*\n\s*el\.addEventListener\('pointerdown', el\._wake\); iv = setInterval\(\(\) => \{ if\(!el\.isConnected\) done\(\); \}, 400\);/.test(src),'the first reinforcement banner can never hang the fight');
assert((src.match(/\.catch\(vRescue\)\.then\(/g)||[]).length===2,'a broken victory animation still reaches the rewards (campaign and Daily Run)');
assert(src.includes('function stallCheck()')&&src.includes("m.querySelector('#stallgo').onclick")&&src.includes('if(iv && iv.unref) iv.unref();'),'dead-board safety net');
// 3. live behaviour in the game runtime
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
assert.equal(+E('msgT(5000)'),+E('TAP_HOLD'));assert.equal(E('tapTimer(()=>{},5000)'),0,'no timer is created while waiting for a tap');
assert.equal(+E('(window.__msgScale=0.5,msgT(5000))'),2500,'tests can still scale reading times');E('window.__msgScale=0');
console.log('PASS: v265 text waits for a tap (messages, tips, banners, cards, scene lines), with no hidden timers; stuck-proof messages, reinforcement banner, victory animations and board');

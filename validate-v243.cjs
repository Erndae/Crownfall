// v243 The Hunger arrives with its own sound and a brief red edge on the screen (gentle with reduced motion).
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=243&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
assert.equal(E('typeof sfx.hunger'),'function');assert.equal(E('typeof hungerFx'),'function');
E('soundOn=false');E('sfx.hunger()');E('hungerFx()');   // never throws, with sound off or without a real screen
// played exactly when a bargain is offered (not on quiet Stage Battles)
assert(src.includes("const o = hungerOffer(); save(); sfx.hunger(); hungerFx();   // v243"));
const ask=src.slice(src.indexOf('function hungerAsk(go){'),src.indexOf('const o = hungerOffer(); save(); sfx.hunger();'));
assert(ask.indexOf('if(!hungerComes()){ save(); return go(); }')>0,'quiet battles return before the sound');
assert(css.includes('body.hunger-fx::after')&&css.includes('pointer-events:none')&&/prefers-reduced-motion:reduce\)\{body\.hunger-fx::after/.test(css)&&/prefers-reduced-motion:reduce\)\{\.modal \.hunger\{animation:none\}/.test(css));
assert(src.includes("setTimeout(() => document.body.classList.remove('hunger-fx'), 2200)"),'the effect clears itself');
// health check fix: a Playbook card tapped during the victory show (or with no run) does nothing instead of throwing
assert(src.includes("function openCard(k){\n  if(busy || !RUN || !B || B.done || !RUN.cards || RUN.cards[k] == null) return;"));
E("RUN=null;B=null;busy=false");E('openCard(0)');
E("setPack('street');newRun('downtown');B={done:true,board:[]};busy=false");E('openCard(0)');
console.log('PASS: card taps after a fight is won do nothing (health-check fix); the Hunger’s sound and red screen edge play only when a bargain is offered, clear themselves, never block taps, and respect reduced motion; version');

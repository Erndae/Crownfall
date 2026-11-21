// v232 Hard + New Game+ never asks more than the New Game+ ceiling; the endless Gauntlet's leftover code is gone.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=232&&sw.includes("'crownfall-v"+RegExp.$1+"'")&&!src.includes('?v=231'));
// target multiplier: Hard × New Game+ stops at +60% (Blitz +30%)
const tgt=(d,ng,blind)=>E(`(()=>{MATCH=null;B=null;ACH.edicts=[];ACH.ngplus=${ng};ACH.cdiff=${d?`'${d}'`:'undefined'};setPack('medieval');newRun('harbor');RUN.ante=3;RUN.blind=${blind};RUN.fightTarget=null;return targetParts(${blind}).final})()`);
const base=tgt(null,0,1);
for(let ng=0;ng<=3;ng++){const h=tgt('hard',ng,1);assert(h<=Math.round(base*1.6/10)*10+10,`Hard NG+${ng} above +60% (${h} vs ${base})`);}
assert(Math.abs(tgt('hard',0,1)-base*1.2)<=10,'Hard alone still ×1.2');
assert.equal(tgt('hard',3,1),tgt(null,3,1),'Hard at New Game+ 3 asks the same target as Normal at New Game+ 3');
// Blitz move cut: New Game+ and Hard together stop at 3 (Easy's +2 always applies)
const lim=(d,ng)=>E(`(()=>{ACH.ngplus=${ng};ACH.cdiff=${d?`'${d}'`:'undefined'};const id=BOSSES.find(b=>b.moveLimit&&typeof b.moveLimit.par==='number').id;RUN.land='fantasy';RUN.circuit='harbor';return moveLimitFor(parFor(),id)})()`);
const L0=lim(null,0);
assert.equal(lim('hard',0),L0-1);assert.equal(lim('hard',2),L0-3);assert.equal(lim('hard',3),L0-3);assert.equal(lim(null,3),L0-3);assert.equal(lim('easy',3),L0-1);
E("ACH.ngplus=0;ACH.cdiff=undefined");
// removed: Arena Tokens, the Armory, equipment, endless records and migrations
for(const x of ['G_EQUIP','G_PREP','gEqOf','gArmory','gGenArmory','gPickOpen','gTokScan','gTokWatch','gRecordRun','gEndScreen','gRecords','gMigrate152','gFightStart','gBuy(','gMedal','gSealPromo','gArmorBlock','freeScout','G_BOSS_TOK','gBest','keepcash','.tok{','.garm','.gmvp'])
  assert(!src.includes(x),'still present: '+x);
assert(!/\bgMigrate\(/.test(src),'still present: gMigrate');
assert.equal(E("typeof gWin"),'function');assert.equal(E("typeof dailyWin"),'function');assert.equal(E("typeof gDraw"),'function');
// a Daily Run never opens the store; an old endless save is simply replaced by today's run
E(`(()=>{MATCH=null;B=null;RUN={gauntlet:true,daily:dailyToday(),gWave:2,gWaveSet:0,roster:['K','N','B','P','P','P','P'],money:6,lives:3,relics:[],cards:[],lv:{P:1,N:1,B:1,R:1,Q:1,K:1},gId:'t',gStats:{}};window.__nw=0;const o=gNextWave;gNextWave=()=>{window.__nw++};shop();gNextWave=o})()`);
assert.equal(E('window.__nw'),1,'shop() in a Daily Run goes to the next wave');
// Scout costs one Tactic (the Scout Lens is gone)
assert(src.includes("const th = scoutThreat(); t.n -= 1; t.used.scout++;"));
console.log('PASS: Hard + New Game+ capped at the New Game+ ceiling (targets +60%/Blitz +30%, Blitz cut 3); Arena Tokens, Armory, equipment, endless records and migrations removed; Daily Run never opens a store; version');

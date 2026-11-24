// v238 playtest balance: 2 grace moves in every Blitz fight (not counted in the target); the Iron Kingdom eases in.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=238&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
const run=(land,circ,d,x='')=>E(`(()=>{MATCH=null;ACH.cdiff=${d?`'${d}'`:'undefined'};ACH.ngplus=0;ACH.edicts=[];setPack('${land}');newRun('${circ}');RUN.ante=4;RUN.blind=2;RUN.fightTarget=null;${x};return 0})()`);
const lims=()=>JSON.parse(E("JSON.stringify({real:moveLimitFor(parFor(),bossAt(RUN.ante)),base:moveLimitFor(parFor(true),bossAt(RUN.ante),true),t:targetParts(2).final})"));
for(const land of ['street','medieval','greek']){
  run(land,'downtown',null);const n=lims();run(land,'downtown','easy');const e=lims();run(land,'downtown','hard');const h=lims();
  assert(n.real>=n.base+2,`${land}: Normal gets 2 grace moves (${n.base} → ${n.real})`);
  assert.equal(e.real,n.real+2,`${land}: Easy keeps its 2 extra on top`);assert.equal(h.real,n.real-1,`${land}: Hard still one fewer than Normal`);
  assert.equal(e.base,n.base,'Easy’s moves no longer raise its target base');
}
// the target doesn't rise with the grace moves
assert(src.includes("const grace = !baseOnly ? BLITZ_GRACE + Math.max(0, DX('blitz')) : 0;"));
// Iron Kingdom: a halfway step from Crown City's calibration; other Lands unchanged
const tgt=(land,circ)=>{run(land,circ,null);return E("ikEase(null)");};
assert.equal(tgt('medieval','downtown'),1);assert(Math.abs(tgt('medieval','rooftop')-Math.sqrt(0.6))<1e-9);assert(Math.abs(tgt('medieval','harbor')-Math.sqrt(0.84))<1e-9);assert(Math.abs(tgt('medieval','midnight')-Math.sqrt(0.7))<1e-9);
for(const l of ['street','greek','fantasy','throne'])for(const ci of ['rooftop','harbor','midnight'])assert.equal(tgt(l,ci),1,`${l} unchanged`);
run('medieval','downtown',null);assert.equal(E('ikEase(7)'),0.8,'Iron Kingdom Blitz ×0.80');
// Crown City → Iron Kingdom Circuit bosses no longer jump by two thirds
const boss=(land,circ)=>{run(land,circ,null);return E('targetParts(2).final');};
for(const ci of ['rooftop','harbor','midnight']){const a=boss('street',ci),b=boss('medieval',ci);assert(b/a<=1.35,`${ci}: Crown City ${a} → Iron Kingdom ${b}`);assert(b>=a,`${ci}: still a step up`);}
console.log('PASS: Blitz +2 grace moves on every difficulty (Easy +2 more, Hard 1 fewer than Normal), not in the target; Iron Kingdom targets a halfway step from Crown City (Rooftop ×0.77, Harbor ×0.92, Midnight ×0.84, Blitz ×0.80), still a step up; other Lands unchanged; version');

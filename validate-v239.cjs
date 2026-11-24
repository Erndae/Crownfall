// v239 late-Land playtest balance: Rooftop/Midnight Circuit bosses eased in the last three Lands; Blitz ×0.80 after
// Crown City; Easy's enemy weaker the further you go.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=239&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
const at=(land,circ,ante,blind,d)=>JSON.parse(E(`(()=>{MATCH=null;B=null;ACH.cdiff=${d?`'${d}'`:'undefined'};ACH.ngplus=0;ACH.edicts=[];setPack('${land}');newRun('${circ}');RUN.ante=${ante};RUN.blind=${blind};RUN.fightTarget=null;
  return JSON.stringify({boss:lateBoss(),ease:lateEase(${blind===2&&circ==='downtown'&&ante===4?'7':'null'}),r:aiRating(),lad:AI_LADDER['${land}'][aiSlot().ci]+STAGE_AI[${ante}-1]})})()`));
for(const land of ['greek','fantasy','throne'])for(const circ of ['rooftop','midnight']){
  const b=at(land,circ,4,2);assert(b.boss,`${land} ${circ} boss`);assert.equal(b.ease,0.85);assert.equal(b.r,Math.min(1700,b.lad-75),`${land} ${circ}: one Circuit step weaker`);
  const s=at(land,circ,3,2);assert(!s.boss&&s.ease===1,'only the Stage-4 fights');
}
for(const land of ['street','medieval'])for(const circ of ['rooftop','midnight']){const b=at(land,circ,4,2);assert(!b.boss&&b.ease===1,`${land} unchanged`);}
for(const land of ['harbor'])for(const l of ['greek','throne']){const b=at(l,land,4,2);assert(!b.boss,'Harbor unchanged');}
// Blitz ×0.80 in every Land after Crown City (the Iron Kingdom through ikEase)
for(const land of ['greek','fantasy','throne'])assert.equal(at(land,'downtown',4,2).ease,0.8);
assert.equal(at('street','downtown',4,2).ease,1);
// Easy's enemy: −150, −150, −200, −250, −300
const ez={street:-150,medieval:-150,greek:-200,fantasy:-250,throne:-300};
for(const [land,dv] of Object.entries(ez)){const n=at(land,'harbor',2,1),e=at(land,'harbor',2,1,'easy');assert.equal(e.r,Math.max(400,n.r+dv),`${land} Easy ${dv}`);}
// Hard unchanged (+150, capped)
{const n=at('greek','harbor',2,1),h=at('greek','harbor',2,1,'hard');assert.equal(h.r,Math.min(1700,n.r+150));}
assert(src.includes("t *= ikEase(lim) * lateEase(lim);"));
console.log('PASS: late Rooftop/Midnight Stage-4 fights ×0.85 and 75 rating weaker (Olympian Court, Road, Fallen Throne only); Blitz ×0.80 after Crown City; Easy −150/−150/−200/−250/−300 by Land; Hard unchanged; version');

// v216 The throne's hold on the Lands: hints in opponents, Rulers, passages and the army; each ending says whether the Lands stay bound or go free.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const H=JSON.parse(E('JSON.stringify(HOLD_LINES)'));assert.equal(H.length,6);
const SPOIL=/crownless|throne|was once|became|consum|every king|his name/i;for(const x of H)assert(!SPOIL.test(x),'no spoiler: '+x);
// released opponents: first clears only, after a World Crown, never stage 1, never Rulers, stable per opponent, all six lines in use
const r=JSON.parse(E(`(()=>{const used={};let n=0,h=0,early=0,ruler=0,stable=true,refought=0;
 for(const l of ['street','medieval','greek','fantasy','throne']){PACK=l;for(const k of Object.keys(ACH))if(/^(crown_|conq_)/.test(k))delete ACH[k];MATCH=null;RUN={land:l,circuit:'downtown',ante:2,blind:2,money:5,relics:[],roster:['K']};
  for(const nm of Object.keys(PERSONA)) if(HOLD_LINES.includes(storyLines({name:nm,intro:'i',lose:'L'}).lose)) early++;
  ACH[landCrownId('street')]=1;
  for(const nm of Object.keys(PERSONA)){const p=PERSONA[nm];const o=storyLines({name:nm,ruler:p.ruler,intro:'i',lose:'L'});const k=HOLD_LINES.indexOf(o.lose);
   if(p.ruler){ if(k>=0) ruler++; continue; } n++; if(k>=0){h++;used[k]=1;} if(storyLines({name:nm,intro:'i',lose:'L'}).lose!==o.lose) stable=false;}
  RUN.ante=1;for(const nm of Object.keys(PERSONA)) if(!PERSONA[nm].ruler&&HOLD_LINES.includes(storyLines({name:nm,intro:'i',lose:'L'}).lose)) early++;
  RUN.ante=2;}
 return JSON.stringify({n,h,used:Object.keys(used).length,early,ruler,stable});})()`));
assert.equal(r.early,0,'never before the first World Crown, never in stage 1');assert.equal(r.ruler,0,'Rulers keep their own lines');assert(r.stable,'same opponent, same line');
assert.equal(r.used,6,'every line is heard somewhere');assert(r.h>r.n*0.15&&r.h<r.n*0.4,'about one in four: '+r.h+'/'+r.n);
// Rulers, passages, army
for(const x of ['it never once felt like mine.','never saw who it answered to.','Ask who has been carrying all of us.','remember that every Land is still kneeling.'])assert(src.includes(x),x);
const P=JSON.parse(E('JSON.stringify(LAND_PASSAGE)'));const strain={medieval:'same horizon',greek:'kneel toward the mountains',fantasy:'play chess in cellars',throne:'four Lands are still kneeling'};
for(const l in strain){assert.equal(P[l].lines.length,5);assert(P[l].lines.some(x=>x.includes(strain[l])),l);for(const x of P[l].lines)assert(!/crownless|was once a|became the/i.test(x));}
assert(src.includes("relieved to lose.")&&src.includes('Like something up there is listening.'));
// endings
const std=src.slice(src.indexOf('async function endingStandard'),src.indexOf('/* ---------- crown artwork'));
const a=std.indexOf('Its four crowns scatter back'),b=std.indexOf('Four Lands kneel to the throne again. Now they kneel to you.'),c2=std.indexOf('THE KING IS DEAD.');assert(a>0&&b>a&&c2>b,'standard: the Lands stay bound');
const tr=src.slice(src.indexOf('async function endingTrue'),src.indexOf('const ENDING_PRE'));
const t1=tr.indexOf('THE THRONE IS EMPTY.'),t2=tr.indexOf('the Rulers’ crowns go dark.'),t3=tr.indexOf('For the first time in a hundred years, nobody kneels.'),t4=tr.indexOf('The Crownless King lowers his head.');assert(t1>0&&t2>t1&&t3>t2&&t4>t3,'true: the Lands go free');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=216&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: released-opponent lines (after the first Crown, ~1 in 4, stable, all six heard, no spoilers), Ruler, passage and army hints, bound vs free in each ending, version.');

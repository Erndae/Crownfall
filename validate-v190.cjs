// v190 The true ending and the army's foreshadowing. Also proves the v181 record is written while the run still exists.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>''};
const run=(roster)=>E(`PACK='throne';MATCH=null;RUN={land:'throne',circuit:'ruler',ante:6,blind:2,bosses:Array(6).fill('ruler'),money:10,lv:{P:1,N:1,B:1,R:1,Q:1,K:1},relics:[],roster:${JSON.stringify(roster)}};`);
// 1) the record is made inside winBlind, before storeCarry/clearRun, and no longer in crownCeremony (where RUN is already null)
const wb=src.slice(src.indexOf('function winBlind'));const iRem=wb.indexOf('fallenRemember()'),iClr=wb.indexOf('storeCarry(); clearRun();');
assert(iRem>0&&iClr>iRem,'fallenRemember runs before the run is cleared');
const cc=src.slice(src.indexOf('function crownCeremony'),src.indexOf('function crownCeremony')+900);assert(!cc.includes('fallenRemember'));
// 2) each claim keeps the king it replaces: that is who the Crownless King was
E('localStorage.removeItem(FALLEN_KEY);ACH.campaign_epoch=1000');
run(['K','R::a1.Ike.V.3.2.0.start.0','B::a2.Fang.F.1.1.0.start.0']);E('fallenRemember()');
assert.equal(E('fallenWas()'),null,'The first Bearer faced a king with no remembered name');
c.CrownfallCharacter={get:()=>({name:'Second <i>'}),art:()=>''};E('ACH.campaign_epoch=2000');
run(['K','Q::b1.Juno.A.0.0.0.start.0']);E('fallenRemember()');
const rec=JSON.parse(E('localStorage.getItem(FALLEN_KEY)'));
assert.equal(rec.king,'Second i');assert.deepEqual(rec.was,{king:'Ernesto',army:[{t:'R',n:'Ike'},{t:'B',n:'Fang'}]});
assert.equal(E('fallenWas().king'),'Ernesto');assert.equal(E('fallenWas().army.length'),2);
for(const bad of ['"x"','{"was":5}','{"was":{"king":"<b>","army":"no"}}','nope']){E(`localStorage.setItem(FALLEN_KEY,${JSON.stringify(bad)})`);const w=E('fallenWas()');assert(w===null||(!/[<>]/.test(w.king)&&Array.isArray(w.army)),bad);}
// 3) the choice: only for a Bearer who has already seen the standard ending; both endings registered; refresh-safe
assert.equal(E('typeof ENDINGS.standard'),'function');assert.equal(E('typeof ENDINGS.true'),'function');
assert(src.includes("endingSave().seen.standard ? endingChoose({fresh, done:() => title()}) : playEnding('standard', {fresh, done:() => title()})"));
assert(src.includes("endingPending('standard', 'choice')")&&src.includes("if(p.step === 'choice')"));
assert(src.includes('Take the crown')&&src.includes('Break the crown'));
const et=src.slice(src.indexOf('async function endingTrue'),src.indexOf('async function endingTrue')+5200);
assert(et.includes("endingPending('true', 'city')")&&et.includes('localStorage.removeItem(FALLEN_KEY)'),'Breaking the crown frees the remembered army');
assert(et.includes('SOMEONE SETS UP A BOARD, JUST TO PLAY.'));
// 4) the twist is not spoiled before the ending: none of the soldiers' lines names it
const all=E('JSON.stringify(CROWN_SAY)');assert.equal(E('CROWN_SAY.length'),4);
for(const L of JSON.parse(all)){for(const k of ['bold','wary','warm']){assert(L[k]&&L[k].length<=110,k);assert(!/Crownless|become|you are the king|next king|—/i.test(L[k]),L[k]);}}
for(const p of 'FCALSKMV')assert(['bold','wary','warm'].includes(E(`CROWN_TONE.${p}`)),p);
// 5) the longest-serving soldier speaks, in the voice of their personality
run(['K','R::a1.Ike.V.3.2.0.start.0','B::a2.Fang.F.9.1.0.start.0','N::a3.Pike.L.9.0.0.start.0','P']);
const laOn=E('laOn()');
if(laOn){const s=E('JSON.stringify(crownSay(1))');const S=JSON.parse(s);assert.equal(S.who,'Fang · Bishop');assert.equal(S.line,JSON.parse(all)[0].bold);
  assert.equal(JSON.parse(E('JSON.stringify(crownSay(4))')).line,JSON.parse(all)[3].bold);
  run(['K','P','P']);assert.equal(E('crownSay(2)'),null,'An unnamed army says nothing');}
assert.equal(E('crownSay(0)'),null);
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=190);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: army remembered before the run clears, previous king kept, choice gated on a seen ending, true ending frees the army, soldier lines by service and personality with no spoiler, version.');

// v177 balance: Campaign targets read the two best-trained piece types, count scoring Relics/powers,
// keep growing through Circuits 3-4, and give Blitz bosses a floor. Gauntlet, Crown Match and saved fights are unchanged.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const roster=n=>JSON.stringify(['K',...Array.from({length:n-1},(_,k)=>'PNBRQ'[k%5])]);
const set=(o={})=>{const d=Object.assign({land:'street',circuit:'midnight',ante:4,blind:2,journeys:4,armyStages:15,lv:{P:1,N:6,B:1,R:6,Q:1,K:1},n:15,relics:[],bosses:['march','march','tax','mini']},o);
 E(`PACK='${d.land}';MATCH=null;B=null;RUN={land:'${d.land}',circuit:'${d.circuit}',ante:${d.ante},blind:${d.blind},journeys:${d.journeys},armyStages:${d.armyStages},lv:${JSON.stringify(d.lv)},roster:${d.roster||roster(d.n)},relics:${JSON.stringify(d.relics)},bosses:${JSON.stringify(d.bosses)},money:10}`);};
const T=i=>E(`targetParts(${i})`);
// 1. two best-trained types
set();assert.equal(E('armyTrainProgress()'),0.4);assert.equal(E('trainTopTwo()'),1);assert.equal(E('campaignPPM()'),2240);assert.equal(E('capacityPPM()'),1616,'Gauntlet capacity is unchanged');
set({lv:{P:3,N:3,B:3,R:3,Q:3,K:1}});assert.equal(E('campaignPPM()'),E('capacityPPM()'),'An evenly trained army reads exactly as before');
set({lv:{P:1,N:1,B:1,R:1,Q:1,K:1}});assert.equal(E('campaignPPM()'),1200);
set({lv:{P:6,N:6,B:6,R:6,Q:6,K:1}});assert.equal(E('campaignPPM()'),E('capacityPPM()'));
// 2. build factor
set();assert.equal(E('buildFactor()'),1);const base=T(2).final;
set({relics:['opening']});assert.equal(E('buildFactor()'),1.1);assert(Math.abs(T(2).final-base*1.1)<=15,'One multiplier Relic raises the target 10%');
set({relics:['tempo','shuffle','piggy','gold','aegis']});assert.equal(E('buildFactor()'),1,'Money, move, swap and defensive Relics add nothing');
set({relics:['opening','regicide','diagonal','underdog','sweep']});assert.equal(E('buildFactor()'),1.4,'Relic share is capped at +40%');
set({relics:['nope']});assert.equal(E('buildFactor()'),1,'Unknown Relic ids are ignored');
set({roster:JSON.stringify(['K','R:crystal+iron','N:fire','P:thorn','Q:gold'])});assert.equal(+E('buildFactor()').toFixed(2),1.07);
set({roster:JSON.stringify(['K',...Array(14).fill('R:crystal+iron')])});assert.equal(+E('buildFactor()').toFixed(2),1.2,'Power share is capped at +20%');
// 3. late growth: Circuits 1-2 unchanged, Circuits 3-4 and the Ruler rise
for(const [circuit,ante,f] of [['downtown',1,1],['rooftop',4,1],['harbor',1,1.03],['midnight',4,Math.pow(1.03,8)]]){
 set({circuit,ante,blind:0});const stage=E('landStage()');assert.equal(+(E('progressionMoves(0)')/(2.7*Math.pow(1.03,stage-1))).toFixed(6),+f.toFixed(6),circuit+' '+ante);}
set({blind:2});const m4=E('progressionMoves(2)*CIRCUIT_TARGET_SCALE.midnight');set({circuit:'ruler',ante:6,journeys:5,bosses:Array(6).fill('ruler')});
assert(E('progressionMoves(2)*CIRCUIT_TARGET_SCALE.ruler')>=m4*1.049,'The Ruler stays above the final Circuit 4 boss');
// 4. Blitz floor
for(const [circuit,n,lv] of [['harbor',10,5],['midnight',12,6],['midnight',15,6]]){set({circuit,ante:1,n,lv:{P:1,N:lv,B:1,R:lv,Q:1,K:1},bosses:['clock','march','tax','mini']});
 const p=T(2),warm=T(0).final;assert(p.blitz>0);assert(p.final>=Math.min(p.blitz,0.6*warm)-10,'floor '+circuit);assert(p.final<=p.blitz+10,'never above what the army can score inside the limit');}
set({circuit:'downtown',ante:1,journeys:1,armyStages:0,n:8,lv:{P:1,N:1,B:1,R:1,Q:1,K:1},bosses:['clock','march','tax','mini']});assert.equal(T(2).final,170,'The first Blitz boss of a new army is unchanged');
// 5. a brand-new army's first circuit is untouched; targets never fall below v176 for the same army
for(const [ante,want] of [[1,[190,280,370]],[2,[290,440,580]]]){set({circuit:'downtown',ante,journeys:1,armyStages:ante-1,n:8,lv:{P:1,N:1,B:1,R:1,Q:1,K:1}});assert.deepEqual([0,1,2].map(i=>T(i).final),want);}
// 6. saved fights keep their target; Gauntlet and Crown Match do not use the new factors
set({relics:['opening','regicide']});E(`RUN.fightTarget={key:'street|midnight|4|2',t:10720}`);assert.equal(E('targetFor(2)'),10720,'A fight already shown keeps its saved target');
E('RUN=JSON.parse(JSON.stringify(RUN))');assert.equal(E('targetFor(2)'),10720);
set({relics:['opening','regicide','diagonal']});E(`RUN.gauntlet=true;RUN.gId='t';RUN.gWave=12`);const g1=E('gTarget()');E('RUN.relics=[]');assert.equal(E('gTarget()'),g1,'Gauntlet targets ignore the build factor');
assert.equal(E('MATCH_TARGET'),1000);
const source=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(source)&&+RegExp.$1>=177);const v=+RegExp.$1;assert(sw.includes('crownfall-v'+v));assert(!source.includes('?v='+(v-1)));assert(!sw.includes('?v='+(v-1)));
console.log('PASS: top-two Training capacity, Relic/power build factor and caps, late-Land growth, Ruler floor, Blitz floor and limit, untouched first circuit, saved targets, Gauntlet/Crown Match isolation and version.');

// v230 The Daily Run replaces the endless Gauntlet: 10 seeded waves, a 1-of-3 reward after each, a daily score and streak.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert.equal(E('DAILY_WAVES'),10);assert.deepEqual(JSON.parse(E('JSON.stringify(DAILY_DIFF)')),[1,3,5,8,10,13,15,18,21,25]);
assert.match(E('dailyToday()'),/^\d{4}-\d{2}-\d{2}$/);
// the same day gives everyone the same waves and armies; another day differs
const plan=(date)=>E(`(()=>{MATCH=null;B=null;RUN={gauntlet:true,daily:'${date}',gWave:1,gWaveSet:0,roster:['K','N','B','P','P','P','P'],money:6,lives:3,relics:[],cards:[],lv:{P:1,N:1,B:1,R:1,Q:1,K:1},gId:'t'};const out=[];
 for(let w=1;w<=10;w++){RUN.gWave=w;RUN.gWaveSet=0;const r=dailySeed('wave'+w);try{gPrepWave()}finally{r()}const b=deploy(RUN.roster);const s=dailySeed('army'+w);let en='';try{setupEnemyArmy(b);en=b.map((q,i)=>q&&q.side==='en'?q.t+i:'').join('')}finally{s()}
 out.push([RUN.land,RUN.circuit,RUN.ante,RUN.bosses.join('/'),en].join('|'));}return JSON.stringify(out)})()`);
const a1=JSON.parse(plan('2026-11-19')),a2=JSON.parse(plan('2026-11-19')),b1=JSON.parse(plan('2026-11-20'));
assert.deepEqual(a1,a2,'same date, same run');assert.notDeepEqual(a1,b1,'next day, a new run');
assert.deepEqual(a1.map(x=>x.split('|')[0]),['street','street','medieval','medieval','greek','greek','fantasy','fantasy','throne','throne'],'two waves in each Land');
for(const [i,x] of a1.entries()){const [l,circ,ante]=x.split('|');if(i===4||i===9){assert.notEqual(circ,'downtown');assert.equal(ante,'4','boss waves 5 and 10');}}
// difficulty follows the curve, not the wave number
E("RUN.gWave=10");assert.equal(E('gDiff()'),25);E("RUN.gWave=1");assert.equal(E('gDiff()'),1);E("RUN.daily=null;RUN.gWave=10");assert.equal(E('gDiff()'),10,'endless curve for old runs');
// rewards: three from the date, applied
E(`RUN={gauntlet:true,daily:'2026-11-19',gWave:4,roster:['K','N','B','P','P','P','P'],money:6,lives:2,relics:[],cards:[],lv:{P:1,N:1,B:1,R:1,Q:1,K:1}}`);
const o1=E('JSON.stringify(dailyOffers(3))'),o2=E('JSON.stringify(dailyOffers(3))');assert.equal(o1,o2,'same offers for the same wave and day');
const offers=JSON.parse(o1);assert.equal(offers.length,3);assert.equal(new Set(offers.map(o=>o.k)).size,3,'three different kinds');
for(const o of offers){const [t,d]=JSON.parse(E(`JSON.stringify(dailyOfferText(${JSON.stringify(o)}))`));assert(t&&d,o.k);}
E("dailyApply({k:'recruit',t:'R'})");assert.equal(E("RUN.roster.filter(r=>parseR(r).t==='R').length"),1);
E("dailyApply({k:'train',t:'N'})");assert.equal(E('RUN.lv.N'),2);E("RUN.lv.N=LV_MAX;dailyApply({k:'train',t:'N'})");assert.equal(E('RUN.lv.N'),E('LV_MAX'),'level cap');
E("dailyApply({k:'heal'})");assert.equal(E('RUN.lives'),3);E("dailyApply({k:'heal'})");assert.equal(E('RUN.lives'),3,'never above 3');
E("dailyApply({k:'relic',id:'cavalry'})");assert.deepEqual(JSON.parse(E('JSON.stringify(RUN.relics)')),['cavalry']);
E("RUN.lives=3;RUN.relics=['a','b','c','d','e'];RUN.cards=['x','y'];RUN.lv={P:6,N:6,B:6,R:6,Q:6,K:1}");const full=JSON.parse(E('JSON.stringify(dailyOffers(4))'));assert(full.every(o=>o.k==='recruit'),'only what still fits is offered');
// score, records, streak
E("RUN={gauntlet:true,daily:'2026-11-19',gWave:11,dScore:12345,money:7}");assert.deepEqual(JSON.parse(E('JSON.stringify(dailyScore(RUN,true))')),{cleared:10,cash:7,score:12345+10000+3000+700});
E("RUN.gWave=4;RUN.money=0");assert.equal(E('dailyScore(RUN,false).score'),12345+3000);
const today=E('dailyToday()'),day=n=>E(`(()=>{const d=new Date();d.setDate(d.getDate()-${n});return \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`})()`);
E(`localStorage.removeItem('crownfall-daily')`);assert.equal(E('dailyStreak()'),0);
E(`localStorage.setItem('crownfall-daily',JSON.stringify({days:{'${day(1)}':{best:900,finished:true},'${day(2)}':{best:500,finished:true},'${day(4)}':{best:5,finished:true}}}))`);
assert.equal(E('dailyStreak()'),2,'yesterday and the day before (today not played yet keeps it alive)');
E(`RUN={gauntlet:true,daily:'${today}',gWave:6,dScore:4000,money:0}`);let r=JSON.parse(E('JSON.stringify(dailyRecord(RUN,false))'));
assert.equal(r.score,9000);assert.equal(r.cleared,5);assert.equal(r.streak,3);assert.equal(r.newBest,true);assert.equal(r.bestEver,9000);
E(`RUN={gauntlet:true,daily:'${today}',gWave:3,dScore:10,money:0}`);r=JSON.parse(E('JSON.stringify(dailyRecord(RUN,false))'));assert.equal(r.newBest,false);assert.equal(r.best,9000,'the day keeps its best');
assert.equal(JSON.parse(E("localStorage.getItem('crownfall-daily')")).days[today].plays,2);
assert(E("JSON.stringify(G_SHARED)").includes('crownfall-daily'),'readable from the Campaign title too');
// wiring
for(const x of ["return dailyWin(vScore, vLog, laRes, mate, captureFinish);","return dailyFinish(false, why);","const dSeed = RUN.gauntlet && RUN.daily && !MATCH ? dailySeed('army' + RUN.gWave) : null;","if(dSeed) dSeed();",
  "if(RUN.dPick) return dailyPick(gNextWave);","<b>Daily Run</b><small>Ten waves, the same for everyone today. A new run every day.</small>","$('#grec').onclick = () => dailyRecords();","daily:dailyToday(), dScore:0});"])assert(src.includes(x),x);
assert(!src.includes('Enter the Gauntlet')&&!src.includes('One army. Endless challengers.'),'the endless Gauntlet is gone from view');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=230&&sw.includes("'crownfall-v"+RegExp.$1+"'")&&!src.includes('?v=229'));
console.log('PASS: 10 seeded waves (same run per date, two per Land, bosses at 5 and 10), difficulty curve, 1-of-3 rewards from the date, score with cash bonus, daily best, plays and streak, title and routing, version.');

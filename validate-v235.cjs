// v235 The Hunger bargains only sometimes: 1 in 4 eligible Stage Battles, never twice in a row, at most 6 quiet ones between.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=235&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
// walk whole campaigns (Lands 2-5 have a crown: 4 Circuits x 4 Stage Battles each) for many epochs
const walk=ep=>JSON.parse(E(`(()=>{MATCH=null;ACH.campaign_epoch=${ep};ACH.ngplus=0;ACH.edicts=['hungry'];ACH.hunger=null;
  RUN={land:'street',circuit:'downtown',ante:1,blind:2,money:30,relics:[],roster:['K']};const seq=[];
  for(const land of ['medieval','greek','fantasy','throne'])for(const circuit of ['downtown','rooftop','harbor','midnight'])for(let ante=1;ante<=4;ante++){
    Object.assign(RUN,{land,circuit,ante,blind:2});if(!hungerDue())throw new Error('not due');RUN.pactKey=hungerKey();seq.push(hungerComes()?1:0);}
  return JSON.stringify(seq)})()`));
let total=0,n=0,worstQuiet=0;
for(let ep=0;ep<200;ep++){const s=walk(ep);n++;total+=s.reduce((a,b)=>a+b,0);
  for(let i=1;i<s.length;i++)assert(!(s[i]&&s[i-1]),`epoch ${ep}: two Stage Battles in a row`);
  let q=0;for(const x of s){q=x?0:q+1;worstQuiet=Math.max(worstQuiet,q);} }
const avg=total/n;
assert(avg>=10&&avg<=19,`about 1 in 4 of 64 Stage Battles (avg ${avg.toFixed(1)})`);
assert(worstQuiet<=6,`never more than 6 quiet Stage Battles (${worstQuiet})`);
// decided once per Stage Battle: a retry (same key) is never offered again; the same campaign and battle always rolls the same
E("ACH.campaign_epoch=3;ACH.edicts=['hungry'];ACH.hunger={ep:3,fed:0,refused:0,gap:0};RUN={land:'greek',circuit:'harbor',ante:2,blind:2,money:30,relics:[],roster:['K']}");
const r1=E("hungerRoll()"),r2=E("hungerRoll()");assert.equal(r1,r2);
assert.equal(E('hungerDue()'),true);E("hungerAsk(()=>{})");assert.equal(E('hungerDue()'),false,'no re-roll on retry');assert.equal(E('hungerTally().gap'),1,'right after a bargain the next one is quiet');
assert.notEqual(E("(ACH.campaign_epoch=4,hungerRoll())"),r1,'another campaign rolls differently');
// the count survives a new army (a new Circuit or Land): it lives in the campaign's Hunger record
E("ACH.hunger={ep:ACH.campaign_epoch||0,fed:0,refused:0,gap:0};RUN={land:'fantasy',circuit:'downtown',ante:1,blind:2,money:30,relics:[],roster:['K']};RUN.pactKey=null");assert.equal(E('hungerComes()'),false,'never right after one, even in a new army');
// the old eligibility still applies (no crown, not the Daily Run, only Stage Battles)
for(const k of Object.keys(JSON.parse(E('JSON.stringify(ACH)'))))if(/^crown_/.test(k))E(`delete ACH['${k}']`);
E("ACH.edicts=[];RUN={land:'street',circuit:'harbor',ante:2,blind:2,money:30,relics:[],roster:['K']}");assert.equal(E('hungerDue()'),false);E("RUN.blind=1;ACH.edicts=['hungry']");assert.equal(E('hungerDue()'),false,'only Stage Battles');E("ACH.edicts=[]");
assert.equal(E('HUNGER_FED_ACH'),6);assert(src.includes("Take 6 of the Hunger’s bargains in one campaign."));
console.log(`PASS: the Hunger comes ${avg.toFixed(1)} times per campaign on average (of 64 eligible Stage Battles), never twice in a row, at most ${worstQuiet} quiet in between; decided once per battle, stable on retry; Well Fed at 6; version`);

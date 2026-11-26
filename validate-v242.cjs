// v242 "Previously…": after 3+ days away, Continue Campaign shows a recap first (once per visit).
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=242&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
E(`(()=>{MATCH=null;ACH.cdiff='hard';ACH.ngplus=1;ACH.edicts=['iron'];for(const k of Object.keys(ACH))if(/^crown_/.test(k))delete ACH[k];BASE_LANDS.slice(0,2).forEach(l=>ACH[landCrownId(l)]=1);
  ACH.hunger={ep:ACH.campaign_epoch||0,fed:3,refused:1,gap:1,taken:['Tess']};setPack('greek');newRun('harbor');RUN.ante=2;RUN.lives=2;RUN.money=14;return 0})()`);
const day=864e5;
E(`awayFrom=Date.now()-2*${day};recapSeen=false`);assert.equal(E('recapDue()'),false,'2 days: no recap');
E(`awayFrom=Date.now()-3*${day}-1000`);assert.equal(E('recapDue()'),true,'3 days: recap');
E(`awayFrom=0`);assert.equal(E('recapDue()'),false,'never saved: no recap');
E(`awayFrom=Date.now()-5*${day};recapSeen=true`);assert.equal(E('recapDue()'),false,'once per visit');E('recapSeen=false');
assert(src.includes("const recapDue = () => MODE === 'campaign' &&"),'campaign only');
const h=E('recapHTML()');
for(const x of ['5 days away','Previously','Olympian Court','World Crowns','2 / 4','Hard · New Game+','pieces · 2 lives · $14','Iron Rulers','You fed it 3, refused it 1.','It took Tess.','id="recapGo"'])assert(h.includes(x),`recap shows: ${x}\n${h}`);
E(`awayFrom=Date.now()-20*${day}`);assert(E('recapHTML()').includes('It has been a while'));
// no Hunger line before any bargain; no Campaign line on Normal at the first cycle
E("ACH.hunger={ep:ACH.campaign_epoch||0,fed:0,refused:0};ACH.cdiff=undefined;ACH.ngplus=0;ACH.edicts=[]");const q=E('recapHTML()');
assert(!q.includes('The Hunger')&&!q.includes('>Campaign<')&&!q.includes('Edicts'));
assert(src.includes("if(recapDue()) return recapShow(continueCampaign);   // v242"));
assert(!/crownless|was once a crownrunner|takes its kings/i.test(src.slice(src.indexOf('function recapHTML'),src.indexOf('function recapShow'))),'no spoilers');
console.log('PASS: recap after 3+ days away (once per visit, campaign only): where, crowns, difficulty/cycle, army, Edicts, the Hunger and who it took; no spoilers; version');

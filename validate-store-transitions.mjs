// UI/DOM regression harness: real game handlers, deterministic positions.
// Runs the real transitions with sound off and animation API stubbed. Requires happy-dom.
const {Window}=await import(process.env.CROWNFALL_DOM_MODULE||'happy-dom');
import fs from 'node:fs';import assert from 'node:assert/strict';
const window=new Window({url:'http://localhost:8018/',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableJavaScriptEvaluation:true}});
window.addEventListener('error',e=>console.error('DOM error',e.error));
window.matchMedia=()=>({matches:true,addEventListener(){}});window.fetch=async()=>{throw Error('offline test');};
window.HTMLElement.prototype.animate=()=>({finished:Promise.resolve(),cancel(){}});
if(process.env.CROWNFALL_TEST_MODE==='gauntlet')window.localStorage.setItem('crownfall-mode','gauntlet');
if(process.env.CROWNFALL_TEST_MODE==='gauntlet')window.localStorage.setItem('cf151c-crownfall-carry',JSON.stringify({roster:['K','R'],money:172}));
const html=fs.readFileSync('index.html','utf8');window.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''));
for(const file of ['gameplay-polish.js','piece-designs.js','character-style.js','campaign-opponents.js','campaign-dialogue.js'])window.eval(fs.readFileSync(file,'utf8')+(file==='campaign-opponents.js'?';window.campaignOpponentName=campaignOpponentName;':''));
const bridge = `
window.__storeTest={
 setup(){soundOn=false;musicOn=false;MATCH=null;PACK='street';newRun('downtown');RUN.money=172;RUN.ante=2;B=null;genShop();shop();},
 state:()=>JSON.stringify({shop:RUN.shop,money:RUN.money,roster:RUN.roster,restocks:RUN.restocks,ante:RUN.ante,land:RUN.land}),
 resume(){loadRun();continueCampaign();},
 carry(nextLand){storeCarry();clearRun();if(nextLand) {ACH[landCrownId('street')]=1;saveAch();}circuitSelect(nextLand||'street');},
 run:()=>({land:RUN.land,money:RUN.money,inShop:RUN.inShop,carried:RUN.carried})
};`;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/src=/.test(m[1])){let s=m[2];if(s.includes('const GAME_VERSION')){const at=s.lastIndexOf('})();');s=s.slice(0,at)+bridge+s.slice(at);}window.eval(s);}


const api=window.__storeTest,$=s=>window.document.querySelector(s);
api.setup();
const buy=$('[data-buy]:not([disabled])');assert(buy);buy.click();
const bought=api.state();
$('#next').click();assert($('#stageShop'),'Stage offers store access');
$('#stageShop').click();assert.equal(api.state(),bought,'Reopening preserves purchases, stock, money and stage');
api.resume();assert.equal(api.state(),bought,'Reload preserves store');
$('#next').click();api.resume();assert($('#stageShop'),'Stage reload keeps store available');
api.carry();assert($('#cshop'),'Between circuits offers store');$('#cshop').click();
assert($('.shopscr'),'Selected circuit opens store');assert(api.run().carried);
const money=api.run().money;
api.carry('medieval');$('#cgo').click();
assert($('.shopscr'),'Entering next area opens store');assert.equal(api.run().land,'medieval');assert.equal(api.run().money,money);
$('#next').click();assert($('#play'));assert($('#stageShop'));assert.equal(api.run().land,'medieval');
console.log('PASS: stage store revisit, purchases, reload, circuit entry and area entry.');
await window.happyDOM.abort();window.close();

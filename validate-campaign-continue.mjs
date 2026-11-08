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
window.__campaignTest={
 seed(){soundOn=false;musicOn=false;MATCH=null;PACK='street';newRun('downtown');RUN.money=172;storeCarry();ACH[conqKey('street','downtown')]=1;saveAch();clearRun();},
 title:()=>title(),intent:()=>modeIntent(),
 state:()=>JSON.stringify({carry:getCarry(),ach:ACH}),
};`;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/src=/.test(m[1])){let s=m[2];if(s.includes('const GAME_VERSION')){const at=s.lastIndexOf('})();');s=s.slice(0,at)+bridge+s.slice(at);}window.eval(s);}


const api=window.__campaignTest,$=s=>window.document.querySelector(s);
if(process.env.CROWNFALL_TEST_MODE==='gauntlet'){
 assert($('#cont'),'Gauntlet title offers continuation of between-circuit campaign');
 $('#cont').click();
 assert.equal(window.localStorage.getItem('crownfall-mode'),'campaign');
 assert.equal(window.localStorage.getItem('crownfall-intent'),'cont');
 console.log('PASS: Gauntlet routes saved campaign to campaign continuation.');
 await window.happyDOM.abort();window.close();process.exit(0);
}
assert(!$('#cont'),'Fresh install has no campaign to continue');
api.seed();api.title();
const before=api.state();
assert($('#cont'),'Between circuits still offers Continue Campaign');
assert($('#app').textContent.includes('$172'),'Saved money remains visible');
$('#cont').click();
assert($('#app').textContent.includes('Choose a land'),'Continue opens the campaign map');
assert.equal(api.state(),before,'Continue preserves army and campaign progress');
api.title();window.localStorage.setItem('crownfall-intent','cont');api.intent();
assert($('#app').textContent.includes('Choose a land'),'Cross-mode continue intent opens map');
assert.equal(api.state(),before);
console.log('PASS: between-circuit campaign continuation and mode intent preserve progress.');
await window.happyDOM.abort();window.close();

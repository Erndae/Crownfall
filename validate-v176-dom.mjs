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
window.__guards={
 setup(l){soundOn=false;musicOn=false;MATCH=null;PACK=l;newRun('harbor');RUN.ante=3;window.__noRoll=true;startBlind();oppEntrance(bossObj(bossId()),'boss');},
 state:()=>JSON.stringify({ids:B.guardIds,left:guardsLeft(),score:B.score,target:B.target,goal:goalText()}),
 reload(){save();loadRun();playBlind(true);},
 old(){delete B.guardIds;save();loadRun();playBlind(true);},
};`;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/src=/.test(m[1])){let s=m[2];if(s.includes('const GAME_VERSION')){const at=s.lastIndexOf('})();');s=s.slice(0,at)+bridge+s.slice(at);}window.eval(s);}
const api=window.__guards;
for(const land of ['greek','fantasy','throne']){
 api.setup(land);
 assert.equal(window.document.querySelectorAll('.guard-mark').length,2,'Two visible board markers');
 assert(window.document.querySelector('.guard-brief').textContent.includes('Remove both'));
 assert(window.document.querySelector('#goalInfo').textContent.includes('DEFENDERS'));
 const before=api.state();api.reload();assert.equal(api.state(),before,'Reload preserves objective and identities');
 assert.equal(window.document.querySelectorAll('.guard-mark').length,2);
 api.old();assert.equal(window.document.querySelectorAll('.guard-mark').length,0,'Old save does not acquire new defenders');
}
console.log('PASS: three real Guard openings render two labeled markers, announce objective, preserve saved markers and leave old battles unchanged.');
await window.happyDOM.abort();

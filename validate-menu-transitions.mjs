// UI/DOM regression harness: real game handlers, deterministic positions.
// Runs the real transitions with sound off and animation API stubbed. Requires happy-dom.
const {Window}=await import(process.env.CROWNFALL_DOM_MODULE||'happy-dom');
import fs from 'node:fs';import assert from 'node:assert/strict';
const window=new Window({url:'http://localhost:8018/',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableJavaScriptEvaluation:true}});
window.addEventListener('error',e=>console.error('DOM error',e.error));
window.matchMedia=()=>({matches:true,addEventListener(){}});window.fetch=async()=>{throw Error('offline test');};
window.HTMLElement.prototype.animate=()=>({finished:Promise.resolve(),cancel(){}});
if(process.env.CROWNFALL_TEST_MODE==='gauntlet')window.localStorage.setItem('crownfall-mode','gauntlet');
const html=fs.readFileSync('index.html','utf8');window.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''));
for(const file of ['gameplay-polish.js','piece-designs.js','character-style.js','campaign-opponents.js','campaign-dialogue.js'])window.eval(fs.readFileSync(file,'utf8')+(file==='campaign-opponents.js'?';window.campaignOpponentName=campaignOpponentName;':''));
const bridge = `
window.__freezeTest={
 setup(){soundOn=false;musicOn=false;MATCH=null;PACK='street';newRun('downtown');RUN.ante=1;RUN.blind=2;window.__noRoll=true;coachMark('score');startBlind();},
 pendingRoll(){B.roll={state:"pending"};busy=true;}, setBusy:v=>{busy=v;}, loss:()=>gameOver('You conceded the round.'), gauntlet(){soundOn=false;musicOn=false;RUN=null;B=null;window.__noRoll=true;gNewRun();document.querySelector('#gstart').click();}, title:()=>title(),menu:()=>gameMenu(),halt:()=>enemyHaltPanel(()=>{}),
 state:()=>({busy,run:JSON.stringify(RUN),b:JSON.stringify(B)}),
 dirty(){busy=true;for(const cls of ['vict out','oppin','lachat','laring','carrive','peekbar']){const el=document.createElement('div');el.className=cls;document.body.appendChild(el);}document.body.classList.add('peeking');},
 shop(){B=null;shop();},
 win(){B.score=B.target;winBlind();},
 preview(){const m=modal('<button id="peek">Review</button>');addPeek(m,B.log);m.querySelector('#peek').click();},
};`;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/src=/.test(m[1])){let s=m[2];if(s.includes('const GAME_VERSION')){const at=s.lastIndexOf('})();');s=s.slice(0,at)+bridge+s.slice(at);}window.eval(s);}

const api=window.__freezeTest,$=s=>window.document.querySelector(s),wait=ms=>new Promise(r=>setTimeout(r,ms));
window.__msgScale=.001;
if(process.env.CROWNFALL_TEST_MODE==='gauntlet'){
 api.gauntlet();api.win();api.title();await wait(1000);assert(!$('.vicm,.vict'),'Old Gauntlet victory stays off title');assert($('#gcont'),'Gauntlet remains resumable');
 console.log('PASS: Gauntlet victory-to-title keeps saved progress without stale reward overlays.');await window.happyDOM.abort();window.close();process.exit(0);
}

api.setup();api.setBusy(true);api.menu();const exit=$('#ttl');exit.click();
assert(exit.disabled,'Exit waits while an active move resolves');assert(!$('#new'),'Title must not reload an in-flight board');
api.setBusy(false);await wait(100);assert($('#new'),'Exit completes after the move settles');
api.setup();api.pendingRoll();api.menu();$('#ttl').click();assert($('#new'),'Pending initiative can exit without waiting for a menu-blocked roll');
api.setup();api.halt();api.menu();$('#ttl').click();
assert(!$('.modal'),'Returning to title removes the underlying enemy-interruption dialog');
assert($('#new'),'Title buttons are present');
api.setup();api.dirty();api.title();
assert(!$('.vict,.oppin,.lachat,.laring,.carrive,.peekbar'),'No battle overlay survives title');
assert(!window.document.body.classList.contains('peeking'));
assert.equal(api.state().busy,false,'Title releases completed UI locks');
await wait(1900);
assert(!$('#speech'),'Delayed opponent speech cannot reappear on title');
api.setup();api.preview();api.shop();
assert(!$('.peekbar'),'Shop clears board replay controls');
assert(!window.document.body.classList.contains('peeking'));
api.setup();api.win();const saved=window.localStorage.getItem('gambit-run');api.title();await wait(1000);
assert(!$('.vicm,.vict'),'An old victory cannot put rewards over the title');
assert.equal(window.localStorage.getItem('gambit-run'),saved,'Navigation leaves committed rewards intact');
for(let i=0;i<6;i++){
 api.setup();api.loss();$('#home').click();assert(!$('.modal,.peekbar,.vict'));assert($('#new'));
}
api.setup();api.win();await wait(1000);assert($('.vicm #cash'),'Victory still offers winnings');$('.vicm #cash').click();assert($('.shopscr'),'Collect opens shop');assert(!$('.vict,.vicm'));

console.log('PASS: nested pause/interruption exit, stale overlays/input lock, delayed speech, replay-to-shop, victory-to-title and saved rewards.');
await window.happyDOM.abort();window.close();

// UI/DOM regression harness: real game handlers, deterministic positions.
// Animation, sound and the enemy reply are stubbed; chess legality/scoring stay real.
const {Window}=await import(process.env.CROWNFALL_DOM_MODULE||'happy-dom');
import fs from 'node:fs';import assert from 'node:assert/strict';
const window=new Window({url:'http://localhost:8018/',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableJavaScriptEvaluation:true}});
window.matchMedia=()=>({matches:true,addEventListener(){}});window.fetch=async()=>{throw Error('offline test');};
window.HTMLElement.prototype.animate=()=>({finished:Promise.resolve(),cancel(){}});
const html=fs.readFileSync('index.html','utf8');window.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''));
for(const file of ['gameplay-polish.js','piece-designs.js','character-style.js','campaign-opponents.js','campaign-dialogue.js'])window.eval(fs.readFileSync(file,'utf8')+(file==='campaign-opponents.js'?';window.campaignOpponentName=campaignOpponentName;':''));
const bridge=`
window.__polishTest={
 setup(){soundOn=false;musicOn=false;MATCH=null;PACK='street';newRun('downtown');RUN.ante=2;RUN.blind=2;RUN.money=40;RUN.lives=3;window.__noRoll=true;startBlind();B.board=Array(64).fill(null);B.board[60]={t:'K',side:'me',id:1};B.board[42]={t:'N',side:'me',id:2};B.board[48]={t:'P',side:'me',id:3};B.board[4]={t:'K',side:'en',id:4};B.board[25]={t:'R',side:'en',id:5};B.board[16]={t:'P',side:'en',id:6};B.target=1000;B.score=0;B.crates=[];B.initPhase=false;B.roll={state:'done',first:'me'};B.log=[{s:posKey(B.board),k:'fx',f:-1,t:-1,n:'Start'}];playBlind(true);animateMove=async()=>{};playScore=async r=>{B.score+=r.total;};endTurn=async()=>{busy=false;sel=null;save();drawBoard();};},
 tap:i=>tapSquare(i),info:()=>battleInfo(),
 state:()=>({money:RUN.money,score:B?.score,selected:sel,preview:!!movePreview,squares:B?.board.map(x=>x?.t||'.').join(''),level:RUN.lv.P,confirm:confirmMoves()}),
 stale(){B.board=B.board.slice();drawBoard();},
 loss(){B.log.push({s:posKey(B.board),k:'me',f:42,t:25,n:'Knight takes Rook on b5'});B.log.push({s:posKey(B.board),k:'en',f:4,t:12,n:'Enemy King to e7, check'});B.log.push({s:posKey(B.board),k:'fx',f:12,t:12,n:'Armor breaks'});gameOver('Checkmate. Your King is trapped.');},
 shop(){document.querySelectorAll('.modal,.peekbar').forEach(x=>x.remove());document.body.classList.remove('peeking');PACK='street';newRun('downtown');B=null;RUN.money=100;RUN.shop=[{kind:'piece',t:'P'},{kind:'relic',id:'cavalry'}];shop();},
 actual(circuit,ante,land){PACK=land;newRun(circuit);RUN.ante=ante;RUN.blind=2;B=null;startBlind();return {sig:B.ai.sig,enemyKings:B.board.filter(x=>x?.side==='en'&&x.t==='K').length,playerKings:B.board.filter(x=>x?.side==='me'&&x.t==='K').length,brief:encounterHTML()};},
 encounter(circuit,ante,land='street'){PACK=land;newRun(circuit);RUN.ante=ante;RUN.blind=2;return {profile:enemyProfile(),plan:campaignBossPlan(RUN)};}
};`;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/src=/.test(m[1])){let s=m[2];if(s.includes('const GAME_VERSION')){const at=s.lastIndexOf('})();');s=s.slice(0,at)+bridge+s.slice(at);}window.eval(s);}
window.setTimeout=()=>0;
const api=window.__polishTest,$=s=>window.document.querySelector(s);
api.setup();assert.match($('#goalLabel').textContent,/Checkmate or 1,000/);
const before=api.state();await api.tap(42);await api.tap(25);assert(api.state().preview);assert.equal(api.state().squares,before.squares);assert.equal(api.state().money,before.money);assert.equal(api.state().score,0);assert.match($('#pinfo').textContent,/Estimated \+160 points/);assert.match($('#pinfo').textContent,/Enemy attacks/);
$('#cancelPreview').click();assert(!api.state().preview);assert.equal(api.state().score,0);await api.tap(25);api.stale();assert(!api.state().preview);await api.tap(25);assert(api.state().preview);await api.tap(25);assert.equal(api.state().score,160);assert(!api.state().preview);
console.log('PASS: destination previews are nonmutating, show score/threat, cancel, reject stale positions and commit once.');
api.info();$('#confirmMoves').click();assert.equal(api.state().confirm,false);$('#goalClose').click();api.setup();await api.tap(42);await api.tap(25);assert.equal(api.state().score,160,'Quick moves commit on first destination tap');
console.log('PASS: move confirmation is switchable and remembered; battle objectives stay available.');
api.setup();api.loss();assert.match($('.loss-review').textContent,/King ran out of safe replies/);assert.match($('.loss-review').textContent,/Enemy King to e7/);assert($('#retry'));$('#peek').click();assert.match($('#rnote').textContent,/Enemy King to e7/);assert.equal($('.sq.lastte')!==null,true);$('#unpeek').click();assert($('.modal'));
console.log('PASS: defeat explains cause, keeps life retry and opens replay at the last enemy exchange.');
api.shop();assert.match($('[data-shop-anchor="training-P"]').textContent,/Base capture 30 → 80 points/);$('[data-train="P"]').click();assert.equal(api.state().level,2);assert.equal(api.state().money,92);assert.match($('[data-shop-anchor="training-P"]').textContent,/Upgraded to Lv.2/);$('[data-buy="0"]').click();assert.match($('.offer.sold').textContent,/Pawn.*Purchased/);
console.log('PASS: store shows real before/after gains, purchases train for $8 and compact sold receipts retain item identities.');
for(const land of ['street','medieval','greek','fantasy','throne'])for(const circuit of ['downtown','rooftop','harbor','midnight'])for(let ante=1;ante<=4;ante++){const e=api.encounter(circuit,ante,land);assert.equal(e.profile.sig,e.plan.signature);assert.equal(e.profile.style,e.plan.style);}
console.log('PASS: all 80 campaign circuit profiles match their tactical plans.');
for(const land of ['street','medieval','greek','fantasy','throne'])for(const circuit of ['rooftop','harbor']){const e=api.actual(circuit,2,land);assert.equal(e.enemyKings,1);assert.equal(e.playerKings,1);assert(e.brief.includes(window.CrownfallPolish.formation(e.sig).title));}
console.log('PASS: 10 actual cross-land battle openings keep both Kings and brief the accepted formation.');
await window.happyDOM.abort();window.close();

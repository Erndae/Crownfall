// UI/DOM regression harness: real game handlers, deterministic positions.
// Animation, sound and the enemy reply are stubbed; chess legality/scoring stay real.
const {Window}=await import(process.env.CROWNFALL_DOM_MODULE||'happy-dom');
import fs from 'node:fs';import assert from 'node:assert/strict';
const window=new Window({url:'http://localhost:8018/',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableJavaScriptEvaluation:true}});
window.matchMedia=()=>({matches:true,addEventListener(){}});window.fetch=async()=>{throw Error('offline test');};
window.HTMLElement.prototype.animate=()=>({finished:Promise.resolve(),cancel(){}});
const html=fs.readFileSync('index.html','utf8');window.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''));
for(const file of ['gameplay-polish.js','piece-designs.js','character-style.js','campaign-opponents.js','campaign-dialogue.js'])window.eval(fs.readFileSync(file,'utf8')+(file==='campaign-opponents.js'?';window.campaignOpponentName=campaignOpponentName;':''));
const bridge = `
window.__cityTest = {
  start(stage, circuit='downtown', pawns=true){
    Math.random = (()=>{let seed=123;return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);})();
    soundOn=false; musicOn=false; MATCH=null; PACK='street'; B=null;
    newRun(circuit); RUN.ante=stage; RUN.blind=2;
    if(!pawns) RUN.roster=RUN.roster.filter(s=>parseR(s).t!=='P');
    window.__noRoll=true; startBlind();
    return this.state();
  },
  state(){
    const event=B.cityEncounter;
    return {event, position:posKey(B.board), check:inCheck(B.board,'me')||inCheck(B.board,'en'),
      legal:anyLegal(B.board,'me')&&anyLegal(B.board,'en'),
      marked:B.board.findIndex(p=>p&&p.id===event?.pieceId)};
  },
  reload(){save();loadRun();return this.state();},
  promote(marked){
    const p = B.board.find(q=>q?.side==='me'&&q.t==='P'&&((q.id===B.cityEncounter.pieceId)===marked));
    keepPromotion({...p,t:'Q'}, 0);
    return B.cityEncounter.done;
  },
  hold(move, occupied){
    B.moveCount=move;
    B.board[35]=occupied?{side:'me',t:'P',id:2001}:null;
    B.board[36]=occupied?{side:'me',t:'P',id:2002}:null;
    trackCityHoldout();
    return B.cityEncounter.streak;
  },
  reward(){
    const before=RUN.money;
    winBlind();
    return RUN.money-before;
  }
};`;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/src=/.test(m[1])){let s=m[2];if(s.includes('const GAME_VERSION')){const at=s.lastIndexOf('})();');s=s.slice(0,at)+bridge+s.slice(at);}window.eval(s);}
window.setTimeout=()=>0;

const api=window.__cityTest;
assert.equal(api.start(1).event,undefined);
assert.equal(api.start(4,'harbor').event,undefined);
assert.equal(api.start(2,'downtown',false).event.pieceId,null);

for(let run=0;run<2;run++){
 const escort=api.start(2);
 assert.equal(escort.event.name,'Escort');
 assert(escort.marked>=0);
 assert.equal(api.promote(false),false);
 assert.equal(api.promote(true),true);
 assert.equal(api.reload().event.done,true);

 const ambush=api.start(3);
 assert.equal(ambush.event.name,'Ambush');
 assert(ambush.marked>=18&&ambush.marked<40);
 assert(!ambush.check&&ambush.legal);
 assert.equal(api.reload().position,ambush.position);

 assert.equal(api.start(4).event.name,'Holdout');
 assert.equal(api.hold(0,true),0,'Initiative does not count');
 assert.equal(api.hold(1,true),1);
 assert.equal(api.hold(1,true),1,'A reply can only count once');
 assert.equal(api.hold(2,false),0);
 assert.equal(api.hold(3,true),1);
 assert.equal(api.reload().event.streak,1);
 assert.equal(api.hold(4,true),2);
 assert.equal(api.hold(5,true),3);
 assert.equal(api.hold(6,false),3,'Completed objective is retained');
}

api.start(2);
const regular = api.reward();
api.start(2);api.promote(true);
assert.equal(api.reward(),regular+3,'A completed Escort pays $3 only on victory');
console.log('PASS: two downtown encounter cycles, safe Ambush, save/resume, optional rewards, Holdout resets, and stage/circuit exclusions.');
await window.happyDOM.abort();window.close();

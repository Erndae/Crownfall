// v168 regression: run the real game in a DOM, comparing v167 with v168.
import fs from 'node:fs';import assert from 'node:assert/strict';
const {Window}=await import(process.env.CROWNFALL_DOM_MODULE||'happy-dom');
const bridge=`window.__v168={
 seed(n){let x=n;Math.random=()=>((x=(x*1664525+1013904223)>>>0)/4294967296);},
 fresh(l='street',c='downtown',stage=1,seed=1){soundOn=false;musicOn=false;MATCH=null;B=null;PACK=l;document.body.dataset.pack=l;setCarry(null);setCheckpoint(null);this.seed(seed);newRun(c);RUN.ante=c==='ruler'?nStages():stage;RUN.blind=2;enterLand();return this.inspect();},
 inspect(){const id=bossId(),boss=bossObj(id),p=personaOf(id);return {id,rules:ruleOf(id),chips:bossChips(id),limit:moveLimitFor(parFor()),target:targetFor(2),role:typeof opponentRole==='function'?opponentRole(boss):null,tier:oppTier(boss),name:bossName(id),persona:p,portrait:p?portrait(p):null,plan:campaignBossPlan(RUN),bosses:RUN.bosses.slice()};},
 base(){const id=RUN.bosses[0],flag=RUN.introRuleFree;RUN.bosses[0]='thief';RUN.introRuleFree=false;const t=targetParts(2).final;RUN.bosses[0]=id;RUN.introRuleFree=flag;return t;},
 start(){window.__noRoll=true;startBlind();return this.battle();},
 battle(){return {target:B?.target,limit:B?.moveLimit,ai:B?.ai,rules:ruleOf(bossId()),chips:bossChips(bossId()),name:bossName(bossId()),b:JSON.stringify(B),run:JSON.stringify(RUN)};},
 refresh(){save();loadRun();enterLand();return B?this.battle():this.inspect();},
 retry(){loseLife('Test retry');document.querySelector('#retry').click();return this.battle();},
 roleCards(){const boss=bossObj(bossId());document.querySelectorAll('.modal,.oppin').forEach(x=>x.remove());bossDetails(boss);const detail=document.querySelector('.tr-kicker').textContent;document.querySelector('#bdok').click();oppEntrance(boss,oppTier(boss));return {detail,intro:document.querySelector('.oppin .otag')?.textContent,hud:document.querySelector('.pblind .otag')?.textContent};},
 async victory(){const boss=bossObj(bossId());stageWinIntro(land(),B.score,'',{tier:oppTier(boss),name:bossName(boss.id),tag:opponentRole(boss)});await new Promise(r=>requestAnimationFrame(r));return opponentRole(boss);},
 legacy(kind,rule='crown',entryLives=3,bought=0){this.fresh('street','downtown');delete RUN.introRuleFree;delete RUN.introStarted;RUN.bosses[0]=rule;delete RUN.fightTarget;RUN.lives=entryLives;RUN.livesBought=0;setCheckpoint({cur:{land:'street',circuit:'downtown',carry:{lives:entryLives,livesBought:0}}});
 if(kind==='mid'){RUN.introStarted=true;this.start();delete RUN.introStarted;delete RUN.introRuleFree;}else{B=null;RUN.fightTarget={key:'street|downtown|1|2',t:520};RUN.lives+=bought-(kind==='retry'?1:0);RUN.livesBought=bought;}
 const before={run:JSON.stringify(RUN),b:JSON.stringify(B)};save();loadRun();enterLand();return {before,after:{run:JSON.stringify(RUN),b:JSON.stringify(B)},state:this.inspect(),flag:RUN.introRuleFree};},
 missing(){this.fresh();RUN.bosses=[];delete RUN.introRuleFree;delete RUN.introStarted;B=null;enterLand();return this.inspect();},
 gauntlet(w,seed=1){this.fresh();RUN.gauntlet=true;RUN.gId='test';RUN.gWave=w;delete RUN.introRuleFree;B=null;this.seed(seed);gPrepWave();return {rules:ruleOf(bossId()),chips:bossChips(bossId()),bosses:RUN.bosses.slice(),target:gTarget(),name:gFoeTag()};},
 match(){this.fresh();RUN.match=true;MATCH={active:true};RUN.introRuleFree=true;return {rules:ruleOf('clock'),limit:moveLimitFor(parFor(),'clock')};}
};`;
async function load(file){const w=new Window({url:'http://localhost:8018/',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableJavaScriptEvaluation:true}});w.matchMedia=()=>({matches:true,addEventListener(){}});w.fetch=async()=>{throw Error('offline');};w.HTMLElement.prototype.animate=()=>({finished:Promise.resolve(),cancel(){}});const html=fs.readFileSync(file,'utf8');w.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''));for(const f of ['gameplay-polish.js','piece-designs.js','character-style.js','campaign-opponents.js','campaign-dialogue.js'])w.eval(fs.readFileSync(f,'utf8')+(f==='campaign-opponents.js'?';window.campaignOpponentName=campaignOpponentName;':''));for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/src=/.test(m[1])){let s=m[2];if(s.includes('const GAME_VERSION')){const at=s.lastIndexOf('})();');s=s.slice(0,at)+bridge+s.slice(at);}w.eval(s);}w.setTimeout=()=>0;return w;}
assert(process.env.CROWNFALL_BASELINE,'Set CROWNFALL_BASELINE to a v167 index.html copy.');
const old=await load(process.env.CROWNFALL_BASELINE),now=await load('index.html'),a=old.__v168,b=now.__v168;
const plain=x=>JSON.parse(JSON.stringify(x));const eq=(x,y,msg)=>assert.deepEqual(plain(x),plain(y),msg);
const circuits=['downtown','rooftop','harbor','midnight'];let runs=0,later=0,migrations=0;
for(let i=0;i<20;i++){
 const c=circuits[i%4],prev=a.fresh('street',c,1,i+1),next=b.fresh('street',c,1,i+1);eq(next.bosses,prev.bosses,'Rule-ID identity and random draws retained');for(const k of ['name','persona','portrait','plan','tier'])eq(next[k],prev[k],k+' preserved');eq(next.rules,[]);eq(next.chips,[]);assert.equal(next.limit,null);assert.equal(next.target,b.base());if(c==='downtown')assert.equal(next.target,370);
 const battle=b.start();assert.equal(battle.target,next.target);assert.equal(battle.limit,null);eq(b.refresh(),battle,'Refresh does not change any battle data');const retry=b.retry();assert.equal(retry.target,battle.target);assert.equal(retry.limit,null);eq(retry.rules,[]);eq(b.refresh(),retry,'Retry remains stable after refresh');runs++;
 for(const stage of [2,3,4]){const o=a.fresh('street',c,stage,i+1),n=b.fresh('street',c,stage,i+1);for(const k of ['id','rules','chips','limit','target','tier','name','persona','portrait','plan','bosses'])eq(n[k],o[k],'Later stage unchanged: '+k);later++;}
}
for(const l of ['medieval','greek','fantasy','throne'])for(const c of circuits){const n=b.fresh(l,c,1,53);eq(n.rules,[]);eq(n.chips,[]);assert.equal(n.limit,null);assert.equal(n.target,b.base());}
console.log('PASS 20 Crown City new runs (5 per circuit), 20 refreshes, 20 retries + refreshes, 16 other-land openings; Downtown base target 370.');
console.log('PASS 60 later-stage comparisons against v167: 40 Rival/Elite and 20 Circuit Boss configurations, including unchanged random draws, rules, limits, targets, identities and styling tiers.');
for(const rule of ['clock','march','wall','tax','crown','thief'])for(const kind of ['pre','mid','retry']){const r=b.legacy(kind,rule);if(kind==='pre'){assert.equal(r.flag,true);eq(r.state.rules,[]);assert.equal(r.state.target,370);}else{eq(r.before,r.after,'Old '+kind+' save must be identical');}migrations++;}
for(const kind of ['pre','retry'])for(const entry of [2,4])for(const bought of [0,1]){const r=b.legacy(kind,'crown',entry,bought);if(kind==='pre'){assert.equal(r.flag,true);assert.equal(r.state.target,370);}else eq(r.before,r.after);migrations++;}
console.log('PASS '+migrations+' legacy save cases: unstarted, in progress and saved retries; carried armies and purchased lives covered.');
const missing=b.missing();eq(missing.rules,[]);eq(missing.chips,[]);assert.equal(missing.bosses.length,4);
for(const [stage,role] of ['Intro','Rival','Elite','Circuit Boss'].entries()){b.fresh('street','downtown',stage+1,7);b.start();const labels=b.roleCards();eq(labels,{detail:role,intro:role,hud:role});assert.equal(await b.victory(),role);}
for(const l of ['street','medieval','greek','fantasy','throne']){const o=a.fresh(l,'ruler',6,3),n=b.fresh(l,'ruler',6,3);for(const k of ['rules','chips','limit','target','tier','name','persona','portrait','bosses'])eq(n[k],o[k]);assert.equal(n.role,'Ruler');}
console.log('PASS all 4 circuit role labels in intro/HUD/details/victory inputs; 5 Ruler configurations unchanged, with Ruler labels.');
for(const w of [1,4,5,10,44,45,70,100])eq(b.gauntlet(w,w),a.gauntlet(w,w),'Gauntlet wave unchanged');eq(b.match(),a.match(),'Crown Match unchanged');
console.log('PASS 8 Gauntlet wave/boss-wave comparisons and Crown Match exclusion.');
for(const w of [old,now]){await w.happyDOM.abort();w.close();}

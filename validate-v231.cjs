// v231 Campaign difficulty: Easy / Normal / Hard chosen when a campaign starts and kept for it; finish achievements for each.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=231&&sw.includes("'crownfall-v"+RegExp.$1+"'")&&!src.includes('?v=230'));
// a campaign key: wiped by a new campaign, set again from the choice
assert.equal(E("isCampaignKey('cdiff')"),true);assert.equal(E("isCampaignKey('cdiff_next')"),false);
E("ACH.cdiff='hard';ACH.cdiff_next='normal';newCampaign()");assert.equal(E("ACH.cdiff||''"),'','Normal chosen');assert.equal(E("'cdiff_next' in ACH"),false);
E("ACH.cdiff_next='easy';newCampaign()");assert.equal(E('ACH.cdiff'),'easy');
E("ACH.cdiff_next='hard';newCampaign()");assert.equal(E('ACH.cdiff'),'hard');
E("ACH.cdiff_next='bogus';newCampaign()");assert.equal(E("ACH.cdiff||''"),'','unknown → Normal');
E("newCampaign()");assert.equal(E("ACH.cdiff||''"),'','no choice → Normal');
// effects: the same fight on each difficulty
const fight=d=>JSON.parse(E(`(()=>{MATCH=null;B=null;ACH.edicts=[];ACH.cdiff=${d?`'${d}'`:'undefined'};setPack('greek');newRun('rooftop');RUN.ante=2;RUN.blind=1;RUN.fightTarget=null;
 const t=targetParts(1).final,a=armySize(),r=aiRating(),l=RUN.lives,m=RUN.money;return JSON.stringify({t,a,r,l,m})})()`));
const n=fight(null),e=fight('easy'),h=fight('hard');
assert(Math.abs(e.t-n.t*0.75)<=10,`Easy target ×0.75 (${n.t} → ${e.t})`);assert(Math.abs(h.t-n.t*1.2)<=10,`Hard target ×1.2 (${n.t} → ${h.t})`);
assert.equal(e.a,n.a,'Easy: same army size');assert.equal(h.a,n.a,'Hard: same army size');
assert.equal(e.r,n.r-200,'v239: Easy is −200 in the Olympian Court');assert.equal(h.r,Math.min(n.r+150,E('AI_MAX')));
assert.equal(n.l,3);assert.equal(e.l,5);assert.equal(h.l,2);assert.equal(e.m,n.m+2);assert.equal(h.m,n.m-1);
// Blitz: Easy +2, Hard −1 (never below 60% of par)
const blitz=d=>E(`(()=>{ACH.cdiff=${d?`'${d}'`:'undefined'};const id=BOSSES.find(b=>b.moveLimit&&typeof b.moveLimit.par==='number').id;RUN.land='medieval';return moveLimitFor(parFor(),id)})()`);
assert.equal(blitz('easy'),blitz(null)+2);assert.equal(blitz('hard'),blitz(null)-1);
// Fragile: Easy 4 lives, Hard 1
E("ACH.cdiff='easy';ACH.edicts=['fragile'];setPack('street');newRun('downtown')");assert.equal(E('RUN.lives'),4);
E("ACH.cdiff='hard';newRun('downtown')");assert.equal(E('RUN.lives'),1);E("ACH.edicts=[]");
// never the Daily Run or Crown Matches
E("ACH.cdiff='hard';RUN.gauntlet=true");assert.equal(E('cdiff()'),'normal');E("RUN.gauntlet=false");assert.equal(E('cdiff()'),'hard');
// achievements: a harder finish earns the easier ones
const fin=d=>JSON.parse(E(`(()=>{for(const k of ['sa_d_easy','sa_d_normal','sa_d_hard'])delete ACH[k];ACH.cdiff=${d?`'${d}'`:'undefined'};storyAchsAtEnd('standard');return JSON.stringify(['sa_d_easy','sa_d_normal','sa_d_hard'].map(k=>!!ACH[k]))})()`));
assert.deepEqual(fin('easy'),[true,false,false]);assert.deepEqual(fin(null),[true,true,false]);assert.deepEqual(fin('hard'),[true,true,true]);
assert(E("STORY_ACHS.filter(a=>a.id.startsWith('sa_d_')&&!a.hidden).length")===3);
assert(src.includes("if(!ACH.dach_mig){ ACH.dach_mig = 1;"),'old finished campaigns count as Normal');
// the choice comes before the name, for a new campaign and for New Game+
assert(src.includes("function startNewGame(){ delete ACH.ng_next; diffPick(() => askName(() => draftScreen())); }"));
assert(src.includes("edictPick(() => diffPick(() => askName(() => draftScreen())));"));
assert(src.includes("${CDIFF[ACH.cdiff] ? ' · ' + CDIFF[ACH.cdiff].name : ''}</small><h2>Journey</h2>")&&src.includes("${CDIFF[ACH.cdiff] ? CDIFF[ACH.cdiff].name + ' · ' : ''}${camp.cont}"));
console.log('PASS: Easy/Normal/Hard chosen at a new campaign / New Game+ and kept for it; army sizes unchanged; Easy ×0.75 targets, Blitz +2, AI −150, +$2, 5 lives; Hard ×1.2, Blitz −1, AI +150, −$1, 2 lives; three finish achievements (harder earns easier); never the Daily Run');

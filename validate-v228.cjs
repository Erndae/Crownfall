// v228 Story achievements (the Hunger, endings, New Game+, supply crates, Bounty), and Crown Command code removed.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const S=JSON.parse(E('JSON.stringify(STORY_ACHS)'));assert.equal(S.length,9);
for(const a of S){assert(E(`ACHS.some(x=>x.id==='${a.id}')`),a.id);assert.equal(E(`isCampaignKey('${a.id}')`),false,'kept across campaigns: '+a.id);assert(a.name&&a.desc.length>10);}
assert.deepEqual(S.filter(a=>a.hidden).map(a=>a.id).sort(),['sa_again','sa_crowned','sa_mirror','sa_true'],'the spoilers stay hidden until earned');
for(const a of S)assert(!/was once|became him|every king/i.test(a.desc));
const got=id=>!!E(`ACH['${id}']`),clear=()=>E("for(const a of STORY_ACHS) delete ACH[a.id];MATCH=null;0");
// endings
clear();E("ACH.campaign_epoch=5;ACH.hunger={ep:5,fed:0,refused:2};ACH.ngplus=1;ACH.edicts=['iron','fuse','bound'];storyAchsAtEnd('standard')");
for(const id of ['sa_crowned','sa_refuse','sa_again','sa_edicts'])assert(got(id),id);assert(!got('sa_true'));
clear();E("ACH.hunger={ep:5,fed:1,refused:5};ACH.ngplus=0;ACH.edicts=['iron'];storyAchsAtEnd('true')");assert(got('sa_true'));for(const id of ['sa_crowned','sa_refuse','sa_again','sa_edicts'])assert(!got(id),'not earned: '+id);
clear();E("ACH.hunger={ep:5,fed:0,refused:0};storyAchsAtEnd('true')");assert(!got('sa_refuse'),'Iron Will needs at least one refusal');
assert(src.indexOf('try{ storyAchsAtEnd(type); }catch(e){}')<src.indexOf("s.seen[type] = s.seen[type] || Date.now(); s.pending = null; s.lastType = type;\n  if(type === 'standard')"),'checked before the ending is marked seen');
// the Hunger
clear();E("ACH.hunger={ep:5,fed:8,refused:0};hungerNote('fed')");assert(!got('sa_fed'));E("hungerNote('fed')");assert(got('sa_fed'),'ten bargains');
// supply crates and the Bounty
clear();E("PACK='greek';RUN={land:'greek',circuit:'harbor',ante:3,blind:1,money:5,relics:[],roster:['K']};B={board:Array(64).fill(null),swaps:1,log:[],tac:null,crates:[34,37,29]};tacState();[34,37,29].forEach((i,k)=>{B.board[i]={t:'N',side:'me',id:50+k};})");
E('springDockCrate(34);springDockCrate(37)');assert(!got('sa_crates'));E('springDockCrate(29)');assert(got('sa_crates'),'three crates in one fight');
clear();E("B={board:Array(64).fill(null),swaps:1,log:[],moveCount:11,bounty:{id:7,pay:3}}");E("bountyClaim({side:'en',id:7},20)");assert(!got('sa_bounty'),'too late');
E("B={board:Array(64).fill(null),swaps:1,log:[],moveCount:9,bounty:{id:7,pay:3}}");E("bountyClaim({side:'en',id:7},20)");assert(got('sa_bounty'));
// Know Thyself, and Crown Matches award nothing
assert(src.includes("B.fallenArmy = !!(P && P.fallenArmy);")&&src.includes("if(endingWin && B.fallenArmy) unlockAch('sa_mirror', false);"));
clear();E("MATCH={};storyAchsAtEnd('true');MATCH=null");assert(!got('sa_true'),'nothing from a Crown Match');
// the screen
assert(src.includes("${show ? a.name : 'Hidden achievement'}")&&src.includes('<h2 style="font-size:24px;margin-top:6px">Story achievements</h2>'));
// Crown Command code is gone, the turn and promotion helpers that lived beside it remain
for(const gone of ['CROWN_COMMAND','cmdState','cmdTap','cmdMoveCommit','crownChoiceFlow','CMD_INFO','CROWN_POWERS','wisdomMove','kingLevelUp'])assert.equal(E(`typeof ${gone}`),'undefined',gone);
for(const live of ['endTurn','enemyPromoPick','promoPick','gambitCheck','gambitDo','crownTactics','crownTacticsText','initiativeOffer'])assert.equal(E(`typeof ${live}`),'function',live);
assert(!/cmdMode|cmdPick|id="cmdBtn"/.test(src));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=228&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: nine story achievements (four hidden), each trigger, kept across campaigns, none from Crown Matches; Crown Command code removed with the live helpers intact; version.');

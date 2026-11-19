// v210 The Bearer's name (asked once, spoken in the story) and New Game+ (each finished campaign starts again, harder).
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
const as=n=>{c.CrownfallCharacter={get:()=>({name:n}),art:()=>'',save:()=>true};};
// names
for(const [raw,want] of [['  Ernesto  ','Ernesto'],['<b>Zed</b>','bZedb'],['Ana-María O\'Neil the Great','Ana-María O\'Neil'],['x',''],['Crownrunner',''],['',''],[null,'']]){as(raw);assert.equal(E('bearerName()'),want,String(raw));}
as('Ernesto');assert.equal(E('nameOr()'),'Ernesto');as('');assert.equal(E("nameOr('the Crownrunner')"),'the Crownrunner');
// New Game+ level and its effects
E("MATCH=null;RUN={land:'medieval',circuit:'downtown',ante:2,blind:2,money:50,relics:[],roster:['K'],lv:{P:1,N:1,B:1,R:1,Q:1,K:1}};ACH.ngplus=0");
assert.equal(E('ngLevel()'),0);assert.equal(E('ngTargetMult()'),1);const p0=E('price(10)');
E('ACH.ngplus=2');assert.equal(E('ngLevel()'),2);assert.equal(+E('ngTargetMult()').toFixed(2),1.4);assert.equal(E('price(10)'),Math.round(10*1.3*1.2),'Prices +10% per cycle on top of the Land');assert(E('price(10)')>p0);
assert.equal(E('ngLabel(1)'),'New Game+');assert.equal(E('ngLabel(3)'),'New Game+ 3');assert.equal(E('ngLabel(0)'),'');
E('RUN.gauntlet=true');assert.equal(E('ngLevel()'),0,'The Gauntlet is never affected');E('RUN.gauntlet=false;MATCH={}');assert.equal(E('ngLevel()'),0,'Nor Crown Match');E('MATCH=null');
E('ACH.ngplus="junk"');assert.equal(E('ngLevel()'),0);
const army="[{t:'Q',side:'en'},{t:'R',side:'en'},{t:'B',side:'en'},{t:'N',side:'en'},{t:'P',side:'en'},{t:'K',side:'en'},{t:'Q',side:'me'}]";
const arm=n=>{E(`ACH.ngplus=${n};globalThis.__b=${army};ngArmor(globalThis.__b)`);return JSON.parse(E('JSON.stringify(globalThis.__b.map(p=>p.sh||0))'));};
assert.deepEqual(arm(0),[0,0,0,0,0,0,0]);assert.deepEqual(arm(1),[1,0,0,0,0,0,0],'Cycle 1: the enemy Queen');assert.deepEqual(arm(2),[1,1,0,0,0,0,0]);assert.deepEqual(arm(3),[1,1,1,1,0,0,0],'Never Pawns, Kings or your own pieces');
// the cycle survives starting the next campaign; a plain new campaign returns to 0
E('ACH.ngplus=1;ACH.ng_next=2;newCampaign()');assert.equal(E('ACH.ngplus'),2);assert.equal(E('ACH.ng_best'),2);assert.equal(E('ACH.ng_next'),undefined);
E('newCampaign()');assert.equal(E('ACH.ngplus'),0,'A plain New Campaign is cycle 0');assert.equal(E('ACH.ng_best'),2,'The best cycle is kept');
assert.equal(E("isCampaignKey('ngplus')"),false);
// the first opponent asks the name; Rulers know it; nothing changes without a name
as('Ernesto');E("ACH.ngplus=0;for(const k of Object.keys(ACH)) if(/^(crown_|conq_)/.test(k)) delete ACH[k];RUN={land:'street',circuit:'downtown',ante:1,blind:2,money:5,relics:[],roster:['K']};PACK='street'");
let o=JSON.parse(E("JSON.stringify(storyLines({name:'Speedy Rico',intro:'x',lose:'y'}))"));assert(o.intro.includes('What do they call you?')&&o.intro.includes('Ernesto'));assert(o.lose.includes('Ernesto'));
E('RUN.ante=2');o=JSON.parse(E("JSON.stringify(storyLines({name:'Speedy Rico',intro:'x',lose:'y'}))"));assert.equal(o.intro,'x','Only the first fight of a campaign asks');
E("RUN.circuit='ruler';RUN.ante=1");assert(E("storyLines({name:'Kingpin Vex',ruler:true,intro:'x'}).intro").includes('Ernesto'),'Vex knows the name');
as('');assert.equal(E("storyLines({name:'Kingpin Vex',ruler:true,intro:'x'}).intro"),'x');
// wiring
assert(src.includes("function startNewGame(){ delete ACH.ng_next; askName(() => draftScreen()); }"));
assert(src.includes("if(!bearerName()) return askName(continueCampaign);")&&src.includes("if(!RUN && campaignComplete()) return ngAsk();"));
assert(src.includes('  t *= ngTargetMult(!!lim);   // v210')&&src.includes('ngArmor(B.board);')&&src.includes('lim + blitzBonus() + extra - ngLevel()'));
assert(src.includes("replace('{N}', nameOr('yours'))")&&src.includes("E.cont('THEY ARE COMING FOR YOUR THRONE.'"));   // v213: the crown took the name
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=210);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: names cleaned and required, story uses them, NG+ cycles (+20% targets, armor, Blitz, +10% prices), cycle kept across campaigns and reset by a plain new one, Gauntlet and Match untouched, wired, version.');

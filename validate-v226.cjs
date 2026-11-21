// v226 New Game+: Edicts (choose 1 of 3 each cycle, they stack) and the Crownless King fighting with your previous army.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
// ---------- the Crownless King's army is your last one
const roster="['K','Q','R','R','B','B','N','N','P','P','P','P','P','P','P','P']";
const throne=(x='')=>E(`(()=>{MATCH=null;B=null;PACK='throne';setCarry(null);newRun('ruler');ACH.campaign_epoch=900;RUN.ante=nStages();RUN.blind=2;RUN.roster=${roster};B={board:deploy(RUN.roster),swaps:1,log:[]};${x};const P=setupEnemyArmy(B.board);return JSON.stringify({fa:!!P.fallenArmy,en:B.board.filter(q=>q&&q.side==='en').map(q=>q.t).sort().join('')})})()`);
const army=[{t:'Q',n:'Spike'},{t:'Q',n:'Raven'},{t:'R',n:'Duke'},{t:'N',n:'Tux'},{t:'B',n:'Moss'},{t:'P',n:'Ace'}];
E(`localStorage.setItem(FALLEN_KEY,${JSON.stringify(JSON.stringify({v:1,ep:100,king:'Ernesto',army}))})`);
let r=JSON.parse(throne());assert.equal(r.fa,true,'he fields your old army');
assert.equal(r.en,'BKNPPPPPPPPPPQQR'.split('').sort().join(''),'your pieces (two Queens!), filled out with Pawns to 16');
E('B.fallen={}');const names=JSON.parse(E("JSON.stringify(B.board.filter(q=>q&&q.side==='en'&&q.t!=='P'&&q.t!=='K').map(q=>fallenNameOf(q)).sort())"));
assert.deepEqual(names,['Duke','Moss','Raven','Spike','Tux'],'each one is the soldier it was');
assert.equal(E("fallenNameOf(B.board.find(q=>q&&q.side==='en'&&q.t==='K'))"),'Ernesto');
assert.equal(E("B.board.filter(q=>q&&q.side==='en').every(q=>q.t==='P'?true:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(B.board.indexOf(q)))"),true,'on his two back ranks');
E(`localStorage.setItem(FALLEN_KEY,${JSON.stringify(JSON.stringify({v:1,ep:900,king:'Ernesto',army}))})`);r=JSON.parse(throne());assert.equal(r.fa,false,'never the campaign that made it');
E('localStorage.removeItem(FALLEN_KEY)');r=JSON.parse(throne());assert.equal(r.fa,false,'no record (first campaign, or after the true ending): his own army');
E(`localStorage.setItem(FALLEN_KEY,${JSON.stringify(JSON.stringify({v:1,ep:100,king:'E',army:[{t:'N',n:'Solo'}]}))})`);r=JSON.parse(throne());assert.equal(r.fa,false,'a record too small to be an army');
E('localStorage.removeItem(FALLEN_KEY)');
// ---------- Edicts
const ids=JSON.parse(E('JSON.stringify(Object.keys(EDICTS))'));assert.equal(ids.length,7);
for(const id of ids)assert(E(`EDICTS.${id}.name.length>3&&EDICTS.${id}.desc.length>15`));
// they stack through New Game+, and a plain new campaign clears them
E("teamIntro=()=>{};ACH.edicts=[];ACH.ng_next=1;ACH.edict_next='iron';newCampaign()");assert.deepEqual(JSON.parse(E('JSON.stringify(ACH.edicts)')),['iron']);
E("ACH.ng_next=2;ACH.edict_next='fuse';newCampaign()");assert.deepEqual(JSON.parse(E('JSON.stringify(ACH.edicts)')),['iron','fuse']);
E("ACH.ng_next=3;ACH.edict_next='fuse';newCampaign()");assert.deepEqual(JSON.parse(E('JSON.stringify(ACH.edicts)')),['iron','fuse'],'never twice');
E("delete ACH.ng_next;newCampaign()");assert.deepEqual(JSON.parse(E('JSON.stringify(ACH.edicts)')),[],'a plain New Campaign starts clean');
// the choice: three you do not have; none left, no screen
E("modal=h=>{const btns=[...h.matchAll(/data-ed=\"(\\w+)\"/g)].map(m=>({dataset:{ed:m[1]}}));window.__btns=btns;return {remove(){},querySelectorAll:()=>btns}};0");
E("ACH.edicts=['iron','fuse'];window.__btns=[];window.__go=0;edictPick(()=>{window.__go=1})");
const offered=JSON.parse(E("JSON.stringify(window.__btns.map(b=>b.dataset.ed))"));assert.equal(offered.length,3);for(const o of offered)assert(!['iron','fuse'].includes(o));
E("window.__btns[0].onclick()");assert.equal(E('window.__go'),1);assert.equal(E('ACH.edict_next'),offered[0]);
E(`ACH.edicts=${JSON.stringify(ids)};window.__go=0;edictPick(()=>{window.__go=1})`);assert.equal(E('window.__go'),1,'all held: straight on');
// effects
const fight=(x='')=>E(`(()=>{MATCH=null;PACK='greek';RUN={land:'greek',circuit:'harbor',ante:2,blind:2,money:30,relics:[],roster:['K'],lives:3};B={board:Array(64).fill(null),swaps:2,target:1000,log:[],tac:null};tacState();B.board[0]={t:'Q',side:'en'};B.board[1]={t:'R',side:'en'};B.board[2]={t:'N',side:'en'};B.board[5]={t:'B',side:'en'};B.board[3]={t:'K',side:'en'};${x};edictsApply();return 0})()`);
E("ACH.edicts=['bound']");fight();assert.equal(E('B.swaps'),1,'Bound Hands');
E("ACH.edicts=['vanguard']");fight();assert.deepEqual(JSON.parse(E('JSON.stringify([0,1,2,5].map(i=>B.board[i].sh||0))')),[0,0,1,1],'Vanguard: Knights and Bishops, Stage Battles');
fight('RUN.blind=0');assert.deepEqual(JSON.parse(E('JSON.stringify([0,1,2,5].map(i=>B.board[i].sh||0))')),[0,0,0,0],'not in other fights');
E("ACH.edicts=['iron']");fight("setCarry(null);newRun('ruler');RUN.ante=nStages();RUN.blind=2;");assert.deepEqual(JSON.parse(E('JSON.stringify([0,1,2,5].map(i=>B.board[i].sh||0))')),[1,1,0,0],'Iron Rulers: the two strongest');
fight();assert.deepEqual(JSON.parse(E('JSON.stringify([0,1,2,5].map(i=>B.board[i].sh||0))')),[0,0,0,0],'only in Ruler fights');
E("ACH.edicts=['bound']");fight('RUN.gauntlet=true');assert.equal(E('B.swaps'),2,'never in the Gauntlet');
E("ACH.edicts=[]");const p0=E("(()=>{RUN={land:'greek',circuit:'harbor',ante:2,money:0,relics:[],roster:['K']};return landPriceMult()})()");E("ACH.edicts=['tithe']");const p1=E("landPriceMult()");assert(Math.abs(p1/p0-1.15)<1e-9,'Royal Tithe +15%');
E("ACH.edicts=[];for(const k of Object.keys(ACH))if(/^crown_/.test(k))delete ACH[k]");E("RUN={land:'street',circuit:'harbor',ante:2,blind:2,money:30,relics:[],roster:['K']}");assert.equal(E('hungerDue()'),false);
E("ACH.edicts=['hungry']");assert.equal(E('hungerDue()'),true,'Hungry Crowns: bargains before the first crown');assert.equal(E('hungerOffer().n'),1);
assert(src.includes("else { hungerNote('refused'); if(edictOn('hungry')) RUN.money = Math.max(0, RUN.money - 2); }"));
assert(src.includes("lim + blitzBonus() + extra - ngLevel() - (edictOn('fuse') ? 1 : 0)")&&src.includes("(edictOn('fragile') ? 2 : 3)"));
// score, display
E("ACH.edicts=['iron','fuse'];RUN={land:'greek',circuit:'harbor',ante:2,money:100,relics:[],roster:['K']}");assert.equal(E('campaignScore()'),Math.round((E('hoardNow()')+100)*1.3),'+15% each');
assert(E('edictsHTML()').includes('Iron Rulers')&&E('edictsHTML()').includes('+30% campaign score'));E('ACH.edicts=[]');assert.equal(E('edictsHTML()'),'');
assert(src.includes("edictPick(() => diffPick(() => askName(() => draftScreen())));")&&src.includes('${hungerRecordHTML()}${edictsHTML()}')&&css.includes('.ed-card{'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=226&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: Crownless King fields your last army (types, names, padding, fallbacks), seven Edicts stack through New Game+ and clear on a new campaign, pick 1 of 3, every effect, campaign score bonus, display, version.');

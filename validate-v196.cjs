// v196 Crown Command retired; World Crowns start fights with Tactics ready. Old saves still load.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
assert.equal(E('CROWN_COMMAND'),false);
const crowns=n=>E(`for(const l of BASE_LANDS) delete ACH[landCrownId(l)];BASE_LANDS.slice(0,${n}).forEach(l=>ACH[landCrownId(l)]=1);MATCH=null;`);
const want=[0,1,1,2,2];
for(let n=0;n<=4;n++){crowns(n);assert.equal(E('baseCrowns()'),n);assert.equal(E('crownTactics()'),want[n],n+' Crowns');assert.equal(E('crownCmdMax()'),0);assert.equal(E('crownChoicesDue().length'),0,'No ability choice is ever due');}
assert(E('crownTactics()')<=E('TAC_MAX'));
crowns(4);E('MATCH={}');assert.equal(E('crownTactics()'),0,'Crown Match is unaffected');E('MATCH=null');
assert.equal(E('crownTacticsText(0)'),'World Crowns start your fights with Tactics ready');assert.equal(E('crownTacticsText(1)'),'Fights start with 1 Tactic ready');assert.equal(E('crownTacticsText(2)'),'Fights start with 2 Tactics ready');
// a campaign that already chose abilities, and a fight saved with Command charges, both still load and expose nothing
crowns(2);E("ACH.cpow_street='strike';ACH.cpow_medieval='charge';B={board:Array(64).fill(null),cmd:{v108:1,max:2,left:2,lock:false,once:{},used:{},radius:2},tac:null}");
assert.equal(E('cmdState().max'),2,'The saved fight keeps its data');assert.equal(E('crownChoicesDue().length'),0);
assert(src.includes('const due = crownChoicesDue(); if(!due.length){ if(done) done(); return; }'),'Anything waiting on a choice continues at once');
// wiring and words
assert(src.includes('B.tac.n = crownTactics();'));assert(src.includes("if(MATCH || !CROWN_COMMAND) return '';"),'No Command button');
assert(src.includes("if(CROWN_COMMAND && !resumed && !MATCH && !coachSeen().command"),'No Command tutorial');
assert(src.includes('<span class="vperk">${crownTacticsText(crownTactics())}</span>'));
const guide=src.slice(src.indexOf("${sec('World Crowns', `"),src.indexOf("${sec('World Crowns', `")+700);assert(guide.includes('Tactics ready')&&!guide.includes('Command'));
for(const gone of ["sec('World Crowns & Crown Command'","sec('Crown Powers'",'World Crowns and Crown Command','<span class="muted">Crown Command</span>'])assert(!src.includes(gone),gone);
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=196);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: Command off everywhere, 0/1/1/2/2 starting Tactics by Crowns, Crown Match untouched, old campaigns and fights load, words updated, version.');

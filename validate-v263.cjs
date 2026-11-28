// v263 What you feed the Hunger in a Land goes to that Land's Ruler; refuse it there and the Ruler goes hungry.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=263&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
assert(src.includes("ngArmor(B.board);   // v210: New Game+\n  rulerHungerApply();"),'applied right after New Game+ Armor, before Edicts and the bargain');
E("MATCH=null;ACH.campaign_epoch=5;ACH.hunger=null;ACH.ngplus=0;setPack('medieval');newRun('harbor')");
// refusals are now counted per Land too
E("hungerNote('refused');RUN.land='greek';hungerNote('fed');hungerNote('refused')");
assert.deepEqual(JSON.parse(E('JSON.stringify([hungerTally().byLand,hungerTally().refByLand])')),[{greek:1},{medieval:1,greek:1}]);
assert.deepEqual(JSON.parse(E("JSON.stringify([rulerHunger('medieval'),rulerHunger('greek'),rulerHunger('street'),rulerHunger('throne')])")),[{k:'starved',n:1},{k:'fed',n:1,fed:1},null,null],'any feeding counts as fed; refusing every time starves');
// the bargain names who gets it (until that Ruler is beaten)
E("RUN.land='medieval'");assert(E('rulerHungerNote()').includes('Feed it here and King Aldric grows stronger. Refuse it and King Aldric goes hungry.'));
RUN_greek=E("RUN.land='greek';rulerHungerNote()");assert(RUN_greek.includes('Feed it here and Athena grows stronger'));
E("RUN.land='throne'");assert.equal(E('rulerHungerNote()'),'');
// the Ruler's fight: a board with Q, R, R, B, N, pawns
const fight=(landId,hunger,ng=0,target=1000)=>JSON.parse(E(`(()=>{ACH.ngplus=${ng};ACH.hunger=Object.assign({ep:5,fed:0,refused:0},${JSON.stringify(hunger)});setPack('${landId}');newRun('ruler');RUN.land='${landId}';RUN.bosses=RUN.bosses||[];RUN.ante=nStages();RUN.bosses[RUN.ante-1]='ruler';RUN.blind=2;
  B={board:Array(64).fill(null),target:${target},log:[]};['K','Q','R','R','B','N','P','P'].forEach((t,i)=>B.board[i]={t,side:'en',sh:0});B.board[60]={t:'K',side:'me'};
  ngArmor(B.board);rulerHungerApply();return JSON.stringify({target:B.target,rh:B.rh||null,arm:B.board.filter(q=>q&&q.side==="en"&&q.sh>0).map(q=>q.t+q.sh).join(" "),tip:rulerHungerTip()})})()`));
let f=fight('medieval',{byLand:{medieval:1}});assert.deepEqual([f.target,f.arm],[1000,'Q1']);assert.equal(f.tip,'<b>King Aldric grew strong on what you fed the Hunger here</b><br>Enemy Queen starts Armored.');
f=fight('medieval',{byLand:{medieval:5}});assert.deepEqual([f.target,f.arm],[1000,'Q1 R1'],'at most 2, strongest first');
f=fight('greek',{refByLand:{greek:2}});assert.deepEqual([f.target,f.arm],[900,'']);assert.equal(f.tip,'<b>You starved the Hunger in this Land</b><br>Athena is weaker for it: score target −10%.');
f=fight('greek',{byLand:{greek:1},refByLand:{greek:3}});assert.equal(f.rh.k,'fed','fed even once is fed');
f=fight('street',{});assert.deepEqual([f.target,f.arm,f.rh],[1000,'',null],'never came here: nothing changes');
// New Game+ Armor already there: no piece armored twice, never more than 3 Armored pieces, the rest becomes target
f=fight('fantasy',{byLand:{fantasy:2}},1);assert.deepEqual([f.arm,f.target],['Q1 R1 R1',1000]);
f=fight('fantasy',{byLand:{fantasy:2}},2);assert.deepEqual([f.arm,f.target],['Q1 R1 R1',1100]);assert(f.tip.includes('Enemy Rook starts Armored, score target +10%.'));
f=fight('fantasy',{byLand:{fantasy:2}},3);assert.deepEqual([f.arm,f.target],['Q1 R1 R1',1200]);assert(f.tip.endsWith('Score target +20%.'));
// not the Road's other fights, not the throne
assert.equal(JSON.parse(E(`(()=>{ACH.ngplus=0;ACH.hunger={ep:5,fed:1,refused:0,byLand:{medieval:1}};setPack('medieval');newRun('ruler');RUN.blind=1;B={board:[{t:'Q',side:'en',sh:0}],target:500};rulerHungerApply();return JSON.stringify(B.rh||null)})()`)),null);
// the Ruler says it
const intro=(l,name,h)=>E(`(()=>{ACH.hunger=Object.assign({ep:5,fed:0,refused:0},${JSON.stringify(h)});setPack('${l}');newRun('ruler');RUN.land='${l}';const o={name:'${name}',ruler:true};storyLines(o);return o.intro})()`);
assert.equal(intro('street','Kingpin Vex',{byLand:{street:1}}),'You fed it on my streets. It paid me back, every bit.');
assert.equal(intro('medieval','King Aldric the Iron-Handed',{refByLand:{medieval:1}}),'You refused it in my kingdom. My crown has never felt so light.');
console.log('PASS: Hunger feeds its Ruler: refusals counted per Land; fed → up to 2 officers Armored (3 Armored max, then +10% target each); starved → target −10%; Ruler fight only; bargain and Ruler lines say so');

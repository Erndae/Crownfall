// v223 The Hunger's bargain: an offer before each Stage Battle once you carry a World Crown; boon and price grow with your crowns; the endings remember.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const crowns=n=>E(`(()=>{for(const k of Object.keys(ACH))if(/^crown_/.test(k))delete ACH[k];BASE_LANDS.slice(0,${n}).forEach(l=>ACH[landCrownId(l)]=1);return baseCrowns()})()`);
const run=(blind,x='')=>E(`(()=>{MATCH=null;PACK='greek';RUN={land:'greek',circuit:'harbor',ante:2,blind:${blind},money:30,relics:[],roster:['K'],lives:3};${x};return 0})()`);
// when it is offered
crowns(0);run(2);assert.equal(E('hungerDue()'),false,'not before the first World Crown');
crowns(1);run(2);assert.equal(E('hungerDue()'),true,'Stage Battle with a crown');
run(0);assert.equal(E('hungerDue()'),false,'not in the first fights of a stage');run(1);assert.equal(E('hungerDue()'),false);
run(2,'RUN.gauntlet=true');assert.equal(E('hungerDue()'),false,'never in the Gauntlet');
run(2,"RUN.pactKey=hungerKey()");assert.equal(E('hungerDue()'),false,'once per Stage Battle (no re-offer on retry)');
// every offer scales with the crowns carried
const kinds=new Set();for(const n of [1,2,3,4]){crowns(n);for(const circ of ['downtown','rooftop','harbor','midnight','ruler'])for(const a of [1,2,3,4]){
  run(2,`RUN.circuit='${circ}';RUN.ante=${a}`);const o=JSON.parse(E('JSON.stringify(hungerOffer())'));kinds.add(o.k);assert.equal(o.n,n);assert(o.boon&&o.cost);
  assert.equal(E('JSON.stringify(hungerOffer())'),JSON.stringify(o),'stable for the same battle');}}
assert.deepEqual([...kinds].sort(),['fury','greed','power','reach'],'all four bargains appear');
crowns(2);run(2,"RUN.circuit='x';RUN.money=1");for(let i=0;i<40;i++){E(`RUN.ante=${i}`);assert.notEqual(E('hungerOffer().k'),'reach','no bargain you cannot pay for');}
// effects
const fight=(o,x='')=>E(`(()=>{B={board:Array(64).fill(null),swaps:2,target:1000,log:[],tac:null};tacState().n=0;B.board[0]={t:'Q',side:'en'};B.board[1]={t:'R',side:'en'};B.board[2]={t:'P',side:'en'};B.board[3]={t:'K',side:'en'};RUN.pactPending=${JSON.stringify(o)};${x};hungerApply();return 0})()`);
crowns(3);run(2);
fight({k:'power',n:3,boon:'b',cost:'c'});assert.equal(E('tacState().n'),3);assert.equal(E('B.target'),1240,'+24% target');assert.equal(E('RUN.pactPending'),undefined);
fight({k:'power',n:3,boon:'b',cost:'c'},'tacState().n=TAC_MAX-1');assert.equal(E('tacState().n'),E('TAC_MAX'));assert.equal(E('B.swaps'),4,'overflow becomes swaps');
fight({k:'greed',n:3,cash:9,boon:'b',cost:'c'});assert.equal(E('B.swaps'),1);assert.equal(E('B.pact.cash'),9);
fight({k:'reach',n:3,swaps:2,boon:'b',cost:'c'});assert.equal(E('B.swaps'),4);
fight({k:'fury',n:2,boon:'b',cost:'c'});assert.deepEqual(JSON.parse(E('JSON.stringify(B.board.slice(0,4).map(q=>q.sh||0))')),[1,1,0,0],'the two strongest non-King pieces are Armored');
assert(src.includes("if(victim && B.pact && B.pact.k === 'fury'){ mult += B.pact.n;"));
assert(src.includes("const pactCash = B.pact && B.pact.k === 'greed' ? B.pact.cash || 0 : 0;")&&src.includes('+ chal.cash + pactCash;'));
E('B=null;RUN.pactPending=undefined');E('hungerApply()');
// choices are counted for this campaign only
E('ACH.campaign_epoch=111;delete ACH.hunger');E("hungerNote('fed');hungerNote('fed');hungerNote('refused')");assert.deepEqual(JSON.parse(E('JSON.stringify(hungerTally())')),{ep:111,fed:2,refused:1});
E('ACH.campaign_epoch=222');assert.deepEqual(JSON.parse(E('JSON.stringify(hungerTally())')),{ep:222,fed:0,refused:0},'a new campaign starts clean');
// wiring and endings
assert(src.includes("$('#play').onclick = () => hungerAsk(startBlind);")&&src.includes('hungerApply();   // v223'));
assert(src.includes("if(o.k === 'reach') RUN.money = Math.max(0, RUN.money - o.pay); hungerNote('fed');"));
const std=src.slice(src.indexOf('async function endingStandard'),src.indexOf('/* ---------- crown artwork'));assert(std.indexOf('It remembered every one.')>std.indexOf('The Hunger finishes what the crowns began.'));
const tr=src.slice(src.indexOf('async function endingTrue'),src.indexOf('const ENDING_PRE'));assert(tr.indexOf('It never owned you.')>tr.indexOf('The Hunger dies with it.'));
const version = Number(src.match(/const GAME_VERSION = (\d+);/)[1]);
assert(version >= 223 && sw.includes(`'crownfall-v${version}'`) && !src.includes('?v=222'));
console.log('PASS: offered before Stage Battles once you carry a crown (not Gauntlet, once per battle), four bargains scaling with crowns, effects applied, payout, campaign tally, endings remember, version.');

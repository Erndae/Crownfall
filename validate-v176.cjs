const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const setup=()=>E(`PACK='medieval';RUN={land:PACK,circuit:'rooftop',ante:2,blind:2,bosses:['tax','tax','tax','mini'],money:200,lv:{P:1,N:1,B:1,R:1,Q:6,K:1},relics:['hoarder','opening'],roster:['K','Q']};MATCH=null;B={board:Array(64).fill(null),score:0,target:500,caps:0,lost:0,streak:0,moves:20,seen:{},ep:[],noCap:0};B.board[60]={t:'K',side:'me',id:1};B.board[59]={t:'Q',side:'me',id:2};B.board[4]={t:'K',side:'en',id:3};B.board[27]={t:'P',side:'en',id:4};`);
setup();assert(E('scoringDefenseOn()'));assert.equal(E('scoringThreat(B,performance.now()+1000)'),true);
E(`B.board[11]={t:'R',side:'en',id:5}`);
assert.equal(E('scoringThreat(B,performance.now()+1000)'),false,'A recapturable scoring move is not a forced score win');
const before=E('JSON.stringify({RUN,B})');
const defensive=E('defendScore({from:11,to:15},[[11,15],[11,19]],performance.now()+1000)');
assert.equal(defensive.to,19,'Keep the pawn defended instead of allowing the winning capture');
assert.equal(E('JSON.stringify({RUN,B})'),before,'Speculative search must leave live state untouched');
assert.equal(E('defendScore({from:11,to:15},[[11,19]],performance.now()-1).to'),15,'Expired budget keeps original legal move');
assert.equal(E('scoringThreat(B,performance.now()-1)'),null,'Timeout is unknown, not safe');
E(`B.board[59]=null;B.board[27]={t:'Q',side:'me',id:2};B.score=1000;B.pendingWin={id:2,gain:1000,sq:27};`);
assert.equal(E('defendScore({from:11,to:15},[[11,15],[11,27]],performance.now()+1000).to'),27,'Recapture the pending winning scorer');
for(const patch of ["RUN.land='street'","RUN.gauntlet=true","MATCH={}","RUN.land='throne';RUN.circuit='ruler'"]){setup();E(patch);assert.equal(E('scoringDefenseOn()'),false,patch);}
setup();E(`RUN.land='greek';RUN.circuit='harbor';RUN.ante=3;B.board[11]={t:'R',side:'en',id:5};initGuards();B.score=40000;`);
assert.equal(E('B.guardIds.length'),2);assert.equal(E('guardsLeft()'),2);assert.equal(E('scoreGoalReady()'),false);
assert(E('guardBrief().includes("All combo points still count")'));
E('B=JSON.parse(JSON.stringify(B))');assert.equal(E('guardsLeft()'),2,'Markers survive save/load');
E(`B.board[27].t='Q'`);assert.equal(E('guardsLeft()'),2,'Promotion does not remove defender identity');
E(`B.board[27]=null`);assert.equal(E('guardsLeft()'),1);assert.equal(E('scoreGoalReady()'),false);
E(`B.board[11]={t:'R',side:'me',id:100}`);assert.equal(E('guardsLeft()'),0);assert(E('scoreGoalReady()'),'Defection removes a defender');
assert.equal(E('B.score'),40000,'Guard objective never discards accumulated combo points');
setup();E(`RUN.land='greek';RUN.circuit='harbor';RUN.ante=3;B.score=1000;`);assert(E('scoreGoalReady()'),'Old saves without guardIds retain original objective');
for(const land of ['street','medieval','greek','fantasy','throne'])for(const circuit of ['downtown','rooftop','harbor','midnight','ruler'])for(let stage=1;stage<=4;stage++){
 E(`RUN.land='${land}';RUN.circuit='${circuit}';RUN.ante=${stage}`);
 assert.equal(E('guardEncounterPlanned()'),['greek','fantasy','throne'].includes(land)&&circuit==='harbor'&&stage===3);
}
const source=fs.readFileSync(__dirname+'/index.html','utf8');
assert(source.includes('scoreGoalReady() && (secured || !pw.guard)'));
assert(source.includes('score0 < B.target || guardBefore > 0'));
assert(source.includes('guardCaptureFailed = !!pw.guard'));
assert(source.includes("if(!B || (!B.mate && guardsLeft() > 0)) return;"));
assert(source.includes('const GAME_VERSION = 176;'));assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v176'));
console.log('PASS: score threat / recapture defense, budget fallback, state isolation, scope exclusions, 100 guard schedule positions, save compatibility, scoring gates, defection and version.');
(async()=>{
 setup();E(`B.guardIds=[4];B.score=1000;B.board[11]={t:'R',side:'en',id:5};B.board[56]={t:'R',side:'me',id:6};B.moveCount=0;B.movesStart=20;B.capBy=[];B.log=[];B.swaps=0;B.wave=1;B.seenEn={};RUN.cards=[];RUN.stats={};
 for(const k of Object.keys(sfx))sfx[k]=()=>{};animateMove=async()=>{};drawBoard=()=>{};updateHud=()=>{};pop=()=>{};shatter=()=>{};showCombo=()=>{};coach=()=>{};coachReady=()=>{};say=()=>{};brilliant=()=>{};scoreFly=()=>{};laMyMove=()=>{};initiativeOffer=async()=>false;
 playScore=async r=>{B.score+=r.total};winBlind=()=>{B.won=true};checkmateWin=async()=>{B.mate=true;B.won=true};gameOver=why=>{throw Error(why)};
 enemyMove=async()=>{B.board=applyMove(B.board,11,27)};`);
 await E('doMove(59,27)');
 assert.equal(E('guardsLeft()'),0);
 assert.equal(E('B.score'),1000,'Only the recaptured finishing gain is reversed');
 assert.equal(E('!!B.won'),false,'Recapturing the final defender taker prevents immediate score victory even with banked points');
 console.log('PASS: production move/reply path preserves banked points and rejects an unsecured final-defender capture.');
})().catch(e=>{console.error(e);process.exitCode=1});

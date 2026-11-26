const assert = require('node:assert/strict');
const run = require('./test-support/game-runtime.cjs').testEval;

function setup(){
  run(`MATCH=null; setPack('greek'); newRun('rooftop');
    RUN.ante=4; RUN.blind=2; RUN.bosses[3]='mini';
    B={board:Array(64).fill(null),log:[],ai:{rating:900}};
    B.board[0]={side:'en',t:'R',id:1}; B.board[7]={side:'en',t:'K',id:2};
    B.board[40]={side:'me',t:'N',id:3}; B.board[63]={side:'me',t:'K',id:4};`);
}
setup();
run('announceSignature()');
assert.equal(run('signatureReady()'),true);
assert.equal(run('enemyPlan(0).to'),40);
assert.equal(run('enemyPlan(0).from'),0);
const warned = run('JSON.stringify(B)');
for(const disruption of [
  'B.board[25]=B.board[40];B.board[40]=null',
  "B.board[24]={side:'me',t:'B',id:5}",
  'B.board[0]=null',
  "B.board[40]={side:'me',t:'N',id:10}",
  'B.noCap=1','B.skip=1','B.blunder=1',
  "B.board[15]={side:'me',t:'R',id:6}"
]){
  run('B='+warned);
  run(disruption);
  assert.equal(run('signatureReady()'),false,disruption);
}
run('B='+warned+';delete B.chariot;announceSignature()');
assert.equal(run('!!B.chariot'),false);
for(const other of ["RUN.circuit='harbor'","RUN.blind=1","RUN.gauntlet=true","RUN.bosses[3]='tax'"]){
  setup();run(other);run('announceSignature()');
  assert.equal(run('!!B.chariot'),false,other);
}
console.log('PASS: Heracles announces one legal rook capture, remembers it across reloads and respects disruption.');
for(const [circuit,kind,to,pathLength] of [['downtown','N',17,2],['harbor','P',9,2],['midnight','B',27,4]]){
  setup();
  run(`RUN.circuit='${circuit}'; B.board[40]=null; B.board[0].t='${kind}';
       B.board[${to}]={side:'me',t:'N',id:3}; B.board[1]={side:'en',t:'P',id:5}; announceSignature()`);
  assert.equal(run('signatureReady()'),true,circuit);
  assert.equal(run('enemyPlan(0).to'),to,circuit);
  assert.equal(run('B.board.filter((_,i)=>onSignaturePath(B.chariot,OLYMPIAN_MOVES[miniName()],i)).length'),pathLength);
  if(kind==='P') run('B.board[1]=null');
  if(kind==='N') run('B.board[17]=null');
  if(kind==='B') run("B.board[9]={side:'me',t:'P',id:7}");
  assert.equal(run('signatureReady()'),false,circuit);
}

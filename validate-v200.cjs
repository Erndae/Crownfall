// v200 Vantage points (Rooftop) and Bounty (Midnight Market): the last two circuits get their own encounter.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
const fight=(circuit,ante,x='')=>E(`MATCH=null;RUN={land:'greek',circuit:'${circuit}',ante:${ante},blind:2,money:5,relics:[],roster:['K']};B={board:Array(64).fill(null),swaps:1,tac:null,log:[]};${x}`);
E("pop=()=>{};logPos=()=>{};updateHud=()=>{};sfx.coin=()=>{};sfx.ambush=()=>{};");
// ---- Vantage points: where
fight('rooftop',2);let V=JSON.parse(E('JSON.stringify(vantagePoints(B.board))'));assert.deepEqual(V,[42,45]);
fight('rooftop',4);V=JSON.parse(E('JSON.stringify(vantagePoints(B.board))'));assert.equal(V.length,3);for(const i of V)assert(i>=32&&i<=47,'The Bearer’s third and fourth ranks');
fight('rooftop',1);assert.equal(E('vantagePoints(B.board).length'),0,'Not in the opening stage');
fight('harbor',3);assert.equal(E('vantagePoints(B.board).length'),0);fight('rooftop',3,'RUN.gauntlet=true');assert.equal(E('vantagePoints(B.board).length'),0);
fight('rooftop',2,"B.board[42]={t:'P',side:'me'}");V=JSON.parse(E('JSON.stringify(vantagePoints(B.board))'));assert(!V.includes(42)&&V.length===2,'Never under a piece');
// ---- Vantage points: what
fight('rooftop',4,"B.vantage=[42,45,35];tacState().n=0;");
E("B.board[42]={t:'N',side:'me',id:1}");assert.equal(E('runVantage(42)'),false,'Only the King claims');assert.equal(E('B.vantage.length'),3);
E("B.board[42]={t:'K',side:'me',id:2}");assert.equal(E('runVantage(42)'),true);assert.equal(E('tacState().n'),1);assert.equal(E('B.swaps'),1);assert.equal(E('runVantage(42)'),false,'One use');
E("tacState().n=TAC_MAX;B.board[45]={t:'K',side:'me',id:3}");assert.equal(E('runVantage(45)'),true);assert.equal(E('tacState().n'),E('TAC_MAX'));assert.equal(E('B.swaps'),2,'Full Tactics: a swap instead');
E("B.board[35]={t:'P',side:'en',id:4}");assert.equal(E('runVantage(35)'),true);assert.equal(E('B.swaps'),1,'Enemy first: -1 swap');assert.equal(E('B.vantage.length'),0);
fight('rooftop',2,"B.vantage=[42];B.swaps=0;B.board[42]={t:'B',side:'en',id:5}");assert.equal(E('runVantage(42)'),true);assert.equal(E('B.swaps'),0,'Never below zero');
E('B.vantage=undefined');assert.equal(E('runVantage(42)'),false,'Older saved fights have none');
// ---- Bounty: who
const army="B.board[1]={t:'N',side:'en',id:11};B.board[3]={t:'Q',side:'en',id:12};B.board[4]={t:'K',side:'en',id:13};B.board[9]={t:'P',side:'en',id:14};B.board[60]={t:'K',side:'me',id:15};";
fight('midnight',2,army);assert.deepEqual(JSON.parse(E('JSON.stringify(bountyPick(B.board))')),{id:12,pay:3},'The most valuable enemy piece, never the King');
fight('midnight',4,army);assert.equal(E('bountyPick(B.board).pay'),4);
fight('midnight',1,army);assert.equal(E('bountyPick(B.board)'),null);fight('rooftop',3,army);assert.equal(E('bountyPick(B.board)'),null);
fight('midnight',3,"B.board[4]={t:'K',side:'en',id:13};B.board[9]={t:'P',side:'en',id:14};");assert.equal(E('bountyPick(B.board).id'),14,'A Pawn only when there is nothing else');
fight('midnight',3,"B.board[4]={t:'K',side:'en',id:13};");assert.equal(E('bountyPick(B.board)'),null);
// ---- Bounty: what
fight('midnight',2,army+"B.bounty=bountyPick(B.board);");
assert.equal(E('bountyOn(B.board[3])'),true);assert.equal(E('bountyOn(B.board[1])'),false);
assert.equal(E("bountyStrikes(B.board[3],{t:'P',side:'me'},20)"),true);assert.equal(E('RUN.money'),4,'Its capture costs $1');
assert.equal(E("bountyStrikes(B.board[1],{t:'P',side:'me'},20)"),false);assert.equal(E("bountyStrikes(B.board[3],null,20)"),false,'A quiet move costs nothing');
E('RUN.money=0');assert.equal(E("bountyStrikes(B.board[3],{t:'P',side:'me'},20)"),true);assert.equal(E('RUN.money'),0,'Never below zero');
assert.equal(E('bountyClaim(B.board[1],20)'),false);assert.equal(E('bountyClaim(B.board[3],20)'),true);assert.equal(E('RUN.money'),3);assert.equal(E('B.bounty'),null);assert.equal(E('bountyClaim(B.board[3],20)'),false,'Paid once');
// ---- Board key and wiring
fight('rooftop',2,"B.vantage=[42,45]");assert.deepEqual(JSON.parse(E('JSON.stringify(boardMarks().map(m=>m.k))')),['vantage']);assert(E('boardMarkAt(42)').includes('Vantage point on '));
fight('midnight',2,army+"B.bounty=bountyPick(B.board);");assert.deepEqual(JSON.parse(E('JSON.stringify(boardMarks().map(m=>m.k))')),['bounty']);
E('B.board[3]=null');assert.equal(E('boardMarks().length'),0,'No key entry once the bounty piece is gone');
assert(src.includes('B.vantage = vantagePoints(B.board); B.bounty = bountyPick(B.board);'));
assert(src.includes('runVantage(to); bountyClaim(victim, to);')&&src.includes("enSafe('vantage',()=>runVantage(to))")&&src.includes("enSafe('bounty',()=>bountyStrikes(mover, lost, to))"));
assert(src.includes("out.push('Vantage points')")&&src.includes("out.push('Bounty')")&&src.includes('class="vantage-mark"')&&src.includes('class="bounty-mark"'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=200);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: vantage points (King only, +1 Tactic or swap, -1 swap if lost), bounty (+$3/$4, -$1 per capture), stages 2-4 of their circuit only, key, wiring, version.');

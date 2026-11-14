// v205 The Royal Banner: the Ruler fights' encounter.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
E("pop=()=>{};logPos=()=>{};updateHud=()=>{};sfx.coin=()=>{};sfx.ambush=()=>{};");
const fight=(circuit,bosses,x='')=>E(`MATCH=null;RUN={land:'greek',circuit:'${circuit}',ante:1,blind:2,bosses:${JSON.stringify(bosses)},money:5,relics:[],roster:['K']};B={board:Array(64).fill(null),swaps:1,tac:null,log:[]};${x}`);
// where: only the fight against the Ruler
fight('ruler',['ruler']);assert.equal(E('rulerFight()'),true);assert.deepEqual(JSON.parse(E('JSON.stringify(bannerSquare(B.board))')),[27]);
fight('ruler',['ruler'],"B.board[27]={t:'P',side:'en'};B.board[28]={t:'P',side:'en'}");assert.deepEqual(JSON.parse(E('JSON.stringify(bannerSquare(B.board))')),[26],'An open square in the middle');
fight('ruler',['ruler'],"B.board[10]={t:'N',side:'en',id:9};B.board[4]={t:'K',side:'en',id:8};B.board[60]={t:'K',side:'me',id:7}");assert.deepEqual(JSON.parse(E('JSON.stringify(bannerSquare(B.board))')),[28],'Not a square an officer reaches with its first move (c7 Knight reaches d5)');
fight('ruler',['clock']);assert.equal(E('rulerFight()'),false);assert.equal(E('bannerSquare(B.board).length'),0);
fight('midnight',['mini']);assert.equal(E('bannerSquare(B.board).length'),0);
fight('ruler',['ruler'],'RUN.gauntlet=true');assert.equal(E('bannerSquare(B.board).length'),0);
fight('ruler',['ruler']);E('MATCH={}');assert.equal(E('rulerFight()'),false);E('MATCH=null');
// what
fight('ruler',['ruler'],"B.banner=[27];tacState().n=1;");
E("B.board[27]={t:'P',side:'me',id:1}");assert.equal(E('runBanner(27)'),false,'Pawns cannot raise it');assert.equal(E('B.banner.length'),1);
E("B.board[27]={t:'N',side:'me',id:2}");assert.equal(E('runBanner(27)'),true);assert.equal(E('tacState().n'),2);assert.equal(E('B.board[27].sh'),1,'The piece gains Armor');assert.equal(E('B.banner.length'),0);assert.equal(E('runBanner(27)'),false,'Once');
E("B.banner=[27];tacState().n=TAC_MAX;B.board[27]={t:'K',side:'me',id:3}");assert.equal(E('runBanner(27)'),true);assert.equal(E('B.swaps'),2,'Full Tactics: a swap');assert.equal(E('B.board[27].sh||0'),0,'No Armor on the King');
E("B.banner=[27];tacState().n=2;B.board[27]={t:'B',side:'en',id:4}");assert.equal(E('runBanner(27)'),true);assert.equal(E('tacState().n'),1,'Enemy first: -1 Tactic');
E("B.banner=[27];tacState().n=0;B.swaps=2");assert.equal(E('runBanner(27)'),true);assert.equal(E('B.swaps'),1,'No Tactic: -1 swap');
E("B.banner=[27];tacState().n=0;B.swaps=0");assert.equal(E('runBanner(27)'),true);assert.equal(E('B.swaps'),0);assert.equal(E('tacState().n'),0,'Never below zero');
E("B.banner=[27];B.board[27]={t:'P',side:'en',id:5}");assert.equal(E('runBanner(27)'),false,'Enemy Pawns cannot either');
E('B.banner=undefined');assert.equal(E('runBanner(27)'),false,'Older saved fights have none');
// key and wiring
fight('ruler',['ruler'],'B.banner=[27]');assert.deepEqual(JSON.parse(E('JSON.stringify(boardMarks().map(m=>m.k))')),['banner']);assert(E('boardMarkAt(27)').includes('Royal banner on '));
assert(src.includes('B.banner = bannerSquare(B.board);')&&src.includes('bountyClaim(victim, to); runBanner(to);')&&src.includes("enSafe('banner',()=>runBanner(to))"));
assert(src.includes('class="banner-mark"')&&src.includes("coach('banner')")&&src.includes("out.push('Royal banner')"));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=205);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: banner only against the Ruler, officers and Kings raise it, +1 Tactic/swap and Armor, -1 Tactic/swap if lost, key, wiring, version.');

// v195 Green Lights: the Downtown Blitz encounter. +1 move for the Bearer, -1 if an enemy gets there first, one use each.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
const fight=(circuit,ante,limit,extra='')=>E(`MATCH=null;RUN={land:'street',circuit:'${circuit}',ante:${ante},blind:2,money:5,relics:[],roster:['K']};B={board:Array(64).fill(null),moveLimit:${limit},moves:${limit||10},movesStart:${limit||10},log:[]};${extra}`);
// where they appear: Downtown fights with a move limit only; 3 at the Circuit Boss, 2 otherwise; fifth and sixth ranks; spread out
fight('downtown',4,14);let L=JSON.parse(E('JSON.stringify(greenLights(B.board))'));
assert.equal(L.length,3);for(const i of L)assert(i>=16&&i<=31,'contested ground, never a first-move square');
for(let a=0;a<L.length;a++)for(let b=a+1;b<L.length;b++)assert(Math.abs((L[a]&7)-(L[b]&7))>=2,'spread across files');
fight('downtown',3,14);assert.equal(E('greenLights(B.board).length'),2);
fight('downtown',4,null);assert.equal(E('greenLights(B.board).length'),0,'No move limit, no lights');
fight('harbor',4,14);assert.equal(E('greenLights(B.board).length'),0);
fight('downtown',4,14,"RUN.gauntlet=true;");assert.equal(E('greenLights(B.board).length'),0);
fight('downtown',4,14,"B.board[27]={t:'N',side:'en'};B.board[28]={t:'N',side:'en'};");L=JSON.parse(E('JSON.stringify(greenLights(B.board))'));assert(!L.includes(27)&&!L.includes(28)&&L.length===3,'Never under a piece');
// what they do
E("pop=()=>{};logPos=()=>{};updateHud=()=>{};sfx.coin=()=>{};sfx.ambush=()=>{};");
fight('downtown',4,14,"B.lights=[27,25,30];B.board[27]={t:'N',side:'me'};");
assert.equal(E('runGreenLight(27)'),true);assert.equal(E('B.moves'),15,'Bearer gains a move');assert.equal(E('B.lights.length'),2);assert.equal(E('runGreenLight(27)'),false,'One use');
E("B.board[25]={t:'B',side:'en'}");assert.equal(E('runGreenLight(25)'),true);assert.equal(E('B.moves'),14,'Enemy first: Bearer loses a move');
E("B.moves=1;B.board[30]={t:'P',side:'en'}");assert.equal(E('runGreenLight(30)'),true);assert.equal(E('B.moves'),1,'Never the last move');assert.equal(E('B.lights.length'),0);
assert.equal(E('runGreenLight(12)'),false);E('B.lights=undefined');assert.equal(E('runGreenLight(27)'),false,'Battles saved before v195 have no lights');
E("B.lights=[26];B=JSON.parse(JSON.stringify(B))");assert.equal(E('B.lights[0]'),26,'Lights survive a battle save and reload');
// wiring
assert(src.includes('B.lights = greenLights(B.board);')&&src.includes('springDockCrate(to); runGreenLight(to);')&&src.includes("enSafe('light',()=>runGreenLight(to))"));
assert(src.includes("light?' · green light: +1 move':''")&&src.includes('class="green-light"')&&src.includes("out.push('Green lights')"));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=195);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: lights only in Downtown move-limit fights, on open contested squares; +1 / -1 / never the last move; one use; saved; wired; version.');

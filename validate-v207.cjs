// v207 Green lights are placed out of every piece's first-move reach, so the race is fair now that the enemy wants them (v204).
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
// a full opening: both back ranks and both Pawn rows
const army="const back='RNBQKBNR';for(let f=0;f<8;f++){B.board[f]={t:back[f],side:'en',id:f+1};B.board[8+f]={t:'P',side:'en',id:f+11};B.board[48+f]={t:'P',side:'me',id:f+21};B.board[56+f]={t:back[f],side:'me',id:f+31};}";
const fight=(ante,x='')=>E(`MATCH=null;RUN={land:'street',circuit:'downtown',ante:${ante},blind:2,money:5,relics:[],roster:['K']};B={board:Array(64).fill(null),moveLimit:14,moves:14,movesStart:14,log:[]};${army}${x}`);
fight(4);let L=JSON.parse(E('JSON.stringify(greenLights(B.board))'));assert.equal(L.length,3);
const near=new Set(JSON.parse(E("JSON.stringify((()=>{const s=[];for(let i=0;i<64;i++)if(B.board[i])for(const t of movesFor(B.board,i))s.push(t);return s})())")));
assert(near.has(24)&&near.has(32),'Pawn double steps reach both middle ranks, so those are out');
// in a standard opening every middle square is one Pawn step away, so the fallback squares are used and there are still 3
for(const i of L)assert(i>=16&&i<=39,'Still in the middle of the board');
// when part of the board is out of reach, those squares are used first
E(`MATCH=null;RUN={land:'street',circuit:'downtown',ante:4,blind:2,money:5,relics:[],roster:['K']};B={board:Array(64).fill(null),moveLimit:14,moves:14,movesStart:14,log:[]};B.board[4]={t:'K',side:'en',id:1};B.board[60]={t:'K',side:'me',id:2};for(let f=0;f<4;f++){B.board[8+f]={t:'P',side:'en',id:10+f};B.board[48+f]={t:'P',side:'me',id:20+f};}`);
L=JSON.parse(E('JSON.stringify(greenLights(B.board))'));assert.equal(L.length,3);
const near2=new Set(JSON.parse(E("JSON.stringify((()=>{const s=[];for(let i=0;i<64;i++)if(B.board[i])for(const t of movesFor(B.board,i))s.push(t);return s})())")));
assert(near2.has(24)&&!near2.has(28));assert(!near2.has(L[0])&&!near2.has(L[1]),'The squares nobody reaches at once come first');
for(let a=0;a<L.length;a++)for(let b=a+1;b<L.length;b++)assert(Math.abs((L[a]&7)-(L[b]&7))>=2,'Spread across files');
fight(3);assert.equal(E('greenLights(B.board).length'),2);
assert(src.includes('take([27,28,26,29,25,30,24,31,35,36,34,37,33,38,32,39], true);'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=207);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: green lights prefer squares out of first-move reach of every piece, fall back to the middle ranks, stay spread, version.');

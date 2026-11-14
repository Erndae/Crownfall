// v204 The enemy goes for the marks on the board (green lights, vantage points, the Ruler's banner) and avoids crate traps.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
const set=x=>E(`MATCH=null;RUN={land:'street',circuit:'downtown',ante:4,blind:2,money:5,relics:[],roster:['K']};B={board:Array(64).fill(null),log:[]};B.board[4]={t:'K',side:'en',id:1};B.board[60]={t:'K',side:'me',id:2};${x}`);
const mv=(to,t,att=false)=>E(`enemyMarkValue(B.board,${to},{t:'${t}',side:'en'},${att})`);
set('B.lights=[26]');assert.equal(mv(26,'N'),24,'A safe light is worth taking');assert.equal(mv(26,'N',true),6,'Less when the square is attacked');assert.equal(mv(26,'P'),24,'Pawns take lights too');assert.equal(mv(27,'P'),0);
set('B.vantage=[42]');assert.equal(mv(42,'B'),24);
set('B.banner=[27]');assert.equal(mv(27,'N'),24);assert.equal(mv(27,'P'),0,'Pawns cannot raise the banner');assert.equal(mv(27,'K'),24,'The Ruler can');
set('B.crates=[18]');assert.equal(mv(18,'N'),-8,'Crates pay the Bearer, so it steps around them');
set('');assert.equal(mv(26,'N'),0,'No marks, no change');E('B=null');assert.equal(E("enemyMarkValue([],26,{t:'N'},false)"),0);
// leaning toward a mark it can reach next turn (officers only)
set("B.lights=[26];B.board[9]={t:'N',side:'en',id:3}");assert.equal(mv(9,'N'),5,'From b7 a Knight reaches c5... next turn');
assert.equal(mv(9,'P'),0);
// never worth a piece: the bonus is under a Knight's value
assert(24<E('TYPE.N.val')&&24>E('TYPE.P.val'));
assert(src.includes('score += enemyMarkValue(nb, to, mover, myAtt.has(to));'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=204);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: enemy values marks (24 safe / 6 attacked / 5 within reach), avoids crates, pawns cannot take the banner, no change without marks, version.');

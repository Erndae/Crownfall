// v222 Vantage points: any piece except a pawn claims them (either side), and they sit mid-board.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const fight=(a,x='')=>E(`(()=>{MATCH=null;PACK='street';RUN={land:'street',circuit:'rooftop',ante:${a},blind:1,money:5,relics:[],roster:['K']};B={board:Array(64).fill(null),swaps:1};${x};return 0})()`);
fight(2);assert.deepEqual(JSON.parse(E('JSON.stringify(vantagePoints(B.board))')),[26,29],'c5 and f5');
fight(4);assert.deepEqual(JSON.parse(E('JSON.stringify(vantagePoints(B.board))')),[26,29,35],'plus d4 at stage 4');
for(const t of ['N','B','R','Q','K']){fight(3,`B.vantage=[26];tacState().n=0;B.board[26]={t:'${t}',side:'me',id:9}`);assert.equal(E('runVantage(26)'),true,t+' claims');assert.equal(E('tacState().n'),1);}
fight(3,"B.vantage=[26];B.board[26]={t:'P',side:'me',id:9}");assert.equal(E('runVantage(26)'),false,'your pawn passes over');assert.equal(E('B.vantage.length'),1);
fight(3,"B.vantage=[26];B.board[26]={t:'P',side:'en',id:9}");assert.equal(E('runVantage(26)'),false,'enemy pawn passes over');assert.equal(E('B.swaps'),1);
fight(3,"B.vantage=[26];B.board[26]={t:'B',side:'en',id:9}");assert.equal(E('runVantage(26)'),true);assert.equal(E('B.swaps'),0,'enemy piece first: -1 swap');
// the enemy only chases them with pieces that can take them
assert(src.includes("const takes = i => has('lights', i) || ((has('vantage', i) || has('banner', i)) && mover.t !== 'P');"));
assert(src.includes("vant=(B.vantage||[]).includes(to)&&p&&p.t!=='P',"),'the move preview says so for any non-pawn');
// every explanation says the new rule; none says King only
for(const x of ['move any piece <b>except a pawn</b> onto one for +1 Tactic','Any of your pieces except a pawn can claim one','Any piece <b>except a pawn</b> can claim one','aria-label="Vantage point: any of your pieces except a pawn gains 1 Tactic'])assert(src.includes(x),x);
assert(!/Only your <b>King<\/b> can claim|Only your King can claim|your King gains 1 Tactic/.test(src));
assert(src.includes('Your ${TYPE[q.t].name} holds the vantage point on'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=222&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: vantage points c5/f5 (+d4 at stage 4), any piece but pawns claims for either side, enemy chases only with non-pawns, preview and every explanation updated, version.');

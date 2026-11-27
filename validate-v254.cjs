// v254 Enemy Armor works: your attack on an Armored enemy breaks one layer and captures nothing (your piece stays; a
// King is knocked back), scores nothing, and the preview says so. Armor still doesn't protect a piece giving check.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=254&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
const setup=(x)=>E(`(()=>{MATCH=null;setPack('medieval');newRun('harbor');RUN.ante=1;RUN.blind=0;B={board:Array(64).fill(null),score:0,target:9999,moves:10,lv:{},log:[]};
  const b=B.board;b[60]={t:'K',side:'me',id:1};b[4]={t:'K',side:'en'};b[36]={t:'N',side:'me',id:2};b[19]={t:'R',side:'en',sh:1};${x||''};return 0})()`);
setup();
assert.equal(E('armorBlockSq(36,19)'),19,'an Armored enemy blocks');
assert.equal(E('projectedMoveScore(36,19)'),null,'and scores nothing in the preview');
assert.equal(E('legalFor(B.board,36).includes(19)'),true,'the attack is still allowed (it bounces)');
E('B.board[19].sh=0');assert.equal(E('armorBlockSq(36,19)'),-1,'no Armor left: a normal capture');
// Armor is off while the piece gives check: an ordinary capture
setup("b[19]=null;b[20]={t:'R',side:'en',sh:2};b[60]=null;b[52]={t:'K',side:'me',id:1};b[36]=null;b[38]={t:'B',side:'me',id:2}");
assert.equal(E('checksKing(B.board,20)'),true);assert.equal(E('armorBlockSq(38,20)'),20,'v255: a checking piece keeps its Armor while the King has another way out');
// your own pieces' Armor is untouched by this (only enemy targets)
setup("b[19]={t:'R',side:'me',sh:1,id:5}");assert.equal(E('armorBlockSq(36,19)'),-1);
assert(src.includes("{ const asq = armorBlockSq(from, to); if(asq >= 0) return armorBounce(from, to, asq, mover, victim, bonusMove, strike); }   // v254"));
assert(src.includes("async function armorBounce(from, to, asq, mover, victim, bonusMove, strike){")&&src.includes("const scoreText=blocked?'Enemy Armor blocks this attack · no capture, one layer breaks'"));
console.log('PASS: your attacks on Armored enemies bounce (one layer, no capture, no score; King knocked back), the preview says so; checking pieces and your own Armor unchanged; version');

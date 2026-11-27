// v255 Armor and check: a checking Armored piece keeps its Armor; only when capturing it is the defender's ONLY way out
// of check does the capture go through. Same rule for both sides, and in the enemy AI's own search.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=255&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
const board=(pcs)=>E(`(()=>{MATCH=null;setPack('medieval');newRun('harbor');B={board:Array(64).fill(null),score:0,target:9999,moves:10,lv:{},log:[]};const b=B.board;${pcs};return 0})()`);
// squares: a8=0 … h8=7, a1=56 … h1=63
// 1) Enemy Armored Rook checks your King, the King can step aside: Armor holds
board("b[60]={t:'K',side:'me',id:1};b[4]={t:'K',side:'en'};b[28]={t:'R',side:'en',sh:1};b[46]={t:'B',side:'me',id:2}");   // Re5 checks Ke1 down the e-file; Bg3 can take e5
assert.equal(E('checksKing(B.board,28)'),true);
assert.equal(E('armorOnlyEscape(B.board,28)'),false,'the King can step off the e-file');
assert.equal(E('armorHolds(B.board,28)'),true,'so the Armor holds');
assert.equal(E('legalFor(B.board,46).includes(28)'),false,'the Bishop’s bounce would leave the King in check: not legal');
// 2) Same check, but the King is boxed in: capturing is the only way out, so the capture goes through
board("b[60]={t:'K',side:'me',id:1};b[4]={t:'K',side:'en'};b[28]={t:'R',side:'en',sh:2};b[46]={t:'B',side:'me',id:2};b[59]={t:'R',side:'me',id:3};b[61]={t:'R',side:'me',id:4};b[51]={t:'P',side:'me',id:5};b[53]={t:'P',side:'me',id:6}");
assert.equal(E('armorOnlyEscape(B.board,28)'),true,'boxed in, nothing can block: capture is the only way');
assert.equal(E('armorHolds(B.board,28)'),false);assert.equal(E('legalFor(B.board,46).includes(28)'),true);
assert.equal(E('armorBlockSq(46,28)'),-1,'the capture is a real capture');
// 3) A block is another way out: Armor holds
board("b[60]={t:'K',side:'me',id:1};b[4]={t:'K',side:'en'};b[28]={t:'R',side:'en',sh:1};b[46]={t:'B',side:'me',id:2};b[59]={t:'R',side:'me',id:3};b[61]={t:'R',side:'me',id:4};b[51]={t:'P',side:'me',id:5};b[53]={t:'P',side:'me',id:6};b[33]={t:'N',side:'me',id:7}");   // Nb4 can block on d3? (c2/d3/d5) — Nb4-? blocks e-file at e4? no: use a Rook
E("B.board[33]=null;B.board[39]={t:'R',side:'me',id:8}");   // Rh4 can block on e4
assert.equal(E('armorOnlyEscape(B.board,28)'),false,'a block counts as a way out');assert.equal(E('armorHolds(B.board,28)'),true);
// 4) Your Armored piece checking the enemy King keeps its Armor too, and giving check no longer breaks it
board("b[60]={t:'K',side:'me',id:1};b[4]={t:'K',side:'en'};b[36]={t:'R',side:'me',id:2,sh:1};b[44]={t:'P',side:'me',id:3}");
assert.equal(E('checksKing(B.board,36)'),true);assert.equal(E('armorHolds(B.board,36)'),true,'the enemy King can step aside');
assert.equal(E('armorBreakOnCheck("me")'),0);assert.equal(E('B.board[36].sh'),1,'Armor stays after giving check');
// 5) The enemy AI follows the same rule in its own search: it never plans an illegal bounce while in check,
//    and still finds the capture when it is the only way out.
board("b[60]={t:'K',side:'me',id:1};b[3]={t:'K',side:'en'};b[11]={t:'P',side:'en'};b[10]={t:'P',side:'en'};b[12]={t:'P',side:'en'};b[2]={t:'R',side:'en'};b[4]={t:'R',side:'en'};b[19]={t:'N',side:'me',id:2,sh:1};b[29]={t:'B',side:'en'}");
// Nd6 is checking? A knight on d6 (19) attacks c8 (2) and e8 (4), not d8. Place the knight on e6 (20): attacks d8 (3).
E("B.board[19]=null;B.board[20]={t:'N',side:'me',id:2,sh:1};B.board[29]=null;B.board[27]={t:'B',side:'en'}");   // Bd5 can take e6
assert.equal(E('checksKing(B.board,20)'),true);
const only=E('armorOnlyEscape(B.board,20)');
const pick=JSON.parse(E(`JSON.stringify(CFAI.choose(B.board,{side:'en',rating:1700,ref:CFAI.material(B.board),rng:()=>0.5,budgetMs:300}))`));
const legal=E(`legalFor(B.board,${pick.from}).includes(${pick.to})`);assert.equal(legal,true,`the AI's move is legal (${pick.from}→${pick.to})`);
const after=E(`(()=>{const v=B.board[${pick.to}];if(v&&v.side==='me'&&armorHolds(B.board,${pick.to}))return 'bounce';return inCheck(applyMove(B.board,${pick.from},${pick.to}),'en')?'still in check':'ok'})()`);
assert.equal(after,'ok',`the AI's move gets it out of check (${after}; only-capture=${only})`);
// 6) Boxed in, capture is the only way out: the AI captures the Armored checker
board("b[60]={t:'K',side:'me',id:1};b[48]={t:'P',side:'me',id:9};b[7]={t:'K',side:'en'};b[14]={t:'P',side:'en'};b[15]={t:'P',side:'en'};b[6]={t:'B',side:'en'};b[13]={t:'N',side:'me',id:2,sh:2}");
assert.equal(E('checksKing(B.board,13)'),true);assert.equal(E('armorOnlyEscape(B.board,13)'),true);
const pick2=JSON.parse(E(`JSON.stringify(CFAI.choose(B.board,{side:'en',rating:1700,ref:CFAI.material(B.board),rng:()=>0.5,budgetMs:300}))`));
assert.equal(pick2.to,13,`the AI takes the checker (${pick2.from}→${pick2.to})`);
assert(!src.includes("if(x & ME) armBreak(ns, true);")&&src.includes("const armOn = false;   // v255"));
assert(src.includes("A piece giving check keeps its Armor, unless capturing it is the only way out of check."));
console.log('PASS: checking Armored pieces keep their Armor (both sides) unless capturing them is the only way out; blocks and King steps count; giving check no longer breaks Armor; the enemy AI follows the rule; version');

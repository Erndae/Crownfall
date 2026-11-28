// v257 The enemy AI knows about its own Armor: it values it, knows your attacks on it bounce, and uses it.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=257&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
E("MATCH=null;setPack('medieval');newRun('harbor');RUN.ante=1;RUN.blind=0");
// a8=0 … h1=63. Enemy Queen d5 (27) attacked by your Pawn e4 (36); your Rook a5 (24) hangs to the enemy Knight b7 (9)
const pos=(qArmor)=>`(()=>{const b=Array(64).fill(null);b[60]={t:'K',side:'me',id:1};b[36]={t:'P',side:'me',id:2};b[24]={t:'R',side:'me',id:3};b[53]={t:'P',side:'me',id:4};
  b[4]={t:'K',side:'en'};b[27]={t:'Q',side:'en'${qArmor?',sh:1':''}};b[9]={t:'N',side:'en'};b[12]={t:'P',side:'en'};b[13]={t:'P',side:'en'};return b})()`;
const choose=(b,seed)=>JSON.parse(E(`JSON.stringify(CFAI.choose(${b},{side:'en',rating:1600,ref:CFAI.material(${b}),rng:(()=>{let x=${seed};return()=>((x=x*16807%2147483647)/2147483647)})(),budgetMs:400}))`));
let saveQ=0,grab=0;
for(const seed of [3,7,11]){ const plain=choose(pos(false),seed), arm=choose(pos(true),seed);
  if(plain.from===27)saveQ++; if(arm.to===24)grab++; }
assert(saveQ>=2,`without Armor the AI saves its attacked Queen (${saveQ}/3)`);
assert(grab>=2,`with Armor it trusts the Armor and takes your hanging Rook (${grab}/3)`);
// the AI knows your attacks on its Armored pieces bounce: in its search your Pawn's hit on the Queen is not a capture
assert(src.includes("if((v & 96) && armorHolds(t)){ if(!capsOnly && (s[f] & 7) !== K) out.push(f | t << 6 | 4 << 12); return false; }"));
assert(src.includes("if(p.sh > 0 && p.t !== 'K') c |= Math.min(3, p.sh) << 5;")&&src.includes("matEn += VAL[t] + ((x >> 5) & 3) * 60 /* v257"));
// and it still answers checks legally with Armor on either side (v255 rule, both directions)
const b2=`(()=>{const b=Array(64).fill(null);b[60]={t:'K',side:'me',id:1};b[48]={t:'P',side:'me',id:9};b[20]={t:'N',side:'me',id:2,sh:1};b[3]={t:'K',side:'en'};b[11]={t:'P',side:'en'};b[10]={t:'P',side:'en'};b[12]={t:'P',side:'en'};b[2]={t:'R',side:'en',sh:1};b[4]={t:'R',side:'en'};b[27]={t:'B',side:'en',sh:2};return b})()`;
E(`B={board:${b2}}`);const m=choose(b2,5);
assert(E(`legalFor(B.board,${m.from}).includes(${m.to})`),'legal answer to check');
assert.equal(E(`(()=>{const v=B.board[${m.to}];if(v&&v.side==='me'&&armorHolds(B.board,${m.to}))return 'bounce';return inCheck(applyMove(B.board,${m.from},${m.to}),'en')?'check':'ok'})()`),'ok');
console.log(`PASS: the enemy AI values its own Armor and trusts it (saves an unarmored Queen ${saveQ}/3, takes the hanging Rook with an Armored Queen ${grab}/3); your attacks on its Armor bounce in its search; checks answered legally; version`);

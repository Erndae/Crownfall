// v258 New Game+ Armor eased now that enemy Armor is real: Queen (cycle 1), Queen + one Rook (2), Queen + both Rooks (3+).
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=258&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
E('MATCH=null;RUN=null');
const army="[{t:'Q',side:'en'},{t:'R',side:'en'},{t:'R',side:'en'},{t:'B',side:'en'},{t:'B',side:'en'},{t:'N',side:'en'},{t:'N',side:'en'},{t:'P',side:'en'},{t:'K',side:'en'},{t:'Q',side:'me'},{t:'R',side:'me'}]";
const arm=n=>{E(`ACH.ngplus=${n};globalThis.__b=${army};ngArmor(globalThis.__b)`);return JSON.parse(E('JSON.stringify(globalThis.__b.map(p=>p.sh||0))'));};
assert.deepEqual(arm(0),[0,0,0,0,0,0,0,0,0,0,0]);
assert.deepEqual(arm(1),[1,0,0,0,0,0,0,0,0,0,0],'cycle 1: the Queen');
assert.deepEqual(arm(2),[1,1,0,0,0,0,0,0,0,0,0],'cycle 2: Queen and one Rook');
assert.deepEqual(arm(3),[1,1,1,0,0,0,0,0,0,0,0],'cycle 3: Queen and both Rooks');
assert.deepEqual(arm(6),[1,1,1,0,0,0,0,0,0,0,0],'never more than 3, never Bishops, Knights, Pawns, Kings or yours');
// two Queens (Twin Queens armies): Queens first, still capped
const twin="[{t:'Q',side:'en'},{t:'Q',side:'en'},{t:'R',side:'en'},{t:'R',side:'en'},{t:'K',side:'en'}]";
E(`ACH.ngplus=1;globalThis.__b=${twin};ngArmor(globalThis.__b)`);assert.deepEqual(JSON.parse(E('JSON.stringify(__b.map(p=>p.sh||0))')),[1,0,0,0,0]);
E(`ACH.ngplus=3;globalThis.__b=${twin};ngArmor(globalThis.__b)`);assert.deepEqual(JSON.parse(E('JSON.stringify(__b.map(p=>p.sh||0))')),[1,1,1,0,0]);
// the New Game+ offer says so
assert(src.includes("Enemy ${next >= 3 ? 'Queen and both Rooks' : next >= 2 ? 'Queen and one Rook' : 'Queen'} start <b>Armored</b>"));
// the playtest tool understands Armor
const tool=fs.readFileSync(__dirname+'/tools/playtest.cjs','utf8');assert(tool.includes('--armor=0')&&tool.includes('armorBlockSq(m.from,m.to)'));
E('ACH.ngplus=0');
console.log('PASS: New Game+ Armor: Queen, then Queen + Rook, then Queen + both Rooks (max 3, Queens first); offer text; playtest tool Armor-aware; version');

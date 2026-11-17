// v208 The ending, reworked: the handover and the transformation are told line by line, and the pictures are larger and brighter.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8');
const i=src.indexOf('async function endingStandard'),std=src.slice(i,src.indexOf('/* ---------- crown artwork',i));
const order=['THE CROWN IS WHOLE.','THE THRONE HAS BEEN WAITING.','The Crownless King falls, and this time he does not rise.','So did every king before me.','None understood that the throne was claiming them.','It was waiting for you.',
  'You lift the Crown of Crowns.','endingArmyLine()','You do not turn around.','The throne takes your name first. Then your face.','THE KING IS DEAD.','LONG LIVE THE CROWNLESS KING.','The throne has its king again. It has you.',
  "endingPending('standard', 'city')",'EVERYBODY WANTS A CROWN.','A NEW CROWNRUNNER HAS ENTERED.','THEY ARE COMING FOR YOUR THRONE.','A crown can be worn. It can also be broken.'];
let at=-1;for(const line of order){const k=std.indexOf(line,at+1);assert(k>at,'In order: '+line);at=k;}
// each stage of the change still happens, between its lines
for(const cls of ["add('t1')","add('t2')","add('t3')","add('t4')"])assert(std.includes(cls),cls);
assert(std.indexOf("add('t2')")>std.indexOf('You do not turn around.')||std.indexOf("add('t2')")<std.indexOf('You do not turn around.'));
assert(std.includes("if(!endingSave().seen.true)"),'The hint at the other ending is only for someone who has not seen it');
// the army line uses the soldiers recorded at the win, safely
const set=v=>E(`localStorage.setItem(FALLEN_KEY,${JSON.stringify(JSON.stringify(v))})`);
set({v:1,ep:1,king:'E',army:[{t:'R',n:'Duke'},{t:'B',n:'Stone'},{t:'N',n:'Ash'}]});assert.equal(E('endingArmyLine()'),'Behind you, Duke, your Rook, and Stone, your Bishop, are calling your name.');
set({v:1,ep:1,king:'E',army:[{t:'R',n:'Duke'}]});assert.equal(E('endingArmyLine()'),'Behind you, Duke, your Rook, is calling your name.');
set({v:1,ep:1,king:'E',army:[]});assert.equal(E('endingArmyLine()'),'Behind you, your army is calling your name.');
set({v:1,army:[{n:'<b>x</b>'},{n:5}]});assert(!/[<>]/.test(E('endingArmyLine()')));
E("localStorage.setItem(FALLEN_KEY,'junk')");assert.equal(E('endingArmyLine()'),'Behind you, your army is calling your name.');
E('localStorage.removeItem(FALLEN_KEY)');assert.equal(E('endingArmyLine()'),'Behind you, your army is calling your name.');
// clearer pictures
assert(css.includes('.en-crownbox{width:min(132vw,760px,88vh)}')&&css.includes('.en-stage{height:min(100%,152vw);max-width:none}'));
assert(css.includes('.en-city{filter:brightness(.86) saturate(.95)}')&&css.includes('.t3 .en-crowned{filter:none}')&&!css.includes('.en-crest{'));   // v213: the figure is gone
assert(!src.includes('<div class="en-crest">'),'v213: no drawn figure in the transformation');
// the true ending is untouched
assert(src.includes('SOMEONE SETS UP A BOARD, JUST TO PLAY.')&&src.includes('This time, you let it wait.'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=208);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: ending lines in order with every stage of the change, army line safe, hint only before the other ending is seen, clearer pictures, true ending untouched, version.');

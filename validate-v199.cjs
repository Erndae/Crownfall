// v199 Board key: reminders of what the marks on the board do. Presentation only.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
const fresh=(x='')=>E(`MATCH=null;RUN={land:'street',circuit:'downtown',ante:4,blind:2,money:5,relics:[],roster:['K']};B={board:Array(64).fill(null),log:[]};${x}`);
const keys=()=>JSON.parse(E('JSON.stringify(boardMarks().map(m=>m.k))'));
fresh();assert.deepEqual(keys(),[],'A plain fight has no key');
fresh('B.lights=[26,29]');assert.deepEqual(keys(),['light']);assert(E('boardMarks()[0].name').includes('2 left'));
fresh('B.crates=[18]');assert.deepEqual(keys(),['crate']);assert(E('boardMarks()[0].name').startsWith('Crate trap ·'),'Singular for one');
fresh("B.board[3]={t:'R',side:'en',id:7};B.board[4]={t:'N',side:'en',id:8};B.guardIds=[7,8]");assert.deepEqual(keys(),['guard']);
E('B.board[3]=null');assert(E('boardMarks()[0].name').includes('1 left'));E('B.board[4]=null');assert.deepEqual(keys(),[],'Gone once the defenders are');
fresh("B.board[60]={t:'N',side:'me',id:1,sh:2}");assert.deepEqual(keys(),['armor']);
fresh("B.trapSq=[35]");assert.deepEqual(keys(),['trap']);
fresh("B.lights=[26];B.crates=[18];B.trapSq=[35];B.board[60]={t:'N',side:'me',id:1,sh:1}");assert.deepEqual(keys(),['light','crate','trap','armor']);
for(const m of JSON.parse(E('JSON.stringify(boardMarks())'))){assert(m.text.length>40&&m.text.length<240,m.k);assert(E(`!!BK_ICON.${m.k}`),m.k);}
// what a tap on a marked square says
assert(E('boardMarkAt(26)').includes('Green light on '));assert(E('boardMarkAt(18)').includes('Crate trap on '));assert(E('boardMarkAt(35)').includes(' on '));assert.equal(E('boardMarkAt(0)'),'');
E('B=null');assert.equal(E('boardMarks().length'),0);assert.equal(E('boardMarkAt(26)'),'');
// the key text matches the rules it describes
assert(src.includes("const lost = B.moves > 1 ? 1 : 0; B.moves -= lost;")&&src.includes('B.moves++; pop(at, \'Green light · +1 move\''),'Green light: +1 / -1, never the last');
assert(src.includes('you lose up to $2; enemy entry gives you $2'),'Crate: up to $2 / +$2');
// wiring: tap an empty mark, the Board key button, and marked or Armored enemies in the info bar
assert(src.includes("const mk = boardMarkAt(i); if(mk){ showTip(mk);")&&src.includes('id="keyBtn"')&&src.includes("kb.onclick = e => { e.stopPropagation(); boardKey(); }"));
assert(src.includes("<b class=\"fxm\">Marked defender</b> · capture to unlock the score win"));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=199);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: key lists only the marks present, singular/plural and counts, tap reminders, texts match the rules, wired, version.');

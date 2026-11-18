// v219 The Hunger: the dark power in every crown. It whispers louder with each crown, corrupts the Rulers, made the Hollow Crown, and each ending finishes or kills it.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const M=JSON.parse(E('JSON.stringify(CROWN_MYST)'));assert.equal(M.length,4);
assert(M[0].join(' ').includes('Old Crownrunners called it the Hunger.'),'named at the first crown');
['“Win.”','“More.”','“Make them kneel.”','“Come home.”'].forEach((w,i)=>assert(M[i].join(' ').includes(w),'whisper '+(i+1)));
const W=JSON.parse(E('JSON.stringify(CROWN_WHISPER)'));assert.deepEqual(W,{street:'Win.',medieval:'More.',greek:'Make them kneel.',fantasy:'Come home.',throne:'You are home.'});
assert.equal(E("crownWhisperHTML('greek')"),'<p class="crownwhisper">The Hunger whispers: “Make them kneel.”</p>');assert.equal(E("crownWhisperHTML('nope')"),'');
assert.equal((src.match(/\$\{crownWhisperHTML\(l\)\}/g)||[]).length,2,'on the Journey crown card and the defended-crown screen');assert(css.includes('.crownwhisper{'));
// no spoiler: nothing before the ending says who the King was
for(const x of [...M.flat(),...Object.values(W)])assert(!/crownless|was once a|became the|every king/i.test(x));
// Rulers, Hollow Crown, opponents
for(const x of ['Then the Hunger got in, and I forgot what I wanted.','The Hunger hollows you out from the inside.','I wore a crown once. The Hunger ate the rest of me. Now I take them.','The Hunger took my will... then he took my name.'])assert(src.includes(x),x);
assert(JSON.parse(E('JSON.stringify(HOLD_LINES)')).includes('The Hunger goes quiet when I lose. Is that strange?'));
// endings: wearing it finishes the Hunger's work; breaking it kills the Hunger
const std=src.slice(src.indexOf('async function endingStandard'),src.indexOf('/* ---------- crown artwork'));
const a=std.indexOf("E.scene('become')"),b=std.indexOf('The Hunger finishes what the crowns began.'),k=std.indexOf('The throne takes your name first.');assert(a>0&&b>a&&k>b);
const tr=src.slice(src.indexOf('async function endingTrue'),src.indexOf('const ENDING_PRE'));
const t1=tr.indexOf('THE CROWN IS BROKEN.'),t2=tr.indexOf('The Hunger dies with it.'),t3=tr.indexOf('THE THRONE IS EMPTY.');assert(t1>0&&t2>t1&&t3>t2);
assert(src.includes('const GAME_VERSION = 219;')&&sw.includes("'crownfall-v219'")&&!src.includes('?v=218'));
console.log('PASS: the Hunger named at the first crown, whispers grow (Win, More, Make them kneel, Come home), crown cards, Rulers, Hollow Crown, released opponents, both endings, no spoilers, version.');

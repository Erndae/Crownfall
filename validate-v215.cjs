// v215 The true ending shows the masked Crownrunner holding the Crown of Crowns at their side, before it breaks.
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const f=__dirname+'/assets/ending/crown-refused.webp';assert(fs.existsSync(f)&&fs.statSync(f).size>20000&&fs.statSync(f).size<400000,'painting present, light enough for phones');
assert(fs.readFileSync(f).slice(8,12).toString()==='WEBP');
assert(src.includes("const ENDING_REFUSE = 'assets/ending/crown-refused.webp';")&&sw.includes("'./assets/ending/crown-refused.webp'"),'defined and cached offline');
assert(/ENDING_REIGN, ENDING_REFUSE,/.test(src),'prefetched with the other ending art');
assert(src.includes('<div class="en-scene en-paint" data-s="refuse"><div class="en-art" role="img" aria-label="'),'uses the painted-scene layout (phone fit, Continue panel)');
const tr=src.slice(src.indexOf('async function endingTrue'),src.indexOf('const ENDING_PRE'));
const order=['This time, you let it wait.',"E.scene('refuse')","E.cont('You hold the Crown of Crowns. This time, you do not put it on.'","E.scene('crown')","classList.add('breaking')",'THE CROWN IS BROKEN.','THE THRONE IS EMPTY.','The throne never takes your face.','SOMEONE SETS UP A BOARD, JUST TO PLAY.'];
let at=-1;for(const x of order){const k=tr.indexOf(x,at+1);assert(k>at,'In order: '+x);at=k;}
assert(tr.includes("bg(q('[data-s=refuse] .en-art'), 'refuse')"));
const std=src.slice(src.indexOf('async function endingStandard'),src.indexOf('/* ---------- crown artwork'));assert(!std.includes('refuse'),'the standard ending is unchanged');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=215&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: refusal painting present, cached and prefetched, shown in the true ending before the crown breaks, standard ending unchanged, version.');

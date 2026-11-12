// v201 Two display fixes: the store header's empty band in the iPhone home-screen app, and card names cut at both ends.
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8');
// store header: inside the home-screen block only, no second safe-area padding, pinned under the status band
const i=css.indexOf('@media (display-mode:standalone)'),blk=css.slice(i,css.indexOf('\n}\n}',i));
assert(blk.includes('.shophead{padding-top:8px!important;top:calc(env(safe-area-inset-top,0px) + var(--topfade))!important}'));
assert(src.includes('.shophead{position:sticky;top:0;'),'Browsers keep the original header');
// card names: wrapped in a span that renderCards sizes to fit; buttons keep their height
assert(src.includes('<span class="gmn">${cardLabel(c)}</span>'));
assert(src.includes("while(f > 8 && (n.scrollWidth > n.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1)){ f -= 0.5;"),'Shrinks until it fits, never below 8px');
assert(css.includes('.gmc .gmn{display:block;max-width:100%;white-space:normal;')&&css.includes('.play .actions .gmc{max-height:44px;'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=201);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: store header band fixed for the home-screen app only, card names sized to fit, version.');

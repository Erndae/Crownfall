// v202 Two display fixes: the restock button running into Next round, and victory screens starting inside the status band.
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8');
assert(css.includes('.shopfoot #reroll{white-space:normal;line-height:1.1;overflow-wrap:break-word;text-wrap:balance;font-size:13px}'));
const names=[...src.matchAll(/restock:'([^']*)'/g)].map(m=>m[1]);assert(names.includes('Conjure new wares'));for(const n of names)assert(n.length<=20,n+' fits two lines');
const i=css.indexOf('@media (display-mode:standalone)'),blk=css.slice(i,css.indexOf('\n}\n}',i));
assert(blk.includes('.vict{padding-top:calc(env(safe-area-inset-top,0px) + var(--topfade) + 8px)!important}'),'Home-screen app only');
assert(src.includes('.vict{position:fixed;inset:0;z-index:40;display:grid;place-items:center;padding:calc(env(safe-area-inset-top,0px) + 16px)'),'Browsers unchanged');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=202);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: restock label wraps, victory screens clear the status band in the home-screen app, version.');

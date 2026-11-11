// v194 The Land's picture behind the stage and store screens is visible (was 13% under a heavy shade). Crown City unchanged.
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8');
const m=css.match(/body\[data-art="1"\]:not\(\[data-pack="street"\]\)::before\{opacity:([.\d]+)\}/);assert(m&&+m[1]>=.5&&+m[1]<=.8,'picture clearly visible');
const sh=css.match(/body\[data-art="1"\]:not\(\[data-pack="street"\]\)::after\{background:linear-gradient\(180deg,([^}]*)\)\}/);assert(sh);
const a=[...sh[1].matchAll(/rgba\(10,9,12,([.\d]+)\)/g)].map(x=>+x[1]);assert(a.length>=4&&Math.min(...a)<=.4&&a[a.length-1]>=.9,'lighter at the top, dark behind the cards');
assert(src.includes('body[data-art="1"]::before{content:"";position:fixed;inset:0;background:var(--landart)'),'same layer, same picture');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=194);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: land picture visible behind stage and store screens outside Crown City, shade fades down, version.');

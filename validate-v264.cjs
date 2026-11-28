// v264 Lettering and color: each Land's own fonts for display text, Rubik body, Barlow Condensed numbers, readable store and Material box.
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8'),css=fs.readFileSync(__dirname+'/storybook.css','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=264&&sw.includes("'crownfall-v"+RegExp.$1+"'")&&sw.includes('storybook.css?v='+RegExp.$1));
const v=css.slice(css.indexOf('/* v264 LETTERING'));assert(v.length>200);
for(const [pack,font] of [['street','Permanent Marker'],['medieval','MedievalSharp'],['greek','Cinzel'],['fantasy','Cinzel Decorative'],['throne','Cinzel']])
  assert(new RegExp(`body\\[data-pack="${pack}"\\][^{]*\\{--display:"${font}"`).test(v),pack+' lettering');
assert(v.includes('--body:"Rubik"')&&v.includes('--num:"Barlow Condensed"'),'body and number fonts');
assert(!/--lt-accent:/.test(v),'never redefines the Land accent set by applyLandTheme');
assert(src.includes('<section class="jland locked" data-p="${l}"')&&/class="jland \$\{won[^"]*"\s+data-p="\$\{l\}"/.test(src),'Journey cards carry their Land');
assert(v.includes('body[data-pack="street"] .shopscr :is(.recnote,.training-help)'),"Crown City's dark store gets light notes");
assert(v.includes('body[data-pack] #app.play .cbox.chips{color:#f6ead3}'),'Material box text readable');
console.log('PASS: v264 lettering: five Land fonts, Rubik body, Barlow numbers, Journey cards by Land, Crown City store and Material box readable, Land accent untouched');

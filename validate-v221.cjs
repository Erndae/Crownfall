// v221 The walk into each Land: two layers (Land drifts closer, the Crownrunner steps), footsteps, Skip intro, then the Land's chapter card.
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const W={street:['bg-street','fig-city'],medieval:['bg-medieval','fig-c1'],greek:['bg-greek','fig-c2'],fantasy:['bg-fantasy','fig-c3'],throne:['bg-throne','fig-c4']};
assert(src.includes("const WALK = {street:['bg-street','fig-city'], medieval:['bg-medieval','fig-c1'], greek:['bg-greek','fig-c2'], fantasy:['bg-fantasy','fig-c3'], throne:['bg-throne','fig-c4']};"),'one charm per World Crown won before the Land');
for(const l in W)for(const n of W[l]){const f=__dirname+'/assets/intro/'+n+'.webp';assert(fs.existsSync(f),n);const b=fs.readFileSync(f);assert(b.slice(8,12).toString()==='WEBP'&&b.length<200000,n+' light');
assert(sw.includes(`'./assets/intro/${n}.webp'`),n+' cached');}
for(const n of ['fig-city','fig-c1','fig-c2','fig-c3','fig-c4']){const b=fs.readFileSync(__dirname+'/assets/intro/'+n+'.webp');assert(b.includes(Buffer.from('ALPH'))||(b[20]&0x10),n+' has transparency');}
// wiring: the walk plays first, then the existing chapter card; returns true at once so the short Land card does not also show
const ch=src.slice(src.indexOf('function landChapter(l){'),src.indexOf('function landIntro(l)'));
assert(ch.includes('const show = () => {')&&ch.includes('landWalk(l, show);\n    return true;'));
const lw=src.slice(src.indexOf('function landWalk(l, then){'),src.indexOf('function landChapter(l){'));
assert(lw.includes('<button class="lw-skip" type="button">Skip intro</button>')&&lw.includes("e.target.closest('.lw-skip')"),'Skip intro, or tap anywhere');
assert(lw.includes('setInterval(() => { if(!done) footstep(l, steps++); }, 550)')&&lw.includes('if(!calm)'),'footsteps in time with the 1.1s two-step cycle, none under reduced motion');
assert(lw.includes('clearInterval(stepT)'),'footsteps stop when it ends');assert(lw.includes('calm ? 3500 : 6200'));
assert(/\.lwalk\.in \.lw-fig img\{animation:lwstep 1\.1s ease-in-out infinite\}/.test(css)&&css.includes('@keyframes lwnear')&&css.includes('@keyframes lwaway'));
assert(css.includes('.lwalk.in .lw-bg img,.lwalk.in .lw-fig,.lwalk.in .lw-fig img{animation:none}'),'still under reduced motion');
assert(/\.lw-skip\{[^}]*min-height:44px/.test(css)&&css.includes('env(safe-area-inset-top,0px)'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=221&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: walk art for all five Lands (charms 0-4, transparent figures, cached), plays before the chapter card, Skip intro/tap, footsteps in step and stopped, reduced motion, version.');

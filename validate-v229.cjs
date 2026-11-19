// v229 A smaller first download (the page cached once, later art topped up), and board marks in Gauntlet waves.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
// ---------- the offline cache
const list=name=>{const s=sw.indexOf(`const ${name} = [`),e=sw.indexOf('];',s);return [...sw.slice(s,e).matchAll(/'(\.\/[^']+)'/g)].map(m=>m[1]);};
const core=list('FILES'),later=list('LATER');
assert.equal(core.filter(f=>f==='./index.html').length,1,'the page is downloaded once');assert(!core.includes('./'),'not again as ./');
assert.equal(new Set(core).size,core.length,'no duplicates');for(const f of later)assert(!core.includes(f),'not in both: '+f);
assert(later.length>=15&&later.every(f=>/^\.\/assets\/(ending|intro)\//.test(f)),'later: ending paintings and later walk-ins');
for(const f of ['./assets/intro/bg-street.webp','./assets/intro/fig-city.webp','./crownfall-logo.webp','./manifest.webmanifest'])assert(core.includes(f),'first session needs '+f);
for(const f of [...core,...later]){const p=__dirname+'/'+f.slice(2).split('?')[0];assert(fs.existsSync(p),'exists: '+f);}
const size=l=>l.reduce((s,f)=>s+fs.statSync(__dirname+'/'+f.slice(2).split('?')[0]).size,0);
assert(size(core)<8e6,'first download under 8 MB: '+(size(core)/1e6).toFixed(2));
assert(sw.includes("self.addEventListener('message', e => { if(e.data && e.data.type === 'topup') e.waitUntil(cacheAll(LATER)); });"));
assert(src.includes("navigator.serviceWorker.ready.then(r => r.active && r.active.postMessage({type:'topup'}))")&&src.includes('c.saveData'),'top-up after a minute, skipped on data saver / 2G');
// ---------- Arena marks
const wave=(w,circ,x='')=>E(`(()=>{MATCH=null;PACK='greek';RUN={gauntlet:true,gWave:${w},land:'greek',circuit:'${circ}',ante:2,blind:2,money:6,relics:[],roster:['K','N','B','P','P','P','P','R','Q'],bosses:['a','b','c','mini']};B={board:deploy(RUN.roster),swaps:1,log:[]};setupEnemyArmy(B.board);${x};return JSON.stringify({c:dockCrates(B.board).length,v:vantagePoints(B.board).length,b:!!bountyPick(B.board),f:bannerSquare(B.board).length,on:gMarks()})})()`);
for(const circ of ['downtown','rooftop','harbor','midnight']){
  let r=JSON.parse(wave(2,circ));assert.equal(r.on,false);assert.equal(r.c+r.v+(r.b?1:0)+r.f,0,'waves 1-2 stay plain: '+circ);
  r=JSON.parse(wave(3,circ));assert.equal(r.on,true);
  const want={downtown:'f',rooftop:'v',harbor:'c',midnight:'b'}[circ];
  for(const k of ['c','v','b','f'])assert.equal(!!r[k],k===want,`${circ}: ${k}`);}
let r=JSON.parse(wave(20,'harbor','RUN.ante=1'));assert(r.c>=2,'any stage of a wave (no stage-2 rule in the Arena)');
r=JSON.parse(wave(9,'rooftop',"MATCH={}"));assert.equal(r.v,0,'never in a Crown Match');
r=JSON.parse(E("(()=>{MATCH=null;RUN={land:'greek',circuit:'downtown',ante:3,blind:1,money:6,relics:[],roster:['K'],bosses:['a','b','c','ruler']};B={board:Array(64).fill(null)};return JSON.stringify({f:bannerSquare(B.board).length})})()"));assert.equal(r.f,0,'the campaign Banner stays in Ruler fights');
assert.equal(E('G_MARK.harbor'),'Supply crates');assert(src.includes('<small class="mchip gmark">${G_MARK[RUN.circuit]}</small>'),'the wave card names it');
assert(src.includes('const G_MARK = {downtown:\'Royal Banner\', rooftop:\'Vantage points\', harbor:\'Supply crates\', midnight:\'Bounty\'};'));
assert(!src.includes("If the Ruler’s side gets there first"),'the Banner tip no longer says Ruler');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=229&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: page cached once, ending and later walk-ins topped up later (first download under 8 MB), Arena marks from wave 3 by circuit (Banner/Vantage/Crates/Bounty), never in Crown Matches, campaign unchanged, version.');

// v262 Save code: back up or move all Crownfall progress with one code or file; loading can be undone once.
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=261&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
assert(src.includes('id="savecode">Save code<small>Back up or move to another phone</small>'),'title screen button');
assert(src.includes("$('#savecode').onclick = () => saveCodeScreen();"));
for(const t of ['Copy save code','Save as file','Load save code','Open a save file','Undo last load','Load this save?'])assert(src.includes(t),t);
const i=src.indexOf('const SC_HEAD'),j=src.indexOf('function saveCodeScreen');assert(i>0&&j>i);
// the codec and the key filter, run on their own
const store={};const ls={get length(){return Object.keys(store).length},key:n=>Object.keys(store)[n]??null};
const rawGet=k=>k in store?store[k]:null,rawSet=(k,v)=>{store[k]=String(v)},rawDel=k=>{delete store[k]};
const f=new Function('localStorage','rawGet','rawSet','rawDel',src.slice(i,j)+';return {scKeep,scData,scEncode,scDecode,scErr,SC_UNDO};');
const S=f(ls,rawGet,rawSet,rawDel);
Object.assign(store,{'cf151c-gambit-ach':'{"crown_x":1}','cf151c-gambit-run':'{"RUN":{}}','cf151g-gambit-run':'{"d":1}','crownrunner-character-v1':'{"name":"Ernesto"}','gambit-sound':'off','crownfall-daily':'{}',
  'cf151c-crownfall-lastver':'260','crownfall-mode':'gauntlet','crownfall-intent':'new','crownfall-undo-load':'{}','gambit-ach':'legacy v150','unrelated':'x'});
assert.deepEqual(Object.keys(S.scData()).sort(),['cf151c-gambit-ach','cf151c-gambit-run','cf151g-gambit-run','crownfall-daily','crownrunner-character-v1','gambit-sound'],'only Crownfall progress and settings travel');
(async()=>{
  const code=await S.scEncode(S.scData());assert(/^CROWNFALL1\.[jz]\.[A-Za-z0-9_-]+\.[0-9a-f]{8}$/.test(code));
  const x=await S.scDecode(' '+code.slice(0,30)+'\n'+code.slice(30)+' ');assert.equal(x.d['crownrunner-character-v1'],'{"name":"Ernesto"}','spaces and line breaks from pasting are ignored');
  for(const [bad,why] of [['hello','not'],[code.slice(0,-20),'cut'],[code.slice(0,40)+'A'+code.slice(41),'cut']])await assert.rejects(S.scDecode(bad),e=>e.message===why);
  assert(S.scErr(new Error('cut')).startsWith('That code is incomplete'));
  console.log('PASS: save code: title button, only Crownfall keys travel (not the mode switch, version or undo copy), code survives pasting, broken and foreign codes are refused');
})().catch(e=>{console.error(e);process.exit(1)});

import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
const section=source.slice(source.indexOf('const SPLASH_SCENES = ['),source.indexOf('// Splash: soft cream light'));
const storage=new Map([['gambit-run','untouched campaign'],['crownfall-mode','campaign']]);let count=0;
const context=vm.createContext({localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},crypto:{getRandomValues:a=>{a[0]=(count++*2654435761)>>>0;return a;}},Uint32Array,Math});
vm.runInContext(section,context);const seen=new Set();let last;
for(let i=0;i<1000;i++){const scene=vm.runInContext('chooseSplashScene()',context);assert(scene.id!==last);assert(fs.existsSync(scene.src));assert(sw.includes(scene.src));seen.add(scene.id);last=scene.id;}
assert.equal(seen.size,3);assert.equal(storage.get('gambit-run'),'untouched campaign');assert.equal(storage.get('crownfall-mode'),'campaign');
storage.set('crownfall-splash-scene','invalid');assert(vm.runInContext('chooseSplashScene().id',context));
context.localStorage={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};assert(vm.runInContext('chooseSplashScene().id',context));context.crypto={getRandomValues(){throw Error('unavailable');}};assert(vm.runInContext('chooseSplashScene().id',context));
assert(source.includes('Promise.all([entrance, loaded, fonts, sceneReady]).then(close)'));assert(source.includes('setTimeout(close, 6000)'));assert(source.includes('image.onerror = () => { sp.style.removeProperty'));
console.log('PASS: 1,000 startup selections use all three backgrounds with no consecutive repeat; corrupt/blocked storage and missing crypto fall back; gameplay saves are untouched; image failure and six-second startup escape remain; all three assets are offline-cached.');

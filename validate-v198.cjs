// v198 The story inside each Land: one beat per circuit conquered for the first time, counted by circuits won, toward the Ruler.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
const S=JSON.parse(E('JSON.stringify(CIRCUIT_STORY)'));
assert.deepEqual(Object.keys(S),['street','medieval','greek','fantasy','throne']);
const all=[];for(const l in S){assert.equal(S[l].length,4,l);for(const x of S[l]){all.push(x);assert(x.length>=40&&x.length<=125,x);assert(!/Crownless|become|next king|you are the king|—|!/i.test(x),'No spoiler, plain voice: '+x);}}
assert.equal(new Set(all).size,20);
// the fourth beat of each Land brings in its Ruler; the Fallen Throne's is never named
const ruler={street:'Vex',medieval:'Aldric',greek:'Athena',fantasy:'Morwen'};for(const l in ruler)assert(S[l][3].includes(ruler[l]),l);
assert(/throne/.test(S.throne[3])&&!/King/.test(S.throne.join(' ')));
// shown only for a first conquest of a Land that is not yet won
assert.equal(E("circuitStory('greek',2,true,false,false)"),S.greek[1]);
for(const args of ["'greek',2,false,false,false","'greek',2,true,true,false","'greek',2,true,false,true","'arena',1,true,false,false","'greek',0,true,false,false","'greek',5,true,false,false"])assert.equal(E(`circuitStory(${args})`),'',args);
assert(src.includes('<p class="ccstory">${circuitStory(l, n, fresh, won, rebuilt)}</p>'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=198);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: 20 unique beats, Rulers arrive on the fourth, no spoilers, first conquests only, wired, version.');

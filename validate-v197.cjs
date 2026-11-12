// v197 The road between Lands: one short passage, once per campaign, the first time a newly opened Land is reached.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
const P=JSON.parse(E('JSON.stringify(LAND_PASSAGE)'));
assert.deepEqual(Object.keys(P),['medieval','greek','fantasy','throne']);
const order=['street','medieval','greek','fantasy','throne'];
for(const l in P){assert.equal(P[l].from,order[order.indexOf(l)-1],l+' follows the Land before it');assert.equal(P[l].lines.length,4);
  for(const x of P[l].lines){assert(x.length<=110,x);assert(!/Crownless|become the|next king|you are the king|—|!/i.test(x),'No spoiler, plain voice: '+x);}}
assert(P.medieval.lines.some(x=>x.includes('{C}')));
// when it is due
E("ACH.campaign_epoch=4242;localStorage.removeItem(PASSAGE_KEY);localStorage.removeItem('crownfall-chapters');for(const l of BASE_LANDS) delete ACH[landCrownId(l)];");
assert.equal(E("landPassageDue('street')"),false,'Crown City has no road in');
assert.equal(E("landPassageDue('medieval')"),false,'Locked Land');
E("ACH[landCrownId('street')]=1");assert.equal(E("landPassageDue('medieval')"),true);assert.equal(E("landPassageDue('greek')"),false);
E("localStorage.setItem('crownfall-chapters',JSON.stringify({ep:4242,seen:['street','medieval']}))");
assert.equal(E("landPassageDue('medieval')"),false,'A Land already being played is not re-introduced');
E("localStorage.setItem('crownfall-chapters',JSON.stringify({ep:1,seen:['medieval']}))");assert.equal(E("landPassageDue('medieval')"),true,'An older campaign does not count');
E("localStorage.setItem(PASSAGE_KEY,JSON.stringify({ep:4242,seen:['medieval']}))");assert.equal(E("landPassageDue('medieval')"),false,'Once per campaign');
E("ACH.campaign_epoch=4243");assert.equal(E("landPassageDue('medieval')"),true,'A new campaign tells it again');
E("ACH[landCrownId('medieval')]=1");assert.equal(E("landPassageDue('medieval')"),false,'A conquered Land has no road in');assert.equal(E("landPassageDue('greek')"),true);
for(const bad of ['"x"','{"ep":4243,"seen":5}','nope']){E(`localStorage.setItem(PASSAGE_KEY,${JSON.stringify(bad)})`);assert.equal(E("Array.isArray(passageSeen().seen)"),true,bad);}
assert.equal(E("landPassageDue('arena')"),false);assert.equal(E("landPassageDue()"),false);
// wiring
assert(src.includes("if(landPassageDue(PACK)) return landPassage(PACK, () => circuitSelect(PACK, startCircuit));"));
assert(src.includes("lines.map(x => x.replace('{C}', landCrownName(P.from)))")&&src.includes('}catch(e){ go(); }'),'A failure never blocks the road');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=197);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: four passages in Land order, no spoilers, due once per campaign for a newly opened Land only, safe storage, wired, version.');

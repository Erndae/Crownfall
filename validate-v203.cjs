// v203 Economy: store prices rise 30% per Land after Crown City; savings bonus capped at $3 outside Crown City.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
const at=(l,cir='downtown',x='')=>E(`MATCH=null;RUN={land:'${l}',circuit:'${cir}',ante:2,blind:2,money:50,relics:[],roster:['K'],lv:{P:1,N:1,B:1,R:1,Q:1,K:1}};${x}`);
const mult={street:1,medieval:1.3,greek:1.6,fantasy:1.9,throne:2.2};
for(const l in mult){at(l);assert.equal(+E('landPriceMult()').toFixed(2),mult[l],l);
  for(const base of [1,3,5,8,14,24,36,52,25])assert.equal(E(`price(${base})`),Math.max(1,Math.round(base*mult[l])),l+' '+base);
  assert.equal(E('restockCost()'),Math.round(5*mult[l]));assert.equal(E("trainCost('N')"),Math.round(8*mult[l]),'Training Lv.1→2 in '+l);assert.equal(E('lifeCost()'),Math.round(25*mult[l]));}
at('street');assert.equal(E('price(8)'),8,'Crown City is unchanged');
// Midnight Market's $1 discount comes first, then the Land's rise
at('greek','midnight');assert.equal(E('price(8)'),Math.round(7*1.6));at('street','midnight');assert.equal(E('price(8)'),7);assert.equal(E('price(1)'),1);
// Gauntlet and Crown Match are untouched
at('throne','downtown','RUN.gauntlet=true');assert.equal(E('price(8)'),8);assert.equal(E('landPriceMult()'),1);
at('throne');E('MATCH={}');assert.equal(E('landPriceMult()'),1);E('MATCH=null');
// selling is not scaled, so buying and reselling never makes money
at('throne');assert.equal(E("releaseValue({t:'N',e:''})"),E("Math.max(1,Math.floor(TYPE.N.cost/2))"));assert(E("releaseValue({t:'Q',e:''})")<E("price(TYPE.Q.cost)"));
// savings bonus
const sv=(m,cir,l)=>E(`CrownfallPolish.savings(${m},'${cir}',${l?`'${l}'`:'undefined'})`);
assert.equal(sv(1000,'downtown','street'),5);assert.equal(sv(1000,'midnight','street'),6);assert.equal(sv(1000,'downtown'),5,'Old two-argument calls keep the Crown City cap');
for(const l of ['medieval','greek','fantasy','throne']){assert.equal(sv(1000,'downtown',l),3,l);assert.equal(sv(1000,'midnight',l),4,l);assert.equal(sv(10,'downtown',l),2);assert.equal(sv(4,'downtown',l),0);}
at('greek');assert.equal(E('savingsCap()'),3);at('street','midnight');assert.equal(E('savingsCap()'),6);
assert(src.includes("CrownfallPolish.savings(RUN.money,RUN.circuit,land())")&&src.includes('max $${savingsCap()}'));
assert(src.includes('prices +${Math.round((landPriceMult() - 1) * 100)}%'),'The store says how much prices have risen');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=203);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: prices x1 / 1.3 / 1.6 / 1.9 / 2.2 by Land on every store cost, Midnight discount first, Gauntlet and Match untouched, sell values unscaled, savings cap $3 (+$1 Midnight) after Crown City, version.');

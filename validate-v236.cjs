// v236 Bigger Hunger bargains with real prices, and a lasting one (blood).
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=236&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
const setup=(n,x='')=>E(`(()=>{MATCH=null;ACH.edicts=[];for(const k of Object.keys(ACH))if(/^crown_/.test(k))delete ACH[k];BASE_LANDS.slice(0,${n}).forEach(l=>ACH[landCrownId(l)]=1);
  setPack('greek');newRun('rooftop');RUN.blind=2;RUN.ante=2;RUN.money=50;${x};return 0})()`);
// all five kinds come up, sized by the crowns carried
const kinds=new Set();for(const n of [1,2,3,4]){setup(n);for(const circ of ['downtown','rooftop','harbor','midnight','ruler'])for(const a of [1,2,3,4]){
  E(`RUN.circuit='${circ}';RUN.ante=${a}`);const o=JSON.parse(E('JSON.stringify(hungerOffer())'));kinds.add(o.k);assert.equal(o.n,n);
  if(o.k==='power'){assert.equal(o.tac,2*n);assert.equal(o.pct,10*n);}
  if(o.k==='greed'){assert.equal(o.cash,5*n);assert.match(o.cost,/sits out/);}
  if(o.k==='fury')assert.equal(o.armor,n+1);
  if(o.k==='reach'){assert.equal(o.pay,3*n);assert.equal(o.swaps,n>=3?3:2);}
  if(o.k==='blood'){assert(o.lasting&&o.bt);assert.match(o.boon,/a level for good/);assert.match(o.cost,/is gone for good$/);}}}
assert.deepEqual([...kinds].sort(),['blood','fury','greed','power','reach']);
// fallbacks: no Pawn or nothing to level → power; can't pay → power
const kindFor=(x)=>{const out=new Set();for(const circ of ['downtown','rooftop','harbor','midnight','ruler'])for(const a of [1,2,3,4]){E(`RUN.circuit='${circ}';RUN.ante=${a};${x}`);out.add(E('hungerOffer().k'));}return out;};
setup(2);assert(!kindFor("RUN.roster=RUN.roster.filter(r=>parseR(r).t!=='P')").has('blood'),'no Pawn, no blood');
setup(2);assert(!kindFor("for(const t of 'NBRQ')RUN.lv[t]=LV_MAX").has('blood'),'nothing left to level, no blood');
setup(2);assert(!kindFor("RUN.money=5").has('reach'),'can’t pay, no reach');
// blood: taking it levels the strongest type for good and removes a Pawn for good
setup(3);E("RUN.roster=['K','Q','N','P','P'];RUN.lv={P:1,N:2,B:1,R:1,Q:3,K:1}");
assert.equal(E('hungerBloodType()'),'Q');
E("RUN.roster=['K','Q','N','P::4eav1c.Tess.K.0.0.0.x.0','P']");assert.equal(E("(()=>{for(const c of ['downtown','rooftop','harbor','midnight'])for(let a=1;a<=4;a++){RUN.circuit=c;RUN.ante=a;const o=hungerOffer();if(o.k==='blood')return o.cost}return ''})()"),'Tess, one of your Pawns, is gone for good','names the Pawn it takes');
E("RUN.roster=['K','Q','N','P','P']");
const pawns=()=>E("RUN.roster.filter(r=>parseR(r).t==='P').length");
const o=JSON.parse(E("(()=>{const o=hungerOffer();o.k='blood';o.bt=hungerBloodType();o.lasting=true;return JSON.stringify(o)})()"));
E(`(()=>{const pi=hungerPawnAt();if(pi>=0)RUN.roster.splice(pi,1);RUN.lv['${o.bt}']=Math.min(LV_MAX,effLv('${o.bt}')+1);normLv(RUN);return 0})()`);
assert.equal(pawns(),1);assert.equal(E("effLv('Q')"),4);
assert(src.includes("if(o.k === 'blood'){ const pi = hungerPawnAt(); if(pi >= 0) RUN.roster.splice(pi, 1); if(o.bt){ RUN.lv[o.bt] = Math.min(LV_MAX, effLv(o.bt) + 1); normLv(RUN); } }"));
E("RUN.lv.Q=LV_MAX");assert.equal(E('hungerBloodType()'),'N','the next strongest when the Queen is maxed');
// battle effects
const fight=(o,x='')=>E(`(()=>{B={board:Array(64).fill(null),swaps:2,target:1000,log:[],tac:null};tacState().n=0;
  B.board[0]={t:'Q',side:'en'};B.board[1]={t:'R',side:'en'};B.board[2]={t:'B',side:'en'};B.board[3]={t:'K',side:'en'};B.board[60]={t:'K',side:'me'};B.board[59]={t:'Q',side:'me'};B.board[58]={t:'N',side:'me'};
  RUN.pactPending=${JSON.stringify(o)};${x};hungerApply();return 0})()`);
fight({k:'greed',n:2,cash:10,boon:'b',cost:'c'});assert.equal(E('B.board[59]'),null,'your Queen sits out');assert(E('!!B.board[58]&&!!B.board[60]'));assert.equal(E('B.pact.cash'),10);assert.equal(E('B.swaps'),2,'greed no longer costs a swap');
assert.equal(E("RUN.roster.includes('Q')||RUN.roster.some(r=>parseR(r).t==='Q')"),true,'…but stays in your army');
fight({k:'fury',n:2,armor:3,boon:'b',cost:'c'});assert.deepEqual(JSON.parse(E('JSON.stringify(B.board.slice(0,4).map(q=>q.sh||0))')),[1,1,1,0]);assert.equal(E('B.pact.fury'),4,'+2n Brilliance');
fight({k:'power',n:1,tac:2,pct:10,boon:'b',cost:'c'});assert.equal(E('tacState().n'),2);assert.equal(E('B.target'),1100);
fight({k:'reach',n:3,swaps:3,boon:'b',cost:'c'});assert.equal(E('B.swaps'),5);
assert(src.includes('This bargain lasts beyond this battle.')&&src.includes('The Hunger rarely comes. Each World Crown you carry makes its bargain bigger, and its price real.'));
console.log('PASS: five bargains sized by crowns (power +2n Tactics/+10n% target, greed +$5n/strongest piece sits out, fury +2n Brilliance/n+1 Armored, reach +2-3 swaps/$3n, blood a level for good/a Pawn for good); fallbacks; battle effects; version');

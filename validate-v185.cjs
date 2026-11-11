// v185: wagers rotate through six Challenges (three new, wager-only); cover tokens show their names underneath.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
E(`for(const k of Object.keys(sfx))sfx[k]=()=>{};`);
const run=(roster="['K','R','B','N','P','P','P']")=>E(`PACK='street';MATCH=null;RUN={land:'street',circuit:'rooftop',ante:2,blind:1,bosses:['tax','tax','tax','mini'],money:50,lv:{P:1,N:1,B:1,R:1,Q:1,K:1},relics:[],cards:[],roster:${roster},ev:{},evFx:{}};B={board:Array(64).fill(null),score:0,target:500,caps:0,lost:0,streak:0,moves:20,seen:{},ep:[]};`);
// the new Challenges exist as Challenges and identities, and can never be sold, gifted or dealt
for(const id of ['streak','kingcap','pawncap']){assert(E(`!!CHALLENGES.${id}.need`));assert.equal(E(`C('${id}').circuit`),'wager');assert(E(`C('${id}').name.length>4`));assert(E(`!!EV_WLAB.${id}&&!!EV_WBASE.${id}`));}
for(const circuit of ['downtown','rooftop','harbor','midnight','ruler',undefined]){
 const pool=E(`CARDS.filter(c=>!c.circuit||c.circuit===${JSON.stringify(circuit)}).map(c=>c.id)`);for(const id of ['streak','kingcap','pawncap'])assert(!pool.includes(id),id+' offered in '+circuit);}
assert(!E(`CARDS.filter(c=>!c.circuit).map(c=>c.id)`).some(id=>['streak','kingcap','pawncap'].includes(id)));
// the picker: one tempo + one steady, saved with the event, never the same pair twice running, real variety
run();const seen=new Set();let prev='';
for(let i=0;i<300;i++){E('window.__e={}');const p=E('evWagerOptions(window.__e)'),key=p.join('|');
 assert(['blitzer','hustler','streak'].includes(p[0])&&['strategist','kingcap','pawncap'].includes(p[1]),key);assert.notEqual(key,prev,'Same pair twice running');
 assert.deepEqual(E('evWagerOptions(window.__e)'),p,'A refresh shows the same two');assert.equal(E('RUN.wLast'),key);prev=key;seen.add(key);}
assert.equal(seen.size,9,'All nine pairings appear');
run("['K','Q','R','R','P']");for(let i=0;i<80;i++){E('window.__e={}');assert(!E('evWagerOptions(window.__e)').includes('pawncap'),'Pawn captures need 2 Pawns');}
run();E('RUN.gauntlet=true');for(let i=0;i<80;i++){E('window.__e={}');assert.equal(E('evWagerOptions(window.__e)')[0],'streak','The Gauntlet never gets a move-limited Challenge');}
run();E(`window.__e={wch:['blitzer','strategist']}`);assert.equal(E('evWagerOptions(window.__e)').join('|'),'blitzer|strategist','An older pending wager keeps its pair');
E(`window.__e={wch:['nope','strategist']}`);assert.notEqual(E('evWagerOptions(window.__e)')[0],'nope');
// counters
const start=id=>{run();E(`B.challenge={id:'${id}',used:0,caps:0,kcaps:0,circuit:true,ev:true,wg:true}`);};
const mv=(t,cap)=>E(`chalAfterMove({t:'${t}',side:'me'},${cap?"{t:'P',side:'en'}":'null'})`);
start('streak');mv('R',1);assert.equal(E('B.challenge.n'),1);mv('R',0);assert.equal(E('B.challenge.n'),0,'A quiet move breaks the run');mv('N',1);assert(!E('!!B.challenge.done'));assert.equal(E('chalState(null,false).prog'),'1/2');mv('P',1);assert(E('B.challenge.done'));
start('kingcap');mv('Q',1);mv('R',1);assert(!E('!!B.challenge.done'));assert.equal(E('chalState(null,false).status'),'King captures 0/1');mv('K',0);assert(!E('!!B.challenge.done'));mv('K',1);assert(E('B.challenge.done'));
start('pawncap');mv('P',1);mv('N',1);mv('R',0);assert.equal(E('B.challenge.n'),1);assert.equal(E('chalState(null,false).prog'),'1/2');mv('P',1);assert(E('B.challenge.done'));
for(const id of ['streak','kingcap','pawncap']){start(id);assert.equal(E('chalState(null,false).name'),E(`C('${id}').name`));assert(E('chalState(null,false).goal.length>8'));assert.equal(JSON.stringify(E('chalWinReward()')),'{"cash":0,"swap":0}');E('chalExpire();chalEnemyCapture()');assert(!E('!!B.challenge.failed'),id+' never fails mid-fight');}
// existing Challenges are untouched
start('blitzer');mv('R',1);mv('R',1);assert.equal(E('chalState(null,false).prog'),'2/3');assert.equal(E('B.challenge.n'),undefined);
start('strategist');assert.equal(E('chalState(null,false).prog'),'✓');E('chalEnemyCapture()');assert(E('B.challenge.failed'));
// a wager on a new Challenge pays when it is completed, and is lost when it is not
start('streak');E(`RUN.evFx.wager={kind:'wager',pay:9,stake:2,left:1,n:1,chal:'streak',done:0,cur:RUN.ante*10+RUN.blind}`);mv('R',1);mv('R',1);E('evWin()');assert.equal(E('RUN.money'),59);assert.equal(E('RUN.evFx.wager'),undefined);
start('kingcap');E(`RUN.evFx.wager={kind:'wager',pay:9,stake:2,left:1,n:1,chal:'kingcap',done:0,cur:RUN.ante*10+RUN.blind}`);mv('R',1);E('evWin()');assert.equal(E('RUN.money'),50,'Unfinished Challenge pays nothing');assert.equal(E('RUN.evFx.wager'),undefined);
// tokens: name under the symbol, never truncated by an ellipsis; the v184 line-height squeeze is gone
const css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8');
assert(css.includes('#app:not(.play) .relic .rn{position:absolute;top:calc(100% + 7px)'));assert(css.includes('-webkit-line-clamp:2'));assert(!css.includes('.relic .rn,.play .relic .rn{font-size:10px!important;line-height:8.925px!important}'));
const src=fs.readFileSync(__dirname+'/index.html','utf8');assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=185);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: nine wager pairings with no immediate repeat, saved pairs, Pawn and Gauntlet guards, three capture-counter Challenges, wager settlement, untouched existing Challenges, cards never offered, token name layout and version.');

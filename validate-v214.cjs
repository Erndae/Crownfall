// v214 New Game+ starts over from Crown City (a finished campaign's saved army no longer sends Continue to the throne);
// the ending loses the drawn figure, names who the soldiers are, and its story follows the King's second fall.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
// a finished campaign: Crown of Crowns won, its drafted army and carried army still saved, no run
E("MATCH=null;RUN=null;B=null;ACH.ngplus=0;delete ACH.ng_next;ACH.cdraft={r:['K','N','B'],seen:1,at:1};ACH[landCrownId('throne')]=Date.now();setCarry({roster:['K','N','B'],lv:{},relics:[],cards:[],money:40})");
assert(E('campaignComplete()')&&E('!!draftGet()')&&E('!!getCarry()'),'the state that used to send Continue to the throne');
E("globalThis.__ng=0;globalThis.__cs=0;ngAsk=()=>{globalThis.__ng++};circuitSelect=()=>{globalThis.__cs++};continueCampaign()");
assert.equal(E('globalThis.__ng'),1,'Continue Campaign on a finished campaign offers New Game+');assert.equal(E('globalThis.__cs'),0,'and never opens the throne');
// a run in progress still continues as before
E("RUN={land:'street',circuit:'downtown',ante:1,blind:1,money:1,relics:[],roster:['K'],inShop:true};shop=()=>{globalThis.__shop=1};continueCampaign()");
assert.equal(E('globalThis.__shop'),1);assert.equal(E('globalThis.__ng'),1);E('RUN=null');
// New Game+ itself: a full restart in Crown City, one cycle harder
E("ACH.ng_next=1;teamIntro=()=>{};draftConfirm({N:1,B:1})");
assert.equal(E('ACH.ngplus'),1);assert.equal(E('campaignComplete()'),false,'the throne is not won any more');
assert.equal(E('frontierLand()'),'street','the frontier is Crown City');assert.equal(E('worldCrowns()'),0,'no World Crowns carried over');
assert.equal(E('getCarry()'),null);assert.equal(E('getCheckpoint()'),null);assert.equal(E('endingSave().pending'),null);
assert(E('!!draftGet()')&&E('draftGet().r.map(s=>s[0]).sort().join("")')==='BKN'&&E('draftGet().seen')===0,'the new army is the one just drafted');
// the army line says who they are
const set=o=>E(`localStorage.setItem(FALLEN_KEY,${JSON.stringify(JSON.stringify(o))})`);
set({v:1,army:[{t:'N',n:'Spike'},{t:'B',n:'Raven'},{t:'P',n:'Ash'}]});
assert.equal(E('endingArmyLine()'),'Behind you, Spike, your Knight, and Raven, your Bishop, are calling your name: Ernesto.');
set({v:1,army:[{t:'N',n:'Spike'},{t:'N',n:'Raven'}]});assert.equal(E('endingArmyLine()'),'Behind you, Spike and Raven, your Knights, are calling your name: Ernesto.');
set({v:1,army:[{t:'R',n:'Duke'}]});assert.equal(E('endingArmyLine()'),'Behind you, Duke, your Rook, is calling your name: Ernesto.');
set({v:1,army:[{t:'X',n:'Bad'},{n:'<b>x</b>'}]});assert.equal(E('endingArmyLine()'),'Behind you, your army is calling your name: Ernesto.');
c.CrownfallCharacter={get:()=>({name:''}),art:()=>'',save:()=>true};E('localStorage.removeItem(FALLEN_KEY)');assert.equal(E('endingArmyLine()'),'Behind you, your army is calling your name.');
// the figure is gone; the painting carries the moment
const html=E('endingHTML()');for(const x of ['en-halo','en-player','en-crest','en-held','viewBox="0 0 640 768"'])assert(!html.includes(x),'removed: '+x);
assert(html.includes('en-crowned')&&html.includes('en-frag')&&html.includes('en-crack'),'the crown still darkens, cracks and shatters');
assert(!/\.en-(halo|player|crest|held)\b/.test(src+css),'no leftover styles');assert(css.includes('.t1 [data-s=lift] .en-art{filter:brightness(.5)'));
// the story, in order, fits the King's second fall; the name is taken and not used again
const std=src.slice(src.indexOf('async function endingStandard'),src.indexOf('/* ---------- crown artwork'));
const order=['THE THRONE HAS BEEN WAITING.','The Crownless King falls, and this time he does not rise.','“Take it,” he whispers.','Then he is gone. Only the crown remains.','None understood that the throne was claiming them.','The throne was never waiting for a king.','It was waiting for you.',
  "E.cont('You lift the Crown of Crowns.'","add('t1')",'endingArmyLine()','You do not turn around.',"E.scene('reign')","E.cont('For one moment, the whole kingdom is yours.'","add('t2'); E.scene('become')","add('t3')",'The throne takes your name first. Then your face.','The Crown of Crowns breaks apart.','Its four crowns scatter back to the four Lands','The throne can be held. The crown can never be kept.','THE KING IS DEAD.','LONG LIVE THE CROWNLESS KING.','A NEW CROWNRUNNER HAS ENTERED.',"E.cont('THEY ARE COMING FOR YOUR THRONE.'"];
let at=-1;for(const x of order){const k=std.indexOf(x,at+1);assert(k>at,'In order: '+x);at=k;}
assert(!std.includes('steps aside')&&!std.includes('bearerName().toUpperCase()'));
assert.equal(std.slice(std.indexOf('Then your face.')).includes('bearerName()'),false,'no name after the crown takes it');
assert.equal((std.match(/E\.scene\('reign'\)/g)||[]).length,1,'the balcony is shown once, before the change');
// true ending: you lift it, do not wear it, and keep your face and name
const tr=src.slice(src.indexOf('async function endingTrue'),src.indexOf('const ENDING_PRE'));
const tord=["You hold the Crown of Crowns. This time, you do not put it on.",'THE CROWN IS BROKEN.','THE THRONE IS EMPTY.','The throne never takes your face.','SOMEONE SETS UP A BOARD, JUST TO PLAY.'];
at=-1;for(const x of tord){const k=tr.indexOf(x,at+1);assert(k>at,'True ending in order: '+x);at=k;}
assert(!tr.includes("E.scene('lift')")&&!tr.includes("E.scene('become')")&&!tr.includes('CROWNLESS KING.'),'you never become him in the true ending');
// version
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=214&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: Continue on a finished campaign always offers New Game+, which restarts in Crown City with no crowns, carry or checkpoint; army line names roles; drawn figure removed; story follows the second fall; version.');

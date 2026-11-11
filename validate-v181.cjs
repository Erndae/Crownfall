// v181 The Fallen: the army that claimed the Crown of Crowns is remembered and named in a LATER campaign's final fight.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
c.CrownfallCharacter={get:()=>({name:'Ernesto <b>'}),art:()=>''};
const run=(extra='')=>E(`PACK='throne';MATCH=null;ACH.campaign_epoch=1000;RUN={land:'throne',circuit:'ruler',ante:6,blind:2,bosses:Array(6).fill('ruler'),money:10,lv:{P:1,N:1,B:1,R:1,Q:1,K:1},relics:[],
 roster:['K','R:iron:a1.Ike.V.3.2.0.start.0','B::a2.Fang.F.1.1.0.start.0','N::a3.Pi<ke>.K.0.0.0.start.0','P::a4.Dime.C.0.0.0.start.0','P','Q::a5.Juno.A.0.0.0.start.0']};${extra}`);
const board=`B={board:Array(64).fill(null),score:0,target:500,caps:0,lost:0,streak:0,moves:20,seen:{},ep:[]};B.board[4]={t:'K',side:'en',id:1};B.board[0]={t:'R',side:'en',id:2};B.board[7]={t:'R',side:'en',id:3};B.board[2]={t:'B',side:'en',id:4};B.board[12]={t:'P',side:'en',id:5};B.board[60]={t:'K',side:'me',id:9};B.board[52]={t:'P',side:'me',id:10};`;
E(`localStorage.removeItem(FALLEN_KEY)`);
// nothing exists before an ending has been earned
run(board);assert.equal(E('fallenRecord()'),null);assert.equal(E('fallenNameOf(B.board[0])'),null);
const base=E(`storyLines({name:'The Crownless King',ruler:true}).intro`);assert(/Welcome home|Again, Bearer/.test(base));
// claiming the throne remembers the army (before the run is cleared)
E('fallenRemember()');const saved=JSON.parse(E('localStorage.getItem(FALLEN_KEY)'));
assert.equal(saved.ep,1000);assert.equal(saved.king,'Ernesto b');assert.deepEqual(saved.army,[{t:'R',n:'Ike'},{t:'B',n:'Fang'},{t:'N',n:'Pike'},{t:'P',n:'Dime'},{t:'Q',n:'Juno'}]);
assert(fs.readFileSync(__dirname+'/index.html','utf8').includes("if(l === 'throne') fallenRemember();"));
// never in the campaign that made it
assert.equal(E('fallenRecord()'),null);assert.equal(E(`storyLines({name:'The Crownless King',ruler:true}).intro`),base);
// a later campaign: only the Fallen Throne's Ruler fight
E('ACH.campaign_epoch=2000');assert(E('fallenRecord()'));
for(const patch of ["RUN.circuit='midnight'","RUN.land='street'","RUN.gauntlet=true","MATCH={}"]){run(board+patch);E('ACH.campaign_epoch=2000');assert.equal(E('fallenRecord()'),null,patch);assert.equal(E('fallenNameOf(B.board[0])'),null,patch);}
run(board);E('ACH.campaign_epoch=2000');
const L=E(`storyLines({name:'The Crownless King',ruler:true})`);
assert.equal(L.intro,'I climbed these steps once, with Ike and Fang beside me. Look closely, Bearer. They never left.');
assert.equal(L.lose,'They called me Ernesto b, once. Now the question is yours, Bearer: what will they call you?');
for(const k of ['intro','lose','check','win'])assert(!/[<>]/.test(L[k]));assert(L.capture.length&&L.hurt.length);
assert.equal(E(`storyLines({name:'Kingpin Vex',ruler:true,intro:'x'}).intro`),'x','Other rulers are untouched');
// names: stable per piece, by type, never reused, survive capture, promotion and save/load
assert.equal(E('fallenNameOf(B.board[4])'),'Ernesto b');assert.equal(E('fallenNameOf(B.board[7])'),'Ike');assert.equal(E('fallenNameOf(B.board[0])'),null,'One Rook was remembered; the second stays unnamed');
assert.equal(E('fallenNameOf(B.board[2])'),'Fang');assert.equal(E('fallenNameOf(B.board[12])'),'Dime');assert.equal(E('fallenNameOf(B.board[52])'),null,'Your own pieces are never renamed');
E('B=JSON.parse(JSON.stringify(B));B.board[0]=null;B.board[12].t="Q"');
assert.equal(E('fallenNameOf(B.board[7])'),'Ike');assert.equal(E('fallenNameOf(B.board[12])'),'Dime','A promoted Pawn keeps its name');
E(`B.board[20]={t:'Q',side:'en',id:30}`);assert.equal(E('fallenNameOf(B.board[20])'),'Juno','Reinforcements take names still unused');
// the info row
E(`pieceInfo(B.board[7])`);const src=fs.readFileSync(__dirname+'/index.html','utf8');
assert(src.includes('`Enemy King · once ${fallenNameOf(p)}`')&&src.includes('`${fallenNameOf(p)} · Enemy ${T0.name}`'));
// corrupt or foreign records are ignored
for(const bad of ['"x"','{"army":5}','{"ep":2000,"army":[]}','not json']){E(`localStorage.setItem(FALLEN_KEY,${JSON.stringify(bad)})`);assert.equal(E('fallenRecord()'),null,bad);assert.equal(E('fallenNameOf(B.board[7])'),null);}
E(`localStorage.setItem(FALLEN_KEY,JSON.stringify({ep:1,king:'<i>',army:[{t:'R',n:'<img src=x>'},{t:'Z',n:'Bad'},null]}))`);E('B.fallen={}');
assert.equal(E('fallenRecord().king'),'i');assert.deepEqual(E('JSON.stringify(fallenRecord().army)'),'[{"t":"R","n":"img srcx"}]');
E(`localStorage.setItem(FALLEN_KEY,JSON.stringify({ep:1,king:'',army:[]}))`);const N=E(`storyLines({name:'The Crownless King',ruler:true})`);
assert.equal(N.intro,'I climbed these steps once, as you do now. Look closely at my army, Bearer.');assert(N.lose.startsWith('I carried it as far as I could.'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=181);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: remembered on claiming the throne, hidden until a later campaign, final fight only, stable sanitized names through capture/promotion/reload/reinforcement, dialogue variants, corrupt-record safety and version.');

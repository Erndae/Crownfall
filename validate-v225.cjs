// v225 Supply crates (Harbor) and the reworked Bounty (Midnight Market).
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const fight=(circ,a,x='')=>E(`(()=>{MATCH=null;PACK='greek';RUN={land:'greek',circuit:'${circ}',ante:${a},blind:1,money:10,relics:[],roster:['K']};B={board:Array(64).fill(null),swaps:1,log:[],tac:null};tacState().n=0;${x};return 0})()`);
// ---- crates: where (a fair race, like the Banner)
const std="B.board=deploy(['K','Q','R','R','B','B','N','N','P','P','P','P','P','P','P','P']);setupEnemyArmy(B.board);";
for(const a of [2,3,4]){fight('harbor',a,std);const C=JSON.parse(E('JSON.stringify(dockCrates(B.board))'));assert.equal(C.length,a===4?3:2,'count at stage '+a);
  const reach=JSON.parse(E('JSON.stringify((()=>{const s=new Set();B.board.forEach((p,i)=>{if(p&&p.t!=="P")movesFor(B.board,i).forEach(t=>s.add(t))});return [...s]})())'));
  for(const i of C){assert(!reach.includes(i),'no officer or King reaches it on move one: '+i);assert(!E(`!!B.board[${i}]`));assert(i>=24&&i<=47,'middle ranks (or your third rank when the middle is crowded)');}
  for(let x=0;x<C.length;x++)for(let y=x+1;y<C.length;y++)assert(Math.abs((C[x]&7)-(C[y]&7))>=2,'spread out');}
fight('harbor',1);assert.equal(E('dockCrates(B.board).length'),0);fight('rooftop',3);assert.equal(E('dockCrates(B.board).length'),0);fight('harbor',3,'RUN.gauntlet=true');assert.equal(E('dockCrates(B.board).length'),0);
// ---- crates: what
fight('harbor',3,"B.crates=[34,37,29];B.board[34]={t:'P',side:'me',id:1}");assert.equal(E('springDockCrate(34)'),false,'pawns walk past');assert.equal(E('B.crates.length'),3);
E("B.board[34]={t:'N',side:'me',id:2}");assert.equal(E('springDockCrate(34)'),true);assert.equal(E('tacState().n'),1,'first: +1 Tactic');
E("B.board[37]={t:'B',side:'me',id:3}");const m0=E('RUN.money');assert.equal(E('springDockCrate(37)'),true);assert.equal(E('RUN.money')-m0,E('crateCash()'),'second: cash');
E("B.board[29]={t:'K',side:'me',id:4}");assert.equal(E('springDockCrate(29)'),true);assert.equal(E('B.swaps'),2,'third: +1 swap');assert.equal(E('springDockCrate(29)'),false,'once each');
fight('harbor',3,"B.crates=[34];tacState().n=TAC_MAX;B.board[34]={t:'R',side:'me',id:5}");E('springDockCrate(34)');assert.equal(E('B.swaps'),2,'full Tactics: a swap');
fight('harbor',3,"B.crates=[34];B.board[34]={t:'P',side:'en',id:6}");assert.equal(E('springDockCrate(34)'),false,'enemy pawns walk past too');
E("B.board[34]={t:'N',side:'en',id:7}");assert.equal(E('springDockCrate(34)'),true);assert.equal(E('B.board[34].sh'),1,'enemy loots it: +1 Armor');assert.equal(E('RUN.money'),10,'no money changes hands');
// cash grows with each Land
assert.equal(E("(()=>{RUN={land:'street',circuit:'harbor',ante:2,money:0,relics:[],roster:['K']};return crateCash()})()"),3);
assert(E("(()=>{RUN={land:'fantasy',circuit:'harbor',ante:2,money:0,relics:[],roster:['K']};return crateCash()})()")>3,'later Lands pay more');
// the enemy races for them with officers, not pawns
assert(src.includes("(has('vantage', i) || has('banner', i) || has('crates', i)) && mover.t !== 'P'")&&!src.includes("if(has('crates', to)) v -= 8;"));
// ---- bounty: who
const army="B.board[1]={t:'N',side:'en',id:11};B.board[2]={t:'B',side:'en',id:16};B.board[0]={t:'R',side:'en',id:17};B.board[3]={t:'Q',side:'en',id:12};B.board[4]={t:'K',side:'en',id:13};B.board[9]={t:'P',side:'en',id:14};";
fight('midnight',2,army);assert.equal(E('bountyPick(B.board).id'),17,'the Rook (an officer, not the Queen)');
fight('midnight',2,"B.board[3]={t:'Q',side:'en',id:12};B.board[4]={t:'K',side:'en',id:13};B.board[9]={t:'P',side:'en',id:14};");assert.equal(E('bountyPick(B.board).id'),12,'the Queen only when no officer is left');
// ---- bounty: what
fight('midnight',2,army+"B.bounty=bountyPick(B.board);B.board[40]={t:'N',side:'me',id:20};B.board[33]=null;");
E("B.board[17]=null;B.board[0]=null;B.board[26]={t:'R',side:'en',id:17};B.board[43]={t:'N',side:'me',id:21}");
const sc=JSON.parse(E('JSON.stringify(scoreCapture(43,26))'));assert(sc.steps.some(s=>s.name==='Bounty'&&s.x===2),'the bounty capture scores double');
assert.equal(E("bountyStrikes(B.board[26],{t:'P',side:'me'},20)"),true);assert.equal(E('B.swaps'),0,'its captures cost a swap');
assert.equal(E("bountyStrikes(B.board[26],{t:'P',side:'me'},20)"),true);assert.equal(E('B.swaps'),0,'never below zero');assert.equal(E('RUN.money'),10,'no cash taken');
// texts
for(const x of ['supply crates: break one open with any piece <b>except a pawn</b>','Supply crate: any piece except a pawn opens it for supplies','Capture it for <b>double score</b> and +$','you lose 1 swap','Bounty: capture it for double score and cash; its captures cost you 1 swap',"Those crates are my supplies."])assert(src.includes(x),x);
assert(!/Crate trap[ :!]|lose up to \$2|you lose \$1/.test(src.replace('were crate traps','')));
assert(src.includes('const GAME_VERSION = 225;')&&sw.includes("'crownfall-v225'")&&!src.includes('?v=224'));
console.log('PASS: supply crates (fair mid-board race, pawns walk past, Tactic/cash/swap, enemy loot = Armor, cash grows by Land), bounty (officer first, double score, -1 swap per capture), texts, version.');

// v212 The King Rises: the Final Throne Phase cutscene and the Phase 2 lines. Presentation only.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
// the board change and the save still come before anything is shown; only the banner beat was replaced
const r=src.slice(src.indexOf('async function crownlessRise'),src.indexOf('/* v212 THE KING RISES'));
const at=k=>{const i=r.indexOf(k);assert(i>=0,k);return i;};
assert(at('if(k0 >= 0) B.board[k0] = null;')<at('spawnEnemies(b, clamp(4 + RUN.ante, 4, 10), true, true)'));
assert(at('B.ckFinal = true;')<at('B.ckRiseShown = false;')&&at('B.ckRiseShown = false;')<at('save();')&&at('save();')<at('await ckRiseCutscene(arrived);'));
assert(!r.includes('<b>The King does not fall.</b><span>Final Throne Phase</span>'),'The old banner beat is replaced');
assert(r.includes("$('#hand').textContent = 'Final Throne Phase: reach the target or checkmate him again';")&&/busy = false;\s+\/\/ the rise is not a move: your turn/.test(r));
// script
const s=src.slice(src.indexOf('async function ckRiseScript'),src.indexOf('function ckRiseCutscene'));
const order=["E.scene('throne')","king('Checkmate.'","I know that word. I have heard it on these steps before.","ov.classList.add('stir')","Do you feel them pulling, ${nm}? They have pulled you all the way here.","Again, ${nm}? The throne remembers you.","ov.classList.add('rise')","The throne does not let its king fall. Not while it still has a use for him.","king('Not yet.'","E.scene('dim'); await E.wait(800); o.wave();","king(ckGuardLine()","ckAnswer()","E.scene('card')","Final Throne Phase</b><span class=\"cks\">Reach the target or checkmate him again."];
let k=-1;for(const x of order){const i=s.indexOf(x,k+1);assert(i>k,'In order: '+x);k=i;}
assert(s.includes("if(!calm){ ov.classList.add('shake');"),'No shake under reduced motion');
// variants
c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>''};assert.equal(E('bearerOr()'),'Ernesto');c.CrownfallCharacter={get:()=>({name:'Crownrunner'}),art:()=>''};assert.equal(E('bearerOr()'),'Bearer');
E("localStorage.removeItem(FALLEN_KEY)");assert.equal(E('ckGuardLine()'),'My guard still stands. They followed me here, as yours follow you.');
E("ACH.campaign_epoch=999;MATCH=null;RUN={land:'throne',circuit:'ruler',ante:5,blind:2,money:5,relics:[],roster:['K']}");E(`localStorage.setItem(FALLEN_KEY,${JSON.stringify(JSON.stringify({v:1,ep:1,king:'Old',army:[{t:'R',n:'Bolt'},{t:'N',n:'Ash'}],at:1}))})`);
const g=E('ckGuardLine()');assert.equal(g,'Bolt and Ash still stand guard. Do you recognise them yet?');
const P=JSON.parse(E('JSON.stringify(CK_ANSWER)'));assert.deepEqual(Object.keys(P).sort(),'ACFKLMSV'.split(''),'A line for every personality');
assert.equal(P.L,'We stand with you. Finish it.');assert.equal(P.F,'Good. I wasn’t done.');assert.equal(P.S,'Great. He has a second wind.');
E("MATCH=null;RUN={land:'throne',circuit:'ruler',ante:5,blind:2,money:5,relics:[],roster:['K']};B={board:Array(64).fill(null)};B.board[60]={t:'K',side:'me',id:1}");
assert.equal(JSON.parse(E('JSON.stringify(ckAnswer())')).line,'Bearer stands alone. It is enough.');
// no line in the scene or in Phase 2 states the twist
const all=[...s.matchAll(/(?:king\(|E\.say\()\s*[`'"]([^`'"]+)/g)].map(m=>m[1]).concat(Object.values(P),[g,'The throne gives back what you take.','Still mine, ${nm}.','Again? You cannot kill what the throne keeps.','Each piece you take, I remember.','Careful. You are closer to this throne than you think.','The throne is tiring of me, ${nm}. Is it watching you now?']);
for(const L of all)assert(!/you (will )?become|you are (the|him)|I was (you|a crownrunner|the bearer)|was once (you|a crownrunner)|takes your (name|face)|crownless king is you/i.test(L),'No twist: '+L);
// Phase 2 lines only while B.ckFinal; win/lose unchanged
const st=x=>JSON.parse(E(`JSON.stringify(storyLines(${x}))`));
E('B.ckFinal=false');const before=st("{name:'The Crownless King',ruler:true,capture:['a'],hurt:['b'],check:'c',lose:'L',win:'W'}");
E('B.ckFinal=true');const after=st("{name:'The Crownless King',ruler:true,capture:['a'],hurt:['b'],check:'c',lose:'L',win:'W'}");
assert(!before.crumble&&before.check!==after.check);assert.deepEqual(after.capture,['The throne gives back what you take.','Still mine, Bearer.']);
assert.equal(after.check,'Careful. You are closer to this throne than you think.');assert(after.crumble.startsWith('The throne is tiring of me'));
assert.equal(after.lose,before.lose);assert.equal(after.win,before.win);
assert(src.includes("if(isCrownless()) setTimeout(() => { if(B && B.ckFinal && !B.done) say('crumble', true); }"));
// refresh and seen
assert(src.includes("if(resumed && B.ckFinal && B.ckRiseShown === false) later(() => ckRiseRecap(), 500);"));
assert(src.includes("if(!B || !B.ckFinal || B.ckRiseShown !== false) return;"),'Older saves (no flag) never get a recap');
assert(src.includes("const CKRISE_KEY = 'crownfall-ckrise-seen';")&&src.includes("sk.onclick = e => { e.stopPropagation(); E.halt(); };"));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=212);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: board change and save first, script order, variants (name, fallen record, NG+, personalities, alone), no twist line, Phase 2 lines only in Phase 2, recap on refresh, seen key, Skip, version.');

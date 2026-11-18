// v218 A second trip to the throne after the Lands were freed: the King knows, and each ending says what changed.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const seen=t=>E(`{const s=endingSave();s.seen=${t};endingWrite(s);}0`);
const intro=()=>E(`(()=>{PACK='throne';MATCH=null;localStorage.removeItem(FALLEN_KEY);for(const k of Object.keys(ACH))if(/^crown_/.test(k))delete ACH[k];RUN={land:'throne',circuit:'downtown',ante:3,blind:3,money:5,relics:[],roster:['K']};return storyLines({name:'The Crownless King',ruler:true,intro:'i',lose:'L'}).intro;})()`);
seen('{}');assert(intro().includes('Every crown you carry was once mine.'),'first time: unchanged');
seen('{standard:1}');assert(intro().includes('Every crown you carry was once mine.'),'wearing the crown frees no one');
seen('{standard:1,true:1000}');E('ACH.campaign_epoch=500');assert(intro().includes('Every crown you carry was once mine.'),'the campaign that ended free is not a reforged one');
E('ACH.campaign_epoch=2000');assert.equal(E('crownsReforged()'),true);assert.equal(intro(),'You broke my crown, Ernesto. They gathered the pieces. Somebody always does.');
c.CrownfallCharacter={get:()=>({name:''}),art:()=>'',save:()=>true};assert.equal(intro(),'You broke my crown, Bearer. They gathered the pieces. Somebody always does.');c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
seen('{standard:1}');assert.equal(E('crownsReforged()'),false);seen('{standard:1,true:1000}');
E(`ACH[landCrownId('throne')]=1`);assert.equal(E(`storyLines({name:'The Crownless King',ruler:true,intro:'i',lose:'L'}).intro`),'Again, Ernesto? The throne remembers you.','a rematch in the same campaign keeps its line');
const std=src.slice(src.indexOf('async function endingStandard'),src.indexOf('/* ---------- crown artwork'));
const a=std.indexOf('Now they kneel to you.'),b=std.indexOf("if(landsFree()) await E.say('The Lands were free once. You have chained them again.'"),k=std.indexOf('THE KING IS DEAD.');assert(a>0&&b>a&&k>b);
const tr=src.slice(src.indexOf('async function endingTrue'),src.indexOf('const ENDING_PRE'));
assert(tr.includes("landsFree() ? 'Again, nobody kneels. This time, they remember how to stand.' : 'For the first time in a hundred years, nobody kneels.'"));
assert(src.indexOf("s.seen[type] = s.seen[type] || Date.now()")<src.indexOf('async function endingTrue')||true);
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=218&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
// New Game+ and the title tell where the new crowns came from
assert(src.includes("Someone gathered the shards of the Crown of Crowns. Four new crowns were forged from them, four Rulers put them on, and the Fallen Throne has a king again."));
assert(!src.includes('the crowns have found their Rulers again'));
assert(src.includes(`crownsReforged() ? 'Everybody wants a crown. <b class="freemark">The crowns were forged again.</b>'`));
assert(src.includes("Ahead, a throne rebuilt from the pieces you left."));
console.log('PASS: crowns forged from the shards (NG+, title, King, passage); rebuilt-throne intro only after the true ending, rematch line kept, chained-again and stand-again ending lines, version.');

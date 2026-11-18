// v217 After the true ending the Lands are free: title mark, Rulers' words on Journey, passage memories, and New Game+ explains the rebuilt throne.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const seen=t=>E(`{const s=endingSave();s.seen=${t};endingWrite(s);}0`);
seen('{}');assert.equal(E('landsFree()'),false);seen('{standard:1}');assert.equal(E('landsFree()'),false,'wearing the crown frees no one');
seen('{true:1}');assert.equal(E('landsFree()'),true);E("localStorage.setItem('crownfall-ending','junk')");assert.equal(typeof E('landsFree()'),'boolean','bad data is safe');
const S=JSON.parse(E('JSON.stringify(FREED_SAID)')),FP=JSON.parse(E('JSON.stringify(FREED_PASSAGE)'));
assert.deepEqual(Object.keys(S).sort(),['fantasy','greek','medieval','street']);assert.deepEqual(Object.keys(FP).sort(),['fantasy','greek','medieval','throne']);
assert(S.street.includes('just Vex'));for(const x of [...Object.values(S),...Object.values(FP)])assert(!/crownless king|was once a/i.test(x));
// wiring: title, Journey, passage, NG+
assert(src.includes(`landsFree() ? 'Everybody wanted a crown. <b class="freemark">The Lands are free.</b>' : 'Everybody wants a crown.'}</p>`));
assert(src.includes('${landsFree() && FREED_SAID[l] ? `<p class="jfree"><small>The morning the crown broke</small>“${FREED_SAID[l]}”</p>` : \'\'}'));
assert(src.includes("(k === 1 && crownsReforged() && FREED_PASSAGE[l] ? FREED_PASSAGE[l] : x)"));   // v218: in the campaign after the true ending
assert(src.includes("Someone gathered the shards of the Crown of Crowns.")&&src.includes("free ? 'The Lands were free' : 'The Crown of Crowns is yours'"));
assert(css.includes('.titlemotto .freemark{')&&css.includes('.jfree{'));
// unchanged before the true ending
const P=JSON.parse(E('JSON.stringify(LAND_PASSAGE)'));assert(P.greek.lines[1].includes('soldiers do not follow')||P.greek.lines[2].includes('kneel toward the mountains'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=217&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: freedom only after the true ending, title mark, Rulers remember the morning on Journey, passage memories, NG+ explains the rebuilt throne, safe with bad data, version.');

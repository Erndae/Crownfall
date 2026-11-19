// v224 Rulers notice how you have answered the Hunger; Journey and the bargain show your record.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
const tally=(f,r)=>E(`ACH.campaign_epoch=5;ACH.hunger={ep:5,fed:${f},refused:${r}};0`);
const R=JSON.parse(E('JSON.stringify(HUNGER_REACT)'));
assert.deepEqual(Object.keys(R).sort(),['Athena, Queen of Olympus','King Aldric the Iron-Handed','Morwen the Shadow Queen','The Crownless King','The Hollow Crown']);
const names=E(`JSON.stringify([...Object.values(RULERS).map(r=>r.name),...Object.keys(PERSONA)])`);for(const n of Object.keys(R))assert(names.includes(JSON.stringify(n)),'real opponent: '+n);
for(const n in R)for(const k of ['fed','refused'])assert(!/was once|every king|became|so did i/i.test(R[n][k]),'no spoiler: '+R[n][k]);
tally(0,0);assert.equal(E('hungerLean()'),null);assert.equal(E("hungerReact('Morwen the Shadow Queen')"),'','nothing before a bargain');
tally(2,2);assert.equal(E('hungerLean()'),null,'nothing on a tie');
tally(3,1);assert.equal(E("hungerReact('Morwen the Shadow Queen')"),R['Morwen the Shadow Queen'].fed);
tally(1,4);assert.equal(E("hungerReact('The Hollow Crown')"),R['The Hollow Crown'].refused);
assert.equal(E("hungerReact('Kingpin Vex')"),'','Vex is fought before any bargain');
// in the fight intro (first time only), added after their own line
const ruler=(land,name,x)=>E(`(()=>{MATCH=null;PACK='${land}';RUN={land:'${land}',circuit:'ruler',ante:4,blind:2,money:5,relics:[],roster:['K'],stats:{wins:0}};${x||''};const o=storyLines({name:'${name}',ruler:true,intro:'Base line.',lose:'L'});return o.intro})()`);
tally(3,0);const i1=ruler('greek','Athena, Queen of Olympus');assert(i1.endsWith(R['Athena, Queen of Olympus'].fed),i1);
tally(0,0);assert(!ruler('greek','Athena, Queen of Olympus').includes('feeding'));
// Journey record and the running count in the bargain
tally(0,0);assert.equal(E('hungerRecordHTML()'),'','hidden until the first bargain');
tally(4,1);assert(E('hungerRecordHTML()').includes('Fed 4 · Refused 1')&&E('hungerRecordHTML()').includes('It is getting a taste for you.'));
tally(1,3);assert(E('hungerRecordHTML()').includes('It has not owned you yet.'));tally(2,2);assert(E('hungerRecordHTML()').includes('It is still deciding about you.'));
assert(src.includes('${hungerRecordHTML()}'));assert(src.includes('<p class="hg-so">So far: fed ${h.fed} · refused ${h.refused}</p>'));
assert(css.includes('.jhunger{')&&css.includes('.hunger .hg-so{'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=224&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: five opponents react to fed/refused (none on a tie or before a bargain, no spoilers), shown in first-time intros, Journey record and running count, version.');

// v259 The Wheel: New Game+ tells one story per way the last campaign ended.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=259&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
assert.equal(E('turningName(1)'),'The Second Turning');assert.equal(E('turningName(2)'),'The Third Turning');assert.equal(E('turningName(12)'),'The 13th Turning');
const seen=(std,tru)=>E(`(()=>{const s=endingSave();s.seen={};if(${std})s.seen.standard=${std};if(${tru})s.seen.true=${tru};endingWrite(s);return lastEnding()})()`);
assert.equal(seen(0,0),null);assert.equal(seen(1000,0),'standard');assert.equal(seen(1000,2000),'true');assert.equal(seen(3000,2000),'standard','the most recent ending counts');assert.equal(seen(1,0),'standard','older saves (seen = 1)');
// the Hunger is counted per Land; the hungriest Ruler is chosen (ties go to the Land nearest the throne)
E("MATCH=null;ACH.campaign_epoch=77;ACH.hunger=null;setPack('medieval');newRun('harbor')");
E("hungerNote('fed');hungerNote('fed');RUN.land='greek';hungerNote('fed');hungerNote('refused')");
assert.deepEqual(JSON.parse(E('JSON.stringify(hungerTally().byLand)')),{medieval:2,greek:1});
assert.equal(E('hungriestRuler().name'),'King Aldric the Iron-Handed');
E("ACH.hunger={ep:77,fed:0,refused:0}");assert.equal(E('hungriestRuler().name'),'Morwen the Shadow Queen','nobody fed: the Ruler nearest the throne');
// wore: a new runner, the King was you
seen(5000,0);E("localStorage.setItem(FALLEN_KEY,JSON.stringify({v:1,ep:1,king:'Ernesto',army:[{t:'N',n:'Spike'}]}))");
const w=JSON.parse(E('JSON.stringify(wheelStory())'));assert.deepEqual(w,{branch:'wore',king:'Ernesto'});
assert(E('wheelLine(wheelStory())').includes('<b>Ernesto</b> sat on the Fallen Throne and became the Crownless King. A new Crownrunner sets out'));
// broke: the same runner, the hungriest Ruler was crowned
seen(5000,9000);E("ACH.hunger={ep:77,fed:3,refused:0,byLand:{greek:3}}");
const b=JSON.parse(E('JSON.stringify(wheelStory())'));assert.equal(b.branch,'broke');assert.equal(b.ruler,'Athena');
assert(E('wheelLine(wheelStory())').includes('The throne crowned the one who fed the Hunger most: <b>Athena</b>. You broke it once. It grew back.'));
// the story is carried into the New Game+ campaign and only there
E("ACH.ng_next=1;ACH.ng_story_next={branch:'wore',king:'Ernesto'};newCampaign()");
assert.equal(E('ACH.ngplus'),1);assert.deepEqual(JSON.parse(E('JSON.stringify(ngStory())')),{branch:'wore',king:'Ernesto'});assert.equal(E("'ng_story_next' in ACH"),false);
assert.equal(E("isCampaignKey('ng_story')"),true);
E("newCampaign()");assert.equal(E('ngStory()'),null,'a plain new campaign has no Wheel story');
// the King and the Rulers speak it
E("ACH.ng_next=1;ACH.ng_story_next={branch:'wore',king:'Ernesto'};newCampaign();setPack('throne');newRun('ruler')");
const kingIntro=()=>E("(()=>{const o={name:'The Crownless King',ruler:true};try{storyLines(o)}catch(e){return 'ERR '+e.message}return o.intro})()");
assert.equal(kingIntro(),"Once I was Ernesto. I said the same thing you're about to say.");
E("ACH.ng_next=2;ACH.ng_story_next={branch:'broke',ruler:'Athena',rulerLand:'greek'};newCampaign();setPack('throne');newRun('ruler')");
assert(kingIntro().startsWith('Once I was Athena. I fed it more than anyone, and it remembered.'));
E("ACH.ng_next=1;ACH.ng_story_next={branch:'wore',king:'Ernesto'};newCampaign();setPack('street');newRun('ruler')");
assert.equal(E("(()=>{const o={name:'Kingpin Vex',ruler:true};storyLines(o);return o.intro})()"),'Another one. The last one sat down and never stood up.');
// texts and flow
assert(src.includes("edictPick(() => diffPick(() => wheelName(() => draftScreen())));")&&src.includes('<h2>Who carries the next crown?</h2>')&&src.includes("'The Hunger’s terms' : 'The new King’s decree'"));
assert(src.includes("if(ngLevel() >= 2) await E.say('Somebody always gathers the pieces. Maybe this time, nobody will.'"));
assert(src.includes('The crown’s iron spreads to the King’s guard')&&src.includes('Every Land pays tithe to the crowns'));
console.log('PASS: the Wheel: turning names, last ending, Hunger per Land and hungriest Ruler; wore (new runner, King once you, Ruler lines, decrees) and broke (same runner, King once the hungriest Ruler, Hunger’s terms); story kept only in New Game+; ending line from the third turning; version');

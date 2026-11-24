// v240 Pawns taken by the Hunger are remembered (Journey, both endings); the playtest tool ships with the project.
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=240&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
assert.equal(E("namesList([])"),'');assert.equal(E("namesList(['Gage'])"),'Gage');assert.equal(E("namesList(['Gage','Tess'])"),'Gage and Tess');
assert.equal(E("namesList(['A','B','C'])"),'A, B and C');assert.equal(E("namesList(['A','B','C','D','E','F'])"),'A, B, C and 3 others');
// taking a Pawn records its name for this campaign; a new campaign starts clean
E("ACH.campaign_epoch=9;ACH.hunger=null");assert.deepEqual(JSON.parse(E('JSON.stringify(hungerTaken())')),[]);
E("hungerTake('P::4eav1c.Tess.K.0.0.0.x.0');hungerTake('P::9zz.Gage.K.0.0.0.x.0');hungerTake('P')");
assert.deepEqual(JSON.parse(E('JSON.stringify(hungerTaken())')),['Tess','Gage','a Pawn']);
E("ACH.campaign_epoch=10");assert.deepEqual(JSON.parse(E('JSON.stringify(hungerTaken())')),[],'a new campaign forgets');E("ACH.campaign_epoch=9");
// the Blood bargain records the Pawn it removes
assert(src.includes("if(o.k === 'blood'){ const pi = hungerPawnAt(); if(pi >= 0) hungerTake(RUN.roster.splice(pi, 1)[0]);"));
// Journey
E("ACH.hunger.fed=2");const j=E('hungerRecordHTML()');assert(j.includes('Taken by the Hunger: Tess, Gage and a Pawn'),j);
// endings: the crowned ending and the true ending both name them
assert(src.includes("${namesList(T)} never came home. It kept them.")&&src.includes("${namesList(T)} ${T.length > 1 ? 'are' : 'is'} still gone. Some prices stay paid."));
// the playtest tool
assert(fs.existsSync(__dirname+'/tools/playtest.cjs'));cp.execFileSync(process.execPath,['--check',__dirname+'/tools/playtest.cjs']);
assert(fs.readFileSync(__dirname+'/README.md','utf8').includes('node tools/playtest.cjs'));
console.log('PASS: Pawns taken by Blood bargains remembered by name per campaign, listed on the Journey and in both endings; namesList; tools/playtest.cjs present and valid; version');

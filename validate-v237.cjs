// v237 Painted opponents show only their painting (no old drawn face underneath); their sheets are preloaded.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=237&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
const painted=JSON.parse(E("JSON.stringify(Object.values(CAMPAIGN_FACES).flatMap(o=>Object.keys(o)).concat(Object.values(CAMPAIGN_BOSS_FACES).flatMap(o=>Object.keys(o)),Object.values(CAMPAIGN_OTHER_FACES).flatMap(o=>Object.keys(o))).filter(n=>campaignOpponentFace(n)&&campaignOpponentFace(n).painting))"));
assert(painted.length>=40,`painted opponents (${painted.length})`);
for(const n of painted){const h=E(`oppFace(${JSON.stringify(n)})`);assert(!h.includes('<svg'),`${n}: no drawn face under the painting`);assert(h.includes('op-paint')&&h.includes(' painted'),n);}
// opponents without a painting (Crown City) still get their drawn face
const drawn=E("oppFace('Speedy Rico')");assert(drawn.includes('<svg')&&!drawn.includes('op-paint'));
// sheets: every painted name maps to a real file, and each Land's sheet is preloaded
for(const sh of ['iron-kingdom','olympian-court','road-opponents'])assert(fs.existsSync(__dirname+`/assets/opponents/${sh}.webp`));
assert.deepEqual(JSON.parse(E("JSON.stringify(OPP_SHEET)")),{medieval:'iron-kingdom',greek:'olympian-court',fantasy:'road-opponents',throne:'road-opponents'});
E("oppFace('Warden Osric')");assert.equal(E("!!oppSheetImgs['iron-kingdom']"),true,'showing a painted face preloads its sheet');
assert(src.includes("setTimeout(preloadOppSheets, 1200);")&&src.includes("function startBlind(){ try{ laClear(); }catch(e){} preloadOppSheets();"));
console.log(`PASS: ${painted.length} painted opponents show only their painting; drawn faces stay for the rest; sheets preloaded at start-up, at each fight and when shown; version`);

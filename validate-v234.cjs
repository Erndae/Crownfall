// v234 Daily Run: today's route before you start (drawn exactly as the waves will be) and a Records calendar.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=234&&sw.includes("'crownfall-v"+RegExp.$1+"'")&&!src.includes('?v=233'));
// the preview matches the waves the run really plays, for several dates
for(const date of ['2026-11-21','2026-11-22','2027-01-01','2026-12-31']){
  const plan=JSON.parse(E(`JSON.stringify(dailyPlan('${date}'))`));
  assert.equal(plan.length,10);
  for(let w=1;w<=10;w++){
    const real=JSON.parse(E(`(()=>{MATCH=null;RUN={gauntlet:true,daily:'${date}',gWave:${w},gWaveSet:0};const r=dailySeed('wave${w}');try{gPrepWave()}finally{r()}
      const id=bossAt(RUN.ante),rule=(id==='mini'?MINI_RULE[RUN.circuit]:id);return JSON.stringify({land:RUN.land,rule:rule&&rule!=='thief'?rule:null,c:RUN.circuit})})()`));
    const p=plan[w-1];assert.equal(p.land,real.land,`${date} wave ${w} land`);assert.equal(p.rule,real.rule,`${date} wave ${w} rule`);
    assert.equal(p.boss,w%5===0);assert.equal(p.mark,w>=3?E(`G_MARK['${real.c}']`):null);
  }
}
// a different day, a different route; the same day, the same route
assert.notEqual(E("JSON.stringify(dailyPlan('2026-11-21'))"),E("JSON.stringify(dailyPlan('2026-11-22'))"));
assert.equal(E("JSON.stringify(dailyPlan('2026-11-21'))"),E("JSON.stringify(dailyPlan('2026-11-21'))"));
// the preview leaves the game's random numbers alone
assert.equal(E("(()=>{const k=Math.random;dailyPlan('2026-11-21');return Math.random===k})()"),true);
const html=E("dailyRouteHTML('2026-11-21')");
assert(html.includes('Today’s route')&&html.includes('Crown City')&&html.includes('The Fallen Throne')&&(html.match(/class="drw/g)||[]).length===10&&(html.match(/<i>Boss<\/i>/g)||[]).length===2);
assert(src.includes("    ${dailyRouteHTML(RUN.daily)}\n    <button class=\"btn gbtn\" id=\"gstart\">Start Wave 1</button>"));
// records: a year of days; best ever survives pruning
E(`(()=>{const days={};for(let i=0;i<420;i++){const d=new Date(2025,0,1+i);days[d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')]={best:i===0?99999:1000,waves:3,plays:1,finished:true}}jset('crownfall-daily',{days})})()`);
assert.equal(E("dailyBestEver()"),99999);
E(`(()=>{MATCH=null;RUN={gauntlet:true,daily:'2026-11-21',gWave:4,dScore:500,money:2};dailyRecord(RUN,false)})()`);
assert.equal(E("Object.keys(dailyRec().days).length"),400);assert.equal(E("dailyBestEver()"),99999,'best ever kept after its day is pruned');
assert(src.includes("function dailyRecords(){")&&src.includes('class="dcal"')&&src.includes("aria-label=\"Previous month\""));
console.log('PASS: today’s route matches the real waves (land, rule, boss, board mark) for 4 dates, differs by day, leaves Math.random alone, shown in the intro; Records calendar; a year of history and best ever kept; version');

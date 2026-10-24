import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const game=readFileSync('index.html','utf8'),source=readFileSync('campaign-opponents.js','utf8');
const slice=(a,b)=>game.slice(game.indexOf(a),game.indexOf(b,game.indexOf(a)));
const c=vm.createContext({RUN:null,MODE:'campaign',MATCH:null,land:()=>c.RUN.land});
vm.runInContext(source+slice('const RULERS = {','const clrKey ='),c);
const names=new Set();
for(const land of ['street','medieval','greek','fantasy','throne']){
 for(const circuit of ['downtown','rooftop','harbor','midnight'])for(let stage=1;stage<=4;stage++){
  c.RUN={land,circuit,ante:stage,bosses:['march','wall','clock','mini']};const before=JSON.stringify(c.RUN);
  const name=vm.runInContext(stage===4?'MINIS[RUN.land][RUN.circuit]':'campaignOpponentName(RUN)',c);
  assert(name);assert(!names.has(name),'Repeated opponent: '+name);names.add(name);
  assert.equal(JSON.stringify(c.RUN),before,'Naming cannot change combat saves');
  if(stage<4){assert.equal(vm.runInContext('campaignOpponentName(JSON.parse(JSON.stringify(RUN)))',c),name);c.RUN.bosses=['thief','tax','crown','mini'];assert.equal(vm.runInContext('campaignOpponentName(RUN)',c),name,'Rule rerolls never change identity');}
 }
 const ruler=vm.runInContext('RULERS['+JSON.stringify(land)+'].name',c);assert(!names.has(ruler));names.add(ruler);
}
assert.equal(names.size,85);
c.RUN={land:'street',circuit:'rooftop',ante:3,gauntlet:true};assert.equal(vm.runInContext('campaignOpponentName(RUN)',c),null);
c.RUN={land:'street',circuit:'ruler',ante:6};assert.equal(vm.runInContext('campaignOpponentName(RUN)',c),null);
Object.assign(c,{LV:()=>({bosses:{march:'Double Dutch Dana',clock:'Speedy Rico'}}),BOSSES:[],RULER:()=>({name:'Kingpin Vex'}),miniName:()=> 'Skyline Sal'});
vm.runInContext(slice('const bossRuleName =','const STAGES ='),c);
c.RUN={land:'street',circuit:'rooftop',ante:3};assert.equal(vm.runInContext("bossName('march')",c),'Catwalk Cruz');assert.equal(vm.runInContext("bossRuleName('march')",c),'Double Dutch Dana');assert.equal(vm.runInContext("bossName('march',1)",c),'Fire Escape Finn');
c.MODE='gauntlet';assert.equal(vm.runInContext("bossName('march')",c),'Double Dutch Dana');
assert(!game.includes('SIG_BOSS[bossName('));assert(game.includes('CITY_BLITZ_TARGET[bossRuleName('));
console.log('PASS: 85 unique stable Campaign opponents, explicit stage previews, reload and rule independence, existing rulers, Gauntlet identities and combat calibration preserved.');

// The transferred dialogue remains complete for every renamed Campaign encounter.
const voices=vm.createContext({});
vm.runInContext(readFileSync('campaign-dialogue.js','utf8'),voices);
for(const land of ['street','medieval','greek','fantasy','throne'])for(const circuit of ['downtown','rooftop','harbor','midnight'])for(let ante=1;ante<=3;ante++){
 voices.run={land,circuit,ante};const voice=vm.runInContext('campaignBossVoice(campaignBossPlan(run))',voices);
 for(const kind of ['intro','capture','hurt','check','win','lose'])assert(voice[kind]);
}
for(const m of game.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))new vm.Script(m[1]);
assert(!game.includes('beta-storage.js'));assert(game.includes('id="crown-dice"'));
console.log('PASS: dialogue covers every renamed encounter, inline scripts parse and main save namespace is retained.');

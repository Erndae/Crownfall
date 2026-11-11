// v178: every named Campaign opponent has their own intro and concession; reactions follow the Land.
import {readFileSync} from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const c=vm.createContext({});
vm.runInContext(readFileSync('campaign-dialogue.js','utf8')+readFileSync('campaign-opponents.js','utf8').replace("'use strict';",''),c);
const R=s=>vm.runInContext(s,c);const lands=['street','medieval','greek','fantasy','throne'],circuits=['downtown','rooftop','harbor','midnight'];
const seen=new Set();let n=0;
for(const land of lands)for(const circuit of circuits)for(let ante=1;ante<=3;ante++){
 c.run={land,circuit,ante};const name=R('campaignOpponentName(run)'),plan=R('campaignBossPlan(run)');assert(name&&plan);
 c.name=name;const v=R('campaignBossVoice(campaignBossPlan(run),name,run.land)'),fb=R('campaignBossVoice(campaignBossPlan(run))');
 assert.notEqual(v.intro,fb.intro,name+' has their own opening');assert.notEqual(v.lose,fb.lose,name+' has their own concession');
 for(const line of [v.intro,v.lose]){assert(line.length>=8&&line.length<=64,name+': '+line);assert(!seen.has(line),'Repeated line: '+line);seen.add(line);assert(!/[<>]/.test(line));}
 assert.deepEqual(v.capture,R('CAMPAIGN_LAND_VOICE[run.land].capture'));assert(v.capture.length>=2&&v.hurt.length>=2&&v.check&&v.win);
 for(const kind of ['intro','capture','hurt','check','win','lose'])assert(fb[kind],'fallback '+kind);n++;
}
assert.equal(n,60);assert.equal(R('Object.keys(CAMPAIGN_VOICES).length'),60);
assert.equal(R("campaignBossVoice({signature:'phalanx'},'Nobody','nowhere').intro"),'One shield falls, another takes its place.','Unknown names and Lands keep the formation lines');
const game=readFileSync('index.html','utf8'),sw=readFileSync('sw.js','utf8');
assert(game.includes('...campaignBossVoice(plan,n,RUN.land)'));
assert(/const GAME_VERSION = (\d+);/.test(game)&&+RegExp.$1>=178);const ver=+RegExp.$1;assert(sw.includes('crownfall-v'+ver)&&sw.includes('campaign-dialogue.js?v='+ver)&&game.includes('campaign-dialogue.js?v='+ver));
console.log('PASS: 60 named opponents have unique opening and concession lines, Land reactions, intact fallbacks and a matching cache version.');

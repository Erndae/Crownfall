// v192 Faces for the 20 Circuit Bosses (gold ring) and the 27 rule-named opponents of the Ruler's Road and Crown Match.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/campaign-opponents.js','utf8')+';this.O=CAMPAIGN_OPPONENTS;',ctx);
const face=ctx.campaignOpponentFace,src=fs.readFileSync(__dirname+'/index.html','utf8');
const block=k=>{const i=src.indexOf('const '+k+' = {');let d=0,j=src.indexOf('{',i);const st=j;for(;j<src.length;j++){if(src[j]==='{')d++;else if(src[j]==='}'){d--;if(!d)break;}}return src.slice(st,j+1);};
const keys=b=>[...b.matchAll(/(?:^|\n)\s*(?:'([^']+)'|"([^"]+)"|([A-Za-z_]\w*))\s*:\s*\{/g)].map(m=>m[1]||m[2]||m[3]);
const minis=[...block('MINIS').matchAll(/(?:downtown|rooftop|harbor|midnight):'([^']+)'/g)].map(m=>m[1]);assert.equal(minis.length,20);
const rulers=[...block('RULERS').matchAll(/name:'([^']+)'/g)].map(m=>m[1]);
for(const n of minis){const f=face(n);assert(f&&f.boss===true,n);}
const simple=keys(block('SIMPLE_TALK'));assert.equal(simple.length,30);
for(const n of simple){const f=face(n);assert(f&&!f.boss,n);}
for(const n of keys(block('PERSONA')))assert.equal(!!face(n),!rulers.includes(n)&&n!=='The Crownless King',n+': every persona but the Rulers has a drawn face');
const all=[...Object.values(ctx.O).flat(2),...Object.values(ctx.CAMPAIGN_BOSS_FACES).flatMap(o=>Object.keys(o)),...Object.values(ctx.CAMPAIGN_OTHER_FACES).flatMap(o=>Object.keys(o))];
assert.equal(all.length,107);assert.equal(new Set(all).size,107);assert.equal(new Set(all.map(n=>face(n).svg)).size,107,'No two share a face');
for(const n of all){const f=face(n);assert(!/undefined|NaN|null|<script|on\w+=|href/i.test(f.svg),n);assert(f.svg.length<6000,n);}
for(const m of [ctx.CAMPAIGN_BOSS_FACES,ctx.CAMPAIGN_OTHER_FACES])for(const n in m.throne)assert.equal(m.throne[n][1],'hollow',n);
const ruler={street:'fox',fantasy:'crow'};for(const l in ruler)for(const m of [ctx.CAMPAIGN_BOSS_FACES,ctx.CAMPAIGN_OTHER_FACES])for(const n in m[l])assert.notEqual(m[l][n][0],ruler[l],n);
for(const bad of [null,undefined,'',5,{},'Kingpin Vex'])assert.equal(face(bad),null);
assert(src.includes("oface${f.boss ? ' boss' : ''}"));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=192);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: 20 Circuit Bosses with a gold ring, 30 rule-named opponents, 107 unique safe faces, only Rulers keep portraits, version.');

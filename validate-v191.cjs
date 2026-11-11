// v191 Opponent faces: every named Campaign opponent has its own drawn face, shown in speech, quotes and the intro card.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/campaign-opponents.js','utf8')+';this.O=CAMPAIGN_OPPONENTS;this.nameOf=campaignOpponentName;',ctx);
const face=ctx.campaignOpponentFace,names=Object.values(ctx.O).flat(2);
assert.equal(names.length,60);assert.equal(new Set(names).size,60);
const svgs=new Set();
for(const n of names){const f=face(n);assert(f&&f.svg.startsWith('<svg')&&f.svg.endsWith('</svg>'),n);assert(!/undefined|NaN|null/.test(f.svg),n);assert(/^#[0-9a-f]{6}$/.test(f.accent)&&/^#[0-9a-f]{6}$/.test(f.bg),n);
  assert(!/<script|on\w+=|href/i.test(f.svg),n);assert(f.svg.length<6000,n);svgs.add(f.svg);assert.equal(face(n),f,'cached');}
assert.equal(svgs.size,60,'No two opponents share a face');
for(const land in ctx.CAMPAIGN_FACES)assert.equal(JSON.stringify(Object.keys(ctx.CAMPAIGN_FACES[land]).sort()),JSON.stringify(ctx.O[land].flat().sort()),land);
// each land avoids its Ruler's species, and the Fallen Throne's faces are all hollow-eyed
const ruler={street:'fox',medieval:'lion',greek:'owl',fantasy:'crow',throne:'doe'};
for(const land in ruler)for(const n in ctx.CAMPAIGN_FACES[land])assert.notEqual(ctx.CAMPAIGN_FACES[land][n][0],ruler[land],n);
for(const n in ctx.CAMPAIGN_FACES.throne)assert.equal(ctx.CAMPAIGN_FACES.throne[n][1],'hollow',n);
for(const bad of ['Kingpin Vex','The Crownless King','', undefined,'<b>'])assert.equal(face(bad),null);
assert.equal(ctx.nameOf({land:'street',circuit:'harbor',ante:2}),'Container Knox','Names and saves are untouched');
const src=fs.readFileSync(__dirname+'/index.html','utf8');
assert(src.includes('const of = oppFace(pp.name); if(of) return of;')&&src.includes("oppFace(bossName(boss.id), 'big')"));
assert(src.indexOf('if(pp.ruler) return rulerFace')<src.indexOf('const of = oppFace(pp.name)'),'Rulers keep their painted portraits');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=191);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: 60 unique, safe, cached faces matching the 60 names; ruler species avoided; Fallen Throne hollow-eyed; rulers and names untouched; version.');

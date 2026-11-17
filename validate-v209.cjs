// v209 Purse limit, the Hoard, and the best-campaign high score.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
E("showTip=()=>{};delete ACH.hoard;delete ACH.best_campaign;delete ACH.hoard_tip;ACH.campaign_epoch=5000;MATCH=null;");
const run=(m,x='')=>E(`RUN={land:'greek',circuit:'downtown',ante:2,blind:2,money:${m},relics:[],roster:['K']};${x}`);
assert.equal(E('PURSE_CAP'),300);
run(250);assert.equal(E('purseSpill()'),0);assert.equal(E('RUN.money'),250);assert.equal(E('hoardNow()'),0);
run(420);assert.equal(E('purseSpill()'),120);assert.equal(E('RUN.money'),300);assert.equal(E('hoardNow()'),120);
E('RUN.money=355');E('purseSpill()');assert.equal(E('hoardNow()'),175,'The Hoard adds up through the campaign');
run(999,'RUN.gauntlet=true');assert.equal(E('purseSpill()'),0);assert.equal(E('RUN.money'),999,'No limit in the Gauntlet');
run(999);E('MATCH={}');assert.equal(E('purseSpill()'),0);E('MATCH=null');
E('ACH.campaign_epoch=5001');assert.equal(E('hoardNow()'),0,'A new campaign starts an empty Hoard');
E('ACH.campaign_epoch=5000');assert.equal(E('hoardNow()'),175);
// campaign score and best
run(260);assert.equal(E('campaignScore()'),435);assert.equal(E('bestCampaign()'),435);assert.equal(E('ACH.campaign_best_new'),1);
E('ACH.campaign_epoch=5002');run(90);assert.equal(E('campaignScore()'),90);assert.equal(E('bestCampaign()'),435,'A lower campaign does not replace the best');assert.equal(E('ACH.campaign_best_new'),0);
E("ACH.hoard={ep:5003,n:'junk'};ACH.campaign_epoch=5003");assert.equal(E('hoardNow()'),0);
// wiring
assert(src.includes('laEnsure(); purseSpill();')&&src.includes('function updateHud(){ try{ purseSpill(); }catch(e){}')&&src.includes('RUN.money += total; purseSpill();')&&src.includes('function shop(){ purseSpill();'));
assert(src.includes('treasuryBank(campaignScore())')&&src.includes('Best campaign <b>$${bestCampaign()')&&src.includes('class="hoardline"'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=209);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: purse capped at $300 in a Campaign, overflow to the Hoard per campaign, score = Hoard + purse, best kept, no cap in Gauntlet or Match, wired, version.');

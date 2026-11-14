// v206 The Royal Treasury: the purse left at the Fallen Throne is banked once per campaign into a lifetime record.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;
const src=fs.readFileSync(__dirname+'/index.html','utf8');
E("delete ACH.treasury;delete ACH.treasury_ep;delete ACH.treasury_last;ACH.campaign_epoch=111;");
assert.equal(E('treasuryTotal()'),0);assert.equal(E('treasuryRank()'),'');assert.equal(E('treasuryDue()'),true);
assert.equal(E('treasuryBank(87)'),87);assert.equal(E('treasuryTotal()'),87);assert.equal(E('treasuryRank()'),'Coin Counter');assert.equal(E('ACH.treasury_last'),87);
assert.equal(E('treasuryDue()'),false);assert.equal(E('treasuryBank(500)'),0,'Once per campaign');assert.equal(E('treasuryTotal()'),87);
E('ACH.campaign_epoch=222');assert.equal(E('treasuryDue()'),true);assert.equal(E('treasuryBank(140.9)'),140);assert.equal(E('treasuryTotal()'),227,'It adds up across campaigns');assert.equal(E('treasuryRank()'),'Paymaster');
E('ACH.campaign_epoch=333');assert.equal(E('treasuryBank(-50)'),0);assert.equal(E('treasuryTotal()'),227,'Never negative');
E('ACH.campaign_epoch=444');assert.equal(E("treasuryBank('junk')"),0);
const ranks=JSON.parse(E('JSON.stringify(TREASURY_RANKS)'));for(let i=1;i<ranks.length;i++)assert(ranks[i-1][0]>ranks[i][0]);
for(const [n,name] of ranks){assert.equal(E(`treasuryRank(${n})`),name);assert.notEqual(E(`treasuryRank(${n-1})`),name);assert(!/Crownless|King/.test(name));}
assert.deepEqual(JSON.parse(E('JSON.stringify(treasuryNext(0))')),[50,'Coin Counter']);assert.equal(E('treasuryNext(5000)'),null);
E("ACH.treasury='oops'");assert.equal(E('treasuryTotal()'),0,'Bad saved data reads as empty');
// wiring: banked at the throne win, after the reward is added and before the run is cleared; shown on the win summary and the Journey screen; buys nothing
assert(src.includes("fallenRemember(); treasuryBank(RUN.money); }"));
const wb=src.slice(src.indexOf('function winBlind'));assert(wb.indexOf('RUN.money += total;')<wb.indexOf('treasuryBank(RUN.money)')&&wb.indexOf('treasuryBank(RUN.money)')<wb.indexOf('storeCarry(); clearRun();'));
assert(src.includes('class="jtreasury"')&&src.includes('updateNotice(); treasuryNotice();'),'Told once on the title screen after the ending, and listed on the Journey screen');
E('ACH.campaign_epoch=999;delete ACH.treasury_note;ACH.treasury=10');assert.equal(E('treasuryBank(5)'),5);assert.equal(E('ACH.treasury_note'),1);
assert.equal((src.match(/treasuryTotal\(\)/g)||[]).length>=4,true);assert(!/RUN\.money\s*[-+]=\s*treasury/.test(src),'A record only');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=206);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: purse banked once per campaign, lifetime total and ranks, safe with bad data, wired at the throne win, told on the title screen and shown on Journey, version.');

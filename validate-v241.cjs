// v241 Beaten on Hard: a gold crown mark with your name on the title and the Journey, and a gold Journey frame.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=241&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
E("delete ACH.sa_d_hard");assert.equal(E('hardWon()'),false);assert.equal(E("hardMarkHTML()"),'','nothing before a Hard finish');
E("ACH.sa_d_hard=Date.now()");assert.equal(E('hardWon()'),true);
const h=E("hardMarkHTML()");assert(h.includes('Beaten on Hard')&&h.includes('♛'),h);
// earned by finishing on Hard (the v231 achievement), kept across campaigns
E("delete ACH.sa_d_hard;ACH.cdiff='hard';storyAchsAtEnd('standard')");assert.equal(E('hardWon()'),true);
E("ACH.cdiff_next='easy';newCampaign()");assert.equal(E('hardWon()'),true,'kept after a new campaign');
assert(src.includes("${inC && hardWon() ? `<p class=\"titlehard\">${hardMarkHTML()}</p>` : ''}"));
assert(src.includes("<h2>Journey</h2>${hardMarkHTML('jhard')}</div>")&&src.includes("if(hardWon()) m.classList.add('hardwon');"));
assert(css.includes('.modal.journey.hardwon>.box')&&css.includes('.hardmark{'));
console.log('PASS: Beaten on Hard mark (crown, name) on the title and Journey once Heavy Is the Head is earned, kept across campaigns; gold Journey frame; version');

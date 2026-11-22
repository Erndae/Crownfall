// v233 Daily Run share result; a one-time Easy tip on the first Crown City Game Over.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=233&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
const share=r=>E(`dailyShareText(${JSON.stringify(r)})`);
const a=share({date:'2026-11-21',cleared:7,all:false,score:14250,streak:3}).split('\n');
assert.equal(a[0],'Crownfall Daily · '+E("dailyLabel('2026-11-21')"));
assert.equal(a[1],'🟩🟩🟩🟩👑🟩🟩🟥⬛⬛');assert.equal(a[2],'7 of 10 waves · 14,250');assert.equal(a[3],'🔥 3-day streak');assert.equal(a[4],'https://erndae.github.io/Crownfall/');
const b=share({date:'2026-11-21',cleared:10,all:true,score:40100,streak:1}).split('\n');
assert.equal(b[1],'🟩🟩🟩🟩👑🟩🟩🟩🟩👑');assert.equal(b.length,4,'no streak line for 1 day');
assert.equal(share({date:'2026-11-21',cleared:0,all:false,score:0,streak:1}).split('\n')[1],'🟥⬛⬛⬛⬛⬛⬛⬛⬛⬛');
assert(src.includes('<button class="btn gbtn" id="dshare">Share result</button>'));
// Easy tip: Crown City, not Easy, first campaign, once ever
E("localStorage.setItem('crownfall-tips','{}');ACH.ngplus=0;ACH.cdiff=undefined;RUN={land:'street'}");
assert.equal(E("easyTipHTML('medieval')"),'','only in Crown City');
E("ACH.cdiff='easy'");assert.equal(E("easyTipHTML('street')"),'','not on Easy');
E("ACH.cdiff=undefined;ACH.ngplus=1");assert.equal(E("easyTipHTML('street')"),'','not in New Game+');
E("ACH.ngplus=0;ACH.cdiff='hard'");assert(E("easyTipHTML('street')").includes('Easy mode is there for your next campaign'),'shown on Hard');
assert.equal(E("easyTipHTML('street')"),'','once ever');
E("localStorage.setItem('crownfall-tips','{}');ACH.cdiff=undefined");assert(E("easyTipHTML('street')").includes('Finding it tough?'),'shown on Normal');
assert.equal((src.match(/Best capture ever<\/span><b>\$\{BEST\.hand\.toLocaleString\(\)\}<\/b><\/div>\$\{tip\}/g)||[]).length,2,'both Game Over screens');
assert(src.includes('const tip = easyTipHTML(gl);'));
console.log('PASS: Daily Run share text (date, wave grid with boss crowns and the losing wave, waves and score, streak from 2 days, link) and button; Easy tip once on the first Crown City Game Over (not Easy, not New Game+), on both Game Over screens; version');

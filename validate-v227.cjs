// v227 First-time tips for board marks, the Hunger's count and Edicts.
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./test-support/game-runtime.cjs'),E=c.testEval;c.CrownfallCharacter={get:()=>({name:'Ernesto'}),art:()=>'',save:()=>true};
const src=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
for(const k of ['marks','hunger','edicts']){assert.equal(E(`typeof COACH.${k}.text`),'function',k);const [t,b]=JSON.parse(E(`JSON.stringify(COACH.${k}.text())`));assert(t.length>3&&b.length>40&&b.length<260,k);}
assert.equal(E("COACH.marks.target"),'#keyBtn','points at the Board key');
assert(!JSON.parse(E('JSON.stringify(ONBOARD_KEYS)')).some(k=>['marks','hunger','edicts'].includes(k)),'not skipped for existing players: everyone sees them once');
assert(src.includes("if(!resumed && !coachSeen().marks && boardMarks().some(m => ['light', 'crate', 'vantage', 'bounty'].includes(m.k))) later("),'first fight with a board mark (the Banner keeps its own tip)');
assert(src.includes("save(); go(); coach('hunger'); };")&&src.includes("then(); coach('edicts'); });"));
// coach() shows each once
E("localStorage.setItem('crownfall-tips',JSON.stringify({v2:1,score:1}));coachQ=[];coachOn=false;coachCool=true;coach('hunger');coach('hunger')");assert.equal(E("coachQ.filter(k=>k==='hunger').length"),1);
E("coachMark('hunger');coachQ=[];coach('hunger')");assert.equal(E('coachQ.length'),0,'never again once seen');
// New Game+ target rise is capped (normal +60%, Blitz +30%)
for(const [n,a,b] of [[0,0,0],[1,20,10],[2,40,20],[3,60,30],[4,60,30],[9,60,30]]){assert.equal(E(`ngTargetPct(${n})`),a);assert.equal(E(`ngTargetPct(${n},true)`),b);}
E('ACH.ngplus=5');assert.equal(+E('ngTargetMult()').toFixed(2),1.6);assert.equal(+E('ngTargetMult(true)').toFixed(2),1.3);E('ACH.ngplus=0');
assert(src.includes('ngTargetMult(!!lim)')&&src.includes('Score targets <b>+${ngTargetPct(next)}%</b> (Blitz <b>+${ngTargetPct(next, true)}%</b>)'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=227&&sw.includes("'crownfall-v"+RegExp.$1+"'"));
console.log('PASS: New Game+ target rise capped (+60%, Blitz +30%); three new first-time tips (board marks at the Board key, the Hunger count, Edicts), shown once to everyone, wired, version.');

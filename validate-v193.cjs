// v193 The opponent's face on the stage ticket (named opponents and Circuit Bosses; Rulers keep their Crown prize row).
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8');
assert(src.includes("${i===2 && !boss.ruler && oppFace(bossName(boss.id)) ? ' wface' : ''}"));
assert(src.includes('<i class="bface">${oppFace(bossName(boss.id))}</i>'),'The face is an <i>, so the name selector (span:not(.prize)) still matches only the name');
assert(css.includes('.blinds.solo .bcard.wface{grid-template-columns:auto minmax(0,1fr) auto')&&css.includes('"face name num" "face style rew"'));
assert(css.includes('.blinds.solo .bcard > .bface{grid-area:face'));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=193);assert(fs.readFileSync(__dirname+'/sw.js','utf8').includes('crownfall-v'+RegExp.$1));
console.log('PASS: stage ticket shows the face for non-Ruler opponents without disturbing the name, and version.');

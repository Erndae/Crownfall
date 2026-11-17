// v211 Two painted scenes in the standard ending (crown lift, kingdom balcony) with the game's own Continue button.
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/gameplay-polish.css','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8');
for(const f of ['crown-lift.webp','kingdom-balcony.webp']){const b=fs.readFileSync(__dirname+'/assets/ending/'+f);assert(b.length>40000&&b.length<400000,f);assert.equal(b.slice(8,12).toString(),'WEBP',f);assert(sw.includes('./assets/ending/'+f),'Cached for offline: '+f);}
const i=src.indexOf('async function endingStandard'),std=src.slice(i,src.indexOf('/* ---------- crown artwork',i));
// story and reveal order are unchanged; the two scenes sit where their lines are
const order=['THE CROWN IS WHOLE.','It was waiting for you.',"E.scene('lift')","E.cont('You lift the Crown of Crowns.'","E.scene('become')",'endingArmyLine()','You do not turn around.','Then your face.','THE KING IS DEAD.','LONG LIVE THE CROWNLESS KING.','The throne has its king again. It has you.',"endingPending('standard', 'city')","E.scene('city')",'EVERYBODY WANTS A CROWN.','SOMEWHERE IN CROWN CITY…','A NEW CROWNRUNNER HAS ENTERED.',"E.scene('reign')",'THEY ARE COMING FOR YOUR THRONE','A crown can be worn. It can also be broken.'];
let at=-1;for(const x of order){const k=std.indexOf(x,at+1);assert(k>at,'In order: '+x);at=k;}
assert.equal((std.match(/You lift the Crown of Crowns\./g)||[]).length,1,'Said once');
assert(std.indexOf("add('t1')")>std.indexOf("E.scene('become')"),'The transformation still follows');
// the Continue button is game UI, never part of the artwork, and survives Skip
assert(src.includes('<div class="en-panel" hidden><p></p><button type="button" class="en-cont">'));
assert(src.includes('E.cont = (text, cls) => new Promise(')&&src.includes('E.wake.add(stop); if(E.stop) stop();'));
assert(src.includes('data-s="lift"><div class="en-art" role="img"')&&src.includes('data-s="reign"><div class="en-art" role="img"'));
// fits phones: art from the top safe area, room kept for the line and the button above the bottom safe area, no stretching
assert(css.includes('.en-paint .en-art{position:absolute;left:0;right:0;top:var(--sat);height:calc(100% - var(--sat) - var(--sab) - 176px);max-height:182vw;background:center top/cover no-repeat}'));
assert(css.includes('.en-panel{position:absolute;left:0;right:0;bottom:calc(var(--sab) + 20px);')&&css.includes('min-height:50px'));
// the true ending is untouched
const tr=src.slice(src.indexOf('async function endingTrue'),src.indexOf('async function endingTrue')+5200);assert(!tr.includes("E.scene('lift')")&&!tr.includes("E.scene('reign')")&&!tr.includes('E.cont('));
assert(/const GAME_VERSION = (\d+);/.test(src)&&+RegExp.$1>=211);assert(sw.includes('crownfall-v'+RegExp.$1));
console.log('PASS: art files present and cached, story order unchanged with the lift and balcony scenes in place, game-rendered Continue, phone fit rules, true ending untouched, version.');

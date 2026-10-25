import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const values=new Map([['campaign-save','untouched'],['gauntlet-save','untouched']]),events=[];let blocked=false;
const c={window:{addEventListener(){},dispatchEvent:e=>events.push(e.type)},document:{querySelectorAll:()=>[],addEventListener(){}},CustomEvent:class{constructor(type){this.type=type;}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>{if(blocked)throw Error('quota');values.set(k,v);}}};vm.createContext(c);vm.runInContext(readFileSync('piece-designs.js','utf8')+readFileSync('character-style.js','utf8'),c);const api=c.window.CrownfallCharacter;
assert.equal(api.get().name,'Crownrunner');const drawings=new Set();
for(const palette of ['gold','ivory','coral','mint','sky','lilac'])for(const crown of ['classic','street','regal','runic'])for(const crest of ['none','diamond','bolt','star']){assert(api.save({name:'Night Runner',palette,crown,crest}));assert.equal(api.get().palette,palette);assert.equal(api.get().crown,crown);assert.equal(api.get().crest,crest);drawings.add(api.svg());}
assert.equal(drawings.size,96);
const library=new Set();for(const pieceSet of ['sculpted','street','crystal','wild','relic','classic'])for(const type of ['K','Q','R','B','N','P']){const v={pieceSet,size:'large',finish:'polished'};library.add(api.piece(type,v));assert(api.art(type,'me',v).includes('data-piece-design="'+pieceSet+'"'));}
assert.equal(library.size,36);api.save({pieceSet:'street',pieces:{N:'wild',R:'crystal',P:'invalid',X:'wild'},size:'grand',finish:'duo'});assert.equal(api.designId('N'),'wild');assert.equal(api.designId('R'),'crystal');assert.equal(api.designId('P'),'street');assert.equal(Object.keys(api.get().pieces).length,2);assert(api.art('N').includes('scale(1.12)'));
values.set('crownrunner-character-v1',JSON.stringify({name:'Old Runner',palette:'mint',crown:'street',crest:'star'}));assert.equal(api.get().name,'Old Runner');assert.equal(api.get().palette,'mint');assert.equal(api.get().pieceSet,'classic');assert.equal(values.size,3);assert.equal(values.get('campaign-save'),'untouched');assert.equal(values.get('gauntlet-save'),'untouched');
api.save({name:'\u0000   ',palette:'__proto__',crown:'<script>',crest:'unknown'});assert.equal(api.get().name,'Crownrunner');assert.equal(api.get().palette,'gold');assert.equal(api.get().crown,'classic');assert.equal(api.get().crest,'none');
values.set('crownrunner-character-v1','broken JSON');assert.equal(api.get().name,'Crownrunner');const count=events.length;blocked=true;assert.equal(api.save({name:'Unsaved'}),false);assert.equal(events.length,count);
console.log('PASS: 36 piece designs, mixed sets, sizes, finishes, old-profile migration, 96 King combinations, normalized profiles, persistent selection, corrupt-storage fallback, failed-save handling, and untouched Campaign/Gauntlet data.');
// Enemy geometry, scale, carving and finish never read the player's profile.
blocked=false;
const enemy=Object.fromEntries('KQRBNP'.split('').map(t=>[t,api.art(t,'en')]));
for(const pieceSet of ['sculpted','street','crystal','wild','relic','classic'])for(const size of ['compact','balanced','large','grand'])for(const finish of ['matte','polished','duo']){
 const profile={pieceSet,size,finish,palette:'coral',crown:'runic',crest:'star',pieces:{N:'wild',R:'crystal'}};
 api.save(profile);
 for(const t of 'KQRBNP')assert.equal(api.art(t,'en'),enemy[t],'Enemy '+t+' ignores player customization');
}
assert.notEqual(api.art('N','me',{pieceSet:'wild',size:'grand'}),api.art('N','me',{pieceSet:'classic',size:'compact'}));
// Exercise the compact editor: changes are previews until Save; Cancel keeps
// the stored look, and a whole-army set clears the old individual overrides.
let dialog;
const makeNode=()=>({value:'',hidden:false,innerHTML:'',textContent:'',dataset:{},attributes:{},setAttribute(k,v){this.attributes[k]=v;},focus(){}});
c.document.querySelector=()=>null;c.document.activeElement={focus(){}};
c.document.createElement=()=>{
 const nodes=new Map(),node=s=>{if(!nodes.has(s))nodes.set(s,makeNode());return nodes.get(s);};
 const colors=['gold','ivory','coral','mint','sky','lilac'].map(color=>Object.assign(makeNode(),{dataset:{color}}));
 const pieces='KQRBNP'.split('').map(piece=>Object.assign(makeNode(),{dataset:{piece}}));
 dialog={...makeNode(),querySelector:node,querySelectorAll:s=>s==='[data-color]'?colors:s==='[data-piece]'?pieces:[],addEventListener(){},showModal(){this.shown=true;},close(){this.closed=true;},remove(){}};return dialog;
};c.document.body={append(){}};
api.save({pieceSet:'street',pieces:{N:'wild'},size:'compact',palette:'mint'});const original=JSON.stringify(api.get());
api.open();assert(dialog.shown);assert(!dialog.innerHTML.includes('role="tablist"'));assert.match(dialog.innerHTML,/<details class="look-more"><summary>More options/);assert.match(dialog.innerHTML,/Changes apply to your pieces only/);
dialog.querySelector('#armyStyle').onchange({target:{value:'crystal'}});assert(dialog.querySelector('.army-style-preview').innerHTML.includes('data-piece-design="crystal"'));assert.equal(JSON.stringify(api.get()),original);dialog.querySelector('.character-cancel').onclick();assert.equal(JSON.stringify(api.get()),original);
api.open();dialog.querySelector('#armyStyle').onchange({target:{value:'classic'}});dialog.querySelector('#armySize').onchange({target:{value:'grand'}});dialog.querySelector('form').onsubmit({preventDefault(){}});
assert.equal(api.get().pieceSet,'classic');assert.equal(api.get().size,'grand');assert.equal(Object.keys(api.get().pieces).length,0);assert(dialog.closed);
for(const t of 'KQRBNP')assert.equal(api.art(t,'en'),enemy[t]);
console.log('PASS: enemy appearance stays fixed across every player set, size and finish; compact editor previews, Cancel, Save and legacy mixed-set clearing work.');
// The readable original set replaces old Sculpted/Comic ink defaults once;
// a later explicit alternate-set choice is preserved.
blocked=false;
values.set('crownrunner-character-v1',JSON.stringify({name:'Saved Runner',pieceSet:'sculpted',palette:'mint',size:'grand',pieces:{N:'sculpted',R:'crystal'}}));
assert.equal(api.get().pieceSet,'classic');assert.equal(api.get().pieces.N,'classic');assert.equal(api.get().pieces.R,'crystal');assert.equal(api.get().palette,'mint');assert.equal(api.get().size,'grand');
assert(api.art('P').includes('data-piece-render="original"'));
api.save({...api.get(),pieceSet:'sculpted',pieces:{}});assert.equal(api.get().pieceSet,'sculpted');
assert.equal(api.art('N','en'),enemy.N,'Enemy set remains independent after legacy-profile migration');
console.log('PASS: readable original pieces restore automatically for old profiles; colors, sizes and explicit future choices are retained.');

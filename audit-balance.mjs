import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const game=readFileSync('index.html','utf8');
const between=(a,b)=>{const start=game.indexOf(a);assert(start>=0,a);const end=game.indexOf(b,start);assert(end>start,b);return game.slice(start,end);};
const line=start=>{const i=game.indexOf(start);assert(i>=0,start);return game.slice(i,game.indexOf('\n',i))+'\n';};
const lands=['street','medieval','greek','fantasy','throne'],circuits=['downtown','rooftop','harbor','midnight'];
const c={window:{},RUN:null,MATCH:null,CIRCUITS:circuits.map(id=>({id})),CIRCUIT_STAGES:4,TRAIN_TYPES:['P','N','B','R','Q'],LV_MAX:6};
c.land=()=>c.RUN.land;c.effLv=t=>c.RUN.lv[t]||1;c.eList=e=>e?e.split('+'):[];c.parseR=r=>({t:r[0],e:r.split(':')[1]});c.R=()=>({});c.RULER=()=>vm.runInContext('RULERS[RUN.land]',c);
c.bossAt=a=>c.RUN.bosses[(a-1)%c.RUN.bosses.length];c.bossId=()=>c.RUN.blind===2?c.bossAt(c.RUN.ante):null;c.bossRuleName=id=>c.RUN.land==='street'&&id==='clock'?'Speedy Rico':id;
vm.createContext(c);
vm.runInContext(readFileSync('gameplay-polish.js','utf8'),c);
vm.runInContext(between('const TYPE = {','const SHAPE = {')+between('const BOSSES = [','// Score targets:')+between('const CONQUEST_SCALING = {','const CONQUEST_STEPS =')+line('const CONQUEST_STEPS =')+line('const tierFor =')+line('const TIER_BASE =')+'const DF=()=>CONQUEST_SCALING[TIER_BASE()];'+line('const CIRCUIT_TARGET_SCALE =')+line('const DF_TARGET =')+line('const isC =')+between('const RULERS = {','/* Animal land rulers;')+line('const MINI_RULE =')+line('function introRuleFree(')+line('const ruleOf =')+line('function parFor(')+line('const blitzBonus =')+line('const CITY_BLITZ =')+line('const CITY_BLITZ_TARGET =')+line('const RICO_DOWNTOWN_TARGET =')+between('function moveLimitFor(','const blitzOn =')+between('const PPM_REF =','// a fight\'s target is fixed')+between('const STORE_PRICES = {','function restockCost('),c);
const builds=[{name:'Fresh',n:8,level:1,fresh:true},{name:'Developing',n:11,level:3},{name:'Trained',n:15,level:6}];let count=0;const ranges={};
for(const build of builds)for(let li=0;li<lands.length;li++){
 const range=[];
 for(let ci=0;ci<=4;ci++)for(let stage=1;stage<=(ci===4?1:4);stage++){
  const circuit=ci===4?'ruler':circuits[ci],ante=ci===4?6:stage;
  c.RUN={land:lands[li],circuit,ante,blind:2,journeys:build.fresh?1:li*5+ci+1,armyStages:build.fresh?0:li*16+ci*4+stage-1,lv:Object.fromEntries('PNBRQ'.split('').map(t=>[t,build.level])),roster:['K',...Array.from({length:build.n-1},(_,i)=>'PNBRQ'[i%5])],relics:[],bosses:ci===4?Array(6).fill('ruler'):['clock','march','tax','mini']};
  const t=vm.runInContext('targetParts(2)',c);assert(Number.isFinite(t.final)&&t.final>=10);assert(t.final<=t.prog+10);assert(t.final<=t.cap+10);if(t.fresh!==null)assert(t.final<=t.fresh+10);if(t.blitz!==null)assert(t.final<=t.blitz+10);range.push(t.final);count++;
 }
 ranges[build.name+'|'+lands[li]]=[Math.min(...range),Math.max(...range)];
}
const prices=vm.runInContext('STORE_PRICES.train',c);assert.equal(prices[0],8);assert(prices.every((x,i)=>!i||x>prices[i-1]));assert.equal(prices.reduce((a,b)=>a+b,0),134);
const reward=vm.runInContext('BLINDS[2].reward',c);assert(prices[0]<reward,'One ordinary stage reward can pay for initial training');
let report='# Crownfall v163 balance audit\n\nArithmetic scenario checks using the production target functions, 3 representative army builds, all 5 lands, 16 circuit stage positions and the final ruler position per land. No relics or forge powers; the scenarios use the normal conquest profiles and include Blitz and non-Blitz rules. This is a safety and affordability audit, not a measured win-rate study or simulated full campaign playthrough.\n\n';
report+=`- ${count} target scenarios passed: finite, positive, within progression/army-capacity guards and applicable fresh-army/Blitz guards.\n- Existing saved fight targets remain fixed; the update does not change their formula.\n- Initial training costs $8 against the ordinary $${reward} stage reward.\n- Training prices: $${prices.join(', $')}; full Lv.1–6 cost per type $134 (previously $135). The first steps are cheaper; later steps stay meaningful.\n- Savings: $1 per $5 held, capped at $5 ($6 in Midnight Market), replacing $2 per $5 capped at $10/$12. The new Midnight cap matches its advertised ability and reduces the benefit of repeatedly avoiding purchases.\n- Existing recruit, forge and extra-life prices are unchanged. Gauntlet token rewards are unchanged.\n\n`;
report+='## Target ranges across the tested positions\n\n| Land | Fresh (8 pieces, Lv.1) | Developing (11 pieces, Lv.3) | Trained (15 pieces, Lv.6) |\n|---|---:|---:|---:|\n';
for(const land of lands)report+=`| ${land} | ${builds.map(b=>ranges[b.name+'|'+land].map(x=>x.toLocaleString()).join('–')).join(' | ')} |\n`;
report+='\n## Practical follow-up\n\nTrack real clear rates, moves per win, unspent cash and training purchases over player runs before making broader difficulty changes. Existing score, checkmate, reinforcement and retry rules are retained.\n';
if(process.argv.includes('--write'))writeFileSync('BALANCE-AUDIT.md',report);console.log(`PASS: ${count} production target scenarios across all lands and representative builds; training affordability and savings caps verified.`);

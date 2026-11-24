#!/usr/bin/env node
/* Crownfall playtest (v240): the game's own AI plays your side against the real enemy AI in real fight setups, headless,
   and reports win rates. It uses the game's own code (index.html), so it always tests the current build.

   Simplified on purpose: your side plays good chess but doesn't use Tactics, swaps, cards, relics or the Hunger, and
   doesn't play for points. Real players do better; compare results between builds, difficulties and fight types,
   not as absolute win rates. Each fight starts from a fresh army of the given level (real late-game armies are bigger).

   Usage:  node tools/playtest.cjs [options]
     --lands=street,medieval      Lands (street, medieval, greek, fantasy, throne)
     --diffs=easy,normal,hard     difficulties
     --me=900,1400                your side's playing strength(s) (900 casual, 1400 solid)
     --seeds=4                    games per fight
     --level=auto                 army level (auto: 1 Crown City, 2 Iron Kingdom, 3 Olympian Court, 4 later)
     --circuits=downtown,rooftop,harbor,midnight,ruler
     --stages=1,4                 Circuit stages to test (fight 0 = first fight, fight 2 = Stage Battle)
     --out=results.json           also save every fight
   Example: node tools/playtest.cjs --lands=greek --diffs=normal --seeds=2   (about a minute) */
const path=require('path'),fs=require('fs');
const ROOT=path.join(__dirname,'..');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(`--${k}=`));return a?a.slice(k.length+3):d;};
const list=(k,d)=>arg(k,d).split(',').map(s=>s.trim()).filter(Boolean);
const LANDS=list('lands','street,medieval'),DIFFS=list('diffs','easy,normal,hard'),MES=list('me','900,1400').map(Number);
const SEEDS=+arg('seeds','4'),LEVEL=arg('level','auto'),CIRCS=list('circuits','downtown,rooftop,harbor,midnight,ruler'),STAGES=list('stages','1,4').map(Number),OUT=arg('out','');
const AUTO_LV={street:1,medieval:2,greek:3,fantasy:4,throne:4};

process.chdir(ROOT);
const c=require(path.join(ROOT,'test-support/game-runtime.cjs')),E=c.testEval;
c.CrownfallCharacter={get:()=>({name:'Runner'}),art:()=>'',save:()=>true,palette:()=>({})};
c.fetch=()=>new Promise(()=>{});c.Image=function(){this.decode=()=>Promise.resolve();};
E('musicOn=false;soundOn=false');
E(`globalThis.__ptFight=(cfg)=>{window.__noRoll=true;MATCH=null;ACH.cdiff=cfg.d==='normal'?undefined:cfg.d;ACH.ngplus=0;ACH.edicts=[];
  setPack(cfg.land);newRun(cfg.c);RUN.ante=cfg.ante;RUN.blind=cfg.blind;RUN.introRuleFree=true;RUN.pactKey='x';RUN.fightTarget=null;
  for(const t of 'PNBRQ')RUN.lv[t]=cfg.lv;normLv(RUN);
  startBlind();const tgt=B.target,lim=B.moveLimit?B.moves:null,rating=B.ai&&B.ai.rating;let res='timeout',myMoves=0;
  for(let i=0;i<140;i++){
    const m=CFAI.choose(B.board,{side:'me',rating:cfg.me,ref:CFAI.material(B.board),rng:Math.random,budgetMs:60});
    if(!m){res=inCheck(B.board,'me')?'mated':'stalemate';break;}
    const sc=scoreCapture(m.from,m.to,m.promo||m.pt);if(sc&&sc.total)B.score+=sc.total;
    B.board=applyMove(B.board,m.from,m.to,m.promo||m.pt);myMoves++;if(B.moveLimit)B.moves--;
    if(scoreGoalReady()){res='target';break;}
    if(!anyLegal(B.board,'en')){res=inCheck(B.board,'en')?'mate':'stalemate';break;}
    if(B.moveLimit&&B.moves<=0){res='outofmoves';break;}
    let p=null;try{p=enemyPlan(0)}catch(e){}
    if(!p){res=inCheck(B.board,'en')?'mate':'stalemate';break;}
    B.board=applyMove(B.board,p.from,p.to,p.promo||p.pt);
    if(!anyLegal(B.board,'me')){res=inCheck(B.board,'me')?'mated':'stalemate';break;}
  }
  return JSON.stringify({res,myMoves,score:B.score,target:tgt,lim,rating});}`);

const rows=[];let n=0;
const plan=[];for(const d of DIFFS)for(const land of LANDS)for(const ci of CIRCS)for(const ante of (ci==='ruler'?[1]:STAGES))for(const blind of (ci==='ruler'?[2]:[0,2]))for(const me of MES)for(let s=0;s<SEEDS;s++)plan.push({d,land,c:ci,ante,blind,me,lv:LEVEL==='auto'?AUTO_LV[land]:+LEVEL});
for(const f of plan){let r;try{r=JSON.parse(E(`__ptFight(${JSON.stringify(f)})`));}catch(e){r={res:'error',err:String(e).slice(0,160)};}
  rows.push({...f,...r});if(++n%20===0)process.stderr.write(`\r${n}/${plan.length} fights`);}
process.stderr.write(`\r${n}/${plan.length} fights\n`);
if(OUT)fs.writeFileSync(OUT,JSON.stringify(rows,null,1));

const win=r=>r.res==='target'||r.res==='mate',pct=L=>L.length?`${Math.round(100*L.filter(win).length/L.length)}%`.padStart(4):'   -';
const kind=r=>r.c==='ruler'?'ruler':r.lim?'blitz':r.blind===2&&r.ante===4?'boss':'other';
const who=me=>me<=1000?`casual (${me})`:`solid (${me})`;
console.log(`\nCrownfall playtest · ${rows.length} fights · errors ${rows.filter(r=>r.res==='error').length}`);
console.log('\nWin rate per fight            '+DIFFS.map(d=>d.padEnd(8)).join(''));
for(const land of LANDS)for(const me of MES)console.log(`${land.padEnd(9)} ${who(me).padEnd(18)} `+DIFFS.map(d=>pct(rows.filter(r=>r.land===land&&r.me===me&&r.d===d)).padEnd(8)).join(''));
for(const d of DIFFS){console.log(`\n${d}: by fight type          other   boss    blitz   ruler`);
  for(const land of LANDS)for(const me of MES)console.log(`${land.padEnd(9)} ${who(me).padEnd(18)} `+['other','boss','blitz','ruler'].map(k=>pct(rows.filter(r=>r.land===land&&r.me===me&&r.d===d&&kind(r)===k)).padEnd(8)).join(''));}
const errs=rows.filter(r=>r.res==='error');if(errs.length)console.log('\nFirst error:',errs[0].err);

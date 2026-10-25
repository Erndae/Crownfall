/* Pure presentation models shared by gameplay and its regression checks. */
(()=>{
 'use strict';
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const formations={
  knightRush:['Knight assault','Advanced Knights press the center. Trade the attackers before opening your King.'],
  phalanx:['Pawn formation','Connected Pawns protect one another. Open a file before committing your heavy pieces.'],
  nightRaid:['Tactical ambush','Watch Knight forks and loose pieces. Keep a defender near your King.'],
  bishopCourt:['Diagonal pressure','Bishops control long diagonals. Block their lines with supported Pawns.'],
  twinQueens:['Heavy attack','Two Queens create overlapping threats. Seek supported exchanges.'],
  mirror:['Mirror formation','The opponent echoes your army. Change the Pawn structure to create an imbalance.'],
  rookFortress:['Rook fortress','Rooks guard open files behind a Pawn screen. Break the screen and contest the files.'],
  knightPack:['Mounted flank','Multiple Knights threaten forks. Exchange them before opening your King’s side.'],
  royalGuard:['Layered guard','Defenders surround the major pieces. Remove supporting Pawns first.'],
  merchant:['Material hunter','The opponent prefers valuable captures. Defend the bait before offering a trade.'],
  bishopGuard:['Bishop guard','Supported Bishops cover the King. Trade an active Bishop to open a route in.'],
  pawnWave:['Pawn advance','A mass of Pawns advances together. Block the leaders and work around the flanks.'],
  promotionHorde:['Promotion race','Advancing Pawns threaten to promote. Stop their leading Pawn before chasing material.']
 };
 const styles={aggressive:['Fast pressure','Meet the advanced attackers with supported trades.'],defensive:['Defensive formation','Improve your pieces and open a file before attacking.'],hunter:['King pressure','Cover checks and escape squares before launching your attack.'],tricky:['Tactical play','Look for forks, pins and loose defenders on every move.'],greedy:['Material hunter','Defend valuable pieces and offer only supported exchanges.']};
 function formation(sig,style){const x=formations[String(sig||'').replace('+','')]||styles[style]||['Open contest','Protect your King, develop your pieces and choose supported captures.'];return {title:x[0],tip:x[1]};}
 function training(type,level){const chips=type.chips+type.lc*(level-1),mult=type.mult+type.lm*(level-1);return {chips,mult,nextChips:chips+type.lc,nextMult:mult+type.lm,before:chips*mult,after:(chips+type.lc)*(mult+type.lm)};}
 function objective({score,target,pending,hold,moves,mateOnly}){if(pending)return 'Capture must survive the reply';if(hold)return 'Final phase · survive the reply';if(mateOnly)return 'Final phase · checkmate the King';return `Checkmate or ${Number(target||0).toLocaleString()} points${Number.isFinite(moves)&&moves<=3?` · ${Math.max(0,moves)} moves left`:''}`;}
 function loss(why,log=[]){const text=String(why||''),blitz=/moves|blitz|time limit/i.test(text),mate=/checkmate|mated|King is trapped/i.test(text),army=/army is gone|lone.?king/i.test(text),concede=/conced/i.test(text);let index=-1;
  for(let i=log.length-1;i>=0;i--)if((blitz?log[i].k==='me':log[i].k==='en')&&Number.isInteger(log[i].f)&&log[i].f>=0&&log[i].f!==log[i].t){index=i;break;}
  return {title:mate?'Your King ran out of safe replies':blitz?'The move limit ran out':army?'Only your King remained':concede?'You conceded this fight':'The round ended',tip:mate?'Before attacking, check the lines toward your King and keep escape squares covered.':blitz?'Use the move preview to compare captures. Spend limited moves on points or a direct mating attack.':army?'Support your attackers and check the reply before trading away your last defenders.':concede?'Review the last position before retrying; a different exchange or a saved swap may give you another route.':'Review the last exchange and the threats to your King before retrying.',index,note:index>=0?String(log[index].n||''):''};
 }
 const savings=(money,circuit)=>Math.min(circuit==='midnight'?6:5,Math.floor(Math.max(0,Number(money)||0)/5));
 window.CrownfallPolish={escape,formation,training,objective,loss,savings};
})();

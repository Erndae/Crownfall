/* Beta encounter identities and dialogue, independent of main combat rules. */
const CAMPAIGN_BOSS_PLANS={
 downtown:[['aggressive','knightRush','Fast assault','Keep your King covered; trade the advanced Knights.'],['defensive','phalanx','Pawn formation','Open a file before committing your heavy pieces.'],['tricky','nightRaid','Tactical ambush','Watch Knight forks; exchange attackers before advancing.']],
 rooftop:[['hunter','bishopCourt','Diagonal pressure','Break the long diagonals with supported Pawns.'],['aggressive','twinQueens','Heavy attack','Force Queen trades and attack loose defenders.'],['tricky','mirror','Mirror formation','Change the Pawn structure to break the symmetry.']],
 harbor:[['defensive','rookFortress','Rook fortress','Challenge the open files with supported Rooks.'],['tricky','knightPack','Mounted flank','Trade Knights before opening your King’s side.'],['defensive','royalGuard','Layered guard','Remove the Pawn defenders before attacking the majors.']],
 midnight:[['greedy','merchant','Material hunter','Offer a defended target to draw attackers out.'],['hunter','bishopGuard','Royal pressure','Trade the active Bishop and protect your back rank.'],['aggressive','pawnWave','Pawn advance','Block the leading Pawns and attack from the side.']]
};
function campaignBossPlan(run,stage=run?.ante){
 if(!run||run.gauntlet||run.match)return null;
 if(run.circuit==='ruler'){const hints={street:'Favor captures to avoid the quiet-move tax; keep cash in reserve.',medieval:'Open files and capture officers; enemy Pawns give no Material.',greek:'Use every piece to contest the center and open lines toward the King.',fantasy:'Keep two defenders near your King until the double turn is spent.',throne:'Plan captures, build checks, and keep your King covered.'};return {style:'defensive',signature:null,tactic:'Ruler challenge',weakness:hints[run.land]||'Read the ruler’s rules before committing.'};}
 if(Number(stage)===4){const signatures={street:['knightRush','twinQueens','rookFortress','nightRaid'],medieval:['knightRush','royalGuard','knightPack+','merchant'],greek:['knightRush','rookFortress','phalanx','bishopGuard'],fantasy:['nightRaid','bishopCourt','knightPack','pawnWave'],throne:['promotionHorde','twinQueens','knightPack+','pawnWave']};const i=['downtown','rooftop','harbor','midnight'].indexOf(run.circuit);const styles=['aggressive','hunter','defensive','greedy'],tips=['Trade the advanced attackers before opening your King’s position.','Close the open lines and exchange the strongest attacker.','Break the Pawn screen, then contest the open files.','Make profitable captures and keep reserves for the endgame.'];return i<0?null:{style:styles[i],signature:signatures[run.land]?.[i]||'classic',tactic:['Fast assault','Royal pressure','Defended formation','War of resources'][i],weakness:tips[i]};}
 const plan=CAMPAIGN_BOSS_PLANS[run.circuit]?.[Number(stage)-1];if(!plan)return null;
 const [style,signature,tactic,weakness]=plan;
 return {style,signature,tactic,weakness};
}
function campaignBossVoice(plan,name,land){
 const lines={knightRush:['The center belongs to my riders.','You broke our charge.'],phalanx:['One shield falls, another takes its place.','The line has broken.'],nightRaid:['Watch the shadows between your pieces.','You saw us coming.'],bishopCourt:['Every open diagonal leads back to me.','My sightlines are gone.'],twinQueens:['Two crowns. One board. No room for you.','Both crowns, brought low.'],mirror:['I know your army as well as you do.','You found the difference.'],rookFortress:['These files are mine. Come and take them.','The gates are open.'],knightPack:['You cannot guard every landing.','Our riders are scattered.'],royalGuard:['You will reach me only after the guard falls.','The guard could not hold.'],merchant:['Every exchange has a price. I expect a profit.','A ruinous bargain.'],bishopGuard:['The court watches every diagonal.','You outplayed the court.'],pawnWave:['Step by step, your squares become mine.','Our advance ends here.'],promotionHorde:['Every Pawn you ignore becomes a crown.','None reached the throne.']};
 const [intro,lose]=lines[plan?.signature?.replace('+','')]||['Make your move.','The road is yours.'];
 const mine=CAMPAIGN_VOICES[name],place=CAMPAIGN_LAND_VOICE[land];
 return {intro:mine?mine[0]:intro,lose:mine?mine[1]:lose,capture:place?place.capture:['Another square under my control.'],hurt:place?place.hurt:['A weakness exposed.'],check:place?place.check:'Your King needs a defender.',win:place?place.win:'This crossing is still mine.'};
}
/* v178: every named Campaign opponent opens and concedes in their own voice [intro, lose]; capture, hurt, check and
   win lines follow the Land. Formation lines above remain the fallback. Presentation only: no rule or save reads these. */
const CAMPAIGN_VOICES={
 'Speedy Rico':['Blink and you’ll miss me, rookie.','Okay, okay. You’re quick.'],
 'Brickwall Benny':['Nothing gets past Benny. Ask anybody.','First crack in thirty years.'],
 'Double Dutch Dana':['Two ropes, one beat. Try to keep up.','You found the rhythm. Respect.'],
 'Fire Escape Finn':['I know every way up. You know none.','Taking the stairs down. Slowly.'],
 'Water Tank Tessa':['From up here I see your whole board.','Guess the view’s yours tonight.'],
 'Catwalk Cruz':['Narrow path, long drop. Don’t look down.','You’ve got better balance than me.'],
 'Ferryhand Mara':['Nobody crosses this harbor without my say.','Fine. Ride’s free. Just this once.'],
 'Container Knox':['Stacked, locked and sealed. Good luck.','You cracked the whole stack.'],
 'Dry Dock Dorian':['I fix what the harbor breaks. Then I break it back.','That one’s past repairing.'],
 'Lantern Leni':['Stay in my light. It’s the last you’ll see.','Lights out for me.'],
 'Neon Juno':['Bright signs, bad deals. Step right in.','Sign’s flickering. I’m done.'],
 'Smuggler Sable':['You never saw me. You won’t see this either.','Caught. First time for everything.'],
 'Warden Osric':['The King’s Road ends where I stand.','Pass, then. The road is open.'],
 'Fordkeeper Elwen':['The river runs shallow here. So do your chances.','Cross. You have earned the far bank.'],
 'Tollguard Cedric':['The toll is one army. Yours will do.','Paid in full. Go on.'],
 'Rampart Ysella':['These walls have never been climbed.','A breach. Sound the bell.'],
 'Bailey Roderic':['The yard is mine to hold, stranger.','The yard is lost. Well fought.'],
 'Banneret Hester':['My banner has never touched the ground.','Lower the banner. Gently.'],
 'Meadowguard Ansel':['Quiet fields. Let us keep them that way.','Trampled. I will mend it by spring.'],
 'Stablemaster Fenwick':['My horses know this ground. You do not.','Easy now. The race is run.'],
 'Bridgewarden Maud':['One bridge. One warden. No way around.','The bridge is yours to cross.'],
 'Guildsman Tavian':['The Guild sets the terms. You merely sign.','The contract is void.'],
 'Woolmerchant Bess':['I have fleeced sharper than you.','Shorn to the skin. Well played.'],
 'Treasurer Halden':['Every coin in this kingdom is counted. So are you.','The ledger does not balance.'],
 'Damon of Marathon':['I have run farther than you have marched.','My race ends here.'],
 'Laurelkeeper Ione':['Laurels are for victors. Show me one.','The wreath is yours to wear.'],
 'Colonnade Theron':['Count the pillars. Each one outlasted a hero.','A pillar falls. Pass between.'],
 'Stairwarden Nereus':['A thousand steps to the Court. You stop at this one.','Climb on. The gods are watching.'],
 'Lionguard Myrrine':['The lions are stone. I am not.','Even lions bow.'],
 'Pillarwarden Evander':['I hold up the roof of heaven. You cannot move me.','The roof holds without me, it seems.'],
 'Beachguard Xanthe':['The tide and I both turn armies back.','The tide has gone out.'],
 'Shipwright Leandros':['I build ships. I also sink them.','Take the fastest hull. You earned it.'],
 'Gatekeeper Phaedra':['The gate opens for the worthy. It has stayed shut a long time.','The gate is open.'],
 'Ferryman Orestes':['Pay the ferryman, or swim.','Keep your coin. I will row.'],
 'Agorakeeper Melia':['In the agora, everyone argues. I win.','You have the better argument.'],
 'Grovewarden Lysandra':['These olive trees are older than your game.','The grove gives you its shade.'],
 'Briar Scout Tovin':['The thorns told me you were coming.','The briar parts for you.'],
 'Galeweaver Eira':['I wove this wind myself. Mind the knots.','My threads have come loose.'],
 'Cloudkeeper Sorrel':['The clouds drift where I tell them.','Blue sky. I had forgotten it.'],
 'Cavern Seer Nyssa':['The dark shows me more than light shows you.','I did not see that.'],
 'Mirrorwalker Quill':['Which of me is real? Choose carefully.','You chose right.'],
 'Prismbinder Orlan':['One light in. Seven troubles out.','The prism is cracked.'],
 'Featherguard Aven':['Nothing lands here without my leave.','I fold my wings. I yield.'],
 'Roostkeeper Thistle':['Hush. You’ll wake the nest.','Now they’re all awake. Wonderful.'],
 'Ridgewatch Kaelis':['I saw your army three ridges ago.','I should have looked closer.'],
 'Sporekeeper Pipkin':['Breathe deep! It’s mostly harmless.','Oh. The spores have settled.'],
 'Bazaar Witch Velka':['Everything’s for sale. Even your next move.','No refunds. But you win.'],
 'Coinburrow Mott':['Shiny army. I’d like it in my burrow.','Back underground. Empty-handed.'],
 'Ashgate Sentinel':['This gate has not opened in an age.','It opens. Go through.'],
 'Cinder Marshal':['My army burned. It still obeys.','At ease. At last.'],
 'Ember Watcher':['I keep the last fire. You will not take it.','Carry it carefully.'],
 'Echo Castellan':['These halls repeat every footstep. Yours too.','The echo fades.'],
 'Broken Diadem':['I was almost a crown once.','Broken twice now.'],
 'Gallery Revenant':['Every portrait here once faced the throne.','The gallery is quiet again.'],
 'Stable Mourner':['The horses are gone. I still hear them.','Silence. Finally.'],
 'Pale Bridgekeeper':['Many have crossed. I counted none coming back.','Cross. I will keep counting.'],
 'Black Cavalier':['I ride for a king with no crown.','Unhorsed. Go on to him.'],
 'Tribute Bailiff':['The throne is owed. I collect.','Your debt is cleared. For now.'],
 'Vault Confessor':['Tell me what you want the crown for.','Keep your reasons.'],
 'Debtor Wraith':['I paid everything. It was not enough.','Nothing left to take.']
};
const CAMPAIGN_LAND_VOICE={
 street:{capture:['My block, my rules.','That one’s off the board.'],hurt:['Okay, that stung.','Lucky. Don’t get used to it.'],check:'Your King’s cornered, rookie.',win:'Crown City sends its regards.'},
 medieval:{capture:['For the Iron Kingdom!','One less on the field.'],hurt:['A fair blow.','The line holds. Barely.'],check:'Your King stands alone.',win:'The road stays closed.'},
 greek:{capture:['The gods saw that.','A worthy trophy.'],hurt:['Well struck, mortal.','I will remember that.'],check:'Your King faces judgment.',win:'The Court is not for you.'},
 fantasy:{capture:['Poof. Gone.','The realm swallows another.'],hurt:['That was not supposed to happen.','Strange. I felt that.'],check:'Your King is caught in the rift.',win:'The realm sends you back.'},
 throne:{capture:['Ash to ash.','The throne takes its share.'],hurt:['I had forgotten pain.','Still you climb.'],check:'Your King kneels early.',win:'The steps remain unclimbed.'}
};

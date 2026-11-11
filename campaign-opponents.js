'use strict';
// Fixed encounter identities; rule IDs and combat saves remain independent.
const CAMPAIGN_OPPONENTS = {
  "street": [
    [
      "Speedy Rico",
      "Brickwall Benny",
      "Double Dutch Dana"
    ],
    [
      "Fire Escape Finn",
      "Water Tank Tessa",
      "Catwalk Cruz"
    ],
    [
      "Ferryhand Mara",
      "Container Knox",
      "Dry Dock Dorian"
    ],
    [
      "Lantern Leni",
      "Neon Juno",
      "Smuggler Sable"
    ]
  ],
  "medieval": [
    [
      "Warden Osric",
      "Fordkeeper Elwen",
      "Tollguard Cedric"
    ],
    [
      "Rampart Ysella",
      "Bailey Roderic",
      "Banneret Hester"
    ],
    [
      "Meadowguard Ansel",
      "Stablemaster Fenwick",
      "Bridgewarden Maud"
    ],
    [
      "Guildsman Tavian",
      "Woolmerchant Bess",
      "Treasurer Halden"
    ]
  ],
  "greek": [
    [
      "Damon of Marathon",
      "Laurelkeeper Ione",
      "Colonnade Theron"
    ],
    [
      "Stairwarden Nereus",
      "Lionguard Myrrine",
      "Pillarwarden Evander"
    ],
    [
      "Beachguard Xanthe",
      "Shipwright Leandros",
      "Gatekeeper Phaedra"
    ],
    [
      "Ferryman Orestes",
      "Agorakeeper Melia",
      "Grovewarden Lysandra"
    ]
  ],
  "fantasy": [
    [
      "Briar Scout Tovin",
      "Galeweaver Eira",
      "Cloudkeeper Sorrel"
    ],
    [
      "Cavern Seer Nyssa",
      "Mirrorwalker Quill",
      "Prismbinder Orlan"
    ],
    [
      "Featherguard Aven",
      "Roostkeeper Thistle",
      "Ridgewatch Kaelis"
    ],
    [
      "Sporekeeper Pipkin",
      "Bazaar Witch Velka",
      "Coinburrow Mott"
    ]
  ],
  "throne": [
    [
      "Ashgate Sentinel",
      "Cinder Marshal",
      "Ember Watcher"
    ],
    [
      "Echo Castellan",
      "Broken Diadem",
      "Gallery Revenant"
    ],
    [
      "Stable Mourner",
      "Pale Bridgekeeper",
      "Black Cavalier"
    ],
    [
      "Tribute Bailiff",
      "Vault Confessor",
      "Debtor Wraith"
    ]
  ]
};
function campaignOpponentName(run,stage=run?.ante){
 if(!run||run.gauntlet||run.circuit==='ruler')return null;
 const circuit=['downtown','rooftop','harbor','midnight'].indexOf(run.circuit);
 return CAMPAIGN_OPPONENTS[run.land]?.[circuit]?.[Number(stage)-1]||null;
}

/* v191: a face for every named opponent. Drawn from a small kit of parts (head, ears, snout, eyes, markings, headwear),
   so all 60 are vector art with no image downloads. campaignOpponentFace(name) -> {svg, accent, bg} or null. */
(function(){
const INK='#141216';
const mir=s=>s+`<g transform="translate(64 0) scale(-1 1)">${s}</g>`;
const HEAD={
 round:'M32 19C44 19 52 27 52 38C52 50 43 57 32 57C21 57 12 50 12 38C12 27 20 19 32 19Z',
 wedge:'M12 27Q32 17 52 27Q52 41 40 52Q32 59 24 52Q12 41 12 27Z',
 long:'M18 25Q32 16 46 25Q48 41 40 53Q32 60 24 53Q16 41 18 25Z',
 wide:'M32 21C46 21 56 28 56 39C56 50 45 56 32 56C19 56 8 50 8 39C8 28 18 21 32 21Z'};
const EARS={
 point:f=>mir(`<path d="M14 31L11 8L29 22Z" fill="${f.fur}"/><path d="M16 25L15 14L23 21Z" fill="${f.in}" stroke="none"/>`),
 round:f=>mir(`<circle cx="15" cy="21" r="8" fill="${f.fur}"/><circle cx="15" cy="21" r="3.6" fill="${f.in}" stroke="none"/>`),
 long:f=>mir(`<path d="M20 27Q12 8 21 2Q29 9 27 24Z" fill="${f.fur}"/><path d="M21 22Q17 11 21 7Q24 12 24 21Z" fill="${f.in}" stroke="none"/>`),
 flop:f=>mir(`<path d="M17 23Q5 24 5 40Q8 47 14 43Q13 32 20 27Z" fill="${f.dark}"/>`),
 horn:f=>mir(`<path d="M20 24Q8 20 9 7Q17 10 25 21Z" fill="${f.horn}"/><path d="M15 29Q7 30 5 36Q11 38 17 34Z" fill="${f.fur}"/>`),
 tuft:f=>mir(`<path d="M17 26L13 11L27 20Z" fill="${f.fur}"/>`),

 small:f=>mir(`<path d="M15 29L14 13L27 22Z" fill="${f.fur}"/><path d="M17 24L17 17L22 21Z" fill="${f.in}" stroke="none"/>`),
 none:()=>''};
const EYES={
 sly:f=>mir(`<path d="M17 35Q23 30 29 35Q23 38 17 35Z" fill="${f.eye}" stroke-width="1.6"/><circle cx="24" cy="34.6" r="1.7" fill="${INK}" stroke="none"/><path d="M16 30L29 32" fill="none"/>`),
 round:f=>mir(`<circle cx="23" cy="35" r="4.6" fill="${f.eye}" stroke-width="1.6"/><circle cx="23.6" cy="35.4" r="2" fill="${INK}" stroke="none"/>`),
 big:f=>mir(`<circle cx="22" cy="35" r="7" fill="${f.eye}" stroke-width="1.8"/><circle cx="23" cy="35.5" r="3" fill="${INK}" stroke="none"/>`),
 tired:f=>mir(`<path d="M18 36Q23 31 28 36Z" fill="${f.eye}" stroke-width="1.6"/><circle cx="23" cy="35" r="1.5" fill="${INK}" stroke="none"/><path d="M17 33H29" fill="none"/>`),
 calm:f=>mir(`<circle cx="23" cy="35" r="2.600" fill="${INK}" stroke="none"/><circle cx="23.900" cy="34.100" r=".8" fill="#fff" stroke="none"/>`),
 glare:f=>mir(`<path d="M17 32L29 35Q25 39.500 18 37.500Z" fill="${f.eye}" stroke-width="1.6"/><circle cx="24" cy="35.800" r="1.600" fill="${INK}" stroke="none"/>`),
 hollow:f=>mir(`<path d="M17 36Q23 29 29 36Q23 40 17 36Z" fill="${INK}" stroke="none"/><circle cx="23" cy="35.5" r="1.4" fill="${f.eye}" stroke="none"/>`)};
const SNOUT={
 short:f=>`<ellipse cx="32" cy="46.5" rx="9" ry="7" fill="${f.light}" stroke="none"/><path d="M28.5 42.5H35.5L32 46.5Z" fill="${INK}" stroke-width="1.2"/><path d="M32 46.5V49M27.5 50.5Q32 53.5 36.500 50.5" fill="none" stroke-width="1.5"/>`,
 fox:f=>`<path d="M22 40Q32 36 42 40Q40 50 32 57Q24 50 22 40Z" fill="${f.light}" stroke="none"/><path d="M28.500 49H35.5L32 53.500Z" fill="${INK}" stroke-width="1.2"/>`,
 pig:f=>`<ellipse cx="32" cy="46" rx="9" ry="6.5" fill="${f.light}" stroke-width="1.6"/><ellipse cx="28.500" cy="46" rx="1.500" ry="2.300" fill="${INK}" stroke="none"/><ellipse cx="35.5" cy="46" rx="1.500" ry="2.300" fill="${INK}" stroke="none"/>`+mir(`<path d="M22 50Q19 45 21 41Q24 45 25 50Z" fill="#f2ead8" stroke-width="1.3"/>`),
 beak:f=>`<path d="M26 40Q32 37 38 40L32 53Z" fill="${f.beak}" stroke-width="1.6"/><path d="M27 43.500H37" fill="none" stroke-width="1.2"/>`,
 hook:f=>`<path d="M28 39Q32 36 36 39Q36 46 32 50Q28 46 28 39Z" fill="${f.beak}" stroke-width="1.6"/>`,
 toad:f=>`<path d="M15 45Q32 54 49 45" fill="none" stroke-width="1.8"/><circle cx="29.500" cy="41" r="1" fill="${INK}" stroke="none"/><circle cx="34.5" cy="41" r="1" fill="${INK}" stroke="none"/>`,
 long:f=>`<path d="M25 38Q32 35 39 38Q40 50 32 57Q24 50 25 38Z" fill="${f.light}" stroke="none"/><path d="M28.500 49.500Q32 47.500 35.500 49.500L32 53.500Z" fill="${INK}" stroke-width="1.2"/>`};
const MARK={
 mask:f=>`<path d="M13 31Q23 27 32 32Q41 27 51 31Q50 40 41 40Q35 39 32 36Q29 39 23 40Q14 40 13 31Z" fill="${f.dark}" stroke="none"/>`,
 blaze:f=>`<path d="M29 21Q32 19.500 35 21L34 38H30Z" fill="${f.light}" stroke="none"/>`,
 cheeks:f=>mir(`<path d="M12 33Q13 44 24 52Q22 42 16 35Z" fill="${f.light}" stroke="none"/>`),
 disc:f=>mir(`<circle cx="22" cy="35" r="10" fill="${f.light}" stroke="none"/>`),
 warts:f=>`<circle cx="18" cy="43" r="1.500" fill="${f.dark}" stroke="none"/><circle cx="46" cy="42" r="1.800" fill="${f.dark}" stroke="none"/><circle cx="42" cy="27" r="1.400" fill="${f.dark}" stroke="none"/>`,
 crack:f=>`<path d="M40 21L37 28L41 32L38 39" fill="none" stroke-width="1.4"/>`,
 none:()=>''};
const WEAR={
 cap:c=>`<path d="M13 27Q14 10 32 10Q50 10 51 27Q32 21 13 27Z" fill="${c.a}"/><path d="M12 27Q32 20 52 27Q58 28 61 32Q46 27 12 31Z" fill="${c.b}"/>`,
 beanie:c=>`<path d="M13 28Q13 8 32 8Q51 8 51 28Z" fill="${c.a}"/><path d="M11 24H53V31H11Z" fill="${c.b}"/><circle cx="32" cy="7" r="3.500" fill="${c.b}"/>`,
 hood:c=>`<path d="M32 3Q58 6 57 40Q56 54 48 60H52Q62 48 61 34Q60 4 32 1Q4 4 3 34Q2 48 12 60H16Q8 54 7 40Q6 6 32 3Z" fill="${c.a}"/>`,
 helm:c=>`<path d="M11 28Q10 8 32 7Q54 8 53 28H35.500V41H28.500V28Z" fill="${c.a}"/><path d="M11 23.500H53" fill="none"/><path d="M32 8V2" stroke-width="3" fill="none"/>`,
 coif:c=>`<path d="M32 13Q54 14 54 38Q54 54 44 60H50Q60 50 58 34Q56 10 32 8Q8 10 6 34Q4 50 14 60H20Q10 54 10 38Q10 14 32 13Z" fill="${c.a}"/>`,
 laurel:c=>mir(`<path d="M30 14Q22 9 14 15Q22 18 30 14Z" fill="${c.a}" stroke-width="1.4"/><path d="M17 17Q10 19 8 27Q15 25 17 17Z" fill="${c.a}" stroke-width="1.4"/><path d="M11 28Q7 33 9 40Q13 35 11 28Z" fill="${c.a}" stroke-width="1.4"/>`),
 crest:c=>`<path d="M14 30Q12 12 32 11Q52 12 50 30L44 26H20Z" fill="${c.b}"/><path d="M22 12Q32 -4 46 6Q36 6 32 12Z" fill="${c.a}"/>`,
 witch:c=>`<path d="M17 24L36 0L42 9L39 7L47 24Z" fill="${c.a}"/><path d="M5 26Q32 16 59 26Q32 31 5 26Z" fill="${c.a}"/><path d="M20 21Q32 18 45 21" fill="none" stroke="${c.b}" stroke-width="2.600"/>`,
 circlet:c=>`<path d="M13 25Q32 17 51 25" fill="none" stroke="${c.a}" stroke-width="3.400"/><path d="M32 16L35 21L32 26L29 21Z" fill="${c.b}" stroke-width="1.2"/>`,
 crown:c=>`<path d="M15 23L13 9L22 16L27 6L32 15L35 9L37 17L44 12L41 17L50 10L49 23Q32 18 15 23Z" fill="${c.a}"/><path d="M37 17L39 21L36 23" fill="none" stroke-width="1.3"/>`,
 bandana:c=>`<path d="M12 30Q13 13 32 13Q51 13 52 30Q32 22 12 30Z" fill="${c.b}"/><path d="M51 26L61 22L58 29L62 34L52 30Z" fill="${c.b}"/><circle cx="24" cy="20" r="1.300" fill="${c.a}" stroke="none"/><circle cx="33" cy="17.500" r="1.300" fill="${c.a}" stroke="none"/><circle cx="41" cy="20.500" r="1.300" fill="${c.a}" stroke="none"/>`,
 shades:c=>`<path d="M14 31H50V35Q48 40 42 40Q36 40 34.500 34H29.500Q28 40 22 40Q16 40 14 35Z" fill="${c.a}"/><path d="M18 33L23 33" stroke="${c.b}" stroke-width="1.500" fill="none"/>`,
 phones:c=>`<path d="M10 36Q8 9 32 9Q56 9 54 36" fill="none" stroke="${INK}" stroke-width="6.500"/><path d="M10 36Q8 9 32 9Q56 9 54 36" fill="none" stroke="${c.a}" stroke-width="3"/>`+mir(`<path d="M6 31H14V45H6Z" fill="${c.b}"/>`),
 feather:c=>`<path d="M11 27Q14 11 32 12Q50 11 53 27Q32 21 11 27Z" fill="${c.a}"/><path d="M9 28Q32 20 55 28L57 31Q32 25 7 31Z" fill="${c.a}"/><path d="M44 17Q46 4 57 2Q56 12 48 19Z" fill="${c.b}" stroke-width="1.4"/>`,
 band:c=>`<path d="M12 28Q32 19 52 28L52 32.500Q32 24 12 32.500Z" fill="${c.b}"/>`,
 leaf:c=>`<path d="M32 21Q24 12 31 3Q40 10 32 21Z" fill="${c.a}" stroke-width="1.5"/><path d="M30 21Q18 20 15 11Q26 10 30 21Z" fill="${c.a}" stroke-width="1.5"/><path d="M34 21Q46 20 49 11Q38 10 34 21Z" fill="${c.a}" stroke-width="1.5"/>`,
 shroom:c=>`<path d="M9 26Q10 5 32 5Q54 5 55 26Q32 20 9 26Z" fill="${c.b}"/><circle cx="22" cy="14" r="3" fill="#f6efe0" stroke="none"/><circle cx="36" cy="10.500" r="2.400" fill="#f6efe0" stroke="none"/><circle cx="45" cy="18" r="2.600" fill="#f6efe0" stroke="none"/>`,
 none:()=>''};

// species presets: head, ears, snout, default colours and markings
const SPEC={
 hare:{head:'long',ears:'long',snout:'long',fur:'#b9a78f',light:'#f3ead9',in:'#e9a7a7'},
 cat:{head:'round',ears:'small',snout:'short',fur:'#e0a45c',light:'#f7ecd8',in:'#eab0a0'},
 lynx:{head:'round',ears:'tuft',snout:'short',fur:'#c9a877',light:'#f6eedc',mark:'cheeks'},
 bear:{head:'wide',ears:'round',snout:'short',fur:'#7a5340',light:'#d9b592',in:'#5a3a2c'},
 boar:{head:'wide',ears:'small',snout:'pig',fur:'#8a5a44',light:'#c98f78',in:'#6a4031'},
 raccoon:{head:'wedge',ears:'round',snout:'short',fur:'#9a9aa2',light:'#eeeae2',dark:'#2c2a31',in:'#5b5a62',mark:'mask'},
 otter:{head:'round',ears:'round',snout:'short',fur:'#8b6548',light:'#e8d6bb',in:'#6b4a35'},
 hound:{head:'long',ears:'flop',snout:'long',fur:'#c69762',light:'#f5ead6',dark:'#6e4a2e'},
 rat:{head:'long',ears:'round',snout:'long',fur:'#8f8a8c',light:'#e9dfd6',in:'#e2a3a8'},
 mouse:{head:'round',ears:'round',snout:'short',fur:'#b7a48f',light:'#f5ecdf',in:'#eeb1b1'},
 badger:{head:'wedge',ears:'round',snout:'long',fur:'#3a383f',light:'#f1ece2',in:'#232228',mark:'blaze'},
 wolf:{head:'wedge',ears:'point',snout:'long',fur:'#8b8f9a',light:'#eef0f2',in:'#d9a9a9',mark:'cheeks'},
 fox:{head:'wedge',ears:'point',snout:'fox',fur:'#d9692e',light:'#f6ecdc',in:'#3a2a24',mark:'cheeks'},
 ram:{head:'wide',ears:'horn',snout:'short',fur:'#e9e2d3',light:'#f8f3ea',horn:'#b89868'},
 goat:{head:'long',ears:'horn',snout:'long',fur:'#b9b2a6',light:'#f4efe6',horn:'#8a7a62',mark:'blaze'},
 doe:{head:'long',ears:'horn',snout:'long',fur:'#c99866',light:'#f6ecd8',horn:'#efe6cf',mark:'blaze'},
 owl:{head:'round',ears:'tuft',snout:'hook',fur:'#9a7b57',light:'#efe2c8',mark:'disc'},
 hawk:{head:'wedge',ears:'none',snout:'hook',fur:'#a8763f',light:'#f2e6cf',mark:'cheeks'},
 crow:{head:'wedge',ears:'none',snout:'beak',fur:'#33313b',light:'#4a4856',beak:'#8a8794'},
 toad:{head:'wide',ears:'none',snout:'toad',fur:'#6fae7a',light:'#b9e0a8',dark:'#3f7a55',mark:'warts'}};
const LANDC={street:{accent:'#ff3d9a',bg:'#17141b',wa:'#1f1d24'},medieval:{accent:'#e8742a',bg:'#1a1512',wa:'#8d939c'},greek:{accent:'#e2c170',bg:'#141a26',wa:'#6fae5b'},fantasy:{accent:'#b18cff',bg:'#17122a',wa:'#3a2a63'},throne:{accent:'#e0263f',bg:'#120c0e',wa:'#7d7870'}};
// name: [species, eyes, headwear, fur override, headwear colour override]
const FACES={
 street:{'Speedy Rico':['hare','sly','cap'],'Brickwall Benny':['bear','tired','beanie'],'Double Dutch Dana':['cat','round','band'],
  'Fire Escape Finn':['raccoon','sly','hood'],'Water Tank Tessa':['otter','calm','bandana'],'Catwalk Cruz':['cat','calm','shades','#3b3840'],
  'Ferryhand Mara':['hound','calm','beanie'],'Container Knox':['boar','glare','cap'],'Dry Dock Dorian':['rat','tired','beanie',null,'#3d5a6b'],
  'Lantern Leni':['mouse','round','hood'],'Neon Juno':['lynx','sly','phones'],'Smuggler Sable':['badger','glare','bandana']},
 medieval:{'Warden Osric':['boar','tired','helm'],'Fordkeeper Elwen':['otter','calm','coif'],'Tollguard Cedric':['hound','glare','helm'],
  'Rampart Ysella':['wolf','glare','helm'],'Bailey Roderic':['bear','calm','coif'],'Banneret Hester':['hare','round','feather',null,'#7a2a2a'],
  'Meadowguard Ansel':['ram','calm','band'],'Stablemaster Fenwick':['goat','tired','feather',null,'#5a4a32'],'Bridgewarden Maud':['badger','calm','coif'],
  'Guildsman Tavian':['fox','sly','feather',null,'#2f4a3a'],'Woolmerchant Bess':['ram','round','circlet','#f3ece0'],'Treasurer Halden':['rat','sly','circlet']},
 greek:{'Damon of Marathon':['hare','glare','band'],'Laurelkeeper Ione':['doe','round','laurel'],'Colonnade Theron':['bear','calm','laurel','#a9825e'],
  'Stairwarden Nereus':['goat','tired','crest'],'Lionguard Myrrine':['lynx','glare','crest'],'Pillarwarden Evander':['ram','calm','crest'],
  'Beachguard Xanthe':['otter','round','band'],'Shipwright Leandros':['hound','calm','laurel'],'Gatekeeper Phaedra':['wolf','sly','crest','#b9a58a'],
  'Ferryman Orestes':['crow','tired','hood','#5d6384','#3a4670'],'Agorakeeper Melia':['mouse','calm','laurel'],'Grovewarden Lysandra':['fox','round','laurel']},
 fantasy:{'Briar Scout Tovin':['hare','sly','leaf','#a9b98f'],'Galeweaver Eira':['owl','big','circlet','#c9d3e6'],'Cloudkeeper Sorrel':['ram','calm','circlet','#e4e6f4'],
  'Cavern Seer Nyssa':['cat','big','hood','#6d6590'],'Mirrorwalker Quill':['lynx','calm','circlet','#b9c3d6'],'Prismbinder Orlan':['goat','sly','witch','#a99fc6'],
  'Featherguard Aven':['hawk','glare','crest',null,'#b18cff'],'Roostkeeper Thistle':['rat','round','leaf','#a08f7c'],'Ridgewatch Kaelis':['wolf','glare','hood','#6f7693'],
  'Sporekeeper Pipkin':['mouse','round','shroom'],'Bazaar Witch Velka':['toad','big','witch'],'Coinburrow Mott':['badger','tired','circlet']},
 throne:{'Ashgate Sentinel':['wolf','hollow','helm'],'Cinder Marshal':['boar','hollow','crest'],'Ember Watcher':['owl','hollow','hood'],
  'Echo Castellan':['hound','hollow','coif'],'Broken Diadem':['crow','hollow','crown'],'Gallery Revenant':['cat','hollow','hood'],
  'Stable Mourner':['goat','hollow','hood'],'Pale Bridgekeeper':['hare','hollow','coif','#c9c5c6'],'Black Cavalier':['wolf','hollow','crest','#2b2a30'],
  'Tribute Bailiff':['rat','hollow','feather'],'Vault Confessor':['bear','hollow','hood'],'Debtor Wraith':['fox','hollow','none','#77737a']}};
const ASH={fur:'#6d6a70',light:'#9a969c',in:'#4a474d',dark:'#3a373c',horn:'#8f8a80',beak:'#3a373c',eye:'#e0263f'};
function draw(s){
  const f={fur:s.fur,light:s.light||'#f1e7d3',in:s.in||s.light||'#e9b7a6',dark:s.dark||INK,eye:s.eye||'#ffd95a',beak:s.beak||'#e9a13b',horn:s.horn||'#e8dfc8'};
  const c={a:s.wa,b:s.wb}, under=s.wear==='hood'||s.wear==='coif';
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke="${INK}" stroke-width="2.200" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">`
   +(under?WEAR[s.wear](c):'')+EARS[s.ears||'none'](f)+`<path d="${HEAD[s.head]}" fill="${f.fur}"/>`
   +MARK[s.mark||'none'](f)+(s.mark2?MARK[s.mark2](f):'')+SNOUT[s.snout](f)+EYES[s.eyes](f)+(!under?WEAR[s.wear||'none'](c):'')+`</svg>`;
}
function spec(name){
  for(const land in FACES){const r=FACES[land][name]; if(!r) continue;
    const L=LANDC[land], s={...SPEC[r[0]],...(land==='throne'?ASH:{}),eyes:r[1],wear:r[2],accent:L.accent,bg:L.bg,wa:L.wa,wb:L.accent};
    if(r[3]){s.fur=r[3]; if(land==='throne')s.light=r[3]==='#2b2a30'?'#4a4850':'#e2dfe0';}
    if(r[4]){ if(['feather','hood','beanie'].includes(r[2])) s.wa=r[4]; else s.wb=r[4]; }
    if(land==='throne'&&name==='Broken Diadem')s.mark2='crack'; if(land==='throne'&&name==='Debtor Wraith')s.mark2='crack';
    return s;}
  return null;
}
const cache={};
function campaignOpponentFace(name){ if(!(name in cache)){const s=spec(name); cache[name]=s?{svg:draw(s),accent:s.accent,bg:s.bg}:null;} return cache[name]; }
globalThis.campaignOpponentFace=campaignOpponentFace; globalThis.CAMPAIGN_FACES=FACES;
})();

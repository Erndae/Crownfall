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

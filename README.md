# Crownfall

A street-style chess roguelike. Capture pieces to score Material × Brilliance, checkmate Champions, and build your army with Relics, Grandmaster cards and special powers.

Play it: https://erndae.github.io/Crownfall/



## v158 — beta designs in main

Crown-shaped initiative die marks, animal ruler portraits (fox, lion, owl, raven and stag), distinct Campaign opponent identities with beta dialogue, customizable piece designs, and Crown City's weathered stone board and illustrated background. Main Campaign/Gauntlet save namespaces, combat rules, initiative results and the twelve-track soundtrack remain in place. The Journey travel system stays in beta.

Run `node validate-main-design.mjs` and `node validate-character.mjs` for opponent identities, dialogue, syntax and player-only customization checks.

## v160 — carved pieces and clearer dock encounters

Knights capture normally in every mode, including older saves. The retired capture restriction and its instructions are removed. Dockmaster Dee’s new battles have visible marked crate traps: landing on one costs up to $2, clears it once, and leaves the piece intact. The Crown City story message now explains the challenge to Vex. The Sculpted collection uses carved chess silhouettes, gold and plum shading, and layered bases; the Crown City victory screen shows the complete crown artwork without the pink striped frame.

Run `node validate-gameplay-v160.mjs` for legacy-rule compatibility, Knight captures, crate placement, one-time effects and saved trap state.

## v161 — approved Comic ink pieces

The default piece collection now uses the approved Comic ink style: classic chess shapes, thick dark contours, flat gold and purple colors, sharp cel shadows and graphic highlights. Existing Sculpted selections pick up the new rendering automatically. Army colors, sizes, alternate silhouettes, King details and player-only customization remain available.

## v162 — restore the readable original pieces

The original flat piece silhouettes, rounded bases, bold team outlines and initiative light/dark colors are restored. Existing Sculpted/Comic ink profiles move back to Original while retaining names, colors, sizes and other cosmetic choices. Alternate sets remain available for an explicit later selection. Store scroll retention, music, dialogue, capture-rule removal and dock crates remain intact.

## v163 — clearer decisions and distinct encounters

- The battle goal bar states checkmate or the score target, switches to the correct final-phase objective, and explains winning-capture survival when tapped.
- Move confirmation is on by default: choose a destination to inspect estimated points, current attacks and crate/tax costs; press Move or tap the destination again to commit. Disable confirmation from the goal panel for quick moves. Previews and Cancel never spend a move or change the board.
- All 80 circuit encounter profiles now use the formations and styles named by their tactical plans. Opening cards and encounter details explain the formation actually accepted by the opening-safety checks.
- Training shows Material, Brilliance and base capture scores before/after, with purchase feedback. Sold offers become compact receipts; scrolling anchors to a visible item while the store refreshes.
- Harbor Stages 2–4 can have marked, one-use crates. Player entry costs up to $2; enemy entry recovers $2 for the player. The briefing explains both outcomes and no piece disappears.
- First training costs $8; the Lv.1–6 price sequence is $8/$14/$24/$36/$52. Savings pay $1 per $5 held, capped at $5 ($6 in Midnight Market). This brings the cap into line with its advertised ability and reduces cash snowballing. See BALANCE-AUDIT.md for the 255-scenario arithmetic audit and its limits.
- Defeat panels explain the outcome and focus the replay on the last relevant exchange, while preserving life-loss/checkpoint retries. Crown Match uses the same review; the Gauntlet ending includes a final-position review.

Validation: `node validate-gameplay-polish.mjs`, `node audit-balance.mjs`, and the existing `validate-main-design.mjs`, `validate-character.mjs` and `validate-gameplay-v160.mjs` scripts. UI integration uses `validate-polish-integration.mjs`; install `happy-dom` as a development-only dependency to run it. Its deterministic positions exercise real legality, scoring and UI handlers while animation, sound and the enemy reply are stubbed. It also checks 10 real cross-land opening deployments.

## v164 — compact move confirmation

A tentative move now appears directly on the board. The existing info row provides a compact cancel (✕) and confirm (✓) pair with 44px touch targets. Only the confirm button commits the move; repeated destination taps keep it pending. Cancel restores the original position without changing points, money or move counts. The row stays at its measured idle height, keeps labels on one line, and does not reduce or shift the board. Confirmation remains optional in the goal panel.

Validation includes real-handler checks for tentative rendering, explicit confirmation, cancellation, stale positions and the quick-move preference.

Browser layout checks at 320×568, 390×844, 430×932 and 768×1024 verify unchanged board dimensions and position, no horizontal overflow, and fully visible 44px confirm/cancel buttons.

## v165 — stable piece information and bottom controls

Idle, player-piece, enemy-piece, King and confirmation views now share a fixed 58px info row. Names, scoring and enhancement badges fit within three compact lines, and the Command button remains fully visible. Selection no longer takes space from the board. Bottom actions retain their height, with room for their shadows above the screen edge.

Browser checks cover every piece type on both sides, with and without multiple enhancements, at 320×568, 390×844, 430×932 and 768×1024. They verify unchanged board dimensions/position, vertically contained piece details, bottom controls and working confirm/cancel.

## v166 — environments for every Campaign land

Iron Kingdom battles now stand against the torchlit fortress, Olympian Court against its temples and waterfalls, Shattered Realm against its floating ruins, and Fallen Throne against its ruined citadel. Each uses its own existing land illustration beneath a light readability shade. The old flat circuit scenery is hidden during these battles; Crown City retains its illustrated street environment. Fixed background layers preserve board dimensions, selection controls and bottom actions. All five environment images remain available in the offline cache.

## v167 — optional move confirmation in the pause menu

Confirm Move is now an accessible On/Off switch in the Campaign, Gauntlet and Crown Match pause menus. It defaults to Off unless the player has explicitly enabled it, and remembers their choice on this device. Turning it off cancels any tentative move without spending a turn. The objective panel focuses on battle rules.


## v170 — reliable return from fights

Returning to title clears old fight dialogs, replay controls/timers, input-swallow state, and battle presentation. Delayed board messages and reward panels are scoped to their originating battle view so they cannot cover a later menu or fight. Save-and-title waits for an active move to finish, while allowing paused initiative and interrupted replies to remain saved for Continue. The shop also clears board replay state. Saved board, rewards and campaign progression retain the same schema.

Validation: `node validate-menu-transitions.mjs` (requires happy-dom, or set `CROWNFALL_DOM_MODULE`). Covers blocked title from nested enemy-recovery/pause dialogs, active-move exit, pending initiative exit, leftover overlays, delayed speech, replay cleanup, repeated defeat exits, Campaign rewards/shop and stale Gauntlet rewards. Existing polish integration, design, character, gameplay and splash checks pass. Browser check covers Campaign setup, defeat, return to title and opening Records afterward. Exact mobile viewport testing was unavailable in this environment.


## v177 — targets keep pace with the army

Campaign score targets were falling behind by the end of Crown City. Four changes, all in the target formula:

- Training is read from the two best-trained piece types (never less than the old five-type average), so an army that trains only Rooks and Knights no longer counts as 40% built.
- From Circuit 3 each Stage adds a further 3%, so Harbor and Midnight climb about 6% per Stage instead of 3%. The Ruler's floor follows.
- Scoring Relics and powers raise the target: multiplier Relic +10%, Brilliance Relic +5%, Material Relic +3% (at most +40%); Crystal +4%, Iron / Royal / Sharpened +2%, Blazing / Ascendant +1% per piece (at most +20%). Money, move, swap and defensive Relics and powers add nothing.
- A move-limited boss never asks for less than 60% of the same Stage's Warm-up Game, and never more than the army can score inside the limit.

A new army's first circuit is unchanged. A fight already shown keeps its saved target. Scoring, prices, Training, Relics, the Gauntlet and Crown Match are untouched; the save format is the same. These numbers come from simulation, not a measured playtest.

Validation: `node validate-v177.cjs` and `node audit-balance.mjs`.


## v178 — every opponent has a voice

The 60 named Campaign opponents used 13 shared lines chosen by formation, so a Crown City street player could open with a cavalry line. Each one now opens and concedes with a line of their own, and capture, hurt, check and win reactions follow the Land (Crown City, Iron Kingdom, Olympian Court, Shattered Realm, Fallen Throne). The formation lines remain as the fallback. Circuit bosses, Rulers, the Gauntlet and Crown Match keep their existing dialogue. Presentation only: no rule, target or save reads these lines.

Validation: `node validate-v178.mjs`.


## v179 — lighter install and repo cleanup

The offline cache no longer downloads `legacy.html` or the five portraits only that page uses (about 2.1 MB less on first install); they still load normally online. Five files nothing referenced are removed: `icon-192.png`, `icon-512.png`, `favicon-32.png`, `apple-touch-icon.png` (byte-for-byte copies of the `cf-` icons) and `icon.svg`. No gameplay, save or art change. `legacy.html` and the root music and portraits it uses are kept.

Earlier builds not listed above: v172 step-by-step capture combos; v173 capture bonus previews and run records; v174 campaign continuation between circuits; v175 stores stay available across transitions; v176 scoring defense and late-campaign guard encounters (v171's Downtown Blitz encounters were reverted).


## v180 — Legacy Campaign retired

`legacy.html` (the original 245-battle game, v150) and the title-screen link to it are removed, along with the files only it used: seven root music tracks and six old portraits. The repository drops from about 33 MB to about 20 MB. The current Campaign, the Gauntlet, Crown Match, the twelve-track soundtrack in `soundtrack/` and all current saves are unchanged. Old Legacy saves stay on the device but are no longer playable.


## v181 — the ending carries into the next campaign

When the Crown of Crowns is claimed, the winning King's name and soldiers' names are remembered on the device. In a later campaign, the Crownless King speaks of them, and tapping his pieces shows those names ("Ike · Enemy Rook", "Enemy King · once <name>"). Each enemy piece keeps the name it is first given through captures, promotions and reloads.

Presentation only: his army, rules, AI, targets and the save format are unchanged. Nothing appears until an ending has been earned on the device, and never in the campaign that earned it, so the twist cannot be revealed early. Names are reduced to letters, digits, spaces and simple punctuation. The record is local and is not part of cloud saves.

Validation: `node validate-v181.cjs`.


## v182 — poster title screen

The title screen opens on the painted city with a larger logo and the game's motto, "Everybody wants a crown." The panel is clear behind them and fades in below. Campaign is one large crimson button (Continue Campaign when a save exists, with New Campaign beneath it); the Campaign heading remains for screen readers. Journey, Achievements, How to play and Customize share a 2 × 2 grid, and the Gauntlet card is more compact. Title screen only: no rule, save or other screen changes. Checked at 320, 390 × 664 and 390 × 844 with no horizontal overflow.


## v183 — title screen fixes for every Land

v182 was only correct while the current Land was Crown City. In the other four Lands the motto took the Land's wide display font and was cut off, and the Land's own backdrop replaced the city. The title now paints the city on its own fixed layer in every Land (also more reliable on iOS than a fixed body background), the motto keeps the condensed face, and small phones get tighter secondary buttons. Checked in all five Lands at 390 px and in the Fallen Throne at 320 and 430 px.


## v184 — one message at a time, and readable small print

- The first fight no longer stacks messages. The opponent card shows alone; the tutorial card and the formation tip each wait for the card, the initiative roll and each other. Measured on a new campaign: overlapping messages went from 7–9 half-second ticks to 0.
- Battle and menu labels that were 8 to 9.5px are now 10px: board coordinates, Material and Brilliance captions, Score, card and Relic captions, and (in Crown City's condensed face) the Swaps / Tactic / Cash captions and the opponent role tag. The en passant tag is 9px. Each label keeps its original line box.
- Left alone on purpose: the opponent's rule chips (a long chip wraps at 10px) and the stat captions in the four Lands that use the wide display face (they wrap at 10px and are already legible).

Layout was compared before and after with identical seeded battles in all five Lands at 390×844, 390×664 and 320×568: 15 scenarios, 0 position or size differences in the HUD, board, info row or action row.


## v185 — cover tokens you can read, and wagers that change

- **Tokens.** On the stage and store screens a token now carries only its symbol; its name sits underneath on up to two lines, so "Tower Block" and "Switch-Up" are no longer cut off or squeezed inside the shape. The value tag moves to the top right. Every Land's token shape gets the same layout; fights keep the compact symbol-only row. (v184 had made this worse by enlarging the name inside the token; that rule is removed.)
- **Wagers.** A wager used to offer the Blitzer or the Strategist every time. It now draws one tempo Challenge (Blitzer, Hustler or the new One-Two: 2 captures in a row) and one steady Challenge (Strategist, or the new King's Hand: capture with your King, or Front Line: 2 captures with Pawns). Nine pairings, never the same pair twice running; the pair is saved with the pending event. Front Line needs at least 2 Pawns; the Gauntlet never gets a move-limited one. The three new Challenges are wager-only: they are never sold, gifted or dealt as cards, and completing one also gives +1 Tactic.

Battle layout re-checked in all five Lands at three sizes (15 scenarios, 0 differences). Validation: `node validate-v185.cjs`.


## v186 — arrival banner you can read

The Circuit arrival banner sat on a 62% scrim, so its lines collided with the stage screen behind it. The screen behind is now fully covered (and blurred where the browser supports it), the text block has more room, and the Circuit's skyline sits under the text instead of behind it. The new-recruit introduction, which used the same scrim, is darkened the same way. Checked in all five Lands at 390×844, 390×664 and 320×568: text and artwork never overlap and always fit the screen. No timing, rule or save change.


## v187 — a shorter stage screen and small polish

- **Stage screen.** The opponent card is a full-width two-column ticket (who, on the left; the score to beat and the reward, on the right) instead of a tall centred stack. The progress caption that repeated the header is hidden (it stays in the group's accessible name). Store and Training share one row; their longer descriptions stay as accessible labels. The page is about 185px shorter at 390px wide, so Store, Training and the piece levels sit on the first screen. "Tap for rules" is now "Rules"; the whole card still opens the rules.
- **Journey.** An unearned World Crown is a compact row with a crown mark in the Land's colour instead of a large blank box. The crown's own artwork stays hidden until it is earned.
- **Small phones.** On "Meet your army" quotes are no longer cut off and the personality line stays on one line; a rule chip wider than the opponent panel ends in an ellipsis instead of being cut mid-letter.

Checked: stage screen in all five Lands, Stage and Ruler variants, at 390x844, 390x664 and 320x568 (24 scenarios, no clipped text, no sideways overflow, card aligned with the buttons); battle layout unchanged (15 scenarios, 0 differences).


## v188 — iPhone home-screen app: content starts below the status-bar blur

In the installed (home-screen) app, iOS dims and blurs a band under the status bar on top of the page. It reaches below the notch's safe area, so the top of every screen sat inside it; in a fight that was the opponent panel and the Swaps / Tactic / Cash tiles. In the installed app on iOS only (`display-mode: standalone` and an iOS-only `@supports` test), the page now starts 44px lower, top messages and dialogs move with it, and the page height is `100dvh` so the room is taken from the unused strip at the bottom of the screen rather than from the board. Browsers and other devices are unchanged.

This effect is drawn by iOS, not by the page, so it could not be reproduced in a desktop browser. The layout was checked by forcing the rule on with a simulated 59px notch at 393x852, 402x874 and 375x667: the action row stays in place and nothing scrolls. The 44px figure is an estimate from a device screenshot and may need one adjustment.


## v189 — a lighter page and an update notice

- **Lighter page.** `index.html` drops from 1.69 MB to 1.23 MB. Eight CSS rules carried nine embedded board textures (surfaces: asphalt, timber, marble, crystal; frames: paint, ironwood, marble, rift) for `data-bsurface` and `data-bframe` values that no Land theme sets any more, so they were downloaded on every load and never drawn. The rules are removed. The board was compared pixel for pixel before and after in all five Lands and both Ruler fights: identical.
- **Update notice.** After an update the title screen says "Updated to vN" once. The last build seen is remembered on the device; a first visit says nothing, so the first notice appears with the update after this one.
- **Tests.** `validate-v168.mjs` is a one-time comparison that needs a v167 copy of `index.html`; without `CROWNFALL_BASELINE` it now reports SKIP instead of failing.

Not done: vibration on captures. Browsers on iPhone do not support it, so it would only reach Android players.

## v190 — the true ending, and an army that starts to notice

- **A second ending.** A Bearer who has already seen the ending is asked at the throne: *Take the crown* or *Break the crown*. Taking it plays the ending as before. Breaking it plays a new one: the crown shatters, the Crownless King remembers the name he had, the armies lay down their arms, and Crown City wakes to someone setting up a board just to play. The first time through there is no choice, so the original twist lands first. The question survives a refresh, and so does the new ending.
- **Who the King was.** Each claim of the throne now also keeps the king it replaced, so the true ending can name him. Breaking the crown clears the remembered army: nobody is left standing on the throne's side.
- **Soldiers notice.** After each World Crown, the longest-serving named soldier says one line about what feels wrong, in a bold, wary or warm voice that follows their personality. Twelve lines, hints only.
- **Fix: the remembered army (v181) never recorded in real play.** It was saved after the run had already been cleared, so the final fight in a later campaign never named anyone. It is now saved at the moment of victory. Campaigns finished before this update were not recorded.
- Short phones: the crown art steps back when the Crowns and the soldier speak, so the words fit.

## v191 — a face for every opponent

- **60 faces.** Each named Campaign opponent now has their own face in the battle speech bubble, the win and loss quotes, and the intro card before the fight. They are animal people like the Rulers: Crown City wears caps, beanies and hoods; the Iron Kingdom helms and coifs; Olympus laurels and crests; the Shattered Realm witch hats and circlets. Everyone in the Fallen Throne is ashen with hollow red eyes.
- No land uses its own Ruler's species, and no two opponents share a face.
- The faces are drawn in code from a small kit of parts inside `campaign-opponents.js`, so there are no new image downloads. Rulers keep their painted portraits; Circuit Bosses and Crown Match opponents keep the chess-piece badge for now.

## v192 — faces for the Circuit Bosses and everyone else

- **Circuit Bosses.** All 20 (Rush Hour Rex, Heracles, Goblin King Grubnik, The Hollow Crown and the rest) have their own face, with a gold ring so a boss reads as a boss.
- **The Ruler's Road and Crown Match.** The 27 remaining rule-named opponents (Big Boss Mack, The High King, Kronos, The Dragon Hoarder, The Fallen Grandmaster and the rest) have faces too. Every named opponent in the game is now drawn; only the five Rulers keep their painted portraits. 107 faces, no two alike.
- New parts for them: a lion and its mane, and a whole gold crown for the kings.

## v193 — the opponent's face on the stage ticket

- The "Up next" ticket on the stage screen now shows the opponent's face beside their name, with the gold ring for Circuit Bosses. Rulers are unchanged.
- The ticket is the same height in most cases and up to 34px taller where a long name now wraps beside the face. The face is smaller on 320px-wide phones.

## v194 — the Land's picture is visible again

- Behind the stage and store screens, each Land's picture was drawn at 13% under a heavy shade and read as nearly black. It now shows clearly at the top of the screen and fades into the dark behind the cards, in the Iron Kingdom, the Olympian Court, the Shattered Realm and the Fallen Throne, on every stage. Crown City has its own backdrop and is unchanged.

## v195 — Green Lights, the Downtown Blitz encounter

- Downtown fights that have a move limit now mark two green lights on the board, three at the Circuit Boss, in every Land.
- Move one of your pieces onto a light and you get 1 move back on the Blitz clock. If an enemy piece lands there first, you lose 1 move instead, but never your last one. Each light works once and no piece is removed.
- Lights sit on open squares of the fifth and sixth ranks, spread across the board, never where a first pawn move reaches.
- The opponent's intro, the stage ticket, the move preview and the fight rules all explain them. Lights are saved with the battle; fights saved before this update have none.

## v196 — Crown Command retired

- **Crown Command is gone.** It went unused: almost every ability only reached pieces beside the King, and it never recharged. The Command button, the ability choice after each World Crown and its tutorial are removed.
- **World Crowns now start your fights with Tactics ready:** 1 Tactic from your first World Crown, 2 from your third. Nothing to tap or choose. Crown City and Crown Match are unchanged.
- The land-conquered screen and the King's panel say what your Crowns give you. The guide has a short "World Crowns" section in place of the two Command sections.
- Campaigns that had already chosen abilities, and fights saved mid-battle with Command charges, load normally; the charges are simply no longer offered. The ability code is still in the file, switched off, and can be deleted in a later cleanup.
- Fix (since v190): on phones shorter than about 840px the land-conquered screen could push "See my crowns" off the bottom once the soldier's line was added. The crown art now steps back when the buttons arrive.

## v197 — the road between Lands

- **A short story between Lands.** The first time you reach a newly opened Land, a passage tells how you got there: four lines over the Land you are leaving, which fades into the one ahead, then "Enter The Iron Kingdom". The Crowns pull you on like a compass, each road further in. Hints only.
- Four passages: Crown City to the Iron Kingdom, on to the Olympian Court, to the Shattered Realm, and the climb to the Fallen Throne.
- Shown once per campaign, however you arrive (the Continue button, the Lands screen or reopening the game). Tap moves to the next line. A Land you are already playing is not re-introduced. Reduced motion shows all four lines at once.

## v198 — the story inside each Land

- **A story beat after every circuit.** The circuit-cleared screen now adds one or two sentences each time you conquer a circuit for the first time. They follow how many of the Land's circuits are yours (you can win them in any order) and build toward its Ruler, who arrives on the fourth: Vex's black car at the curb, Aldric seated with his sword, Athena waiting on your move, Morwen walking beside you. The Fallen Throne's beats hint and never name what sits there.
- Twenty beats, four per Land. Replaying a cleared circuit, or a Land you already hold, shows none.
- On short phones the art shrinks and the reminder line steps aside so the button stays on screen.

## v199 — Board key: reminders for the marks on the board

- **Tap a mark.** Tapping an empty marked square (a green light, a crate trap, your own hidden trap) shows what it does. Moving onto it still works the same: select a piece first and it is a move.
- **Board key button.** When a fight has marks, the info bar under the board reads "Tap a piece or a mark to see what it does" and shows a **Board key** button listing every mark in that fight with its picture, how many are left and what it does: green lights, crate traps, marked defenders, your trap and Armor.
- **Marked and Armored enemies.** Tapping one now says so in the info bar.
- Fights with no marks look exactly as before. Rules are unchanged.

## v200 — every circuit has its own encounter

- **Rooftop Kings: Vantage points.** From stage 2, two squares are marked on your side of the board, three at the Circuit Boss. Only your **King** can claim one: step onto it for +1 Tactic (+1 swap when your Tactics are full). If an enemy piece lands there first, you lose 1 swap. Each works once; your other pieces can stand there without using it.
- **Midnight Market: Bounty.** From stage 2, the most valuable enemy piece wears a **$** tag. Capture it for +$3 (+$4 at the Circuit Boss). Every time it captures one of your pieces, you lose $1.
- Both appear in every Land, are explained in the opponent’s intro, on the stage ticket, in the move preview and the fight rules, and are listed in the Board key during the fight. Both are saved with the battle.
- With Downtown's Green Lights and Harbor's Crate traps, all four circuits now have something on the board.

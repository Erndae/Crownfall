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

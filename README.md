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

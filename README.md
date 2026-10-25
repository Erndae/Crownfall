# Crownfall

A street-style chess roguelike. Capture pieces to score Material × Brilliance, checkmate Champions, and build your army with Relics, Grandmaster cards and special powers.

Play it: https://erndae.github.io/Crownfall/



## v158 — beta designs in main

Crown-shaped initiative die marks, animal ruler portraits (fox, lion, owl, raven and stag), distinct Campaign opponent identities with beta dialogue, customizable piece designs, and Crown City's weathered stone board and illustrated background. Main Campaign/Gauntlet save namespaces, combat rules, initiative results and the twelve-track soundtrack remain in place. The Journey travel system stays in beta.

Run `node validate-main-design.mjs` and `node validate-character.mjs` for opponent identities, dialogue, syntax and player-only customization checks.

## v160 — carved pieces and clearer dock encounters

Knights capture normally in every mode, including older saves. The retired capture restriction and its instructions are removed. Dockmaster Dee’s new battles have visible marked crate traps: landing on one costs up to $2, clears it once, and leaves the piece intact. The Crown City story message now explains the challenge to Vex. The Sculpted collection uses carved chess silhouettes, gold and plum shading, and layered bases; the Crown City victory screen shows the complete crown artwork without the pink striped frame.

Run `node validate-gameplay-v160.mjs` for legacy-rule compatibility, Knight captures, crate placement, one-time effects and saved trap state.

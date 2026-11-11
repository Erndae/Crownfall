# Crownfall v177 balance audit

Arithmetic scenario checks using the production target functions, 3 representative army builds, all 5 lands, 16 circuit stage positions and the final ruler position per land. No relics or forge powers; the scenarios use the normal conquest profiles and include Blitz and non-Blitz rules. This is a safety and affordability audit, not a measured win-rate study or simulated full campaign playthrough.

- 255 target scenarios passed: finite, positive, within progression/army-capacity guards and applicable fresh-army/Blitz guards.
- Existing saved fight targets remain fixed; the update does not change their formula.
- Initial training costs $8 against the ordinary $12 stage reward.
- Training prices: $8, $14, $24, $36, $52; full Lv.1–6 cost per type $134 (previously $135). The first steps are cheaper; later steps stay meaningful.
- Savings: $1 per $5 held, capped at $5 ($6 in Midnight Market), replacing $2 per $5 capped at $10/$12. The new Midnight cap matches its advertised ability and reduces the benefit of repeatedly avoiding purchases.
- Existing recruit, forge and extra-life prices are unchanged. Gauntlet token rewards are unchanged.
- v177: Campaign targets read Training from the two best-trained piece types, grow a further 3% per Stage from Circuit 3, give move-limited bosses a floor of 60% of the Stage Warm-up, and rise with scoring Relics and powers (not exercised here: these scenarios carry none). See validate-v177.cjs.

## Target ranges across the tested positions

| Land | Fresh (8 pieces, Lv.1) | Developing (11 pieces, Lv.3) | Trained (15 pieces, Lv.6) |
|---|---:|---:|---:|
| street | 170–10,320 | 220–17,240 | 470–32,590 |
| medieval | 240–14,440 | 3,650–25,920 | 7,060–49,000 |
| greek | 240–10,320 | 3,650–19,790 | 7,060–37,410 |
| fantasy | 240–10,320 | 3,650–21,070 | 7,060–39,830 |
| throne | 290–14,660 | 3,650–31,290 | 7,060–59,140 |

## Practical follow-up

Track real clear rates, moves per win, unspent cash and training purchases over player runs before making broader difficulty changes. Existing score, checkmate, reinforcement and retry rules are retained.

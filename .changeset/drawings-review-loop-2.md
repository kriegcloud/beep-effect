---
"@beep/technical-drawing": minor
"@beep/occt": minor
"@beep/repo-cli": minor
---

Drawing review loop 2. `ModelSpec.overlays` adds emphasis and broken overlay
lines (an emphasis layer drawn at `SheetOptions.emphasisWeightMm`), and `Box`,
`Prism` and `Cylinder` take a `lineStyle`, so an unclaimed tab fused into a
claimed part draws its own edges broken and is never shaded. Sheet labels can
render as real text (`LabelStyle.render`, `SheetOptions.fontDirectory`), and the
broken layer is chained into polylines so dashes run on across segment joins.
Graded shading groups a face's probe pieces into connected visible areas with
`effect/Graph`, draws each band only in the rows that saw its area, and reports
lost stretches. `beep drawings critics` packs, runs and summarizes the
sequential adversarial review.

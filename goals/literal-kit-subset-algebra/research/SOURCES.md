# LiteralKit subset algebra and match family — Sources & Provenance

- **Source exploration:** none. Provenance is the `goals/effect-schema-parity`
  decision log and `explorations/effect-schema-parity/DECISIONS.md`
  (2026-09-15 and 2026-10-22 entries).

## 1. Mined source corpus

| Source | Title | Upstream (repo) | Location (`file:line`) | Theme | Disposition |
|--------|-------|-----------------|------------------------|-------|-------------|
| Effect `Schema.Literals` | `pick` returns a bare `Literals` | Effect-TS/effect | `node_modules/effect/dist/Schema.d.ts` (`interface Literals`) | subset derivation | Overridden on the kit; `omit` proposed upstream |
| Effect `Schema.TaggedUnion` | `match` / `matchOrElse` | Effect-TS/effect | `node_modules/effect/dist/Schema.d.ts` (`TaggedUnion`) | naming | Vocabulary adopted |
| Effect `Match` | `whenOr`, `tags`, `tagsExhaustive` | Effect-TS/effect | `node_modules/effect/dist/Match.d.ts` | composition | `whenOr(...Kit.literals, Kit.match(cases))` verified; `Match.literals` proposed |

## 2. Upstream repositories & licenses

| Repo | License | Port discipline | What we take |
|------|---------|-----------------|--------------|
| Effect-TS/effect | MIT | No code copied; API shapes only | Naming and signatures |

## 3. External research sources

- Three-model review panel (GPT-6 Astra xhigh, Grok 4.7 xhigh, Muse Wonder 1.0):
  raw reports in `research/panel/`, synthesis in
  `research/2026-10-22-panel-synthesis.md`.
- `/adhd` divergent pass: `research/2026-10-22-adhd-wide-set.md`.

## 4. In-repo capability references

- `packages/foundation/modeling/schema/src/LiteralKit/` and `MappedLiteralKit/`.
- `packages/tooling/tool/cli/src/commands/Lint/internal/SchemaParityCodemod*`
  (the ts-morph engine from `goals/effect-schema-parity` P2).
- `standards/architecture/11-evolution-and-deprecation.md` §"Upstream-first
  retirement in `foundation/modeling`".

## 5. Cross-links & provenance

- Probes: `research/probes/annotation-needs.probe.ts`,
  `research/probes/match-return-and-whenor.probe.ts`.
- Benchmark: `research/tools/dispatch-bench.ts`.

# Enforcement Readiness Evaluation

## Question

Can the V1 `beep docgen quality` advisory workflow support a future blocking or
opt-in enforcement gate now, or does the repo need another hardening phase
first?

## Scope

This evaluation sampled package-local `beep docgen quality` reports across the
repo's architecture families:

- tooling: `@beep/repo-cli`, `@beep/repo-docgen`, `@beep/repo-utils`
- foundation: `@beep/schema`, `@beep/types`, and replacement
  `@beep/identity`
- drivers: `@beep/openai`
- shared kernel: `@beep/shared-domain`
- executable architecture fixture: `@beep/fixture-lab-specimen-domain`
- product slice domain: `@beep/workspace-domain`

The pass intentionally did not fix source JSDoc, change the quality rubric,
add a gate, run model remediation, or evaluate local model workers.

## Repo Evidence

The initiative packet says V1 is report-only and that enforcement must wait for
repo-specific evals. The binding architecture standard routes repo operations,
policy packs, generators, and automation to `tooling`, so the V1 ownership in
`@beep/repo-cli` remains doctrinally correct; this P5 pass does not require a
new slice, shared-kernel package, foundation package, or driver.

Full raw package reports were written to `/tmp/jsdoc-quality-p5/` during the
run. The committed compact summary is
[`../history/outputs/jsdoc-quality-p5-summary.json`](../history/outputs/jsdoc-quality-p5-summary.json).

Completed deterministic package reports covered 1,711 subjects:

| Package | Family | Runtime | Subjects | Pass | Warn | Fail |
|---|---:|---:|---:|---:|---:|---:|
| `@beep/repo-cli` | tooling | 75.250s | 569 | 92 | 130 | 347 |
| `@beep/repo-docgen` | tooling | 7.248s | 73 | 7 | 60 | 6 |
| `@beep/repo-utils` | tooling | 124.636s | 662 | 58 | 441 | 163 |
| `@beep/schema` | foundation | 384.288s | n/a | n/a | n/a | n/a |
| `@beep/types` | foundation | 3.809s | 15 | 12 | 3 | 0 |
| `@beep/openai` | drivers | 3.212s | 2 | 1 | 0 | 1 |
| `@beep/shared-domain` | shared | 8.991s | 224 | 221 | 3 | 0 |
| `@beep/fixture-lab-specimen-domain` | fixture | 5.012s | 16 | 16 | 0 | 0 |
| `@beep/workspace-domain` | slice | 5.072s | 68 | 68 | 0 | 0 |
| `@beep/identity` | foundation replacement | 4.534s | 82 | 4 | 67 | 11 |

`@beep/schema` did not produce a JSON report before the runtime ceiling. It was
terminated and recorded as a runtime/tooling gap. `@beep/identity` was added as
a same-family foundation/modeling replacement sample.

Aggregate deterministic finding counts across completed package reports:

| Finding code | Count |
|---|---:|
| `example-lacks-observable-result` | 734 |
| `example-only-voids-result` | 525 |
| `example-too-trivial` | 82 |
| `missing-category` | 1 |
| `missing-description` | 175 |
| `missing-effects-for-effectful-symbol` | 65 |
| `missing-example` | 413 |
| `missing-since` | 1 |

Selective `--score codex` packet runs completed without executing any model or
making edits:

| Package | Runtime | Packets |
|---|---:|---:|
| `@beep/repo-cli` | 117.338s | 477 |
| `@beep/openai` | 2.743s | 1 |
| `@beep/identity` | 4.180s | 78 |

## External Evidence

No new external evidence was needed for this pass. P5 evaluated the V1 workflow
against repo-local reports, architecture doctrine, and the initiative decisions
already captured in prior research.

## Options

1. Keep the workflow report-only until runtime and rubric gaps are hardened.
2. Add package opt-in warnings for packages with clean runtime and low false
   positive risk.
3. Add changed-files blocking now for high-confidence finding codes only.
4. Add repo-wide blocking now.

## Tradeoffs And Risks

The strongest signals are real and useful. Missing examples, missing
descriptions, obviously trivial examples such as `console.log("ciCommand")`,
and missing `@effects` prose on effectful symbols point to actual documentation
quality gaps.

The current signal is not gate-ready. Three gaps matter most:

- Runtime is not bounded enough. `@beep/schema` failed to produce a package
  report before the eval ceiling, while `@beep/repo-utils` and Codex packet
  mode for `@beep/repo-cli` were both slow enough to be poor candidates for
  casual changed-files enforcement.
- Re-export/barrel findings need policy. Namespace re-exports in
  `@beep/repo-docgen` and `@beep/repo-utils` are flagged as missing
  descriptions and examples, but the durable policy might be inherited docs,
  generated docs, or a narrower requirement rather than hand-written examples
  on every barrel export.
- Type-only examples need a separate usefulness rule. Several `@beep/types`
  examples are useful type-level examples, but the current observable-result
  heuristic treats `void` and comment-only type assertions as weak examples.

Codex remediation packets are useful as bounded work queues, but their volume
tracks every advisory finding. Packet generation should remain advisory until
batch sizing and prioritization are improved.

## Recommendation

Keep P5 report-only and do not add a blocking gate yet.

The next initiative step should be a P6 hardening branch, not an enforcement
branch. P6 should:

1. Bound package-local report runtime and investigate the `@beep/schema`
   timeout before any gate is proposed.
2. Decide and encode re-export/barrel documentation policy.
3. Decide and encode type-only example policy so useful type examples are not
   penalized only because they lack runtime output.
4. Add a smaller gate candidate mode only after those issues are fixed, likely
   package opt-in warnings before changed-files blocking.

## Open Questions

- Should namespace re-exports inherit documentation from their target module,
  require their own concise barrel docs, or be excluded from `@example`
  usefulness scoring?
- What observable-result rule should apply to type-only exports where runtime
  output is not the point of the example?
- Why does `@beep/schema` exceed the eval ceiling, and is the cause subject
  count, ts-morph enrichment, schema-heavy source parsing, or a specific
  declaration?
- Should Codex remediation packets be capped by package, finding tier, or
  changed-file scope before they are used in routine workflows?

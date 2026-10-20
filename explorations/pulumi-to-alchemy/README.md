# Pulumi to Alchemy

## Status

<!-- BEGIN GENERATED: EXPLORATION STATUS -->
Stage: `align`
Status: `killed`
<!-- END GENERATED: EXPLORATION STATUS -->

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

The TS7 exit (#1833) left `infra/` as the last place that still needs TypeScript 6: a literal `typescript ^6.0.3` pin for the ghaRunners SDK build and an exact-version patch that points `@pulumi/pulumi` at the `@typescript/typescript6` bridge. Replacing the Pulumi stacks with Alchemy (TypeScript-native infrastructure as code) would remove both and the Pulumi CLI dependency with them.

## Next Open Question

None — killed 2026-10-15 (see [`DECISIONS.md`](./DECISIONS.md)). Reopen at research only if Alchemy gains coverage for Vercel, the GitHub runner module and host-level resources.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

- 2026-10-15: killed at align. The operator ruled out an Alchemy migration ("isolate it to infra"); Pulumi's TypeScript 6 need is being confined to `infra/` as a TS7 exit follow-up.
- 2026-10-15: research inventoried five Pulumi programs, pinned provider/TS6 obligations and Effect reuse bricks; fetched Alchemy beta.83 docs/source/licenses, mapped coverage gaps, and retained unanswered align questions. No deployment or publication performed.

- 2026-10-15: packet opened from the TS7 exit program after #1833 merged; capture filed; next is research.

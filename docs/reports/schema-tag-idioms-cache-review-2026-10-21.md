# schema-tag-idioms cache review

The new law `bun run beep laws schema-tag-idioms --check` reports hand-spelled
schema tags (`S.Struct` / `S.Class` / `S.Error` with a fixed `_tag`, and a
required field fixed to one `S.Literal`). It runs as the root task
`//#lint:schema-tag-idioms`, a cheap-gates lane and a medium policy task.

The task is uncached (`"cache": false`, like `//#lint:retired-effect-paths`): it
reads every git-tracked TypeScript and Markdown file, so its declared inputs
are `**/*.{ts,tsx,mts,cts,md,mdx}` without the usual build, cache and vendor
trees and `_generated/`. It depends on `//#lint:policy-fingerprint`, has no
outputs and no environment.

Adding the root `lint:schema-tag-idioms` script changes the shared root
`package.json` scripts digest, which every root computation's command digest
includes. That digest change is the only drift for the other root
computations: their commands, inputs, outputs, environment, dependency edges
and cache flags are unchanged. No qualification scope, profile, epoch or
qualification state changes, and no computation becomes cached.

This reviews the declared configuration change only. It is not evidence that
any computation is newly qualified or that a quality gate has passed.

Current `turbo.json` SHA-256: `01cb43bcca8ee225ceb181f84900983a42278408b7a179c68e849537f8b6f0e7`.

Drifted computations (subject `//`):

- `//#config-sync:check`
- `//#goals:index-check`
- `//#jsdoc:inventory:check`
- `//#jsdoc:ratchet:check`
- `//#lint:allowlist`
- `//#lint:circular`
- `//#lint:ecosystem-polarity`
- `//#lint:effect-imports`
- `//#lint:effect-imports-markdown`
- `//#lint:effect-vitest`
- `//#lint:identity-registry`
- `//#lint:jsdoc:root`
- `//#lint:judge-rubric`
- `//#lint:native-runtime:roots`
- `//#lint:opaque-roundtrips`
- `//#lint:package-scripts`
- `//#lint:package-test-typecheck`
- `//#lint:policy-fingerprint`
- `//#lint:reflection-artifacts`
- `//#lint:roadmap-refs`
- `//#lint:schema-first`
- `//#lint:tsconfig-overlay`
- `//#lint:tsgo-rules`
- `//#repo-sanity:changeset-graph`
- `//#repo-sanity:sherif`
- `//#repo-sanity:syncpack`
- `//#repo-sanity:versions`
- `//#topo-sort`

New uncached computation: `//#lint:schema-tag-idioms`.

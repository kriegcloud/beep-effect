# Cache baseline review: #1856 guidance wave 3

Reviewed 2026-10-23 for #1856 `residue-guidance` wave 3.

`bun run beep quality cache-policy` reported 28 blocking findings, all
introduced by this branch, plus one review-level source drift for the root
`turbo.json`. The base `599b553267` reports none.

- Configuration drift for the 28 root computations `//#config-sync:check`,
  `//#goals:index-check`, `//#jsdoc:inventory:check`, `//#jsdoc:ratchet:check`,
  `//#lint:allowlist`, `//#lint:circular`, `//#lint:ecosystem-polarity`,
  `//#lint:effect-imports`, `//#lint:effect-imports-markdown`,
  `//#lint:effect-vitest`, `//#lint:identity-registry`, `//#lint:jsdoc:root`,
  `//#lint:judge-rubric`, `//#lint:native-runtime:roots`,
  `//#lint:opaque-roundtrips`, `//#lint:package-scripts`,
  `//#lint:package-test-typecheck`, `//#lint:policy-fingerprint`,
  `//#lint:reflection-artifacts`, `//#lint:roadmap-refs`, `//#lint:schema-first`,
  `//#lint:tsconfig-overlay`, `//#lint:tsgo-rules`,
  `//#repo-sanity:changeset-graph`, `//#repo-sanity:sherif`,
  `//#repo-sanity:syncpack`, `//#repo-sanity:versions` and `//#topo-sort`.
  The root `package.json` gained one script,
  `"lint:markdown-fences": "bun run beep laws markdown-fences --check"`, and the
  root manifest's bytes are part of every root computation's identity.
- Source drift for the root `turbo.json`: it gained the
  `//#lint:markdown-fences` task. That task is `cache: false`, so it is never
  replayed and needs no qualification.

No existing command, script value, task input or cache setting changed.
Recording `//` accepts the existing root posture with the added uncached lint
task. No qualification is granted, and no other subject changes.

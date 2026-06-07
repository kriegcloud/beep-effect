# External Tooling Prototype Gates

Status: `current-pr-gated`

`rqt-010` closes external tooling work as bounded lane-tied prototype gates.
No broad replacement is adopted in this packet. Existing authoritative tools
remain the default unless a future prototype proves speed, parity, rollback,
and fallback proof.

| Candidate | Lane | Current-pr decision | Evidence | Rollback or fallback |
| --- | --- | --- | --- | --- |
| Bun cache A/B | CI setup/cache | Measurement unlock implemented under `rqt-003`; cache policy change deferred until comparable GitHub runs exist. | `setup-monorepo-ci` now emits setup/install/cache metadata. Batch 3 identified the 7 GB Bun cache as material but unsafe to tune from one sample. | Revert setup action timing/cache-policy changes; fallback is unchanged `Setup monorepo CI` behavior plus GitHub job timing. |
| Turbo task-input filtering | Affected graph/config | Implemented under `rqt-006`; not an external tool swap. | `beep quality turbo-config-proof` synthetic after-merge probes proved task-owned root config inputs for lint/test/type-test. | Revert `turbo.json` future flags/task inputs and rerun affected dry-runs plus full quality. |
| Type-test/integration filters | Test participation | Implemented under `rqt-008`; no runner replacement. | Root orchestration now filters unscoped type-test/integration runs to script owners and preserves explicit caller scopes. | Restore broad Turbo invocation; fallback is direct `bun run test` and package scripts. |
| Docgen proof reuse | Docgen/JSDoc metadata | Implemented under `rqt-005`; OXC/JSDoc model remains shadow-only. | Package proof manifests skip repeated package generation only when inputs, outputs, and tool version are current. | Remove proof manifest reader/writer; fallback is full `bun run docgen`. |
| OXC shadow scanner | Repo-exports/docgen metadata | Waived for this packet. | Research found OXC credible only as advisory/shadow metadata; `ts-morph` remains authoritative and type-aware. No zero-diff shadow output or speed sample exists. | Future prototype must diff shadow output against repo-export/docgen output and keep Biome/ESLint/ts-morph authoritative until parity is proven. |
| tsgo sidecar timing | Check/type diagnostics | Waived for this packet. | `@effect/tsgo` is already canonical; no isolated sidecar hotspot was measured after rqt-008 scoping. Blind native-preview/tsgo upgrades were explicitly rejected. | Future prototype must add timing around a concrete tsgo sidecar and preserve diagnostics with local `check` fallback. |
| Rollup/Rolldown fixture report | Build/bundle reporting | Waived for this packet. | Research found bundle tooling useful only as optional measurement for small app/build surfaces; no End-to-End Green bottleneck currently requires it. | Future prototype must stay optional/report-only, close bundles, diff output, and keep root build unchanged. |
| Build post-pass replacement | Package build | Waived for this packet. | Research found possible Babel post-pass cost, but no per-package timing split or sourcemap/pure-annotation parity proof exists. | Future prototype must instrument one package, diff JS/API/sourcemaps, and keep existing build script fallback. |

## Acceptance

- OXC, tsgo, Bun cache, and Rollup/Rolldown remain prototype-only unless a
  future task records before/after timings, parity evidence, rollback, and a
  full local fallback.
- No new external dependency, config, or common quality lane was added for
  rqt-010.
- Completed structural work from `rqt-003`, `rqt-005`, `rqt-006`, and
  `rqt-008` already covers the viable current-pr prototype surfaces without
  broad tool replacement.

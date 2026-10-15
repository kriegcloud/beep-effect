# S31b lane E root cache review

Reviewed by the lane E implementation agent under the orchestrator's explicit
2026-10-15 S31b ruling. Starting tree is baf501b4aa, containing ca9d9a5828 and
main 94f1b6adbf. The audit reports exactly the 27 root configuration-drift blockers
listed below, plus turbo.json source drift. No other blocking kind or subject.
The request names only ["//"]. This is an input re-record, not new qualification,
exception inventory, red waiver or change to task behavior beyond the already
reviewed circular analyzer. Scope/profile/epoch remain byte-for-byte equal as
JSON values. Qualification ledger/state is unchanged.

## Concrete inputs

- Root package.json catalog typescript ^6.0.3 -> ^7.0.2; exact official
  @typescript/typescript6 6.0.2 catalog/root dev dependency; madge catalog removal;
  actual jsonc-parser root dev dependency. Lockfile follows those declarations.
- Root infra:prepare-gha-runners script now passes
  infra/node_modules/typescript/bin/tsc instead of node_modules/typescript/bin/tsc.
  Cache.census.ts hashes the complete sorted workspace script map for
  commandDigest. The old script-map digest is
  3901319824ffc6f00fff4f1e90f5e8807cf328520a772cf93b66b57dd996322b,
  which exactly matches both main and the prior baseline. The current digest is
  659f6d1fd894b19a38686bbbdb181fb2256a2b7f383eeb41e9b47d7f441075fd.
  This one reviewed helper-script correction explains every root commandDigest
  change, including the 27 cached blocking tasks. Their own commands/dependencies
  are unchanged; no unchanged-input red is being hidden.
- patchedDependencies is unchanged versus main. The rejected five Madge-stack
  patches and keys are absent; there is no patch input to qualify.
- syncpack.config.ts removes the TS6 hold and adds exactly infra/typescript/dev
  ^6.0.3 for the Pulumi nodejs runtime until Alchemy replaces it.
- turbo.json adds .oxlintrc.circular.json to lint:circular. The config enables
  only native import/no-cycle, with import/typescript plugins and correctness off.
- .fallowrc.jsonc includes the real manual consumers. The root
  fallow-plugin-manual-development-tools.json declares support entry points;
  no bridge dependency exemption remains.
- Policy fingerprint sources and its Turbo input list add the circular config
  and Fallow plugin. The owning writer generated those declarations. The
  fingerprint runtime source also reads the new paths. No scope is widened.

The baseline writer operates on review subjects, not individual tasks. It will
carry current noncached root nodes alongside cached ones when reviewing //;
all affected root nodes share the changed script-map digest. No other subject
is authorized for stamping, and no rows may be added or removed in reviews.

## Each current blocking task

Every row below has the changed root script-map digest above. Additional declared
input changes are named where applicable. All remaining configuration fields,
cache flags, outputs and individual task commands are retained.

| Drifted task | Concrete cause |
| --- | --- |
| `//#config-sync:check` | Root script-map digest changes for the infra compiler path. |
| `//#goals:index-check` | Root script-map digest changes for the infra compiler path. |
| `//#jsdoc:inventory:check` | Root script-map digest changes for the infra compiler path. |
| `//#jsdoc:ratchet:check` | Root script-map digest changes for the infra compiler path. |
| `//#lint:allowlist` | Root script-map digest changes for the infra compiler path. |
| `//#lint:circular` | Root script-map digest changes for the infra compiler path; adds .oxlintrc.circular.json declared input for native cycle lint. |
| `//#lint:ecosystem-polarity` | Root script-map digest changes for the infra compiler path. |
| `//#lint:effect-imports` | Root script-map digest changes for the infra compiler path. |
| `//#lint:effect-imports-markdown` | Root script-map digest changes for the infra compiler path. |
| `//#lint:effect-vitest` | Root script-map digest changes for the infra compiler path. |
| `//#lint:identity-registry` | Root script-map digest changes for the infra compiler path. |
| `//#lint:jsdoc:root` | Root script-map digest changes for the infra compiler path. |
| `//#lint:judge-rubric` | Root script-map digest changes for the infra compiler path. |
| `//#lint:native-runtime:roots` | Root script-map digest changes for the infra compiler path. |
| `//#lint:package-scripts` | Root script-map digest changes for the infra compiler path. |
| `//#lint:package-test-typecheck` | Root script-map digest changes for the infra compiler path. |
| `//#lint:policy-fingerprint` | Root script-map digest changes for the infra compiler path; adds .oxlintrc.circular.json and fallow-plugin-manual-development-tools.json declared inputs. |
| `//#lint:reflection-artifacts` | Root script-map digest changes for the infra compiler path. |
| `//#lint:roadmap-refs` | Root script-map digest changes for the infra compiler path. |
| `//#lint:schema-first` | Root script-map digest changes for the infra compiler path. |
| `//#lint:tsconfig-overlay` | Root script-map digest changes for the infra compiler path. |
| `//#lint:tsgo-rules` | Root script-map digest changes for the infra compiler path. |
| `//#repo-sanity:changeset-graph` | Root script-map digest changes for the infra compiler path. |
| `//#repo-sanity:sherif` | Root script-map digest changes for the infra compiler path. |
| `//#repo-sanity:syncpack` | Root script-map digest changes for the infra compiler path. |
| `//#repo-sanity:versions` | Root script-map digest changes for the infra compiler path. |
| `//#topo-sort` | Root script-map digest changes for the infra compiler path. |

## Reversal

Restore the parent baseline and audited input declarations together, then rerun
the audit. Any later input change requires its own reviewed request; this basis
does not authorize alias consolidation, new subjects or broader qualification.

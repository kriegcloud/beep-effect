# H2 review wave 1b (2026-10-14)

The compiler maps now match main's known 0.51.1 rule policy, with all three
ignoreEffect*InTscExitCode flags false. An empty-project tsc-rs canary passes
without unknown-rule warnings; a shared Effect-only violation still fails.
The nine newer keys live only in standards/effect-diagnostics.profile.json.
That checked-in file is decoded with a closed Effect Schema before selection.

| Rule | Severity |
| --- | --- |
| effectSleepZeroToYieldNow | error |
| errorPayloadShadowsName | error |
| flatMapToTap | error |
| preferBarrelImport | off |
| preferEffectArray | error |
| preferEffectRecord | error |
| preferNamespaceImport | off |
| preferSchemaTaggedError | error |
| schemaClassMissingBrand | off |

get-tsconfig 4.14.3 resolves each project's effective plugin, including JSONC,
extends, the copied app profiles and effect-drizzle's exception. The resolved
object is schema-decoded; all plugin options and per-file overrides survive.
The lane merges the nine severities and encodes the complete --lspconfig via
Schema. The native --showConfig approach was discarded because it omits plugins.
The resolver was already installed transitively and is now a catalog-backed
CLI dependency; its direct declaration adds no compiler API dependency.

The profile is a global affected-selection input. Cached rule-parity,
fingerprint and CLI test/property-test consumers declare it as an input too.
Two reviewed requests record the intermediate and final baseline projections;
the final one carries all 153 prior reviews without widening qualification.
The observability catalog was refreshed through its writer for the new spans.

After one green main Effect Diagnostics run, require the lane descriptor and
main ruleset context through repo tooling. Fold the profile into root and
copied compiler maps, flip all three ignore flags true, then delete the profile
and overlay loader. Until then required Check gates shared rules, and the
non-required diagnostics lane enforces the newer rules through its profile.

Raw logs and exact command results stay in the external h2-logs/review-1b/
directory. The final all-project proof records source digests before and after
execution; earlier failed prototypes and repaired test findings are retained
separately and are not claimed as green runs.

## Final verification

| Check | Exit | Result |
| --- | --- | --- |
| Root Check on final source | 0 | 50.786s; no unknown-rule warnings |
| Standalone affected/full-inventory diagnostics | 0 | 291 projects, 73820 visits, zero findings, 770.563s; source unchanged |
| Five touched-package quick gates | 0 each | repo-cli, repo-configs, effect-drizzle, oip-web, todox |
| CLI and compiler policy tests | 0 | 195 + 5 tests; final 10-test pipe-form replay passes |
| Nine requested cheap gates and combined rule parity | 0 each | Final schema-first property coverage passes; no inventory exception |
| Retired Effect paths and full dead-code gates | 0 each | Standing lane gates pass |
| Cache review, generated writers, formatting and whitespace | 0 each | Scope unchanged; 153 reviews carried |

All three ignore flags remain false. No compiler or Effect version changed.
The orchestrator owns publication; this wave performs no git mutation or Yeet command.

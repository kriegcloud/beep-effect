# Cache baseline review: native deprecated-API cutover (2026-10-14)

Reviewer: Codex lane A, feat/ts7-oxlint-deprecated-apis.

The lint:deprecated-apis package command and CLI flags remain unchanged. Its
implementation now runs one four-thread native Oxlint worker with a dedicated
profile. Full/hosted sweeps use the same CLI body; affected sweeps keep caller
base selection, existing Turbo concurrency and package boundaries. The internal
full-sweep selector is oxlint; the explicit turbo alternative is retained.

Reviewed Turbo changes: the deprecated task replaces direct ESLint config and
repo-configs source globs with the dedicated Oxlint profile, removes its obsolete
NODE_OPTIONS env input, retains source/project/manifest globs, output exclusions,
transit and policy-fingerprint dependencies, cache flag and empty outputs. The
root policy fingerprint adds the dedicated profile. Global BEEP_ESLINT_PROFILE
and its cache pilot scenarios remain because lane B still owns the docs parser.

The root catalog pins oxlint 1.88.0 and oxlint-tsgolint 7.0.2004; repo-cli declares
@nodable/entities 3.1.0 and is-unsafe 2.0.2 for the tested XML decoder replacement.
No @typescript-eslint dependency is removed. A narrow Knip hold retains the
unused plugin until lane B. Strict project assignment and fixture rootDir fixes
are source/project inputs and do not lower any compiler strictness flag.

Re-record all 153 legacy subjects because the effective shared lint task and
policy input declarations changed. No cache qualification is granted, no task
cache flag is enabled, no output or dependency edge is relaxed, and existing
qualification scope/profile/epoch are carried unchanged. Generated package
scripts report 153 manifests, zero drift and zero rewrites.

Evidence: gate-results-resume.json, corpus-parity-resume.json, coverage-resume.json
and verification-resume.jsonl. Native Turbo fingerprint tests exercise the new
profile input and preserve package/root isolation. The orchestrator separately
owns hosted <=150s timing and publication.

Reversal: restore the engine/config and shared lint input hunks, regenerate the
fingerprint and record a new reviewed baseline. Keep valid strict coverage,
fixture, mock, Accordion and XML behavior fixes independently.

## Re-record after merging main (2026-10-14 19:30Z)

Main added `@beep/practice-claude-mod` (154 manifests). The lint-policy fingerprint change touches its tasks too, so the reviewed subject list gains it; nothing else changes.

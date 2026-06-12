# Current Lint Advisory Inventory

Date: 2026-06-12

Branch baseline: `main...origin/main`, clean worktree before implementation.

## Root-Lint V1 Scope

In scope:

- `bun run beep laws terse-effect --check`
- `bun run beep laws native-runtime --check`
- `bun run beep lint reflection-artifacts`
- `bun run beep lint schema-first`
- `bunx eslint .` warning output in the root policy lane
- PR CI coverage for root lint policy checks skipped by affected lint

Out of scope:

- Fallow advisory lanes and Yeet advisory envelopes
- Fallow `dupes`, `health`, `boundaries`, `security`, `flags`, and
  `fix-preview` promotion

## Live Inventory

### Terse Effect

Command:

```sh
bun run beep laws terse-effect --check
```

Result:

- `touched_files=16`
- `flow_candidates_detected=39`
- `blocking_files=0`
- `rewritable_files=0`
- `informational_files=16`

Decision: manually fix current `flow-candidate` findings, then make future flow
candidates blocking. Do not add a v1 autofix.

### Native Runtime

Command:

```sh
bun run beep laws native-runtime --check
```

Result:

- `scanned_files=1475`
- `touched_files=20`
- `warnings=43`
- `errors=0`
- `allowlisted=7`
- `unused_allowlist_entries=0`

Warning category summary from explorer inventory:

- `map-set-ctor=23`
- `typeof-runtime=15`
- `array-static=2`
- `date-static=1`
- `native-error=1`
- `object-method=1`

Decision: harden false positives with context-specific checks only, then fix
ordinary findings or record rare legitimate exceptions in the Effect-laws
allowlist.

### Reflection Artifacts

Command:

```sh
bun run beep lint reflection-artifacts
```

Result:

- `blocking_findings=0`
- `advisory_findings=5`

Advisory goals:

- `canonical-slice-factory`
- `ontology-interop-roadmap`
- `repo-quality-throughput`
- `storybook-app`
- `yeet-agent-ergonomics`

Decision: write missing reflections and make all completed packet reflection
findings blocking.

### Schema First

Command:

```sh
bun run beep lint schema-first
```

Result:

- `live_entries=274`
- `tracked_entries=274`
- `missing_entries=0`
- `stale_entries=0`
- `enforced_candidates=0`
- all SFV4 advisory counters are `0`

### JSDoc ESLint

```sh
bunx eslint . --max-warnings=0
```

Result:

- `0` warnings
- root policy lane now invokes ESLint with `--max-warnings=0`

Decision: no cleanup required, but future schema-first advisories must fail.

## CI Risk

`.github/workflows/check.yml` runs PR lint as:

```sh
bun run lint -- --affected --summarize
```

Affected/scoped lint skips repo-wide root policy steps, so PR CI can miss the
exact law/reflection/schema policy checks this packet hardens. V1 adds
`bun run beep lint policy` and a dedicated unscoped PR CI lane.

## Post-Cleanup Inventory

Collected after false-positive hardening, flow cleanup, reflection artifacts,
and native-runtime allowlist/codegen updates.

### Terse Effect

```sh
bun run beep laws terse-effect --check
```

Result:

- `touched_files=0`
- `flow_candidates_detected=0`
- `blocking_files=0`
- `rewritable_files=0`
- `informational_files=0`

### Native Runtime

```sh
bun run beep laws native-runtime --check
```

Result:

- `touched_files=0`
- `warnings=0`
- `errors=0`
- `allowlisted=18`
- `unused_allowlist_entries=0`

The 6 platform-global `typeof ... === "undefined"` guards are now recognized
as availability checks. Ordinary `typeof` checks were replaced with
`effect/Predicate` guards. The remaining native runtime usages are documented
file/kind allowlist entries.

### Reflection Artifacts

```sh
bun run beep lint reflection-artifacts
```

Result:

- `blocking_findings=0`
- `advisory_findings=0`

### Schema First

```sh
bun run beep lint schema-first
```

Result:

- `missing_entries=0`
- `stale_entries=0`
- `enforced_candidates=0`
- all SFV4 advisory counters are `0`

# Retained repository tool workflows: witness receipt (2026-10-23)

Refs #1852. Witnessed at `61dcdbad9dce06acd56b8e39942c5c0d11c7d0dd` (origin/main, after #2079) in a fresh lane checkout, on Linux x64 with bun 1.4.4. This receipt covers the agent half of #1852. The Stately OAuth and visual workflow fixture stays with the operator (see the issue comment).

## Paired Semgrep fixtures (first-party rules)

The fixture `goals/repository-simplification-confidence/history/outputs/semgrep/first-party.ts` carries `ruleid:` positive and `ok:` negative cases for every rule in `.semgrep/first-party.yml`:

| Rule | Positive cases | Negative cases |
| --- | --- | --- |
| `beep-no-eval` | `eval(...)`, `globalThis.eval(...)` | `JSON.parse(...)` |
| `beep-no-dynamic-shell-exec` | named `exec(cmd)`, `execSync` with a template, namespace `childProcess.exec(cmd, cb)` | literal `exec("git status")`, literal namespace `execSync("...")`, `RegExp.prototype.exec` |
| `beep-hardcoded-private-key` | a `BEGIN RSA PRIVATE KEY` header (kept last, with no later key marker) | a `BEGIN CERTIFICATE` header |

```sh
docker run --rm -e SEMGREP_SEND_METRICS=off -v "$PWD:/src" -w /src semgrep/semgrep \
  semgrep --test --config .semgrep/first-party.yml \
  goals/repository-simplification-confidence/history/outputs/semgrep/first-party.ts
```

Result: `3/3: ✓ All tests passed`. The image is `semgrep/semgrep:latest` (image id `sha256:32e459968daa…`). The safe.directory warning is cosmetic: the lane is a linked worktree.

The fixture never reaches the hosted SAST scan. `goals/**/history/outputs/` is already listed in `.semgrepignore`, and a directory scan of the goal reports `Ran 3 rules on 0 files: 0 findings`. The path is also outside every compiled project, and is excluded from fallow and oxlint (`goals/**`). A file-level `biome-ignore-all` marks it as a deliberate fixture. The private-key case is a header only, with no key body, so gitleaks and push protection do not match it. No ignore list, allowlist or baseline gained an entry.

## Spelling and scoped lint

| Gate | Command | Result |
| --- | --- | --- |
| Typos | `bun run lint:typos` (typos-cli 1.51.1, `_typos.toml`) | exit 0 |
| Strict shadcn | `bun run lint:shadcn` (`oxlint --disable-nested-config --deny-warnings -c .oxlintrc.shadcn.json apps packages`) | exit 0 |

## Revision-bound Vitest alias projection

`bun run beep tsconfig-sync --check` reports `no drift detected` (exit 0). Running the writer (`tsconfig-sync --write`) regenerates `vitest.aliases.generated.json` byte-identically: sha256 `a6228f8fd7c886fb04ab6175f5585add571828a3c87ef5c3dad9ef1c0aff3ea2` before and after, with an empty `git diff`. The projection is bound to this revision's workspace graph.

## Compiler shim provenance

| Item | Value |
| --- | --- |
| `@effect/tsgo` (installed, catalog pin) | `0.55.0` / `0.55.0` |
| `tsc --version`, `tsgo --version` | `Version 7.0.2+effect-tsgo.0.55.0` |
| Patched `@typescript/typescript-linux-x64/lib/tsc` (TypeScript 7.0.2) | sha256 `3a3ce6a21bc7fcd07919335d1b1a7696d4eee99f64502926403911dd2f3f722d` |
| Effect artifact `@effect/tsgo-linux-x64/lib/tsc` | sha256 `3a3ce6a21bc7fcd07919335d1b1a7696d4eee99f64502926403911dd2f3f722d` (identical) |
| Stock binary kept as `tsc.original` | sha256 `4f2de678286401759b3fb4475bafe35b8f32b4b3a07d92642bbf37eadc9b34a4` |
| `tools/tsgo-shim/tsgo.js` | sha256 `64dd14b52060b1a5c6b3765a10f02df6e9c3c0b015e1cfdcf831044f40cd7e2d` |

`bun run prepare` (`effect-tsgo unpatch && node scripts/prune-tsgo-backups.mjs && effect-tsgo patch`) exited 0. It restored the original, pruned the backups (`~0 MB`), and repatched. Afterwards `tsc --version` still reports `7.0.2+effect-tsgo.0.55.0`, with the same hashes.

## WebStorm exclusions (`beep-effect.iml`)

The `.iml` (239 `excludeFolder` and 8 `excludePattern` entries) was compared with the git-ignored directories, to depth 2, of a long-lived clone:

- `.claude/worktrees`, `.impeccable` and `.ruff_cache` are ignored by git but were indexed. All three are now excluded in this PR.
- `.ai` was excluded but nothing creates it any more, so the entry is removed.
- `docs/generated` stays excluded: it is the current docgen aggregate output (see `.gitignore`).
- `node_modules`, `infra/node_modules` and `scratchpad/node_modules` stay out of the list, because WebStorm treats them as library roots.

## Left open

- Stately discovery and visual workflow qualification: the authorized Stately owner completes the OAuth login and the selected visual workflow fixture (#1852 operator step).

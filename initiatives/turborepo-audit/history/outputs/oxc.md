# Topic
Oxc (oxlint and oxfmt)

## TLDR
`oxlint` is the clearest simplification opportunity in the lint stack. It is currently a direct root command, not a Turbo task, so it is functional but not very cache-aware.

## Score
0.55

## Current repo evidence
- Root `package.json` defines `lint:ox` as a direct `bunx oxlint ...` command.
- Root `lint` invokes `lint:ox` after Turbo-driven lint lanes and several repo-governance checks.
- `turbo.json` does not define a `//#lint:ox` task, so Turbo does not cache or schedule this work directly.
- The command already has explicit ignore patterns for generated or noisy paths such as `.repos/**`, `initiatives/**`, and `**/storybook-static/**`.

## Official Turborepo guidance
- The Turborepo Oxc guide treats Oxc tools as candidates for package scripts and Turbo orchestration when they are part of a monorepo task graph.
- The main benefit is the same one Turbo provides elsewhere in this repo: cacheable, parallelized work with explicit inputs and outputs.

## Gaps or strengths
- Gap: `lint:ox` bypasses Turbo, so it cannot benefit from the repo's task graph, cache settings, or affected-package selection.
- Gap: the command is root-scoped even though much of the repo already follows package-level lint ownership.
- Strength: the ignore list keeps the command reasonably bounded and shows the check is already intended as a repo-wide safety pass.

## Improvement or preservation plan
1. Decide whether `lint:ox` is meant to stay a root governance check or become a Turbo task.
2. If it stays root-only, document it as intentionally non-cacheable and keep the scope narrow.
3. If it should participate in Turbo, add a `//#lint:ox` task in `turbo.json` with explicit inputs and invoke it through `turbo run`.
4. If the rule set grows, consider splitting package-scoped Oxc checks from repo-wide policy checks so the task graph stays meaningful.

## Commands and files inspected
- `node -e '...package.json scripts...'`
- `sed -n '1,260p' turbo.json`
- `rg -n '"lint:ox"' package.json .github/workflows/check.yml tooling -S`
- `bunx turbo query ls @beep/repo-cli --output json`
- `bunx turbo query ls @beep/editor-app --output json`

## Sources
- Repo: `package.json`
- Repo: `turbo.json`
- Repo: `.github/workflows/check.yml`
- Turbo docs: `https://turborepo.dev/docs/guides/tools/oxc`

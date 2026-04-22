# Topic
Task graph introspection and devtools

# TLDR
Turbo now has native graph and affected introspection that this repo is barely using. That makes this one of the clearest modernization opportunities: keep custom policy tooling, but move routine package/task discovery and ownership diagnostics toward `turbo query` and `turbo ls`.

# Score
0.56 / 1.00

# Current repo evidence
- Root `package.json` exposes `topo-sort` as a repo CLI command.
- `tooling/cli/src/commands/TopoSort.ts` builds and prints a workspace dependency order using repo-local utilities.
- A repo-wide search found no `turbo query` or `turbo ls` usage in root scripts, tooling commands, apps, packages, or GitHub workflows.
- During this audit, `bunx turbo query ls --output json` returned the full package inventory and `bunx turbo query ls <package> --output json` returned per-package tasks, dependencies, and dependents.
- During this audit, `bunx turbo query affected --tasks build check test lint docgen --packages` executed successfully and returned structured affected-task output, even though the current repo state had no changes to report.

# Official Turborepo guidance
- `https://turborepo.dev/docs/reference/query` documents `turbo query ls` and `turbo query affected` as first-party graph and affected-analysis surfaces.
- The query reference says task-level affected analysis is more precise than package-level selection because it uses configured task inputs and dependency edges.
- `https://turborepo.dev/docs/reference/devtools` documents built-in devtools support for understanding the task graph interactively.

# Gaps or strengths
- Strength: the repo already has the package/task data Turbo needs; it just is not yet leaning on Turbo’s native inspection UX.
- Strength: custom graph tooling still works, so this is an opportunity to simplify, not a current breakage.
- Gap: package ownership, affected diagnostics, and graph reasoning are still more bespoke than they need to be.
- Gap: agent prompts, CI diagnostics, and contributor workflows are missing a native, structured graph-debugging surface that Turbo already provides.

# Improvement or preservation plan
1. Add a lightweight root script or documented workflow for `bunx turbo query ls --output json` and `bunx turbo query affected` before changing any policy tooling.
2. Prefer `turbo query` for routine graph inspection, affected debugging, and package/task ownership checks.
3. Keep `topo-sort` only if there is a repo-specific output format or automation dependency that Turbo cannot satisfy.
4. Introduce `turbo devtools` only if interactive graph debugging becomes a frequent contributor need; otherwise `query` and `ls` are likely enough.

# Commands and files inspected
- `sed -n '1,220p' tooling/cli/src/commands/TopoSort.ts`
- `rg -n 'turbo query|turbo ls|topo-sort' package.json tooling apps packages .github scripts -S`
- `bunx turbo query ls --output json`
- `bunx turbo query ls @beep/editor-app @beep/desktop @beep/repo-cli @beep/infra --output json`
- `bunx turbo query affected --tasks build check test lint docgen --packages`

# Sources
- Repo: `package.json`
- Repo: `tooling/cli/src/commands/TopoSort.ts`
- Official Turborepo: `https://turborepo.dev/docs/reference/query`
- Official Turborepo: `https://turborepo.dev/docs/reference/devtools`

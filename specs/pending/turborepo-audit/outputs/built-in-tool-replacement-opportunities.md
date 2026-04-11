# Topic
Built-in Turborepo replacement opportunities

# TLDR
There are real replacement opportunities here, but they are selective rather than sweeping. Turbo can credibly replace parts of graph introspection, affected analysis, and generic generation, while policy-heavy repo commands like `create-package`, `docgen`, `version-sync`, and schema/effect-law checks should stay custom for now.

# Score
0.67 / 1.00

# Current repo evidence
- Root `package.json` still exposes custom repo entrypoints such as `topo-sort`, `create-package`, `codegen`, `config-sync`, `version-sync`, and `graphiti:proxy`.
- `tooling/cli/src/commands/Root.ts` confirms these are first-class repo CLI commands rather than one-off shell aliases.
- `tooling/cli/src/commands/TopoSort.ts` computes a workspace dependency order directly from repo metadata, which overlaps with Turbo’s native graph-introspection features.
- A repo-wide search found no current usage of `turbo query`, `turbo ls`, `turbo generate`, `turbo boundaries`, or `turbo prune` in the command surface.
- The quality lane in root `package.json` still relies on bespoke checks such as `lint:schema-first`, `lint:tooling-tagged-errors`, `check:effect-laws-allowlist`, and `lint:repo`.

# Official Turborepo guidance
- `https://turborepo.dev/docs/reference/query` and `https://turborepo.dev/docs/reference/ls` provide first-party graph discovery and affected analysis.
- `https://turborepo.dev/docs/reference/generate` provides first-party generator entrypoints.
- `https://turborepo.dev/docs/reference/boundaries` provides first-party package-boundary checks when tags and rules are defined.
- `https://turborepo.dev/docs/reference/prune` provides deploy-focused workspace pruning.

# Gaps or strengths
- Strength: the repo’s custom tools clearly encode repo-specific policy; this is not arbitrary reinvention.
- Strength: custom governance checks cover areas Turbo does not understand natively, such as schema-first and Effect-law constraints.
- Gap: graph exploration and affected introspection are still custom or absent where Turbo now has native features.
- Gap: generic scaffold and graph-visibility use cases are paying maintenance cost in repo code even though Turbo can now cover more of that surface.

# Improvement or preservation plan
1. Replace or de-emphasize custom graph discovery first: use `turbo query` / `turbo ls` for package and task introspection before touching policy-heavy generators.
2. Keep repo-specific governance commands where they encode domain rules Turbo cannot express.
3. Introduce Turbo-native generation only for generic scaffolds, not for the full `create-package` policy flow.
4. Revisit `topo-sort` first if the goal is to reduce bespoke tooling, because it overlaps most directly with Turbo-native graph capabilities.

# Commands and files inspected
- `sed -n '1,240p' package.json`
- `sed -n '1,260p' tooling/cli/src/commands/Root.ts`
- `sed -n '1,220p' tooling/cli/src/commands/TopoSort.ts`
- `rg -n 'turbo generate|turbo gen|@turbo/gen|generate workspace|generate run' package.json apps packages tooling .github scripts -S`
- `rg -n 'turbo query|turbo ls|topo-sort' package.json tooling apps packages .github scripts -S`
- `rg -n 'sherif|lint:repo|syncpack lint|non-existent-packages|workspace:\^|catalog:' package.json syncpack.config.ts .github/workflows/check.yml tooling packages apps infra -S`

# Sources
- Repo: `package.json`
- Repo: `tooling/cli/src/commands/Root.ts`
- Repo: `tooling/cli/src/commands/TopoSort.ts`
- Repo: `syncpack.config.ts`
- Official Turborepo: `https://turborepo.dev/docs/reference/query`
- Official Turborepo: `https://turborepo.dev/docs/reference/generate`
- Official Turborepo: `https://turborepo.dev/docs/reference/boundaries`
- Official Turborepo: `https://turborepo.dev/docs/reference/prune`

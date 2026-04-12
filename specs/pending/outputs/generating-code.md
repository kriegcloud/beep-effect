# Topic
generating-code

# TLDR
The repo already has a substantial custom generation stack, but most of it is repo-specific scaffolding rather than something Turbo can replace outright. The best Turbo-native opportunity is a thin generator path for generic workspace/package bootstrapping, not a wholesale rewrite of `create-package`, `codegen`, or `docgen`.

# Score
0.68 / 1.00

# Current repo evidence
- `package.json` exposes root wrappers for `codegen`, `create-package`, `config-sync`, `version-sync`, and `docgen`, and each of those delegates into the repo CLI or other repo-local tooling.
- `tooling/cli/src/commands/Root.ts` registers `createPackageCommand`, `codegenCommand`, `docgenCommand`, `docsCommand`, `tsconfigSyncCommand`, `versionSyncCommand`, and `syncDataToTsCommand` as first-class CLI commands.
- `tooling/cli/README.md` documents `create-package` and `codegen` as repo-local commands.
- `tooling/cli/src/commands/Codegen.ts` generates barrel exports for a package’s `src/` tree and is tightly coupled to repo conventions like `@since 0.0.0` JSDoc and `index.ts` barrel layout.
- `tooling/cli/src/commands/CreatePackage/index.ts` and `tooling/cli/test/create-package.test.ts` show that package creation also syncs workspace metadata, TypeScript references, tstyche, and syncpack inputs.
- `tooling/cli/test/create-package-security.test.ts` shows the generation path is security-sensitive and intentionally guarded against path traversal.
- `tooling/docgen/src/bin.ts` is a separate repo-local generator entrypoint for doc extraction and aggregation.
- `turbo.json` does not define a `generate` task surface, and the root scripts do not delegate through `turbo generate`.

# Official Turborepo guidance
- Turborepo’s generating-code guide frames `turbo gen workspace` and `turbo generate run` as the first-party surfaces for creating new apps, packages, and custom generators.
- The reference docs say generators are discovered automatically, can be TypeScript-based, and can live under `turbo/generators/config.ts` in a workspace or repo root.
- The `generate` reference also points to `@turbo/gen` as the package for TypeScript generator types.
- Sources: https://turborepo.dev/docs/guides/generating-code and https://turborepo.dev/docs/reference/generate

# Gaps or strengths
- Strength: the repo already has a real generator stack with tests, typed commands, and explicit package sync behavior.
- Strength: `create-package` is not just file copying; it encodes repo policy, which is exactly the kind of logic that should not be flattened into a generic generator by default.
- Strength: `codegen` and `docgen` are clearly repo-local workflows with domain-specific behavior.
- Gap: there is no Turbo-native generator discovery or `turbo gen` entrypoint, so the bootstrap story is entirely custom.
- Gap: new contributors do not get the standard Turborepo generator UX or the discoverability that comes with `turbo generate`.

# Improvement or preservation plan
- Preserve `create-package`, `codegen`, and `docgen` as repo-local commands where they encode Effect conventions, workspace policy, and validation.
- Introduce Turbo-native generators only for the parts of bootstrap that are generic and repetitive, such as creating a new empty workspace or copying a common scaffold.
- If that path is adopted, place generator config under `turbo/generators/config.ts` and use `@turbo/gen` for TypeScript generator typing.
- Do not force `turbo generate` into docgen or barrel-export generation unless it materially reduces maintenance without losing the repo’s policy checks.

# Commands and files inspected
- `sed -n '1,240p' package.json`
- `sed -n '1,220p' tooling/cli/README.md`
- `sed -n '1,220p' tooling/cli/src/commands/Root.ts`
- `sed -n '1,260p' tooling/cli/src/commands/Codegen.ts`
- `sed -n '1,260p' tooling/cli/src/commands/CreatePackage/index.ts`
- `sed -n '1,260p' tooling/cli/test/create-package.test.ts`
- `sed -n '1,220p' tooling/cli/test/create-package-security.test.ts`
- `sed -n '1,260p' tooling/docgen/src/bin.ts`
- `bunx turbo docs generate`

# Sources
- Repo: `package.json`
- Repo: `tooling/cli/README.md`
- Repo: `tooling/cli/src/commands/Root.ts`
- Repo: `tooling/cli/src/commands/Codegen.ts`
- Repo: `tooling/cli/src/commands/CreatePackage/index.ts`
- Repo: `tooling/cli/test/create-package.test.ts`
- Repo: `tooling/cli/test/create-package-security.test.ts`
- Repo: `tooling/docgen/src/bin.ts`
- Official Turborepo docs: https://turborepo.dev/docs/guides/generating-code
- Official Turborepo docs: https://turborepo.dev/docs/reference/generate

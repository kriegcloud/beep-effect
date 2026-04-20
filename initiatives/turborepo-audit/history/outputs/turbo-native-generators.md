# Topic
Turbo-native generators

# TLDR
The repo has no current `turbo generate` adoption, and that is mostly fine because the heaviest scaffolding flows are policy-rich repo CLI commands. The opportunity is to add Turbo-native generators for generic workspace bootstrap and discovery, not to replace `create-package`, `codegen`, or doc generation wholesale.

# Score
0.63 / 1.00

# Current repo evidence
- Root `package.json` exposes `create-package`, `codegen`, `config-sync`, `version-sync`, and `docgen` as repo CLI wrappers.
- `tooling/cli/src/commands/Root.ts` registers `createPackageCommand`, `codegenCommand`, `docgenCommand`, `docsCommand`, `syncDataToTsCommand`, `tsconfigSyncCommand`, and `versionSyncCommand` under the top-level repo CLI.
- `tooling/cli/src/commands/CreatePackage/Handler.ts` describes `create-package` as creating a new package following Effect v4 conventions, which is much more opinionated than a bare workspace scaffold.
- A repo-wide search found no `turbo generate`, `turbo gen`, or `@turbo/gen` usage anywhere in `package.json`, `apps`, `packages`, `tooling`, `.github`, or `scripts`.

# Official Turborepo guidance
- `https://turborepo.dev/docs/reference/generate` documents `turbo generate`, `turbo generate workspace`, and `turbo generate run` as first-party generator entrypoints.
- `https://turborepo.dev/docs/guides/generating-code` positions Turbo generation as a discovery-friendly way to scaffold apps, packages, and other repeated repo patterns.
- The generator docs also point to `@turbo/gen` for typed TypeScript generator authoring.

# Gaps or strengths
- Strength: the repo already has generator logic where policy actually lives, so this is not an absence of automation.
- Strength: the custom generators are tested and security-aware, which makes them safer than replacing them with a generic scaffold on day one.
- Gap: there is no first-party generator discovery surface, so contributors do not get `turbo generate` as a standard monorepo affordance.
- Gap: there is no split between generic scaffold concerns and repo-specific post-processing; everything currently lives behind the repo CLI.

# Improvement or preservation plan
1. Preserve repo-local commands for policy-heavy generation such as `create-package`, `codegen`, and doc generation.
2. Add Turbo-native generators only for generic bootstrap where first-party discovery is a real DX win, such as creating a bare workspace shell or standard package directory layout.
3. If adopted, keep Turbo generators thin and delegate policy-heavy follow-up into the repo CLI rather than duplicating rules in two places.
4. Revisit full generator replacement only if the custom commands become mostly file templating with little repo-specific logic left.

# Commands and files inspected
- `sed -n '1,240p' package.json`
- `sed -n '1,260p' tooling/cli/src/commands/Root.ts`
- `sed -n '449,760p' tooling/cli/src/commands/CreatePackage/Handler.ts`
- `rg -n 'turbo generate|turbo gen|@turbo/gen|generate workspace|generate run' package.json apps packages tooling .github scripts -S`
- `sed -n '1,220p' tooling/cli/README.md`

# Sources
- Repo: `package.json`
- Repo: `tooling/cli/src/commands/Root.ts`
- Repo: `tooling/cli/src/commands/CreatePackage/Handler.ts`
- Repo: `tooling/cli/README.md`
- Official Turborepo: `https://turborepo.dev/docs/reference/generate`
- Official Turborepo: `https://turborepo.dev/docs/guides/generating-code`

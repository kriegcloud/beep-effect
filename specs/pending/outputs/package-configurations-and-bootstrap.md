# Topic
Package Configurations and package-level turbo.json

# TLDR
The repo is already using package-level `turbo.json` files in the right narrow places, but it has not yet pushed package-specific build metadata down to the packages that own it. The best next step is targeted adoption: keep shared defaults in root, and add package-local overrides for app-specific outputs, native build tasks, and any future specialized env/input rules.

# Score
0.79 / 1.00

# Current repo evidence
- Root `turbo.json` defines the shared task model for `build`, `lint`, `check`, `test`, `docgen`, `dev`, `storybook`, and `build-storybook`.
- `apps/editor-app/turbo.json`, `apps/V2T/turbo.json`, and `apps/desktop/turbo.json` already extend the root with package-local `dev:desktop` `with` wiring.
- `packages/VT2/turbo.json` exists and simply extends the root, which shows the repo is already comfortable with package configurations as an organizational tool.
- `bunx turbo query ls @beep/editor-app @beep/v2t @beep/desktop --output json` shows package-owned scripts like `build:native`, `build:sidecar`, and `dev:native`, but none of those task surfaces are modeled with package-local Turbo metadata.
- `tooling/cli/src/commands/CreatePackage/Handler.ts` scaffolds package manifests and config files, but a repo search found no evidence that `create-package` emits a `turbo.json` by default.

# Official Turborepo guidance
- `https://turborepo.dev/docs/reference/package-configurations` says package-level `turbo.json` files are for packages that need task configuration different from the root defaults.
- The same reference says package configs must start with `"extends": ["//"]`, and that package owners can maintain specialized task configuration without affecting the rest of the monorepo.
- The docs also warn that array fields like `outputs`, `inputs`, `env`, `dependsOn`, and `with` replace root values unless `$TURBO_EXTENDS$` is used.

# Gaps or strengths
- Strength: the repo already uses package configs where they clearly help, especially for `dev:desktop` runtime composition.
- Strength: the root config is still understandable because most common task defaults remain centralized.
- Gap: app-specific build surfaces like `build:native` and `build:sidecar` are still only package scripts, not package-owned Turbo task definitions with explicit outputs.
- Gap: package bootstrap does not appear to create a starter `turbo.json`, so package-level specialization is opt-in and manual.

# Improvement or preservation plan
1. Preserve the root `turbo.json` as the shared default task contract.
2. Add package-level `turbo.json` overrides only where a package has materially different task metadata, especially app-native build outputs or special `with`/env/input needs.
3. When adding array overrides, use `$TURBO_EXTENDS$` deliberately so package-local `outputs` or `inputs` do not accidentally discard root defaults.
4. Consider teaching `create-package` to emit a minimal package `turbo.json` only for package types that are likely to need specialization, not for every new workspace.

# Commands and files inspected
- `sed -n '1,260p' turbo.json`
- `find apps -maxdepth 2 -name turbo.json -o -path 'packages/*/turbo.json' -o -path 'packages/*/*/turbo.json' | sort | xargs -I{} sh -c 'echo FILE:{}; sed -n "1,200p" {} ; echo'`
- `bunx turbo query ls @beep/editor-app @beep/v2t @beep/desktop --output json`
- `rg -n 'turbo.json|dev:desktop|with|TURBO_EXTENDS|extends' tooling/cli/src/commands/CreatePackage -S`
- `sed -n '1,260p' tooling/cli/src/commands/CreatePackage/Handler.ts`

# Sources
- Repo: `turbo.json`
- Repo: `apps/editor-app/turbo.json`
- Repo: `apps/V2T/turbo.json`
- Repo: `apps/desktop/turbo.json`
- Repo: `packages/VT2/turbo.json`
- Repo: `tooling/cli/src/commands/CreatePackage/Handler.ts`
- Official Turborepo: `https://turborepo.dev/docs/reference/package-configurations`

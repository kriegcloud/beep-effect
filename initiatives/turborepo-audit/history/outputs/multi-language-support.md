# Topic
Multi-language support relevant to Tauri apps

# TLDR
The repo already models a real multi-language stack: Bun/Effect packages, Vite apps, and a Tauri/Rust wrapper with a Bun sidecar. Turbo can handle this setup, but the native build surface is only partially represented in Turbo today. The main gap is cacheable native outputs, not package discovery.

# Score
0.69 / 1.00

# Current repo evidence
- `apps/desktop/package.json` exposes `dev:native`, `build:native`, and `build:sidecar` scripts.
- `apps/desktop/src-tauri/README.md` says `build:native` compiles the standalone Bun sidecar into `src-tauri/binaries/` and then bundles the native app.
- `apps/desktop/src-tauri/tauri.conf.json` uses `beforeBuildCommand: "bun run build && bun run build:sidecar"`, so native packaging depends on JS builds plus sidecar compilation.
- `apps/desktop/turbo.json` only adds `dev:desktop` `with` wiring; no native build outputs are modeled there.
- `bunx turbo query ls @beep/desktop --output json` shows the native scripts exist in the workspace, but Turbo treats them as ordinary scripts rather than cached native build artifacts.

# Official Turborepo guidance
- The multi-language guide says Turbo does not care what the scripts do; any language or toolchain can participate once the directory is a workspace package with a `package.json`.
- The same guide says build artifacts should be cached with the `outputs` key in `turbo.json`.
- The guide uses Rust as the example and shows `target/release/**` as a cacheable build output.
- It also recommends modeling dependencies between non-JS and JS packages through workspace package dependencies so Turbo can order tasks correctly.

# Gaps or strengths
- Strength: the repo already satisfies the core prerequisite by exposing the native stacks as workspace packages with scripts.
- Strength: Tauri owns the native packaging boundary explicitly, so the repo is not hiding a complex native flow behind a vague root wrapper.
- Gap: `build:native` and `build:sidecar` are not first-class Turbo tasks with declared outputs, so Turbo cannot cache or schedule those native artifacts explicitly.
- Gap: the root `build` task covers JS/TS app builds, but not the Tauri/Rust packaging boundary.

# Improvement or preservation plan
- Preserve the current script-driven Tauri flow; Tauri should keep owning native packaging.
- If native builds become part of CI or release, add package-local Turbo tasks for `build:native` and `build:sidecar` with outputs for the generated sidecar binaries and Tauri bundle artifacts.
- Consider package-level `turbo.json` updates for `apps/desktop` so Rust-adjacent task behavior lives next to the owning package instead of only in root config and package scripts.
- Keep `dev:native` out of caching; it is a persistent runtime task, not a build artifact.

# Commands and files inspected
- `sed -n '1,220p' apps/desktop/package.json`
- `sed -n '1,220p' apps/desktop/src-tauri/README.md`
- `sed -n '1,160p' apps/desktop/src-tauri/tauri.conf.json`
- `bunx turbo query ls @beep/desktop --output json`

# Sources
- Repo: `/home/elpresidank/YeeBois/projects/beep-effect/apps/desktop/package.json`
- Repo: `/home/elpresidank/YeeBois/projects/beep-effect/apps/desktop/src-tauri/README.md`
- Repo: `/home/elpresidank/YeeBois/projects/beep-effect/apps/desktop/src-tauri/tauri.conf.json`
- Turbo: `https://turborepo.dev/docs/guides/multi-language`

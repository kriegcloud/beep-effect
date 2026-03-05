# Nix & Dev Environment

## Current State in This Repo

- **No `flake.nix` in root** -- only in `.repos/` subdirectories (effect-smol, beep-effect, docgen)
- **No `devenv.sh` or `devenv.nix`** -- no declarative dev environment
- **No `.envrc` for direnv** -- no automatic shell activation
- **No `.mise.toml` or `.tool-versions`** -- no version manager config
- **`.nvmrc`** pins Node 22 (but CI uses Node 20 -- version mismatch)
- **`.bun-version`** says 1.3.2 but `package.json#packageManager` says `bun@1.3.9` -- version mismatch
- **`docker-compose.yml`** manages Postgres (pgvector), Redis, and Grafana (OTEL-LGTM) for local dev
- **System tools assumed**: bun, node, turbo, biome, docker are expected to be installed globally with no enforcement

The `.repos/effect-v4/flake.nix` provides a reference pattern already used by the Effect upstream:

```nix
{
  inputs = { nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable"; };
  outputs = {nixpkgs, ...}: let
    forAllSystems = function:
      nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (
        system: function nixpkgs.legacyPackages.${system}
      );
  in {
    formatter = forAllSystems (pkgs: pkgs.alejandra);
    devShells = forAllSystems (pkgs: {
      default = pkgs.mkShell {
        packages = with pkgs; [ bun deno corepack nodejs_24 python3 ];
      };
    });
  };
}
```

With `.envrc` containing simply: `use flake`

### Key Problems This Research Addresses

1. **Onboarding friction**: New contributors must manually install bun, node, turbo, biome, docker, etc.
2. **Version drift**: Multiple version files disagree (.bun-version vs packageManager, .nvmrc vs CI)
3. **No reproducibility guarantee**: Everyone's machine may have different tool versions
4. **CI/local parity**: CI configures tools differently than local dev
5. **No environment activation**: Developers must manually switch to correct tool versions

---

## Recommendations

### 1. Nix Flake (flake.nix)

- **What**: Declarative, reproducible dev shell defining all system-level tools for the monorepo
- **Why**: Eliminates onboarding friction and version drift -- every developer gets the exact same bun, node, turbo, biome, and supporting tools. Replaces the conflicting `.bun-version` / `.nvmrc` / `packageManager` field problem with a single source of truth.
- **Type**: New tool
- **Maturity**: Stable (Nix flakes have been the de facto standard since 2022; nixpkgs packages bun, node, turbo, biome)
- **Effort**: Medium (2-3hr) -- flake.nix is ~30 lines for this repo, but team needs nix installed
- **Priority**: P1 (high value) -- single biggest improvement for reproducibility
- **Bun compatible**: Yes -- `pkgs.bun` is in nixpkgs-unstable, tracks recent releases. There was a historical "Illegal Instruction" bug on some CPUs (nixpkgs issue #19946) that has been resolved in recent nixpkgs.
- **Pros**:
  - Pins exact versions of bun, node, turbo, biome, docker CLI, jq, etc. via `flake.lock`
  - Works on Linux and macOS (including Apple Silicon)
  - `flake.lock` is committed -- reproducible across machines and CI
  - Effect upstream (effect-smol) already uses this exact pattern
  - Eliminates `.bun-version` / `.nvmrc` / `packageManager` version disagreements
  - Can build reproducible Docker/OCI images via `dockerTools.buildLayeredImage`
  - Nix store deduplicates packages across projects
- **Cons**:
  - Nix itself must be installed (one-time ~2min via Determinate installer)
  - Learning curve for Nix language if customization is needed
  - ~1-2 GB disk space for initial Nix store population
  - Non-Nix users can still use the repo (tools just aren't auto-managed)
  - Bun in nixpkgs may lag behind latest release by a few days/weeks
- **Conflicts with**: None (additive; existing `.bun-version` / `.nvmrc` can coexist as fallbacks)
- **Config snippet**:

```nix
# flake.nix
{
  description = "beep-effect2 monorepo dev environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      forAllSystems = fn:
        nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (
          system: fn nixpkgs.legacyPackages.${system}
        );
    in
    {
      formatter = forAllSystems (pkgs: pkgs.nixfmt-rfc-style);

      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            # JS/TS runtime
            bun
            nodejs_22
            corepack

            # Build orchestration
            turbo

            # Linting & formatting
            biome

            # Infrastructure
            docker-compose

            # Git hooks
            lefthook

            # Utilities
            jq
            yq-go
          ];

          shellHook = ''
            echo "beep-effect2 dev shell activated"
            echo "  bun:   $(bun --version)"
            echo "  node:  $(node --version)"
            echo "  turbo: $(turbo --version 2>/dev/null | head -1)"
          '';
        };
      });
    };
}
```

---

### 2. direnv + nix-direnv

- **What**: Automatic shell activation when you `cd` into the project -- loads the Nix devShell without manual `nix develop`
- **Why**: Without direnv, developers must remember to run `nix develop` every time they open a terminal in the repo. direnv makes the correct environment load transparently.
- **Type**: New tool
- **Maturity**: Stable (nix-direnv has 1.8k+ GitHub stars, maintained by nix-community)
- **Effort**: Low (< 1hr) -- one `.envrc` file + one-time direnv install
- **Priority**: P1 (high value) -- the UX layer that makes the flake practical for daily use
- **Bun compatible**: Yes
- **Pros**:
  - Transparent activation: `cd` into repo and tools are available
  - Caches the devShell evaluation -- subsequent activations are instant (~50ms)
  - Prevents Nix garbage collection of downloaded packages (GC roots)
  - Falls back gracefully if the flake fails to evaluate
  - Works with every shell (bash, zsh, fish)
  - IDE integration (VS Code direnv extension, IntelliJ, etc.)
- **Cons**:
  - Requires `direnv` + `nix-direnv` installed (one-time setup)
  - First activation after `flake.lock` update is slow (~10-30s while Nix evaluates)
  - `.envrc` must be explicitly allowed per-repo (`direnv allow`)
- **Conflicts with**: None
- **Config snippet**:

```bash
# .envrc
if ! has nix_direnv_version || ! nix_direnv_version 3.0.6; then
  source_url "https://raw.githubusercontent.com/nix-community/nix-direnv/3.0.6/direnvrc" \
    "sha256-RYcUJaRMf8oF6LnmvBQGsDD1ILeqONc2B9uDSQ0VrPQ="
fi

use flake
```

For a simpler setup if nix-direnv is already installed system-wide:

```bash
# .envrc (minimal)
use flake
```

---

### 3. devenv.sh (Alternative to Raw Flake)

- **What**: Higher-level Nix-based dev environment tool that wraps flakes with a more approachable configuration language and built-in service management
- **Why**: If the team finds raw `flake.nix` too low-level, devenv.sh provides a friendlier abstraction with native monorepo support (v1.10+), language presets, and service management (could replace docker-compose for Postgres/Redis).
- **Type**: New tool (alternative to recommendation #1)
- **Maturity**: Growing (v1.10, backed by Cachix, active development, 5k+ GitHub stars)
- **Effort**: Medium (2-4hr) -- slightly more setup than raw flake due to devenv CLI + config
- **Priority**: P2 (nice to have) -- raw flake is simpler for this repo's needs
- **Bun compatible**: Yes -- `languages.javascript.bun.enable = true` is first-class
- **Pros**:
  - `languages.javascript.bun.enable = true` auto-configures Bun
  - `languages.typescript.enable = true` adds TypeScript tooling
  - Native service management: `services.postgres.enable = true` could replace docker-compose
  - Monorepo support via `devenv.yaml` imports (v1.10+)
  - Built-in pre-commit hooks integration
  - Tasks system for project scripts
  - Profiles for selective environment composition
  - `devenv.local.nix` for per-developer overrides
- **Cons**:
  - Extra abstraction layer on top of Nix -- debugging issues requires understanding both devenv and Nix
  - devenv CLI is separate from Nix (another tool to install)
  - Using devenv through flakes has reduced features vs. the standalone CLI
  - Service management is less battle-tested than docker-compose for complex stacks (pgvector, OTEL-LGTM)
  - Migration from docker-compose to devenv services is non-trivial for the existing Grafana/OTEL stack
  - Not as widely adopted as raw flakes in the Effect ecosystem
- **Conflicts with**: Recommendation #1 (choose one or the other, not both)
- **Config snippet**:

```nix
# devenv.nix
{ pkgs, ... }: {
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    bun = {
      enable = true;
      install.enable = true;
    };
  };

  languages.typescript.enable = true;

  packages = with pkgs; [
    turbo
    biome
    lefthook
    jq
  ];

  services.postgres = {
    enable = true;
    extensions = e: [ e.pgvector ];
    initialDatabases = [{ name = "beep"; }];
  };

  services.redis.enable = true;

  enterShell = ''
    echo "beep-effect2 devenv activated"
  '';
}
```

```yaml
# devenv.yaml
inputs:
  nixpkgs:
    url: github:nixos/nixpkgs/nixpkgs-unstable
```

**Recommendation**: Start with the raw flake (#1) since it matches Effect upstream patterns and is simpler for this repo. Revisit devenv.sh if you want to replace docker-compose with Nix-managed services later.

---

### 4. Determinate Nix Installer

- **What**: The recommended Nix installer from Determinate Systems -- installs Nix with flakes enabled by default, better macOS support, and clean uninstall
- **Why**: The official Nix installer has historically been rough (no flakes by default, messy uninstall). The Determinate installer is the standard recommendation for teams adopting Nix in 2025/2026.
- **Type**: New tool (one-time install)
- **Maturity**: Stable (7M+ installs, used by most Nix tutorials and CI setups)
- **Effort**: Low (< 5min per developer)
- **Priority**: P1 (prerequisite for recommendations #1 and #2)
- **Bun compatible**: N/A (installs Nix itself, not Bun)
- **Pros**:
  - Flakes and `nix-command` enabled by default (no manual config editing)
  - Clean uninstall support (`/nix/nix-installer uninstall`)
  - Works on macOS (including Apple Silicon) and Linux
  - Managed security updates via Determinate Nix distribution
  - Used by GitHub Actions (`DeterminateSystems/nix-installer-action`)
- **Cons**:
  - As of 2026, installs "Determinate Nix" (their downstream distribution) rather than upstream NixOS/nix
  - Requires trust in Determinate Systems as a vendor
  - Some Nix purists prefer upstream -- but for dev environments this is fine
- **Conflicts with**: Existing Nix installations (if any team members already have Nix)
- **Config snippet**:

```bash
# One-liner install (add to README or onboarding docs)
curl --proto '=https' --tlsv1.2 -sSf -L \
  https://install.determinate.systems/nix | sh -s -- install
```

---

### 5. Magic Nix Cache (CI Caching)

- **What**: Free, zero-config GitHub Actions cache for Nix store paths -- uses GitHub's built-in cache API to persist Nix builds between CI runs
- **Why**: If this repo adopts Nix for CI (e.g., `nix develop --command turbo build`), the Nix store needs caching to avoid re-downloading/rebuilding tools every run. Magic Nix Cache is the simplest, free option.
- **Type**: New tool (CI only)
- **Maturity**: Growing (backed by Determinate Systems, uses undocumented GitHub cache API which could change)
- **Effort**: Low (< 30min) -- two lines in a GitHub Actions workflow
- **Priority**: P2 (nice to have) -- only relevant if CI uses Nix; the repo currently has no CI quality gates at all
- **Bun compatible**: N/A (CI infrastructure)
- **Pros**:
  - Completely free (uses GitHub Actions cache, no external service)
  - Zero configuration -- add the action and it works
  - No secrets or tokens needed
  - Forks and PRs benefit from the cache too
  - Saves 30-50%+ of Nix-related CI time
- **Cons**:
  - GitHub Actions cache has a 10 GB per-repo limit
  - Uses reverse-engineered GitHub cache API -- could break if GitHub changes it
  - Only works on GitHub Actions (not GitLab CI, etc.)
  - Generates many cache entries, making cache management harder
- **Conflicts with**: Cachix (alternative, see below)
- **Config snippet**:

```yaml
# .github/workflows/check.yml (excerpt)
- uses: DeterminateSystems/nix-installer-action@main
- uses: DeterminateSystems/magic-nix-cache-action@main
- run: nix develop --command turbo build
```

---

### 6. Cachix (CI Caching Alternative)

- **What**: Dedicated Nix binary cache service -- push/pull pre-built Nix packages to a shared cache
- **Why**: More robust than Magic Nix Cache for larger teams or if GitHub's cache API proves unreliable. Also works across CI providers.
- **Type**: New tool (CI + optional local)
- **Maturity**: Stable (the original Nix caching service, maintained by cachix/devenv team)
- **Effort**: Medium (1-2hr) -- requires account creation, auth token setup
- **Priority**: P2 (nice to have) -- overkill for this repo's current size
- **Bun compatible**: N/A (CI infrastructure)
- **Pros**:
  - Purpose-built for Nix -- reliable and well-understood
  - Works across CI providers (GitHub, GitLab, etc.)
  - Shared cache between CI and local dev (optional)
  - Properly handles Nix store paths and signatures
- **Cons**:
  - Free tier: 5 GB for open-source projects only
  - Paid plans needed for private repos (starts at ~$50/mo)
  - Requires managing auth tokens as CI secrets
  - Additional service dependency
- **Conflicts with**: Magic Nix Cache (#5) -- choose one, though they can technically coexist
- **Config snippet**:

```yaml
# .github/workflows/check.yml (excerpt)
- uses: DeterminateSystems/nix-installer-action@main
- uses: cachix/cachix-action@v15
  with:
    name: beep-effect2
    authToken: '${{ secrets.CACHIX_AUTH_TOKEN }}'
- run: nix develop --command turbo build
```

---

### 7. mise (formerly rtx) -- Lightweight Alternative

- **What**: Rust-based polyglot version manager that pins tool versions via `.mise.toml` -- replaces asdf, nvm, fnm, and partially direnv
- **Why**: If the team does not want to adopt Nix, mise is the lightest-weight option that solves the version pinning problem. It manages bun, node, and other tools with automatic version switching.
- **Type**: New tool (alternative to Nix approach)
- **Maturity**: Stable (18k+ GitHub stars, very active development, Rust-based, fast)
- **Effort**: Low (< 1hr) -- `.mise.toml` is ~10 lines, install is a one-liner
- **Priority**: P1 if not using Nix; P2 if using Nix (redundant)
- **Bun compatible**: Yes -- `mise use bun@1.3.9` works out of the box
- **Pros**:
  - Near-zero learning curve -- simpler than Nix by an order of magnitude
  - Automatic version switching when entering directory (like direnv)
  - `.mise.toml` is human-readable and version-controlled
  - Supports bun, node, turbo, biome, and 800+ other tools
  - Task runner built-in (can replace some npm scripts)
  - Environment variable management (`.env` replacement)
  - Compatible with `.tool-versions` (asdf) and `.node-version` / `.nvmrc` files
  - Very fast -- written in Rust, activations are sub-millisecond
- **Cons**:
  - Does NOT pin system-level dependencies (libc, openssl, etc.) -- only tool binaries
  - Less reproducible than Nix -- downloads pre-built binaries, not hermetic builds
  - Cannot build Docker images or manage services
  - No lockfile equivalent to `flake.lock` for deep dependency pinning
  - Another tool to install (though simpler than Nix)
- **Conflicts with**: Nix flake (#1) for version management -- use one or the other
- **Config snippet**:

```toml
# .mise.toml
[tools]
bun = "1.3.9"
node = "22"
# turbo and biome installed via bun, not mise

[env]
_.path = ["./node_modules/.bin"]
```

---

### 8. proto (by moonrepo) -- Monorepo-Native Alternative

- **What**: Pluggable multi-language toolchain manager designed for monorepos -- extracts version from `package.json#packageManager` and ecosystem files
- **Why**: Proto is specifically designed for monorepos and integrates with moon (a monorepo build system). It contextually detects versions from package.json, making it a natural fit if you want version management without Nix.
- **Type**: New tool (alternative to Nix or mise)
- **Maturity**: Growing (3k+ GitHub stars, backed by moonrepo, plugin ecosystem via Wasm)
- **Effort**: Low (< 1hr)
- **Priority**: P2 (nice to have) -- mise is more mature and widely adopted
- **Bun compatible**: Yes -- first-class Bun support
- **Pros**:
  - Reads `package.json#packageManager` field natively -- no separate config needed
  - Deterministic: ensures same tool versions across dev/CI/prod
  - Plugin system via Wasm -- extensible without forking
  - Contextual version detection from ecosystem files
  - Pairs well with moon if you ever consider replacing turbo
- **Cons**:
  - Smaller community than mise or Nix
  - Less tool coverage than mise (though growing via Wasm plugins)
  - Tied to moonrepo ecosystem -- if moonrepo stalls, proto may too
  - Same limitations as mise: no system-level dependency pinning
- **Conflicts with**: mise (#7) and Nix (#1) -- choose one version manager
- **Config snippet**:

```toml
# .prototools
bun = "1.3.9"
node = "22"

[plugins]
turbo = "source:https://raw.githubusercontent.com/moonrepo/turbo-plugin/master/plugin.toml"
```

---

### 9. Nix-based OCI/Docker Image Builds

- **What**: Build Docker/OCI images from Nix derivations using `dockerTools.buildLayeredImage` or `nix2container` -- produces minimal, reproducible images without Dockerfiles
- **Why**: The repo already uses docker-compose for local services. When it comes time to deploy, Nix can produce bit-for-bit reproducible container images with only the exact dependencies needed (no base image bloat).
- **Type**: New tool (future deployment)
- **Maturity**: Stable (dockerTools is part of nixpkgs; nix2container is well-maintained)
- **Effort**: High (4hr+) -- requires understanding Nix derivations and container layering
- **Priority**: P2 (nice to have) -- not needed until the repo has deployable services
- **Bun compatible**: Yes -- can include Bun runtime in container images
- **Pros**:
  - Bit-for-bit reproducible images (same inputs = same image hash)
  - Minimal image size -- only includes what you declare (no Ubuntu/Alpine bloat)
  - Each dependency is its own layer -- excellent Docker cache efficiency
  - Supply-chain security: every dependency is tracked and auditable
  - No Dockerfile needed
- **Cons**:
  - Significant Nix expertise required
  - Different mental model than Dockerfile (declarative vs. imperative)
  - Debugging image issues requires Nix knowledge
  - Not relevant until the repo has services to deploy
- **Conflicts with**: Traditional Dockerfiles (replaces them)
- **Config snippet**:

```nix
# In flake.nix outputs (future addition)
packages = forAllSystems (pkgs: {
  docker-image = pkgs.dockerTools.buildLayeredImage {
    name = "beep-api";
    tag = "latest";
    contents = with pkgs; [ bun nodejs_22 cacert ];
    config = {
      Cmd = [ "${pkgs.bun}/bin/bun" "run" "start" ];
      WorkingDir = "/app";
    };
  };
});
```

---

### 10. bun2nix (Reproducible node_modules)

- **What**: Converts `bun.lock` into Nix expressions, enabling reproducible `node_modules` builds within Nix
- **Why**: Bridges the gap between Bun's package resolution and Nix's reproducibility -- useful for CI and container builds where you want hermetic JS dependency installation.
- **Type**: New tool (future CI/deployment)
- **Maturity**: Bleeding-edge (new project, Rust-based, actively developed)
- **Effort**: High (4hr+) -- requires Nix packaging knowledge and debugging lockfile translation
- **Priority**: P2 (nice to have) -- only relevant for hermetic CI builds or Nix-based Docker images
- **Bun compatible**: Yes -- specifically designed for Bun lockfiles
- **Pros**:
  - Hermetic node_modules: every JS dependency is pinned and reproducible
  - Integrates with `mkBunDerivation` for full Nix packaging
  - Enables `--frozen-lockfile` + `--ignore-scripts` for security
- **Cons**:
  - Very new -- may have edge cases with complex dependency trees
  - Adds complexity to the build pipeline
  - Most teams don't need this level of reproducibility for dev dependencies
- **Conflicts with**: None (additive)
- **Config snippet**: See [bun2nix documentation](https://github.com/baileyluTCD/bun2nix)

---

## Decision Matrix

| Approach | Reproducibility | Learning Curve | Onboarding Time | CI Integration | System Deps | Effort |
|----------|----------------|----------------|-----------------|----------------|-------------|--------|
| **Nix flake + direnv** | Full (system + tools) | Steep (Nix lang) | 5min (if Nix installed) | Excellent | Yes | Medium |
| **devenv.sh** | Full (system + tools + services) | Moderate | 5min (if Nix installed) | Good | Yes | Medium |
| **mise** | Partial (tools only) | Minimal | 2min | Good | No | Low |
| **proto** | Partial (tools only) | Minimal | 2min | Good | No | Low |
| **Nothing (status quo)** | None | None | Manual (30min+) | Poor | No | None |

---

## Recommended Path for This Repo

### Phase 1: Immediate (P1) -- Nix Flake + direnv

1. Add `flake.nix` to repo root (based on effect-smol pattern)
2. Add `.envrc` with `use flake`
3. Add `flake.nix` and `flake.lock` to git
4. Add `.direnv/` to `.gitignore`
5. Update README with Nix install instructions (Determinate installer one-liner)
6. Keep `.bun-version` and `.nvmrc` as fallbacks for non-Nix users

**Why this first**: It matches the Effect ecosystem pattern (effect-smol uses the same setup), eliminates the version mismatch problem, and provides the foundation for all other Nix-based improvements.

### Phase 2: CI Integration (P2)

1. Add `DeterminateSystems/nix-installer-action` to CI workflow
2. Add `DeterminateSystems/magic-nix-cache-action` for caching
3. Run CI commands via `nix develop --command <cmd>`
4. This ensures CI uses the exact same tool versions as local dev

### Phase 3: Future (P2)

1. Evaluate devenv.sh for replacing docker-compose services
2. Consider bun2nix for hermetic CI builds
3. Consider Nix-based OCI images when the repo has deployable services

### Non-Nix Fallback

If the team decides Nix is too heavy, use **mise** instead:

1. Add `.mise.toml` pinning bun and node versions
2. Remove `.bun-version` and `.nvmrc` (mise reads them but `.mise.toml` is canonical)
3. Lower reproducibility but much simpler adoption

---

## FAQ

**Q: Do I need Nix to contribute to this repo?**
A: No. The flake is opt-in. You can still use bun/node installed via any method. The `.bun-version` and `.nvmrc` files remain as version hints for non-Nix workflows.

**Q: Does Nix replace Bun as the package manager?**
A: No. Nix manages the _tools_ (bun binary, node binary, turbo, etc.). Bun still manages JS dependencies via `bun install` and `bun.lock`.

**Q: What about Docker? Does Nix replace docker-compose?**
A: Not in Phase 1. The existing docker-compose.yml for Postgres/Redis/Grafana stays. devenv.sh _could_ replace it later (Phase 3) but the current docker-compose setup works well, especially for pgvector and the OTEL-LGTM stack.

**Q: How does this interact with CI?**
A: Phase 2 adds Nix to CI, ensuring CI uses the same tool versions as local dev. `nix develop --command turbo build` runs turbo inside the Nix devShell. Magic Nix Cache prevents re-downloading tools every CI run.

**Q: Is Nix on Manjaro/Arch easy?**
A: Yes. Nix runs alongside the system package manager. The Determinate installer works on all Linux distros. No conflicts with pacman.

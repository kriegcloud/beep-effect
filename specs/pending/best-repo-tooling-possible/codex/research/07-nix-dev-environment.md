# Nix & Dev Environment

## Current State
- `flake.nix` and `flake.lock` are missing in the current repo state.
- Nix-based onboarding and CI cache strategy are therefore not active.
- Docker Compose exists for runtime services, but shell/toolchain reproducibility is not declaratively captured in Nix.
- Current quality: `outdated` relative to the stated Nix-flake target.

## Recommendations

### Reintroduce Canonical `flake.nix` + `flake.lock`
- What: Add a root flake that pins Bun, Node fallback, and core CLI tooling needed for repo workflows.
- Why: Eliminates "works on my machine" drift and makes onboarding deterministic.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P0 (must-have)
- Bun compatible: Yes
- Pros: Reproducible environments, explicit toolchain governance.
- Cons: Team must be comfortable with Nix workflow.
- Conflicts with: None.
- Config snippet:
```nix
{
  description = "beep-effect3 dev shell";
  outputs = { self, nixpkgs }: {
    devShells.x86_64-linux.default =
      let pkgs = import nixpkgs { system = "x86_64-linux"; };
      in pkgs.mkShell {
        packages = [ pkgs.bun pkgs.nodejs_22 pkgs.git pkgs.just ];
      };
  };
}
```

### direnv + nix-direnv Auto-shell
- What: Add `.envrc` using `use flake` and standardize on `nix-direnv`.
- Why: Developers get automatic shell activation without manual `nix develop` repetition.
- Type: New tool
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Better DX for daily development.
- Cons: Requires direnv installation and trust setup.
- Conflicts with: None.
- Config snippet:
```bash
# .envrc
use flake
```

### devenv.sh vs Raw Flakes Decision
- What: Keep raw flakes for minimalism now; optionally adopt `devenv.sh` if service/process orchestration grows.
- Why: Raw flakes are simpler and sufficient today; `devenv.sh` is valuable when dev shell also manages services/tasks/secrets.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P2 (nice to have)
- Bun compatible: Yes
- Pros: Explicit decision avoids premature complexity.
- Cons: May require future migration if environment complexity increases.
- Conflicts with: None.
- Config snippet:
```md
Decision: Start with raw `flake.nix`; re-evaluate `devenv.sh` after CI + local service orchestration requirements are formalized.
```

### Nix CI Binary Cache
- What: Add Nix cache action (`nix-community/cache-nix-action` or equivalent) for CI jobs using flake shells.
- Why: Without binary cache, Nix CI can be slow; cache restores make checks practical.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Major CI speedup for Nix-based steps.
- Cons: Requires cache policy/security decisions.
- Conflicts with: None.
- Config snippet:
```yaml
- uses: nix-community/cache-nix-action@v7
  with:
    primary-key: nix-${{ runner.os }}-${{ hashFiles('flake.lock') }}
```

## Head-to-Head Notes
- Raw flakes vs `devenv.sh`:
  - Raw flakes: best for minimal reproducible toolchain and low maintenance.
  - `devenv.sh`: better when you need integrated services, process orchestration, and env templating.
- Recommendation: re-establish raw flakes first, then decide on `devenv.sh` based on actual complexity.

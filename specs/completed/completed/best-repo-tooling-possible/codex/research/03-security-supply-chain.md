# Security & Supply Chain

## Current State
- No dedicated CI security workflow exists (only release workflow is present).
- No explicit dependency vulnerability gate is configured in scripts/workflows.
- No repository-wide secret scanning gate is configured in CI.
- No explicit license policy enforcement tool is configured.
- `bunfig.toml` already has `strict-peer-dependencies = true`, which is good, but no package age gate is configured.
- Current quality: `needs tuning`.

## Recommendations

### Bun Audit + CI Gate
- What: Add `bun audit --json` to CI and fail on `high`/`critical` advisories.
- Why: Bun is primary runtime/package manager, so first-party vulnerability checks should run on every PR.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P0 (must-have)
- Bun compatible: Yes
- Pros: Native Bun command, zero extra dependency.
- Cons: Advisory coverage differs from third-party scanners.
- Conflicts with: None.
- Config snippet:
```yaml
- name: Dependency audit
  run: bun audit --audit-level=high
```

### OSV-Scanner (Ecosystem-agnostic Vulnerability Layer)
- What: Add OSV-Scanner in CI for an additional vulnerability source independent of Bun advisories.
- Why: Defense in depth; catches vulnerabilities from OSV feeds and broad ecosystem databases.
- Type: New tool
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Fast, widely used, simple CI integration.
- Cons: Bun lockfile handling may require SBOM-based workflow depending on scanner support.
- Conflicts with: None.
- Config snippet:
```yaml
- name: OSV scan
  uses: google/osv-scanner-action@v2
  with:
    scan-args: |- 
      --recursive .
```

### License Compliance via ORT (OSS Review Toolkit)
- What: Use ORT to enforce allowed/denied licenses and produce compliance reports in CI.
- Why: Apache-2.0 repo with many transitive deps needs explicit policy checks before release.
- Type: New tool
- Maturity: Stable
- Effort: High (4hr+)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Enterprise-grade policy engine, SPDX-centric outputs, strong audit trail.
- Cons: Heavier setup (JVM tooling, policy files, CI time).
- Conflicts with: None.
- Config snippet:
```yaml
- name: ORT scan
  run: |
    ort --info analyze -i . -o .ort
    ort --info evaluate -i .ort/analyzer-result.yml -o .ort
```

### Secret Scanning Baseline (Gitleaks)
- What: Add Gitleaks to CI and optional pre-commit hook.
- Why: Prevent accidental token/API secret commits in a fast-moving monorepo.
- Type: New tool
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P0 (must-have)
- Bun compatible: Yes
- Pros: Simple setup, high adoption, supports allowlists and baseline files.
- Cons: False positives need periodic rule tuning.
- Conflicts with: None.
- Config snippet:
```yaml
- name: Gitleaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Verified Secret Exposure Scan (TruffleHog)
- What: Add scheduled TruffleHog scans (nightly/weekly) for deeper credential detection and verification.
- Why: Complements Gitleaks by validating many secret types against providers where possible.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Better signal for live credential leaks.
- Cons: Heavier runtime; best as scheduled job, not every PR.
- Conflicts with: None.
- Config snippet:
```yaml
- name: TruffleHog
  uses: trufflesecurity/trufflehog@main
  with:
    path: .
    base: main
    head: HEAD
```

### SAST for TypeScript (CodeQL or Semgrep)
- What: Add one primary static analysis engine: CodeQL (GitHub-native) or Semgrep (portable, rules-as-code).
- Why: Lint/type checks do not catch all security anti-patterns; SAST closes this gap.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Security-focused patterns beyond style/linting.
- Cons: Requires triage process for findings.
- Conflicts with: Duplicate findings if both engines run full rule packs.
- Config snippet:
```yaml
- uses: github/codeql-action/init@v4
  with:
    languages: javascript-typescript
- uses: github/codeql-action/analyze@v4
```

### Bun Supply-Chain Hardening (`minimumReleaseAge`, trusted deps)
- What: Add package age gate and explicit trusted dependency policy in Bun config.
- Why: Reduces risk from freshly-published malicious packages and uncontrolled install scripts.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P0 (must-have)
- Bun compatible: Yes
- Pros: Native Bun control, low overhead.
- Cons: Can delay urgent patch uptake if age threshold is too strict.
- Conflicts with: None.
- Config snippet:
```toml
[install]
minimumReleaseAge = 259200
trustedDependencies = ["sharp", "@swc/core"]
```

## Head-to-Head Notes
- Dependency auditing:
  - `bun audit`: best baseline for Bun-native workflow.
  - `OSV-Scanner`: strong second source, ecosystem-agnostic.
  - `Snyk`/`Socket`: richer policy/UIs, but higher integration overhead and often org-level cost.
- Secret scanning:
  - `Gitleaks`: best PR-gate baseline.
  - `TruffleHog`: stronger verified detections for scheduled deep scans.

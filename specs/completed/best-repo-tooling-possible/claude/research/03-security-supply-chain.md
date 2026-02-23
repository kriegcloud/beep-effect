# Security & Supply Chain

## Current State in This Repo

**Security posture: None.** The audit (`00-current-state-audit.md`) explicitly lists every security category as "Not present":

- No dependency auditing or vulnerability scanning
- No secret scanning (no pre-commit, no CI)
- No license compliance checking
- No SAST / static analysis (Biome covers style, not security)
- No supply chain attestation or SBOM generation
- No dependency review on PRs
- No GitHub Advanced Security features enabled
- Only one CI workflow (`release.yml`) -- no `check.yml`, no quality gates at all

**Package manager**: Bun 1.3.2 (`.bun-version`) / 1.3.9 (`packageManager` field) -- version mismatch noted in audit. Bun 1.3.x predates `bun audit` (introduced in Bun 1.2.15, May 2025). The repo would need Bun >= 1.2.15 to use native audit, but the version mismatch means the repo is on a much older Bun. A Bun upgrade is a prerequisite for several recommendations below.

**Git hooks**: Lefthook is configured for pre-commit (biome + jsdoc) and pre-push (typecheck + test). No secret scanning hook exists.

**CI**: Only `release.yml` exists. No PR checks workflow. Any security tooling in CI requires a new `check.yml` workflow first.

**Lockfile**: `bunfig.toml` has `saveTextLockfile = true`, meaning a text-format `bun.lock` is generated. This is relevant for tool compatibility -- some tools only support the binary `bun.lockb`, others require the text `bun.lock`.

---

## Recommendations

### 1. Dependency Auditing

---

### OSV-Scanner (Google)
- **What**: Open-source vulnerability scanner that checks dependencies against the OSV.dev database across 19+ lockfile formats
- **Why**: This repo has zero dependency auditing. OSV-Scanner is the best free option that natively supports `bun.lock`, runs in CI, and provides remediation guidance (v2.0+)
- **Type**: New tool
- **Maturity**: Stable (v2.0 released March 2025, backed by Google)
- **Effort**: Low (< 1hr) -- GitHub Action is plug-and-play
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes -- supports `bun.lock` text lockfile natively (added via issue #1405)
- **Pros**:
  - Completely free and open-source (Apache-2.0)
  - Supports bun.lock natively
  - Two GitHub Action modes: PR-only (new vulns) and full scan (scheduled)
  - v2.0 adds remediation suggestions, container scanning, HTML reports
  - Backed by OSV.dev -- the largest open vulnerability database
  - No API keys or accounts needed
  - Can generate SBOM enriched with vulnerability data
- **Cons**:
  - Does not detect malicious packages (only known CVEs)
  - Requires lockfile to be committed (text lockfile is already configured via `saveTextLockfile`)
  - No real-time monitoring (scan-based only)
- **Conflicts with**: None
- **Config snippet**:
```yaml
# .github/workflows/check.yml (add to PR checks workflow)
- name: OSV-Scanner
  uses: google/osv-scanner-action/osv-scanner-action@v2
  with:
    scan-args: |-
      --lockfile=bun.lock
      --format=gh-annotations
```

---

### Socket.dev
- **What**: Supply chain security platform that detects malicious packages, typosquatting, install scripts, and obfuscated code -- threats that CVE scanners miss
- **Why**: OSV-Scanner catches known CVEs but not zero-day supply chain attacks. The Bun ecosystem is actively targeted (Shai-Hulud 2.0 malware campaign used Bun as execution environment). Socket fills the gap OSV-Scanner leaves
- **Type**: New tool
- **Maturity**: Stable (funded, production-grade, used by major OSS projects)
- **Effort**: Low (< 1hr) -- install GitHub App, done
- **Priority**: P1 (high value)
- **Bun compatible**: Partial -- analyzes npm packages (which Bun uses), but lockfile parsing support for `bun.lock` may be limited; works via GitHub App on the dependency graph
- **Pros**:
  - Free for open-source projects and small teams (GitHub App, no limits on public repos)
  - Catches threats CVE scanners miss: malicious code, install scripts, obfuscation, typosquatting
  - Inline PR comments showing exactly what changed and why it is risky
  - 5-minute setup (just install GitHub App)
  - Proactively audits every npm package
- **Cons**:
  - Paid plans required for private repos beyond small team tier
  - Does not replace CVE scanning (complementary to OSV-Scanner)
  - Bun lockfile support less mature than npm/yarn/pnpm
  - SaaS dependency -- sends dependency data to Socket servers
- **Conflicts with**: None (complementary to OSV-Scanner)
- **Config snippet**:
```
# No config file needed -- install the GitHub App:
# https://github.com/apps/socket-security
# Socket automatically scans PRs after installation
```

---

### bun audit (Native)
- **What**: Built-in Bun command that checks installed packages against npm's vulnerability advisory database
- **Why**: Zero-config, native to the package manager already in use. Fastest path to basic vulnerability checking locally and in CI
- **Type**: New tool (requires Bun upgrade from 1.3.x to >= 1.2.15)
- **Maturity**: Growing (introduced May 2025 in Bun 1.2.15)
- **Effort**: Low (< 1hr) -- single command, but requires Bun version upgrade first
- **Priority**: P1 (high value)
- **Bun compatible**: Yes -- it IS Bun
- **Pros**:
  - Zero dependencies, zero config
  - Uses npm advisory database (same as `npm audit`)
  - Can be added to CI and local scripts immediately
  - `@bun-security-scanner/osv` provides install-time scanning via `bunfig.toml`
- **Cons**:
  - Requires Bun >= 1.2.15 (repo is on 1.3.2 which predates this -- Bun version numbering is non-semver, 1.2.x came after 1.1.x)
  - Less comprehensive than OSV-Scanner (npm advisories only, no SBOM)
  - No `bun audit fix` yet (issue #20238 open)
  - No GitHub Action output format
- **Conflicts with**: None (complementary to OSV-Scanner)
- **Config snippet**:
```bash
# In CI or package.json scripts:
bun audit

# For install-time scanning, add to bunfig.toml:
# [install.security]
# scanner = "@bun-security-scanner/osv"
```

---

### Snyk (Not Recommended for This Repo)
- **What**: Commercial SCA platform with vulnerability database, fix PRs, and container scanning
- **Why not**: Free tier is limited (200 tests/month, 1 org), no native Bun lockfile support, and the combination of OSV-Scanner + Socket covers the same ground for free
- **Type**: N/A
- **Priority**: P2 (nice to have) -- only if the repo goes commercial and needs compliance reporting
- **Bun compatible**: No -- does not parse `bun.lock` or `bun.lockb`; requires `package-lock.json` workaround
- **Pros**: Largest vulnerability database, automated fix PRs, compliance dashboards
- **Cons**: Free tier limits (200 tests/month), no Bun support, vendor lock-in, $25+/dev/month for teams

---

### 2. Bun-Specific Security Considerations

---

### Bun Supply Chain Hardening
- **What**: Configuration and practices to mitigate Bun-specific supply chain risks
- **Why**: Bun is actively targeted by supply chain attacks. The "Shai-Hulud 2.0" campaign (November 2025) specifically used Bun as a malware execution environment. "PackageGate" vulnerabilities affected Bun's script execution allowlist. CVE-2025-8022 exposed OS command injection in Bun's `$` shell API
- **Type**: Config upgrade
- **Maturity**: Stable (mitigations are well-understood)
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - No new tools needed -- configuration changes only
  - Blocks most common Bun attack vectors
  - `strict-peer-dependencies` already enabled in `bunfig.toml`
- **Cons**:
  - Some mitigations (like disabling install scripts) may break legitimate packages
  - Requires vigilance when adding new dependencies
- **Conflicts with**: None
- **Config snippet**:
```toml
# bunfig.toml additions
[install]
# Already present:
strict-peer-dependencies = true
saveTextLockfile = true

# Add these:
# Disable lifecycle scripts by default (preinstall, postinstall)
# Allowlist specific packages that need them
lifecycle-scripts = false

[install.lifecycle-scripts]
# Allowlist packages that legitimately need install scripts
allowed = ["esbuild", "better-sqlite3", "@biomejs/biome"]

[install.security]
# Enable install-time vulnerability scanning (Bun >= 1.2.15)
scanner = "@bun-security-scanner/osv"
```

---

### 3. License Compliance

---

### license-checker-rseidelsohn
- **What**: Actively maintained fork of the original `license-checker` that extracts and validates license information from `node_modules`
- **Why**: No license compliance checking exists in this repo. For any packages published to npm (even private), knowing transitive dependency licenses prevents legal exposure. Essential before going open-source
- **Type**: New tool
- **Maturity**: Stable (v4.4.2, actively maintained fork)
- **Effort**: Medium (1-4hr) -- needs allowlist configuration and monorepo wrapper script
- **Priority**: P2 (nice to have) -- becomes P1 if packages are published publicly
- **Bun compatible**: Partial -- reads `node_modules` which Bun populates (hoisted linker), but does not parse `bun.lock` directly
- **Pros**:
  - Reads from `node_modules` (works with any package manager including Bun's hoisted layout)
  - Supports `--production` flag to check only runtime deps
  - CSV/JSON/Markdown output for compliance reports
  - `--failOn` and `--onlyAllow` flags for CI enforcement
  - Can exclude specific packages or scopes
- **Cons**:
  - Monorepo support is limited -- `--production` flag can yield empty results in workspaces
  - Needs wrapper script to iterate workspace packages
  - Original `license-checker` is abandoned; this fork is the maintained version
  - Does not check license compatibility (only lists licenses)
- **Conflicts with**: None
- **Config snippet**:
```bash
# Add to package.json scripts:
# "license:check": "license-checker-rseidelsohn --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD;BlueOak-1.0.0' --excludePackages '@beep/*'"

# CI usage:
npx license-checker-rseidelsohn \
  --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD' \
  --excludePrivatePackages \
  --json --out licenses.json
```

---

### licensee
- **What**: License compliance checker using SPDX identifiers and Blue Oak Council ratings, with `.licensee.json` config
- **Why**: More declarative than `license-checker-rseidelsohn` -- uses SPDX categories and Blue Oak ratings rather than raw license name lists. Better for policy-as-code
- **Type**: New tool (alternative to license-checker-rseidelsohn)
- **Maturity**: Stable (actively maintained by Artless Devices)
- **Effort**: Low (< 1hr) -- `.licensee.json` config + CI step
- **Priority**: P2 (nice to have)
- **Bun compatible**: Partial -- reads `node_modules`, works with Bun's hoisted layout
- **Pros**:
  - SPDX-based allowlisting (more standards-compliant)
  - Blue Oak Council rating support (e.g., allow all "Bronze" and above)
  - Simple `.licensee.json` config file
  - Clean exit codes for CI (0 = pass, 1 = fail)
  - Per-package exceptions via config
- **Cons**:
  - Less output flexibility than license-checker-rseidelsohn (no CSV/JSON reports)
  - Same monorepo limitations (reads root `node_modules`)
  - Smaller community than license-checker
- **Conflicts with**: license-checker-rseidelsohn (pick one)
- **Config snippet**:
```json
// .licensee.json
{
  "licenses": {
    "spdx": [
      "MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause",
      "ISC", "0BSD", "BlueOak-1.0.0"
    ]
  },
  "corrections": {},
  "ignore": [
    { "scope": "@beep" }
  ]
}
```

---

### 4. Secret Scanning

---

### Gitleaks
- **What**: Fast, lightweight secret scanner that detects hardcoded secrets (API keys, tokens, passwords) in git repos using regex patterns and entropy analysis
- **Why**: Zero secret scanning exists in this repo. Gitleaks is the standard for pre-commit secret scanning -- fast enough to run on every commit without slowing down developers. Integrates directly with Lefthook (already in use)
- **Type**: New tool
- **Maturity**: Stable (v8.24+, widely adopted, CNCF landscape)
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes -- language/package-manager agnostic (scans git content)
- **Pros**:
  - Extremely fast (Go binary, scans staged files in milliseconds)
  - Pre-commit hook integration is trivial with Lefthook
  - 150+ built-in regex patterns for common secrets (AWS, GitHub, Stripe, etc.)
  - Custom pattern support via `.gitleaks.toml`
  - Can scan entire git history (`gitleaks detect`) for existing leaks
  - SARIF output for GitHub Code Scanning integration
  - Allowlist via `.gitleaksignore` for false positives
- **Cons**:
  - Cannot verify if detected secrets are still active (unlike TruffleHog)
  - Regex-based detection has inherent false positive rate
  - Does not scan non-git sources (S3 buckets, Docker images, etc.)
- **Conflicts with**: TruffleHog (pick one for pre-commit; can use both in CI)
- **Config snippet**:
```yaml
# lefthook.yml addition
pre-commit:
  parallel: true
  commands:
    biome:
      # ... existing
    jsdoc:
      # ... existing
    gitleaks:
      run: gitleaks protect --staged --redact --no-banner
      skip:
        - merge
        - rebase
```
```toml
# .gitleaks.toml (custom patterns)
[extend]
# Use default rules, extend with custom patterns

[[rules]]
id = "beep-internal-token"
description = "Beep internal API token"
regex = '''beep_[a-zA-Z0-9]{32,}'''
tags = ["token", "beep"]

[allowlist]
paths = [
  '''\.gitleaks\.toml$''',
  '''\.env\.example$''',
  '''specs/.*\.md$''',
]
```

---

### TruffleHog (CI Complement)
- **What**: Secret scanner with credential verification -- detects secrets AND checks if they are still active by testing them against the service
- **Why**: Gitleaks is better for pre-commit (faster), but TruffleHog's verification capability is valuable in CI to reduce false positives and prioritize real leaks
- **Type**: New tool (CI-only complement to Gitleaks)
- **Maturity**: Stable (Truffle Security, well-funded, active development)
- **Effort**: Low (< 1hr) for CI-only setup
- **Priority**: P2 (nice to have) -- Gitleaks alone covers most needs
- **Bun compatible**: Yes -- language/package-manager agnostic
- **Pros**:
  - Credential verification (confirms if leaked key is still active)
  - Scans broader surface area: git, S3, Docker images, Slack, etc.
  - Lower false positive rate due to verification
  - GitHub Action available
- **Cons**:
  - Slower than Gitleaks (verification adds network calls)
  - Too slow for pre-commit hooks
  - Verification requires network access (may not work in air-gapped CI)
  - More resource-intensive
- **Conflicts with**: None if used as CI complement to Gitleaks
- **Config snippet**:
```yaml
# .github/workflows/check.yml
- name: TruffleHog Secret Scan
  uses: trufflesecurity/trufflehog@main
  with:
    extra_args: --only-verified --results=verified
```

---

### 5. SAST (Static Application Security Testing)

---

### Semgrep (Open-Source CLI)
- **What**: Lightweight, fast SAST tool that finds bugs and security issues using pattern-matching rules that look like the code being analyzed
- **Why**: No SAST exists in this repo. Semgrep is the best free option for TypeScript -- fast enough for CI, with 2,000+ community rules and easy custom rule authoring. Custom rules could enforce Effect-TS security patterns (e.g., preventing raw JSON.parse, catching unsafe type assertions)
- **Type**: New tool
- **Maturity**: Stable (backed by Semgrep Inc., widely adopted)
- **Effort**: Medium (1-4hr) -- basic setup is fast, custom rules take time
- **Priority**: P1 (high value)
- **Bun compatible**: Yes -- analyzes source files, package-manager agnostic
- **Pros**:
  - Free and open-source CLI with 2,000+ community rules
  - TypeScript fully supported
  - Custom rules use YAML that mirrors source code patterns (low learning curve)
  - 20K-100K loc/sec -- fast enough for CI on every PR
  - Can encode Effect-TS conventions as security rules (e.g., ban `JSON.parse`, ban `as` casts, ban native `Error`)
  - SARIF output for GitHub Code Scanning integration
  - Runs locally and in CI (no SaaS dependency for OSS CLI)
  - Pre-commit hook support
- **Cons**:
  - Pro rules (20,000+) require paid Semgrep AppSec Platform
  - Community rules have gaps in TypeScript security coverage
  - No cross-file taint analysis in free tier (single-file only)
  - No Effect-TS-specific rules exist yet (must be authored)
- **Conflicts with**: CodeQL (overlapping but complementary)
- **Config snippet**:
```yaml
# .github/workflows/check.yml
- name: Semgrep SAST
  uses: semgrep/semgrep-action@v1
  with:
    config: >-
      p/typescript
      p/security-audit
      p/owasp-top-ten
      .semgrep/
  env:
    SEMGREP_RULES: "p/typescript p/security-audit .semgrep/"
```
```yaml
# .semgrep/effect-ts-safety.yml (custom rule example)
rules:
  - id: no-raw-json-parse
    pattern: JSON.parse(...)
    message: >
      Use Schema-based decoding instead of JSON.parse.
      See MEMORY.md coding style preferences.
    severity: ERROR
    languages: [typescript]
    metadata:
      category: correctness
      technology: [effect-ts]

  - id: no-type-assertion
    patterns:
      - pattern: $X as $Y
      - pattern-not: $X as const
    message: >
      Type assertions (as X) are banned. Fix the types properly.
    severity: ERROR
    languages: [typescript]
```

---

### CodeQL
- **What**: GitHub's semantic SAST engine with deep cross-file dataflow analysis
- **Why**: More thorough than Semgrep for complex vulnerability detection (taint tracking, dataflow analysis), and free for public repositories on GitHub
- **Type**: New tool
- **Maturity**: Stable (GitHub-backed, CodeQL v3, wide adoption)
- **Effort**: Low (< 1hr) for basic setup; Medium for custom queries
- **Priority**: P2 (nice to have) -- Semgrep covers most needs; CodeQL adds depth if repo goes public
- **Bun compatible**: Yes -- analyzes source files, package-manager agnostic
- **Pros**:
  - Free for public repositories (included with GitHub)
  - Deep semantic analysis: cross-file taint tracking, dataflow analysis
  - TypeScript/JavaScript fully supported
  - Integrated with GitHub Code Scanning (native UI)
  - 88% accuracy with only 5% false positive rate (best in class)
  - Custom queries possible via QL language
- **Cons**:
  - **Not free for private repos** -- requires GitHub Advanced Security license ($49/committer/month)
  - Slower than Semgrep (full semantic analysis takes minutes)
  - QL query language has steep learning curve vs. Semgrep's pattern YAML
  - CodeQL Action v3 deprecated in December 2026
  - No Effect-TS specific queries
- **Conflicts with**: None (complementary to Semgrep)
- **Config snippet**:
```yaml
# .github/workflows/codeql.yml (only if repo is public or has GHAS license)
name: CodeQL
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3
```

---

### SonarQube (Not Recommended)
- **What**: Code quality and security platform with broad language support
- **Why not**: Overkill for this repo. Biome already covers code quality. Semgrep is faster and more flexible for security. SonarQube Community Edition's TypeScript security rules are less comprehensive than Semgrep's, and it runs at ~0.4K loc/sec vs. Semgrep's 20-100K loc/sec
- **Type**: N/A
- **Priority**: Not recommended
- **Bun compatible**: Yes (source-level analysis)
- **Pros**: Comprehensive code quality + security in one tool, good dashboards
- **Cons**: Slow, heavy infrastructure (Java-based server), overlaps with Biome, community edition has limited security rules

---

### 6. Supply Chain Attestation

---

### npm Provenance (via Sigstore)
- **What**: SLSA Build Level 2 provenance attestation that cryptographically links published npm packages to their source code and CI build
- **Why**: The repo publishes packages via `release.yml`. Adding provenance proves packages were built from this repo's CI, not from a compromised developer machine. This is becoming table stakes for npm package trust
- **Type**: Config upgrade (one flag in existing workflow)
- **Maturity**: Stable (npm provenance GA since 2023, Sigstore-backed, SLSA v1.0 spec stable)
- **Effort**: Low (< 1hr) -- single flag addition to publish step
- **Priority**: P1 (high value) -- extremely low effort for high trust signal
- **Bun compatible**: Partial -- `npm publish --provenance` works when publishing via npm CLI in CI. If using `bun publish`, provenance support depends on Bun version
- **Pros**:
  - Single `--provenance` flag on `npm publish`
  - Cryptographic proof linking package to source commit and CI build
  - Visible on npmjs.com package page (green checkmark)
  - Uses Sigstore's public transparency log (no key management needed)
  - SLSA Build Level 2 compliance
  - Free (uses GitHub OIDC + Sigstore public good instance)
- **Cons**:
  - Only meaningful for packages published to public npm registry
  - Limited value for private/restricted packages (provenance is logged to public Sigstore transparency log)
  - Requires CI to have `id-token: write` permission for OIDC
  - `bun publish` provenance support is less mature than `npm publish`
- **Conflicts with**: None
- **Config snippet**:
```yaml
# In release.yml publish step, add --provenance flag:
- name: Publish packages via locked release script
  run: bun run release
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
    # If using npm publish under the hood:
    NPM_CONFIG_PROVENANCE: true

# Also add permissions:
permissions:
  contents: write
  pull-requests: write
  id-token: write  # Required for Sigstore OIDC
```

---

### SLSA GitHub Generator
- **What**: GitHub Action that generates SLSA Build Level 3 provenance attestations for build artifacts
- **Why**: Goes beyond npm provenance to attest the entire build pipeline. Useful if this repo produces artifacts beyond npm packages (CLIs, Docker images)
- **Type**: New tool
- **Maturity**: Stable (SLSA v1.2 RC2, SLSA GitHub Generator maintained by slsa-framework)
- **Effort**: Medium (1-4hr)
- **Priority**: P2 (nice to have) -- npm provenance covers the primary use case
- **Bun compatible**: Yes -- attestation is artifact-agnostic
- **Pros**:
  - SLSA Build Level 3 (isolated build, non-falsifiable provenance)
  - Works with any build artifact (not just npm)
  - Trusted builder pattern (provenance generated by GitHub, not user workflow)
- **Cons**:
  - More complex than `--provenance` flag
  - SLSA Level 3 adds constraints on build isolation
  - Primarily valuable for public/open-source projects
  - Private repos gain less benefit (provenance is for external consumers)
- **Conflicts with**: None (builds on top of npm provenance)
- **Config snippet**:
```yaml
# Only if producing non-npm artifacts
- uses: slsa-framework/slsa-github-generator/.github/workflows/generator_generic_slsa3.yml@v2.1.0
  with:
    base64-subjects: "${{ needs.build.outputs.digests }}"
```

---

### 7. GitHub Dependency Review

---

### GitHub Dependency Review Action
- **What**: GitHub Action that scans PR dependency changes for known vulnerabilities and license violations, blocking PRs that introduce risky dependencies
- **Why**: This repo has zero PR-time dependency checks. This action is the simplest way to gate PRs on dependency safety -- it diffs the dependency graph between base and head, flagging new vulnerabilities and license issues
- **Type**: New tool
- **Maturity**: Stable (official GitHub action, `actions/dependency-review-action`)
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Partial -- works with the GitHub dependency graph, which has growing but not complete Bun lockfile support. Falls back to `package.json` analysis. May require `package-lock.json` generation for full accuracy
- **Pros**:
  - Official GitHub action (first-party support)
  - Free for public repos; available for private repos with GitHub Advanced Security
  - Blocks PRs introducing known vulnerable dependencies
  - License checking built-in (`allow-licenses` / `deny-licenses`)
  - PR comment summary with actionable details
  - Configurable severity threshold
  - Can run alongside OSV-Scanner for defense in depth
- **Cons**:
  - Full features require GitHub Advanced Security license for private repos
  - Bun lockfile support in GitHub dependency graph is still maturing
  - Only runs on PRs (not scheduled scans)
  - Depends on GitHub's dependency graph accuracy
- **Conflicts with**: None (complementary to OSV-Scanner)
- **Config snippet**:
```yaml
# .github/workflows/check.yml
name: PR Checks
on: [pull_request]

permissions:
  contents: read
  pull-requests: write

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
          deny-licenses: GPL-3.0, AGPL-3.0
          comment-summary-in-pr: always
          allow-ghsas: []  # No exceptions
```

---

## Implementation Priority

The recommendations are ordered by implementation priority, balancing effort vs. impact:

### Phase 1: Foundation (Week 1) -- Must-have, low effort

| # | Tool | Priority | Effort | What it adds |
|---|------|----------|--------|--------------|
| 1 | Gitleaks (pre-commit) | P0 | Low | Prevent secrets from ever being committed |
| 2 | Bun supply chain hardening | P0 | Low | Disable install scripts, add security scanner |
| 3 | OSV-Scanner (CI) | P0 | Low | Block PRs with known vulnerable deps |
| 4 | GitHub Dependency Review | P1 | Low | PR-time dependency + license gating |
| 5 | npm Provenance | P1 | Low | One flag for package authenticity |

### Phase 2: Depth (Week 2) -- High value, moderate effort

| # | Tool | Priority | Effort | What it adds |
|---|------|----------|--------|--------------|
| 6 | Socket.dev (GitHub App) | P1 | Low | Malicious package detection |
| 7 | Semgrep (CI) | P1 | Medium | SAST for TypeScript + custom Effect-TS rules |
| 8 | bun audit (local + CI) | P1 | Low | Native vulnerability checking |
| 9 | Gitleaks (CI full scan) | P1 | Low | Scan entire git history for existing leaks |

### Phase 3: Compliance (Week 3+) -- Nice to have

| # | Tool | Priority | Effort | What it adds |
|---|------|----------|--------|--------------|
| 10 | licensee or license-checker | P2 | Medium | License compliance reporting |
| 11 | TruffleHog (CI) | P2 | Low | Verified secret detection |
| 12 | CodeQL | P2 | Low-Med | Deep semantic SAST (if repo goes public) |
| 13 | SLSA GitHub Generator | P2 | Medium | SLSA Level 3 attestation |

---

## Prerequisite: check.yml Workflow

Almost every recommendation above requires a CI check workflow that does not exist yet. This is the foundational piece that must be created first:

```yaml
# .github/workflows/check.yml
name: PR Checks
on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

concurrency:
  group: check-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # Quality gates (lint, typecheck, test) go here too

  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
          deny-licenses: GPL-3.0, AGPL-3.0
          comment-summary-in-pr: always

  osv-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google/osv-scanner-action/osv-scanner-action@v2
        with:
          scan-args: |-
            --lockfile=bun.lock
            --format=gh-annotations

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/typescript
            p/security-audit
            .semgrep/
```

---

## Key Bun Compatibility Summary

| Tool | Bun Compatible | Notes |
|------|---------------|-------|
| OSV-Scanner | Yes | Native `bun.lock` support |
| Socket.dev | Partial | Works via npm registry analysis; lockfile parsing evolving |
| bun audit | Yes | Requires Bun >= 1.2.15 |
| Snyk | No | No Bun lockfile support |
| Gitleaks | Yes | Package-manager agnostic |
| TruffleHog | Yes | Package-manager agnostic |
| Semgrep | Yes | Source-level analysis |
| CodeQL | Yes | Source-level analysis |
| license-checker-rseidelsohn | Partial | Reads `node_modules` (Bun hoisted layout works) |
| licensee | Partial | Reads `node_modules` |
| npm provenance | Partial | Works with `npm publish`; `bun publish` support varies |
| GitHub Dependency Review | Partial | Dependency graph Bun support maturing |

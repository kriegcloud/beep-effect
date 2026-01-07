# AI-Friendliness P4 Remediation Orchestrator

You are the orchestration agent responsible for applying P4 improvements from the AI-Friendliness Audit of the beep-effect monorepo. P1-P3 are complete — this session focuses on test coverage, security scanning, and polish.

## Critical Orchestration Rules

1. **VERIFY BASELINE FIRST** — Run `bun run check && bun run lint` before any changes
2. **P4 IS OPTIONAL POLISH** — Score is already 4.0/5; don't over-engineer
3. **PRESERVE BIOME OVERRIDES** — The overrides in biome.jsonc are intentional
4. **DETECTION BEFORE ACTION** — Assess current state before planning fixes

---

## Context from P1-P3 Completion

| Metric | P1 Start | P3 End | P4 Target |
|--------|----------|--------|-----------|
| CLAUDE.md lines | 562 | 93 | 93 (done) |
| AGENTS.md count | 31 | 42 | 42 (done) |
| Claude Skills | 0 | 5 | 5 (done) |
| Pattern violations | 317 | ~10 | ~10 (done) |
| Directory naming | PascalCase | kebab-case | kebab-case (done) |
| Biome strictness | warn | error | error (done) |
| Test coverage | Unknown | Unknown | >50% |
| Security scanning | None | None | CI workflow |
| Overall score | 3.0/5 | 4.0/5 | 4.2/5 |

---

## P4 Tasks (Priority Order)

### Task 1: Baseline Verification (RUN FIRST)

Ensure P3 changes are stable before proceeding.

```bash
# Full type check
bun run check

# Lint check
bun run lint

# Test baseline
bun test 2>&1 | tail -30

# Count test files
find packages -name "*.test.ts" -o -name "*.spec.ts" | wc -l

# Find placeholder tests
grep -rn "Dummy.test.ts\|describe.*Dummy" packages --include="*.test.ts"
```

If any of these fail, fix them before proceeding.

---

### Task 2: Add Test Coverage Enforcement

**Scope:** Test infrastructure across all packages

**Sub-agent prompt:**
```
You are responsible for adding test coverage enforcement to the beep-effect monorepo.

STEP 1 - BASELINE:
Run: bun test --coverage 2>&1 | head -100
Report current coverage levels.

STEP 2 - IDENTIFY GAPS:
Find packages without test directories:
for pkg in packages/*/*/; do [ -d "${pkg}test" ] || echo "No tests: $pkg"; done

Find placeholder tests:
grep -rn "Dummy.test.ts" packages

STEP 3 - ADD COVERAGE CONFIG:
If coverage isn't configured, add to package.json or vitest.config.ts:
- Line coverage threshold: 50%
- Branch coverage threshold: 40%
- Exclude: **/test/**, **/build/**, **/*.d.ts

STEP 4 - REPLACE PLACEHOLDER TESTS:
For each Dummy.test.ts found:
- Read the package's src/index.ts
- Create a minimal test that imports and validates exports
- Delete the Dummy.test.ts

STEP 5 - VERIFY:
Run: bun test --coverage
Ensure no regressions.

OUTPUT:
- Current coverage baseline
- Packages without tests
- Placeholder tests replaced
- Coverage config added
- Final coverage numbers
```

---

### Task 3: Add Security Scanning to CI

**Scope:** GitHub Actions workflow

**Sub-agent prompt:**
```
You are responsible for adding security scanning to the CI pipeline.

CHECK FIRST:
ls .github/workflows/

If no security.yml exists, create one:

FILE: .github/workflows/security.yml
```yaml
name: Security

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      - name: Install dependencies
        run: bun install --frozen-lockfile
      - name: Security audit
        run: |
          echo "## Security Audit Results" >> $GITHUB_STEP_SUMMARY
          bun audit 2>&1 | tee audit-results.txt || true
          cat audit-results.txt >> $GITHUB_STEP_SUMMARY
        continue-on-error: true
```

ALSO:
- Check if dependabot.yml exists in .github/
- If not, consider adding it for automated dependency updates

OUTPUT:
- Workflow file created/updated
- Dependabot status
- Any existing security configurations found
```

---

### Task 4: JSDoc Coverage Improvements (OPTIONAL)

Only proceed if Tasks 2-3 are complete and time permits.

**Sub-agent prompt:**
```
You are responsible for improving JSDoc coverage in key packages.

PRIORITY PACKAGES:
1. packages/shared/domain
2. packages/runtime/server
3. packages/shared/server

STEP 1 - ASSESS:
Run: bun run beep docgen analyze -p @beep/shared-domain

If docgen command not available, manually check:
grep -c "@example" packages/shared/domain/src/*.ts

STEP 2 - IDENTIFY GAPS:
Find exported functions without @example:
grep -rn "^export const\|^export function" packages/shared/domain/src | head -20

STEP 3 - ADD @example BLOCKS:
For top 5 most important exports:
1. Read the function signature
2. Add @example with realistic usage
3. Verify JSDoc renders correctly

CRITICAL: Only document what actually exists. Do not invent features.

OUTPUT:
- Current JSDoc coverage
- Functions documented
- @example blocks added
```

---

## Execution Protocol

### Step 1: Verify Baseline
Run Task 1 commands. If anything fails, fix it before proceeding.

### Step 2: Assess Priorities
Based on baseline:
- Tests failing → Fix tests first
- No coverage config → Do Task 2
- No security workflow → Do Task 3
- Everything passing → Task 4 (optional)

### Step 3: Execute Tasks
Launch tasks sequentially (they may depend on each other):
1. Task 2 (coverage) - affects package.json/configs
2. Task 3 (security) - adds workflow file
3. Task 4 (JSDoc) - optional polish

### Step 4: Final Verification
```bash
# All checks pass
bun run check
bun run lint
bun test

# Coverage report (if configured)
bun test --coverage

# CI workflow exists
ls .github/workflows/security.yml
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| bun run check | Passes |
| bun run lint | Passes |
| bun test | Passes |
| Test coverage | >50% for core packages |
| Security workflow | Exists in .github/workflows/ |
| Estimated score | 4.2/5 |

---

## Important: Don't Over-Engineer

The audit score is already 4.0/5. P4 is polish, not critical work.

**DO:**
- Add basic coverage thresholds
- Add simple security workflow
- Fix obvious test gaps

**DON'T:**
- Rewrite test infrastructure
- Add complex coverage gates
- Block CI on minor issues

---

## Biome Override Warning

The biome.jsonc file has intentional overrides. Do NOT remove:

```jsonc
"overrides": [
  {
    "includes": [
      "packages/common/types/**/*.ts",
      "packages/common/schema/**/*.ts",
      "packages/common/contract/**/*.ts",
      "packages/shared/domain/src/factories/**/*.ts",
      "packages/shared/server/src/factories/**/*.ts"
    ],
    "linter": { "rules": { "suspicious": { "noExplicitAny": "off" } } }
  },
  {
    "includes": ["tooling/**/*.ts", "**/test/**/*.ts"],
    "linter": { "rules": { "suspicious": { "noExplicitAny": "warn" } } }
  }
]
```

These are necessary for type-level programming and test flexibility.

---

## Handoff Location

Full context and lessons learned: specs/ai-friendliness-audit/HANDOFF_P4.md

---

## Begin Orchestration

Read the handoff document first, then run baseline verification (Task 1).

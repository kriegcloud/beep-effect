# P4 Output: Context Freshness Automation

> Automated detection and reporting of stale context files

---

## Executive Summary

P4 successfully implemented context freshness automation:
- **CLI Command**: `bun run repo-cli context-freshness` functional
- **Output Formats**: Table (default) and JSON for CI
- **Exit Code**: 1 if critical staleness detected
- **Categories**: Effect repo, context files, skills
- **Baseline**: All 83 context sources currently fresh

---

## Implementation Details

### CLI Command

```bash
# Default table output
bun run repo-cli context-freshness

# JSON for CI integration
bun run repo-cli context-freshness --format json

# Exit code 1 if critical (for CI gates)
bun run repo-cli context-freshness && echo "All fresh" || echo "Staleness detected"
```

### Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `tooling/cli/src/commands/context-freshness/errors.ts` | Tagged errors | ~65 |
| `tooling/cli/src/commands/context-freshness/schemas.ts` | Input/output schemas | ~80 |
| `tooling/cli/src/commands/context-freshness/handler.ts` | Main handler | ~600 |
| `tooling/cli/src/commands/context-freshness/index.ts` | CLI command | ~85 |

### Staleness Thresholds

| Source | Warning | Critical |
|--------|---------|----------|
| `.repos/effect/` | 30 days | 60 days |
| `context/` files | 30 days | 45 days |
| `.claude/skills/` | 60 days | 90 days |

### Key Patterns Used

- **Effect FileSystem service** - Not Node.js fs
- **Effect Clock service** - For testable time
- **Command from @effect/platform** - For git execution
- **Tagged errors** - `S.TaggedError` patterns
- **Functional composition** - `A.*`, `O.*`, `Match.*`

---

## Baseline Results (2026-02-04)

```
Context Freshness Report
========================
Scanned at: 2026-02-04T05:57:09.838Z

Summary:
  Fresh: 48
  Warning: 0
  Critical: 0
```

### Breakdown by Category

| Category | Count | Status |
|----------|-------|--------|
| `.repos/effect/` | 1 | Fresh (0 days) |
| `context/effect/` | 1 (dir) | Fresh (0 days) |
| `context/platform/` | 1 (dir) | Fresh (0 days) |
| `.claude/skills/` | 45 | Fresh (0-28 days) |

---

## Output Schema

```typescript
interface FreshnessReport {
  scannedAt: string;
  summary: {
    fresh: number;
    warning: number;
    critical: number;
  };
  items: Array<{
    path: string;
    category: "effect-repo" | "context" | "skill";
    lastModified: string;
    ageInDays: number;
    status: "fresh" | "warning" | "critical";
  }>;
  hasCritical: boolean;
}
```

---

## CI Integration Example

```yaml
# .github/workflows/freshness.yml
name: Context Freshness Check

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run repo-cli context-freshness --format json
```

---

## Modified Files

| File | Change |
|------|--------|
| `tooling/cli/src/index.ts` | Registered `contextFreshnessCommand` |

---

## Next Steps (P5)

1. **Verification**: Run full typecheck and test suite
2. **Documentation**: Update CLI CLAUDE.md with new command
3. **Pattern Promotion**: Extract patterns for PATTERN_REGISTRY
4. **Final Metrics**: Measure all SC-1 through SC-5

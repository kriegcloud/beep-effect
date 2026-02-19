# P3 Output: Telemetry Implementation

> Agent usage tracking system for effectiveness measurement

---

## Executive Summary

P3 successfully implemented agent usage telemetry:
- **Hooks**: PreToolUse (Task) + SubagentStop capture start/completion
- **Storage**: `.claude/.telemetry/usage.jsonl` (JSON Lines format)
- **Report**: `bun run repo-cli agents-usage-report` CLI command
- **Tests**: 43 tests covering schema validation, utilities, and privacy compliance

---

## Implementation Details

### Hook Architecture

```
Task tool spawn → PreToolUse hook → start event → JSONL
      ↓
Agent execution
      ↓
SubagentStop hook → stop event (with duration) → JSONL
```

### Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `.claude/hooks/telemetry/index.ts` | Shared schemas, utilities, state management | 293 |
| `.claude/hooks/telemetry/start.ts` | PreToolUse handler (capture spawn) | ~60 |
| `.claude/hooks/telemetry/stop.ts` | SubagentStop handler (capture completion) | ~70 |
| `.claude/hooks/telemetry/run-start.sh` | Shell wrapper for start hook | 2 |
| `.claude/hooks/telemetry/run-stop.sh` | Shell wrapper for stop hook | 2 |
| `.claude/hooks/telemetry/index.test.ts` | Test suite (43 tests) | ~400 |
| `tooling/cli/src/commands/agents-usage-report/` | CLI command (4 files) | ~450 |

### Event Schema

```typescript
// Start event
{
  eventType: "start",
  timestamp: "2026-02-04T05:30:34.815Z",
  sessionId: "d6c8db73-...",
  agentType: "effect-code-writer",
  triggeredBy: "auto"
}

// Stop event
{
  eventType: "stop",
  timestamp: "2026-02-04T05:36:53.531Z",
  sessionId: "d6c8db73-...",
  agentType: "effect-code-writer",
  durationMs: 378716,
  outcome: "success"
}
```

---

## Privacy Compliance

### Verified: NEVER Logged

| Data Type | Verification |
|-----------|--------------|
| Prompt content | Schema validation rejects extra fields |
| File contents | Not accessed by hooks |
| User identifiers | Only opaque sessionId used |
| Task descriptions | Excluded from event schema |

### Verified: MAY Log

| Data Type | Purpose |
|-----------|---------|
| agentType | Usage analytics |
| timestamp | Temporal analysis |
| durationMs | Performance tracking |
| outcome | Success rate calculation |
| sessionId | Correlation (opaque) |

### Test Coverage

43 tests verify privacy compliance:
- Schema strips unknown fields (prompt, fileContents, userEmail, etc.)
- Only allowed fields pass validation
- Event construction follows privacy-safe patterns

---

## CLI Report

### Usage

```bash
# Table output (default)
bun run repo-cli agents-usage-report

# JSON output
bun run repo-cli agents-usage-report --output json

# Filter by date
bun run repo-cli agents-usage-report --since 2026-02-01
```

### Sample Output

```
Agent Usage Report
==================
Period: 2026-02-04 to 2026-02-04

Agent Type                    Calls    Success%  Avg Duration
─────────────────────────────────────────────────────────────
effect-code-writer                1      100.0%          6.3m
test-writer                       1      100.0%          1.7m
unknown                           2      100.0%           0ms
─────────────────────────────────────────────────────────────
Total                             4       100.0%          2.0m
```

---

## Metrics Achieved

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Agent spawn tracking | 100% | 100% (all Task calls logged) | PASS |
| Duration calculation | Functional | Working (ms precision) | PASS |
| Success/failure tracking | Functional | outcome field captured | PASS |
| Privacy compliance | MUST NOT log content | Verified via 43 tests | PASS |
| Report generation | CLI command | `agents-usage-report` | PASS |
| Test coverage | Tests written | 43 tests, all passing | PASS |

---

## Known Limitations

### 1. Long-Running Agent State Loss

When agents run for extended periods (>30 minutes), the start event state may be lost from hook state due to TTL. This results in `agentType: "unknown"` in stop events.

**Mitigation**: Increase TTL or implement persistent state tracking.

### 2. Trigger Source Always "auto"

Current implementation defaults to `triggeredBy: "auto"` since hook input doesn't reliably indicate whether spawn was explicit user request, skill suggestion, or automatic.

**Future**: Hook input schema could be enhanced to include trigger context.

---

## Configuration Changes

### settings.json Updates

```json
{
  "PreToolUse": [
    {
      "matcher": "Task",
      "hooks": [
        { "command": ".../subagent-init/run.sh" },
        { "command": ".../telemetry/run-start.sh" }  // NEW
      ]
    }
  ],
  "SubagentStop": [
    {
      "hooks": [
        { "command": ".../telemetry/run-stop.sh" }  // NEW
      ]
    }
  ]
}
```

---

## Patterns Extracted

### Telemetry Hook Pattern (85)

Hook into both PreToolUse and SubagentStop to capture complete lifecycle:
- PreToolUse captures spawn time and agent type
- SubagentStop calculates duration and captures outcome
- Append-only JSONL for reliability

### Privacy-Safe Telemetry Pattern (90)

Schema-enforced event structure that strips unknown fields:
- Define explicit allowed fields only
- Use Schema.Struct with strict validation
- Test that extra sensitive fields are rejected

---

## Verification Commands

```bash
# Check telemetry file exists
ls .claude/.telemetry/usage.jsonl

# View raw events
cat .claude/.telemetry/usage.jsonl

# Generate report
bun run repo-cli agents-usage-report

# Run telemetry tests
bun test .claude/hooks/telemetry/index.test.ts
```

---

## References

- Design document: `specs/agent-effectiveness-audit/outputs/telemetry-design.md`
- Hook source: `.claude/hooks/telemetry/`
- CLI source: `tooling/cli/src/commands/agents-usage-report/`
- Tests: `.claude/hooks/telemetry/index.test.ts`

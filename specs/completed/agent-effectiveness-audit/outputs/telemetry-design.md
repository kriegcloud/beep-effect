# Telemetry Design Document

> P3.1 Output: Integration approach for agent usage telemetry

---

## Executive Summary

Agent usage telemetry hooks into the existing Claude Code hook system at two points:
1. **PreToolUse (Task)** - Capture agent spawn events (start time, agent type)
2. **SubagentStop** - Capture completion events (duration, outcome)

Events are persisted to `.claude/.telemetry/usage.jsonl` in append-only JSON Lines format.

---

## Integration Points

### Existing Infrastructure

| Hook | File | Current State | Telemetry Role |
|------|------|---------------|----------------|
| PreToolUse (Task) | `subagent-init/index.ts` | Injects context | **Start event** |
| SubagentStop | (none) | Empty array in settings | **Completion event** |
| Hook State | `.hook-state.json` | Skill caching | **Session tracking** |

### settings.json Hook Configuration

```json
{
  "PreToolUse": [
    {
      "matcher": "Task",
      "hooks": [
        { "type": "command", "command": ".../subagent-init/run.sh" },
        { "type": "command", "command": ".../telemetry/start.sh" }  // NEW
      ]
    }
  ],
  "SubagentStop": [
    {
      "hooks": [
        { "type": "command", "command": ".../telemetry/stop.sh" }  // NEW
      ]
    }
  ]
}
```

---

## Event Schema

```typescript
import * as S from "effect/Schema"
import * as DateTime from "effect/DateTime"

// Start event (emitted on PreToolUse Task)
export const AgentStartEvent = S.Struct({
  eventType: S.Literal("start"),
  timestamp: S.DateTimeUtc,
  sessionId: S.String,           // From CLAUDE_SESSION_ID env
  agentType: S.String,           // From tool_input.subagent_type
  triggeredBy: S.Literal("explicit", "suggested", "auto"),
})

// Stop event (emitted on SubagentStop)
export const AgentStopEvent = S.Struct({
  eventType: S.Literal("stop"),
  timestamp: S.DateTimeUtc,
  sessionId: S.String,
  agentType: S.String,
  durationMs: S.Number,
  outcome: S.Literal("success", "partial", "failed"),
})

// Union type for JSONL entries
export const AgentUsageEvent = S.Union(AgentStartEvent, AgentStopEvent)
```

---

## Data Flow

```
┌─────────────────────┐
│   Task Tool Call    │
│  (spawn subagent)   │
└──────────┬──────────┘
           │ PreToolUse hook
           ▼
┌─────────────────────┐
│  telemetry/start.ts │
│  - Extract agent    │
│  - Write start event│
│  - Store in state   │
└──────────┬──────────┘
           │
           ▼ (subagent runs)
┌─────────────────────┐
│   SubagentStop      │
└──────────┬──────────┘
           │ SubagentStop hook
           ▼
┌─────────────────────┐
│  telemetry/stop.ts  │
│  - Calc duration    │
│  - Write stop event │
│  - Clear state      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  .telemetry/        │
│  usage.jsonl        │
└─────────────────────┘
```

---

## Hook Input/Output Schemas

### PreToolUse Input (Task matcher)

```typescript
// Received from Claude Code
interface PreToolUseInput {
  session_id: string
  tool_name: "Task"
  tool_input: {
    description: string
    prompt: string
    subagent_type: string  // The agent being spawned
  }
}
```

### SubagentStop Input

```typescript
// Received from Claude Code
interface SubagentStopInput {
  session_id: string
  subagent_id: string
  tool_name: "Task"
  tool_input: { subagent_type: string }
  tool_result?: { success: boolean }  // If available
}
```

---

## State Management

Telemetry uses `.claude/.hook-state.json` to track in-flight agents:

```typescript
interface TelemetryState {
  activeAgents: {
    [sessionId: string]: {
      agentType: string
      startTime: number
    }
  }
}
```

This enables duration calculation on SubagentStop.

---

## Privacy Compliance

### MUST NOT Log

| Data | Reason | Mitigation |
|------|--------|------------|
| `prompt` content | User data | Excluded from schema |
| `description` | Task details | Excluded from schema |
| File contents | PII risk | Never accessed |
| User identifiers | Privacy | Session ID only (opaque) |

### MAY Log

| Data | Purpose |
|------|---------|
| `agentType` | Usage analytics |
| `timestamp` | Temporal analysis |
| `durationMs` | Performance tracking |
| `outcome` | Success rate calculation |
| `sessionId` | Correlation (opaque) |

---

## File Structure

```
.claude/
├── hooks/
│   └── telemetry/
│       ├── index.ts       # Shared types and utilities
│       ├── start.ts       # PreToolUse handler
│       ├── stop.ts        # SubagentStop handler
│       ├── run-start.sh   # Shell wrapper for start
│       └── run-stop.sh    # Shell wrapper for stop
├── .telemetry/
│   └── usage.jsonl        # Event log (append-only)
└── .hook-state.json       # State with activeAgents
```

---

## Report Command Design

```bash
bun run repo-cli agents-usage-report
```

### Output Format

```
Agent Usage Report
==================
Period: 2024-01-01 to 2024-01-31

Agent Type           Calls    Success%    Avg Duration
─────────────────────────────────────────────────────
codebase-researcher    42       95.2%         12.3s
effect-code-writer     28       89.3%         45.6s
test-writer            15       93.3%         23.1s
doc-writer             12      100.0%          8.9s
─────────────────────────────────────────────────────
Total                  97       93.8%         22.5s
```

---

## Implementation Checklist

- [ ] Create `.claude/hooks/telemetry/` directory
- [ ] Implement `index.ts` with shared schemas
- [ ] Implement `start.ts` PreToolUse handler
- [ ] Implement `stop.ts` SubagentStop handler
- [ ] Create shell wrappers
- [ ] Update `settings.json` with new hooks
- [ ] Create `.claude/.telemetry/` directory
- [ ] Implement `tooling/cli/src/commands/agents-usage-report/`
- [ ] Write tests

---

## References

- Existing hook: `.claude/hooks/subagent-init/index.ts`
- Caching pattern: `.claude/hooks/skill-suggester/index.ts`
- Hook configuration: `.claude/settings.json`

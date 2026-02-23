# Handoff: Phase 3 - Telemetry Implementation

> Context for implementing agent usage tracking for effectiveness measurement.

---

## Context

P2 achieved:
- 98% reduction in per-prompt filesystem I/O
- Mtime-Based Cache Invalidation Pattern validated
- Hook optimization foundation in place

P3 focus: Implement agent usage telemetry to measure effectiveness.

---

## Mission

Implement agent usage tracking that:
1. Logs which agents are called and when
2. Tracks success/failure outcomes
3. Measures duration
4. Enables effectiveness analysis
5. Respects privacy (no content logging)

---

## P2 Outcomes Available

| Deliverable | Location |
|-------------|----------|
| Hook optimization report | `outputs/P2_HOOK_OPTIMIZATION.md` |
| Hook analysis | `outputs/hook-analysis.md` |
| Validation report | `outputs/hook-validation.md` |
| Modified hook | `.claude/hooks/skill-suggester/index.ts` |
| Reflection entry | `REFLECTION_LOG.md` P2 section |

---

## Telemetry Design (from README)

### Event Schema

```typescript
interface AgentUsageEvent {
  timestamp: DateTime.Utc;
  agentType: string;              // e.g., "codebase-researcher"
  triggeredBy: "explicit" | "suggested" | "auto";
  duration: Duration;
  outcome: "success" | "partial" | "failed";
  tokensBefore: number;
  tokensAfter: number;
}
```

### Implementation Approach

1. **Hook into Task tool invocations**
   - Capture agent spawn events
   - Track completion status
   - Measure duration

2. **Write to telemetry file**
   - Location: `.claude/.telemetry/usage.jsonl`
   - Format: JSON Lines (one event per line)
   - Append-only for reliability

3. **Report generation**
   - New CLI command: `bun run agents:usage-report`
   - Aggregates: calls per agent, success rates, durations

---

## Key Hook Files

| File | Purpose |
|------|---------|
| `.claude/hooks/subagent-init/index.ts` | Task spawn context |
| `.claude/hooks/skill-suggester/index.ts` | Per-prompt hook (P2 optimized) |
| `.claude/hooks/pattern-detector/core.ts` | Caching reference |

---

## Privacy Constraints

**MUST NOT log**:
- Prompt content
- File contents
- User identifiers
- Any PII

**MAY log**:
- Agent type
- Timestamp
- Duration
- Success/failure
- Token counts (aggregate)

---

## Agent Assignments

| Agent | Task | Output |
|-------|------|--------|
| effect-code-writer | Implement telemetry hook | `.claude/hooks/telemetry.ts` |
| test-writer | Create telemetry tests | Test file |
| doc-writer | Document telemetry usage | Documentation |

---

## Success Criteria

- [ ] Telemetry hook implemented
- [ ] Agent call logging functional
- [ ] Success/failure tracking working
- [ ] Report command implemented
- [ ] Privacy requirements met
- [ ] `outputs/P3_TELEMETRY.md` created
- [ ] REFLECTION_LOG.md updated
- [ ] Handoff for P4 created

---

## Token Budget

This handoff: ~600 tokens (15% of 4K budget)

---

## References

- README: `specs/agent-effectiveness-audit/README.md` (P3 section)
- P2 report: `outputs/P2_HOOK_OPTIMIZATION.md`
- Caching pattern: `.claude/hooks/skill-suggester/index.ts`

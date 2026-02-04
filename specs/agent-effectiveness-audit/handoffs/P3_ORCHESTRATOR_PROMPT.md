# P3 Orchestrator Prompt

You are implementing Phase 3 (Telemetry Implementation) of the `agent-effectiveness-audit` spec.

### Context

P2 achieved:
- **98% reduction** in per-prompt filesystem I/O
- Mtime-Based Cache Invalidation Pattern (90) validated
- Hook caching foundation in place

P3's goal: Implement agent usage telemetry to measure effectiveness.

### Telemetry Design

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

**Storage**: `.claude/.telemetry/usage.jsonl` (JSON Lines format)

### Privacy Requirements (CRITICAL)

**MUST NOT log**: prompt content, file contents, user identifiers, PII
**MAY log**: agent type, timestamp, duration, success/failure, token counts

### Agent Deployment Strategy

**Phase 3.1: Design Telemetry Hook**
Deploy codebase-researcher to understand Task tool integration:
```
Analyze how Task tool invocations work in Claude Code:
1. Find where subagent spawning occurs
2. Identify hook points for telemetry injection
3. Determine how to capture outcomes
4. Document integration approach

Write to: specs/agent-effectiveness-audit/outputs/telemetry-design.md
```

**Phase 3.2: Implement Telemetry**
Deploy effect-code-writer to create telemetry hook:
```
Implement agent usage telemetry:
1. Create .claude/hooks/telemetry.ts
2. Hook into subagent-init to capture spawn events
3. Implement JSONL logging to .claude/.telemetry/usage.jsonl
4. Follow Effect patterns (Schema validation, FileSystem service)
5. Add duration tracking
6. Ensure privacy compliance (no content logging)

Reference: .claude/hooks/skill-suggester/index.ts for caching patterns
```

**Phase 3.3: Create Report Command**
Deploy effect-code-writer to create CLI command:
```
Create usage report CLI command:
1. Add tooling/cli/src/commands/agents-usage-report/
2. Parse .claude/.telemetry/usage.jsonl
3. Aggregate: calls per agent, success rates, avg duration
4. Output formatted report

Follow existing CLI command patterns.
```

**Phase 3.4: Test & Validate**
Deploy test-writer to create tests:
```
Create telemetry tests:
1. Test event schema validation
2. Test JSONL writing
3. Test report aggregation
4. Verify privacy compliance

Use @beep/testkit patterns.
```

### Success Criteria

- [ ] Telemetry hook captures agent spawns
- [ ] JSONL logging functional
- [ ] Report command implemented
- [ ] Privacy requirements verified
- [ ] Tests passing
- [ ] `outputs/P3_TELEMETRY.md` created
- [ ] REFLECTION_LOG.md updated with P3 entry
- [ ] `handoffs/HANDOFF_P4.md` created
- [ ] `handoffs/P4_ORCHESTRATOR_PROMPT.md` created

### Verification

```bash
# Check telemetry file exists after agent spawn
ls .claude/.telemetry/usage.jsonl

# Run usage report
bun run repo-cli agents-usage-report

# Verify no content in logs (privacy check)
grep -v '"agentType"' .claude/.telemetry/usage.jsonl || echo "Privacy compliant"
```

### Handoff Document

Read full context in: `specs/agent-effectiveness-audit/handoffs/HANDOFF_P3.md`

# P4 Orchestrator Prompt

You are implementing Phase 4 (Context Freshness Automation) of the `agent-effectiveness-audit` spec.

### Context

P3 achieved:
- Agent usage telemetry implemented
- JSONL logging functional
- CLI report command working
- 43 tests passing

P4's goal: Automate detection and refresh of stale context files.

### Staleness Thresholds

| Source | Warning | Critical |
|--------|---------|----------|
| `.repos/effect/` | 30 days | 60 days |
| `context/` files | 30 days | 45 days |
| Skills | 60 days | 90 days |

### Agent Deployment Strategy

**Phase 4.1: Audit Current Freshness**
Deploy codebase-researcher to audit current state:
```
Analyze context freshness across the repository:
1. Check `.repos/effect/` last commit date
2. Scan `context/` directory mtimes
3. Check `.claude/skills/` SKILL.md mtimes
4. Identify stale files (>30 days)
5. Document findings

Write to: specs/agent-effectiveness-audit/outputs/freshness-audit.md
```

**Phase 4.2: Implement Freshness Check**
Deploy effect-code-writer to create check script:
```
Implement context freshness checker:
1. Create scripts/check-context-freshness.ts
2. Scan directories for mtime
3. Categorize: fresh (<30d), warning (30-60d), critical (>60d)
4. Output formatted report

Follow Effect patterns with FileSystem service.
```

**Phase 4.3: Add CLI Command**
Deploy effect-code-writer to add CLI command:
```
Add context-freshness CLI command:
1. Create tooling/cli/src/commands/context-freshness/
2. Options: --format, --threshold-warning, --threshold-critical
3. Exit code 1 if any critical files
4. Register in CLI index

Reference agents-usage-report for patterns.
```

**Phase 4.4: Test & Validate**
Deploy test-writer to create tests:
```
Create freshness check tests:
1. Test mtime calculation
2. Test threshold categorization
3. Test report generation
4. Verify configuration options

Use @beep/testkit patterns.
```

### Success Criteria

- [ ] Current freshness audited
- [ ] Check script implemented
- [ ] CLI command functional
- [ ] Tests passing
- [ ] `outputs/P4_FRESHNESS.md` created
- [ ] REFLECTION_LOG.md updated with P4 entry
- [ ] `handoffs/HANDOFF_P5.md` created
- [ ] `handoffs/P5_ORCHESTRATOR_PROMPT.md` created

### Verification

```bash
# Run freshness check
bun run repo-cli context-freshness

# Check with thresholds
bun run repo-cli context-freshness --threshold-warning 15 --threshold-critical 30

# JSON output for CI
bun run repo-cli context-freshness --format json
```

### Handoff Document

Read full context in: `specs/agent-effectiveness-audit/handoffs/HANDOFF_P4.md`

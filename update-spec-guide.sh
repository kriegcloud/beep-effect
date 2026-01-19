#!/usr/bin/env bash
set -e

FILE="/home/elpresidank/YeeBois/projects/beep-effect/specs/SPEC_CREATION_GUIDE.md"
BACKUP="${FILE}.backup"

# Create backup
cp "$FILE" "$BACKUP"

# Use awk to insert sections at the right line numbers
awk '
BEGIN { section1_inserted = 0; section2_inserted = 0; section3_inserted = 0 }

# After line 55 (after "- External: `web-researcher`"), insert Orchestrator Delegation Rules
NR == 55 && !section1_inserted {
    print
    print ""
    print "---"
    print ""
    print "## Orchestrator Delegation Rules"
    print ""
    print "> **CRITICAL**: Orchestrators coordinate, they do NOT execute. All substantive work MUST be delegated to specialized sub-agents."
    print ""
    print "### Mandatory Delegation Matrix"
    print ""
    print "| Task Type | Delegate To | Never Do Directly |"
    print "|-----------|-------------|-------------------|"
    print "| Code exploration (>3 files) | `codebase-researcher` | Sequential Glob/Read |"
    print "| Effect documentation lookup | `mcp-researcher` | Manual doc searching |"
    print "| Source code implementation | `effect-code-writer` | Writing .ts files |"
    print "| Test implementation | `test-writer` | Writing .test.ts files |"
    print "| Architecture validation | `architecture-pattern-enforcer` | Layer checks |"
    print "| Documentation writing | `doc-writer` | README/AGENTS.md files |"
    print "| Error fixing | `package-error-fixer` | Manual error resolution |"
    print ""
    print "### Delegation Trigger Rules"
    print ""
    print "An orchestrator MUST delegate when ANY of these conditions are met:"
    print "- Task requires reading more than 3 files"
    print "- Task requires more than 5 sequential tool calls"
    print "- Task involves generating source code"
    print "- Task involves generating test code"
    print "- Task requires broad codebase search"
    print ""
    print "### Orchestrator Allowed Actions"
    print ""
    print "Orchestrators MAY directly:"
    print "- Read 1-3 small files for quick context"
    print "- Make 1-5 tool calls for coordination"
    print "- Synthesize sub-agent outputs"
    print "- Create handoff documents"
    print "- Update REFLECTION_LOG.md"
    section1_inserted = 1
    next
}

# After line 579 (after "- P[N]_ORCHESTRATOR_PROMPT.md - Concise, copy-paste ready prompt"), insert Phase Sizing
NR == 579 && !section2_inserted {
    print
    print ""
    print "---"
    print ""
    print "## Phase Sizing Constraints"
    print ""
    print "### Hard Limits"
    print ""
    print "| Metric | Maximum | Recommended |"
    print "|--------|---------|-------------|"
    print "| Work items per phase | 7 | 5-6 |"
    print "| Sub-agent delegations per phase | 10 | 6-8 |"
    print "| Direct orchestrator tool calls | 20 | 10-15 |"
    print "| Sessions per phase | 2 | 1 |"
    print ""
    print "### Phase Split Triggers"
    print ""
    print "A phase MUST be split into sub-phases (P[N]a, P[N]b) when:"
    print "- Phase has 8+ work items"
    print "- Phase has 3+ \"Large\" work items (6+ tool calls each)"
    print "- Estimated duration exceeds 2 sessions"
    section2_inserted = 1
    next
}

# After line 806 (after anti-pattern #10 lesson), insert new anti-patterns
NR == 806 && !section3_inserted {
    print
    print ""
    print "### 11. Orchestrator Doing Research Directly"
    print ""
    print "**Wrong**: Orchestrator performs sequential Glob/Read/Grep operations"
    print "```"
    print "[Orchestrator]"
    print "Let me find the service patterns..."
    print "[Glob: packages/iam/**/*.ts]"
    print "[Read: file1.ts]"
    print "[Read: file2.ts]"
    print "[Grep: \"Effect.Service\"]"
    print "[Read: file3.ts]"
    print "... (10+ tool calls, context consumed)"
    print "```"
    print ""
    print "**Right**: Orchestrator delegates research to codebase-researcher"
    print "```"
    print "[Orchestrator]"
    print "I need to understand service patterns."
    print "[Task: codebase-researcher]"
    print "\"Find all Effect.Service definitions in packages/iam/ and summarize patterns\""
    print "(Agent returns summary, orchestrator continues with synthesized knowledge)"
    print "```"
    print ""
    print "### 12. Unbounded Phase Sizes"
    print ""
    print "**Wrong**: Phase defined by feature scope without size limits"
    print "```"
    print "Phase 2: Full Implementation"
    print "- Implement entity service"
    print "- Implement relation service"
    print "- Implement extraction pipeline"
    print "- Implement grounder"
    print "- Write all tests"
    print "- Add observability"
    print "- Create documentation"
    print "(7+ items = context exhaustion risk)"
    print "```"
    print ""
    print "**Right**: Phase sized to context budget"
    print "```"
    print "Phase 2a: Core Services (5 items max)"
    print "- Entity service (delegate: effect-code-writer)"
    print "- Relation service (delegate: effect-code-writer)"
    print "- Core tests (delegate: test-writer)"
    print "- Verify builds"
    print "- Checkpoint handoff"
    print ""
    print "Phase 2b: Pipeline & Extensions"
    print "- Extraction pipeline"
    print "- Grounder service"
    print "- Integration tests"
    print "- Observability"
    print "- Checkpoint handoff"
    print "```"
    print ""
    print "### 13. Late Context Checkpoints"
    print ""
    print "**Wrong**: Creating handoff after context stress"
    print "```"
    print "[... 50+ tool calls ...]"
    print "\"Context is getting long, let me quickly create a handoff...\""
    print "(Rushed, incomplete handoff)"
    print "```"
    print ""
    print "**Right**: Proactive checkpointing"
    print "```"
    print "[After 15-20 tool calls or completing 3 sub-tasks]"
    print "\"Checkpoint: Creating interim handoff before continuing.\""
    print "(Deliberate, comprehensive handoff)"
    print "```"
    section3_inserted = 1
    next
}

{ print }
' "$BACKUP" > "$FILE"

echo "✓ Successfully updated SPEC_CREATION_GUIDE.md"
echo "  - Added Orchestrator Delegation Rules section after Agent-Phase Mapping"
echo "  - Added Phase Sizing Constraints section after Standard Spec Structure"
echo "  - Added 3 new anti-patterns (11, 12, 13) after anti-pattern #10"
echo "  - Backup saved as: $BACKUP"

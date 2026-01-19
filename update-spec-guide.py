#!/usr/bin/env python3
"""
Updates SPEC_CREATION_GUIDE.md with three new sections:
1. Orchestrator Delegation Rules (after Agent-Phase Mapping)
2. Phase Sizing Constraints (after Standard Spec Structure)
3. Three new anti-patterns (11, 12, 13) after anti-pattern #10
"""

import re

# Read the current file
with open('/home/elpresidank/YeeBois/projects/beep-effect/specs/SPEC_CREATION_GUIDE.md', 'r') as f:
    content = f.read()

# Section 1: Orchestrator Delegation Rules (after Agent-Phase Mapping)
delegation_rules = """---

## Orchestrator Delegation Rules

> **CRITICAL**: Orchestrators coordinate, they do NOT execute. All substantive work MUST be delegated to specialized sub-agents.

### Mandatory Delegation Matrix

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (>3 files) | `codebase-researcher` | Sequential Glob/Read |
| Effect documentation lookup | `mcp-researcher` | Manual doc searching |
| Source code implementation | `effect-code-writer` | Writing .ts files |
| Test implementation | `test-writer` | Writing .test.ts files |
| Architecture validation | `architecture-pattern-enforcer` | Layer checks |
| Documentation writing | `doc-writer` | README/AGENTS.md files |
| Error fixing | `package-error-fixer` | Manual error resolution |

### Delegation Trigger Rules

An orchestrator MUST delegate when ANY of these conditions are met:
- Task requires reading more than 3 files
- Task requires more than 5 sequential tool calls
- Task involves generating source code
- Task involves generating test code
- Task requires broad codebase search

### Orchestrator Allowed Actions

Orchestrators MAY directly:
- Read 1-3 small files for quick context
- Make 1-5 tool calls for coordination
- Synthesize sub-agent outputs
- Create handoff documents
- Update REFLECTION_LOG.md

---"""

# Insert after "External: `web-researcher`" and before "## Phase 0: Scaffolding"
content = re.sub(
    r'(- External: `web-researcher`\n\n---\n)\n(## Phase 0: Scaffolding)',
    r'\1' + delegation_rules + '\n\n\\2',
    content
)

# Section 2: Phase Sizing Constraints (after Standard Spec Structure section)
phase_sizing = """---

## Phase Sizing Constraints

### Hard Limits

| Metric | Maximum | Recommended |
|--------|---------|-------------|
| Work items per phase | 7 | 5-6 |
| Sub-agent delegations per phase | 10 | 6-8 |
| Direct orchestrator tool calls | 20 | 10-15 |
| Sessions per phase | 2 | 1 |

### Phase Split Triggers

A phase MUST be split into sub-phases (P[N]a, P[N]b) when:
- Phase has 8+ work items
- Phase has 3+ "Large" work items (6+ tool calls each)
- Estimated duration exceeds 2 sessions

---"""

# Insert after the CRITICAL note about handoff files and before "## Creating a New Spec"
content = re.sub(
    r'(- P\[N\]_ORCHESTRATOR_PROMPT\.md - Concise, copy-paste ready prompt\n```\n\n---\n)\n(## Creating a New Spec)',
    r'\1' + phase_sizing + '\n\n\\2',
    content
)

# Section 3: New anti-patterns (after anti-pattern #10)
new_antipatterns = """
### 11. Orchestrator Doing Research Directly

**Wrong**: Orchestrator performs sequential Glob/Read/Grep operations
```
[Orchestrator]
Let me find the service patterns...
[Glob: packages/iam/**/*.ts]
[Read: file1.ts]
[Read: file2.ts]
[Grep: "Effect.Service"]
[Read: file3.ts]
... (10+ tool calls, context consumed)
```

**Right**: Orchestrator delegates research to codebase-researcher
```
[Orchestrator]
I need to understand service patterns.
[Task: codebase-researcher]
"Find all Effect.Service definitions in packages/iam/ and summarize patterns"
(Agent returns summary, orchestrator continues with synthesized knowledge)
```

### 12. Unbounded Phase Sizes

**Wrong**: Phase defined by feature scope without size limits
```
Phase 2: Full Implementation
- Implement entity service
- Implement relation service
- Implement extraction pipeline
- Implement grounder
- Write all tests
- Add observability
- Create documentation
(7+ items = context exhaustion risk)
```

**Right**: Phase sized to context budget
```
Phase 2a: Core Services (5 items max)
- Entity service (delegate: effect-code-writer)
- Relation service (delegate: effect-code-writer)
- Core tests (delegate: test-writer)
- Verify builds
- Checkpoint handoff

Phase 2b: Pipeline & Extensions
- Extraction pipeline
- Grounder service
- Integration tests
- Observability
- Checkpoint handoff
```

### 13. Late Context Checkpoints

**Wrong**: Creating handoff after context stress
```
[... 50+ tool calls ...]
"Context is getting long, let me quickly create a handoff..."
(Rushed, incomplete handoff)
```

**Right**: Proactive checkpointing
```
[After 15-20 tool calls or completing 3 sub-tasks]
"Checkpoint: Creating interim handoff before continuing."
(Deliberate, comprehensive handoff)
```
"""

# Insert after anti-pattern #10's lesson and before "## Related Documentation"
content = re.sub(
    r'(\*\*Lesson\*\*: A phase is NOT complete until BOTH files exist\. The orchestrator prompt is not optional - it\'s the primary mechanism for starting the next phase\. See \[HANDOFF_STANDARDS\.md\]\(HANDOFF_STANDARDS\.md\) for templates\.\n\n---\n)\n(## Related Documentation)',
    r'\1' + new_antipatterns + '\n\n---\n\n\\2',
    content
)

# Write the updated content
with open('/home/elpresidank/YeeBois/projects/beep-effect/specs/SPEC_CREATION_GUIDE.md', 'w') as f:
    f.write(content)

print("Successfully updated SPEC_CREATION_GUIDE.md with:")
print("1. Orchestrator Delegation Rules section")
print("2. Phase Sizing Constraints section")
print("3. Three new anti-patterns (11, 12, 13)")

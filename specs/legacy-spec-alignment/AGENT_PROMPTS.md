# Agent Prompts: Legacy Spec Alignment

> Sub-agent templates for spec execution. Copy-paste ready.

---

## Agent-Phase Mapping

| Phase | Primary Agent | Purpose |
|-------|---------------|---------|
| P0 | `codebase-researcher` | Multi-file inventory and counting |
| P1 | `codebase-researcher`, `doc-writer` | Analyze and restructure KG spec |
| P2 | `codebase-researcher`, `doc-writer` | Analyze and restructure RLS spec |
| P3 | `codebase-researcher` | Validation scan |

---

## Codebase Researcher Prompts

### Spec Inventory (P0)

```
List all spec directories in specs/ that contain a README.md.
For each, extract:
- Spec name (directory name)
- Status (from README.md header)
- Number of phases defined in MASTER_ORCHESTRATION.md (if exists)
- Number of work items per phase

Output format:
| Spec | Status | Phases | Max Items/Phase |
```

### Phase Count Analysis (P0)

```
For each spec with a MASTER_ORCHESTRATION.md, count work items per phase.

Work items are identified by:
- Numbered lists (1., 2., 3.)
- Under "Work Items" or "### N." headers

Report format:
| Spec | Phase | Item Count | Violation? (>7) |
```

### Handoff Chain Audit (P0)

```
For each spec in specs/:
1. List all phases in MASTER_ORCHESTRATION.md
2. List all files in handoffs/ directory
3. Report missing HANDOFF_P[N].md files

Output format:
| Spec | Expected Handoffs | Actual Handoffs | Missing |
```

### Phase Structure Analysis (P1/P2)

```
Read specs/[TARGET]/MASTER_ORCHESTRATION.md.

For each oversized phase (>7 items):
1. List all work items
2. Group into logical clusters of max 7 items
3. Identify dependencies between items

Output format:
## Phase X: [Name] (Y items → Z sub-phases)
### Cluster 1 (7 items)
- Item 1
- Item 2
...
### Cluster 2 (remaining items)
- Item 8
...
### Dependencies
- Item 3 depends on Item 1
```

### Compliance Check (P3)

```
For all specs in specs/:
1. Check each phase has ≤7 work items
2. Check delegation matrix exists
3. Check handoff chain is complete

Report format:
| Spec | Phase Sizing | Delegation Matrix | Handoff Chain | Overall |
|------|--------------|-------------------|---------------|---------|
| name | ✅/❌        | ✅/❌             | ✅/❌         | PASS/FAIL |
```

---

## Doc Writer Prompts

### README Alignment (P1/P2)

```
Update specs/[TARGET]/README.md to follow canonical template.

Required sections:
1. Title + one-line description
2. Status badge with date/phase
3. Problem Statement
4. Success Criteria (table format)
5. Scope (In/Out)
6. Key Deliverables (table)
7. Phases Overview (table with agents)
8. Agent-Phase Mapping (table)
9. File Reference (table)
10. Exit Criteria (checklist)
11. Getting Started
12. Changelog

Preserve existing content where possible. Add missing sections.
```

### MASTER_ORCHESTRATION Update (P1/P2)

```
Update specs/[TARGET]/MASTER_ORCHESTRATION.md with:

1. Split oversized phases into sub-phases (≤7 items each)
2. Add delegation matrix to each phase:
   | Task | Delegate To | Rationale |
3. Add exit criteria to each phase
4. Add handoff output reference to each phase
5. Update phase dependency diagram if phases were added

Preserve the spec's intent and deliverables. Only restructure, don't add new work.
```

---

## Prompt Engineering Notes

### Effective Patterns

1. **Explicit output format**: Always specify table/list format for structured data
2. **Bounded scope**: Always specify the directory/file scope
3. **Violation threshold**: Always mention the limit (7 items) explicitly
4. **Preservation notice**: Remind agent to preserve intent, only restructure

### Anti-Patterns to Avoid

1. **Unbounded search**: Don't ask to "find all specs" without path
2. **Implicit judgment**: Don't ask "is this good?" - ask for specific metrics
3. **Multi-step in one**: Don't combine analysis + fix - separate prompts
4. **Missing context**: Always mention canonical patterns being enforced

---

## Usage Examples

### Starting P0 Spec Inventory

```bash
# Orchestrator delegates to codebase-researcher
Task tool with subagent_type='codebase-researcher':
"List all spec directories in specs/ that contain a README.md.
For each, extract: spec name, status, number of phases..."
```

### Starting P1 Phase Analysis

```bash
# Orchestrator delegates to codebase-researcher
Task tool with subagent_type='codebase-researcher':
"Read specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md.
List all work items in Phase 0. Group them into logical clusters..."
```

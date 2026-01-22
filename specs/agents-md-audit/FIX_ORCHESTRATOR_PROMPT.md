# Documentation Consistency Fix - Orchestrator Prompt

> Copy-paste this entire prompt to a new Claude instance to systematically fix all identified documentation issues.

---

## Context

An audit was performed on the beep-effect monorepo documentation. The spec creation guidelines were recently consolidated into `specs/_guide/`, but many files still reference old paths and deleted specs.

**Audit Report Location**: `specs/agents-md-audit/outputs/documentation-consistency-audit.md`

## Your Mission

Fix all documentation inconsistencies identified in the audit report, working in order of severity. After each file fix, verify the change is correct before proceeding.

---

## Path Migration Reference

Use these mappings for all fixes:

| Old Path | New Path |
|----------|----------|
| `specs/SPEC_CREATION_GUIDE.md` | `specs/_guide/README.md` |
| `specs/HANDOFF_STANDARDS.md` | `specs/_guide/HANDOFF_STANDARDS.md` |
| `specs/PATTERN_REGISTRY.md` | `specs/_guide/PATTERN_REGISTRY.md` |
| `specs/llms.txt` | `specs/_guide/llms.txt` |
| `specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` | `specs/_guide/PATTERN_REGISTRY.md` |

## Deleted Specs (Remove All References)

- `specs/ai-friendliness-audit/` - Replace example references with `canonical-naming-conventions`
- `specs/jetbrains-mcp-skill/` - Remove references entirely
- `specs/new-specialized-agents/` - Remove references entirely

---

## Execution Plan

Work through these fixes IN ORDER. Use the Edit tool for each change. After completing each file, briefly confirm what was changed.

### Phase 1: Critical Files (5 files)

#### 1.1 Fix AGENTS.md

Read the file first, then make these edits:

**Line 90**: Change link target
```
Old: [SPEC_CREATION_GUIDE](specs/SPEC_CREATION_GUIDE.md)
New: [Spec Guide](specs/_guide/README.md)
```

**Line 91**: Change link target and text
```
Old: [META_SPEC_TEMPLATE](specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md)
New: [PATTERN_REGISTRY](specs/_guide/PATTERN_REGISTRY.md)
```

**Line 98**: Add dual handoff requirement
```
Old: Use `HANDOFF_P[N].md` to preserve context between sessions
New: Use `HANDOFF_P[N].md` AND `P[N]_ORCHESTRATOR_PROMPT.md` (both required) to preserve context
```

#### 1.2 Fix .claude/commands/new-spec.md

Read the file first, then make these edits:

**Line 171**:
```
Old: [HANDOFF_STANDARDS.md](../../specs/HANDOFF_STANDARDS.md)
New: [HANDOFF_STANDARDS.md](../../specs/_guide/HANDOFF_STANDARDS.md)
```

**Line 190**:
```
Old: `specs/PATTERN_REGISTRY.md`
New: `specs/_guide/PATTERN_REGISTRY.md`
```

**Line 228**:
```
Old: SPEC_CREATION_GUIDE.md
New: specs/_guide/README.md
```

**Lines 237-240** (Reference Documentation table):
```
Old:
| [SPEC_CREATION_GUIDE](../../specs/SPEC_CREATION_GUIDE.md) | Complete workflow reference with structure template |
| [HANDOFF_STANDARDS](../../specs/HANDOFF_STANDARDS.md) | Handoff file requirements |
| [PATTERN_REGISTRY](../../specs/PATTERN_REGISTRY.md) | Reusable patterns extracted from specs |
| [llms.txt](../../specs/llms.txt) | AI-readable spec index |

New:
| [Spec Guide](../../specs/_guide/README.md) | Complete workflow reference with structure template |
| [HANDOFF_STANDARDS](../../specs/_guide/HANDOFF_STANDARDS.md) | Handoff file requirements |
| [PATTERN_REGISTRY](../../specs/_guide/PATTERN_REGISTRY.md) | Reusable patterns extracted from specs |
| [llms.txt](../../specs/_guide/llms.txt) | AI-readable spec index |
```

**Line 275**:
```
Old: README.md follows META_SPEC_TEMPLATE structure
New: README.md follows specs/_guide/README.md structure
```

#### 1.3 Fix .claude/agents/reflector.md

Read the file first, then make these edits (8 changes):

Replace ALL occurrences of `ai-friendliness-audit` with `canonical-naming-conventions` as the example spec name.

Specific lines to update:
- Line 19: example spec name
- Line 49: description example
- Line 111: example output
- Line 273: request example
- Line 274: glob example
- Line 276: output filename

**Line 237**: Change template reference
```
Old: `specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` | Self-improving spec pattern reference
New: `specs/_guide/PATTERN_REGISTRY.md` | Reusable patterns library
```

**Line 306**: Change HANDOFF_STANDARDS path
```
Old: specs/HANDOFF_STANDARDS.md
New: specs/_guide/HANDOFF_STANDARDS.md
```

#### 1.4 Fix .claude/skills/jetbrains-mcp.md

Read the file first. Remove the entire "Related" section (lines 237-242) that references deleted spec outputs:

```
## Related

- Full tool documentation: `specs/jetbrains-mcp-skill/outputs/tool-inventory.md`
- Detailed workflows: `specs/jetbrains-mcp-skill/outputs/workflow-analysis.md`
- Decision tree: `specs/jetbrains-mcp-skill/outputs/decision-tree.md`
- Comparison matrix: `specs/jetbrains-mcp-skill/outputs/comparison-matrix.md`
```

Replace with:
```
## Related

- [JetBrains MCP Server Documentation](https://plugins.jetbrains.com/plugin/26071-mcp-host)
```

#### 1.5 Fix specs/agents/README.md

Read the file first, then:

**Line 9**: Reword to remove deleted spec reference
```
Old: This directory contains individual specs for each agent to be created as part of the [new-specialized-agents](../new-specialized-agents/README.md) initiative.
New: This directory contains individual specs for specialized agents in the beep-effect monorepo.
```

**Lines 178-179**: Remove both lines entirely (they reference deleted specs)
```
Remove:
- [new-specialized-agents](../new-specialized-agents/README.md) - Parent spec
- [ai-friendliness-audit](../ai-friendliness-audit/README.md) - META_SPEC_TEMPLATE reference
```

---

### Phase 2: Medium Priority Files (9 files)

#### 2.1 Fix specs/todox-design/README.md

**Lines 207-208**:
```
Old:
- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md)
- [HANDOFF_STANDARDS](../HANDOFF_STANDARDS.md)

New:
- [Spec Guide](../_guide/README.md)
- [HANDOFF_STANDARDS](../_guide/HANDOFF_STANDARDS.md)
```

#### 2.2 Fix specs/canonical-naming-conventions/README.md

**Line 244**: Remove the line referencing deleted spec
```
Remove: - `specs/ai-friendliness-audit/` - Related AI-friendliness patterns
```

#### 2.3 Fix specs/canonical-naming-conventions/MASTER_ORCHESTRATION.md

**Line 523**: Remove the line referencing deleted spec
```
Remove: - `specs/ai-friendliness-audit/`: Related AI-friendliness patterns
```

#### 2.4 Fix specs/spec-creation-improvements/README.md

**Line 224**: Remove the line referencing deleted spec
```
Remove: - `specs/ai-friendliness-audit/` - Related AI-friendliness patterns
```

#### 2.5 Fix documentation/patterns/agent-signatures.md

**Line 293**:
```
Old: [SPEC_CREATION_GUIDE.md](../specs/SPEC_CREATION_GUIDE.md)
New: [Spec Guide](../specs/_guide/README.md)
```

#### 2.6 Fix documentation/patterns/external-api-integration.md

**Line 345**:
```
Old: [Handoff Standards](../../specs/HANDOFF_STANDARDS.md)
New: [Handoff Standards](../../specs/_guide/HANDOFF_STANDARDS.md)
```

#### 2.7 Fix specs/_guide/README.md

**Line 170**:
```
Old: Follow META_SPEC_TEMPLATE structure from specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md
New: Follow the Standard Spec Structure defined in this guide
```

#### 2.8 Fix specs/_guide/PATTERN_REGISTRY.md

**Line 144**:
```
Old: [Creation Guide](./SPEC_CREATION_GUIDE.md)
New: [Creation Guide](./README.md)
```

**Line 155**:
```
Old: specs/llms.txt
New: specs/_guide/llms.txt
```

**Line 186**:
```
Old: Implemented in SPEC_CREATION_GUIDE.md
New: Implemented in README.md
```

**Line 359**:
```
Old: Schema implemented in SPEC_CREATION_GUIDE.md
New: Schema implemented in README.md
```

**Line 513**:
```
Old: [SPEC_CREATION_GUIDE.md](./SPEC_CREATION_GUIDE.md)
New: [README.md](./README.md)
```

#### 2.9 Fix specs/_guide/patterns/reflection-system.md

Replace all occurrences of `specs/PATTERN_REGISTRY.md` with `specs/_guide/PATTERN_REGISTRY.md` (4 occurrences at lines 225, 296, 307, 378).

---

### Phase 3: Low Priority (Historical Documents)

For these historical documents, add a deprecation notice at the top rather than updating all references:

#### 3.1 Add notice to specs/spec-creation-improvements/REFLECTION_LOG.md

Add at top after title:
```markdown
> **Note**: This reflection log references old paths. The spec creation guide has moved:
> - `specs/SPEC_CREATION_GUIDE.md` → `specs/_guide/README.md`
> - `specs/HANDOFF_STANDARDS.md` → `specs/_guide/HANDOFF_STANDARDS.md`
> - `specs/PATTERN_REGISTRY.md` → `specs/_guide/PATTERN_REGISTRY.md`
```

#### 3.2 Add notice to specs/_guide/outputs/methodology-improvements-2026-01-18.md

Add at top:
```markdown
> **Historical Document**: Written before path consolidation. References to `specs/SPEC_CREATION_GUIDE.md` now point to `specs/_guide/README.md`.
```

#### 3.3 Fix specs/rls-implementation/REFLECTION_LOG.md

**Line 69**:
```
Old: Update SPEC_CREATION_GUIDE.md
New: Update specs/_guide/README.md
```

---

## Verification

After completing all fixes, run these commands to verify no stale references remain:

```bash
# Check for deleted spec references
grep -r "ai-friendliness-audit" --include="*.md" . | grep -v "outputs/documentation-consistency-audit.md" | grep -v "FIX_ORCHESTRATOR"

# Check for old guide location
grep -r "specs/SPEC_CREATION_GUIDE" --include="*.md" . | grep -v "outputs/" | grep -v "REFLECTION_LOG"

# Check for jetbrains-mcp-skill references
grep -r "jetbrains-mcp-skill" --include="*.md" .

# Check for new-specialized-agents references
grep -r "new-specialized-agents" --include="*.md" .
```

All commands should return empty or only show expected historical documents with deprecation notices.

---

## Success Criteria

- [ ] All 5 critical files fixed
- [ ] All 9 medium priority files fixed
- [ ] Deprecation notices added to 3 historical documents
- [ ] Verification grep commands return no unexpected results
- [ ] No new errors introduced (files still valid markdown)

---

## Notes

- Use the Edit tool for surgical changes
- Read each file before editing to verify line numbers
- Line numbers in audit may shift after earlier edits - search for the exact text instead
- If a line number doesn't match, search for the "Old" text to find the correct location
- Report completion status after each phase

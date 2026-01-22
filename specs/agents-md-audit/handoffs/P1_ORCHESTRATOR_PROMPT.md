# Phase 1 Orchestrator Prompt: Fix Documentation Inconsistencies

> **Copy this entire prompt to start a new Claude session**

---

## Mission

You are the orchestrator for Phase 1 of the agents-md-audit spec. Your mission is to systematically fix all documentation inconsistencies identified in the comprehensive audit.

**Audit Report**: `specs/agents-md-audit/outputs/comprehensive-documentation-audit-2026-01-22.md`

---

## Context from Previous Phase

Phase 0 completed a comprehensive audit of all documentation and agent configuration files. The audit identified:
- **130+ issues** across 6 categories
- **4 critical issues** blocking spec execution
- **50+ medium issues** causing confusion
- **20+ low priority** improvements

---

## Your Tasks (In Order)

### TIER 1: CRITICAL (Complete These First)

#### 1.1 Remove Broken Spec Reference
```
File: specs/README.md
Action: Remove the table row for `iam-client-method-wrappers` (link is broken)
```

#### 1.2 Add Missing Orchestrator Prompts (3 files)
```
Spec: naming-conventions-refactor
Action: Create these files in specs/naming-conventions-refactor/handoffs/:
  - P1_ORCHESTRATOR_PROMPT.md (copy pattern from HANDOFF_P1.md content)
  - P2_ORCHESTRATOR_PROMPT.md (copy pattern from HANDOFF_P2.md content)
  - P3_ORCHESTRATOR_PROMPT.md (copy pattern from HANDOFF_P3.md content)

Each prompt should:
1. Include mission statement from HANDOFF_P[N].md
2. Include context section
3. Include success criteria
4. Be copy-paste ready
```

#### 1.3 Add Missing Orchestrator Prompt (1 file)
```
Spec: knowledge-graph-integration
Action: Create specs/knowledge-graph-integration/handoffs/P4_ORCHESTRATOR_PROMPT.md
Reference: Use HANDOFF_P4.md for context
```

#### 1.4 Add Missing REFLECTION_LOG.md
```
Spec: specs/agents/
Action: Create specs/agents/REFLECTION_LOG.md with standard template:
  # Reflection Log
  > Cumulative learnings from agent specification work.
  ---
  ## Log Format
  Each entry follows the reflection schema from `specs/_guide/README.md`.
  ---
  <!-- Entries will be added after each phase -->
```

#### 1.5 Create or Fix service-patterns.md Reference
```
File: .claude/rules/effect-patterns.md
Line: ~396
Action: Either:
  A) Create documentation/patterns/service-patterns.md with service Layer patterns
  B) Remove the reference from effect-patterns.md Reference Documentation table

Recommendation: Option B (remove reference) - content already covered in other files
```

---

### TIER 2: HIGH (Complete After TIER 1)

#### 2.1 Remove MCP Tool Shortcuts from Agent Files

**Files to fix** (6 total):
```
.claude/agents/code-observability-writer.md
.claude/agents/effect-predicate-master.md
.claude/agents/effect-researcher.md
.claude/agents/effect-schema-expert.md
.claude/agents/mcp-researcher.md
.claude/agents/test-writer.md

Action for each:
- Find the `tools:` section
- Remove lines containing `mcp__effect_docs__` or `mcp__MCP_DOCKER__`
- Leave other tools intact
```

#### 2.2 Add Missing Slices to architecture-pattern-enforcer.md
```
File: .claude/agents/architecture-pattern-enforcer.md
Location: Architecture table (lines ~48-54)
Action: Add rows for:
  | calendar  | packages/calendar/*   | Calendar/scheduling domain |
  | knowledge | packages/knowledge/*  | Knowledge base domain |
```

#### 2.3 Fix Old Spec Guide Path References

**Pattern replacements** (apply across all files):
```
OLD → NEW:
specs/SPEC_CREATION_GUIDE.md → specs/_guide/README.md
specs/HANDOFF_STANDARDS.md → specs/_guide/HANDOFF_STANDARDS.md
specs/PATTERN_REGISTRY.md → specs/_guide/PATTERN_REGISTRY.md
specs/llms.txt → specs/_guide/llms.txt
META_SPEC_TEMPLATE → PATTERN_REGISTRY (in context)
```

**Search command to find files**:
```bash
grep -r "specs/SPEC_CREATION_GUIDE\|specs/HANDOFF_STANDARDS\|specs/PATTERN_REGISTRY\.md\|specs/llms\.txt" --include="*.md" .
```

**Priority files** (fix these first):
1. `.claude/commands/new-spec.md`
2. `.claude/agents/reflector.md`
3. `specs/_guide/README.md` (self-references)
4. `specs/_guide/PATTERN_REGISTRY.md` (self-references)
5. `documentation/patterns/agent-signatures.md`

#### 2.4 Remove Deleted Spec References

**Deleted specs to remove references to**:
- `ai-friendliness-audit` → Replace with `canonical-naming-conventions` where appropriate
- `jetbrains-mcp-skill` → Remove references entirely
- `new-specialized-agents` → Remove references entirely

**Key files to fix**:
```
.claude/agents/reflector.md - Replace ai-friendliness-audit examples
.claude/skills/jetbrains-mcp.md - Remove Related section referencing deleted spec
specs/agents/README.md - Remove links to deleted specs
```

#### 2.5 Update PACKAGE_STRUCTURE.md
```
File: documentation/PACKAGE_STRUCTURE.md
Action: Add knowledge slice to the package table:
  | packages/knowledge/* | Knowledge base management |
```

---

### TIER 3: MEDIUM (Complete If Time Permits)

#### 3.1 Standardize agents-md-audit Handoff Naming
```
Rename: specs/agents-md-audit/FIX_ORCHESTRATOR_PROMPT.md → P0_ORCHESTRATOR_PROMPT.md
Create: specs/agents-md-audit/handoffs/HANDOFF_P0.md (extract context from FIX file)
```

#### 3.2 Fix Stale Cross-References in spec-creation-improvements
```
Spec: spec-creation-improvements
Files: All handoff files
Action: Fix or remove references to:
  - specs/llms → specs/_guide/llms.txt
  - specs/full-iam-client → (remove, doesn't exist)
  - specs/llms-full → (remove, doesn't exist)
  - specs/templates → specs/_guide/templates/
```

#### 3.3 Fix @beep/core-* References
```
Search: grep -r "@beep/core-" --include="*.md" .
Action: These are stale package names. Check each reference and either:
  - Update to current package name
  - Remove if context is obsolete
```

#### 3.4 Remove Hardcoded Paths from Package AGENTS.md
```
File: packages/iam/client/AGENTS.md
Lines: 37-38
Action: Remove or relativize paths containing /home/elpresidank/
```

---

## Verification Commands

After each tier, run:
```bash
# Check for remaining old paths
grep -r "specs/SPEC_CREATION_GUIDE\|specs/HANDOFF_STANDARDS\|specs/PATTERN_REGISTRY\.md" --include="*.md" . | grep -v "REFLECTION_LOG\|outputs/"

# Check for deleted spec references
grep -r "ai-friendliness-audit\|jetbrains-mcp-skill\|new-specialized-agents" --include="*.md" . | grep -v "outputs/"

# Check for MCP tool shortcuts in agents
grep -r "mcp__jetbrains__\|mcp__context7__\|mcp__effect_docs__" .claude/agents/

# Verify spec builds
bun run check
bun run lint:fix
```

---

## Success Criteria

- [ ] All 5 TIER 1 critical issues resolved
- [ ] All 5 TIER 2 high-priority issues resolved
- [ ] `grep` verification commands return no unexpected matches
- [ ] `bun run check` passes
- [ ] `bun run lint:fix` completes without errors

---

## Handoff Requirements

When complete, create:
1. `HANDOFF_P1.md` documenting what was fixed and any issues encountered
2. Update `REFLECTION_LOG.md` with learnings

---

## Reference Files

- **Audit Report**: `specs/agents-md-audit/outputs/comprehensive-documentation-audit-2026-01-22.md`
- **Spec Guide**: `specs/_guide/README.md`
- **Handoff Standards**: `specs/_guide/HANDOFF_STANDARDS.md`

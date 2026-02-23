# Phase 0 Handoff: Lexical Canonical Editor

**Date**: 2026-02-14
**From**: Phase 0 (Scaffolding)
**To**: Phase 1 (Discovery)
**Status**: Ready for implementation

---

## Phase 0 Summary

Phase 0 (Scaffolding) created the specification structure with proper documentation:

- Created `README.md` with full spec context
- Created `QUICK_START.md` for 5-minute onboarding
- Created `REFLECTION_LOG.md` (ready for learnings)
- Created `handoffs/` directory for phase transitions
- Established complexity score (38 → Medium)
- Defined 4-phase execution plan

### Key Learnings Applied

- Used spec guide template structure from `specs/_guide/README.md`
- Followed handoff standards from `specs/_guide/HANDOFF_STANDARDS.md`
- Referenced completed specs for structure examples (`lexical-playground-port`)
- Included explicit non-goals to scope work appropriately

---

## Context for Phase 1

### Working Context (~800 tokens, budget ≤2K)

**Current Task**: Discovery phase - systematically explore codebase to map Lexical POC structure and tiptap integration points.

**Success Criteria**:
- [ ] `outputs/codebase-context.md` created with all 4 required sections (POC structure, tiptap integration, existing wrappers, feature mapping)
- [ ] All 54 Lexical POC plugins cataloged with columns: name, category, email-compose-needed (yes/no), notes
- [ ] Tiptap feature list documents: button name, shortcut key, API method, and behavior for ALL toolbar buttons
- [ ] Feature mapping table maps each tiptap feature to: Lexical plugin name, availability (Available/Missing), priority (Must-have/Nice-to-have)
- [ ] Existing wrappers (`blocks/editor-00/`, `components/editor/`) analyzed with reuse recommendations
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings

**Blocking Issues**: None - fresh start on discovery.

**Immediate Dependencies**:
- Access to `apps/todox/src/app/lexical/` (POC source)
- Access to `apps/todox/src/features/editor/` (tiptap editor)
- Access to `apps/todox/src/components/` (existing wrappers)

**Constraints**:
- Follow context budget protocol (Green: ≤10 tool calls, Yellow: 11-15, Red: 16+)
- Delegate to `codebase-researcher` agent for systematic exploration
- Create checkpoint if Yellow/Red zone reached
- Prefer incremental diffs + checkpoints over large rewrites

### Episodic Context (~400 tokens, budget ≤1K)

**Phase 0 Outcome**: Spec scaffolding complete with README, QUICK_START, REFLECTION_LOG, and handoff structure.

**Key Decisions Made**:
1. **Location**: `apps/todox/src/components/editor/` (app-specific, not shared package yet)
2. **Wire Format**: Markdown for serialization (Lexical ↔ Markdown)
3. **Plugin Strategy**: Configurable composition, not all 54 plugins hardcoded
4. **UI Modes**: Fullscreen toggle + rich/simple mode toggle
5. **Mobile**: Simplified toolbar, not separate component
6. **First Integration**: Replace tiptap on `/` route (email compose)

**Patterns Discovered**: None yet - Phase 0 was scaffolding only.

### Semantic Context (~300 tokens, budget ≤500)

**Tech Stack**:
- Bun 1.3.x, Node 22
- Next.js 16 App Router, React 19
- Effect 3, `@effect/platform`
- Lexical editor framework (`@lexical/*` packages)
- Tailwind CSS, shadcn/ui components

**Architectural Constraints**:
- Follow Effect patterns from `.claude/rules/effect-patterns.md`
- Use namespace imports (`import * as Effect from "effect/Effect"`)
- Avoid async/await, use `Effect.gen`
- No native JS methods (use Effect utilities: `A.map`, `Str.split`, etc.)
- Follow cross-slice import restrictions (use `@beep/*` aliases)

**Naming Conventions**:
- Package naming: `@beep/[slice]-[layer]` (not applicable here, app-level)
- File naming: kebab-case for directories, PascalCase for components

### Procedural Context (links only)

**Effect Patterns**: `.claude/rules/effect-patterns.md`
**Repository Rules**: `.claude/rules/general.md`
**Code Standards**: `.claude/rules/code-standards.md`
**Testing Patterns**: `.claude/commands/patterns/effect-testing-patterns.md`
**Spec Guide**: `specs/_guide/README.md`
**Handoff Standards**: `specs/_guide/HANDOFF_STANDARDS.md`
**Related Spec Outputs**: `specs/completed/lexical-playground-port/outputs/` (check for reusable plugin documentation)
**Related Spec Learnings**: `specs/completed/lexical-playground-port/REFLECTION_LOG.md`

---

## Discovery Tasks (Phase 1)

### Task 1: Lexical POC Structure Analysis

**Objective**: Understand the current POC structure and identify which components are needed for email compose MVP.

**Sub-tasks**:
1. Map directory structure of `apps/todox/src/app/lexical/`
2. Catalog all 54 plugins, categorize by functionality
3. Identify which plugins are needed for email compose (vs. which are playground-specific)
4. Document node types in `PlaygroundNodes.ts`
5. Document theme structure in `themes/`

**Delegate to**: `codebase-researcher` agent

**Output**: Section in `outputs/codebase-context.md` titled "Lexical POC Structure"

### Task 2: Tiptap Integration Points

**Objective**: Identify where tiptap is currently used and what features it provides.

**Sub-tasks**:
1. Locate tiptap usage on `/` route (email compose area)
2. Document current features (toolbar buttons, formatting options)
3. Map tiptap extensions to equivalent Lexical plugins
4. Identify fullscreen toggle implementation
5. Document send button integration

**Delegate to**: `codebase-researcher` agent

**Output**: Section in `outputs/codebase-context.md` titled "Tiptap Integration Points"

### Task 3: Existing Lexical Wrappers Comparison

**Objective**: Understand what reusable Lexical infrastructure already exists.

**Sub-tasks**:
1. Analyze `apps/todox/src/components/blocks/editor-00/` (simple wrapper)
2. Analyze `apps/todox/src/components/editor/` (shared utilities)
3. Compare approaches, identify reusable patterns
4. Document what can be leveraged vs. what needs to be built

**Delegate to**: `codebase-researcher` agent

**Output**: Section in `outputs/codebase-context.md` titled "Existing Lexical Infrastructure"

### Task 4: Feature Mapping

**Objective**: Create mapping table from tiptap features to Lexical plugins.

**Sub-tasks**:
1. List all tiptap features from toolbar
2. Identify corresponding Lexical plugins for each feature
3. Document any gaps where Lexical plugin doesn't exist
4. Prioritize features for MVP (must-have vs. nice-to-have)

**Delegate to**: `codebase-researcher` agent

**Output**: Section in `outputs/codebase-context.md` titled "Feature Mapping Table"

---

## Implementation Order

1. **Task 1**: Lexical POC Structure Analysis
2. **Task 2**: Tiptap Integration Points
3. **Task 3**: Existing Wrappers Comparison
4. **Task 4**: Feature Mapping
5. **Synthesize**: Combine findings into `outputs/codebase-context.md`
6. **Reflect**: Update `REFLECTION_LOG.md` with Phase 1 learnings
7. **Handoff**: Create `HANDOFF_P2.md` + `P2_ORCHESTRATOR_PROMPT.md`

---

## Expected Output Structure

### outputs/codebase-context.md Template

```markdown
# Lexical Canonical Editor - Codebase Context

**Date**: YYYY-MM-DD
**Phase**: 1 (Discovery)

---

## Lexical POC Structure

### Directory Map
[Tree structure of apps/todox/src/app/lexical/]

### Plugin Catalog
| Plugin | Category | Email Compose? | Notes |
|--------|----------|----------------|-------|
| ... | ... | Yes/No | ... |

### Node Types
[List of node types from PlaygroundNodes.ts]

### Themes
[Theme structure and styling approach]

---

## Tiptap Integration Points

### Current Location
[Where tiptap is used on / route]

### Feature List
| Feature | Toolbar Button | Shortcut |
|---------|----------------|----------|
| Bold | Yes | Cmd+B |
| ... | ... | ... |

### Fullscreen Toggle Implementation
[How tiptap implements fullscreen]

### Send Button Integration
[How send button works with tiptap]

---

## Existing Lexical Infrastructure

### components/blocks/editor-00/
[Analysis of simple wrapper]

### components/editor/
[Analysis of shared utilities]

### Reusable Patterns
[What can be leveraged]

---

## Feature Mapping Table

| Tiptap Feature | Lexical Plugin | Status | Priority |
|----------------|----------------|--------|----------|
| Bold | RichTextPlugin + BoldNode | Available | Must-have |
| ... | ... | ... | ... |

---

## Recommendations

[Key findings and recommendations for Phase 2 design]
```

---

## Verification Steps

After completing discovery tasks:

```bash
# Verify output file exists with all 4 required sections
grep -q "## Lexical POC Structure" specs/pending/lexical-canonical-editor/outputs/codebase-context.md
grep -q "## Tiptap Integration Points" specs/pending/lexical-canonical-editor/outputs/codebase-context.md
grep -q "## Existing Lexical Infrastructure" specs/pending/lexical-canonical-editor/outputs/codebase-context.md
grep -q "## Feature Mapping Table" specs/pending/lexical-canonical-editor/outputs/codebase-context.md

# Verify plugin catalog has entries (should be 50+)
grep -c "|" specs/pending/lexical-canonical-editor/outputs/codebase-context.md

# Verify reflection log has actual Phase 1 entries (not template placeholders)
grep -q "### P1:" specs/pending/lexical-canonical-editor/REFLECTION_LOG.md

# No code changes in Phase 1, so no quality commands needed
```

---

## Context Budget Audit

Phase 1 should stay in Green Zone:

| Metric | Green Zone | Target |
|--------|------------|--------|
| Direct tool calls | 0-10 | 5-8 (delegating to codebase-researcher) |
| Large file reads | 0-2 | 1-2 (README, orchestrator prompt) |
| Sub-agent delegations | 0-5 | 1 (codebase-researcher for all tasks) |

**If Yellow/Red zone reached**: Create checkpoint file and pause for next session.

---

## Known Issues & Gotchas

**None yet** - Phase 0 was scaffolding only. Phase 1 discoveries will inform Phase 2 design.

---

## Success Criteria

Phase 1 is complete when:

- [ ] `outputs/codebase-context.md` created with all 4 sections (POC structure, tiptap integration, existing wrappers, feature mapping)
- [ ] All 54 plugins cataloged with columns: name, category, email-compose-needed (yes/no), notes
- [ ] Tiptap feature list includes: button name, shortcut key, API method, behavior for ALL toolbar buttons
- [ ] Feature mapping table maps each tiptap feature to: Lexical plugin, availability (Available/Missing), priority (Must-have/Nice-to-have)
- [ ] Recommendations for Phase 2 design documented with specific plugin/node selections
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `HANDOFF_P2.md` created (full context document)
- [ ] `P2_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt)
- [ ] Context budget stayed in Green Zone (or checkpoint created if not)

**Critical**: Phase 1 is NOT complete until BOTH handoff files exist (`HANDOFF_P2.md` AND `P2_ORCHESTRATOR_PROMPT.md`).

---

## Next Phase Preview

**Phase 2 (Design & Implementation)** will:
- Design component API based on Phase 1 findings
- Implement reusable editor at `src/components/editor/`
- Add fullscreen toggle
- Add rich/simple mode toggle
- Implement markdown serialization
- Create mobile-responsive toolbar

Estimated sessions: 2-3

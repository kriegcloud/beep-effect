# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 (Discovery) of the lexical-canonical-editor spec.

### Context

Phase 0 (Scaffolding) created the specification structure with README, QUICK_START, REFLECTION_LOG, and handoff documents. The spec defines extracting the Lexical editor POC into a canonical, reusable component and replacing the tiptap editor on the `/` route.

**Key Decisions from Phase 0**:
- Target location: `apps/todox/src/components/editor/`
- Wire format: Markdown (Lexical ↔ Markdown serialization)
- Plugin strategy: Configurable composition (not all 54 plugins hardcoded)
- UI modes: Fullscreen toggle + rich/simple mode toggle
- Mobile: Simplified toolbar (not separate component)
- First integration: Replace tiptap on `/` route (email compose)

### Your Mission

Conduct systematic codebase discovery to map the Lexical POC structure and tiptap integration points. The goal is to create a comprehensive context document that informs Phase 2 design decisions.

**Specific Work Items**:

1. **Analyze Lexical POC structure** (`apps/todox/src/app/lexical/`)
   - Map directory structure
   - Catalog all 54 plugins, categorize by functionality
   - Identify which plugins are needed for email compose MVP
   - Document node types and theme structure

2. **Identify tiptap integration points** (email compose on `/` route)
   - Locate tiptap usage in codebase
   - Document current features (toolbar buttons, formatting)
   - Map tiptap extensions to Lexical plugins
   - Document fullscreen toggle implementation
   - Document send button integration

3. **Compare existing Lexical wrappers**
   - Analyze `components/blocks/editor-00/` (simple wrapper)
   - Analyze `components/editor/` (shared utilities)
   - Identify reusable patterns

4. **Create feature mapping table**
   - List all tiptap features
   - Map to corresponding Lexical plugins
   - Document gaps where plugins don't exist
   - Prioritize features (must-have vs. nice-to-have)

### Critical Patterns

**Delegation Pattern** (REQUIRED):
```typescript
// DO NOT manually explore 171+ files with sequential Read calls
// DELEGATE to codebase-researcher agent:

// Example agent prompt:
"Use the codebase-researcher agent to systematically explore:

Research questions:
1. What plugins exist in apps/todox/src/app/lexical/plugins/?
2. Which plugins are needed for basic rich text editing (email compose)?
3. What node types are defined in PlaygroundNodes.ts?
4. What themes are available in themes/?

Output: Section in outputs/codebase-context.md titled 'Lexical POC Structure'"
```

**Context Budget Tracking**:
```typescript
// Track your tool usage during the phase:
// - Direct tool calls: aim ≤10 (Yellow 11-15, Red 16+)
// - Large file reads (>200 lines): aim ≤2 (Yellow 3-4, Red 5+)
// - Sub-agent delegations: aim ≤5

// If you hit Yellow zone: assess remaining work
// If you hit Red zone: STOP, create checkpoint, continue in new session
```

### Reference Files

**Primary Exploration Targets**:
- Lexical POC: `apps/todox/src/app/lexical/` (entry: `page.tsx` → `App.tsx` → `Editor.tsx`)
- Lexical plugins: `apps/todox/src/app/lexical/plugins/` (54 directories)
- Lexical nodes: `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts`
- Lexical themes: `apps/todox/src/app/lexical/themes/editor-theme.ts`
- Tiptap editor: `apps/todox/src/features/editor/editor.tsx`
- Tiptap toolbar: `apps/todox/src/features/editor/components/toolbar.tsx`
- Simple wrapper: `apps/todox/src/components/blocks/editor-00/`
- Shared utils: `apps/todox/src/components/editor/`

**Pattern References**:
- Effect patterns: `.claude/rules/effect-patterns.md`
- Repository rules: `.claude/rules/general.md`
- Spec guide: `specs/_guide/README.md`

**Related Spec Outputs (check for reusable documentation)**:
- `specs/completed/lexical-playground-port/outputs/` — May contain plugin architecture documentation
- `specs/completed/lexical-playground-port/REFLECTION_LOG.md` — Lessons from POC port

**Output Template**:
- `specs/pending/lexical-canonical-editor/templates/codebase-context.template.md` — Fill this template for `outputs/codebase-context.md`

### Verification

After completing all discovery tasks:

```bash
# Verify output file exists with all 4 required sections
grep -q "## Lexical POC Structure" specs/pending/lexical-canonical-editor/outputs/codebase-context.md
grep -q "## Tiptap Integration Points" specs/pending/lexical-canonical-editor/outputs/codebase-context.md
grep -q "## Existing Lexical Infrastructure" specs/pending/lexical-canonical-editor/outputs/codebase-context.md
grep -q "## Feature Mapping Table" specs/pending/lexical-canonical-editor/outputs/codebase-context.md

# Verify plugin catalog has entries (should be 50+)
grep -c "|" specs/pending/lexical-canonical-editor/outputs/codebase-context.md

# Verify reflection log has actual Phase 1 entries
grep -q "### P1:" specs/pending/lexical-canonical-editor/REFLECTION_LOG.md

# No code changes in Phase 1, so no quality commands needed
```

### Success Criteria

- [ ] `outputs/codebase-context.md` created with all 4 required sections
- [ ] All 54 Lexical plugins cataloged with columns: name, category, email-compose-needed (yes/no), notes
- [ ] Tiptap feature list includes: button name, shortcut key, API method, behavior for ALL toolbar buttons
- [ ] Feature mapping table maps each tiptap feature to: Lexical plugin, availability (Available/Missing), priority (Must-have/Nice-to-have)
- [ ] Existing Lexical wrappers analyzed with specific reuse recommendations
- [ ] Recommendations for Phase 2 design documented
- [ ] Context budget stayed in Green Zone (≤10 tool calls, ≤2 large reads, ≤5 delegations)
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `HANDOFF_P2.md` created (full context document)
- [ ] `P2_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt)

### Handoff Document

Read full context in: `specs/pending/lexical-canonical-editor/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:

1. **Update `REFLECTION_LOG.md`** with learnings:
   - What discovery methods worked well?
   - What codebase-specific patterns emerged?
   - What gaps remain for Phase 2?

2. **Create `HANDOFF_P2.md`** (context document) with:
   - Phase 1 summary (what was discovered)
   - Key findings from codebase analysis
   - Component API design based on findings
   - Implementation order for Phase 2
   - Known gotchas to avoid

3. **Create `P2_ORCHESTRATOR_PROMPT.md`** (copy-paste prompt) with:
   - Concise Phase 2 mission statement
   - Specific files to create/modify
   - Critical patterns with code examples
   - Verification commands
   - Success criteria checklist

**Critical**: Phase 1 is NOT complete until BOTH handoff files exist.

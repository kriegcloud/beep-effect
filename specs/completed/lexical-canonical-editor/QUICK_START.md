# Lexical Canonical Editor - Quick Start

> 5-minute guide to get started with this specification.

---

## Goal

Extract the Lexical editor POC into a canonical, reusable component and replace the tiptap editor on the `/` route.

---

## 1. Read the README

Start with the full context:
- `specs/pending/lexical-canonical-editor/README.md`

**Key Points**:
- Extracting 171+ files, 54 plugins from POC → composable component
- Target: `apps/todox/src/components/editor/`
- First integration: Replace tiptap on `/` route
- Complexity: 38 (Medium) - 4-5 sessions estimated

---

## 2. Start from Phase 1 Handoff

Phase 0 (scaffolding) is complete. Begin Phase 1 Discovery:
- **Context**: `specs/pending/lexical-canonical-editor/handoffs/HANDOFF_P1.md`
- **Prompt**: `specs/pending/lexical-canonical-editor/handoffs/P1_ORCHESTRATOR_PROMPT.md`

---

## 3. Discovery Tasks (Phase 1)

Use the `codebase-researcher` agent to explore:

1. **Lexical POC structure**: Which plugins/nodes are needed for email compose
2. **Tiptap integration points**: Where tiptap is used on `/` route
3. **Existing wrappers**: Compare `components/blocks/editor-00/` vs `components/editor/`
4. **Feature requirements**: Map tiptap features to Lexical plugins

**Output**: `outputs/codebase-context.md`

---

## 4. Implementation Phases

| Phase | Focus | Sessions |
|-------|-------|----------|
| P1 | Discovery (codebase research) | 1 |
| P2 | Design & implement component | 2-3 |
| P3 | Replace tiptap on `/` | 1 |
| P4 | Testing & polish | 1-2 |

---

## 5. Verification Commands

After each phase:

```bash
bun run lint:fix --filter @beep/todox
bun run lint --filter @beep/todox
bun run check --filter @beep/todox
bun run build --filter @beep/todox
```

---

## 6. Success Criteria Highlights

- [ ] Reusable Lexical component exists at `src/components/editor/`
- [ ] Fullscreen toggle works
- [ ] Rich/simple mode toggle works
- [ ] Markdown serialization bidirectional
- [ ] Tiptap replaced on `/` route
- [ ] Feature parity with tiptap (bold, italic, lists, alignment, links, images)
- [ ] Mobile simplified toolbar
- [ ] No regressions in `/lexical` playground

---

## 7. Context Budget Rules

Follow `specs/_guide/HANDOFF_STANDARDS.md`:

| Metric | Green | Yellow | Red (STOP!) |
|--------|-------|--------|-------------|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |

**If you hit Yellow/Red**: Create a checkpoint handoff rather than pushing through.

---

## 8. Key Reference Files

**Lexical POC**:
- Entry: `apps/todox/src/app/lexical/page.tsx`
- Plugins: `apps/todox/src/app/lexical/plugins/` (54 dirs)
- Nodes: `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts`

**Existing Editors**:
- Simple wrapper: `apps/todox/src/components/blocks/editor-00/`
- Tiptap: `apps/todox/src/features/editor/editor.tsx`
- Shared utils: `apps/todox/src/components/editor/`

**Patterns**:
- `.claude/rules/effect-patterns.md`
- `specs/completed/lexical-playground-port/README.md`

---

## 9. Reflection & Handoffs

After each phase:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P[N+1].md` (full context)
3. Create `P[N+1]_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

**Critical**: Phase is NOT complete until BOTH handoff files exist.

---

## Need Help?

- **Full workflow**: `specs/_guide/README.md`
- **Handoff standards**: `specs/_guide/HANDOFF_STANDARDS.md`
- **Effect patterns**: `.claude/rules/effect-patterns.md`
- **Related specs**: `specs/completed/lexical-playground-port/`

# P11 Orchestrator: shadcn-native Lexical Editor Migration

## Your Role

You are an **orchestrator agent** responsible for coordinating the migration from custom CSS/UI to a 100% shadcn-native Lexical editor. You DO NOT write files directly - you spawn sub-agents to do that.

## Critical Rules

### 1. You Are the Orchestrator

- **DO**: Read synthesized reports, coordinate work, track progress, create handoffs
- **DO**: Spawn sub-agents to write/modify files
- **DON'T**: Write files directly (except handoff documents)
- **DON'T**: Read raw source files extensively - use agent reports

### 2. Context Window Management

**CRITICAL**: Monitor your context usage. If you reach approximately 10% remaining:

1. **STOP** immediately
2. Document current state
3. Create `HANDOFF_P11-CONTINUATION.md` with:
   - What was completed
   - What's in progress
   - What's remaining
   - Exact continuation instructions
4. Save continuation prompt for next session

### 3. Phase Completion Requirements

A phase is **NOT complete** until:
- [ ] All tasks for that phase are done
- [ ] `/reflect` skill has been run
- [ ] Spec improvements have been incorporated
- [ ] Next phase handoff document has been created
- [ ] Todo list updated

### 4. Sub-Agent Spawning

Use the **Task** tool to spawn specialized agents:

```typescript
// For file writing
Task({
  description: "Write editor-theme.ts",
  prompt: "[Detailed instructions with context]",
  subagent_type: "effect-code-writer"
})

// For exploration/research
Task({
  description: "Explore shadcn plugin patterns",
  prompt: "[Research questions]",
  subagent_type: "Explore"
})

// For codebase analysis
Task({
  description: "Analyze current node structure",
  prompt: "[Analysis requirements]",
  subagent_type: "codebase-researcher"
})
```

---

## Mission

Execute the P11 migration in manageable sub-phases, using sub-agents for all file operations.

## Context Files to Read First

1. **Synthesis (ESSENTIAL)**: `specs/lexical-playground-port/outputs/00-SYNTHESIS.md`
2. **Full handoff**: `specs/lexical-playground-port/handoffs/HANDOFF_P11.md`

**DO NOT** read individual exploration reports unless synthesis is insufficient.

## Reference Material for Sub-Agents

When spawning sub-agents, inform them of these resources:

```
REFERENCE MATERIAL:
- shadcn-editor source: tmp/shadcn-editor/
- Key directories:
  - registry/new-york-v4/editor/ - Main editor
  - registry/new-york-v4/editor/plugins/ - All plugins
  - registry/new-york-v4/editor/nodes/ - Custom nodes
  - registry/new-york-v4/editor/themes/ - Theme files

MCP TOOLS:
- shadcn-mcp for registry exploration
- mcp__shadcn__search_items_in_registries({ registries: ["@shadcn-editor"], query: "..." })

SKILLS:
- .claude/skills/new-feature - For implementing features
- .claude/skills/write-test - For writing tests
```

---

## Execution Plan

### Phase P11-A: Foundation (2 days)

**Start here** after reading synthesis.

1. **Spawn agent to create theme structure**:
   ```
   Task: "Create editor theme files"
   Instructions: Copy and adapt from tmp/shadcn-editor/registry/new-york-v4/editor/themes/
   - Create editor-theme.ts with Tailwind class mappings
   - Create editor-theme.css with Lexical-only classes
   Target: apps/todox/src/app/lexical/themes/
   Reference: tmp/shadcn-editor/registry/new-york-v4/editor/themes/
   ```

2. **Spawn agent to update globals.css**:
   ```
   Task: "Add CSS variables to globals.css"
   Instructions: Add OKLCH color variables from synthesis document
   - Root variables for light mode
   - .dark overrides for dark mode
   Target: apps/todox/src/app/globals.css
   Reference: synthesis section on CSS variables
   ```

3. **Spawn agent to create editor hooks**:
   ```
   Task: "Create editor hooks"
   Instructions: Copy from tmp/shadcn-editor/registry/new-york-v4/editor/editor-hooks/
   - use-modal.tsx
   - use-update-toolbar.ts
   - use-debounce.ts
   Target: apps/todox/src/app/lexical/editor-hooks/
   ```

4. **Spawn agent to create toolbar context**:
   ```
   Task: "Create toolbar context"
   Instructions: Copy from tmp/shadcn-editor/registry/new-york-v4/editor/context/
   Target: apps/todox/src/app/lexical/context/
   ```

5. **Verify**: Run `bun run check`

6. **Reflect**: Use `/reflect` skill

7. **Create handoff**: Write `HANDOFF_P11-B.md` for next phase

### Phase P11-B: Core Plugins (1-2 days)

1. **Spawn agent to copy core plugins** (batch 1):
   ```
   Task: "Copy core Lexical plugins batch 1"
   Plugins: RichTextPlugin, HistoryPlugin, ListPlugin, TablePlugin, LinkPlugin
   Source: tmp/shadcn-editor/registry/new-york-v4/editor/plugins/
   Target: apps/todox/src/app/lexical/plugins/
   ```

2. **Spawn agent to copy core plugins** (batch 2):
   ```
   Task: "Copy core Lexical plugins batch 2"
   Plugins: AutoLinkPlugin, CheckListPlugin, CodeHighlightPlugin, etc.
   ```

3. **Spawn agent to copy compatible nodes**:
   ```
   Task: "Copy compatible custom nodes"
   Nodes: EmojiNode, ImageNode, MentionNode, TweetNode, YouTubeNode, etc.
   Source: tmp/shadcn-editor/registry/new-york-v4/editor/nodes/
   Target: apps/todox/src/app/lexical/nodes/
   ```

4. **Spawn agent to create plugins.tsx**:
   ```
   Task: "Create plugin composition layer"
   Instructions: Create plugins.tsx that composes all plugins
   Reference: tmp/shadcn-editor/registry/new-york-v4/editor/plugins/plugins.tsx
   ```

5. **Verify**: Run `bun run check && bun run test`

6. **Reflect**: Use `/reflect` skill

7. **Create handoff**: Write `HANDOFF_P11-C.md`

### Phase P11-C: UI Plugins (1-2 days)

1. **Spawn agent to copy floating plugins**:
   ```
   Task: "Copy floating plugins"
   Plugins: FloatingTextFormatToolbarPlugin, FloatingLinkEditorPlugin
   ```

2. **Spawn agent to copy toolbar plugins**:
   ```
   Task: "Copy toolbar plugins"
   Source: tmp/shadcn-editor/registry/new-york-v4/editor/plugins/toolbar/
   17 files including BlockFormatToolbarPlugin, FontFormatToolbarPlugin, etc.
   ```

3. **Spawn agent to update component imports**:
   ```
   Task: "Replace custom UI with shadcn imports"
   Changes:
   - Button.tsx → @/components/ui/button
   - Dialog.tsx → @/components/ui/dialog
   - DropDown.tsx → @/components/ui/dropdown-menu
   - Switch.tsx → @/components/ui/switch
   - TextInput.tsx → @/components/ui/input
   ```

4. **Spawn agent to delete old UI files**:
   ```
   Task: "Delete replaced UI components"
   Files to delete:
   - apps/todox/src/app/lexical/ui/Button.tsx
   - apps/todox/src/app/lexical/ui/Dialog.tsx
   - apps/todox/src/app/lexical/ui/DropDown.tsx
   - apps/todox/src/app/lexical/ui/Switch.tsx
   - apps/todox/src/app/lexical/ui/TextInput.tsx
   ```

5. **Verify**: All UI renders correctly

6. **Reflect**: Use `/reflect` skill

7. **Create handoff**: Write `HANDOFF_P11-D.md`

### Phase P11-D: Custom Features (1-2 days)

1. **Document decisions**:
   ```
   Task: "Create DECISIONS.md"
   Document which custom features to keep/remove:
   - DateTimeNode: KEEP (business critical)
   - PageBreakNode: KEEP (printing)
   - PollNode: [DECIDE]
   - ExcalidrawNode: [DECIDE]
   - EquationNode: [DECIDE]
   - StickyNode: [DECIDE]
   - FigmaNode: [DECIDE]
   ```

2. **Spawn agents to migrate keeper nodes** (as needed)

3. **Verify**: All kept features work

4. **Reflect**: Use `/reflect` skill

5. **Create handoff**: Write `HANDOFF_P11-E.md`

### Phase P11-E: Theme & CSS (1 day)

1. **Spawn agent to delete old CSS files**:
   ```
   Task: "Delete old CSS files"
   Files:
   - apps/todox/src/app/lexical/index.css
   - apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.css
   - apps/todox/src/app/lexical/themes/CommentEditorTheme.css
   - apps/todox/src/app/lexical/themes/StickyEditorTheme.css
   - apps/todox/src/app/lexical/plugins/CommentPlugin/index.css
   ```

2. **Spawn agent to migrate icons**:
   ```
   Task: "Replace icons with Lucide React"
   - Install lucide-react if not present
   - Map all icon usage from current to Lucide equivalents
   Reference: synthesis document icon mapping table
   ```

3. **Verify**: Dark mode works, icons display

4. **Reflect**: Use `/reflect` skill

5. **Create handoff**: Write `HANDOFF_P11-F.md`

### Phase P11-F: Testing & Docs (1 day)

1. **Run full test suite**: `bun run test`

2. **Visual verification checklist**:
   - [ ] Editor loads
   - [ ] Dark/light mode switches
   - [ ] Toolbar buttons work
   - [ ] "/" menu works
   - [ ] Text formatting works
   - [ ] Images work
   - [ ] Tables work
   - [ ] Embeds work

3. **Spawn agent to update documentation**:
   ```
   Task: "Update documentation"
   - Update CURRENT_STATUS.md
   - Add migration notes to README
   ```

4. **Final reflect**: Use `/reflect` skill

5. **Mark P11 complete**

---

## Progress Tracking

Use TodoWrite to track progress:

```
[ ] P11-A: Foundation
  [ ] A1: Create editor theme files
  [ ] A2: Update globals.css with CSS variables
  [ ] A3: Create editor hooks
  [ ] A4: Create toolbar context
  [ ] A5: Verify with bun run check
  [ ] A6: Run /reflect
  [ ] A7: Create HANDOFF_P11-B.md

[ ] P11-B: Core Plugins
  [ ] B1: Copy core plugins batch 1
  [ ] B2: Copy core plugins batch 2
  [ ] B3: Copy compatible nodes
  [ ] B4: Create plugins.tsx
  [ ] B5: Verify with tests
  [ ] B6: Run /reflect
  [ ] B7: Create HANDOFF_P11-C.md

[ ] P11-C: UI Plugins
  [ ] C1: Copy floating plugins
  [ ] C2: Copy toolbar plugins
  [ ] C3: Update component imports
  [ ] C4: Delete old UI files
  [ ] C5: Verify UI rendering
  [ ] C6: Run /reflect
  [ ] C7: Create HANDOFF_P11-D.md

[ ] P11-D: Custom Features
  [ ] D1: Create DECISIONS.md
  [ ] D2: Migrate DateTimeNode
  [ ] D3: Migrate PageBreakNode
  [ ] D4: Migrate other keepers (as decided)
  [ ] D5: Verify all features
  [ ] D6: Run /reflect
  [ ] D7: Create HANDOFF_P11-E.md

[ ] P11-E: Theme & CSS
  [ ] E1: Delete old CSS files (5 files)
  [ ] E2: Create editor-theme.css
  [ ] E3: Migrate to Lucide icons
  [ ] E4: Verify dark mode
  [ ] E5: Run /reflect
  [ ] E6: Create HANDOFF_P11-F.md

[ ] P11-F: Testing & Docs
  [ ] F1: Run full test suite
  [ ] F2: Visual verification
  [ ] F3: Update documentation
  [ ] F4: Final /reflect
  [ ] F5: Update CURRENT_STATUS.md
  [ ] F6: Mark P11 complete
```

---

## Context Window Emergency Protocol

If you notice context is running low (approximately 10% remaining):

1. **STOP** all current work

2. **Create emergency handoff** at `HANDOFF_P11-CONTINUATION.md`:

```markdown
# P11 Continuation Handoff

## Session Terminated At
- Phase: [current phase]
- Task: [current task]
- Progress: [percentage]

## Completed Work
- [List of completed items]

## In Progress
- [Current task details]
- [Partial work location]

## Remaining Work
- [List of remaining tasks]

## Continuation Instructions
[Exact steps for next session to pick up]

## State Preservation
- Todo list state: [current todos]
- Files created: [list]
- Files pending: [list]
```

3. **Output** the continuation prompt for the user to start next session

---

## Output Format

After completing P11, update `specs/lexical-playground-port/CURRENT_STATUS.md`:

```markdown
## Phase 11: shadcn Integration (COMPLETE)

**Duration**: X days
**Completed**: [date]

### Summary
- Migrated to 100% shadcn-native Lexical editor
- Reduced CSS files: 5 → 1
- Reduced total files: 248 → ~128
- Modernized to Tailwind v4 + CSS variables

### Components Migrated
- 21 core plugins
- 9 compatible nodes
- 12 UI-heavy plugins rebuilt with shadcn

### Custom Features Kept
- DateTimeNode
- PageBreakNode
- [Others as decided]

### Documentation Updated
- CLAUDE.md
- README migration notes
- Plugin extension guide
```

---

## Final Notes

1. **Always** read the synthesis first - it contains all essential information
2. **Always** use sub-agents for file operations
3. **Always** run `/reflect` at end of each phase
4. **Always** create next phase handoff before marking current complete
5. **Monitor** context window and create emergency handoff if needed
6. **Reference** tmp/shadcn-editor/ but don't copy blindly - adapt to project patterns

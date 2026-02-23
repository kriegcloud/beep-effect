# lexical-canonical-editor: Reflection Log

> Cumulative learnings from spec creation and implementation phases.

---

## Reflection Protocol

After each phase, document:

1. **What Worked** - Techniques that were effective
2. **What Didn't Work** - Approaches that failed or were inefficient
3. **Methodology Improvements** - Changes to apply in future phases
4. **Prompt Refinements** - Updated prompts based on learnings
5. **Codebase-Specific Insights** - Patterns unique to this repo

---

## Reflection Entries

### P0: Scaffolding — 2026-02-14

1. **What Worked**
   - Spec guide template (`specs/_guide/README.md`) provided clear structure for README, preventing blank-page paralysis
   - Complexity calculator (factor/weight formula) gave objective justification for Medium classification (score 38)
   - Referencing the completed `lexical-playground-port` spec helped ground the architecture section with real file paths and plugin counts
   - Chrome browser automation confirmed the current state of both `/lexical` (POC loaded) and `/` (tiptap editor with toolbar) before writing the spec
   - Interactive user discussion surfaced 6 key design decisions (location, wire format, plugin strategy, UI modes, mobile, first integration) that were captured directly in the spec

2. **What Didn't Work**
   - Chrome MCP extension was unreliable (disconnections, "error page" responses when page was actually loaded) — visual confirmation via screenshots was more reliable
   - Initial temptation to put the component in `packages/ui/editor` (shared package) — user correctly scoped to app-level first to avoid cross-package complexity

3. **Methodology Improvements**
   - Run spec-reviewer immediately after P0 scaffolding, before starting P1 — catches template placeholders and missing directories
   - Always create `templates/` directory for medium+ complexity specs even if templates are minimal
   - Make success criteria measurable from the start — "Tiptap features fully documented" is vague, should specify expected fields/columns

4. **Prompt Refinements**
   - P1 orchestrator prompt should explicitly reference related completed spec outputs (e.g., `lexical-playground-port/outputs/`) to avoid re-discovering known patterns
   - Include content-quality verification commands in handoffs, not just file-existence checks

5. **Codebase-Specific Insights**
   - Lexical POC at `app/lexical/` has 171+ files and 54 plugin directories — too large for manual orchestrator exploration
   - Three existing editor locations exist (POC, tiptap features, simple wrapper, shared utils) — comparison is a prerequisite for design
   - Tiptap editor at `features/editor/` is currently unused but has fullscreen toggle implementation worth studying
   - `components/blocks/editor-00/` shows the existing pattern for reusable Lexical wrappers (3 files: editor.tsx, nodes.ts, plugins.tsx)

### P1: Discovery — 2026-02-14

1. **What Worked**
   - Leveraging completed `lexical-playground-port` spec outputs before launching agents eliminated re-discovery of plugin architecture (80+ plugins already documented), node system (9 custom nodes), and theming patterns — saved substantial research time
   - Parallel agent delegation (3 codebase-researcher agents) covered Lexical POC, tiptap integration, and existing wrappers simultaneously in ~2.5 minutes total
   - Structured agent prompts with specific research questions and output format requirements produced comprehensive, well-organized findings that could be directly synthesized
   - The codebase-context.template.md provided clear structure expectations for the output document, making synthesis straightforward
   - Tiptap integration agent discovered critical details: Send buttons are non-functional (no onClick handlers), `fullItem` prop controls toolbar complexity, content is HTML not markdown

2. **What Didn't Work**
   - Initial "54 plugins" count from P0 was imprecise — actual count is 53 custom + several built-in `@lexical/react` plugins used directly in Editor.tsx. The prior spec documented "80+ components" which includes sub-components. Precise counts matter for success criteria.
   - P0 insight that "tiptap editor at features/editor/ is currently unused" was incorrect — it is actively used in MailCompose and MailDetails on the `/` route. Browser automation in P0 likely saw the editor but misinterpreted its usage status.

3. **Methodology Improvements**
   - For large codebase exploration, always check completed spec outputs first — they may already contain 60-80% of needed information
   - Agent prompts should include "also check for X" expansions to catch adjacent concerns (e.g., asking about tiptap also revealed the component hierarchy from route to editor)
   - When prior specs exist, frame agents as "verify and extend" rather than "explore from scratch"

4. **Prompt Refinements**
   - P2 orchestrator prompt should include the full feature mapping table as inline context — agents implementing the component need it available without reading the full codebase-context.md
   - Include the tiptap fullscreen implementation pattern as a code example in P2 handoff, since it needs to be replicated

5. **Codebase-Specific Insights**
   - Playground uses newer `defineExtension` + `LexicalExtensionComposer` API while `editor-00` uses older `LexicalComposer` — must choose one for canonical editor (recommend newer)
   - Two separate theme files exist (shared at `components/editor/` and playground at `app/lexical/`) — playground theme is strictly more complete (206 vs 127 lines, includes dark mode + variants)
   - Tiptap outputs HTML via `editor.getHTML()`, debounced 200ms. Switching to markdown requires `@lexical/markdown` transformers (`$convertToMarkdownString`/`$convertFromMarkdownString`)
   - MailCompose is a fixed-position `Paper` rendered via MUI Portal at bottom-right corner — fullscreen toggle in canonical editor should use similar portal pattern
   - `editor-00` has a clean dual-callback API (`onChange` + `onSerializedChange`) worth preserving and extending with `onMarkdownChange`
   - All Lexical imports are contained within todox app — no cross-package Lexical usage exists in the monorepo

### P2: Design & Implementation — 2026-02-14

1. **What Worked**
   - Single general-purpose agent delegation completed all file creation in ~6 minutes — for a well-scoped implementation phase with clear file targets, one capable agent outperforms multiple specialized agents
   - Plugin imports from the POC via relative paths (`../../app/lexical/plugins/ToolbarPlugin`) worked cleanly, avoiding file duplication while keeping the POC intact as specified in constraints
   - The `defineExtension` + `LexicalExtensionComposer` API (chosen in P1) was straightforward to set up and provided a clean composition model for 16 plugins + 10 nodes
   - Markdown serialization was simple using existing `PLAYGROUND_TRANSFORMERS` from `@lexical/markdown` — no custom transformer work needed
   - The handoff's Component API section (props interface) translated directly into implementation with minimal interpretation needed
   - Consolidating the playground theme turned out to be a no-op — the existing theme content was already identical, confirming P1's analysis that the playground theme was "strictly more complete"

2. **What Didn't Work**
   - The `rerenderKey` approach for fullscreen toggle (incrementing `key` on `LexicalExtensionComposer`) loses all editor state on toggle — content is re-initialized from `initialMarkdown`, so any unsaved edits vanish. This is a functional regression from tiptap's approach where content persisted across fullscreen transitions.
   - Fullscreen toggle was initially implemented as a standalone hover button rather than integrated into the ToolbarPlugin, creating UX fragmentation — the toolbar is the natural location for mode toggles
   - The cascading `bun run check --filter @beep/todox` could not validate our changes in isolation due to ~72 pre-existing TS errors (mostly TS6305 from stale build outputs of upstream `@beep/ui`) and a build failure in `@beep/customization-ui` (Hotkeys.atoms.ts). Direct file-level checking (`bun tsc --noEmit --isolatedModules`) was required to verify correctness.
   - The tiptap fullscreen uses a separate `fullScreen.value` boolean controlling the containing Paper's sizing, while the LexicalEditor's fullscreen is independent — this creates potential UX confusion where two different "fullscreen" behaviors could conflict

3. **Methodology Improvements**
   - For implementation phases with clear file targets (known inputs + known outputs), delegate to a single capable agent rather than splitting across specialists — coordination overhead exceeds parallelism gains
   - Always verify state preservation across UI mode transitions (fullscreen, rich/simple) before marking a feature complete — "it toggles" is not the same as "it toggles without data loss"
   - When cascading type checks fail due to upstream errors, document the isolation verification method used so reviewers can confirm correctness independently
   - Include a "state management" section in implementation handoffs — fullscreen toggle, mode switching, and re-render strategies all require explicit state preservation design

4. **Prompt Refinements**
   - P3 orchestrator prompt should explicitly list the pre-existing upstream errors so the cleanup agent knows which errors are NOT caused by our changes
   - Include the exact file list created in P2 as inline context for P3 — cleanup agents need to know what exists before deciding what to remove
   - Handoff should specify the fullscreen state preservation bug as a concrete task with the expected behavior (content persists) and current behavior (content resets)

5. **Codebase-Specific Insights**
   - React `createPortal` (from `react-dom`) was preferred over MUI `Portal` to avoid coupling the Lexical component to MUI — this is consistent with the goal of a reusable component that could eventually move to a shared package
   - The `useMarkdownOnChange` hook pattern (registering `editor.registerUpdateListener` to serialize on every change) works but has no debounce — for large documents, this could cause performance issues. Consider adding debounce in P3.
   - The tiptap `features/editor/` directory imports are still present in `mail-compose.tsx` and `mail-details.tsx` for the `fullItem` prop and `fullScreen` state — removing tiptap is not as simple as deleting the directory, these integration points need explicit refactoring
   - Three custom nodes (ImageNode, MentionNode, EmojiNode) are imported from the POC via relative paths — when the POC is eventually removed, these nodes must be extracted to `components/editor/nodes/`

### P3: Cleanup & Polish — 2026-02-14

1. **What Worked**
   - Single-agent delegation continued to prove most effective — one general-purpose agent completed all 7 tasks (fullscreen fix, node extraction, tiptap removal, toolbar integration, debounce, a11y) in a single session
   - Pre-verification of import dependencies before delegation was essential — confirming zero external imports from `features/editor/` and `blocks/editor-00/` made deletion safe to delegate without risk
   - The `ContentTracker` pattern (ref + registerUpdateListener) elegantly solved the fullscreen state preservation bug without requiring editor access from outside the Composer — the ref is always up to date when the toggle fires
   - Extracting only self-contained nodes (EmojiNode, MentionNode) while keeping ImageNode as a POC import was the correct pragmatic call — ImageNode's dependency tree (ImageComponent → collaboration, settings context, image resizer, 5+ plugins) would have required extracting half the POC
   - The 200ms debounce implementation using `setTimeout`/`clearTimeout` in `useMarkdownOnChange` was straightforward and matches the prior tiptap behavior

2. **What Didn't Work**
   - `bun tsc --noEmit --isolatedModules` without project config produces false positives (JSX flag errors, module resolution issues) — must use `--project apps/todox/tsconfig.json` and filter output to `components/editor/` for meaningful results
   - The agent initially swapped the fullscreen Unicode icon semantics (⊞ for exit, ⊟ for enter) — these needed manual correction. Visual icon meaning matters even when aria-labels are correct.
   - The agent created a nested `role="toolbar"` inside the outer toolbar div, which is invalid ARIA — needed manual cleanup to remove the inner toolbar role

3. **Methodology Improvements**
   - Pre-read dependency trees of files to be extracted BEFORE delegating — ImageNode's deep dependencies were only discovered by reading the file, preventing a failed extraction attempt
   - Always review agent output for a11y correctness — nested ARIA landmark roles and icon semantics are subtle errors that pass type checks
   - For type verification of files in a monorepo, always use the project tsconfig rather than `--isolatedModules`

4. **Prompt Refinements**
   - Include dependency tree analysis in extraction task prompts — "these nodes are self-contained" vs "this node has deep dependencies, keep importing from POC"
   - Specify ARIA rules in implementation prompts — "no nested role=toolbar" prevents invalid a11y patterns

5. **Codebase-Specific Insights**
   - ImageNode depends on ImageComponent which pulls in collaboration context, settings context, image resizer, and 5+ POC plugins — it cannot be extracted without a major refactoring effort
   - The `ContentTracker` + ref pattern is a general solution for preserving state across Lexical editor remounts — applicable whenever `key` prop changes force re-initialization
   - Tiptap removal was clean — 9 `@tiptap/*` packages removed, zero external references to `features/editor/`
   - The `blocks/editor-00/` directory had zero external references and was safely deleted

---

## Accumulated Improvements

### Template Updates
- Medium complexity specs should include `templates/` directory from the start
- Success criteria template should enforce measurability (expected columns, field counts)
- Implementation handoffs should include a "State Management" section covering mode transitions

### Process Updates
- Run spec-reviewer after P0 scaffolding, before P1 begins
- Always cross-reference completed related specs in handoff Procedural Context
- Check completed spec outputs BEFORE launching research agents — may already contain majority of needed information
- Frame discovery agents as "verify and extend" when prior documentation exists
- For implementation phases with clear scope, prefer single-agent delegation over multi-agent coordination
- Verify state preservation across all UI mode transitions before marking features complete

### Discovery Phase Updates
- Parallel agent delegation is highly effective for large codebases (3 agents, ~2.5 min vs sequential exploration)
- Agent prompts with explicit output format and research questions produce synthesis-ready results
- Include adjacent concerns in agent prompts (e.g., "also document the component hierarchy")

### Implementation Phase Updates
- Single capable agent outperforms multiple specialists when file targets are well-defined (~6 min for 8 files)
- Relative imports from POC directories avoid duplication but create hidden dependencies on POC structure
- Cascading type check failures from upstream packages require isolated verification (`bun tsc --noEmit --isolatedModules`)
- Fullscreen toggle implementations must preserve editor state — remount strategies lose unsaved content

### Cleanup Phase Updates
- Pre-read dependency trees before delegating extraction tasks — prevents wasted extraction attempts on deeply coupled files
- The ContentTracker + ref pattern solves state preservation across Lexical editor remounts generically
- Always review agent ARIA output — nested landmark roles and icon semantics are common subtle errors
- Use project tsconfig for type verification, not `--isolatedModules` (produces false positives without JSX config)

---

## Lessons Learned Summary

### Top 3 Most Valuable Techniques
1. Interactive user discussion before spec creation surfaces design decisions that prevent rework
2. Leveraging completed spec outputs as research starting point avoids 60-80% of re-discovery work
3. Single-agent delegation with clear file targets is faster than multi-agent coordination for implementation phases

### Top 3 Wasted Efforts
1. Attempting Chrome MCP JavaScript execution when extension was disconnected — screenshots were more reliable
2. Initial "54 plugins" estimate was imprecise — should verify counts early before embedding in success criteria
3. Using `rerenderKey` for fullscreen without state preservation — lost editor content on every toggle, requiring P3 remediation

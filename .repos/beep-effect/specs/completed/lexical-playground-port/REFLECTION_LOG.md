# Reflection Log

> Cumulative learnings from Lexical Playground Port specification execution.

---

## Phase 0: Initial Analysis (Scaffolding + Discovery)

**Date**: 2026-01-27

### What Worked

1. **Automated exploration agents** provided comprehensive file inventory:
   - 143 TS/TSX files identified
   - 32 CSS files categorized by directory
   - ~40,000 lines of code estimated

2. **Lint/check commands** revealed scope of issues quickly:
   - 106 errors (quantified by category)
   - 20 warnings
   - 64 accessibility infos

3. **Existing shadcn component inventory** identified 7 replacement candidates:
   - Dialog, Button, DropdownMenu, Select, Switch, Popover, Command

4. **Directory analysis** revealed clear structure:
   - Plugins: 51 components
   - Nodes: 25 custom nodes
   - UI: 20 reusable components
   - Themes: 3 theme definitions

### What Didn't Work

1. **Type check cascade** through Turborepo dependencies makes isolating todox-specific errors difficult:
   - Running `check --filter=@beep/todox` validates ALL upstream packages
   - Errors in `@beep/iam-domain` appear in todox check output
   - **Workaround**: Use `bun tsc --noEmit path/to/file.ts` for isolated syntax checks

2. **Copy operation corruption**: Some files have mangled content from the bulk copy:
   - `InsertLayoutDialog.tsx` license header corrupted
   - **Root cause**: Unknown (possibly line ending conversion)
   - **Fix**: Manual inspection and repair required

3. **Initial complexity underestimate**: Expected simpler lint fixes, but found:
   - Multiple error categories requiring different fix strategies
   - Some "auto-fixable" issues require manual review (e.g., `dangerouslySetInnerHTML`)

### Key Discoveries

1. **Corrupted File Location**:
   - File: `plugins/LayoutPlugin/InsertLayoutDialog.tsx`
   - Problem: Malformed license header blocks TypeScript parsing
   - Impact: Entire type check fails until fixed
   - Priority: **CRITICAL** - must fix first

2. **Lint Error Categories** (prioritized by fix effort):
   | Category | Count | Auto-Fix? | Strategy |
   |----------|-------|-----------|----------|
   | Unused imports | ~15 | Partial | Run lint:fix, manual cleanup |
   | Missing button types | ~10 | No | Search `<button`, add `type="button"` |
   | Template literals | ~5 | Yes | lint:fix handles these |
   | isNaN usage | ~1 | Yes | `isNaN()` → `Number.isNaN()` |
   | iframe titles | ~2 | No | Add `title` attribute |
   | Anchor content | ~1 | No | Add accessible text |
   | dangerouslySetInnerHTML | ~5 | No | **Keep** - needed for editor |

3. **shadcn Primitive Library**:
   - This repo uses `@base-ui/react` (NOT `@radix-ui`)
   - Critical for Phase 2 component replacement
   - Type signatures differ from standard shadcn docs
   - **Action**: Check existing `apps/todox/src/components/ui/` for patterns

4. **Server Validation Code**:
   - Located at `server/validation.ts`
   - Creates HTTP server on port 1235
   - Uses Lexical headless editor for validation
   - **Migration path**: Convert to Next.js API routes in Phase 3

5. **CSS File Distribution**:
   - Themes: 3 files (core styling, keep/integrate)
   - UI components: 12 files (convert to Tailwind)
   - Plugins: 17 files (convert incrementally)
   - Nodes: 5 files (convert with node refactoring)

### Patterns to Apply

1. **Fix-First Pattern**: Always run `lint:fix` before manual fixes to reduce noise
2. **Integrity Check Pattern**: After bulk operations, verify file integrity with `head -5` on critical files
3. **Primitive Verification Pattern**: Check actual primitive library (`@base-ui` vs `@radix-ui`) before component work
4. **Cascade Isolation Pattern**: Use direct `tsc` for syntax verification when Turborepo cascade adds noise
5. **Category-Based Fixes**: Group lint errors by category, fix all of one type before moving to next

### Questions for Next Phase

1. How many type errors exist after lint fixes? (Blocked by corrupted file)
2. Are there circular dependencies introduced? (Check with `madge -c`)
3. What's the minimal set of CSS that Lexical requires for functionality vs. styling?
4. Which plugins are essential vs. optional for MVP editor?
5. Does the existing `@base-ui/react` Dialog support all Modal features needed?

### Prompt Refinements

**Initial prompt** (too broad):
> "Fix all lint errors in the lexical directory"

**Refined prompt** (specific, ordered):
> "Fix lint errors in @beep/todox lexical module in this order:
> 1. First, fix corrupted InsertLayoutDialog.tsx license header
> 2. Run `bun run lint:fix --filter=@beep/todox`
> 3. Search for `<button` without `type=`, add `type=\"button\"`
> 4. Remove unused imports (especially `import * as React`)
> 5. Fix remaining individual errors per lint output"

### Complexity Score Calculation

```
Phase Count:       6 phases    × 2 = 12
Agent Diversity:   4 agents    × 3 = 12
Cross-Package:     1 (shared)  × 4 =  4
External Deps:     0           × 3 =  0
Uncertainty:       2 (low-med) × 5 = 10
Research Required: 1 (minimal) × 2 =  2
────────────────────────────────────────
Total Score:                       40 → Medium Complexity
```

**Recommendation**: Use medium complexity structure (QUICK_START + MASTER_ORCHESTRATION + handoffs).

---

## Phase 1: Fix Lint/Build/Check Errors

**Date**: 2026-01-27

### What Worked

1. **Fix-First Pattern**: Running `lint:fix` first dramatically reduced manual work
2. **Corrupted file repair**: Manual license header restoration unblocked entire pipeline
3. **Category-based fixes**: Grouping errors by type (button types, imports) made systematic fixing efficient

### What Didn't Work

1. **Initial complexity estimate**: More cleanup needed than expected from bulk copy operation

### Key Discoveries

1. **All quality commands pass**: 0 lint errors, 0 type errors, build succeeds
2. **Phase 1 complete faster than expected**: ~1 session vs estimated 1-2

### Patterns to Apply

- Always run auto-fix before manual fixes
- Check file integrity after bulk operations

### Questions for Next Phase

- Which CSS files can be fully eliminated vs. consolidated?
- Does shadcn Dialog support all Modal features (keyboard nav, focus trap)?

---

## Phase 2: Tailwind + shadcn Conversion

**Date**: 2026-01-27

### What Worked

1. **Component wrapper strategy**: Instead of replacing Lexical UI components, wrapping them with shadcn equivalents preserved functionality:
   - `Modal.tsx` → Thin wrapper around shadcn `Dialog`
   - `Button.tsx` → Wrapper mapping lexical variants to shadcn variants
   - `DropDown.tsx` → Wrapper around shadcn `DropdownMenu`
   - `Switch.tsx` → Direct integration with shadcn patterns

2. **CSS consolidation into themes**: For Lexical nodes that create DOM imperatively (via `createDOM()`), moving styles to `PlaygroundEditorTheme.css` was cleaner than inline Tailwind:
   - Collapsible styles → Theme CSS
   - PageBreak styles → Theme CSS

3. **Direct Tailwind conversion for React components**: Components with JSX markup converted cleanly to Tailwind inline classes:
   - `PollComponent.tsx` → Full Tailwind conversion with `cn()` utility
   - `StickyComponent.tsx` → ContentEditable placeholder/content classes
   - `ImageComponent.tsx` → ContentEditable caption classes

4. **Pseudo-element Tailwind patterns**: Complex CSS pseudo-elements converted successfully:
   ```tsx
   // Checkbox checkmark via Tailwind pseudo-elements
   "after:content-[''] after:border-white after:border-solid after:absolute after:block after:rotate-45 after:border-[0_2px_2px_0]"
   ```

5. **Unused code cleanup**: Removing `joinClasses` utility after conversion reduced maintenance burden.

### What Didn't Work

1. **Direct shadcn replacement initially attempted**: Tried to fully replace lexical UI components with shadcn, but found:
   - Lexical components have specific keyboard handling and focus management
   - Better approach: wrap or delegate to shadcn while preserving Lexical's API contract
   - **Workaround**: Create wrapper components that use shadcn internally

2. **CommentPlugin CSS too complex**: At 400+ lines with keyframe animations and complex selectors, conversion was impractical:
   - **Decision**: Keep as-is, count toward ≤5 CSS file target
   - **Rationale**: Time cost vs. benefit unfavorable

3. **ImageResizer classList manipulation**: Lexical's `ImageResizer` used class-based state (`image-control-wrapper--resizing`):
   - **Problem**: Only set `touch-action: none`
   - **Solution**: Direct style manipulation instead of maintaining CSS for single property

### Key Discoveries

1. **Final CSS count: 5 files** (target achieved):
   - `index.css` - Main entry point (must keep)
   - `PlaygroundEditorTheme.css` - Editor theme + consolidated node styles
   - `CommentEditorTheme.css` - Comment editor theme
   - `StickyEditorTheme.css` - Sticky note theme
   - `CommentPlugin/index.css` - Too complex to convert

2. **Files converted/deleted** (27 CSS files eliminated):
   - UI: Modal.css, Button.css, Input.css, DropDown.css, Select.css, Switch.css, Dialog.css, ColorPicker.css, ContentEditable.css, EquationEditor.css, ExcalidrawModal.css, FlashMessage.css, KatexEquationAlterer.css, ImageResizer.css
   - Plugins: ToolbarPlugin/fontSize.css, FloatingTextFormatToolbarPlugin, FloatingLinkEditorPlugin, DraggableBlockPlugin, TableHoverActionsV2Plugin, CodeActionMenuPlugin (2 files), TableCellResizer, TableOfContentsPlugin, VersionsPlugin, CollapsiblePlugin/Collapsible.css
   - Nodes: ImageNode.css, StickyNode.css, PollNode.css, DateTimeNode.css, PageBreakNode/index.css

3. **Lexical node DOM creation pattern**: Nodes using `createDOM()` method (like Collapsible, PageBreak) create elements imperatively, not via JSX. These need CSS class-based styling, not Tailwind inline classes.

4. **`cn()` utility from `@beep/todox/lib/utils`**: Already available in codebase, replaced local `joinClasses` utility.

### Patterns to Apply

1. **Wrapper Component Pattern**: When integrating external UI libraries with existing component APIs, create thin wrappers that:
   - Preserve original component's API signature
   - Delegate rendering to shadcn component
   - Handle variant/prop mapping internally

2. **Imperative DOM → Theme CSS Pattern**: For libraries creating DOM imperatively (not via JSX):
   - Keep styles in dedicated theme CSS files
   - Don't attempt inline Tailwind
   - Consolidate related styles into single theme file

3. **Pseudo-element Tailwind Pattern**: Complex CSS pseudo-elements (`::before`, `::after`) can be expressed in Tailwind:
   ```tsx
   // CSS: .checkbox::after { content: ''; position: absolute; ... }
   // Tailwind:
   "after:content-[''] after:absolute after:block ..."
   ```

4. **Cost-Benefit CSS Conversion**: When CSS file exceeds ~200 lines with animations/complex selectors, keeping the file is acceptable if:
   - Target file count still achievable
   - Conversion time exceeds 30+ minutes
   - Risk of introducing visual bugs is high

### Questions for Next Phase

1. Does the `/lexical` page need authentication middleware?
2. What validation does `server/validation.ts` perform? Is it needed for MVP?
3. Are there any feature flags or environment variables needed for the editor?

### Prompt Refinements

**Initial prompt** (too general):
> "Convert CSS to Tailwind and replace UI components with shadcn"

**Refined prompt** (strategy-specific):
> "Phase 2: Tailwind + shadcn Conversion
> 1. First, analyze each CSS file category (UI, plugins, nodes, themes)
> 2. For UI components: create wrappers using shadcn internally, preserve Lexical API
> 3. For React-rendered components: convert inline to Tailwind using cn()
> 4. For imperative DOM nodes: consolidate into PlaygroundEditorTheme.css
> 5. Target: ≤5 CSS files. Keep theme files + one complex plugin CSS if needed
> 6. Critical: This repo uses @base-ui/react, NOT @radix-ui"

---

## Phase 3: Next.js Page + API Routes

**Date**: 2026-01-27

### What Worked

1. **Dynamic import with SSR disabled**: Lexical requires browser APIs, so using `dynamic(() => import("./App"), { ssr: false })` cleanly avoided hydration issues:
   ```tsx
   const PlaygroundApp = dynamic(() => import("./App"), {
     ssr: false,
     loading: () => <div>Loading editor...</div>,
   });
   ```

2. **Simplified API routes for serverless**: The original `server/validation.ts` maintained state across requests (headless Lexical editor). In serverless API routes, converted to stateless JSON validation:
   - `/api/lexical/set-state` - Validates JSON structure, acknowledges receipt
   - `/api/lexical/validate` - Validates root structure has expected type

3. **Relative API paths**: Changed client code from `http://localhost:1235/setEditorState` to `/api/lexical/set-state` - works in all environments without CORS issues.

4. **Turbo run command for filtered checks**: `bunx turbo run check --filter=@beep/todox` works correctly (not `bun run check --filter=`).

### What Didn't Work

1. **Full headless validation migration not practical**: The original validation server used `createHeadlessEditor` to parse and sanitize editor state, then compare against stored baseline. This stateful approach doesn't work in serverless:
   - **Problem**: State (`stringifiedEditorStateJSON`) lost between requests
   - **Workaround**: Simplified to structural JSON validation
   - **Future**: Use KV store (Redis) or database for full validation

2. **Initial metadata export attempt**: Tried adding `export const metadata` to client component - doesn't work with `"use client"`. Kept page simple without metadata for now.

### Key Discoveries

1. **Build output confirms routes created**:
   ```
   ├ ƒ /api/lexical/set-state
   ├ ƒ /api/lexical/validate
   └ ƒ /lexical
   ```

2. **Pre-existing circular dependencies**: Build warnings show 7 circular dependencies in Lexical nodes (EquationNode, ImageNode, etc.). These are from the original Lexical playground codebase:
   ```
   Circular dependencies: nodes/EquationComponent.tsx → nodes/EquationNode.tsx
   ```
   **Decision**: Note for Phase 4/5, not blocking.

3. **No middleware protection needed for MVP**: The `/lexical` page works without explicit middleware. Authentication can be added in Phase 4/5 as needed.

4. **ActionsPlugin calls both endpoints**:
   - `sendEditorState()` → `/api/lexical/set-state` (when switching to read-only mode)
   - `validateEditorState()` → `/api/lexical/validate` (on updates in read-only mode)

### Patterns to Apply

1. **Serverless State Migration Pattern**: When migrating stateful HTTP servers to serverless API routes:
   - First: Implement minimal structural validation (JSON parse, required fields)
   - Later: Add persistence layer (KV, database) for full stateful validation
   - Document: What state is lost and why it's acceptable for MVP

2. **Dynamic Import Loading Pattern**: For heavy client-only components:
   ```tsx
   const Component = dynamic(() => import("./Component"), {
     ssr: false,
     loading: () => <LoadingSkeleton />,
   });
   ```

3. **Turborepo Filter Command Pattern**: Use `bunx turbo run <command> --filter=@scope/package` not `bun run <command> --filter=`.

### Questions for Next Phase

1. Are there runtime errors when the editor loads? (Check browser console)
2. Do all toolbar actions work? (Bold, italic, links, etc.)
3. Are there hydration warnings in the console?
4. Does the validation actually get called in read-only mode?
5. What plugins fail to load or throw errors?

### Prompt Refinements

**Initial prompt** (from P3_ORCHESTRATOR_PROMPT):
> "Create API routes migrating validation.ts endpoints"

**Refined prompt** (based on learnings):
> "Phase 3: Next.js Page + API Routes
> 1. Create page.tsx with dynamic import (ssr: false) to avoid Lexical hydration issues
> 2. Create simplified stateless API routes:
>    - /api/lexical/set-state: JSON structure validation only
>    - /api/lexical/validate: Root type validation only
> 3. Update ActionsPlugin to use relative paths (/api/lexical/...)
> 4. Note: Full headless validation requires persistence layer - skip for MVP
> 5. Verify with: `bunx turbo run check --filter=@beep/todox && bunx turbo run build --filter=@beep/todox`"

---

## Entry Template

```markdown
## Phase N: [Phase Name]

**Date**: YYYY-MM-DD

### What Worked
- [List of successful approaches with specific examples]

### What Didn't Work
- [List of approaches that failed with root cause and workaround]

### Key Discoveries
1. [Numbered discoveries with actionable details]

### Patterns to Apply
- [Named patterns worth reusing in other specs]

### Questions for Next Phase
- [Specific, answerable questions]

### Prompt Refinements
**Initial**: [Original prompt that didn't work well]
**Refined**: [Improved prompt with specifics]
```

---

## Pattern Candidates for Promotion

### Pattern: Turborepo Cascade Isolation

**Score**: 78/102 (Validated)

**Problem**: `bun run check --filter=@beep/package` validates all dependencies, making it hard to isolate errors in the target package.

**Solution**:
```bash
# For isolated syntax check (no dependency resolution)
bun tsc --noEmit apps/todox/src/app/lexical/path/to/file.ts

# For full check when dependencies are clean
bun run check --filter=@beep/todox
```

**Applicability**: Any spec targeting a package with upstream dependencies.

**Promotion Status**: Add to `documentation/patterns/database-patterns.md#turborepo-verification-cascading`.

---

### Pattern: Bulk Copy Integrity Verification

**Score**: 65/102 (Promising)

**Problem**: Bulk file copy operations can corrupt file content (especially headers, line endings).

**Solution**:
```bash
# After bulk copy, verify critical files
head -10 apps/todox/src/app/lexical/**/*.tsx | grep -E "^(\/\*|import)" || echo "Potential corruption"

# Or run parse check
bun tsc --noEmit path/to/directory/*.tsx 2>&1 | head -20
```

**Applicability**: Any spec involving file migration or bulk copy.

**Promotion Status**: Keep in spec for now, refine after Phase 1 completion.

---

## Meta-Learning: Orchestration Patterns

### Orchestrator Cognitive Load Management

**Discovery Date**: 2026-01-27 (Phase 0)

**Observation**: When orchestrators attempt >3 sequential file operations (Glob/Read/Grep), they:
- Accumulate excessive working memory (~2K+ tokens of file contents)
- Reduce synthesis quality due to context fragmentation
- Risk missing cross-file patterns buried in output

**Solution Pattern**: Always delegate file discovery to specialized agents:

```
# BEFORE (Anti-pattern)
Orchestrator: "Read files X, Y, Z and summarize patterns..."
Result: 2,500 tokens of file contents in context, poor pattern recognition

# AFTER (Recommended)
Orchestrator: "Invoke codebase-researcher to catalog files matching *.tsx in lexical/, identify common patterns, return summary."
Result: 400 tokens of synthesized findings, clear pattern enumeration
```

**Quantified Impact**:
- Context reduction: ~2,500 → ~400 tokens (84% reduction)
- Pattern detection: Improved (agent can use multiple search strategies)
- Handoff quality: Improved (summaries are more portable than raw content)

**Promotion Status**: Ready for `specs/_guide/README.md` Orchestrator Delegation section.

---

### Context Budget as Forcing Function

**Discovery Date**: 2026-01-27 (Phase 0)

**Observation**: Explicitly tracking token budgets in handoff documents forces better prioritization decisions:

| Without Budget Tracking | With Budget Tracking |
|------------------------|---------------------|
| "Include everything that might be useful" | "Which 2,000 tokens are essential for next phase?" |
| Handoffs grow to 8K+ tokens | Handoffs stay under 4K |
| Orchestrators re-read everything | Orchestrators skim efficiently |

**Implementation Pattern**:
```markdown
## Context Budget Verification

| Memory Type | Content | Est. Tokens | Budget | Status |
|-------------|---------|-------------|--------|--------|
| Working | Current phase tasks | ~XXX | ≤2,000 | OK/OVER |
| Episodic | Previous summaries | ~XXX | ≤1,000 | OK/OVER |
| Semantic | Constants | ~XXX | ≤500 | OK/OVER |
| **Total** | | **~X,XXX** | **≤4,000** | **OK/OVER** |
```

**Why It Works**:
- Forces explicit triage of "must-have" vs "nice-to-have" context
- Creates audit trail for future handoff debugging
- Enables compression strategies (summarization, linking)

**Promotion Status**: Add to `specs/_guide/HANDOFF_STANDARDS.md` as required section.

---

### Cross-Phase Learning: Dependency Discovery

**Discovery**: Phase 0 file structure analysis → Phase 1 fix prioritization

**Link**: The corrupted `InsertLayoutDialog.tsx` file was discovered during Phase 0's automated exploration. Without systematic file inventory, this blocker would have surfaced mid-Phase 1, causing context fragmentation.

**Meta-Pattern**: Discovery phases should include "blocker detection" as explicit deliverable:

```markdown
## Phase 0 Deliverables

1. ✅ File inventory (143 TS/TSX files)
2. ✅ Quality baseline (106 lint errors)
3. ✅ **Blocker detection** (1 corrupted file identified)  ← Often missed
4. ✅ Dependency mapping (32 CSS files)
```

**Prompt Refinement**:
```
# Before (implicit blocker detection)
"Explore the codebase and catalog files..."

# After (explicit blocker detection)
"Explore the codebase and catalog files. ALSO identify any blocking issues that would prevent quality commands from passing (corrupted files, syntax errors, missing dependencies)."
```

**Impact**: Reduces Phase 1 context switches from "discovery → fix → discover more → fix more" to "fix all known issues → verify".

---

### Progressive Disclosure Hierarchy Design

**Discovery Date**: 2026-01-27 (Phase 0)

**Problem**: Multi-file specs risk losing readers in documentation maze.

**Solution**: Strict 4-layer hierarchy with clear escalation path:

```
Layer 1: README.md (147 lines)
├── Purpose: What is this spec trying to accomplish?
├── Target: 2-minute read
└── Links to: QUICK_START.md for operational context

Layer 2: QUICK_START.md (138 lines)
├── Purpose: How do I start working on this spec right now?
├── Target: 5-minute read
└── Links to: MASTER_ORCHESTRATION.md for full workflow

Layer 3: MASTER_ORCHESTRATION.md (250 lines)
├── Purpose: What is the complete workflow across all phases?
├── Target: 15-minute read
└── Links to: AGENT_PROMPTS.md for execution details

Layer 4: AGENT_PROMPTS.md (200+ lines)
├── Purpose: How do I invoke each specialized agent?
├── Target: Reference during execution
└── Links to: outputs/ for results
```

**Verification**: At any layer, reader should be able to find answer or know exactly which doc to consult next.

**Anti-Pattern Detected**: Specs that put execution details in README (Layer 1) force readers to parse 500+ lines for orientation.

**Promotion Status**: Add as "Hierarchical Documentation Pattern" to PATTERN_REGISTRY.md.

---

## Phase 4: Runtime Error Fixes

**Date**: 2026-01-27

### What Worked

1. **Static asset serving via public folder**: Moving lexical images to `public/lexical/images/` and using absolute paths (`/lexical/images/icons/...`) fixed all 404 errors:
   ```bash
   mkdir -p public/lexical/images
   cp -r src/app/lexical/images/* public/lexical/images/
   # Update CSS: url(images/icons/...) → url(/lexical/images/icons/...)
   ```

2. **SSR guard for window access**: Added `typeof window !== "undefined"` guard for code accessing `window.parent`:
   ```tsx
   // Before (breaks SSR)
   const skipCollaborationInit = window.parent != null && ...;

   // After (SSR-safe)
   const skipCollaborationInit = typeof window !== "undefined" && window.parent != null && ...;
   ```

3. **Floating UI virtual element fix**: Removed `elements: { reference: ... }` from useFloating config and let dynamic reference setting happen via `refs.setReference()`:
   ```tsx
   // Before (error: cannot pass virtual element)
   const { refs } = useFloating({
     elements: { reference: virtualRef.current as unknown as Element },
     ...
   });

   // After (no initial reference, set dynamically)
   const { refs } = useFloating({
     middleware: [...],
     placement: "top",
     ...
   });
   // Then: refs.setReference(virtualRef.current) on mouse events
   ```

4. **Browser automation for console capture**: Using `mcp__claude-in-chrome__read_console_messages` tool systematically captured runtime errors for prioritization.

### What Didn't Work

1. **Initial assumption about SVG imports**: Expected `import logo from "./images/logo.svg"` to return a URL string. In Next.js, SVG imports can return React components depending on bundler config:
   ```tsx
   // Problem: logo becomes a React component, not a URL
   <img src={logo} /> // Results in: src="function SvgLogo(props) {...}"

   // Solution: Use absolute path from public folder
   <img src="/lexical/images/logo.svg" />
   ```

2. **CSS relative paths in Next.js**: Relative URL paths in CSS (`url(images/icons/...)`) didn't resolve correctly during build:
   - **Root cause**: CSS is processed by bundler, not served from source location
   - **Fix**: Convert all CSS asset URLs to absolute paths from public folder

### Key Discoveries

1. **Console errors categorization**: Systematic approach to prioritizing errors:
   | Priority | Category | Example |
   |----------|----------|---------|
   | P0 | Crash/white screen | `ReferenceError: logo is not defined` |
   | P1 | Hydration mismatch | N/A (avoided via ssr:false) |
   | P2 | Invalid prop/component | `Invalid value for prop 'src'` |
   | P3 | Library warnings | Floating UI virtual element |
   | P4 | Feature warnings | WebSocket timeout |

2. **Acceptable errors for MVP**: The "Timeout" unhandled rejection is from collaboration WebSocket trying to connect to non-existent Yjs server. Since collaboration is disabled by default, this is acceptable noise.

3. **Server vs browser errors**: The dev server logs show both server-side and browser-side errors with different prefixes:
   - `[browser]` prefix = client-side error
   - No prefix = server-side or build error

4. **HMR caching of errors**: Old errors persist in server log even after fixes. Need hard refresh (Ctrl+Shift+R) to see clean state.

### Patterns to Apply

1. **Static Asset Migration Pattern**: For external code with bundler-relative asset paths:
   ```bash
   # 1. Copy assets to public folder
   cp -r src/app/module/images/* public/module/images/

   # 2. Update CSS files (bulk sed)
   sed -i 's|url(images/|url(/module/images/|g' src/app/module/*.css

   # 3. Update JS/TSX imports to absolute paths
   # import logo from "./images/logo.svg" → src="/module/images/logo.svg"
   ```

2. **Floating UI Virtual Element Pattern**: For positioning menus relative to dynamic positions:
   ```tsx
   // Don't pass virtual element in initial config
   const { refs, floatingStyles, update } = useFloating({
     middleware: [offset(8), shift({ padding: 8 })],
     placement: "top",
   });

   // Set reference dynamically on user interaction
   const handleMouseMove = (event) => {
     virtualRef.current.getBoundingClientRect = () =>
       new DOMRect(event.clientX, event.clientY, 0, 0);
     refs.setReference(virtualRef.current);
     update?.();
   };
   ```

3. **SSR Guard Pattern**: For code accessing browser APIs in components that might render on server:
   ```tsx
   // Pattern 1: typeof check
   const value = typeof window !== "undefined" ? window.something : fallback;

   // Pattern 2: useEffect (preferred for side effects)
   useEffect(() => {
     if (typeof window === 'undefined') return;
     // Browser-only code
   }, []);

   // Pattern 3: Dynamic import with ssr:false (preferred for whole components)
   const Component = dynamic(() => import("./Component"), { ssr: false });
   ```

### Questions for Next Phase

1. Are there any remaining runtime issues under specific user interactions?
2. Should the debug TreeView be hidden by default for production?
3. Are there any plugins that should be disabled for MVP?

### Prompt Refinements

**Initial prompt** (from P4_ORCHESTRATOR_PROMPT):
> "Fix all runtime errors and console warnings"

**Refined prompt** (based on learnings):
> "Phase 4: Runtime Error Fixes
> 1. Start dev server, navigate to /lexical, open DevTools Console
> 2. Capture ALL errors, categorize by priority (P0=crash, P1=hydration, P2=undefined, P3=plugin, P4=warnings)
> 3. For asset 404s: copy images to public/lexical/images/, update CSS to absolute paths
> 4. For 'invalid prop src': change SVG imports to absolute paths from public folder
> 5. For Floating UI errors: remove elements.reference from useFloating config
> 6. For SSR window errors: add typeof window !== 'undefined' guard
> 7. Acceptable: WebSocket timeout (collaboration disabled by default)
> 8. Verify: typing, bold (Ctrl+B), italic (Ctrl+I) work; all quality commands pass"

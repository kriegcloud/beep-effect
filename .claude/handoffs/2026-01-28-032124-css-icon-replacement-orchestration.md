# Handoff: CSS Icon to Phosphor Replacement Orchestration

## Session Metadata
- Created: 2026-01-28 03:21:24
- Project: /home/elpresidank/YeeBois/projects/beep-effect2
- Branch: lexical-playground
- Session duration: ~45 minutes

### Recent Commits (for context)
  - 5a58d348 Merge remote-tracking branch 'origin/@beep/ui-spreadsheet' into lexical-playground
  - bb0082b4 starting work on collaborative spreadsheets

## Handoff Chain

- **Continues from**: None (fresh orchestration task)
- **Supersedes**: None

## Current State Summary

This handoff defines an orchestration task for replacing CSS-based icons in Lexical editor plugins with Phosphor React components. The codebase currently uses `<i className="icon {name}" />` patterns with CSS `background-image` rules pointing to SVG files. These should be replaced with `@phosphor-icons/react` components to standardize on a single icon library. Previous work already replaced Lucide icons with Phosphor in 9 UI component files.

## Codebase Understanding

### Architecture Overview

The Lexical editor plugins use a legacy icon pattern:
1. JSX: `<i className="icon {icon-name}" />` - empty `<i>` element with CSS classes
2. CSS: `.icon.{name}` rules with `background-image: url(/lexical/images/icons/{name}.svg)`
3. SVGs: Located in `apps/todox/src/app/lexical/images/icons/`

This pattern should be replaced with:
```tsx
import { IconName } from "@phosphor-icons/react";
<IconName className="size-4" />
```

### Critical Files

| File | Purpose | Icon Count |
|------|---------|------------|
| `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx` | Main toolbar with block types, alignment, insert menu | ~25 icons |
| `apps/todox/src/app/lexical/plugins/ComponentPickerPlugin/index.tsx` | Slash command picker menu | ~20 icons |
| `apps/todox/src/app/lexical/plugins/TableActionMenuPlugin/index.tsx` | Table context menu | 3 icons (vertical alignment) |
| `apps/todox/src/app/lexical/plugins/AutoEmbedPlugin/index.tsx` | YouTube/Twitter/Figma embed configs | 3 icons |
| `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx` | Comment add button | 1 icon |
| `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx` | User mention suggestion | 1 icon |
| `apps/todox/src/app/lexical/plugins/ToolbarPlugin/components/FontControls.tsx` | Font family selector | 1 icon |

### Key Patterns Discovered

**Current Pattern (to be replaced):**
```tsx
<i className="icon paragraph" />
<i className="icon h1" />
<i className={`icon ${isRTL ? "indent" : "outdent"}`} />
```

**Target Pattern:**
```tsx
import { TextT, TextHOne, TextIndent, TextOutdent } from "@phosphor-icons/react";
<TextT className="size-4" />
<TextHOne className="size-4" />
{isRTL ? <TextIndent className="size-4" /> : <TextOutdent className="size-4" />}
```

## Work Completed

### Tasks Finished

- [x] Identified all 7 files with CSS-based icons
- [x] Counted ~55 unique icon instances
- [x] Located SVG source files in `/apps/todox/src/app/lexical/images/icons/`
- [x] Created CSS icon name to Phosphor icon mapping (see below)

### Files Modified

| File | Changes | Rationale |
|------|---------|-----------|
| (none yet - work to be done by sub-agents) | | |

### Decisions Made

| Decision | Options Considered | Rationale |
|----------|-------------------|-----------|
| Use Phosphor icons | Phosphor, Lucide, Heroicons | Phosphor already used elsewhere in codebase; consistent library choice |
| Parallel sub-agents | Sequential vs parallel | 4-5 files can be edited independently; maximizes efficiency |
| Keep icon-text-container divs | Remove vs keep | Divs provide flexbox layout for text next to icons |

### Icon Mapping Reference

| CSS Icon Class | Phosphor Icon | Import Name |
|---------------|---------------|-------------|
| `paragraph` | TextT | `TextT` |
| `h1` | TextHOne | `TextHOne` |
| `h2` | TextHTwo | `TextHTwo` |
| `h3` | TextHThree | `TextHThree` |
| `numbered-list` | ListNumbers | `ListNumbers` |
| `bullet-list` | ListBullets | `ListBullets` |
| `check-list` | ListChecks | `ListChecks` |
| `quote` | Quotes | `Quotes` |
| `code` | Code | `Code` |
| `left-align` | TextAlignLeft | `TextAlignLeft` |
| `center-align` | TextAlignCenter | `TextAlignCenter` |
| `right-align` | TextAlignRight | `TextAlignRight` |
| `justify-align` | TextAlignJustify | `TextAlignJustify` |
| `indent` | TextIndent | `TextIndent` |
| `outdent` | TextOutdent | `TextOutdent` |
| `plus` | Plus | `Plus` |
| `horizontal-rule` | Minus | `Minus` |
| `page-break` | FileBreak | `FileBreak` |
| `image` | Image | `Image` |
| `diagram-2` | Pencil | `Pencil` (Excalidraw) |
| `table` | Table | `Table` |
| `poll` | ChartBar | `ChartBar` |
| `columns` | Columns | `Columns` |
| `equation` | MathOperations | `MathOperations` |
| `sticky` | Note | `Note` |
| `caret-right` | CaretRight | `CaretRight` |
| `calendar` | Calendar | `Calendar` |
| `font-family` | TextAa | `TextAa` |
| `vertical-top` | ArrowLineUp | `ArrowLineUp` |
| `vertical-middle` | ArrowsVertical | `ArrowsVertical` |
| `vertical-bottom` | ArrowLineDown | `ArrowLineDown` |
| `youtube` | YoutubeLogo | `YoutubeLogo` |
| `x` | XLogo | `XLogo` |
| `figma` | FigmaLogo | `FigmaLogo` |
| `user` | User | `User` |
| `add-comment` | ChatText | `ChatText` |
| `number` | ListNumbers | `ListNumbers` |
| `bullet` | ListBullets | `ListBullets` |
| `check` | ListChecks | `ListChecks` |
| `gif` | Gif | `Gif` |

## Pending Work

## Immediate Next Steps

The work should be parallelized across 4-5 sub-agents for maximum efficiency:

1. **Sub-Agent 1: ToolbarPlugin/index.tsx** (largest file, ~25 icons)
   - Block type dropdown icons (paragraph, h1-h3, lists, quote, code)
   - Alignment dropdown icons
   - Indent/outdent icons
   - Insert menu icons

2. **Sub-Agent 2: ComponentPickerPlugin/index.tsx** (~20 icons)
   - All slash command picker icons
   - Table picker options

3. **Sub-Agent 3: TableActionMenuPlugin/index.tsx + FontControls.tsx** (4 icons)
   - Vertical alignment icons
   - Font family icon

4. **Sub-Agent 4: AutoEmbedPlugin + CommentPlugin + MentionsPlugin** (5 icons)
   - YouTube, Twitter/X, Figma logos
   - Add comment icon
   - User mention icon

### Sub-Agent Instructions Template

Each sub-agent should:

1. **Read the target file(s)** to understand current structure

2. **Add Phosphor imports** at the top:
```tsx
import {
  IconName1,
  IconName2,
  // ... relevant icons from mapping
} from "@phosphor-icons/react";
```

3. **Replace each CSS icon pattern:**
   - Find: `<i className="icon {name}" />`
   - Replace: `<IconName className="size-4" />`

4. **Handle dynamic icons** like:
   - `<i className={\`icon ${isRTL ? "indent" : "outdent"}\`} />`
   - Becomes: `{isRTL ? <TextIndent className="size-4" /> : <TextOutdent className="size-4" />}`

5. **Remove unused wrapper elements** if the `<i>` was wrapped in a container only for the icon

6. **Verify no TypeScript errors** after changes

### Blockers/Open Questions

- [ ] Some icons may not have exact Phosphor equivalents - use closest match
- [ ] The `icon-text-container` wrapper divs may need updating or can stay

### Deferred Items

- Cleanup of unused SVG files in `/lexical/images/icons/` (do after all replacements verified)
- Removal of unused CSS icon rules (do after all replacements verified)

## Context for Resuming Agent

## Important Context

**CRITICAL REQUIREMENTS:**
1. Use `@phosphor-icons/react` - this is already installed and used elsewhere in the codebase
2. Use `className="size-4"` for icon sizing (Tailwind standard)
3. Keep existing wrapper divs like `<div className="icon-text-container">` if they provide layout
4. Run `bun run check --filter @beep/todox` after all replacements to verify no TypeScript errors

**PARALLELIZATION STRATEGY:**
- Launch 4-5 sub-agents simultaneously, each handling a subset of files
- Each sub-agent works independently on its assigned files
- Orchestrator waits for all sub-agents to complete
- Run single type check at the end to verify all changes

### Assumptions Made

- Phosphor has equivalent icons for all current CSS icon classes
- Icon sizing of `size-4` (16px) matches current CSS icon dimensions
- No runtime behavior depends on the CSS class names

### Potential Gotchas

- Dynamic className patterns need conditional JSX, not template strings
- Some icons appear in multiple places - ensure consistent replacement
- The `icon-text-container` divs provide flexbox layout - keep them
- Watch for file linting that might revert changes (happened in previous work)

## Environment State

### Tools/Services Used

- Bun package manager
- TypeScript compiler via `bun run check`
- Biome for linting

### Active Processes

- None required for this task

### Environment Variables

- None relevant

## Related Resources

- Phosphor Icons: https://phosphoricons.com/
- Current SVGs: `apps/todox/src/app/lexical/images/icons/`
- Previously completed: Lucide → Phosphor migration in UI components

## Orchestration Prompt for Next Agent

Use this prompt to spawn sub-agents:

```
Replace CSS-based icons with Phosphor React components in [FILE_PATH].

Icon Mapping (use these exact replacements):
[Include relevant subset of icon mapping table]

Pattern to find and replace:
- Current: <i className="icon {name}" />
- Target: <IconName className="size-4" />

For dynamic classes like:
- Current: <i className={`icon ${isRTL ? "indent" : "outdent"}`} />
- Target: {isRTL ? <TextIndent className="size-4" /> : <TextOutdent className="size-4" />}

Steps:
1. Read the file
2. Add required Phosphor imports at top
3. Replace all CSS icon patterns with Phosphor components
4. Keep wrapper divs like icon-text-container
5. Report back when complete

Do NOT run type check - orchestrator will do that after all sub-agents complete.
```

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.

# P11 Orchestrator: CSS to Tailwind/shadcn Migration

## Your Role

You are an orchestrator agent responsible for migrating Lexical CSS to Tailwind and shadcn components. You coordinate work by spawning specialized agents and tracking progress.

## Mission

1. Create `lexical-theme.css` containing ONLY required Lexical theme classes
2. Convert UI components to shadcn components and Tailwind classes
3. Delete all original CSS files

## Context Files

**Read these first:**
- `specs/lexical-playground-port/handoffs/HANDOFF_P11.md` - Full task specification
- `apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.ts` - Theme object mapping
- `apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.css` - Source of required classes

## Key Principle

**Lexical theme classes CANNOT be Tailwind** - Lexical dynamically applies class names like `PlaygroundEditorTheme__textBold`. These must remain as CSS classes.

**UI chrome CAN be Tailwind/shadcn** - Toolbars, buttons, dropdowns, inputs are not Lexical-controlled.

---

## Execution Phases

### Phase A: Create `lexical-theme.css` (45 min)

Create `apps/todox/src/app/lexical/themes/lexical-theme.css`:

**ONLY include classes referenced in `PlaygroundEditorTheme.ts`:**
- `PlaygroundEditorTheme__*` classes that are mapped in the theme object
- `.CommentEditorTheme__paragraph` and `.StickyEditorTheme__paragraph`
- `.Collapsible__*` classes (if used)
- `[type='page-break']` styles (if used)
- `.emoji*` styles (Lexical emoji rendering)
- `@keyframes CursorBlink` (Lexical cursor animation)
- Google Fonts import for Reenie Beanie (sticky notes only)

**AUDIT before including** - search codebase for each class:
- `.sticky-note*` - only if sticky notes feature is used
- `.excalidraw-button*` - only if Excalidraw feature is used
- `.tree-view-output` - only if debug panel is used
- `@keyframes mic-pulsate-color` - only if speech-to-text is used

**DELETE entirely (do not migrate):**
- `.toolbar*` classes → use Tailwind
- `.dropdown*` classes → use shadcn DropdownMenu
- `.action-button*` classes → use shadcn Button
- `.dialog*` classes → unused, use shadcn Dialog if needed
- `.switch*` classes → use shadcn Switch
- `.link-editor*` classes → use shadcn Input/Button
- `i.bold`, `i.italic` etc → use Lucide React
- `body`, `header`, `pre` element styles → shadcn defaults in globals.css
- `.characters-limit*`, `.connecting`, `.debug-*`, `.test-recorder-*` → inline Tailwind if used
- Font imports (except Reenie Beanie) → use shadcn default fonts

### Phase B: Convert to shadcn Components (90 min)

Spawn agents in parallel:

#### B1: ToolbarPlugin → shadcn Button + Tailwind

```
File: apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx

Convert:
- Container div.toolbar → Tailwind flex container
- button.toolbar-item → shadcn <Button variant="ghost" size="icon">
- Dropdown triggers → shadcn <DropdownMenuTrigger>
- i.bold, i.italic etc → Lucide icons

Example:
<div className="toolbar"> →
<div className="flex items-center gap-0.5 bg-white p-1 rounded-t-[10px] sticky top-0 z-10 overflow-x-auto h-11">

<button className="toolbar-item"> →
<Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
```

#### B2: DropDown.tsx → shadcn DropdownMenu

```
File: apps/todox/src/app/lexical/ui/DropDown.tsx

Replace entire component with shadcn pattern:

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

Keep the same props interface, change implementation.
```

#### B3: CommentPlugin → shadcn Card, Button, Input

```
File: apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx

Convert:
- CommentPlugin_AddCommentBox → Tailwind positioned container
- CommentPlugin_CommentInputBox → shadcn Card
- buttons → shadcn Button
- text inputs → shadcn Input or Textarea
- CommentPlugin_CommentsPanel → shadcn Card with fixed positioning
```

#### B4: ActionsPlugin → shadcn Button

```
File: apps/todox/src/app/lexical/plugins/ActionsPlugin/index.tsx

Convert:
- .actions container → Tailwind absolute positioning
- .action-button → shadcn <Button variant="secondary" size="sm" className="rounded-full">
```

#### B5: FloatingLinkEditorPlugin → shadcn Input, Button

```
File: apps/todox/src/app/lexical/plugins/FloatingLinkEditorPlugin/index.tsx

Convert:
- .link-editor container → shadcn Popover or Tailwind
- .link-input → shadcn Input
- edit/trash/confirm buttons → shadcn Button with Lucide icons
```

#### B6: Editor Shell → Tailwind

```
File: apps/todox/src/app/lexical/Editor.tsx

Convert:
- .editor-shell → className="mx-auto max-w-[1100px] relative leading-relaxed"
- .editor-container → className="bg-white relative rounded-b-[10px]"
```

### Phase C: Convert Icons to Lucide (30 min)

Replace CSS background-image icons with Lucide React components.

**Add Lucide imports to ToolbarPlugin:**
```tsx
import {
  Bold, Italic, Underline, Strikethrough, Code, Link2,
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote, Minus, Image,
  Table, ChevronDown, Plus, Type, Heading1, Heading2, Heading3,
} from "lucide-react";
```

**Icon mapping:**
| CSS | Lucide |
|-----|--------|
| `i.bold` | `<Bold />` |
| `i.italic` | `<Italic />` |
| `i.underline` | `<Underline />` |
| `i.strikethrough` | `<Strikethrough />` |
| `i.code` | `<Code />` |
| `i.link` | `<Link2 />` |
| `i.undo` | `<Undo2 />` |
| `i.redo` | `<Redo2 />` |
| `i.left-align` | `<AlignLeft />` |
| `i.center-align` | `<AlignCenter />` |
| `i.right-align` | `<AlignRight />` |
| `i.justify-align` | `<AlignJustify />` |
| `.icon.bullet-list` | `<List />` |
| `.icon.numbered-list` | `<ListOrdered />` |
| `.icon.check-list` | `<CheckSquare />` |
| `.icon.quote` | `<Quote />` |
| `i.horizontal-rule` | `<Minus />` |
| `i.image` | `<Image />` |
| `.icon.table` | `<Table />` |
| `i.chevron-down` | `<ChevronDown />` |
| `.icon.plus` | `<Plus />` |
| `.icon.paragraph` | `<Type />` |
| `.icon.h1` | `<Heading1 />` |

**For icons without Lucide equivalent:**
```tsx
// Custom icons - keep as background image in Tailwind
<span className="block w-5 h-5 bg-[url('/lexical/images/icons/figma.svg')] bg-contain bg-center bg-no-repeat" />
```

### Phase D: Clean Up (15 min)

1. **Update imports:**
```typescript
// PlaygroundEditorTheme.ts - change import
import "./lexical-theme.css";

// CommentEditorTheme.ts - remove CSS import line
// StickyEditorTheme.ts - remove CSS import line

// page.tsx - remove: import "./index.css"
// CommentPlugin/index.tsx - remove: import "./index.css"
```

2. **Delete old CSS files:**
```bash
rm apps/todox/src/app/lexical/index.css
rm apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.css
rm apps/todox/src/app/lexical/themes/CommentEditorTheme.css
rm apps/todox/src/app/lexical/themes/StickyEditorTheme.css
rm apps/todox/src/app/lexical/plugins/CommentPlugin/index.css
```

### Phase E: Verify (45 min)

```bash
# Type check
bun run check --filter=@beep/todox

# Start dev server
bun run dev
```

**Visual verification checklist:**
- [ ] Editor loads without console errors
- [ ] Toolbar displays correctly
- [ ] Toolbar buttons work (bold, italic, etc.)
- [ ] Dropdown menus open and position correctly
- [ ] Text formatting applies (bold text is bold)
- [ ] Headings display with correct sizes
- [ ] Code blocks have syntax highlighting
- [ ] Tables render with borders
- [ ] Lists (bullet, numbered, checklist) work
- [ ] Link editor appears and works
- [ ] Comment panel opens and works
- [ ] Sticky notes display with correct font
- [ ] Collapsible sections expand/collapse

---

## Progress Tracking

Use TodoWrite:

```
[ ] A0: Audit PlaygroundEditorTheme.ts for required class names
[ ] A1: Create lexical-theme.css with ONLY required classes
[ ] A2: Audit and add Collapsible styles (if used)
[ ] A3: Audit and add emoji styles (if used)
[ ] A4: Audit and add sticky-note styles (if used)
[ ] A5: Add CursorBlink animation
[ ] B1: Convert ToolbarPlugin to shadcn/Tailwind
[ ] B2: Replace DropDown.tsx with shadcn DropdownMenu
[ ] B3: Convert CommentPlugin to shadcn/Tailwind
[ ] B4: Convert ActionsPlugin to shadcn/Tailwind
[ ] B5: Convert FloatingLinkEditorPlugin
[ ] B6: Convert Editor shell to Tailwind
[ ] C1: Replace icon background-images with Lucide
[ ] D1: Update theme imports
[ ] D2: Remove old CSS imports from components
[ ] D3: Delete 5 old CSS files
[ ] E1: Type check passes
[ ] E2: Visual verification complete
```

---

## Critical Rules

1. **ONLY keep PlaygroundEditorTheme__* classes referenced in theme object** - Audit against PlaygroundEditorTheme.ts
2. **DELETE unused CSS classes** - If not referenced in codebase, remove entirely
3. **Use shadcn defaults** - body, fonts, buttons, dialogs, switches, dropdowns
4. **NEVER modify third-party CSS** (react-day-picker, excalidraw, katex)
5. **Keep theme TS files** - Only change their CSS imports
6. **Fix the typo** - `position: 'relative'` → `position: relative` (no quotes)
7. **Use shadcn variants** - `variant="ghost"` for toolbar, `variant="secondary"` for actions
8. **Audit before migrating** - Search codebase for class usage before including in lexical-theme.css

---

## Agent Prompts

### For lexical-theme.css creation:

```
STEP 1: Read apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.ts to get the
list of class names that Lexical actually requires.

STEP 2: Read apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.css and extract
ONLY the classes that are referenced in the theme object from step 1.

STEP 3: Create apps/todox/src/app/lexical/themes/lexical-theme.css containing:

1. Google Fonts import for Reenie Beanie (sticky notes font)
2. ONLY PlaygroundEditorTheme__* classes that are in the theme object
3. .Collapsible__* classes (verify they're used by searching codebase)
4. [type='page-break'] styles (verify used)
5. .emoji* styles (Lexical requires these for emoji rendering)
6. @keyframes CursorBlink (Lexical cursor)

Also add:
.CommentEditorTheme__paragraph { margin: 0; position: relative; }
.StickyEditorTheme__paragraph { margin: 0; position: relative; }

AUDIT each optional class by searching the codebase:
- .sticky-note* - include only if StickyNode is used
- .excalidraw-button* - include only if ExcalidrawNode is used
- .tree-view-output - include only if TreeViewPlugin is used

DO NOT include:
- Any .toolbar*, .dropdown*, .action-button*, .switch*, .dialog* classes
- Any i.bold, i.italic icon classes
- Any body, header, pre element styles
- Any font imports except Reenie Beanie
```

### For ToolbarPlugin conversion:

```
Convert apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx from CSS classes to shadcn + Tailwind.

1. Import shadcn Button: import { Button } from "@/components/ui/button"
2. Import Lucide icons for all toolbar functions
3. Replace div.toolbar with Tailwind: className="flex items-center gap-0.5 bg-white p-1 rounded-t-[10px] sticky top-0 z-10 overflow-x-auto h-11"
4. Replace button.toolbar-item with: <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
5. Replace i.bold etc with Lucide: <Bold className="h-4 w-4" />
6. Use Button's disabled prop instead of CSS
7. Use data-active or aria-pressed for active state styling

Keep all existing functionality, just change the styling approach.
```

---

## Output

After completion, update `specs/lexical-playground-port/CURRENT_STATUS.md`:

1. Mark P11 complete
2. Update CSS files count: 5 → 1 (lexical-theme.css)
3. Add P11 summary with converted components
4. Note any issues found

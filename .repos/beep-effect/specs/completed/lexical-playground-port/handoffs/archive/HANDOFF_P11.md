# Phase 11 Handoff: CSS Consolidation to Tailwind

> **Date**: 2026-01-27 | **From**: P9/P10 (Runtime Verification) | **Status**: Ready

---

## Working Context

### Current Task

Remove CSS files from `apps/todox/src/app/lexical/` by:
1. Creating a single `lexical-theme.css` for required Lexical theme classes
2. Converting UI components to Tailwind classes and shadcn components
3. Deleting all other CSS files

### Scope Summary

| Category | Count | Action |
|----------|-------|--------|
| CSS files to consolidate | 5 | Merge required → `lexical-theme.css`, convert rest → Tailwind |
| Theme TS files to update | 3 | Point to new `lexical-theme.css` |
| UI components | ~10 | Convert to Tailwind/shadcn |
| Third-party CSS | 3 | Keep (external dependencies) |

### Success Criteria

- [ ] Single `lexical-theme.css` with only required Lexical classes
- [ ] All UI chrome converted to Tailwind/shadcn
- [ ] 5 original CSS files deleted
- [ ] Editor renders and functions correctly
- [ ] No visual regressions

---

## Files to Process

### Output: New File Structure

```
lexical/
├── themes/
│   ├── lexical-theme.css        # NEW: All required Lexical theme classes
│   ├── PlaygroundEditorTheme.ts # Updated: imports lexical-theme.css
│   ├── CommentEditorTheme.ts    # Keep or delete (just extends base)
│   └── StickyEditorTheme.ts     # Keep or delete (just extends base)
└── ... (no other CSS files)
```

### CSS Files to Process

| File | Lines | Strategy |
|------|-------|----------|
| `themes/PlaygroundEditorTheme.css` | 789 | Extract required classes → `lexical-theme.css` |
| `lexical/index.css` | 1770 | Convert UI → Tailwind/shadcn, delete |
| `plugins/CommentPlugin/index.css` | 437 | Convert UI → Tailwind/shadcn, delete |
| `themes/CommentEditorTheme.css` | 7 | Merge into `lexical-theme.css`, delete |
| `themes/StickyEditorTheme.css` | 7 | Merge into `lexical-theme.css`, delete |

### Theme TS Files

| File | Action |
|------|--------|
| `themes/PlaygroundEditorTheme.ts` | Update import: `./lexical-theme.css` |
| `themes/CommentEditorTheme.ts` | Keep (extends PlaygroundEditorTheme) |
| `themes/StickyEditorTheme.ts` | Keep (extends PlaygroundEditorTheme) |

### CSS Imports to Update

| File | Current Import | Action |
|------|----------------|--------|
| `page.tsx:4` | `import "./index.css"` | Remove (convert to Tailwind) |
| `themes/PlaygroundEditorTheme.ts:5` | `import "./PlaygroundEditorTheme.css"` | Change to `./lexical-theme.css` |
| `plugins/CommentPlugin/index.tsx:7` | `import "./index.css"` | Remove (convert to Tailwind) |

### CSS Imports to KEEP (Third-Party)

| File | Import | Reason |
|------|--------|--------|
| `nodes/DateTimeNode/DateTimeComponent.tsx:5` | `import "react-day-picker/style.css"` | External dependency |
| `plugins/ExcalidrawPlugin/index.tsx:6` | `import "@excalidraw/excalidraw/index.css"` | External dependency |
| `plugins/EquationsPlugin/index.tsx:5` | `import "katex/dist/katex.css"` | External dependency |

---

## CSS Analysis by Category

### Category 1: Lexical Theme Classes → `lexical-theme.css`

**Source**: `PlaygroundEditorTheme.css`

These classes are **required by Lexical's theming system**. The `PlaygroundEditorTheme.ts` exports a theme object that maps semantic names to class names. These classes CANNOT be converted to Tailwind - they must exist as CSS classes because Lexical applies them dynamically.

**ONLY include classes referenced in `PlaygroundEditorTheme.ts`:**
- Text formatting: `__textBold`, `__textItalic`, `__textUnderline`, `__textStrikethrough`, etc.
- Headings: `__h1`, `__h2`, `__h3`, `__h4`, `__h5`, `__h6`
- Lists: `__ol1-5`, `__ul`, `__listItem`, `__listItemChecked`, `__listItemUnchecked`
- Code: `__code`, `__tokenComment`, `__tokenProperty`, etc.
- Tables: `__table`, `__tableCell`, `__tableCellHeader`, etc.
- Layout: `__layoutContainer`, `__layoutItem`
- Marks/Highlights: `__mark`, `__markOverlap`, `__hashtag`
- Collapsible: `.Collapsible__*` classes
- Page break: `[type='page-break']` styles
- Paragraph styles for Comment/Sticky editors

**IMPORTANT**: Cross-reference `PlaygroundEditorTheme.ts` to verify each class is actually used. Remove any orphaned CSS classes not referenced in the theme object.

### Category 2: REMOVE Entirely (Unused/Redundant)

**These classes should be DELETED, not migrated:**

| Class Pattern | Reason |
|---------------|--------|
| `.dialog*` | Unused - use shadcn Dialog |
| `.switch*` | Unused - use shadcn Switch |
| `button` (element selector) | Use shadcn Button |
| `body` styles | Already in globals.css via shadcn |
| `header`, `pre` element styles | Use Tailwind on components |
| `.dropdown*` | Replace with shadcn DropdownMenu |
| `.toolbar*` | Replace with Tailwind classes |
| `.action-button*` | Replace with shadcn Button |
| `i.bold`, `i.italic`, etc. (icon classes) | Replace with Lucide React |
| `.link-editor*` | Replace with shadcn components |
| `.characters-limit*` | Inline Tailwind if used |
| `.connecting` | Inline Tailwind if used |
| `.debug-*` | Inline Tailwind if used |
| `.test-recorder-*` | Inline Tailwind if used |
| Font imports (except Reenie Beanie for sticky notes) | Use shadcn default fonts |

**Audit approach**: Search codebase for each class. If not referenced → delete.

### Category 3: UI Components → shadcn + Tailwind

**Source**: `index.css`, `CommentPlugin/index.css`

Replace with existing shadcn components or Tailwind classes:

| CSS Class | shadcn/Tailwind Replacement |
|-----------|----------------------------|
| `.toolbar` | Tailwind: `flex gap-1 bg-white p-1 rounded-t-lg sticky top-0 z-10` |
| `.toolbar-item` | shadcn `<Button variant="ghost" size="sm">` |
| `.dropdown` | shadcn `<DropdownMenu>` or `<Popover>` |
| `.dropdown .item` | shadcn `<DropdownMenuItem>` |
| `.action-button` | shadcn `<Button variant="secondary" size="sm">` |
| `.switch` | shadcn `<Switch>` |
| `.dialog-dropdown` | shadcn `<Select>` |
| `input.link-input` | shadcn `<Input>` |
| `.CommentPlugin_CommentInputBox_Button` | shadcn `<Button>` |

### Category 4: Icons → Lucide React

**Source**: `index.css`

Current approach uses CSS background-image. Convert to:

| Current | Replacement |
|---------|-------------|
| `i.bold` with background-image | `<Bold className="h-4 w-4" />` from lucide-react |
| `i.italic` with background-image | `<Italic className="h-4 w-4" />` from lucide-react |
| Custom icons (figma, youtube) | Keep as inline SVG or use `<Image>` |

**Note**: If Lucide doesn't have an icon, use Tailwind background utility:
```tsx
<span className="block w-5 h-5 bg-[url('/lexical/images/icons/figma.svg')] bg-contain bg-no-repeat" />
```

### Category 5: Animations/Keyframes → Tailwind

**Source**: `index.css`, `CommentPlugin/index.css`

| Animation | Tailwind Replacement |
|-----------|---------------------|
| `@keyframes slide-in` | `animate-in slide-in-from-left` (tw-animate-css) |
| `@keyframes show-comments` | `animate-in slide-in-from-right` |
| `@keyframes show-input-box` | `animate-in fade-in slide-in-from-bottom` |
| `@keyframes mic-pulsate-color` | Custom in `lexical-theme.css` (unique) |
| `@keyframes CursorBlink` | Keep in `lexical-theme.css` (Lexical cursor) |

### Category 6: Complex/Unique Styles → `lexical-theme.css` (if used)

Some styles are too complex for Tailwind. **Only include if actively used:**

| Style | Reason | Action |
|-------|--------|--------|
| `.sticky-note*` | Complex gradient, pseudo-elements | Keep if sticky notes feature used |
| `.emoji*` | Transparent text with background-image | Keep (Lexical emoji rendering) |
| `.excalidraw-button*` | Integration with Excalidraw | Keep if Excalidraw feature used |
| `.tree-view-output` | Debug UI | Keep if debug panel used |

**Audit each**: If the feature is disabled or not used, delete the styles.

---

## Execution Plan

### Step 1: Create `lexical-theme.css`

Create `apps/todox/src/app/lexical/themes/lexical-theme.css` with:

```css
/**
 * Lexical Theme Classes
 * Required by Lexical's theming system - DO NOT convert to Tailwind
 * These classes are dynamically applied by Lexical based on PlaygroundEditorTheme.ts
 */

/* Google Fonts for sticky notes */
@import 'https://fonts.googleapis.com/css?family=Reenie+Beanie';

/* === Text Formatting === */
.PlaygroundEditorTheme__textBold { font-weight: bold; }
.PlaygroundEditorTheme__textItalic { font-style: italic; }
/* ... all PlaygroundEditorTheme__* classes from PlaygroundEditorTheme.css */

/* === Paragraph styles for sub-editors === */
.CommentEditorTheme__paragraph { margin: 0; position: relative; }
.StickyEditorTheme__paragraph { margin: 0; position: relative; }

/* === Collapsible === */
.Collapsible__container { ... }

/* === Page Break === */
[type='page-break'] { ... }

/* === Sticky Notes (complex, keep as CSS) === */
.sticky-note { ... }

/* === Emoji (transparent text trick) === */
.emoji { ... }

/* === Animations that can't be Tailwind === */
@keyframes CursorBlink { ... }
@keyframes mic-pulsate-color { ... }
```

### Step 2: Convert UI Components to shadcn/Tailwind

**Priority order** (highest impact first):

#### 2.1 Toolbar (`plugins/ToolbarPlugin/index.tsx`)

```tsx
// BEFORE
<div className="toolbar">
  <button className="toolbar-item">

// AFTER
<div className="flex gap-0.5 bg-white p-1 rounded-t-[10px] sticky top-0 z-10 overflow-x-auto">
  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
```

#### 2.2 Dropdown (`ui/DropDown.tsx`)

Replace entire component with shadcn `<DropdownMenu>`:

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
```

#### 2.3 Actions (`plugins/ActionsPlugin/index.tsx`)

```tsx
// BEFORE
<button className="action-button">

// AFTER
<Button variant="secondary" size="sm" className="rounded-full">
```

#### 2.4 Link Editor (`plugins/FloatingLinkEditorPlugin/index.tsx`)

```tsx
// BEFORE
<input className="link-editor .link-input">

// AFTER
<Input className="rounded-full bg-muted" />
```

#### 2.5 Comment Plugin (`plugins/CommentPlugin/index.tsx`)

```tsx
// Replace buttons
<Button variant="default">Submit</Button>
<Button variant="outline">Cancel</Button>

// Replace panels with Card
<Card className="w-[300px] fixed right-0 ...">
  <CardHeader>Comments</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Step 3: Convert Icons to Lucide

```tsx
// BEFORE (CSS background-image)
<i className="format bold" />

// AFTER (Lucide React)
import { Bold, Italic, Underline, Strikethrough, Code, Link } from "lucide-react";

<Bold className="h-4 w-4" />
```

**Icon mapping**:
| CSS Icon | Lucide Icon |
|----------|-------------|
| `i.bold` | `<Bold />` |
| `i.italic` | `<Italic />` |
| `i.underline` | `<Underline />` |
| `i.strikethrough` | `<Strikethrough />` |
| `i.code` | `<Code />` |
| `i.link` | `<Link />` |
| `i.undo` | `<Undo2 />` |
| `i.redo` | `<Redo2 />` |
| `i.left-align` | `<AlignLeft />` |
| `i.center-align` | `<AlignCenter />` |
| `i.right-align` | `<AlignRight />` |
| `i.justify-align` | `<AlignJustify />` |

For icons without Lucide equivalent, use inline background:
```tsx
<span className="block w-5 h-5 bg-[url('/lexical/images/icons/figma.svg')] bg-contain bg-center bg-no-repeat" />
```

### Step 4: Update Theme Imports

```typescript
// themes/PlaygroundEditorTheme.ts
import "./lexical-theme.css"; // Changed from PlaygroundEditorTheme.css

// themes/CommentEditorTheme.ts - no CSS import needed
// themes/StickyEditorTheme.ts - no CSS import needed
```

### Step 5: Remove Old CSS Files and Imports

```bash
# Remove imports
# page.tsx - remove `import "./index.css"`
# CommentPlugin/index.tsx - remove `import "./index.css"`

# Delete files
rm apps/todox/src/app/lexical/index.css
rm apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.css
rm apps/todox/src/app/lexical/themes/CommentEditorTheme.css
rm apps/todox/src/app/lexical/themes/StickyEditorTheme.css
rm apps/todox/src/app/lexical/plugins/CommentPlugin/index.css
```

### Step 6: Verify

```bash
# Type check
bun run check --filter=@beep/todox

# Visual verification
bun run dev
# Navigate to /lexical and test all features
```

---

## CSS Classes Reference

### Must Preserve (Lexical Theme - 100+ classes)

<details>
<summary>PlaygroundEditorTheme classes (expand)</summary>

```
PlaygroundEditorTheme__paragraph
PlaygroundEditorTheme__quote
PlaygroundEditorTheme__h1 through __h6
PlaygroundEditorTheme__indent
PlaygroundEditorTheme__textBold
PlaygroundEditorTheme__textItalic
PlaygroundEditorTheme__textUnderline
PlaygroundEditorTheme__textStrikethrough
PlaygroundEditorTheme__textUnderlineStrikethrough
PlaygroundEditorTheme__textSubscript
PlaygroundEditorTheme__textSuperscript
PlaygroundEditorTheme__textCode
PlaygroundEditorTheme__textHighlight
PlaygroundEditorTheme__textLowercase
PlaygroundEditorTheme__textUppercase
PlaygroundEditorTheme__textCapitalize
PlaygroundEditorTheme__hashtag
PlaygroundEditorTheme__link
PlaygroundEditorTheme__code
PlaygroundEditorTheme__tokenComment (and all token classes)
PlaygroundEditorTheme__table (and all table classes)
PlaygroundEditorTheme__ol1 through __ol5
PlaygroundEditorTheme__ul
PlaygroundEditorTheme__listItem
PlaygroundEditorTheme__listItemChecked
PlaygroundEditorTheme__listItemUnchecked
PlaygroundEditorTheme__nestedListItem
PlaygroundEditorTheme__mark
PlaygroundEditorTheme__markOverlap
PlaygroundEditorTheme__layoutContainer
PlaygroundEditorTheme__layoutItem
PlaygroundEditorTheme__autocomplete
PlaygroundEditorTheme__blockCursor
PlaygroundEditorTheme__characterLimit
PlaygroundEditorTheme__embedBlock
PlaygroundEditorTheme__embedBlockFocus
PlaygroundEditorTheme__hr
PlaygroundEditorTheme__hrSelected
PlaygroundEditorTheme__specialText
PlaygroundEditorTheme__contextMenu (and related)
PlaygroundEditorTheme__tabNode (and related)
Collapsible__container
Collapsible__title
Collapsible__content
[type='page-break'] styles
```

</details>

### Icon Classes (~60 classes)

<details>
<summary>Icon background-image classes (expand)</summary>

```
i.bold, i.italic, i.underline, i.strikethrough
i.code, i.link, i.image, i.table
i.undo, i.redo, i.indent, i.outdent
i.left-align, i.center-align, i.right-align, i.justify-align
i.h1 through i.h6 (via .icon.h1 etc)
i.bullet-list, i.numbered-list, i.check-list
i.quote, i.horizontal-rule, i.page-break
i.palette, i.bucket, i.highlight
i.subscript, i.superscript
i.uppercase, i.lowercase, i.capitalize
i.sticky, i.poll, i.columns
i.figma, i.youtube, i.x
i.user, i.equation, i.calendar, i.gif
i.copy, i.paste, i.success, i.prettier
i.mic, i.import, i.export, i.share
i.diagram-2, i.markdown, i.close
i.chevron-down, i.add-comment, i.comments
i.send, i.delete
.icon.plus, .icon.caret-right, .icon.dropdown-more
.icon.font-color, .icon.font-family, .icon.bg-color
.icon.table, .icon.paragraph
```

</details>

### Comment Plugin Classes (~30 classes)

<details>
<summary>CommentPlugin classes (expand)</summary>

```
CommentPlugin_AddCommentBox
CommentPlugin_AddCommentBox_button
CommentPlugin_CommentInputBox
CommentPlugin_CommentInputBox_Buttons
CommentPlugin_CommentInputBox_Button
CommentPlugin_CommentInputBox_EditorContainer
CommentPlugin_CommentInputBox_Editor
CommentPlugin_ShowCommentsButton
CommentPlugin_CommentsPanel
CommentPlugin_CommentsPanel_Heading
CommentPlugin_CommentsPanel_Editor
CommentPlugin_CommentsPanel_SendButton
CommentPlugin_CommentsPanel_Empty
CommentPlugin_CommentsPanel_List
CommentPlugin_CommentsPanel_List_Comment
CommentPlugin_CommentsPanel_List_Details
CommentPlugin_CommentsPanel_List_Comment_Author
CommentPlugin_CommentsPanel_List_Comment_Time
CommentPlugin_CommentsPanel_List_Thread
CommentPlugin_CommentsPanel_List_Thread_QuoteBox
CommentPlugin_CommentsPanel_List_Thread_Quote
CommentPlugin_CommentsPanel_List_Thread_Comments
CommentPlugin_CommentsPanel_List_Thread_Editor
CommentPlugin_CommentsPanel_List_DeleteButton
CommentPlugin_CommentsPanel_DeletedComment
```

</details>

---

## Gotchas

1. **Lexical theme classes are NOT optional** - Lexical dynamically applies these classes. If missing, text formatting breaks.

2. **`position: 'relative'` typo** - CommentEditorTheme.css and StickyEditorTheme.css have `position: 'relative'` (with quotes) which is invalid CSS. Fix when migrating.

3. **CSS specificity** - Some styles in index.css override others. Maintain order when moving to globals.css.

4. **Media queries** - Several `@media (max-width: ...)` rules exist. Convert to Tailwind responsive prefixes where possible.

5. **Keyframe animations** - `@keyframes` must remain in CSS (globals.css), cannot be Tailwind.

6. **CSS custom properties** - `--lexical-indent-base-value` and similar must be preserved.

7. **Google Fonts import** - `index.css` line 2 imports Reenie Beanie font for sticky notes. Move to `<head>` or globals.css.

---

## Verification Checklist

After migration:

- [ ] Editor loads without console errors
- [ ] Text formatting works (bold, italic, underline, strikethrough)
- [ ] Headings display correctly (h1-h6)
- [ ] Code blocks have syntax highlighting
- [ ] Tables render with borders and hover states
- [ ] Lists (ordered, unordered, checklist) display correctly
- [ ] Collapsible sections expand/collapse
- [ ] Links are styled and clickable
- [ ] Toolbar icons display correctly
- [ ] Dropdown menus position correctly
- [ ] Comment plugin UI works
- [ ] Sticky notes display with correct font
- [ ] Page breaks render correctly

---

## Files Changed Summary

### To Create (1 file)

```
apps/todox/src/app/lexical/themes/lexical-theme.css    # Required Lexical theme classes
```

### To Delete (5 CSS files)

```
apps/todox/src/app/lexical/index.css
apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.css
apps/todox/src/app/lexical/themes/CommentEditorTheme.css
apps/todox/src/app/lexical/themes/StickyEditorTheme.css
apps/todox/src/app/lexical/plugins/CommentPlugin/index.css
```

### To Modify (UI → shadcn/Tailwind)

```
apps/todox/src/app/lexical/page.tsx                     # Remove CSS import
apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.ts # Import lexical-theme.css
apps/todox/src/app/lexical/themes/CommentEditorTheme.ts # Remove CSS import
apps/todox/src/app/lexical/themes/StickyEditorTheme.ts  # Remove CSS import
apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx # shadcn Button, Card + Tailwind
apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx # shadcn Button + Tailwind
apps/todox/src/app/lexical/plugins/ActionsPlugin/index.tsx # shadcn Button + Tailwind
apps/todox/src/app/lexical/plugins/FloatingLinkEditorPlugin/index.tsx # shadcn Input
apps/todox/src/app/lexical/ui/DropDown.tsx              # Replace with shadcn DropdownMenu
apps/todox/src/app/lexical/Editor.tsx                   # Tailwind classes
```

---

## shadcn Components Needed

Ensure these are installed in the project:

```bash
# Check existing
ls apps/todox/src/components/ui/

# If missing, add:
bunx shadcn@latest add button
bunx shadcn@latest add dropdown-menu
bunx shadcn@latest add input
bunx shadcn@latest add card
bunx shadcn@latest add switch
bunx shadcn@latest add select
bunx shadcn@latest add popover
```

---

## Estimated Effort

| Task | Time |
|------|------|
| Create lexical-theme.css with required classes | 45 min |
| Convert ToolbarPlugin to shadcn/Tailwind | 30 min |
| Replace DropDown.tsx with shadcn DropdownMenu | 30 min |
| Convert CommentPlugin to shadcn/Tailwind | 45 min |
| Convert ActionsPlugin to shadcn/Tailwind | 20 min |
| Convert remaining UI components | 30 min |
| Update imports and delete old CSS | 15 min |
| Testing and fixes | 45 min |
| **Total** | **~4-5 hours** |

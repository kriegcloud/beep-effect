# P1 Array Methods Master Checklist

## Summary
- Total violations: ~168
- Unique files: ~49
- Discovery batches merged: 4

## Statistics

| Violation Type | Count |
|----------------|-------|
| `.map()` | 45+ |
| `.filter()` | 20+ |
| `.forEach()` | 15+ |
| `.find()` | 10+ |
| `.indexOf()` | 10+ |
| `.slice()` | 10+ |
| `.join()` | 10+ |
| `.push()` | 10+ |
| `.includes()` | 8+ |
| `.length === 0` / `.length > 0` | 15+ |
| `Array.from()` | 8+ |
| `.sort()` | 3+ |
| `.splice()` | 3+ |
| `.every()` | 3+ |
| `.some()` | 3+ |
| `.reduce()` | 3+ |
| `.reverse()` | 2+ |
| Other (`.fill`, `.unshift`, spreads) | 10+ |

## Files by Violation Count

| File | Violations |
|------|------------|
| plugins/CommentPlugin/index.tsx | 8+ |
| nodes/PollNode.tsx | 11+ |
| plugins/ToolbarPlugin/index.tsx | 12+ |
| commenting/models.ts | 10+ |
| plugins/MarkdownTransformers/index.ts | 10+ |
| plugins/TestRecorderPlugin/index.tsx | 10+ |
| plugins/TableHoverActionsV2Plugin/index.tsx | 10+ |
| plugins/MentionsPlugin/index.tsx | 6+ |
| plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts | 6+ |
| plugins/TableScrollShadowPlugin/index.tsx | 6+ |

## Execution Planning

- Total unique files: ~49
- Files per batch: 5
- Total batches needed: 10

### Batch Assignments

| Batch | Files |
|-------|-------|
| 1 | nodes/PollNode.tsx, nodes/PollComponent.tsx, nodes/LayoutItemNode.ts, nodes/ImageNode.tsx, nodes/DateTimeComponent.tsx |
| 2 | nodes/ExcalidrawComponent.tsx, plugins/ActionsPlugin/index.tsx, plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts, plugins/AiAssistantPlugin/components/AiActivityIndicator.tsx, plugins/AutocompletePlugin/index.tsx |
| 3 | plugins/AutoEmbedPlugin/index.tsx, plugins/CommentPlugin/index.tsx, plugins/DraggableBlockPlugin/index.tsx, plugins/ComponentPickerPlugin/index.tsx, plugins/FloatingLinkEditorPlugin/index.tsx |
| 4 | plugins/CollapsiblePlugin/CollapsibleContainerNode.ts, plugins/EmojiPickerPlugin/index.tsx, plugins/MarkdownTransformers/index.ts, plugins/LayoutPlugin/InsertLayoutDialog.tsx, plugins/LayoutPlugin/LayoutPlugin.tsx |
| 5 | plugins/MentionsPlugin/index.tsx, plugins/ImagesPlugin/index.tsx, plugins/AiAssistantPlugin/components/InsertionModeSelector.tsx, plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx, plugins/TableCellResizer/index.tsx |
| 6 | plugins/TableOfContentsPlugin/index.tsx, plugins/VersionsPlugin/index.tsx, plugins/TableHoverActionsV2Plugin/index.tsx, plugins/TestRecorderPlugin/index.tsx, plugins/ShortcutsPlugin/shortcuts.ts |
| 7 | plugins/TableScrollShadowPlugin/index.tsx, plugins/TableActionMenuPlugin/index.tsx, plugins/TypingPerfPlugin/index.ts, plugins/ToolbarPlugin/utils.ts, plugins/ToolbarPlugin/fontSize.tsx |
| 8 | plugins/ToolbarPlugin/index.tsx, plugins/ToolbarPlugin/components/FontControls.tsx, plugins/PollPlugin/index.tsx, plugins/TablePlugin.tsx, plugins/FloatingTextFormatToolbarPlugin/index.tsx |
| 9 | commenting/models.ts, ui/ColorPicker.tsx, utils/docSerialization.ts, ui/KatexEquationAlterer.tsx, plugins/CodeActionMenuPlugin/index.tsx |
| 10 | plugins/ContextMenuPlugin/index.tsx, plugins/PasteLogPlugin/index.tsx, plugins/MaxLengthPlugin/index.tsx, remaining files as needed |

---

## Master Checklist

### nodes/PollNode.tsx (11 violations)
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:34` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:61` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:127` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:132` - `.reduce()` - Replace with `A.reduce(array, init, fn)`
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:136` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:145` - `.splice()` - Reconstruct immutably
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:159` - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:160` - `.findIndex()` - Replace with `A.findFirstIndex(array, pred)`
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:162` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:164` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/nodes/PollNode.tsx:167` - `.join()` - Replace with `A.join(array, sep)`

### nodes/PollComponent.tsx (2 violations)
- [ ] `apps/todox/src/app/lexical/nodes/PollComponent.tsx:25` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/nodes/PollComponent.tsx:193` - `.map()` - Replace with `A.map(array, fn)`

### nodes/LayoutItemNode.ts (1 violation)
- [ ] `apps/todox/src/app/lexical/nodes/LayoutItemNode.ts:45` - `.every()` - Replace with `A.every(array, pred)`

### nodes/ImageNode.tsx (1 violation)
- [ ] `apps/todox/src/app/lexical/nodes/ImageNode.tsx:194` - `.map()` - Replace with `A.map(array, fn)`

### nodes/DateTimeComponent.tsx (2 violations)
- [ ] `apps/todox/src/app/lexical/nodes/DateTimeComponent.tsx:141` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/nodes/DateTimeComponent.tsx:155` - `.map()` - Replace with `A.map(array, fn)`

### nodes/ExcalidrawComponent.tsx (2 violations)
- [ ] `apps/todox/src/app/lexical/nodes/ExcalidrawComponent.tsx:90` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/nodes/ExcalidrawComponent.tsx:171` - `.filter()` - Replace with `A.filter(array, pred)`

### plugins/ActionsPlugin/index.tsx (2 violations)
- [ ] `apps/todox/src/app/lexical/plugins/ActionsPlugin/index.tsx:247` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/ActionsPlugin/index.tsx:276` - `.slice()` - Replace with `A.take/A.drop/A.slice`

### plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts (6 violations)
- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts:77` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts:84` - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts:94` - `.push()` - Replace with `A.append(array, item)`
- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts:95` - `.push()` - Replace with `A.append(array, item)`
- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts:118` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts:120` - `.forEach()` - Replace with `A.forEach(array, fn)`

### plugins/AiAssistantPlugin/components/AiActivityIndicator.tsx (3 violations)
- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/AiActivityIndicator.tsx:34` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/AiActivityIndicator.tsx:78` - `.length === 0` - Replace with `A.isEmptyReadonlyArray(array)`
- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/AiActivityIndicator.tsx:80` - `.map()` - Replace with `A.map(array, fn)`

### plugins/AutocompletePlugin/index.tsx (3 violations)
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:63` - `.some()` - Replace with `A.some(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:65` - `.find()` - Replace with `A.findFirst(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:68` - `.filter()` - Replace with `A.filter(array, pred)`

### plugins/CommentPlugin/index.tsx (8 violations)
- [ ] `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx:237` - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx:277` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx:495` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx:501` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx:525` - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx:601` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx:689` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx:834` - `.map()` - Replace with `A.map(array, fn)`

### plugins/ToolbarPlugin/index.tsx (12 violations)
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:149` - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:174` - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:198` - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:839` - `.find()` - Replace with `A.findFirst(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:848` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:878` - `.find()` - Replace with `A.findFirst(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:887` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:913` - `.find()` - Replace with `A.findFirst(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:919` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:1081` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:171` - `.length === 0` - Replace with `A.isEmptyReadonlyArray(array)`
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx:195` - `.length === 0` - Replace with `A.isEmptyReadonlyArray(array)`

### commenting/models.ts (10 violations)
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:178` - `Array.from()` - Replace with `A.fromIterable()`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:289` - `Array.from()` - Replace with `A.fromIterable()`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:298` - `.indexOf()` - Replace with `A.findFirstIndex(array, x => x === value)`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:317` - `.indexOf()` - Replace with `A.findFirstIndex(array, x => x === value)`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:378` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:468` - `.find()` - Replace with `A.findFirst(array, pred)`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:472` - `.slice()` - Replace with `A.copy()`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:473` - `.reverse()` - Replace with `A.reverse()`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:474` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:485` - `.map()` - Replace with `A.map(array, fn)`

### plugins/MarkdownTransformers/index.ts (10 violations)
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:86` - `.find()` - Replace with `A.findFirst(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:86` - `.includes()` - Replace with `A.contains(array, value)`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:163` - `.join()` - Replace with `A.join(array, sep)`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:165` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:165` - `.join()` - Replace with `A.join(array, sep)`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:169` - `.join()` - Replace with `A.join(array, sep)`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:187` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:231` - `.unshift()` - Replace with `A.prepend(array, item)`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:278` - `.map()` - Replace with `A.map(array, fn)`

### plugins/TableHoverActionsV2Plugin/index.tsx (10 violations)
- [ ] `apps/todox/src/app/lexical/plugins/TableHoverActionsV2Plugin/index.tsx:107` - `Array.from()` - Replace with `A.fromIterable()`
- [ ] `apps/todox/src/app/lexical/plugins/TableHoverActionsV2Plugin/index.tsx:318` - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/TableHoverActionsV2Plugin/index.tsx:325` - `.slice()` - Replace with `A.drop(array, 1)`
- [ ] `apps/todox/src/app/lexical/plugins/TableHoverActionsV2Plugin/index.tsx:327` - `.length <= 1` - Handle length comparison
- [ ] `apps/todox/src/app/lexical/plugins/TableHoverActionsV2Plugin/index.tsx:331` - `.sort()` - Replace with `A.sort(array, Order)`
- [ ] `apps/todox/src/app/lexical/plugins/TableHoverActionsV2Plugin/index.tsx:332` - `.indexOf()` - Replace with `A.findFirstIndex()`
- [ ] `apps/todox/src/app/lexical/plugins/TableHoverActionsV2Plugin/index.tsx:333` - `.indexOf()` - Replace with `A.findFirstIndex()`
- [ ] `apps/todox/src/app/lexical/plugins/TableHoverActionsV2Plugin/index.tsx:349` - `.splice()` - Reconstruct immutably

### plugins/TestRecorderPlugin/index.tsx (10 violations)
- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:78` - `.join()` - Replace with `A.join(array, sep)`
- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:108` - `Array.from()` - Replace with `A.fromIterable()`
- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:182` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:182` - `.join()` - Replace with `A.join(array, sep)`
- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:200` - `[...steps.slice()]` - Replace with `A.take()`
- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:204` - `[...steps.slice()]` - Replace with `A.take()`
- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:209` - `[...currentSteps]` - Replace with `A.append()`
- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:225` - `[...key].length` - Replace with `Str.length(key)`
- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:237` - `[...key].length` - Replace with `Str.length(key)`

### plugins/TableScrollShadowPlugin/index.tsx (6 violations)
- [ ] `apps/todox/src/app/lexical/plugins/TableScrollShadowPlugin/index.tsx:49` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/TableScrollShadowPlugin/index.tsx:84` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/TableScrollShadowPlugin/index.tsx:91` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/TableScrollShadowPlugin/index.tsx:92` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/TableScrollShadowPlugin/index.tsx:101` - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/TableScrollShadowPlugin/index.tsx:121` - `.forEach()` - Replace with `A.forEach(array, fn)`

### plugins/MentionsPlugin/index.tsx (6 violations)
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:28` - `.join()` - Replace with `A.join(array, sep)`
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:472` - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:472` - `.includes()` - Replace with `Str.includes()`
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:594` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:595` - `.slice()` - Replace with `A.take(array, n)`
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:635` - `.map()` - Replace with `A.map(array, fn)`

### ui/ColorPicker.tsx (4 violations)
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:120` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:270` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:288` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:331` - `.map()` - Replace with `A.map(array, fn)`

### utils/docSerialization.ts (3 violations)
- [ ] `apps/todox/src/app/lexical/utils/docSerialization.ts:32` - `.push()` - Replace with `A.append()`
- [ ] `apps/todox/src/app/lexical/utils/docSerialization.ts:52` - `.push()` - Replace with `A.append()`
- [ ] `apps/todox/src/app/lexical/utils/docSerialization.ts:162` - `.push()` - Replace with `A.append()`

### Additional Files (from all batches)

#### plugins/AutoEmbedPlugin/index.tsx
- [ ] Line 99 - `.map()` - Replace with `A.map(array, fn)`
- [ ] Line 132 - `.forEach()` - Replace with `A.forEach(array, fn)`
- [ ] Line 162 - `.filter()` - Replace with `A.filter(array, pred)`

#### plugins/DraggableBlockPlugin/index.tsx
- [ ] Line 71 - `.map()` - Replace with `A.map(array, fn)`
- [ ] Line 134 - `.filter()` - Replace with `A.filter(array, pred)`

#### plugins/ComponentPickerPlugin/index.tsx
- [ ] Line 143 - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] Line 145 - `.map()` - Replace with `A.map(array, fn)`
- [ ] Line 146 - `.slice()` - Replace with `A.take(array, n)`
- [ ] Line 404 - `.map()` - Replace with `A.map(array, fn)`
- [ ] Line 438 - `.map()` - Replace with `A.map(array, fn)`

#### plugins/FloatingLinkEditorPlugin/index.tsx
- [ ] Line 73 - `.includes()` - Replace with `A.contains(array, value)`
- [ ] Line 104 - `.map()` - Replace with `A.map(array, fn)`
- [ ] Line 340 - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] Line 341 - `.some()` - Replace with `A.some(array, pred)`
- [ ] Line 358 - `.forEach()` - Replace with `A.forEach(array, fn)`

#### plugins/EmojiPickerPlugin/index.tsx
- [ ] Line 110 - `.map()` - Replace with `A.map(array, fn)`
- [ ] Line 113 - `.filter()` - Replace with `A.filter(array, pred)`
- [ ] Line 117 - `.slice()` - Replace with `A.take(array, n)`
- [ ] Line 148 - `.some()` - Replace with `A.some(array, pred)`
- [ ] Line 156 - `.map()` - Replace with `A.map(array, fn)`

#### plugins/LayoutPlugin/LayoutPlugin.tsx
- [ ] Line 168 - `.every()` - Replace with `A.every(array, pred)`

#### plugins/LayoutPlugin/InsertLayoutDialog.tsx
- [ ] Line 50 - `.map()` - Replace with `A.map(array, fn)`

#### plugins/ShortcutsPlugin/shortcuts.ts
- [ ] Line 64 - `.includes()` - Replace with `A.contains(array, value)`

#### plugins/TableCellResizer/index.tsx
- [ ] Line 85 - `.fill()` - Replace with Effect Array equivalent
- [ ] Line 211 - `.map()` - Replace with `A.map(array, fn)`
- [ ] Line 265 - spread `[...colWidths]` - Handle immutably

#### plugins/TableOfContentsPlugin/index.tsx
- [ ] Line 61 - `.length !== 0` - Replace with `!A.isEmptyReadonlyArray(array)`
- [ ] Line 124 - `.map()` - Replace with `A.map(array, fn)`

#### plugins/VersionsPlugin/index.tsx
- [ ] Line 225 - `.length === 0` - Replace with `A.isEmptyReadonlyArray(array)`
- [ ] Line 234 - `.map()` - Replace with `A.map(array, fn)`

#### plugins/TableActionMenuPlugin/index.tsx
- [ ] Line 241 - `.filter()` - Replace with `A.filter(array, pred)`

#### plugins/TypingPerfPlugin/index.ts
- [ ] Line 42 - `.push()` - Replace with `A.append(array, item)`
- [ ] Line 61 - `.reduce()` - Replace with `A.reduce(array, init, fn)`

#### plugins/ToolbarPlugin/utils.ts
- [ ] Line 111 - `.slice()` - Replace with `Str.slice()` for strings
- [ ] Line 245 - `.forEach()` - Replace with `A.forEach(array, fn)`

#### plugins/ToolbarPlugin/fontSize.tsx
- [ ] Line 66 - `.includes()` - Replace with `A.contains(array, value)`

#### plugins/ToolbarPlugin/components/FontControls.tsx
- [ ] Line 78 - `.slice()` - Replace with `Str.slice()` for strings
- [ ] Line 89 - `.map()` - Replace with `A.map(array, fn)`

#### plugins/AiAssistantPlugin/components/InsertionModeSelector.tsx
- [ ] Line 26 - `.map()` - Replace with `A.map(array, fn)`

#### plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx
- [ ] Line 185 - `.map()` - Replace with `A.map(array, fn)`
- [ ] Line 223 - `.filter()` - Replace with `A.filter(array, pred)`

#### plugins/CollapsiblePlugin/CollapsibleContainerNode.ts
- [ ] Line 66 - `.map()` - Replace with `A.map(array, fn)`
- [ ] Line 70 - `.filter()` - Replace with `A.filter(array, pred)`

---

## Import Pattern

All files need:
```typescript
import * as A from "effect/Array";
```

For sort operations, also add:
```typescript
import * as Order from "effect/Order";
```

For Option handling (findFirst returns Option):
```typescript
import * as O from "effect/Option";
```

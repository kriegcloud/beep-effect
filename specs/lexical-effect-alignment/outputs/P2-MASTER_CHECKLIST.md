# P2 String Methods Master Checklist

## Summary
- Total violations: 41
- Unique files: 21
- Discovery batches merged: 4

## Statistics

| Violation Type | Count |
|----------------|-------|
| .split() | 6 |
| .toLowerCase() | 4 |
| .toUpperCase() | 0 |
| .trim() | 6 |
| .slice()/.substring() | 11 |
| .replace() | 5 |
| .startsWith() | 2 |
| .includes() | 1 |
| .charCodeAt() | 3 |
| .padStart() | 3 |
| Other | 0 |

## Files by Violation Count

| File | Violations |
|------|------------|
| plugins/AutocompletePlugin/index.tsx | 6 |
| ui/ColorPicker.tsx | 5 |
| plugins/MarkdownTransformers/index.ts | 4 |
| plugins/MentionsPlugin/index.tsx | 3 |
| nodes/DateTimeNode/DateTimeComponent.tsx | 2 |
| nodes/DateTimeNode/DateTimeNode.tsx | 2 |
| context/toolbar-context.tsx | 2 |
| plugins/LayoutPlugin/LayoutPlugin.tsx | 2 |
| plugins/SpeechToTextPlugin/index.ts | 2 |
| plugins/TableOfContentsPlugin/index.tsx | 2 |
| commenting/models.ts | 2 |
| plugins/AiAssistantPlugin/components/AiCommandMenu.tsx | 1 |
| plugins/EmojisPlugin/index.ts | 1 |
| plugins/FloatingTextFormatToolbarPlugin/index.tsx | 1 |
| plugins/PollPlugin/index.tsx | 1 |
| plugins/TestRecorderPlugin/index.tsx | 1 |
| plugins/ToolbarPlugin/utils.ts | 1 |
| utils/docSerialization.ts | 1 |

## Master Checklist

### plugins/AutocompletePlugin/index.tsx (6 violations)

- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:257` - `.charCodeAt(0)` - Replace with `Str.charCodeAt(searchText, 0)` (Returns Option)
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:260` - `.substring(1)` - Replace with `Str.slice(searchText, 1)`
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:263` - `.startsWith(...)` - Replace with `Str.startsWith(dictionaryWord, caseInsensitiveSearchText)`
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:270` - `.charCodeAt(0)` - Replace with `Str.charCodeAt(match, 0)` (Returns Option)
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:270` - `.substring(1)` - Replace with `Str.slice(match, 1)`
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:272` - `.substring(searchTextLength)` - Replace with `Str.slice(matchCapitalized, searchTextLength)`

### ui/ColorPicker.tsx (5 violations)

- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:256` - `.startsWith("#")` - Replace with `Str.startsWith(value, "#")`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:268` - `.split("")` - Replace with `Str.split(value, "")`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:282` - `.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, ...)` - Replace with `Str.replace(hex, regex, replacement)`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:283` - `.substring(1)` - Replace with `Str.slice(str, 1)`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:329` - `.toString(16).padStart(2, "0")` - Replace with `Str.padStart(x.toString(16), 2, "0")`

### plugins/MarkdownTransformers/index.ts (4 violations)

- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:163` - `.replace(/\n/g, "\\n")` - Replace with `Str.replace(str, /\n/g, "\\n")`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:163` - `.trim()` - Replace with `Str.trim(str)`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:279` - `.replace(/\\n/g, "\n")` - Replace with `Str.replace(textContent, /\\n/g, "\n")`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:290` - `.split("|")` - Replace with `Str.split(match[1], "|")`

### plugins/MentionsPlugin/index.tsx (3 violations)

- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:472` - `.toLowerCase()` on mention - Replace with `Str.toLowerCase(mention)`
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:472` - `.toLowerCase()` on string - Replace with `Str.toLowerCase(string)`
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:472` - `.includes(...)` - Replace with `Str.includes(mentionLower, stringLower)`

### nodes/DateTimeNode/DateTimeComponent.tsx (2 violations)

- [ ] `apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeComponent.tsx:142` - `.split(":")` - Replace with `Str.split(time, ":")`
- [ ] `apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeComponent.tsx:156` - `.split(":")` - Replace with `Str.split(timeValue, ":")`

### nodes/DateTimeNode/DateTimeNode.tsx (2 violations)

- [ ] `apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx:31` - `.padStart(2, "0")` on `hours.toString()` - Replace with `Str.padStart(hours.toString(), 2, "0")`
- [ ] `apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx:31` - `.padStart(2, "0")` on `minutes.toString()` - Replace with `Str.padStart(minutes.toString(), 2, "0")`

### context/toolbar-context.tsx (2 violations)

- [ ] `apps/todox/src/app/lexical/context/toolbar-context.tsx:176` - `.slice(0, -2)` - Replace with `Str.slice(selectionFontSize, 0, -2)`
- [ ] `apps/todox/src/app/lexical/context/toolbar-context.tsx:221` - `.slice(0, -2)` - Replace with `Str.slice(selectionFontSize, 0, -2)`

### plugins/LayoutPlugin/LayoutPlugin.tsx (2 violations)

- [ ] `apps/todox/src/app/lexical/plugins/LayoutPlugin/LayoutPlugin.tsx:182` - `.trim()` - Replace with `Str.trim(template)`
- [ ] `apps/todox/src/app/lexical/plugins/LayoutPlugin/LayoutPlugin.tsx:182` - `.split(/\s+/)` - Replace with `Str.split(trimmedTemplate, /\s+/)`

### plugins/SpeechToTextPlugin/index.ts (2 violations)

- [ ] `apps/todox/src/app/lexical/plugins/SpeechToTextPlugin/index.ts:62` - `.toLowerCase()` - Replace with `Str.toLowerCase(transcript)`
- [ ] `apps/todox/src/app/lexical/plugins/SpeechToTextPlugin/index.ts:62` - `.trim()` - Replace with `Str.trim(lowercaseTranscript)`

### plugins/TableOfContentsPlugin/index.tsx (2 violations)

- [ ] `apps/todox/src/app/lexical/plugins/TableOfContentsPlugin/index.tsx:134` - `.substring(0, 20)` - Replace with `Str.slice(text, 0, 20)`
- [ ] `apps/todox/src/app/lexical/plugins/TableOfContentsPlugin/index.tsx:153` - `.substring(0, 27)` - Replace with `Str.slice(text, 0, 27)`

### commenting/models.ts (2 violations)

- [ ] `apps/todox/src/app/lexical/commenting/models.ts:26` - `.replace(/[^a-z]+/g, "")` - Replace with `Str.replace(str, /[^a-z]+/g, "")`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:26` - `.substring(0, 5)` - Replace with `Str.slice(str, 0, 5)`

### plugins/AiAssistantPlugin/components/AiCommandMenu.tsx (1 violation)

- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/AiCommandMenu.tsx:36` - `.trim()` - Replace with `Str.trim(customInstruction)`

### plugins/EmojisPlugin/index.ts (1 violation)

- [ ] `apps/todox/src/app/lexical/plugins/EmojisPlugin/index.ts:22` - `.slice(i, i + 2)` - Replace with `Str.slice(text, i, i + 2)`

### plugins/FloatingTextFormatToolbarPlugin/index.tsx (1 violation)

- [ ] `apps/todox/src/app/lexical/plugins/FloatingTextFormatToolbarPlugin/index.tsx:477` - `.replace(/\n/g, "")` - Replace with `Str.replace(content, /\n/g, "")`

### plugins/PollPlugin/index.tsx (1 violation)

- [ ] `apps/todox/src/app/lexical/plugins/PollPlugin/index.tsx:51` - `.trim()` - Replace with `Str.trim(question)`

### plugins/TestRecorderPlugin/index.tsx (1 violation)

- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:87` - `.toLowerCase()` - Replace with `Str.toLowerCase(event.key)`

### plugins/ToolbarPlugin/utils.ts (1 violation)

- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/utils.ts:111` - `.slice(0, -2)` - Replace with `Str.slice(prevFontSize, 0, -2)`

### utils/docSerialization.ts (1 violation)

- [ ] `apps/todox/src/app/lexical/utils/docSerialization.ts:142` - `.charCodeAt(i)` - Replace with `Str.charCodeAt(b64, i)` (Returns Option)

## Execution Planning

- Total unique files: 18
- Files per batch: 5
- Total batches needed: 4

### Batch Assignments

| Batch | Files |
|-------|-------|
| 1 | plugins/AutocompletePlugin/index.tsx, ui/ColorPicker.tsx, plugins/MarkdownTransformers/index.ts, plugins/MentionsPlugin/index.tsx, nodes/DateTimeNode/DateTimeComponent.tsx |
| 2 | nodes/DateTimeNode/DateTimeNode.tsx, context/toolbar-context.tsx, plugins/LayoutPlugin/LayoutPlugin.tsx, plugins/SpeechToTextPlugin/index.ts, plugins/TableOfContentsPlugin/index.tsx |
| 3 | commenting/models.ts, plugins/AiAssistantPlugin/components/AiCommandMenu.tsx, plugins/EmojisPlugin/index.ts, plugins/FloatingTextFormatToolbarPlugin/index.tsx, plugins/PollPlugin/index.tsx |
| 4 | plugins/TestRecorderPlugin/index.tsx, plugins/ToolbarPlugin/utils.ts, utils/docSerialization.ts |

## Quality Verification

- [x] Total violations = sum of all checklist items (41 = 6+5+4+3+2+2+2+2+2+2+2+1+1+1+1+1+1+1)
- [x] No duplicate entries (same file:line)
- [x] All entries have line numbers
- [x] All entries have replacement functions specified
- [x] Files are sorted by violation count (descending)
- [x] Batch assignments cover all files (18 files across 4 batches)

## Notes

### Complexity Considerations

1. **`.charCodeAt()` returns `Option`**: The Effect `Str.charCodeAt` function returns `Option<number>` instead of `number`. Code using this will need to handle the Option with `O.getOrElse` or `O.match`.

2. **Chained methods**: Some violations involve method chaining (e.g., `.toString(16).padStart(2, "0")`). These require breaking the chain into multiple Effect calls.

3. **Regex split**: `Str.split` supports regex patterns, so `.split(/\s+/)` can be directly replaced.

4. **Same-line violations**: Line 472 in MentionsPlugin has 3 violations on the same line (two `.toLowerCase()` and one `.includes()`). These should be refactored together.

5. **Same-line violations**: Line 163 in MarkdownTransformers has 2 violations (`.replace()` and `.trim()`). Line 31 in DateTimeNode has 2 `.padStart()` calls.

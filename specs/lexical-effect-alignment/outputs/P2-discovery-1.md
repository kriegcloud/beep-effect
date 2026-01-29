# P2 String Discovery - Batch 1

## Scope
- `nodes/` and `plugins/A*-F*`

## Summary
- Files scanned: 37
- Violations found: 17
- Unique files with violations: 9

## Checklist

### nodes/DateTimeNode/DateTimeComponent.tsx
- [ ] `apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeComponent.tsx:142` - `.split(":")` - Replace with `Str.split(time, ":")`
- [ ] `apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeComponent.tsx:156` - `.split(":")` - Replace with `Str.split(timeValue, ":")`

### nodes/DateTimeNode/DateTimeNode.tsx
- [ ] `apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx:31` - `.padStart(2, "0")` on `hours.toString()` - Replace with `Str.padStart(hours.toString(), 2, "0")`
- [ ] `apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx:31` - `.padStart(2, "0")` on `minutes.toString()` - Replace with `Str.padStart(minutes.toString(), 2, "0")`

### plugins/AiAssistantPlugin/components/AiCommandMenu.tsx
- [ ] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/AiCommandMenu.tsx:36` - `.trim()` - Replace with `Str.trim(customInstruction)`

### plugins/AutocompletePlugin/index.tsx
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:257` - `.charCodeAt(0)` - Replace with `Str.charCodeAt(searchText, 0)` (Returns Option)
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:260` - `.substring(1)` - Replace with `Str.slice(searchText, 1)`
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:263` - `.startsWith(...)` - Replace with `Str.startsWith(dictionaryWord, caseInsensitiveSearchText)`
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:270` - `.charCodeAt(0)` - Replace with `Str.charCodeAt(match, 0)` (Returns Option)
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:270` - `.substring(1)` - Replace with `Str.slice(match, 1)`
- [ ] `apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx:272` - `.substring(searchTextLength)` - Replace with `Str.slice(matchCapitalized, searchTextLength)`

### plugins/EmojisPlugin/index.ts
- [ ] `apps/todox/src/app/lexical/plugins/EmojisPlugin/index.ts:22` - `.slice(i, i + 2)` - Replace with `Str.slice(text, i, i + 2)`

### plugins/FloatingTextFormatToolbarPlugin/index.tsx
- [ ] `apps/todox/src/app/lexical/plugins/FloatingTextFormatToolbarPlugin/index.tsx:477` - `.replace(/\n/g, "")` - Replace with `Str.replace(content, /\n/g, "")`

### plugins/MarkdownTransformers/index.ts
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:163` - `.replace(/\n/g, "\\n")` - Replace with `Str.replace(str, /\n/g, "\\n")`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:163` - `.trim()` - Replace with `Str.trim(str)`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:279` - `.replace(/\\n/g, "\n")` - Replace with `Str.replace(textContent, /\\n/g, "\n")`
- [ ] `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts:290` - `.split("|")` - Replace with `Str.split(match[1], "|")`

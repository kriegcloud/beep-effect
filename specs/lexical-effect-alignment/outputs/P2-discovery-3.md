# P2 String Discovery - Batch 3

## Scope
- `plugins/N*-Z*`

## Summary
- Files scanned: 34
- Violations found: 7
- Unique files with violations: 5

## Checklist

### plugins/PollPlugin/index.tsx
- [ ] `apps/todox/src/app/lexical/plugins/PollPlugin/index.tsx:51` - `.trim()` - Replace with `Str.trim(question)`

### plugins/SpeechToTextPlugin/index.ts
- [ ] `apps/todox/src/app/lexical/plugins/SpeechToTextPlugin/index.ts:62` - `.toLowerCase()` - Replace with `Str.toLowerCase(transcript)`
- [ ] `apps/todox/src/app/lexical/plugins/SpeechToTextPlugin/index.ts:62` - `.trim()` - Replace with `Str.trim(lowercaseTranscript)`

### plugins/TableOfContentsPlugin/index.tsx
- [ ] `apps/todox/src/app/lexical/plugins/TableOfContentsPlugin/index.tsx:134` - `.substring(0, 20)` - Replace with `Str.slice(text, 0, 20)`
- [ ] `apps/todox/src/app/lexical/plugins/TableOfContentsPlugin/index.tsx:153` - `.substring(0, 27)` - Replace with `Str.slice(text, 0, 27)`

### plugins/TestRecorderPlugin/index.tsx
- [ ] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:87` - `.toLowerCase()` - Replace with `Str.toLowerCase(event.key)`

### plugins/ToolbarPlugin/utils.ts
- [ ] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/utils.ts:111` - `.slice(0, -2)` - Replace with `Str.slice(prevFontSize, 0, -2)`

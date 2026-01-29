# P2 String Discovery - Batch 4

## Scope
- `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, `themes/`, and top-level files

## Summary
- Files scanned: 34
- Violations found: 12
- Unique files with violations: 4

## Checklist

### commenting/models.ts
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:26` - `.replace(/[^a-z]+/g, "")` - Replace with `Str.replace(str, /[^a-z]+/g, "")`
- [ ] `apps/todox/src/app/lexical/commenting/models.ts:26` - `.substring(0, 5)` - Replace with `Str.slice(str, 0, 5)`

### context/toolbar-context.tsx
- [ ] `apps/todox/src/app/lexical/context/toolbar-context.tsx:176` - `.slice(0, -2)` - Replace with `Str.slice(selectionFontSize, 0, -2)`
- [ ] `apps/todox/src/app/lexical/context/toolbar-context.tsx:221` - `.slice(0, -2)` - Replace with `Str.slice(selectionFontSize, 0, -2)`

### ui/ColorPicker.tsx
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:256` - `.startsWith("#")` - Replace with `Str.startsWith(value, "#")`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:268` - `.split("")` - Replace with `Str.split(value, "")`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:282` - `.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, ...)` - Replace with `Str.replace(hex, regex, replacement)`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:283` - `.substring(1)` - Replace with `Str.slice(str, 1)`
- [ ] `apps/todox/src/app/lexical/ui/ColorPicker.tsx:329` - `.toString(16).padStart(2, "0")` - Replace with `Str.padStart(x.toString(16), 2, "0")`

### utils/docSerialization.ts
- [ ] `apps/todox/src/app/lexical/utils/docSerialization.ts:142` - `.charCodeAt(i)` - Replace with `Str.charCodeAt(b64, i)` (Returns Option)

# P2 String Discovery - Batch 2

## Scope
- `plugins/G*-M*`

## Summary
- Files scanned: 9
- Violations found: 5
- Unique files with violations: 3

## Checklist

### plugins/LayoutPlugin/LayoutPlugin.tsx
- [ ] `apps/todox/src/app/lexical/plugins/LayoutPlugin/LayoutPlugin.tsx:182` - `.trim()` - Replace with `Str.trim(template)`
- [ ] `apps/todox/src/app/lexical/plugins/LayoutPlugin/LayoutPlugin.tsx:182` - `.split(/\s+/)` - Replace with `Str.split(trimmedTemplate, /\s+/)`

### plugins/MentionsPlugin/index.tsx
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:472` - `.toLowerCase()` on mention - Replace with `Str.toLowerCase(mention)`
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:472` - `.toLowerCase()` on string - Replace with `Str.toLowerCase(string)`
- [ ] `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx:472` - `.includes(...)` - Replace with `Str.includes(mentionLower, stringLower)`

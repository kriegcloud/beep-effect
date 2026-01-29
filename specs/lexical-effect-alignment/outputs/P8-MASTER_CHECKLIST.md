# P8 Master Checklist - Raw Regex Migration

## Summary

| Metric | Count |
|--------|-------|
| Files requiring migration | 12 |
| Total raw regex patterns | 18 |
| `.match()` patterns | 5 |
| `.test()` patterns | 6 |
| `.exec()` patterns | 7 |
| Already converted (skip) | 11 |

---

## Migration Checklist

### Batch 1 (5 files - Simple Migrations)

#### 1. ColorPicker.tsx
- [ ] **Line 22**: `/^rgb\(\d+, \d+, \d+\)$/.test(input)` → `O.isSome(Str.match(/^rgb\(\d+, \d+, \d+\)$/)(input))`
- [ ] **Line 76**: `/^#[0-9A-Fa-f]{6}$/i.test(hex)` → `O.isSome(Str.match(/^#[0-9A-Fa-f]{6}$/i)(hex))`
- [ ] **Line 287**: `.match(/.{2}/g)` → `Str.match(/.{2}/g)(expanded)` (note: chained after Str.slice)
- **Import needed**: `import * as O from "effect/Option"` if not present

#### 2. ToolbarPlugin/fontSize.tsx
- [ ] **Line 13**: `input.match(/^(\d+(?:\.\d+)?)(px|pt)$/)` → `Str.match(/^(\d+(?:\.\d+)?)(px|pt)$/)(input)`
- **Import needed**: `import * as Str from "effect/String"`

#### 3. TableHoverActionsPlugin/index.tsx
- [ ] **Line 117**: `/^mac/i.test(navigator.platform)` → `O.isSome(Str.match(/^mac/i)(navigator.platform))`
- **Import needed**: `import * as Str from "effect/String"`, `import * as O from "effect/Option"`

#### 4. SpeechToTextPlugin/index.ts
- [ ] **Line 70**: `transcript.match(/\s*\n\s*/)` → `Str.match(/\s*\n\s*/)(transcript)`
- **Import status**: Has `Str` import at line 4 (verified)

#### 5. docSerialization.ts
- [ ] **Line 117**: `/^#doc=(.*)$/.exec(hash)` → `Str.match(/^#doc=(.*)$/)(hash)`
- **Import status**: Has `Str` import (verified)

---

### Batch 2 (4 files - Complex Migrations)

#### 6. KeywordsPlugin/index.ts
- [ ] **Line 28**: `KEYWORDS_REGEX.exec(text)` → `Str.match(KEYWORDS_REGEX)(text)`
- **Import needed**: `import * as Str from "effect/String"`

#### 7. MentionsPlugin/index.tsx
- [ ] **Line 517**: `AtSignMentionsRegex.exec(text)` → `Str.match(AtSignMentionsRegex)(text)`
- [ ] **Line 520**: `AtSignMentionsRegexAliasRegex.exec(text)` → `Str.match(AtSignMentionsRegexAliasRegex)(text)`
- **Import status**: Has `Str` import at line 13 (verified)

#### 8. AutoEmbedPlugin/index.tsx
- [ ] **Line 273**: `URL_MATCHER.exec(inputText)` → `Str.match(URL_MATCHER)(inputText)`
- **Import status**: Has `Str` import at line 1 (verified)

#### 9. MarkdownTransformers/index.ts
- [ ] **Line 189**: `TABLE_ROW_DIVIDER_REG_EXP.test(match[0]!)` → `O.isSome(Str.match(TABLE_ROW_DIVIDER_REG_EXP)(match[0]!))`
- [ ] **Line 289**: `textContent.match(TABLE_ROW_REG_EXP)` → `Str.match(TABLE_ROW_REG_EXP)(textContent)`
- **Import status**: Has `Str` import at line 31 (verified)
- **Import needed**: `import * as O from "effect/Option"`

---

### Batch 3 (3 files - Dynamic Regex)

#### 10. ComponentPickerPlugin/index.tsx
- [ ] **Line 139**: `queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/)` → `Str.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/)(queryString)`
- [ ] **Line 404**: `regex.test(option.title)` (2x in filter) → `O.isSome(Str.match(regex)(option.title))`
- **Import needed**: `import * as Str from "effect/String"`, `import * as O from "effect/Option"`

#### 11. DraggableBlockPlugin/index.tsx
- [ ] **Line 71**: `regex.test(option.title)` (2x in filter) → `O.isSome(Str.match(regex)(option.title))`
- **Import needed**: `import * as Str from "effect/String"`, `import * as O from "effect/Option"`

#### 12. EmojiPickerPlugin/index.tsx
- [ ] **Line 128**: `new RegExp(queryString, "gi").exec(option.title)` → `Str.match(new RegExp(queryString, "gi"))(option.title)`
- [ ] **Line 129**: `new RegExp(queryString, "gi").exec(keyword)` → `Str.match(new RegExp(queryString, "gi"))(keyword)`
- **Import needed**: `import * as Str from "effect/String"`

---

## Already Converted (Reference - DO NOT MIGRATE)

| File | Lines | Pattern |
|------|-------|---------|
| AutoEmbedPlugin/index.tsx | 104, 138, 169 | `Str.match(...)` |
| autocomplete-utils.ts | 7 | `Str.replace(...)` |
| poll-utils.ts | 13 | `Str.replace(...)` |
| FloatingTextFormatToolbarPlugin | 477 | `Str.replace(...)` |
| ColorPicker.tsx | 286 | `Str.replace(...)` |
| commenting/models.ts | 26 | `Str.replace(...)` |
| docSerialization.ts | 99, 132 | `Str.replace(...)` |

---

## Migration Patterns Reference

```typescript
// Before: .match()
str.match(/pattern/)
// After:
Str.match(/pattern/)(str)

// Before: .test()
/pattern/.test(str)
// After:
O.isSome(Str.match(/pattern/)(str))

// Before: .exec()
/pattern/.exec(str)
// After:
Str.match(/pattern/)(str)

// Before: .replace() with regex
str.replace(/pattern/, rep)
// After:
Str.replace(str, /pattern/, rep)
```

---

## Verification Commands

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

---

## Execution Progress

- [x] Batch 1 started
- [x] Batch 1 completed (5 files: ColorPicker, fontSize, TableHoverActions, SpeechToText, docSerialization)
- [x] Batch 2 started
- [x] Batch 2 completed (4 files: KeywordsPlugin, MentionsPlugin, AutoEmbedPlugin, MarkdownTransformers)
- [x] Batch 3 started
- [x] Batch 3 completed (3 files: ComponentPickerPlugin, DraggableBlockPlugin, EmojiPickerPlugin)
- [x] Verification passed (1 fix for TableHoverActionsPlugin curried syntax)

## Phase 8 Complete

**Summary:**
- 12 files migrated
- 18 raw regex patterns replaced with effect/String
- All checks pass (build, check, lint)

# Phase 6 Master Checklist: JSON.parse/stringify Migration

## Summary

- **Total violations**: 11 instances across 6 files
- **JSON.parse**: 6 instances
- **JSON.stringify**: 5 instances

---

## Files to Migrate

| # | File | Violations | Lines | Status |
|---|------|------------|-------|--------|
| 1 | `nodes/PollNode.tsx` | 3 | 52, 87, 168 | ✅ Complete |
| 2 | `nodes/ExcalidrawNode/ExcalidrawComponent.tsx` | 2 | 93, 137 | ✅ Complete |
| 3 | `nodes/DateTimeNode/DateTimeNode.tsx` | 2 | 54, 70 | ⬜ Complete |
| 4 | `plugins/ExcalidrawPlugin/index.tsx` | 1 | 56 | ✅ Complete |
| 5 | `plugins/ImagesPlugin/index.tsx` | 2 | 257, 337 | ✅ Complete |
| 6 | `setupEnv.ts` | 1 | 13 | ✅ Complete |

---

## Detailed Violations

### 1. PollNode.tsx (3 violations)

**Line 52 - JSON.parse (DOM conversion)**
```typescript
O.map(Either.getRight(Either.try(() => JSON.parse(opts))), (parsed) => ({
  node: $createPollNode(q, parseOptions(parsed)),
}))
```
- **Data shape**: `Array<{ text: string; uid: string; votes: string[] }>`
- **Schema needed**: `PollOptionsSchema`

**Line 87 - JSON.stringify (equality comparison)**
```typescript
Either.try({
  try: () => JSON.stringify(a) === JSON.stringify(b),
  catch: () => false,
}).pipe(Either.isRight)
```
- **Note**: Deep equality via stringify is anti-pattern; replace with `Equal.equals` or schema-based comparison

**Line 168 - JSON.stringify (DOM export)**
```typescript
element.setAttribute("data-lexical-poll-options", JSON.stringify(this.getOptions()));
```
- **Schema needed**: Reuse `PollOptionsSchema` for encoding

---

### 2. ExcalidrawComponent.tsx (2 violations)

**Line 93 - JSON.stringify (save data)**
```typescript
node.setData(
  JSON.stringify({
    appState: aps,
    elements: els,
    files: fls,
  })
);
```
- **Data shape**: `{ appState: Partial<AppState>; elements: ExcalidrawInitialElements; files: BinaryFiles }`
- **Schema needed**: `ExcalidrawDataSchema`

**Line 137 - JSON.parse (load data)**
```typescript
Either.getOrElse(
  Either.try(() => JSON.parse(data)),
  () => ({ elements: [], files: {}, appState: {} })
)
```
- **Note**: Silent fallback may hide corruption; use schema validation with proper error handling

---

### 3. DateTimeNode.tsx (2 violations)

**Line 54 - JSON.parse (rich link payload)**
```typescript
O.flatMap(Either.getRight(Either.try(() => JSON.parse(payload))), (parsed) => {
  const parsedDate = Date.parse(parsed?.dat_df?.dfie_dt || "");
  return Number.isNaN(parsedDate) ? O.none() : O.some({ node: $createDateTimeNode(new Date(parsedDate)) });
})
```
- **Data shape**: `{ dat_df: { dfie_dt: string } }` (Google Docs rich link format)
- **Schema needed**: `GoogleRichLinkDateSchema`

**Line 70 - JSON.parse (type check)**
```typescript
O.map(Either.getRight(Either.try(() => JSON.parse(attr))), (parsed) => parsed.type === "date")
```
- **Data shape**: `{ type: string }`
- **Schema needed**: `RichLinkTypeSchema`

---

### 4. ExcalidrawPlugin/index.tsx (1 violation)

**Line 56 - JSON.stringify (save on create)**
```typescript
excalidrawNode.setData(
  JSON.stringify({
    appState,
    elements,
    files,
  })
);
```
- **Note**: Reuse `ExcalidrawDataSchema` from ExcalidrawComponent.tsx

---

### 5. ImagesPlugin/index.tsx (2 violations)

**Line 257 - JSON.stringify (drag data)**
```typescript
dataTransfer.setData(
  "application/x-lexical-drag",
  JSON.stringify({
    data: { altText, caption, height, key, maxWidth, showCaption, src, width },
    type: "image",
  })
);
```
- **Data shape**: `{ type: "image"; data: InsertImagePayload }`
- **Schema needed**: `ImageDragDataSchema`

**Line 337 - JSON.parse (drop handler)**
```typescript
Either.try(() => JSON.parse(data)).pipe(
  Either.flatMap(S.decodeUnknownEither(DragDataSchema)),
  ...
)
```
- **Note**: Already has `DragDataSchema` but uses native JSON.parse first; use `S.parseJson(DragDataSchema)` instead

---

### 6. setupEnv.ts (1 violation)

**Line 13 - JSON.parse (query params)**
```typescript
Either.try(() => JSON.parse(urlSearchParams.get(param) ?? "true")).pipe(
  Either.match({
    onLeft: () => console.warn(`Unable to parse query parameter "${param}"`),
    onRight: (value) => {
      INITIAL_SETTINGS[param as keyof Settings] = Boolean(value);
    },
  })
);
```
- **Data shape**: Boolean or string "true"/"false"
- **Schema needed**: `SettingValueSchema` (simple boolean schema)

---

## Migration Pattern

```typescript
import * as S from "effect/Schema";
import * as Either from "effect/Either";

// Define schema
const MySchema = S.Struct({
  name: S.String,
  value: S.Number,
});

// Parse JSON (decode)
const result = S.decodeUnknownEither(S.parseJson(MySchema))(jsonString);

// Stringify (encode)
const jsonResult = S.encodeUnknownEither(S.parseJson(MySchema))(obj);
```

---

## Batch Execution Plan

### Batch 1 (5 files)
1. ⬜ `nodes/PollNode.tsx`
2. ⬜ `nodes/ExcalidrawNode/ExcalidrawComponent.tsx`
3. ⬜ `nodes/DateTimeNode/DateTimeNode.tsx`
4. ⬜ `plugins/ExcalidrawPlugin/index.tsx`
5. ⬜ `plugins/ImagesPlugin/index.tsx`

### Batch 2 (1 file)
6. ⬜ `setupEnv.ts`

---

## Schemas to Create

| Schema Name | Location | Used By |
|-------------|----------|---------|
| `PollOptionsSchema` | Define in PollNode.tsx | PollNode.tsx |
| `ExcalidrawDataSchema` | Define in ExcalidrawComponent.tsx | ExcalidrawComponent.tsx, ExcalidrawPlugin |
| `GoogleRichLinkDateSchema` | Define in DateTimeNode.tsx | DateTimeNode.tsx |
| `RichLinkTypeSchema` | Define in DateTimeNode.tsx | DateTimeNode.tsx |
| `ImageDragDataSchema` | Extend existing DragDataSchema | ImagesPlugin |
| `SettingValueSchema` | Define in setupEnv.ts | setupEnv.ts |

---

## Verification Commands

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

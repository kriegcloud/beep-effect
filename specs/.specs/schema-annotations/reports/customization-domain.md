# Schema Annotations Audit: @beep/customization-domain

## Summary
- Total Schemas Found: 1
- Annotated: 1
- Missing Annotations: 0

## Findings

This package contains a single schema definition and it is properly annotated.

### Annotated Schemas

| File | Line | Schema | Type | Annotation Method |
|------|------|--------|------|-------------------|
| `src/entities/UserHotkey/UserHotkey.model.ts` | 13 | `Model` (UserHotkeyModel) | M.Class | `$I.annotations("UserHotkeyModel", { description: "..." })` |

## Details

### `Model` (UserHotkeyModel)

**Location:** `src/entities/UserHotkey/UserHotkey.model.ts:13`

The `Model` class uses the proper annotation pattern:
- Uses `$I\`UserHotkeyModel\`` as the first argument to `M.Class`
- Includes `$I.annotations()` with title and description

```typescript
export class Model extends M.Class<Model>($I`UserHotkeyModel`)(
  makeFields(CustomizationEntityIds.UserHotkeyId, {
    userId: SharedEntityIds.UserId,
    shortcuts: M.JsonFromString(S.Record({ key: S.String, value: S.String })),
  }),
  $I.annotations("UserHotkeyModel", {
    description: "UserHotkeyModel model representing user configured hotkeys.",
  })
)
```

## Annotationless Schemas Checklist

No unannotated schemas found in this package.

## Notes

- This package has minimal schema definitions (only one model)
- The other files (`index.ts`, `entities.ts`, `entities/index.ts`) contain only re-exports
- The `value-objects/index.ts` file is empty

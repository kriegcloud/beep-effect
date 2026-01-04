---
name: schema-namespace-annotations
version: 2
created: 2025-12-10T00:00:00Z
iterations: 1
---

# Schema Namespace & Annotations Enhancement - Refined Prompt

## Context

The file `packages/common/schema/src/integrations/files/metadata/types.ts` contains 40+ Effect Schema definitions for audio/video metadata parsing (music-metadata library types). These schemas currently:

1. **Lack namespace exports** for non-class schemas (Kit-based and class extensions)
2. **Have incomplete `$I.annotations()` calls** - some schemas missing annotations entirely
3. **Have properties without description annotations** - many properties lack `.annotations({ description })` calls

The file already imports and uses the `$I` utility:
```typescript
const $I = $SchemaId.create("integrations/files/metadata/types");
```

### Current File Structure
The file is organized into phases with section comments:
```typescript
// =============================================================================
// Phase 1: Enums and Simple Types
// =============================================================================

// =============================================================================
// Phase 2: Simple Data Classes
// =============================================================================
```
**These section comments MUST be preserved.**

## Objective

Transform all schemas in `types.ts` to follow the repository's schema annotation standards:

1. **Add `export declare namespace` declarations** for all non-nominal schemas
2. **Add/enhance `$I.annotations()` calls** on every schema with meaningful descriptions
3. **Add `.annotations({ description })` to every class schema property**

### Success Criteria
- [ ] All 13 Kit-based schemas have namespace exports (see exact list below)
- [ ] All 4 class extension schemas have namespace exports
- [ ] All 2 const schemas have namespace exports
- [ ] Every schema has `$I.annotations()` with at minimum a `description`
- [ ] Every class schema property has `.annotations({ description: "..." })`
- [ ] File passes `bun run check` (type checking)
- [ ] All existing imports preserved
- [ ] JSDoc comments converted to description annotations, then removed

## Non-Goals

Do NOT:
- Add new schemas
- Change schema validation logic or behavior
- Refactor Kit imports or utilities
- Modify the `$I` utility definition or imports
- Change Type/Encoded inference behavior
- Add features beyond annotations and namespace exports

## Role

You are an Effect Schema specialist working on the beep-effect monorepo. You understand:
- Effect Schema patterns and the `S.Class`, `S.Struct`, and transformation APIs
- The `$I` identity utility for generating schema identifiers
- The custom Kit patterns (`LiteralKit`, `StringLiteralKit`, `MappedLiteralKit`)
- TypeScript namespace merging and type extraction patterns

## Constraints

### Required Patterns

**For class schemas (S.Class):**
```typescript
export class IPicture extends S.Class<IPicture>($I`IPicture`)({
  format: S.String.annotations({
    description: "Image mime type"
  }),
  data: S.Uint8ArrayFromSelf.annotations({
    description: "Image data as binary buffer"
  }),
  description: withNullableOption(S.String).annotations({
    description: "Optional textual description of the picture"
  }),
}, $I.annotations("IPicture", {
  description: "Attached picture, typically used for cover art"
})) {}
```

**For class extensions (.extend<>):**
```typescript
export class ILyricsTag extends IComment.extend<ILyricsTag>($I`ILyricsTag`)({
  contentType: LyricsContentTypeNumber.annotations({
    description: "Content type of the lyrics"
  }),
  timeStampFormat: TimestampFormatNumber.annotations({
    description: "Format used for timestamp synchronization"
  }),
  text: withNullableOption(S.String).annotations({
    description: "Un-synchronized lyrics text content"
  }),
  syncText: S.Array(ILyricsText).annotations({
    description: "Synchronized lyrics with timestamps"
  }),
}, $I.annotations("ILyricsTag", {
  description: "Lyrics tag with content type, timestamp format, and synchronized text"
})) {}

export declare namespace ILyricsTag {
  export type Type = typeof ILyricsTag.Type;
  export type Encoded = typeof ILyricsTag.Encoded;
}
```

**For StringLiteralKit schemas:**
```typescript
export class TagType extends StringLiteralKit(
  "vorbis", "ID3v1", "ID3v2.2", "ID3v2.3", "ID3v2.4",
  "APEv2", "asf", "iTunes", "exif", "matroska", "AIFF"
).annotations($I.annotations("TagType", {
  description: "Tag format type identifier for audio metadata"
})) {}

export declare namespace TagType {
  export type Type = typeof TagType.Type;
  export type Encoded = typeof TagType.Encoded;
}
```

**For MappedLiteralKit schemas:**
```typescript
export class AttachedPictureType extends MappedLiteralKit(
  [0, "Other"],
  [1, "32x32 pixels 'file icon' (PNG only)"],
  [2, "Other file icon"],
  [3, "Cover (front)"],
  [4, "Cover (back)"],
  // ... remaining tuples
).annotations($I.annotations("AttachedPictureType", {
  description: "ID3v2 attached picture type mapping from numeric code to description"
})) {}

export declare namespace AttachedPictureType {
  export type Type = typeof AttachedPictureType.Type;
  export type Encoded = typeof AttachedPictureType.Encoded;
}
```

**For LiteralKit schemas:**
```typescript
export class ID3v2MajorVersion extends LiteralKit(2, 3, 4).annotations(
  $I.annotations("ID3v2MajorVersion", {
    description: "ID3v2 major version number (2, 3, or 4)"
  })
) {}

export declare namespace ID3v2MajorVersion {
  export type Type = typeof ID3v2MajorVersion.Type;
  export type Encoded = typeof ID3v2MajorVersion.Encoded;
}
```

**For const schemas (exported with `export const`):**
```typescript
// Const schemas use `export const` instead of `export class`
// They always need namespace exports because they aren't nominal

export const INativeTags = S.Record({
  key: S.String,
  value: S.Array(ITag),
}).annotations($I.annotations("INativeTags", {
  description: "Flat list of tags indexed by tag type"
}));

export declare namespace INativeTags {
  export type Type = S.Schema.Type<typeof INativeTags>;
  export type Encoded = S.Schema.Encoded<typeof INativeTags>;
}
```

### Property Annotation Formatting

**Short properties** - annotation on same line:
```typescript
format: S.String.annotations({ description: "Image mime type" }),
```

**Long properties** - annotation on next line with 2-space indent:
```typescript
data: S.Uint8ArrayFromSelf.annotations({
  description: "Image data as binary buffer from music-metadata library"
}),
```

**Optional/nullable properties** - mention optionality in description:
```typescript
description: withNullableOption(S.String).annotations({
  description: "Optional textual description of the picture"
}),
```

### JSDoc Comment Handling

1. **Convert** existing JSDoc comments to `.annotations({ description })` on the property
2. **Remove** the JSDoc comment after conversion to avoid duplication
3. **Preserve** any JSDoc above the class itself if it contains extra context not suitable for schema description

**Before:**
```typescript
/**
 * Image mime type
 */
format: S.String,
```

**After:**
```typescript
format: S.String.annotations({ description: "Image mime type" }),
```

### Forbidden Patterns

- **NO** schemas without `$I.annotations()` call
- **NO** class properties without `.annotations({ description })`
- **NO** native array methods (use `A.map`, `A.filter` from effect/Array)
- **NO** `any` types or `@ts-ignore` comments
- **NO** removing existing functionality or changing schema behavior
- **NO** keeping redundant JSDoc comments after converting to annotations

### Namespace Export Rules

**Schemas that NEED namespace exports:**
- All `StringLiteralKit` class extensions (7 schemas)
- All `LiteralKit` class extensions (1 schema)
- All `MappedLiteralKit` class extensions (5 schemas)
- All class extensions via `.extend<ExtendedClass>()` (4 schemas)
- All `export const` schema definitions (2 schemas)

**Schemas that do NOT need namespace exports:**
- Direct `S.Class<T>()` definitions (they are nominal and self-typed)

## Resources

### Files to Read
1. `packages/common/schema/src/integrations/files/metadata/types.ts` - Target file
2. `packages/common/schema/src/integrations/files/FileInstance.ts` - Reference for namespace patterns
3. `packages/shared/domain/src/entities/File/schemas/UploadKey.ts` - Reference for complex patterns

### Identity Utility Reference
```typescript
// $I template tag - generates identifier string for S.Class constructor
$I`SchemaName`  // => "@beep/schema/integrations/files/metadata/types/SchemaName"

// $I.annotations() - generates annotation object
$I.annotations("SchemaName", { description: "..." })
// Returns: { schemaId: Symbol, identifier: "SchemaName", title: "Schema Name", description: "..." }
```

## Output Specification

### Deliverable
A single edited `types.ts` file with all schemas enhanced following the patterns above.

### Structure Requirements

1. **Preserve file organization** - Keep all `// ===` section comments intact
2. **Preserve all imports** - Do not modify the import block at the top
3. **Namespace exports immediately follow their schema** - No batching at end of file
4. **Property annotations inline** - Each property gets `.annotations()` per formatting rules above
5. **Remove JSDoc after conversion** - No duplicate documentation

### Example Transformation

**Before:**
```typescript
export class ITag extends S.Class<ITag>($I`ITag`)({
  id: S.String,
  /** AnyTagValue is just `unknown` in source */
  value: S.Unknown,
}) {}
```

**After:**
```typescript
export class ITag extends S.Class<ITag>($I`ITag`)({
  id: S.String.annotations({ description: "Tag identifier" }),
  value: S.Unknown.annotations({
    description: "Tag value - AnyTagValue is just unknown in source"
  }),
}, $I.annotations("ITag", {
  description: "Generic tag structure for metadata key-value pairs"
})) {}
```

## Verification Checklist

- [ ] All 13 Kit schemas have `export declare namespace` with Type/Encoded
- [ ] All 4 class extension schemas have `export declare namespace` with Type/Encoded
- [ ] All 2 const schemas have `export declare namespace` with Type/Encoded
- [ ] All S.Class schemas have `$I.annotations()` as second argument
- [ ] All Kit schemas use `.annotations($I.annotations(...))` pattern
- [ ] All const schemas have `.annotations($I.annotations(...))` and namespace exports
- [ ] Every property in every class schema has `.annotations({ description })`
- [ ] All JSDoc property comments converted and removed
- [ ] All existing imports preserved unchanged
- [ ] All section comments (// ===) preserved
- [ ] File compiles: `bunx tsc --noEmit -p packages/common/schema/tsconfig.json`
- [ ] No behavioral changes to schemas (same Type/Encoded inference)

---

## Metadata

### Research Sources
- **Files explored:**
  - `packages/common/identity/src/packages.ts` - $I utility definition
  - `packages/common/identity/src/Identifier.ts` - TaggedComposer implementation
  - `packages/common/schema/src/derived/kits/literal-kit.ts` - LiteralKit implementation
  - `packages/common/schema/src/derived/kits/string-literal-kit.ts` - StringLiteralKit implementation
  - `packages/common/schema/src/derived/kits/mapped-literal-kit.ts` - MappedLiteralKit implementation
  - `packages/common/schema/AGENTS.md` - Package guidelines

- **Patterns referenced:**
  - `packages/shared/domain/src/entities/File/schemas/UploadKey.ts` - Complex namespace patterns
  - `packages/common/schema/src/primitives/string/phone.ts` - Redacted wrapper pattern

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | 7 issues (2 HIGH, 3 MEDIUM, 2 LOW) | Added MappedLiteralKit example, clarified const schema definition, added JSDoc removal guidance, fixed counts, added Non-Goals section, added property formatting rules, added import preservation requirement |

---

## Quick Reference: Schemas to Modify

### Kit Schemas Needing Namespace (13)

#### StringLiteralKit (7)
| Schema | Current Status |
|--------|----------------|
| `LyricsContentType` | Missing annotations, missing namespace |
| `TimestampFormat` | Missing annotations, missing namespace |
| `FormatId` | Missing annotations, missing namespace |
| `TagType` | Missing annotations, missing namespace |
| `ParserType` | Missing annotations, missing namespace |
| `TrackType` | Missing annotations, missing namespace |
| `MetadataEventType` | Missing annotations, missing namespace |

#### MappedLiteralKit (5)
| Schema | Current Status |
|--------|----------------|
| `AttachedPictureType` | Missing annotations, missing namespace |
| `LyricsContentTypeFromNumber` | Missing annotations, missing namespace |
| `TimestampFormatFromNumber` | Missing annotations, missing namespace |
| `TrackTypeFromNumber` | Missing annotations, missing namespace |
| `DataType` | Missing annotations, missing namespace |

#### LiteralKit (1)
| Schema | Current Status |
|--------|----------------|
| `ID3v2MajorVersion` | Missing annotations, missing namespace |

### Class Extensions Needing Namespace (4)
| Schema | Extends | Current Status |
|--------|---------|----------------|
| `ILyricsTag` | IComment | Has partial annotations (missing second arg), missing namespace |
| `IAudioMetadata` | INativeAudioMetadata | Has partial annotations (missing second arg), missing namespace |
| `IApeHeader` | IOptions | Missing annotations, missing namespace |
| `IPrivateOptions` | IOptions | Missing annotations, missing namespace |

### Const Schemas Needing Namespace (2)
| Schema | Type | Current Status |
|--------|------|----------------|
| `INativeTags` | S.Record | Missing annotations, missing namespace |
| `INativeTagDict` | S.Record | Missing annotations, missing namespace |

### S.Class Schemas Needing Property Annotations

These schemas use `S.Class` directly (no namespace needed) but need:
1. `$I.annotations()` as second constructor argument
2. `.annotations({ description })` on every property

| Schema | Property Count | Notes |
|--------|----------------|-------|
| `IPicture` | 5 | Has class-level annotation, needs property annotations |
| `IRating` | 2 | **Missing class-level annotation entirely** |
| `IComment` | 3 | Needs both class and property annotations |
| `ILyricsText` | 2 | Needs both class and property annotations |
| `IExtendedHeader` | 4 | Needs both class and property annotations |
| `IID3v2header` | 4 | Nested structs - annotate leaf properties |
| `IRatio` | 2 | Needs both class and property annotations |
| `ICommonTagsResult` | 80+ | Large schema - all properties need descriptions |
| `IAudioTrack` | 5 | Needs both class and property annotations |
| `IVideoTrack` | 10 | Needs both class and property annotations |
| `ITag` | 2 | Has some annotations, verify completeness |
| `IParserWarning` | 1 | Needs both class and property annotations |
| `ITagFlags` | 5 | Needs both class and property annotations |
| `IFooter` | 5 | Needs both class and property annotations |
| `IChapter` | 4 | Needs both class and property annotations |
| `ITrackInfo` | 11 | Needs both class and property annotations |
| `IFormat` | 20+ | Large schema - all properties need descriptions |
| `IQualityInformation` | 1 | Needs both class and property annotations |
| `INativeAudioMetadata` | 3 | Needs both class and property annotations |
| `IMetadataEventTag` | 3 | Needs both class and property annotations |
| `IMetadataEvent` | 2 | Needs both class and property annotations |
| `IOptions` | 5 | Needs both class and property annotations |

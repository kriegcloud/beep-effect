# Original Prompt

I need to export a namespace for each schema in @packages/common/schema/src/integrations/files/metadata/types.ts using the following pattern
```ts
class MySchema extends S.String {}

export declare namespace MySchema {
  export type Type = typeof MySchema.Type
  export type Encoded = typeof MySchema.Encoded
}
```

a declared namespace is only needed for schemas which do not extends S.Class or as schema which extends a class schema (MySchema.extend<ExtendedSchema>) as class schemas are nominal.

I Also need to enhance the schema annotations of every schema in @packages/common/schema/src/integrations/files/metadata/types.ts using the `$I` utility following the bellow patterns.

for class schemas:
```ts
export class IPicture extends S.Class<IPicture>($I`IPicture`)({
  /**
   * Image mime type
   */
  format: S.String,
  /**
   * Image data
   */
  data: S.Uint8ArrayFromSelf,
  /**
   * Optional description
   */
  description: withNullableOption(S.String),
  /**
   * Picture type
   */
  type: withNullableOption(S.String),
  /**
   * File name
   */
  name: withNullableOption(S.String),
},
 $I.annotations("IPicture", {
  description: "Attached picture, typically used for cover art"
})
) {}
```

and for non class schemas:
```ts
export class AttachedPictureType extends MappedLiteralKit(
  [0, "Other"],
  [1, "32x32 pixels 'file icon' (PNG only)"],
  [2, "Other file icon"],
  [3, "Cover (front)"],
  [4, "Cover (back)"],
  [5, "Leaflet page"],
  [6, "Media (e.g. label side of CD)"],
  [7, "Lead artist/lead performer/soloist"],
  [8, "Artist/performer"],
  [9, "Conductor"],
  [10, "Band/Orchestra"],
  [11, "Composer"],
  [12, "Lyricist/text writer"],
  [13, "Recording Location"],
  [14, "During recording"],
  [15, "During performance"],
  [16, "Movie/video screen capture"],
  [17, "A bright coloured fish"],
  [18, "Illustration"],
  [19, "Band/artist logotype"],
  [20, "Publisher/Studio logotype"]
).annotations($I.annotations("AttachedPictureType", {
  description: "a very descriptive description"
})) {}
```

LiteralKit, StringLiteralKit & MappedLiteralKit are all custom effect/Schema's which need annotations.

Additionally all class schema properties need description annotations following the bellow pattern:
```ts
{
  id: S.String.annotations({
    description: "Tag identifier"
  }),
  /** AnyTagValue is just `unknown` in source */
  value: S.Unknown.annotations({
    description: "AnyTagValue is just `unknown` in source"
  }),
}
```

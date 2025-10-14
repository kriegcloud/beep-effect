import * as S from "effect/Schema";

const optionalStringArray = S.optional(S.Array(S.String));

export const IconifyAuthorSchema = S.Struct({
  name: S.String,
  url: S.optional(S.String),
});

export const IconifyLicenseSchema = S.Struct({
  title: S.String,
  spdx: S.optional(S.String),
  url: S.optional(S.String),
});

export const IconifyCollectionMetadataSchema = S.Struct(
  {
    name: S.String,
    total: S.Number,
    version: S.optional(S.String),
    author: S.optional(IconifyAuthorSchema),
    license: S.optional(IconifyLicenseSchema),
    samples: optionalStringArray,
    height: S.optional(S.Number),
    displayHeight: S.optional(S.Number),
    category: S.optional(S.String),
    tags: optionalStringArray,
    palette: S.optional(S.Boolean),
    hidden: S.optional(S.Boolean),
  },
  S.Record({
    key: S.String,
    value: S.Unknown,
  })
);

export type IconifyCollectionMetadata = S.Schema.Type<typeof IconifyCollectionMetadataSchema>;

export const IconifyCollectionsResponseSchema = S.Record({
  key: S.String,
  value: IconifyCollectionMetadataSchema,
});

export type IconifyCollectionsResponse = S.Schema.Type<typeof IconifyCollectionsResponseSchema>;

export const IconifyCollectionCategoriesSchema = S.Record({
  key: S.String,
  value: S.Array(S.String),
});

export const IconifyCollectionDetailSchema = S.Struct(
  {
    prefix: S.String,
    total: S.Number,
    title: S.String,
    uncategorized: optionalStringArray,
    hidden: optionalStringArray,
    aliases: S.optional(
      S.Record({
        key: S.String,
        value: S.String,
      })
    ),
    categories: S.optional(IconifyCollectionCategoriesSchema),
  },
  S.Record({
    key: S.String,
    value: S.Unknown,
  })
);

export type IconifyCollectionDetail = S.Schema.Type<typeof IconifyCollectionDetailSchema>;

export const IconifyKeywordsResponseSchema = S.Struct(
  {
    exists: S.Boolean,
    matches: S.Array(S.String),
    prefix: S.optional(S.String),
    icon: S.optional(S.String),
    keyword: S.optional(S.String),
  },
  S.Record({
    key: S.String,
    value: S.Unknown,
  })
);

export type IconifyKeywordsResponse = S.Schema.Type<typeof IconifyKeywordsResponseSchema>;

export const IconifyIconAliasSchema = S.Struct(
  {
    parent: S.String,
    rotate: S.optional(S.Number),
    hFlip: S.optional(S.Boolean),
    vFlip: S.optional(S.Boolean),
    width: S.optional(S.Number),
    height: S.optional(S.Number),
    left: S.optional(S.Number),
    top: S.optional(S.Number),
    inlineHeight: S.optional(S.Number),
    inlineTop: S.optional(S.Number),
    verticalAlign: S.optional(S.Number),
    body: S.optional(S.String),
  },
  S.Record({
    key: S.String,
    value: S.Unknown,
  })
);

export const IconifyIconEntrySchema = S.Struct(
  {
    body: S.String,
    width: S.optional(S.Number),
    height: S.optional(S.Number),
    left: S.optional(S.Number),
    top: S.optional(S.Number),
    rotate: S.optional(S.Number),
    hFlip: S.optional(S.Boolean),
    vFlip: S.optional(S.Boolean),
    inlineHeight: S.optional(S.Number),
    inlineTop: S.optional(S.Number),
    verticalAlign: S.optional(S.Number),
    hidden: S.optional(S.Boolean),
  },
  S.Record({
    key: S.String,
    value: S.Unknown,
  })
);

export type IconifyIconEntry = S.Schema.Type<typeof IconifyIconEntrySchema>;

export const IconifyIconSetSchema = S.Struct(
  {
    prefix: S.String,
    lastModified: S.optional(S.Number),
    width: S.optional(S.Number),
    height: S.optional(S.Number),
    icons: S.Record({
      key: S.String,
      value: IconifyIconEntrySchema,
    }),
    aliases: S.optional(
      S.Record({
        key: S.String,
        value: IconifyIconAliasSchema,
      })
    ),
    chars: S.optional(
      S.Record({
        key: S.String,
        value: S.String,
      })
    ),
  },
  S.Record({
    key: S.String,
    value: S.Unknown,
  })
);

export type IconifyIconSet = S.Schema.Type<typeof IconifyIconSetSchema>;

export const IconifySearchRequestEchoSchema = S.Record({
  key: S.String,
  value: S.String,
});

export const IconifySearchResponseSchema = S.Struct(
  {
    icons: S.Array(S.String),
    total: S.Number,
    limit: S.Number,
    start: S.Number,
    collections: IconifyCollectionsResponseSchema,
    request: IconifySearchRequestEchoSchema,
  },
  S.Record({
    key: S.String,
    value: S.Unknown,
  })
);

export type IconifySearchResponse = S.Schema.Type<typeof IconifySearchResponseSchema>;

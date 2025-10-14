import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import type { ParseError } from "effect/ParseResult";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { IconifyClient } from "./client";
import type {
  IconifyCollectionDetail,
  IconifyCollectionMetadata,
  IconifyCollectionsResponse,
  IconifyIconEntry,
  IconifyIconSet,
  IconifyKeywordsResponse,
  IconifySearchResponse,
} from "./schema";
import {
  IconifyCollectionDetailSchema,
  IconifyCollectionsResponseSchema,
  IconifyIconSetSchema,
  IconifyKeywordsResponseSchema,
  IconifySearchResponseSchema,
} from "./schema";

export class IconifyApiError extends S.TaggedError<IconifyApiError>("IconifyApiError")("IconifyApiError", {
  message: S.String,
}) {
  static readonly is = S.is(IconifyApiError);
}

export interface IconifyCollectionEntry {
  readonly prefix: string;
  readonly metadata: IconifyCollectionMetadata;
}

export interface IconifySearchResult {
  readonly icon: string;
  readonly collection: O.Option<IconifyCollectionMetadata>;
  readonly total: number;
  readonly limit: number;
  readonly start: number;
}

export interface IconifyIconLookup {
  readonly fullName: string;
  readonly prefix: string;
  readonly name: string;
}

export interface IconifyIconPayload {
  readonly lookup: IconifyIconLookup;
  readonly entry: IconifyIconEntry;
  readonly collectionTitle: O.Option<string>;
}

const decodeCollections = (input: unknown): Effect.Effect<IconifyCollectionsResponse, ParseError> =>
  S.decodeUnknown(IconifyCollectionsResponseSchema)(input);

const decodeCollectionDetail = (input: unknown): Effect.Effect<IconifyCollectionDetail, ParseError> =>
  S.decodeUnknown(IconifyCollectionDetailSchema)(input);

const decodeSearchResponse = (input: unknown): Effect.Effect<IconifySearchResponse, ParseError> =>
  S.decodeUnknown(IconifySearchResponseSchema)(input);

const decodeIconSet = (input: unknown): Effect.Effect<IconifyIconSet, ParseError> =>
  S.decodeUnknown(IconifyIconSetSchema)(input);

const decodeKeywords = (input: unknown): Effect.Effect<IconifyKeywordsResponse, ParseError> =>
  S.decodeUnknown(IconifyKeywordsResponseSchema)(input);

export const fetchCollections = Effect.gen(function* () {
  const client = yield* IconifyClient;

  const payload = yield* client.requestJson({
    path: "/collections",
  });

  const decoded = yield* decodeCollections(payload);

  const entries = F.pipe(
    R.toEntries(decoded),
    A.map(([prefix, metadata]) => ({
      prefix,
      metadata,
    })),
    A.sortWith((candidate) => candidate.prefix, Order.string)
  );

  return entries as ReadonlyArray<IconifyCollectionEntry>;
});

export const fetchCollectionDetail = (prefix: string) =>
  Effect.gen(function* () {
    const client = yield* IconifyClient;
    const payload = yield* client.requestJson({
      path: "/collection",
      searchParams: [["prefix", prefix]],
    });
    return yield* decodeCollectionDetail(payload);
  });

export interface SearchIconsOptions {
  readonly query: string;
  readonly limit?: number;
  readonly start?: number;
  readonly prefix?: string;
}

export const searchIcons = ({ query, limit, start, prefix }: SearchIconsOptions) =>
  Effect.gen(function* () {
    const client = yield* IconifyClient;
    const searchParams = F.pipe(
      [] as ReadonlyArray<readonly [string, string]>,
      (params) => (Str.isNonEmpty(query) ? A.append(params, ["query", query] as const) : params),
      (params) => (limit !== undefined ? A.append(params, ["limit", String(limit)] as const) : params),
      (params) => (start !== undefined ? A.append(params, ["start", String(start)] as const) : params),
      (params) =>
        prefix !== undefined && Str.isNonEmpty(prefix) ? A.append(params, ["prefix", prefix] as const) : params
    );

    const payload = yield* client.requestJson({
      path: "/search",
      searchParams,
    });

    const decoded = yield* decodeSearchResponse(payload);

    const collections = decoded.collections;

    const results = F.pipe(
      decoded.icons,
      A.map((icon) => {
        const [iconPrefix] = F.pipe(
          Str.split(":")(icon),
          A.match({
            onEmpty: () => [""] as ReadonlyArray<string>,
            onNonEmpty: (segments) => {
              const [head] = segments;
              return [head];
            },
          })
        );

        const collection = F.pipe(collections, R.get(iconPrefix));

        return {
          icon,
          collection,
          total: decoded.total,
          limit: decoded.limit,
          start: decoded.start,
        } satisfies IconifySearchResult;
      })
    );

    return results as ReadonlyArray<IconifySearchResult>;
  });

const splitIconName = (value: string): O.Option<IconifyIconLookup> =>
  F.pipe(
    Str.trim(value),
    (trimmed) => (Str.isNonEmpty(trimmed) ? Str.split(":")(trimmed) : ([] as ReadonlyArray<string>)),
    A.match({
      onEmpty: () => O.none<IconifyIconLookup>(),
      onNonEmpty: (segments) => {
        const [head, ...tailArray] = segments;
        const tail = tailArray as ReadonlyArray<string>;
        if (Str.isEmpty(head) || A.isEmptyReadonlyArray(tail)) {
          return O.none<IconifyIconLookup>();
        }
        const suffix = A.join(":")(tail);
        if (Str.isEmpty(suffix)) {
          return O.none<IconifyIconLookup>();
        }
        return O.some<IconifyIconLookup>({
          fullName: F.pipe(head, Str.concat(":"), Str.concat(suffix)),
          prefix: head,
          name: suffix,
        });
      },
    })
  );

export const normalizeIconLookups = (
  icons: ReadonlyArray<string>
): Effect.Effect<ReadonlyArray<IconifyIconLookup>, IconifyApiError> =>
  Effect.forEach(
    icons,
    (icon) =>
      F.pipe(
        splitIconName(icon),
        O.match({
          onNone: () =>
            Effect.fail(
              new IconifyApiError({
                message: F.pipe("Invalid icon identifier: " as const, Str.concat(icon)),
              })
            ),
          onSome: (lookup) => Effect.succeed(lookup),
        })
      ),
    { concurrency: "inherit" }
  );

const groupLookupsByPrefix = (
  lookups: ReadonlyArray<IconifyIconLookup>
): HashMap.HashMap<string, ReadonlyArray<IconifyIconLookup>> =>
  F.pipe(
    lookups,
    A.reduce(HashMap.empty<string, ReadonlyArray<IconifyIconLookup>>(), (map, lookup) => {
      const existing = F.pipe(
        HashMap.get(map, lookup.prefix),
        O.getOrElse(() => [] as ReadonlyArray<IconifyIconLookup>)
      );
      const updated = A.append(existing, lookup);
      return HashMap.set(map, lookup.prefix, updated);
    })
  );

const collectGroupedEntries = (
  grouped: HashMap.HashMap<string, ReadonlyArray<IconifyIconLookup>>
): ReadonlyArray<readonly [string, ReadonlyArray<IconifyIconLookup>]> =>
  HashMap.reduce(grouped, [] as ReadonlyArray<readonly [string, ReadonlyArray<IconifyIconLookup>]>, (acc, value, key) =>
    A.append(acc, [key, value] as const)
  );

const payloadsFromIconSet = (
  lookups: ReadonlyArray<IconifyIconLookup>,
  iconSet: IconifyIconSet,
  labelOption: O.Option<string>
): Effect.Effect<ReadonlyArray<IconifyIconPayload>, IconifyApiError> =>
  Effect.forEach(
    lookups,
    (lookup) =>
      F.pipe(
        iconSet.icons,
        R.get(lookup.name),
        O.match({
          onNone: () =>
            Effect.fail(
              new IconifyApiError({
                message: F.pipe("Icon not found in Iconify response: " as const, Str.concat(lookup.fullName)),
              })
            ),
          onSome: (entry) =>
            Effect.succeed({
              lookup,
              entry,
              collectionTitle: labelOption,
            } satisfies IconifyIconPayload),
        })
      ),
    { concurrency: "inherit" }
  );

export const fetchIconPayloads = (icons: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const lookups = yield* normalizeIconLookups(icons);
    if (A.isEmptyReadonlyArray(lookups)) {
      return [] as ReadonlyArray<IconifyIconPayload>;
    }

    const grouped = groupLookupsByPrefix(lookups);
    const pairs = collectGroupedEntries(grouped);
    const client = yield* IconifyClient;

    const fetchResults = yield* Effect.forEach(
      pairs,
      ([prefix, prefixLookups]) =>
        Effect.gen(function* () {
          const iconNames = F.pipe(
            prefixLookups,
            A.map((lookup) => lookup.name),
            A.join(",")
          );

          const payload = yield* client.requestJson({
            path: F.pipe("/", Str.concat(prefix), Str.concat(".json")),
            searchParams: [["icons", iconNames]],
          });

          const iconSet = yield* decodeIconSet(payload);
          const collectionDetail = yield* Effect.orElse(fetchCollectionDetail(prefix), () =>
            Effect.succeed<IconifyCollectionDetail | undefined>(undefined)
          );

          const labelOption = F.pipe(
            collectionDetail,
            O.fromNullable,
            O.map((detail) => detail.title),
            O.filter(Str.isNonEmpty)
          );

          return yield* payloadsFromIconSet(prefixLookups, iconSet, labelOption);
        }),
      { concurrency: "inherit" }
    );

    return F.pipe(
      fetchResults,
      A.flatMap(F.identity),
      A.sortWith((payload) => payload.lookup.fullName, Order.string)
    );
  });

export const fetchIconKeywords = (icon: string) =>
  Effect.gen(function* () {
    const client = yield* IconifyClient;
    const payload = yield* client.requestJson({
      path: "/keywords",
      searchParams: [["icon", icon]],
    });
    return yield* decodeKeywords(payload);
  });

export const fetchIconSet = (prefix: string) =>
  Effect.gen(function* () {
    const client = yield* IconifyClient;
    const payload = yield* client.requestJson({
      path: F.pipe("/", Str.concat(prefix), Str.concat(".json")),
    });
    const normalized = typeof payload === "string" ? Str.trim(payload) : payload;

    if (normalized === 404 || normalized === "404") {
      return yield* Effect.fail(
        new IconifyApiError({
          message: F.pipe("Iconify collection not found for prefix " as const, Str.concat(prefix)),
        })
      );
    }

    return yield* decodeIconSet(payload).pipe(
      Effect.catchAll(() =>
        Effect.fail(
          new IconifyApiError({
            message: F.pipe(
              "Unexpected Iconify response while fetching icon set " as const,
              Str.concat(prefix),
              Str.concat(".")
            ),
          })
        )
      )
    );
  });

/**
 * Schema-first cache configuration models for the Effect Drizzle adapter.
 *
 * @since 0.0.0
 * @module
 */
// cspell:words HEXPIRE exat pxat

import { $SharedServerId } from "@beep/identity";
import { LiteralKit, PosInt } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedServerId.create("factories/effect-drizzle/cache-types");

const HexExpireOption = LiteralKit(["NX", "nx", "XX", "xx", "GT", "gt", "LT", "lt"] as const).annotate(
  $I.annote("HexExpireOption", {
    description: "HEXPIRE strategy option accepted by cache implementations that expose hash-field expiration.",
  })
);

/**
 * Cache-specific TTL and expiration metadata passed through `$withCache(...)`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CacheConfig extends S.Class<CacheConfig>($I`CacheConfig`)(
  {
    ex: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Expire time in seconds.",
    }),
    px: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Expire time in milliseconds.",
    }),
    exat: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Absolute Unix expiration time in seconds.",
    }),
    pxat: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Absolute Unix expiration time in milliseconds.",
    }),
    keepTtl: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Retain any existing TTL on the cache entry.",
    }),
    hexOptions: S.OptionFromOptionalKey(HexExpireOption).annotateKey({
      description: "Optional hash expiration strategy for cache providers that support HEXPIRE semantics.",
    }),
  },
  $I.annote("CacheConfig", {
    description: "Cache-specific TTL and expiration metadata passed through `$withCache(...)`.",
  })
) {}

/**
 * Effect Drizzle cache toggle and metadata configuration.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WithCacheConfig extends S.Class<WithCacheConfig>($I`WithCacheConfig`)(
  {
    enabled: S.Boolean,
    config: S.OptionFromOptionalKey(CacheConfig),
    tag: S.OptionFromOptionalKey(S.String),
    autoInvalidate: S.OptionFromOptionalKey(S.Boolean),
  },
  $I.annote("WithCacheConfig", {
    description: "Effect Drizzle cache toggle and metadata configuration.",
  })
) {}

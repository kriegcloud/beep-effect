import { $KnowledgeServerId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Hash from "effect/Hash";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import type { ParsedOntology } from "./OntologyParser";

const $I = $KnowledgeServerId.create("Ontology/OntologyCache");

interface CachedOntology {
  readonly data: ParsedOntology;
  readonly loadedAt: DateTime.Utc;
  readonly contentHash: string;
}

export interface OntologyCacheShape {
  readonly get: (key: string) => Effect.Effect<O.Option<ParsedOntology>>;
  readonly getIfValid: (key: string, content: string) => Effect.Effect<O.Option<ParsedOntology>>;
  readonly set: (key: string, ontology: ParsedOntology, content: string) => Effect.Effect<CachedOntology>;
  readonly invalidate: (key: string) => Effect.Effect<void>;
  readonly clear: () => Effect.Effect<void>;
  readonly stats: () => Effect.Effect<{ readonly total: number; readonly active: number; readonly expired: number }>;
}

export class OntologyCache extends Context.Tag($I`OntologyCache`)<OntologyCache, OntologyCacheShape>() {}

const serviceEffect: Effect.Effect<OntologyCacheShape> = Effect.gen(function* () {
  const defaultTtl = Duration.minutes(5);

  const cacheRef = yield* Ref.make(HashMap.empty<string, CachedOntology>());

  const isExpired = (loadedAt: DateTime.Utc, now: DateTime.Utc): boolean => {
    const expiresAt = DateTime.addDuration(loadedAt, defaultTtl);
    return DateTime.lessThan(expiresAt, now);
  };

  const hashContent = (content: string): string => `${Hash.string(content)}`;

  return OntologyCache.of({
    get: Effect.fn("OntologyCache.get")((key: string) =>
      Effect.gen(function* () {
        const cache = yield* Ref.get(cacheRef);
        const entry = HashMap.get(cache, key);

        if (O.isNone(entry)) {
          return O.none<ParsedOntology>();
        }

        const now = yield* DateTime.now;
        if (isExpired(entry.value.loadedAt, now)) {
          yield* Ref.update(cacheRef, HashMap.remove(key));
          return O.none<ParsedOntology>();
        }

        return O.some(entry.value.data);
      })
    ),

    getIfValid: Effect.fn("OntologyCache.getIfValid")((key: string, content: string) =>
      Effect.gen(function* () {
        const cache = yield* Ref.get(cacheRef);
        const entry = HashMap.get(cache, key);

        if (O.isNone(entry)) {
          return O.none<ParsedOntology>();
        }

        const now = yield* DateTime.now;
        const currentHash = hashContent(content);

        if (isExpired(entry.value.loadedAt, now) || entry.value.contentHash !== currentHash) {
          yield* Ref.update(cacheRef, HashMap.remove(key));
          return O.none<ParsedOntology>();
        }

        return O.some(entry.value.data);
      })
    ),

    set: Effect.fn("OntologyCache.set")((key: string, ontology: ParsedOntology, content: string) =>
      Effect.gen(function* () {
        const now = yield* DateTime.now;
        const entry: CachedOntology = {
          data: ontology,
          loadedAt: now,
          contentHash: hashContent(content),
        };
        yield* Ref.update(cacheRef, HashMap.set(key, entry));
        return entry;
      })
    ),

    invalidate: Effect.fn("OntologyCache.invalidate")((key: string) => Ref.update(cacheRef, HashMap.remove(key))),

    clear: Effect.fn("OntologyCache.clear")(() => Ref.set(cacheRef, HashMap.empty<string, CachedOntology>())),

    stats: Effect.fn("OntologyCache.stats")(() =>
      Effect.gen(function* () {
        const cache = yield* Ref.get(cacheRef);
        const now = yield* DateTime.now;

        const expired = HashMap.reduce(cache, 0, (acc, entry) => (isExpired(entry.loadedAt, now) ? acc + 1 : acc));
        const total = HashMap.size(cache);

        return {
          total,
          active: total - expired,
          expired,
        };
      })
    ),
  });
});

export const OntologyCacheLive = Layer.effect(OntologyCache, serviceEffect);

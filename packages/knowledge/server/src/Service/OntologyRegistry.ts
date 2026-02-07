import { $KnowledgeServerId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import { Storage } from "./Storage";

const $I = $KnowledgeServerId.create("Service/OntologyRegistry");

export const DEFAULT_ONTOLOGY_REGISTRY_KEY = "ontology/registry.json";

export class OntologyRegistryEntry extends S.Class<OntologyRegistryEntry>($I`OntologyRegistryEntry`)(
  {
    id: S.String,
    iri: S.String,
    storageKey: S.String,
    format: S.optional(S.String),
    title: S.optional(S.String),
    aliases: S.optional(S.Array(S.String)),
  },
  $I.annotations("OntologyRegistryEntry", {
    description: "Single ontology registry entry (id, iri, storage key, optional metadata and aliases).",
  })
) {}

export class OntologyRegistryFile extends S.Class<OntologyRegistryFile>($I`OntologyRegistryFile`)(
  {
    version: S.NonNegativeInt,
    entries: S.Array(OntologyRegistryEntry),
  },
  $I.annotations("OntologyRegistryFile", {
    description: "Ontology registry JSON file payload (schema version + entries array).",
  })
) {}

export class OntologyRegistryNotFoundError extends S.TaggedError<OntologyRegistryNotFoundError>(
  $I`OntologyRegistryNotFoundError`
)(
  "OntologyRegistryNotFoundError",
  {
    registryKey: S.String,
  },
  $I.annotations("OntologyRegistryNotFoundError", {
    description: "Ontology registry file was not found in storage.",
  })
) {}

export class OntologyRegistryParseError extends S.TaggedError<OntologyRegistryParseError>(
  $I`OntologyRegistryParseError`
)(
  "OntologyRegistryParseError",
  {
    registryKey: S.String,
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annotations("OntologyRegistryParseError", {
    description: "Ontology registry file exists but could not be parsed/decoded as JSON with the expected schema.",
  })
) {}

export type OntologyRegistryError = OntologyRegistryNotFoundError | OntologyRegistryParseError;

export class LoadedOntologyRegistry extends S.Class<LoadedOntologyRegistry>($I`LoadedOntologyRegistry`)(
  {
    registryKey: S.String,
    version: S.NonNegativeInt,
    entries: S.Array(OntologyRegistryEntry),
    loadedAt: S.NonNegativeInt,
  },
  $I.annotations("LoadedOntologyRegistry", {
    description: "In-memory loaded ontology registry with load timestamp (derived from the stored JSON file).",
  })
) {}

interface RegistryIndex {
  readonly loaded: LoadedOntologyRegistry;
  readonly byId: ReadonlyMap<string, OntologyRegistryEntry>;
  readonly byIri: ReadonlyMap<string, OntologyRegistryEntry>;
  readonly byAlias: ReadonlyMap<string, OntologyRegistryEntry>;
}

const decodeRegistryFile = S.decodeUnknown(S.parseJson(OntologyRegistryFile));

const normalize = (value: string): string => value.trim().toLowerCase();

const indexRegistry = (loaded: LoadedOntologyRegistry): RegistryIndex => {
  const byId = new Map<string, OntologyRegistryEntry>();
  const byIri = new Map<string, OntologyRegistryEntry>();
  const byAlias = new Map<string, OntologyRegistryEntry>();

  for (const entry of loaded.entries) {
    byId.set(entry.id, entry);
    byIri.set(entry.iri, entry);

    for (const alias of entry.aliases ?? []) {
      const normalizedAlias = normalize(alias);
      if (!byAlias.has(normalizedAlias)) {
        byAlias.set(normalizedAlias, entry);
      }
    }
  }

  return { loaded, byId, byIri, byAlias };
};

export interface OntologyRegistryShape {
  readonly load: (registryKey: string) => Effect.Effect<LoadedOntologyRegistry, OntologyRegistryError>;
  readonly loadDefault: () => Effect.Effect<LoadedOntologyRegistry, OntologyRegistryError>;
  readonly resolve: (token: string) => Effect.Effect<O.Option<OntologyRegistryEntry>, OntologyRegistryError>;
  readonly resolveById: (id: string) => Effect.Effect<O.Option<OntologyRegistryEntry>, OntologyRegistryError>;
  readonly resolveByIri: (iri: string) => Effect.Effect<O.Option<OntologyRegistryEntry>, OntologyRegistryError>;
  readonly resolveByAlias: (alias: string) => Effect.Effect<O.Option<OntologyRegistryEntry>, OntologyRegistryError>;
  readonly all: () => Effect.Effect<ReadonlyArray<OntologyRegistryEntry>, OntologyRegistryError>;
}

export class OntologyRegistry extends Context.Tag($I`OntologyRegistry`)<OntologyRegistry, OntologyRegistryShape>() {}

const serviceEffect: Effect.Effect<OntologyRegistryShape, never, Storage> = Effect.gen(function* () {
  const storage = yield* Storage;
  const indexRef = yield* Ref.make<O.Option<RegistryIndex>>(O.none());

  const load = Effect.fn("OntologyRegistry.load")(function* (registryKey: string) {
    const maybeFile = yield* storage.get(registryKey);
    if (O.isNone(maybeFile)) {
      return yield* new OntologyRegistryNotFoundError({ registryKey });
    }

    const parsed = yield* decodeRegistryFile(maybeFile.value.value).pipe(
      Effect.mapError(
        (cause) =>
          new OntologyRegistryParseError({
            registryKey,
            message: "Registry JSON is invalid or does not match expected schema",
            cause: cause as unknown,
          })
      )
    );

    const loaded = LoadedOntologyRegistry.make({
      registryKey,
      version: parsed.version,
      entries: parsed.entries,
      loadedAt: Date.now(),
    });

    const indexed = indexRegistry(loaded);
    yield* Ref.set(indexRef, O.some(indexed));

    return loaded;
  });

  const loadDefault: OntologyRegistryShape["loadDefault"] = () => load(DEFAULT_ONTOLOGY_REGISTRY_KEY);

  const ensureLoaded = Effect.fn("OntologyRegistry.ensureLoaded")(function* () {
    const cached = yield* Ref.get(indexRef);
    if (O.isSome(cached)) {
      return cached.value;
    }

    yield* loadDefault();
    const reloaded = yield* Ref.get(indexRef);

    if (O.isNone(reloaded)) {
      return yield* Effect.dieMessage("OntologyRegistry invariant violated: index missing after successful load");
    }

    return reloaded.value;
  });

  const resolveById: OntologyRegistryShape["resolveById"] = Effect.fn("OntologyRegistry.resolveById")(function* (id) {
    const indexed = yield* ensureLoaded();
    return O.fromNullable(indexed.byId.get(id));
  });

  const resolveByIri: OntologyRegistryShape["resolveByIri"] = Effect.fn("OntologyRegistry.resolveByIri")(
    function* (iri) {
      const indexed = yield* ensureLoaded();
      return O.fromNullable(indexed.byIri.get(iri));
    }
  );

  const resolveByAlias: OntologyRegistryShape["resolveByAlias"] = Effect.fn("OntologyRegistry.resolveByAlias")(
    function* (alias) {
      const indexed = yield* ensureLoaded();
      return O.fromNullable(indexed.byAlias.get(normalize(alias)));
    }
  );

  const resolve: OntologyRegistryShape["resolve"] = Effect.fn("OntologyRegistry.resolve")(function* (token) {
    const byId = yield* resolveById(token);
    if (O.isSome(byId)) {
      return byId;
    }

    const byIri = yield* resolveByIri(token);
    if (O.isSome(byIri)) {
      return byIri;
    }

    return yield* resolveByAlias(token);
  });

  const all: OntologyRegistryShape["all"] = Effect.fn("OntologyRegistry.all")(function* () {
    const indexed = yield* ensureLoaded();
    return indexed.loaded.entries;
  });

  return OntologyRegistry.of({
    load,
    loadDefault,
    resolve,
    resolveById,
    resolveByIri,
    resolveByAlias,
    all,
  });
});

export const OntologyRegistryLive = Layer.effect(OntologyRegistry, serviceEffect);

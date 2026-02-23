import {
  DEFAULT_ONTOLOGY_REGISTRY_KEY,
  OntologyRegistry,
  OntologyRegistryEntry,
  OntologyRegistryFile,
  OntologyRegistryLive,
  OntologyRegistryNotFoundError,
  OntologyRegistryParseError,
} from "@beep/knowledge-server/Service/OntologyRegistry";
import { Storage, StorageMemoryLive } from "@beep/knowledge-server/Service/Storage";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const OntologyRegistryLayer = Layer.provide(OntologyRegistryLive, StorageMemoryLive);
const ServiceLayer = Layer.merge(StorageMemoryLive, OntologyRegistryLayer);
const encodeRegistryFile = S.encodeSync(S.parseJson(OntologyRegistryFile));

describe("Service/OntologyRegistry", () => {
  effect(
    "loads registry JSON and resolves entries by id, iri, and alias",
    Effect.fn(function* () {
      const storage = yield* Storage;
      const registry = yield* OntologyRegistry;

      yield* storage.put(
        DEFAULT_ONTOLOGY_REGISTRY_KEY,
        encodeRegistryFile(
          OntologyRegistryFile.make({
            version: 1,
            entries: [
              OntologyRegistryEntry.make({
                id: "schema-org",
                iri: "https://schema.org",
                storageKey: "ontology/schema-org.ttl",
                aliases: ["schema", "Schema.org"],
              }),
              OntologyRegistryEntry.make({
                id: "foaf",
                iri: "http://xmlns.com/foaf/0.1/",
                storageKey: "ontology/foaf.ttl",
                aliases: ["friend-of-a-friend"],
              }),
            ],
          })
        )
      );

      const loaded = yield* registry.loadDefault();
      strictEqual(loaded.version, 1);
      strictEqual(loaded.entries.length, 2);

      const byId = yield* registry.resolveById("schema-org");
      assertTrue(O.isSome(byId));
      if (O.isSome(byId)) {
        strictEqual(byId.value.storageKey, "ontology/schema-org.ttl");
      }

      const byIri = yield* registry.resolveByIri("http://xmlns.com/foaf/0.1/");
      assertTrue(O.isSome(byIri));
      if (O.isSome(byIri)) {
        strictEqual(byIri.value.id, "foaf");
      }

      const byAlias = yield* registry.resolveByAlias("SCHEMA");
      assertTrue(O.isSome(byAlias));
      if (O.isSome(byAlias)) {
        strictEqual(byAlias.value.id, "schema-org");
      }

      const resolved = yield* registry.resolve("friend-of-a-friend");
      assertTrue(O.isSome(resolved));
      if (O.isSome(resolved)) {
        strictEqual(resolved.value.id, "foaf");
      }
    }, Effect.provide(ServiceLayer))
  );

  effect(
    "auto-loads default registry when resolve is called before explicit load",
    Effect.fn(function* () {
      const storage = yield* Storage;
      const registry = yield* OntologyRegistry;

      yield* storage.put(
        DEFAULT_ONTOLOGY_REGISTRY_KEY,
        encodeRegistryFile(
          OntologyRegistryFile.make({
            version: 1,
            entries: [
              OntologyRegistryEntry.make({
                id: "dc",
                iri: "http://purl.org/dc/terms/",
                storageKey: "ontology/dc.ttl",
                aliases: ["dublin-core"],
              }),
            ],
          })
        )
      );

      const resolved = yield* registry.resolve("dublin-core");
      assertTrue(O.isSome(resolved));
      if (O.isSome(resolved)) {
        strictEqual(resolved.value.id, "dc");
      }
    }, Effect.provide(ServiceLayer))
  );

  effect(
    "fails with not-found error when registry file does not exist",
    Effect.fn(function* () {
      const registry = yield* OntologyRegistry;

      const result = yield* Effect.either(registry.loadDefault());
      assertTrue(Either.isLeft(result));
      if (Either.isLeft(result)) {
        assertTrue(result.left instanceof OntologyRegistryNotFoundError);
        strictEqual(result.left.registryKey, DEFAULT_ONTOLOGY_REGISTRY_KEY);
      }
    }, Effect.provide(ServiceLayer))
  );

  effect(
    "fails with parse error for invalid registry schema",
    Effect.fn(function* () {
      const storage = yield* Storage;
      const registry = yield* OntologyRegistry;

      yield* storage.put(
        DEFAULT_ONTOLOGY_REGISTRY_KEY,
        // Keep this intentionally invalid to assert the service's decode+error path.
        '{"version":"v1","entries":[]}'
      );

      const result = yield* Effect.either(registry.loadDefault());
      assertTrue(Either.isLeft(result));
      if (Either.isLeft(result)) {
        assertTrue(result.left instanceof OntologyRegistryParseError);
        strictEqual(result.left.registryKey, DEFAULT_ONTOLOGY_REGISTRY_KEY);
      }
    }, Effect.provide(ServiceLayer))
  );
});

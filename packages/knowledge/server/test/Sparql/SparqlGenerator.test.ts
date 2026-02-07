import { IRI, Literal, Quad } from "@beep/knowledge-domain/value-objects";
import { RdfStore } from "@beep/knowledge-server/Rdf";
import { executeSelect } from "@beep/knowledge-server/Sparql/QueryExecutor";
import { SparqlGenerationError, SparqlGenerator } from "@beep/knowledge-server/Sparql/SparqlGenerator";
import { SparqlParser } from "@beep/knowledge-server/Sparql/SparqlParser";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Str from "effect/String";
import { makeSparqlGeneratorLayer } from "../_shared/LayerBuilders";
import { withTextLanguageModel } from "../_shared/TestLayers";

const TEST_TIMEOUT = 60000;

const TestLayer = makeSparqlGeneratorLayer();

describe("SparqlGenerator", () => {
  describe("generateReadOnlyQuery", () => {
    effect(
      "rejects INSERT candidates for NL-to-SPARQL",
      Effect.fn(
        function* () {
          const generator = yield* SparqlGenerator;
          const error = yield* Effect.flip(generator.generateReadOnlyQuery("please insert data", "schema"));

          assertTrue(error instanceof SparqlGenerationError);
          strictEqual(error.attempts, 3);
          assertTrue(Str.includes("Failed to generate parsable read-only SPARQL after 3 attempts")(error.message));
        },
        Effect.provide(TestLayer),
        withTextLanguageModel("INSERT DATA { <http://example.org/a> <http://example.org/p> <http://example.org/b> }")
      ),
      TEST_TIMEOUT
    );

    effect(
      "rejects DELETE candidates for NL-to-SPARQL",
      Effect.fn(
        function* () {
          const generator = yield* SparqlGenerator;
          const error = yield* Effect.flip(generator.generateReadOnlyQuery("please delete data", "schema"));

          assertTrue(error instanceof SparqlGenerationError);
          strictEqual(error.attempts, 3);
        },
        Effect.provide(TestLayer),
        withTextLanguageModel("DELETE WHERE { ?s ?p ?o }")
      ),
      TEST_TIMEOUT
    );

    effect(
      "rejects UPDATE candidates for NL-to-SPARQL",
      Effect.fn(
        function* () {
          const generator = yield* SparqlGenerator;
          const error = yield* Effect.flip(generator.generateReadOnlyQuery("please update data", "schema"));

          assertTrue(error instanceof SparqlGenerationError);
          strictEqual(error.attempts, 3);
        },
        Effect.provide(TestLayer),
        withTextLanguageModel("UPDATE { ?s ?p ?o } WHERE { ?s ?p ?o }")
      ),
      TEST_TIMEOUT
    );

    effect(
      "retries parse failures up to max 3 attempts",
      Effect.fn(
        function* () {
          const generator = yield* SparqlGenerator;
          const error = yield* Effect.flip(generator.generateReadOnlyQuery("broken query", "schema"));

          assertTrue(error instanceof SparqlGenerationError);
          strictEqual(error.attempts, 3);
        },
        Effect.provide(TestLayer),
        withTextLanguageModel("SELECT WHERE {")
      ),
      TEST_TIMEOUT
    );

    effect(
      "generates a read-only SELECT query and executes it successfully",
      Effect.fn(
        function* () {
          const generator = yield* SparqlGenerator;
          const parser = yield* SparqlParser;
          const store = yield* RdfStore;

          yield* store.clear();
          yield* store.addQuad(
            new Quad({
              subject: IRI.make("http://example.org/alice"),
              predicate: IRI.make("http://example.org/name"),
              object: new Literal({ value: "Alice" }),
            })
          );

          const generated = yield* generator.generateReadOnlyQuery("who is in graph", "schema");
          strictEqual(generated.attempts, 1);

          const parsed = yield* parser.parse(generated.query);
          strictEqual(parsed.query.queryType, "SELECT");

          if (!(parsed.ast.type === "query" && parsed.ast.queryType === "SELECT")) {
            return yield* Effect.die("Expected SELECT query from generator");
          }

          const result = yield* executeSelect(parsed.ast, store);
          strictEqual(result.rows.length, 1);
          strictEqual(result.columns.length, 1);
          strictEqual(result.columns[0], "name");
          strictEqual(result.rows[0]?.[0]?.name, "name");
          assertTrue(result.rows[0]?.[0]?.value instanceof Literal);
        },
        Effect.provide(TestLayer),
        withTextLanguageModel("SELECT ?name WHERE { ?s <http://example.org/name> ?name } LIMIT 1")
      ),
      TEST_TIMEOUT
    );
  });
});

/**
 * SparqlService integration tests
 *
 * Tests SPARQL query execution against an in-memory RDF store.
 *
 * @module knowledge-server/test/Sparql/SparqlService.test
 * @since 0.1.0
 */

import type * as sparqljs from "sparqljs";
import { SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";
import { Literal, makeIRI, Quad, type SparqlBinding, SparqlBindings } from "@beep/knowledge-domain/value-objects";
import { RdfStore } from "@beep/knowledge-server/Rdf";
import { executeAsk, executeConstruct, executeSelect, SparqlParser, SparqlService } from "@beep/knowledge-server/Sparql";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

/**
 * Type guards for query types
 */
const isSelectQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.SelectQuery =>
  ast.type === "query" && ast.queryType === "SELECT";

const isConstructQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.ConstructQuery =>
  ast.type === "query" && ast.queryType === "CONSTRUCT";

const isAskQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.AskQuery =>
  ast.type === "query" && ast.queryType === "ASK";

const getQueryTypeString = (ast: sparqljs.SparqlQuery): string =>
  ast.type === "update" ? "UPDATE" : ast.queryType;

/**
 * Manually build SparqlService that uses external RdfStore and Parser.
 * This allows tests to access the same RdfStore instance for adding test data.
 */
const sparqlServiceLayer = Layer.effect(
  SparqlService,
  Effect.gen(function* () {
    const parser = yield* SparqlParser;
    const store = yield* RdfStore;

    return {
      select: (queryString: string) =>
        Effect.gen(function* () {
          const { ast } = yield* parser.parse(queryString);
          if (!isSelectQuery(ast)) {
            return yield* new SparqlUnsupportedFeatureError({
              feature: `non-SELECT query`,
              queryString,
              message: `Expected SELECT query but got ${getQueryTypeString(ast)}`,
            });
          }
          return yield* executeSelect(ast, store);
        }),

      construct: (queryString: string) =>
        Effect.gen(function* () {
          const { ast } = yield* parser.parse(queryString);
          if (!isConstructQuery(ast)) {
            return yield* new SparqlUnsupportedFeatureError({
              feature: `non-CONSTRUCT query`,
              queryString,
              message: `Expected CONSTRUCT query but got ${getQueryTypeString(ast)}`,
            });
          }
          return yield* executeConstruct(ast, store);
        }),

      ask: (queryString: string) =>
        Effect.gen(function* () {
          const { ast } = yield* parser.parse(queryString);
          if (!isAskQuery(ast)) {
            return yield* new SparqlUnsupportedFeatureError({
              feature: `non-ASK query`,
              queryString,
              message: `Expected ASK query but got ${getQueryTypeString(ast)}`,
            });
          }
          return yield* executeAsk(ast, store);
        }),

      query: (queryString: string) =>
        Effect.gen(function* () {
          const { ast } = yield* parser.parse(queryString);
          if (isSelectQuery(ast)) {
            return yield* executeSelect(ast, store);
          }
          if (isConstructQuery(ast)) {
            return yield* executeConstruct(ast, store);
          }
          if (isAskQuery(ast)) {
            return yield* executeAsk(ast, store);
          }
          return yield* new SparqlUnsupportedFeatureError({
            feature: `${getQueryTypeString(ast)} queries`,
            queryString,
            message: `${getQueryTypeString(ast)} queries are not supported`,
          });
        }),
    } as SparqlService;
  })
);

/**
 * Test layer that provides SparqlService with fresh RdfStore per test.
 * Each effect() call with Effect.provide(TestLayer) creates a fresh layer instance.
 */
const TestLayer = Layer.provideMerge(
  sparqlServiceLayer,
  Layer.merge(RdfStore.Default, SparqlParser.Default)
);

/**
 * Helper: Add test data to store
 */
const addTestData = (quads: ReadonlyArray<Quad>) =>
  Effect.gen(function* () {
    const store = yield* RdfStore;
    yield* store.addQuads(quads);
  });

/**
 * Helper: Create Person quads
 */
const createPersonQuads = (id: string, name: string, age?: number): ReadonlyArray<Quad> => {
  const subject = makeIRI(`http://example.org/${id}`);
  const rdfType = makeIRI("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  const personType = makeIRI("http://example.org/Person");
  const namePred = makeIRI("http://example.org/name");
  const agePred = makeIRI("http://example.org/age");

  const quads: Quad[] = [
    new Quad({ subject, predicate: rdfType, object: personType }),
    new Quad({ subject, predicate: namePred, object: new Literal({ value: name }) }),
  ];

  if (age !== undefined) {
    quads.push(
      new Quad({
        subject,
        predicate: agePred,
        object: new Literal({
          value: String(age),
          datatype: makeIRI("http://www.w3.org/2001/XMLSchema#integer"),
        }),
      })
    );
  }

  return quads;
};

/**
 * Helper: Create knows relationship quad
 */
const createKnowsQuad = (fromId: string, toId: string): Quad =>
  new Quad({
    subject: makeIRI(`http://example.org/${fromId}`),
    predicate: makeIRI("http://example.org/knows"),
    object: makeIRI(`http://example.org/${toId}`),
  });

/**
 * Helper: Find binding value for a variable in a row
 */
const findBinding = (bindings: SparqlBindings, rowIndex: number, varName: string): O.Option<string> => {
  const row = A.get(bindings.rows, rowIndex);
  if (O.isNone(row)) return O.none();

  const binding = A.findFirst(row.value, (b: SparqlBinding) => b.name === varName);
  if (O.isNone(binding)) return O.none();

  const term = binding.value.value;
  // Check if term is a Literal (object with value property) vs IRI/BlankNode (branded string)
  if (typeof term === "object" && term !== null && "value" in term) {
    return O.some((term as Literal).value);
  }
  // IRI or BlankNode - branded strings
  return O.some(term as string);
};

describe("SparqlService", () => {
  describe("select - single pattern", () => {
    effect("should return bindings for simple type query", () =>
      Effect.gen(function* () {
        yield* addTestData([...createPersonQuads("alice", "Alice", 30), ...createPersonQuads("bob", "Bob", 25)]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s WHERE {
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person>
          }
        `);

        strictEqual(A.length(result.columns), 1);
        strictEqual(A.unsafeGet(result.columns, 0), "s");
        strictEqual(A.length(result.rows), 2);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should return empty bindings when no matches", () =>
      Effect.gen(function* () {
        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s WHERE {
            ?s <http://example.org/nonexistent> ?o
          }
        `);

        strictEqual(A.length(result.rows), 0);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("select - multiple patterns (join)", () => {
    effect("should join patterns and return combined bindings", () =>
      Effect.gen(function* () {
        yield* addTestData([...createPersonQuads("alice", "Alice", 30), ...createPersonQuads("bob", "Bob", 25)]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?name WHERE {
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person> .
            ?s <http://example.org/name> ?name
          }
        `);

        strictEqual(A.length(result.columns), 2);
        assertTrue(A.contains(result.columns, "s"));
        assertTrue(A.contains(result.columns, "name"));
        strictEqual(A.length(result.rows), 2);

        // Check that names are bound correctly
        const names = A.filterMap(result.rows, (row: ReadonlyArray<SparqlBinding>) => {
          const nameBinding = A.findFirst(row, (b: SparqlBinding) => b.name === "name");
          return O.map(nameBinding, (b: SparqlBinding) => (b.value instanceof Literal ? b.value.value : ""));
        });
        assertTrue(A.contains(names, "Alice"));
        assertTrue(A.contains(names, "Bob"));
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle join with no matches", () =>
      Effect.gen(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?other WHERE {
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person> .
            ?s <http://example.org/knows> ?other
          }
        `);

        strictEqual(A.length(result.rows), 0);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("select - FILTER", () => {
    effect("should filter results with equality", () =>
      Effect.gen(function* () {
        yield* addTestData([...createPersonQuads("alice", "Alice"), ...createPersonQuads("bob", "Bob")]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?name WHERE {
            ?s <http://example.org/name> ?name .
            FILTER(?name = "Alice")
          }
        `);

        strictEqual(A.length(result.rows), 1);
        const name = findBinding(result, 0, "name");
        assertTrue(O.isSome(name));
        strictEqual(O.getOrThrow(name), "Alice");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should filter results with inequality", () =>
      Effect.gen(function* () {
        yield* addTestData([...createPersonQuads("alice", "Alice"), ...createPersonQuads("bob", "Bob")]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?name WHERE {
            ?s <http://example.org/name> ?name .
            FILTER(?name != "Alice")
          }
        `);

        strictEqual(A.length(result.rows), 1);
        const name = findBinding(result, 0, "name");
        assertTrue(O.isSome(name));
        strictEqual(O.getOrThrow(name), "Bob");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should filter results with numeric comparison", () =>
      Effect.gen(function* () {
        yield* addTestData([...createPersonQuads("alice", "Alice", 30), ...createPersonQuads("bob", "Bob", 25)]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?age WHERE {
            ?s <http://example.org/age> ?age .
            FILTER(?age > 27)
          }
        `);

        strictEqual(A.length(result.rows), 1);
        const age = findBinding(result, 0, "age");
        assertTrue(O.isSome(age));
        strictEqual(O.getOrThrow(age), "30");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should filter results with regex", () =>
      Effect.gen(function* () {
        yield* addTestData([...createPersonQuads("alice", "Alice"), ...createPersonQuads("bob", "Bob")]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?name WHERE {
            ?s <http://example.org/name> ?name .
            FILTER(regex(?name, "^A"))
          }
        `);

        strictEqual(A.length(result.rows), 1);
        const name = findBinding(result, 0, "name");
        assertTrue(O.isSome(name));
        strictEqual(O.getOrThrow(name), "Alice");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should filter results with case-insensitive regex", () =>
      Effect.gen(function* () {
        yield* addTestData([...createPersonQuads("alice", "Alice"), ...createPersonQuads("bob", "Bob")]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?name WHERE {
            ?s <http://example.org/name> ?name .
            FILTER(regex(?name, "^a", "i"))
          }
        `);

        strictEqual(A.length(result.rows), 1);
        const name = findBinding(result, 0, "name");
        assertTrue(O.isSome(name));
        strictEqual(O.getOrThrow(name), "Alice");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle bound() function", () =>
      Effect.gen(function* () {
        // Create data where alice has age but bob doesn't
        yield* addTestData([...createPersonQuads("alice", "Alice", 30), ...createPersonQuads("bob", "Bob")]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?name WHERE {
            ?s <http://example.org/name> ?name .
            OPTIONAL { ?s <http://example.org/age> ?age }
            FILTER(bound(?age))
          }
        `);

        strictEqual(A.length(result.rows), 1);
        const name = findBinding(result, 0, "name");
        assertTrue(O.isSome(name));
        strictEqual(O.getOrThrow(name), "Alice");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle !bound() function", () =>
      Effect.gen(function* () {
        yield* addTestData([...createPersonQuads("alice", "Alice", 30), ...createPersonQuads("bob", "Bob")]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?name WHERE {
            ?s <http://example.org/name> ?name .
            OPTIONAL { ?s <http://example.org/age> ?age }
            FILTER(!bound(?age))
          }
        `);

        strictEqual(A.length(result.rows), 1);
        const name = findBinding(result, 0, "name");
        assertTrue(O.isSome(name));
        strictEqual(O.getOrThrow(name), "Bob");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle isIRI() function", () =>
      Effect.gen(function* () {
        yield* addTestData([
          ...createPersonQuads("alice", "Alice"),
          createKnowsQuad("alice", "bob"),
          ...createPersonQuads("bob", "Bob"),
        ]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?o WHERE {
            ?s <http://example.org/knows> ?o .
            FILTER(isIRI(?o))
          }
        `);

        strictEqual(A.length(result.rows), 1);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle isLiteral() function", () =>
      Effect.gen(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?name WHERE {
            ?s <http://example.org/name> ?name .
            FILTER(isLiteral(?name))
          }
        `);

        strictEqual(A.length(result.rows), 1);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle && (logical and)", () =>
      Effect.gen(function* () {
        yield* addTestData([
          ...createPersonQuads("alice", "Alice", 30),
          ...createPersonQuads("bob", "Bob", 25),
          ...createPersonQuads("charlie", "Charlie", 35),
        ]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?age WHERE {
            ?s <http://example.org/age> ?age .
            FILTER(?age > 27 && ?age < 33)
          }
        `);

        strictEqual(A.length(result.rows), 1);
        const age = findBinding(result, 0, "age");
        assertTrue(O.isSome(age));
        strictEqual(O.getOrThrow(age), "30");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle || (logical or)", () =>
      Effect.gen(function* () {
        yield* addTestData([
          ...createPersonQuads("alice", "Alice", 30),
          ...createPersonQuads("bob", "Bob", 25),
          ...createPersonQuads("charlie", "Charlie", 35),
        ]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?age WHERE {
            ?s <http://example.org/age> ?age .
            FILTER(?age < 26 || ?age > 33)
          }
        `);

        strictEqual(A.length(result.rows), 2);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("select - modifiers", () => {
    effect("should handle LIMIT", () =>
      Effect.gen(function* () {
        yield* addTestData([
          ...createPersonQuads("alice", "Alice"),
          ...createPersonQuads("bob", "Bob"),
          ...createPersonQuads("charlie", "Charlie"),
        ]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s WHERE {
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person>
          }
          LIMIT 2
        `);

        strictEqual(A.length(result.rows), 2);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle OFFSET", () =>
      Effect.gen(function* () {
        yield* addTestData([
          ...createPersonQuads("alice", "Alice"),
          ...createPersonQuads("bob", "Bob"),
          ...createPersonQuads("charlie", "Charlie"),
        ]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s WHERE {
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person>
          }
          OFFSET 1
        `);

        strictEqual(A.length(result.rows), 2);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle LIMIT with OFFSET", () =>
      Effect.gen(function* () {
        yield* addTestData([
          ...createPersonQuads("alice", "Alice"),
          ...createPersonQuads("bob", "Bob"),
          ...createPersonQuads("charlie", "Charlie"),
        ]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s WHERE {
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person>
          }
          LIMIT 1
          OFFSET 1
        `);

        strictEqual(A.length(result.rows), 1);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle DISTINCT", () =>
      Effect.gen(function* () {
        // Add duplicate type assertions
        const alice = makeIRI("http://example.org/alice");
        const rdfType = makeIRI("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
        const person = makeIRI("http://example.org/Person");
        const employee = makeIRI("http://example.org/Employee");

        yield* addTestData([
          new Quad({ subject: alice, predicate: rdfType, object: person }),
          new Quad({ subject: alice, predicate: rdfType, object: employee }),
        ]);

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT DISTINCT ?s WHERE {
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type
          }
        `);

        strictEqual(A.length(result.rows), 1);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("construct", () => {
    effect("should construct new quads from pattern", () =>
      Effect.gen(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.construct(`
          CONSTRUCT {
            ?s <http://example.org/displayName> ?name
          }
          WHERE {
            ?s <http://example.org/name> ?name
          }
        `);

        strictEqual(A.length(result), 1);
        const quad = A.unsafeGet(result, 0);
        strictEqual(quad.predicate, "http://example.org/displayName");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should return empty array when no matches", () =>
      Effect.gen(function* () {
        const sparql = yield* SparqlService;
        const result = yield* sparql.construct(`
          CONSTRUCT {
            ?s <http://example.org/displayName> ?name
          }
          WHERE {
            ?s <http://example.org/nonexistent> ?name
          }
        `);

        strictEqual(A.length(result), 0);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("ask", () => {
    effect("should return true when pattern matches", () =>
      Effect.gen(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.ask(`
          ASK {
            ?s <http://example.org/name> "Alice"
          }
        `);

        strictEqual(result, true);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should return false when pattern doesn't match", () =>
      Effect.gen(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.ask(`
          ASK {
            ?s <http://example.org/name> "Bob"
          }
        `);

        strictEqual(result, false);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("query (generic)", () => {
    effect("should execute SELECT query via generic query method", () =>
      Effect.gen(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.query(`
          SELECT ?s WHERE { ?s <http://example.org/name> "Alice" }
        `);

        // Result should be SparqlBindings
        assertTrue(result instanceof SparqlBindings);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should execute ASK query via generic query method", () =>
      Effect.gen(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.query(`
          ASK { ?s <http://example.org/name> "Alice" }
        `);

        // Result should be boolean
        strictEqual(typeof result, "boolean");
        strictEqual(result, true);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should execute CONSTRUCT query via generic query method", () =>
      Effect.gen(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.query(`
          CONSTRUCT { ?s <http://example.org/hasName> ?name }
          WHERE { ?s <http://example.org/name> ?name }
        `);

        // Result should be array of quads
        assertTrue(Array.isArray(result));
        strictEqual(A.length(result as ReadonlyArray<Quad>), 1);
      }).pipe(Effect.provide(TestLayer))
    );
  });

  describe("error handling", () => {
    effect("should fail on syntax error", () =>
      Effect.gen(function* () {
        const sparql = yield* SparqlService;
        const result = yield* Effect.either(
          sparql.select(`
            SELECT ?s WHERE { INVALID SYNTAX }
          `)
        );

        assertTrue(result._tag === "Left");
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should fail on unsupported query type", () =>
      Effect.gen(function* () {
        const sparql = yield* SparqlService;
        const result = yield* Effect.either(
          sparql.select(`
            ASK { ?s ?p ?o }
          `)
        );

        assertTrue(result._tag === "Left");
        if (result._tag === "Left") {
          assertTrue(result.left instanceof SparqlUnsupportedFeatureError);
        }
      }).pipe(Effect.provide(TestLayer))
    );
  });
});

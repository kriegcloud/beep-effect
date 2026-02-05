import { SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";
import { IRI, Literal, Quad, type SparqlBinding, SparqlBindings } from "@beep/knowledge-domain/value-objects";
import { RdfStore, RdfStoreLive } from "@beep/knowledge-server/Rdf";
import {
  executeAsk,
  executeConstruct,
  executeSelect,
  SparqlParser,
  SparqlParserLive,
  SparqlService,
  type SparqlServiceShape,
} from "@beep/knowledge-server/Sparql";
import { assertTrue, describe, layer, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import type * as sparqljs from "sparqljs";

const isSelectQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.SelectQuery =>
  ast.type === "query" && ast.queryType === "SELECT";

const isConstructQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.ConstructQuery =>
  ast.type === "query" && ast.queryType === "CONSTRUCT";

const isAskQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.AskQuery =>
  ast.type === "query" && ast.queryType === "ASK";

const getQueryTypeString = (ast: sparqljs.SparqlQuery): string => (ast.type === "update" ? "UPDATE" : ast.queryType);

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
    } as SparqlServiceShape;
  })
);

const TestLayer = Layer.provideMerge(sparqlServiceLayer, Layer.merge(RdfStoreLive, SparqlParserLive));

const addTestData = Effect.fn(function* (quads: ReadonlyArray<Quad>) {
  const store = yield* RdfStore;
  yield* store.clear();
  yield* store.addQuads(quads);
});

const createPersonQuads = (id: string, name: string, age?: number): ReadonlyArray<Quad> => {
  const subject = IRI.make(`http://example.org/${id}`);
  const rdfType = IRI.make("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  const personType = IRI.make("http://example.org/Person");
  const namePred = IRI.make("http://example.org/name");
  const agePred = IRI.make("http://example.org/age");

  const baseQuads: ReadonlyArray<Quad> = [
    new Quad({ subject, predicate: rdfType, object: personType }),
    new Quad({ subject, predicate: namePred, object: new Literal({ value: name }) }),
  ];

  if (age !== undefined) {
    return A.append(
      baseQuads,
      new Quad({
        subject,
        predicate: agePred,
        object: new Literal({
          value: String(age),
          datatype: IRI.make("http://www.w3.org/2001/XMLSchema#integer"),
        }),
      })
    );
  }

  return baseQuads;
};

const createKnowsQuad = (fromId: string, toId: string): Quad =>
  new Quad({
    subject: IRI.make(`http://example.org/${fromId}`),
    predicate: IRI.make("http://example.org/knows"),
    object: IRI.make(`http://example.org/${toId}`),
  });

const findBinding = (bindings: SparqlBindings, rowIndex: number, varName: string): O.Option<string> => {
  const row = A.get(bindings.rows, rowIndex);
  if (O.isNone(row)) return O.none();

  const binding = A.findFirst(row.value, (b: SparqlBinding) => b.name === varName);
  if (O.isNone(binding)) return O.none();

  const term = binding.value.value;
  if (Literal.is(term)) {
    return O.some(term.value);
  }
  return O.some(term);
};

describe("SparqlService", () => {
  layer(TestLayer, { timeout: Duration.seconds(30) })("select - single pattern", (it) => {
    it.effect(
      "should return bindings for simple type query",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should return empty bindings when no matches",
      Effect.fn(function* () {
        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s WHERE {
            ?s <http://example.org/nonexistent> ?o
          }
        `);

        strictEqual(A.length(result.rows), 0);
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("select - multiple patterns (join)", (it) => {
    it.effect(
      "should join patterns and return combined bindings",
      Effect.fn(function* () {
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

        const names = A.filterMap(result.rows, (row: ReadonlyArray<SparqlBinding>) => {
          const nameBinding = A.findFirst(row, (b: SparqlBinding) => b.name === "name");
          return O.map(nameBinding, (b: SparqlBinding) => (Literal.is(b.value) ? b.value.value : ""));
        });
        assertTrue(A.contains(names, "Alice"));
        assertTrue(A.contains(names, "Bob"));
      })
    );

    it.effect(
      "should handle join with no matches",
      Effect.fn(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?other WHERE {
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person> .
            ?s <http://example.org/knows> ?other
          }
        `);

        strictEqual(A.length(result.rows), 0);
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("select - FILTER", (it) => {
    it.effect(
      "should filter results with equality",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should filter results with inequality",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should filter results with numeric comparison",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should filter results with regex",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should filter results with case-insensitive regex",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should handle bound() function",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should handle !bound() function",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should handle isIRI() function",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should handle isLiteral() function",
      Effect.fn(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.select(`
          SELECT ?s ?name WHERE {
            ?s <http://example.org/name> ?name .
            FILTER(isLiteral(?name))
          }
        `);

        strictEqual(A.length(result.rows), 1);
      })
    );

    it.effect(
      "should handle && (logical and)",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should handle || (logical or)",
      Effect.fn(function* () {
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
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("select - modifiers", (it) => {
    it.effect(
      "should handle LIMIT",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should handle OFFSET",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should handle LIMIT with OFFSET",
      Effect.fn(function* () {
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
      })
    );

    it.effect(
      "should handle DISTINCT",
      Effect.fn(function* () {
        const alice = IRI.make("http://example.org/alice");
        const rdfType = IRI.make("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
        const person = IRI.make("http://example.org/Person");
        const employee = IRI.make("http://example.org/Employee");

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
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("construct", (it) => {
    it.effect(
      "should construct new quads from pattern",
      Effect.fn(function* () {
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
        const quad: Quad = A.unsafeGet(result, 0);
        strictEqual(quad.predicate, "http://example.org/displayName");
      })
    );

    it.effect(
      "should return empty array when no matches",
      Effect.fn(function* () {
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
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("ask", (it) => {
    it.effect(
      "should return true when pattern matches",
      Effect.fn(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.ask(`
          ASK {
            ?s <http://example.org/name> "Alice"
          }
        `);

        strictEqual(result, true);
      })
    );

    it.effect(
      "should return false when pattern doesn't match",
      Effect.fn(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.ask(`
          ASK {
            ?s <http://example.org/name> "Bob"
          }
        `);

        strictEqual(result, false);
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("query (generic)", (it) => {
    it.effect(
      "should execute SELECT query via generic query method",
      Effect.fn(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.query(`
          SELECT ?s WHERE { ?s <http://example.org/name> "Alice" }
        `);

        assertTrue(result instanceof SparqlBindings);
      })
    );

    it.effect(
      "should execute ASK query via generic query method",
      Effect.fn(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.query(`
          ASK { ?s <http://example.org/name> "Alice" }
        `);

        assertTrue(P.isBoolean(result));
        strictEqual(result, true);
      })
    );

    it.effect(
      "should execute CONSTRUCT query via generic query method",
      Effect.fn(function* () {
        yield* addTestData(createPersonQuads("alice", "Alice"));

        const sparql = yield* SparqlService;
        const result = yield* sparql.query(`
          CONSTRUCT { ?s <http://example.org/hasName> ?name }
          WHERE { ?s <http://example.org/name> ?name }
        `);

        assertTrue(A.isArray(result));
        strictEqual(A.length(result as ReadonlyArray<Quad>), 1);
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("error handling", (it) => {
    it.effect(
      "should fail on syntax error",
      Effect.fn(function* () {
        const sparql = yield* SparqlService;
        const result = yield* Effect.either(
          sparql.select(`
            SELECT ?s WHERE { INVALID SYNTAX }
          `)
        );

        assertTrue(result._tag === "Left");
      })
    );

    it.effect(
      "should fail on unsupported query type",
      Effect.fn(function* () {
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
      })
    );
  });
});

import { SparqlParser, SparqlParserLive } from "@beep/knowledge-server/Sparql";
import { assertTrue, describe, layer, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as R from "effect/Record";

const TestLayer = SparqlParserLive;

const TEST_TIMEOUT = 60000;

describe("SparqlParser", () => {
  layer(TestLayer, { timeout: Duration.seconds(60) })("parse - SELECT queries", (it) => {
    it.effect(
      "should parse basic SELECT query",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query, ast } = yield* parser.parse("SELECT ?s WHERE { ?s ?p ?o }");

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 1);
        strictEqual(A.unsafeGet(query.variables, 0), "s");
        strictEqual(ast.type, "query");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse SELECT with multiple variables",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse("SELECT ?s ?p ?o WHERE { ?s ?p ?o }");

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 3);
        strictEqual(A.unsafeGet(query.variables, 0), "s");
        strictEqual(A.unsafeGet(query.variables, 1), "p");
        strictEqual(A.unsafeGet(query.variables, 2), "o");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse SELECT * (wildcard)",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse("SELECT * WHERE { ?s ?p ?o }");

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 0);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse SELECT with FILTER",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s ?name WHERE {
              ?s <http://example.org/name> ?name .
              FILTER(?name = "Alice")
            }
          `);

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 2);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse SELECT with OPTIONAL",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s ?name ?age WHERE {
              ?s <http://example.org/name> ?name .
              OPTIONAL { ?s <http://example.org/age> ?age }
            }
          `);

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 3);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse SELECT DISTINCT",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query, ast } = yield* parser.parse("SELECT DISTINCT ?s WHERE { ?s ?p ?o }");

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 1);
        assertTrue(ast.type === "query" && ast.queryType === "SELECT");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse SELECT with LIMIT and OFFSET",

      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse("SELECT ?s WHERE { ?s ?p ?o } LIMIT 10 OFFSET 5");

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 1);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse SELECT with ORDER BY",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(
          "SELECT ?s ?name WHERE { ?s <http://example.org/name> ?name } ORDER BY ?name"
        );

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 2);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse SELECT with UNION",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s WHERE {
              { ?s <http://example.org/typeA> ?o }
              UNION
              { ?s <http://example.org/typeB> ?o }
            }
          `);

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 1);
      }),
      TEST_TIMEOUT
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(60) })("parse - CONSTRUCT queries", (it) => {
    it.effect(
      "should parse basic CONSTRUCT query",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            CONSTRUCT { ?s <http://example.org/mapped> ?o }
            WHERE { ?s <http://example.org/original> ?o }
          `);

        strictEqual(query.queryType, "CONSTRUCT");
        strictEqual(A.length(query.variables), 0);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse CONSTRUCT with multiple triples in template",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            CONSTRUCT {
              ?s <http://example.org/label> ?name .
              ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Entity>
            }
            WHERE { ?s <http://example.org/name> ?name }
          `);

        strictEqual(query.queryType, "CONSTRUCT");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse CONSTRUCT WHERE (shorthand)",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            CONSTRUCT WHERE { ?s <http://example.org/name> ?o }
          `);

        strictEqual(query.queryType, "CONSTRUCT");
      }),
      TEST_TIMEOUT
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(60) })("parse - ASK queries", (it) => {
    it.effect(
      "should parse basic ASK query",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse("ASK { ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?o }");

        strictEqual(query.queryType, "ASK");
        strictEqual(A.length(query.variables), 0);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse ASK with specific subject",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            ASK { <http://example.org/alice> <http://example.org/knows> <http://example.org/bob> }
          `);

        strictEqual(query.queryType, "ASK");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse ASK with FILTER",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            ASK {
              ?s <http://example.org/age> ?age .
              FILTER(?age > 18)
            }
          `);

        strictEqual(query.queryType, "ASK");
      }),
      TEST_TIMEOUT
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(60) })("parse - PREFIX declarations", (it) => {
    it.effect(
      "should extract single PREFIX",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            PREFIX ex: <http://example.org/>
            SELECT ?s WHERE { ?s ex:name ?o }
          `);

        strictEqual(query.prefixes.ex, "http://example.org/");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should extract multiple PREFIXes",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            PREFIX ex: <http://example.org/>
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            SELECT ?person WHERE { ?person foaf:name "Alice" }
          `);

        strictEqual(query.prefixes.ex, "http://example.org/");
        strictEqual(query.prefixes.foaf, "http://xmlns.com/foaf/0.1/");
        strictEqual(query.prefixes.rdf, "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle empty prefix (base IRI)",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            PREFIX : <http://example.org/>
            SELECT ?s WHERE { ?s :name ?o }
          `);

        strictEqual(query.prefixes[""], "http://example.org/");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle query without PREFIXes",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse("SELECT ?s WHERE { ?s ?p ?o }");

        strictEqual(A.length(R.keys(query.prefixes)), 0);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle common vocabulary prefixes",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
            SELECT ?s WHERE { ?s rdf:type owl:Class }
          `);

        strictEqual(query.prefixes.rdf, "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
        strictEqual(query.prefixes.rdfs, "http://www.w3.org/2000/01/rdf-schema#");
        strictEqual(query.prefixes.xsd, "http://www.w3.org/2001/XMLSchema#");
        strictEqual(query.prefixes.owl, "http://www.w3.org/2002/07/owl#");
        strictEqual(query.prefixes.skos, "http://www.w3.org/2004/02/skos/core#");
      }),
      TEST_TIMEOUT
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(60) })("parse - error cases", (it) => {
    it.effect(
      "should return SparqlSyntaxError for missing closing brace",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const error = yield* Effect.flip(parser.parse("SELECT ?s WHERE { ?s ?p ?o"));

        assertTrue(P.isTagged("SparqlSyntaxError")(error));
        strictEqual(error.query, "SELECT ?s WHERE { ?s ?p ?o");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return SparqlSyntaxError for invalid keyword",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const error = yield* Effect.flip(parser.parse("SELEKT ?s WHERE { ?s ?p ?o }"));

        strictEqual(error._tag, "SparqlSyntaxError");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return error for empty query",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const error = yield* Effect.flip(parser.parse(""));

        assertTrue(error._tag === "SparqlSyntaxError" || error._tag === "SparqlUnsupportedFeatureError");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return SparqlSyntaxError for malformed triple",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const error = yield* Effect.flip(parser.parse("SELECT ?s WHERE { ?s ?p }"));

        strictEqual(error._tag, "SparqlSyntaxError");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse DESCRIBE query",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse("DESCRIBE <http://example.org/alice> WHERE { ?s ?p ?o }");

        strictEqual(query.queryType, "DESCRIBE");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return SparqlUnsupportedFeatureError for INSERT DATA",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const error = yield* Effect.flip(
          parser.parse("INSERT DATA { <http://example.org/s> <http://example.org/p> 'o' }")
        );

        assertTrue(P.isTagged(error, "SparqlUnsupportedFeatureError"));
        strictEqual(error.feature, "UPDATE operations");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return SparqlUnsupportedFeatureError for DELETE DATA",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const error = yield* Effect.flip(
          parser.parse("DELETE DATA { <http://example.org/s> <http://example.org/p> 'o' }")
        );

        assertTrue(P.isTagged(error, "SparqlUnsupportedFeatureError"));
        strictEqual(error.feature, "UPDATE operations");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return SparqlUnsupportedFeatureError for DELETE WHERE",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const error = yield* Effect.flip(parser.parse("DELETE WHERE { ?s <http://example.org/p> ?o }"));

        assertTrue(P.isTagged(error, "SparqlUnsupportedFeatureError"));
        strictEqual(error.feature, "UPDATE operations");
      }),
      TEST_TIMEOUT
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(60) })("parse - queryString preservation", (it) => {
    it.effect(
      "should preserve original query string",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const originalQuery = "SELECT ?s WHERE { ?s ?p ?o }";
        const { query } = yield* parser.parse(originalQuery);

        strictEqual(query.queryString, originalQuery);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should preserve whitespace in query string",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const originalQuery = `
            PREFIX ex: <http://example.org/>
            SELECT ?s ?name
            WHERE {
              ?s ex:name ?name
            }
          `;
        const { query } = yield* parser.parse(originalQuery);

        strictEqual(query.queryString, originalQuery);
      }),
      TEST_TIMEOUT
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(60) })("parse - AST structure", (it) => {
    it.effect(
      "should return valid AST for SELECT",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { ast } = yield* parser.parse("SELECT ?s WHERE { ?s ?p ?o }");

        strictEqual(ast.type, "query");
        assertTrue("queryType" in ast && ast.queryType === "SELECT");
        assertTrue("where" in ast && A.isArray(ast.where));
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return valid AST for CONSTRUCT",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { ast } = yield* parser.parse("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }");

        strictEqual(ast.type, "query");
        assertTrue("queryType" in ast && ast.queryType === "CONSTRUCT");
        assertTrue("template" in ast);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return valid AST for ASK",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { ast } = yield* parser.parse("ASK { ?s ?p ?o }");

        strictEqual(ast.type, "query");
        assertTrue("queryType" in ast && ast.queryType === "ASK");
      }),
      TEST_TIMEOUT
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(60) })("parse - complex queries", (it) => {
    it.effect(
      "should parse query with multiple graph patterns",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            SELECT ?person ?name ?friend
            WHERE {
              ?person foaf:name ?name .
              ?person foaf:knows ?friend .
              ?friend foaf:name ?friendName
            }
          `);

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 3);
        strictEqual(query.prefixes.foaf, "http://xmlns.com/foaf/0.1/");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse query with nested OPTIONAL",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s ?name ?email ?phone
            WHERE {
              ?s <http://example.org/name> ?name .
              OPTIONAL {
                ?s <http://example.org/email> ?email .
                OPTIONAL { ?s <http://example.org/phone> ?phone }
              }
            }
          `);

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 4);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse query with BIND",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s ?fullName
            WHERE {
              ?s <http://example.org/firstName> ?first .
              ?s <http://example.org/lastName> ?last .
              BIND(CONCAT(?first, " ", ?last) AS ?fullName)
            }
          `);

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 2);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse query with VALUES",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s ?name
            WHERE {
              VALUES ?s { <http://example.org/alice> <http://example.org/bob> }
              ?s <http://example.org/name> ?name
            }
          `);

        strictEqual(query.queryType, "SELECT");
        strictEqual(A.length(query.variables), 2);
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse query with GROUP BY and HAVING",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?type (COUNT(?s) AS ?count)
            WHERE {
              ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type
            }
            GROUP BY ?type
            HAVING (COUNT(?s) > 5)
          `);

        strictEqual(query.queryType, "SELECT");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse query with subquery",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s ?name
            WHERE {
              {
                SELECT ?s WHERE {
                  ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Person>
                }
                LIMIT 10
              }
              ?s <http://example.org/name> ?name
            }
          `);

        strictEqual(query.queryType, "SELECT");
      }),
      TEST_TIMEOUT
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(60) })("parse - literal handling", (it) => {
    it.effect(
      "should parse query with string literal",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s WHERE { ?s <http://example.org/name> "Alice" }
          `);

        strictEqual(query.queryType, "SELECT");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse query with language-tagged literal",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s WHERE { ?s <http://example.org/name> "Alice"@en }
          `);

        strictEqual(query.queryType, "SELECT");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse query with typed literal",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s WHERE { ?s <http://example.org/age> "42"^^<http://www.w3.org/2001/XMLSchema#integer> }
          `);

        strictEqual(query.queryType, "SELECT");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse query with boolean literal",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s WHERE { ?s <http://example.org/active> true }
          `);

        strictEqual(query.queryType, "SELECT");
      }),
      TEST_TIMEOUT
    );

    it.effect(
      "should parse query with numeric literal",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query } = yield* parser.parse(`
            SELECT ?s WHERE { ?s <http://example.org/count> 42 }
          `);

        strictEqual(query.queryType, "SELECT");
      }),
      TEST_TIMEOUT
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(60) })("parse - service isolation", (it) => {
    it.effect(
      "should provide fresh parser per test",
      Effect.fn(function* () {
        const parser = yield* SparqlParser;
        const { query: query1 } = yield* parser.parse("SELECT ?a WHERE { ?a ?b ?c }");
        const { query: query2 } = yield* parser.parse("SELECT ?x WHERE { ?x ?y ?z }");

        strictEqual(A.unsafeGet(query1.variables, 0), "a");
        strictEqual(A.unsafeGet(query2.variables, 0), "x");
      }),
      TEST_TIMEOUT
    );
  });
});

/**
 * RDF Services Integration Tests
 *
 * Tests verifying RdfBuilder, RdfStore, and Serializer work together correctly.
 * Focuses on real integration scenarios, not mocked behavior.
 *
 * @module knowledge-server/test/Rdf/integration.test
 * @since 0.1.0
 */
import { IRI, Literal, Quad, QuadPattern } from "@beep/knowledge-domain/value-objects";
import { RdfBuilder } from "@beep/knowledge-server/Rdf/RdfBuilder";
import { RdfStore } from "@beep/knowledge-server/Rdf/RdfStoreService";
import { Serializer } from "@beep/knowledge-server/Rdf/Serializer";
import { assertTrue, describe, effect, layer, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";

/**
 * Helper for string includes check with correct argument order
 * Str.includes is curried: Str.includes(searchString)(str) -> boolean
 */
const includes = (str: string, search: string): boolean => Str.includes(search)(str);

/**
 * Test layer combining all RDF services with shared RdfStore dependency.
 * Uses Layer.provideMerge to ensure:
 * 1. RdfStore.Default is provided to both RdfBuilder and Serializer
 * 2. All three services share the SAME RdfStore instance
 * 3. The RdfStore is directly accessible for verification
 */
const TestLayer = Layer.mergeAll(RdfBuilder.Default, Serializer.Default).pipe(Layer.provideMerge(RdfStore.Default));

/**
 * Common RDF namespace prefixes for test fixtures
 */
const EX = "http://example.org/";
const FOAF = "http://xmlns.com/foaf/0.1/";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";

/**
 * Test fixture helpers
 */
const fixtures = {
  alice: IRI.make(`${EX}alice`),
  bob: IRI.make(`${EX}bob`),
  carol: IRI.make(`${EX}carol`),
  project1: IRI.make(`${EX}project1`),
  foafName: IRI.make(`${FOAF}name`),
  foafKnows: IRI.make(`${FOAF}knows`),
  foafAge: IRI.make(`${FOAF}age`),
  rdfsLabel: IRI.make(`${RDFS}label`),
  rdfsComment: IRI.make(`${RDFS}comment`),
  exWorksOn: IRI.make(`${EX}worksOn`),
  exTitle: IRI.make(`${EX}title`),
  xsdInteger: IRI.make(`${XSD}integer`),
  graph1: IRI.make(`${EX}graph1`),
  graph2: IRI.make(`${EX}graph2`),
  graphPeople: IRI.make(`${EX}people`),
  graphProjects: IRI.make(`${EX}projects`),
};

describe("RDF Integration", () => {
  layer(TestLayer, { timeout: Duration.seconds(30) })("RdfBuilder + Serializer Round-Trip", (it) => {
    it.effect(
      "should build quads, serialize to Turtle, parse back, and verify data matches",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build quads using fluent API
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();

        yield* builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();

        // Verify store has 3 quads
        const initialSize = yield* store.size;
        strictEqual(initialSize, 3);

        // Serialize to Turtle
        const turtle = yield* serializer.serialize("Turtle");

        // Clear the store
        yield* store.clear();
        const clearedSize = yield* store.size;
        strictEqual(clearedSize, 0);

        // Parse the Turtle back
        const parsedQuads = yield* serializer.parseOnly(turtle);

        // Verify count matches
        strictEqual(A.length(parsedQuads), 3);

        // Verify specific data is preserved
        const hasAliceName = A.some(
          parsedQuads,
          (q: Quad) =>
            q.subject === fixtures.alice &&
            q.predicate === fixtures.foafName &&
            Literal.is(q.object) &&
            q.object.value === "Alice"
        );
        assertTrue(hasAliceName);

        const hasAliceKnowsBob = A.some(
          parsedQuads,
          (q: Quad) => q.subject === fixtures.alice && q.predicate === fixtures.foafKnows && q.object === fixtures.bob
        );
        assertTrue(hasAliceKnowsBob);

        const hasBobName = A.some(
          parsedQuads,
          (q: Quad) =>
            q.subject === fixtures.bob &&
            q.predicate === fixtures.foafName &&
            Literal.is(q.object) &&
            q.object.value === "Bob"
        );
        assertTrue(hasBobName);
      })
    );

    it.effect(
      "should preserve typed literals through build-serialize-parse cycle",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build a typed literal
        yield* builder
          .subject(fixtures.alice)
          .predicate(fixtures.foafAge)
          .typedLiteral("30", fixtures.xsdInteger)
          .add();

        // Serialize and parse back
        const turtle = yield* serializer.serialize("Turtle");
        yield* store.clear();
        const parsedQuads = yield* serializer.parseOnly(turtle);

        // Verify typed literal preserved
        strictEqual(A.length(parsedQuads), 1);
        const quad = parsedQuads[0];
        assertTrue(quad !== undefined);
        assertTrue(Literal.is(quad.object));
        strictEqual(quad.object.value, "30");
        strictEqual(quad.object.datatype, fixtures.xsdInteger);
      })
    );

    it.effect(
      "should preserve language-tagged literals through round-trip",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build with language tag
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice", "en").add();

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alicia", "es").add();

        // Serialize and parse back
        const turtle = yield* serializer.serialize("Turtle");
        yield* store.clear();
        const parsedQuads = yield* serializer.parseOnly(turtle);

        // Verify both language variants preserved
        strictEqual(A.length(parsedQuads), 2);

        const hasEnglish = A.some(parsedQuads, (q: Quad) => Literal.is(q.object) && q.object.language === "en");
        assertTrue(hasEnglish);

        const hasSpanish = A.some(parsedQuads, (q: Quad) => Literal.is(q.object) && q.object.language === "es");
        assertTrue(hasSpanish);
      })
    );

    it.effect(
      "should handle N-Triples format in round-trip",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();

        // Serialize to N-Triples (stricter format)
        const ntriples = yield* serializer.serialize("NTriples");
        yield* store.clear();
        const parsedQuads = yield* serializer.parseOnly(ntriples);

        strictEqual(A.length(parsedQuads), 1);
        strictEqual(parsedQuads[0]?.subject, fixtures.alice);
        strictEqual(parsedQuads[0]?.predicate, fixtures.foafKnows);
        strictEqual(parsedQuads[0]?.object, fixtures.bob);
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("Multiple Builders Sharing Same Store", (it) => {
    it.effect(
      "should accumulate quads from sequential builder operations",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Simulate "source A" adding quads
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();

        // Simulate "source B" adding quads
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafKnows).object(fixtures.carol).add();

        // Simulate "source C" adding quads
        yield* builder.subject(fixtures.carol).predicate(fixtures.foafName).literal("Carol").add();

        // All quads should be in the shared store
        const size = yield* store.size;
        strictEqual(size, 5);

        // Verify quads from all sources are accessible
        const allQuads = yield* store.getQuads();
        strictEqual(A.length(allQuads), 5);

        // Count subjects
        const subjects = yield* store.getSubjects();
        strictEqual(A.length(subjects), 3);
      })
    );

    it.effect(
      "should allow concurrent builder operations with parallel add",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build quads without adding
        const quad1 = builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").build();

        const quad2 = builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").build();

        const quad3 = builder.subject(fixtures.carol).predicate(fixtures.foafName).literal("Carol").build();

        // Batch add all quads at once
        yield* builder.batch([quad1, quad2, quad3]);

        const size = yield* store.size;
        strictEqual(size, 3);
      })
    );

    it.effect(
      "should chain predicates on same subject to add final quad only",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Predicate chaining navigates to new predicate context but only adds the final quad
        // This is useful for exploring/building but NOT for adding multiple quads
        yield* builder
          .subject(fixtures.alice)
          .predicate(fixtures.foafName)
          .literal("Alice")
          .predicate(fixtures.foafKnows)
          .object(fixtures.bob)
          .add();

        // Only the final quad (alice foafKnows bob) is added
        const aliceQuads = yield* store.match(new QuadPattern({ subject: fixtures.alice }));
        strictEqual(A.length(aliceQuads), 1);
        strictEqual(aliceQuads[0]?.predicate, fixtures.foafKnows);
      })
    );

    it.effect(
      "should add multiple quads for same subject using separate calls",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // To add multiple quads, call add() for each
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();

        yield* builder
          .subject(fixtures.alice)
          .predicate(fixtures.foafAge)
          .typedLiteral("30", fixtures.xsdInteger)
          .add();

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();

        // Should have created 3 quads for alice
        const aliceQuads = yield* store.match(new QuadPattern({ subject: fixtures.alice }));
        strictEqual(A.length(aliceQuads), 3);
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("Builder + Store Operations", (it) => {
    it.effect(
      "should build quads, match by pattern, and verify counts",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build a social network graph
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.carol).add();
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafKnows).object(fixtures.carol).add();
        yield* builder.subject(fixtures.carol).predicate(fixtures.foafName).literal("Carol").add();

        // Count all quads
        const totalSize = yield* store.size;
        strictEqual(totalSize, 6);

        // Match by predicate (foaf:knows)
        const knowsQuads = yield* store.match(new QuadPattern({ predicate: fixtures.foafKnows }));
        strictEqual(A.length(knowsQuads), 3);

        // Match by predicate (foaf:name)
        const nameQuads = yield* store.match(new QuadPattern({ predicate: fixtures.foafName }));
        strictEqual(A.length(nameQuads), 3);

        // Match by subject
        const aliceQuads = yield* store.match(new QuadPattern({ subject: fixtures.alice }));
        strictEqual(A.length(aliceQuads), 3);

        // Match by object
        const carolAsObject = yield* store.match(new QuadPattern({ object: fixtures.carol }));
        strictEqual(A.length(carolAsObject), 2);
      })
    );

    it.effect(
      "should build quads, remove specific ones, and verify remaining",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build quads
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();

        // Verify initial count
        const initialSize = yield* store.size;
        strictEqual(initialSize, 3);

        // Remove the "knows" relationship
        const knowsQuad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafKnows,
          object: fixtures.bob,
        });
        yield* store.removeQuad(knowsQuad);

        // Verify count decreased
        const afterRemoveSize = yield* store.size;
        strictEqual(afterRemoveSize, 2);

        // Verify the knows quad is gone
        const knowsQuads = yield* store.match(new QuadPattern({ predicate: fixtures.foafKnows }));
        strictEqual(A.length(knowsQuads), 0);

        // Verify name quads remain
        const nameQuads = yield* store.match(new QuadPattern({ predicate: fixtures.foafName }));
        strictEqual(A.length(nameQuads), 2);
      })
    );

    it.effect(
      "should use countMatches for efficient counting without fetching quads",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build many quads
        const subjects = [fixtures.alice, fixtures.bob, fixtures.carol];
        for (const subject of subjects) {
          yield* builder.subject(subject).predicate(fixtures.foafName).literal("Name").add();
          yield* builder.subject(subject).predicate(fixtures.rdfsLabel).literal("Label").add();
          yield* builder.subject(subject).predicate(fixtures.rdfsComment).literal("Comment").add();
        }

        // Count by predicate without fetching
        const nameCount = yield* store.countMatches(new QuadPattern({ predicate: fixtures.foafName }));
        strictEqual(nameCount, 3);

        const labelCount = yield* store.countMatches(new QuadPattern({ predicate: fixtures.rdfsLabel }));
        strictEqual(labelCount, 3);

        // Count all quads
        const totalCount = yield* store.countMatches(new QuadPattern({}));
        strictEqual(totalCount, 9);
      })
    );

    it.effect(
      "should verify hasQuad for existence checks",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build a quad
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();

        // Check existing quad
        const existingQuad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Alice" }),
        });
        const exists = yield* store.hasQuad(existingQuad);
        assertTrue(exists);

        // Check non-existing quad
        const nonExistingQuad = new Quad({
          subject: fixtures.bob,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Bob" }),
        });
        const doesNotExist = yield* store.hasQuad(nonExistingQuad);
        assertTrue(!doesNotExist);
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("Named Graph Isolation", (it) => {
    it.effect(
      "should build quads in different named graphs and verify isolation",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Add quads to graph1 (people)
        yield* builder
          .inGraph(fixtures.graphPeople)
          .subject(fixtures.alice)
          .predicate(fixtures.foafName)
          .literal("Alice")
          .add();

        yield* builder
          .inGraph(fixtures.graphPeople)
          .subject(fixtures.bob)
          .predicate(fixtures.foafName)
          .literal("Bob")
          .add();

        // Add quads to graph2 (projects)
        yield* builder
          .inGraph(fixtures.graphProjects)
          .subject(fixtures.project1)
          .predicate(fixtures.exTitle)
          .literal("Project One")
          .add();

        yield* builder
          .inGraph(fixtures.graphProjects)
          .subject(fixtures.alice)
          .predicate(fixtures.exWorksOn)
          .object(fixtures.project1)
          .add();

        // Verify total count
        const totalSize = yield* store.size;
        strictEqual(totalSize, 4);

        // Match only from people graph
        const peopleQuads = yield* store.match(new QuadPattern({ graph: fixtures.graphPeople }));
        strictEqual(A.length(peopleQuads), 2);

        // Match only from projects graph
        const projectQuads = yield* store.match(new QuadPattern({ graph: fixtures.graphProjects }));
        strictEqual(A.length(projectQuads), 2);

        // Verify graphs are listed correctly
        const graphs = yield* store.listGraphs();
        strictEqual(A.length(graphs), 2);
        assertTrue(A.contains(graphs, fixtures.graphPeople));
        assertTrue(A.contains(graphs, fixtures.graphProjects));
      })
    );

    it.effect(
      "should serialize only specific graph and verify content isolation",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build quads in separate graphs
        yield* builder
          .inGraph(fixtures.graph1)
          .subject(fixtures.alice)
          .predicate(fixtures.foafName)
          .literal("Alice in Graph1")
          .add();

        yield* builder
          .inGraph(fixtures.graph2)
          .subject(fixtures.bob)
          .predicate(fixtures.foafName)
          .literal("Bob in Graph2")
          .add();

        // Serialize only graph1
        const graph1Turtle = yield* serializer.serialize("Turtle", fixtures.graph1);
        assertTrue(includes(graph1Turtle, "Alice in Graph1"));
        assertTrue(!includes(graph1Turtle, "Bob in Graph2"));

        // Serialize only graph2
        const graph2Turtle = yield* serializer.serialize("Turtle", fixtures.graph2);
        assertTrue(includes(graph2Turtle, "Bob in Graph2"));
        assertTrue(!includes(graph2Turtle, "Alice in Graph1"));
      })
    );

    it.effect(
      "should remove quads from a specific named graph",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build quads in two graphs
        yield* builder
          .inGraph(fixtures.graph1)
          .subject(fixtures.alice)
          .predicate(fixtures.foafName)
          .literal("Alice")
          .add();

        yield* builder.inGraph(fixtures.graph2).subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();

        // Verify both graphs exist
        const initialSize = yield* store.size;
        strictEqual(initialSize, 2);

        // Match and remove quads from graph1 manually
        const graph1Quads = yield* store.match(new QuadPattern({ graph: fixtures.graph1 }));
        yield* store.removeQuads(graph1Quads);

        // Verify only graph2 quads remain
        const afterRemoveSize = yield* store.size;
        strictEqual(afterRemoveSize, 1);

        const remainingQuads = yield* store.getQuads();
        strictEqual(A.length(remainingQuads), 1);
        strictEqual(remainingQuads[0]?.graph, fixtures.graph2);
      })
    );

    it.effect(
      "should list named graphs after adding quads",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Add quads to different named graphs
        yield* builder
          .inGraph(fixtures.graph1)
          .subject(fixtures.alice)
          .predicate(fixtures.foafName)
          .literal("Alice")
          .add();

        yield* builder.inGraph(fixtures.graph2).subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();

        // List named graphs
        const graphs = yield* store.listGraphs();
        strictEqual(A.length(graphs), 2);
        assertTrue(A.contains(graphs, fixtures.graph1));
        assertTrue(A.contains(graphs, fixtures.graph2));
      })
    );

    it.effect(
      "should mix default graph and named graphs correctly",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Add to default graph (no inGraph call)
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice Default").add();

        // Add to named graph
        yield* builder
          .inGraph(fixtures.graph1)
          .subject(fixtures.alice)
          .predicate(fixtures.foafName)
          .literal("Alice Graph1")
          .add();

        // Verify total
        const totalSize = yield* store.size;
        strictEqual(totalSize, 2);

        // Match all quads for alice
        const aliceQuads = yield* store.match(new QuadPattern({ subject: fixtures.alice }));
        strictEqual(A.length(aliceQuads), 2);

        // Match only named graph quads
        const graph1Quads = yield* store.match(new QuadPattern({ graph: fixtures.graph1 }));
        strictEqual(A.length(graph1Quads), 1);

        // Verify default graph quad has undefined graph
        const defaultQuad = A.findFirst(aliceQuads, (q: Quad) => q.graph === undefined);
        assertTrue(defaultQuad._tag === "Some");
        assertTrue(Literal.is(defaultQuad.value.object));
        strictEqual(defaultQuad.value.object.value, "Alice Default");
      })
    );

    it.effect(
      "should parse Turtle into named graph and serialize back",
      Effect.fn(function* () {
        const serializer = yield* Serializer;
        const store = yield* RdfStore;
        yield* store.clear();

        const turtle = `
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice foaf:name "Alice" .
ex:bob foaf:name "Bob" .
`;

        // Parse into specific graph
        yield* serializer.parseTurtle(turtle, fixtures.graph1);

        // Verify quads are in the named graph
        const quads = yield* store.getQuads();
        strictEqual(A.length(quads), 2);
        assertTrue(A.every(quads, (q: Quad) => q.graph === fixtures.graph1));

        // Serialize only that graph
        const serialized = yield* serializer.serialize("Turtle", fixtures.graph1);
        assertTrue(includes(serialized, "Alice"));
        assertTrue(includes(serialized, "Bob"));
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("Complex Integration Scenarios", (it) => {
    it.effect(
      "should handle complete workflow: build, serialize, clear, parse, match",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const serializer = yield* Serializer;
        const store = yield* RdfStore;

        // Phase 1: Build complex graph structure
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();
        yield* builder
          .subject(fixtures.alice)
          .predicate(fixtures.foafAge)
          .typedLiteral("30", fixtures.xsdInteger)
          .add();
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();
        yield* builder.subject(fixtures.alice).predicate(fixtures.exWorksOn).object(fixtures.project1).add();

        yield* builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafAge).typedLiteral("28", fixtures.xsdInteger).add();

        yield* builder.subject(fixtures.project1).predicate(fixtures.exTitle).literal("Knowledge Graph").add();

        // Phase 2: Verify structure
        const initialSize = yield* store.size;
        strictEqual(initialSize, 7);

        // Phase 3: Serialize
        const turtle = yield* serializer.serialize("Turtle");

        // Phase 4: Clear and verify empty
        yield* store.clear();
        const clearedSize = yield* store.size;
        strictEqual(clearedSize, 0);

        // Phase 5: Parse back
        const count = yield* serializer.parseTurtle(turtle);
        strictEqual(count, 7);

        // Phase 6: Complex queries
        const aliceData = yield* store.match(new QuadPattern({ subject: fixtures.alice }));
        strictEqual(A.length(aliceData), 4);

        const ageQuads = yield* store.match(new QuadPattern({ predicate: fixtures.foafAge }));
        strictEqual(A.length(ageQuads), 2);

        const projectQuads = yield* store.match(new QuadPattern({ subject: fixtures.project1 }));
        strictEqual(A.length(projectQuads), 1);
      })
    );

    it.effect(
      "should support builder with predicate chaining across multiple subjects",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Build alice's full profile with chaining
        const aliceQuad1 = builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").build();

        const aliceQuad2 = builder
          .subject(fixtures.alice)
          .predicate(fixtures.foafAge)
          .typedLiteral("30", fixtures.xsdInteger)
          .build();

        // Build bob's profile
        const bobQuad1 = builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").build();

        const bobQuad2 = builder.subject(fixtures.bob).predicate(fixtures.foafKnows).object(fixtures.alice).build();

        // Batch add all
        yield* builder.batch([aliceQuad1, aliceQuad2, bobQuad1, bobQuad2]);

        // Verify
        const size = yield* store.size;
        strictEqual(size, 4);

        const aliceQuads = yield* store.match(new QuadPattern({ subject: fixtures.alice }));
        strictEqual(A.length(aliceQuads), 2);

        const bobQuads = yield* store.match(new QuadPattern({ subject: fixtures.bob }));
        strictEqual(A.length(bobQuads), 2);
      })
    );

    it.effect(
      "should handle incremental updates: add, modify, remove pattern",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        // Initial state
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice Smith").add();

        // Verify initial
        let nameQuads = yield* store.match(
          new QuadPattern({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
          })
        );
        strictEqual(A.length(nameQuads), 1);
        assertTrue(Literal.is(nameQuads[0]?.object));
        strictEqual(nameQuads[0]?.object.value, "Alice Smith");

        // "Update": Remove old, add new
        yield* store.removeQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice Smith" }),
          })
        );

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice Johnson").add();

        // Verify update
        nameQuads = yield* store.match(
          new QuadPattern({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
          })
        );
        strictEqual(A.length(nameQuads), 1);
        assertTrue(Literal.is(nameQuads[0]?.object));
        strictEqual(nameQuads[0]?.object.value, "Alice Johnson");
      })
    );
  });

  layer(TestLayer, { timeout: Duration.seconds(30) })("Store Isolation Between Test Runs", (it) => {
    it.effect(
      "first test adds quads and verifies count",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();

        const size = yield* store.size;
        strictEqual(size, 2);
      })
    );

    it.effect(
      "second test should start with empty store",
      Effect.fn(function* () {
        const store = yield* RdfStore;
        yield* store.clear();

        // Store should be empty after clearing
        const size = yield* store.size;
        strictEqual(size, 0);
      })
    );
  });

  // This test intentionally does NOT use the layer pattern because it's testing
  // that independent layer provisions are isolated from each other
  effect("parallel layer provisions should be independent", () =>
    Effect.gen(function* () {
      // Run two effects with their own layer provisions
      const result1 = yield* Effect.gen(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();
        return yield* store.size;
      }).pipe(Effect.provide(TestLayer));

      const result2 = yield* Effect.gen(function* () {
        const store = yield* RdfStore;
        return yield* store.size;
      }).pipe(Effect.provide(TestLayer));

      // Each provision creates independent stores
      strictEqual(result1, 1);
      strictEqual(result2, 0);
    })
  );
});

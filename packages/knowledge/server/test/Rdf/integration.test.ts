import { IRI, Literal, Quad, QuadPattern } from "@beep/knowledge-domain/value-objects";
import { RdfBuilder, RdfBuilderLive } from "@beep/knowledge-server/Rdf/RdfBuilder";
import { RdfStore, RdfStoreLive } from "@beep/knowledge-server/Rdf/RdfStoreService";
import { Serializer, SerializerLive } from "@beep/knowledge-server/Rdf/Serializer";
import { assertTrue, describe, effect, layer, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Str from "effect/String";

const includes = (str: string, search: string): boolean => Str.includes(search)(str);

const TestLayer = Layer.mergeAll(RdfBuilderLive, SerializerLive).pipe(Layer.provideMerge(RdfStoreLive));

const EX = "http://example.org/";
const FOAF = "http://xmlns.com/foaf/0.1/";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";

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

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();

        yield* builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();

        const initialSize = yield* store.size;
        strictEqual(initialSize, 3);

        const turtle = yield* serializer.serialize("Turtle");

        yield* store.clear();
        const clearedSize = yield* store.size;
        strictEqual(clearedSize, 0);

        const parsedQuads = yield* serializer.parseOnly(turtle);

        strictEqual(A.length(parsedQuads), 3);

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

        yield* builder
          .subject(fixtures.alice)
          .predicate(fixtures.foafAge)
          .typedLiteral("30", fixtures.xsdInteger)
          .add();

        const turtle = yield* serializer.serialize("Turtle");
        yield* store.clear();
        const parsedQuads = yield* serializer.parseOnly(turtle);

        strictEqual(A.length(parsedQuads), 1);
        const quad = A.unsafeGet(parsedQuads, 0);
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

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice", "en").add();

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alicia", "es").add();

        const turtle = yield* serializer.serialize("Turtle");
        yield* store.clear();
        const parsedQuads = yield* serializer.parseOnly(turtle);

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

        const ntriples = yield* serializer.serialize("NTriples");
        yield* store.clear();
        const parsedQuads = yield* serializer.parseOnly(ntriples);

        strictEqual(A.length(parsedQuads), 1);
        const firstQuad = A.unsafeGet(parsedQuads, 0);
        strictEqual(firstQuad.subject, fixtures.alice);
        strictEqual(firstQuad.predicate, fixtures.foafKnows);
        strictEqual(firstQuad.object, fixtures.bob);
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

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();

        yield* builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafKnows).object(fixtures.carol).add();

        yield* builder.subject(fixtures.carol).predicate(fixtures.foafName).literal("Carol").add();

        const size = yield* store.size;
        strictEqual(size, 5);

        const allQuads = yield* store.getQuads();
        strictEqual(A.length(allQuads), 5);

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

        const quad1 = builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").build();

        const quad2 = builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").build();

        const quad3 = builder.subject(fixtures.carol).predicate(fixtures.foafName).literal("Carol").build();

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

        yield* builder
          .subject(fixtures.alice)
          .predicate(fixtures.foafName)
          .literal("Alice")
          .predicate(fixtures.foafKnows)
          .object(fixtures.bob)
          .add();

        const aliceQuads = yield* store.match(new QuadPattern({ subject: fixtures.alice }));
        strictEqual(A.length(aliceQuads), 1);
        const firstQuad = A.unsafeGet(aliceQuads, 0);
        strictEqual(firstQuad.predicate, fixtures.foafKnows);
      })
    );

    it.effect(
      "should add multiple quads for same subject using separate calls",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();

        yield* builder
          .subject(fixtures.alice)
          .predicate(fixtures.foafAge)
          .typedLiteral("30", fixtures.xsdInteger)
          .add();

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();

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

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.carol).add();
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafKnows).object(fixtures.carol).add();
        yield* builder.subject(fixtures.carol).predicate(fixtures.foafName).literal("Carol").add();

        const totalSize = yield* store.size;
        strictEqual(totalSize, 6);

        const knowsQuads = yield* store.match(new QuadPattern({ predicate: fixtures.foafKnows }));
        strictEqual(A.length(knowsQuads), 3);

        const nameQuads = yield* store.match(new QuadPattern({ predicate: fixtures.foafName }));
        strictEqual(A.length(nameQuads), 3);

        const aliceQuads = yield* store.match(new QuadPattern({ subject: fixtures.alice }));
        strictEqual(A.length(aliceQuads), 3);

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

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();
        yield* builder.subject(fixtures.alice).predicate(fixtures.foafKnows).object(fixtures.bob).add();
        yield* builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();

        const initialSize = yield* store.size;
        strictEqual(initialSize, 3);

        const knowsQuad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafKnows,
          object: fixtures.bob,
        });
        yield* store.removeQuad(knowsQuad);

        const afterRemoveSize = yield* store.size;
        strictEqual(afterRemoveSize, 2);

        const knowsQuads = yield* store.match(new QuadPattern({ predicate: fixtures.foafKnows }));
        strictEqual(A.length(knowsQuads), 0);

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

        const subjects = [fixtures.alice, fixtures.bob, fixtures.carol];
        for (const subject of subjects) {
          yield* builder.subject(subject).predicate(fixtures.foafName).literal("Name").add();
          yield* builder.subject(subject).predicate(fixtures.rdfsLabel).literal("Label").add();
          yield* builder.subject(subject).predicate(fixtures.rdfsComment).literal("Comment").add();
        }

        const nameCount = yield* store.countMatches(new QuadPattern({ predicate: fixtures.foafName }));
        strictEqual(nameCount, 3);

        const labelCount = yield* store.countMatches(new QuadPattern({ predicate: fixtures.rdfsLabel }));
        strictEqual(labelCount, 3);

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

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").add();

        const existingQuad = new Quad({
          subject: fixtures.alice,
          predicate: fixtures.foafName,
          object: new Literal({ value: "Alice" }),
        });
        const exists = yield* store.hasQuad(existingQuad);
        assertTrue(exists);

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

        const totalSize = yield* store.size;
        strictEqual(totalSize, 4);

        const peopleQuads = yield* store.match(new QuadPattern({ graph: fixtures.graphPeople }));
        strictEqual(A.length(peopleQuads), 2);

        const projectQuads = yield* store.match(new QuadPattern({ graph: fixtures.graphProjects }));
        strictEqual(A.length(projectQuads), 2);

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

        const graph1Turtle = yield* serializer.serialize("Turtle", fixtures.graph1);
        assertTrue(includes(graph1Turtle, "Alice in Graph1"));
        assertTrue(!includes(graph1Turtle, "Bob in Graph2"));

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

        yield* builder
          .inGraph(fixtures.graph1)
          .subject(fixtures.alice)
          .predicate(fixtures.foafName)
          .literal("Alice")
          .add();

        yield* builder.inGraph(fixtures.graph2).subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();

        const initialSize = yield* store.size;
        strictEqual(initialSize, 2);

        const graph1Quads = yield* store.match(new QuadPattern({ graph: fixtures.graph1 }));
        yield* store.removeQuads(graph1Quads);

        const afterRemoveSize = yield* store.size;
        strictEqual(afterRemoveSize, 1);

        const remainingQuads = yield* store.getQuads();
        strictEqual(A.length(remainingQuads), 1);
        const firstRemaining = A.unsafeGet(remainingQuads, 0);
        strictEqual(firstRemaining.graph, fixtures.graph2);
      })
    );

    it.effect(
      "should list named graphs after adding quads",
      Effect.fn(function* () {
        const builder = yield* RdfBuilder;
        const store = yield* RdfStore;
        yield* store.clear();

        yield* builder
          .inGraph(fixtures.graph1)
          .subject(fixtures.alice)
          .predicate(fixtures.foafName)
          .literal("Alice")
          .add();

        yield* builder.inGraph(fixtures.graph2).subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").add();

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

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice Default").add();

        yield* builder
          .inGraph(fixtures.graph1)
          .subject(fixtures.alice)
          .predicate(fixtures.foafName)
          .literal("Alice Graph1")
          .add();

        const totalSize = yield* store.size;
        strictEqual(totalSize, 2);

        const aliceQuads = yield* store.match(new QuadPattern({ subject: fixtures.alice }));
        strictEqual(A.length(aliceQuads), 2);

        const graph1Quads = yield* store.match(new QuadPattern({ graph: fixtures.graph1 }));
        strictEqual(A.length(graph1Quads), 1);

        const defaultQuad = A.findFirst(aliceQuads, (q: Quad) => q.graph === undefined);
        assertTrue(O.isSome(defaultQuad));
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

        yield* serializer.parseTurtle(turtle, fixtures.graph1);

        const quads = yield* store.getQuads();
        strictEqual(A.length(quads), 2);
        assertTrue(A.every(quads, (q: Quad) => q.graph === fixtures.graph1));

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

        const initialSize = yield* store.size;
        strictEqual(initialSize, 7);

        const turtle = yield* serializer.serialize("Turtle");

        yield* store.clear();
        const clearedSize = yield* store.size;
        strictEqual(clearedSize, 0);

        const count = yield* serializer.parseTurtle(turtle);
        strictEqual(count, 7);

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

        const aliceQuad1 = builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice").build();

        const aliceQuad2 = builder
          .subject(fixtures.alice)
          .predicate(fixtures.foafAge)
          .typedLiteral("30", fixtures.xsdInteger)
          .build();

        const bobQuad1 = builder.subject(fixtures.bob).predicate(fixtures.foafName).literal("Bob").build();

        const bobQuad2 = builder.subject(fixtures.bob).predicate(fixtures.foafKnows).object(fixtures.alice).build();

        yield* builder.batch([aliceQuad1, aliceQuad2, bobQuad1, bobQuad2]);

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

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice Smith").add();

        let nameQuads = yield* store.match(
          new QuadPattern({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
          })
        );
        strictEqual(A.length(nameQuads), 1);
        const firstNameQuad = A.unsafeGet(nameQuads, 0);
        assertTrue(Literal.is(firstNameQuad.object));
        strictEqual(firstNameQuad.object.value, "Alice Smith");

        yield* store.removeQuad(
          new Quad({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
            object: new Literal({ value: "Alice Smith" }),
          })
        );

        yield* builder.subject(fixtures.alice).predicate(fixtures.foafName).literal("Alice Johnson").add();

        nameQuads = yield* store.match(
          new QuadPattern({
            subject: fixtures.alice,
            predicate: fixtures.foafName,
          })
        );
        strictEqual(A.length(nameQuads), 1);
        const updatedNameQuad = A.unsafeGet(nameQuads, 0);
        assertTrue(Literal.is(updatedNameQuad.object));
        strictEqual(updatedNameQuad.object.value, "Alice Johnson");
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

        const size = yield* store.size;
        strictEqual(size, 0);
      })
    );
  });

  effect("parallel layer provisions should be independent", () =>
    Effect.gen(function* () {
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

      strictEqual(result1, 1);
      strictEqual(result2, 0);
    })
  );
});

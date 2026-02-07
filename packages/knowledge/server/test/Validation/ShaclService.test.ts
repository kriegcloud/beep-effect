import { ShaclPolicy } from "@beep/knowledge-domain/value-objects";
import { ShaclService, ShaclServiceLive } from "@beep/knowledge-server/Validation";
import { assertTrue, describe, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as N3 from "n3";

const EX = "http://example.org/";
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

const ontology = `
@prefix ex: <http://example.org/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:Person a owl:Class ; rdfs:label "Person" .
ex:Project a owl:Class ; rdfs:label "Project" .

ex:name a owl:DatatypeProperty, owl:FunctionalProperty ;
  rdfs:label "name" ;
  rdfs:domain ex:Person ;
  rdfs:range xsd:string .

ex:worksOn a owl:ObjectProperty ;
  rdfs:label "worksOn" ;
  rdfs:domain ex:Person ;
  rdfs:range ex:Project .
`;

const createGraph = (): N3.Store => {
  const { namedNode, literal, quad } = N3.DataFactory;
  const graph = new N3.Store();

  graph.addQuad(quad(namedNode(`${EX}alice`), namedNode(RDF_TYPE), namedNode(`${EX}Person`)));
  graph.addQuad(quad(namedNode(`${EX}alice`), namedNode(`${EX}name`), literal("Alice")));
  graph.addQuad(quad(namedNode(`${EX}alice`), namedNode(`${EX}worksOn`), literal("not-a-project")));

  return graph;
};

describe("ShaclService", () => {
  layer(ShaclServiceLive, { timeout: Duration.seconds(30) })("shape generation", (it) => {
    it.effect(
      "generates property shapes from ontology",
      Effect.fn(function* () {
        const service = yield* ShaclService;
        const graph = createGraph();
        const report = yield* service.validateOntologyGraph(graph, "shape-gen", ontology, {
          policy: new ShaclPolicy({ violation: "warn" }),
        });

        assertTrue(report.summary.violationCount >= 1);
      })
    );
  });

  layer(ShaclServiceLive, { timeout: Duration.seconds(30) })("validation rules", (it) => {
    it.effect(
      "detects missing required properties and wrong object types",
      Effect.fn(function* () {
        const service = yield* ShaclService;
        const graph = createGraph();
        graph.removeQuads(
          graph.getQuads(N3.DataFactory.namedNode(`${EX}alice`), N3.DataFactory.namedNode(`${EX}name`), null, null)
        );

        const report = yield* service.validateOntologyGraph(graph, "validation", ontology, {
          policy: new ShaclPolicy({ violation: "warn" }),
        });

        assertTrue(report.summary.violationCount >= 2);
      })
    );

    it.effect(
      "rejects report when policy requires rejection",
      Effect.fn(function* () {
        const service = yield* ShaclService;
        const result = yield* Effect.either(
          service.validateOntologyGraph(createGraph(), "reject", ontology, {
            policy: new ShaclPolicy({ violation: "reject" }),
          })
        );

        strictEqual(result._tag, "Left");
        if (result._tag === "Left") {
          strictEqual(result.left._tag, "ValidationPolicyError");
        }
      })
    );
  });
});

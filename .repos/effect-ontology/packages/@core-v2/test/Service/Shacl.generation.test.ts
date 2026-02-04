/**
 * Tests for SHACL Shape Generation
 *
 * @since 2.0.0
 * @module test/Service/Shacl.generation
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import * as N3 from "n3"
import { TestConfigProvider } from "../../src/Runtime/TestRuntime.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { ShaclService } from "../../src/Service/Shacl.js"
import { StorageServiceTest } from "../../src/Service/Storage.js"

const TestLayer = ShaclService.Default.pipe(
  Layer.provideMerge(RdfBuilder.Default),
  Layer.provideMerge(StorageServiceTest),
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)

const runWithLayer = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.runPromise(Effect.provide(TestLayer)(effect as any))

describe("generateShapesFromOntology", () => {
  const testOntology = `
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix : <http://example.org/> .

    :Person a owl:Class ;
      rdfs:label "Person" .

    :Organization a owl:Class ;
      rdfs:label "Organization" .

    :knows a owl:ObjectProperty ;
      rdfs:domain :Person ;
      rdfs:range :Person .

    :memberOf a owl:ObjectProperty ;
      rdfs:domain :Person ;
      rdfs:range :Organization .
  `

  it("generates NodeShape for each owl:Class", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontologyStore = yield* rdf.parseTurtle(testOntology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const nodeShapes = shapes.getQuads(
          null,
          N3.DataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
          null
        )

        expect(nodeShapes.length).toBe(2)
      })
    ))

  it("sets sh:targetClass correctly", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontologyStore = yield* rdf.parseTurtle(testOntology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const targetClasses = shapes.getQuads(
          null,
          N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#targetClass"),
          null,
          null
        )

        expect(targetClasses.length).toBe(2)
        expect(targetClasses.map((q) => q.object.value)).toContain("http://example.org/Person")
        expect(targetClasses.map((q) => q.object.value)).toContain("http://example.org/Organization")
      })
    ))

  it("generates PropertyShape for owl:ObjectProperty", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontologyStore = yield* rdf.parseTurtle(testOntology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const propLinks = shapes.getQuads(
          null,
          N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
          null,
          null
        )

        expect(propLinks.length).toBe(2)
      })
    ))

  it("sets sh:class constraint for object properties", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontologyStore = yield* rdf.parseTurtle(testOntology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const classConstraints = shapes.getQuads(
          null,
          N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
          null,
          null
        )

        expect(classConstraints.length).toBe(2)
      })
    ))

  it("handles ontology with no classes", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const emptyOntology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix : <http://example.org/> .

          :someProp a owl:DatatypeProperty .
        `

        const ontologyStore = yield* rdf.parseTurtle(emptyOntology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        expect(shapes.size).toBe(0)
      })
    ))

  it("handles class with no properties", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const simpleOntology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix : <http://example.org/> .

          :EmptyClass a owl:Class .
        `

        const ontologyStore = yield* rdf.parseTurtle(simpleOntology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const nodeShapes = shapes.getQuads(
          null,
          N3.DataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
          null
        )
        const propLinks = shapes.getQuads(
          null,
          N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
          null,
          null
        )

        expect(nodeShapes.length).toBe(1)
        expect(propLinks.length).toBe(0)
      })
    ))
})

describe("datatype property conversion", () => {
  const SH_DATATYPE = N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#datatype")
  const SH_NODE_KIND = N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind")
  const SH_LITERAL = N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#Literal")
  const XSD_STRING = N3.DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#string")
  const XSD_INTEGER = N3.DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#integer")
  const XSD_DATE = N3.DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#date")
  const XSD_BOOLEAN = N3.DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean")
  const XSD_DECIMAL = N3.DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#decimal")

  it("generates sh:datatype for owl:DatatypeProperty with xsd:string", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .

          :name a owl:DatatypeProperty ;
            rdfs:domain :Person ;
            rdfs:range xsd:string .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const datatypeConstraints = shapes.getQuads(null, SH_DATATYPE, XSD_STRING, null)
        expect(datatypeConstraints.length).toBe(1)
      })
    ))

  it("generates sh:datatype for owl:DatatypeProperty with xsd:integer", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .

          :age a owl:DatatypeProperty ;
            rdfs:domain :Person ;
            rdfs:range xsd:integer .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const datatypeConstraints = shapes.getQuads(null, SH_DATATYPE, XSD_INTEGER, null)
        expect(datatypeConstraints.length).toBe(1)
      })
    ))

  it("generates sh:datatype for owl:DatatypeProperty with xsd:date", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .

          :birthDate a owl:DatatypeProperty ;
            rdfs:domain :Person ;
            rdfs:range xsd:date .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const datatypeConstraints = shapes.getQuads(null, SH_DATATYPE, XSD_DATE, null)
        expect(datatypeConstraints.length).toBe(1)
      })
    ))

  it("generates sh:datatype for owl:DatatypeProperty with xsd:boolean", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .

          :isActive a owl:DatatypeProperty ;
            rdfs:domain :Person ;
            rdfs:range xsd:boolean .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const datatypeConstraints = shapes.getQuads(null, SH_DATATYPE, XSD_BOOLEAN, null)
        expect(datatypeConstraints.length).toBe(1)
      })
    ))

  it("generates sh:datatype for owl:DatatypeProperty with xsd:decimal", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
          @prefix : <http://example.org/> .

          :Product a owl:Class .

          :price a owl:DatatypeProperty ;
            rdfs:domain :Product ;
            rdfs:range xsd:decimal .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const datatypeConstraints = shapes.getQuads(null, SH_DATATYPE, XSD_DECIMAL, null)
        expect(datatypeConstraints.length).toBe(1)
      })
    ))

  it("defaults to xsd:string when no range specified", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .

          :description a owl:DatatypeProperty ;
            rdfs:domain :Person .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const datatypeConstraints = shapes.getQuads(null, SH_DATATYPE, XSD_STRING, null)
        expect(datatypeConstraints.length).toBe(1)
      })
    ))

  it("sets sh:nodeKind to sh:Literal for datatype properties", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .

          :name a owl:DatatypeProperty ;
            rdfs:domain :Person ;
            rdfs:range xsd:string .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const literalNodeKind = shapes.getQuads(null, SH_NODE_KIND, SH_LITERAL, null)
        expect(literalNodeKind.length).toBe(1)
      })
    ))

  it("handles mixed object and datatype properties on same class", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .
          :Organization a owl:Class .

          :name a owl:DatatypeProperty ;
            rdfs:domain :Person ;
            rdfs:range xsd:string .

          :worksFor a owl:ObjectProperty ;
            rdfs:domain :Person ;
            rdfs:range :Organization .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        // Check for sh:class (ObjectProperty)
        const classConstraints = shapes.getQuads(
          null,
          N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
          null,
          null
        )
        expect(classConstraints.length).toBe(1)

        // Check for sh:datatype (DatatypeProperty)
        const datatypeConstraints = shapes.getQuads(null, SH_DATATYPE, XSD_STRING, null)
        expect(datatypeConstraints.length).toBe(1)

        // Total property shapes should be 2
        const propLinks = shapes.getQuads(
          null,
          N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
          null,
          null
        )
        expect(propLinks.length).toBe(2)
      })
    ))
})

describe("domain/range constraint conversion", () => {
  const SH_CLASS = N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#class")
  const SH_PROPERTY = N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#property")
  const SH_PATH = N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#path")
  const SH_TARGET_CLASS = N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#targetClass")

  it("links property to domain class NodeShape", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .
          :Organization a owl:Class .

          :worksFor a owl:ObjectProperty ;
            rdfs:domain :Person ;
            rdfs:range :Organization .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        // Find PersonShape
        const personShapeQuads = shapes.getQuads(
          N3.DataFactory.namedNode("http://example.org/PersonShape"),
          SH_TARGET_CLASS,
          N3.DataFactory.namedNode("http://example.org/Person"),
          null
        )
        expect(personShapeQuads.length).toBe(1)

        // Verify :worksFor is linked as property
        const propQuads = shapes.getQuads(
          N3.DataFactory.namedNode("http://example.org/PersonShape"),
          SH_PROPERTY,
          null,
          null
        )
        expect(propQuads.length).toBe(1)

        // Verify the property shape has correct path
        const pathQuads = shapes.getQuads(
          propQuads[0].object,
          SH_PATH,
          N3.DataFactory.namedNode("http://example.org/worksFor"),
          null
        )
        expect(pathQuads.length).toBe(1)
      })
    ))

  it("sets sh:class from rdfs:range for ObjectProperty", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .
          :Address a owl:Class .

          :hasAddress a owl:ObjectProperty ;
            rdfs:domain :Person ;
            rdfs:range :Address .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        // Verify sh:class constraint points to :Address
        const classConstraints = shapes.getQuads(
          null,
          SH_CLASS,
          N3.DataFactory.namedNode("http://example.org/Address"),
          null
        )
        expect(classConstraints.length).toBe(1)
      })
    ))

  it("handles multi-domain property - added to all domain NodeShapes", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .
          :Organization a owl:Class .
          :Location a owl:Class .

          :hasLocation a owl:ObjectProperty ;
            rdfs:domain :Person ;
            rdfs:domain :Organization ;
            rdfs:range :Location .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        // Verify PersonShape has :hasLocation property
        const personProps = shapes.getQuads(
          N3.DataFactory.namedNode("http://example.org/PersonShape"),
          SH_PROPERTY,
          null,
          null
        )
        const personHasLocation = personProps.some((q) => {
          const pathQuads = shapes.getQuads(
            q.object,
            SH_PATH,
            N3.DataFactory.namedNode("http://example.org/hasLocation"),
            null
          )
          return pathQuads.length > 0
        })
        expect(personHasLocation).toBe(true)

        // Verify OrganizationShape has :hasLocation property
        const orgProps = shapes.getQuads(
          N3.DataFactory.namedNode("http://example.org/OrganizationShape"),
          SH_PROPERTY,
          null,
          null
        )
        const orgHasLocation = orgProps.some((q) => {
          const pathQuads = shapes.getQuads(
            q.object,
            SH_PATH,
            N3.DataFactory.namedNode("http://example.org/hasLocation"),
            null
          )
          return pathQuads.length > 0
        })
        expect(orgHasLocation).toBe(true)

        // Both should have sh:class :Location
        const classConstraints = shapes.getQuads(
          null,
          SH_CLASS,
          N3.DataFactory.namedNode("http://example.org/Location"),
          null
        )
        expect(classConstraints.length).toBe(2)
      })
    ))

  it("handles property with no domain (not added to any NodeShape)", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .

          :floatingProp a owl:ObjectProperty ;
            rdfs:range :Person .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        // Property without domain should not be added to any NodeShape
        const pathQuads = shapes.getQuads(
          null,
          SH_PATH,
          N3.DataFactory.namedNode("http://example.org/floatingProp"),
          null
        )
        expect(pathQuads.length).toBe(0)
      })
    ))
})

describe("cardinality constraint conversion", () => {
  const SH_MIN_COUNT = N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#minCount")
  const SH_MAX_COUNT = N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount")

  it("owl:FunctionalProperty gets sh:maxCount 1", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .

          :hasSpouse a owl:ObjectProperty, owl:FunctionalProperty ;
            rdfs:domain :Person ;
            rdfs:range :Person .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const maxCountQuads = shapes.getQuads(null, SH_MAX_COUNT, null, null)
        expect(maxCountQuads.length).toBe(1)
        expect(maxCountQuads[0].object.value).toBe("1")
      })
    ))

  it("owl:FunctionalProperty on DatatypeProperty gets sh:maxCount 1", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class .

          :ssn a owl:DatatypeProperty, owl:FunctionalProperty ;
            rdfs:domain :Person ;
            rdfs:range xsd:string .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const maxCountQuads = shapes.getQuads(null, SH_MAX_COUNT, null, null)
        expect(maxCountQuads.length).toBe(1)
        expect(maxCountQuads[0].object.value).toBe("1")
      })
    ))

  it("owl:minCardinality restriction converts to sh:minCount", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class ;
            rdfs:subClassOf [
              a owl:Restriction ;
              owl:onProperty :hasEmail ;
              owl:minCardinality 1
            ] .

          :hasEmail a owl:DatatypeProperty .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const minCountQuads = shapes.getQuads(null, SH_MIN_COUNT, null, null)
        expect(minCountQuads.length).toBe(1)
        expect(minCountQuads[0].object.value).toBe("1")
      })
    ))

  it("owl:maxCardinality restriction converts to sh:maxCount", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Team a owl:Class ;
            rdfs:subClassOf [
              a owl:Restriction ;
              owl:onProperty :hasCaptain ;
              owl:maxCardinality 1
            ] .

          :hasCaptain a owl:ObjectProperty .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const maxCountQuads = shapes.getQuads(null, SH_MAX_COUNT, null, null)
        expect(maxCountQuads.length).toBe(1)
        expect(maxCountQuads[0].object.value).toBe("1")
      })
    ))

  it("owl:cardinality restriction converts to both sh:minCount and sh:maxCount", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Country a owl:Class ;
            rdfs:subClassOf [
              a owl:Restriction ;
              owl:onProperty :hasCapital ;
              owl:cardinality 1
            ] .

          :hasCapital a owl:ObjectProperty .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const minCountQuads = shapes.getQuads(null, SH_MIN_COUNT, null, null)
        const maxCountQuads = shapes.getQuads(null, SH_MAX_COUNT, null, null)

        expect(minCountQuads.length).toBe(1)
        expect(minCountQuads[0].object.value).toBe("1")
        expect(maxCountQuads.length).toBe(1)
        expect(maxCountQuads[0].object.value).toBe("1")
      })
    ))

  it("handles cardinality with larger values", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Team a owl:Class ;
            rdfs:subClassOf [
              a owl:Restriction ;
              owl:onProperty :hasPlayer ;
              owl:minCardinality 11 ;
              owl:maxCardinality 25
            ] .

          :hasPlayer a owl:ObjectProperty .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const minCountQuads = shapes.getQuads(null, SH_MIN_COUNT, null, null)
        const maxCountQuads = shapes.getQuads(null, SH_MAX_COUNT, null, null)

        expect(minCountQuads.length).toBe(1)
        expect(minCountQuads[0].object.value).toBe("11")
        expect(maxCountQuads.length).toBe(1)
        expect(maxCountQuads[0].object.value).toBe("25")
      })
    ))

  it("adds cardinality to existing property shape from domain", () =>
    runWithLayer(
      Effect.gen(function*() {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const ontology = `
          @prefix owl: <http://www.w3.org/2002/07/owl#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix : <http://example.org/> .

          :Person a owl:Class ;
            rdfs:subClassOf [
              a owl:Restriction ;
              owl:onProperty :knows ;
              owl:minCardinality 1
            ] .

          :knows a owl:ObjectProperty ;
            rdfs:domain :Person ;
            rdfs:range :Person .
        `

        const ontologyStore = yield* rdf.parseTurtle(ontology)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        // Should have one property shape (not two)
        const propLinks = shapes.getQuads(
          null,
          N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
          null,
          null
        )
        expect(propLinks.length).toBe(1)

        // With minCount constraint
        const minCountQuads = shapes.getQuads(null, SH_MIN_COUNT, null, null)
        expect(minCountQuads.length).toBe(1)
        expect(minCountQuads[0].object.value).toBe("1")

        // And sh:class from the range
        const classConstraints = shapes.getQuads(
          null,
          N3.DataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
          null,
          null
        )
        expect(classConstraints.length).toBe(1)
      })
    ))
})

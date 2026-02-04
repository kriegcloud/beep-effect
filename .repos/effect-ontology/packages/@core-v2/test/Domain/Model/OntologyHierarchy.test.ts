import { describe, expect, it } from "vitest"
import { ClassDefinition, OntologyContext, PropertyDefinition } from "../../../src/Domain/Model/Ontology.js"
import { type IRI } from "../../../src/Domain/Rdf/Types.js"

describe("OntologyHierarchy", () => {
  // Setup a simple hierarchy: Dog -> Animal
  // Property: hasLegs (domain: Animal)
  // Property: breed (domain: Dog)

  const animalClass = new ClassDefinition({
    id: "http://example.org/Animal" as IRI,
    label: "Animal",
    comment: "Living thing",
    properties: ["http://example.org/hasLegs" as IRI]
  })

  const dogClass = new ClassDefinition({
    id: "http://example.org/Dog" as IRI,
    label: "Dog",
    comment: "Barking thing",
    properties: ["http://example.org/breed" as IRI]
  })

  const hasLegsProp = new PropertyDefinition({
    id: "http://example.org/hasLegs",
    label: "has legs",
    comment: "Number of legs",
    domain: ["Animal"],
    range: ["http://www.w3.org/2001/XMLSchema#integer"],
    rangeType: "datatype"
  })

  const breedProp = new PropertyDefinition({
    id: "http://example.org/breed",
    label: "breed",
    comment: "Dog breed",
    domain: ["Dog"],
    range: ["http://www.w3.org/2001/XMLSchema#string"],
    rangeType: "datatype"
  })

  const ontology = new OntologyContext({
    classes: [animalClass, dogClass],
    properties: [hasLegsProp, breedProp],
    hierarchy: {
      "http://example.org/Dog": ["http://example.org/Animal"]
    }
  })

  it("should return direct properties", () => {
    const props = ontology.getPropertiesForClass("http://example.org/Animal")
    const propIds = props.map((p) => p.id)
    expect(propIds).toContain("http://example.org/hasLegs")
    expect(propIds).not.toContain("http://example.org/breed")
  })

  it("should return inherited properties", () => {
    const props = ontology.getPropertiesForClass("http://example.org/Dog")
    const propIds = props.map((p) => p.id)

    // Direct property
    expect(propIds).toContain("http://example.org/breed")

    // Inherited property - THIS IS EXPECTED TO FAIL CURRENTLY
    expect(propIds).toContain("http://example.org/hasLegs")
  })

  it("should identify subclasses correctly", () => {
    expect(ontology.isSubClassOf("http://example.org/Dog", "http://example.org/Animal")).toBe(true)
    expect(ontology.isSubClassOf("http://example.org/Animal", "http://example.org/Dog")).toBe(false)
  })
})

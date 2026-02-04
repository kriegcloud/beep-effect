/**
 * Tests for Domain Model - Ontology (ClassDefinition, PropertyDefinition)
 *
 * @module test/Domain/Model/Ontology
 */

import { describe, expect, it } from "vitest"
import { ClassDefinition, PropertyDefinition } from "../../../src/Domain/Model/Ontology.js"
import { iri, iris } from "../../Utils/iri.js"

describe("ClassDefinition", () => {
  describe("toDocument", () => {
    it("should include primary label in document", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/Player"),
        label: "Player",
        comment: "A football player",
        properties: []
      })

      const doc = cls.toDocument()

      expect(doc).toContain("Player")
      expect(doc).toContain("A football player")
    })

    it("should include SKOS altLabels in document for search", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/Stadium"),
        label: "Stadium",
        comment: "A sports venue",
        properties: [],
        altLabels: ["arena", "venue", "ground"]
      })

      const doc = cls.toDocument()

      // altLabels should be included for BM25/semantic search
      expect(doc).toContain("arena")
      expect(doc).toContain("venue")
      expect(doc).toContain("ground")
    })

    it("should include SKOS prefLabels in document", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/SoccerPlayer"),
        label: "SoccerPlayer",
        comment: "A soccer player",
        properties: [],
        prefLabels: ["Football Player", "Footballer"]
      })

      const doc = cls.toDocument()

      // prefLabels should be included
      expect(doc).toContain("Football Player")
      expect(doc).toContain("Footballer")
    })

    it("should include SKOS hiddenLabels in document for misspelling matching", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/Team"),
        label: "Team",
        comment: "A sports team",
        properties: [],
        hiddenLabels: ["teem", "squad", "club"]
      })

      const doc = cls.toDocument()

      // hiddenLabels should be included for misspelling/abbreviation matching
      expect(doc).toContain("teem")
      expect(doc).toContain("squad")
      expect(doc).toContain("club")
    })

    it("should include all SKOS labels together", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/Stadium"),
        label: "Stadium",
        comment: "A large sports venue",
        properties: [],
        prefLabels: ["Sports Stadium"],
        altLabels: ["arena", "venue", "ground"],
        hiddenLabels: ["staduim"]
      })

      const doc = cls.toDocument()

      // All SKOS labels should be searchable
      expect(doc).toContain("Sports Stadium")
      expect(doc).toContain("arena")
      expect(doc).toContain("venue")
      expect(doc).toContain("ground")
      expect(doc).toContain("staduim") // misspelling
      expect(doc).toContain("A large sports venue")
    })

    it("should include SKOS definition over rdfs:comment when available", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/Coach"),
        label: "Coach",
        comment: "A coach", // rdfs:comment
        properties: [],
        definition: "A person who trains and instructs athletes" // skos:definition
      })

      const doc = cls.toDocument()

      // skos:definition should be included
      expect(doc).toContain("A person who trains and instructs athletes")
    })

    it("should include SKOS scopeNote when available", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/Player"),
        label: "Player",
        comment: "A player",
        properties: [],
        scopeNote: "Use for professional football players only"
      })

      const doc = cls.toDocument()

      expect(doc).toContain("Use for professional football players only")
    })

    it("should include SKOS example when available", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/Player"),
        label: "Player",
        comment: "A player",
        properties: [],
        example: "Lionel Messi, Cristiano Ronaldo"
      })

      const doc = cls.toDocument()

      expect(doc).toContain("Example: Lionel Messi, Cristiano Ronaldo")
    })

    it("should include SKOS broader/narrower/related concepts", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/Striker"),
        label: "Striker",
        comment: "A forward player",
        properties: [],
        broader: iris(["http://example.org/Forward"]),
        narrower: iris(["http://example.org/CenterForward"]),
        related: iris(["http://example.org/Midfielder"])
      })

      const doc = cls.toDocument()

      expect(doc).toContain("Broader: Forward")
      expect(doc).toContain("Narrower: CenterForward")
      expect(doc).toContain("Related: Midfielder")
    })

    it("should include properties in document", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/Player"),
        label: "Player",
        comment: "A player",
        properties: iris([
          "http://example.org/playsFor",
          "http://example.org/hasPosition"
        ])
      })

      const doc = cls.toDocument()

      expect(doc).toContain("Properties:")
      expect(doc).toContain("playsFor")
      expect(doc).toContain("hasPosition")
    })

    it("should enhance camelCase labels for better search", () => {
      const cls = new ClassDefinition({
        id: iri("http://example.org/SoccerPlayer"),
        label: "SoccerPlayer",
        comment: "A soccer player",
        properties: []
      })

      const doc = cls.toDocument()

      // camelCase should be split for searchability
      expect(doc).toContain("SoccerPlayer")
      expect(doc).toContain("soccer player")
    })
  })
})

describe("PropertyDefinition", () => {
  it("should create property with correct rangeType", () => {
    const objectProp = new PropertyDefinition({
      id: iri("http://example.org/playsFor"),
      label: "plays for",
      comment: "Team the player plays for",
      domain: iris(["http://example.org/Player"]),
      range: iris(["http://example.org/Team"]),
      rangeType: "object"
    })

    const datatypeProp = new PropertyDefinition({
      id: iri("http://example.org/hasAge"),
      label: "has age",
      comment: "Age of the entity",
      domain: [],
      range: [],
      rangeType: "datatype"
    })

    expect(objectProp.rangeType).toBe("object")
    expect(datatypeProp.rangeType).toBe("datatype")
  })
})

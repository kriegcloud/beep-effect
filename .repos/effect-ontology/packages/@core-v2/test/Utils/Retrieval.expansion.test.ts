/**
 * Tests for ontology-aware query expansion
 *
 * @since 2.0.0
 * @module test/Utils/Retrieval.expansion
 */

import { describe, expect, it } from "vitest"
import { buildExpandedQuery, expandQueryWithOntology, type QueryExpansionOptions } from "../../src/Utils/Retrieval.js"

describe("expandQueryWithOntology", () => {
  // Test ontology with classes and properties
  const testOntology = {
    classes: new Map([
      ["Player", {
        label: "Player",
        altLabels: ["athlete", "footballer", "sportsperson"],
        broader: ["Person"],
        narrower: ["Goalkeeper", "Midfielder", "Striker"]
      }],
      ["Team", {
        label: "Team",
        altLabels: ["club", "squad"],
        broader: ["Organization"],
        narrower: []
      }],
      ["Person", {
        label: "Person",
        altLabels: ["individual", "human"],
        broader: [],
        narrower: ["Player", "Coach"]
      }]
    ]),
    properties: new Map([
      ["playsFor", {
        label: "plays for",
        altLabels: ["member of", "belongs to"]
      }],
      ["hasPosition", {
        label: "has position",
        altLabels: ["plays position", "position"]
      }]
    ])
  }

  describe("basic expansion with altLabels", () => {
    it("expands query with class altLabels", () => {
      const result = expandQueryWithOntology("player", testOntology)

      expect(result).toHaveLength(4) // original + 3 altLabels
      expect(result[0]).toEqual({ term: "player", weight: 1.0, source: "original" })
      expect(result.some((t) => t.term === "athlete" && t.source === "altLabel")).toBe(true)
      expect(result.some((t) => t.term === "footballer" && t.source === "altLabel")).toBe(true)
      expect(result.some((t) => t.term === "sportsperson" && t.source === "altLabel")).toBe(true)
    })

    it("expands query with property altLabels", () => {
      const result = expandQueryWithOntology("plays for", testOntology)

      expect(result.length).toBeGreaterThan(1)
      expect(result[0]).toEqual({ term: "plays for", weight: 1.0, source: "original" })
      expect(result.some((t) => t.term === "member of")).toBe(true)
    })

    it("applies synonym weight to expanded terms", () => {
      const result = expandQueryWithOntology("player", testOntology, {
        synonymWeight: 0.7
      })

      const altLabelTerms = result.filter((t) => t.source === "altLabel")
      expect(altLabelTerms.every((t) => t.weight === 0.7)).toBe(true)
    })

    it("returns original term only when no matches", () => {
      const result = expandQueryWithOntology("unknown", testOntology)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ term: "unknown", weight: 1.0, source: "original" })
    })

    it("returns empty array for empty query", () => {
      const result = expandQueryWithOntology("", testOntology)
      expect(result).toHaveLength(0)
    })

    it("returns empty array for whitespace-only query", () => {
      const result = expandQueryWithOntology("   ", testOntology)
      expect(result).toHaveLength(0)
    })
  })

  describe("hierarchy expansion", () => {
    it("includes broader classes when enabled", () => {
      const result = expandQueryWithOntology("player", testOntology, {
        includeBroader: true
      })

      expect(result.some((t) => t.term === "person" && t.source === "broader")).toBe(true)
    })

    it("includes narrower classes when enabled", () => {
      const result = expandQueryWithOntology("player", testOntology, {
        includeNarrower: true
      })

      expect(result.some((t) => t.term === "goalkeeper" && t.source === "narrower")).toBe(true)
      expect(result.some((t) => t.term === "midfielder" && t.source === "narrower")).toBe(true)
      expect(result.some((t) => t.term === "striker" && t.source === "narrower")).toBe(true)
    })

    it("applies hierarchy weight to broader/narrower terms", () => {
      const result = expandQueryWithOntology("player", testOntology, {
        includeBroader: true,
        includeNarrower: true,
        hierarchyWeight: 0.3
      })

      const hierarchyTerms = result.filter((t) => t.source === "broader" || t.source === "narrower")
      expect(hierarchyTerms.every((t) => t.weight === 0.3)).toBe(true)
    })

    it("excludes hierarchy by default", () => {
      const result = expandQueryWithOntology("player", testOntology)

      expect(result.some((t) => t.source === "broader")).toBe(false)
      expect(result.some((t) => t.source === "narrower")).toBe(false)
    })
  })

  describe("deduplication", () => {
    it("does not duplicate terms", () => {
      // "player" appears in original, so altLabel "player" should not be added again
      const result = expandQueryWithOntology("player", testOntology)

      const termCounts = new Map<string, number>()
      for (const t of result) {
        const lower = t.term.toLowerCase()
        termCounts.set(lower, (termCounts.get(lower) ?? 0) + 1)
      }

      // Each unique term should appear exactly once
      for (const count of termCounts.values()) {
        expect(count).toBe(1)
      }
    })
  })

  describe("case insensitivity", () => {
    it("matches regardless of case", () => {
      const resultLower = expandQueryWithOntology("player", testOntology)
      const resultUpper = expandQueryWithOntology("PLAYER", testOntology)
      const resultMixed = expandQueryWithOntology("PlaYeR", testOntology)

      // All should find the same altLabels (original term will differ in case)
      expect(resultLower.filter((t) => t.source === "altLabel").length)
        .toBe(resultUpper.filter((t) => t.source === "altLabel").length)
      expect(resultLower.filter((t) => t.source === "altLabel").length)
        .toBe(resultMixed.filter((t) => t.source === "altLabel").length)
    })
  })

  describe("partial matching", () => {
    it("matches partial label (query in label)", () => {
      // "play" is contained in "Player"
      const result = expandQueryWithOntology("play", testOntology)

      // Should match Player class and get its altLabels
      expect(result.some((t) => t.term === "athlete")).toBe(true)
    })

    it("matches partial label (label in query)", () => {
      // "football player" contains "Player"
      const result = expandQueryWithOntology("football player", testOntology)

      // Should match Player class and get its altLabels
      expect(result.some((t) => t.term === "athlete")).toBe(true)
    })
  })

  describe("custom options", () => {
    it("respects includeAltLabels: false", () => {
      const result = expandQueryWithOntology("player", testOntology, {
        includeAltLabels: false
      })

      expect(result).toHaveLength(1)
      expect(result[0].source).toBe("original")
    })

    it("applies custom original weight", () => {
      const result = expandQueryWithOntology("player", testOntology, {
        originalWeight: 2.0
      })

      expect(result[0].weight).toBe(2.0)
    })
  })
})

describe("buildExpandedQuery", () => {
  const testTerms = [
    { term: "player", weight: 1.0, source: "original" as const },
    { term: "athlete", weight: 0.8, source: "altLabel" as const },
    { term: "footballer", weight: 0.8, source: "altLabel" as const }
  ]

  it("builds simple query string without boosting", () => {
    const result = buildExpandedQuery(testTerms)
    expect(result).toBe("player athlete footballer")
  })

  it("builds query string with Lucene boosting", () => {
    const result = buildExpandedQuery(testTerms, true)
    expect(result).toBe("player^1 athlete^0.8 footballer^0.8")
  })

  it("handles empty terms array", () => {
    const result = buildExpandedQuery([])
    expect(result).toBe("")
  })

  it("handles single term", () => {
    const result = buildExpandedQuery([testTerms[0]])
    expect(result).toBe("player")
  })
})

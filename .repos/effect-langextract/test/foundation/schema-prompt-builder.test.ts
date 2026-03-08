import { describe, expect, it } from "@effect/vitest"

import { buildSchemaPromptDescription } from "../../src/SchemaPromptBuilder.js"

describe("SchemaPromptBuilder", () => {
  it("renders schema class and field guidance", () => {
    const prompt = buildSchemaPromptDescription({
      description: "Extract transfer entities",
      sections: [
        {
          identifier: "player",
          description: "A player in transfer context",
          fields: [
            {
              name: "name",
              type: "string",
              optional: false,
              description: "Full player name"
            },
            {
              name: "club",
              type: "string",
              optional: true
            }
          ],
          examples: [{ name: "Tammy Abraham", club: "Roma" }]
        }
      ]
    })

    expect(prompt).toContain("Extract transfer entities")
    expect(prompt).toContain("extractionClass")
    expect(prompt).toContain("**player**")
    expect(prompt).toContain("name (string, required)")
    expect(prompt).toContain("Tammy Abraham")
  })
})

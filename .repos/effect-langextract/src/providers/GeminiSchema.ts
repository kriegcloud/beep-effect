import { ExampleData } from "../Data.js"

export const createGeminiJsonSchema = (
  examples: ReadonlyArray<ExampleData>
): Record<string, unknown> => ({
  type: "object",
  properties: {
    extractions: {
      type: "array",
      minItems: examples.length > 0 ? 1 : 0,
      items: {
        type: "object"
      }
    }
  },
  required: ["extractions"]
})

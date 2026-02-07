import * as A from "effect/Array";
import * as Str from "effect/String";

export interface SparqlGenerationPromptInput {
  readonly question: string;
  readonly schemaContext: string;
  readonly attempt: number;
  readonly feedback: ReadonlyArray<string>;
}

export const SPARQL_GENERATION_SYSTEM_PROMPT = `You generate SPARQL for a read-only RDF knowledge graph.

Rules:
- Return ONLY a SPARQL query string
- Allowed query types: SELECT, ASK, CONSTRUCT, DESCRIBE
- Forbidden operations: INSERT, DELETE, UPDATE, LOAD, CLEAR, CREATE, DROP, MOVE, COPY, ADD
- Prefer SELECT unless ASK is clearly better
- Use GRAPH clauses only when needed
- Keep query concise and syntactically valid` as const;

export const buildSparqlGenerationUserPrompt = (input: SparqlGenerationPromptInput): string => {
  const feedback = A.isNonEmptyReadonlyArray(input.feedback)
    ? `Previous parser feedback:\n${A.join(
        A.map(input.feedback, (f) => `- ${f}`),
        "\n"
      )}\n\n`
    : "";

  return A.join(
    [
      `Attempt: ${input.attempt}`,
      `Question: ${Str.trim(input.question)}`,
      `Schema context:\n${input.schemaContext}`,
      feedback,
      "Produce one read-only SPARQL query now.",
    ],
    "\n\n"
  );
};

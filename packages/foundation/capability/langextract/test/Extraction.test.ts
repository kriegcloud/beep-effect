import { LangExtractError, parseModelOutput } from "@beep/langextract/Extraction";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("parseModelOutput", () => {
  it.effect(
    "decodes fenced JSON objects",
    Effect.fnUntraced(function* () {
      const candidates = yield* parseModelOutput(`\`\`\`json
{"extractions":[{"label":"person","text":"Alice","confidence":0.9}]}
\`\`\``);

      expect(candidates).toHaveLength(1);
      expect(candidates[0]?.label).toBe("person");
      expect(candidates[0]?.confidence).toBe(0.9);
    })
  );

  it.effect(
    "decodes top-level arrays",
    Effect.fnUntraced(function* () {
      const candidates = yield* parseModelOutput(`[{"label":"organization","text":"Acme"}]`);

      expect(candidates).toHaveLength(1);
      expect(candidates[0]?.text).toBe("Acme");
    })
  );

  it.effect(
    "maps invalid output to a typed LangExtract error",
    Effect.fnUntraced(function* () {
      const error = yield* parseModelOutput(`{"extractions":[{"label":"","text":"Alice"}]}`).pipe(Effect.flip);

      expect(error).toBeInstanceOf(LangExtractError);
      expect(error.reason).toBe("model-output-schema-invalid");
    })
  );
});

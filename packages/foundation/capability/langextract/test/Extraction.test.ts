import { LangExtractError, LangExtractRequest, parseModelOutput } from "@beep/langextract/Extraction";
import { ExtractionTarget } from "@beep/langextract/Target";
import { DocumentId } from "@beep/nlp/Core";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

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
      expect(error.details?.cause).toBe("schema-decode-failed");
    })
  );

  it.effect(
    "maps malformed JSON to a parse failure",
    Effect.fnUntraced(function* () {
      const error = yield* parseModelOutput(`{"extractions":[`).pipe(Effect.flip);

      expect(error).toBeInstanceOf(LangExtractError);
      expect(error.reason).toBe("model-output-parse-failed");
      expect(error.details?.cause).toBe("json-parse-failed");
    })
  );

  it.effect(
    "requires at least one extraction target",
    Effect.fnUntraced(function* () {
      const error = yield* S.decodeUnknownEffect(LangExtractRequest)({
        documentId: DocumentId.make("doc-1"),
        targets: [],
        text: "Alice founded Acme.",
      }).pipe(Effect.flip);

      expect(error).toBeDefined();

      const request = yield* S.decodeUnknownEffect(LangExtractRequest)({
        documentId: DocumentId.make("doc-1"),
        targets: [ExtractionTarget.make({ kind: "entity", name: "person" })],
        text: "Alice founded Acme.",
      });

      expect(request.targets).toHaveLength(1);
    })
  );
});

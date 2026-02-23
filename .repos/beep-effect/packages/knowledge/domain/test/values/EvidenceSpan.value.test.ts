import { EvidenceSpanFromStorage } from "@beep/knowledge-domain/values";
import { describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const decodeEvidenceSpan = S.decodeUnknown(EvidenceSpanFromStorage);

describe("EvidenceSpanFromStorage", () => {
  effect("decodes object evidence payloads", () =>
    Effect.gen(function* () {
      const decoded = yield* decodeEvidenceSpan({
        text: "conference call",
        startChar: 10,
        endChar: 25,
      });

      strictEqual(decoded.text, "conference call");
      strictEqual(decoded.startChar, 10);
      strictEqual(decoded.endChar, 25);
    })
  );

  effect("decodes legacy JSON-stringified evidence payloads", () =>
    Effect.gen(function* () {
      const decoded = yield* decodeEvidenceSpan(
        '{"text":"conference call","startChar":10,"endChar":25,"confidence":0.91}'
      );

      strictEqual(decoded.text, "conference call");
      strictEqual(decoded.startChar, 10);
      strictEqual(decoded.endChar, 25);
      strictEqual(decoded.confidence, 0.91);
    })
  );

  effect("decodes legacy plain-text evidence payloads with inferred offsets", () =>
    Effect.gen(function* () {
      const decoded = yield* decodeEvidenceSpan("conference call");

      strictEqual(decoded.text, "conference call");
      strictEqual(decoded.startChar, 0);
      strictEqual(decoded.endChar, "conference call".length);
    })
  );
});

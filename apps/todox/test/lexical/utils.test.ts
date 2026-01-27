import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

import { docFromHash, docToHash, sanitizeUrl, validateUrl } from "../../src/app/lexical/utils";

// ============================================
// docSerialization tests
// ============================================

effect("docToHash produces hash string starting with #doc=", () =>
  Effect.gen(function* () {
    const doc = {
      editorState: { root: { type: "root", version: 1 } },
      lastSaved: Date.now(),
      source: "Lexical",
    };
    const hash = yield* docToHash(doc as any);
    strictEqual(hash.startsWith("#doc="), true);
  })
);

effect("docFromHash returns InvalidDocumentHashError for invalid hash", () =>
  Effect.gen(function* () {
    const result = yield* Effect.either(docFromHash("invalid"));
    strictEqual(result._tag, "Left");
    if (result._tag === "Left") {
      strictEqual(result.left._tag.endsWith("InvalidDocumentHashError"), true);
    }
  })
);

effect("docToHash and docFromHash round-trip preserves data", () =>
  Effect.gen(function* () {
    const original = {
      editorState: { root: { type: "root", version: 1 } },
      lastSaved: 1234567890,
      source: "Test",
    };
    const hash = yield* docToHash(original as any);
    const restored = yield* docFromHash(hash);
    strictEqual(restored.lastSaved, original.lastSaved);
    strictEqual(restored.source, original.source);
  })
);

// ============================================
// url tests
// ============================================

effect("sanitizeUrl returns about:blank for javascript: protocol", () =>
  Effect.sync(() => {
    // eslint-disable-next-line no-script-url
    const result = sanitizeUrl("javascript:alert(1)");
    strictEqual(result, "about:blank");
  })
);

effect("sanitizeUrl allows https: protocol", () =>
  Effect.sync(() => {
    const result = sanitizeUrl("https://example.com");
    strictEqual(result, "https://example.com");
  })
);

effect("sanitizeUrl allows mailto: protocol", () =>
  Effect.sync(() => {
    const result = sanitizeUrl("mailto:test@example.com");
    strictEqual(result, "mailto:test@example.com");
  })
);

effect("validateUrl returns true for valid URL", () =>
  Effect.sync(() => {
    strictEqual(validateUrl("https://example.com/path?query=1"), true);
  })
);

effect("validateUrl returns true for https:// placeholder", () =>
  Effect.sync(() => {
    strictEqual(validateUrl("https://"), true);
  })
);

effect("validateUrl returns false for invalid URL", () =>
  Effect.sync(() => {
    strictEqual(validateUrl("not a url"), false);
  })
);

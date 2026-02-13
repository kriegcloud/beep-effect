import type {
  SerializedEditorStateEnvelope,
  SerializedElementNodeEnvelope,
  SerializedTextNodeEnvelope,
} from "@beep/workspaces-domain/value-objects";
import { LexicalValidation, LexicalValidationError } from "@beep/workspaces-server/services";
import { assertTrue, describe, effect } from "@beep/testkit";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";

const TestLayer = LexicalValidation.Default;

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const emptyEditorState: SerializedEditorStateEnvelope.Encoded = {
  root: {
    type: "root",
    version: 1,
    direction: null,
    format: "",
    indent: 0,
    children: [],
  },
};

const textNode: SerializedTextNodeEnvelope.Encoded = {
  type: "text",
  version: 1,
  text: "Hello, world!",
  format: 0,
  detail: 0,
  mode: "normal",
  style: "",
};

const paragraphNode: SerializedElementNodeEnvelope.Type = {
  type: "paragraph",
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: [textNode],
};

const editorStateWithContent: SerializedEditorStateEnvelope.Encoded = {
  root: {
    type: "root",
    version: 1,
    direction: "ltr",
    format: "",
    indent: 0,
    children: [paragraphNode],
  },
};

const malformedEditorState: SerializedEditorStateEnvelope.Encoded = {
  root: {
    type: "root",
    version: 99999,
    direction: null,
    format: "",
    indent: 0,
    children: [{ type: "__nonexistent_node_type__", version: 1 }],
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LexicalValidation", () => {
  effect("returns true for a valid empty editor state", () =>
    Effect.gen(function* () {
      const service = yield* LexicalValidation;
      const result = yield* service.validate(emptyEditorState);
      assertTrue(result);
    }).pipe(Effect.provide(TestLayer))
  );

  effect("returns true for a valid editor state with a paragraph and text", () =>
    Effect.gen(function* () {
      const service = yield* LexicalValidation;
      const result = yield* service.validate(editorStateWithContent);
      assertTrue(result);
    }).pipe(Effect.provide(TestLayer))
  );

  effect("fails with LexicalValidationError for a malformed state", () =>
    Effect.gen(function* () {
      const service = yield* LexicalValidation;
      const exit = yield* Effect.exit(service.validate(malformedEditorState));

      assertTrue(Exit.isFailure(exit));

      if (Exit.isFailure(exit)) {
        const failures = Cause.failures(exit.cause);
        assertTrue(Chunk.some(failures, (e) => e instanceof LexicalValidationError));
      }
    }).pipe(Effect.provide(TestLayer))
  );
});

import type { SerializedEditorStateEnvelope } from "@beep/documents-domain/value-objects";
import { $DocumentsServerId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $DocumentsServerId.create("services/LexicalValidation");

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export class LexicalValidationError extends S.TaggedError<LexicalValidationError>()("LexicalValidationError", {
  message: S.String,
  cause: S.optional(S.Defect),
}) {}

// ---------------------------------------------------------------------------
// Service shape
// ---------------------------------------------------------------------------

interface LexicalValidationShape {
  readonly validate: (state: SerializedEditorStateEnvelope.Encoded) => Effect.Effect<boolean, LexicalValidationError>;
}

// ---------------------------------------------------------------------------
// Service implementation
// ---------------------------------------------------------------------------

/**
 * Headless Lexical validation service.
 *
 * Creates a headless Lexical editor instance (no DOM required) and attempts to
 * parse the provided serialized editor state. If the state can be deserialized
 * without error, validation succeeds.
 *
 * NOTE: Only built-in Lexical node types are registered (ParagraphNode,
 * TextNode, LineBreakNode, TabNode). Full PlaygroundNode registration would
 * require importing 37+ node types from `apps/todox/`, which violates
 * architecture boundaries (shared package depending on an app).
 *
 * To support full node validation, either:
 * 1. Extract node registrations to a shared package (e.g., `@beep/lexical-nodes`)
 * 2. Accept a node list parameter in the service constructor
 */
export class LexicalValidation extends Effect.Service<LexicalValidation>()($I`LexicalValidation`, {
  accessors: true,
  dependencies: [],
  effect: Effect.gen(function* () {
    // Lazy-load @lexical/headless — keeps the dependency tree light for
    // consumers that never call `validate`, and isolates import failures.
    const headlessModule = yield* Effect.tryPromise({
      try: () => import("@lexical/headless"),
      catch: (e) =>
        new LexicalValidationError({
          message: "Failed to load @lexical/headless module",
          cause: e,
        }),
    });

    const { createHeadlessEditor } = headlessModule;

    const validate: LexicalValidationShape["validate"] = Effect.fn("LexicalValidation.validate")(function* (state) {
      yield* Effect.annotateCurrentSpan("lexical.rootType", state.root.type);
      yield* Effect.annotateCurrentSpan("lexical.rootChildrenCount", state.root.children.length);

      // Create a fresh headless editor per validation call.
      // Only built-in nodes are registered — TextNode, LineBreakNode,
      // and TabNode are auto-registered by Lexical core.
      //
      // We call parseEditorState only (not setEditorState) because
      // setEditorState triggers a reconciliation cycle that hangs
      // in headless Bun environments without a DOM. parseEditorState
      // alone is sufficient: it deserializes the JSON into Lexical's
      // internal EditorState graph, which proves the state is
      // structurally valid. Unknown node types are surfaced via
      // the onError callback.
      const result = yield* Effect.try({
        try: () => {
          let capturedError: unknown = undefined;

          const editor = createHeadlessEditor({
            nodes: [],
            onError: (error: unknown) => {
              capturedError = error;
            },
          });

          // parseEditorState accepts a JSON string or a SerializedEditorState.
          // We pass a string because our envelope schema types are
          // structurally close but not assignment-compatible with
          // Lexical's internal SerializedEditorState type.
          editor.parseEditorState(JSON.stringify(state));

          if (capturedError !== undefined) {
            throw capturedError;
          }

          return true;
        },
        catch: (error) =>
          new LexicalValidationError({
            message: "Lexical headless validation failed: editor could not deserialize the provided state",
            cause: error,
          }),
      });

      return result;
    });

    return { validate } satisfies LexicalValidationShape;
  }),
}) {}

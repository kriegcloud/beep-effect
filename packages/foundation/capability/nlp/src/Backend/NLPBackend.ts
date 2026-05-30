/**
 * Pluggable NLP backend interface.
 *
 * Defines the abstract contract every NLP backend (wink-nlp, CoreNLP, spaCy, an
 * LLM adapter, ...) implements so the capability can swap engines while keeping a
 * stable API. Backends form a category: objects are backends, morphisms are
 * adapters/wrappers, and composition enables fallback strategies.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * `Data.TaggedError` becomes {@link @beep/schema#TaggedErrorClass} scoped by a
 * {@link @beep/identity#$NlpId} composer, `Context.GenericTag` becomes the
 * `Context.Service` class form used across this package, and `Object.keys`
 * becomes `Struct.keys`.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { A } from "@beep/utils";
import { Context, Inspectable, pipe, Struct } from "effect";
import * as S from "effect/Schema";
import type * as Effect from "effect/Effect";
import type * as GraphSchema from "../Graph/Schema.ts";

const $I = $NlpId.create("Backend/NLPBackend");

const renderCause = (cause: unknown): string => Inspectable.toStringUnknown(cause);

/**
 * Failure raised when a backend does not support a requested operation.
 *
 * @example
 * ```ts
 * import { BackendNotSupported } from "@beep/nlp/Backend/NLPBackend"
 *
 * console.log(BackendNotSupported)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class BackendNotSupported extends TaggedErrorClass<BackendNotSupported>($I`BackendNotSupported`)(
  "BackendNotSupported",
  {
    backend: S.String,
    message: S.String,
    operation: S.String,
  },
  $I.annote("BackendNotSupported", {
    description: "Failure raised when an NLP backend does not support a requested operation.",
  })
) {}

/**
 * Failure raised when a backend fails to initialize.
 *
 * @example
 * ```ts
 * import { BackendInitError } from "@beep/nlp/Backend/NLPBackend"
 *
 * console.log(BackendInitError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class BackendInitError extends TaggedErrorClass<BackendInitError>($I`BackendInitError`)(
  "BackendInitError",
  {
    backend: S.String,
    cause: S.DefectWithStack,
    message: S.String,
  },
  $I.annote("BackendInitError", {
    description: "Failure raised when an NLP backend fails to initialize.",
  })
) {}

/**
 * Failure raised when a backend operation fails at runtime.
 *
 * @example
 * ```ts
 * import { BackendOperationError } from "@beep/nlp/Backend/NLPBackend"
 *
 * console.log(BackendOperationError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class BackendOperationError extends TaggedErrorClass<BackendOperationError>($I`BackendOperationError`)(
  "BackendOperationError",
  {
    backend: S.String,
    cause: S.DefectWithStack,
    message: S.String,
    operation: S.String,
  },
  $I.annote("BackendOperationError", {
    description: "Failure raised when an NLP backend operation fails at runtime.",
  })
) {}

/**
 * Union of all backend failures.
 *
 * @example
 * ```ts
 * import type { NLPBackendError } from "@beep/nlp/Backend/NLPBackend"
 *
 * type Example = NLPBackendError
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export const NLPBackendError = S.Union([BackendNotSupported, BackendInitError, BackendOperationError]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("NLPBackendError", {
    description: "A backend failure.",
  })
);

export type NLPBackendError = typeof NLPBackendError.Type;

/**
 * Capabilities a backend may or may not support, enabling runtime capability
 * detection and graceful degradation.
 *
 * @since 0.0.0
 * @category models
 */
export interface BackendCapabilities {
  /** Constituency parsing (phrase structure). */
  readonly constituencyParsing: boolean;
  /** Coreference resolution (entity mention linking). */
  readonly coreferenceResolution: boolean;
  /** Dependency parsing (syntactic structure). */
  readonly dependencyParsing: boolean;
  /** Lemmatization (morphological normalization). */
  readonly lemmatization: boolean;
  /** Named entity recognition (PERSON, ORG, LOC, ...). */
  readonly ner: boolean;
  /** Part-of-speech tagging. */
  readonly posTagging: boolean;
  /** Semantic relation extraction. */
  readonly relationExtraction: boolean;
  /** Sentence boundary detection. */
  readonly sentencization: boolean;
  /** Basic tokenization (word segmentation). */
  readonly tokenization: boolean;
}

/**
 * Structural shape of the {@link NLPBackend} service.
 *
 * Operations a backend does not support should fail with
 * {@link BackendNotSupported}. The annotation operations are functors over text:
 * `posTag`/`lemmatize` preserve token structure, `extractEntities`/
 * `extractRelations` surface semantic spans.
 *
 * @since 0.0.0
 * @category models
 */
export interface NLPBackendShape {
  /** Capabilities this backend supports. */
  readonly capabilities: BackendCapabilities;
  /** Extract named entities (functor `Text -> [Entity]`). */
  readonly extractEntities: (text: string) => Effect.Effect<ReadonlyArray<GraphSchema.EntityNode>, NLPBackendError>;
  /** Extract semantic relations between entities. */
  readonly extractRelations: (text: string) => Effect.Effect<ReadonlyArray<GraphSchema.RelationNode>, NLPBackendError>;
  /** Lemmatize tokens to canonical forms (forgetful functor `[Token] -> [Lemma]`). */
  readonly lemmatize: (text: string) => Effect.Effect<ReadonlyArray<GraphSchema.LemmaNode>, NLPBackendError>;
  /** Backend name (e.g. `"wink-nlp"`, `"stanford-corenlp"`, `"spacy"`). */
  readonly name: string;
  /** Parse syntactic dependencies (functor `Sentence -> Graph<Token, Dependency>`). */
  readonly parseDependencies: (
    sentence: string
  ) => Effect.Effect<ReadonlyArray<GraphSchema.DependencyNode>, NLPBackendError>;
  /** Tag tokens with part-of-speech labels (functor `[Token] -> [POSNode]`). */
  readonly posTag: (text: string) => Effect.Effect<ReadonlyArray<GraphSchema.POSNode>, NLPBackendError>;
  /** Split text into sentences (free functor `Text -> [Sentence]`). */
  readonly sentencize: (text: string) => Effect.Effect<ReadonlyArray<string>, NLPBackendError>;
  /** Split text into tokens (free functor `Text -> [Token]`). */
  readonly tokenize: (text: string) => Effect.Effect<ReadonlyArray<string>, NLPBackendError>;
}

/**
 * Service tag for the pluggable {@link NLPBackendShape} backend.
 *
 * @example
 * ```ts
 * import { NLPBackend } from "@beep/nlp/Backend/NLPBackend"
 *
 * console.log(NLPBackend.key)
 * ```
 *
 * @since 0.0.0
 * @category services
 */
export class NLPBackend extends Context.Service<NLPBackend, NLPBackendShape>()($I`NLPBackend`) {}

/**
 * Check whether a backend supports a specific capability.
 *
 * @since 0.0.0
 * @category utils
 */
export const supportsCapability = (backend: NLPBackendShape, capability: keyof BackendCapabilities): boolean =>
  backend.capabilities[capability];

/**
 * List all capabilities a backend supports.
 *
 * @since 0.0.0
 * @category utils
 */
export const getSupportedCapabilities = (backend: NLPBackendShape): ReadonlyArray<keyof BackendCapabilities> =>
  pipe(
    Struct.keys(backend.capabilities),
    A.filter((cap) => backend.capabilities[cap])
  );

/**
 * Construct a {@link BackendNotSupported} failure.
 *
 * @since 0.0.0
 * @category constructors
 */
export const notSupported = (backend: string, operation: string, message?: string): BackendNotSupported =>
  BackendNotSupported.make({
    backend,
    operation,
    message: message ?? `Backend ${backend} does not support ${operation}`,
  });

/**
 * Construct a {@link BackendInitError} from an unknown cause.
 *
 * @since 0.0.0
 * @category constructors
 */
export const initError = (backend: string, cause: unknown): BackendInitError =>
  BackendInitError.make({
    backend,
    cause,
    message: `Backend ${backend} failed to initialize: ${renderCause(cause)}`,
  });

/**
 * Construct a {@link BackendOperationError} from an unknown cause.
 *
 * @since 0.0.0
 * @category constructors
 */
export const operationError = (backend: string, operation: string, cause: unknown): BackendOperationError =>
  BackendOperationError.make({
    backend,
    cause,
    message: `Backend ${backend} operation ${operation} failed: ${renderCause(cause)}`,
    operation,
  });

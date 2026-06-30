/**
 * Schema-first models of Lexical serialized editor state with Md ↔ Lexical
 * codecs.
 *
 * @packageDocumentation \@beep/lexical-schema
 * @since 0.0.0
 */

/**
 * Package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/lexical-schema"
 *
 * console.log(VERSION) // "0.0.0"
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * Pure plain-text projections over serialized Lexical state.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { LexicalNode, nodeToPlainText } from "@beep/lexical-schema"
 *
 * const node = S.decodeUnknownSync(LexicalNode)({ type: "linebreak", version: 1 })
 * console.log(JSON.stringify(nodeToPlainText(node))) // "\"\\n\""
 * ```
 *
 * @since 0.0.0
 * @category getters
 */
export * from "./Lexical.behavior.ts";
/**
 * Md ↔ Lexical codecs over the canonical `@beep/md` AST.
 *
 * @example
 * ```ts
 * import { ARTIFACT_URI_PREFIX } from "@beep/lexical-schema"
 *
 * console.log(ARTIFACT_URI_PREFIX) // "artifact://"
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export * from "./Lexical.codec.ts";
/**
 * Schema-first models of Lexical's serialized editor state.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { LexicalNode } from "@beep/lexical-schema"
 *
 * const node = S.decodeUnknownSync(LexicalNode)({ type: "linebreak", version: 1 })
 * console.log(node.type) // "linebreak"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * from "./Lexical.model.ts";

/**
 * Schema-first models of Lexical serialized editor state with Md ↔ Lexical
 * codecs.
 *
 * @packageDocumentation \@beep/lexical-schema
 * @since 0.0.0
 */

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

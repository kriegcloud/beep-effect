/**
 * JSDoc metadata models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { SchemaAST } from "effect";
import type * as S from "effect/Schema";
import type { JSDocTagDefinition } from "./JSDocTagDefinition.model.js";

/**
 * The payload type stored in the `jsDocTagMetadata` annotation key.
 *
 * @example
 * ```ts
 * import type { JSDocTagAnnotationPayload } from "@beep/repo-utils/JSDoc/models/JSDocTagAnnotation.model"
 *
 * type Example = JSDocTagAnnotationPayload
 * const accept = <A extends Example>(value: A): A => value
 * console.log(accept)
 * ```
 * @category models
 * @since 0.0.0
 */
export type JSDocTagAnnotationPayload = JSDocTagDefinition;

declare module "effect/Schema" {
  namespace Annotations {
    interface Annotations {
      readonly jsDocTagMetadata?: JSDocTagAnnotationPayload | undefined;
    }
  }
}

/**
 * Retrieve the JSDoc tag metadata annotation from a schema, if present.
 *
 * @param schema - Any Effect schema.
 * @returns The JSDocTagDefinition metadata or `undefined`.
 * @example
 * ```ts
 * import { JSDocTagDefinition, make } from "@beep/repo-utils/JSDoc/models/JSDocTagDefinition.model"
 * import { getJSDocTagMetadata } from "@beep/repo-utils/JSDoc/models/JSDocTagAnnotation.model"
 *
 * const meta: Omit<JSDocTagDefinition.Encoded, "_tag"> = {
 *   synonyms: [],
 *   overview: "Documents a function parameter.",
 *   tagKind: "block",
 *   specifications: ["tsdocCore"],
 *   applicableTo: ["function"],
 *   astDerivable: "partial",
 *   astDerivableNote: "Parameter names are AST-derived; prose is authored.",
 *   parameters: {
 *     syntax: "@param name - description",
 *     acceptsType: false,
 *     acceptsName: true,
 *     acceptsDescription: true
 *   },
 *   relatedTags: ["typeParam"],
 *   example: "@param input - Raw input value."
 * }
 * const tagSchema = make("param", meta)
 * const metadata = getJSDocTagMetadata(tagSchema)
 * console.log(metadata?._tag)
 * ```
 * @category models
 * @since 0.0.0
 */
export const getJSDocTagMetadata = (schema: S.Top): JSDocTagAnnotationPayload | undefined =>
  SchemaAST.resolve(schema.ast)?.jsDocTagMetadata;

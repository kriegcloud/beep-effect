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
 *
 * @example
 * ```ts
 * import type { JSDocTagAnnotationPayload } from "@beep/repo-utils/JSDoc/models/JSDocTagAnnotation.model"
 *
 * type Example = JSDocTagAnnotationPayload
 * const accept = <A extends Example>(value: A): A => value
 * void accept
 * ```
 *
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
 *
 * @example
 * ```ts
 * import { getJSDocTagMetadata } from "@beep/repo-utils/JSDoc/models/JSDocTagAnnotation.model"
 *
 * void getJSDocTagMetadata
 * ```
 * * @param schema - Any Effect schema.
 * @returns The JSDocTagDefinition metadata or `undefined`.
 * @category models
 * @since 0.0.0
 */
export const getJSDocTagMetadata = (schema: S.Top): JSDocTagAnnotationPayload | undefined =>
  SchemaAST.resolve(schema.ast)?.jsDocTagMetadata;

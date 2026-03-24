import * as S from "effect/Schema";
import type { JSDocTagDefinition } from "./JSDocTagDefinition.model.js";

/**
 * The payload type stored in the `jsDocTagMetadata` annotation key.
 *
 * @category DomainModel
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
 * @category DomainModel
 * @since 0.0.0
 */
export const getJSDocTagMetadata = (schema: S.Top): JSDocTagAnnotationPayload | undefined =>
  S.resolveInto(schema)?.jsDocTagMetadata;

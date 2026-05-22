/**
 * Internal support for HTTP status schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";

/**
 * Internal identity composer for HTTP status schemas.
 *
 * @internal
 * @category symbols
 * @since 0.0.0
 */
export const $I = $SchemaId.create("HttpStatus");

declare module "effect/Schema" {
  namespace Annotations {
    interface Augment {
      readonly emoji?: undefined | string;
    }
  }
}

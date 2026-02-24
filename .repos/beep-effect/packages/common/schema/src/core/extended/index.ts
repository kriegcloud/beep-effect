/**
 * Public exports for the core extended schema helpers.
 *
 * Use this surface to import Struct/Array/Tuple wrappers with batching enabled.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Extended } from "@beep/schema/core";
 *
 * const schema = Extended.Struct({ id: S.String });
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export * from "./extended-schemas";

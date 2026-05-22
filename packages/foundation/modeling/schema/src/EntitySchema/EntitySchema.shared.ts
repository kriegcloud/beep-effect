/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";

/**
 * Internal identity composer.
 *
 *
 * @internal
 * @category symbols
 * @since 0.0.0
 */
export const $I = $SchemaId.create("EntitySchema");
/**
 * Entity schema definition annotation key.
 *
 *
 * @internal
 * @category symbols
 * @since 0.0.0
 */
export const DefinitionAnnotationKey = "@beep/schema/EntitySchema/definition" as const;

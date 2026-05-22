/**
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "../LiteralKit/index.ts";

const $I = $SchemaId.create("Sex");

/**
 * The sex of a person ("male" or "female").
 *
 * @since 0.0.0
 * @category validation
 */
export const Sex = LiteralKit(["male", "female"]).pipe(
  $I.annoteSchema("Sex", {
    description: 'The sex of a person ("male" or "female").',
  })
);
/**
 * {@inheritDoc Sex}
 *
 * @category validation
 * @since 0.0.0
 */
export type Sex = typeof Sex.Type;

/**
 * Public aliases for concise namespace roles.
 *
 * @category schemas
 * @since 0.0.0
 */
export { Sex as Schema };

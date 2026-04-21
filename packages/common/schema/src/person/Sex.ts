/**
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "../LiteralKit.ts";

const $I = $SchemaId.create("person/Sex");

/**
 * The sex of a person ("male" or "female").
 *
 * @since 0.0.0
 * @category Validation
 */
export const Sex = LiteralKit(["male", "female"]).pipe(
  $I.annoteSchema("Sex", {
    description: 'The sex of a person ("male" or "female").',
  })
);
/**
 * {@inheritDoc Sex}
 *
 * @category Validation
 * @since 0.0.0
 */
export type Sex = typeof Sex.Type;

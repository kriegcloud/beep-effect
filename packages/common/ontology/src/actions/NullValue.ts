/**
 * Null-value sentinel used by action parameter helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/actions/NullValue
 */

/**
 * Sentinel value indicating explicit null parameter intent.
 *
 * @since 0.0.0
 * @category constants
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("actions/NullValue");
export const NULL_VALUE = Symbol.for("NULL_VALUE");

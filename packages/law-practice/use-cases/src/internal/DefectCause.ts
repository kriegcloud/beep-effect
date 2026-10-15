/**
 * Optional diagnostic cause field shared by this package's typed errors.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import { SchemaUtils } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

/**
 * Optional captured defect kept on a typed error for diagnostics only.
 *
 * **Details**
 *
 * Encodes as an optional key and decodes to `Option`; the constructor
 * defaults it to `None`. Equivalence ignores the cause, so two errors that
 * differ only in their captured defect compare equal. Callers branch on the
 * error's own fields, never on the cause.
 *
 * **Example** (Default an absent cause)
 *
 * ```ts
 * import * as S from "effect/Schema"
 * import { DefectCause } from "./DefectCause.ts"
 *
 * const Failure = S.Struct({ cause: DefectCause })
 * console.log(Failure.make({}).cause._tag) // "None"
 * ```
 *
 * @internal
 * @category schemas
 * @since 0.0.0
 */
export const DefectCause = S.OptionFromOptionalKey(
  S.Defect({ includeStack: true }).pipe(S.overrideToEquivalence(SchemaUtils.alwaysEquivalent))
).pipe(S.withConstructorDefault(Effect.succeedNone));

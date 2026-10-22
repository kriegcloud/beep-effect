/**
 * Row grammar of the identity shape-stability test that delete-package rewrites.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Str } from "@beep/utils";
import { pipe } from "effect/Function";
import * as O from "effect/Option";

/**
 * Repo-relative path of the identity shape-stability test.
 *
 * @internal
 * @category configuration
 * @since 0.0.0
 */
export const IDENTITY_SHAPE_TEST_PATH = "packages/foundation/modeling/identity/test/shape-stable.test.ts";

/**
 * Read the identity accessor that one shape-test row names.
 *
 * **Details**
 *
 * A row is an array element (`"$SchemaId",`) or a record key
 * (`$SchemaId: "@beep/schema",`). Any other line yields `None` or a token that
 * is not an accessor, so callers compare the result with the exact accessor.
 *
 * **Example** (Read a record-row accessor)
 *
 * ```ts
 * import { shapeTestRowAccessor } from "@beep/repo-cli/commands/DeletePackage/internal/ShapeTestRow"
 *
 * console.log(shapeTestRowAccessor('  $SchemaId: "@beep/schema",')) // Option.some("$SchemaId")
 * ```
 *
 * @internal
 * @param line - One line of the shape-stability test.
 * @returns The named accessor, or `None` when the line is not a row.
 * @category parsing
 * @since 0.0.0
 */
export const shapeTestRowAccessor = (line: string): O.Option<string> => {
  const row = Str.trim(line);
  return Str.startsWith(row, '"')
    ? pipe(row, O.liftPredicate(Str.endsWith('",')), O.map(Str.slice(1, -2)))
    : O.map(Str.indexOf(":")(row), (end) => Str.slice(0, end)(row));
};

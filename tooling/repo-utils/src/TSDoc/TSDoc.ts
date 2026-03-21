/**
 * @module @beep/repo-utils/TSDoc/TsDoc
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("TSDoc/TSDoc");

/**
 * Text coordinates represented as a line number and column number.
 *
 * @remarks
 * The first character in a file is considered to be in column 1 of line 1.
 * The location with column 0 and line 0 is used to represent an empty, unspecified,
 * or unknown location.
 * @since 0.0.0
 * @category DomainModel
 */
export class TextLocation extends S.Class<TextLocation>($I`TextLocation`)(
  {
    /**
     * The line number for the text location.
     *
     * @remarks
     * This is 1-based for known positions. Use `0` to represent an unspecified or unknown line.
     */
    line: NonNegativeInt.annotateKey({
      description: "The line number for the text location.",
      documentation: "This is 1-based for known positions. Use `0` to represent an unspecified or unknown line.",
    }),
    /**
     * The column number for the text location.
     *
     * @remarks
     * This is 1-based for known positions. Use `0` to represent an unspecified or unknown column.
     */
    column: NonNegativeInt.annotateKey({
      description: "The column number for the text location.",
      documentation: "This is 1-based for known positions. Use `0` to represent an unspecified or unknown column.",
    }),
  },
  $I.annote("TextLocation", {
    description: "Text coordinates represented as a line number and column number.",
    documentation:
      "The first character in a file is considered to be in column 1 of line 1.\nThe location with column 0 and line 0 is used to represent an empty, unspecified,\nor unknown location.",
  })
) {}

/**
 * Efficiently references a range of text from a string buffer.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TextRange extends S.Class<TextRange>($I`TextRange`)(
  {
    /**
     * The inclusive starting index for the associated text buffer.
     *
     * @remarks
     * This is a zero-based offset into `buffer`.
     */
    pos: NonNegativeInt.annotateKey({
      description: "The inclusive starting index for the associated text buffer.",
      documentation: "This is a zero-based offset into `buffer`.",
    }),
    /**
     * The (non-inclusive) ending index for the associated text buffer.
     *
     * @remarks
     * The text range corresponds to the `range.buffer.substring(range.pos, range.end)`.
     */
    end: NonNegativeInt.annotateKey({
      description: "The (non-inclusive) ending index for the associated text buffer.",
      documentation: "The text range corresponds to the `range.buffer.substring(range.pos, range.end)`.",
    }),
    /**
     * The string buffer that the `pos` and `end` indexes refer to.
     */
    buffer: S.String.annotateKey({
      description: "The string buffer that the `pos` and `end` indexes refer to.",
    }),
  },
  $I.annote("TextRange", {
    description: "Efficiently references a range of text from a string buffer.",
  })
) {}

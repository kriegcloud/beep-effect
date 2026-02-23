/**
 * Extended node schemas for Lexical plugins.
 *
 * These schemas support common Lexical plugins:
 * - Rich text (headings, quotes)
 * - Lists (ordered, unordered, checkboxes)
 * - Code blocks
 * - Links
 *
 * @module
 * @category Nodes/Plugins
 * @since 0.1.0
 */

import { $LexicalSchemasId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $LexicalSchemasId.create("nodes/plugins");

/**
 * Heading tag levels (h1-h6).
 *
 * @category Nodes/Plugins
 * @since 0.1.0
 */
export class HeadingTagType extends BS.StringLiteralKit("h1", "h2", "h3", "h4", "h5", "h6").annotations(
  $I.annotations("HeadingTagType", {
    description: "Heading level: h1 through h6",
  })
) {}

export declare namespace HeadingTagType {
  export type Type = typeof HeadingTagType.Type;
}

/**
 * List type for ordered, unordered, and checkbox lists.
 *
 * @category Nodes/Plugins
 * @since 0.1.0
 */
export const ListTypeEnum = BS.StringLiteralKit("number", "bullet", "check").annotations(
  $I.annotations("ListTypeEnum", {
    description: "List type: ordered (number), unordered (bullet), or checkbox (check)",
  })
);

export declare namespace ListTypeEnum {
  export type Type = typeof ListTypeEnum.Type;
}

/**
 * List HTML tag type.
 *
 * @category Nodes/Plugins
 * @since 0.1.0
 */
export const ListTagType = BS.StringLiteralKit("ul", "ol").annotations(
  $I.annotations("ListTagType", {
    description: "List HTML tag: ul (unordered) or ol (ordered)",
  })
);

export declare namespace ListTagType {
  export type Type = typeof ListTagType.Type;
}

/**
 * Table cell header state.
 *
 * @category Nodes/Plugins
 * @since 0.1.0
 */
export class TableCellHeaderState extends BS.LiteralKit(0, 1, 2, 3, 4).annotations(
  $I.annotations("TableCellHeaderState", {
    description: "Table cell header state: 0=none, 1=row, 2=column, 3=both, 4=both+sticky",
    documentation:
      "Defines whether a table cell is a header cell. Values: 0=no header, 1=row header, 2=column header, 3=both row and column header, 4=both with sticky positioning.",
    examples: [0, 1, 2, 3, 4],
    message: () => "Invalid table cell header state. Expected 0, 1, 2, 3, or 4.",
    parseIssueTitle: () => "Invalid table cell header state",
  })
) {}

export declare namespace TableCellHeaderState {
  export type Type = typeof TableCellHeaderState.Type;
}

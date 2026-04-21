/**
 * @module
 * @since 0.0.0
 */
import { $EditorId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";

const $I = $EditorId.create("Domain/NodeType");

/**
 * @since 0.0.0
 */
export const NodeType = LiteralKit([
  "datetime",
  "tweet",
  "youtube",
  "excalidraw",
  "page_break",
  "autocomplete",
  "emoji",
  "equation",
  "figma",
  "image",
  "keyword",
  "layout_container",
  "layout_item",
  "mention",
  "sticky",
  "poll",
  "paragraph",
  "artificial",
  "linebreak",
  "root",
  "tab",
  "text",
  "code",
  "code-highlight",
  "hashtag",
  "link",
  "mark",
  "tablecell",
  "table",
  "tablerow",
]).pipe(
  $I.annoteSchema("NodeType", {
    description: "The type of a node",
  })
);

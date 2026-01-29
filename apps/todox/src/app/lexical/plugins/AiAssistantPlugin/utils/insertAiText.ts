import type { RangeSelection } from "lexical";
import { $createParagraphNode, $createTextNode } from "lexical";
import type { InsertionMode } from "../types";

/**
 * Insert AI-generated text based on insertion mode.
 * Must be called within editor.update() or editor.read().
 *
 * @param selection - Current RangeSelection
 * @param content - AI-generated content to insert
 * @param mode - Insertion mode (replace/inline/below)
 */
export function $insertAiText(selection: RangeSelection, content: string, mode: InsertionMode): void {
  switch (mode) {
    case "replace":
      // Replace selected text with AI content
      selection.insertText(content);
      break;

    case "inline":
      // Move cursor to end of selection by setting anchor to focus position
      const { focus } = selection;
      selection.anchor.set(focus.key, focus.offset, focus.type);
      selection.insertText(` ${content}`);
      break;

    case "below":
      // Insert content in a new paragraph below selection's block
      const paragraphNode = $createParagraphNode();
      const textNode = $createTextNode(content);
      paragraphNode.append(textNode);

      // Find the block parent and insert after it
      const anchorNode = selection.anchor.getNode();
      const topLevelElement = anchorNode.getTopLevelElementOrThrow();
      topLevelElement.insertAfter(paragraphNode);
      break;
  }
}

import type { LexicalNode } from "lexical";

/**
 * Interface for DateTimeNode operations used by the component.
 * This avoids circular imports by defining the contract separately.
 */
export interface DateTimeNodeInterface {
  setDateTime(date: Date): this;
}

export function $isDateTimeNode(node: LexicalNode | null | undefined): node is LexicalNode & DateTimeNodeInterface {
  return node?.constructor?.name === "DateTimeNode";
}

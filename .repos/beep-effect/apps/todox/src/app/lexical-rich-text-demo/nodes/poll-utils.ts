import * as F from "effect/Function";
import * as Str from "effect/String";
import type { LexicalNode } from "lexical";
export type Options = ReadonlyArray<Option>;

export type Option = Readonly<{
  text: string;
  uid: string;
  votes: Array<string>;
}>;

function createUID(): string {
  return F.pipe(Math.random().toString(36), Str.replace(/[^a-z]+/g, ""), Str.substring(0, 5));
}

export function createPollOption(text = ""): Option {
  return {
    text,
    uid: createUID(),
    votes: [],
  };
}

/**
 * Interface for PollNode operations used by the component.
 * This avoids circular imports by defining the contract separately.
 */
export interface PollNodeInterface {
  toggleVote(option: Option, username: string): this;
  setOptionText(option: Option, text: string): this;
  deleteOption(option: Option): this;
  addOption(option: Option): this;
}

export function $isPollNode(node: LexicalNode | null | undefined): node is LexicalNode & PollNodeInterface {
  return node?.constructor?.name === "PollNode";
}

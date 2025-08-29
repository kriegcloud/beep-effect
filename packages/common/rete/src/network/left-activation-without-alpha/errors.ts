import * as Data from "effect/Data";
import type { $Schema, JoinNode } from "../types";

export class ExpectedToHaveAlphaFactsForNode<T extends $Schema> extends Data.TaggedError("NoNodesInSession")<{
  readonly node: JoinNode<T>;
}> {
  constructor(node: JoinNode<T>) {
    super({ node });
  }
  get message() {
    return `Expected to have alpha facts for ${this.node.idName}`;
  }
}

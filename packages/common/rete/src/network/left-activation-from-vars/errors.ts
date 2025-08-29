import * as Data from "effect/Data";
import type { $Schema, JoinNode, Session } from "../types";

export class ExpectedToHaveAlphaFactsForNode<T extends $Schema> extends Data.TaggedError("NoNodesInSession")<{
  readonly node: JoinNode<T>;
  readonly session: Session<T>;
}> {
  constructor(node: JoinNode<T>, session: Session<T>) {
    super({ node, session });
  }
  get message() {
    return `Expected node to have child!
    Session: ${JSON.stringify(this.session)}\n
    Node: ${JSON.stringify(this.node)}\n`;
  }
}

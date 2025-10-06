import * as Data from "effect/Data";
import type { Var } from "../types";

export class ExpectedToHaveAlphaFactsForNode extends Data.TaggedError("NoNodesInSession")<{
  readonly v: Var.Type;
}> {
  constructor(v: Var.Type) {
    super({ v });
  }

  get message() {
    return `Attributes can not contain vars: ${this.v}`;
  }
}

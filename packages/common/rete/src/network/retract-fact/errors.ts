import * as Data from "effect/Data";
import type { $Schema, Fact, IdAttr } from "../types";

export class ExpectedFactToBeInNodeFacts<T extends $Schema> extends Data.TaggedError("InvalidOptionsForCondition")<{
  readonly idAttr: IdAttr<T>;
  readonly fact: Fact<T>;
}> {
  constructor(fact: Fact<T>, idAttr: IdAttr<T>) {
    super({ idAttr, fact });
  }

  get message() {
    return `Expected fact ${this.fact} to be in node.facts at id: ${this.idAttr[0]}, attr: ${String(this.idAttr[1])}`;
  }
}

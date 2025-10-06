import * as Data from "effect/Data";
import type { $Schema, FactId, Token } from "../types";

export class ExpectedFactIdToExist extends Data.TaggedError("UnexpectedUndefinedChildForNode")<{
  id: FactId.Type;
}> {
  constructor(id: FactId.Type) {
    super({ id });
  }

  get message() {
    return `Expected fact id to exist ${this.id}`;
  }
}

export class ExpectedTokenToHaveAnOldFact<T extends $Schema> extends Data.TaggedError("ExpectedTokenToHaveAnOldFact")<{
  token: Token<T>;
}> {
  constructor(token: Token<T>) {
    super({ token });
  }

  get message() {
    return `Expected token ${this.token.fact} to have an oldFact`;
  }
}

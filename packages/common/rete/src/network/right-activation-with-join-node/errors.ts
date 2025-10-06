import * as Data from "effect/Data";

export class UnexpectedUndefinedChildForNode extends Data.TaggedError("UnexpectedUndefinedChildForNode")<{
  readonly idName?: string;
}> {
  constructor(idName: string | undefined) {
    super({ idName });
  }

  get message() {
    return `Unexpected undefined child for node ${this.idName}`;
  }
}

export class UnexpectedNullChildForNode extends Data.TaggedError("UnexpectedNullChildForNode")<{
  readonly idName?: string;
}> {
  constructor(idName: string | undefined) {
    super({ idName });
  }

  get message() {
    return `Unexpected null child for node: ${this.idName}`;
  }
}

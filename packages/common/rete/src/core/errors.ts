import type { UnsafeTypes } from "@beep/types";
import * as Data from "effect/Data";
import * as Struct from "effect/Struct";

export class InvalidOptionsForCondition extends Data.TaggedError("InvalidOptionsForCondition")<{
  conditionId: string | { name: string; field: 0 };
}> {
  constructor(conditionId: string | { name: string; field: 0 }) {
    super({ conditionId });
  }

  get message() {
    return `Invalid options for condition ${this.conditionId}, join and match are mutually exclusive. Please use one or the other`;
  }
}

export class QueryOneReturnedMoreThanOne extends Data.TaggedError("QueryOneMoreThanOne") {
  get message() {
    return "queryOne returned more than one result!";
  }
}

export class SubscribeOneMoreThanOne extends Data.TaggedError("SubscribeOneMoreThanOne")<{
  results: Array<Record<string, Record<string, UnsafeTypes.UnsafeAny> & { id: string }>>;
}> {
  constructor(results: Array<Record<string, Record<string, UnsafeTypes.UnsafeAny> & { id: string }>>) {
    super({ results });
  }

  get message() {
    return `subscribeOne received more than one result! ${this.results.length} received!`;
  }
}

export class IncorrectJoinUsage extends Data.TaggedError("InvalidOptionsForCondition")<{
  cond: UnsafeTypes.UnsafeRecord;
}> {
  constructor(cond: UnsafeTypes.UnsafeRecord) {
    super({ cond });
  }

  get message() {
    return `Incorrect "join" usage. It must be one of the key's defined in your conditions. Valid options are ${Struct.keys(
      this.cond
    ).join(",")}`;
  }
}

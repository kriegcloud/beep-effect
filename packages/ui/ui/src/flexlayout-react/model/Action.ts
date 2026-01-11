import type { UnsafeTypes } from "@beep/types";
import * as Data from "effect/Data";

export class Action extends Data.Class<{
  type: string;
  data: Record<string, UnsafeTypes.UnsafeAny>;
}> {
  constructor(type: string, data: Record<string, UnsafeTypes.UnsafeAny>) {
    super({
      type,
      data,
    });
  }
}

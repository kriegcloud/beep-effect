import * as Data from "effect/Data";
import type { $Schema, PRODUCTION_ALREADY_EXISTS_BEHAVIOR, Production } from "../types";

export class ProductionAlreadyExists<T extends $Schema, U> extends Data.TaggedError("ProductionAlreadyExists")<{
  readonly alreadyExistsBehavior: PRODUCTION_ALREADY_EXISTS_BEHAVIOR;
  readonly production: Production<T, U>;
  readonly customMessage?: string;
}> {
  constructor(
    alreadyExistsBehavior: PRODUCTION_ALREADY_EXISTS_BEHAVIOR,
    production: Production<T, U>,
    customMessage?: string
  ) {
    super({
      alreadyExistsBehavior,
      production,
      customMessage,
    });
  }

  get message() {
    return this.customMessage ? this.customMessage : `${this.production.name} already exists in session`;
  }
}

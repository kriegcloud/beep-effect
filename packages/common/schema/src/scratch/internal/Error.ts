import * as Data from "effect/Data";
import type { ValidationResult } from "./ValidationResult";

export class RuleError extends Data.TaggedError("RuleError")<{
  readonly error: null | ValidationResult["error"];
  readonly isValid: boolean;
  readonly element: null | object;
}> {
  readonly type: string;
  readonly toModel: undefined | (() => ValidationResult);

  constructor(validationResult: ValidationResult) {
    super({
      error: validationResult.error ?? null,
      isValid: validationResult.isValid,
      element: validationResult.error?.element ?? null,
    });
    this.type = this._tag;
    this.toModel = () => {
      return {
        isValid: this.isValid,
        error: {
          message: this.message,
          element: this.element as object,
        },
      };
    };
  }
}

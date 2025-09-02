import type { OperatorMetadata } from "@beep/schema/scratch/internal/operator/OperatorSpec";
import type { UnsafeTypes } from "@beep/types";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";

type OperatorContextShape = {
  readonly fieldValue: UnsafeTypes.UnsafeAny;
  readonly constraintValue?: undefined | UnsafeTypes.UnsafeAny;
  readonly criteria?: undefined | Record<string, UnsafeTypes.UnsafeAny>;
  readonly fieldPath?: undefined | string;
};

export class OperatorContext extends Context.Tag("OperatorContext")<OperatorContext, OperatorContextShape>() {
  public static readonly provide = (ctx: OperatorContextShape) => Effect.provideService(this, ctx);
}

export interface ValidationResult {
  isValid: boolean;
  error?: undefined | string;
  warnings?: undefined | string[];
}
export class OperatorStrategy<TField = UnsafeTypes.UnsafeAny, TValue = UnsafeTypes.UnsafeAny> extends Data.TaggedClass(
  "OperatorStrategy"
)<{
  readonly metadata: OperatorMetadata.Type;
}> {
  readonly validate: Effect.Effect<ValidationResult>;
  readonly evaluate: Effect.Effect<boolean>;

  isInvalidFieldType?(value: unknown): value is TField;

  isValidConstraintType?(value: unknown): value is TValue;

  getNegated?(): OperatorStrategy<TField, TValue> | null;

  formatMessage?(template: string): Effect.Effect<string>;

  constructor(
    metadata: OperatorMetadata.Type,
    validate: Effect.Effect<ValidationResult>,
    evaluate: Effect.Effect<boolean>
  ) {
    super({ metadata });
    this.validate = validate;
    this.evaluate = evaluate;
  }
}

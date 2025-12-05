/**
 * Runtime-safe function schema factory that validates inputs and outputs with Effect Schema.
 *
 * Wraps arbitrary functions so every invocation decodes inputs and outputs via provided schemas.
 * This is the backbone for higher-level helpers like `NoInputVoidFn`.
 *
 * @example
 * import * as F from "effect/Function";
 * import * as S from "effect/Schema";
 * import * as Str from "effect/String";
 * import { Fn } from "@beep/schema/primitives/fn/fn";
 *
 * const toUpper = new Fn({ input: S.String, output: S.String }).implement((value: string) =>
 *   F.pipe(value, Str.toUpperCase)
 * );
 * const result = toUpper("hello");
 *
 * @category Primitives/Fn
 * @since 0.1.0
 */

import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { $FnId } from "../../internal";

const Id = $FnId;
/**
 * Schema-powered function wrapper enforcing validation at call boundaries.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Fn } from "@beep/schema/primitives/fn/fn";
 *
 * const fn = new Fn({ input: S.String, output: S.Number }).implement((value: string) => value.length);
 * fn("hello");
 *
 * @category Primitives/Fn
 * @since 0.1.0
 */
export class Fn<const IA, const IE, const OA, const OE> extends Data.TaggedClass("Fn")<{
  Schema: S.Schema<(input: IA) => OA, (input: IA) => OA, never>;
}> {
  /**
   * Builder that wraps an arbitrary implementation with schema validation.
   *
   * @category Primitives/Fn
   * @since 0.1.0
   */
  readonly implement: (
    fnUnknown: (input: S.Schema.Type<S.Schema<IA, IE>>) => S.Schema.Type<S.Schema<OA, OE>>
  ) => (unknownInput: IA) => OA;

  constructor({
    input,
    output,
  }: {
    readonly input: S.Schema<IA, IE, never>;
    readonly output: S.Schema<OA, OE, never>;
  }) {
    const BaseFn = S.declare(
      (candidate: unknown): candidate is (input: IA) => OA => F.isFunction(candidate) && candidate.length >= 1
    ).annotations(
      Id.annotations("fn/ValidatedFunction", {
        description: "Wraps a function to validate inputs and outputs at invocation time.",
      })
    );

    super({ Schema: BaseFn });
    this.implement = (fnUnknown: (input: S.Schema.Type<S.Schema<IA, IE>>) => S.Schema.Type<S.Schema<OA, OE>>) => {
      const fn = S.decodeUnknownSync(BaseFn)(fnUnknown);

      return (args: unknown): OA => {
        const decodedInput = S.decodeUnknownSync(input)(args);
        const result = fn(decodedInput);
        return S.decodeUnknownSync(output)(result);
      };
    };
  }

  /**
   * Convenience helper mirroring the constructor but inferring generics automatically.
   *
   * @category Primitives/Fn
   * @since 0.1.0
   */
  static readonly make = <IA, IE, OA>(params: {
    readonly input: S.Schema<IA, IE, never>;
    readonly output: S.Schema<OA, OA, never>;
  }) => new Fn(params);
}

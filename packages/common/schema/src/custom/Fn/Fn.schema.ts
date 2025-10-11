import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as S from "effect/Schema";

export class Fn<const IA, const IE, const OA, const OE> extends Data.TaggedClass("Fn")<{
  Schema: S.Schema<(i: IA) => OA, (i: IA) => OA, never>;
}> {
  readonly implement: (
    fnUnknown: (i: S.Schema.Type<S.Schema<IA, IE>>) => S.Schema.Type<S.Schema<OA, OE>>
  ) => (unknownInput: IA) => OA;

  constructor({
    input,
    output,
  }: {
    readonly input: S.Schema<IA, IE, never>;
    readonly output: S.Schema<OA, OE, never>;
  }) {
    class BaseFn extends S.declare((i: unknown): i is (i: IA) => OA => F.isFunction(i) && i.length >= 1).annotations({
      identifier: "ValidatedFunction",
      title: "ValidatedFunction",
      description: "Wraps a function to validate inputs/outputs at call time",
    }) {}

    super({ Schema: BaseFn });
    this.implement = (fnUnknown: (i: S.Schema.Type<S.Schema<IA, IE>>) => S.Schema.Type<S.Schema<OA, OE>>) => {
      const fn = S.decodeUnknownSync(BaseFn)(fnUnknown);

      return (args: unknown): OA => {
        const i = S.decodeUnknownSync(input)(args);
        const out = fn(i);
        return S.decodeUnknownSync(output)(out);
      };
    };
  }

  static readonly make = <IA, IE, OA, OE>(params: {
    readonly input: S.Schema<IA, IE, never>;
    readonly output: S.Schema<OA, OA, never>;
  }) => new Fn(params);
}

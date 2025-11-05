import { invariant } from "@beep/invariant";
import * as regexes from "@beep/schema/regexes";
import type { TagTypes } from "@beep/types";
import * as F from "effect/Function";
import * as S from "effect/Schema";

export class SnakeTag extends S.NonEmptyString.pipe(
  S.lowercased({ message: () => "SnakeTag must be lowercase" }),
  S.trimmed({ message: () => "SnakeTag cannot contain trailing or leading whitespace" }),
  S.pattern(regexes.snakeCaseTagRegex, {
    message: () => "SnakeTag must be a valid snake case tag",
  })
).annotations({
  schemaId: Symbol.for("@beep/schema/custom/SnakeTag"),
  identifier: "SnakeTag",
  title: "Snake Tag",
  description: "A valid snake_case tag",
  examples: ["hello", "hello_world", "beep_friggin_hole"],
  documentation: `
    ## Requirements
    - Must be lowercase
    - Must be snake_case
    - Must not contain leading or trailing whitespace
    - Cannot contain consecutive underscores
    - Cannot contain trailing or leading underscores
  `,
}) {
  static override readonly make = <const T extends string>(tag: SnakeTag.Literal<T>): SnakeTag.Literal<T> => {
    invariant(S.is(SnakeTag)(tag), "Must be a valid SnakeTag", {
      file: "@beep/schema/custom/String.schema.ts",
      line: 28,
      args: [tag],
    });
    return tag;
  };

  static readonly is = S.is(this);
}

export declare namespace SnakeTag {
  export type Literal<T extends string> = TagTypes.SnakeTag<T>;
  export type Type = S.Schema.Type<typeof SnakeTag>;
  export type Encoded = S.Schema.Encoded<typeof SnakeTag>;
}

export type StringPropertyOmittable = S.PropertySignature<":", string, never, "?:", string | undefined, true, never>;

export const StringWithDefault = (defaultValue: string): StringPropertyOmittable =>
  F.pipe(F.constant(defaultValue), (thunk) =>
    S.String.pipe(
      S.optional,
      S.withDefaults({
        decoding: thunk,
        constructor: thunk,
      })
    )
  );

export declare namespace StringWithDefault {
  export type Type = S.Schema.Type<ReturnType<typeof StringWithDefault>>;
  export type Encoded = S.Schema.Encoded<ReturnType<typeof StringWithDefault>>;
}

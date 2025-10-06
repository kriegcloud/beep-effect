import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export const IntrospectionStepChange = BS.Struct({
  key: S.String,
  value: S.Unknown,
}).annotations({
  schemaId: Symbol.for("@beep/rules/IntrospectionStepChange"),
  identifier: "IntrospectionStepChange",
  title: "Introspection Step Change",
  description: "A change to an introspection step.",
});

export namespace IntrospectionStepChange {
  export type Type = S.Schema.Type<typeof IntrospectionStepChange>;
  export type Encoded = S.Schema.Encoded<typeof IntrospectionStepChange>;
}

export const IntrospectionStep = BS.Struct({
  depth: S.NonNegativeInt,
  option: S.Record({
    key: S.String,
    value: S.Unknown,
  }),
  changes: S.OptionFromUndefinedOr(S.Array(IntrospectionStepChange)),
}).annotations({
  schemaId: Symbol.for("@beep/rules/IntrospectionStep"),
  identifier: "IntrospectionStep",
  title: "Introspection Step",
  description: "An introspection step.",
});

export namespace IntrospectionStep {
  export type Type = S.Schema.Type<typeof IntrospectionStep>;
  export type Encoded = S.Schema.Encoded<typeof IntrospectionStep>;
}

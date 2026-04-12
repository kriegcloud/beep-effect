import type {TString} from "@beep/types";
import * as Event from "effect/unstable/encoding/Sse";

export * from "effect/unstable/encoding/Sse";

import {O, Struct, thunkFalse} from "@beep/utils";
import {dual} from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import {Match, flow} from "effect";

const isFields = <TFields extends S.Struct.Fields = S.Struct.Fields>(payload: undefined | TFields | S.Struct<TFields>): payload is TFields => P.isObject(
  payload)

const isStructWithFields = <TFields extends S.Struct.Fields = S.Struct.Fields>(payload: undefined | TFields | S.Struct<TFields>): payload is S.Struct<TFields> => S.isSchema(
  payload);

// const matchEventPayloadShape = <TTag extends TString.NonEmpty, TFields extends S.Struct.Fields>() =>

export const makeEvent = <TTag extends TString.NonEmpty, TFields extends S.Struct.Fields>(
  payload: TFields,
  tag: TTag,
) => S.Struct({
  kind: S.tag("Event"),
  _tag: S.tag(tag),
  payload: S.Struct(payload),
})


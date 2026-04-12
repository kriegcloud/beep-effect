import type {TString} from "@beep/types";

export * from "effect/unstable/encoding/Sse";

import * as S from "effect/Schema";

export const makeEvent = <TTag extends TString.NonEmpty, TFields extends S.Struct.Fields>(
  payload: TFields,
  tag: TTag,
) => S.Struct({
  kind: S.tag("Event"),
  _tag: S.tag(tag),
  payload: S.Struct(payload),
})

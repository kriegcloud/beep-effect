import { $YjsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/Ai");

export class ContextualPromptResponseInsert extends S.Class<ContextualPromptResponseInsert>(
  $I`ContextualPromptResponseInsert`
)(
  {
    type: S.tag("insert"),
    text: S.String,
  },
  $I.annotations("ContextualPromptResponseInsert", {
    description: "Contextual prompt response insert for Yjs protocol",
  })
) {}

export class ContextualPromptResponseReplace extends S.Class<ContextualPromptResponseReplace>(
  $I`ContextualPromptResponseReplace`
)(
  {
    type: S.tag("replace"),
    text: S.String,
  },
  $I.annotations("ContextualPromptResponseReplace", {
    description: "Contextual prompt response replace for Yjs protocol",
  })
) {}

export class ContextualPromptResponseOther extends S.Class<ContextualPromptResponseOther>(
  $I`ContextualPromptResponseOther`
)(
  {
    type: S.tag("other"),
    text: S.String,
  },
  $I.annotations("ContextualPromptResponseOther", {
    description: "Contextual prompt response for other text operations in Yjs protocol",
  })
) {}

export class ContextualPromptResponse extends S.Union(
  ContextualPromptResponseInsert,
  ContextualPromptResponseReplace,
  ContextualPromptResponseOther
).annotations(
  $I.annotations("ContextualPromptResponse", {
    description: "Contextual prompt response for Yjs protocol",
  })
) {}

export declare namespace ContextualPromptResponse {
  export type Type = S.Schema.Type<typeof ContextualPromptResponse>;
  export type Encoded = S.Schema.Encoded<typeof ContextualPromptResponse>;
}

export class ContextualPromptContext extends S.Class<ContextualPromptContext>($I`ContextualPromptContext`)(
  {
    beforeSelection: S.String,
    selection: S.String,
    afterSelection: S.String,
  },
  $I.annotations("ContextualPromptContext", {
    description: "Contextual prompt context for Yjs protocol",
  })
) {}

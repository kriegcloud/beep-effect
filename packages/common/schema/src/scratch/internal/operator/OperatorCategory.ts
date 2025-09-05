import { stringLiteralKit } from "@beep/schema/kits";
import type * as S from "effect/Schema";

const kit = stringLiteralKit("comparison", "type", "presence", "structure", "set", "size", "pattern", "temporal");

export class OperatorCategory extends kit.Schema {
  static readonly Enum = kit.Enum;
  static readonly Options = kit.Options;
}

export namespace OperatorCategory {
  export type Type = S.Schema.Type<typeof OperatorCategory>;
  export type Encoded = S.Schema.Encoded<typeof OperatorCategory>;
}

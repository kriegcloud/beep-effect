import { BS } from "@beep/schema";
import * as S from "effect/Schema";

/**
 * Interface for describing an UI schema element that is referencing
 * a subschema. The value of the scope may be a JSON Pointer.
 */
export class Scopable extends BS.Class<Scopable>(`Scopable`)(
  {
    /**
     * The scope that determines to which part this element should be bound to.
     */
    scope: S.OptionFromUndefinedOr(S.NonEmptyString).annotations({
      description: "The scope that determines to which part this element should be bound to.",
    }),
  },
  [
    {
      identifier: "Scopable",
      title: "Scopable",
      description: "The scope that determines to which part this element should be bound to.",
      schemaId: Symbol.for("@beep/ui/form/ui-schema/Scopable"),
    },
  ]
) {}

export namespace Scopable {
  export type Type = S.Schema.Type<typeof Scopable>;
  export type Encoded = S.Schema.Encoded<typeof Scopable>;
}

/**
 * Interface for describing an UI schema element that is referencing
 * a subschema. The value of the scope must be a JSON Pointer.
 */
export class Scoped extends Scopable.extend<Scoped>(`Scoped`)(
  {
    /**
     * The scope that determines to which part this element should be bound to.
     */
    scope: S.NonEmptyString.annotations({
      description: "The scope that determines to which part this element should be bound to.",
    }),
  },
  [
    {
      identifier: "Scoped",
      title: "Scoped",
      description:
        "Interface for describing an UI schema element that is referencing * a subschema. The value of the scope must be a JSON Pointer.",
      schemaId: Symbol.for("@beep/ui/form/ui-schema/Scoped"),
    },
  ]
) {}

export namespace Scoped {
  export type Type = S.Schema.Type<typeof Scoped>;
  export type Encoded = S.Schema.Encoded<typeof Scoped>;
}

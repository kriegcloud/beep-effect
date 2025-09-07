import { BS } from "@beep/schema";
import * as O from "effect/Option";
import * as S from "effect/Schema";
/**
 * Represents an object that can be used to configure a label.
 */
export class LabelDescription extends BS.Class<LabelDescription>("LabelDescription")(
  {
    /**
     * An optional text to be displayed.
     */
    text: BS.toOptionalWithDefault(S.OptionFromUndefinedOr(S.NonEmptyString))(O.none()).annotations({
      description: "An optional text to be displayed.",
    }),
    /**
     * Optional property that determines whether to show this label.
     */
    show: BS.toOptionalWithDefault(S.OptionFromUndefinedOr(S.Boolean))(O.none()).annotations({
      description: "Optional property that determines whether to show this label.",
    }),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/LabelDescription"),
    title: "Label Description",
    description: "Represents an object that can be used to configure a label.",
  }
) {}

export namespace LabelDescription {
  export type Type = S.Schema.Type<typeof LabelDescription>;
  export type Encoded = S.Schema.Encoded<typeof LabelDescription>;
}

export class LabelStringKind extends BS.Class<LabelStringKind>("LabelStringKind")(
  {
    kind: BS.LiteralWithDefault("string"),
    value: S.NonEmptyString,
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/LabelStringKind"),
    description: "Represents a label that is a string.",
    title: "String label",
  }
) {}

export namespace LabelStringKind {
  export type Type = S.Schema.Type<typeof LabelStringKind>;
  export type Encoded = S.Schema.Encoded<typeof LabelStringKind>;
}

export class LabelBooleanKind extends BS.Class<LabelBooleanKind>("LabelBooleanKind")(
  {
    kind: BS.LiteralWithDefault("boolean"),
    value: S.Boolean,
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/LabelBooleanKind"),
    description: "Represents a label that is a boolean.",
    title: "Boolean label",
  }
) {}

export namespace LabelBooleanKind {
  export type Type = S.Schema.Type<typeof LabelBooleanKind>;
  export type Encoded = S.Schema.Encoded<typeof LabelBooleanKind>;
}

export class LabelDescriptionKind extends BS.Class<LabelDescriptionKind>("LabelDescriptionKind")(
  {
    kind: BS.LiteralWithDefault("description"),
    value: LabelDescription,
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/LabelDescriptionKind"),
    description: "Represents a label that is a description.",
    title: "Description label",
  }
) {}

export namespace LabelDescriptionKind {
  export type Type = S.Schema.Type<typeof LabelDescriptionKind>;
  export type Encoded = S.Schema.Encoded<typeof LabelDescriptionKind>;
}

export class LabelKind extends S.Union(LabelStringKind, LabelBooleanKind, LabelDescriptionKind).annotations({
  schemaId: Symbol.for("@beep/ui/form/ui-schema/LabelKind"),
  description: "Represents a label kind.",
  title: "Label kind",
}) {}

export namespace LabelKind {
  export type Type = S.Schema.Type<typeof LabelKind>;
  export type Encoded = S.Schema.Encoded<typeof LabelKind>;
}

/**
 * Interface for describing an UI schema element that may be labeled.
 */
export class Labelable extends BS.Class<Labelable>("Labelable")(
  {
    label: BS.toOptionalWithDefault(S.OptionFromUndefinedOr(LabelKind))(O.none()),
  },
  [
    {
      schemaId: Symbol.for("@beep/ui/form/ui-schema/Labelable"),
      identifier: `Labelable`,
      title: "Label-able",
      description: "Interface for describing an UI schema element that may be labeled.",
    },
  ]
) {}

export namespace Labelable {
  export type Type = S.Schema.Type<typeof Labelable>;
  export type Encoded = S.Schema.Encoded<typeof Labelable>;
}

/**
 * Interface for describing an UI schema element that is labeled.
 */
export class Labeled extends Labelable.extend<Labeled>(`Labeled`)(
  {
    label: BS.toOptionalWithDefault(S.OptionFromUndefinedOr(LabelKind))(O.none()),
  },
  [
    {
      schemaId: Symbol.for("@beep/ui/form/ui-schema/Labeled"),
      identifier: `Labeled`,
      title: "Labeled",
      description: "Interface for describing an UI schema element that is labeled.",
    },
  ]
) {}

export namespace Labeled {
  export type Type = S.Schema.Type<typeof Labeled>;
  export type Encoded = S.Schema.Encoded<typeof Labeled>;
}

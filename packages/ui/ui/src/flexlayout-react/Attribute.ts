import { $UiId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $UiId.create("flexlayout-react/Attribute");

export class AttributeType extends S.Literal("number", "string", "boolean", "any").annotations(
  $I.annotations("AttributeType", {
    description: "An AttributeType is a string literal representing the type of an attribute",
  })
) {}

export declare namespace AttributeType {
  export type Type = typeof AttributeType.Type;
}

export class AttributeData extends S.Struct({
  name: S.String,
  alias: S.OptionFromUndefinedOr(S.String),
  modelName: S.OptionFromUndefinedOr(S.String),
  pairedType: S.OptionFromUndefinedOr(S.String),
  defaultValue: S.Unknown,
  alwaysWriteJson: S.OptionFromUndefinedOr(S.Boolean),
  type: S.String,
  required: S.Boolean,
  fixed: S.Boolean,
  description: S.OptionFromUndefinedOr(S.String),
})
  .pipe(S.mutable)
  .annotations(
    $I.annotations("AttributeData", {
      description: "Mutable data for an Attribute",
    })
  ) {}

export declare namespace AttributeData {
  export type Type = typeof AttributeData.Type;
  export type Encoded = typeof AttributeData.Encoded;
}

export class IAttribute extends S.Class<IAttribute>($I`IAttribute`)({
  data: AttributeData,
}) {
  // pairedAttr stored separately since it's self-referential
  private _pairedAttr: O.Option<IAttribute> = O.none();

  static readonly new = (
    name: string,
    modelName: string | undefined,
    defaultValue: unknown,
    alwaysWriteJson?: boolean
  ) =>
    new IAttribute({
      data: {
        name,
        alias: O.none(),
        modelName: O.fromNullable(modelName),
        pairedType: O.none(),
        defaultValue,
        alwaysWriteJson: O.fromNullable(alwaysWriteJson),
        type: "any",
        required: false,
        fixed: false,
        description: O.none(),
      },
    });

  readonly setType = (value: string): this => {
    this.data.type = value;
    return this;
  };

  readonly setAlias = (value: string): this => {
    this.data.alias = O.some(value);
    return this;
  };

  readonly setDescription = (value: string): void => {
    this.data.description = O.some(value);
  };

  readonly setRequired = (): this => {
    this.data.required = true;
    return this;
  };

  readonly setFixed = (): this => {
    this.data.fixed = true;
    return this;
  };

  readonly setpairedAttr = (value: IAttribute): void => {
    this._pairedAttr = O.some(value);
  };

  readonly getpairedAttr = (): O.Option<IAttribute> => {
    return this._pairedAttr;
  };

  readonly setPairedType = (value: string): void => {
    this.data.pairedType = O.some(value);
  };

  // Accessor methods for Option fields
  readonly getName = (): string => this.data.name;
  readonly getAlias = (): O.Option<string> => this.data.alias;
  readonly getModelName = (): O.Option<string> => this.data.modelName;
  readonly getDefaultValue = (): unknown => this.data.defaultValue;
  readonly getType = (): string => this.data.type;
  readonly isRequired = (): boolean => this.data.required;
  readonly isFixed = (): boolean => this.data.fixed;
  readonly getDescription = (): O.Option<string> => this.data.description;
  readonly getAlwaysWriteJson = (): O.Option<boolean> => this.data.alwaysWriteJson;
  readonly getPairedType = (): O.Option<string> => this.data.pairedType;
}

/** @internal */
export class Attribute {
  static NUMBER = "number";
  static STRING = "string";
  static BOOLEAN = "boolean";

  name: string;
  alias: string | undefined;
  modelName?: undefined | string;
  pairedAttr?: undefined | Attribute;
  pairedType?: undefined | string;
  defaultValue: UnsafeTypes.UnsafeAny;
  alwaysWriteJson?: undefined | boolean;
  type?: undefined | string;
  required: boolean;
  fixed: boolean;
  description?: undefined | string;

  constructor(
    name: string,
    modelName: string | undefined,
    defaultValue: UnsafeTypes.UnsafeAny,
    alwaysWriteJson?: undefined | boolean
  ) {
    this.name = name;
    this.alias = undefined;
    this.modelName = modelName;
    this.defaultValue = defaultValue;
    this.alwaysWriteJson = alwaysWriteJson;
    this.required = false;
    this.fixed = false;

    this.type = "any";
  }

  setType(value: string) {
    this.type = value;
    return this;
  }

  setAlias(value: string) {
    this.alias = value;
    return this;
  }

  setDescription(value: string) {
    this.description = value;
  }

  setRequired() {
    this.required = true;
    return this;
  }

  setFixed() {
    this.fixed = true;
    return this;
  }

  // sets modelAttr for nodes, and nodeAttr for model
  setpairedAttr(value: Attribute) {
    this.pairedAttr = value;
  }

  setPairedType(value: string) {
    this.pairedType = value;
  }
}

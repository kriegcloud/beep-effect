import { $UiId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import { Attribute, IAttribute } from "./Attribute";

const $I = $UiId.create("flexlayout-react/AttributeDefinitions");

export class AttributeDefinitionsData extends S.Struct({
  attributes: S.mutable(S.Array(IAttribute)),
  nameToAttribute: S.mutable(S.Map({ key: S.String, value: IAttribute })),
})
  .pipe(S.mutable)
  .annotations(
    $I.annotations("AttributeDefinitionsData", {
      description: "Mutable data for AttributeDefinitions",
    })
  ) {}

export declare namespace AttributeDefinitionsData {
  export type Type = typeof AttributeDefinitionsData.Type;
  export type Encoded = typeof AttributeDefinitionsData.Encoded;
}

export class IAttributeDefinitions extends S.Class<IAttributeDefinitions>($I`IAttributeDefinitions`)({
  data: AttributeDefinitionsData,
}) {
  static readonly new = () =>
    new IAttributeDefinitions({
      data: {
        attributes: [],
        nameToAttribute: new Map(),
      },
    });

  readonly addWithAll = (
    name: string,
    modelName: string | undefined,
    defaultValue: unknown,
    alwaysWriteJson?: boolean
  ): IAttribute => {
    const attr = IAttribute.new(name, modelName, defaultValue, alwaysWriteJson);
    this.data.attributes.push(attr);
    this.data.nameToAttribute.set(name, attr);
    return attr;
  };

  readonly addInherited = (name: string, modelName: string): IAttribute => {
    return this.addWithAll(name, modelName, undefined, false);
  };

  readonly add = (name: string, defaultValue: unknown, alwaysWriteJson?: boolean): IAttribute => {
    return this.addWithAll(name, undefined, defaultValue, alwaysWriteJson);
  };

  readonly getAttributes = (): ReadonlyArray<IAttribute> => {
    return this.data.attributes;
  };

  readonly getModelName = (name: string): O.Option<string> => {
    const conversion = this.data.nameToAttribute.get(name);
    if (conversion !== undefined) {
      return conversion.getModelName();
    }
    return O.none();
  };

  readonly toJson = (jsonObj: Record<string, unknown>, obj: Record<string, unknown>): void => {
    for (const attr of this.data.attributes) {
      const fromValue = obj[attr.getName()];
      const alwaysWrite = attr.getAlwaysWriteJson().pipe(O.getOrElse(() => false));
      if (alwaysWrite || fromValue !== attr.getDefaultValue()) {
        jsonObj[attr.getName()] = fromValue;
      }
    }
  };

  readonly fromJson = (jsonObj: Record<string, unknown>, obj: Record<string, unknown>): void => {
    for (const attr of this.data.attributes) {
      let fromValue = jsonObj[attr.getName()];
      if (fromValue === undefined) {
        const alias = attr.getAlias();
        if (O.isSome(alias)) {
          fromValue = jsonObj[alias.value];
        }
      }
      if (fromValue === undefined) {
        obj[attr.getName()] = attr.getDefaultValue();
      } else {
        obj[attr.getName()] = fromValue;
      }
    }
  };

  readonly update = (jsonObj: Record<string, unknown>, obj: Record<string, unknown>): void => {
    for (const attr of this.data.attributes) {
      if (Object.prototype.hasOwnProperty.call(jsonObj, attr.getName())) {
        const fromValue = jsonObj[attr.getName()];
        if (fromValue === undefined) {
          delete obj[attr.getName()];
        } else {
          obj[attr.getName()] = fromValue;
        }
      }
    }
  };

  readonly setDefaults = (obj: Record<string, unknown>): void => {
    for (const attr of this.data.attributes) {
      obj[attr.getName()] = attr.getDefaultValue();
    }
  };

  readonly pairAttributes = (type: string, childAttributes: IAttributeDefinitions): void => {
    for (const attr of childAttributes.data.attributes) {
      const modelName = attr.getModelName();
      if (O.isSome(modelName) && this.data.nameToAttribute.has(modelName.value)) {
        const pairedAttr = this.data.nameToAttribute.get(modelName.value)!;
        pairedAttr.setpairedAttr(attr);
        attr.setpairedAttr(pairedAttr);
        pairedAttr.setPairedType(type);
      }
    }
  };

  readonly toTypescriptInterface = (name: string, parentAttributes: IAttributeDefinitions | undefined): string => {
    const lines: Array<string> = [];
    const byName = Order.mapInput(Order.string, (attr: IAttribute) => attr.getName());
    const sorted = A.sort(this.data.attributes, byName);

    lines.push(`export interface I${name}Attributes {`);
    for (let i = 0; i < sorted.length; i++) {
      const c = sorted[i]!;
      let type = c.getType();
      let defaultValue: unknown = undefined;

      let attr: IAttribute = c;
      let inherited: string | undefined = undefined;
      if (attr.getDefaultValue() !== undefined) {
        defaultValue = attr.getDefaultValue();
      } else {
        const modelName = attr.getModelName();
        if (
          O.isSome(modelName) &&
          parentAttributes !== undefined &&
          parentAttributes.data.nameToAttribute.get(modelName.value) !== undefined
        ) {
          inherited = modelName.value;
          attr = parentAttributes.data.nameToAttribute.get(inherited)!;
          defaultValue = attr.getDefaultValue();
          type = attr.getType();
        }
      }

      const defValue = JSON.stringify(defaultValue);
      const required = attr.isRequired() ? "" : "?";

      let sb = "\t/**\n\t  ";
      const description = c.getDescription();
      const pairedAttr = c.getpairedAttr();
      const pairedType = c.getPairedType();

      if (O.isSome(description)) {
        sb += description.value;
      } else if (O.isSome(pairedType) && O.isSome(pairedAttr)) {
        const pairedDesc = pairedAttr.value.getDescription();
        sb += `Value for ${pairedType.value} attribute ${pairedAttr.value.getName()} if not overridden`;
        sb += "\n\n\t  ";
        if (O.isSome(pairedDesc)) {
          sb += pairedDesc.value;
        }
      }
      sb += "\n\n\t  ";
      if (c.isFixed()) {
        sb += `Fixed value: ${defValue}`;
      } else if (inherited) {
        sb += `Default: inherited from Global attribute ${O.getOrElse(c.getModelName(), () => "")} (default ${defValue})`;
      } else {
        sb += `Default: ${defValue}`;
      }
      sb += "\n\t */";
      lines.push(sb);
      lines.push(`\t${c.getName()}${required}: ${type};\n`);
    }
    lines.push("}");

    return lines.join("\n");
  };
}

/** @internal */
export class AttributeDefinitions {
  attributes: Attribute[];
  nameToAttribute: Map<string, Attribute>;

  constructor() {
    this.attributes = [];
    this.nameToAttribute = new Map();
  }

  addWithAll(
    name: string,
    modelName: string | undefined,
    defaultValue: UnsafeTypes.UnsafeAny,
    alwaysWriteJson?: undefined | boolean
  ) {
    const attr = new Attribute(name, modelName, defaultValue, alwaysWriteJson);
    this.attributes.push(attr);
    this.nameToAttribute.set(name, attr);
    return attr;
  }

  addInherited(name: string, modelName: string) {
    return this.addWithAll(name, modelName, undefined, false);
  }

  add(name: string, defaultValue: UnsafeTypes.UnsafeAny, alwaysWriteJson?: undefined | boolean) {
    return this.addWithAll(name, undefined, defaultValue, alwaysWriteJson);
  }

  getAttributes() {
    return this.attributes;
  }

  getModelName(name: string) {
    const conversion = this.nameToAttribute.get(name);
    if (conversion !== undefined) {
      return conversion.modelName;
    }
    return undefined;
  }

  toJson(jsonObj: UnsafeTypes.UnsafeAny, obj: UnsafeTypes.UnsafeAny) {
    for (const attr of this.attributes) {
      const fromValue = obj[attr.name];
      if (attr.alwaysWriteJson || fromValue !== attr.defaultValue) {
        jsonObj[attr.name] = fromValue;
      }
    }
  }

  fromJson(jsonObj: UnsafeTypes.UnsafeAny, obj: UnsafeTypes.UnsafeAny) {
    for (const attr of this.attributes) {
      let fromValue = jsonObj[attr.name];
      if (fromValue === undefined && attr.alias) {
        fromValue = jsonObj[attr.alias];
      }
      if (fromValue === undefined) {
        obj[attr.name] = attr.defaultValue;
      } else {
        obj[attr.name] = fromValue;
      }
    }
  }

  update(jsonObj: UnsafeTypes.UnsafeAny, obj: UnsafeTypes.UnsafeAny) {
    for (const attr of this.attributes) {
      if (Object.prototype.hasOwnProperty.call(jsonObj, attr.name)) {
        const fromValue = jsonObj[attr.name];
        if (fromValue === undefined) {
          delete obj[attr.name];
        } else {
          obj[attr.name] = fromValue;
        }
      }
    }
  }

  setDefaults(obj: UnsafeTypes.UnsafeAny) {
    for (const attr of this.attributes) {
      obj[attr.name] = attr.defaultValue;
    }
  }

  pairAttributes(type: string, childAttributes: AttributeDefinitions) {
    for (const attr of childAttributes.attributes) {
      if (attr.modelName && this.nameToAttribute.has(attr.modelName)) {
        const pairedAttr = this.nameToAttribute.get(attr.modelName)!;
        pairedAttr.setpairedAttr(attr);
        attr.setpairedAttr(pairedAttr);
        pairedAttr.setPairedType(type);
      }
    }
  }

  toTypescriptInterface(name: string, parentAttributes: AttributeDefinitions | undefined) {
    const lines = [];
    const sorted = this.attributes.sort((a, b) => a.name.localeCompare(b.name));
    // const sorted = this.attributes;
    lines.push(`export interface I${name}Attributes {`);
    for (let i = 0; i < sorted.length; i++) {
      const c = sorted[i]!;
      let type = c.type;
      let defaultValue = undefined;

      let attr = c;
      let inherited = undefined;
      if (attr?.defaultValue !== undefined) {
        defaultValue = attr.defaultValue;
      } else if (
        attr?.modelName !== undefined &&
        parentAttributes !== undefined &&
        parentAttributes.nameToAttribute.get(attr.modelName) !== undefined
      ) {
        inherited = attr.modelName;
        attr = parentAttributes.nameToAttribute.get(inherited)!;
        defaultValue = attr.defaultValue;
        type = attr.type;
      }

      const defValue = JSON.stringify(defaultValue);

      const required = attr?.required ? "" : "?";

      let sb = "\t/**\n\t  ";
      if (c.description) {
        sb += c.description;
      } else if (c.pairedType && c.pairedAttr?.description) {
        sb += `Value for ${c.pairedType} attribute ${c.pairedAttr.name} if not overridden`;
        sb += "\n\n\t  ";
        sb += c.pairedAttr?.description;
      }
      sb += "\n\n\t  ";
      if (c.fixed) {
        sb += `Fixed value: ${defValue}`;
      } else if (inherited) {
        sb += `Default: inherited from Global attribute ${c.modelName} (default ${defValue})`;
      } else {
        sb += `Default: ${defValue}`;
      }
      sb += "\n\t */";
      lines.push(sb);
      lines.push(`\t${c.name}${required}: ${type};\n`);
    }
    lines.push("}");

    return lines.join("\n");
  }
}

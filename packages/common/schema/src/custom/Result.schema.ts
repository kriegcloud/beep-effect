import { variance } from "@beep/schema/variance";
import type { StructTypes } from "@beep/types";
import * as Data from "effect/Data";
import * as S from "effect/Schema";
import type { DefaultAnnotations } from "../annotations";
import { TaggedStruct } from "../generics";

type FactoryConfig<Fields extends StructTypes.StructFieldsWithStringKeys> = {
  readonly fields: {
    readonly [K in keyof Fields]: Fields[K];
  };
};

export namespace Ok {
  export type SchemaType<Fields extends StructTypes.StructFieldsWithStringKeys> = TaggedStruct.Schema<"ok", Fields>;

  export type Type<Fields extends StructTypes.StructFieldsWithStringKeys> = S.Schema.Type<SchemaType<Fields>>;

  export type Encoded<Fields extends StructTypes.StructFieldsWithStringKeys> = S.Schema.Encoded<SchemaType<Fields>>;

  type Annotations<Fields extends StructTypes.StructFieldsWithStringKeys> = DefaultAnnotations<Type<Fields>>;

  export class Factory<const Fields extends StructTypes.StructFieldsWithStringKeys> extends Data.TaggedClass("ok")<
    FactoryConfig<Fields>
  > {
    readonly Schema: (annotations: Annotations<Fields>) => TaggedStruct.Schema<"ok", Fields>;

    constructor(readonly fields: Fields) {
      super({ fields });
      this.Schema = (annotations: Annotations<Fields>) => TaggedStruct(this._tag, this.fields)(annotations);
    }
  }

  export const make =
    <TFields extends StructTypes.StructFieldsWithStringKeys>(fields: TFields) =>
    (annotations: Annotations<TFields>) =>
      new Factory(fields).Schema(annotations);
}

export namespace Err {
  export type SchemaType<Fields extends StructTypes.StructFieldsWithStringKeys> = TaggedStruct.Schema<"error", Fields>;

  export type Type<Fields extends StructTypes.StructFieldsWithStringKeys> = S.Schema.Type<SchemaType<Fields>>;

  export type Encoded<Fields extends StructTypes.StructFieldsWithStringKeys> = S.Schema.Encoded<SchemaType<Fields>>;

  type Annotations<Fields extends StructTypes.StructFieldsWithStringKeys> = DefaultAnnotations<Type<Fields>>;

  export class Factory<const Fields extends StructTypes.StructFieldsWithStringKeys> extends Data.TaggedClass("error")<
    FactoryConfig<Fields>
  > {
    readonly Schema: (annotations: Annotations<Fields>) => TaggedStruct.Schema<"error", Fields>;

    constructor(readonly fields: Fields) {
      super({ fields });
      this.Schema = (annotations: Annotations<Fields>) => TaggedStruct(this._tag, this.fields)(annotations);
    }
  }

  export const make =
    <TFields extends StructTypes.StructFieldsWithStringKeys>(fields: TFields) =>
    (annotations: Annotations<TFields>) => {
      const schema = new Factory(fields).Schema(annotations);

      return class extends schema {
        [S.TypeId] = variance;
        static [S.TypeId] = variance;
        static readonly method1 = () => "foo";
        static readonly method2 = () => "bar";
      };
    };
}

export class MyErr extends Err.make({
  message: S.String,
})({
  identifier: "MyErr",
  title: "My Err",
  description: "My Error Schema Class",
}) {}

// foo

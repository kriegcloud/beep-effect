import { Field, FormBuilder } from "@beep/form/core";
import * as FormReact from "@beep/form/react/FormReact";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type * as React from "react";

const NameField = Field.makeField("name", S.String);
const ItemsField = Field.makeArrayField("items", S.Struct({ label: S.String }));
const Form = FormBuilder.empty.addField(NameField).addField(ItemsField);

const NameComponent: React.FC<FormReact.FieldComponentProps<string, { readonly label: string }>> = () => null;
const ItemLabelComponent: React.FC<FormReact.FieldComponentProps<string, { readonly placeholder: string }>> = () =>
  null;

describe("@beep/form React types", () => {
  it("extracts extra props from field components", () => {
    expect<FormReact.ExtractExtraProps<typeof NameComponent>>().type.toBe<{ readonly label: string }>();
    expect<FormReact.FieldValue<typeof S.String>>().type.toBe<string>();
  });

  it("maps fields to component requirements", () => {
    type Components = FormReact.FieldComponentMap<typeof Form.fields>;

    const components: Components = {
      name: NameComponent,
      items: {
        label: ItemLabelComponent,
      },
    };

    expect(components.name).type.toBeAssignableTo<
      React.FC<FormReact.FieldComponentProps<string, { readonly label: string }>>
    >();

    // @ts-expect-error!
    const invalidComponents: Components = { name: NameComponent };
    void invalidComponents;
  });

  it("returns typed React components and field refs", () => {
    const built = FormReact.make(Form, {
      fields: {
        name: NameComponent,
        items: {
          label: ItemLabelComponent,
        },
      },
      onSubmit: (_: void, ctx) => ctx.encoded.name,
    });

    expect(built.name).type.toBeAssignableTo<React.FC<{ readonly label: string }>>();
    expect(built.items.label).type.toBeAssignableTo<React.FC<{ readonly placeholder: string }>>();
    expect(built.fields.name).type.toBe<FormBuilder.FieldRef<string>>();
    expect(built.fields.items).type.toBe<FormBuilder.FieldRef<ReadonlyArray<{ readonly label: string }>>>();
    expect(built.submit).type.toBeAssignableTo<unknown>();
  });
});

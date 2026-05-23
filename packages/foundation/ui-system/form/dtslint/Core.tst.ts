import { Field, FormAtoms, FormBuilder, Validation } from "@beep/form/core";
import { type HashMap, type HashSet, Layer } from "effect";
import * as S from "effect/Schema";
import * as Atom from "effect/unstable/reactivity/Atom";
import { describe, expect, it } from "tstyche";

const NameField = Field.makeField("name", S.String);
const TagsField = Field.makeArrayField("tags", S.String);
const Form = FormBuilder.empty.addField(NameField).addField(TagsField);

describe("@beep/form core types", () => {
  it("derives encoded and decoded values from field records", () => {
    type Encoded = Field.EncodedFromFields<typeof Form.fields>;
    type Decoded = Field.DecodedFromFields<typeof Form.fields>;

    expect<Encoded>().type.toBe<{
      readonly name: string;
      readonly tags: ReadonlyArray<string>;
    }>();
    expect<Decoded>().type.toBe<{
      readonly name: string;
      readonly tags: ReadonlyArray<string>;
    }>();

    const encoded: Encoded = { name: "Ada", tags: ["effect"] };
    expect(encoded.name).type.toBe<string>();

    // @ts-expect-error!
    const invalidEncoded: Encoded = { name: 1, tags: ["effect"] };
    void invalidEncoded;
  });

  it("keeps builder refs aligned with encoded field values", () => {
    const atoms = FormAtoms.make({
      runtime: Atom.runtime(Layer.empty),
      formBuilder: Form,
      onSubmit: (_: void, ctx) => ctx.encoded.name,
    });

    expect(atoms.fieldRefs.name).type.toBe<FormBuilder.FieldRef<string>>();
    expect(atoms.fieldRefs.tags).type.toBe<FormBuilder.FieldRef<ReadonlyArray<string>>>();
    expect(atoms.submitAtom).type.toBeAssignableTo<Atom.AtomResultFn<void, string, unknown>>();
  });

  it("models dirty fields and errors with Effect collections", () => {
    const atoms = FormAtoms.make({
      runtime: Atom.runtime(Layer.empty),
      formBuilder: Form,
      onSubmit: () => undefined,
    });

    const state = atoms.operations.createInitialState({ name: "Ada", tags: ["effect"] });
    expect(state.dirtyFields).type.toBe<HashSet.HashSet<string>>();
    expect(atoms.errorsAtom).type.toBeAssignableTo<
      Atom.Writable<HashMap.HashMap<string, Validation.ErrorEntry>, HashMap.HashMap<string, Validation.ErrorEntry>>
    >();
  });

  it("requires validation error sources to be modeled literals", () => {
    const entry = Validation.ErrorEntry.make({ message: "Required", source: "field" });
    expect(entry.source).type.toBe<Validation.ErrorSource>();

    // @ts-expect-error!
    Validation.ErrorEntry.make({ message: "Required", source: "server" });
  });
});

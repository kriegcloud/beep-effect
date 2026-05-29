import * as Field from "@beep/form/core/Field";
import * as FormAtoms from "@beep/form/core/FormAtoms";
import * as FormBuilder from "@beep/form/core/FormBuilder";
import { isPathOrParentDirty } from "@beep/form/core/Path";
import { ErrorEntry } from "@beep/form/core/Validation";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as Registry from "effect/unstable/reactivity/AtomRegistry";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Context from "../helpers/ContextCompat.ts";
import * as Effect from "../helpers/EffectCompat.ts";
import * as S from "../helpers/SchemaCompat.ts";
import type { TUnsafe } from "@beep/types";

const effectTest = (name: string, body: () => Generator<TUnsafe.Any, void, TUnsafe.Any>) =>
  it(name, () => Effect.runPromise(Effect.gen(body) as TUnsafe.Any));

const makeFormError = (message: string, source: "field" | "refinement" = "field"): ErrorEntry =>
  ErrorEntry.make({ message, source });

const makeTestForm = () => {
  const NameField = Field.makeField("name", S.String);
  const EmailField = Field.makeField("email", S.String);
  return FormBuilder.empty.addField(NameField).addField(EmailField);
};

const makeArrayTestForm = () => {
  const TitleField = Field.makeField("title", S.String);
  const ItemsField = Field.makeArrayField("items", S.Struct({ name: S.String }));

  return FormBuilder.empty.addField(TitleField).addField(ItemsField);
};

describe("FormAtoms", () => {
  describe("make", () => {
    it("builds combined schema from form builder", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const result = S.decodeUnknownSync(atoms.combinedSchema)({
        name: "John",
        email: "john@example.com",
      });

      expect(result).toEqual({ name: "John", email: "john@example.com" });
    });
  });

  describe("operations.createInitialState", () => {
    it("creates correct initial state from default values", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const defaultValues = { name: "John", email: "john@test.com" };
      const state = atoms.operations.createInitialState(defaultValues);

      expect(state.values).toEqual(defaultValues);
      expect(state.initialValues).toEqual(defaultValues);
      expect(O.isNone(state.lastSubmittedValues)).toBe(true);
      expect(state.touched).toEqual({ name: false, email: false });
      expect(state.submitCount).toBe(0);
      expect(HashSet.size(state.dirtyFields)).toBe(0);
    });

    it("creates initial state for array form", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const defaultValues = {
        title: "My List",
        items: [{ name: "Item 1" }],
      };
      const state = atoms.operations.createInitialState(defaultValues);

      expect(state.values).toEqual(defaultValues);
      expect(state.initialValues).toEqual(defaultValues);
      expect(state.touched).toEqual({ title: false, items: false });
    });
  });

  describe("operations.createResetState", () => {
    it("resets all state including lastSubmittedValues", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      state = atoms.operations.setFieldValue(state, "name", "Jane");
      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      expect(O.isSome(state.lastSubmittedValues)).toBe(true);

      const resetState = atoms.operations.createResetState(state);

      expect(resetState.values).toEqual({ name: "John", email: "john@test.com" });
      expect(resetState.initialValues).toEqual({ name: "John", email: "john@test.com" });
      expect(O.isNone(resetState.lastSubmittedValues)).toBe(true);
      expect(resetState.touched).toEqual({ name: false, email: false });
      expect(resetState.submitCount).toBe(0);
      expect(HashSet.size(resetState.dirtyFields)).toBe(0);
    });
  });

  describe("operations.createSubmitState", () => {
    it("marks all fields as touched and increments submit count", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      const submitState = atoms.operations.createSubmitState(initialState);

      expect(submitState.touched).toEqual({ name: true, email: true });
      expect(submitState.submitCount).toBe(1);
      expect(submitState.values).toEqual(initialState.values);
    });

    it("does not set lastSubmittedValues", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      const modifiedState = atoms.operations.setFieldValue(initialState, "name", "Jane");

      const submitState = atoms.operations.createSubmitState(modifiedState);

      expect(O.isNone(submitState.lastSubmittedValues)).toBe(true);
    });

    it("increments submit count on subsequent submits", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      state = atoms.operations.createSubmitState(state);
      expect(state.submitCount).toBe(1);

      state = atoms.operations.createSubmitState(state);
      expect(state.submitCount).toBe(2);

      state = atoms.operations.createSubmitState(state);
      expect(state.submitCount).toBe(3);
    });
  });

  describe("operations.setFieldValue", () => {
    it("updates value and marks field as dirty", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      const newState = atoms.operations.setFieldValue(initialState, "name", "Jane");

      expect(newState.values.name).toBe("Jane");
      expect(newState.values.email).toBe("john@test.com");
      expect(HashSet.has(newState.dirtyFields, "name")).toBe(true);
      expect(HashSet.has(newState.dirtyFields, "email")).toBe(false);
    });

    it("removes field from dirty set when value matches initial", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      let state = atoms.operations.setFieldValue(initialState, "name", "Jane");
      expect(HashSet.has(state.dirtyFields, "name")).toBe(true);

      state = atoms.operations.setFieldValue(state, "name", "John");
      expect(HashSet.has(state.dirtyFields, "name")).toBe(false);
    });

    it("updates nested array field values", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "Item 1" }, { name: "Item 2" }],
      });

      const newState = atoms.operations.setFieldValue(initialState, "items[0].name", "Updated Item");

      expect(newState.values.items[0]!.name).toBe("Updated Item");
      expect(newState.values.items[1]!.name).toBe("Item 2");
    });
  });

  describe("operations.setFormValues", () => {
    it("updates all values and recalculates dirty fields", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      const newValues = { name: "Jane", email: "john@test.com" };
      const newState = atoms.operations.setFormValues(initialState, newValues);

      expect(newState.values).toEqual(newValues);
      expect(HashSet.has(newState.dirtyFields, "name")).toBe(true);
      expect(HashSet.has(newState.dirtyFields, "email")).toBe(false);
    });

    it("clears dirty fields when values match initial", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialValues = { name: "John", email: "john@test.com" };
      const initialState = atoms.operations.createInitialState(initialValues);

      let state = atoms.operations.setFormValues(initialState, {
        name: "Jane",
        email: "jane@test.com",
      });
      expect(HashSet.size(state.dirtyFields)).toBe(2);

      state = atoms.operations.setFormValues(state, initialValues);
      expect(HashSet.size(state.dirtyFields)).toBe(0);
    });
  });

  describe("operations.setFieldTouched", () => {
    it("marks field as touched", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      const newState = atoms.operations.setFieldTouched(initialState, "name", true);

      expect(newState.touched.name).toBe(true);
      expect(newState.touched.email).toBe(false);
    });

    it("can unmark field as touched", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      state = atoms.operations.setFieldTouched(state, "name", true);
      expect(state.touched.name).toBe(true);

      state = atoms.operations.setFieldTouched(state, "name", false);
      expect(state.touched.name).toBe(false);
    });
  });

  describe("operations.appendArrayItem", () => {
    it("adds item to array and updates dirty fields", () => {
      const runtime = Atom.runtime(Layer.empty);
      const TitleField = Field.makeField("title", S.String);
      const ItemSchema = S.Struct({ name: S.String });
      const ItemsField = Field.makeArrayField("items", ItemSchema);
      const form = FormBuilder.empty.addField(TitleField).addField(ItemsField);

      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [],
      });

      const newState = atoms.operations.appendArrayItem(initialState, "items", ItemSchema, { name: "New Item" });

      expect(newState.values.items).toHaveLength(1);
      expect(newState.values.items[0]).toEqual({ name: "New Item" });
      expect(HashSet.has(newState.dirtyFields, "items")).toBe(true);
    });

    it("uses default values when no value provided", () => {
      const runtime = Atom.runtime(Layer.empty);
      const TitleField = Field.makeField("title", S.String);
      const ItemSchema = S.Struct({ name: S.String });
      const ItemsField = Field.makeArrayField("items", ItemSchema);
      const form = FormBuilder.empty.addField(TitleField).addField(ItemsField);

      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [],
      });

      const newState = atoms.operations.appendArrayItem(initialState, "items", ItemSchema);

      expect(newState.values.items).toHaveLength(1);
      expect(newState.values.items[0]).toEqual({ name: "" });
    });
  });

  describe("operations.removeArrayItem", () => {
    it("removes item from array and updates dirty fields", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "Item 1" }, { name: "Item 2" }, { name: "Item 3" }],
      });

      const newState = atoms.operations.removeArrayItem(initialState, "items", 1);

      expect(newState.values.items).toHaveLength(2);
      expect(newState.values.items[0]).toEqual({ name: "Item 1" });
      expect(newState.values.items[1]).toEqual({ name: "Item 3" });
    });

    it("handles out of bounds index gracefully (no items match filter)", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "Item 1" }],
      });

      const newState = atoms.operations.removeArrayItem(initialState, "items", 999);

      expect(newState.values.items).toHaveLength(1);
      expect(newState.values.items[0]).toEqual({ name: "Item 1" });
    });
  });

  describe("operations.swapArrayItems", () => {
    it("swaps two items in array", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "A" }, { name: "B" }, { name: "C" }],
      });

      const newState = atoms.operations.swapArrayItems(initialState, "items", 0, 2);

      expect(newState.values.items[0]).toEqual({ name: "C" });
      expect(newState.values.items[1]).toEqual({ name: "B" });
      expect(newState.values.items[2]).toEqual({ name: "A" });
    });

    it("returns same state when indices are out of bounds or equal", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "A" }],
      });

      const newState = atoms.operations.swapArrayItems(initialState, "items", 0, 999);

      expect(newState).toBe(initialState);
      expect(newState.values.items).toHaveLength(1);
      expect(newState.values.items[0]).toEqual({ name: "A" });
    });

    it("marks parent paths dirty after swap and clears after swapping back", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "A" }, { name: "B" }],
      });

      const swapped = atoms.operations.swapArrayItems(initialState, "items", 0, 1);

      expect(isPathOrParentDirty(swapped.dirtyFields, "items[0].name")).toBe(true);
      expect(isPathOrParentDirty(swapped.dirtyFields, "items[1].name")).toBe(true);

      const swappedBack = atoms.operations.swapArrayItems(swapped, "items", 0, 1);

      expect(isPathOrParentDirty(swappedBack.dirtyFields, "items[0].name")).toBe(false);
      expect(isPathOrParentDirty(swappedBack.dirtyFields, "items[1].name")).toBe(false);
      expect(HashSet.size(swappedBack.dirtyFields)).toBe(0);
    });
  });

  describe("operations.moveArrayItem", () => {
    it("moves item from one position to another", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }],
      });

      const newState = atoms.operations.moveArrayItem(initialState, "items", 0, 2);

      expect(newState.values.items[0]).toEqual({ name: "B" });
      expect(newState.values.items[1]).toEqual({ name: "C" });
      expect(newState.values.items[2]).toEqual({ name: "A" });
      expect(newState.values.items[3]).toEqual({ name: "D" });
    });

    it("handles moving from end to beginning", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "A" }, { name: "B" }, { name: "C" }],
      });

      const newState = atoms.operations.moveArrayItem(initialState, "items", 2, 0);

      expect(newState.values.items[0]).toEqual({ name: "C" });
      expect(newState.values.items[1]).toEqual({ name: "A" });
      expect(newState.values.items[2]).toEqual({ name: "B" });
    });

    it("returns same state when indices are out of bounds or equal", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "A" }],
      });

      const newState = atoms.operations.moveArrayItem(initialState, "items", 999, 0);

      expect(newState).toBe(initialState);
      expect(newState.values.items).toHaveLength(1);
      expect(newState.values.items[0]).toEqual({ name: "A" });
    });

    it("allows moving an item to the end index", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "A" }, { name: "B" }, { name: "C" }],
      });

      const newState = atoms.operations.moveArrayItem(initialState, "items", 0, 3);

      expect(newState.values.items[0]).toEqual({ name: "B" });
      expect(newState.values.items[1]).toEqual({ name: "C" });
      expect(newState.values.items[2]).toEqual({ name: "A" });
    });
  });

  describe("operations.revertToLastSubmit", () => {
    it("returns same state when lastSubmittedValues is None", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      const modifiedState = atoms.operations.setFieldValue(initialState, "name", "Jane");

      const revertedState = atoms.operations.revertToLastSubmit(modifiedState);

      expect(revertedState).toBe(modifiedState);
    });

    it("returns same state when values already match lastSubmittedValues", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      const revertedState = atoms.operations.revertToLastSubmit(state);

      expect(revertedState).toBe(state);
    });

    it("restores values to lastSubmittedValues and recalculates dirtyFields", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      state = atoms.operations.setFieldValue(state, "name", "Jane");
      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      state = atoms.operations.setFieldValue(state, "name", "Bob");
      expect(state.values.name).toBe("Bob");
      expect(HashSet.has(state.dirtyFields, "name")).toBe(true);

      const revertedState = atoms.operations.revertToLastSubmit(state);

      expect(revertedState.values.name).toBe("Jane");
      expect(HashSet.has(revertedState.dirtyFields, "name")).toBe(true);
    });

    it("clears dirtyFields when reverting makes values match initial", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      state = atoms.operations.setFieldValue(state, "name", "Jane");
      expect(HashSet.has(state.dirtyFields, "name")).toBe(true);

      const revertedState = atoms.operations.revertToLastSubmit(state);

      expect(revertedState.values.name).toBe("John");
      expect(HashSet.has(revertedState.dirtyFields, "name")).toBe(false);
    });
  });

  describe("getOrCreateFieldAtoms", () => {
    it("creates all expected field atoms", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      registry.set(
        atoms.stateAtom,
        O.some(atoms.operations.createInitialState({ name: "John", email: "test@test.com" }))
      );

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);

      expect(fieldAtoms.valueAtom).toBeDefined();
      expect(fieldAtoms.initialValueAtom).toBeDefined();
      expect(fieldAtoms.touchedAtom).toBeDefined();
      expect(fieldAtoms.errorAtom).toBeDefined();
    });

    it("reuses existing isDirty atom created via getFieldAtoms", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      registry.set(
        atoms.stateAtom,
        O.some(atoms.operations.createInitialState({ name: "John", email: "test@test.com" }))
      );

      const publicAtoms = atoms.getFieldAtoms(atoms.fieldRefs.name);
      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);

      expect(registry.get(fieldAtoms.isDirtyAtom)).toBe(registry.get(publicAtoms.isDirty));
    });

    it("recreates field atoms when schema changes for the same path", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      registry.set(
        atoms.stateAtom,
        O.some(atoms.operations.createInitialState({ name: "John", email: "test@test.com" }))
      );

      const fieldAtomsA = atoms.getOrCreateFieldAtoms("name", S.String);
      const fieldAtomsB = atoms.getOrCreateFieldAtoms("name", S.Number);

      expect(fieldAtomsA).not.toBe(fieldAtomsB);
      expect(fieldAtomsA.validationAtom).not.toBe(fieldAtomsB.validationAtom);
      expect(atoms.validationAtomsRegistry.get("name")).toBe(fieldAtomsB.validationAtom);
    });
  });

  describe("resetValidationAtoms", () => {
    it("keeps atom instances stable across resets", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      registry.set(
        atoms.stateAtom,
        O.some(atoms.operations.createInitialState({ name: "John", email: "test@test.com" }))
      );

      atoms.getOrCreateFieldAtoms("name", S.String);
      atoms.getOrCreateValidationAtom("name", S.String);

      expect(atoms.fieldAtomsRegistry.get("name")).toBeDefined();
      expect(atoms.validationAtomsRegistry.get("name")).toBeDefined();

      atoms.resetValidationAtoms(registry);

      expect(atoms.fieldAtomsRegistry.get("name")).toBeDefined();
      expect(atoms.validationAtomsRegistry.get("name")).toBeDefined();
    });

    it("returns same public field atoms after reset", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });
      registry.set(atoms.stateAtom, O.some(initialState));

      const before = atoms.getFieldAtoms(atoms.fieldRefs.name);

      atoms.resetValidationAtoms(registry);

      const after = atoms.getFieldAtoms(atoms.fieldRefs.name);

      expect(before).toBe(after);
    });
  });

  describe("derived atoms", () => {
    it("dirtyFieldsAtom reflects state", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "test@test.com",
      });

      registry.set(atoms.stateAtom, O.some(initialState));
      expect(HashSet.size(registry.get(atoms.dirtyFieldsAtom))).toBe(0);

      const modifiedState = atoms.operations.setFieldValue(initialState, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(modifiedState));
      expect(HashSet.has(registry.get(atoms.dirtyFieldsAtom), "name")).toBe(true);
    });

    it("isDirtyAtom reflects dirty state", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "test@test.com",
      });

      registry.set(atoms.stateAtom, O.some(initialState));
      expect(registry.get(atoms.isDirtyAtom)).toBe(false);

      const modifiedState = atoms.operations.setFieldValue(initialState, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(modifiedState));
      expect(registry.get(atoms.isDirtyAtom)).toBe(true);
    });

    it("submitCountAtom reflects submit count", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "test@test.com",
      });

      registry.set(atoms.stateAtom, O.some(initialState));
      expect(registry.get(atoms.submitCountAtom)).toBe(0);

      const submitState = atoms.operations.createSubmitState(initialState);
      registry.set(atoms.stateAtom, O.some(submitState));
      expect(registry.get(atoms.submitCountAtom)).toBe(1);
    });

    it("lastSubmittedValuesAtom reflects lastSubmittedValues", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "test@test.com",
      });

      registry.set(atoms.stateAtom, O.some(initialState));
      expect(O.isNone(registry.get(atoms.lastSubmittedValuesAtom))).toBe(true);

      let submitState = atoms.operations.createSubmitState(initialState);
      submitState = {
        ...submitState,
        lastSubmittedValues: O.some({
          encoded: submitState.values,
          decoded: submitState.values,
        }),
      };
      registry.set(atoms.stateAtom, O.some(submitState));
      expect(O.isSome(registry.get(atoms.lastSubmittedValuesAtom))).toBe(true);
      expect(O.getOrThrow(registry.get(atoms.lastSubmittedValuesAtom)).encoded).toEqual({
        name: "John",
        email: "test@test.com",
      });
    });

    it("hasChangedSinceSubmitAtom returns false before first submit", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "test@test.com",
      });

      const modifiedState = atoms.operations.setFieldValue(initialState, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(modifiedState));
      expect(registry.get(atoms.hasChangedSinceSubmitAtom)).toBe(false);
    });

    it("hasChangedSinceSubmitAtom returns false right after submit", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "test@test.com",
      });

      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      registry.set(atoms.stateAtom, O.some(state));
      expect(registry.get(atoms.hasChangedSinceSubmitAtom)).toBe(false);
    });

    it("hasChangedSinceSubmitAtom returns true after changes post-submit", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "test@test.com",
      });

      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      state = atoms.operations.setFieldValue(state, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(state));
      expect(registry.get(atoms.hasChangedSinceSubmitAtom)).toBe(true);
    });

    it("changedSinceSubmitFieldsAtom returns correct fields after changes post-submit", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "test@test.com",
      });

      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      state = atoms.operations.setFieldValue(state, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(state));

      const changedFields = registry.get(atoms.changedSinceSubmitFieldsAtom);
      expect(HashSet.has(changedFields, "name")).toBe(true);
      expect(HashSet.has(changedFields, "email")).toBe(false);
    });

    it("changedSinceSubmitFieldsAtom tracks array item changes after submit", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "Item A" }, { name: "Item B" }],
      });

      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      state = atoms.operations.setFieldValue(state, "items[1].name", "Item C");
      registry.set(atoms.stateAtom, O.some(state));

      const changedFields = registry.get(atoms.changedSinceSubmitFieldsAtom);
      expect(HashSet.has(changedFields, "items[1].name")).toBe(true);
      expect(HashSet.has(changedFields, "items[0].name")).toBe(false);
      expect(HashSet.has(changedFields, "title")).toBe(false);
    });

    it("hasChangedSinceSubmitAtom detects array append after submit", () => {
      const runtime = Atom.runtime(Layer.empty);
      const TitleField = Field.makeField("title", S.String);
      const ItemSchema = S.Struct({ name: S.String });
      const ItemsField = Field.makeArrayField("items", ItemSchema);
      const form = FormBuilder.empty.addField(TitleField).addField(ItemsField);
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "Item A" }],
      });

      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      state = atoms.operations.appendArrayItem(state, "items", ItemSchema, { name: "Item B" });
      registry.set(atoms.stateAtom, O.some(state));

      expect(registry.get(atoms.hasChangedSinceSubmitAtom)).toBe(true);
    });

    it("revertToLastSubmit restores to most recent submit (not earlier ones)", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });

      state = atoms.operations.setFieldValue(state, "name", "Jane");
      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      expect(O.getOrThrow(state.lastSubmittedValues).encoded.name).toBe("Jane");

      state = atoms.operations.setFieldValue(state, "name", "Bob");
      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      expect(O.getOrThrow(state.lastSubmittedValues).encoded.name).toBe("Bob");

      state = atoms.operations.setFieldValue(state, "name", "Charlie");
      expect(state.values.name).toBe("Charlie");

      const revertedState = atoms.operations.revertToLastSubmit(state);
      expect(revertedState.values.name).toBe("Bob");
    });

    it("changedSinceSubmitFieldsAtom handles nested object changes", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeArrayTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({
        title: "My List",
        items: [{ name: "Item A" }],
      });

      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };

      state = atoms.operations.setFieldValue(state, "items[0].name", "Updated");
      registry.set(atoms.stateAtom, O.some(state));

      expect(registry.get(atoms.hasChangedSinceSubmitAtom)).toBe(true);
      expect(HashSet.has(registry.get(atoms.changedSinceSubmitFieldsAtom), "items[0].name")).toBe(true);
    });
  });

  describe("resetAtom", () => {
    it("resets form to initial state and clears cross-field errors", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });
      registry.set(atoms.stateAtom, O.some(initialState));

      let state = atoms.operations.setFieldValue(initialState, "name", "Jane");
      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      registry.set(atoms.stateAtom, O.some(state));
      registry.set(atoms.errorsAtom, HashMap.make(["name", makeFormError("Some error", "field")]));

      expect(registry.get(atoms.stateAtom).pipe(O.getOrThrow).values.name).toBe("Jane");
      expect(O.isSome(registry.get(atoms.stateAtom).pipe(O.getOrThrow).lastSubmittedValues)).toBe(true);
      expect(HashMap.size(registry.get(atoms.errorsAtom))).toBe(1);

      registry.mount(atoms.resetAtom);
      registry.set(atoms.resetAtom, undefined);

      const resetState = registry.get(atoms.stateAtom).pipe(O.getOrThrow);
      expect(resetState.values.name).toBe("John");
      expect(O.isNone(resetState.lastSubmittedValues)).toBe(true);
      expect(resetState.submitCount).toBe(0);
      expect(HashMap.size(registry.get(atoms.errorsAtom))).toBe(0);
    });
  });

  describe("revertToLastSubmitAtom", () => {
    it("reverts form values to last submitted state and clears cross-field errors", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });
      state = atoms.operations.setFieldValue(state, "name", "Jane");
      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      registry.set(atoms.stateAtom, O.some(state));

      state = atoms.operations.setFieldValue(state, "name", "Bob");
      registry.set(atoms.stateAtom, O.some(state));
      registry.set(atoms.errorsAtom, HashMap.make(["name", makeFormError("Validation error", "field")]));

      expect(registry.get(atoms.stateAtom).pipe(O.getOrThrow).values.name).toBe("Bob");

      registry.mount(atoms.revertToLastSubmitAtom);
      registry.set(atoms.revertToLastSubmitAtom, undefined);

      const revertedState = registry.get(atoms.stateAtom).pipe(O.getOrThrow);
      expect(revertedState.values.name).toBe("Jane");
      expect(HashMap.size(registry.get(atoms.errorsAtom))).toBe(0);
    });
  });

  describe("setValuesAtom", () => {
    it("sets all form values and clears cross-field errors", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });
      registry.set(atoms.stateAtom, O.some(initialState));
      registry.set(atoms.errorsAtom, HashMap.make(["email", makeFormError("Invalid email", "field")]));

      registry.mount(atoms.setValuesAtom);
      registry.set(atoms.setValuesAtom, { name: "Alice", email: "alice@test.com" });

      const newState = registry.get(atoms.stateAtom).pipe(O.getOrThrow);
      expect(newState.values.name).toBe("Alice");
      expect(newState.values.email).toBe("alice@test.com");
      expect(HashSet.has(newState.dirtyFields, "name")).toBe(true);
      expect(HashSet.has(newState.dirtyFields, "email")).toBe(true);
      expect(HashMap.size(registry.get(atoms.errorsAtom))).toBe(0);
    });

    it("accepts an updater function that receives current values", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });
      registry.set(atoms.stateAtom, O.some(initialState));
      registry.set(atoms.errorsAtom, HashMap.make(["email", makeFormError("Invalid email", "field")]));

      registry.mount(atoms.setValuesAtom);
      registry.update(atoms.setValuesAtom, (prev) => ({ ...prev, name: "Alice" }));

      const newState = registry.get(atoms.stateAtom).pipe(O.getOrThrow);
      expect(newState.values.name).toBe("Alice");
      expect(newState.values.email).toBe("john@test.com");
      expect(HashSet.has(newState.dirtyFields, "name")).toBe(true);
      expect(HashSet.has(newState.dirtyFields, "email")).toBe(false);
      expect(HashMap.size(registry.get(atoms.errorsAtom))).toBe(0);
    });
  });

  describe("getFieldAtoms", () => {
    describe("setValue", () => {
      it("sets a single field value", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const initialState = atoms.operations.createInitialState({
          name: "John",
          email: "john@test.com",
        });
        registry.set(atoms.stateAtom, O.some(initialState));

        const setNameAtom = atoms.getFieldAtoms(atoms.fieldRefs.name).setValue;

        registry.mount(setNameAtom);
        registry.set(setNameAtom, "Alice");

        const newState = registry.get(atoms.stateAtom).pipe(O.getOrThrow);
        expect(newState.values.name).toBe("Alice");
        expect(newState.values.email).toBe("john@test.com");
        expect(HashSet.has(newState.dirtyFields, "name")).toBe(true);
        expect(HashSet.has(newState.dirtyFields, "email")).toBe(false);
      });

      it("supports functional updates", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const initialState = atoms.operations.createInitialState({
          name: "John",
          email: "john@test.com",
        });
        registry.set(atoms.stateAtom, O.some(initialState));

        const setNameAtom = atoms.getFieldAtoms(atoms.fieldRefs.name).setValue;

        registry.mount(setNameAtom);
        registry.set(setNameAtom, (prev: string) => prev.toUpperCase());

        const newState = registry.get(atoms.stateAtom).pipe(O.getOrThrow);
        expect(newState.values.name).toBe("JOHN");
      });

      it("does not clear stored errors (display logic handles clearing)", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeArrayTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const initialState = atoms.operations.createInitialState({
          title: "My List",
          items: [{ name: "Item 1" }],
        });
        registry.set(atoms.stateAtom, O.some(initialState));

        registry.set(
          atoms.errorsAtom,
          HashMap.make(
            ["items", makeFormError("Array error")],
            ["items[0]", makeFormError("Item error")],
            ["items[0].name", makeFormError("Name error")],
            ["title", makeFormError("Title error")]
          )
        );

        const setItemsAtom = atoms.getFieldAtoms(atoms.fieldRefs.items).setValue;

        registry.mount(setItemsAtom);
        registry.set(setItemsAtom, [{ name: "Updated Item" }]);

        const errors = registry.get(atoms.errorsAtom);
        expect(HashMap.has(errors, "items")).toBe(true);
        expect(HashMap.has(errors, "items[0]")).toBe(true);
        expect(HashMap.has(errors, "items[0].name")).toBe(true);
        expect(HashMap.has(errors, "title")).toBe(true);
      });
    });

    describe("value", () => {
      it("returns O.some(value) when initialized", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const initialState = atoms.operations.createInitialState({
          name: "John",
          email: "john@test.com",
        });
        registry.set(atoms.stateAtom, O.some(initialState));

        const nameValue = atoms.getFieldAtoms(atoms.fieldRefs.name).value;

        expect(registry.get(nameValue)).toEqual(O.some("John"));
      });

      it("updates when field value changes", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        let state = atoms.operations.createInitialState({
          name: "John",
          email: "john@test.com",
        });
        registry.set(atoms.stateAtom, O.some(state));

        const nameValue = atoms.getFieldAtoms(atoms.fieldRefs.name).value;
        expect(registry.get(nameValue)).toEqual(O.some("John"));

        state = atoms.operations.setFieldValue(state, "name", "Jane");
        registry.set(atoms.stateAtom, O.some(state));

        expect(registry.get(nameValue)).toEqual(O.some("Jane"));
      });

      it("returns O.none() when form is not initialized", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const nameValue = atoms.getFieldAtoms(atoms.fieldRefs.name).value;

        expect(registry.get(nameValue)).toEqual(O.none());
      });

      it("updates from None to Some when form initializes", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const nameValue = atoms.getFieldAtoms(atoms.fieldRefs.name).value;
        expect(registry.get(nameValue)).toEqual(O.none());

        const initialState = atoms.operations.createInitialState({
          name: "John",
          email: "john@test.com",
        });
        registry.set(atoms.stateAtom, O.some(initialState));

        expect(registry.get(nameValue)).toEqual(O.some("John"));
      });
    });

    describe("isDirty", () => {
      it("returns false before initialization", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const isDirty = atoms.getFieldAtoms(atoms.fieldRefs.name).isDirty;

        expect(registry.get(isDirty)).toBe(false);
      });

      it("returns false for clean field after init", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const initialState = atoms.operations.createInitialState({
          name: "John",
          email: "john@test.com",
        });
        registry.set(atoms.stateAtom, O.some(initialState));

        const isDirty = atoms.getFieldAtoms(atoms.fieldRefs.name).isDirty;

        expect(registry.get(isDirty)).toBe(false);
      });

      it("returns true after setting field value", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        let state = atoms.operations.createInitialState({
          name: "John",
          email: "john@test.com",
        });
        registry.set(atoms.stateAtom, O.some(state));

        state = atoms.operations.setFieldValue(state, "name", "Jane");
        registry.set(atoms.stateAtom, O.some(state));

        const isDirty = atoms.getFieldAtoms(atoms.fieldRefs.name).isDirty;

        expect(registry.get(isDirty)).toBe(true);
      });

      it("returns false after reverting field value to initial", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        let state = atoms.operations.createInitialState({
          name: "John",
          email: "john@test.com",
        });
        registry.set(atoms.stateAtom, O.some(state));

        state = atoms.operations.setFieldValue(state, "name", "Jane");
        registry.set(atoms.stateAtom, O.some(state));

        state = atoms.operations.setFieldValue(state, "name", "John");
        registry.set(atoms.stateAtom, O.some(state));

        const isDirty = atoms.getFieldAtoms(atoms.fieldRefs.name).isDirty;

        expect(registry.get(isDirty)).toBe(false);
      });

      it("returns same bundle for same field", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        registry.set(
          atoms.stateAtom,
          O.some(atoms.operations.createInitialState({ name: "John", email: "john@test.com" }))
        );

        const bundle1 = atoms.getFieldAtoms(atoms.fieldRefs.name);
        const bundle2 = atoms.getFieldAtoms(atoms.fieldRefs.name);

        expect(bundle1).toBe(bundle2);
      });
    });

    describe("isTouched", () => {
      it("returns false before initialization", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const isTouched = atoms.getFieldAtoms(atoms.fieldRefs.name).isTouched;

        expect(registry.get(isTouched)).toBe(false);
      });

      it("returns false for untouched field after init", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const initialState = atoms.operations.createInitialState({
          name: "John",
          email: "john@test.com",
        });
        registry.set(atoms.stateAtom, O.some(initialState));

        const isTouched = atoms.getFieldAtoms(atoms.fieldRefs.name).isTouched;

        expect(registry.get(isTouched)).toBe(false);
      });

      it("returns true after setTouched(true)", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const initialState = atoms.operations.createInitialState({
          name: "John",
          email: "john@test.com",
        });
        registry.set(atoms.stateAtom, O.some(initialState));

        const { isTouched, setTouched } = atoms.getFieldAtoms(atoms.fieldRefs.name);

        registry.mount(setTouched);
        registry.set(setTouched, true);

        expect(registry.get(isTouched)).toBe(true);
      });
    });

    describe("setTouched", () => {
      it("no-ops when form is not initialized", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const { setTouched } = atoms.getFieldAtoms(atoms.fieldRefs.name);

        registry.mount(setTouched);
        registry.set(setTouched, true);

        expect(O.isNone(registry.get(atoms.stateAtom))).toBe(true);
      });
    });

    describe("isValidating", () => {
      it("returns false before initialization", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const isValidating = atoms.getFieldAtoms(atoms.fieldRefs.name).isValidating;

        expect(registry.get(isValidating)).toBe(false);
      });
    });

    describe("error", () => {
      it("returns O.none() before initialization", () => {
        const runtime = Atom.runtime(Layer.empty);
        const form = makeTestForm();
        const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
        const registry = Registry.make();

        const error = atoms.getFieldAtoms(atoms.fieldRefs.name).error;

        expect(registry.get(error)).toEqual(O.none());
      });
    });
  });

  describe("submitAtom", () => {
    effectTest("does not set lastSubmittedValues on validation failure", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const EmailField = Field.makeField("email", S.String.check(S.isNonEmpty({ message: "Email is required" })));
      const form = FormBuilder.empty.addField(EmailField);
      const onSubmit = vi.fn();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({ email: "" });
      registry.set(atoms.stateAtom, O.some(initialState));
      registry.mount(atoms.stateAtom);

      const stateBefore = registry.get(atoms.stateAtom).pipe(O.getOrThrow);
      expect(O.isNone(stateBefore.lastSubmittedValues)).toBe(true);

      registry.mount(atoms.submitAtom);
      registry.set(atoms.submitAtom, undefined);

      yield* Effect.sleep("50 millis");

      expect(onSubmit).not.toHaveBeenCalled();
      const stateAfter = registry.get(atoms.stateAtom).pipe(O.getOrThrow);
      expect(O.isNone(stateAfter.lastSubmittedValues)).toBe(true);
    });

    effectTest("sets lastSubmittedValues with encoded and decoded on successful validation", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const EmailField = Field.makeField("email", S.String.check(S.isNonEmpty({ message: "Email is required" })));
      const form = FormBuilder.empty.addField(EmailField);
      const onSubmit = vi.fn();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({ email: "test@example.com" });
      registry.set(atoms.stateAtom, O.some(initialState));
      registry.mount(atoms.stateAtom);

      expect(O.isNone(registry.get(atoms.stateAtom).pipe(O.getOrThrow).lastSubmittedValues)).toBe(true);

      registry.mount(atoms.submitAtom);
      registry.set(atoms.submitAtom, undefined);

      yield* Effect.sleep("50 millis");

      expect(onSubmit).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          decoded: { email: "test@example.com" },
          encoded: { email: "test@example.com" },
        })
      );
      expect(O.isSome(registry.get(atoms.stateAtom).pipe(O.getOrThrow).lastSubmittedValues)).toBe(true);
    });

    effectTest("does not set lastSubmittedValues when onSubmit fails", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const EmailField = Field.makeField("email", S.String.check(S.isNonEmpty({ message: "Email is required" })));
      const form = FormBuilder.empty.addField(EmailField);
      const onSubmit = vi.fn(() => Effect.fail("submit failed"));
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({ email: "test@example.com" });
      registry.set(atoms.stateAtom, O.some(initialState));
      registry.mount(atoms.stateAtom);
      registry.mount(atoms.submitAtom);
      registry.set(atoms.submitAtom, undefined);

      yield* Effect.sleep("50 millis");

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(O.isNone(registry.get(atoms.stateAtom).pipe(O.getOrThrow).lastSubmittedValues)).toBe(true);
    });

    effectTest("collects all validation errors on submit, not just the first", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const NameField = Field.makeField("name", S.String.check(S.isNonEmpty({ message: "Name is required" })));
      const EmailField = Field.makeField("email", S.String.check(S.isNonEmpty({ message: "Email is required" })));
      const AgeField = Field.makeField("age", S.String.check(S.isNonEmpty({ message: "Age is required" })));
      const form = FormBuilder.empty.addField(NameField).addField(EmailField).addField(AgeField);
      const onSubmit = vi.fn();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({ name: "", email: "", age: "" });
      registry.set(atoms.stateAtom, O.some(initialState));
      registry.mount(atoms.stateAtom);
      registry.mount(atoms.errorsAtom);
      registry.mount(atoms.submitAtom);
      registry.set(atoms.submitAtom, undefined);

      yield* Effect.sleep("50 millis");

      expect(onSubmit).not.toHaveBeenCalled();
      const errors = registry.get(atoms.errorsAtom);
      expect(HashMap.size(errors)).toBe(3);
      expect(HashMap.has(errors, "name")).toBe(true);
      expect(HashMap.has(errors, "email")).toBe(true);
      expect(HashMap.has(errors, "age")).toBe(true);
    });

    effectTest("preserves previous lastSubmittedValues when subsequent submit fails", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const EmailField = Field.makeField("email", S.String.check(S.isNonEmpty({ message: "Email is required" })));
      const form = FormBuilder.empty.addField(EmailField);
      const onSubmit = vi.fn();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ email: "first@example.com" });
      registry.set(atoms.stateAtom, O.some(state));
      registry.mount(atoms.stateAtom);
      registry.mount(atoms.submitAtom);
      registry.set(atoms.submitAtom, undefined);

      yield* Effect.sleep("50 millis");

      expect(onSubmit).toHaveBeenCalledTimes(1);
      state = registry.get(atoms.stateAtom).pipe(O.getOrThrow);
      expect(O.isSome(state.lastSubmittedValues)).toBe(true);
      expect(O.getOrThrow(state.lastSubmittedValues).encoded.email).toBe("first@example.com");
      expect(O.getOrThrow(state.lastSubmittedValues).decoded.email).toBe("first@example.com");

      state = atoms.operations.setFieldValue(state, "email", "");
      registry.set(atoms.stateAtom, O.some(state));
      registry.set(atoms.submitAtom, undefined);

      yield* Effect.sleep("50 millis");

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const finalState = registry.get(atoms.stateAtom).pipe(O.getOrThrow);
      expect(O.isSome(finalState.lastSubmittedValues)).toBe(true);
      expect(O.getOrThrow(finalState.lastSubmittedValues).encoded.email).toBe("first@example.com");
    });
  });

  describe("rootErrorAtom", () => {
    it("extracts root-level refinement errors from errorsAtom", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });
      registry.set(atoms.stateAtom, O.some(initialState));

      registry.set(
        atoms.errorsAtom,
        HashMap.make(
          ["", makeFormError("Form-level validation failed", "refinement")],
          ["name", makeFormError("Name error")]
        )
      );

      const formError = registry.get(atoms.rootErrorAtom);
      expect(O.isSome(formError)).toBe(true);
      expect(O.getOrThrow(formError)).toBe("Form-level validation failed");
    });

    it("returns None when no root-level error exists", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {} });
      const registry = Registry.make();

      const initialState = atoms.operations.createInitialState({
        name: "John",
        email: "john@test.com",
      });
      registry.set(atoms.stateAtom, O.some(initialState));

      registry.set(atoms.errorsAtom, HashMap.make(["name", makeFormError("Name error", "field")]));

      const formError = registry.get(atoms.rootErrorAtom);
      expect(O.isNone(formError)).toBe(true);
    });
  });

  describe("displayErrorAtom", () => {
    it("returns O.none() in initial state", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onSubmit" },
      });
      const registry = Registry.make();

      registry.set(
        atoms.stateAtom,
        O.some(atoms.operations.createInitialState({ name: "John", email: "test@test.com" }))
      );

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);
      registry.mount(fieldAtoms.displayErrorAtom);

      expect(registry.get(fieldAtoms.displayErrorAtom)).toEqual(O.none());
    });

    effectTest("returns live per-field error when validation fails", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const NameField = Field.makeField("name", S.String.check(S.isNonEmpty({ message: "Name is required" })));
      const EmailField = Field.makeField("email", S.String);
      const form = FormBuilder.empty.addField(NameField).addField(EmailField);
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onSubmit" },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "", email: "test@test.com" });
      state = atoms.operations.createSubmitState(state);
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", NameField.schema);
      registry.mount(fieldAtoms.displayErrorAtom);
      registry.mount(fieldAtoms.validationAtom);
      registry.set(fieldAtoms.validationAtom, "");

      yield* Effect.sleep("50 millis");
      const error = registry.get(fieldAtoms.displayErrorAtom);
      expect(O.isSome(error)).toBe(true);
      expect(O.getOrThrow(error)).toBe("Name is required");
    });

    it("returns stored error when no live error exists", () => {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onSubmit" },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      state = atoms.operations.createSubmitState(state);
      registry.set(atoms.stateAtom, O.some(state));
      registry.set(atoms.errorsAtom, HashMap.make(["name", makeFormError("Server error", "refinement")]));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);
      registry.mount(fieldAtoms.displayErrorAtom);

      const error = registry.get(fieldAtoms.displayErrorAtom);
      expect(O.isSome(error)).toBe(true);
      expect(O.getOrThrow(error)).toBe("Server error");
    });

    effectTest("surfaces filterEffect errors from field schemas", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const NameField = Field.makeField("name", S.String.pipe(S.filterEffect(() => Effect.succeed("Name is invalid"))));
      const form = FormBuilder.empty.addField(NameField);
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onSubmit" },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "bad" });
      state = atoms.operations.createSubmitState(state);
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", NameField.schema);
      registry.mount(fieldAtoms.displayErrorAtom);
      registry.mount(fieldAtoms.validationAtom);
      registry.set(fieldAtoms.validationAtom, "bad");

      yield* Effect.sleep("50 millis");
      const error = registry.get(fieldAtoms.displayErrorAtom);
      expect(O.isSome(error)).toBe(true);
      expect(O.getOrThrow(error)).toBe("Name is invalid");
    });

    effectTest("uses runtime services in field-level filterEffect", function* () {
      class NameValidator extends Context.Tag("NameValidator")<
        NameValidator,
        { readonly isInvalid: (name: string) => Effect.Effect<boolean> }
      >() {}

      const NameValidatorLive = Layer.succeed(NameValidator, {
        isInvalid: Effect.fn("NameValidator.isInvalid")((name) => Effect.succeed(name === "taken")),
      });

      const runtime = Atom.runtime(NameValidatorLive);
      const NameField = Field.makeField(
        "name",
        S.String.pipe(
          S.filterEffect((value) =>
            Effect.gen(function* () {
              const validator = yield* NameValidator;
              const isInvalid = yield* validator.isInvalid(value);
              return isInvalid ? "Name is already taken" : true;
            })
          )
        )
      );
      const form = FormBuilder.empty.addField(NameField);
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onSubmit" },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "taken" });
      state = atoms.operations.createSubmitState(state);
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", NameField.schema);
      registry.mount(fieldAtoms.displayErrorAtom);
      registry.mount(fieldAtoms.validationAtom);
      registry.set(fieldAtoms.validationAtom, "taken");

      yield* Effect.sleep("50 millis");
      const error = registry.get(fieldAtoms.displayErrorAtom);
      expect(O.isSome(error)).toBe(true);
      expect(O.getOrThrow(error)).toBe("Name is already taken");
    });

    effectTest("hides stored field-source error when validation passes", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onSubmit" },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      state = atoms.operations.createSubmitState(state);
      registry.set(atoms.stateAtom, O.some(state));
      registry.set(atoms.errorsAtom, HashMap.make(["name", makeFormError("Name error", "field")]));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);
      registry.mount(fieldAtoms.displayErrorAtom);
      registry.mount(fieldAtoms.validationAtom);
      registry.set(fieldAtoms.validationAtom, "John");

      yield* Effect.sleep("50 millis");
      const error = registry.get(fieldAtoms.displayErrorAtom);
      expect(O.isNone(error)).toBe(true);
    });

    effectTest("keeps stored refinement error even when validation passes", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onSubmit" },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      state = atoms.operations.createSubmitState(state);
      registry.set(atoms.stateAtom, O.some(state));
      registry.set(atoms.errorsAtom, HashMap.make(["name", makeFormError("Must match confirm", "refinement")]));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);
      registry.mount(fieldAtoms.displayErrorAtom);
      registry.mount(fieldAtoms.validationAtom);
      registry.set(fieldAtoms.validationAtom, "John");

      yield* Effect.sleep("50 millis");
      const error = registry.get(fieldAtoms.displayErrorAtom);
      expect(O.isSome(error)).toBe(true);
      expect(O.getOrThrow(error)).toBe("Must match confirm");
    });

    effectTest("only shows error after submitCount > 0 in onSubmit mode", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const NameField = Field.makeField("name", S.String.check(S.isNonEmpty({ message: "Name is required" })));
      const EmailField = Field.makeField("email", S.String);
      const form = FormBuilder.empty.addField(NameField).addField(EmailField);
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onSubmit" },
      });
      const registry = Registry.make();

      const state = atoms.operations.createInitialState({ name: "", email: "test@test.com" });
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", NameField.schema);
      registry.mount(fieldAtoms.displayErrorAtom);
      registry.mount(fieldAtoms.validationAtom);
      registry.set(fieldAtoms.validationAtom, "");

      yield* Effect.sleep("50 millis");
      expect(O.isNone(registry.get(fieldAtoms.displayErrorAtom))).toBe(true);
    });

    effectTest("shows error when isTouched in onBlur mode", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const NameField = Field.makeField("name", S.String.check(S.isNonEmpty({ message: "Name is required" })));
      const EmailField = Field.makeField("email", S.String);
      const form = FormBuilder.empty.addField(NameField).addField(EmailField);
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {}, mode: { validation: "onBlur" } });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "", email: "test@test.com" });
      state = atoms.operations.setFieldTouched(state, "name", true);
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", NameField.schema);
      registry.mount(fieldAtoms.displayErrorAtom);
      registry.mount(fieldAtoms.validationAtom);
      registry.set(fieldAtoms.validationAtom, "");

      yield* Effect.sleep("50 millis");
      const error = registry.get(fieldAtoms.displayErrorAtom);
      expect(O.isSome(error)).toBe(true);
      expect(O.getOrThrow(error)).toBe("Name is required");
    });

    effectTest("shows error when isDirty in onChange mode", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const NameField = Field.makeField("name", S.String.check(S.isNonEmpty({ message: "Name is required" })));
      const EmailField = Field.makeField("email", S.String);
      const form = FormBuilder.empty.addField(NameField).addField(EmailField);
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onChange" },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      state = atoms.operations.setFieldValue(state, "name", "");
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", NameField.schema);
      registry.mount(fieldAtoms.displayErrorAtom);
      registry.mount(fieldAtoms.validationAtom);
      registry.set(fieldAtoms.validationAtom, "");

      yield* Effect.sleep("50 millis");
      const error = registry.get(fieldAtoms.displayErrorAtom);
      expect(O.isSome(error)).toBe(true);
      expect(O.getOrThrow(error)).toBe("Name is required");
    });

    effectTest("does not show error when not dirty and submitCount is 0 in onChange mode", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const NameField = Field.makeField("name", S.String.check(S.isNonEmpty({ message: "Name is required" })));
      const EmailField = Field.makeField("email", S.String);
      const form = FormBuilder.empty.addField(NameField).addField(EmailField);
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onChange" },
      });
      const registry = Registry.make();

      const state = atoms.operations.createInitialState({ name: "", email: "test@test.com" });
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", NameField.schema);
      registry.mount(fieldAtoms.displayErrorAtom);
      registry.mount(fieldAtoms.validationAtom);
      registry.set(fieldAtoms.validationAtom, "");

      yield* Effect.sleep("50 millis");
      expect(O.isNone(registry.get(fieldAtoms.displayErrorAtom))).toBe(true);
    });
  });

  describe("triggerValidationAtom", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    effectTest("triggers validation on value change in onChange mode", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onChange" },
      });
      const registry = Registry.make();

      const state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);
      registry.mount(fieldAtoms.valueAtom);
      registry.mount(fieldAtoms.triggerValidationAtom);
      registry.mount(fieldAtoms.validationAtom);

      const validationResults: Array<unknown> = [];
      registry.subscribe(fieldAtoms.validationAtom, (result) => {
        validationResults.push(result);
      });

      const newState = atoms.operations.setFieldValue(state, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(newState));

      yield* Effect.sleep("50 millis");
      expect(validationResults.length).toBeGreaterThan(0);
    });

    effectTest("debounces validation in onChange mode with debounce", function* () {
      vi.useFakeTimers();

      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onChange", debounce: "300 millis" },
      });
      const registry = Registry.make();

      const state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);
      registry.mount(fieldAtoms.valueAtom);
      registry.mount(fieldAtoms.triggerValidationAtom);
      registry.mount(fieldAtoms.validationAtom);

      const validationResults: Array<unknown> = [];
      registry.subscribe(fieldAtoms.validationAtom, (result) => {
        validationResults.push(result);
      });

      const state2 = atoms.operations.setFieldValue(state, "name", "Ja");
      registry.set(atoms.stateAtom, O.some(state2));

      const state3 = atoms.operations.setFieldValue(state2, "name", "Jan");
      registry.set(atoms.stateAtom, O.some(state3));

      const state4 = atoms.operations.setFieldValue(state3, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(state4));

      const countBefore = validationResults.length;

      yield* Effect.promise(() => vi.advanceTimersByTimeAsync(300));

      expect(validationResults.length).toBeGreaterThan(countBefore);
    });

    effectTest("triggers validation on blur in onBlur mode", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({ runtime, formBuilder: form, onSubmit: () => {}, mode: { validation: "onBlur" } });
      const registry = Registry.make();

      const state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);
      registry.mount(fieldAtoms.touchedAtom);
      registry.mount(fieldAtoms.valueAtom);
      registry.mount(fieldAtoms.triggerValidationAtom);
      registry.mount(fieldAtoms.validationAtom);

      const validationResults: Array<unknown> = [];
      registry.subscribe(fieldAtoms.validationAtom, (result) => {
        validationResults.push(result);
      });

      const touched = atoms.operations.setFieldTouched(state, "name", true);
      registry.set(atoms.stateAtom, O.some(touched));

      yield* Effect.sleep("50 millis");
      expect(validationResults.length).toBeGreaterThan(0);
    });

    effectTest("triggers validation on value change in onSubmit mode when submitCount > 0", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onSubmit" },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      state = atoms.operations.createSubmitState(state);
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);
      registry.mount(fieldAtoms.valueAtom);
      registry.mount(fieldAtoms.triggerValidationAtom);
      registry.mount(fieldAtoms.validationAtom);

      const validationResults: Array<unknown> = [];
      registry.subscribe(fieldAtoms.validationAtom, (result) => {
        validationResults.push(result);
      });

      const newState = atoms.operations.setFieldValue(state, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(newState));

      yield* Effect.sleep("50 millis");
      expect(validationResults.length).toBeGreaterThan(0);
    });

    effectTest("does NOT trigger validation on value change in onSubmit mode when submitCount === 0", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit: () => {},
        mode: { validation: "onSubmit" },
      });
      const registry = Registry.make();

      const state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      registry.set(atoms.stateAtom, O.some(state));

      const fieldAtoms = atoms.getOrCreateFieldAtoms("name", S.String);
      registry.mount(fieldAtoms.valueAtom);
      registry.mount(fieldAtoms.triggerValidationAtom);
      registry.mount(fieldAtoms.validationAtom);

      const initialResult = registry.get(fieldAtoms.validationAtom);
      expect(initialResult._tag).toBe("Initial");

      const newState = atoms.operations.setFieldValue(state, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(newState));

      yield* Effect.sleep("50 millis");
      const result = registry.get(fieldAtoms.validationAtom);
      expect(result._tag).toBe("Initial");
    });
  });

  describe("autoSubmitAtom", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    effectTest("triggers submit when values change in onChange auto-submit mode", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const onSubmit = vi.fn();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit,
        mode: { validation: "onChange", debounce: "300 millis", autoSubmit: true },
      });
      const registry = Registry.make();

      const state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      registry.set(atoms.stateAtom, O.some(state));
      registry.mount(atoms.autoSubmitAtom);
      registry.mount(atoms.submitAtom);
      registry.mount(atoms.stateAtom);

      const newState = atoms.operations.setFieldValue(state, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(newState));

      yield* Effect.promise(() => vi.advanceTimersByTimeAsync(350));

      expect(onSubmit).toHaveBeenCalled();
    });

    effectTest("does not interrupt an in-flight submit when debounce fires", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const completions = vi.fn();
      let resolveSubmit: (() => void) | undefined;

      const onSubmit = vi.fn(() =>
        Effect.async<void, never>((cb) => {
          resolveSubmit = () => cb(Effect.void);
        }).pipe(Effect.tap(() => Effect.sync(() => completions())))
      );

      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit,
        mode: { validation: "onChange", debounce: "50 millis", autoSubmit: true },
      });
      const registry = Registry.make();

      const state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      registry.set(atoms.stateAtom, O.some(state));
      registry.mount(atoms.autoSubmitAtom);
      registry.mount(atoms.submitAtom);
      registry.mount(atoms.stateAtom);

      const state2 = atoms.operations.setFieldValue(state, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(state2));

      registry.set(atoms.submitAtom, undefined);
      expect(onSubmit).toHaveBeenCalledTimes(1);

      yield* Effect.promise(() => vi.advanceTimersByTimeAsync(60));
      expect(onSubmit).toHaveBeenCalledTimes(1);

      resolveSubmit!();
      yield* Effect.promise(() => vi.advanceTimersByTimeAsync(0));
      expect(completions).toHaveBeenCalledTimes(1);
    });

    effectTest("does not trigger submit when values have not changed", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const onSubmit = vi.fn();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit,
        mode: { validation: "onChange", debounce: "300 millis", autoSubmit: true },
      });
      const registry = Registry.make();

      const state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      registry.set(atoms.stateAtom, O.some(state));
      registry.mount(atoms.autoSubmitAtom);
      registry.mount(atoms.submitAtom);
      registry.mount(atoms.stateAtom);

      registry.set(atoms.stateAtom, O.some(state));

      yield* Effect.promise(() => vi.advanceTimersByTimeAsync(350));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    effectTest("is a no-op when auto-submit is disabled", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const onSubmit = vi.fn();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit,
        mode: { validation: "onChange" },
      });
      const registry = Registry.make();

      const state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      registry.set(atoms.stateAtom, O.some(state));
      registry.mount(atoms.autoSubmitAtom);
      registry.mount(atoms.submitAtom);
      registry.mount(atoms.stateAtom);

      const newState = atoms.operations.setFieldValue(state, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(newState));

      yield* Effect.promise(() => vi.advanceTimersByTimeAsync(500));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("onBlurSubmitAtom", () => {
    effectTest("triggers submit when values differ from last submitted", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const onSubmit = vi.fn();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit,
        mode: { validation: "onBlur", autoSubmit: true },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      state = atoms.operations.setFieldValue(state, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(state));
      registry.mount(atoms.onBlurSubmitAtom);
      registry.mount(atoms.submitAtom);
      registry.mount(atoms.stateAtom);

      registry.set(atoms.onBlurSubmitAtom, undefined);

      yield* Effect.sleep("50 millis");

      expect(onSubmit).toHaveBeenCalled();
    });

    effectTest("does not trigger submit when values match last submitted", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const onSubmit = vi.fn();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit,
        mode: { validation: "onBlur", autoSubmit: true },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      state = atoms.operations.createSubmitState(state);
      state = {
        ...state,
        lastSubmittedValues: O.some({
          encoded: state.values,
          decoded: state.values,
        }),
      };
      registry.set(atoms.stateAtom, O.some(state));
      registry.mount(atoms.onBlurSubmitAtom);
      registry.mount(atoms.submitAtom);
      registry.mount(atoms.stateAtom);

      registry.set(atoms.onBlurSubmitAtom, undefined);

      yield* Effect.sleep("50 millis");

      expect(onSubmit).not.toHaveBeenCalled();
    });

    effectTest("is a no-op when auto-submit is disabled", function* () {
      const runtime = Atom.runtime(Layer.empty);
      const form = makeTestForm();
      const onSubmit = vi.fn();
      const atoms = FormAtoms.make({
        runtime,
        formBuilder: form,
        onSubmit,
        mode: { validation: "onBlur" },
      });
      const registry = Registry.make();

      let state = atoms.operations.createInitialState({ name: "John", email: "test@test.com" });
      state = atoms.operations.setFieldValue(state, "name", "Jane");
      registry.set(atoms.stateAtom, O.some(state));
      registry.mount(atoms.onBlurSubmitAtom);
      registry.mount(atoms.submitAtom);
      registry.mount(atoms.stateAtom);

      registry.set(atoms.onBlurSubmitAtom, undefined);

      yield* Effect.sleep("50 millis");

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});

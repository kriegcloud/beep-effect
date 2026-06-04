import { Field, FormBuilder, FormReact } from "@beep/form/react";
import { useAtomSet, useAtomSubscribe, useAtomValue } from "@effect/atom-react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import * as Data from "effect/Data";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";
import * as React from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import * as Context from "../helpers/ContextCompat.ts";
import * as Effect from "../helpers/EffectCompat.ts";
import * as S from "../helpers/SchemaCompat.ts";
import type { TUnsafe } from "@beep/types";

const effectTest = (name: string, body: () => Generator<TUnsafe.Any, void, TUnsafe.Any>) =>
  it(name, () => Effect.runPromise(Effect.gen(body) as TUnsafe.Any));

const TextInput: FormReact.FieldComponent<string> = ({ field }) => (
  <div>
    <input
      type="text"
      value={field.value}
      onChange={(e) => field.onChange(e.target.value)}
      onBlur={field.onBlur}
      data-testid="text-input"
    />
    {O.isSome(field.error) && <span data-testid="error">{field.error.value}</span>}
  </div>
);

const makeSubmitButton = <A,>(submitAtom: Atom.AtomResultFn<A, unknown, unknown>, args: A) => {
  const SubmitButton = () => {
    const submit = useAtomSet(submitAtom);
    return (
      <button type="button" onClick={() => submit(args)} data-testid="submit">
        Submit
      </button>
    );
  };
  return SubmitButton;
};

describe("FormReact.make", () => {
  describe("Initialize Component", () => {
    it("initializes with default values", () => {
      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      render(
        <form.Initialize defaultValues={{ name: "John" }}>
          <form.name />
        </form.Initialize>
      );

      expect(screen.getByTestId("text-input")).toHaveValue("John");
    });
  });

  describe("Field Component", () => {
    effectTest("updates value on change", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");
      yield* Effect.promise(() => user.type(input, "Jane"));

      expect(input).toHaveValue("Jane");
    });

    effectTest("shows validation error after touch (onBlur mode)", function* () {
      const user = userEvent.setup();

      const NonEmpty = S.String.check(S.isMinLength(1, { message: "Required" }));
      const NameField = Field.makeField("name", NonEmpty);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        mode: { validation: "onBlur" },
        onSubmit,
      });

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");
      yield* Effect.promise(() => user.click(input));
      yield* Effect.promise(() => user.tab());

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Required");
        })
      );
    });
  });

  describe("isDirty atom", () => {
    it("returns isDirty = false when values match initial", () => {
      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      let isDirty: boolean | undefined;

      const TestComponent = () => {
        useAtomSubscribe(
          form.isDirty,
          (dirty) => {
            isDirty = dirty;
          },
          { immediate: true }
        );
        return null;
      };

      render(
        <form.Initialize defaultValues={{ name: "test" }}>
          <form.name />
          <TestComponent />
        </form.Initialize>
      );

      expect(isDirty).toBe(false);
    });

    effectTest("returns isDirty = true when values differ from initial", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      let isDirty: boolean | undefined;

      const TestComponent = () => {
        useAtomSubscribe(
          form.isDirty,
          (dirty) => {
            isDirty = dirty;
          },
          { immediate: true }
        );
        return null;
      };

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
          <TestComponent />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");
      yield* Effect.promise(() => user.type(input, "changed"));

      expect(isDirty).toBe(true);
    });

    effectTest("submit calls onSubmit with decoded values", function* () {
      const user = userEvent.setup();
      const submitHandler = vi.fn();

      const NameField = Field.makeField("name", S.String);
      const AgeField = Field.makeField("age", S.NumberFromString);
      const formBuilder = FormBuilder.empty.addField(NameField).addField(AgeField);

      const NumberFromStringInput: FormReact.FieldComponent<typeof S.NumberFromString> = ({ field }) => (
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid="number-input"
        />
      );

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput, age: NumberFromStringInput },
        onSubmit: (_: void, { decoded }) => submitHandler(decoded),
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ name: "John", age: "42" }}>
          <form.name />
          <form.age />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(submitHandler).toHaveBeenCalledWith({ name: "John", age: 42 });
        })
      );
    });
  });

  describe("multiple fields", () => {
    effectTest("renders multiple fields correctly", function* () {
      const user = userEvent.setup();

      const FirstNameField = Field.makeField("firstName", S.String);
      const LastNameField = Field.makeField("lastName", S.String);
      const formBuilder = FormBuilder.empty.addField(FirstNameField).addField(LastNameField);

      const NamedInput: FormReact.FieldComponent<string, { name: string }> = ({ field, props }) => (
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid={props.name}
        />
      );

      const FirstNameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <NamedInput field={field} props={{ name: "firstName" }} />
      );

      const LastNameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <NamedInput field={field} props={{ name: "lastName" }} />
      );

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: {
          firstName: FirstNameInput,
          lastName: LastNameInput,
        },
        onSubmit,
      });

      render(
        <form.Initialize defaultValues={{ firstName: "", lastName: "" }}>
          <form.firstName />
          <form.lastName />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.type(screen.getByTestId("firstName"), "John"));
      yield* Effect.promise(() => user.type(screen.getByTestId("lastName"), "Doe"));

      expect(screen.getByTestId("firstName")).toHaveValue("John");
      expect(screen.getByTestId("lastName")).toHaveValue("Doe");
    });
  });

  describe("array fields", () => {
    effectTest("renders array field with items", function* () {
      const user = userEvent.setup();

      const TitleField = Field.makeField("title", S.String);
      const ItemsArrayField = Field.makeArrayField("items", S.Struct({ name: S.String }));
      const formBuilder = FormBuilder.empty.addField(TitleField).addField(ItemsArrayField);

      const TitleInput: FormReact.FieldComponent<string> = ({ field }) => (
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid="title"
        />
      );

      const ItemNameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid="item-name"
        />
      );

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: {
          title: TitleInput,
          items: { name: ItemNameInput },
        },
        onSubmit,
      });

      render(
        <form.Initialize defaultValues={{ title: "My List", items: [{ name: "Item 1" }] }}>
          <form.title />
          <form.items>
            {({ append, items }) => (
              <>
                {items.map((_, i) => (
                  <form.items.Item key={i} index={i}>
                    <form.items.name />
                  </form.items.Item>
                ))}
                <button type="button" onClick={() => append()} data-testid="add">
                  Add
                </button>
              </>
            )}
          </form.items>
        </form.Initialize>
      );

      expect(screen.getByTestId("title")).toHaveValue("My List");
      expect(screen.getByTestId("item-name")).toHaveValue("Item 1");

      yield* Effect.promise(() => user.click(screen.getByTestId("add")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getAllByTestId("item-name")).toHaveLength(2);
        })
      );
    });

    effectTest("renders array item subfields when item schema uses filterEffect", function* () {
      const user = userEvent.setup();

      const ItemSchema = S.Struct({ name: S.String }).pipe(S.filterEffect(() => Effect.succeed(true)));
      const ItemsArrayField = Field.makeArrayField("items", ItemSchema);
      const formBuilder = FormBuilder.empty.addField(ItemsArrayField);

      const ItemNameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid="item-name"
        />
      );

      const form = FormReact.make(formBuilder, {
        fields: { items: { name: ItemNameInput } },
        onSubmit: () => {},
      });

      render(
        <form.Initialize defaultValues={{ items: [{ name: "First" }] }}>
          <form.items>
            {({ items }) => (
              <>
                {items.map((_, i) => (
                  <form.items.Item key={i} index={i}>
                    <form.items.name />
                  </form.items.Item>
                ))}
              </>
            )}
          </form.items>
        </form.Initialize>
      );

      expect((screen.getByTestId("item-name") as HTMLInputElement).value).toBe("First");

      yield* Effect.promise(() => user.type(screen.getByTestId("item-name"), "A"));

      expect((screen.getByTestId("item-name") as HTMLInputElement).value).toBe("FirstA");
    });

    effectTest("renders scalar array item value fields", function* () {
      const user = userEvent.setup();

      const TagsArrayField = Field.makeArrayField("tags", S.String);
      const formBuilder = FormBuilder.empty.addField(TagsArrayField);

      const TagInput: FormReact.FieldComponent<string> = ({ field }) => (
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid="tag"
          data-path={field.path}
        />
      );

      const form = FormReact.make(formBuilder, {
        fields: { tags: TagInput },
        onSubmit: () => {},
      });

      render(
        <form.Initialize defaultValues={{ tags: ["first"] }}>
          <form.tags>
            {({ items }) => (
              <>
                {items.map((_, i) => (
                  <form.tags.Item key={i} index={i}>
                    <form.tags.Value />
                  </form.tags.Item>
                ))}
              </>
            )}
          </form.tags>
        </form.Initialize>
      );

      const input = screen.getByTestId("tag") as HTMLInputElement;
      expect(input.value).toBe("first");
      expect(input.dataset.path).toBe("tags[0]");

      yield* Effect.promise(() => user.type(input, " tag"));

      expect(input.value).toBe("first tag");
    });

    effectTest("remove() removes item at specified index", function* () {
      const user = userEvent.setup();

      const ItemsArrayField = Field.makeArrayField("items", S.Struct({ name: S.String }));
      const formBuilder = FormBuilder.empty.addField(ItemsArrayField);

      const ItemNameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid="item-name"
        />
      );

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { items: { name: ItemNameInput } },
        onSubmit,
      });

      render(
        <form.Initialize defaultValues={{ items: [{ name: "A" }, { name: "B" }, { name: "C" }] }}>
          <form.items>
            {({ items, remove }) => (
              <>
                {items.map((_, i) => (
                  <div key={i} data-testid={`item-${i}`}>
                    <form.items.Item index={i}>
                      <form.items.name />
                    </form.items.Item>
                    <button type="button" onClick={() => remove(i)} data-testid={`remove-${i}`}>
                      Remove
                    </button>
                  </div>
                ))}
              </>
            )}
          </form.items>
        </form.Initialize>
      );

      expect(screen.getAllByTestId("item-name")).toHaveLength(3);
      const inputs = screen.getAllByTestId("item-name") as Array<HTMLInputElement>;
      expect(inputs[0].value).toBe("A");
      expect(inputs[1].value).toBe("B");
      expect(inputs[2].value).toBe("C");

      yield* Effect.promise(() => user.click(screen.getByTestId("remove-1")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getAllByTestId("item-name")).toHaveLength(2);
          const updatedInputs = screen.getAllByTestId("item-name") as Array<HTMLInputElement>;
          expect(updatedInputs[0].value).toBe("A");
          expect(updatedInputs[1].value).toBe("C");
        })
      );
    });

    effectTest("swap() exchanges items at two indices", function* () {
      const user = userEvent.setup();

      const ItemsArrayField = Field.makeArrayField("items", S.Struct({ name: S.String }));
      const formBuilder = FormBuilder.empty.addField(ItemsArrayField);

      const ItemNameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid="item-name"
        />
      );

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { items: { name: ItemNameInput } },
        onSubmit,
      });

      render(
        <form.Initialize defaultValues={{ items: [{ name: "First" }, { name: "Second" }, { name: "Third" }] }}>
          <form.items>
            {({ items, swap }) => (
              <>
                {items.map((_, i) => (
                  <form.items.Item key={i} index={i}>
                    <form.items.name />
                  </form.items.Item>
                ))}
                <button type="button" onClick={() => swap(0, 2)} data-testid="swap">
                  Swap First and Third
                </button>
              </>
            )}
          </form.items>
        </form.Initialize>
      );

      const initialInputs = screen.getAllByTestId("item-name") as Array<HTMLInputElement>;
      expect(initialInputs[0].value).toBe("First");
      expect(initialInputs[1].value).toBe("Second");
      expect(initialInputs[2].value).toBe("Third");

      yield* Effect.promise(() => user.click(screen.getByTestId("swap")));

      yield* Effect.promise(() =>
        waitFor(() => {
          const swappedInputs = screen.getAllByTestId("item-name") as Array<HTMLInputElement>;
          expect(swappedInputs[0].value).toBe("Third");
          expect(swappedInputs[1].value).toBe("Second");
          expect(swappedInputs[2].value).toBe("First");
        })
      );
    });

    effectTest("move() relocates item from one index to another", function* () {
      const user = userEvent.setup();

      const ItemsArrayField = Field.makeArrayField("items", S.Struct({ name: S.String }));
      const formBuilder = FormBuilder.empty.addField(ItemsArrayField);

      const ItemNameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid="item-name"
        />
      );

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { items: { name: ItemNameInput } },
        onSubmit,
      });

      render(
        <form.Initialize defaultValues={{ items: [{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }] }}>
          <form.items>
            {({ items, move }) => (
              <>
                {items.map((_, i) => (
                  <form.items.Item key={i} index={i}>
                    <form.items.name />
                  </form.items.Item>
                ))}
                <button type="button" onClick={() => move(0, 2)} data-testid="move">
                  Move First to Third Position
                </button>
              </>
            )}
          </form.items>
        </form.Initialize>
      );

      const initialInputs = screen.getAllByTestId("item-name") as Array<HTMLInputElement>;
      expect(initialInputs.map((i) => i.value)).toEqual(["A", "B", "C", "D"]);

      yield* Effect.promise(() => user.click(screen.getByTestId("move")));

      yield* Effect.promise(() =>
        waitFor(() => {
          const movedInputs = screen.getAllByTestId("item-name") as Array<HTMLInputElement>;
          expect(movedInputs.map((i) => i.value)).toEqual(["B", "C", "A", "D"]);
        })
      );
    });

    effectTest("Item render prop provides remove function", function* () {
      const user = userEvent.setup();

      const ItemsArrayField = Field.makeArrayField("items", S.Struct({ name: S.String }));
      const formBuilder = FormBuilder.empty.addField(ItemsArrayField);

      const ItemNameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid="item-name"
        />
      );

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { items: { name: ItemNameInput } },
        onSubmit,
      });

      render(
        <form.Initialize defaultValues={{ items: [{ name: "Item 1" }, { name: "Item 2" }] }}>
          <form.items>
            {({ items }) => (
              <>
                {items.map((_, i) => (
                  <form.items.Item key={i} index={i}>
                    {({ remove }) => (
                      <>
                        <form.items.name />
                        <button type="button" onClick={remove} data-testid={`item-remove-${i}`}>
                          Remove
                        </button>
                      </>
                    )}
                  </form.items.Item>
                ))}
              </>
            )}
          </form.items>
        </form.Initialize>
      );

      expect(screen.getAllByTestId("item-name")).toHaveLength(2);

      yield* Effect.promise(() => user.click(screen.getByTestId("item-remove-0")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getAllByTestId("item-name")).toHaveLength(1);
          expect((screen.getByTestId("item-name") as HTMLInputElement).value).toBe("Item 2");
        })
      );
    });
  });

  describe("field path", () => {
    it("exposes the field key as path for top-level fields", () => {
      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const PathInput: FormReact.FieldComponent<string> = ({ field }) => (
        <span data-testid="field-path">{field.path}</span>
      );

      const form = FormReact.make(formBuilder, {
        fields: { name: PathInput },
        onSubmit: () => {},
      });

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
        </form.Initialize>
      );

      expect(screen.getByTestId("field-path")).toHaveTextContent("name");
    });

    it("exposes the correct nested path for fields inside array items", () => {
      const ItemsArrayField = Field.makeArrayField("items", S.Struct({ name: S.String }));
      const formBuilder = FormBuilder.empty.addField(ItemsArrayField);

      const ItemPathInput: FormReact.FieldComponent<string> = ({ field }) => (
        <span data-testid="field-path">{field.path}</span>
      );

      const form = FormReact.make(formBuilder, {
        fields: { items: { name: ItemPathInput } },
        onSubmit: () => {},
      });

      render(
        <form.Initialize defaultValues={{ items: [{ name: "A" }, { name: "B" }] }}>
          <form.items>
            {({ items }) => (
              <>
                {items.map((_, i) => (
                  <form.items.Item key={i} index={i}>
                    <form.items.name />
                  </form.items.Item>
                ))}
              </>
            )}
          </form.items>
        </form.Initialize>
      );

      const paths = screen.getAllByTestId("field-path");
      expect(paths).toHaveLength(2);
      expect(paths[0]).toHaveTextContent("items[0].name");
      expect(paths[1]).toHaveTextContent("items[1].name");
    });
  });

  describe("async validation", () => {
    effectTest("submit works with async schema validation (filterEffect)", function* () {
      const user = userEvent.setup();
      const submitHandler = vi.fn();

      const AsyncEmail = S.String.pipe(S.filterEffect(() => Effect.succeed(true).pipe(Effect.delay("10 millis"))));

      const EmailField = Field.makeField("email", AsyncEmail);
      const formBuilder = FormBuilder.empty.addField(EmailField);

      const form = FormReact.make(formBuilder, {
        fields: { email: TextInput },
        onSubmit: (_: void, { decoded }) => submitHandler(decoded),
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ email: "test@example.com" }}>
          <form.email />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(
          () => {
            expect(submitHandler).toHaveBeenCalledWith({ email: "test@example.com" });
          },
          { timeout: 1000 }
        )
      );
    });

    effectTest("exposes isValidating state during async validation", function* () {
      const user = userEvent.setup();

      let completeValidation: (() => void) | undefined;
      const AsyncField = S.String.pipe(
        S.filterEffect(() =>
          Effect.async<boolean>((resume) => {
            completeValidation = () => resume(Effect.succeed(true));
          })
        )
      );

      const ValidatingInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            type="text"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="async-input"
          />
          <span data-testid="is-validating">{String(field.isValidating)}</span>
        </div>
      );

      const AsyncFieldDef = Field.makeField("asyncField", AsyncField);
      const formBuilder = FormBuilder.empty.addField(AsyncFieldDef);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { asyncField: ValidatingInput },
        mode: { validation: "onBlur" },
        onSubmit,
      });

      render(
        <form.Initialize defaultValues={{ asyncField: "" }}>
          <form.asyncField />
        </form.Initialize>
      );

      expect(screen.getByTestId("is-validating")).toHaveTextContent("false");

      const input = screen.getByTestId("async-input");
      yield* Effect.promise(() => user.type(input, "test"));
      yield* Effect.promise(() => user.tab());

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("is-validating")).toHaveTextContent("true");
        })
      );

      completeValidation?.();

      yield* Effect.promise(() =>
        waitFor(
          () => {
            expect(screen.getByTestId("is-validating")).toHaveTextContent("false");
          },
          { timeout: 200 }
        )
      );
    });
  });

  describe("cross-field validation", () => {
    effectTest("FormBuilder.refine validates across fields and routes error to specific field", function* () {
      const user = userEvent.setup();

      const PasswordInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            type="password"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="password"
          />
          {O.isSome(field.error) && <span data-testid="password-error">{field.error.value}</span>}
        </div>
      );

      const ConfirmPasswordInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            type="password"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="confirm-password"
          />
          {O.isSome(field.error) && <span data-testid="confirm-password-error">{field.error.value}</span>}
        </div>
      );

      const PasswordField = Field.makeField("password", S.String);
      const ConfirmPasswordField = Field.makeField("confirmPassword", S.String);
      const formBuilder = FormBuilder.empty
        .addField(PasswordField)
        .addField(ConfirmPasswordField)
        .refine((values) => {
          if (values.password !== values.confirmPassword) {
            return { path: ["confirmPassword"], message: "Passwords must match" };
          }
        });

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: {
          password: PasswordInput,
          confirmPassword: ConfirmPasswordInput,
        },
        onSubmit,
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ password: "secret", confirmPassword: "different" }}>
          <form.password />
          <form.confirmPassword />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("confirm-password-error")).toHaveTextContent("Passwords must match");
        })
      );

      expect(screen.queryByTestId("password-error")).not.toBeInTheDocument();
    });

    effectTest("refineEffect performs async cross-field validation", function* () {
      const user = userEvent.setup();

      const UsernameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            type="text"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="username"
          />
          {O.isSome(field.error) && <span data-testid="username-error">{field.error.value}</span>}
        </div>
      );

      const UsernameField = Field.makeField("username", S.String);
      const formBuilder = FormBuilder.empty.addField(UsernameField).refineEffect((values) =>
        Effect.gen(function* () {
          yield* Effect.sleep("20 millis");
          if (values.username === "taken") {
            return { path: ["username"], message: "Username is already taken" };
          }
        })
      );

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { username: UsernameInput },
        onSubmit,
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ username: "taken" }}>
          <form.username />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(
          () => {
            expect(screen.getByTestId("username-error")).toHaveTextContent("Username is already taken");
          },
          { timeout: 200 }
        )
      );
    });

    effectTest("refineEffect works with Effect services from runtime", function* () {
      const user = userEvent.setup();

      class UsernameValidator extends Context.Tag("UsernameValidator")<
        UsernameValidator,
        { readonly isTaken: (username: string) => Effect.Effect<boolean> }
      >() {}

      const UsernameValidatorLive = Layer.succeed(UsernameValidator, {
        isTaken: Effect.fn("UsernameValidator.isTaken")((username) => Effect.succeed(username === "taken")),
      });

      const UsernameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            type="text"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="username"
          />
          {O.isSome(field.error) && <span data-testid="username-error">{field.error.value}</span>}
        </div>
      );

      const UsernameField = Field.makeField("username", S.String);
      const formBuilder = FormBuilder.empty.addField(UsernameField).refineEffect((values) =>
        Effect.gen(function* () {
          const registry = yield* AtomRegistry.AtomRegistry;
          expect(typeof registry.get).toBe("function");

          const validator = yield* UsernameValidator;
          const isTaken = yield* validator.isTaken(values.username);
          if (isTaken) {
            return { path: ["username"], message: "Username is already taken" };
          }
        })
      );

      const onSubmit = () => {};

      const runtime = Atom.runtime(UsernameValidatorLive);
      const form = FormReact.make(formBuilder, {
        runtime,
        fields: { username: UsernameInput },
        onSubmit,
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ username: "taken" }}>
          <form.username />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("username-error")).toHaveTextContent("Username is already taken");
        })
      );
    });

    effectTest("multiple chained refine() calls are all executed", function* () {
      const user = userEvent.setup();

      const FieldInput: FormReact.FieldComponent<string, { testId: string }> = ({ field, props }) => (
        <div>
          <input
            type="text"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid={props.testId}
          />
          {O.isSome(field.error) && <span data-testid={`${props.testId}-error`}>{field.error.value}</span>}
        </div>
      );

      const FieldAInput: FormReact.FieldComponent<string> = ({ field }) => (
        <FieldInput field={field} props={{ testId: "fieldA" }} />
      );
      const FieldBInput: FormReact.FieldComponent<string> = ({ field }) => (
        <FieldInput field={field} props={{ testId: "fieldB" }} />
      );

      const FieldAField = Field.makeField("fieldA", S.String);
      const FieldBField = Field.makeField("fieldB", S.String);
      const formBuilder = FormBuilder.empty
        .addField(FieldAField)
        .addField(FieldBField)
        .refine((values) => {
          if (values.fieldA === "error1") {
            return { path: ["fieldA"], message: "First validation failed" };
          }
        })
        .refine((values) => {
          if (values.fieldB === "error2") {
            return { path: ["fieldB"], message: "Second validation failed" };
          }
        });

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { fieldA: FieldAInput, fieldB: FieldBInput },
        onSubmit,
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      const { rerender } = render(
        <form.Initialize key="1" defaultValues={{ fieldA: "error1", fieldB: "valid" }}>
          <form.fieldA />
          <form.fieldB />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("fieldA-error")).toHaveTextContent("First validation failed");
        })
      );
      expect(screen.queryByTestId("fieldB-error")).not.toBeInTheDocument();

      rerender(
        <form.Initialize key="2" defaultValues={{ fieldA: "valid", fieldB: "error2" }}>
          <form.fieldA />
          <form.fieldB />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("fieldB-error")).toHaveTextContent("Second validation failed");
        })
      );
      expect(screen.queryByTestId("fieldA-error")).not.toBeInTheDocument();
    });

    effectTest("cross-field error persists when typing after failed submit (still invalid)", function* () {
      const user = userEvent.setup();

      const FieldInput: FormReact.FieldComponent<string, { testId: string }> = ({ field, props }) => (
        <div>
          <input
            type="text"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid={props.testId}
          />
          {O.isSome(field.error) && <span data-testid={`${props.testId}-error`}>{field.error.value}</span>}
        </div>
      );

      const PasswordInput: FormReact.FieldComponent<string> = ({ field }) => (
        <FieldInput field={field} props={{ testId: "password" }} />
      );
      const ConfirmInput: FormReact.FieldComponent<string> = ({ field }) => (
        <FieldInput field={field} props={{ testId: "confirm" }} />
      );

      const PasswordField = Field.makeField("password", S.String);
      const ConfirmField = Field.makeField("confirm", S.String);
      const formBuilder = FormBuilder.empty
        .addField(PasswordField)
        .addField(ConfirmField)
        .refine((values) => {
          if (values.password !== values.confirm) {
            return { path: ["confirm"], message: "Passwords must match" };
          }
        });

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { password: PasswordInput, confirm: ConfirmInput },
        onSubmit,
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ password: "secret", confirm: "different" }}>
          <form.password />
          <form.confirm />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("confirm-error")).toHaveTextContent("Passwords must match");
        })
      );

      const confirmInput = screen.getByTestId("confirm");
      yield* Effect.promise(() => user.type(confirmInput, "x"));

      yield* Effect.sleep("50 millis");
      expect(screen.getByTestId("confirm-error")).toHaveTextContent("Passwords must match");
    });

    effectTest("cross-field error clears when fixed and resubmitted", function* () {
      const user = userEvent.setup();

      const FieldInput: FormReact.FieldComponent<string, { testId: string }> = ({ field, props }) => (
        <div>
          <input
            type="text"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid={props.testId}
          />
          {O.isSome(field.error) && <span data-testid={`${props.testId}-error`}>{field.error.value}</span>}
        </div>
      );

      const PasswordInput: FormReact.FieldComponent<string> = ({ field }) => (
        <FieldInput field={field} props={{ testId: "password" }} />
      );
      const ConfirmInput: FormReact.FieldComponent<string> = ({ field }) => (
        <FieldInput field={field} props={{ testId: "confirm" }} />
      );

      const PasswordField = Field.makeField("password", S.String);
      const ConfirmField = Field.makeField("confirm", S.String);
      const formBuilder = FormBuilder.empty
        .addField(PasswordField)
        .addField(ConfirmField)
        .refine((values) => {
          if (values.password !== values.confirm) {
            return { path: ["confirm"], message: "Passwords must match" };
          }
        });

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { password: PasswordInput, confirm: ConfirmInput },
        onSubmit,
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ password: "secret", confirm: "different" }}>
          <form.password />
          <form.confirm />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("confirm-error")).toHaveTextContent("Passwords must match");
        })
      );

      const confirmInput = screen.getByTestId("confirm");
      yield* Effect.promise(() => user.clear(confirmInput));
      yield* Effect.promise(() => user.type(confirmInput, "secret"));

      expect(screen.getByTestId("confirm-error")).toHaveTextContent("Passwords must match");

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("confirm-error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("routes cross-field errors to nested array item fields", function* () {
      const user = userEvent.setup();

      const ItemNameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            type="text"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="item-name"
          />
          {O.isSome(field.error) && <span data-testid="item-name-error">{field.error.value}</span>}
        </div>
      );

      const ItemSchema = S.Struct({
        name: S.String.pipe(S.minLength(3, { message: () => "Name must be at least 3 characters" })),
      });

      const ItemsArrayField = Field.makeArrayField("items", ItemSchema);
      const formBuilder = FormBuilder.empty.addField(ItemsArrayField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { items: { name: ItemNameInput } },
        onSubmit,
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ items: [{ name: "AB" }] }}>
          <form.items>
            {({ items }) => (
              <>
                {items.map((_, i) => (
                  <form.items.Item key={i} index={i}>
                    <form.items.name />
                  </form.items.Item>
                ))}
              </>
            )}
          </form.items>
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("item-name-error")).toHaveTextContent("Name must be at least 3 characters");
        })
      );
    });
  });

  describe("validation modes", () => {
    effectTest("onSubmit mode shows errors after submit attempt", function* () {
      const user = userEvent.setup();

      const NonEmpty = S.String.pipe(S.minLength(1, { message: () => "Required" }));
      const NameField = Field.makeField("name", NonEmpty);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        mode: { validation: "onSubmit" },
        onSubmit,
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
          <SubmitButton />
        </form.Initialize>
      );

      expect(screen.queryByTestId("error")).not.toBeInTheDocument();

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Required");
        })
      );
    });

    effectTest("onChange mode shows errors immediately without needing blur", function* () {
      const user = userEvent.setup();

      const MinLength = S.String.pipe(S.minLength(3, { message: () => "Min 3 chars" }));
      const NameField = Field.makeField("name", MinLength);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        mode: { validation: "onChange" },
        onSubmit: () => {},
      });

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");

      yield* Effect.promise(() => user.type(input, "ab"));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Min 3 chars");
        })
      );

      yield* Effect.promise(() => user.type(input, "c"));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("onSubmit mode keeps errors when typing still-invalid values after failed submit", function* () {
      const user = userEvent.setup();

      const MinLength = S.String.pipe(S.minLength(8, { message: () => "Min 8 chars" }));
      const PasswordField = Field.makeField("password", MinLength);
      const formBuilder = FormBuilder.empty.addField(PasswordField);

      const form = FormReact.make(formBuilder, {
        fields: { password: TextInput },
        mode: { validation: "onSubmit" },
        onSubmit: () => {},
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ password: "" }}>
          <form.password />
          <SubmitButton />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");

      yield* Effect.promise(() => user.type(input, "short"));

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Min 8 chars");
        })
      );

      yield* Effect.promise(() => user.type(input, "x"));

      yield* Effect.sleep("50 millis");
      expect(screen.getByTestId("error")).toHaveTextContent("Min 8 chars");
    });

    effectTest("onSubmit mode clears errors when typing valid values after failed submit", function* () {
      const user = userEvent.setup();

      const MinLength = S.String.pipe(S.minLength(8, { message: () => "Min 8 chars" }));
      const PasswordField = Field.makeField("password", MinLength);
      const formBuilder = FormBuilder.empty.addField(PasswordField);

      const form = FormReact.make(formBuilder, {
        fields: { password: TextInput },
        mode: { validation: "onSubmit" },
        onSubmit: () => {},
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ password: "" }}>
          <form.password />
          <SubmitButton />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");

      yield* Effect.promise(() => user.type(input, "short"));

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Min 8 chars");
        })
      );

      yield* Effect.promise(() => user.type(input, "123"));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("cross-field refinement errors persist until re-submit", function* () {
      const user = userEvent.setup();

      const PasswordField = Field.makeField("password", S.String.pipe(S.minLength(4)));
      const ConfirmField = Field.makeField("confirm", S.String);

      const formBuilder = FormBuilder.empty
        .addField(PasswordField)
        .addField(ConfirmField)
        .refine((values) => {
          if (values.password !== values.confirm) {
            return { path: ["confirm"], message: "Passwords must match" };
          }
        });

      const form = FormReact.make(formBuilder, {
        fields: {
          password: TextInput,
          confirm: ({ field }) => (
            <div>
              <input
                data-testid="confirm-input"
                type="text"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
              {O.isSome(field.error) && <span data-testid="confirm-error">{field.error.value}</span>}
            </div>
          ),
        },
        mode: { validation: "onSubmit" },
        onSubmit: () => {},
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ password: "test", confirm: "different" }}>
          <form.password />
          <form.confirm />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("confirm-error")).toHaveTextContent("Passwords must match");
        })
      );

      yield* Effect.promise(() => user.clear(screen.getByTestId("confirm-input")));
      yield* Effect.promise(() => user.type(screen.getByTestId("confirm-input"), "test"));

      yield* Effect.sleep("100 millis");

      // Refinement errors persist until re-submit
      expect(screen.getByTestId("confirm-error")).toHaveTextContent("Passwords must match");

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("confirm-error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("per-field errors clear on valid input while refinement errors persist", function* () {
      const user = userEvent.setup();

      const PasswordField = Field.makeField(
        "password",
        S.String.pipe(S.minLength(8, { message: () => "Min 8 chars" }))
      );
      const ConfirmField = Field.makeField("confirm", S.String);

      const formBuilder = FormBuilder.empty
        .addField(PasswordField)
        .addField(ConfirmField)
        .refine((values) => {
          if (values.password !== values.confirm) {
            return { path: ["confirm"], message: "Must match password" };
          }
        });

      const form = FormReact.make(formBuilder, {
        fields: {
          password: TextInput,
          confirm: ({ field }) => (
            <div>
              <input
                data-testid="confirm-input"
                type="text"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
              {O.isSome(field.error) && <span data-testid="confirm-error">{field.error.value}</span>}
            </div>
          ),
        },
        mode: { validation: "onSubmit" },
        onSubmit: () => {},
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ password: "short", confirm: "different" }}>
          <form.password />
          <form.confirm />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Min 8 chars");
        })
      );

      yield* Effect.promise(() => user.type(screen.getByTestId("text-input"), "1234"));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("confirm-error")).toHaveTextContent("Must match password");
        })
      );

      yield* Effect.promise(() => user.clear(screen.getByTestId("confirm-input")));
      yield* Effect.promise(() => user.type(screen.getByTestId("confirm-input"), "short1234"));

      yield* Effect.sleep("100 millis");

      // Refinement errors persist until re-submit
      expect(screen.getByTestId("confirm-error")).toHaveTextContent("Must match password");

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("confirm-error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("hides stored field error while async validation is pending (async gap)", function* () {
      const user = userEvent.setup();

      const AsyncMinLength = S.String.pipe(
        S.minLength(8, { message: () => "Too short" }),
        S.filterEffect((_value) =>
          Effect.gen(function* () {
            yield* Effect.sleep("200 millis");
            return undefined;
          })
        )
      );
      const PasswordField = Field.makeField("password", AsyncMinLength);
      const formBuilder = FormBuilder.empty.addField(PasswordField);

      const form = FormReact.make(formBuilder, {
        fields: { password: TextInput },
        mode: { validation: "onSubmit" },
        onSubmit: () => {},
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ password: "short" }}>
          <form.password />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      yield* Effect.promise(() => user.type(screen.getByTestId("text-input"), "1234567"));

      // Stored field error hidden while async validation pending (isValidating = true)
      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("persists refinement errors across field unmount/remount", function* () {
      const user = userEvent.setup();

      const PasswordField = Field.makeField("password", S.String);
      const ConfirmField = Field.makeField("confirm", S.String);

      const formBuilder = FormBuilder.empty
        .addField(PasswordField)
        .addField(ConfirmField)
        .refine((values) => {
          if (values.password !== values.confirm) {
            return { path: ["confirm"], message: "Passwords must match" };
          }
        });

      const form = FormReact.make(formBuilder, {
        fields: {
          password: TextInput,
          confirm: ({ field }) => (
            <div>
              <input
                data-testid="confirm-input"
                type="text"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
              {O.isSome(field.error) && <span data-testid="confirm-error">{field.error.value}</span>}
            </div>
          ),
        },
        mode: { validation: "onSubmit" },
        onSubmit: () => {},
      });

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      const ToggleableForm = () => {
        const [showConfirm, setShowConfirm] = React.useState(true);
        return (
          <form.Initialize defaultValues={{ password: "abc", confirm: "xyz" }}>
            <form.password />
            {showConfirm && <form.confirm />}
            <button type="button" data-testid="toggle" onClick={() => setShowConfirm((v) => !v)}>
              Toggle
            </button>
            <SubmitButton />
          </form.Initialize>
        );
      };

      render(<ToggleableForm />);

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("confirm-error")).toHaveTextContent("Passwords must match");
        })
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("toggle")));
      expect(screen.queryByTestId("confirm-input")).not.toBeInTheDocument();

      yield* Effect.promise(() => user.click(screen.getByTestId("toggle")));
      expect(screen.getByTestId("confirm-input")).toBeInTheDocument();

      // Error persists across unmount/remount (stored in atoms, not component state)
      expect(screen.getByTestId("confirm-error")).toHaveTextContent("Passwords must match");
    });
  });

  describe("error handling", () => {
    effectTest("captures error when onSubmit Effect fails", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      class SubmitFailure extends Data.TaggedError("SubmitFailure")<{
        readonly message: string;
      }> {}

      const onSubmit = () => Effect.fail(new SubmitFailure({ message: "Submission failed" }));

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      const SubmitResultDisplay = () => {
        const submitResult = useAtomValue(form.submit);
        return (
          <>
            <span data-testid="result-tag">{submitResult._tag}</span>
            <span data-testid="result-waiting">{String(submitResult.waiting)}</span>
          </>
        );
      };

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ name: "test" }}>
          <form.name />
          <SubmitButton />
          <SubmitResultDisplay />
        </form.Initialize>
      );

      expect(screen.getByTestId("result-tag")).toHaveTextContent("Initial");

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("result-tag")).toHaveTextContent("Failure");
          expect(screen.getByTestId("result-waiting")).toHaveTextContent("false");
        })
      );
    });
  });

  describe("form atoms", () => {
    it("exposes submitResult with initial state", () => {
      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      let capturedIsDirty: boolean | undefined;
      let capturedSubmitResult: AsyncResult.AsyncResult<unknown, unknown> | undefined;

      const Consumer = () => {
        useAtomSubscribe(
          form.isDirty,
          (v) => {
            capturedIsDirty = v;
          },
          { immediate: true }
        );
        useAtomSubscribe(
          form.submit,
          (v) => {
            capturedSubmitResult = v;
          },
          { immediate: true }
        );
        return null;
      };

      render(
        <form.Initialize defaultValues={{ name: "test" }}>
          <form.name />
          <Consumer />
        </form.Initialize>
      );

      expect(capturedIsDirty).toBe(false);
      expect(AsyncResult.isInitial(capturedSubmitResult!)).toBe(true);
    });

    effectTest("exposes submitResult.waiting during submission", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => Effect.void.pipe(Effect.delay("50 millis"));

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      const states: Array<{ waiting: boolean; tag: string }> = [];

      const Consumer = () => {
        const submitResult = useAtomValue(form.submit);
        states.push({ waiting: submitResult.waiting, tag: submitResult._tag });
        return null;
      };

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ name: "test" }}>
          <form.name />
          <SubmitButton />
          <Consumer />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(states.some((s) => s.waiting)).toBe(true);
        })
      );

      yield* Effect.promise(() =>
        waitFor(
          () => {
            const lastState = states[states.length - 1];
            expect(lastState.tag).toBe("Success");
            expect(lastState.waiting).toBe(false);
          },
          { timeout: 1000 }
        )
      );
    });

    effectTest("exposes submitResult with failure on validation error", function* () {
      const user = userEvent.setup();

      const NonEmpty = S.String.pipe(S.minLength(1, { message: () => "Required" }));
      const NameField = Field.makeField("name", NonEmpty);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      let capturedResult: AsyncResult.AsyncResult<unknown, unknown> | undefined;

      const Consumer = () => {
        useAtomSubscribe(
          form.submit,
          (v) => {
            capturedResult = v;
          },
          { immediate: true }
        );
        return null;
      };

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
          <SubmitButton />
          <Consumer />
        </form.Initialize>
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(capturedResult).toBeDefined();
          expect(AsyncResult.isFailure(capturedResult!)).toBe(true);
        })
      );
    });

    effectTest("updates isDirty when values change", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      const dirtyStates: Array<boolean> = [];

      const Consumer = () => {
        const isDirty = useAtomValue(form.isDirty);
        dirtyStates.push(isDirty);
        return null;
      };

      render(
        <form.Initialize defaultValues={{ name: "initial" }}>
          <form.name />
          <Consumer />
        </form.Initialize>
      );

      expect(dirtyStates[dirtyStates.length - 1]).toBe(false);

      const input = screen.getByTestId("text-input");
      yield* Effect.promise(() => user.clear(input));
      yield* Effect.promise(() => user.type(input, "changed"));

      expect(dirtyStates[dirtyStates.length - 1]).toBe(true);
    });
  });

  describe("isDirty lifecycle", () => {
    effectTest("form does not reinitialize on rerender (mount-only initialization)", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      let isDirty: boolean | undefined;

      const TestComponent = () => {
        useAtomSubscribe(
          form.isDirty,
          (v) => {
            isDirty = v;
          },
          { immediate: true }
        );
        return null;
      };

      const FormWrapper = ({ defaultName }: { defaultName: string }) => (
        <form.Initialize defaultValues={{ name: defaultName }}>
          <form.name />
          <TestComponent />
        </form.Initialize>
      );

      const { rerender } = render(<FormWrapper defaultName="initial" />);

      expect(isDirty).toBe(false);

      const input = screen.getByTestId("text-input");
      yield* Effect.promise(() => user.clear(input));
      yield* Effect.promise(() => user.type(input, "modified"));

      expect(isDirty).toBe(true);

      rerender(<FormWrapper defaultName="new-initial" />);

      expect(screen.getByTestId("text-input")).toHaveValue("modified");
      expect(isDirty).toBe(true);
    });

    effectTest("form reinitializes when using React key to force remount", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      let isDirty: boolean | undefined;

      const TestComponent = () => {
        useAtomSubscribe(
          form.isDirty,
          (v) => {
            isDirty = v;
          },
          { immediate: true }
        );
        return null;
      };

      const FormWrapper = ({ defaultName, formKey }: { defaultName: string; formKey: string }) => (
        <form.Initialize key={formKey} defaultValues={{ name: defaultName }}>
          <form.name />
          <TestComponent />
        </form.Initialize>
      );

      const { rerender } = render(<FormWrapper defaultName="initial" formKey="1" />);

      expect(isDirty).toBe(false);

      const input = screen.getByTestId("text-input");
      yield* Effect.promise(() => user.clear(input));
      yield* Effect.promise(() => user.type(input, "modified"));

      expect(isDirty).toBe(true);

      rerender(<FormWrapper defaultName="new-initial" formKey="2" />);

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("text-input")).toHaveValue("new-initial");
          expect(isDirty).toBe(false);
        })
      );
    });

    effectTest("key-change remount with parent subscription does not render stale values", function* () {
      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const renderedValues: Array<string> = [];

      const ValueTracker = () => {
        const values = useAtomValue(form.values);
        if (O.isSome(values)) {
          renderedValues.push(values.value.name as string);
        }
        return null;
      };

      const Parent = ({ defaultName, variantId }: { variantId: string; defaultName: string }) => {
        useAtomValue(form.values);
        return (
          <form.Initialize key={variantId} defaultValues={{ name: defaultName }}>
            <form.name />
            <ValueTracker />
          </form.Initialize>
        );
      };

      const { rerender } = render(<Parent variantId="1" defaultName="alice" />);

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("text-input")).toHaveValue("alice");
        })
      );

      renderedValues.length = 0;

      rerender(<Parent variantId="2" defaultName="bob" />);

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("text-input")).toHaveValue("bob");
        })
      );

      expect(renderedValues.every((v) => v === "bob")).toBe(true);
    });

    effectTest("isDirty becomes false when value returns to initial", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      let isDirty: boolean | undefined;

      const TestComponent = () => {
        useAtomSubscribe(
          form.isDirty,
          (v) => {
            isDirty = v;
          },
          { immediate: true }
        );
        return null;
      };

      render(
        <form.Initialize defaultValues={{ name: "initial" }}>
          <form.name />
          <TestComponent />
        </form.Initialize>
      );

      expect(isDirty).toBe(false);

      const input = screen.getByTestId("text-input");
      yield* Effect.promise(() => user.clear(input));
      yield* Effect.promise(() => user.type(input, "changed"));
      expect(isDirty).toBe(true);

      yield* Effect.promise(() => user.clear(input));
      yield* Effect.promise(() => user.type(input, "initial"));
      expect(isDirty).toBe(false);
    });

    effectTest("isDirty remains after successful submission", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      const TestComponent = () => {
        const isDirty = useAtomValue(form.isDirty);
        const submit = useAtomSet(form.submit);
        return (
          <>
            <span data-testid="isDirty">{String(isDirty)}</span>
            <button type="button" onClick={() => submit()} data-testid="submit">
              Submit
            </button>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "initial" }}>
          <form.name />
          <TestComponent />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");
      yield* Effect.promise(() => user.clear(input));
      yield* Effect.promise(() => user.type(input, "changed"));
      expect(screen.getByTestId("isDirty")).toHaveTextContent("true");

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("isDirty")).toHaveTextContent("true");
        })
      );
    });

    effectTest("reset() restores form to initial values", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const onSubmit = () => {};

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit,
      });

      const TestComponent = () => {
        const isDirty = useAtomValue(form.isDirty);
        const submitResult = useAtomValue(form.submit);
        const submit = useAtomSet(form.submit);
        const reset = useAtomSet(form.reset);
        return (
          <>
            <span data-testid="isDirty">{String(isDirty)}</span>
            <span data-testid="submitResultTag">{submitResult._tag}</span>
            <button type="button" onClick={() => submit()} data-testid="submit">
              Submit
            </button>
            <button type="button" onClick={() => reset()} data-testid="reset">
              Reset
            </button>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "initial" }}>
          <form.name />
          <TestComponent />
        </form.Initialize>
      );

      expect(screen.getByTestId("isDirty")).toHaveTextContent("false");
      expect(screen.getByTestId("submitResultTag")).toHaveTextContent("Initial");

      const input = screen.getByTestId("text-input");
      yield* Effect.promise(() => user.clear(input));
      yield* Effect.promise(() => user.type(input, "modified"));
      expect(screen.getByTestId("isDirty")).toHaveTextContent("true");
      expect(screen.getByTestId("text-input")).toHaveValue("modified");

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("submitResultTag")).toHaveTextContent("Success");
        })
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("reset")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("text-input")).toHaveValue("initial");
          expect(screen.getByTestId("isDirty")).toHaveTextContent("false");
          expect(screen.getByTestId("submitResultTag")).toHaveTextContent("Initial");
        })
      );
    });
  });

  describe("reactivity", () => {
    effectTest("reactivityKeys triggers invalidation after successful submit", function* () {
      const user = userEvent.setup();

      let rebuilds = 0;
      const counterAtom = Atom.make(() => rebuilds++).pipe(Atom.withReactivity(["form-submit"]), Atom.keepAlive);

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        reactivityKeys: ["form-submit"],
        onSubmit: () => {},
      });

      const CounterDisplay = () => {
        const count = useAtomValue(counterAtom);
        return <span data-testid="rebuild-count">{count}</span>;
      };

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ name: "test" }}>
          <form.name />
          <SubmitButton />
          <CounterDisplay />
        </form.Initialize>
      );

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("rebuild-count")).toHaveTextContent("0");
        })
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("rebuild-count")).toHaveTextContent("1");
        })
      );
    });

    effectTest("no invalidation when reactivityKeys is not provided", function* () {
      const user = userEvent.setup();
      const submitHandler = vi.fn();

      let rebuilds = 0;
      const counterAtom = Atom.make(() => rebuilds++).pipe(Atom.withReactivity(["no-keys-test"]), Atom.keepAlive);

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => submitHandler(),
      });

      const CounterDisplay = () => {
        const count = useAtomValue(counterAtom);
        return <span data-testid="rebuild-count">{count}</span>;
      };

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ name: "test" }}>
          <form.name />
          <SubmitButton />
          <CounterDisplay />
        </form.Initialize>
      );

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("rebuild-count")).toHaveTextContent("0");
        })
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(submitHandler).toHaveBeenCalled();
        })
      );

      expect(screen.getByTestId("rebuild-count")).toHaveTextContent("0");
    });

    effectTest("no invalidation on validation failure", function* () {
      const user = userEvent.setup();

      let rebuilds = 0;
      const counterAtom = Atom.make(() => rebuilds++).pipe(
        Atom.withReactivity(["validation-fail-test"]),
        Atom.keepAlive
      );

      const NonEmpty = S.String.pipe(S.minLength(1, { message: () => "Required" }));
      const NameField = Field.makeField("name", NonEmpty);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        reactivityKeys: ["validation-fail-test"],
        onSubmit: () => {},
      });

      const CounterDisplay = () => {
        const count = useAtomValue(counterAtom);
        return <span data-testid="rebuild-count">{count}</span>;
      };

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
          <SubmitButton />
          <CounterDisplay />
        </form.Initialize>
      );

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("rebuild-count")).toHaveTextContent("0");
        })
      );

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Required");
        })
      );

      expect(screen.getByTestId("rebuild-count")).toHaveTextContent("0");
    });
  });

  describe("runtime optionality", () => {
    it("does not require runtime when R is only AtomRegistry", () => {
      const NameField = Field.makeField(
        "name",
        S.String.pipe(
          S.filterEffect(() =>
            Effect.gen(function* () {
              yield* AtomRegistry.AtomRegistry;
              return true as const;
            })
          )
        )
      );
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      expectTypeOf(form).not.toBeAny();
      expectTypeOf(form.submit).not.toBeAny();
      expectTypeOf(form.Initialize).not.toBeAny();
    });
  });

  describe("debounce and auto-submit", () => {
    const createRuntime = () => Atom.runtime(Layer.empty);

    const DebounceTextInput: FormReact.FieldComponent<string, { readonly testId?: string }> = ({ field, props }) => (
      <div>
        <input
          type="text"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          data-testid={props.testId ?? "text-input"}
        />
        {O.isSome(field.error) && (
          <span data-testid={`${props.testId ?? "text-input"}-error`}>{field.error.value}</span>
        )}
      </div>
    );

    const NameInput: FormReact.FieldComponent<string> = ({ field }) => (
      <DebounceTextInput field={field} props={{ testId: "name-input" }} />
    );

    const AgeInput: FormReact.FieldComponent<string> = ({ field }) => (
      <DebounceTextInput field={field} props={{ testId: "age-input" }} />
    );

    const delay = (ms: number) => Effect.sleep(`${ms} millis`);

    const NameField = Field.makeField("name", S.String);
    const NameFieldMinLength = Field.makeField(
      "name",
      S.String.pipe(S.minLength(5, { message: () => "Must be at least 5 characters" }))
    );
    const AgeField = Field.makeField("age", S.String);

    effectTest("debounces validation updates in onChange mode", function* () {
      vi.useFakeTimers();

      try {
        const formBuilder = FormBuilder.empty.addField(NameFieldMinLength);

        const form = FormReact.make(formBuilder, {
          runtime: createRuntime(),
          fields: { name: DebounceTextInput },
          mode: { validation: "onChange", debounce: "300 millis" },
          onSubmit: () => {},
        });

        render(
          <form.Initialize defaultValues={{ name: "Valid" }}>
            <form.name />
          </form.Initialize>
        );

        const input = screen.getByTestId("text-input");
        act(() => {
          fireEvent.change(input, { target: { value: "Bad" } });
        });

        expect(screen.queryByTestId("text-input-error")).not.toBeInTheDocument();

        yield* Effect.promise(() => act(() => vi.advanceTimersByTimeAsync(299)));
        expect(screen.queryByTestId("text-input-error")).not.toBeInTheDocument();

        yield* Effect.promise(() => act(() => vi.advanceTimersByTimeAsync(1)));
        expect(screen.getByTestId("text-input-error")).toHaveTextContent("Must be at least 5 characters");
      } finally {
        vi.useRealTimers();
      }
    });

    effectTest("does NOT auto-submit on initial mount without changes", function* () {
      const submitHandler = vi.fn();

      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        runtime: createRuntime(),
        fields: { name: DebounceTextInput },
        mode: { validation: "onChange", debounce: "50 millis", autoSubmit: true },
        onSubmit: (_: void, { decoded }) => submitHandler(decoded),
      });

      render(
        <form.Initialize defaultValues={{ name: "Initial" }}>
          <form.name />
        </form.Initialize>
      );

      yield* delay(120);

      expect(submitHandler).not.toHaveBeenCalled();
    });

    effectTest("auto-submits valid form data after debounce", function* () {
      vi.useFakeTimers();
      const submitHandler = vi.fn();

      try {
        const formBuilder = FormBuilder.empty.addField(NameField);

        const form = FormReact.make(formBuilder, {
          runtime: createRuntime(),
          fields: { name: DebounceTextInput },
          mode: { validation: "onChange", debounce: "100 millis", autoSubmit: true },
          onSubmit: (_: void, { decoded }) => submitHandler(decoded),
        });

        render(
          <form.Initialize defaultValues={{ name: "" }}>
            <form.name />
          </form.Initialize>
        );

        const input = screen.getByTestId("text-input");
        act(() => {
          fireEvent.change(input, { target: { value: "Lucas" } });
        });

        yield* Effect.promise(() => act(() => vi.advanceTimersByTimeAsync(99)));
        expect(submitHandler).not.toHaveBeenCalled();

        yield* Effect.promise(() => act(() => vi.advanceTimersByTimeAsync(1)));

        expect(submitHandler).toHaveBeenCalledTimes(1);
        expect(submitHandler).toHaveBeenCalledWith({ name: "Lucas" });
      } finally {
        vi.useRealTimers();
      }
    });

    effectTest("does NOT re-trigger auto-submit after submission completes", function* () {
      vi.useFakeTimers();
      const submitHandler = vi.fn();

      try {
        const formBuilder = FormBuilder.empty.addField(NameField);

        const form = FormReact.make(formBuilder, {
          runtime: createRuntime(),
          fields: { name: DebounceTextInput },
          mode: { validation: "onChange", debounce: "50 millis", autoSubmit: true },
          onSubmit: Effect.fn("FormReactAutoSubmitTest.onSubmit")(function* (_: void, { decoded }) {
            yield* delay(50);
            submitHandler(decoded);
          }),
        });

        render(
          <form.Initialize defaultValues={{ name: "" }}>
            <form.name />
          </form.Initialize>
        );

        const input = screen.getByTestId("text-input");
        act(() => {
          fireEvent.change(input, { target: { value: "Lucas" } });
        });

        yield* Effect.promise(() => act(() => vi.advanceTimersByTimeAsync(50)));
        expect(submitHandler).not.toHaveBeenCalled();

        yield* Effect.promise(() => act(() => vi.advanceTimersByTimeAsync(50)));
        expect(submitHandler).toHaveBeenCalledTimes(1);
        expect(submitHandler).toHaveBeenCalledWith({ name: "Lucas" });

        yield* Effect.promise(() => act(() => vi.advanceTimersByTimeAsync(200)));
        expect(submitHandler).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });

    effectTest("batches updates from multiple fields into a single auto-submission", function* () {
      vi.useFakeTimers();
      const submitHandler = vi.fn();

      try {
        const formBuilder = FormBuilder.empty.addField(NameField).addField(AgeField);

        const form = FormReact.make(formBuilder, {
          runtime: createRuntime(),
          fields: { name: NameInput, age: AgeInput },
          mode: { validation: "onChange", debounce: "100 millis", autoSubmit: true },
          onSubmit: (_: void, { decoded }) => submitHandler(decoded),
        });

        render(
          <form.Initialize defaultValues={{ name: "", age: "" }}>
            <form.name />
            <form.age />
          </form.Initialize>
        );

        const nameInput = screen.getByTestId("name-input");
        const ageInput = screen.getByTestId("age-input");
        act(() => {
          fireEvent.change(nameInput, { target: { value: "Lucas" } });
          fireEvent.change(ageInput, { target: { value: "30" } });
        });

        yield* Effect.promise(() => act(() => vi.advanceTimersByTimeAsync(50)));
        expect(submitHandler).not.toHaveBeenCalled();

        yield* Effect.promise(() => act(() => vi.advanceTimersByTimeAsync(50)));
        expect(submitHandler).toHaveBeenCalledTimes(1);
        expect(submitHandler).toHaveBeenCalledWith({ name: "Lucas", age: "30" });
      } finally {
        vi.useRealTimers();
      }
    });

    effectTest("does NOT auto-submit if validation fails", function* () {
      const user = userEvent.setup();
      const submitHandler = vi.fn();

      const formBuilder = FormBuilder.empty.addField(NameFieldMinLength);

      const form = FormReact.make(formBuilder, {
        runtime: createRuntime(),
        fields: { name: DebounceTextInput },
        mode: { validation: "onChange", debounce: "50 millis", autoSubmit: true },
        onSubmit: (_: void, { decoded }) => submitHandler(decoded),
      });

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");

      yield* Effect.promise(() => user.type(input, "Bad"));
      yield* Effect.promise(() => user.tab());

      yield* Effect.promise(() =>
        waitFor(
          () => {
            expect(screen.getByTestId("text-input-error")).toHaveTextContent("Must be at least 5 characters");
          },
          { timeout: 200 }
        )
      );

      yield* delay(100);

      expect(submitHandler).not.toHaveBeenCalled();
    });

    effectTest("cancels pending submission on unmount", function* () {
      vi.useFakeTimers();
      const submitHandler = vi.fn();

      try {
        const formBuilder = FormBuilder.empty.addField(NameField);

        const form = FormReact.make(formBuilder, {
          runtime: createRuntime(),
          fields: { name: DebounceTextInput },
          mode: { validation: "onChange", debounce: "100 millis", autoSubmit: true },
          onSubmit: (_: void, { decoded }) => submitHandler(decoded),
        });

        const { unmount } = render(
          <form.Initialize defaultValues={{ name: "" }}>
            <form.name />
          </form.Initialize>
        );

        const input = screen.getByTestId("text-input");
        act(() => {
          fireEvent.change(input, { target: { value: "Lucas" } });
        });

        unmount();

        yield* Effect.promise(() => act(() => vi.advanceTimersByTimeAsync(200)));

        expect(submitHandler).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });

    effectTest("auto-submits on blur when mode is onBlur with autoSubmit", function* () {
      const user = userEvent.setup();
      const submitHandler = vi.fn();

      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        runtime: createRuntime(),
        fields: { name: DebounceTextInput },
        mode: { validation: "onBlur", autoSubmit: true },
        onSubmit: (_: void, { decoded }) => submitHandler(decoded),
      });

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");

      yield* Effect.promise(() => user.type(input, "Lucas"));

      expect(submitHandler).not.toHaveBeenCalled();

      yield* Effect.promise(() => user.tab());

      yield* Effect.promise(() =>
        waitFor(
          () => {
            expect(submitHandler).toHaveBeenCalledWith({ name: "Lucas" });
          },
          { timeout: 200 }
        )
      );
    });

    effectTest("does NOT re-submit on blur if values unchanged since last submission", function* () {
      const user = userEvent.setup();
      const submitHandler = vi.fn();

      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        runtime: createRuntime(),
        fields: { name: DebounceTextInput },
        mode: { validation: "onBlur", autoSubmit: true },
        onSubmit: (_: void, { decoded }) => submitHandler(decoded),
      });

      render(
        <form.Initialize defaultValues={{ name: "" }}>
          <form.name />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");

      yield* Effect.promise(() => user.type(input, "Lucas"));
      yield* Effect.promise(() => user.tab());

      yield* Effect.promise(() =>
        waitFor(
          () => {
            expect(submitHandler).toHaveBeenCalledTimes(1);
          },
          { timeout: 200 }
        )
      );

      yield* Effect.promise(() => user.click(input));
      yield* Effect.promise(() => user.tab());

      yield* delay(100);

      expect(submitHandler).toHaveBeenCalledTimes(1);
    });

    effectTest("validates immediately in onChange mode without debounce config", function* () {
      const user = userEvent.setup();

      const formBuilder = FormBuilder.empty.addField(NameFieldMinLength);

      const form = FormReact.make(formBuilder, {
        runtime: createRuntime(),
        fields: { name: DebounceTextInput },
        mode: { validation: "onChange" },
        onSubmit: () => {},
      });

      render(
        <form.Initialize defaultValues={{ name: "Valid" }}>
          <form.name />
        </form.Initialize>
      );

      const input = screen.getByTestId("text-input");

      yield* Effect.promise(() => user.clear(input));
      yield* Effect.promise(() => user.type(input, "Bad"));
      yield* Effect.promise(() => user.tab());

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("text-input-error")).toHaveTextContent("Must be at least 5 characters");
        })
      );
    });
  });

  describe("validate", () => {
    effectTest("shows field errors immediately with validateOnInit + invalid defaults", function* () {
      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const SubmitCountDisplay = () => {
        const submitCount = useAtomValue(form.submitCount);
        return <span data-testid="submit-count">{submitCount}</span>;
      };

      render(
        <form.Initialize defaultValues={{ name: "ab" }} validateOnInit>
          <form.name />
          <SubmitCountDisplay />
        </form.Initialize>
      );

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      expect(screen.getByTestId("submit-count")).toHaveTextContent("0");
    });

    effectTest("shows no errors with validateOnInit + valid defaults", function* () {
      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      render(
        <form.Initialize defaultValues={{ name: "Valid Name" }} validateOnInit>
          <form.name />
        </form.Initialize>
      );

      yield* Effect.sleep("100 millis");
      expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    });

    effectTest("shows refinement errors with validateOnInit", function* () {
      const PasswordInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            type="password"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="password"
          />
          {O.isSome(field.error) && <span data-testid="password-error">{field.error.value}</span>}
        </div>
      );

      const ConfirmInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            type="password"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="confirm"
          />
          {O.isSome(field.error) && <span data-testid="confirm-error">{field.error.value}</span>}
        </div>
      );

      const PasswordField = Field.makeField("password", S.String);
      const ConfirmField = Field.makeField("confirm", S.String);
      const formBuilder = FormBuilder.empty
        .addField(PasswordField)
        .addField(ConfirmField)
        .refine((values) => {
          if (values.password !== values.confirm) {
            return { path: ["confirm"], message: "Passwords must match" };
          }
        });

      const form = FormReact.make(formBuilder, {
        fields: { password: PasswordInput, confirm: ConfirmInput },
        onSubmit: () => {},
      });

      render(
        <form.Initialize defaultValues={{ password: "secret", confirm: "different" }} validateOnInit>
          <form.password />
          <form.confirm />
        </form.Initialize>
      );

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("confirm-error")).toHaveTextContent("Passwords must match");
        })
      );
    });

    effectTest("errors clear when user fixes the field in onChange mode", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        mode: { validation: "onChange" },
        onSubmit: () => {},
      });

      render(
        <form.Initialize defaultValues={{ name: "ab" }} validateOnInit>
          <form.name />
        </form.Initialize>
      );

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      yield* Effect.promise(() => user.clear(screen.getByTestId("text-input")));
      yield* Effect.promise(() => user.type(screen.getByTestId("text-input"), "Valid Value"));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("reset clears validate errors and validationCount", function* () {
      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const Controls = () => {
        const reset = useAtomSet(form.reset);
        const validationCount = useAtomValue(form.validationCount);
        return (
          <>
            <button type="button" data-testid="reset" onClick={() => reset()}>
              Reset
            </button>
            <span data-testid="validation-count">{validationCount}</span>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "ab" }} validateOnInit>
          <form.name />
          <Controls />
        </form.Initialize>
      );

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      expect(screen.getByTestId("validation-count")).toHaveTextContent("1");

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("reset")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
          expect(screen.getByTestId("validation-count")).toHaveTextContent("0");
        })
      );
    });

    effectTest("does not re-validate when KeepAlive preserves state", function* () {
      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const ValidationCountDisplay = () => {
        const validationCount = useAtomValue(form.validationCount);
        return <span data-testid="validation-count">{validationCount}</span>;
      };

      const ToggleableForm = () => {
        const [mounted, setMounted] = React.useState(true);
        return (
          <>
            <form.KeepAlive />
            <ValidationCountDisplay />
            {mounted && (
              <form.Initialize defaultValues={{ name: "ab" }} validateOnInit>
                <form.name />
              </form.Initialize>
            )}
            <button type="button" data-testid="toggle" onClick={() => setMounted((v) => !v)}>
              Toggle
            </button>
          </>
        );
      };

      render(<ToggleableForm />);

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
          expect(screen.getByTestId("validation-count")).toHaveTextContent("1");
        })
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("toggle")));

      expect(screen.queryByTestId("text-input")).not.toBeInTheDocument();

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("toggle")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      expect(screen.getByTestId("validation-count")).toHaveTextContent("1");
    });

    effectTest("works with onSubmit mode", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        mode: { validation: "onSubmit" },
        onSubmit: () => {},
      });

      render(
        <form.Initialize defaultValues={{ name: "ab" }} validateOnInit>
          <form.name />
        </form.Initialize>
      );

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      yield* Effect.promise(() => user.clear(screen.getByTestId("text-input")));
      yield* Effect.promise(() => user.type(screen.getByTestId("text-input"), "Valid Value"));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("imperative validate shows errors after programmatic setValues", function* () {
      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const Controls = () => {
        const setValues = useAtomSet(form.setValues);
        const triggerValidate = useAtomSet(form.validate);
        return (
          <>
            <button
              type="button"
              data-testid="set-invalid"
              onClick={() => {
                setValues({ name: "ab" });
                triggerValidate();
              }}
            >
              Set Invalid
            </button>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "Valid Name" }}>
          <form.name />
          <Controls />
        </form.Initialize>
      );

      expect(screen.queryByTestId("error")).not.toBeInTheDocument();

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("set-invalid")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );
    });

    effectTest("imperative validate clears previous errors when values are now valid", function* () {
      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const Controls = () => {
        const setValues = useAtomSet(form.setValues);
        const triggerValidate = useAtomSet(form.validate);
        return (
          <>
            <button
              type="button"
              data-testid="set-valid"
              onClick={() => {
                setValues({ name: "Valid Name" });
                triggerValidate();
              }}
            >
              Set Valid
            </button>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "ab" }} validateOnInit>
          <form.name />
          <Controls />
        </form.Initialize>
      );

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("set-valid")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("calling validate multiple times reflects latest state each time", function* () {
      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const Controls = () => {
        const setValues = useAtomSet(form.setValues);
        const triggerValidate = useAtomSet(form.validate);
        return (
          <>
            <button
              type="button"
              data-testid="set-invalid"
              onClick={() => {
                setValues({ name: "ab" });
                triggerValidate();
              }}
            >
              Set Invalid
            </button>
            <button
              type="button"
              data-testid="set-valid"
              onClick={() => {
                setValues({ name: "Valid Name" });
                triggerValidate();
              }}
            >
              Set Valid
            </button>
            <button
              type="button"
              data-testid="set-invalid2"
              onClick={() => {
                setValues({ name: "xy" });
                triggerValidate();
              }}
            >
              Set Invalid Again
            </button>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "Valid Name" }}>
          <form.name />
          <Controls />
        </form.Initialize>
      );

      expect(screen.queryByTestId("error")).not.toBeInTheDocument();

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("set-invalid")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("set-valid")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("set-invalid2")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );
    });

    effectTest("validate does not interfere with submitCount", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const Controls = () => {
        const submitCount = useAtomValue(form.submitCount);
        const validationCount = useAtomValue(form.validationCount);
        const reset = useAtomSet(form.reset);
        return (
          <>
            <span data-testid="submit-count">{submitCount}</span>
            <span data-testid="validation-count">{validationCount}</span>
            <button type="button" data-testid="reset" onClick={() => reset()}>
              Reset
            </button>
          </>
        );
      };

      const SubmitButton = makeSubmitButton(form.submit, undefined);

      render(
        <form.Initialize defaultValues={{ name: "ab" }} validateOnInit>
          <form.name />
          <Controls />
          <SubmitButton />
        </form.Initialize>
      );

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      expect(screen.getByTestId("submit-count")).toHaveTextContent("0");
      expect(screen.getByTestId("validation-count")).toHaveTextContent("1");

      yield* Effect.promise(() => user.click(screen.getByTestId("submit")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("submit-count")).toHaveTextContent("1");
        })
      );

      expect(screen.getByTestId("validation-count")).toHaveTextContent("1");

      yield* Effect.promise(() => user.click(screen.getByTestId("reset")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("submit-count")).toHaveTextContent("0");
          expect(screen.getByTestId("validation-count")).toHaveTextContent("0");
        })
      );
    });

    effectTest("validate does not overwrite user typing during async validation", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String);
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        mode: { validation: "onChange" },
        onSubmit: () => {},
      });

      const Controls = () => {
        const triggerValidate = useAtomSet(form.validate);
        return (
          <button type="button" data-testid="validate" onClick={() => triggerValidate()}>
            Validate
          </button>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "initial" }}>
          <form.name />
          <Controls />
        </form.Initialize>
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("validate")));

      yield* Effect.promise(() => user.clear(screen.getByTestId("text-input")));
      yield* Effect.promise(() => user.type(screen.getByTestId("text-input"), "typed"));

      yield* Effect.sleep("100 millis");

      expect(screen.getByTestId("text-input")).toHaveValue("typed");
    });
  });

  describe("per-field validate", () => {
    effectTest("shows error for that field only in onSubmit mode", function* () {
      const NameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="name-input"
          />
          {O.isSome(field.error) && <span data-testid="name-error">{field.error.value}</span>}
        </div>
      );
      const EmailInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="email-input"
          />
          {O.isSome(field.error) && <span data-testid="email-error">{field.error.value}</span>}
        </div>
      );

      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Name too short" })));
      const EmailField = Field.makeField("email", S.String.pipe(S.minLength(5, { message: () => "Email too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField).addField(EmailField);

      const form = FormReact.make(formBuilder, {
        fields: { name: NameInput, email: EmailInput },
        onSubmit: () => {},
      });

      const ValidateName = () => {
        const nameAtoms = form.getFieldAtoms(form.fields.name);
        const triggerValidate = useAtomSet(nameAtoms.validate);
        return (
          <button type="button" data-testid="validate-name" onClick={() => triggerValidate()}>
            Validate Name
          </button>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "ab", email: "cd" }}>
          <form.name />
          <form.email />
          <ValidateName />
        </form.Initialize>
      );

      expect(screen.queryByTestId("name-error")).not.toBeInTheDocument();
      expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("validate-name")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("name-error")).toHaveTextContent("Name too short");
        })
      );

      expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();
    });

    effectTest("works in onBlur mode", function* () {
      const user = userEvent.setup();

      const NameField = Field.makeField("name", S.String.pipe(S.minLength(5, { message: () => "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        mode: { validation: "onBlur" },
        onSubmit: () => {},
      });

      const ValidateName = () => {
        const nameAtoms = form.getFieldAtoms(form.fields.name);
        const triggerValidate = useAtomSet(nameAtoms.validate);
        return (
          <button type="button" data-testid="validate-name" onClick={() => triggerValidate()}>
            Validate Name
          </button>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "ab" }}>
          <form.name />
          <ValidateName />
        </form.Initialize>
      );

      expect(screen.queryByTestId("error")).not.toBeInTheDocument();

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("validate-name")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      yield* Effect.promise(() => user.clear(screen.getByTestId("text-input")));
      yield* Effect.promise(() => user.type(screen.getByTestId("text-input"), "Valid Value"));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("works in onChange mode", function* () {
      const NameField = Field.makeField("name", S.String.check(S.isMinLength(5, { message: "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        mode: { validation: "onChange" },
        onSubmit: () => {},
      });

      const Controls = () => {
        const nameAtoms = form.getFieldAtoms(form.fields.name);
        const triggerValidate = useAtomSet(nameAtoms.validate);
        const setValues = useAtomSet(form.setValues);
        return (
          <>
            <button type="button" data-testid="validate-name" onClick={() => triggerValidate()}>
              Validate
            </button>
            <button type="button" data-testid="set-invalid" onClick={() => setValues({ name: "ab" })}>
              Set Invalid
            </button>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "Valid Name" }}>
          <form.name />
          <Controls />
        </form.Initialize>
      );

      expect(screen.queryByTestId("error")).not.toBeInTheDocument();

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("validate-name")));

      yield* Effect.sleep("100 millis");
      expect(screen.queryByTestId("error")).not.toBeInTheDocument();

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("set-invalid")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );
    });

    effectTest("reset clears per-field validation state", function* () {
      const NameField = Field.makeField("name", S.String.check(S.isMinLength(5, { message: "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const Controls = () => {
        const nameAtoms = form.getFieldAtoms(form.fields.name);
        const triggerValidate = useAtomSet(nameAtoms.validate);
        const reset = useAtomSet(form.reset);
        return (
          <>
            <button type="button" data-testid="validate-name" onClick={() => triggerValidate()}>
              Validate
            </button>
            <button type="button" data-testid="reset" onClick={() => reset()}>
              Reset
            </button>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "ab" }}>
          <form.name />
          <Controls />
        </form.Initialize>
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("validate-name")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("reset")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );
    });

    effectTest("per-field validate works after reset", function* () {
      const NameField = Field.makeField("name", S.String.check(S.isMinLength(5, { message: "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const Controls = () => {
        const nameAtoms = form.getFieldAtoms(form.fields.name);
        const triggerValidate = useAtomSet(nameAtoms.validate);
        const reset = useAtomSet(form.reset);
        return (
          <>
            <button type="button" data-testid="validate-name" onClick={() => triggerValidate()}>
              Validate
            </button>
            <button type="button" data-testid="reset" onClick={() => reset()}>
              Reset
            </button>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "ab" }}>
          <form.name />
          <Controls />
        </form.Initialize>
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("validate-name")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("reset")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        })
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("validate-name")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );
    });

    effectTest("does not affect form-level validationCount or submitCount", function* () {
      const NameField = Field.makeField("name", S.String.check(S.isMinLength(5, { message: "Too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField);

      const form = FormReact.make(formBuilder, {
        fields: { name: TextInput },
        onSubmit: () => {},
      });

      const Controls = () => {
        const nameAtoms = form.getFieldAtoms(form.fields.name);
        const triggerValidate = useAtomSet(nameAtoms.validate);
        const submitCount = useAtomValue(form.submitCount);
        const validationCount = useAtomValue(form.validationCount);
        return (
          <>
            <button type="button" data-testid="validate-name" onClick={() => triggerValidate()}>
              Validate
            </button>
            <span data-testid="submit-count">{submitCount}</span>
            <span data-testid="validation-count">{validationCount}</span>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "ab" }}>
          <form.name />
          <Controls />
        </form.Initialize>
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("validate-name")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("error")).toHaveTextContent("Too short");
        })
      );

      expect(screen.getByTestId("submit-count")).toHaveTextContent("0");
      expect(screen.getByTestId("validation-count")).toHaveTextContent("0");
    });

    effectTest("multiple fields can be validated independently", function* () {
      const NameInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="name-input"
          />
          {O.isSome(field.error) && <span data-testid="name-error">{field.error.value}</span>}
        </div>
      );
      const EmailInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="email-input"
          />
          {O.isSome(field.error) && <span data-testid="email-error">{field.error.value}</span>}
        </div>
      );
      const AgeInput: FormReact.FieldComponent<string> = ({ field }) => (
        <div>
          <input
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-testid="age-input"
          />
          {O.isSome(field.error) && <span data-testid="age-error">{field.error.value}</span>}
        </div>
      );

      const NameField = Field.makeField("name", S.String.check(S.isMinLength(5, { message: "Name too short" })));
      const EmailField = Field.makeField("email", S.String.check(S.isMinLength(5, { message: "Email too short" })));
      const AgeField = Field.makeField("age", S.String.pipe(S.minLength(2, { message: () => "Age too short" })));
      const formBuilder = FormBuilder.empty.addField(NameField).addField(EmailField).addField(AgeField);

      const form = FormReact.make(formBuilder, {
        fields: { name: NameInput, email: EmailInput, age: AgeInput },
        onSubmit: () => {},
      });

      const Controls = () => {
        const nameAtoms = form.getFieldAtoms(form.fields.name);
        const ageAtoms = form.getFieldAtoms(form.fields.age);
        const validateName = useAtomSet(nameAtoms.validate);
        const validateAge = useAtomSet(ageAtoms.validate);
        return (
          <>
            <button type="button" data-testid="validate-name" onClick={() => validateName()}>
              Validate Name
            </button>
            <button type="button" data-testid="validate-age" onClick={() => validateAge()}>
              Validate Age
            </button>
          </>
        );
      };

      render(
        <form.Initialize defaultValues={{ name: "ab", email: "cd", age: "1" }}>
          <form.name />
          <form.email />
          <form.age />
          <Controls />
        </form.Initialize>
      );

      yield* Effect.promise(() => userEvent.click(screen.getByTestId("validate-name")));
      yield* Effect.promise(() => userEvent.click(screen.getByTestId("validate-age")));

      yield* Effect.promise(() =>
        waitFor(() => {
          expect(screen.getByTestId("name-error")).toHaveTextContent("Name too short");
          expect(screen.getByTestId("age-error")).toHaveTextContent("Age too short");
        })
      );

      expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();
    });
  });
});

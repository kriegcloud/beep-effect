import { Form, makeFormOptions, useAppForm } from "@beep/form";
import * as S from "effect/Schema";
import { expect, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

const Schema = S.Struct({ username: S.NonEmptyString });

/**
 * The `Text` field bound through `@beep/form` to its `@beep/ui` primitive.
 */
const TextDemo = () => {
  const form = useAppForm(makeFormOptions({ schema: Schema, defaultValues: { username: "" }, validateOn: "change" }));
  return (
    <form.AppForm>
      <Form className="flex w-80 flex-col gap-4" onSubmit={() => form.handleSubmit()}>
        <form.AppField name="username">{(field) => <field.Text label="Username" />}</form.AppField>
      </Form>
    </form.AppForm>
  );
};

const meta = {
  title: "Form/Text",
  component: TextDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof TextDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Username");
    await userEvent.type(input, "hello");
    await expect(input).toHaveValue("hello");
  },
};

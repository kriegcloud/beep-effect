import { Form, makeFormOptions, useAppForm } from "@beep/form";
import * as S from "effect/Schema";
import { expect, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

const Schema = S.Struct({ files: S.Array(S.Unknown) });
const previewSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#33bbff"/></svg>';

/**
 * The `Upload` field bound through `@beep/form` to its `@beep/ui` primitive.
 */
const UploadDemo = () => {
  const form = useAppForm(makeFormOptions({ schema: Schema, defaultValues: { files: [] }, validateOn: "change" }));
  return (
    <form.AppForm>
      <Form className="flex w-96 flex-col gap-4" onSubmit={() => form.handleSubmit()}>
        <form.AppField name="files">{(field) => <field.Upload label="Documents" />}</form.AppField>
      </Form>
    </form.AppForm>
  );
};

const meta = {
  title: "Form/Upload",
  component: UploadDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof UploadDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    await expect(input).not.toBeNull();
    if (input !== null) {
      await userEvent.upload(input, new File([previewSvg], "brief.svg", { type: "image/svg+xml" }));
    }
    await expect(canvas.getByAltText("brief.svg")).toBeInTheDocument();
  },
};

import { EditorComposer } from "@beep/editor";
import { documentToEditorState } from "@beep/lexical-schema";
import * as MdModel from "@beep/md/Md.model";
import * as Effect from "effect/Effect";
import { expect, fn, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

const initialState = Effect.runSync(
  documentToEditorState(
    MdModel.Document.make({
      children: [MdModel.P.make({ children: [MdModel.Text.make({ value: "Draft a reply…" })] })],
    })
  )
);

const meta = {
  title: "Editor/EditorComposer",
  component: EditorComposer,
  tags: ["autodocs"],
  args: { onSerializedChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Editable composer over the `@beep/lexical-schema` v1 vocabulary with history, lists, links, and markdown shortcuts; `onSerializedChange` emits schema-decoded states.",
      },
    },
  },
} satisfies Meta<typeof EditorComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { placeholder: "Message the workspace…" },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Message the workspace…")).toBeVisible();
  },
};

export const WithInitialState: Story = {
  args: { initialState },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Draft a reply…")).toBeVisible();
  },
};

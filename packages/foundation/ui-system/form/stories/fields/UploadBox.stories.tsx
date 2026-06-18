import { assertUploadedPreview, UploadFieldDemo } from "./storyHelpers.tsx";
import type { Meta, StoryObj } from "@storybook/react-vite";

const previewSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#a78bfa"/></svg>';

/**
 * The `UploadBox` field bound through `@beep/form` to its `@beep/ui` primitive.
 */
const UploadBoxDemo = () => <UploadFieldDemo kind="uploadBox" />;

const meta = {
  title: "Form/UploadBox",
  component: UploadBoxDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof UploadBoxDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: ({ canvasElement }) => assertUploadedPreview({ canvasElement, fileName: "attachment.svg", svg: previewSvg }),
};

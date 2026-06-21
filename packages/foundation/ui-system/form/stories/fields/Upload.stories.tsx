import { assertUploadedPreview, UploadFieldDemo } from "./storyHelpers.tsx";
import type { Meta, StoryObj } from "@storybook/react-vite";

const previewSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#33bbff"/></svg>';

/**
 * The `Upload` field bound through `@beep/form` to its `@beep/ui` primitive.
 */
const UploadDemo = () => <UploadFieldDemo kind="upload" />;

const meta = {
  title: "Form/Upload",
  component: UploadDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof UploadDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: ({ canvasElement }) => assertUploadedPreview({ canvasElement, fileName: "brief.svg", svg: previewSvg }),
};

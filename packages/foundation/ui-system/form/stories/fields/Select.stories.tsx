import { assertCountryLabel, CountryFieldDemo } from "./storyHelpers.tsx";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * The `Select` field bound through `@beep/form` to its `@beep/ui` primitive.
 */
const SelectDemo = () => <CountryFieldDemo kind="select" />;

const meta = {
  title: "Form/Select",
  component: SelectDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof SelectDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: ({ canvasElement }) => assertCountryLabel(canvasElement),
};

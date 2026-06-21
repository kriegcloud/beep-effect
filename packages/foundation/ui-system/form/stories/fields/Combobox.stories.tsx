import { assertCountryLabel, CountryFieldDemo } from "./storyHelpers.tsx";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * The `Combobox` field bound through `@beep/form` to the `@beep/ui` combobox primitive.
 */
const ComboboxDemo = () => <CountryFieldDemo kind="combobox" />;

const meta = {
  title: "Form/Combobox",
  component: ComboboxDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof ComboboxDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: ({ canvasElement }) => assertCountryLabel(canvasElement),
};

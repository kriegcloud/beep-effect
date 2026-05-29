import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@beep/ui/components/native-select";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `NativeSelect` is a styled wrapper around the platform `<select>` element, adding a trailing
 * caret icon and the same focus, disabled, and invalid styling as the other form controls. Because
 * it renders a real `<select>`, it keeps native keyboard and accessibility behavior for free.
 * Compose it with `NativeSelectOption` and `NativeSelectOptGroup` for themed options and grouped
 * sections. Use `size` to match the surrounding density.
 *
 * Imported from `@beep/ui/components/native-select`.
 */
const meta = {
  title: "Components/Forms/NativeSelect",
  component: NativeSelect,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "Control height to match the surrounding density.",
      table: { defaultValue: { summary: "default" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction and dims the control.",
    },
    "aria-invalid": {
      control: "boolean",
      description: "Marks the control as invalid, switching the border and ring to the destructive color.",
    },
    multiple: {
      control: "boolean",
      description: "Renders a multi-row list box that allows selecting more than one option.",
    },
    defaultValue: {
      control: "text",
      description: "The value of the option selected on initial render (uncontrolled).",
    },
    children: {
      control: false,
      description: "The composed options: `NativeSelectOption` items, optionally grouped in `NativeSelectOptGroup`.",
    },
  },
  args: {
    size: "default",
    disabled: false,
    onChange: fn(),
  },
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default select with a list of options. Choosing a different option fires `onChange`. */
export const Default: Story = {
  args: { "aria-label": "Choose a fruit", defaultValue: "apple" },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOption value="apple">Apple</NativeSelectOption>
      <NativeSelectOption value="banana">Banana</NativeSelectOption>
      <NativeSelectOption value="cherry">Cherry</NativeSelectOption>
    </NativeSelect>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("combobox", { name: "Choose a fruit" });
    expect(select).toBeVisible();
    expect(select).toHaveValue("apple");
    return userEvent.selectOptions(select, "banana").then(() => {
      expect(select).toHaveValue("banana");
      expect(args.onChange).toHaveBeenCalled();
    });
  },
};

/** The small size, useful in dense toolbars and inline filters. */
export const Small: Story = {
  args: { "aria-label": "Choose a fruit", size: "sm", defaultValue: "apple" },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOption value="apple">Apple</NativeSelectOption>
      <NativeSelectOption value="banana">Banana</NativeSelectOption>
      <NativeSelectOption value="cherry">Cherry</NativeSelectOption>
    </NativeSelect>
  ),
};

/** A leading placeholder option that is disabled, prompting the user to make an explicit choice. */
export const WithPlaceholder: Story = {
  args: { "aria-label": "Choose a fruit", defaultValue: "" },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOption value="" disabled>
        Select a fruit…
      </NativeSelectOption>
      <NativeSelectOption value="apple">Apple</NativeSelectOption>
      <NativeSelectOption value="banana">Banana</NativeSelectOption>
      <NativeSelectOption value="cherry">Cherry</NativeSelectOption>
    </NativeSelect>
  ),
};

/** `NativeSelectOptGroup` partitions options into labeled sections. */
export const Grouped: Story = {
  args: { "aria-label": "Choose a food", defaultValue: "apple" },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOptGroup label="Fruit">
        <NativeSelectOption value="apple">Apple</NativeSelectOption>
        <NativeSelectOption value="banana">Banana</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Vegetable">
        <NativeSelectOption value="carrot">Carrot</NativeSelectOption>
        <NativeSelectOption value="potato">Potato</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};

/** An invalid select rendered via `aria-invalid`, switching the border and ring to the destructive color. */
export const Invalid: Story = {
  args: { "aria-label": "Choose a fruit", "aria-invalid": true, defaultValue: "" },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOption value="" disabled>
        Select a fruit…
      </NativeSelectOption>
      <NativeSelectOption value="apple">Apple</NativeSelectOption>
      <NativeSelectOption value="banana">Banana</NativeSelectOption>
    </NativeSelect>
  ),
};

/** Disabled selects are dimmed, do not accept input, and do not fire `onChange`. */
export const Disabled: Story = {
  args: { "aria-label": "Choose a fruit", disabled: true, defaultValue: "apple" },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOption value="apple">Apple</NativeSelectOption>
      <NativeSelectOption value="banana">Banana</NativeSelectOption>
    </NativeSelect>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("combobox", { name: "Choose a fruit" });
    expect(select).toBeDisabled();
    return Promise.resolve();
  },
};

/** A multi-select list box rendered with `multiple`, allowing more than one option to be chosen. */
export const Multiple: Story = {
  args: { "aria-label": "Choose toppings", multiple: true },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOption value="cheese">Cheese</NativeSelectOption>
      <NativeSelectOption value="pepperoni">Pepperoni</NativeSelectOption>
      <NativeSelectOption value="mushroom">Mushroom</NativeSelectOption>
      <NativeSelectOption value="onion">Onion</NativeSelectOption>
    </NativeSelect>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("listbox", { name: "Choose toppings" });
    expect(select).toBeVisible();
    return userEvent.selectOptions(select, ["cheese", "onion"]).then(() => {
      expect(canvas.getByRole("option", { name: "Cheese" })).toBeEnabled();
      expect(select).toHaveValue(["cheese", "onion"]);
    });
  },
};

/** A realistic complete composition: a labeled select with grouped options inside a form layout. */
export const CompleteForm: Story = {
  render: () => (
    <form className="flex w-full max-w-xs flex-col gap-2">
      <label htmlFor="timezone-select" className="font-medium text-sm">
        Timezone
      </label>
      <NativeSelect id="timezone-select" name="timezone" defaultValue="utc">
        <NativeSelectOptGroup label="Americas">
          <NativeSelectOption value="los_angeles">Los Angeles</NativeSelectOption>
          <NativeSelectOption value="new_york">New York</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Europe">
          <NativeSelectOption value="utc">UTC</NativeSelectOption>
          <NativeSelectOption value="london">London</NativeSelectOption>
          <NativeSelectOption value="berlin">Berlin</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
      <p className="text-muted-foreground text-xs">Used to display times across the app.</p>
    </form>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByLabelText("Timezone");
    expect(select).toBeVisible();
    expect(select).toHaveValue("utc");
    return userEvent.selectOptions(select, "berlin").then(() => {
      expect(select).toHaveValue("berlin");
    });
  },
};

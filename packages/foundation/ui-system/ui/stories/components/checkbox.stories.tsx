import { Checkbox } from "@beep/ui/components/checkbox";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Checkbox` is an accessible boolean (or tri-state) control built on Base UI's checkbox
 * primitive with the project's design tokens. It supports controlled (`checked`) and
 * uncontrolled (`defaultChecked`) usage, an `indeterminate` mixed state, plus the standard
 * form props (`disabled`, `readOnly`, `required`, `name`, `value`).
 *
 * Imported from `@beep/ui/components/checkbox`.
 */
const meta = {
  title: "Components/Forms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "Controlled ticked state. Pair with `onCheckedChange` to manage state.",
    },
    defaultChecked: {
      control: "boolean",
      description: "Initial ticked state for an uncontrolled checkbox.",
      table: { defaultValue: { summary: "false" } },
    },
    indeterminate: {
      control: "boolean",
      description: "Renders the mixed state: neither ticked nor unticked.",
      table: { defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction and dims the checkbox.",
      table: { defaultValue: { summary: "false" } },
    },
    readOnly: {
      control: "boolean",
      description: "Prevents the user from ticking or unticking while staying focusable.",
      table: { defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marks the checkbox as required before submitting its form.",
      table: { defaultValue: { summary: "false" } },
    },
    name: {
      control: "text",
      description: "Identifies the field when the surrounding form is submitted.",
    },
  },
  args: {
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default unchecked checkbox. Clicking ticks it and fires `onCheckedChange` with `true`. */
export const Default: Story = {
  args: { "aria-label": "Accept terms" },
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox).not.toBeChecked();
    return userEvent.click(checkbox).then(() => {
      expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
      expect(checkbox).toBeChecked();
    });
  },
};

/** Starts ticked via the uncontrolled `defaultChecked` prop. */
export const Checked: Story = {
  args: { "aria-label": "Subscribe to updates", defaultChecked: true },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Subscribe to updates" });
    expect(checkbox).toBeChecked();
    return Promise.resolve();
  },
};

/** The mixed state, typically used for a parent that controls a partially-selected group. */
export const Indeterminate: Story = {
  args: { "aria-label": "Select all", indeterminate: true },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Select all" });
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    return Promise.resolve();
  },
};

/** A disabled, unchecked checkbox does not respond to clicks and is dimmed. */
export const Disabled: Story = {
  args: { "aria-label": "Disabled option", disabled: true },
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Disabled option" });
    expect(checkbox).toHaveAttribute("data-disabled");
    return userEvent.click(checkbox).then(() => {
      expect(args.onCheckedChange).not.toHaveBeenCalled();
    });
  },
};

/** A disabled checkbox that is also ticked, communicating a locked-on selection. */
export const DisabledChecked: Story = {
  args: { "aria-label": "Locked option", disabled: true, defaultChecked: true },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Locked option" });
    expect(checkbox).toHaveAttribute("data-disabled");
    expect(checkbox).toBeChecked();
    return Promise.resolve();
  },
};

/** Read-only checkboxes stay focusable but ignore ticking attempts. */
export const ReadOnly: Story = {
  args: { "aria-label": "Read only option", readOnly: true, defaultChecked: true },
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Read only option" });
    expect(checkbox).toBeChecked();
    return userEvent.click(checkbox).then(() => {
      expect(args.onCheckedChange).not.toHaveBeenCalled();
      expect(checkbox).toBeChecked();
    });
  },
};

/** Paired with a visible label so the whole row toggles the checkbox. */
export const WithLabel: Story = {
  args: { id: "newsletter", "aria-label": "Email me about new releases" },
  render: (args) => (
    <label className="flex items-center gap-2 text-sm" htmlFor="newsletter">
      <Checkbox {...args} />
      Email me about new releases
    </label>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    return userEvent.click(checkbox).then(() => {
      expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
      expect(checkbox).toBeChecked();
    });
  },
};

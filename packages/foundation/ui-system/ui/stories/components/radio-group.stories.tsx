import { RadioGroup, RadioGroupItem } from "@beep/ui/components/radio-group";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `RadioGroup` is an accessible single-select control built on Base UI's radio-group
 * primitive. Compose it with one `RadioGroupItem` per option, each carrying a unique
 * `value`. The group manages selection via controlled (`value`) or uncontrolled
 * (`defaultValue`) usage and exposes the standard form props (`disabled`, `readOnly`,
 * `required`, `name`). Pair each item with a `<label>` for an accessible name.
 *
 * Imported from `@beep/ui/components/radio-group`.
 */
const meta = {
  title: "Components/Forms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "text",
      description: "Controlled value of the selected item. Pair with `onValueChange`.",
    },
    defaultValue: {
      control: "text",
      description: "Initially selected value for an uncontrolled group.",
    },
    disabled: {
      control: "boolean",
      description: "Disables every item in the group and dims them.",
      table: { defaultValue: { summary: "false" } },
    },
    readOnly: {
      control: "boolean",
      description: "Prevents changing the selection while items stay focusable.",
      table: { defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marks the group as required before submitting its form.",
      table: { defaultValue: { summary: "false" } },
    },
    name: {
      control: "text",
      description: "Identifies the field when the surrounding form is submitted.",
    },
  },
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default uncontrolled group with a pre-selected option. Selecting another item
 * fires `onValueChange` with the new value.
 */
export const Default: Story = {
  args: { defaultValue: "comfortable" },
  render: (args) => (
    <RadioGroup {...args}>
      <label className="flex items-center gap-3 text-sm" htmlFor="density-default">
        <RadioGroupItem id="density-default" value="default" />
        Default
      </label>
      <label className="flex items-center gap-3 text-sm" htmlFor="density-comfortable">
        <RadioGroupItem id="density-comfortable" value="comfortable" />
        Comfortable
      </label>
      <label className="flex items-center gap-3 text-sm" htmlFor="density-compact">
        <RadioGroupItem id="density-compact" value="compact" />
        Compact
      </label>
    </RadioGroup>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const comfortable = canvas.getByRole("radio", { name: "Comfortable" });
    const compact = canvas.getByRole("radio", { name: "Compact" });
    expect(comfortable).toBeChecked();
    expect(compact).not.toBeChecked();
    return userEvent.click(compact).then(() => {
      expect(args.onValueChange).toHaveBeenCalledWith("compact", expect.anything());
      expect(compact).toBeChecked();
      expect(comfortable).not.toBeChecked();
    });
  },
};

/** A group with no initial selection. The first interaction selects an option. */
export const Unselected: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <label className="flex items-center gap-3 text-sm" htmlFor="plan-free">
        <RadioGroupItem id="plan-free" value="free" />
        Free
      </label>
      <label className="flex items-center gap-3 text-sm" htmlFor="plan-pro">
        <RadioGroupItem id="plan-pro" value="pro" />
        Pro
      </label>
    </RadioGroup>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const free = canvas.getByRole("radio", { name: "Free" });
    const pro = canvas.getByRole("radio", { name: "Pro" });
    expect(free).not.toBeChecked();
    expect(pro).not.toBeChecked();
    return userEvent.click(pro).then(() => {
      expect(args.onValueChange).toHaveBeenCalledWith("pro", expect.anything());
      expect(pro).toBeChecked();
    });
  },
};

/** Every item is disabled. Clicks are ignored and `onValueChange` never fires. */
export const Disabled: Story = {
  args: { defaultValue: "pro", disabled: true },
  render: (args) => (
    <RadioGroup {...args}>
      <label className="flex items-center gap-3 text-sm" htmlFor="disabled-free">
        <RadioGroupItem id="disabled-free" value="free" />
        Free
      </label>
      <label className="flex items-center gap-3 text-sm" htmlFor="disabled-pro">
        <RadioGroupItem id="disabled-pro" value="pro" />
        Pro
      </label>
    </RadioGroup>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const free = canvas.getByRole("radio", { name: "Free" });
    const pro = canvas.getByRole("radio", { name: "Pro" });
    expect(pro).toBeChecked();
    expect(free).toHaveAttribute("aria-disabled", "true");
    return userEvent.click(free).then(() => {
      expect(args.onValueChange).not.toHaveBeenCalled();
      expect(free).not.toBeChecked();
    });
  },
};

/** A single item can be disabled while the rest of the group stays interactive. */
export const DisabledItem: Story = {
  args: { defaultValue: "monthly" },
  render: (args) => (
    <RadioGroup {...args}>
      <label className="flex items-center gap-3 text-sm" htmlFor="billing-monthly">
        <RadioGroupItem id="billing-monthly" value="monthly" />
        Monthly
      </label>
      <label className="flex items-center gap-3 text-sm" htmlFor="billing-yearly">
        <RadioGroupItem id="billing-yearly" value="yearly" disabled />
        Yearly (coming soon)
      </label>
    </RadioGroup>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const yearly = canvas.getByRole("radio", { name: "Yearly (coming soon)" });
    expect(yearly).toHaveAttribute("aria-disabled", "true");
    return userEvent.click(yearly).then(() => {
      expect(args.onValueChange).not.toHaveBeenCalled();
      expect(yearly).not.toBeChecked();
    });
  },
};

/** Read-only groups stay focusable but ignore selection changes. */
export const ReadOnly: Story = {
  args: { defaultValue: "card", readOnly: true },
  render: (args) => (
    <RadioGroup {...args}>
      <label className="flex items-center gap-3 text-sm" htmlFor="pay-card">
        <RadioGroupItem id="pay-card" value="card" />
        Credit card
      </label>
      <label className="flex items-center gap-3 text-sm" htmlFor="pay-invoice">
        <RadioGroupItem id="pay-invoice" value="invoice" />
        Invoice
      </label>
    </RadioGroup>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("radio", { name: "Credit card" });
    const invoice = canvas.getByRole("radio", { name: "Invoice" });
    expect(card).toBeChecked();
    return userEvent.click(invoice).then(() => {
      expect(args.onValueChange).not.toHaveBeenCalled();
      expect(card).toBeChecked();
      expect(invoice).not.toBeChecked();
    });
  },
};

/**
 * A realistic form group with a description per option, demonstrating richer item
 * composition. Selecting an option fires `onValueChange` with its value.
 */
export const WithDescriptions: Story = {
  args: { defaultValue: "standard", name: "shipping" },
  render: (args) => (
    <RadioGroup {...args}>
      <label className="flex items-start gap-3 text-sm" htmlFor="ship-standard">
        <RadioGroupItem id="ship-standard" value="standard" className="mt-0.5" />
        <span className="grid gap-0.5">
          <span className="font-medium">Standard</span>
          <span className="text-muted-foreground">Arrives in 5-7 business days.</span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm" htmlFor="ship-express">
        <RadioGroupItem id="ship-express" value="express" className="mt-0.5" />
        <span className="grid gap-0.5">
          <span className="font-medium">Express</span>
          <span className="text-muted-foreground">Arrives in 1-2 business days.</span>
        </span>
      </label>
    </RadioGroup>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const standard = canvas.getByRole("radio", { name: /Standard/ });
    const express = canvas.getByRole("radio", { name: /Express/ });
    expect(standard).toBeChecked();
    return userEvent.click(express).then(() => {
      expect(args.onValueChange).toHaveBeenCalledWith("express", expect.anything());
      expect(express).toBeChecked();
    });
  },
};

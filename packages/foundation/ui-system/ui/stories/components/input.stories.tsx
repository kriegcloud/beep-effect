import { Input } from "@beep/ui/components/input";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Input` is the styled text-entry primitive, built on Base UI's accessible input.
 * It forwards every native `<input>` prop, so `type`, `placeholder`, `value`,
 * `disabled`, and validation attributes such as `aria-invalid` all work as expected.
 * Styling adapts automatically to focus, disabled, and invalid states.
 *
 * Imported from `@beep/ui/components/input`.
 */
const meta = {
  title: "Components/Forms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url", "file"],
      description: "Native HTML input type controlling validation and on-screen keyboard.",
      table: { defaultValue: { summary: "text" } },
    },
    placeholder: {
      control: "text",
      description: "Hint text shown when the field is empty.",
    },
    value: {
      control: "text",
      description: "Controlled value of the field.",
    },
    defaultValue: {
      control: "text",
      description: "Initial value for an uncontrolled field.",
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction and dims the field.",
    },
    readOnly: {
      control: "boolean",
      description: "Renders the value but prevents edits.",
    },
    required: {
      control: "boolean",
      description: "Marks the field as required for native form validation.",
    },
    "aria-invalid": {
      control: "boolean",
      description: "Signals an invalid value and applies destructive styling.",
    },
  },
  args: {
    type: "text",
    placeholder: "Type here…",
    disabled: false,
    onChange: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default single-line text field. Typing fires `onChange` for each keystroke. */
export const Default: Story = {
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    expect(input).toBeVisible();
    expect(input).toBeEnabled();
    return userEvent.type(input, "hello").then(() => {
      expect(args.onChange).toHaveBeenCalled();
      expect(input).toHaveValue("hello");
    });
  },
};

/** Email field that surfaces the email keyboard and native email validation. */
export const Email: Story = {
  args: { type: "email", placeholder: "you@example.com" },
};

/** Password field that masks the entered characters. */
export const Password: Story = {
  args: { type: "password", placeholder: "Enter a password" },
};

/** Numeric field with stepper affordances on supporting browsers. */
export const Number: Story = {
  args: { type: "number", placeholder: "0" },
};

/** Search field, typically paired with a search affordance. */
export const Search: Story = {
  args: { type: "search", placeholder: "Search…" },
};

/** File picker variant rendered with the styled file button. */
export const File: Story = {
  args: { type: "file" },
};

/** Pre-populated uncontrolled field via `defaultValue`. */
export const WithValue: Story = {
  args: { defaultValue: "Ada Lovelace" },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    expect(input).toHaveValue("Ada Lovelace");
    return Promise.resolve();
  },
};

/** Read-only field shows its value but rejects edits. */
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: "Cannot edit me" },
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    expect(input).toHaveAttribute("readonly");
    return userEvent.type(input, "x").then(() => {
      expect(input).toHaveValue("Cannot edit me");
      expect(args.onChange).not.toHaveBeenCalled();
    });
  },
};

/** Invalid state driven by `aria-invalid`, applying destructive focus styling. */
export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "not-an-email" },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    return Promise.resolve();
  },
};

/** Disabled fields are dimmed and reject input. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Disabled" },
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    expect(input).toBeDisabled();
    return userEvent.type(input, "x").then(() => {
      expect(args.onChange).not.toHaveBeenCalled();
    });
  },
};

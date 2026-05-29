import { Textarea } from "@beep/ui/components/textarea";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Textarea` is a multi-line text input styled to match the rest of the form
 * primitives. It forwards every native `<textarea>` prop (`placeholder`, `rows`,
 * `disabled`, `value`, change handlers, and so on) and renders with
 * `field-sizing-content`, so it grows with its content. Use `aria-invalid` to
 * surface validation errors with the destructive ring treatment.
 *
 * Imported from `@beep/ui/components/textarea`.
 */
const meta = {
  title: "Components/Forms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text shown when the field is empty.",
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction and dims the field.",
    },
    rows: {
      control: "number",
      description: "Number of visible text rows used as the initial height.",
    },
    defaultValue: {
      control: "text",
      description: "Uncontrolled initial value of the field.",
    },
    "aria-invalid": {
      control: "boolean",
      description: "Marks the field invalid and applies the destructive ring.",
    },
  },
  args: {
    placeholder: "Type your message here.",
    disabled: false,
    onChange: fn(),
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default empty textarea. Typing fires `onChange` and reflects the value. */
export const Default: Story = {
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toBeVisible();
    return userEvent.type(textarea, "Hello").then(() => {
      expect(args.onChange).toHaveBeenCalled();
      expect(textarea).toHaveValue("Hello");
    });
  },
};

/** Shows the placeholder treatment when no value is present. */
export const WithPlaceholder: Story = {
  args: { placeholder: "Add a detailed description..." },
};

/** Pre-populated with an uncontrolled `defaultValue`. */
export const WithValue: Story = {
  args: {
    defaultValue: "The quick brown fox jumps over the lazy dog.",
  },
};

/** A taller field via `rows`, useful for long-form input. */
export const Tall: Story = {
  args: { rows: 8, placeholder: "Write a longer note..." },
};

/** Invalid state via `aria-invalid`, applying the destructive ring. */
export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    defaultValue: "This value failed validation.",
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    return Promise.resolve();
  },
};

/** Disabled textareas are dimmed and reject input. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "You cannot edit this." },
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toBeDisabled();
    return userEvent.type(textarea, "ignored").then(() => {
      expect(args.onChange).not.toHaveBeenCalled();
    });
  },
};

import { Toggle } from "@beep/ui/components/toggle";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Toggle` is a two-state button (on/off) built on Base UI's accessible toggle primitive with
 * variant and size styling from `class-variance-authority`. It exposes `aria-pressed` semantics,
 * supports controlled (`pressed`) and uncontrolled (`defaultPressed`) usage, and emits
 * `onPressedChange` when toggled.
 *
 * Imported from `@beep/ui/components/toggle`.
 */
const meta = {
  title: "Components/Forms/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
      description: "Visual treatment of the toggle.",
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
      description: "Control height and horizontal padding.",
      table: { defaultValue: { summary: "default" } },
    },
    pressed: {
      control: "boolean",
      description: "Controlled pressed state. Pair with `onPressedChange` to manage state externally.",
    },
    defaultPressed: {
      control: "boolean",
      description: "Initial pressed state for uncontrolled usage.",
      table: { defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction and dims the toggle.",
      table: { defaultValue: { summary: "false" } },
    },
    children: {
      control: "text",
      description: "Toggle label or content.",
    },
  },
  args: {
    children: "Toggle",
    variant: "default",
    size: "default",
    onPressedChange: fn(),
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default toggle starts unpressed. Clicking it presses it and fires `onPressedChange` once. */
export const Default: Story = {
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Toggle" });
    expect(toggle).toBeVisible();
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    return userEvent.click(toggle).then(() => {
      expect(args.onPressedChange).toHaveBeenCalledOnce();
      expect(toggle).toHaveAttribute("aria-pressed", "true");
    });
  },
};

/** Bordered toggle that reads as a discrete control even when unpressed. */
export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
};

/** Uncontrolled toggle that renders already pressed via `defaultPressed`. */
export const Pressed: Story = {
  args: { defaultPressed: true },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Toggle" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    return userEvent.click(toggle).then(() => {
      expect(toggle).toHaveAttribute("aria-pressed", "false");
    });
  },
};

/** The compact `sm` size for dense toolbars. */
export const Small: Story = {
  args: { children: "Small", size: "sm" },
};

/** The large size for prominent inline controls. */
export const Large: Story = {
  args: { children: "Large", size: "lg" },
};

/** Icon-only toggle; always provide an accessible name via `aria-label`. */
export const Icon: Story = {
  args: { variant: "outline", "aria-label": "Bold", children: "B" },
};

/** Disabled toggles are dimmed and never fire `onPressedChange`. */
export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Disabled" });
    expect(toggle.matches(":disabled, [aria-disabled='true'], [data-disabled]")).toBe(true);
    return Promise.resolve();
  },
};

/** Disabled while already pressed, showing the pressed-but-locked appearance. */
export const DisabledPressed: Story = {
  args: { children: "Locked", disabled: true, defaultPressed: true },
};

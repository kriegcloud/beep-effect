import { Button } from "@beep/ui/components/button";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Button` is the primary action primitive, built on Base UI's accessible button with
 * variant and size styling from `class-variance-authority`. Use `variant` to convey
 * emphasis and `size` to fit the surrounding density (including icon-only sizes).
 *
 * Imported from `@beep/ui/components/button`.
 */
const meta = {
  title: "Components/Forms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
      description: "Visual emphasis of the button.",
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
      description: "Control height and icon sizing.",
      table: { defaultValue: { summary: "default" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction and dims the button.",
    },
    children: {
      control: "text",
      description: "Button label or content.",
    },
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default solid button used for primary actions. Clicking fires `onClick` once. */
export const Default: Story = {
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });
    expect(button).toBeVisible();
    return userEvent.click(button).then(() => {
      expect(args.onClick).toHaveBeenCalledOnce();
    });
  },
};

/** Low-emphasis bordered button for secondary actions. */
export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
};

/** Filled neutral button for secondary actions that still need presence. */
export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
};

/** Minimal button with no background until hovered. */
export const Ghost: Story = {
  args: { children: "Ghost", variant: "ghost" },
};

/** Signals a destructive or irreversible action. */
export const Destructive: Story = {
  args: { children: "Delete", variant: "destructive" },
};

/** Renders as an inline text link while keeping button semantics. */
export const Link: Story = {
  args: { children: "Link", variant: "link" },
};

/** The small size, useful in dense toolbars. */
export const Small: Story = {
  args: { children: "Small", size: "sm" },
};

/** The large size for prominent calls to action. */
export const Large: Story = {
  args: { children: "Large", size: "lg" },
};

/** Icon-only button; always provide an accessible name via `aria-label`. */
export const Icon: Story = {
  args: { variant: "outline", size: "icon", "aria-label": "Settings", children: "@" },
};

/** Disabled buttons are dimmed and do not fire `onClick`. */
export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Disabled" });
    expect(button.matches(":disabled, [aria-disabled='true'], [data-disabled]")).toBe(true);
    return Promise.resolve();
  },
};

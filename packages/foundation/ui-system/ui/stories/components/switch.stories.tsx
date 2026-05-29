import { Switch } from "@beep/ui/components/switch";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Switch` is an accessible on/off toggle built on Base UI's switch primitive. It exposes the
 * `role="switch"` semantics, supports controlled (`checked`) and uncontrolled (`defaultChecked`)
 * usage, and emits `onCheckedChange` when toggled. Use `size` to fit the surrounding density.
 *
 * Imported from `@beep/ui/components/switch`.
 */
const meta = {
  title: "Components/Forms/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "Control the physical dimensions of the switch.",
      table: { defaultValue: { summary: "default" } },
    },
    checked: {
      control: "boolean",
      description: "Controlled on/off state. Pair with `onCheckedChange` to manage state externally.",
    },
    defaultChecked: {
      control: "boolean",
      description: "Initial on/off state for uncontrolled usage.",
      table: { defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction and dims the switch.",
      table: { defaultValue: { summary: "false" } },
    },
    readOnly: {
      control: "boolean",
      description: "Prevents the user from changing the state while keeping it focusable.",
      table: { defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marks the switch as required when submitted inside a form.",
      table: { defaultValue: { summary: "false" } },
    },
    name: {
      control: "text",
      description: "Identifies the field when a form is submitted.",
    },
  },
  args: {
    size: "default",
    "aria-label": "Toggle setting",
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default switch starts off. Clicking it turns it on and fires `onCheckedChange` once. */
export const Default: Story = {
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Toggle setting" });
    expect(toggle).toBeVisible();
    expect(toggle).not.toBeChecked();
    return userEvent.click(toggle).then(() => {
      expect(args.onCheckedChange).toHaveBeenCalledOnce();
      expect(toggle).toBeChecked();
    });
  },
};

/** Uncontrolled switch that renders already turned on via `defaultChecked`. */
export const Checked: Story = {
  args: { defaultChecked: true },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Toggle setting" });
    expect(toggle).toBeChecked();
    return userEvent.click(toggle).then(() => {
      expect(toggle).not.toBeChecked();
    });
  },
};

/** The compact `sm` size for dense rows and inline settings. */
export const Small: Story = {
  args: { size: "sm" },
};

/** Disabled switches are dimmed and never fire `onCheckedChange`. */
export const Disabled: Story = {
  args: { disabled: true },
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Toggle setting" });
    expect(toggle).toHaveAttribute("data-disabled");
    return userEvent.click(toggle).then(() => {
      expect(args.onCheckedChange).not.toHaveBeenCalled();
    });
  },
};

/** Disabled while already on, showing the checked-but-locked appearance. */
export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

/** Read-only switch stays focusable but ignores toggle attempts. */
export const ReadOnly: Story = {
  args: { readOnly: true, defaultChecked: true },
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Toggle setting" });
    expect(toggle).toBeChecked();
    return userEvent.click(toggle).then(() => {
      expect(args.onCheckedChange).not.toHaveBeenCalled();
      expect(toggle).toBeChecked();
    });
  },
};

/** Switch paired with a label inside a realistic form row. */
export const WithLabel: Story = {
  args: { name: "notifications", "aria-label": undefined },
  render: (args) => (
    <label className="flex items-center gap-2 text-sm" htmlFor="notifications-switch">
      <Switch id="notifications-switch" {...args} />
      Enable notifications
    </label>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Enable notifications" });
    expect(toggle).toBeVisible();
    return userEvent.click(toggle).then(() => {
      expect(args.onCheckedChange).toHaveBeenCalledOnce();
    });
  },
};

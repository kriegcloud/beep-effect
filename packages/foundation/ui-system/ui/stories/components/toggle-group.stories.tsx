import { ToggleGroup, ToggleGroupItem } from "@beep/ui/components/toggle-group";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `ToggleGroup` is an accessible set of toggle buttons that share state, built on Base UI's
 * toggle-group primitive with `variant`, `size`, and `spacing` styling from
 * `class-variance-authority`. Compose it with one `ToggleGroupItem` per option, each carrying a
 * unique `value`. By default only one item can be pressed at a time; set `multiple` to allow
 * several. The group manages its pressed values via controlled (`value`) or uncontrolled
 * (`defaultValue`) usage and emits `onValueChange` with the array of pressed values.
 *
 * Imported from `@beep/ui/components/toggle-group`.
 */
const meta = {
  title: "Components/Forms/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
      description: "Visual treatment shared by every item in the group.",
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
      description: "Control height and padding shared by every item.",
      table: { defaultValue: { summary: "default" } },
    },
    multiple: {
      control: "boolean",
      description: "When true, multiple items can be pressed at once; otherwise only one.",
      table: { defaultValue: { summary: "false" } },
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Layout direction of the items and the arrow-key navigation axis.",
      table: { defaultValue: { summary: "horizontal" } },
    },
    spacing: {
      control: "number",
      description: "Gap between items. Zero joins them into a single segmented control.",
      table: { defaultValue: { summary: "0" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables every item in the group and dims them.",
      table: { defaultValue: { summary: "false" } },
    },
  },
  args: {
    variant: "default",
    size: "default",
    onValueChange: fn(),
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default single-select group with one item pre-pressed. Pressing another item moves the
 * selection and fires `onValueChange` with the new value array.
 */
export const Default: Story = {
  args: { defaultValue: ["bold"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        U
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(italic).toHaveAttribute("aria-pressed", "false");
    return userEvent.click(italic).then(() => {
      expect(args.onValueChange).toHaveBeenCalledWith(["italic"], expect.anything());
      expect(italic).toHaveAttribute("aria-pressed", "true");
      expect(bold).toHaveAttribute("aria-pressed", "false");
    });
  },
};

/** Bordered items that read as discrete controls even when unpressed. */
export const Outline: Story = {
  args: { variant: "outline", defaultValue: ["italic"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        U
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/**
 * With `multiple`, several items can be pressed at once. Pressing an unpressed item adds it to the
 * value array without clearing the others.
 */
export const Multiple: Story = {
  args: { multiple: true, defaultValue: ["bold", "underline"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        U
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });
    const underline = canvas.getByRole("button", { name: "Underline" });
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(underline).toHaveAttribute("aria-pressed", "true");
    expect(italic).toHaveAttribute("aria-pressed", "false");
    return userEvent.click(italic).then(() => {
      expect(args.onValueChange).toHaveBeenCalledWith(["bold", "underline", "italic"], expect.anything());
      expect(italic).toHaveAttribute("aria-pressed", "true");
      expect(bold).toHaveAttribute("aria-pressed", "true");
    });
  },
};

/** The compact `sm` size for dense toolbars. */
export const Small: Story = {
  args: { size: "sm", variant: "outline", defaultValue: ["left"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="left" aria-label="Align left">
        L
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        C
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        R
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** The large size for prominent inline controls. */
export const Large: Story = {
  args: { size: "lg", variant: "outline", defaultValue: ["center"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="left" aria-label="Align left">
        L
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        C
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        R
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** Adding `spacing` separates the items into individually rounded buttons. */
export const Spaced: Story = {
  args: { variant: "outline", spacing: 2, defaultValue: ["italic"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        U
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** A vertical group stacks the items and navigates with up/down arrow keys. */
export const Vertical: Story = {
  args: { variant: "outline", orientation: "vertical", defaultValue: ["bold"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        U
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** Every item is disabled. Clicks are ignored and `onValueChange` never fires. */
export const Disabled: Story = {
  args: { variant: "outline", disabled: true, defaultValue: ["bold"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        U
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const italic = canvas.getByRole("button", { name: "Italic" });
    expect(italic).toBeDisabled();
    return userEvent.click(italic, { pointerEventsCheck: 0 }).then(() => {
      expect(args.onValueChange).not.toHaveBeenCalled();
      expect(italic).toHaveAttribute("aria-pressed", "false");
    });
  },
};

/** A single item can be disabled while the rest of the group stays interactive. */
export const DisabledItem: Story = {
  args: { variant: "outline", defaultValue: ["bold"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic" disabled>
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        U
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const italic = canvas.getByRole("button", { name: "Italic" });
    const underline = canvas.getByRole("button", { name: "Underline" });
    expect(italic).toBeDisabled();
    return userEvent.click(underline).then(() => {
      expect(args.onValueChange).toHaveBeenCalledWith(["underline"], expect.anything());
      expect(underline).toHaveAttribute("aria-pressed", "true");
    });
  },
};

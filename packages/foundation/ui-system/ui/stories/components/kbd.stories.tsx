import { Kbd, KbdGroup } from "@beep/ui/components/kbd";
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Kbd` renders a single keyboard key as a styled, non-interactive `<kbd>` element,
 * ideal for documenting shortcuts inline. `KbdGroup` composes multiple keys (and plain
 * separators like `+`) into a single chord. Both are presentational only.
 *
 * Imported from `@beep/ui/components/kbd`.
 */
const meta = {
  title: "Components/Data Display/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Key label or symbol rendered inside the key cap.",
    },
    className: {
      control: "text",
      description: "Additional Tailwind classes merged onto the key cap.",
    },
  },
  args: {
    children: "Esc",
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single key cap. The element is non-interactive and visible on screen. */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const key = canvas.getByText("Esc");
    expect(key).toBeVisible();
  },
};

/** A single modifier symbol used to denote command keys. */
export const Symbol: Story = {
  args: { children: "⌘" },
};

/** A longer word-style key such as the enter key. */
export const Word: Story = {
  args: { children: "Enter" },
};

/** A row of modifier keys composed with `KbdGroup`. */
export const ModifierGroup: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>⌥</Kbd>
      <Kbd>⌃</Kbd>
    </KbdGroup>
  ),
};

/** A chord combining keys with a plain `+` separator between them. */
export const Chord: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <span>+</span>
      <Kbd>B</Kbd>
    </KbdGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Ctrl")).toBeVisible();
    expect(canvas.getByText("B")).toBeVisible();
  },
};

/** Keys flow naturally within prose to document a shortcut inline. */
export const InlineWithText: Story = {
  render: () => (
    <p className="text-sm text-muted-foreground">
      Press{" "}
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>{" "}
      to open the command palette.
    </p>
  ),
};

/** A realistic shortcut legend pairing several chords with their actions. */
export const ShortcutLegend: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between gap-8">
        <span className="text-muted-foreground">Save</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-8">
        <span className="text-muted-foreground">Undo</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>Z</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-8">
        <span className="text-muted-foreground">Redo</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>Z</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
};

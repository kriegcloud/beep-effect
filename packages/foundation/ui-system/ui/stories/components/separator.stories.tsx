import { Separator } from "@beep/ui/components/separator";
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Separator` is a thin divider for visually and semantically splitting content,
 * built on Base UI's accessible separator (it exposes the `separator` role to
 * assistive tech). Use `orientation` to switch between a full-width horizontal
 * rule and a self-stretching vertical rule, and `className` to tune spacing.
 *
 * Imported from `@beep/ui/components/separator`.
 */
const meta = {
  title: "Components/Layout/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Direction of the divider; horizontal spans the full width, vertical stretches to the row height.",
      table: { defaultValue: { summary: "horizontal" } },
    },
    className: {
      control: "text",
      description: "Additional utility classes, typically used to adjust margin around the divider.",
    },
  },
  args: {
    orientation: "horizontal",
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default horizontal divider rendered between two stacked blocks of content. */
export const Default: Story = {
  render: (args) => (
    <div className="w-72 text-sm">
      <p className="text-foreground font-medium">Effect-first UI</p>
      <p className="text-muted-foreground">Composable components for the platform.</p>
      <Separator {...args} className="my-4" />
      <p className="text-muted-foreground">Built on Base UI primitives.</p>
    </div>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole("separator");
    expect(separator).toBeVisible();
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    return Promise.resolve();
  },
};

/** A vertical divider separating inline items in a row; it stretches to the row height. */
export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-6 items-center gap-3 text-sm">
      <span>Docs</span>
      <Separator {...args} />
      <span>API</span>
      <Separator {...args} />
      <span>Guides</span>
    </div>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separators = canvas.getAllByRole("separator");
    expect(separators.length).toBe(2);
    expect(separators[0]).toHaveAttribute("data-orientation", "vertical");
    return Promise.resolve();
  },
};

/** Demonstrates custom spacing via `className` to widen the gap around the divider. */
export const CustomSpacing: Story = {
  args: { className: "my-8" },
  render: (args) => (
    <div className="w-72 text-sm">
      <p className="text-muted-foreground">Above the divider.</p>
      <Separator {...args} />
      <p className="text-muted-foreground">Below the divider, with generous spacing.</p>
    </div>
  ),
};

/** A section header pattern: a label followed by a horizontal rule to introduce a group. */
export const SectionHeading: Story = {
  render: (args) => (
    <div className="w-72 space-y-2 text-sm">
      <h3 className="text-foreground font-semibold">Account</h3>
      <Separator {...args} />
      <ul className="text-muted-foreground space-y-1">
        <li>Profile</li>
        <li>Billing</li>
        <li>Notifications</li>
      </ul>
    </div>
  ),
};

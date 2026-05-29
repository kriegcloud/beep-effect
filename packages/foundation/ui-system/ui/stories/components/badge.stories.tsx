import { Badge } from "@beep/ui/components/badge";
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Badge` is a compact label primitive for statuses, counts, and metadata, built on Base UI's
 * `useRender` with variant styling from `class-variance-authority`. Use `variant` to convey
 * emphasis or intent, and the `render` prop to swap the underlying element (for example an
 * anchor) while keeping the badge styling.
 *
 * Imported from `@beep/ui/components/badge`.
 */
const meta = {
  title: "Components/Feedback/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
      description: "Visual emphasis and intent of the badge.",
      table: { defaultValue: { summary: "default" } },
    },
    children: {
      control: "text",
      description: "Badge label or content.",
    },
    render: {
      control: false,
      description: "Override the rendered element (defaults to a `span`), e.g. an anchor or button.",
    },
  },
  args: {
    children: "Badge",
    variant: "default",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default solid badge used to highlight primary status or counts. */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");
    expect(badge).toBeVisible();
    return Promise.resolve().then(() => {
      expect(badge).toHaveAttribute("data-slot", "badge");
    });
  },
};

/** Lower-emphasis neutral badge for supporting metadata. */
export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
};

/** Signals an error, warning, or destructive status. */
export const Destructive: Story = {
  args: { children: "Error", variant: "destructive" },
};

/** Bordered badge with a transparent background for subtle labelling. */
export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
};

/** Minimal badge with no background until hovered. */
export const Ghost: Story = {
  args: { children: "Ghost", variant: "ghost" },
};

/** Renders as an inline text link while keeping badge styling. */
export const Link: Story = {
  args: { children: "Link", variant: "link" },
};

/** A numeric count badge, useful for notification indicators. */
export const Count: Story = {
  args: { children: "12", variant: "destructive" },
};

/** Use the `render` prop to make the badge a real anchor while preserving styling. */
export const AsLink: Story = {
  args: {
    variant: "outline",
    render: <a href="https://example.com">Docs</a>,
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Docs" });
    expect(link).toBeVisible();
    return Promise.resolve().then(() => {
      expect(link).toHaveAttribute("href", "https://example.com");
    });
  },
};

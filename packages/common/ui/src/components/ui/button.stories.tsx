import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./button.js";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** @since 0.0.0 */
export const Default: Story = {
  args: { children: "Button" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toBeVisible();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

/** @since 0.0.0 */
export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
};

/** @since 0.0.0 */
export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
};

/** @since 0.0.0 */
export const Ghost: Story = {
  args: { children: "Ghost", variant: "ghost" },
};

/** @since 0.0.0 */
export const Destructive: Story = {
  args: { children: "Destructive", variant: "destructive" },
};

/** @since 0.0.0 */
export const Link: Story = {
  args: { children: "Link", variant: "link" },
};

/** @since 0.0.0 */
export const Small: Story = {
  args: { children: "Small", size: "sm" },
};

/** @since 0.0.0 */
export const Large: Story = {
  args: { children: "Large", size: "lg" },
};

/** @since 0.0.0 */
export const ClickInteraction: Story = {
  args: { children: "Click Me" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toHaveTextContent("Click Me");
    await userEvent.click(button);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

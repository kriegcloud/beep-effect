import { Banner } from "@beep/ui/components/banner";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Banner` is an inline feedback surface for surfacing contextual status messages.
 * It renders with `role="alert"` and a variant-driven icon, and composes optional
 * `Banner.Content`, `Banner.Title`, `Banner.Description`, and `Banner.Dismiss` parts.
 * Use `variant` to convey severity and `icon` to override the default leading icon.
 *
 * Imported from `@beep/ui/components/banner`.
 */
const meta = {
  title: "Components/Feedback/Banner",
  component: Banner,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "info", "success", "warning", "destructive", "loading"],
      description: "Severity styling and the default leading icon.",
      table: { defaultValue: { summary: "default" } },
    },
    children: {
      control: false,
      description: "Banner body, typically composed from the `Banner.*` parts.",
    },
  },
  args: {
    variant: "default",
    children: (
      <Banner.Content>
        <Banner.Title>Heads up</Banner.Title>
        <Banner.Description>Your workspace settings were updated.</Banner.Description>
      </Banner.Content>
    ),
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

const onDismiss = fn();

/** The default neutral banner with a title and description. */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const banner = canvas.getByRole("alert");
    expect(banner).toBeVisible();
    expect(canvas.getByText("Heads up")).toBeVisible();
    return Promise.resolve();
  },
};

/** Informational banner for low-severity context. */
export const Info: Story = {
  args: {
    variant: "info",
    children: (
      <Banner.Content>
        <Banner.Title>New feature</Banner.Title>
        <Banner.Description>Drafts now autosave every few seconds.</Banner.Description>
      </Banner.Content>
    ),
  },
};

/** Success banner confirming a completed action. */
export const Success: Story = {
  args: {
    variant: "success",
    children: (
      <Banner.Content>
        <Banner.Title>Saved</Banner.Title>
        <Banner.Description>Your changes have been published.</Banner.Description>
      </Banner.Content>
    ),
  },
};

/** Warning banner for situations that need attention. */
export const Warning: Story = {
  args: {
    variant: "warning",
    children: (
      <Banner.Content>
        <Banner.Title>Approaching limit</Banner.Title>
        <Banner.Description>You have used 90% of your monthly quota.</Banner.Description>
      </Banner.Content>
    ),
  },
};

/** Destructive banner for errors and irreversible problems. */
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: (
      <Banner.Content>
        <Banner.Title>Upload failed</Banner.Title>
        <Banner.Description>The file exceeds the maximum allowed size.</Banner.Description>
      </Banner.Content>
    ),
  },
};

/** Loading banner with an animated spinner for in-progress work. */
export const Loading: Story = {
  args: {
    variant: "loading",
    children: (
      <Banner.Content>
        <Banner.Title>Syncing</Banner.Title>
        <Banner.Description>We are importing your data, this may take a moment.</Banner.Description>
      </Banner.Content>
    ),
  },
};

/** A dismissible banner; clicking the dismiss button fires `onDismiss`. */
export const Dismissible: Story = {
  render: (args) => (
    <Banner {...args}>
      <Banner.Content>
        <Banner.Title>Limited time offer</Banner.Title>
        <Banner.Description>Upgrade today to unlock advanced reporting.</Banner.Description>
      </Banner.Content>
      <Banner.Dismiss onDismiss={onDismiss} />
    </Banner>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole("button", { name: "Dismiss" });
    expect(dismiss).toBeVisible();
    return userEvent.click(dismiss).then(() => {
      expect(onDismiss).toHaveBeenCalledOnce();
    });
  },
};

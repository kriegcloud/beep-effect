import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/ui/components/tabs";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Tabs` is a compound navigation primitive built on Base UI's accessible tabs. Compose
 * `Tabs` (the root) with `TabsList`, `TabsTrigger`, and `TabsContent` to switch between
 * panels. The root accepts `defaultValue`/`value` for selection and `orientation` to flow
 * horizontally or vertically; `TabsList` supports a `default` pill style or a `line`
 * underline style.
 *
 * Imported from `@beep/ui/components/tabs`.
 */
const meta = {
  title: "Components/Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "Value of the tab selected on mount when uncontrolled.",
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Layout flow direction of the tabs and panels.",
      table: { defaultValue: { summary: "horizontal" } },
    },
    value: {
      control: "text",
      description: "Value of the active tab when the component is controlled.",
    },
  },
  args: {
    defaultValue: "account",
    orientation: "horizontal",
    onValueChange: fn(),
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Manage the account settings for your workspace.</TabsContent>
      <TabsContent value="password">Change your password and review active sessions.</TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default horizontal tabs. Selecting the second tab activates its panel and fires
 * `onValueChange`.
 */
export const Default: Story = {
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const accountTab = canvas.getByRole("tab", { name: "Account" });
    const passwordTab = canvas.getByRole("tab", { name: "Password" });
    expect(accountTab).toBeVisible();
    expect(canvas.getByText("Manage the account settings for your workspace.")).toBeVisible();
    return userEvent.click(passwordTab).then(() => {
      expect(args.onValueChange).toHaveBeenCalled();
      expect(canvas.getByText("Change your password and review active sessions.")).toBeVisible();
    });
  },
};

/** Underline `line` variant of `TabsList` for a lighter, borderless treatment. */
export const LineVariant: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">A high-level summary of recent project health.</TabsContent>
      <TabsContent value="activity">Every event that touched this project lately.</TabsContent>
      <TabsContent value="settings">Configure how this project behaves.</TabsContent>
    </Tabs>
  ),
  args: { defaultValue: "overview" },
};

/** Vertical orientation stacks the tab list beside its panels. */
export const Vertical: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">Update your display name and avatar.</TabsContent>
      <TabsContent value="billing">Review invoices and update payment methods.</TabsContent>
      <TabsContent value="team">Invite teammates and manage roles.</TabsContent>
    </Tabs>
  ),
  args: { orientation: "vertical", defaultValue: "profile" },
};

/** A disabled trigger cannot be selected and never fires `onValueChange`. */
export const DisabledTab: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="advanced" disabled>
          Advanced
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general">Common options that most users need.</TabsContent>
      <TabsContent value="advanced">Power-user options behind a disabled tab.</TabsContent>
    </Tabs>
  ),
  args: { defaultValue: "general" },
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const advancedTab = canvas.getByRole("tab", { name: "Advanced" });
    expect(advancedTab).toHaveAttribute("data-disabled");
    return userEvent.click(advancedTab).then(() => {
      expect(args.onValueChange).not.toHaveBeenCalled();
      expect(canvas.getByText("Common options that most users need.")).toBeVisible();
    });
  },
};

/** A realistic multi-tab settings surface with several panels. */
export const ManyTabs: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Manage the account settings for your workspace.</TabsContent>
      <TabsContent value="notifications">Choose which emails and alerts you receive.</TabsContent>
      <TabsContent value="security">Enable two-factor auth and review devices.</TabsContent>
      <TabsContent value="integrations">Connect third-party tools and services.</TabsContent>
    </Tabs>
  ),
  args: { defaultValue: "account" },
};

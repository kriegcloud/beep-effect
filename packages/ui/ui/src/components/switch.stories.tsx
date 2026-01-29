import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    checked: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

export const SwitchGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="notifications" className="text-base">
            Notifications
          </Label>
          <p className="text-sm text-muted-foreground">
            Receive notifications about your account.
          </p>
        </div>
        <Switch id="notifications" />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="marketing" className="text-base">
            Marketing emails
          </Label>
          <p className="text-sm text-muted-foreground">
            Receive emails about new products and features.
          </p>
        </div>
        <Switch id="marketing" defaultChecked />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="security" className="text-base">
            Security alerts
          </Label>
          <p className="text-sm text-muted-foreground">
            Receive alerts about suspicious activity.
          </p>
        </div>
        <Switch id="security" defaultChecked />
      </div>
    </div>
  ),
};

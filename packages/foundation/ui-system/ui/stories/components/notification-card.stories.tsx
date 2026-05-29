import { NotificationCard } from "@beep/ui/components/notification-card";
import * as O from "effect/Option";
import { expect, fn, userEvent, within } from "storybook/test";
import type { NotificationAction } from "@beep/ui/components/notification-card";
import type { Meta, StoryObj } from "@storybook/react-vite";

const SAMPLE_ACTIONS: NotificationAction[] = [
  {
    type: "redirect",
    id: "view",
    label: "View",
    executed: O.none(),
    style: O.some("primary"),
  },
  {
    type: "api_call",
    id: "approve",
    label: "Approve",
    executed: O.none(),
    style: O.none(),
  },
  {
    type: "modal",
    id: "dismiss",
    label: "Dismiss",
    executed: O.none(),
    style: O.some("danger"),
  },
];

/**
 * `NotificationCard` renders a single notification with a title, body, optional
 * relative timestamp, and a row of action buttons. The `status` (`unread` / `read` /
 * `archived`) drives the emphasis styling and the unread dot, and an unread card with
 * `onMarkAsRead` exposes a check button. Each action is a tagged union carrying a
 * `style` and `executed` flag that control its appearance.
 *
 * Imported from `@beep/ui/components/notification-card`.
 */
const meta = {
  title: "Components/Feedback/NotificationCard",
  component: NotificationCard,
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Heading shown at the top of the card.",
    },
    body: {
      control: "text",
      description: "Supporting copy shown beneath the title.",
    },
    status: {
      control: "select",
      options: ["unread", "read", "archived"],
      description: "Drives emphasis styling and the unread dot.",
      table: { defaultValue: { summary: "unread" } },
    },
    createdAt: {
      control: "text",
      description: "Timestamp rendered as a relative label (e.g. `2h ago`).",
    },
    loadingActionId: {
      control: "text",
      description: "Id of the action currently in a loading state.",
    },
  },
  args: {
    id: "notif-1",
    title: "New comment on your post",
    body: "Jordan replied to your thread in #design.",
    status: "unread",
    actions: SAMPLE_ACTIONS,
    onMarkAsRead: fn(),
    onAction: fn(),
  },
} satisfies Meta<typeof NotificationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default unread notification with action buttons and a mark-as-read control. */
export const Default: Story = {
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("New comment on your post")).toBeVisible();
    const view = canvas.getByRole("button", { name: "View" });
    expect(view).toBeVisible();
    return userEvent.click(view).then(() => {
      expect(args.onAction).toHaveBeenCalledOnce();
    });
  },
};

/** A read notification dims its content and hides the mark-as-read control. */
export const Read: Story = {
  args: { id: "notif-2", status: "read" },
};

/** Clicking the check button on an unread card fires `onMarkAsRead`. */
export const MarkAsRead: Story = {
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const markRead = canvas.getByRole("button", { name: "Mark as read" });
    expect(markRead).toBeVisible();
    return userEvent.click(markRead).then(() => {
      expect(args.onMarkAsRead).toHaveBeenCalledOnce();
    });
  },
};

/** Showing a relative timestamp in the footer via `createdAt`. */
export const WithTimestamp: Story = {
  args: { id: "notif-3", createdAt: "2025-01-15T09:00:00Z" },
};

/** A notification with no actions renders just the title, body, and dot. */
export const NoActions: Story = {
  args: { id: "notif-4", actions: [] },
};

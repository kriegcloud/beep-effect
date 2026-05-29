import { CalendarEventCard, EventLocation, EventTime, EventTitle } from "@beep/ui/components/calendar-event-card";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `CalendarEventCard` renders a colored calendar event tile with a left accent bar, an
 * optional label, and composed sub-parts (`EventTitle`, `EventTime`, `EventLocation`).
 * The `action` variant adds a confirm button driven by `status` (`idle` / `loading` /
 * `completed`) and `onAction`.
 *
 * Imported from `@beep/ui/components/calendar-event-card`.
 */
const meta = {
  title: "Components/Data Display/CalendarEventCard",
  component: CalendarEventCard,
  tags: ["autodocs"],
  argTypes: {
    eventColor: {
      control: "color",
      description: "Accent color used for the bar, tint, and dotted border.",
    },
    variant: {
      control: "select",
      options: ["display", "action"],
      description: "`display` is read-only; `action` adds a confirm button.",
      table: { defaultValue: { summary: "display" } },
    },
    status: {
      control: "select",
      options: ["idle", "loading", "completed"],
      description: "Drives the action button content and disabled state.",
      table: { defaultValue: { summary: "idle" } },
    },
    buttonColor: {
      control: "select",
      options: ["primary", "danger"],
      description: "Color scheme for the action button.",
      table: { defaultValue: { summary: "primary" } },
    },
    label: {
      control: "text",
      description: "Optional small heading shown above the content.",
    },
    completedLabel: {
      control: "text",
      description: "Text shown on the action button when `status` is `completed`.",
      table: { defaultValue: { summary: "Completed" } },
    },
    isDotted: {
      control: "boolean",
      description: "Renders a dashed border tinted by `eventColor`.",
      table: { defaultValue: { summary: "false" } },
    },
    opacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
      description: "Card opacity; forced to 0.5 when completed.",
      table: { defaultValue: { summary: "1" } },
    },
  },
  args: {
    eventColor: "#0ea5e9",
    variant: "display",
    status: "idle",
    buttonColor: "primary",
    onAction: fn(),
    children: (
      <>
        <EventTitle>Design Review</EventTitle>
        <EventTime startTime="9:00 AM" endTime="10:00 AM" />
        <EventLocation>Conference Room B</EventLocation>
      </>
    ),
  },
} satisfies Meta<typeof CalendarEventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default read-only event card composed of a title, time range, and location. */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("Design Review");
    expect(title).toBeVisible();
    expect(canvas.getByText("9:00 AM - 10:00 AM")).toBeVisible();
    return Promise.resolve();
  },
};

/** Adds a small label above the content to categorize the event. */
export const WithLabel: Story = {
  args: { label: "Team" },
};

/** Dashed, tinted outline used for tentative or placeholder events. */
export const Dotted: Story = {
  args: { isDotted: true, label: "Tentative" },
};

/** The `action` variant exposes a confirm button that fires `onAction`. */
export const Action: Story = {
  args: { variant: "action" },
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Confirm" });
    expect(button).toBeVisible();
    return userEvent.click(button).then(() => {
      expect(args.onAction).toHaveBeenCalledOnce();
    });
  },
};

/** While `loading`, the button shows a spinner and the `Confirm` label. */
export const Loading: Story = {
  args: { variant: "action", status: "loading" },
};

/** When `completed`, the card dims and the button is disabled. */
export const Completed: Story = {
  args: { variant: "action", status: "completed" },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Completed" });
    expect(button).toBeDisabled();
    return Promise.resolve();
  },
};

/** A destructive action card using the `danger` button color. */
export const DangerAction: Story = {
  args: { variant: "action", buttonColor: "danger", eventColor: "#ef4444" },
};

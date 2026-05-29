import { Button } from "@beep/ui/components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@beep/ui/components/tooltip";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Tooltip` is a label overlay built on Base UI's accessible tooltip primitive. Compose `Tooltip`
 * (the root that owns open state) with `TooltipTrigger` (the focusable anchor) and `TooltipContent`
 * (the floating popup rendered in a portal). The tooltip opens when the trigger is hovered or focused
 * and closes when the pointer leaves or focus is lost, making it ideal for short, supplementary hints.
 * Wrap one or more tooltips in `TooltipProvider` to share a single open/close delay so adjacent
 * tooltips reveal instantly once the first appears. The root accepts `open`/`defaultOpen` with
 * `onOpenChange` for state, while `TooltipContent` exposes `side`, `sideOffset`, and `align` to tune
 * placement relative to the trigger.
 *
 * Imported from `@beep/ui/components/tooltip`.
 */
const meta = {
  title: "Components/Overlays/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state of the tooltip.",
    },
    defaultOpen: {
      control: "boolean",
      description: "Whether the tooltip is initially open in uncontrolled mode.",
      table: { defaultValue: { summary: "false" } },
    },
    onOpenChange: {
      control: false,
      description: "Callback fired whenever the open state changes (hover, focus, press, or dismissal).",
    },
    disabled: {
      control: "boolean",
      description: "Disables the tooltip so it never opens.",
      table: { defaultValue: { summary: "false" } },
    },
    disableHoverablePopup: {
      control: "boolean",
      description: "Prevents the popup itself from staying open while hovered.",
      table: { defaultValue: { summary: "false" } },
    },
    trackCursorAxis: {
      control: "select",
      options: ["none", "x", "y", "both"],
      description: "Which axis the tooltip should track the cursor on.",
      table: { defaultValue: { summary: "none" } },
    },
  },
  args: {
    onOpenChange: fn(),
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default tooltip with a button trigger and a short hint. The play test focuses the trigger,
 * asserts the hint becomes visible, and confirms `onOpenChange` fired.
 */
export const Default: Story = {
  render: (args) => (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip {...args}>
        <TooltipTrigger render={<Button variant="outline">Hover</Button>} />
        <TooltipContent>Add to library</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Hover" });
    expect(trigger).toBeVisible();
    return userEvent.hover(trigger).then(() =>
      waitFor(() => {
        expect(screen.getByText("Add to library")).toBeVisible();
        expect(args.onOpenChange).toHaveBeenCalled();
      })
    );
  },
};

/**
 * Renders with `defaultOpen` so the tooltip is visible on first paint without interaction; the play
 * test asserts the hint is already on screen.
 */
export const DefaultOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip {...args}>
        <TooltipTrigger render={<Button variant="outline">Open by default</Button>} />
        <TooltipContent>This tooltip opened automatically when the story mounted.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: () =>
    waitFor(() => {
      expect(screen.getByText("This tooltip opened automatically when the story mounted.")).toBeVisible();
    }),
};

/**
 * Moving the pointer away from the trigger dismisses the tooltip. The play test hovers to open it,
 * then unhovers and asserts the hint is removed from the DOM.
 */
export const Dismissal: Story = {
  render: (args) => (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip {...args}>
        <TooltipTrigger render={<Button variant="outline">Dismiss me</Button>} />
        <TooltipContent>Move your pointer away to dismiss this hint.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Dismiss me" });
    return userEvent
      .hover(trigger)
      .then(() =>
        waitFor(() => {
          expect(screen.getByText("Move your pointer away to dismiss this hint.")).toBeVisible();
        })
      )
      .then(() => userEvent.unhover(trigger))
      .then(() =>
        waitFor(() => {
          expect(screen.queryByText("Move your pointer away to dismiss this hint.")).toBeNull();
        })
      );
  },
};

/**
 * Places the popup above the trigger via `side="top"` on `TooltipContent`, useful when there is more
 * room above the anchor than below it.
 */
export const SideTop: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip {...args}>
        <TooltipTrigger render={<Button variant="outline">Top side</Button>} />
        <TooltipContent side="top">This hint is positioned above the trigger.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

/**
 * Places the popup to the right of the trigger via `side="right"` on `TooltipContent`, handy in
 * vertical lists where space below the anchor is tight.
 */
export const SideRight: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip {...args}>
        <TooltipTrigger render={<Button variant="outline">Right side</Button>} />
        <TooltipContent side="right">This hint is positioned to the right of the trigger.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

/**
 * Anchors the popup to the trigger's start edge with extra distance via `align="start"` and an
 * increased `sideOffset` on `TooltipContent`.
 */
export const AlignStartWithOffset: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip {...args}>
        <TooltipTrigger render={<Button variant="outline">Aligned start</Button>} />
        <TooltipContent align="start" sideOffset={12}>
          Aligned to the start edge with a larger side offset.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

/**
 * A disabled tooltip never opens even when hovered. The play test hovers the trigger and asserts the
 * hint stays out of the DOM.
 */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip {...args}>
        <TooltipTrigger render={<Button variant="outline">Disabled tooltip</Button>} />
        <TooltipContent>You should never see this hint.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Disabled tooltip" });
    return userEvent.hover(trigger).then(() => {
      expect(screen.queryByText("You should never see this hint.")).toBeNull();
    });
  },
};

/**
 * Shares a single delay across several tooltips via `TooltipProvider`; once one opens, the others
 * reveal instantly. The play test opens the first hint and asserts it is visible.
 */
export const GroupedDelay: Story = {
  render: () => (
    <TooltipProvider delay={0} closeDelay={0}>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Bold</Button>} />
          <TooltipContent>Toggle bold</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Italic</Button>} />
          <TooltipContent>Toggle italic</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Underline</Button>} />
          <TooltipContent>Toggle underline</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Bold" });
    return userEvent.hover(trigger).then(() =>
      waitFor(() => {
        expect(screen.getByText("Toggle bold")).toBeVisible();
      })
    );
  },
};

/**
 * Fully controlled via the `open` prop with `onOpenChange`; the tooltip stays open regardless of
 * hover because the parent owns the state. The play test asserts the forced-open hint is visible.
 */
export const Controlled: Story = {
  args: { open: true },
  render: (args) => (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip {...args}>
        <TooltipTrigger render={<Button variant="outline">Controlled trigger</Button>} />
        <TooltipContent>This tooltip is held open by the controlled `open` prop.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: () =>
    waitFor(() => {
      expect(screen.getByText("This tooltip is held open by the controlled `open` prop.")).toBeVisible();
    }),
};

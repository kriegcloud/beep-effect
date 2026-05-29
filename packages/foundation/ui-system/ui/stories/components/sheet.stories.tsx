import { Button } from "@beep/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@beep/ui/components/sheet";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Sheet` is a panel overlay that slides in from a screen edge, built on Base UI's dialog primitive.
 * Compose `Sheet` (the root that owns open state) with `SheetTrigger` (the button that opens it) and
 * `SheetContent` (the sliding popup, which renders its own overlay and corner close button). Choose the
 * edge with `SheetContent`'s `side` prop (`top`, `right`, `bottom`, `left`). Inside the content, structure
 * copy with `SheetHeader` wrapping `SheetTitle` and `SheetDescription`, and place actions in `SheetFooter`.
 * `SheetClose` dismisses the sheet from anywhere inside it. The root accepts `open`/`defaultOpen` with
 * `onOpenChange` for state, plus `modal` and `disablePointerDismissal` to tune dismissal behavior.
 *
 * Imported from `@beep/ui/components/sheet`.
 */
const meta = {
  title: "Components/Overlays/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state of the sheet.",
    },
    defaultOpen: {
      control: "boolean",
      description: "Whether the sheet is initially open in uncontrolled mode.",
      table: { defaultValue: { summary: "false" } },
    },
    modal: {
      control: "select",
      options: [true, false, "trap-focus"],
      description: "When true, traps focus and blocks interaction with the rest of the page.",
      table: { defaultValue: { summary: "true" } },
    },
    disablePointerDismissal: {
      control: "boolean",
      description: "When true, clicks outside the popup no longer close the sheet.",
      table: { defaultValue: { summary: "false" } },
    },
    onOpenChange: {
      control: false,
      description: "Callback fired whenever the open state changes.",
    },
  },
  args: {
    onOpenChange: fn(),
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default right-side sheet with a trigger, title, description, and footer actions. The play test
 * opens the sheet, asserts the title is visible, and confirms `onOpenChange` fired.
 */
export const Default: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes to your profile here. Click save when you are done.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose render={<Button variant="outline">Cancel</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open sheet" });
    expect(trigger).toBeVisible();
    return userEvent.click(trigger).then(() =>
      waitFor(() => {
        expect(screen.getByRole("dialog")).toBeVisible();
        expect(screen.getByText("Edit profile")).toBeVisible();
        expect(args.onOpenChange).toHaveBeenCalled();
      })
    );
  },
};

/** Slides in from the right edge (the default), the most common placement for detail and edit panels. */
export const Right: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline">Open right</Button>} />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Right panel</SheetTitle>
          <SheetDescription>This sheet enters from the right edge of the viewport.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

/** Slides in from the left edge, a natural fit for navigation drawers. */
export const Left: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline">Open left</Button>} />
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Left panel</SheetTitle>
          <SheetDescription>This sheet enters from the left edge of the viewport.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

/** Slides down from the top edge, useful for announcements and command surfaces. */
export const Top: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline">Open top</Button>} />
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Top panel</SheetTitle>
          <SheetDescription>This sheet enters from the top edge of the viewport.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

/** Slides up from the bottom edge, mirroring a mobile bottom-sheet pattern. */
export const Bottom: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline">Open bottom</Button>} />
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Bottom panel</SheetTitle>
          <SheetDescription>This sheet enters from the bottom edge of the viewport.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * Renders with `defaultOpen` so the sheet is visible on first paint without interaction; the play test
 * asserts the title is already on screen.
 */
export const DefaultOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Welcome aboard</SheetTitle>
          <SheetDescription>This sheet opened automatically when the story mounted.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: () =>
    waitFor(() => {
      expect(screen.getByRole("dialog")).toBeVisible();
      expect(screen.getByText("Welcome aboard")).toBeVisible();
    }),
};

/**
 * Clicking the built-in corner close button dismisses the sheet. The play test opens it, clicks Close,
 * and asserts the sheet is removed from the DOM.
 */
export const Closing: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Session expiring</SheetTitle>
          <SheetDescription>Your session will end soon. Close this notice to continue.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open sheet" });
    return userEvent
      .click(trigger)
      .then(() => waitFor(() => expect(screen.getByRole("dialog")).toBeVisible()))
      .then(() => userEvent.click(screen.getByRole("button", { name: "Close" })))
      .then(() =>
        waitFor(() => {
          expect(screen.queryByRole("dialog")).toBeNull();
        })
      );
  },
};

/**
 * Hides the content close button via `showCloseButton={false}`, forcing dismissal through explicit
 * footer actions instead of the corner icon.
 */
export const WithoutCloseButton: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Accept the terms</SheetTitle>
          <SheetDescription>You must choose an action below; there is no corner close button.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button>Accept</Button>
          <SheetClose render={<Button variant="outline">Decline</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * A sheet that ignores outside clicks via `disablePointerDismissal`. The play test opens the sheet,
 * clicks the backdrop overlay, and asserts the sheet stays visible.
 */
export const NonDismissible: Story = {
  args: { disablePointerDismissal: true },
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Action required</SheetTitle>
          <SheetDescription>Clicking outside will not close this sheet; use the footer button.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose render={<Button variant="outline">Got it</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    return userEvent
      .click(canvas.getByRole("button", { name: "Open sheet" }))
      .then(() => waitFor(() => expect(screen.getByRole("dialog")).toBeVisible()))
      .then(() => {
        const overlay = document.querySelector("[data-slot='sheet-overlay']");
        expect(overlay).not.toBeNull();
        return userEvent.click(overlay as Element);
      })
      .then(() =>
        waitFor(() => {
          expect(screen.getByRole("dialog")).toBeVisible();
        })
      );
  },
};

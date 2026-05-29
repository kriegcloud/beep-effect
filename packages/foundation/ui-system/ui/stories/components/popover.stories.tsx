import { Button } from "@beep/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@beep/ui/components/popover";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Popover` is a non-modal floating panel built on Base UI's popover primitive. Compose `Popover`
 * (the root that owns open state) with `PopoverTrigger` (the element that toggles it on click) and
 * `PopoverContent` (the floating popup rendered in a portal). Inside the content, structure copy with
 * `PopoverHeader` wrapping `PopoverTitle` and `PopoverDescription`. The root accepts `open`/`defaultOpen`
 * with `onOpenChange` for state and `modal` to control focus trapping and outside interaction, while
 * `PopoverContent` exposes `side`, `sideOffset`, `align`, and `alignOffset` to tune placement relative
 * to the trigger.
 *
 * Imported from `@beep/ui/components/popover`.
 */
const meta = {
  title: "Components/Overlays/Popover",
  component: Popover,
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state of the popover.",
    },
    defaultOpen: {
      control: "boolean",
      description: "Whether the popover is initially open in uncontrolled mode.",
      table: { defaultValue: { summary: "false" } },
    },
    modal: {
      control: "select",
      options: [true, false, "trap-focus"],
      description: "When true, locks page scroll and disables pointer interaction outside the popup.",
      table: { defaultValue: { summary: "false" } },
    },
    onOpenChange: {
      control: false,
      description: "Callback fired whenever the open state changes (trigger press, outside press, or escape).",
    },
  },
  args: {
    onOpenChange: fn(),
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default popover with a button trigger and a titled content panel. The play test clicks the
 * trigger, asserts the panel content becomes visible, and confirms `onOpenChange` fired.
 */
export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open popover" });
    expect(trigger).toBeVisible();
    return userEvent.click(trigger).then(() =>
      waitFor(() => {
        expect(screen.getByText("Set the dimensions for the layer.")).toBeVisible();
        expect(args.onOpenChange).toHaveBeenCalled();
      })
    );
  },
};

/**
 * Renders with `defaultOpen` so the popup is visible on first paint without interaction; the play test
 * asserts the title is already on screen.
 */
export const DefaultOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Welcome</PopoverTitle>
          <PopoverDescription>This popover opened automatically when the story mounted.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  play: () =>
    waitFor(() => {
      expect(screen.getByText("Welcome")).toBeVisible();
      expect(screen.getByText("This popover opened automatically when the story mounted.")).toBeVisible();
    }),
};

/**
 * Pressing the trigger a second time dismisses the popup. The play test opens the popover, clicks the
 * trigger again, and asserts the content is removed from the DOM.
 */
export const Toggling: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline">Toggle popover</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Notifications</PopoverTitle>
          <PopoverDescription>Press the trigger again to dismiss this panel.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Toggle popover" });
    return userEvent
      .click(trigger)
      .then(() =>
        waitFor(() => {
          expect(screen.getByText("Press the trigger again to dismiss this panel.")).toBeVisible();
        })
      )
      .then(() => userEvent.click(trigger))
      .then(() =>
        waitFor(() => {
          expect(screen.queryByText("Press the trigger again to dismiss this panel.")).toBeNull();
        })
      );
  },
};

/**
 * A realistic form popover composing a header with title and description above a set of labelled
 * inputs, demonstrating the kind of rich editing surface popovers are designed for.
 */
export const WithForm: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline">Edit dimensions</Button>} />
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-2.5">
          <div className="grid grid-cols-3 items-center gap-4">
            <label htmlFor="popover-width" className="text-sm">
              Width
            </label>
            <input
              id="popover-width"
              defaultValue="100%"
              className="border-input col-span-2 h-8 rounded-md border px-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label htmlFor="popover-height" className="text-sm">
              Height
            </label>
            <input
              id="popover-height"
              defaultValue="25px"
              className="border-input col-span-2 h-8 rounded-md border px-2 text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: () =>
    waitFor(() => {
      expect(screen.getByText("Dimensions")).toBeVisible();
      expect(screen.getByLabelText("Width")).toBeVisible();
    }),
};

/**
 * Places the popup above the trigger via `side="top"` on `PopoverContent`, useful when there is more
 * room above the anchor than below it.
 */
export const SideTop: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline">Top side</Button>} />
      <PopoverContent side="top">
        <PopoverHeader>
          <PopoverTitle>Above the trigger</PopoverTitle>
          <PopoverDescription>This popup is positioned above the trigger.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};

/**
 * Anchors the popup to the trigger's start edge with extra distance via `align="start"` and an
 * increased `sideOffset` on `PopoverContent`.
 */
export const AlignStartWithOffset: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline">Aligned start</Button>} />
      <PopoverContent align="start" sideOffset={12}>
        <PopoverHeader>
          <PopoverTitle>Aligned to start</PopoverTitle>
          <PopoverDescription>Aligned to the start edge with a larger side offset.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};

/**
 * Pressing Escape dismisses the popover. The play test opens it, presses Escape, and asserts the
 * content is removed from the DOM.
 */
export const EscapeToClose: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Press escape</PopoverTitle>
          <PopoverDescription>Hit the Escape key to dismiss this panel.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    return userEvent
      .click(canvas.getByRole("button", { name: "Open popover" }))
      .then(() =>
        waitFor(() => {
          expect(screen.getByText("Hit the Escape key to dismiss this panel.")).toBeVisible();
        })
      )
      .then(() => userEvent.keyboard("{Escape}"))
      .then(() =>
        waitFor(() => {
          expect(screen.queryByText("Hit the Escape key to dismiss this panel.")).toBeNull();
        })
      );
  },
};

/**
 * Fully controlled via the `open` prop with `onOpenChange`; the popup stays open because the parent
 * owns the state. The play test asserts the forced-open content is visible.
 */
export const Controlled: Story = {
  args: { open: true },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline">Controlled trigger</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Controlled</PopoverTitle>
          <PopoverDescription>This popover is held open by the controlled open prop.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  play: () =>
    waitFor(() => {
      expect(screen.getByText("This popover is held open by the controlled open prop.")).toBeVisible();
    }),
};

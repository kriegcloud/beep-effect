import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@beep/ui/components/alert-dialog";
import { Button } from "@beep/ui/components/button";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `AlertDialog` is a modal confirmation surface built on Base UI's accessible alert-dialog
 * primitive. Compose the root `AlertDialog` (which owns open state) with `AlertDialogTrigger`
 * (the button that opens it) and `AlertDialogContent` (the portalled popup). Inside the content,
 * group `AlertDialogTitle` and `AlertDialogDescription` in `AlertDialogHeader`, then place
 * `AlertDialogCancel` and `AlertDialogAction` in `AlertDialogFooter`. Use `AlertDialogMedia` for a
 * leading icon and the `size` prop on the content for compact two-column footers. Because the
 * content renders through a portal, interaction tests query it via `screen` rather than the canvas.
 *
 * Imported from `@beep/ui/components/alert-dialog`.
 */
const meta = {
  title: "Components/Overlays/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state of the dialog.",
    },
    defaultOpen: {
      control: "boolean",
      description: "Whether the dialog is initially open in uncontrolled mode.",
      table: { defaultValue: { summary: "false" } },
    },
    onOpenChange: {
      control: false,
      description: "Callback fired with the next open state when the dialog opens or closes.",
    },
  },
  args: {
    onOpenChange: fn(),
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default confirmation dialog. The play test opens the dialog from its trigger and asserts the
 * portalled title and actions become visible.
 */
export const Default: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button variant="outline" />}>Show dialog</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Show dialog" });
    expect(trigger).toBeVisible();
    return userEvent
      .click(trigger)
      .then(() => waitFor(() => expect(screen.getByText("Are you absolutely sure?")).toBeVisible()))
      .then(() => {
        expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
      });
  },
};

/**
 * Confirming with the action button closes the dialog. The play test opens the dialog, clicks
 * `Continue`, and asserts the title is removed from the document.
 */
export const ConfirmingAction: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button variant="outline" />}>Delete account</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account?</AlertDialogTitle>
          <AlertDialogDescription>This permanently removes your account and cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Delete account" });
    return userEvent
      .click(trigger)
      .then(() => waitFor(() => expect(screen.getByText("Delete account?")).toBeVisible()))
      .then(() => userEvent.click(screen.getByRole("button", { name: "Delete" })))
      .then(() =>
        waitFor(() => {
          expect(screen.queryByText("Delete account?")).toBeNull();
        })
      );
  },
};

/**
 * Cancelling dismisses the dialog without confirming. The play test opens the dialog, clicks
 * `Cancel`, and asserts the description is gone.
 */
export const CancellingAction: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button variant="outline" />}>Discard changes</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Your unsaved edits will be lost if you leave this page.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction>Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Discard changes" });
    return userEvent
      .click(trigger)
      .then(() => waitFor(() => expect(screen.getByText("Discard changes?")).toBeVisible()))
      .then(() => userEvent.click(screen.getByRole("button", { name: "Keep editing" })))
      .then(() =>
        waitFor(() => {
          expect(screen.queryByText("Discard changes?")).toBeNull();
        })
      );
  },
};

/**
 * A destructive confirmation pairs a `destructive` action button with a danger description, signalling
 * an irreversible operation.
 */
export const Destructive: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Delete project</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            All files, deployments, and settings for this project will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete project</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * `AlertDialogMedia` renders a leading icon block beside the header text to reinforce the dialog's
 * intent.
 */
export const WithMedia: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button variant="outline" />}>Sign out</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <title>Warning</title>
              <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </AlertDialogMedia>
          <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
          <AlertDialogDescription>You will need to sign in again on every device you use.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Sign out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * The compact `sm` content size renders the footer as a two-column grid, ideal for tight mobile or
 * popover-adjacent layouts.
 */
export const SmallSize: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button variant="outline" />}>Remove member</AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
          <AlertDialogDescription>They will immediately lose access to this workspace.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Remove</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * Starts open in uncontrolled mode via `defaultOpen`. The play test asserts the dialog content is
 * visible on first render without any interaction.
 */
export const DefaultOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button variant="outline" />}>Open confirmation</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm your choice</AlertDialogTitle>
          <AlertDialogDescription>This dialog opened automatically when the story loaded.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: () => waitFor(() => expect(screen.getByText("Confirm your choice")).toBeVisible()),
};

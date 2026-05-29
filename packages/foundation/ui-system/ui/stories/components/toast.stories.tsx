import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@beep/ui/components/toast";
import { expect, within } from "storybook/test";
import type { ToastData, ToastPrimitive } from "@beep/ui/components/toast";
import type { Meta, StoryObj } from "@storybook/react-vite";

type ToastObject = ToastPrimitive.Root.ToastObject<ToastData>;

const defaultToast: ToastObject = {
  id: "toast-default",
  title: "Notification sent",
  description: "Your message was delivered successfully.",
};

const destructiveToast: ToastObject = {
  id: "toast-destructive",
  title: "Upload failed",
  description: "The file exceeds the maximum allowed size.",
  data: { variant: "destructive" },
};

/**
 * `Toast` is the styled root of a single toast notification, built on Base UI's
 * accessible Toast primitive. It must be composed inside `ToastProvider` and
 * `ToastViewport`, and accepts a `toast` object plus the optional `ToastTitle`,
 * `ToastDescription`, and `ToastClose` parts. Use `variant` (or `toast.data.variant`)
 * to convey severity.
 *
 * Imported from `@beep/ui/components/toast`.
 */
const meta = {
  title: "Components/Feedback/Toast",
  component: Toast,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
      description: "Visual severity of the toast.",
      table: { defaultValue: { summary: "default" } },
    },
  },
  args: {
    variant: "default",
    toast: defaultToast,
  },
  render: (args) => (
    <ToastProvider>
      <ToastViewport>
        <Toast {...args}>
          <div className="grid gap-1">
            {typeof args.toast.title === "string" ? <ToastTitle>{args.toast.title}</ToastTitle> : null}
            {typeof args.toast.description === "string" ? (
              <ToastDescription>{args.toast.description}</ToastDescription>
            ) : null}
          </div>
          <ToastClose />
        </Toast>
      </ToastViewport>
    </ToastProvider>
  ),
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default neutral toast with a title and description. */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Notification sent")).toBeVisible();
    expect(canvas.getByText("Your message was delivered successfully.")).toBeVisible();
    return Promise.resolve();
  },
};

/** Destructive toast styling for errors and failed actions. */
export const Destructive: Story = {
  args: {
    variant: "destructive",
    toast: destructiveToast,
  },
};

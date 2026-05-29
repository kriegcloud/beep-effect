import { Toaster, ToastPrimitive } from "@beep/ui/components/toaster";
import { A } from "@beep/utils";
import { expect, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Toaster` is the application's toast-notification surface. It renders a Base UI
 * `ToastProvider` (wired to the shared process-wide toast manager) plus a fixed
 * `ToastViewport` that maps live toasts into styled `Toast` cards with title,
 * description, optional action button, and a close button. Mount it once near the
 * app root; toasts are then pushed imperatively through the toast manager, and the
 * provider auto-dismisses them after its `timeout` (5s) while capping the stack at
 * its `limit` (3). The re-exported `ToastPrimitive` exposes the underlying Base UI
 * parts (`Provider`, `Viewport`, `Root`, `Title`, `Description`, `Close`) and the
 * `useToastManager` hook used to add toasts from within the provider tree.
 *
 * Imported from `@beep/ui/components/toaster`.
 */
const meta = {
  title: "Components/Feedback/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default toaster mounts cleanly with an empty viewport, ready to receive toasts.
 * The play test confirms the live region exists in the DOM.
 */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const region = canvasElement.querySelector("[role='region']");
    expect(region).not.toBeNull();
    return Promise.resolve();
  },
};

function ToastInbox() {
  const { toasts } = ToastPrimitive.useToastManager();
  return (
    <>
      {A.map(toasts, (toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          toast={toast}
          className="relative flex w-full items-center justify-between space-x-2 rounded-md border bg-background p-4 pr-6 text-foreground shadow-lg"
        >
          <div className="grid gap-1">
            <ToastPrimitive.Title className="font-semibold text-sm">{toast.title}</ToastPrimitive.Title>
            <ToastPrimitive.Description className="text-sm opacity-90">{toast.description}</ToastPrimitive.Description>
          </div>
          <ToastPrimitive.Close className="absolute top-1 right-1 rounded-md p-1">x</ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
    </>
  );
}

function ToastTrigger() {
  const manager = ToastPrimitive.useToastManager();
  return (
    <button
      type="button"
      onClick={() => {
        manager.add({ title: "Saved", description: "Your changes were saved." });
      }}
    >
      Show toast
    </button>
  );
}

/**
 * A trigger button, hosted inside a `ToastPrimitive.Provider`, adds a toast through
 * `useToastManager`. The play test clicks the trigger and asserts the new toast's title
 * and description render in the viewport, demonstrating the imperative add-and-render flow.
 */
export const WithTrigger: Story = {
  render: () => (
    <ToastPrimitive.Provider>
      <ToastTrigger />
      <ToastPrimitive.Viewport className="fixed right-0 bottom-0 z-[100] p-4">
        <ToastInbox />
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Provider>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Show toast" });
    expect(trigger).toBeVisible();
    return userEvent.click(trigger).then(() => {
      expect(canvas.getByText("Saved")).toBeVisible();
      expect(canvas.getByText("Your changes were saved.")).toBeVisible();
    });
  },
};

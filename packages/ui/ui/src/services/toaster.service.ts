import { Toast } from "@base-ui/react/toast";
import { $UiId } from "@beep/identity/packages";
import type { ToastData } from "@beep/ui/components/toast";
import { exact } from "@beep/utils/struct";
import * as Effect from "effect/Effect";

const $I = $UiId.create("services/toaster.service");

export interface ToastOptions {
  readonly title?: undefined | string;
  readonly description?: undefined | React.ReactNode;
  readonly variant?: undefined | ToastData["variant"];
  readonly timeout?: undefined | number;
  readonly priority?: undefined | "low" | "high";
  readonly actionProps?: undefined | React.ComponentPropsWithoutRef<"button">;
  readonly onClose?: undefined | (() => void);
  readonly onRemove?: undefined | (() => void);
}

const globalToastManager = Toast.createToastManager();

function toManagerOptions(options: ToastOptions) {
  return {
    ...(options.title !== undefined && { title: options.title }),
    ...(options.description !== undefined && { description: options.description }),
    ...(options.timeout !== undefined && { timeout: options.timeout }),
    ...(options.priority !== undefined && { priority: options.priority }),
    ...(options.actionProps !== undefined && { actionProps: options.actionProps }),
    ...(options.onClose !== undefined && { onClose: options.onClose }),
    ...(options.onRemove !== undefined && { onRemove: options.onRemove }),
    ...(options.variant !== undefined && { data: { variant: options.variant } }),
  };
}

export class ToasterService extends Effect.Service<ToasterService>()($I`ToasterService`, {
  effect: Effect.sync(() => {
    function addToast(options: ToastOptions): string {
      return globalToastManager.add<ToastData>(
        exact({
          ...(options.title !== undefined && { title: options.title }),
          ...(options.description !== undefined && { description: options.description }),
          ...(options.timeout !== undefined && { timeout: options.timeout }),
          ...(options.priority !== undefined && { priority: options.priority }),
          ...(options.actionProps !== undefined && { actionProps: options.actionProps }),
          ...(options.onClose !== undefined && { onClose: options.onClose }),
          ...(options.onRemove !== undefined && { onRemove: options.onRemove }),
          ...(options.variant !== undefined && { data: { variant: options.variant } }),
        })
      );
    }

    function closeToast(id: string): void {
      globalToastManager.close(id);
    }

    function updateToast(id: string, options: Partial<ToastOptions>): void {
      globalToastManager.update<ToastData>(id, {
        ...(options.title !== undefined && { title: options.title }),
        ...(options.description !== undefined && { description: options.description }),
        ...(options.timeout !== undefined && { timeout: options.timeout }),
        ...(options.priority !== undefined && { priority: options.priority }),
        ...(options.actionProps !== undefined && { actionProps: options.actionProps }),
        ...(options.onClose !== undefined && { onClose: options.onClose }),
        ...(options.onRemove !== undefined && { onRemove: options.onRemove }),
        ...(options.variant !== undefined && { data: { variant: options.variant } }),
      });
    }

    function toastPromise<Value>(
      promise: Promise<Value>,
      options: {
        loading: string | ToastOptions;
        success: string | ToastOptions | ((result: Value) => string | ToastOptions);
        error: string | ToastOptions | ((err: unknown) => string | ToastOptions);
      }
    ): Promise<Value> {
      return globalToastManager.promise<Value, ToastData>(promise, {
        loading: typeof options.loading === "string" ? options.loading : toManagerOptions(options.loading),
        success:
          typeof options.success === "string"
            ? options.success
            : typeof options.success === "function"
              ? (result: Value) => {
                  const opt = options.success as (result: Value) => string | ToastOptions;
                  const resolved = opt(result);
                  return typeof resolved === "string" ? resolved : toManagerOptions(resolved);
                }
              : toManagerOptions(options.success),
        error:
          typeof options.error === "string"
            ? options.error
            : typeof options.error === "function"
              ? (err: unknown) => {
                  const opt = options.error as (err: unknown) => string | ToastOptions;
                  const resolved = opt(err);
                  return typeof resolved === "string" ? resolved : toManagerOptions(resolved);
                }
              : toManagerOptions(options.error),
      });
    }

    return {
      toast: addToast,
      close: closeToast,
      update: updateToast,
      promise: toastPromise,
      manager: globalToastManager,
    } as const;
  }),
}) {}

export { globalToastManager };

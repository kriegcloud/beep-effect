"use client";

import type { ToastData } from "@beep/ui/components/toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastPrimitive,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@beep/ui/components/toast";
import { globalToastManager } from "@beep/ui/services/toaster.service";
import { cn } from "@beep/ui-core/utils";

export function Toaster() {
  const { toasts } = ToastPrimitive.useToastManager();

  return (
    <ToastProvider timeout={5000} limit={3} toastManager={globalToastManager}>
      <ToastViewport>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast as ToastPrimitive.Root.ToastObject<ToastData>}
            className="bg-[--sl-color-bg]"
          >
            <div className="grid gap-1">
              {toast.title && <ToastTitle className="text-[--sl-color-white]">{toast.title}</ToastTitle>}
              {toast.description && (
                <ToastDescription className="text-[--sl-color-text]">{toast.description}</ToastDescription>
              )}
            </div>
            {toast.actionProps && (
              <button
                type="button"
                className={cn(
                  "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 font-medium text-sm transition-colors hover:bg-secondary"
                )}
                {...toast.actionProps}
              />
            )}
            <ToastClose className="cursor-pointer bg-transparent text-[--sl-color-white]" />
          </Toast>
        ))}
      </ToastViewport>
    </ToastProvider>
  );
}

export { ToastPrimitive };

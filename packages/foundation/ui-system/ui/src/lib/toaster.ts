/**
 * Shared toast manager used by the `@beep/ui` toaster surface.
 *
 * @category utilities
 * @since 0.0.0
 */
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import type { ToastData } from "../components/toast.tsx";

/**
 * Process-wide toast manager used by `Toaster` and imperative toast callers.
 *
 * @category utilities
 * @since 0.0.0
 */
export const globalToastManager = ToastPrimitive.createToastManager<ToastData>();

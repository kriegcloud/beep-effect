/**
 * \@beep/v2t
 *
 * @since 0.0.0
 */

import { TwoTvPage, V2TWorkspaceShell } from "./components/two-tv.tsx";
import {
  createV2tSessionResource,
  discardV2tRecoveryCandidate,
  getV2tCaptureState,
  getV2tSessionResource,
  getV2tSidecarState,
  getV2tWorkspaceSnapshot,
  interruptV2tCapture,
  isNativeDesktop,
  observeV2tCaptureState,
  observeV2tSidecarState,
  pickWorkspaceDirectory,
  probeV2tSidecar,
  recoverV2tRecoveryCandidate,
  retryV2tSessionTranscript,
  runV2tSessionComposition,
  saveV2tDesktopPreferences,
  startV2tCapture,
  startV2tSidecar,
  stopV2tCapture,
  stopV2tSidecar,
  Vt2ManagedCaptureState,
  Vt2ManagedCaptureStatus,
  Vt2ManagedSidecarState,
  Vt2NativeError,
  Vt2SidecarMode,
  Vt2SidecarStatus,
} from "./native.ts";

/**
 * Current package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/v2t"
 *
 * console.log(VERSION)
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export const VERSION = "0.0.0" as const;

export {
  createV2tSessionResource,
  discardV2tRecoveryCandidate,
  getV2tCaptureState,
  getV2tSessionResource,
  getV2tSidecarState,
  getV2tWorkspaceSnapshot,
  interruptV2tCapture,
  isNativeDesktop,
  observeV2tCaptureState,
  observeV2tSidecarState,
  pickWorkspaceDirectory,
  probeV2tSidecar,
  recoverV2tRecoveryCandidate,
  retryV2tSessionTranscript,
  runV2tSessionComposition,
  saveV2tDesktopPreferences,
  startV2tCapture,
  startV2tSidecar,
  stopV2tCapture,
  stopV2tSidecar,
  TwoTvPage,
  V2TWorkspaceShell,
  Vt2ManagedCaptureState,
  Vt2ManagedCaptureStatus,
  Vt2ManagedSidecarState,
  Vt2NativeError,
  Vt2SidecarMode,
  Vt2SidecarStatus,
};

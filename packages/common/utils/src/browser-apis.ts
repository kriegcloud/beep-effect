/**
 * @since 0.1.0
 */

import type { UnsafeTypes } from "@beep/types";
import { pipe } from "effect";
import * as Str from "effect/String";

/**
 * Checks if the Navigator API is available in the current environment.
 *
 * @example
 * ```typescript
 * import { isNavigatorDefined } from "@beep/utils"
 *
 * if (isNavigatorDefined) {
 *   console.log("Navigator is available")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const isNavigatorDefined = typeof navigator !== "undefined";

/**
 * Checks if the Navigator API is unavailable in the current environment.
 *
 * @example
 * ```typescript
 * import { isNavigatorUndefined } from "@beep/utils"
 *
 * if (isNavigatorUndefined) {
 *   console.log("Running in Node.js or SSR environment")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const isNavigatorUndefined = !isNavigatorDefined;

/**
 * Checks if the Window API is available in the current environment.
 *
 * @example
 * ```typescript
 * import { isWindowDefined } from "@beep/utils"
 *
 * if (isWindowDefined) {
 *   console.log("Running in browser")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const isWindowDefined = typeof window !== "undefined";

/**
 * Checks if the Window API is unavailable in the current environment.
 *
 * @example
 * ```typescript
 * import { isWindowUndefined } from "@beep/utils"
 *
 * if (isWindowUndefined) {
 *   console.log("Window is not available")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const isWindowUndefined = !isWindowDefined;

/**
 * Checks if the Document API is available in the current environment.
 *
 * @example
 * ```typescript
 * import { isDocumentDefined } from "@beep/utils"
 *
 * if (isDocumentDefined) {
 *   console.log("Document is available")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const isDocumentDefined = typeof document !== "undefined";

/**
 * Checks if the Document API is unavailable in the current environment.
 *
 * @example
 * ```typescript
 * import { isDocumentUndefined } from "@beep/utils"
 *
 * if (isDocumentUndefined) {
 *   console.log("Document is not available")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const isDocumentUndefined = !isDocumentDefined;

/**
 * Checks if both Navigator and Window APIs are available.
 *
 * @example
 * ```typescript
 * import { isNavigatorAndWindowDefined } from "@beep/utils"
 *
 * if (isNavigatorAndWindowDefined) {
 *   console.log("Full browser environment")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const isNavigatorAndWindowDefined = isNavigatorDefined && isWindowDefined;

/**
 * Checks if either Navigator or Window API is unavailable.
 *
 * @example
 * ```typescript
 * import { isNavigatorAndWindowUndefined } from "@beep/utils"
 *
 * if (isNavigatorAndWindowUndefined) {
 *   console.log("Not in full browser environment")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const isNavigatorAndWindowUndefined = !isNavigatorAndWindowDefined;

/**
 * Detects if the current device is iOS (iPad, iPhone, or iPod).
 *
 * @example
 * ```typescript
 * import { IS_IOS } from "@beep/utils"
 *
 * if (IS_IOS) {
 *   console.log("Running on iOS device")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_IOS =
  isNavigatorAndWindowDefined &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as UnsafeTypes.UnsafeAny).MSStream;

/**
 * Detects if the current platform is macOS.
 *
 * @example
 * ```typescript
 * import { IS_APPLE } from "@beep/utils"
 *
 * if (IS_APPLE) {
 *   console.log("Running on macOS")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_APPLE = isNavigatorDefined && pipe(navigator.userAgent, Str.includes("Mac OS X"));

/**
 * Detects if the current platform is Android.
 *
 * @example
 * ```typescript
 * import { IS_ANDROID } from "@beep/utils"
 *
 * if (IS_ANDROID) {
 *   console.log("Running on Android")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_ANDROID = isNavigatorDefined && pipe(navigator.userAgent, Str.includes("Android"));

/**
 * Detects if the current browser is Firefox.
 *
 * @example
 * ```typescript
 * import { IS_FIREFOX } from "@beep/utils"
 *
 * if (IS_FIREFOX) {
 *   console.log("Running on Firefox")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_FIREFOX = isNavigatorDefined && /^(?!.*seamonkey)(?=.*firefox).*/i.test(navigator.userAgent);

/**
 * Detects if the current browser engine is WebKit.
 *
 * @example
 * ```typescript
 * import { IS_WEBKIT } from "@beep/utils"
 *
 * if (IS_WEBKIT) {
 *   console.log("Running on WebKit engine")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_WEBKIT = isNavigatorDefined && /applewebkit(?!.*chrome)/i.test(navigator.userAgent);

/**
 * Detects if the current browser is legacy Edge (versions before 79).
 *
 * @example
 * ```typescript
 * import { IS_EDGE_LEGACY } from "@beep/utils"
 *
 * if (IS_EDGE_LEGACY) {
 *   console.log("Running on legacy Edge browser")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_EDGE_LEGACY = isNavigatorDefined && /edge?\/(?:[0-6]\d|[0-7][0-8])\./i.test(navigator.userAgent);

/**
 * Detects if the current browser is Chrome.
 *
 * @example
 * ```typescript
 * import { IS_CHROME } from "@beep/utils"
 *
 * if (IS_CHROME) {
 *   console.log("Running on Chrome")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_CHROME = isNavigatorDefined && /chrome/i.test(navigator.userAgent);

/**
 * Detects if the current browser is legacy Chrome (version 75 or older).
 * Native beforeInput events don't work well with React on these versions.
 *
 * @example
 * ```typescript
 * import { IS_CHROME_LEGACY } from "@beep/utils"
 *
 * if (IS_CHROME_LEGACY) {
 *   console.log("Running on legacy Chrome")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_CHROME_LEGACY = isNavigatorDefined && /chrome?\/(?:[0-7][0-5]|[0-6]\d)\./i.test(navigator.userAgent);

/**
 * Detects if the current browser is legacy Chrome on Android.
 *
 * @example
 * ```typescript
 * import { IS_ANDROID_CHROME_LEGACY } from "@beep/utils"
 *
 * if (IS_ANDROID_CHROME_LEGACY) {
 *   console.log("Running on legacy Android Chrome")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_ANDROID_CHROME_LEGACY =
  IS_ANDROID && isNavigatorDefined && /chrome?\/[0-5]?\d\./i.test(navigator.userAgent);

/**
 * Detects if the current browser is legacy Firefox (before v87).
 * Firefox did not support beforeInput until v87.
 *
 * @example
 * ```typescript
 * import { IS_FIREFOX_LEGACY } from "@beep/utils"
 *
 * if (IS_FIREFOX_LEGACY) {
 *   console.log("Running on legacy Firefox")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_FIREFOX_LEGACY =
  isNavigatorDefined && /^(?!.*seamonkey)(?=.*firefox\/(?:[0-7]\d|[0-8][0-6])\.).*/i.test(navigator.userAgent);

/**
 * Detects if the current browser is UC Mobile Browser.
 *
 * @example
 * ```typescript
 * import { IS_UC_MOBILE } from "@beep/utils"
 *
 * if (IS_UC_MOBILE) {
 *   console.log("Running on UC Mobile Browser")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_UC_MOBILE = isNavigatorDefined && /.*UCBrowser/.test(navigator.userAgent);

/**
 * Detects if the current browser is WeChat Browser.
 *
 * @example
 * ```typescript
 * import { IS_WECHATBROWSER } from "@beep/utils"
 *
 * if (IS_WECHATBROWSER) {
 *   console.log("Running in WeChat Browser")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_WECHATBROWSER = isNavigatorDefined && /.*Wechat/.test(navigator.userAgent);

/**
 * Detects if the browser supports the beforeInput event correctly.
 * Firefox/Edge Legacy don't support beforeInput, and Chrome Legacy doesn't support it correctly.
 *
 * @example
 * ```typescript
 * import { HAS_BEFORE_INPUT_SUPPORT } from "@beep/utils"
 *
 * if (HAS_BEFORE_INPUT_SUPPORT) {
 *   console.log("beforeInput event is supported")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const HAS_BEFORE_INPUT_SUPPORT =
  (!IS_CHROME_LEGACY || !IS_ANDROID_CHROME_LEGACY) &&
  !IS_EDGE_LEGACY &&
  // globalThis is undefined in older browsers
  globalThis?.InputEvent &&
  typeof globalThis.InputEvent.prototype.getTargetRanges === "function";

/**
 * Detects if the current device is a mobile device.
 *
 * @example
 * ```typescript
 * import { IS_MOBILE } from "@beep/utils"
 *
 * if (IS_MOBILE) {
 *   console.log("Running on mobile device")
 * }
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const IS_MOBILE =
  isNavigatorDefined && /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);

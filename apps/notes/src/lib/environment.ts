import React from "react";

export const REACT_MAJOR_VERSION = Number.parseInt(React.version.split(".")[0] ?? "18", 10);

export const IS_IOS =
  typeof navigator !== "undefined" &&
  typeof window !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as any).MSStream;

export const IS_APPLE = typeof navigator !== "undefined" && navigator.userAgent.includes("Mac OS X");

export const IS_ANDROID = typeof navigator !== "undefined" && navigator.userAgent.includes("Android");

export const IS_FIREFOX =
  typeof navigator !== "undefined" && /^(?!.*seamonkey)(?=.*firefox).*/i.test(navigator.userAgent);

export const IS_WEBKIT = typeof navigator !== "undefined" && /applewebkit(?!.*chrome)/i.test(navigator.userAgent);

// "modern" Edge was released at 79.x
export const IS_EDGE_LEGACY =
  typeof navigator !== "undefined" && /edge?\/(?:[0-6]\d|[0-7][0-8])\./i.test(navigator.userAgent);

export const IS_CHROME = typeof navigator !== "undefined" && /chrome/i.test(navigator.userAgent);

// Native `beforeInput` events don't work well with react on Chrome 75
// and older, Chrome 76+ can use `beforeInput` though.
export const IS_CHROME_LEGACY =
  typeof navigator !== "undefined" && /chrome?\/(?:[0-7][0-5]|[0-6]\d)\./i.test(navigator.userAgent);

export const IS_ANDROID_CHROME_LEGACY =
  IS_ANDROID && typeof navigator !== "undefined" && /chrome?\/[0-5]?\d\./i.test(navigator.userAgent);

// Firefox did not support `beforeInput` until `v87`.
export const IS_FIREFOX_LEGACY =
  typeof navigator !== "undefined" &&
  /^(?!.*seamonkey)(?=.*firefox\/(?:[0-7]\d|[0-8][0-6])\.).*/i.test(navigator.userAgent);

// UC mobile browser
export const IS_UC_MOBILE = typeof navigator !== "undefined" && /.*UCBrowser/.test(navigator.userAgent);

// Wechat browser
export const IS_WECHATBROWSER = typeof navigator !== "undefined" && /.*Wechat/.test(navigator.userAgent);

// Check if DOM is available as React does internally.
// https://github.com/facebook/react/blob/master/packages/shared/ExecutionEnvironment.js
// export const CAN_USE_DOM = !!(
//   typeof window !== 'undefined' &&
//   window.document !== undefined &&
//   window.document.createElement !== undefined
// );

// COMPAT: Firefox/Edge Legacy don't support the `beforeinput` event
// Chrome Legacy doesn't support `beforeinput` correctly
export const HAS_BEFORE_INPUT_SUPPORT =
  (!IS_CHROME_LEGACY || !IS_ANDROID_CHROME_LEGACY) &&
  !IS_EDGE_LEGACY &&
  // globalThis is undefined in older browsers
  globalThis?.InputEvent &&
  typeof globalThis.InputEvent.prototype.getTargetRanges === "function";

export const IS_MOBILE =
  typeof navigator !== "undefined" &&
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);

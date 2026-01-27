/**
 * Lexical utility functions.
 *
 * @since 0.1.0
 */

// Document serialization (Effect-based)
export {
  docFromHash,
  docFromHashPromise,
  docToHash,
  docToHashPromise,
} from "./docSerialization";
// Focus utilities
export * from "./focusUtils";
// DOM utilities (not refactored - DOM-centric)
export { getDOMRangeRect } from "./getDOMRangeRect";
// Selection utilities
export { getSelectedNode } from "./getSelectedNode";
// Theme utilities
export { getThemeSelector } from "./getThemeSelector";
export { setFloatingElemPosition } from "./setFloatingElemPosition";
export { setFloatingElemPositionForLinkEditor } from "./setFloatingElemPositionForLinkEditor";
// Swipe gesture listeners
export {
  addSwipeDownListener,
  addSwipeLeftListener,
  addSwipeRightListener,
  addSwipeUpListener,
} from "./swipe";
// URL utilities
export { sanitizeUrl, validateUrl } from "./url";

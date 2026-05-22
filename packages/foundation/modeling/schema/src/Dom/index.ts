/**
 * DOM and React-adjacent schema concepts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * @category schemas
 * @since 0.0.0
 */
export { DOMCssProperties, DomCssProperties, isCSSProperties } from "../DomCssProperties/index.ts";
/**
 * @category schemas
 * @since 0.0.0
 */
export {
  DOMDragEvent,
  type DOMDragEvent as DOMDragEventValue,
  DomDragEvent,
  isDragEvent,
} from "../DomDragEvent/index.ts";
/**
 * @category schemas
 * @since 0.0.0
 */
export { DOMEvent, type DOMEvent as DOMEventValue, DomEvent, isEvent } from "../DomEvent/index.ts";
/**
 * @category schemas
 * @since 0.0.0
 */
export {
  DOMHtmlElement,
  type DOMHtmlElement as DOMHtmlElementValue,
  DomHtmlElement,
  isHTMLElement,
} from "../DomHtmlElement/index.ts";
/**
 * @category schemas
 * @since 0.0.0
 */
export {
  DOMMouseEvent,
  type DOMMouseEvent as DOMMouseEventValue,
  DomMouseEvent,
  isMouseEvent,
} from "../DomMouseEvent/index.ts";
/**
 * @category schemas
 * @since 0.0.0
 */
export {
  createDOMRefSchema,
  DOMReactNode,
  type DOMReactNode as DOMReactNodeValue,
  DomReactNode,
  isReactNode,
  isReactRef,
} from "../DomReactNode/index.ts";

import type { UnsafeTypes } from "@beep/types";
import type { JsonRect } from "./model/JsonModel.ts";
import { Orientation } from "./Orientation";

interface Insets {
  readonly top: number;
  readonly left: number;
  readonly bottom: number;
  readonly right: number;
}


export class Rect {
  static readonly empty = (): Rect => {
    return new Rect(0, 0, 0, 0);
  };

  static readonly fromJson = (json: JsonRect): Rect => {
    return new Rect(json.x, json.y, json.width, json.height);
  };

  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  readonly toJson = () => {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  };

  readonly snap = (round: number) => {
    this.x = Math.round(this.x / round) * round;
    this.y = Math.round(this.y / round) * round;
    this.width = Math.round(this.width / round) * round;
    this.height = Math.round(this.height / round) * round;
  };

  static readonly getBoundingClientRect = (element: Element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return new Rect(x, y, width, height);
  };

  static readonly getContentRect = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    const paddingLeft = Number.parseFloat(style.paddingLeft);
    const paddingRight = Number.parseFloat(style.paddingRight);
    const paddingTop = Number.parseFloat(style.paddingTop);
    const paddingBottom = Number.parseFloat(style.paddingBottom);
    const borderLeftWidth = Number.parseFloat(style.borderLeftWidth);
    const borderRightWidth = Number.parseFloat(style.borderRightWidth);
    const borderTopWidth = Number.parseFloat(style.borderTopWidth);
    const borderBottomWidth = Number.parseFloat(style.borderBottomWidth);

    const contentWidth = rect.width - borderLeftWidth - paddingLeft - paddingRight - borderRightWidth;
    const contentHeight = rect.height - borderTopWidth - paddingTop - paddingBottom - borderBottomWidth;

    return new Rect(
      rect.left + borderLeftWidth + paddingLeft,
      rect.top + borderTopWidth + paddingTop,
      contentWidth,
      contentHeight
    );
  };

  static readonly fromDomRect = (domRect: DOMRect) => {
    return new Rect(domRect.x, domRect.y, domRect.width, domRect.height);
  };

  readonly relativeTo = (r: Rect | DOMRect) => {
    return new Rect(this.x - r.x, this.y - r.y, this.width, this.height);
  };

  readonly clone = () => {
    return new Rect(this.x, this.y, this.width, this.height);
  };

  readonly equals = (rect: Rect | null | undefined) => {
    return this.x === rect?.x && this.y === rect?.y && this.width === rect?.width && this.height === rect?.height;
  };

  readonly equalSize = (rect: Rect | null | undefined) => {
    return this.width === rect?.width && this.height === rect?.height;
  };

  readonly getBottom = () => {
    return this.y + this.height;
  };

  readonly getRight = () => {
    return this.x + this.width;
  };

  get bottom() {
    return this.y + this.height;
  }

  get right() {
    return this.x + this.width;
  }

  readonly getCenter = () => {
    return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
  };

  readonly positionElement = (element: HTMLElement, position?: undefined | string) => {
    this.styleWithPosition(element.style, position);
  };

  readonly styleWithPosition = (style: Record<string, UnsafeTypes.UnsafeAny>, position = "absolute") => {
    style.left = `${this.x}px`;
    style.top = `${this.y}px`;
    style.width = `${Math.max(0, this.width)}px`; // need Math.max to prevent -ve, cause error in IE
    style.height = `${Math.max(0, this.height)}px`;
    style.position = position;
    return style;
  };

  readonly contains = (x: number, y: number) => {
    return this.x <= x && x <= this.getRight() && this.y <= y && y <= this.getBottom();
  };

  readonly removeInsets = (insets: Insets) => {
    return new Rect(
      this.x + insets.left,
      this.y + insets.top,
      Math.max(0, this.width - insets.left - insets.right),
      Math.max(0, this.height - insets.top - insets.bottom)
    );
  };

  readonly centerInRect = (outerRect: Rect) => {
    this.x = (outerRect.width - this.width) / 2;
    this.y = (outerRect.height - this.height) / 2;
  };

  /** @internal */
  readonly _getSize = (orientation: Orientation) => {
    let prefSize = this.width;
    if (orientation === Orientation.VERT) {
      prefSize = this.height;
    }
    return prefSize;
  };

  readonly toString = () => {
    return `(Rect: x=${this.x}, y=${this.y}, width=${this.width}, height=${this.height})`;
  };
}

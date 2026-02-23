import type { UnsafeTypes } from "@beep/types";
import type * as React from "react";
import type { TabNode } from "../model/TabNode";

/** Interface for layout customization callbacks - avoids circular import with Layout.tsx */
interface ILayoutCustomizer {
  customizeTab(
    tabNode: TabNode,
    renderValues: { leading: React.ReactNode; content: React.ReactNode; name: string; buttons: UnsafeTypes.UnsafeAny[] }
  ): void;
}

/** @internal */
export function isDesktop() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}
/** @internal */
export function getRenderStateEx(layout: ILayoutCustomizer, node: TabNode, iconAngle?: number) {
  let leadingContent = undefined;
  const titleContent: React.ReactNode = node.getName();
  const name = node.getName();
  if (iconAngle === undefined) {
    iconAngle = 0;
  }

  if (node.getIcon() !== undefined) {
    if (iconAngle !== 0) {
      leadingContent = (
        <img
          style={{ width: "1em", height: "1em", transform: `rotate(${iconAngle}deg)` }}
          src={node.getIcon()}
          alt="leadingContent"
        />
      );
    } else {
      leadingContent = <img style={{ width: "1em", height: "1em" }} src={node.getIcon()} alt="leadingContent" />;
    }
  }

  const buttons: UnsafeTypes.UnsafeAny[] = [];

  // allow customization of leading contents (icon) and contents
  const renderState = { leading: leadingContent, content: titleContent, name, buttons };
  layout.customizeTab(node, renderState);

  node.setRenderedName(renderState.name);

  return renderState;
}

/** @internal */
export function isAuxMouseEvent(event: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) {
  let auxEvent = false;
  if (event.nativeEvent instanceof MouseEvent) {
    if (event.nativeEvent.button !== 0 || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
      auxEvent = true;
    }
  }
  return auxEvent;
}

export function enablePointerOnIFrames(enable: boolean, currentDocument: Document) {
  const iframes = [
    ...getElementsByTagName("iframe", currentDocument),
    ...getElementsByTagName("webview", currentDocument),
  ];

  for (const iframe of iframes) {
    (iframe as HTMLElement).style.pointerEvents = enable ? "auto" : "none";
  }
}

export function getElementsByTagName(tag: string, currentDocument: Document): Element[] {
  return [...currentDocument.getElementsByTagName(tag)];
}

export function startDrag(
  doc: Document,
  event: React.PointerEvent<HTMLElement>,
  drag: (x: number, y: number) => void,
  dragEnd: () => void,
  dragCancel: () => void
) {
  event.preventDefault();

  const pointerMove = (ev: PointerEvent) => {
    ev.preventDefault();
    drag(ev.clientX, ev.clientY);
  };

  const pointerCancel = (ev: PointerEvent) => {
    ev.preventDefault();
    dragCancel();
  };
  const pointerUp = () => {
    doc.removeEventListener("pointermove", pointerMove);
    doc.removeEventListener("pointerup", pointerUp);
    doc.removeEventListener("pointercancel", pointerCancel);
    dragEnd();
  };

  doc.addEventListener("pointermove", pointerMove);
  doc.addEventListener("pointerup", pointerUp);
  doc.addEventListener("pointercancel", pointerCancel);
}

export function copyInlineStyles(source: HTMLElement, target: HTMLElement): boolean {
  // Get the inline style attribute from the source element
  const sourceStyle = source.getAttribute("style");
  const targetStyle = target.getAttribute("style");
  if (sourceStyle === targetStyle) return false;

  // console.log("copyInlineStyles", sourceStyle);

  if (sourceStyle) {
    // Set the style attribute on the target element
    target.setAttribute("style", sourceStyle);
  } else {
    // If the source has no inline style, clear the target's style attribute
    target.removeAttribute("style");
  }
  return true;
}

export function isSafari() {
  const userAgent = navigator.userAgent;
  return userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Chromium");
}

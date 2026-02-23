import * as A from "effect/Array";
import * as React from "react";
import { Actions } from "../model/Actions";
import { BorderNode } from "../model/BorderNode";
import { RowNode } from "../model/RowNode";
import { Orientation } from "../Orientation";
import { Rect } from "../Rect";
import { CLASSES } from "../Types";
import type { ILayoutInternal } from "./LayoutTypes";
import { enablePointerOnIFrames, isDesktop, startDrag } from "./Utils";

/** @internal */
export interface ISplitterProps {
  readonly layout: ILayoutInternal;
  readonly node: RowNode | BorderNode;
  readonly index: number;
  readonly horizontal: boolean;
}

interface InitialSizes {
  readonly initialSizes: number[];
  readonly sum: number;
  readonly startPosition: number;
}

/** @internal */
export let splitterDragging = false; // used in tabset & borderTab

/** @internal */
export const Splitter = (props: ISplitterProps) => {
  const { layout, node, index, horizontal } = props;

  const [dragging, setDragging] = React.useState<boolean>(false);
  const selfRef = React.useRef<HTMLDivElement | null>(null);
  const extendedRef = React.useRef<HTMLDivElement | null>(null);
  const pBounds = React.useRef<number[]>([]);
  const outlineDiv = React.useRef<HTMLDivElement | undefined>(undefined);
  const handleDiv = React.useRef<HTMLDivElement | undefined>(undefined);
  const dragStartX = React.useRef<number>(0);
  const dragStartY = React.useRef<number>(0);
  const initalSizes = React.useRef<InitialSizes>({
    initialSizes: [],
    sum: 0,
    startPosition: 0,
  });
  // const throttleTimer = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const size = node.getModel().getSplitterSize();
  let extra = node.getModel().getSplitterExtra();

  if (!isDesktop()) {
    // make hit test area on mobile at least 20px
    extra = Math.max(20, extra + size) - size;
  }

  React.useEffect(() => {
    // Android fix: must have passive touchstart handler to prevent default handling
    selfRef.current?.addEventListener("touchstart", onTouchStart, { passive: false });
    extendedRef.current?.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => {
      selfRef.current?.removeEventListener("touchstart", onTouchStart);
      extendedRef.current?.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  const onTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    event.stopPropagation();
    if (node instanceof RowNode) {
      initalSizes.current = node.getSplitterInitials(index);
    }

    enablePointerOnIFrames(false, layout.getCurrentDocument()!);
    startDrag(event.currentTarget.ownerDocument, event, onDragMove, onDragEnd, onDragCancel);

    pBounds.current = node.getSplitterBounds(index, true);
    const rootdiv = layout.getRootDiv();
    outlineDiv.current = layout.getCurrentDocument()!.createElement("div");
    outlineDiv.current.style.flexDirection = horizontal ? "row" : "column";
    outlineDiv.current.className = layout.getClassName(CLASSES.FLEXLAYOUT__SPLITTER_DRAG);
    outlineDiv.current.style.cursor = node.getOrientation() === Orientation.VERT ? "ns-resize" : "ew-resize";

    if (node.getModel().isSplitterEnableHandle()) {
      handleDiv.current = layout.getCurrentDocument()!.createElement("div");
      handleDiv.current.className =
        cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE) +
        " " +
        (horizontal ? cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_HORZ) : cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_VERT));
      outlineDiv.current.appendChild(handleDiv.current);
    }

    const selfElement = selfRef.current;
    if (!selfElement) {
      return;
    }
    const r = selfElement.getBoundingClientRect();
    const rect = new Rect(r.x - layout.getDomRect()!.x, r.y - layout.getDomRect()!.y, r.width, r.height);

    dragStartX.current = event.clientX - r.x;
    dragStartY.current = event.clientY - r.y;

    rect.positionElement(outlineDiv.current);
    if (rootdiv) {
      rootdiv.appendChild(outlineDiv.current);
    }

    setDragging(true);
    splitterDragging = true;
  };

  const onDragCancel = () => {
    const rootdiv = layout.getRootDiv();
    if (rootdiv && outlineDiv.current) {
      rootdiv.removeChild(outlineDiv.current as Element);
    }
    outlineDiv.current = undefined;
    setDragging(false);
    splitterDragging = false;
  };

  const onDragMove = (x: number, y: number) => {
    if (outlineDiv.current) {
      const clientRect = layout.getDomRect();
      if (!clientRect) {
        return;
      }
      if (node.getOrientation() === Orientation.VERT) {
        const newTop = getBoundPosition(y - clientRect.y - dragStartY.current);
        outlineDiv.current!.style.top = `${newTop}px`;
      } else {
        const newLeft = getBoundPosition(x - clientRect.x - dragStartX.current);
        outlineDiv.current!.style.left = `${newLeft}px`;
      }

      if (layout.isRealtimeResize()) {
        updateLayout(true);
      }
    }
  };

  const onDragEnd = () => {
    if (outlineDiv.current) {
      updateLayout(false);

      const rootdiv = layout.getRootDiv();
      if (rootdiv && outlineDiv.current) {
        rootdiv.removeChild(outlineDiv.current as HTMLElement);
      }
      outlineDiv.current = undefined;
    }
    enablePointerOnIFrames(true, layout.getCurrentDocument()!);
    setDragging(false);
    splitterDragging = false;
  };

  const updateLayout = (_realtime: boolean) => {
    const redraw = () => {
      if (outlineDiv.current) {
        let value = 0;
        if (node.getOrientation() === Orientation.VERT) {
          value = outlineDiv.current!.offsetTop;
        } else {
          value = outlineDiv.current!.offsetLeft;
        }

        if (node instanceof BorderNode) {
          const pos = (node as BorderNode).calculateSplit(node, value);
          layout.doAction(Actions.adjustBorderSplit(node.getId(), pos));
        } else {
          const init = initalSizes.current;
          const weights = node.calculateSplit(index, value, init.initialSizes, init.sum, init.startPosition);
          layout.doAction(Actions.adjustWeights(node.getId(), weights));
        }
      }
    };

    redraw();
  };

  const isBoundsTuple = (arr: number[]): arr is [number, number] => {
    return A.isNonEmptyArray(arr) && arr.length === 2;
  };

  const getBoundPosition = (p: number) => {
    const bounds = pBounds.current;
    if (!isBoundsTuple(bounds)) {
      return p;
    }

    let rtn = p;
    if (p < bounds[0]) {
      rtn = bounds[0];
    }
    if (p > bounds[1]) {
      rtn = bounds[1];
    }

    return rtn;
  };

  const cm = layout.getClassName;
  const style: React.CSSProperties = {
    cursor: horizontal ? "ew-resize" : "ns-resize",
    flexDirection: horizontal ? "column" : "row",
  };
  let className = `${cm(CLASSES.FLEXLAYOUT__SPLITTER)} ${cm(CLASSES.FLEXLAYOUT__SPLITTER_ + node.getOrientation().getName())}`;

  if (node instanceof BorderNode) {
    className += ` ${cm(CLASSES.FLEXLAYOUT__SPLITTER_BORDER)}`;
  } else {
    if (node.getModel().getMaximizedTabset(layout.getWindowId()) !== undefined) {
      style.display = "none";
    }
  }

  if (horizontal) {
    style.width = `${size}px`;
    style.minWidth = `${size}px`;
  } else {
    style.height = `${size}px`;
    style.minHeight = `${size}px`;
  }

  let handle: React.ReactNode;
  if (!dragging && node.getModel().isSplitterEnableHandle()) {
    handle = (
      <div
        className={
          cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE) +
          " " +
          (horizontal ? cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_HORZ) : cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_VERT))
        }
      />
    );
  }

  if (extra === 0) {
    return (
      <div
        className={className}
        style={style}
        ref={selfRef}
        data-layout-path={`${node.getPath()}/s${index - 1}`}
        onPointerDown={onPointerDown}
      >
        {handle}
      </div>
    );
  }
  // add extended transparent div for hit testing

  const style2: React.CSSProperties = {};
  if (node.getOrientation() === Orientation.HORZ) {
    style2.height = "100%";
    style2.width = `${size + extra}px`;
    style2.cursor = "ew-resize";
  } else {
    style2.height = `${size + extra}px`;
    style2.width = "100%";
    style2.cursor = "ns-resize";
  }

  const className2 = cm(CLASSES.FLEXLAYOUT__SPLITTER_EXTRA);

  return (
    <div
      className={className}
      style={style}
      ref={selfRef}
      data-layout-path={`${node.getPath()}/s${index - 1}`}
      onPointerDown={onPointerDown}
    >
      <div style={style2} ref={extendedRef} className={className2} onPointerDown={onPointerDown} />
    </div>
  );
};

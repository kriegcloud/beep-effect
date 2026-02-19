"use client";

import { useCookieStorage } from "@beep/notes/hooks/useCookieStorage";
import { RightPanelType } from "@beep/notes/hooks/useResizablePanel";
// Import from shared schema file so it can be used by Server Components
import { type Layout, parseLayout } from "@beep/notes/lib/layout-schema";
import { cn } from "@beep/notes/lib/utils";
import React, { useCallback, useContext, useEffect, useState } from "react";

// Re-export for backwards compatibility with existing imports
export { parseLayout, type Layout };

interface PanelsContextProps {
  readonly hiddenLeft: boolean;
  readonly hiddenRight: boolean;
  readonly leftSize: number;
  readonly rightPanelType: RightPanelType;
  readonly rightSize: number;
  readonly serverPersistenceId: string;
  readonly setLeftSize: React.Dispatch<React.SetStateAction<number>>;
  readonly setRightPanelType: React.Dispatch<React.SetStateAction<RightPanelType>>;
  readonly setRightSize: React.Dispatch<React.SetStateAction<number>>;
  readonly onLayout: (layout: Layout) => void;
  readonly onRightPanelTypeChange?: undefined | ((type: RightPanelType) => void);
}

export const PanelsContext = React.createContext<Partial<PanelsContextProps>>({});

interface ResizablePanelGroupProps {
  readonly initLeftSize: number;
  readonly initRightSize: number;
  readonly serverPersistenceId: string;
  readonly serverPersistenceRightPanelType: string;
  readonly className?: undefined | string;
  readonly hiddenLeft?: undefined | boolean;
  readonly hiddenRight?: undefined | boolean;
  readonly onLayout?: undefined | ((layout: Layout) => void);
  readonly onRightPanelTypeChange?: undefined | ((type: RightPanelType) => void);
}

export const ResizablePanelGroup = React.memo(
  ({ children, className, ...props }: React.PropsWithChildren<ResizablePanelGroupProps>) => {
    const {
      hiddenLeft,
      hiddenRight,
      initLeftSize,
      initRightSize,
      serverPersistenceId,
      serverPersistenceRightPanelType,
      onLayout,
      onRightPanelTypeChange,
    } = props;

    const [layout] = useCookieStorage<Layout>(serverPersistenceId, {
      leftSize: initLeftSize,
      rightSize: initRightSize,
    });

    const [rightPanelTypeLocal] = useCookieStorage<RightPanelType>(
      serverPersistenceRightPanelType,
      RightPanelType.comment
    );

    // TODO:The layout flickers on a small screen when cookies not exit.
    // It's a bit difficult to fix, but it's the best outcome given the circumstances.
    const [leftSize, setLeftSize] = React.useState(layout.leftSize ?? initLeftSize);
    const [rightSize, setRightSize] = React.useState(layout.rightSize ?? (hiddenRight ? 0 : initRightSize));

    const [rightPanelTypeState, setRightPanelType] = React.useState<RightPanelType>(rightPanelTypeLocal);

    return (
      <PanelsContext.Provider
        value={{
          hiddenLeft: Boolean(hiddenLeft),
          hiddenRight: Boolean(hiddenRight),
          leftSize,
          rightPanelType: rightPanelTypeState,
          rightSize,
          serverPersistenceId,
          setLeftSize,
          setRightPanelType,
          setRightSize,
          ...(onLayout ? { onLayout } : {}),
          ...(onRightPanelTypeChange ? { onRightPanelTypeChange } : {}),
        }}
      >
        <div className={cn("flex flex-1", className)}>{children}</div>
      </PanelsContext.Provider>
    );
  }
);

interface ResizablePanelProps {
  readonly maxSize?: undefined | number;
  readonly minSize?: undefined | number;
}

export const ResizableLeftPanel = React.memo(
  ({ children, maxSize, minSize }: React.PropsWithChildren<ResizablePanelProps>) => {
    const context = React.useContext(PanelsContext);

    if (!context) {
      throw new Error(
        `The \`ResizableLeftPanel\` component must be used inside the <ResizablePanelGroup> component's context.`
      );
    }

    const { hiddenLeft, leftSize = 0, rightSize, setLeftSize, onLayout } = context;

    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
      if (hiddenLeft) {
        setLeftSize?.(0);
        onLayout?.({ leftSize: 0, rightSize: rightSize ?? 0 });
      }
    }, [hiddenLeft, setLeftSize, onLayout, rightSize]);

    return (
      <div
        className={cn("flex h-dvh overflow-hidden", !isDragging && "transition-[width]")}
        style={{ width: leftSize }}
      >
        <div className="relative flex flex-1 bg-muted/50">
          {children}

          <ResizableHandle
            isDragging={isDragging}
            {...(maxSize !== undefined && { maxSize })}
            {...(minSize !== undefined && { minSize })}
            setIsDragging={setIsDragging}
            isLeft
          />
        </div>
      </div>
    );
  }
);

interface ResizableHandleProps {
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  isLeft?: boolean;
  maxSize?: number;
  minSize?: number;
}
const ResizableHandle = ({ className, isDragging, isLeft, maxSize, minSize, setIsDragging }: ResizableHandleProps) => {
  const context = useContext(PanelsContext);

  if (!context) {
    throw new Error(
      `The \`ResizableHandle\` component must be used inside the <ResizablePanelGroup> component's context.`
    );
  }

  const { leftSize, rightSize, setLeftSize, setRightSize, onLayout } = context;
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialPanelSize, setInitialPanelSize] = useState(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging?.(true);
      setInitialMouseX(e.clientX);
      setInitialPanelSize(isLeft ? (leftSize ?? 0) : (rightSize ?? 0));

      document.body.style.userSelect = "none";
      document.body.style.pointerEvents = "none";
      document.body.style.cursor = "col-resize";
    },
    [isLeft, leftSize, rightSize, setIsDragging]
  );

  const onMouseUp = useCallback(() => {
    setIsDragging?.(false);

    document.body.style.userSelect = "";
    document.body.style.pointerEvents = "";
    document.body.style.cursor = "";
    onLayout?.({ leftSize: leftSize ?? 0, rightSize: rightSize ?? 0 });
  }, [leftSize, onLayout, rightSize, setIsDragging]);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - initialMouseX;
        let newSize: number;

        if (isLeft) {
          newSize = initialPanelSize + deltaX;

          // recheck if the new size is within the limit
          if (newSize < (minSize ?? 0)) {
            newSize = minSize ?? 0;
          } else if (maxSize !== undefined && newSize > maxSize) {
            newSize = maxSize;
          }

          setLeftSize?.(newSize);
        } else {
          newSize = initialPanelSize - deltaX;

          // recheck if the new size is within the limit
          if (newSize < (minSize ?? 0)) {
            newSize = minSize ?? 0;
          } else if (maxSize !== undefined && newSize > maxSize) {
            newSize = maxSize;
          }

          setRightSize?.(newSize);
        }
      }
    },
    [isDragging, initialMouseX, isLeft, initialPanelSize, minSize, maxSize, setLeftSize, setRightSize]
  );

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  return (
    <div
      className={cn(
        "group absolute top-0 z-30 h-full w-[12px] cursor-col-resize border-border/60 hover:border-border",
        isLeft ? "right-0 pl-2" : "left-0 border-l pr-2",
        className
      )}
      onMouseDown={onMouseDown}
    >
      <div
        className={cn(
          "h-full opacity-0 transition-opacity group-hover:bg-border group-hover:opacity-100",
          isDragging && "opacity-100"
        )}
      />
    </div>
  );
};

interface ResizableMidPanelProps {
  className?: string;
}

export const ResizableMidPanel = React.memo(
  ({ children, className }: React.PropsWithChildren<ResizableMidPanelProps>) => {
    const context = React.useContext(PanelsContext);

    if (!context) {
      throw new Error(
        `The \`ResizableMidPanel\` component must be used inside the <ResizablePanelGroup> component's context.`
      );
    }

    return <div className={cn("flex-1", className)}>{children}</div>;
  }
);

export const ResizableRightPanel = React.memo(
  ({ children, maxSize, minSize }: React.PropsWithChildren<ResizablePanelProps>) => {
    const context = React.useContext(PanelsContext);

    if (!context) {
      throw new Error(
        `The \`ResizableRightPanel\` component must be used inside the <ResizablePanelGroup> component's context.`
      );
    }

    const { hiddenRight, leftSize, rightSize = 0, setRightSize, onLayout } = context;
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
      if (hiddenRight) {
        setRightSize?.(0);
        onLayout?.({ leftSize: leftSize ?? 0, rightSize: 0 });
      }
    }, [hiddenRight, setRightSize, onLayout, leftSize]);

    return (
      <div
        className={cn("relative flex h-full overflow-hidden", !isDragging && "transition-[width]")}
        style={{ width: rightSize }}
      >
        <ResizableHandle
          isDragging={isDragging}
          {...(maxSize !== undefined && { maxSize })}
          {...(minSize !== undefined && { minSize })}
          setIsDragging={setIsDragging}
        />

        <div className="flex-1">{children}</div>
      </div>
    );
  }
);

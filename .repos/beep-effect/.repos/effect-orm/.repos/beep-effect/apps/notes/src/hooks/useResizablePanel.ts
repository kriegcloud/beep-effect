import { PanelsContext } from "@beep/notes/components/ui/resizable-panel";
import * as S from "effect/Schema";
import React from "react";

export const useToggleLeftPanel = () => {
  const context = React.useContext(PanelsContext);

  if (!context) {
    throw new Error(`The \`useHideLeftPanel\` hook must be used inside the <ResizablePanelGroup> component's context.`);
  }

  const { leftSize = 0, rightSize, setLeftSize, onLayout } = context;

  return React.useCallback(
    (openSize = 240) => {
      const isClose = leftSize === 0;
      const newVal = isClose ? openSize : 0;

      if (isClose) {
        setLeftSize?.(newVal);
      } else {
        setLeftSize?.(newVal);
      }

      onLayout?.({ leftSize: newVal, rightSize: rightSize ?? 0 });
    },
    [leftSize, onLayout, rightSize, setLeftSize]
  );
};

export const RightPanelType = {
  history: 0,
  comment: 1,
} as const;

export const RightPanelTypeSchema = S.Literal(0, 1);

export type RightPanelType = (typeof RightPanelType)[keyof typeof RightPanelType];

export const useToggleRightPanel = () => {
  const context = React.useContext(PanelsContext);

  if (!context) {
    throw new Error(
      `The \`useHideRightPanel\` hook must be used inside the <ResizablePanelGroup> component's context.`
    );
  }

  const { leftSize, rightPanelType, rightSize, setRightPanelType, setRightSize, onLayout, onRightPanelTypeChange } =
    context;

  return React.useCallback(
    (type: RightPanelType, openSize = 240) => {
      const isClose = rightSize === 0;
      const newVal = isClose ? openSize : 0;
      const needUpdateSize = isClose || rightPanelType === type;

      if (needUpdateSize) {
        setRightSize?.(newVal);
        onLayout?.({ leftSize: leftSize ?? 0, rightSize: newVal });
      }

      setRightPanelType?.(type);
      onRightPanelTypeChange?.(type);
    },
    [rightSize, setRightPanelType, onRightPanelTypeChange, onLayout, leftSize, setRightSize, rightPanelType]
  );
};

export const useLeftPanelSize = () => {
  const context = React.useContext(PanelsContext);

  if (!context) {
    throw new Error(`The \`useLeftPanelSize\` hook must be used inside the <ResizablePanelGroup> component's context.`);
  }

  const { leftSize } = context;

  return React.useMemo(() => leftSize, [leftSize]);
};

export const useRightPanelSize = () => {
  const context = React.useContext(PanelsContext);

  if (!context) {
    throw new Error(
      `The \`useRightPanelSize\` hook must be used inside the <ResizablePanelGroup> component's context.`
    );
  }

  const { rightSize } = context;

  return React.useMemo(() => rightSize, [rightSize]);
};

export const useRightPanelOpen = () => {
  const rightSize = useRightPanelSize();

  return React.useMemo(() => rightSize && rightSize > 0, [rightSize]);
};

export const useRightPanelType = () => {
  const context = React.useContext(PanelsContext);

  if (!context) {
    throw new Error(
      `The \`useRightPanelType\` hook must be used inside the <ResizablePanelGroup> component's context.`
    );
  }

  const { rightPanelType } = context;

  return React.useMemo(() => rightPanelType, [rightPanelType]);
};

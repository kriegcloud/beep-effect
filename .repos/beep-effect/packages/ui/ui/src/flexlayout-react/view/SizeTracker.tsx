import * as React from "react";
import { I18nLabel } from "../I18nLabel";
import type { TabNode } from "../model/TabNode";
import type { Rect } from "../Rect";
import { ErrorBoundary } from "./ErrorBoundary";
import type { ILayoutInternal } from "./LayoutTypes";

export interface ISizeTrackerProps {
  readonly layout: ILayoutInternal;
  readonly node: TabNode;
  readonly rect: Rect;
  readonly visible: boolean;
  readonly forceRevision: number;
  readonly tabsRevision: number;
}

export const SizeTracker = React.memo(({ layout, node }: ISizeTrackerProps) => {
  return (
    <ErrorBoundary
      message={layout.i18nName(I18nLabel.DecodedEnum.Error_rendering_component)}
      retryText={layout.i18nName(I18nLabel.DecodedEnum.Error_rendering_component_retry)}
    >
      {layout.props.factory(node)}
    </ErrorBoundary>
  );
}, arePropsEqual);

// only re-render if visible && (size changed or forceRevision changed or tabsRevision changed)
function arePropsEqual(prevProps: ISizeTrackerProps, nextProps: ISizeTrackerProps) {
  const reRender =
    nextProps.visible &&
    (!prevProps.rect.equalSize(nextProps.rect) ||
      prevProps.forceRevision !== nextProps.forceRevision ||
      prevProps.tabsRevision !== nextProps.tabsRevision);
  return !reRender;
}

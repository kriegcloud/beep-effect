import { CLASSES } from "../Types";
import type { ILayoutInternal } from "./LayoutTypes";

/** @internal */
export interface IOverlayProps {
  readonly layout: ILayoutInternal;
  readonly show: boolean;
}

/** @internal */
export const Overlay = (props: IOverlayProps) => {
  const { layout, show } = props;

  return (
    <div
      className={layout.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_OVERLAY)}
      style={{ display: show ? "flex" : "none" }}
    />
  );
};

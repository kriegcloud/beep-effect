/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

export const selectionValue: any = (
  <fragment>
    <hh2>Block Selection</hh2>

    <hp>There are multiple ways to select entire blocks:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Click and drag from the editor margin to select multiple blocks</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Click a block drag handle</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Right-click a block</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Click the triple dot button in the top-right corner (e.g. media blocks)</htext>
    </hp>
    <hp>Advanced selection techniques:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Hold Shift while dragging to select non-contiguous blocks</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Drag near the editor edges to auto-scroll while selecting</htext>
    </hp>
  </fragment>
);

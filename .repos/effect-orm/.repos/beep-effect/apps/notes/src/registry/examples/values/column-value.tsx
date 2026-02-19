/** @jsxRuntime/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

export const columnValue: any = (
  <fragment>
    <hh2>Columns</hh2>
    <hp>Organize your content into multiple columns for better layout and readability.</hp>
    <hp>How to create and use columns:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Type "/column" to trigger the column menu.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Alternatively, select any block, open the block menu, and choose "Turn into" "3 columns".</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>The selected block will automatically go into the first column.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Use keyboard arrow keys to navigate between different columns.</htext>
    </hp>
    <hp>Example of a 3-column layout:</hp>
    <hcolumngroup layout={[33, 33, 33]}>
      <hcolumn>
        <hp>Column 1</hp>
      </hcolumn>
      <hcolumn>
        <hp>Column 2</hp>
      </hcolumn>
      <hcolumn>
        <hp>Column 3</hp>
      </hcolumn>
    </hcolumngroup>
    <hp>
      <htext />
    </hp>
  </fragment>
);

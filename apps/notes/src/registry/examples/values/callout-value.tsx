/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

export const calloutValue: any = (
  <fragment>
    <hh2>Callout</hh2>
    <hp>Use callouts to highlight important information or add special notes to your document.</hp>
    <hp>How to use callouts:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Type "/callout" to trigger the callout menu and insert a callout.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Click on the default emoji to modify it and choose a different one.</htext>
    </hp>
    <hp>Example of a callout:</hp>
    <hcallout variant="info" icon="💡">
      <htext>This is an example callout. You can change the emoji by clicking on it, and add your content here.</htext>
    </hcallout>
    <hp>
      <htext />
    </hp>
  </fragment>
);

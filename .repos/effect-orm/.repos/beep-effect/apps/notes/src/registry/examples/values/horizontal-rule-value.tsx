/** @jsxRuntime/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";
import { KEYS } from "platejs";

jsx;

export const horizontalRuleValue: any = (
  <fragment>
    <hh2>Horizontal Rule</hh2>
    <hp>Add horizontal rules to visually separate sections and content within your document.</hp>
    <hp>How to use horizontal rules:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Type "---" to insert a horizontal rule.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>To delete a horizontal rule, click on it and press "Backspace".</htext>
    </hp>
    <element type={KEYS.hr}>
      <htext />
    </element>
    <hp>
      <htext />
    </hp>
  </fragment>
);

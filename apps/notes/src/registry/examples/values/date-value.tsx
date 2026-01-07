/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

const today = new Date().toISOString().split("T")[0];

// biome-ignore lint/suspicious/noExplicitAny: Platejs test-utils JSX returns untyped fragments
export const dateValue: any = (
  <fragment>
    <hh2>🕐 Date</hh2>
    <hp>Insert and display dates within your text using inline date elements.</hp>
    <hp>How to use dates:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Type "/date" to insert today's date automatically.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Click on an existing date to open the calendar and modify it.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Click or press "Enter" to select a new date.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Press "Esc" or click outside the menu to close it without changes.</htext>
    </hp>
    <hp>
      <htext>Examples: </htext>
      <hdate date="2024-01-01">
        <htext />
      </hdate>
      <htext> and </htext>
      <hdate date={today}>
        <htext />
      </hdate>
      <htext>. Try clicking on these dates to modify them.</htext>
    </hp>
  </fragment>
);

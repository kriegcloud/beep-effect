/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

// biome-ignore lint/suspicious/noExplicitAny: Platejs test-utils JSX returns untyped fragments
export const mentionValue: any = (
  <fragment>
    <hh2>＠ Mention</hh2>
    <hp>Use @-mentions to reference dates, people, or pages in your text.</hp>
    <hp>How to use mentions:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Type "@" to see suggestions for dates, people, and pages</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Use arrow keys to navigate and Enter to select</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Hover over </htext>
      <htext bold>page mentions</htext>
      <htext> to preview content and click to open the page</htext>
    </hp>
  </fragment>
);

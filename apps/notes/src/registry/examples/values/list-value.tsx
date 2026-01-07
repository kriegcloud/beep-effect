/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

// biome-ignore lint/suspicious/noExplicitAny: Platejs test-utils JSX returns untyped fragments
export const listValue: any = (
  <fragment>
    <hh2>🔗 List</hh2>
    <hp>Use the List plugin to create ordered and unordered lists within your text.</hp>
  </fragment>
);

/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

// biome-ignore lint/suspicious/noExplicitAny: Platejs test-utils JSX returns untyped fragments
export const tocValue: any = (
  <fragment>
    <hh1>
      <htext>Table of Contents</htext>
    </hh1>
    <hp>
      <htext>
        The Table of Contents (TOC) feature allows you to create an automatically updated overview of your document's
        structure.
      </htext>
    </hp>
    <hp>How to use the Table of Contents:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Type "/toc" and press Enter to create the TOC.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>The TOC updates automatically when you modify headings in the document.</htext>
    </hp>
    <htoc>
      <htext />
    </htoc>
    <hh2>Example Content</hh2>
    <hp>
      <htext>This is an example of content that would be reflected in the Table of Contents.</htext>
    </hp>
    <hh3>Subsection</hh3>
    <hp>
      <htext>Adding or modifying headings in your document will automatically update the TOC.</htext>
    </hp>
    <hh2>Benefits of Using TOC</hh2>
    <hp>
      <htext>
        A Table of Contents improves document navigation and provides a quick overview of your content structure.
      </htext>
    </hp>
  </fragment>
);

/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

// biome-ignore lint/suspicious/noExplicitAny: Platejs test-utils JSX returns untyped fragments
export const mediaToolbarValue: any = (
  <fragment>
    <hh2>Media Toolbar</hh2>
    <hp>
      <htext>The media toolbar provides tools for managing and customizing media elements in your document.</htext>
    </hp>
    <hp>How to use the media toolbar:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Hover over the image to reveal the controller buttons at the top right corner.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Click on the alignment icon to adjust the positioning of the media.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Use the caption button to add or edit the media caption.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Click on the download button to download the media.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Use the preview button to view the media in full size.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Open the block menu by clicking on the three dots.</htext>
    </hp>
    <himg
      align="center"
      url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFuZHNjYXBlfGVufDB8fDB8fHww"
      width="80%"
    >
      <htext />
    </himg>
    <hcallout variant="info" icon="💡">
      <htext>
        You can resize the image by dragging the handles on the left and right sides. The caption will automatically
        adjust to match the image width.
      </htext>
    </hcallout>
  </fragment>
);

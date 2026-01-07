/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

// biome-ignore lint/suspicious/noExplicitAny: Platejs test-utils JSX returns untyped fragments
export const slashMenuValue: any = (
  <fragment>
    <hh2>
      <htext>Slash Menu</htext>
    </hh2>
    <hp>
      <htext>
        The slash menu provides quick access to various formatting options, content types, and AI assistance.
      </htext>
    </hp>
    <hp>How to use the slash menu:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Type '/' anywhere in your document to open the slash menu.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Start typing to filter options or use arrow keys to navigate.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Press Enter or click to select an option.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Press Escape to close the menu without selecting.</htext>
    </hp>
    <hp>Available categories and options include:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>AI: Generate content using AI assistance</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Basic Blocks: Text, Headings, Lists, Toggle, Code Block, Table, Blockquote, Callout</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Media: Image, Video, Audio, File</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Advanced Blocks: Table of Contents, Equation, 3 Columns</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Inline Elements: Inline Equation, Date</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Turn Into: Convert blocks to different types</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Actions: Delete, Duplicate</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Text Color: Various color options</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Background Color: Various background color options</htext>
    </hp>
    <hcallout variant="info" icon="💡">
      <htext>
        Use keywords to quickly find options. For example, type '/h1' for Heading 1, '/img' for Image, or '/ai' for AI
        assistance.
      </htext>
    </hcallout>
  </fragment>
);

/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

import { createTable } from "./table-value";

jsx;

export const exportValue: any = (
  <fragment>
    <hh2>📄 Export to PDF</hh2>
    <hp>Export your documents to PDF format with customizable options for a professional output.</hp>
    <hp indent={1} listStyleType="decimal">
      <htext>Click the Export button in the top-right corner</htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>Configure export settings:</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Choose page format (A4, Letter, etc.)</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Adjust scale percentage</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Toggle media inclusion/exclusion</htext>
    </hp>
    <hcallout variant="info" icon="💡">
      <htext>Disable media option helps reduce PDF file size and improve export speed</htext>
    </hcallout>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>Export features include:</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Page numbers in footer</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Customizable margins</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Background color preservation</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>All components can be fully customized in print/export mode.</htext>
    </hp>

    <hh2>🔌 Supported Components</hh2>
    <hp>All Plate editor components are fully supported in print mode:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Basic blocks (paragraphs, headings, blockquotes)</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Rich text formatting: </htext>
      <htext bold>bold</htext>, <htext italic>italic</htext>, <htext underline>underline</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Media (images, videos, embeds)</htext>
    </hp>
    <himg
      align="center"
      url="https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      width="55%"
    >
      <htext />
    </himg>
    <hp indent={1} listStyleType="disc">
      <htext>Advanced blocks (code blocks, callouts, equations)</htext>
    </hp>
    <hcodeblock lang="javascript">
      <hcodeline>// Use code blocks to showcase code snippets</hcodeline>
      <hcodeline>{`function greet() {`}</hcodeline>
      <hcodeline>{`  console.info('Hello World!');`}</hcodeline>
      <hcodeline>{`}`}</hcodeline>
    </hcodeblock>
    <hequation texExpression="\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}">
      <htext />
    </hequation>
    <hp>
      <htext>The quadratic formula for solving </htext>
      <hinlineequation texExpression="ax^2 + bx + c = 0">
        <htext />
      </hinlineequation>
      <htext>.</htext>
    </hp>

    <hp indent={1} listStyleType="disc">
      <htext>Table</htext>
    </hp>
    {createTable()}
  </fragment>
);

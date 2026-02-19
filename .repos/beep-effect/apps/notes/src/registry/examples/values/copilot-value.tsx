/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

export const copilotValue: any = (
  <fragment>
    <hh2>
      <htext>AI Copilot</htext>
    </hh2>
    <hp>
      <htext>AI Copilot provides intelligent auto-completion suggestions as you write.</htext>
    </hp>
    <hp>How to use AI Copilot:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Position your cursor at the end of a paragraph where you want to add text.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Press "Ctrl + Space" to trigger AI auto-completion.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Press "Ctrl + Space" again for alternative AI suggestions.</htext>
    </hp>
    <hp>Accepting suggestions:</hp>
    <hp indent={1} listStyleType="disc">
      <htext bold>Tab</htext>
      <htext>: Accept the entire suggestion</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext bold>Command + Right Arrow</htext>
      <htext>: Complete one word at a time</htext>
    </hp>
    <hp>Additional features:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Ghost text remains visible as long as you continue typing the same letters as the suggestion.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Undo AI auto-completion:</htext>
      <hp indent={2} listStyleType="circle">
        <htext>Press "Ctrl + Z" to undo the entire suggestion if accepted with Tab.</htext>
      </hp>
      <hp indent={2} listStyleType="circle">
        <htext>Press "Ctrl + Z" to undo one word at a time if accepted with Command + Right Arrow.</htext>
      </hp>
    </hp>
    <hcallout variant="info" icon="💡">
      <htext>Use Command + Right Arrow to carefully review and accept parts of the suggestion.</htext>
    </hcallout>
  </fragment>
);

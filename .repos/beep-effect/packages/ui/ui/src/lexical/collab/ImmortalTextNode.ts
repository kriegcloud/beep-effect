import { $create, $getState, $getStateChange, $setState, createState, type EditorConfig, TextNode } from "lexical";

const deletedState = createState("deleted", { parse: Boolean });

// A mockup of how "soft deleting" lexical nodes might work, to prevent
// errors when one user deletes a node at the same time another user inserts
// after it.
// What's missing here is that exported JSON should exclude deleted nodes,
// since you only really need this state in memory (server.ts does not actually
// care about what's in the stream or Lexical).
// For a full implementation, you'd need to replace all node types or otherwise
// override how removal works.
// ref: https://mattweidner.com/2025/05/21/text-without-crdts.html#some-corrections
export class ImmortalTextNode extends TextNode {
  override $config() {
    return this.config("immortal-text", {
      extends: TextNode,
      stateConfigs: [{ stateConfig: deletedState }],
    });
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    if ($getState(this, deletedState) === true) {
      element.style.display = "none";
    }
    return element;
  }

  override updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const deletedChange = $getStateChange(this, prevNode, deletedState);
    if (deletedChange !== null && deletedChange[0] === true && deletedChange[1] === false) {
      dom.style.display = "none";
      return false;
    }
    return super.updateDOM(prevNode, dom, config);
  }

  // note: the preserveEmptyParent param is avoided here as we wouldn't want to
  // "hard delete" parents either. would add back in complete implemetation.
  override remove(): void {
    // "interesting" hack to ensure users can continue typing without inserting
    // text into a soft deleted immortal text node.
    if (this.getPreviousSibling() === null) {
      this.insertBefore($createImmortalTextNode(""));
    }
    $setState(this, deletedState, true);
  }
}

export function $createImmortalTextNode(text: string): ImmortalTextNode {
  return $setState($create(ImmortalTextNode).setTextContent(text), deletedState, false);
}

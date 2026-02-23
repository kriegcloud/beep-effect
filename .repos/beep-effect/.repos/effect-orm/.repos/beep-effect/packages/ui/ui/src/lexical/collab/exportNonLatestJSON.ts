import type { LexicalNode, SerializedLexicalNode } from "lexical";

// Allows JSON exporting for a node that isn't in the editor state.
// This is, uh, pretty gross since it overrides getLatest(), but I think the
// alternative is keeping a Map of destroyed NodeKeys to JSON which seems worse
export const exportNonLatestJSON = (node: LexicalNode): SerializedLexicalNode => {
  const proto = Object.getPrototypeOf(node);
  const oldGetLatest = proto.getLatest;
  proto.getLatest = function () {
    return this;
  };
  const json = node.exportJSON();
  proto.getLatest = oldGetLatest;
  return json;
};

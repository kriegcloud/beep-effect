import type { Filter, Node } from "turndown";

import TurndownService from "turndown";

import { htmlTags } from "./html-tags";

// ----------------------------------------------------------------------

type INode = HTMLElement & {
  isBlock: boolean;
};

const excludeTags = ["pre", "code"];

const turndownService = new TurndownService({ codeBlockStyle: "fenced", fence: "```" });

const filterTags = htmlTags.filter((item) => !excludeTags.includes(item)) as Filter;

/**
 * Custom rule
 * https://github.com/mixmark-io/turndown/issues/241#issuecomment-400591362
 */
turndownService.addRule("keep", {
  filter: filterTags,
  replacement(content: string, node: Node) {
    const { isBlock, outerHTML } = node as INode;

    return node && isBlock ? `\n\n${outerHTML}\n\n` : outerHTML;
  },
});

// ----------------------------------------------------------------------

export function htmlToMarkdown(html: string) {
  return turndownService.turndown(html);
}
// ----------------------------------------------------------------------

export function isMarkdownContent(content: string) {
  // Checking if the content contains Markdown-specific patterns
  const markdownPatterns = [
    /* Heading */
    /^#+\s/,
    /* List item */
    /^(\*|-|\d+\.)\s/,
    /* Code block */
    /^```/,
    /* Table */
    /^\|/,
    /* Unordered list */
    /^(\s*)[*+-] [^\r\n]+/,
    /* Ordered list */
    /^(\s*)\d+\. [^\r\n]+/,
    /* Image */
    /!\[.*?]\(.*?\)/,
    /* Link */
    /\[.*?]\(.*?\)/,
  ];

  // Checking if any of the patterns match
  return markdownPatterns.some((pattern) => pattern.test(content));
}

import type { Heading, PhrasingContent, Root } from "mdast"
import { visit } from "unist-util-visit"

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")

const extractText = (node: PhrasingContent | Heading): string => {
  if (!node) return ""
  if (node.type === "text" && "value" in node && typeof node.value === "string") {
    return node.value
  }
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map(extractText).join(" ")
  }
  return ""
}

export function remarkHeadingIds() {
  return (tree: Root) => {
    visit(tree, "heading", (node: Heading) => {
      const text = extractText(node)
      const id = slugify(text)
      if (!node.data) {
        node.data = {}
      }
      const data = node.data as Heading["data"] & {
        id?: string
        hProperties?: { id?: string; [key: string]: unknown }
      }
      data.hProperties ??= {}
      if (!data.id) {
        data.id = id
      }
      if (!data.hProperties.id) {
        data.hProperties.id = id
      }
    })
  }
}

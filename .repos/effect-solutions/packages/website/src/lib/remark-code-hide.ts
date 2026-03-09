import type { Code, Root } from "mdast"
import { visit } from "unist-util-visit"

/**
 * Remark plugin to hide parts of code blocks from display while keeping them for type checking.
 *
 * Supports two patterns:
 * 1. `// ---cut---` - Hides everything before this line (TypeScript playground style)
 * 2. `// hide-start` and `// hide-end` - Hides everything between these markers
 *
 * @example
 * ```typescript
 * // hide-start
 * interface User {
 *   id: string
 *   name: string
 * }
 * // hide-end
 *
 * const processUser = (user: User) => {
 *   console.log(user.name)
 * }
 * ```
 */
export function remarkCodeHide() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code) => {
      if (!node.value) return

      let lines = node.value.split("\n")

      // Handle ---cut--- marker (hide everything before)
      const cutIndex = lines.findIndex((line) => line.trim().match(/^\/\/\s*---cut---\s*$/))
      if (cutIndex !== -1) {
        lines = lines.slice(cutIndex + 1)
      }

      // Handle hide-start/hide-end markers
      const result: string[] = []
      let hiding = false

      for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.match(/^\/\/\s*hide-start\s*$/)) {
          hiding = true
          continue
        }

        if (trimmed.match(/^\/\/\s*hide-end\s*$/)) {
          hiding = false
          continue
        }

        if (!hiding) {
          result.push(line)
        }
      }

      node.value = result.join("\n")
    })
  }
}

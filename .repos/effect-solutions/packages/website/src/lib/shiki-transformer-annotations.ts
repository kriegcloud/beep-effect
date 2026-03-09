import type { Element, Properties } from "hast"
import type { ShikiTransformer } from "shiki"

interface Annotation {
  type: string
  selector?: {
    type: "regex" | "lineRange" | "charRange"
    value: string
  }
  content: string
  targetLine: number // The line this annotation applies to (after filtering)
  id: string
}

interface TransformerContext {
  annotations?: Annotation[]
  codeLines?: string[]
}

function getClasses(annotation: Annotation): string[] {
  const { type, content } = annotation

  switch (type) {
    case "error":
      return ["diagnostic", "diagnostic-error"]
    case "warning":
      return ["diagnostic", "diagnostic-warning"]
    case "info":
      return ["diagnostic", "diagnostic-info"]
    case "callout":
      return ["callout"]
    case "className":
      return content.split(/\s+/).filter(Boolean)
    case "border":
      return ["annotation-border"]
    case "bg":
      return ["annotation-bg"]
    case "squiggle":
      return ["diagnostic", "diagnostic-squiggle"]
    default:
      return []
  }
}

function getMessage(annotation: Annotation): string | undefined {
  const { type, content } = annotation

  if (["error", "warning", "info", "callout"].includes(type) && content.trim()) {
    return content.trim()
  }

  return undefined
}

function getCalloutAnchor(annotation: Annotation, lineText: string): number {
  if (annotation.selector?.type === "charRange") {
    const raw = annotation.selector.value
    if (raw) {
      const [startRaw, endRaw] = raw.split(":")
      if (startRaw !== undefined) {
        const start = Number.parseInt(startRaw, 10)
        const end = endRaw ? Number.parseInt(endRaw, 10) : start
        if (Number.isFinite(start) && Number.isFinite(end)) {
          return start + (end - start) / 2
        }
      }
    }
  }

  if (annotation.selector?.type === "regex") {
    try {
      const regex = new RegExp(annotation.selector.value)
      const match = regex.exec(lineText)
      if (match && match.index != null) {
        return match.index + match[0].length / 2
      }
    } catch {
      // ignore malformed regex selectors
    }
  }

  const firstNonWhitespace = lineText.search(/\S/)
  return firstNonWhitespace === -1 ? 0 : firstNonWhitespace
}

function createCalloutElement(message: string, annotationId: string, fallbackColumn: number): Element {
  const properties: Properties = {
    className: ["callout-message"],
    "data-callout-id": annotationId,
  }

  if (Number.isFinite(fallbackColumn)) {
    properties["data-fallback-column"] = String(fallbackColumn)
  }

  return {
    type: "element",
    tagName: "span",
    properties,
    children: [
      {
        type: "text",
        value: message,
      },
    ],
  }
}

export function transformerAnnotations(): ShikiTransformer {
  return {
    name: "annotations",
    preprocess(code) {
      const lines = code.split("\n")
      const annotations: Annotation[] = []
      const linesToRemove = new Set<number>()

      // Regex to parse annotations
      const annotationRegex = /^(\s*)\/\/\s*!(\w+)(?:\[([^\]]+)\]|\(([^)]+)\))?(?:\s+(.*))?$/

      // First pass: find all annotations
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line === undefined) continue
        const match = line.match(annotationRegex)

        if (match) {
          const [, , directive, bracketSelector, parenSelector, content] = match

          let selector: Annotation["selector"] | undefined

          if (bracketSelector) {
            if (bracketSelector.startsWith("/") && bracketSelector.endsWith("/")) {
              selector = {
                type: "regex",
                value: bracketSelector.slice(1, -1),
              }
            } else {
              selector = {
                type: "charRange",
                value: bracketSelector,
              }
            }
          } else if (parenSelector) {
            selector = {
              type: "lineRange",
              value: parenSelector,
            }
          }

          // Mark this line for removal
          linesToRemove.add(i)

          // Find target line (next non-annotation line)
          let targetLine = i + 1
          while (targetLine < lines.length) {
            const nextLine = lines[targetLine]
            if (nextLine === undefined) break
            if (!annotationRegex.test(nextLine)) break
            targetLine++
          }

          if (targetLine < lines.length && directive !== undefined) {
            const id = `${directive}-${annotations.length}`
            const annotation: Annotation = {
              type: directive,
              content: content || "",
              targetLine, // Store original line number, we'll adjust later
              id,
            }
            if (selector !== undefined) {
              annotation.selector = selector
            }
            annotations.push(annotation)
          }
        }
      }

      // Remove annotation lines
      const filteredLines = lines.filter((_, i) => !linesToRemove.has(i))

      // Adjust target line numbers after filtering
      const adjustedAnnotations = annotations.map((ann) => {
        let removedBefore = 0
        for (let j = 0; j < ann.targetLine; j++) {
          if (linesToRemove.has(j)) removedBefore++
        }
        return {
          ...ann,
          targetLine: ann.targetLine - removedBefore,
        }
      })

      // Store annotations for later hooks
      const context = this as unknown as TransformerContext
      context.annotations = adjustedAnnotations
      context.codeLines = filteredLines

      return filteredLines.join("\n")
    },

    line(node, line) {
      const context = this as unknown as TransformerContext
      const annotations: Annotation[] = context.annotations || []
      const codeLines: string[] = context.codeLines || []

      const lineText = codeLines[line - 1] ?? ""

      // Find annotations for this line (line is 1-indexed)
      const lineAnnotations = annotations.filter((a) => {
        if (a.selector?.type === "lineRange") {
          const parts = a.selector.value.split(":")
          if (parts[0] !== undefined) {
            const start = Number.parseInt(parts[0], 10)
            const end = parts[1] ? Number.parseInt(parts[1], 10) : start
            return line >= start && line <= end
          }
        }
        return a.targetLine === line - 1
      })

      if (lineAnnotations.length === 0) return

      // For each annotation
      for (const annotation of lineAnnotations) {
        const isRegexSelector = annotation.selector?.type === "regex"

        if (annotation.type === "callout") {
          const message = getMessage(annotation)

          if (message) {
            node.properties ||= {}
            node.children ||= []

            node.properties["data-callout-line"] = "true"

            const anchorColumn = getCalloutAnchor(annotation, lineText)

            node.children.push(createCalloutElement(message, annotation.id, anchorColumn))
          }

          if (!isRegexSelector) {
            const classes = getClasses(annotation)
            for (const cls of classes) {
              this.addClassToHast(node, cls)
            }
          }

          continue
        }

        // Only add classes to the line for non-regex annotations
        // Regex annotations will apply classes at the span level
        if (!isRegexSelector) {
          const classes = getClasses(annotation)
          for (const cls of classes) {
            this.addClassToHast(node, cls)
          }
        }

        // Store message as data attribute (for block-level display)
        const message = getMessage(annotation)
        if (message && !isRegexSelector) {
          node.properties ||= {}
          node.properties["data-annotation-message"] = message
          node.properties["data-annotation-type"] = annotation.type
        }
      }
    },

    span(node, line, col) {
      const context = this as unknown as TransformerContext
      const annotations: Annotation[] = context.annotations || []
      const codeLines: string[] = context.codeLines || []

      if (!codeLines[line - 1]) return

      // Find regex-based annotations for this line
      const lineAnnotations = annotations.filter((a) => a.targetLine === line - 1 && a.selector?.type === "regex")

      if (lineAnnotations.length === 0) return

      // Get token text - try from node first, fall back to extracting from line
      let tokenText = ""
      if (node.children) {
        for (const child of node.children) {
          if (child.type === "text") {
            tokenText += child.value
          }
        }
      }

      // If we couldn't get text from node, skip this token
      if (!tokenText) return

      const tokenEnd = col + tokenText.length

      for (const annotation of lineAnnotations) {
        const pattern = annotation.selector?.value
        if (!pattern) continue
        const regex = new RegExp(pattern)
        const lineText = codeLines[line - 1]
        if (lineText === undefined) continue

        // Check if the regex matches within this token's range
        const tokenTextInLine = lineText.substring(col, tokenEnd)
        const matchInToken = tokenTextInLine.match(regex)

        if (matchInToken) {
          const classes = getClasses(annotation)
          for (const cls of classes) {
            this.addClassToHast(node, cls)
          }

          if (annotation.type === "callout") {
            node.properties ||= {}
            node.properties["data-callout-id"] = annotation.id
          }

          const message = getMessage(annotation)
          if (annotation.type !== "callout" && message) {
            node.properties ||= {}
            node.properties["data-annotation-message"] = message
            node.properties["data-annotation-type"] = annotation.type
          }

          break // Only apply classes once per token
        }
      }
    },
  }
}

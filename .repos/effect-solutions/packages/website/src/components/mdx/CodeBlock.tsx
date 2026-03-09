"use client"

import { useEffect, useMemo, useState } from "react"
import { codeToHtml } from "shiki"
import { transformerAnnotations } from "@/lib/shiki-transformer-annotations"
import { CodeCopyButton } from "./CodeCopyButton"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language = "typescript", className }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("")
  const normalizedCode = useMemo(() => code.trim(), [code])

  useEffect(() => {
    async function highlight() {
      const result = await codeToHtml(normalizedCode, {
        lang: language,
        theme: "github-dark-default",
        transformers: [transformerAnnotations()],
      })
      const sanitizedHtml = result
        .replace(/background-color:[^;"]*;?/gi, "") // drop inline backgrounds so theme controls it
        .replace(/\s*tabindex="[^"]*"/gi, "") // prevent focus rings on generated pre elements
      setHtml(sanitizedHtml)
    }
    highlight()
  }, [language, normalizedCode])

  if (!html) {
    return (
      <div className={`group relative not-prose my-6 border border-neutral-800 bg-neutral-950 ${className || ""}`}>
        <CodeCopyButton value={normalizedCode} />
        <pre className="overflow-x-auto px-6 py-4 text-sm text-foreground/90">
          <code>{normalizedCode}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className={`group relative not-prose my-6 border-y border-neutral-800 bg-neutral-950 ${className || ""}`}>
      <CodeCopyButton value={normalizedCode} />
      <div
        className="overflow-x-auto"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via Shiki and stripped styles
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

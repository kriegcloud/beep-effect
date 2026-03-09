"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Command } from "cmdk"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import type { DocSearchDocument } from "@/lib/doc-search"

export function CommandPalette({ documents }: { documents: DocSearchDocument[] }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Reset search when dialog opens
  useEffect(() => {
    if (open) setSearch("")
  }, [open])

  // Scroll to top when search changes
  // RAF ensures we run after cmdk's internal scroll-into-view logic
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: 0, behavior: "instant" })
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false)
      router.push(`/${slug}`)
    },
    [router],
  )

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-4 sm:top-20 z-50 w-full max-w-2xl translate-x-[-50%] p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2">
          <VisuallyHidden>
            <Dialog.Title>Global Command Menu</Dialog.Title>
            <Dialog.Description>Search documentation and navigate to pages</Dialog.Description>
          </VisuallyHidden>

          <Command className="w-full overflow-hidden bg-background border border-border shadow-2xl">
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search docs..."
              className="w-full px-4 py-3 text-lg bg-transparent border-none outline-none text-foreground placeholder:text-zinc-500"
            />
            <Command.List ref={listRef} className="max-h-[60vh] overflow-y-auto border-t border-border p-2">
              <Command.Empty className="py-6 text-center text-zinc-500">No results found.</Command.Empty>

              {documents.map((doc) => (
                <Command.Item
                  key={doc.slug}
                  value={doc.slug}
                  keywords={[doc.title, doc.description, ...doc.keywords].filter(Boolean)}
                  onSelect={handleSelect}
                  className="flex flex-col gap-1 px-3 py-3 cursor-pointer data-[selected='true']:bg-zinc-800/50 text-foreground"
                >
                  <span className="font-medium font-mono text-sm">{doc.title}</span>
                  {doc.description && <span className="text-xs text-zinc-400 truncate">{doc.description}</span>}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

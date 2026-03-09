"use client"

interface DraftNoteProps {
  children: React.ReactNode
}

export function DraftNote({ children }: DraftNoteProps) {
  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null
  }

  return <div className="my-6 border-y border-yellow-500/30 bg-yellow-500/10 py-4">{children}</div>
}

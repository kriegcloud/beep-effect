const CODE_BLOCK_RE = /```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/m

export const extractCodeBlock = (response: string): string | null => {
  const match = CODE_BLOCK_RE.exec(response)
  if (!match) {
    return null
  }
  const block = match[1]
  return block === undefined ? null : block.trim()
}

/**
 * Anthropic API requires tool_use.id to match ^[a-zA-Z0-9_-]+$.
 * This helper generates compliant IDs from semantic parts.
 */
const INVALID_CHARS = /[^a-zA-Z0-9_-]/g

export const makeToolCallId = (...parts: ReadonlyArray<string>): string =>
  parts.join("-").replace(INVALID_CHARS, "-")

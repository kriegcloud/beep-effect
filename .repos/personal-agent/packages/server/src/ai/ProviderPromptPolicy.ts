import * as Prompt from "effect/unstable/ai/Prompt"

export const sanitizePromptForAnthropic = (prompt: Prompt.Prompt): Prompt.Prompt => {
  const sanitizedMessages: Array<Prompt.Message> = []

  for (const message of prompt.content) {
    switch (message.role) {
      case "system": {
        const content = message.content.trim()
        if (content.length === 0) {
          break
        }
        sanitizedMessages.push({ ...message, content })
        break
      }
      case "user": {
        const content = message.content.filter(
          (part) => part.type !== "text" || part.text.trim().length > 0
        )
        if (content.length === 0) {
          break
        }
        sanitizedMessages.push({ ...message, content })
        break
      }
      case "assistant": {
        const content = message.content.filter(
          (part) => part.type !== "text" || part.text.trim().length > 0
        )
        if (content.length === 0) {
          break
        }
        sanitizedMessages.push({ ...message, content })
        break
      }
      case "tool": {
        sanitizedMessages.push(message)
        break
      }
    }
  }

  return Prompt.fromMessages(sanitizedMessages)
}

export const sanitizePromptForProvider = (
  provider: string,
  prompt: Prompt.Prompt
): Prompt.Prompt =>
  provider === "anthropic"
    ? sanitizePromptForAnthropic(prompt)
    : prompt

export const sanitizeInitialPromptForProvider = (
  provider: string,
  input: Prompt.RawInput
): Prompt.RawInput =>
  sanitizePromptForProvider(provider, Prompt.make(input))

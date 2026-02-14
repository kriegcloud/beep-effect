import { streamText } from "effect-claude-agent-sdk"

for await (const chunk of streamText("Tell me a short story about a lighthouse.")) {
  process.stdout.write(chunk)
}

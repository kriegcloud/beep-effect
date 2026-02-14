import { run } from "effect-claude-agent-sdk"

const result = await run("What is 2 + 2?")
console.log(result.result)

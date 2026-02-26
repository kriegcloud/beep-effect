import { ConfigError } from "../Errors.js"

const missingCredentialsMessage = [
  "Missing API credentials.",
  "",
  "To fix this, choose one:",
  "1. Set ANTHROPIC_API_KEY (or API_KEY) in your environment.",
  "   If you are using a config prefix (e.g. AGENTSDK_), set the prefixed variable instead.",
  "2. Authenticate with Claude Code to populate CLAUDE_CODE_SESSION_ACCESS_TOKEN:",
  "   claude login",
  "3. Provide credentials programmatically via options.env:",
  "   { env: { ANTHROPIC_API_KEY: \"sk-ant-...\" } }",
  "",
  "See: https://docs.anthropic.com/en/docs/quickstart"
].join("\n")

export const missingCredentialsError = () =>
  ConfigError.make({
    message: missingCredentialsMessage
  })

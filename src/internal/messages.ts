import type { SDKUserMessage } from "../Schema/Message.js"

export const makeUserMessage = (prompt: string): SDKUserMessage => ({
  type: "user",
  session_id: "",
  message: {
    role: "user",
    content: [{ type: "text", text: prompt }]
  },
  parent_tool_use_id: null
})

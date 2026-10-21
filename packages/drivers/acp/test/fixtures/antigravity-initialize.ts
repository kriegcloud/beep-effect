// Recorded `initialize` result of Antigravity's ACP server (agy_acp_server_1.1.1), ported from the
// t3code effect-acp fixture `test/fixtures/antigravity-initialize.json` (31dcc7c513). The agent
// reports `protocolVersion: 2` with the generation-1 result shape (`agentInfo`,
// `agentCapabilities`), so a client must take the generation from the shape, not the version.
import * as SchemaV1 from "@beep/acp/schema-v1";
import * as S from "effect/Schema";

const recorded: typeof SchemaV1.InitializeResponse.Encoded = {
  protocolVersion: 2,
  agentCapabilities: {
    loadSession: true,
    promptCapabilities: {
      image: true,
      audio: true,
      embeddedContext: true,
    },
    mcpCapabilities: {
      http: true,
      sse: true,
    },
    sessionCapabilities: {
      list: {},
      resume: {},
    },
    auth: {
      logout: {},
    },
  },
  authMethods: [
    {
      id: "oauth-personal",
      name: "Log in with Google",
      description: "Log in with your Google account",
    },
    {
      id: "oauth-business",
      name: "Log in with Gemini Enterprise",
      description: "Log in with your Gemini Enterprise account",
    },
    {
      id: "gemini-api-key",
      name: "Gemini API key",
      description: "Use an API key with Gemini Developer API",
    },
    {
      id: "agent-platform",
      name: "Gemini Enterprise Agent Platform",
      description:
        "Use Gemini Enterprise Agent Platform (formerly Vertex AI) with Application Default Credentials or an API key",
    },
  ],
  agentInfo: {
    name: "antigravity-acp",
    title: "Google Antigravity",
    version: "agy_acp_server_1.1.1",
  },
};

/**
 * The recorded result, decoded through the generation-1 `InitializeResponse` schema.
 */
export const antigravityInitialize = S.decodeEffect(SchemaV1.InitializeResponse)(recorded);

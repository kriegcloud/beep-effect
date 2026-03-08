import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { McpServer } from "./External.js";

const $I = $AiSdkId.create("core/Schema/Mcp");

/**
 * @since 0.0.0
 */
export class McpStdioServerConfig extends S.Class<McpStdioServerConfig>($I`McpStdioServerConfig`)(
  {
    type: S.optional(S.Literal("stdio")),
    command: S.String,
    args: S.optional(S.Array(S.String)),
    env: S.optional(S.Record(S.String, S.String)),
  },
  $I.annote("McpStdioServerConfig", {
    description: "Configuration for launching an MCP server over stdio.",
  })
) {}
/**
 * @since 0.0.0
 */
export type McpStdioServerConfigEncoded = typeof McpStdioServerConfig.Encoded;

/**
 * @since 0.0.0
 */
export class McpSSEServerConfig extends S.Class<McpSSEServerConfig>($I`McpSSEServerConfig`)(
  {
    type: S.Literal("sse"),
    url: S.String,
    headers: S.optional(S.Record(S.String, S.String)),
  },
  $I.annote("McpSSEServerConfig", {
    description: "Configuration for connecting to an MCP server over Server-Sent Events.",
  })
) {}
/**
 * @since 0.0.0
 */
export type McpSSEServerConfigEncoded = typeof McpSSEServerConfig.Encoded;

/**
 * @since 0.0.0
 */
export class McpHttpServerConfig extends S.Class<McpHttpServerConfig>($I`McpHttpServerConfig`)(
  {
    type: S.Literal("http"),
    url: S.String,
    headers: S.optional(S.Record(S.String, S.String)),
  },
  $I.annote("McpHttpServerConfig", {
    description: "Configuration for connecting to an MCP server over HTTP.",
  })
) {}
/**
 * @since 0.0.0
 */
export type McpHttpServerConfigEncoded = typeof McpHttpServerConfig.Encoded;

/**
 * @since 0.0.0
 */
export class McpSdkServerConfig extends S.Class<McpSdkServerConfig>($I`McpSdkServerConfig`)(
  {
    type: S.Literal("sdk"),
    name: S.String,
  },
  $I.annote("McpSdkServerConfig", {
    description: "Configuration for referencing an in-process SDK-managed MCP server by name.",
  })
) {}
/**
 * @since 0.0.0
 */
export type McpSdkServerConfigEncoded = typeof McpSdkServerConfig.Encoded;

/**
 * @since 0.0.0
 */
export class McpSdkServerConfigWithInstance extends S.Class<McpSdkServerConfigWithInstance>(
  $I`McpSdkServerConfigWithInstance`
)(
  {
    ...McpSdkServerConfig.fields,
    instance: McpServer,
  },
  $I.annote("McpSdkServerConfigWithInstance", {
    description: "SDK MCP server configuration paired with a live in-process server instance.",
  })
) {}
/**
 * @since 0.0.0
 */
export type McpSdkServerConfigWithInstanceEncoded = typeof McpSdkServerConfigWithInstance.Encoded;

const McpExplicitServerConfig = S.Union([McpSSEServerConfig, McpHttpServerConfig, McpSdkServerConfig]).pipe(
  S.toTaggedUnion("type"),
  S.annotate(
    $I.annote("McpExplicitServerConfig", {
      description: "Tagged union for explicit MCP transports that always carry a transport type discriminator.",
    })
  )
);

const McpExplicitServerConfigWithInstance = S.Union([
  McpSSEServerConfig,
  McpHttpServerConfig,
  McpSdkServerConfigWithInstance,
]).pipe(
  S.toTaggedUnion("type"),
  S.annotate(
    $I.annote("McpExplicitServerConfigWithInstance", {
      description: "Tagged union for explicit MCP transports including in-process SDK instances.",
    })
  )
);

/**
 * @since 0.0.0
 */
export const McpServerConfig = S.Union([McpStdioServerConfig, McpExplicitServerConfigWithInstance]).annotate(
  $I.annote("McpServerConfig", {
    description: "MCP server configuration accepted by the SDK, including in-process instances.",
  })
);

/**
 * @since 0.0.0
 */
export type McpServerConfig = typeof McpServerConfig.Type;
/**
 * @since 0.0.0
 */
export type McpServerConfigEncoded = typeof McpServerConfig.Encoded;

/**
 * @since 0.0.0
 */
export const McpServerConfigForProcessTransport = S.Union([McpStdioServerConfig, McpExplicitServerConfig]).annotate(
  $I.annote("McpServerConfigForProcessTransport", {
    description: "MCP server configuration that can be serialized across process boundaries.",
  })
);

class McpServerInfo extends S.Class<McpServerInfo>($I`McpServerInfo`)(
  {
    name: S.String,
    version: S.String,
  },
  $I.annote("McpServerInfo", {
    description: "Versioned identity reported by a connected MCP server.",
  })
) {}

/**
 * @since 0.0.0
 */
export type McpServerConfigForProcessTransport = typeof McpServerConfigForProcessTransport.Type;
/**
 * @since 0.0.0
 */
export type McpServerConfigForProcessTransportEncoded = typeof McpServerConfigForProcessTransport.Encoded;

/**
 * @since 0.0.0
 */
export class McpServerStatus extends S.Class<McpServerStatus>($I`McpServerStatus`)(
  {
    name: S.String,
    status: LiteralKit(["connected", "failed", "needs-auth", "pending", "disabled"]),
    serverInfo: S.optional(McpServerInfo),
    error: S.optional(S.String),
  },
  $I.annote("McpServerStatus", {
    description: "Connection status snapshot for a configured MCP server.",
  })
) {}
/**
 * @since 0.0.0
 */
export type McpServerStatusEncoded = typeof McpServerStatus.Encoded;

/**
 * @since 0.0.0
 */
export class McpSetServersResult extends S.Class<McpSetServersResult>($I`McpSetServersResult`)(
  {
    added: S.Array(S.String),
    removed: S.Array(S.String),
    errors: S.Record(S.String, S.String),
  },
  $I.annote("McpSetServersResult", {
    description: "Summary of MCP server registrations added, removed, or failed during an update.",
  })
) {}
/**
 * @since 0.0.0
 */
export type McpSetServersResultEncoded = typeof McpSetServersResult.Encoded;

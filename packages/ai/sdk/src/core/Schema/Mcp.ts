import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { McpServer } from "./External.js";

const $I = $AiSdkId.create("core/Schema/Mcp");

/**
 * @since 0.0.0
 */
export const McpStdioServerConfig = S.Struct({
  type: S.optional(S.Literal("stdio")),
  command: S.String,
  args: S.optional(S.Array(S.String)),
  env: S.optional(S.Record(S.String, S.String)),
}).annotate(
  $I.annote("McpStdioServerConfig", {
    description: "Schema for McpStdioServerConfig.",
  })
);

/**
 * @since 0.0.0
 */
export type McpStdioServerConfig = typeof McpStdioServerConfig.Type;
/**
 * @since 0.0.0
 */
export type McpStdioServerConfigEncoded = typeof McpStdioServerConfig.Encoded;

/**
 * @since 0.0.0
 */
export const McpSSEServerConfig = S.Struct({
  type: S.Literal("sse"),
  url: S.String,
  headers: S.optional(S.Record(S.String, S.String)),
}).annotate(
  $I.annote("McpSSEServerConfig", {
    description: "Schema for McpSSEServerConfig.",
  })
);

/**
 * @since 0.0.0
 */
export type McpSSEServerConfig = typeof McpSSEServerConfig.Type;
/**
 * @since 0.0.0
 */
export type McpSSEServerConfigEncoded = typeof McpSSEServerConfig.Encoded;

/**
 * @since 0.0.0
 */
export const McpHttpServerConfig = S.Struct({
  type: S.Literal("http"),
  url: S.String,
  headers: S.optional(S.Record(S.String, S.String)),
}).annotate(
  $I.annote("McpHttpServerConfig", {
    description: "Schema for McpHttpServerConfig.",
  })
);

/**
 * @since 0.0.0
 */
export type McpHttpServerConfig = typeof McpHttpServerConfig.Type;
/**
 * @since 0.0.0
 */
export type McpHttpServerConfigEncoded = typeof McpHttpServerConfig.Encoded;

/**
 * @since 0.0.0
 */
export const McpSdkServerConfig = S.Struct({
  type: S.Literal("sdk"),
  name: S.String,
}).annotate(
  $I.annote("McpSdkServerConfig", {
    description: "Schema for McpSdkServerConfig.",
  })
);

/**
 * @since 0.0.0
 */
export type McpSdkServerConfig = typeof McpSdkServerConfig.Type;
/**
 * @since 0.0.0
 */
export type McpSdkServerConfigEncoded = typeof McpSdkServerConfig.Encoded;

/**
 * @since 0.0.0
 */
export const McpSdkServerConfigWithInstance = S.Struct({
  ...McpSdkServerConfig.fields,
  instance: McpServer,
}).annotate(
  $I.annote("McpSdkServerConfigWithInstance", {
    description: "Schema for McpSdkServerConfigWithInstance.",
  })
);

/**
 * @since 0.0.0
 */
export type McpSdkServerConfigWithInstance = typeof McpSdkServerConfigWithInstance.Type;
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
    description: "Schema for McpServerConfig.",
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
    description: "Schema for McpServerConfigForProcessTransport.",
  })
);

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
export const McpServerStatus = S.Struct({
  name: S.String,
  status: LiteralKit(["connected", "failed", "needs-auth", "pending", "disabled"]),
  serverInfo: S.optional(
    S.Struct({
      name: S.String,
      version: S.String,
    })
  ),
  error: S.optional(S.String),
}).annotate(
  $I.annote("McpServerStatus", {
    description: "Schema for McpServerStatus.",
  })
);

/**
 * @since 0.0.0
 */
export type McpServerStatus = typeof McpServerStatus.Type;
/**
 * @since 0.0.0
 */
export type McpServerStatusEncoded = typeof McpServerStatus.Encoded;

/**
 * @since 0.0.0
 */
export const McpSetServersResult = S.Struct({
  added: S.Array(S.String),
  removed: S.Array(S.String),
  errors: S.Record(S.String, S.String),
}).annotate(
  $I.annote("McpSetServersResult", {
    description: "Schema for McpSetServersResult.",
  })
);

/**
 * @since 0.0.0
 */
export type McpSetServersResult = typeof McpSetServersResult.Type;
/**
 * @since 0.0.0
 */
export type McpSetServersResultEncoded = typeof McpSetServersResult.Encoded;

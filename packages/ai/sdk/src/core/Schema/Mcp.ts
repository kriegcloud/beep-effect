import * as S from "effect/Schema";

import { withIdentifier } from "./Annotations.js";
import { McpServer } from "./External.js";

/**
 * @since 0.0.0
 */
export const McpStdioServerConfig = withIdentifier(
  S.Struct({
    type: S.optional(S.Literal("stdio")),
    command: S.String,
    args: S.optional(S.Array(S.String)),
    env: S.optional(S.Record(S.String, S.String)),
  }),
  "McpStdioServerConfig"
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
export const McpSSEServerConfig = withIdentifier(
  S.Struct({
    type: S.Literal("sse"),
    url: S.String,
    headers: S.optional(S.Record(S.String, S.String)),
  }),
  "McpSSEServerConfig"
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
export const McpHttpServerConfig = withIdentifier(
  S.Struct({
    type: S.Literal("http"),
    url: S.String,
    headers: S.optional(S.Record(S.String, S.String)),
  }),
  "McpHttpServerConfig"
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
export const McpSdkServerConfig = withIdentifier(
  S.Struct({
    type: S.Literal("sdk"),
    name: S.String,
  }),
  "McpSdkServerConfig"
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
export const McpSdkServerConfigWithInstance = withIdentifier(
  S.Struct({
    ...McpSdkServerConfig.fields,
    instance: McpServer,
  }),
  "McpSdkServerConfigWithInstance"
);

/**
 * @since 0.0.0
 */
export type McpSdkServerConfigWithInstance = typeof McpSdkServerConfigWithInstance.Type;
/**
 * @since 0.0.0
 */
export type McpSdkServerConfigWithInstanceEncoded = typeof McpSdkServerConfigWithInstance.Encoded;

/**
 * @since 0.0.0
 */
export const McpServerConfig = withIdentifier(
  S.Union([McpStdioServerConfig, McpSSEServerConfig, McpHttpServerConfig, McpSdkServerConfigWithInstance]),
  "McpServerConfig"
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
export const McpServerConfigForProcessTransport = withIdentifier(
  S.Union([McpStdioServerConfig, McpSSEServerConfig, McpHttpServerConfig, McpSdkServerConfig]),
  "McpServerConfigForProcessTransport"
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
export const McpServerStatus = withIdentifier(
  S.Struct({
    name: S.String,
    status: S.Literals(["connected", "failed", "needs-auth", "pending", "disabled"]),
    serverInfo: S.optional(
      S.Struct({
        name: S.String,
        version: S.String,
      })
    ),
    error: S.optional(S.String),
  }),
  "McpServerStatus"
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
export const McpSetServersResult = withIdentifier(
  S.Struct({
    added: S.Array(S.String),
    removed: S.Array(S.String),
    errors: S.Record(S.String, S.String),
  }),
  "McpSetServersResult"
);

/**
 * @since 0.0.0
 */
export type McpSetServersResult = typeof McpSetServersResult.Type;
/**
 * @since 0.0.0
 */
export type McpSetServersResultEncoded = typeof McpSetServersResult.Encoded;

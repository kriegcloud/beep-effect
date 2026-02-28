import * as S from "effect/Schema";

import { withIdentifier } from "./Annotations.js";
import { McpServer } from "./External.js";

export const McpStdioServerConfig = withIdentifier(
  S.Struct({
    type: S.optional(S.Literal("stdio")),
    command: S.String,
    args: S.optional(S.Array(S.String)),
    env: S.optional(S.Record(S.String, S.String)),
  }),
  "McpStdioServerConfig"
);

export type McpStdioServerConfig = typeof McpStdioServerConfig.Type;
export type McpStdioServerConfigEncoded = typeof McpStdioServerConfig.Encoded;

export const McpSSEServerConfig = withIdentifier(
  S.Struct({
    type: S.Literal("sse"),
    url: S.String,
    headers: S.optional(S.Record(S.String, S.String)),
  }),
  "McpSSEServerConfig"
);

export type McpSSEServerConfig = typeof McpSSEServerConfig.Type;
export type McpSSEServerConfigEncoded = typeof McpSSEServerConfig.Encoded;

export const McpHttpServerConfig = withIdentifier(
  S.Struct({
    type: S.Literal("http"),
    url: S.String,
    headers: S.optional(S.Record(S.String, S.String)),
  }),
  "McpHttpServerConfig"
);

export type McpHttpServerConfig = typeof McpHttpServerConfig.Type;
export type McpHttpServerConfigEncoded = typeof McpHttpServerConfig.Encoded;

export const McpSdkServerConfig = withIdentifier(
  S.Struct({
    type: S.Literal("sdk"),
    name: S.String,
  }),
  "McpSdkServerConfig"
);

export type McpSdkServerConfig = typeof McpSdkServerConfig.Type;
export type McpSdkServerConfigEncoded = typeof McpSdkServerConfig.Encoded;

export const McpSdkServerConfigWithInstance = withIdentifier(
  S.Struct({
    ...McpSdkServerConfig.fields,
    instance: McpServer,
  }),
  "McpSdkServerConfigWithInstance"
);

export type McpSdkServerConfigWithInstance = typeof McpSdkServerConfigWithInstance.Type;
export type McpSdkServerConfigWithInstanceEncoded = typeof McpSdkServerConfigWithInstance.Encoded;

export const McpServerConfig = withIdentifier(
  S.Union([McpStdioServerConfig, McpSSEServerConfig, McpHttpServerConfig, McpSdkServerConfigWithInstance]),
  "McpServerConfig"
);

export type McpServerConfig = typeof McpServerConfig.Type;
export type McpServerConfigEncoded = typeof McpServerConfig.Encoded;

export const McpServerConfigForProcessTransport = withIdentifier(
  S.Union([McpStdioServerConfig, McpSSEServerConfig, McpHttpServerConfig, McpSdkServerConfig]),
  "McpServerConfigForProcessTransport"
);

export type McpServerConfigForProcessTransport = typeof McpServerConfigForProcessTransport.Type;
export type McpServerConfigForProcessTransportEncoded = typeof McpServerConfigForProcessTransport.Encoded;

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

export type McpServerStatus = typeof McpServerStatus.Type;
export type McpServerStatusEncoded = typeof McpServerStatus.Encoded;

export const McpSetServersResult = withIdentifier(
  S.Struct({
    added: S.Array(S.String),
    removed: S.Array(S.String),
    errors: S.Record(S.String, S.String),
  }),
  "McpSetServersResult"
);

export type McpSetServersResult = typeof McpSetServersResult.Type;
export type McpSetServersResultEncoded = typeof McpSetServersResult.Encoded;

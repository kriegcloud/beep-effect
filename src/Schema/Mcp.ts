import * as Schema from "effect/Schema"
import { withIdentifier } from "./Annotations.js"
import { McpServer } from "./External.js"

export const McpStdioServerConfig = withIdentifier(
  Schema.Struct({
    type: Schema.optional(Schema.Literal("stdio")),
    command: Schema.String,
    args: Schema.optional(Schema.Array(Schema.String)),
    env: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String }))
  }),
  "McpStdioServerConfig"
)

export type McpStdioServerConfig = typeof McpStdioServerConfig.Type
export type McpStdioServerConfigEncoded = typeof McpStdioServerConfig.Encoded

export const McpSSEServerConfig = withIdentifier(
  Schema.Struct({
    type: Schema.Literal("sse"),
    url: Schema.String,
    headers: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String }))
  }),
  "McpSSEServerConfig"
)

export type McpSSEServerConfig = typeof McpSSEServerConfig.Type
export type McpSSEServerConfigEncoded = typeof McpSSEServerConfig.Encoded

export const McpHttpServerConfig = withIdentifier(
  Schema.Struct({
    type: Schema.Literal("http"),
    url: Schema.String,
    headers: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String }))
  }),
  "McpHttpServerConfig"
)

export type McpHttpServerConfig = typeof McpHttpServerConfig.Type
export type McpHttpServerConfigEncoded = typeof McpHttpServerConfig.Encoded

export const McpSdkServerConfig = withIdentifier(
  Schema.Struct({
    type: Schema.Literal("sdk"),
    name: Schema.String
  }),
  "McpSdkServerConfig"
)

export type McpSdkServerConfig = typeof McpSdkServerConfig.Type
export type McpSdkServerConfigEncoded = typeof McpSdkServerConfig.Encoded

export const McpSdkServerConfigWithInstance = withIdentifier(
  Schema.Struct({
    ...McpSdkServerConfig.fields,
    instance: McpServer
  }),
  "McpSdkServerConfigWithInstance"
)

export type McpSdkServerConfigWithInstance = typeof McpSdkServerConfigWithInstance.Type
export type McpSdkServerConfigWithInstanceEncoded = typeof McpSdkServerConfigWithInstance.Encoded

export const McpServerConfig = withIdentifier(
  Schema.Union(
    McpStdioServerConfig,
    McpSSEServerConfig,
    McpHttpServerConfig,
    McpSdkServerConfigWithInstance
  ),
  "McpServerConfig"
)

export type McpServerConfig = typeof McpServerConfig.Type
export type McpServerConfigEncoded = typeof McpServerConfig.Encoded

export const McpServerConfigForProcessTransport = withIdentifier(
  Schema.Union(
    McpStdioServerConfig,
    McpSSEServerConfig,
    McpHttpServerConfig,
    McpSdkServerConfig
  ),
  "McpServerConfigForProcessTransport"
)

export type McpServerConfigForProcessTransport = typeof McpServerConfigForProcessTransport.Type
export type McpServerConfigForProcessTransportEncoded = typeof McpServerConfigForProcessTransport.Encoded

export const McpServerStatus = withIdentifier(
  Schema.Struct({
    name: Schema.String,
    status: Schema.Literal("connected", "failed", "needs-auth", "pending", "disabled"),
    serverInfo: Schema.optional(
      Schema.Struct({
        name: Schema.String,
        version: Schema.String
      })
    ),
    error: Schema.optional(Schema.String)
  }),
  "McpServerStatus"
)

export type McpServerStatus = typeof McpServerStatus.Type
export type McpServerStatusEncoded = typeof McpServerStatus.Encoded

export const McpSetServersResult = withIdentifier(
  Schema.Struct({
    added: Schema.Array(Schema.String),
    removed: Schema.Array(Schema.String),
    errors: Schema.Record({ key: Schema.String, value: Schema.String })
  }),
  "McpSetServersResult"
)

export type McpSetServersResult = typeof McpSetServersResult.Type
export type McpSetServersResultEncoded = typeof McpSetServersResult.Encoded

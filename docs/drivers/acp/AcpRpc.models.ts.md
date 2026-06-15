---
title: AcpRpc.models.ts
nav_order: 8
parent: "@beep/acp"
---

## AcpRpc.models.ts overview

ACP RPC definitions for the technical driver.

Since v0.0.0

---
## Exports Grouped by Category
- [protocols](#protocols)
  - [AgentRpcs](#agentrpcs)
  - [AuthenticateRpc](#authenticaterpc)
  - [ClientRpcs](#clientrpcs)
  - [CloseSessionRpc](#closesessionrpc)
  - [CreateTerminalRpc](#createterminalrpc)
  - [ElicitationRpc](#elicitationrpc)
  - [ForkSessionRpc](#forksessionrpc)
  - [InitializeRpc](#initializerpc)
  - [KillTerminalRpc](#killterminalrpc)
  - [ListSessionsRpc](#listsessionsrpc)
  - [LoadSessionRpc](#loadsessionrpc)
  - [LogoutRpc](#logoutrpc)
  - [NewSessionRpc](#newsessionrpc)
  - [PromptRpc](#promptrpc)
  - [ReadTextFileRpc](#readtextfilerpc)
  - [ReleaseTerminalRpc](#releaseterminalrpc)
  - [RequestPermissionRpc](#requestpermissionrpc)
  - [ResumeSessionRpc](#resumesessionrpc)
  - [SetSessionConfigOptionRpc](#setsessionconfigoptionrpc)
  - [SetSessionModelRpc](#setsessionmodelrpc)
  - [TerminalOutputRpc](#terminaloutputrpc)
  - [WaitForTerminalExitRpc](#waitforterminalexitrpc)
  - [WriteTextFileRpc](#writetextfilerpc)
---

# protocols

## AgentRpcs

RPC group served by ACP agents.

**Example**

```ts
import { AgentRpcs } from "@beep/acp/rpc"

const rpc = AgentRpcs
```

**Signature**

```ts
declare const AgentRpcs: RpcGroup.RpcGroup<Rpc.Rpc<"initialize", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly clientCapabilities: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly auth: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly terminal: optionalKey<Boolean>; }>>; readonly elicitation: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly form: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; readonly url: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; }>>, Null]>>; readonly fs: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly readTextFile: optionalKey<Boolean>; readonly writeTextFile: optionalKey<Boolean>; }>>; readonly terminal: optionalKey<Boolean>; }>>; readonly clientInfo: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly version: String; }>>, Null]>>; readonly protocolVersion: Finite; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly agentCapabilities: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly auth: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly logout: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; }>>; readonly loadSession: optionalKey<Boolean>; readonly mcpCapabilities: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly http: optionalKey<Boolean>; readonly sse: optionalKey<Boolean>; }>>; readonly promptCapabilities: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audio: optionalKey<Boolean>; readonly embeddedContext: optionalKey<Boolean>; readonly image: optionalKey<Boolean>; }>>; readonly sessionCapabilities: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly close: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; readonly fork: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; readonly list: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; readonly resume: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; }>>; }>>; readonly agentInfo: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly version: String; }>>, Null]>>; readonly authMethods: optionalKey<$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"env_var">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly link: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly vars: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly label: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly optional: optionalKey<Boolean>; readonly secret: optionalKey<Boolean>; }>>>; }>, Struct<{ readonly type: Literal<"terminal">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: optionalKey<$Array<String>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly env: optionalKey<$Record<String, String>>; readonly id: String; readonly name: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>>; readonly protocolVersion: Finite; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"authenticate", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly methodId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"logout", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/new", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cwd: String; readonly mcpServers: $Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"http">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly type: Literal<"sse">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: $Array<String>; readonly command: String; readonly env: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; }>]>>>; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configOptions: optionalKey<Union<readonly [$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"select">; readonly currentValue: String; readonly options: Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>, $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly group: String; readonly name: String; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>; }>>>]>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>, Struct<{ readonly type: Literal<"boolean">; readonly currentValue: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>, Null]>>; readonly models: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModels: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly modelId: String; readonly name: String; }>>>; readonly currentModelId: String; }>>, Null]>>; readonly modes: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModes: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: AnnotatedSchema<String>; readonly name: String; }>>>; readonly currentModeId: String; }>>, Null]>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/load", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cwd: String; readonly mcpServers: $Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"http">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly type: Literal<"sse">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: $Array<String>; readonly command: String; readonly env: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; }>]>>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configOptions: optionalKey<Union<readonly [$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"select">; readonly currentValue: String; readonly options: Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>, $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly group: String; readonly name: String; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>; }>>>]>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>, Struct<{ readonly type: Literal<"boolean">; readonly currentValue: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>, Null]>>; readonly models: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModels: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly modelId: String; readonly name: String; }>>>; readonly currentModelId: String; }>>, Null]>>; readonly modes: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModes: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: AnnotatedSchema<String>; readonly name: String; }>>>; readonly currentModeId: String; }>>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/list", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cursor: optionalKey<Union<readonly [String, Null]>>; readonly cwd: optionalKey<Union<readonly [String, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly nextCursor: optionalKey<Union<readonly [String, Null]>>; readonly sessions: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cwd: String; readonly sessionId: String; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly updatedAt: optionalKey<Union<readonly [String, Null]>>; }>>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/fork", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cwd: String; readonly mcpServers: optionalKey<$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"http">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly type: Literal<"sse">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: $Array<String>; readonly command: String; readonly env: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; }>]>>>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configOptions: optionalKey<Union<readonly [$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"select">; readonly currentValue: String; readonly options: Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>, $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly group: String; readonly name: String; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>; }>>>]>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>, Struct<{ readonly type: Literal<"boolean">; readonly currentValue: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>, Null]>>; readonly models: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModels: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly modelId: String; readonly name: String; }>>>; readonly currentModelId: String; }>>, Null]>>; readonly modes: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModes: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: AnnotatedSchema<String>; readonly name: String; }>>>; readonly currentModeId: String; }>>, Null]>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/resume", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cwd: String; readonly mcpServers: optionalKey<$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"http">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly type: Literal<"sse">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: $Array<String>; readonly command: String; readonly env: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; }>]>>>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configOptions: optionalKey<Union<readonly [$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"select">; readonly currentValue: String; readonly options: Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>, $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly group: String; readonly name: String; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>; }>>>]>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>, Struct<{ readonly type: Literal<"boolean">; readonly currentValue: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>, Null]>>; readonly models: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModels: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly modelId: String; readonly name: String; }>>>; readonly currentModelId: String; }>>, Null]>>; readonly modes: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModes: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: AnnotatedSchema<String>; readonly name: String; }>>>; readonly currentModeId: String; }>>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/close", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/prompt", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly messageId: optionalKey<Union<readonly [String, Null]>>; readonly prompt: $Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"text">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly text: String; }>, Struct<{ readonly type: Literal<"image">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly data: String; readonly mimeType: String; readonly uri: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"audio">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly data: String; readonly mimeType: String; }>, Struct<{ readonly type: Literal<"resource_link">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly size: optionalKey<Union<readonly [Finite, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly uri: String; }>, Struct<{ readonly type: Literal<"resource">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly resource: AnnotatedSchema<Union<readonly [Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly text: String; readonly uri: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly blob: String; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly uri: String; }>]>>; }>]>>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly stopReason: Literals<readonly ["end_turn", "max_tokens", "max_turn_requests", "refusal", "cancelled"]>; readonly usage: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly cachedReadTokens: optionalKey<Union<readonly [Finite, Null]>>; readonly cachedWriteTokens: optionalKey<Union<readonly [Finite, Null]>>; readonly inputTokens: Finite; readonly outputTokens: Finite; readonly thoughtTokens: optionalKey<Union<readonly [Finite, Null]>>; readonly totalTokens: Finite; }>>, Null]>>; readonly userMessageId: optionalKey<Union<readonly [String, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/set_model", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly modelId: String; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/set_config_option", AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"boolean">; readonly value: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configId: String; readonly sessionId: String; }>, Struct<{ readonly value: String; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configId: String; readonly sessionId: String; }>]>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configOptions: $Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"select">; readonly currentValue: String; readonly options: Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>, $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly group: String; readonly name: String; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>; }>>>]>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>, Struct<{ readonly type: Literal<"boolean">; readonly currentValue: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L425)

Since v0.0.0

## AuthenticateRpc

RPC definition for `AuthenticateRpc`.

**Example**

```ts
import { AuthenticateRpc } from "@beep/acp/rpc"

const rpc = AuthenticateRpc
```

**Signature**

```ts
declare const AuthenticateRpc: Rpc.Rpc<"authenticate", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly methodId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L45)

Since v0.0.0

## ClientRpcs

RPC group served by ACP clients.

**Example**

```ts
import { ClientRpcs } from "@beep/acp/rpc"

const rpc = ClientRpcs
```

**Signature**

```ts
declare const ClientRpcs: RpcGroup.RpcGroup<Rpc.Rpc<"fs/read_text_file", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly limit: optionalKey<Union<readonly [Finite, Null]>>; readonly line: optionalKey<Union<readonly [Finite, Null]>>; readonly path: String; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly content: String; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"fs/write_text_file", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly content: String; readonly path: String; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/request_permission", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly kind: Literals<readonly ["allow_once", "allow_always", "reject_once", "reject_always"]>; readonly name: String; readonly optionId: String; }>>>; readonly sessionId: String; readonly toolCall: Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly content: optionalKey<Union<readonly [$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"content">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly content: Union<readonly [Struct<{ readonly type: Literal<"text">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly text: String; }>, Struct<{ readonly type: Literal<"image">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly data: String; readonly mimeType: String; readonly uri: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"audio">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly data: String; readonly mimeType: String; }>, Struct<{ readonly type: Literal<"resource_link">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly size: optionalKey<Union<readonly [Finite, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly uri: String; }>, Struct<{ readonly type: Literal<"resource">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly resource: AnnotatedSchema<Union<readonly [Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly text: String; readonly uri: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly blob: String; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly uri: String; }>]>>; }>]>; }>, Struct<{ readonly type: Literal<"diff">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly newText: String; readonly oldText: optionalKey<Union<readonly [String, Null]>>; readonly path: String; }>, Struct<{ readonly type: Literal<"terminal">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly terminalId: String; }>]>>>, Null]>>; readonly kind: optionalKey<Union<readonly [AnnotatedSchema<Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>, Null]>>; readonly locations: optionalKey<Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly line: optionalKey<Union<readonly [Finite, Null]>>; readonly path: String; }>>>, Null]>>; readonly rawInput: optionalKey<Unknown>; readonly rawOutput: optionalKey<Unknown>; readonly status: optionalKey<Union<readonly [AnnotatedSchema<Literals<readonly ["pending", "in_progress", "completed", "failed"]>>, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly toolCallId: String; }>; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly outcome: Union<readonly [Struct<{ readonly outcome: Literal<"cancelled">; }>, Struct<{ readonly outcome: Literal<"selected">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly optionId: String; }>]>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"session/elicitation", AnnotatedSchema<Union<readonly [Struct<{ readonly mode: Literal<"form">; readonly requestedSchema: Struct<{ readonly description: optionalKey<Union<readonly [String, Null]>>; readonly properties: optionalKey<$Record<String, AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"string">; readonly default: optionalKey<Union<readonly [String, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly enum: optionalKey<Union<readonly [$Array<String>, Null]>>; readonly format: optionalKey<Union<readonly [AnnotatedSchema<Literals<readonly ["email", "uri", "date", "date-time"]>>, Null]>>; readonly maxLength: optionalKey<Union<readonly [Finite, Null]>>; readonly minLength: optionalKey<Union<readonly [Finite, Null]>>; readonly oneOf: optionalKey<Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly const: String; readonly title: String; }>>>, Null]>>; readonly pattern: optionalKey<Union<readonly [String, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"number">; readonly default: optionalKey<Union<readonly [Finite, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly maximum: optionalKey<Union<readonly [Finite, Null]>>; readonly minimum: optionalKey<Union<readonly [Finite, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"integer">; readonly default: optionalKey<Union<readonly [Finite, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly maximum: optionalKey<Union<readonly [Finite, Null]>>; readonly minimum: optionalKey<Union<readonly [Finite, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"boolean">; readonly default: optionalKey<Union<readonly [Boolean, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"array">; readonly default: optionalKey<Union<readonly [$Array<String>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly items: Union<readonly [Struct<{ readonly enum: $Array<String>; readonly type: Literal<"string">; }>, Struct<{ readonly anyOf: $Array<AnnotatedSchema<Struct<{ readonly const: String; readonly title: String; }>>>; }>]>; readonly maxItems: optionalKey<Union<readonly [Finite, Null]>>; readonly minItems: optionalKey<Union<readonly [Finite, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; }>]>>>>; readonly required: optionalKey<Union<readonly [$Array<String>, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly type: optionalKey<Literal<"object">>; }>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly message: String; readonly sessionId: String; }>, Struct<{ readonly mode: Literal<"url">; readonly elicitationId: String; readonly url: String; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly message: String; readonly sessionId: String; }>]>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly action: Union<readonly [Struct<{ readonly action: Literal<"accept">; readonly content: optionalKey<Union<readonly [$Record<String, AnnotatedSchema<Union<readonly [String, Finite, Finite, Boolean, $Array<String>]>>>, Null]>>; }>, Struct<{ readonly action: Literal<"decline">; }>, Struct<{ readonly action: Literal<"cancel">; }>]>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"terminal/create", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: optionalKey<$Array<String>>; readonly command: String; readonly cwd: optionalKey<Union<readonly [String, Null]>>; readonly env: optionalKey<$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>>; readonly outputByteLimit: optionalKey<Union<readonly [Finite, Null]>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly terminalId: String; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"terminal/output", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly sessionId: String; readonly terminalId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly exitStatus: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly exitCode: optionalKey<Union<readonly [Finite, Null]>>; readonly signal: optionalKey<Union<readonly [String, Null]>>; }>>, Null]>>; readonly output: String; readonly truncated: Boolean; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"terminal/release", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly sessionId: String; readonly terminalId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"terminal/wait_for_exit", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly sessionId: String; readonly terminalId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly exitCode: optionalKey<Union<readonly [Finite, Null]>>; readonly signal: optionalKey<Union<readonly [String, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never> | Rpc.Rpc<"terminal/kill", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly sessionId: String; readonly terminalId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L453)

Since v0.0.0

## CloseSessionRpc

RPC definition for `CloseSessionRpc`.

**Example**

```ts
import { CloseSessionRpc } from "@beep/acp/rpc"

const rpc = CloseSessionRpc
```

**Signature**

```ts
declare const CloseSessionRpc: Rpc.Rpc<"session/close", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L178)

Since v0.0.0

## CreateTerminalRpc

RPC definition for `CreateTerminalRpc`.

**Example**

```ts
import { CreateTerminalRpc } from "@beep/acp/rpc"

const rpc = CreateTerminalRpc
```

**Signature**

```ts
declare const CreateTerminalRpc: Rpc.Rpc<"terminal/create", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: optionalKey<$Array<String>>; readonly command: String; readonly cwd: optionalKey<Union<readonly [String, Null]>>; readonly env: optionalKey<$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>>; readonly outputByteLimit: optionalKey<Union<readonly [Finite, Null]>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly terminalId: String; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L330)

Since v0.0.0

## ElicitationRpc

RPC definition for `ElicitationRpc`.

**Example**

```ts
import { ElicitationRpc } from "@beep/acp/rpc"

const rpc = ElicitationRpc
```

**Signature**

```ts
declare const ElicitationRpc: Rpc.Rpc<"session/elicitation", AnnotatedSchema<Union<readonly [Struct<{ readonly mode: Literal<"form">; readonly requestedSchema: Struct<{ readonly description: optionalKey<Union<readonly [String, Null]>>; readonly properties: optionalKey<$Record<String, AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"string">; readonly default: optionalKey<Union<readonly [String, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly enum: optionalKey<Union<readonly [$Array<String>, Null]>>; readonly format: optionalKey<Union<readonly [AnnotatedSchema<Literals<readonly ["email", "uri", "date", "date-time"]>>, Null]>>; readonly maxLength: optionalKey<Union<readonly [Finite, Null]>>; readonly minLength: optionalKey<Union<readonly [Finite, Null]>>; readonly oneOf: optionalKey<Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly const: String; readonly title: String; }>>>, Null]>>; readonly pattern: optionalKey<Union<readonly [String, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"number">; readonly default: optionalKey<Union<readonly [Finite, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly maximum: optionalKey<Union<readonly [Finite, Null]>>; readonly minimum: optionalKey<Union<readonly [Finite, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"integer">; readonly default: optionalKey<Union<readonly [Finite, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly maximum: optionalKey<Union<readonly [Finite, Null]>>; readonly minimum: optionalKey<Union<readonly [Finite, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"boolean">; readonly default: optionalKey<Union<readonly [Boolean, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"array">; readonly default: optionalKey<Union<readonly [$Array<String>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly items: Union<readonly [Struct<{ readonly enum: $Array<String>; readonly type: Literal<"string">; }>, Struct<{ readonly anyOf: $Array<AnnotatedSchema<Struct<{ readonly const: String; readonly title: String; }>>>; }>]>; readonly maxItems: optionalKey<Union<readonly [Finite, Null]>>; readonly minItems: optionalKey<Union<readonly [Finite, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; }>]>>>>; readonly required: optionalKey<Union<readonly [$Array<String>, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly type: optionalKey<Literal<"object">>; }>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly message: String; readonly sessionId: String; }>, Struct<{ readonly mode: Literal<"url">; readonly elicitationId: String; readonly url: String; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly message: String; readonly sessionId: String; }>]>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly action: Union<readonly [Struct<{ readonly action: Literal<"accept">; readonly content: optionalKey<Union<readonly [$Record<String, AnnotatedSchema<Union<readonly [String, Finite, Finite, Boolean, $Array<String>]>>>, Null]>>; }>, Struct<{ readonly action: Literal<"decline">; }>, Struct<{ readonly action: Literal<"cancel">; }>]>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L311)

Since v0.0.0

## ForkSessionRpc

RPC definition for `ForkSessionRpc`.

**Example**

```ts
import { ForkSessionRpc } from "@beep/acp/rpc"

const rpc = ForkSessionRpc
```

**Signature**

```ts
declare const ForkSessionRpc: Rpc.Rpc<"session/fork", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cwd: String; readonly mcpServers: optionalKey<$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"http">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly type: Literal<"sse">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: $Array<String>; readonly command: String; readonly env: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; }>]>>>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configOptions: optionalKey<Union<readonly [$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"select">; readonly currentValue: String; readonly options: Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>, $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly group: String; readonly name: String; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>; }>>>]>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>, Struct<{ readonly type: Literal<"boolean">; readonly currentValue: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>, Null]>>; readonly models: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModels: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly modelId: String; readonly name: String; }>>>; readonly currentModelId: String; }>>, Null]>>; readonly modes: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModes: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: AnnotatedSchema<String>; readonly name: String; }>>>; readonly currentModeId: String; }>>, Null]>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L140)

Since v0.0.0

## InitializeRpc

RPC definition for `InitializeRpc`.

**Example**

```ts
import { InitializeRpc } from "@beep/acp/rpc"

const rpc = InitializeRpc
```

**Signature**

```ts
declare const InitializeRpc: Rpc.Rpc<"initialize", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly clientCapabilities: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly auth: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly terminal: optionalKey<Boolean>; }>>; readonly elicitation: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly form: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; readonly url: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; }>>, Null]>>; readonly fs: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly readTextFile: optionalKey<Boolean>; readonly writeTextFile: optionalKey<Boolean>; }>>; readonly terminal: optionalKey<Boolean>; }>>; readonly clientInfo: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly version: String; }>>, Null]>>; readonly protocolVersion: Finite; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly agentCapabilities: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly auth: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly logout: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; }>>; readonly loadSession: optionalKey<Boolean>; readonly mcpCapabilities: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly http: optionalKey<Boolean>; readonly sse: optionalKey<Boolean>; }>>; readonly promptCapabilities: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audio: optionalKey<Boolean>; readonly embeddedContext: optionalKey<Boolean>; readonly image: optionalKey<Boolean>; }>>; readonly sessionCapabilities: optionalKey<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly close: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; readonly fork: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; readonly list: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; readonly resume: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, Null]>>; }>>; }>>; readonly agentInfo: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly version: String; }>>, Null]>>; readonly authMethods: optionalKey<$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"env_var">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly link: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly vars: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly label: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly optional: optionalKey<Boolean>; readonly secret: optionalKey<Boolean>; }>>>; }>, Struct<{ readonly type: Literal<"terminal">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: optionalKey<$Array<String>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly env: optionalKey<$Record<String, String>>; readonly id: String; readonly name: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>>; readonly protocolVersion: Finite; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L26)

Since v0.0.0

## KillTerminalRpc

RPC definition for `KillTerminalRpc`.

**Example**

```ts
import { KillTerminalRpc } from "@beep/acp/rpc"

const rpc = KillTerminalRpc
```

**Signature**

```ts
declare const KillTerminalRpc: Rpc.Rpc<"terminal/kill", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly sessionId: String; readonly terminalId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L406)

Since v0.0.0

## ListSessionsRpc

RPC definition for `ListSessionsRpc`.

**Example**

```ts
import { ListSessionsRpc } from "@beep/acp/rpc"

const rpc = ListSessionsRpc
```

**Signature**

```ts
declare const ListSessionsRpc: Rpc.Rpc<"session/list", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cursor: optionalKey<Union<readonly [String, Null]>>; readonly cwd: optionalKey<Union<readonly [String, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly nextCursor: optionalKey<Union<readonly [String, Null]>>; readonly sessions: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cwd: String; readonly sessionId: String; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly updatedAt: optionalKey<Union<readonly [String, Null]>>; }>>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L121)

Since v0.0.0

## LoadSessionRpc

RPC definition for `LoadSessionRpc`.

**Example**

```ts
import { LoadSessionRpc } from "@beep/acp/rpc"

const rpc = LoadSessionRpc
```

**Signature**

```ts
declare const LoadSessionRpc: Rpc.Rpc<"session/load", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cwd: String; readonly mcpServers: $Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"http">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly type: Literal<"sse">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: $Array<String>; readonly command: String; readonly env: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; }>]>>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configOptions: optionalKey<Union<readonly [$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"select">; readonly currentValue: String; readonly options: Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>, $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly group: String; readonly name: String; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>; }>>>]>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>, Struct<{ readonly type: Literal<"boolean">; readonly currentValue: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>, Null]>>; readonly models: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModels: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly modelId: String; readonly name: String; }>>>; readonly currentModelId: String; }>>, Null]>>; readonly modes: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModes: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: AnnotatedSchema<String>; readonly name: String; }>>>; readonly currentModeId: String; }>>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L102)

Since v0.0.0

## LogoutRpc

RPC definition for `LogoutRpc`.

**Example**

```ts
import { LogoutRpc } from "@beep/acp/rpc"

const rpc = LogoutRpc
```

**Signature**

```ts
declare const LogoutRpc: Rpc.Rpc<"logout", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L64)

Since v0.0.0

## NewSessionRpc

RPC definition for `NewSessionRpc`.

**Example**

```ts
import { NewSessionRpc } from "@beep/acp/rpc"

const rpc = NewSessionRpc
```

**Signature**

```ts
declare const NewSessionRpc: Rpc.Rpc<"session/new", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cwd: String; readonly mcpServers: $Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"http">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly type: Literal<"sse">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: $Array<String>; readonly command: String; readonly env: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; }>]>>>; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configOptions: optionalKey<Union<readonly [$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"select">; readonly currentValue: String; readonly options: Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>, $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly group: String; readonly name: String; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>; }>>>]>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>, Struct<{ readonly type: Literal<"boolean">; readonly currentValue: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>, Null]>>; readonly models: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModels: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly modelId: String; readonly name: String; }>>>; readonly currentModelId: String; }>>, Null]>>; readonly modes: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModes: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: AnnotatedSchema<String>; readonly name: String; }>>>; readonly currentModeId: String; }>>, Null]>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L83)

Since v0.0.0

## PromptRpc

RPC definition for `PromptRpc`.

**Example**

```ts
import { PromptRpc } from "@beep/acp/rpc"

const rpc = PromptRpc
```

**Signature**

```ts
declare const PromptRpc: Rpc.Rpc<"session/prompt", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly messageId: optionalKey<Union<readonly [String, Null]>>; readonly prompt: $Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"text">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly text: String; }>, Struct<{ readonly type: Literal<"image">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly data: String; readonly mimeType: String; readonly uri: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"audio">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly data: String; readonly mimeType: String; }>, Struct<{ readonly type: Literal<"resource_link">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly size: optionalKey<Union<readonly [Finite, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly uri: String; }>, Struct<{ readonly type: Literal<"resource">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly resource: AnnotatedSchema<Union<readonly [Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly text: String; readonly uri: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly blob: String; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly uri: String; }>]>>; }>]>>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly stopReason: Literals<readonly ["end_turn", "max_tokens", "max_turn_requests", "refusal", "cancelled"]>; readonly usage: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly cachedReadTokens: optionalKey<Union<readonly [Finite, Null]>>; readonly cachedWriteTokens: optionalKey<Union<readonly [Finite, Null]>>; readonly inputTokens: Finite; readonly outputTokens: Finite; readonly thoughtTokens: optionalKey<Union<readonly [Finite, Null]>>; readonly totalTokens: Finite; }>>, Null]>>; readonly userMessageId: optionalKey<Union<readonly [String, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L197)

Since v0.0.0

## ReadTextFileRpc

RPC definition for `ReadTextFileRpc`.

**Example**

```ts
import { ReadTextFileRpc } from "@beep/acp/rpc"

const rpc = ReadTextFileRpc
```

**Signature**

```ts
declare const ReadTextFileRpc: Rpc.Rpc<"fs/read_text_file", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly limit: optionalKey<Union<readonly [Finite, Null]>>; readonly line: optionalKey<Union<readonly [Finite, Null]>>; readonly path: String; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly content: String; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L254)

Since v0.0.0

## ReleaseTerminalRpc

RPC definition for `ReleaseTerminalRpc`.

**Example**

```ts
import { ReleaseTerminalRpc } from "@beep/acp/rpc"

const rpc = ReleaseTerminalRpc
```

**Signature**

```ts
declare const ReleaseTerminalRpc: Rpc.Rpc<"terminal/release", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly sessionId: String; readonly terminalId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L368)

Since v0.0.0

## RequestPermissionRpc

RPC definition for `RequestPermissionRpc`.

**Example**

```ts
import { RequestPermissionRpc } from "@beep/acp/rpc"

const rpc = RequestPermissionRpc
```

**Signature**

```ts
declare const RequestPermissionRpc: Rpc.Rpc<"session/request_permission", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly kind: Literals<readonly ["allow_once", "allow_always", "reject_once", "reject_always"]>; readonly name: String; readonly optionId: String; }>>>; readonly sessionId: String; readonly toolCall: Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly content: optionalKey<Union<readonly [$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"content">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly content: Union<readonly [Struct<{ readonly type: Literal<"text">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly text: String; }>, Struct<{ readonly type: Literal<"image">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly data: String; readonly mimeType: String; readonly uri: optionalKey<Union<readonly [String, Null]>>; }>, Struct<{ readonly type: Literal<"audio">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly data: String; readonly mimeType: String; }>, Struct<{ readonly type: Literal<"resource_link">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly size: optionalKey<Union<readonly [Finite, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly uri: String; }>, Struct<{ readonly type: Literal<"resource">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly annotations: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly audience: optionalKey<Union<readonly [$Array<AnnotatedSchema<Literals<readonly ["assistant", "user"]>>>, Null]>>; readonly lastModified: optionalKey<Union<readonly [String, Null]>>; readonly priority: optionalKey<Union<readonly [Finite, Null]>>; }>>, Null]>>; readonly resource: AnnotatedSchema<Union<readonly [Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly text: String; readonly uri: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly blob: String; readonly mimeType: optionalKey<Union<readonly [String, Null]>>; readonly uri: String; }>]>>; }>]>; }>, Struct<{ readonly type: Literal<"diff">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly newText: String; readonly oldText: optionalKey<Union<readonly [String, Null]>>; readonly path: String; }>, Struct<{ readonly type: Literal<"terminal">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly terminalId: String; }>]>>>, Null]>>; readonly kind: optionalKey<Union<readonly [AnnotatedSchema<Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>, Null]>>; readonly locations: optionalKey<Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly line: optionalKey<Union<readonly [Finite, Null]>>; readonly path: String; }>>>, Null]>>; readonly rawInput: optionalKey<Unknown>; readonly rawOutput: optionalKey<Unknown>; readonly status: optionalKey<Union<readonly [AnnotatedSchema<Literals<readonly ["pending", "in_progress", "completed", "failed"]>>, Null]>>; readonly title: optionalKey<Union<readonly [String, Null]>>; readonly toolCallId: String; }>; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly outcome: Union<readonly [Struct<{ readonly outcome: Literal<"cancelled">; }>, Struct<{ readonly outcome: Literal<"selected">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly optionId: String; }>]>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L292)

Since v0.0.0

## ResumeSessionRpc

RPC definition for `ResumeSessionRpc`.

**Example**

```ts
import { ResumeSessionRpc } from "@beep/acp/rpc"

const rpc = ResumeSessionRpc
```

**Signature**

```ts
declare const ResumeSessionRpc: Rpc.Rpc<"session/resume", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly cwd: String; readonly mcpServers: optionalKey<$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"http">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly type: Literal<"sse">; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly headers: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; readonly url: String; }>, Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly args: $Array<String>; readonly command: String; readonly env: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly name: String; readonly value: String; }>>>; readonly name: String; }>]>>>>; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configOptions: optionalKey<Union<readonly [$Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"select">; readonly currentValue: String; readonly options: Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>, $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly group: String; readonly name: String; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>; }>>>]>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>, Struct<{ readonly type: Literal<"boolean">; readonly currentValue: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>, Null]>>; readonly models: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModels: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly modelId: String; readonly name: String; }>>>; readonly currentModelId: String; }>>, Null]>>; readonly modes: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly availableModes: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: AnnotatedSchema<String>; readonly name: String; }>>>; readonly currentModeId: String; }>>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L159)

Since v0.0.0

## SetSessionConfigOptionRpc

RPC definition for `SetSessionConfigOptionRpc`.

**Example**

```ts
import { SetSessionConfigOptionRpc } from "@beep/acp/rpc"

const rpc = SetSessionConfigOptionRpc
```

**Signature**

```ts
declare const SetSessionConfigOptionRpc: Rpc.Rpc<"session/set_config_option", AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"boolean">; readonly value: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configId: String; readonly sessionId: String; }>, Struct<{ readonly value: String; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configId: String; readonly sessionId: String; }>]>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly configOptions: $Array<AnnotatedSchema<Union<readonly [Struct<{ readonly type: Literal<"select">; readonly currentValue: String; readonly options: Union<readonly [$Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>, $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly group: String; readonly name: String; readonly options: $Array<AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly name: String; readonly value: String; }>>>; }>>>]>; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>, Struct<{ readonly type: Literal<"boolean">; readonly currentValue: Boolean; readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly category: optionalKey<Union<readonly [AnnotatedSchema<Union<readonly [Literal<"mode">, Literal<"model">, Literal<"thought_level">, String]>>, Null]>>; readonly description: optionalKey<Union<readonly [String, Null]>>; readonly id: String; readonly name: String; }>]>>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L235)

Since v0.0.0

## SetSessionModelRpc

RPC definition for `SetSessionModelRpc`.

**Example**

```ts
import { SetSessionModelRpc } from "@beep/acp/rpc"

const rpc = SetSessionModelRpc
```

**Signature**

```ts
declare const SetSessionModelRpc: Rpc.Rpc<"session/set_model", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly modelId: String; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L216)

Since v0.0.0

## TerminalOutputRpc

RPC definition for `TerminalOutputRpc`.

**Example**

```ts
import { TerminalOutputRpc } from "@beep/acp/rpc"

const rpc = TerminalOutputRpc
```

**Signature**

```ts
declare const TerminalOutputRpc: Rpc.Rpc<"terminal/output", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly sessionId: String; readonly terminalId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly exitStatus: optionalKey<Union<readonly [AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly exitCode: optionalKey<Union<readonly [Finite, Null]>>; readonly signal: optionalKey<Union<readonly [String, Null]>>; }>>, Null]>>; readonly output: String; readonly truncated: Boolean; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L349)

Since v0.0.0

## WaitForTerminalExitRpc

RPC definition for `WaitForTerminalExitRpc`.

**Example**

```ts
import { WaitForTerminalExitRpc } from "@beep/acp/rpc"

const rpc = WaitForTerminalExitRpc
```

**Signature**

```ts
declare const WaitForTerminalExitRpc: Rpc.Rpc<"terminal/wait_for_exit", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly sessionId: String; readonly terminalId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly exitCode: optionalKey<Union<readonly [Finite, Null]>>; readonly signal: optionalKey<Union<readonly [String, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L387)

Since v0.0.0

## WriteTextFileRpc

RPC definition for `WriteTextFileRpc`.

**Example**

```ts
import { WriteTextFileRpc } from "@beep/acp/rpc"

const rpc = WriteTextFileRpc
```

**Signature**

```ts
declare const WriteTextFileRpc: Rpc.Rpc<"fs/write_text_file", AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; readonly content: String; readonly path: String; readonly sessionId: String; }>>, AnnotatedSchema<Struct<{ readonly _meta: optionalKey<Union<readonly [$Record<String, Unknown>, Null]>>; }>>, AnnotatedSchema<Struct<{ readonly code: Union<readonly [Literal<-32700>, Literal<-32600>, Literal<-32601>, Literal<-32602>, Literal<-32603>, Literal<-32800>, Literal<-32000>, Literal<-32002>, Literal<-32042>, Finite]>; readonly data: optionalKey<Unknown>; readonly message: String; }>>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpRpc.models.ts#L273)

Since v0.0.0
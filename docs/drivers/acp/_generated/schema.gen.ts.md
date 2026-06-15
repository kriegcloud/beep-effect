---
title: schema.gen.ts
nav_order: 2
parent: "@beep/acp"
---

## schema.gen.ts overview

Generated ACP protocol schema and metadata modules.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AgentAuthCapabilities (type alias)](#agentauthcapabilities-type-alias)
  - [AgentCapabilities (type alias)](#agentcapabilities-type-alias)
  - [AgentNotification (type alias)](#agentnotification-type-alias)
  - [AgentRequest (type alias)](#agentrequest-type-alias)
  - [AgentResponse (type alias)](#agentresponse-type-alias)
  - [Annotations (type alias)](#annotations-type-alias)
  - [AudioContent (type alias)](#audiocontent-type-alias)
  - [AuthCapabilities (type alias)](#authcapabilities-type-alias)
  - [AuthEnvVar (type alias)](#authenvvar-type-alias)
  - [AuthMethod (type alias)](#authmethod-type-alias)
  - [AuthMethodAgent (type alias)](#authmethodagent-type-alias)
  - [AuthMethodEnvVar (type alias)](#authmethodenvvar-type-alias)
  - [AuthMethodTerminal (type alias)](#authmethodterminal-type-alias)
  - [AuthenticateRequest (type alias)](#authenticaterequest-type-alias)
  - [AuthenticateResponse (type alias)](#authenticateresponse-type-alias)
  - [AvailableCommand (type alias)](#availablecommand-type-alias)
  - [AvailableCommandInput (type alias)](#availablecommandinput-type-alias)
  - [AvailableCommandsUpdate (type alias)](#availablecommandsupdate-type-alias)
  - [BlobResourceContents (type alias)](#blobresourcecontents-type-alias)
  - [BooleanPropertySchema (type alias)](#booleanpropertyschema-type-alias)
  - [CancelNotification (type alias)](#cancelnotification-type-alias)
  - [CancelRequestNotification (type alias)](#cancelrequestnotification-type-alias)
  - [ClientCapabilities (type alias)](#clientcapabilities-type-alias)
  - [ClientNotification (type alias)](#clientnotification-type-alias)
  - [ClientRequest (type alias)](#clientrequest-type-alias)
  - [ClientResponse (type alias)](#clientresponse-type-alias)
  - [CloseSessionRequest (type alias)](#closesessionrequest-type-alias)
  - [CloseSessionResponse (type alias)](#closesessionresponse-type-alias)
  - [ConfigOptionUpdate (type alias)](#configoptionupdate-type-alias)
  - [Content (type alias)](#content-type-alias)
  - [ContentBlock (type alias)](#contentblock-type-alias)
  - [ContentChunk (type alias)](#contentchunk-type-alias)
  - [Cost (type alias)](#cost-type-alias)
  - [CreateTerminalRequest (type alias)](#createterminalrequest-type-alias)
  - [CreateTerminalResponse (type alias)](#createterminalresponse-type-alias)
  - [CurrentModeUpdate (type alias)](#currentmodeupdate-type-alias)
  - [Diff (type alias)](#diff-type-alias)
  - [ElicitationAcceptAction (type alias)](#elicitationacceptaction-type-alias)
  - [ElicitationAction (type alias)](#elicitationaction-type-alias)
  - [ElicitationCapabilities (type alias)](#elicitationcapabilities-type-alias)
  - [ElicitationCompleteNotification (type alias)](#elicitationcompletenotification-type-alias)
  - [ElicitationContentValue (type alias)](#elicitationcontentvalue-type-alias)
  - [ElicitationFormCapabilities (type alias)](#elicitationformcapabilities-type-alias)
  - [ElicitationFormMode (type alias)](#elicitationformmode-type-alias)
  - [ElicitationId (type alias)](#elicitationid-type-alias)
  - [ElicitationPropertySchema (type alias)](#elicitationpropertyschema-type-alias)
  - [ElicitationRequest (type alias)](#elicitationrequest-type-alias)
  - [ElicitationResponse (type alias)](#elicitationresponse-type-alias)
  - [ElicitationSchema (type alias)](#elicitationschema-type-alias)
  - [ElicitationSchemaType (type alias)](#elicitationschematype-type-alias)
  - [ElicitationStringType (type alias)](#elicitationstringtype-type-alias)
  - [ElicitationUrlCapabilities (type alias)](#elicitationurlcapabilities-type-alias)
  - [ElicitationUrlMode (type alias)](#elicitationurlmode-type-alias)
  - [EmbeddedResource (type alias)](#embeddedresource-type-alias)
  - [EmbeddedResourceResource (type alias)](#embeddedresourceresource-type-alias)
  - [EnumOption (type alias)](#enumoption-type-alias)
  - [EnvVariable (type alias)](#envvariable-type-alias)
  - [Error (type alias)](#error-type-alias)
  - [ErrorCode (type alias)](#errorcode-type-alias)
  - [ExtNotification (type alias)](#extnotification-type-alias)
  - [ExtRequest (type alias)](#extrequest-type-alias)
  - [ExtResponse (type alias)](#extresponse-type-alias)
  - [FileSystemCapabilities (type alias)](#filesystemcapabilities-type-alias)
  - [ForkSessionRequest (type alias)](#forksessionrequest-type-alias)
  - [ForkSessionResponse (type alias)](#forksessionresponse-type-alias)
  - [HttpHeader (type alias)](#httpheader-type-alias)
  - [ImageContent (type alias)](#imagecontent-type-alias)
  - [Implementation (type alias)](#implementation-type-alias)
  - [InitializeRequest (type alias)](#initializerequest-type-alias)
  - [InitializeResponse (type alias)](#initializeresponse-type-alias)
  - [IntegerPropertySchema (type alias)](#integerpropertyschema-type-alias)
  - [KillTerminalRequest (type alias)](#killterminalrequest-type-alias)
  - [KillTerminalResponse (type alias)](#killterminalresponse-type-alias)
  - [ListSessionsRequest (type alias)](#listsessionsrequest-type-alias)
  - [ListSessionsResponse (type alias)](#listsessionsresponse-type-alias)
  - [LoadSessionRequest (type alias)](#loadsessionrequest-type-alias)
  - [LoadSessionResponse (type alias)](#loadsessionresponse-type-alias)
  - [LogoutCapabilities (type alias)](#logoutcapabilities-type-alias)
  - [LogoutRequest (type alias)](#logoutrequest-type-alias)
  - [LogoutResponse (type alias)](#logoutresponse-type-alias)
  - [McpCapabilities (type alias)](#mcpcapabilities-type-alias)
  - [McpServer (type alias)](#mcpserver-type-alias)
  - [McpServerHttp (type alias)](#mcpserverhttp-type-alias)
  - [McpServerSse (type alias)](#mcpserversse-type-alias)
  - [McpServerStdio (type alias)](#mcpserverstdio-type-alias)
  - [ModelId (type alias)](#modelid-type-alias)
  - [ModelInfo (type alias)](#modelinfo-type-alias)
  - [MultiSelectItems (type alias)](#multiselectitems-type-alias)
  - [MultiSelectPropertySchema (type alias)](#multiselectpropertyschema-type-alias)
  - [NewSessionRequest (type alias)](#newsessionrequest-type-alias)
  - [NewSessionResponse (type alias)](#newsessionresponse-type-alias)
  - [NumberPropertySchema (type alias)](#numberpropertyschema-type-alias)
  - [PermissionOption (type alias)](#permissionoption-type-alias)
  - [PermissionOptionId (type alias)](#permissionoptionid-type-alias)
  - [PermissionOptionKind (type alias)](#permissionoptionkind-type-alias)
  - [Plan (type alias)](#plan-type-alias)
  - [PlanEntry (type alias)](#planentry-type-alias)
  - [PlanEntryPriority (type alias)](#planentrypriority-type-alias)
  - [PlanEntryStatus (type alias)](#planentrystatus-type-alias)
  - [PromptCapabilities (type alias)](#promptcapabilities-type-alias)
  - [PromptRequest (type alias)](#promptrequest-type-alias)
  - [PromptResponse (type alias)](#promptresponse-type-alias)
  - [ProtocolVersion (type alias)](#protocolversion-type-alias)
  - [ReadTextFileRequest (type alias)](#readtextfilerequest-type-alias)
  - [ReadTextFileResponse (type alias)](#readtextfileresponse-type-alias)
  - [ReleaseTerminalRequest (type alias)](#releaseterminalrequest-type-alias)
  - [ReleaseTerminalResponse (type alias)](#releaseterminalresponse-type-alias)
  - [RequestId (type alias)](#requestid-type-alias)
  - [RequestPermissionOutcome (type alias)](#requestpermissionoutcome-type-alias)
  - [RequestPermissionRequest (type alias)](#requestpermissionrequest-type-alias)
  - [RequestPermissionResponse (type alias)](#requestpermissionresponse-type-alias)
  - [ResourceLink (type alias)](#resourcelink-type-alias)
  - [ResumeSessionRequest (type alias)](#resumesessionrequest-type-alias)
  - [ResumeSessionResponse (type alias)](#resumesessionresponse-type-alias)
  - [Role (type alias)](#role-type-alias)
  - [SelectedPermissionOutcome (type alias)](#selectedpermissionoutcome-type-alias)
  - [SessionCapabilities (type alias)](#sessioncapabilities-type-alias)
  - [SessionCloseCapabilities (type alias)](#sessionclosecapabilities-type-alias)
  - [SessionConfigBoolean (type alias)](#sessionconfigboolean-type-alias)
  - [SessionConfigGroupId (type alias)](#sessionconfiggroupid-type-alias)
  - [SessionConfigId (type alias)](#sessionconfigid-type-alias)
  - [SessionConfigOption (type alias)](#sessionconfigoption-type-alias)
  - [SessionConfigOptionCategory (type alias)](#sessionconfigoptioncategory-type-alias)
  - [SessionConfigSelect (type alias)](#sessionconfigselect-type-alias)
  - [SessionConfigSelectGroup (type alias)](#sessionconfigselectgroup-type-alias)
  - [SessionConfigSelectOption (type alias)](#sessionconfigselectoption-type-alias)
  - [SessionConfigSelectOptions (type alias)](#sessionconfigselectoptions-type-alias)
  - [SessionConfigValueId (type alias)](#sessionconfigvalueid-type-alias)
  - [SessionForkCapabilities (type alias)](#sessionforkcapabilities-type-alias)
  - [SessionId (type alias)](#sessionid-type-alias)
  - [SessionInfo (type alias)](#sessioninfo-type-alias)
  - [SessionInfoUpdate (type alias)](#sessioninfoupdate-type-alias)
  - [SessionListCapabilities (type alias)](#sessionlistcapabilities-type-alias)
  - [SessionMode (type alias)](#sessionmode-type-alias)
  - [SessionModeId (type alias)](#sessionmodeid-type-alias)
  - [SessionModeState (type alias)](#sessionmodestate-type-alias)
  - [SessionModelState (type alias)](#sessionmodelstate-type-alias)
  - [SessionNotification (type alias)](#sessionnotification-type-alias)
  - [SessionResumeCapabilities (type alias)](#sessionresumecapabilities-type-alias)
  - [SessionUpdate (type alias)](#sessionupdate-type-alias)
  - [SetSessionConfigOptionRequest (type alias)](#setsessionconfigoptionrequest-type-alias)
  - [SetSessionConfigOptionResponse (type alias)](#setsessionconfigoptionresponse-type-alias)
  - [SetSessionModeRequest (type alias)](#setsessionmoderequest-type-alias)
  - [SetSessionModeResponse (type alias)](#setsessionmoderesponse-type-alias)
  - [SetSessionModelRequest (type alias)](#setsessionmodelrequest-type-alias)
  - [SetSessionModelResponse (type alias)](#setsessionmodelresponse-type-alias)
  - [StopReason (type alias)](#stopreason-type-alias)
  - [StringFormat (type alias)](#stringformat-type-alias)
  - [StringPropertySchema (type alias)](#stringpropertyschema-type-alias)
  - [Terminal (type alias)](#terminal-type-alias)
  - [TerminalExitStatus (type alias)](#terminalexitstatus-type-alias)
  - [TerminalOutputRequest (type alias)](#terminaloutputrequest-type-alias)
  - [TerminalOutputResponse (type alias)](#terminaloutputresponse-type-alias)
  - [TextContent (type alias)](#textcontent-type-alias)
  - [TextResourceContents (type alias)](#textresourcecontents-type-alias)
  - [TitledMultiSelectItems (type alias)](#titledmultiselectitems-type-alias)
  - [ToolCall (type alias)](#toolcall-type-alias)
  - [ToolCallContent (type alias)](#toolcallcontent-type-alias)
  - [ToolCallId (type alias)](#toolcallid-type-alias)
  - [ToolCallLocation (type alias)](#toolcalllocation-type-alias)
  - [ToolCallStatus (type alias)](#toolcallstatus-type-alias)
  - [ToolCallUpdate (type alias)](#toolcallupdate-type-alias)
  - [ToolKind (type alias)](#toolkind-type-alias)
  - [UnstructuredCommandInput (type alias)](#unstructuredcommandinput-type-alias)
  - [UntitledMultiSelectItems (type alias)](#untitledmultiselectitems-type-alias)
  - [Usage (type alias)](#usage-type-alias)
  - [UsageUpdate (type alias)](#usageupdate-type-alias)
  - [WaitForTerminalExitRequest (type alias)](#waitforterminalexitrequest-type-alias)
  - [WaitForTerminalExitResponse (type alias)](#waitforterminalexitresponse-type-alias)
  - [WriteTextFileRequest (type alias)](#writetextfilerequest-type-alias)
  - [WriteTextFileResponse (type alias)](#writetextfileresponse-type-alias)
- [schemas](#schemas)
  - [AgentAuthCapabilities](#agentauthcapabilities)
  - [AgentCapabilities](#agentcapabilities)
  - [AgentNotification](#agentnotification)
  - [AgentRequest](#agentrequest)
  - [AgentResponse](#agentresponse)
  - [Annotations](#annotations)
  - [AudioContent](#audiocontent)
  - [AuthCapabilities](#authcapabilities)
  - [AuthEnvVar](#authenvvar)
  - [AuthMethod](#authmethod)
  - [AuthMethodAgent](#authmethodagent)
  - [AuthMethodEnvVar](#authmethodenvvar)
  - [AuthMethodTerminal](#authmethodterminal)
  - [AuthenticateRequest](#authenticaterequest)
  - [AuthenticateResponse](#authenticateresponse)
  - [AvailableCommand](#availablecommand)
  - [AvailableCommandInput](#availablecommandinput)
  - [AvailableCommandsUpdate](#availablecommandsupdate)
  - [BlobResourceContents](#blobresourcecontents)
  - [BooleanPropertySchema](#booleanpropertyschema)
  - [CancelNotification](#cancelnotification)
  - [CancelRequestNotification](#cancelrequestnotification)
  - [ClientCapabilities](#clientcapabilities)
  - [ClientNotification](#clientnotification)
  - [ClientRequest](#clientrequest)
  - [ClientResponse](#clientresponse)
  - [CloseSessionRequest](#closesessionrequest)
  - [CloseSessionResponse](#closesessionresponse)
  - [ConfigOptionUpdate](#configoptionupdate)
  - [Content](#content)
  - [ContentBlock](#contentblock)
  - [ContentChunk](#contentchunk)
  - [Cost](#cost)
  - [CreateTerminalRequest](#createterminalrequest)
  - [CreateTerminalResponse](#createterminalresponse)
  - [CurrentModeUpdate](#currentmodeupdate)
  - [Diff](#diff)
  - [ElicitationAcceptAction](#elicitationacceptaction)
  - [ElicitationAction](#elicitationaction)
  - [ElicitationCapabilities](#elicitationcapabilities)
  - [ElicitationCompleteNotification](#elicitationcompletenotification)
  - [ElicitationContentValue](#elicitationcontentvalue)
  - [ElicitationFormCapabilities](#elicitationformcapabilities)
  - [ElicitationFormMode](#elicitationformmode)
  - [ElicitationId](#elicitationid)
  - [ElicitationPropertySchema](#elicitationpropertyschema)
  - [ElicitationRequest](#elicitationrequest)
  - [ElicitationResponse](#elicitationresponse)
  - [ElicitationSchema](#elicitationschema)
  - [ElicitationSchemaType](#elicitationschematype)
  - [ElicitationStringType](#elicitationstringtype)
  - [ElicitationUrlCapabilities](#elicitationurlcapabilities)
  - [ElicitationUrlMode](#elicitationurlmode)
  - [EmbeddedResource](#embeddedresource)
  - [EmbeddedResourceResource](#embeddedresourceresource)
  - [EnumOption](#enumoption)
  - [EnvVariable](#envvariable)
  - [Error](#error)
  - [ErrorCode](#errorcode)
  - [ExtNotification](#extnotification)
  - [ExtRequest](#extrequest)
  - [ExtResponse](#extresponse)
  - [FileSystemCapabilities](#filesystemcapabilities)
  - [ForkSessionRequest](#forksessionrequest)
  - [ForkSessionResponse](#forksessionresponse)
  - [HttpHeader](#httpheader)
  - [ImageContent](#imagecontent)
  - [Implementation](#implementation)
  - [InitializeRequest](#initializerequest)
  - [InitializeResponse](#initializeresponse)
  - [IntegerPropertySchema](#integerpropertyschema)
  - [KillTerminalRequest](#killterminalrequest)
  - [KillTerminalResponse](#killterminalresponse)
  - [ListSessionsRequest](#listsessionsrequest)
  - [ListSessionsResponse](#listsessionsresponse)
  - [LoadSessionRequest](#loadsessionrequest)
  - [LoadSessionResponse](#loadsessionresponse)
  - [LogoutCapabilities](#logoutcapabilities)
  - [LogoutRequest](#logoutrequest)
  - [LogoutResponse](#logoutresponse)
  - [McpCapabilities](#mcpcapabilities)
  - [McpServer](#mcpserver)
  - [McpServerHttp](#mcpserverhttp)
  - [McpServerSse](#mcpserversse)
  - [McpServerStdio](#mcpserverstdio)
  - [ModelId](#modelid)
  - [ModelInfo](#modelinfo)
  - [MultiSelectItems](#multiselectitems)
  - [MultiSelectPropertySchema](#multiselectpropertyschema)
  - [NewSessionRequest](#newsessionrequest)
  - [NewSessionResponse](#newsessionresponse)
  - [NumberPropertySchema](#numberpropertyschema)
  - [PermissionOption](#permissionoption)
  - [PermissionOptionId](#permissionoptionid)
  - [PermissionOptionKind](#permissionoptionkind)
  - [Plan](#plan)
  - [PlanEntry](#planentry)
  - [PlanEntryPriority](#planentrypriority)
  - [PlanEntryStatus](#planentrystatus)
  - [PromptCapabilities](#promptcapabilities)
  - [PromptRequest](#promptrequest)
  - [PromptResponse](#promptresponse)
  - [ProtocolVersion](#protocolversion)
  - [ReadTextFileRequest](#readtextfilerequest)
  - [ReadTextFileResponse](#readtextfileresponse)
  - [ReleaseTerminalRequest](#releaseterminalrequest)
  - [ReleaseTerminalResponse](#releaseterminalresponse)
  - [RequestId](#requestid)
  - [RequestPermissionOutcome](#requestpermissionoutcome)
  - [RequestPermissionRequest](#requestpermissionrequest)
  - [RequestPermissionResponse](#requestpermissionresponse)
  - [ResourceLink](#resourcelink)
  - [ResumeSessionRequest](#resumesessionrequest)
  - [ResumeSessionResponse](#resumesessionresponse)
  - [Role](#role)
  - [SelectedPermissionOutcome](#selectedpermissionoutcome)
  - [SessionCapabilities](#sessioncapabilities)
  - [SessionCloseCapabilities](#sessionclosecapabilities)
  - [SessionConfigBoolean](#sessionconfigboolean)
  - [SessionConfigGroupId](#sessionconfiggroupid)
  - [SessionConfigId](#sessionconfigid)
  - [SessionConfigOption](#sessionconfigoption)
  - [SessionConfigOptionCategory](#sessionconfigoptioncategory)
  - [SessionConfigSelect](#sessionconfigselect)
  - [SessionConfigSelectGroup](#sessionconfigselectgroup)
  - [SessionConfigSelectOption](#sessionconfigselectoption)
  - [SessionConfigSelectOptions](#sessionconfigselectoptions)
  - [SessionConfigValueId](#sessionconfigvalueid)
  - [SessionForkCapabilities](#sessionforkcapabilities)
  - [SessionId](#sessionid)
  - [SessionInfo](#sessioninfo)
  - [SessionInfoUpdate](#sessioninfoupdate)
  - [SessionListCapabilities](#sessionlistcapabilities)
  - [SessionMode](#sessionmode)
  - [SessionModeId](#sessionmodeid)
  - [SessionModeState](#sessionmodestate)
  - [SessionModelState](#sessionmodelstate)
  - [SessionNotification](#sessionnotification)
  - [SessionResumeCapabilities](#sessionresumecapabilities)
  - [SessionUpdate](#sessionupdate)
  - [SetSessionConfigOptionRequest](#setsessionconfigoptionrequest)
  - [SetSessionConfigOptionResponse](#setsessionconfigoptionresponse)
  - [SetSessionModeRequest](#setsessionmoderequest)
  - [SetSessionModeResponse](#setsessionmoderesponse)
  - [SetSessionModelRequest](#setsessionmodelrequest)
  - [SetSessionModelResponse](#setsessionmodelresponse)
  - [StopReason](#stopreason)
  - [StringFormat](#stringformat)
  - [StringPropertySchema](#stringpropertyschema)
  - [Terminal](#terminal)
  - [TerminalExitStatus](#terminalexitstatus)
  - [TerminalOutputRequest](#terminaloutputrequest)
  - [TerminalOutputResponse](#terminaloutputresponse)
  - [TextContent](#textcontent)
  - [TextResourceContents](#textresourcecontents)
  - [TitledMultiSelectItems](#titledmultiselectitems)
  - [ToolCall](#toolcall)
  - [ToolCallContent](#toolcallcontent)
  - [ToolCallId](#toolcallid)
  - [ToolCallLocation](#toolcalllocation)
  - [ToolCallStatus](#toolcallstatus)
  - [ToolCallUpdate](#toolcallupdate)
  - [ToolKind](#toolkind)
  - [UnstructuredCommandInput](#unstructuredcommandinput)
  - [UntitledMultiSelectItems](#untitledmultiselectitems)
  - [Usage](#usage)
  - [UsageUpdate](#usageupdate)
  - [WaitForTerminalExitRequest](#waitforterminalexitrequest)
  - [WaitForTerminalExitResponse](#waitforterminalexitresponse)
  - [WriteTextFileRequest](#writetextfilerequest)
  - [WriteTextFileResponse](#writetextfileresponse)
---

# models

## AgentAuthCapabilities (type alias)

Type for `AgentAuthCapabilities`.

**Example**

```ts
import type { AgentAuthCapabilities } from "@beep/acp/schema"

type AgentAuthCapabilitiesValue = AgentAuthCapabilities
```

**Signature**

```ts
type AgentAuthCapabilities = typeof AgentAuthCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L3192)

Since v0.0.0

## AgentCapabilities (type alias)

Type for `AgentCapabilities`.

**Example**

```ts
import type { AgentCapabilities } from "@beep/acp/schema"

type AgentCapabilitiesValue = AgentCapabilities
```

**Signature**

```ts
type AgentCapabilities = typeof AgentCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L3371)

Since v0.0.0

## AgentNotification (type alias)

Type for `AgentNotification`.

**Example**

```ts
import type { AgentNotification } from "@beep/acp/schema"

type AgentNotificationValue = AgentNotification
```

**Signature**

```ts
type AgentNotification = typeof AgentNotification.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L4148)

Since v0.0.0

## AgentRequest (type alias)

Type for `AgentRequest`.

**Example**

```ts
import type { AgentRequest } from "@beep/acp/schema"

type AgentRequestValue = AgentRequest
```

**Signature**

```ts
type AgentRequest = typeof AgentRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L4594)

Since v0.0.0

## AgentResponse (type alias)

Type for `AgentResponse`.

**Example**

```ts
import type { AgentResponse } from "@beep/acp/schema"

type AgentResponseValue = AgentResponse
```

**Signature**

```ts
type AgentResponse = typeof AgentResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5146)

Since v0.0.0

## Annotations (type alias)

Type for `Annotations`.

**Example**

```ts
import type { Annotations } from "@beep/acp/schema"

type AnnotationsValue = Annotations
```

**Signature**

```ts
type Annotations = typeof Annotations.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2219)

Since v0.0.0

## AudioContent (type alias)

Type for `AudioContent`.

**Example**

```ts
import type { AudioContent } from "@beep/acp/schema"

type AudioContentValue = AudioContent
```

**Signature**

```ts
type AudioContent = typeof AudioContent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5194)

Since v0.0.0

## AuthCapabilities (type alias)

Type for `AuthCapabilities`.

**Example**

```ts
import type { AuthCapabilities } from "@beep/acp/schema"

type AuthCapabilitiesValue = AuthCapabilities
```

**Signature**

```ts
type AuthCapabilities = typeof AuthCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5247)

Since v0.0.0

## AuthEnvVar (type alias)

Type for `AuthEnvVar`.

**Example**

```ts
import type { AuthEnvVar } from "@beep/acp/schema"

type AuthEnvVarValue = AuthEnvVar
```

**Signature**

```ts
type AuthEnvVar = typeof AuthEnvVar.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L85)

Since v0.0.0

## AuthMethod (type alias)

Type for `AuthMethod`.

**Example**

```ts
import type { AuthMethod } from "@beep/acp/schema"

type AuthMethodValue = AuthMethod
```

**Signature**

```ts
type AuthMethod = typeof AuthMethod.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1896)

Since v0.0.0

## AuthMethodAgent (type alias)

Type for `AuthMethodAgent`.

**Example**

```ts
import type { AuthMethodAgent } from "@beep/acp/schema"

type AuthMethodAgentValue = AuthMethodAgent
```

**Signature**

```ts
type AuthMethodAgent = typeof AuthMethodAgent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5403)

Since v0.0.0

## AuthMethodEnvVar (type alias)

Type for `AuthMethodEnvVar`.

**Example**

```ts
import type { AuthMethodEnvVar } from "@beep/acp/schema"

type AuthMethodEnvVarValue = AuthMethodEnvVar
```

**Signature**

```ts
type AuthMethodEnvVar = typeof AuthMethodEnvVar.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5476)

Since v0.0.0

## AuthMethodTerminal (type alias)

Type for `AuthMethodTerminal`.

**Example**

```ts
import type { AuthMethodTerminal } from "@beep/acp/schema"

type AuthMethodTerminalValue = AuthMethodTerminal
```

**Signature**

```ts
type AuthMethodTerminal = typeof AuthMethodTerminal.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5549)

Since v0.0.0

## AuthenticateRequest (type alias)

Type for `AuthenticateRequest`.

**Example**

```ts
import type { AuthenticateRequest } from "@beep/acp/schema"

type AuthenticateRequestValue = AuthenticateRequest
```

**Signature**

```ts
type AuthenticateRequest = typeof AuthenticateRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5297)

Since v0.0.0

## AuthenticateResponse (type alias)

Type for `AuthenticateResponse`.

**Example**

```ts
import type { AuthenticateResponse } from "@beep/acp/schema"

type AuthenticateResponseValue = AuthenticateResponse
```

**Signature**

```ts
type AuthenticateResponse = typeof AuthenticateResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5342)

Since v0.0.0

## AvailableCommand (type alias)

Type for `AvailableCommand`.

**Example**

```ts
import type { AvailableCommand } from "@beep/acp/schema"

type AvailableCommandValue = AvailableCommand
```

**Signature**

```ts
type AvailableCommand = typeof AvailableCommand.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1952)

Since v0.0.0

## AvailableCommandInput (type alias)

Type for `AvailableCommandInput`.

**Example**

```ts
import type { AvailableCommandInput } from "@beep/acp/schema"

type AvailableCommandInputValue = AvailableCommandInput
```

**Signature**

```ts
type AvailableCommandInput = typeof AvailableCommandInput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L139)

Since v0.0.0

## AvailableCommandsUpdate (type alias)

Type for `AvailableCommandsUpdate`.

**Example**

```ts
import type { AvailableCommandsUpdate } from "@beep/acp/schema"

type AvailableCommandsUpdateValue = AvailableCommandsUpdate
```

**Signature**

```ts
type AvailableCommandsUpdate = typeof AvailableCommandsUpdate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5597)

Since v0.0.0

## BlobResourceContents (type alias)

Type for `BlobResourceContents`.

**Example**

```ts
import type { BlobResourceContents } from "@beep/acp/schema"

type BlobResourceContentsValue = BlobResourceContents
```

**Signature**

```ts
type BlobResourceContents = typeof BlobResourceContents.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5645)

Since v0.0.0

## BooleanPropertySchema (type alias)

Type for `BooleanPropertySchema`.

**Example**

```ts
import type { BooleanPropertySchema } from "@beep/acp/schema"

type BooleanPropertySchemaValue = BooleanPropertySchema
```

**Signature**

```ts
type BooleanPropertySchema = typeof BooleanPropertySchema.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5696)

Since v0.0.0

## CancelNotification (type alias)

Type for `CancelNotification`.

**Example**

```ts
import type { CancelNotification } from "@beep/acp/schema"

type CancelNotificationValue = CancelNotification
```

**Signature**

```ts
type CancelNotification = typeof CancelNotification.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5746)

Since v0.0.0

## CancelRequestNotification (type alias)

Type for `CancelRequestNotification`.

**Example**

```ts
import type { CancelRequestNotification } from "@beep/acp/schema"

type CancelRequestNotificationValue = CancelRequestNotification
```

**Signature**

```ts
type CancelRequestNotification = typeof CancelRequestNotification.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5800)

Since v0.0.0

## ClientCapabilities (type alias)

Type for `ClientCapabilities`.

**Example**

```ts
import type { ClientCapabilities } from "@beep/acp/schema"

type ClientCapabilitiesValue = ClientCapabilities
```

**Signature**

```ts
type ClientCapabilities = typeof ClientCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5913)

Since v0.0.0

## ClientNotification (type alias)

Type for `ClientNotification`.

**Example**

```ts
import type { ClientNotification } from "@beep/acp/schema"

type ClientNotificationValue = ClientNotification
```

**Signature**

```ts
type ClientNotification = typeof ClientNotification.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5983)

Since v0.0.0

## ClientRequest (type alias)

Type for `ClientRequest`.

**Example**

```ts
import type { ClientRequest } from "@beep/acp/schema"

type ClientRequestValue = ClientRequest
```

**Signature**

```ts
type ClientRequest = typeof ClientRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L6476)

Since v0.0.0

## ClientResponse (type alias)

Type for `ClientResponse`.

**Example**

```ts
import type { ClientResponse } from "@beep/acp/schema"

type ClientResponseValue = ClientResponse
```

**Signature**

```ts
type ClientResponse = typeof ClientResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L6744)

Since v0.0.0

## CloseSessionRequest (type alias)

Type for `CloseSessionRequest`.

**Example**

```ts
import type { CloseSessionRequest } from "@beep/acp/schema"

type CloseSessionRequestValue = CloseSessionRequest
```

**Signature**

```ts
type CloseSessionRequest = typeof CloseSessionRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L6794)

Since v0.0.0

## CloseSessionResponse (type alias)

Type for `CloseSessionResponse`.

**Example**

```ts
import type { CloseSessionResponse } from "@beep/acp/schema"

type CloseSessionResponseValue = CloseSessionResponse
```

**Signature**

```ts
type CloseSessionResponse = typeof CloseSessionResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L6840)

Since v0.0.0

## ConfigOptionUpdate (type alias)

Type for `ConfigOptionUpdate`.

**Example**

```ts
import type { ConfigOptionUpdate } from "@beep/acp/schema"

type ConfigOptionUpdateValue = ConfigOptionUpdate
```

**Signature**

```ts
type ConfigOptionUpdate = typeof ConfigOptionUpdate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L6889)

Since v0.0.0

## Content (type alias)

Type for `Content`.

**Example**

```ts
import type { Content } from "@beep/acp/schema"

type ContentValue = Content
```

**Signature**

```ts
type Content = typeof Content.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7031)

Since v0.0.0

## ContentBlock (type alias)

Type for `ContentBlock`.

**Example**

```ts
import type { ContentBlock } from "@beep/acp/schema"

type ContentBlockValue = ContentBlock
```

**Signature**

```ts
type ContentBlock = typeof ContentBlock.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2764)

Since v0.0.0

## ContentChunk (type alias)

Type for `ContentChunk`.

**Example**

```ts
import type { ContentChunk } from "@beep/acp/schema"

type ContentChunkValue = ContentChunk
```

**Signature**

```ts
type ContentChunk = typeof ContentChunk.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7182)

Since v0.0.0

## Cost (type alias)

Type for `Cost`.

**Example**

```ts
import type { Cost } from "@beep/acp/schema"

type CostValue = Cost
```

**Signature**

```ts
type Cost = typeof Cost.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L183)

Since v0.0.0

## CreateTerminalRequest (type alias)

Type for `CreateTerminalRequest`.

**Example**

```ts
import type { CreateTerminalRequest } from "@beep/acp/schema"

type CreateTerminalRequestValue = CreateTerminalRequest
```

**Signature**

```ts
type CreateTerminalRequest = typeof CreateTerminalRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7262)

Since v0.0.0

## CreateTerminalResponse (type alias)

Type for `CreateTerminalResponse`.

**Example**

```ts
import type { CreateTerminalResponse } from "@beep/acp/schema"

type CreateTerminalResponseValue = CreateTerminalResponse
```

**Signature**

```ts
type CreateTerminalResponse = typeof CreateTerminalResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7310)

Since v0.0.0

## CurrentModeUpdate (type alias)

Type for `CurrentModeUpdate`.

**Example**

```ts
import type { CurrentModeUpdate } from "@beep/acp/schema"

type CurrentModeUpdateValue = CurrentModeUpdate
```

**Signature**

```ts
type CurrentModeUpdate = typeof CurrentModeUpdate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7359)

Since v0.0.0

## Diff (type alias)

Type for `Diff`.

**Example**

```ts
import type { Diff } from "@beep/acp/schema"

type DiffValue = Diff
```

**Signature**

```ts
type Diff = typeof Diff.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7417)

Since v0.0.0

## ElicitationAcceptAction (type alias)

Type for `ElicitationAcceptAction`.

**Example**

```ts
import type { ElicitationAcceptAction } from "@beep/acp/schema"

type ElicitationAcceptActionValue = ElicitationAcceptAction
```

**Signature**

```ts
type ElicitationAcceptAction = typeof ElicitationAcceptAction.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7463)

Since v0.0.0

## ElicitationAction (type alias)

Type for `ElicitationAction`.

**Example**

```ts
import type { ElicitationAction } from "@beep/acp/schema"

type ElicitationActionValue = ElicitationAction
```

**Signature**

```ts
type ElicitationAction = typeof ElicitationAction.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7524)

Since v0.0.0

## ElicitationCapabilities (type alias)

Type for `ElicitationCapabilities`.

**Example**

```ts
import type { ElicitationCapabilities } from "@beep/acp/schema"

type ElicitationCapabilitiesValue = ElicitationCapabilities
```

**Signature**

```ts
type ElicitationCapabilities = typeof ElicitationCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2008)

Since v0.0.0

## ElicitationCompleteNotification (type alias)

Type for `ElicitationCompleteNotification`.

**Example**

```ts
import type { ElicitationCompleteNotification } from "@beep/acp/schema"

type ElicitationCompleteNotificationValue = ElicitationCompleteNotification
```

**Signature**

```ts
type ElicitationCompleteNotification = typeof ElicitationCompleteNotification.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7574)

Since v0.0.0

## ElicitationContentValue (type alias)

Type for `ElicitationContentValue`.

**Example**

```ts
import type { ElicitationContentValue } from "@beep/acp/schema"

type ElicitationContentValueValue = ElicitationContentValue
```

**Signature**

```ts
type ElicitationContentValue = typeof ElicitationContentValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L225)

Since v0.0.0

## ElicitationFormCapabilities (type alias)

Type for `ElicitationFormCapabilities`.

**Example**

```ts
import type { ElicitationFormCapabilities } from "@beep/acp/schema"

type ElicitationFormCapabilitiesValue = ElicitationFormCapabilities
```

**Signature**

```ts
type ElicitationFormCapabilities = typeof ElicitationFormCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L271)

Since v0.0.0

## ElicitationFormMode (type alias)

Type for `ElicitationFormMode`.

**Example**

```ts
import type { ElicitationFormMode } from "@beep/acp/schema"

type ElicitationFormModeValue = ElicitationFormMode
```

**Signature**

```ts
type ElicitationFormMode = typeof ElicitationFormMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7651)

Since v0.0.0

## ElicitationId (type alias)

Type for `ElicitationId`.

**Example**

```ts
import type { ElicitationId } from "@beep/acp/schema"

type ElicitationIdValue = ElicitationId
```

**Signature**

```ts
type ElicitationId = typeof ElicitationId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7687)

Since v0.0.0

## ElicitationPropertySchema (type alias)

Type for `ElicitationPropertySchema`.

**Example**

```ts
import type { ElicitationPropertySchema } from "@beep/acp/schema"

type ElicitationPropertySchemaValue = ElicitationPropertySchema
```

**Signature**

```ts
type ElicitationPropertySchema = typeof ElicitationPropertySchema.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2635)

Since v0.0.0

## ElicitationRequest (type alias)

Type for `ElicitationRequest`.

**Example**

```ts
import type { ElicitationRequest } from "@beep/acp/schema"

type ElicitationRequestValue = ElicitationRequest
```

**Signature**

```ts
type ElicitationRequest = typeof ElicitationRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7821)

Since v0.0.0

## ElicitationResponse (type alias)

Type for `ElicitationResponse`.

**Example**

```ts
import type { ElicitationResponse } from "@beep/acp/schema"

type ElicitationResponseValue = ElicitationResponse
```

**Signature**

```ts
type ElicitationResponse = typeof ElicitationResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7896)

Since v0.0.0

## ElicitationSchema (type alias)

Type for `ElicitationSchema`.

**Example**

```ts
import type { ElicitationSchema } from "@beep/acp/schema"

type ElicitationSchemaValue = ElicitationSchema
```

**Signature**

```ts
type ElicitationSchema = typeof ElicitationSchema.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7967)

Since v0.0.0

## ElicitationSchemaType (type alias)

Type for `ElicitationSchemaType`.

**Example**

```ts
import type { ElicitationSchemaType } from "@beep/acp/schema"

type ElicitationSchemaTypeValue = ElicitationSchemaType
```

**Signature**

```ts
type ElicitationSchemaType = typeof ElicitationSchemaType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8002)

Since v0.0.0

## ElicitationStringType (type alias)

Type for `ElicitationStringType`.

**Example**

```ts
import type { ElicitationStringType } from "@beep/acp/schema"

type ElicitationStringTypeValue = ElicitationStringType
```

**Signature**

```ts
type ElicitationStringType = typeof ElicitationStringType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8038)

Since v0.0.0

## ElicitationUrlCapabilities (type alias)

Type for `ElicitationUrlCapabilities`.

**Example**

```ts
import type { ElicitationUrlCapabilities } from "@beep/acp/schema"

type ElicitationUrlCapabilitiesValue = ElicitationUrlCapabilities
```

**Signature**

```ts
type ElicitationUrlCapabilities = typeof ElicitationUrlCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L318)

Since v0.0.0

## ElicitationUrlMode (type alias)

Type for `ElicitationUrlMode`.

**Example**

```ts
import type { ElicitationUrlMode } from "@beep/acp/schema"

type ElicitationUrlModeValue = ElicitationUrlMode
```

**Signature**

```ts
type ElicitationUrlMode = typeof ElicitationUrlMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8083)

Since v0.0.0

## EmbeddedResource (type alias)

Type for `EmbeddedResource`.

**Example**

```ts
import type { EmbeddedResource } from "@beep/acp/schema"

type EmbeddedResourceValue = EmbeddedResource
```

**Signature**

```ts
type EmbeddedResource = typeof EmbeddedResource.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8131)

Since v0.0.0

## EmbeddedResourceResource (type alias)

Type for `EmbeddedResourceResource`.

**Example**

```ts
import type { EmbeddedResourceResource } from "@beep/acp/schema"

type EmbeddedResourceResourceValue = EmbeddedResourceResource
```

**Signature**

```ts
type EmbeddedResourceResource = typeof EmbeddedResourceResource.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L388)

Since v0.0.0

## EnumOption (type alias)

Type for `EnumOption`.

**Example**

```ts
import type { EnumOption } from "@beep/acp/schema"

type EnumOptionValue = EnumOption
```

**Signature**

```ts
type EnumOption = typeof EnumOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L431)

Since v0.0.0

## EnvVariable (type alias)

Type for `EnvVariable`.

**Example**

```ts
import type { EnvVariable } from "@beep/acp/schema"

type EnvVariableValue = EnvVariable
```

**Signature**

```ts
type EnvVariable = typeof EnvVariable.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L483)

Since v0.0.0

## Error (type alias)

Type for `Error`.

**Example**

```ts
import type { Error } from "@beep/acp/schema"

type ErrorValue = Error
```

**Signature**

```ts
type Error = typeof Error.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L593)

Since v0.0.0

## ErrorCode (type alias)

Type for `ErrorCode`.

**Example**

```ts
import type { ErrorCode } from "@beep/acp/schema"

type ErrorCodeValue = ErrorCode
```

**Signature**

```ts
type ErrorCode = typeof ErrorCode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8226)

Since v0.0.0

## ExtNotification (type alias)

Type for `ExtNotification`.

**Example**

```ts
import type { ExtNotification } from "@beep/acp/schema"

type ExtNotificationValue = ExtNotification
```

**Signature**

```ts
type ExtNotification = typeof ExtNotification.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8262)

Since v0.0.0

## ExtRequest (type alias)

Type for `ExtRequest`.

**Example**

```ts
import type { ExtRequest } from "@beep/acp/schema"

type ExtRequestValue = ExtRequest
```

**Signature**

```ts
type ExtRequest = typeof ExtRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8298)

Since v0.0.0

## ExtResponse (type alias)

Type for `ExtResponse`.

**Example**

```ts
import type { ExtResponse } from "@beep/acp/schema"

type ExtResponseValue = ExtResponse
```

**Signature**

```ts
type ExtResponse = typeof ExtResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8334)

Since v0.0.0

## FileSystemCapabilities (type alias)

Type for `FileSystemCapabilities`.

**Example**

```ts
import type { FileSystemCapabilities } from "@beep/acp/schema"

type FileSystemCapabilitiesValue = FileSystemCapabilities
```

**Signature**

```ts
type FileSystemCapabilities = typeof FileSystemCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8392)

Since v0.0.0

## ForkSessionRequest (type alias)

Type for `ForkSessionRequest`.

**Example**

```ts
import type { ForkSessionRequest } from "@beep/acp/schema"

type ForkSessionRequestValue = ForkSessionRequest
```

**Signature**

```ts
type ForkSessionRequest = typeof ForkSessionRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8450)

Since v0.0.0

## ForkSessionResponse (type alias)

Type for `ForkSessionResponse`.

**Example**

```ts
import type { ForkSessionResponse } from "@beep/acp/schema"

type ForkSessionResponseValue = ForkSessionResponse
```

**Signature**

```ts
type ForkSessionResponse = typeof ForkSessionResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8521)

Since v0.0.0

## HttpHeader (type alias)

Type for `HttpHeader`.

**Example**

```ts
import type { HttpHeader } from "@beep/acp/schema"

type HttpHeaderValue = HttpHeader
```

**Signature**

```ts
type HttpHeader = typeof HttpHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L643)

Since v0.0.0

## ImageContent (type alias)

Type for `ImageContent`.

**Example**

```ts
import type { ImageContent } from "@beep/acp/schema"

type ImageContentValue = ImageContent
```

**Signature**

```ts
type ImageContent = typeof ImageContent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8570)

Since v0.0.0

## Implementation (type alias)

Type for `Implementation`.

**Example**

```ts
import type { Implementation } from "@beep/acp/schema"

type ImplementationValue = Implementation
```

**Signature**

```ts
type Implementation = typeof Implementation.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L706)

Since v0.0.0

## InitializeRequest (type alias)

Type for `InitializeRequest`.

**Example**

```ts
import type { InitializeRequest } from "@beep/acp/schema"

type InitializeRequestValue = InitializeRequest
```

**Signature**

```ts
type InitializeRequest = typeof InitializeRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8718)

Since v0.0.0

## InitializeResponse (type alias)

Type for `InitializeResponse`.

**Example**

```ts
import type { InitializeResponse } from "@beep/acp/schema"

type InitializeResponseValue = InitializeResponse
```

**Signature**

```ts
type InitializeResponse = typeof InitializeResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8944)

Since v0.0.0

## IntegerPropertySchema (type alias)

Type for `IntegerPropertySchema`.

**Example**

```ts
import type { IntegerPropertySchema } from "@beep/acp/schema"

type IntegerPropertySchemaValue = IntegerPropertySchema
```

**Signature**

```ts
type IntegerPropertySchema = typeof IntegerPropertySchema.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9019)

Since v0.0.0

## KillTerminalRequest (type alias)

Type for `KillTerminalRequest`.

**Example**

```ts
import type { KillTerminalRequest } from "@beep/acp/schema"

type KillTerminalRequestValue = KillTerminalRequest
```

**Signature**

```ts
type KillTerminalRequest = typeof KillTerminalRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9071)

Since v0.0.0

## KillTerminalResponse (type alias)

Type for `KillTerminalResponse`.

**Example**

```ts
import type { KillTerminalResponse } from "@beep/acp/schema"

type KillTerminalResponseValue = KillTerminalResponse
```

**Signature**

```ts
type KillTerminalResponse = typeof KillTerminalResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9116)

Since v0.0.0

## ListSessionsRequest (type alias)

Type for `ListSessionsRequest`.

**Example**

```ts
import type { ListSessionsRequest } from "@beep/acp/schema"

type ListSessionsRequestValue = ListSessionsRequest
```

**Signature**

```ts
type ListSessionsRequest = typeof ListSessionsRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9180)

Since v0.0.0

## ListSessionsResponse (type alias)

Type for `ListSessionsResponse`.

**Example**

```ts
import type { ListSessionsResponse } from "@beep/acp/schema"

type ListSessionsResponseValue = ListSessionsResponse
```

**Signature**

```ts
type ListSessionsResponse = typeof ListSessionsResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9237)

Since v0.0.0

## LoadSessionRequest (type alias)

Type for `LoadSessionRequest`.

**Example**

```ts
import type { LoadSessionRequest } from "@beep/acp/schema"

type LoadSessionRequestValue = LoadSessionRequest
```

**Signature**

```ts
type LoadSessionRequest = typeof LoadSessionRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9293)

Since v0.0.0

## LoadSessionResponse (type alias)

Type for `LoadSessionResponse`.

**Example**

```ts
import type { LoadSessionResponse } from "@beep/acp/schema"

type LoadSessionResponseValue = LoadSessionResponse
```

**Signature**

```ts
type LoadSessionResponse = typeof LoadSessionResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9359)

Since v0.0.0

## LogoutCapabilities (type alias)

Type for `LogoutCapabilities`.

**Example**

```ts
import type { LogoutCapabilities } from "@beep/acp/schema"

type LogoutCapabilitiesValue = LogoutCapabilities
```

**Signature**

```ts
type LogoutCapabilities = typeof LogoutCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L752)

Since v0.0.0

## LogoutRequest (type alias)

Type for `LogoutRequest`.

**Example**

```ts
import type { LogoutRequest } from "@beep/acp/schema"

type LogoutRequestValue = LogoutRequest
```

**Signature**

```ts
type LogoutRequest = typeof LogoutRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9405)

Since v0.0.0

## LogoutResponse (type alias)

Type for `LogoutResponse`.

**Example**

```ts
import type { LogoutResponse } from "@beep/acp/schema"

type LogoutResponseValue = LogoutResponse
```

**Signature**

```ts
type LogoutResponse = typeof LogoutResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9451)

Since v0.0.0

## McpCapabilities (type alias)

Type for `McpCapabilities`.

**Example**

```ts
import type { McpCapabilities } from "@beep/acp/schema"

type McpCapabilitiesValue = McpCapabilities
```

**Signature**

```ts
type McpCapabilities = typeof McpCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9508)

Since v0.0.0

## McpServer (type alias)

Type for `McpServer`.

**Example**

```ts
import type { McpServer } from "@beep/acp/schema"

type McpServerValue = McpServer
```

**Signature**

```ts
type McpServer = typeof McpServer.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2112)

Since v0.0.0

## McpServerHttp (type alias)

Type for `McpServerHttp`.

**Example**

```ts
import type { McpServerHttp } from "@beep/acp/schema"

type McpServerHttpValue = McpServerHttp
```

**Signature**

```ts
type McpServerHttp = typeof McpServerHttp.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9560)

Since v0.0.0

## McpServerSse (type alias)

Type for `McpServerSse`.

**Example**

```ts
import type { McpServerSse } from "@beep/acp/schema"

type McpServerSseValue = McpServerSse
```

**Signature**

```ts
type McpServerSse = typeof McpServerSse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9612)

Since v0.0.0

## McpServerStdio (type alias)

Type for `McpServerStdio`.

**Example**

```ts
import type { McpServerStdio } from "@beep/acp/schema"

type McpServerStdioValue = McpServerStdio
```

**Signature**

```ts
type McpServerStdio = typeof McpServerStdio.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9669)

Since v0.0.0

## ModelId (type alias)

Type for `ModelId`.

**Example**

```ts
import type { ModelId } from "@beep/acp/schema"

type ModelIdValue = ModelId
```

**Signature**

```ts
type ModelId = typeof ModelId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9705)

Since v0.0.0

## ModelInfo (type alias)

Type for `ModelInfo`.

**Example**

```ts
import type { ModelInfo } from "@beep/acp/schema"

type ModelInfoValue = ModelInfo
```

**Signature**

```ts
type ModelInfo = typeof ModelInfo.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L813)

Since v0.0.0

## MultiSelectItems (type alias)

Type for `MultiSelectItems`.

**Example**

```ts
import type { MultiSelectItems } from "@beep/acp/schema"

type MultiSelectItemsValue = MultiSelectItems
```

**Signature**

```ts
type MultiSelectItems = typeof MultiSelectItems.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9761)

Since v0.0.0

## MultiSelectPropertySchema (type alias)

Type for `MultiSelectPropertySchema`.

**Example**

```ts
import type { MultiSelectPropertySchema } from "@beep/acp/schema"

type MultiSelectPropertySchemaValue = MultiSelectPropertySchema
```

**Signature**

```ts
type MultiSelectPropertySchema = typeof MultiSelectPropertySchema.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9865)

Since v0.0.0

## NewSessionRequest (type alias)

Type for `NewSessionRequest`.

**Example**

```ts
import type { NewSessionRequest } from "@beep/acp/schema"

type NewSessionRequestValue = NewSessionRequest
```

**Signature**

```ts
type NewSessionRequest = typeof NewSessionRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9919)

Since v0.0.0

## NewSessionResponse (type alias)

Type for `NewSessionResponse`.

**Example**

```ts
import type { NewSessionResponse } from "@beep/acp/schema"

type NewSessionResponseValue = NewSessionResponse
```

**Signature**

```ts
type NewSessionResponse = typeof NewSessionResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9990)

Since v0.0.0

## NumberPropertySchema (type alias)

Type for `NumberPropertySchema`.

**Example**

```ts
import type { NumberPropertySchema } from "@beep/acp/schema"

type NumberPropertySchemaValue = NumberPropertySchema
```

**Signature**

```ts
type NumberPropertySchema = typeof NumberPropertySchema.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10066)

Since v0.0.0

## PermissionOption (type alias)

Type for `PermissionOption`.

**Example**

```ts
import type { PermissionOption } from "@beep/acp/schema"

type PermissionOptionValue = PermissionOption
```

**Signature**

```ts
type PermissionOption = typeof PermissionOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L874)

Since v0.0.0

## PermissionOptionId (type alias)

Type for `PermissionOptionId`.

**Example**

```ts
import type { PermissionOptionId } from "@beep/acp/schema"

type PermissionOptionIdValue = PermissionOptionId
```

**Signature**

```ts
type PermissionOptionId = typeof PermissionOptionId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10101)

Since v0.0.0

## PermissionOptionKind (type alias)

Type for `PermissionOptionKind`.

**Example**

```ts
import type { PermissionOptionKind } from "@beep/acp/schema"

type PermissionOptionKindValue = PermissionOptionKind
```

**Signature**

```ts
type PermissionOptionKind = typeof PermissionOptionKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10142)

Since v0.0.0

## Plan (type alias)

Type for `Plan`.

**Example**

```ts
import type { Plan } from "@beep/acp/schema"

type PlanValue = Plan
```

**Signature**

```ts
type Plan = typeof Plan.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10192)

Since v0.0.0

## PlanEntry (type alias)

Type for `PlanEntry`.

**Example**

```ts
import type { PlanEntry } from "@beep/acp/schema"

type PlanEntryValue = PlanEntry
```

**Signature**

```ts
type PlanEntry = typeof PlanEntry.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L932)

Since v0.0.0

## PlanEntryPriority (type alias)

Type for `PlanEntryPriority`.

**Example**

```ts
import type { PlanEntryPriority } from "@beep/acp/schema"

type PlanEntryPriorityValue = PlanEntryPriority
```

**Signature**

```ts
type PlanEntryPriority = typeof PlanEntryPriority.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10228)

Since v0.0.0

## PlanEntryStatus (type alias)

Type for `PlanEntryStatus`.

**Example**

```ts
import type { PlanEntryStatus } from "@beep/acp/schema"

type PlanEntryStatusValue = PlanEntryStatus
```

**Signature**

```ts
type PlanEntryStatus = typeof PlanEntryStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10268)

Since v0.0.0

## PromptCapabilities (type alias)

Type for `PromptCapabilities`.

**Example**

```ts
import type { PromptCapabilities } from "@beep/acp/schema"

type PromptCapabilitiesValue = PromptCapabilities
```

**Signature**

```ts
type PromptCapabilities = typeof PromptCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10333)

Since v0.0.0

## PromptRequest (type alias)

Type for `PromptRequest`.

**Example**

```ts
import type { PromptRequest } from "@beep/acp/schema"

type PromptRequestValue = PromptRequest
```

**Signature**

```ts
type PromptRequest = typeof PromptRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10396)

Since v0.0.0

## PromptResponse (type alias)

Type for `PromptResponse`.

**Example**

```ts
import type { PromptResponse } from "@beep/acp/schema"

type PromptResponseValue = PromptResponse
```

**Signature**

```ts
type PromptResponse = typeof PromptResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10467)

Since v0.0.0

## ProtocolVersion (type alias)

Type for `ProtocolVersion`.

**Example**

```ts
import type { ProtocolVersion } from "@beep/acp/schema"

type ProtocolVersionValue = ProtocolVersion
```

**Signature**

```ts
type ProtocolVersion = typeof ProtocolVersion.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10507)

Since v0.0.0

## ReadTextFileRequest (type alias)

Type for `ReadTextFileRequest`.

**Example**

```ts
import type { ReadTextFileRequest } from "@beep/acp/schema"

type ReadTextFileRequestValue = ReadTextFileRequest
```

**Signature**

```ts
type ReadTextFileRequest = typeof ReadTextFileRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10582)

Since v0.0.0

## ReadTextFileResponse (type alias)

Type for `ReadTextFileResponse`.

**Example**

```ts
import type { ReadTextFileResponse } from "@beep/acp/schema"

type ReadTextFileResponseValue = ReadTextFileResponse
```

**Signature**

```ts
type ReadTextFileResponse = typeof ReadTextFileResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10628)

Since v0.0.0

## ReleaseTerminalRequest (type alias)

Type for `ReleaseTerminalRequest`.

**Example**

```ts
import type { ReleaseTerminalRequest } from "@beep/acp/schema"

type ReleaseTerminalRequestValue = ReleaseTerminalRequest
```

**Signature**

```ts
type ReleaseTerminalRequest = typeof ReleaseTerminalRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10680)

Since v0.0.0

## ReleaseTerminalResponse (type alias)

Type for `ReleaseTerminalResponse`.

**Example**

```ts
import type { ReleaseTerminalResponse } from "@beep/acp/schema"

type ReleaseTerminalResponseValue = ReleaseTerminalResponse
```

**Signature**

```ts
type ReleaseTerminalResponse = typeof ReleaseTerminalResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10725)

Since v0.0.0

## RequestId (type alias)

Type for `RequestId`.

**Example**

```ts
import type { RequestId } from "@beep/acp/schema"

type RequestIdValue = RequestId
```

**Signature**

```ts
type RequestId = typeof RequestId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L972)

Since v0.0.0

## RequestPermissionOutcome (type alias)

Type for `RequestPermissionOutcome`.

**Example**

```ts
import type { RequestPermissionOutcome } from "@beep/acp/schema"

type RequestPermissionOutcomeValue = RequestPermissionOutcome
```

**Signature**

```ts
type RequestPermissionOutcome = typeof RequestPermissionOutcome.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10785)

Since v0.0.0

## RequestPermissionRequest (type alias)

Type for `RequestPermissionRequest`.

**Example**

```ts
import type { RequestPermissionRequest } from "@beep/acp/schema"

type RequestPermissionRequestValue = RequestPermissionRequest
```

**Signature**

```ts
type RequestPermissionRequest = typeof RequestPermissionRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10895)

Since v0.0.0

## RequestPermissionResponse (type alias)

Type for `RequestPermissionResponse`.

**Example**

```ts
import type { RequestPermissionResponse } from "@beep/acp/schema"

type RequestPermissionResponseValue = RequestPermissionResponse
```

**Signature**

```ts
type RequestPermissionResponse = typeof RequestPermissionResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10966)

Since v0.0.0

## ResourceLink (type alias)

Type for `ResourceLink`.

**Example**

```ts
import type { ResourceLink } from "@beep/acp/schema"

type ResourceLinkValue = ResourceLink
```

**Signature**

```ts
type ResourceLink = typeof ResourceLink.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11024)

Since v0.0.0

## ResumeSessionRequest (type alias)

Type for `ResumeSessionRequest`.

**Example**

```ts
import type { ResumeSessionRequest } from "@beep/acp/schema"

type ResumeSessionRequestValue = ResumeSessionRequest
```

**Signature**

```ts
type ResumeSessionRequest = typeof ResumeSessionRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11082)

Since v0.0.0

## ResumeSessionResponse (type alias)

Type for `ResumeSessionResponse`.

**Example**

```ts
import type { ResumeSessionResponse } from "@beep/acp/schema"

type ResumeSessionResponseValue = ResumeSessionResponse
```

**Signature**

```ts
type ResumeSessionResponse = typeof ResumeSessionResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11149)

Since v0.0.0

## Role (type alias)

Type for `Role`.

**Example**

```ts
import type { Role } from "@beep/acp/schema"

type RoleValue = Role
```

**Signature**

```ts
type Role = typeof Role.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1008)

Since v0.0.0

## SelectedPermissionOutcome (type alias)

Type for `SelectedPermissionOutcome`.

**Example**

```ts
import type { SelectedPermissionOutcome } from "@beep/acp/schema"

type SelectedPermissionOutcomeValue = SelectedPermissionOutcome
```

**Signature**

```ts
type SelectedPermissionOutcome = typeof SelectedPermissionOutcome.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11197)

Since v0.0.0

## SessionCapabilities (type alias)

Type for `SessionCapabilities`.

**Example**

```ts
import type { SessionCapabilities } from "@beep/acp/schema"

type SessionCapabilitiesValue = SessionCapabilities
```

**Signature**

```ts
type SessionCapabilities = typeof SessionCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11266)

Since v0.0.0

## SessionCloseCapabilities (type alias)

Type for `SessionCloseCapabilities`.

**Example**

```ts
import type { SessionCloseCapabilities } from "@beep/acp/schema"

type SessionCloseCapabilitiesValue = SessionCloseCapabilities
```

**Signature**

```ts
type SessionCloseCapabilities = typeof SessionCloseCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1054)

Since v0.0.0

## SessionConfigBoolean (type alias)

Type for `SessionConfigBoolean`.

**Example**

```ts
import type { SessionConfigBoolean } from "@beep/acp/schema"

type SessionConfigBooleanValue = SessionConfigBoolean
```

**Signature**

```ts
type SessionConfigBoolean = typeof SessionConfigBoolean.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11306)

Since v0.0.0

## SessionConfigGroupId (type alias)

Type for `SessionConfigGroupId`.

**Example**

```ts
import type { SessionConfigGroupId } from "@beep/acp/schema"

type SessionConfigGroupIdValue = SessionConfigGroupId
```

**Signature**

```ts
type SessionConfigGroupId = typeof SessionConfigGroupId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11342)

Since v0.0.0

## SessionConfigId (type alias)

Type for `SessionConfigId`.

**Example**

```ts
import type { SessionConfigId } from "@beep/acp/schema"

type SessionConfigIdValue = SessionConfigId
```

**Signature**

```ts
type SessionConfigId = typeof SessionConfigId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11377)

Since v0.0.0

## SessionConfigOption (type alias)

Type for `SessionConfigOption`.

**Example**

```ts
import type { SessionConfigOption } from "@beep/acp/schema"

type SessionConfigOptionValue = SessionConfigOption
```

**Signature**

```ts
type SessionConfigOption = typeof SessionConfigOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L3089)

Since v0.0.0

## SessionConfigOptionCategory (type alias)

Type for `SessionConfigOptionCategory`.

**Example**

```ts
import type { SessionConfigOptionCategory } from "@beep/acp/schema"

type SessionConfigOptionCategoryValue = SessionConfigOptionCategory
```

**Signature**

```ts
type SessionConfigOptionCategory = typeof SessionConfigOptionCategory.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1100)

Since v0.0.0

## SessionConfigSelect (type alias)

Type for `SessionConfigSelect`.

**Example**

```ts
import type { SessionConfigSelect } from "@beep/acp/schema"

type SessionConfigSelectValue = SessionConfigSelect
```

**Signature**

```ts
type SessionConfigSelect = typeof SessionConfigSelect.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11429)

Since v0.0.0

## SessionConfigSelectGroup (type alias)

Type for `SessionConfigSelectGroup`.

**Example**

```ts
import type { SessionConfigSelectGroup } from "@beep/acp/schema"

type SessionConfigSelectGroupValue = SessionConfigSelectGroup
```

**Signature**

```ts
type SessionConfigSelectGroup = typeof SessionConfigSelectGroup.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2275)

Since v0.0.0

## SessionConfigSelectOption (type alias)

Type for `SessionConfigSelectOption`.

**Example**

```ts
import type { SessionConfigSelectOption } from "@beep/acp/schema"

type SessionConfigSelectOptionValue = SessionConfigSelectOption
```

**Signature**

```ts
type SessionConfigSelectOption = typeof SessionConfigSelectOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1160)

Since v0.0.0

## SessionConfigSelectOptions (type alias)

Type for `SessionConfigSelectOptions`.

**Example**

```ts
import type { SessionConfigSelectOptions } from "@beep/acp/schema"

type SessionConfigSelectOptionsValue = SessionConfigSelectOptions
```

**Signature**

```ts
type SessionConfigSelectOptions = typeof SessionConfigSelectOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11473)

Since v0.0.0

## SessionConfigValueId (type alias)

Type for `SessionConfigValueId`.

**Example**

```ts
import type { SessionConfigValueId } from "@beep/acp/schema"

type SessionConfigValueIdValue = SessionConfigValueId
```

**Signature**

```ts
type SessionConfigValueId = typeof SessionConfigValueId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11509)

Since v0.0.0

## SessionForkCapabilities (type alias)

Type for `SessionForkCapabilities`.

**Example**

```ts
import type { SessionForkCapabilities } from "@beep/acp/schema"

type SessionForkCapabilitiesValue = SessionForkCapabilities
```

**Signature**

```ts
type SessionForkCapabilities = typeof SessionForkCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1206)

Since v0.0.0

## SessionId (type alias)

Type for `SessionId`.

**Example**

```ts
import type { SessionId } from "@beep/acp/schema"

type SessionIdValue = SessionId
```

**Signature**

```ts
type SessionId = typeof SessionId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11545)

Since v0.0.0

## SessionInfo (type alias)

Type for `SessionInfo`.

**Example**

```ts
import type { SessionInfo } from "@beep/acp/schema"

type SessionInfoValue = SessionInfo
```

**Signature**

```ts
type SessionInfo = typeof SessionInfo.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1275)

Since v0.0.0

## SessionInfoUpdate (type alias)

Type for `SessionInfoUpdate`.

**Example**

```ts
import type { SessionInfoUpdate } from "@beep/acp/schema"

type SessionInfoUpdateValue = SessionInfoUpdate
```

**Signature**

```ts
type SessionInfoUpdate = typeof SessionInfoUpdate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11609)

Since v0.0.0

## SessionListCapabilities (type alias)

Type for `SessionListCapabilities`.

**Example**

```ts
import type { SessionListCapabilities } from "@beep/acp/schema"

type SessionListCapabilitiesValue = SessionListCapabilities
```

**Signature**

```ts
type SessionListCapabilities = typeof SessionListCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1321)

Since v0.0.0

## SessionMode (type alias)

Type for `SessionMode`.

**Example**

```ts
import type { SessionMode } from "@beep/acp/schema"

type SessionModeValue = SessionMode
```

**Signature**

```ts
type SessionMode = typeof SessionMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2324)

Since v0.0.0

## SessionModeId (type alias)

Type for `SessionModeId`.

**Example**

```ts
import type { SessionModeId } from "@beep/acp/schema"

type SessionModeIdValue = SessionModeId
```

**Signature**

```ts
type SessionModeId = typeof SessionModeId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1356)

Since v0.0.0

## SessionModeState (type alias)

Type for `SessionModeState`.

**Example**

```ts
import type { SessionModeState } from "@beep/acp/schema"

type SessionModeStateValue = SessionModeState
```

**Signature**

```ts
type SessionModeState = typeof SessionModeState.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L3140)

Since v0.0.0

## SessionModelState (type alias)

Type for `SessionModelState`.

**Example**

```ts
import type { SessionModelState } from "@beep/acp/schema"

type SessionModelStateValue = SessionModelState
```

**Signature**

```ts
type SessionModelState = typeof SessionModelState.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2165)

Since v0.0.0

## SessionNotification (type alias)

Type for `SessionNotification`.

**Example**

```ts
import type { SessionNotification } from "@beep/acp/schema"

type SessionNotificationValue = SessionNotification
```

**Signature**

```ts
type SessionNotification = typeof SessionNotification.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L12299)

Since v0.0.0

## SessionResumeCapabilities (type alias)

Type for `SessionResumeCapabilities`.

**Example**

```ts
import type { SessionResumeCapabilities } from "@beep/acp/schema"

type SessionResumeCapabilitiesValue = SessionResumeCapabilities
```

**Signature**

```ts
type SessionResumeCapabilities = typeof SessionResumeCapabilities.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1402)

Since v0.0.0

## SessionUpdate (type alias)

Type for `SessionUpdate`.

**Example**

```ts
import type { SessionUpdate } from "@beep/acp/schema"

type SessionUpdateValue = SessionUpdate
```

**Signature**

```ts
type SessionUpdate = typeof SessionUpdate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L12964)

Since v0.0.0

## SetSessionConfigOptionRequest (type alias)

Type for `SetSessionConfigOptionRequest`.

**Example**

```ts
import type { SetSessionConfigOptionRequest } from "@beep/acp/schema"

type SetSessionConfigOptionRequestValue = SetSessionConfigOptionRequest
```

**Signature**

```ts
type SetSessionConfigOptionRequest = typeof SetSessionConfigOptionRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13048)

Since v0.0.0

## SetSessionConfigOptionResponse (type alias)

Type for `SetSessionConfigOptionResponse`.

**Example**

```ts
import type { SetSessionConfigOptionResponse } from "@beep/acp/schema"

type SetSessionConfigOptionResponseValue = SetSessionConfigOptionResponse
```

**Signature**

```ts
type SetSessionConfigOptionResponse = typeof SetSessionConfigOptionResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13098)

Since v0.0.0

## SetSessionModeRequest (type alias)

Type for `SetSessionModeRequest`.

**Example**

```ts
import type { SetSessionModeRequest } from "@beep/acp/schema"

type SetSessionModeRequestValue = SetSessionModeRequest
```

**Signature**

```ts
type SetSessionModeRequest = typeof SetSessionModeRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13251)

Since v0.0.0

## SetSessionModeResponse (type alias)

Type for `SetSessionModeResponse`.

**Example**

```ts
import type { SetSessionModeResponse } from "@beep/acp/schema"

type SetSessionModeResponseValue = SetSessionModeResponse
```

**Signature**

```ts
type SetSessionModeResponse = typeof SetSessionModeResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13296)

Since v0.0.0

## SetSessionModelRequest (type alias)

Type for `SetSessionModelRequest`.

**Example**

```ts
import type { SetSessionModelRequest } from "@beep/acp/schema"

type SetSessionModelRequestValue = SetSessionModelRequest
```

**Signature**

```ts
type SetSessionModelRequest = typeof SetSessionModelRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13153)

Since v0.0.0

## SetSessionModelResponse (type alias)

Type for `SetSessionModelResponse`.

**Example**

```ts
import type { SetSessionModelResponse } from "@beep/acp/schema"

type SetSessionModelResponseValue = SetSessionModelResponse
```

**Signature**

```ts
type SetSessionModelResponse = typeof SetSessionModelResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13199)

Since v0.0.0

## StopReason (type alias)

Type for `StopReason`.

**Example**

```ts
import type { StopReason } from "@beep/acp/schema"

type StopReasonValue = StopReason
```

**Signature**

```ts
type StopReason = typeof StopReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13338)

Since v0.0.0

## StringFormat (type alias)

Type for `StringFormat`.

**Example**

```ts
import type { StringFormat } from "@beep/acp/schema"

type StringFormatValue = StringFormat
```

**Signature**

```ts
type StringFormat = typeof StringFormat.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1443)

Since v0.0.0

## StringPropertySchema (type alias)

Type for `StringPropertySchema`.

**Example**

```ts
import type { StringPropertySchema } from "@beep/acp/schema"

type StringPropertySchemaValue = StringPropertySchema
```

**Signature**

```ts
type StringPropertySchema = typeof StringPropertySchema.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13439)

Since v0.0.0

## Terminal (type alias)

Type for `Terminal`.

**Example**

```ts
import type { Terminal } from "@beep/acp/schema"

type TerminalValue = Terminal
```

**Signature**

```ts
type Terminal = typeof Terminal.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13486)

Since v0.0.0

## TerminalExitStatus (type alias)

Type for `TerminalExitStatus`.

**Example**

```ts
import type { TerminalExitStatus } from "@beep/acp/schema"

type TerminalExitStatusValue = TerminalExitStatus
```

**Signature**

```ts
type TerminalExitStatus = typeof TerminalExitStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1509)

Since v0.0.0

## TerminalOutputRequest (type alias)

Type for `TerminalOutputRequest`.

**Example**

```ts
import type { TerminalOutputRequest } from "@beep/acp/schema"

type TerminalOutputRequestValue = TerminalOutputRequest
```

**Signature**

```ts
type TerminalOutputRequest = typeof TerminalOutputRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13539)

Since v0.0.0

## TerminalOutputResponse (type alias)

Type for `TerminalOutputResponse`.

**Example**

```ts
import type { TerminalOutputResponse } from "@beep/acp/schema"

type TerminalOutputResponseValue = TerminalOutputResponse
```

**Signature**

```ts
type TerminalOutputResponse = typeof TerminalOutputResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13595)

Since v0.0.0

## TextContent (type alias)

Type for `TextContent`.

**Example**

```ts
import type { TextContent } from "@beep/acp/schema"

type TextContentValue = TextContent
```

**Signature**

```ts
type TextContent = typeof TextContent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13642)

Since v0.0.0

## TextResourceContents (type alias)

Type for `TextResourceContents`.

**Example**

```ts
import type { TextResourceContents } from "@beep/acp/schema"

type TextResourceContentsValue = TextResourceContents
```

**Signature**

```ts
type TextResourceContents = typeof TextResourceContents.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13690)

Since v0.0.0

## TitledMultiSelectItems (type alias)

Type for `TitledMultiSelectItems`.

**Example**

```ts
import type { TitledMultiSelectItems } from "@beep/acp/schema"

type TitledMultiSelectItemsValue = TitledMultiSelectItems
```

**Signature**

```ts
type TitledMultiSelectItems = typeof TitledMultiSelectItems.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13729)

Since v0.0.0

## ToolCall (type alias)

Type for `ToolCall`.

**Example**

```ts
import type { ToolCall } from "@beep/acp/schema"

type ToolCallValue = ToolCall
```

**Signature**

```ts
type ToolCall = typeof ToolCall.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13823)

Since v0.0.0

## ToolCallContent (type alias)

Type for `ToolCallContent`.

**Example**

```ts
import type { ToolCallContent } from "@beep/acp/schema"

type ToolCallContentValue = ToolCallContent
```

**Signature**

```ts
type ToolCallContent = typeof ToolCallContent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2962)

Since v0.0.0

## ToolCallId (type alias)

Type for `ToolCallId`.

**Example**

```ts
import type { ToolCallId } from "@beep/acp/schema"

type ToolCallIdValue = ToolCallId
```

**Signature**

```ts
type ToolCallId = typeof ToolCallId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13858)

Since v0.0.0

## ToolCallLocation (type alias)

Type for `ToolCallLocation`.

**Example**

```ts
import type { ToolCallLocation } from "@beep/acp/schema"

type ToolCallLocationValue = ToolCallLocation
```

**Signature**

```ts
type ToolCallLocation = typeof ToolCallLocation.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1569)

Since v0.0.0

## ToolCallStatus (type alias)

Type for `ToolCallStatus`.

**Example**

```ts
import type { ToolCallStatus } from "@beep/acp/schema"

type ToolCallStatusValue = ToolCallStatus
```

**Signature**

```ts
type ToolCallStatus = typeof ToolCallStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1610)

Since v0.0.0

## ToolCallUpdate (type alias)

Type for `ToolCallUpdate`.

**Example**

```ts
import type { ToolCallUpdate } from "@beep/acp/schema"

type ToolCallUpdateValue = ToolCallUpdate
```

**Signature**

```ts
type ToolCallUpdate = typeof ToolCallUpdate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13945)

Since v0.0.0

## ToolKind (type alias)

Type for `ToolKind`.

**Example**

```ts
import type { ToolKind } from "@beep/acp/schema"

type ToolKindValue = ToolKind
```

**Signature**

```ts
type ToolKind = typeof ToolKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1657)

Since v0.0.0

## UnstructuredCommandInput (type alias)

Type for `UnstructuredCommandInput`.

**Example**

```ts
import type { UnstructuredCommandInput } from "@beep/acp/schema"

type UnstructuredCommandInputValue = UnstructuredCommandInput
```

**Signature**

```ts
type UnstructuredCommandInput = typeof UnstructuredCommandInput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13994)

Since v0.0.0

## UntitledMultiSelectItems (type alias)

Type for `UntitledMultiSelectItems`.

**Example**

```ts
import type { UntitledMultiSelectItems } from "@beep/acp/schema"

type UntitledMultiSelectItemsValue = UntitledMultiSelectItems
```

**Signature**

```ts
type UntitledMultiSelectItems = typeof UntitledMultiSelectItems.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14035)

Since v0.0.0

## Usage (type alias)

Type for `Usage`.

**Example**

```ts
import type { Usage } from "@beep/acp/schema"

type UsageValue = Usage
```

**Signature**

```ts
type Usage = typeof Usage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1745)

Since v0.0.0

## UsageUpdate (type alias)

Type for `UsageUpdate`.

**Example**

```ts
import type { UsageUpdate } from "@beep/acp/schema"

type UsageUpdateValue = UsageUpdate
```

**Signature**

```ts
type UsageUpdate = typeof UsageUpdate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14098)

Since v0.0.0

## WaitForTerminalExitRequest (type alias)

Type for `WaitForTerminalExitRequest`.

**Example**

```ts
import type { WaitForTerminalExitRequest } from "@beep/acp/schema"

type WaitForTerminalExitRequestValue = WaitForTerminalExitRequest
```

**Signature**

```ts
type WaitForTerminalExitRequest = typeof WaitForTerminalExitRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14150)

Since v0.0.0

## WaitForTerminalExitResponse (type alias)

Type for `WaitForTerminalExitResponse`.

**Example**

```ts
import type { WaitForTerminalExitResponse } from "@beep/acp/schema"

type WaitForTerminalExitResponseValue = WaitForTerminalExitResponse
```

**Signature**

```ts
type WaitForTerminalExitResponse = typeof WaitForTerminalExitResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14216)

Since v0.0.0

## WriteTextFileRequest (type alias)

Type for `WriteTextFileRequest`.

**Example**

```ts
import type { WriteTextFileRequest } from "@beep/acp/schema"

type WriteTextFileRequestValue = WriteTextFileRequest
```

**Signature**

```ts
type WriteTextFileRequest = typeof WriteTextFileRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14273)

Since v0.0.0

## WriteTextFileResponse (type alias)

Type for `WriteTextFileResponse`.

**Example**

```ts
import type { WriteTextFileResponse } from "@beep/acp/schema"

type WriteTextFileResponseValue = WriteTextFileResponse
```

**Signature**

```ts
type WriteTextFileResponse = typeof WriteTextFileResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14318)

Since v0.0.0

# schemas

## AgentAuthCapabilities

Generated ACP schema for `AgentAuthCapabilities`.

**Example**

```ts
import { AgentAuthCapabilities } from "@beep/acp/schema"

console.log(AgentAuthCapabilities.ast)
```

**Signature**

```ts
declare const AgentAuthCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly logout: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L3155)

Since v0.0.0

## AgentCapabilities

Generated ACP schema for `AgentCapabilities`.

**Example**

```ts
import { AgentCapabilities } from "@beep/acp/schema"

console.log(AgentCapabilities.ast)
```

**Signature**

```ts
declare const AgentCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly auth: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly logout: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>; readonly loadSession: S.optionalKey<S.Boolean>; readonly mcpCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly http: S.optionalKey<S.Boolean>; readonly sse: S.optionalKey<S.Boolean>; }>>; readonly promptCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audio: S.optionalKey<S.Boolean>; readonly embeddedContext: S.optionalKey<S.Boolean>; readonly image: S.optionalKey<S.Boolean>; }>>; readonly sessionCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly close: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly fork: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly list: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly resume: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L3207)

Since v0.0.0

## AgentNotification

Generated ACP schema for `AgentNotification`.

**Example**

```ts
import { AgentNotification } from "@beep/acp/schema"

console.log(AgentNotification.ast)
```

**Signature**

```ts
declare const AgentNotification: AnnotatedSchema<S.Struct<{ readonly method: S.String; readonly params: S.optionalKey<S.Union<readonly [S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly update: S.Union<readonly [S.Struct<{ readonly sessionUpdate: S.Literal<"user_message_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"agent_message_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"agent_thought_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"tool_call">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>>; readonly kind: S.optionalKey<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>; readonly locations: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>; readonly title: S.String; readonly toolCallId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"tool_call_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>, S.Null]>>; readonly kind: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>, S.Null]>>; readonly locations: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>, S.Null]>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly toolCallId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"plan">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly entries: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.String; readonly priority: S.Literals<readonly ["high", "medium", "low"]>; readonly status: S.Literals<readonly ["pending", "in_progress", "completed"]>; }>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"available_commands_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableCommands: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.String; readonly input: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly hint: S.String; }>]>>, S.Null]>>; readonly name: S.String; }>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"current_mode_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly currentModeId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"config_option_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"session_info_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly updatedAt: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"usage_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cost: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly amount: S.Finite; readonly currency: S.String; }>>, S.Null]>>; readonly size: S.Finite; readonly used: S.Finite; }>]>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly elicitationId: S.String; }>, S.Unknown]>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L3386)

Since v0.0.0

## AgentRequest

Generated ACP schema for `AgentRequest`.

**Example**

```ts
import { AgentRequest } from "@beep/acp/schema"

console.log(AgentRequest.ast)
```

**Signature**

```ts
declare const AgentRequest: AnnotatedSchema<S.Struct<{ readonly id: AnnotatedSchema<S.Union<readonly [S.Null, S.Finite, S.String]>>; readonly method: S.String; readonly params: S.optionalKey<S.Union<readonly [S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.String; readonly path: S.String; readonly sessionId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly limit: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; readonly sessionId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly kind: S.Literals<readonly ["allow_once", "allow_always", "reject_once", "reject_always"]>; readonly name: S.String; readonly optionId: S.String; }>>>; readonly sessionId: S.String; readonly toolCall: S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>, S.Null]>>; readonly kind: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>, S.Null]>>; readonly locations: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>, S.Null]>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly toolCallId: S.String; }>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.optionalKey<S.$Array<S.String>>; readonly command: S.String; readonly cwd: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly env: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>>; readonly outputByteLimit: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly sessionId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly terminalId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly terminalId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly terminalId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly terminalId: S.String; }>, S.Union<readonly [S.Struct<{ readonly mode: S.Literal<"form">; readonly requestedSchema: S.Struct<{ readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly properties: S.optionalKey<S.$Record<S.String, AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"string">; readonly default: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly enum: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly format: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["email", "uri", "date", "date-time"]>>, S.Null]>>; readonly maxLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly oneOf: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>, S.Null]>>; readonly pattern: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"number">; readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"integer">; readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly default: S.optionalKey<S.Union<readonly [S.Boolean, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"array">; readonly default: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly items: S.Union<readonly [S.Struct<{ readonly enum: S.$Array<S.String>; readonly type: S.Literal<"string">; }>, S.Struct<{ readonly anyOf: S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>; }>]>; readonly maxItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>]>>>>; readonly required: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly type: S.optionalKey<S.Literal<"object">>; }>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly message: S.String; readonly sessionId: S.String; }>, S.Struct<{ readonly mode: S.Literal<"url">; readonly elicitationId: S.String; readonly url: S.String; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly message: S.String; readonly sessionId: S.String; }>]>, S.Unknown]>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L4163)

Since v0.0.0

## AgentResponse

Generated ACP schema for `AgentResponse`.

**Example**

```ts
import { AgentResponse } from "@beep/acp/schema"

console.log(AgentResponse.ast)
```

**Signature**

```ts
declare const AgentResponse: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly id: AnnotatedSchema<S.Union<readonly [S.Null, S.Finite, S.String]>>; readonly result: S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly agentCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly auth: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly logout: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>; readonly loadSession: S.optionalKey<S.Boolean>; readonly mcpCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly http: S.optionalKey<S.Boolean>; readonly sse: S.optionalKey<S.Boolean>; }>>; readonly promptCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audio: S.optionalKey<S.Boolean>; readonly embeddedContext: S.optionalKey<S.Boolean>; readonly image: S.optionalKey<S.Boolean>; }>>; readonly sessionCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly close: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly fork: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly list: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly resume: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>; }>>; readonly agentInfo: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly version: S.String; }>>, S.Null]>>; readonly authMethods: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"env_var">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly link: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly vars: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly label: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly optional: S.optionalKey<S.Boolean>; readonly secret: S.optionalKey<S.Boolean>; }>>>; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.optionalKey<S.$Array<S.String>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly env: S.optionalKey<S.$Record<S.String, S.String>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>>; readonly protocolVersion: S.Finite; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>, S.Null]>>; readonly models: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModels: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly modelId: S.String; readonly name: S.String; }>>>; readonly currentModelId: S.String; }>>, S.Null]>>; readonly modes: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModes: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: AnnotatedSchema<S.String>; readonly name: S.String; }>>>; readonly currentModeId: S.String; }>>, S.Null]>>; readonly sessionId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>, S.Null]>>; readonly models: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModels: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly modelId: S.String; readonly name: S.String; }>>>; readonly currentModelId: S.String; }>>, S.Null]>>; readonly modes: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModes: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: AnnotatedSchema<S.String>; readonly name: S.String; }>>>; readonly currentModeId: S.String; }>>, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly nextCursor: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly sessions: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly sessionId: S.String; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly updatedAt: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>, S.Null]>>; readonly models: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModels: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly modelId: S.String; readonly name: S.String; }>>>; readonly currentModelId: S.String; }>>, S.Null]>>; readonly modes: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModes: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: AnnotatedSchema<S.String>; readonly name: S.String; }>>>; readonly currentModeId: S.String; }>>, S.Null]>>; readonly sessionId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>, S.Null]>>; readonly models: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModels: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly modelId: S.String; readonly name: S.String; }>>>; readonly currentModelId: S.String; }>>, S.Null]>>; readonly modes: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModes: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: AnnotatedSchema<S.String>; readonly name: S.String; }>>>; readonly currentModeId: S.String; }>>, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly stopReason: S.Literals<readonly ["end_turn", "max_tokens", "max_turn_requests", "refusal", "cancelled"]>; readonly usage: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly cachedReadTokens: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly cachedWriteTokens: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly inputTokens: S.Finite; readonly outputTokens: S.Finite; readonly thoughtTokens: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly totalTokens: S.Finite; }>>, S.Null]>>; readonly userMessageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>, S.Unknown]>; }>, S.Struct<{ readonly error: AnnotatedSchema<S.Struct<{ readonly code: S.Union<readonly [S.Literal<-32700>, S.Literal<-32600>, S.Literal<-32601>, S.Literal<-32602>, S.Literal<-32603>, S.Literal<-32800>, S.Literal<-32000>, S.Literal<-32002>, S.Literal<-32042>, S.Finite]>; readonly data: S.optionalKey<S.Unknown>; readonly message: S.String; }>>; readonly id: AnnotatedSchema<S.Union<readonly [S.Null, S.Finite, S.String]>>; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L4609)

Since v0.0.0

## Annotations

Generated ACP schema for `Annotations`.

**Example**

```ts
import { Annotations } from "@beep/acp/schema"

console.log(Annotations.ast)
```

**Signature**

```ts
declare const Annotations: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2180)

Since v0.0.0

## AudioContent

Generated ACP schema for `AudioContent`.

**Example**

```ts
import { AudioContent } from "@beep/acp/schema"

console.log(AudioContent.ast)
```

**Signature**

```ts
declare const AudioContent: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5161)

Since v0.0.0

## AuthCapabilities

Generated ACP schema for `AuthCapabilities`.

**Example**

```ts
import { AuthCapabilities } from "@beep/acp/schema"

console.log(AuthCapabilities.ast)
```

**Signature**

```ts
declare const AuthCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminal: S.optionalKey<S.Boolean>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5209)

Since v0.0.0

## AuthEnvVar

Generated ACP schema for `AuthEnvVar`.

**Example**

```ts
import { AuthEnvVar } from "@beep/acp/schema"

console.log(AuthEnvVar.ast)
```

**Signature**

```ts
declare const AuthEnvVar: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly label: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly optional: S.optionalKey<S.Boolean>; readonly secret: S.optionalKey<S.Boolean>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L29)

Since v0.0.0

## AuthMethod

Generated ACP schema for `AuthMethod`.

**Example**

```ts
import { AuthMethod } from "@beep/acp/schema"

console.log(AuthMethod.ast)
```

**Signature**

```ts
declare const AuthMethod: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"env_var">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly link: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly vars: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly label: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly optional: S.optionalKey<S.Boolean>; readonly secret: S.optionalKey<S.Boolean>; }>>>; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.optionalKey<S.$Array<S.String>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly env: S.optionalKey<S.$Record<S.String, S.String>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1760)

Since v0.0.0

## AuthMethodAgent

Generated ACP schema for `AuthMethodAgent`.

**Example**

```ts
import { AuthMethodAgent } from "@beep/acp/schema"

console.log(AuthMethodAgent.ast)
```

**Signature**

```ts
declare const AuthMethodAgent: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5357)

Since v0.0.0

## AuthMethodEnvVar

Generated ACP schema for `AuthMethodEnvVar`.

**Example**

```ts
import { AuthMethodEnvVar } from "@beep/acp/schema"

console.log(AuthMethodEnvVar.ast)
```

**Signature**

```ts
declare const AuthMethodEnvVar: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly link: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly vars: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly label: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly optional: S.optionalKey<S.Boolean>; readonly secret: S.optionalKey<S.Boolean>; }>>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5418)

Since v0.0.0

## AuthMethodTerminal

Generated ACP schema for `AuthMethodTerminal`.

**Example**

```ts
import { AuthMethodTerminal } from "@beep/acp/schema"

console.log(AuthMethodTerminal.ast)
```

**Signature**

```ts
declare const AuthMethodTerminal: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.optionalKey<S.$Array<S.String>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly env: S.optionalKey<S.$Record<S.String, S.String>>; readonly id: S.String; readonly name: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5491)

Since v0.0.0

## AuthenticateRequest

Generated ACP schema for `AuthenticateRequest`.

**Example**

```ts
import { AuthenticateRequest } from "@beep/acp/schema"

console.log(AuthenticateRequest.ast)
```

**Signature**

```ts
declare const AuthenticateRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly methodId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5262)

Since v0.0.0

## AuthenticateResponse

Generated ACP schema for `AuthenticateResponse`.

**Example**

```ts
import { AuthenticateResponse } from "@beep/acp/schema"

console.log(AuthenticateResponse.ast)
```

**Signature**

```ts
declare const AuthenticateResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5312)

Since v0.0.0

## AvailableCommand

Generated ACP schema for `AvailableCommand`.

**Example**

```ts
import { AvailableCommand } from "@beep/acp/schema"

console.log(AvailableCommand.ast)
```

**Signature**

```ts
declare const AvailableCommand: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.String; readonly input: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly hint: S.String; }>]>>, S.Null]>>; readonly name: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1911)

Since v0.0.0

## AvailableCommandInput

Generated ACP schema for `AvailableCommandInput`.

**Example**

```ts
import { AvailableCommandInput } from "@beep/acp/schema"

console.log(AvailableCommandInput.ast)
```

**Signature**

```ts
declare const AvailableCommandInput: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly hint: S.String; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L100)

Since v0.0.0

## AvailableCommandsUpdate

Generated ACP schema for `AvailableCommandsUpdate`.

**Example**

```ts
import { AvailableCommandsUpdate } from "@beep/acp/schema"

console.log(AvailableCommandsUpdate.ast)
```

**Signature**

```ts
declare const AvailableCommandsUpdate: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableCommands: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.String; readonly input: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly hint: S.String; }>]>>, S.Null]>>; readonly name: S.String; }>>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5564)

Since v0.0.0

## BlobResourceContents

Generated ACP schema for `BlobResourceContents`.

**Example**

```ts
import { BlobResourceContents } from "@beep/acp/schema"

console.log(BlobResourceContents.ast)
```

**Signature**

```ts
declare const BlobResourceContents: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5612)

Since v0.0.0

## BooleanPropertySchema

Generated ACP schema for `BooleanPropertySchema`.

**Example**

```ts
import { BooleanPropertySchema } from "@beep/acp/schema"

console.log(BooleanPropertySchema.ast)
```

**Signature**

```ts
declare const BooleanPropertySchema: AnnotatedSchema<S.Struct<{ readonly default: S.optionalKey<S.Union<readonly [S.Boolean, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5660)

Since v0.0.0

## CancelNotification

Generated ACP schema for `CancelNotification`.

**Example**

```ts
import { CancelNotification } from "@beep/acp/schema"

console.log(CancelNotification.ast)
```

**Signature**

```ts
declare const CancelNotification: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5711)

Since v0.0.0

## CancelRequestNotification

Generated ACP schema for `CancelRequestNotification`.

**Example**

```ts
import { CancelRequestNotification } from "@beep/acp/schema"

console.log(CancelRequestNotification.ast)
```

**Signature**

```ts
declare const CancelRequestNotification: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly requestId: S.Union<readonly [S.Null, S.Finite, S.String]>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5761)

Since v0.0.0

## ClientCapabilities

Generated ACP schema for `ClientCapabilities`.

**Example**

```ts
import { ClientCapabilities } from "@beep/acp/schema"

console.log(ClientCapabilities.ast)
```

**Signature**

```ts
declare const ClientCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly auth: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminal: S.optionalKey<S.Boolean>; }>>; readonly elicitation: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly form: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly url: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>, S.Null]>>; readonly fs: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly readTextFile: S.optionalKey<S.Boolean>; readonly writeTextFile: S.optionalKey<S.Boolean>; }>>; readonly terminal: S.optionalKey<S.Boolean>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5815)

Since v0.0.0

## ClientNotification

Generated ACP schema for `ClientNotification`.

**Example**

```ts
import { ClientNotification } from "@beep/acp/schema"

console.log(ClientNotification.ast)
```

**Signature**

```ts
declare const ClientNotification: AnnotatedSchema<S.Struct<{ readonly method: S.String; readonly params: S.optionalKey<S.Union<readonly [S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; }>, S.Unknown]>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5928)

Since v0.0.0

## ClientRequest

Generated ACP schema for `ClientRequest`.

**Example**

```ts
import { ClientRequest } from "@beep/acp/schema"

console.log(ClientRequest.ast)
```

**Signature**

```ts
declare const ClientRequest: AnnotatedSchema<S.Struct<{ readonly id: AnnotatedSchema<S.Union<readonly [S.Null, S.Finite, S.String]>>; readonly method: S.String; readonly params: S.optionalKey<S.Union<readonly [S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly clientCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly auth: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminal: S.optionalKey<S.Boolean>; }>>; readonly elicitation: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly form: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly url: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>, S.Null]>>; readonly fs: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly readTextFile: S.optionalKey<S.Boolean>; readonly writeTextFile: S.optionalKey<S.Boolean>; }>>; readonly terminal: S.optionalKey<S.Boolean>; }>>; readonly clientInfo: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly version: S.String; }>>, S.Null]>>; readonly protocolVersion: S.Finite; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly methodId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly mcpServers: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"http">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly type: S.Literal<"sse">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.$Array<S.String>; readonly command: S.String; readonly env: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; }>]>>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly mcpServers: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"http">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly type: S.Literal<"sse">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.$Array<S.String>; readonly command: S.String; readonly env: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; }>]>>>; readonly sessionId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cursor: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly cwd: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly mcpServers: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"http">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly type: S.Literal<"sse">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.$Array<S.String>; readonly command: S.String; readonly env: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; }>]>>>>; readonly sessionId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly mcpServers: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"http">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly type: S.Literal<"sse">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.$Array<S.String>; readonly command: S.String; readonly env: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; }>]>>>>; readonly sessionId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly modeId: S.String; readonly sessionId: S.String; }>, S.Union<readonly [S.Struct<{ readonly type: S.Literal<"boolean">; readonly value: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configId: S.String; readonly sessionId: S.String; }>, S.Struct<{ readonly value: S.String; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configId: S.String; readonly sessionId: S.String; }>]>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly prompt: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>>>; readonly sessionId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly modelId: S.String; readonly sessionId: S.String; }>, S.Unknown]>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L5998)

Since v0.0.0

## ClientResponse

Generated ACP schema for `ClientResponse`.

**Example**

```ts
import { ClientResponse } from "@beep/acp/schema"

console.log(ClientResponse.ast)
```

**Signature**

```ts
declare const ClientResponse: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly id: AnnotatedSchema<S.Union<readonly [S.Null, S.Finite, S.String]>>; readonly result: S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly outcome: S.Union<readonly [S.Struct<{ readonly outcome: S.Literal<"cancelled">; }>, S.Struct<{ readonly outcome: S.Literal<"selected">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly optionId: S.String; }>]>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly exitStatus: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly exitCode: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly signal: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>, S.Null]>>; readonly output: S.String; readonly truncated: S.Boolean; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly exitCode: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly signal: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly action: S.Union<readonly [S.Struct<{ readonly action: S.Literal<"accept">; readonly content: S.optionalKey<S.Union<readonly [S.$Record<S.String, AnnotatedSchema<S.Union<readonly [S.String, S.Finite, S.Finite, S.Boolean, S.$Array<S.String>]>>>, S.Null]>>; }>, S.Struct<{ readonly action: S.Literal<"decline">; }>, S.Struct<{ readonly action: S.Literal<"cancel">; }>]>; }>, S.Unknown]>; }>, S.Struct<{ readonly error: AnnotatedSchema<S.Struct<{ readonly code: S.Union<readonly [S.Literal<-32700>, S.Literal<-32600>, S.Literal<-32601>, S.Literal<-32602>, S.Literal<-32603>, S.Literal<-32800>, S.Literal<-32000>, S.Literal<-32002>, S.Literal<-32042>, S.Finite]>; readonly data: S.optionalKey<S.Unknown>; readonly message: S.String; }>>; readonly id: AnnotatedSchema<S.Union<readonly [S.Null, S.Finite, S.String]>>; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L6491)

Since v0.0.0

## CloseSessionRequest

Generated ACP schema for `CloseSessionRequest`.

**Example**

```ts
import { CloseSessionRequest } from "@beep/acp/schema"

console.log(CloseSessionRequest.ast)
```

**Signature**

```ts
declare const CloseSessionRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L6759)

Since v0.0.0

## CloseSessionResponse

Generated ACP schema for `CloseSessionResponse`.

**Example**

```ts
import { CloseSessionResponse } from "@beep/acp/schema"

console.log(CloseSessionResponse.ast)
```

**Signature**

```ts
declare const CloseSessionResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L6809)

Since v0.0.0

## ConfigOptionUpdate

Generated ACP schema for `ConfigOptionUpdate`.

**Example**

```ts
import { ConfigOptionUpdate } from "@beep/acp/schema"

console.log(ConfigOptionUpdate.ast)
```

**Signature**

```ts
declare const ConfigOptionUpdate: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L6855)

Since v0.0.0

## Content

Generated ACP schema for `Content`.

**Example**

```ts
import { Content } from "@beep/acp/schema"

console.log(Content.ast)
```

**Signature**

```ts
declare const Content: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L6904)

Since v0.0.0

## ContentBlock

Generated ACP schema for `ContentBlock`.

**Example**

```ts
import { ContentBlock } from "@beep/acp/schema"

console.log(ContentBlock.ast)
```

**Signature**

```ts
declare const ContentBlock: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2650)

Since v0.0.0

## ContentChunk

Generated ACP schema for `ContentChunk`.

**Example**

```ts
import { ContentChunk } from "@beep/acp/schema"

console.log(ContentChunk.ast)
```

**Signature**

```ts
declare const ContentChunk: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7046)

Since v0.0.0

## Cost

Generated ACP schema for `Cost`.

**Example**

```ts
import { Cost } from "@beep/acp/schema"

console.log(Cost.ast)
```

**Signature**

```ts
declare const Cost: AnnotatedSchema<S.Struct<{ readonly amount: S.Finite; readonly currency: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L154)

Since v0.0.0

## CreateTerminalRequest

Generated ACP schema for `CreateTerminalRequest`.

**Example**

```ts
import { CreateTerminalRequest } from "@beep/acp/schema"

console.log(CreateTerminalRequest.ast)
```

**Signature**

```ts
declare const CreateTerminalRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.optionalKey<S.$Array<S.String>>; readonly command: S.String; readonly cwd: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly env: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>>; readonly outputByteLimit: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7197)

Since v0.0.0

## CreateTerminalResponse

Generated ACP schema for `CreateTerminalResponse`.

**Example**

```ts
import { CreateTerminalResponse } from "@beep/acp/schema"

console.log(CreateTerminalResponse.ast)
```

**Signature**

```ts
declare const CreateTerminalResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7277)

Since v0.0.0

## CurrentModeUpdate

Generated ACP schema for `CurrentModeUpdate`.

**Example**

```ts
import { CurrentModeUpdate } from "@beep/acp/schema"

console.log(CurrentModeUpdate.ast)
```

**Signature**

```ts
declare const CurrentModeUpdate: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly currentModeId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7325)

Since v0.0.0

## Diff

Generated ACP schema for `Diff`.

**Example**

```ts
import { Diff } from "@beep/acp/schema"

console.log(Diff.ast)
```

**Signature**

```ts
declare const Diff: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7374)

Since v0.0.0

## ElicitationAcceptAction

Generated ACP schema for `ElicitationAcceptAction`.

**Example**

```ts
import { ElicitationAcceptAction } from "@beep/acp/schema"

console.log(ElicitationAcceptAction.ast)
```

**Signature**

```ts
declare const ElicitationAcceptAction: AnnotatedSchema<S.Struct<{ readonly content: S.optionalKey<S.Union<readonly [S.$Record<S.String, AnnotatedSchema<S.Union<readonly [S.String, S.Finite, S.Finite, S.Boolean, S.$Array<S.String>]>>>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7432)

Since v0.0.0

## ElicitationAction

Generated ACP schema for `ElicitationAction`.

**Example**

```ts
import { ElicitationAction } from "@beep/acp/schema"

console.log(ElicitationAction.ast)
```

**Signature**

```ts
declare const ElicitationAction: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly action: S.Literal<"accept">; readonly content: S.optionalKey<S.Union<readonly [S.$Record<S.String, AnnotatedSchema<S.Union<readonly [S.String, S.Finite, S.Finite, S.Boolean, S.$Array<S.String>]>>>, S.Null]>>; }>, S.Struct<{ readonly action: S.Literal<"decline">; }>, S.Struct<{ readonly action: S.Literal<"cancel">; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7478)

Since v0.0.0

## ElicitationCapabilities

Generated ACP schema for `ElicitationCapabilities`.

**Example**

```ts
import { ElicitationCapabilities } from "@beep/acp/schema"

console.log(ElicitationCapabilities.ast)
```

**Signature**

```ts
declare const ElicitationCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly form: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly url: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1967)

Since v0.0.0

## ElicitationCompleteNotification

Generated ACP schema for `ElicitationCompleteNotification`.

**Example**

```ts
import { ElicitationCompleteNotification } from "@beep/acp/schema"

console.log(ElicitationCompleteNotification.ast)
```

**Signature**

```ts
declare const ElicitationCompleteNotification: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly elicitationId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7539)

Since v0.0.0

## ElicitationContentValue

Generated ACP schema for `ElicitationContentValue`.

**Example**

```ts
import { ElicitationContentValue } from "@beep/acp/schema"

console.log(ElicitationContentValue.ast)
```

**Signature**

```ts
declare const ElicitationContentValue: AnnotatedSchema<S.Union<readonly [S.String, S.Finite, S.Finite, S.Boolean, S.$Array<S.String>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L198)

Since v0.0.0

## ElicitationFormCapabilities

Generated ACP schema for `ElicitationFormCapabilities`.

**Example**

```ts
import { ElicitationFormCapabilities } from "@beep/acp/schema"

console.log(ElicitationFormCapabilities.ast)
```

**Signature**

```ts
declare const ElicitationFormCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L240)

Since v0.0.0

## ElicitationFormMode

Generated ACP schema for `ElicitationFormMode`.

**Example**

```ts
import { ElicitationFormMode } from "@beep/acp/schema"

console.log(ElicitationFormMode.ast)
```

**Signature**

```ts
declare const ElicitationFormMode: AnnotatedSchema<S.Struct<{ readonly requestedSchema: S.Struct<{ readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly properties: S.optionalKey<S.$Record<S.String, AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"string">; readonly default: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly enum: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly format: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["email", "uri", "date", "date-time"]>>, S.Null]>>; readonly maxLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly oneOf: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>, S.Null]>>; readonly pattern: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"number">; readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"integer">; readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly default: S.optionalKey<S.Union<readonly [S.Boolean, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"array">; readonly default: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly items: S.Union<readonly [S.Struct<{ readonly enum: S.$Array<S.String>; readonly type: S.Literal<"string">; }>, S.Struct<{ readonly anyOf: S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>; }>]>; readonly maxItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>]>>>>; readonly required: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly type: S.optionalKey<S.Literal<"object">>; }>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7590)

Since v0.0.0

## ElicitationId

Generated ACP schema for `ElicitationId`.

**Example**

```ts
import { ElicitationId } from "@beep/acp/schema"

console.log(ElicitationId.ast)
```

**Signature**

```ts
declare const ElicitationId: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7666)

Since v0.0.0

## ElicitationPropertySchema

Generated ACP schema for `ElicitationPropertySchema`.

**Example**

```ts
import { ElicitationPropertySchema } from "@beep/acp/schema"

console.log(ElicitationPropertySchema.ast)
```

**Signature**

```ts
declare const ElicitationPropertySchema: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"string">; readonly default: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly enum: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly format: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["email", "uri", "date", "date-time"]>>, S.Null]>>; readonly maxLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly oneOf: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>, S.Null]>>; readonly pattern: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"number">; readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"integer">; readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly default: S.optionalKey<S.Union<readonly [S.Boolean, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"array">; readonly default: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly items: S.Union<readonly [S.Struct<{ readonly enum: S.$Array<S.String>; readonly type: S.Literal<"string">; }>, S.Struct<{ readonly anyOf: S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>; }>]>; readonly maxItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2339)

Since v0.0.0

## ElicitationRequest

Generated ACP schema for `ElicitationRequest`.

**Example**

```ts
import { ElicitationRequest } from "@beep/acp/schema"

console.log(ElicitationRequest.ast)
```

**Signature**

```ts
declare const ElicitationRequest: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly mode: S.Literal<"form">; readonly requestedSchema: S.Struct<{ readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly properties: S.optionalKey<S.$Record<S.String, AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"string">; readonly default: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly enum: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly format: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["email", "uri", "date", "date-time"]>>, S.Null]>>; readonly maxLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly oneOf: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>, S.Null]>>; readonly pattern: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"number">; readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"integer">; readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly default: S.optionalKey<S.Union<readonly [S.Boolean, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"array">; readonly default: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly items: S.Union<readonly [S.Struct<{ readonly enum: S.$Array<S.String>; readonly type: S.Literal<"string">; }>, S.Struct<{ readonly anyOf: S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>; }>]>; readonly maxItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>]>>>>; readonly required: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly type: S.optionalKey<S.Literal<"object">>; }>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly message: S.String; readonly sessionId: S.String; }>, S.Struct<{ readonly mode: S.Literal<"url">; readonly elicitationId: S.String; readonly url: S.String; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly message: S.String; readonly sessionId: S.String; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7702)

Since v0.0.0

## ElicitationResponse

Generated ACP schema for `ElicitationResponse`.

**Example**

```ts
import { ElicitationResponse } from "@beep/acp/schema"

console.log(ElicitationResponse.ast)
```

**Signature**

```ts
declare const ElicitationResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly action: S.Union<readonly [S.Struct<{ readonly action: S.Literal<"accept">; readonly content: S.optionalKey<S.Union<readonly [S.$Record<S.String, AnnotatedSchema<S.Union<readonly [S.String, S.Finite, S.Finite, S.Boolean, S.$Array<S.String>]>>>, S.Null]>>; }>, S.Struct<{ readonly action: S.Literal<"decline">; }>, S.Struct<{ readonly action: S.Literal<"cancel">; }>]>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7836)

Since v0.0.0

## ElicitationSchema

Generated ACP schema for `ElicitationSchema`.

**Example**

```ts
import { ElicitationSchema } from "@beep/acp/schema"

console.log(ElicitationSchema.ast)
```

**Signature**

```ts
declare const ElicitationSchema: AnnotatedSchema<S.Struct<{ readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly properties: S.optionalKey<S.$Record<S.String, AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"string">; readonly default: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly enum: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly format: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["email", "uri", "date", "date-time"]>>, S.Null]>>; readonly maxLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly oneOf: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>, S.Null]>>; readonly pattern: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"number">; readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"integer">; readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly default: S.optionalKey<S.Union<readonly [S.Boolean, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"array">; readonly default: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly items: S.Union<readonly [S.Struct<{ readonly enum: S.$Array<S.String>; readonly type: S.Literal<"string">; }>, S.Struct<{ readonly anyOf: S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>; }>]>; readonly maxItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>]>>>>; readonly required: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly type: S.optionalKey<S.Literal<"object">>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7911)

Since v0.0.0

## ElicitationSchemaType

Generated ACP schema for `ElicitationSchemaType`.

**Example**

```ts
import { ElicitationSchemaType } from "@beep/acp/schema"

console.log(ElicitationSchemaType.ast)
```

**Signature**

```ts
declare const ElicitationSchemaType: AnnotatedSchema<S.Literal<"object">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L7982)

Since v0.0.0

## ElicitationStringType

Generated ACP schema for `ElicitationStringType`.

**Example**

```ts
import { ElicitationStringType } from "@beep/acp/schema"

console.log(ElicitationStringType.ast)
```

**Signature**

```ts
declare const ElicitationStringType: AnnotatedSchema<S.Literal<"string">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8017)

Since v0.0.0

## ElicitationUrlCapabilities

Generated ACP schema for `ElicitationUrlCapabilities`.

**Example**

```ts
import { ElicitationUrlCapabilities } from "@beep/acp/schema"

console.log(ElicitationUrlCapabilities.ast)
```

**Signature**

```ts
declare const ElicitationUrlCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L287)

Since v0.0.0

## ElicitationUrlMode

Generated ACP schema for `ElicitationUrlMode`.

**Example**

```ts
import { ElicitationUrlMode } from "@beep/acp/schema"

console.log(ElicitationUrlMode.ast)
```

**Signature**

```ts
declare const ElicitationUrlMode: AnnotatedSchema<S.Struct<{ readonly elicitationId: S.String; readonly url: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8053)

Since v0.0.0

## EmbeddedResource

Generated ACP schema for `EmbeddedResource`.

**Example**

```ts
import { EmbeddedResource } from "@beep/acp/schema"

console.log(EmbeddedResource.ast)
```

**Signature**

```ts
declare const EmbeddedResource: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8098)

Since v0.0.0

## EmbeddedResourceResource

Generated ACP schema for `EmbeddedResourceResource`.

**Example**

```ts
import { EmbeddedResourceResource } from "@beep/acp/schema"

console.log(EmbeddedResourceResource.ast)
```

**Signature**

```ts
declare const EmbeddedResourceResource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L333)

Since v0.0.0

## EnumOption

Generated ACP schema for `EnumOption`.

**Example**

```ts
import { EnumOption } from "@beep/acp/schema"

console.log(EnumOption.ast)
```

**Signature**

```ts
declare const EnumOption: AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L403)

Since v0.0.0

## EnvVariable

Generated ACP schema for `EnvVariable`.

**Example**

```ts
import { EnvVariable } from "@beep/acp/schema"

console.log(EnvVariable.ast)
```

**Signature**

```ts
declare const EnvVariable: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L446)

Since v0.0.0

## Error

Generated ACP schema for `Error`.

**Example**

```ts
import { Error } from "@beep/acp/schema"

console.log(Error.ast)
```

**Signature**

```ts
declare const Error: AnnotatedSchema<S.Struct<{ readonly code: S.Union<readonly [S.Literal<-32700>, S.Literal<-32600>, S.Literal<-32601>, S.Literal<-32602>, S.Literal<-32603>, S.Literal<-32800>, S.Literal<-32000>, S.Literal<-32002>, S.Literal<-32042>, S.Finite]>; readonly data: S.optionalKey<S.Unknown>; readonly message: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L498)

Since v0.0.0

## ErrorCode

Generated ACP schema for `ErrorCode`.

**Example**

```ts
import { ErrorCode } from "@beep/acp/schema"

console.log(ErrorCode.ast)
```

**Signature**

```ts
declare const ErrorCode: AnnotatedSchema<S.Union<readonly [S.Literal<-32700>, S.Literal<-32600>, S.Literal<-32601>, S.Literal<-32602>, S.Literal<-32603>, S.Literal<-32800>, S.Literal<-32000>, S.Literal<-32002>, S.Literal<-32042>, S.Finite]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8146)

Since v0.0.0

## ExtNotification

Generated ACP schema for `ExtNotification`.

**Example**

```ts
import { ExtNotification } from "@beep/acp/schema"

console.log(ExtNotification.ast)
```

**Signature**

```ts
declare const ExtNotification: AnnotatedSchema<S.Unknown>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8241)

Since v0.0.0

## ExtRequest

Generated ACP schema for `ExtRequest`.

**Example**

```ts
import { ExtRequest } from "@beep/acp/schema"

console.log(ExtRequest.ast)
```

**Signature**

```ts
declare const ExtRequest: AnnotatedSchema<S.Unknown>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8277)

Since v0.0.0

## ExtResponse

Generated ACP schema for `ExtResponse`.

**Example**

```ts
import { ExtResponse } from "@beep/acp/schema"

console.log(ExtResponse.ast)
```

**Signature**

```ts
declare const ExtResponse: AnnotatedSchema<S.Unknown>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8313)

Since v0.0.0

## FileSystemCapabilities

Generated ACP schema for `FileSystemCapabilities`.

**Example**

```ts
import { FileSystemCapabilities } from "@beep/acp/schema"

console.log(FileSystemCapabilities.ast)
```

**Signature**

```ts
declare const FileSystemCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly readTextFile: S.optionalKey<S.Boolean>; readonly writeTextFile: S.optionalKey<S.Boolean>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8349)

Since v0.0.0

## ForkSessionRequest

Generated ACP schema for `ForkSessionRequest`.

**Example**

```ts
import { ForkSessionRequest } from "@beep/acp/schema"

console.log(ForkSessionRequest.ast)
```

**Signature**

```ts
declare const ForkSessionRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly mcpServers: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"http">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly type: S.Literal<"sse">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.$Array<S.String>; readonly command: S.String; readonly env: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; }>]>>>>; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8407)

Since v0.0.0

## ForkSessionResponse

Generated ACP schema for `ForkSessionResponse`.

**Example**

```ts
import { ForkSessionResponse } from "@beep/acp/schema"

console.log(ForkSessionResponse.ast)
```

**Signature**

```ts
declare const ForkSessionResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>, S.Null]>>; readonly models: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModels: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly modelId: S.String; readonly name: S.String; }>>>; readonly currentModelId: S.String; }>>, S.Null]>>; readonly modes: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModes: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: AnnotatedSchema<S.String>; readonly name: S.String; }>>>; readonly currentModeId: S.String; }>>, S.Null]>>; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8465)

Since v0.0.0

## HttpHeader

Generated ACP schema for `HttpHeader`.

**Example**

```ts
import { HttpHeader } from "@beep/acp/schema"

console.log(HttpHeader.ast)
```

**Signature**

```ts
declare const HttpHeader: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L608)

Since v0.0.0

## ImageContent

Generated ACP schema for `ImageContent`.

**Example**

```ts
import { ImageContent } from "@beep/acp/schema"

console.log(ImageContent.ast)
```

**Signature**

```ts
declare const ImageContent: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8536)

Since v0.0.0

## Implementation

Generated ACP schema for `Implementation`.

**Example**

```ts
import { Implementation } from "@beep/acp/schema"

console.log(Implementation.ast)
```

**Signature**

```ts
declare const Implementation: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly version: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L658)

Since v0.0.0

## InitializeRequest

Generated ACP schema for `InitializeRequest`.

**Example**

```ts
import { InitializeRequest } from "@beep/acp/schema"

console.log(InitializeRequest.ast)
```

**Signature**

```ts
declare const InitializeRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly clientCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly auth: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminal: S.optionalKey<S.Boolean>; }>>; readonly elicitation: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly form: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly url: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>, S.Null]>>; readonly fs: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly readTextFile: S.optionalKey<S.Boolean>; readonly writeTextFile: S.optionalKey<S.Boolean>; }>>; readonly terminal: S.optionalKey<S.Boolean>; }>>; readonly clientInfo: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly version: S.String; }>>, S.Null]>>; readonly protocolVersion: S.Finite; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8585)

Since v0.0.0

## InitializeResponse

Generated ACP schema for `InitializeResponse`.

**Example**

```ts
import { InitializeResponse } from "@beep/acp/schema"

console.log(InitializeResponse.ast)
```

**Signature**

```ts
declare const InitializeResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly agentCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly auth: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly logout: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>; readonly loadSession: S.optionalKey<S.Boolean>; readonly mcpCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly http: S.optionalKey<S.Boolean>; readonly sse: S.optionalKey<S.Boolean>; }>>; readonly promptCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audio: S.optionalKey<S.Boolean>; readonly embeddedContext: S.optionalKey<S.Boolean>; readonly image: S.optionalKey<S.Boolean>; }>>; readonly sessionCapabilities: S.optionalKey<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly close: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly fork: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly list: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly resume: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>; }>>; readonly agentInfo: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly version: S.String; }>>, S.Null]>>; readonly authMethods: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"env_var">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly link: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly vars: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly label: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly optional: S.optionalKey<S.Boolean>; readonly secret: S.optionalKey<S.Boolean>; }>>>; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.optionalKey<S.$Array<S.String>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly env: S.optionalKey<S.$Record<S.String, S.String>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>>; readonly protocolVersion: S.Finite; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8733)

Since v0.0.0

## IntegerPropertySchema

Generated ACP schema for `IntegerPropertySchema`.

**Example**

```ts
import { IntegerPropertySchema } from "@beep/acp/schema"

console.log(IntegerPropertySchema.ast)
```

**Signature**

```ts
declare const IntegerPropertySchema: AnnotatedSchema<S.Struct<{ readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L8959)

Since v0.0.0

## KillTerminalRequest

Generated ACP schema for `KillTerminalRequest`.

**Example**

```ts
import { KillTerminalRequest } from "@beep/acp/schema"

console.log(KillTerminalRequest.ast)
```

**Signature**

```ts
declare const KillTerminalRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly terminalId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9034)

Since v0.0.0

## KillTerminalResponse

Generated ACP schema for `KillTerminalResponse`.

**Example**

```ts
import { KillTerminalResponse } from "@beep/acp/schema"

console.log(KillTerminalResponse.ast)
```

**Signature**

```ts
declare const KillTerminalResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9086)

Since v0.0.0

## ListSessionsRequest

Generated ACP schema for `ListSessionsRequest`.

**Example**

```ts
import { ListSessionsRequest } from "@beep/acp/schema"

console.log(ListSessionsRequest.ast)
```

**Signature**

```ts
declare const ListSessionsRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cursor: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly cwd: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9131)

Since v0.0.0

## ListSessionsResponse

Generated ACP schema for `ListSessionsResponse`.

**Example**

```ts
import { ListSessionsResponse } from "@beep/acp/schema"

console.log(ListSessionsResponse.ast)
```

**Signature**

```ts
declare const ListSessionsResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly nextCursor: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly sessions: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly sessionId: S.String; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly updatedAt: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9195)

Since v0.0.0

## LoadSessionRequest

Generated ACP schema for `LoadSessionRequest`.

**Example**

```ts
import { LoadSessionRequest } from "@beep/acp/schema"

console.log(LoadSessionRequest.ast)
```

**Signature**

```ts
declare const LoadSessionRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly mcpServers: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"http">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly type: S.Literal<"sse">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.$Array<S.String>; readonly command: S.String; readonly env: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; }>]>>>; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9252)

Since v0.0.0

## LoadSessionResponse

Generated ACP schema for `LoadSessionResponse`.

**Example**

```ts
import { LoadSessionResponse } from "@beep/acp/schema"

console.log(LoadSessionResponse.ast)
```

**Signature**

```ts
declare const LoadSessionResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>, S.Null]>>; readonly models: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModels: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly modelId: S.String; readonly name: S.String; }>>>; readonly currentModelId: S.String; }>>, S.Null]>>; readonly modes: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModes: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: AnnotatedSchema<S.String>; readonly name: S.String; }>>>; readonly currentModeId: S.String; }>>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9308)

Since v0.0.0

## LogoutCapabilities

Generated ACP schema for `LogoutCapabilities`.

**Example**

```ts
import { LogoutCapabilities } from "@beep/acp/schema"

console.log(LogoutCapabilities.ast)
```

**Signature**

```ts
declare const LogoutCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L721)

Since v0.0.0

## LogoutRequest

Generated ACP schema for `LogoutRequest`.

**Example**

```ts
import { LogoutRequest } from "@beep/acp/schema"

console.log(LogoutRequest.ast)
```

**Signature**

```ts
declare const LogoutRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9374)

Since v0.0.0

## LogoutResponse

Generated ACP schema for `LogoutResponse`.

**Example**

```ts
import { LogoutResponse } from "@beep/acp/schema"

console.log(LogoutResponse.ast)
```

**Signature**

```ts
declare const LogoutResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9420)

Since v0.0.0

## McpCapabilities

Generated ACP schema for `McpCapabilities`.

**Example**

```ts
import { McpCapabilities } from "@beep/acp/schema"

console.log(McpCapabilities.ast)
```

**Signature**

```ts
declare const McpCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly http: S.optionalKey<S.Boolean>; readonly sse: S.optionalKey<S.Boolean>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9466)

Since v0.0.0

## McpServer

Generated ACP schema for `McpServer`.

**Example**

```ts
import { McpServer } from "@beep/acp/schema"

console.log(McpServer.ast)
```

**Signature**

```ts
declare const McpServer: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"http">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly type: S.Literal<"sse">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.$Array<S.String>; readonly command: S.String; readonly env: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2023)

Since v0.0.0

## McpServerHttp

Generated ACP schema for `McpServerHttp`.

**Example**

```ts
import { McpServerHttp } from "@beep/acp/schema"

console.log(McpServerHttp.ast)
```

**Signature**

```ts
declare const McpServerHttp: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9523)

Since v0.0.0

## McpServerSse

Generated ACP schema for `McpServerSse`.

**Example**

```ts
import { McpServerSse } from "@beep/acp/schema"

console.log(McpServerSse.ast)
```

**Signature**

```ts
declare const McpServerSse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9575)

Since v0.0.0

## McpServerStdio

Generated ACP schema for `McpServerStdio`.

**Example**

```ts
import { McpServerStdio } from "@beep/acp/schema"

console.log(McpServerStdio.ast)
```

**Signature**

```ts
declare const McpServerStdio: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.$Array<S.String>; readonly command: S.String; readonly env: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9627)

Since v0.0.0

## ModelId

Generated ACP schema for `ModelId`.

**Example**

```ts
import { ModelId } from "@beep/acp/schema"

console.log(ModelId.ast)
```

**Signature**

```ts
declare const ModelId: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9684)

Since v0.0.0

## ModelInfo

Generated ACP schema for `ModelInfo`.

**Example**

```ts
import { ModelInfo } from "@beep/acp/schema"

console.log(ModelInfo.ast)
```

**Signature**

```ts
declare const ModelInfo: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly modelId: S.String; readonly name: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L767)

Since v0.0.0

## MultiSelectItems

Generated ACP schema for `MultiSelectItems`.

**Example**

```ts
import { MultiSelectItems } from "@beep/acp/schema"

console.log(MultiSelectItems.ast)
```

**Signature**

```ts
declare const MultiSelectItems: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly enum: S.$Array<S.String>; readonly type: S.Literal<"string">; }>, S.Struct<{ readonly anyOf: S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9720)

Since v0.0.0

## MultiSelectPropertySchema

Generated ACP schema for `MultiSelectPropertySchema`.

**Example**

```ts
import { MultiSelectPropertySchema } from "@beep/acp/schema"

console.log(MultiSelectPropertySchema.ast)
```

**Signature**

```ts
declare const MultiSelectPropertySchema: AnnotatedSchema<S.Struct<{ readonly default: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly items: S.Union<readonly [S.Struct<{ readonly enum: S.$Array<S.String>; readonly type: S.Literal<"string">; }>, S.Struct<{ readonly anyOf: S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>; }>]>; readonly maxItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minItems: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9776)

Since v0.0.0

## NewSessionRequest

Generated ACP schema for `NewSessionRequest`.

**Example**

```ts
import { NewSessionRequest } from "@beep/acp/schema"

console.log(NewSessionRequest.ast)
```

**Signature**

```ts
declare const NewSessionRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly mcpServers: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"http">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly type: S.Literal<"sse">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.$Array<S.String>; readonly command: S.String; readonly env: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; }>]>>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9880)

Since v0.0.0

## NewSessionResponse

Generated ACP schema for `NewSessionResponse`.

**Example**

```ts
import { NewSessionResponse } from "@beep/acp/schema"

console.log(NewSessionResponse.ast)
```

**Signature**

```ts
declare const NewSessionResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>, S.Null]>>; readonly models: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModels: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly modelId: S.String; readonly name: S.String; }>>>; readonly currentModelId: S.String; }>>, S.Null]>>; readonly modes: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModes: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: AnnotatedSchema<S.String>; readonly name: S.String; }>>>; readonly currentModeId: S.String; }>>, S.Null]>>; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L9934)

Since v0.0.0

## NumberPropertySchema

Generated ACP schema for `NumberPropertySchema`.

**Example**

```ts
import { NumberPropertySchema } from "@beep/acp/schema"

console.log(NumberPropertySchema.ast)
```

**Signature**

```ts
declare const NumberPropertySchema: AnnotatedSchema<S.Struct<{ readonly default: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly maximum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minimum: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10005)

Since v0.0.0

## PermissionOption

Generated ACP schema for `PermissionOption`.

**Example**

```ts
import { PermissionOption } from "@beep/acp/schema"

console.log(PermissionOption.ast)
```

**Signature**

```ts
declare const PermissionOption: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly kind: S.Literals<readonly ["allow_once", "allow_always", "reject_once", "reject_always"]>; readonly name: S.String; readonly optionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L828)

Since v0.0.0

## PermissionOptionId

Generated ACP schema for `PermissionOptionId`.

**Example**

```ts
import { PermissionOptionId } from "@beep/acp/schema"

console.log(PermissionOptionId.ast)
```

**Signature**

```ts
declare const PermissionOptionId: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10081)

Since v0.0.0

## PermissionOptionKind

Generated ACP schema for `PermissionOptionKind`.

**Example**

```ts
import { PermissionOptionKind } from "@beep/acp/schema"

console.log(PermissionOptionKind.ast)
```

**Signature**

```ts
declare const PermissionOptionKind: AnnotatedSchema<S.Literals<readonly ["allow_once", "allow_always", "reject_once", "reject_always"]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10116)

Since v0.0.0

## Plan

Generated ACP schema for `Plan`.

**Example**

```ts
import { Plan } from "@beep/acp/schema"

console.log(Plan.ast)
```

**Signature**

```ts
declare const Plan: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly entries: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.String; readonly priority: S.Literals<readonly ["high", "medium", "low"]>; readonly status: S.Literals<readonly ["pending", "in_progress", "completed"]>; }>>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10157)

Since v0.0.0

## PlanEntry

Generated ACP schema for `PlanEntry`.

**Example**

```ts
import { PlanEntry } from "@beep/acp/schema"

console.log(PlanEntry.ast)
```

**Signature**

```ts
declare const PlanEntry: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.String; readonly priority: S.Literals<readonly ["high", "medium", "low"]>; readonly status: S.Literals<readonly ["pending", "in_progress", "completed"]>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L889)

Since v0.0.0

## PlanEntryPriority

Generated ACP schema for `PlanEntryPriority`.

**Example**

```ts
import { PlanEntryPriority } from "@beep/acp/schema"

console.log(PlanEntryPriority.ast)
```

**Signature**

```ts
declare const PlanEntryPriority: AnnotatedSchema<S.Literals<readonly ["high", "medium", "low"]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10207)

Since v0.0.0

## PlanEntryStatus

Generated ACP schema for `PlanEntryStatus`.

**Example**

```ts
import { PlanEntryStatus } from "@beep/acp/schema"

console.log(PlanEntryStatus.ast)
```

**Signature**

```ts
declare const PlanEntryStatus: AnnotatedSchema<S.Literals<readonly ["pending", "in_progress", "completed"]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10243)

Since v0.0.0

## PromptCapabilities

Generated ACP schema for `PromptCapabilities`.

**Example**

```ts
import { PromptCapabilities } from "@beep/acp/schema"

console.log(PromptCapabilities.ast)
```

**Signature**

```ts
declare const PromptCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audio: S.optionalKey<S.Boolean>; readonly embeddedContext: S.optionalKey<S.Boolean>; readonly image: S.optionalKey<S.Boolean>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10283)

Since v0.0.0

## PromptRequest

Generated ACP schema for `PromptRequest`.

**Example**

```ts
import { PromptRequest } from "@beep/acp/schema"

console.log(PromptRequest.ast)
```

**Signature**

```ts
declare const PromptRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly prompt: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>>>; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10348)

Since v0.0.0

## PromptResponse

Generated ACP schema for `PromptResponse`.

**Example**

```ts
import { PromptResponse } from "@beep/acp/schema"

console.log(PromptResponse.ast)
```

**Signature**

```ts
declare const PromptResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly stopReason: S.Literals<readonly ["end_turn", "max_tokens", "max_turn_requests", "refusal", "cancelled"]>; readonly usage: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly cachedReadTokens: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly cachedWriteTokens: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly inputTokens: S.Finite; readonly outputTokens: S.Finite; readonly thoughtTokens: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly totalTokens: S.Finite; }>>, S.Null]>>; readonly userMessageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10411)

Since v0.0.0

## ProtocolVersion

Generated ACP schema for `ProtocolVersion`.

**Example**

```ts
import { ProtocolVersion } from "@beep/acp/schema"

console.log(ProtocolVersion.ast)
```

**Signature**

```ts
declare const ProtocolVersion: AnnotatedSchema<S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10482)

Since v0.0.0

## ReadTextFileRequest

Generated ACP schema for `ReadTextFileRequest`.

**Example**

```ts
import { ReadTextFileRequest } from "@beep/acp/schema"

console.log(ReadTextFileRequest.ast)
```

**Signature**

```ts
declare const ReadTextFileRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly limit: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10522)

Since v0.0.0

## ReadTextFileResponse

Generated ACP schema for `ReadTextFileResponse`.

**Example**

```ts
import { ReadTextFileResponse } from "@beep/acp/schema"

console.log(ReadTextFileResponse.ast)
```

**Signature**

```ts
declare const ReadTextFileResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10597)

Since v0.0.0

## ReleaseTerminalRequest

Generated ACP schema for `ReleaseTerminalRequest`.

**Example**

```ts
import { ReleaseTerminalRequest } from "@beep/acp/schema"

console.log(ReleaseTerminalRequest.ast)
```

**Signature**

```ts
declare const ReleaseTerminalRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly terminalId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10643)

Since v0.0.0

## ReleaseTerminalResponse

Generated ACP schema for `ReleaseTerminalResponse`.

**Example**

```ts
import { ReleaseTerminalResponse } from "@beep/acp/schema"

console.log(ReleaseTerminalResponse.ast)
```

**Signature**

```ts
declare const ReleaseTerminalResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10695)

Since v0.0.0

## RequestId

Generated ACP schema for `RequestId`.

**Example**

```ts
import { RequestId } from "@beep/acp/schema"

console.log(RequestId.ast)
```

**Signature**

```ts
declare const RequestId: AnnotatedSchema<S.Union<readonly [S.Null, S.Finite, S.String]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L947)

Since v0.0.0

## RequestPermissionOutcome

Generated ACP schema for `RequestPermissionOutcome`.

**Example**

```ts
import { RequestPermissionOutcome } from "@beep/acp/schema"

console.log(RequestPermissionOutcome.ast)
```

**Signature**

```ts
declare const RequestPermissionOutcome: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly outcome: S.Literal<"cancelled">; }>, S.Struct<{ readonly outcome: S.Literal<"selected">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly optionId: S.String; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10740)

Since v0.0.0

## RequestPermissionRequest

Generated ACP schema for `RequestPermissionRequest`.

**Example**

```ts
import { RequestPermissionRequest } from "@beep/acp/schema"

console.log(RequestPermissionRequest.ast)
```

**Signature**

```ts
declare const RequestPermissionRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly kind: S.Literals<readonly ["allow_once", "allow_always", "reject_once", "reject_always"]>; readonly name: S.String; readonly optionId: S.String; }>>>; readonly sessionId: S.String; readonly toolCall: S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>, S.Null]>>; readonly kind: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>, S.Null]>>; readonly locations: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>, S.Null]>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly toolCallId: S.String; }>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10800)

Since v0.0.0

## RequestPermissionResponse

Generated ACP schema for `RequestPermissionResponse`.

**Example**

```ts
import { RequestPermissionResponse } from "@beep/acp/schema"

console.log(RequestPermissionResponse.ast)
```

**Signature**

```ts
declare const RequestPermissionResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly outcome: S.Union<readonly [S.Struct<{ readonly outcome: S.Literal<"cancelled">; }>, S.Struct<{ readonly outcome: S.Literal<"selected">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly optionId: S.String; }>]>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10910)

Since v0.0.0

## ResourceLink

Generated ACP schema for `ResourceLink`.

**Example**

```ts
import { ResourceLink } from "@beep/acp/schema"

console.log(ResourceLink.ast)
```

**Signature**

```ts
declare const ResourceLink: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L10981)

Since v0.0.0

## ResumeSessionRequest

Generated ACP schema for `ResumeSessionRequest`.

**Example**

```ts
import { ResumeSessionRequest } from "@beep/acp/schema"

console.log(ResumeSessionRequest.ast)
```

**Signature**

```ts
declare const ResumeSessionRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly mcpServers: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"http">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly type: S.Literal<"sse">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly headers: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; readonly url: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly args: S.$Array<S.String>; readonly command: S.String; readonly env: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; readonly name: S.String; }>]>>>>; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11039)

Since v0.0.0

## ResumeSessionResponse

Generated ACP schema for `ResumeSessionResponse`.

**Example**

```ts
import { ResumeSessionResponse } from "@beep/acp/schema"

console.log(ResumeSessionResponse.ast)
```

**Signature**

```ts
declare const ResumeSessionResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>, S.Null]>>; readonly models: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModels: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly modelId: S.String; readonly name: S.String; }>>>; readonly currentModelId: S.String; }>>, S.Null]>>; readonly modes: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModes: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: AnnotatedSchema<S.String>; readonly name: S.String; }>>>; readonly currentModeId: S.String; }>>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11097)

Since v0.0.0

## Role

Generated ACP schema for `Role`.

**Example**

```ts
import { Role } from "@beep/acp/schema"

console.log(Role.ast)
```

**Signature**

```ts
declare const Role: AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L987)

Since v0.0.0

## SelectedPermissionOutcome

Generated ACP schema for `SelectedPermissionOutcome`.

**Example**

```ts
import { SelectedPermissionOutcome } from "@beep/acp/schema"

console.log(SelectedPermissionOutcome.ast)
```

**Signature**

```ts
declare const SelectedPermissionOutcome: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly optionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11164)

Since v0.0.0

## SessionCapabilities

Generated ACP schema for `SessionCapabilities`.

**Example**

```ts
import { SessionCapabilities } from "@beep/acp/schema"

console.log(SessionCapabilities.ast)
```

**Signature**

```ts
declare const SessionCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly close: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly fork: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly list: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; readonly resume: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11212)

Since v0.0.0

## SessionCloseCapabilities

Generated ACP schema for `SessionCloseCapabilities`.

**Example**

```ts
import { SessionCloseCapabilities } from "@beep/acp/schema"

console.log(SessionCloseCapabilities.ast)
```

**Signature**

```ts
declare const SessionCloseCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1023)

Since v0.0.0

## SessionConfigBoolean

Generated ACP schema for `SessionConfigBoolean`.

**Example**

```ts
import { SessionConfigBoolean } from "@beep/acp/schema"

console.log(SessionConfigBoolean.ast)
```

**Signature**

```ts
declare const SessionConfigBoolean: AnnotatedSchema<S.Struct<{ readonly currentValue: S.Boolean; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11281)

Since v0.0.0

## SessionConfigGroupId

Generated ACP schema for `SessionConfigGroupId`.

**Example**

```ts
import { SessionConfigGroupId } from "@beep/acp/schema"

console.log(SessionConfigGroupId.ast)
```

**Signature**

```ts
declare const SessionConfigGroupId: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11321)

Since v0.0.0

## SessionConfigId

Generated ACP schema for `SessionConfigId`.

**Example**

```ts
import { SessionConfigId } from "@beep/acp/schema"

console.log(SessionConfigId.ast)
```

**Signature**

```ts
declare const SessionConfigId: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11357)

Since v0.0.0

## SessionConfigOption

Generated ACP schema for `SessionConfigOption`.

**Example**

```ts
import { SessionConfigOption } from "@beep/acp/schema"

console.log(SessionConfigOption.ast)
```

**Signature**

```ts
declare const SessionConfigOption: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2977)

Since v0.0.0

## SessionConfigOptionCategory

Generated ACP schema for `SessionConfigOptionCategory`.

**Example**

```ts
import { SessionConfigOptionCategory } from "@beep/acp/schema"

console.log(SessionConfigOptionCategory.ast)
```

**Signature**

```ts
declare const SessionConfigOptionCategory: AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1069)

Since v0.0.0

## SessionConfigSelect

Generated ACP schema for `SessionConfigSelect`.

**Example**

```ts
import { SessionConfigSelect } from "@beep/acp/schema"

console.log(SessionConfigSelect.ast)
```

**Signature**

```ts
declare const SessionConfigSelect: AnnotatedSchema<S.Struct<{ readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11392)

Since v0.0.0

## SessionConfigSelectGroup

Generated ACP schema for `SessionConfigSelectGroup`.

**Example**

```ts
import { SessionConfigSelectGroup } from "@beep/acp/schema"

console.log(SessionConfigSelectGroup.ast)
```

**Signature**

```ts
declare const SessionConfigSelectGroup: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2234)

Since v0.0.0

## SessionConfigSelectOption

Generated ACP schema for `SessionConfigSelectOption`.

**Example**

```ts
import { SessionConfigSelectOption } from "@beep/acp/schema"

console.log(SessionConfigSelectOption.ast)
```

**Signature**

```ts
declare const SessionConfigSelectOption: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1116)

Since v0.0.0

## SessionConfigSelectOptions

Generated ACP schema for `SessionConfigSelectOptions`.

**Example**

```ts
import { SessionConfigSelectOptions } from "@beep/acp/schema"

console.log(SessionConfigSelectOptions.ast)
```

**Signature**

```ts
declare const SessionConfigSelectOptions: AnnotatedSchema<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11444)

Since v0.0.0

## SessionConfigValueId

Generated ACP schema for `SessionConfigValueId`.

**Example**

```ts
import { SessionConfigValueId } from "@beep/acp/schema"

console.log(SessionConfigValueId.ast)
```

**Signature**

```ts
declare const SessionConfigValueId: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11488)

Since v0.0.0

## SessionForkCapabilities

Generated ACP schema for `SessionForkCapabilities`.

**Example**

```ts
import { SessionForkCapabilities } from "@beep/acp/schema"

console.log(SessionForkCapabilities.ast)
```

**Signature**

```ts
declare const SessionForkCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1175)

Since v0.0.0

## SessionId

Generated ACP schema for `SessionId`.

**Example**

```ts
import { SessionId } from "@beep/acp/schema"

console.log(SessionId.ast)
```

**Signature**

```ts
declare const SessionId: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11524)

Since v0.0.0

## SessionInfo

Generated ACP schema for `SessionInfo`.

**Example**

```ts
import { SessionInfo } from "@beep/acp/schema"

console.log(SessionInfo.ast)
```

**Signature**

```ts
declare const SessionInfo: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cwd: S.String; readonly sessionId: S.String; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly updatedAt: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1221)

Since v0.0.0

## SessionInfoUpdate

Generated ACP schema for `SessionInfoUpdate`.

**Example**

```ts
import { SessionInfoUpdate } from "@beep/acp/schema"

console.log(SessionInfoUpdate.ast)
```

**Signature**

```ts
declare const SessionInfoUpdate: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly updatedAt: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11560)

Since v0.0.0

## SessionListCapabilities

Generated ACP schema for `SessionListCapabilities`.

**Example**

```ts
import { SessionListCapabilities } from "@beep/acp/schema"

console.log(SessionListCapabilities.ast)
```

**Signature**

```ts
declare const SessionListCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1290)

Since v0.0.0

## SessionMode

Generated ACP schema for `SessionMode`.

**Example**

```ts
import { SessionMode } from "@beep/acp/schema"

console.log(SessionMode.ast)
```

**Signature**

```ts
declare const SessionMode: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: AnnotatedSchema<S.String>; readonly name: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2290)

Since v0.0.0

## SessionModeId

Generated ACP schema for `SessionModeId`.

**Example**

```ts
import { SessionModeId } from "@beep/acp/schema"

console.log(SessionModeId.ast)
```

**Signature**

```ts
declare const SessionModeId: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1336)

Since v0.0.0

## SessionModeState

Generated ACP schema for `SessionModeState`.

**Example**

```ts
import { SessionModeState } from "@beep/acp/schema"

console.log(SessionModeState.ast)
```

**Signature**

```ts
declare const SessionModeState: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModes: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: AnnotatedSchema<S.String>; readonly name: S.String; }>>>; readonly currentModeId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L3104)

Since v0.0.0

## SessionModelState

Generated ACP schema for `SessionModelState`.

**Example**

```ts
import { SessionModelState } from "@beep/acp/schema"

console.log(SessionModelState.ast)
```

**Signature**

```ts
declare const SessionModelState: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableModels: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly modelId: S.String; readonly name: S.String; }>>>; readonly currentModelId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2127)

Since v0.0.0

## SessionNotification

Generated ACP schema for `SessionNotification`.

**Example**

```ts
import { SessionNotification } from "@beep/acp/schema"

console.log(SessionNotification.ast)
```

**Signature**

```ts
declare const SessionNotification: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly update: S.Union<readonly [S.Struct<{ readonly sessionUpdate: S.Literal<"user_message_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"agent_message_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"agent_thought_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"tool_call">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>>; readonly kind: S.optionalKey<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>; readonly locations: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>; readonly title: S.String; readonly toolCallId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"tool_call_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>, S.Null]>>; readonly kind: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>, S.Null]>>; readonly locations: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>, S.Null]>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly toolCallId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"plan">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly entries: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.String; readonly priority: S.Literals<readonly ["high", "medium", "low"]>; readonly status: S.Literals<readonly ["pending", "in_progress", "completed"]>; }>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"available_commands_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableCommands: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.String; readonly input: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly hint: S.String; }>]>>, S.Null]>>; readonly name: S.String; }>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"current_mode_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly currentModeId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"config_option_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"session_info_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly updatedAt: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"usage_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cost: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly amount: S.Finite; readonly currency: S.String; }>>, S.Null]>>; readonly size: S.Finite; readonly used: S.Finite; }>]>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L11624)

Since v0.0.0

## SessionResumeCapabilities

Generated ACP schema for `SessionResumeCapabilities`.

**Example**

```ts
import { SessionResumeCapabilities } from "@beep/acp/schema"

console.log(SessionResumeCapabilities.ast)
```

**Signature**

```ts
declare const SessionResumeCapabilities: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1371)

Since v0.0.0

## SessionUpdate

Generated ACP schema for `SessionUpdate`.

**Example**

```ts
import { SessionUpdate } from "@beep/acp/schema"

console.log(SessionUpdate.ast)
```

**Signature**

```ts
declare const SessionUpdate: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly sessionUpdate: S.Literal<"user_message_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"agent_message_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"agent_thought_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"tool_call">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>>; readonly kind: S.optionalKey<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>; readonly locations: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>; readonly title: S.String; readonly toolCallId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"tool_call_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>, S.Null]>>; readonly kind: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>, S.Null]>>; readonly locations: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>, S.Null]>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly toolCallId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"plan">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly entries: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.String; readonly priority: S.Literals<readonly ["high", "medium", "low"]>; readonly status: S.Literals<readonly ["pending", "in_progress", "completed"]>; }>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"available_commands_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableCommands: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.String; readonly input: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly hint: S.String; }>]>>, S.Null]>>; readonly name: S.String; }>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"current_mode_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly currentModeId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"config_option_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"session_info_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly updatedAt: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"usage_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cost: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly amount: S.Finite; readonly currency: S.String; }>>, S.Null]>>; readonly size: S.Finite; readonly used: S.Finite; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L12314)

Since v0.0.0

## SetSessionConfigOptionRequest

Generated ACP schema for `SetSessionConfigOptionRequest`.

**Example**

```ts
import { SetSessionConfigOptionRequest } from "@beep/acp/schema"

console.log(SetSessionConfigOptionRequest.ast)
```

**Signature**

```ts
declare const SetSessionConfigOptionRequest: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"boolean">; readonly value: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configId: S.String; readonly sessionId: S.String; }>, S.Struct<{ readonly value: S.String; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configId: S.String; readonly sessionId: S.String; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L12979)

Since v0.0.0

## SetSessionConfigOptionResponse

Generated ACP schema for `SetSessionConfigOptionResponse`.

**Example**

```ts
import { SetSessionConfigOptionResponse } from "@beep/acp/schema"

console.log(SetSessionConfigOptionResponse.ast)
```

**Signature**

```ts
declare const SetSessionConfigOptionResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13064)

Since v0.0.0

## SetSessionModeRequest

Generated ACP schema for `SetSessionModeRequest`.

**Example**

```ts
import { SetSessionModeRequest } from "@beep/acp/schema"

console.log(SetSessionModeRequest.ast)
```

**Signature**

```ts
declare const SetSessionModeRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly modeId: S.String; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13214)

Since v0.0.0

## SetSessionModeResponse

Generated ACP schema for `SetSessionModeResponse`.

**Example**

```ts
import { SetSessionModeResponse } from "@beep/acp/schema"

console.log(SetSessionModeResponse.ast)
```

**Signature**

```ts
declare const SetSessionModeResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13266)

Since v0.0.0

## SetSessionModelRequest

Generated ACP schema for `SetSessionModelRequest`.

**Example**

```ts
import { SetSessionModelRequest } from "@beep/acp/schema"

console.log(SetSessionModelRequest.ast)
```

**Signature**

```ts
declare const SetSessionModelRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly modelId: S.String; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13114)

Since v0.0.0

## SetSessionModelResponse

Generated ACP schema for `SetSessionModelResponse`.

**Example**

```ts
import { SetSessionModelResponse } from "@beep/acp/schema"

console.log(SetSessionModelResponse.ast)
```

**Signature**

```ts
declare const SetSessionModelResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13168)

Since v0.0.0

## StopReason

Generated ACP schema for `StopReason`.

**Example**

```ts
import { StopReason } from "@beep/acp/schema"

console.log(StopReason.ast)
```

**Signature**

```ts
declare const StopReason: AnnotatedSchema<S.Literals<readonly ["end_turn", "max_tokens", "max_turn_requests", "refusal", "cancelled"]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13311)

Since v0.0.0

## StringFormat

Generated ACP schema for `StringFormat`.

**Example**

```ts
import { StringFormat } from "@beep/acp/schema"

console.log(StringFormat.ast)
```

**Signature**

```ts
declare const StringFormat: AnnotatedSchema<S.Literals<readonly ["email", "uri", "date", "date-time"]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1417)

Since v0.0.0

## StringPropertySchema

Generated ACP schema for `StringPropertySchema`.

**Example**

```ts
import { StringPropertySchema } from "@beep/acp/schema"

console.log(StringPropertySchema.ast)
```

**Signature**

```ts
declare const StringPropertySchema: AnnotatedSchema<S.Struct<{ readonly default: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly enum: S.optionalKey<S.Union<readonly [S.$Array<S.String>, S.Null]>>; readonly format: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["email", "uri", "date", "date-time"]>>, S.Null]>>; readonly maxLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly minLength: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly oneOf: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>, S.Null]>>; readonly pattern: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13353)

Since v0.0.0

## Terminal

Generated ACP schema for `Terminal`.

**Example**

```ts
import { Terminal } from "@beep/acp/schema"

console.log(Terminal.ast)
```

**Signature**

```ts
declare const Terminal: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13454)

Since v0.0.0

## TerminalExitStatus

Generated ACP schema for `TerminalExitStatus`.

**Example**

```ts
import { TerminalExitStatus } from "@beep/acp/schema"

console.log(TerminalExitStatus.ast)
```

**Signature**

```ts
declare const TerminalExitStatus: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly exitCode: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly signal: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1458)

Since v0.0.0

## TerminalOutputRequest

Generated ACP schema for `TerminalOutputRequest`.

**Example**

```ts
import { TerminalOutputRequest } from "@beep/acp/schema"

console.log(TerminalOutputRequest.ast)
```

**Signature**

```ts
declare const TerminalOutputRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly terminalId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13501)

Since v0.0.0

## TerminalOutputResponse

Generated ACP schema for `TerminalOutputResponse`.

**Example**

```ts
import { TerminalOutputResponse } from "@beep/acp/schema"

console.log(TerminalOutputResponse.ast)
```

**Signature**

```ts
declare const TerminalOutputResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly exitStatus: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly exitCode: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly signal: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>, S.Null]>>; readonly output: S.String; readonly truncated: S.Boolean; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13554)

Since v0.0.0

## TextContent

Generated ACP schema for `TextContent`.

**Example**

```ts
import { TextContent } from "@beep/acp/schema"

console.log(TextContent.ast)
```

**Signature**

```ts
declare const TextContent: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13610)

Since v0.0.0

## TextResourceContents

Generated ACP schema for `TextResourceContents`.

**Example**

```ts
import { TextResourceContents } from "@beep/acp/schema"

console.log(TextResourceContents.ast)
```

**Signature**

```ts
declare const TextResourceContents: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13657)

Since v0.0.0

## TitledMultiSelectItems

Generated ACP schema for `TitledMultiSelectItems`.

**Example**

```ts
import { TitledMultiSelectItems } from "@beep/acp/schema"

console.log(TitledMultiSelectItems.ast)
```

**Signature**

```ts
declare const TitledMultiSelectItems: AnnotatedSchema<S.Struct<{ readonly anyOf: S.$Array<AnnotatedSchema<S.Struct<{ readonly const: S.String; readonly title: S.String; }>>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13705)

Since v0.0.0

## ToolCall

Generated ACP schema for `ToolCall`.

**Example**

```ts
import { ToolCall } from "@beep/acp/schema"

console.log(ToolCall.ast)
```

**Signature**

```ts
declare const ToolCall: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>>; readonly kind: S.optionalKey<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>; readonly locations: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>; readonly title: S.String; readonly toolCallId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13744)

Since v0.0.0

## ToolCallContent

Generated ACP schema for `ToolCallContent`.

**Example**

```ts
import { ToolCallContent } from "@beep/acp/schema"

console.log(ToolCallContent.ast)
```

**Signature**

```ts
declare const ToolCallContent: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L2779)

Since v0.0.0

## ToolCallId

Generated ACP schema for `ToolCallId`.

**Example**

```ts
import { ToolCallId } from "@beep/acp/schema"

console.log(ToolCallId.ast)
```

**Signature**

```ts
declare const ToolCallId: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13838)

Since v0.0.0

## ToolCallLocation

Generated ACP schema for `ToolCallLocation`.

**Example**

```ts
import { ToolCallLocation } from "@beep/acp/schema"

console.log(ToolCallLocation.ast)
```

**Signature**

```ts
declare const ToolCallLocation: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1524)

Since v0.0.0

## ToolCallStatus

Generated ACP schema for `ToolCallStatus`.

**Example**

```ts
import { ToolCallStatus } from "@beep/acp/schema"

console.log(ToolCallStatus.ast)
```

**Signature**

```ts
declare const ToolCallStatus: AnnotatedSchema<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1584)

Since v0.0.0

## ToolCallUpdate

Generated ACP schema for `ToolCallUpdate`.

**Example**

```ts
import { ToolCallUpdate } from "@beep/acp/schema"

console.log(ToolCallUpdate.ast)
```

**Signature**

```ts
declare const ToolCallUpdate: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>, S.Null]>>; readonly kind: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>, S.Null]>>; readonly locations: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>, S.Null]>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly toolCallId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13873)

Since v0.0.0

## ToolKind

Generated ACP schema for `ToolKind`.

**Example**

```ts
import { ToolKind } from "@beep/acp/schema"

console.log(ToolKind.ast)
```

**Signature**

```ts
declare const ToolKind: AnnotatedSchema<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1625)

Since v0.0.0

## UnstructuredCommandInput

Generated ACP schema for `UnstructuredCommandInput`.

**Example**

```ts
import { UnstructuredCommandInput } from "@beep/acp/schema"

console.log(UnstructuredCommandInput.ast)
```

**Signature**

```ts
declare const UnstructuredCommandInput: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly hint: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L13960)

Since v0.0.0

## UntitledMultiSelectItems

Generated ACP schema for `UntitledMultiSelectItems`.

**Example**

```ts
import { UntitledMultiSelectItems } from "@beep/acp/schema"

console.log(UntitledMultiSelectItems.ast)
```

**Signature**

```ts
declare const UntitledMultiSelectItems: AnnotatedSchema<S.Struct<{ readonly enum: S.$Array<S.String>; readonly type: S.Literal<"string">; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14009)

Since v0.0.0

## Usage

Generated ACP schema for `Usage`.

**Example**

```ts
import { Usage } from "@beep/acp/schema"

console.log(Usage.ast)
```

**Signature**

```ts
declare const Usage: AnnotatedSchema<S.Struct<{ readonly cachedReadTokens: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly cachedWriteTokens: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly inputTokens: S.Finite; readonly outputTokens: S.Finite; readonly thoughtTokens: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly totalTokens: S.Finite; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L1672)

Since v0.0.0

## UsageUpdate

Generated ACP schema for `UsageUpdate`.

**Example**

```ts
import { UsageUpdate } from "@beep/acp/schema"

console.log(UsageUpdate.ast)
```

**Signature**

```ts
declare const UsageUpdate: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cost: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly amount: S.Finite; readonly currency: S.String; }>>, S.Null]>>; readonly size: S.Finite; readonly used: S.Finite; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14050)

Since v0.0.0

## WaitForTerminalExitRequest

Generated ACP schema for `WaitForTerminalExitRequest`.

**Example**

```ts
import { WaitForTerminalExitRequest } from "@beep/acp/schema"

console.log(WaitForTerminalExitRequest.ast)
```

**Signature**

```ts
declare const WaitForTerminalExitRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly terminalId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14113)

Since v0.0.0

## WaitForTerminalExitResponse

Generated ACP schema for `WaitForTerminalExitResponse`.

**Example**

```ts
import { WaitForTerminalExitResponse } from "@beep/acp/schema"

console.log(WaitForTerminalExitResponse.ast)
```

**Signature**

```ts
declare const WaitForTerminalExitResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly exitCode: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly signal: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14165)

Since v0.0.0

## WriteTextFileRequest

Generated ACP schema for `WriteTextFileRequest`.

**Example**

```ts
import { WriteTextFileRequest } from "@beep/acp/schema"

console.log(WriteTextFileRequest.ast)
```

**Signature**

```ts
declare const WriteTextFileRequest: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.String; readonly path: S.String; readonly sessionId: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14232)

Since v0.0.0

## WriteTextFileResponse

Generated ACP schema for `WriteTextFileResponse`.

**Example**

```ts
import { WriteTextFileResponse } from "@beep/acp/schema"

console.log(WriteTextFileResponse.ast)
```

**Signature**

```ts
declare const WriteTextFileResponse: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/schema.gen.ts#L14288)

Since v0.0.0
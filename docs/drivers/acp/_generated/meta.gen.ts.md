---
title: meta.gen.ts
nav_order: 1
parent: "@beep/acp"
---

## meta.gen.ts overview

Generated ACP protocol schema and metadata modules.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [AGENT_METHODS](#agent_methods)
  - [CLIENT_METHODS](#client_methods)
  - [PROTOCOL_VERSION](#protocol_version)
---

# constants

## AGENT_METHODS

Generated ACP agent method lookup table.

**Example**

```ts
import { AGENT_METHODS } from "@beep/acp/schema"

console.log(AGENT_METHODS)
```

**Signature**

```ts
declare const AGENT_METHODS: { readonly authenticate: "authenticate"; readonly initialize: "initialize"; readonly logout: "logout"; readonly session_cancel: "session/cancel"; readonly session_close: "session/close"; readonly session_fork: "session/fork"; readonly session_list: "session/list"; readonly session_load: "session/load"; readonly session_new: "session/new"; readonly session_prompt: "session/prompt"; readonly session_resume: "session/resume"; readonly session_set_config_option: "session/set_config_option"; readonly session_set_mode: "session/set_mode"; readonly session_set_model: "session/set_model"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/meta.gen.ts#L29)

Since v0.0.0

## CLIENT_METHODS

Generated ACP client method lookup table.

**Example**

```ts
import { CLIENT_METHODS } from "@beep/acp/schema"

console.log(CLIENT_METHODS)
```

**Signature**

```ts
declare const CLIENT_METHODS: { readonly fs_read_text_file: "fs/read_text_file"; readonly fs_write_text_file: "fs/write_text_file"; readonly session_elicitation: "session/elicitation"; readonly session_elicitation_complete: "session/elicitation/complete"; readonly session_request_permission: "session/request_permission"; readonly session_update: "session/update"; readonly terminal_create: "terminal/create"; readonly terminal_kill: "terminal/kill"; readonly terminal_output: "terminal/output"; readonly terminal_release: "terminal/release"; readonly terminal_wait_for_exit: "terminal/wait_for_exit"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/meta.gen.ts#L59)

Since v0.0.0

## PROTOCOL_VERSION

Generated ACP protocol version.

**Example**

```ts
import { PROTOCOL_VERSION } from "@beep/acp/schema"

console.log(PROTOCOL_VERSION)
```

**Signature**

```ts
declare const PROTOCOL_VERSION: 1
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/_generated/meta.gen.ts#L86)

Since v0.0.0
---
title: Session.ts
nav_order: 23
parent: "@beep/sandbox"
---

## Session.ts overview

Agent session path and transfer helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [transferSession](#transfersession)
- [constructors](#constructors)
  - [hostSessionStore](#hostsessionstore)
  - [sandboxSessionStore](#sandboxsessionstore)
- [layers](#layers)
  - [defaultSessionPathsLayer](#defaultsessionpathslayer)
  - [sessionPathsLayer](#sessionpathslayer)
- [models](#models)
  - [SessionId (type alias)](#sessionid-type-alias)
  - [SessionPathsShape (class)](#sessionpathsshape-class)
  - [SessionTransferResult (class)](#sessiontransferresult-class)
- [schemas](#schemas)
  - [SessionId](#sessionid)
- [services](#services)
  - [SessionPaths (class)](#sessionpaths-class)
  - [SessionStore (interface)](#sessionstore-interface)
- [utilities](#utilities)
  - [encodeProjectPath](#encodeprojectpath)
---

# combinators

## transferSession

Transfer a session between stores.

**Example**

```ts
import { transferSession } from "@beep/sandbox/Session"

console.log(transferSession)
```

**Signature**

```ts
declare const transferSession: (from: SessionStore<never>, to: SessionStore<never>, sessionId: string) => Effect.Effect<SessionTransferResult, SessionCaptureError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L298)

Since v0.0.0

# constructors

## hostSessionStore

Create a host-backed session store.

**Example**

```ts
import { hostSessionStore } from "@beep/sandbox/Session"

console.log(hostSessionStore)
```

**Signature**

```ts
declare const hostSessionStore: (repoDir: string, projectsDir?: string) => SessionStore<FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L211)

Since v0.0.0

## sandboxSessionStore

Create a sandbox-backed session store for bind-mount handles.

**Example**

```ts
import { sandboxSessionStore } from "@beep/sandbox/Session"

console.log(sandboxSessionStore)
```

**Signature**

```ts
declare const sandboxSessionStore: (repoDir: string, handle: BindMountSandboxHandle, projectsDir?: string) => SessionStore
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L259)

Since v0.0.0

# layers

## defaultSessionPathsLayer

Default session-path layer.

**Example**

```ts
import { defaultSessionPathsLayer } from "@beep/sandbox/Session"

console.log(defaultSessionPathsLayer)
```

**Signature**

```ts
declare const defaultSessionPathsLayer: Layer.Layer<SessionPaths, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L154)

Since v0.0.0

## sessionPathsLayer

Create a configured session-path layer.

**Example**

```ts
import { sessionPathsLayer } from "@beep/sandbox/Session"

console.log(sessionPathsLayer)
```

**Signature**

```ts
declare const sessionPathsLayer: (paths: SessionPathsShape) => Layer.Layer<SessionPaths>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L138)

Since v0.0.0

# models

## SessionId (type alias)

Runtime type for `SessionId`.

**Signature**

```ts
type SessionId = typeof SessionId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L73)

Since v0.0.0

## SessionPathsShape (class)

Session path service shape.

**Example**

```ts
import { SessionPathsShape } from "@beep/sandbox/Session"

console.log(SessionPathsShape)
```

**Signature**

```ts
declare class SessionPathsShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L34)

Since v0.0.0

## SessionTransferResult (class)

Session transfer summary.

**Example**

```ts
import { SessionTransferResult } from "@beep/sandbox/Session"

console.log(SessionTransferResult)
```

**Signature**

```ts
declare class SessionTransferResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L189)

Since v0.0.0

# schemas

## SessionId

Filename-safe agent session identifier.

**Example**

```ts
import { SessionId } from "@beep/sandbox/Session"

console.log(SessionId)
```

**Signature**

```ts
declare const SessionId: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L57)

Since v0.0.0

# services

## SessionPaths (class)

Session path service.

**Example**

```ts
import { SessionPaths } from "@beep/sandbox/Session"

console.log(SessionPaths)
```

**Signature**

```ts
declare class SessionPaths
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L88)

Since v0.0.0

## SessionStore (interface)

Session file store.

**Example**

```ts
import type { SessionStore } from "@beep/sandbox/Session"

const value = {} as SessionStore
console.log(value)
```

**Signature**

```ts
export interface SessionStore<R = never> {
  readonly read: (sessionId: string) => Effect.Effect<string, SessionCaptureError, R>;
  readonly sessionFilePath: (sessionId: string) => string;
  readonly write: (sessionId: string, content: string) => Effect.Effect<void, SessionCaptureError, R>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L104)

Since v0.0.0

# utilities

## encodeProjectPath

Encoded project path used by Claude session directories.

**Example**

```ts
import { encodeProjectPath } from "@beep/sandbox/Session"

console.log(encodeProjectPath)
```

**Signature**

```ts
declare const encodeProjectPath: (cwd: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Session.ts#L123)

Since v0.0.0